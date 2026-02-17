import { render, screen } from "@/test/utils";
import { jest } from "@jest/globals";
import * as React from "react";
import {
  carrierStatsReturn,
  loadHistoryStatsReturn,
  loadPlannerQuoteStatsReturn,
} from "@/test/mocks/hooks-operations";

import DashboardPage from "@/app/(dashboard)/dashboard/page";

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up real data (not zeros) — validates BUG-008 fix
    carrierStatsReturn.data = {
      total: 25,
      byStatus: { ACTIVE: 18, INACTIVE: 5, PENDING: 2 },
      byType: { COMPANY: 15, OWNER_OPERATOR: 10 },
    };
    (carrierStatsReturn as any).isLoading = false;
    (carrierStatsReturn as any).isError = false;

    loadHistoryStatsReturn.data = {
      totalLoads: 142,
      completedLoads: 98,
      totalRevenueCents: 45000000, // $450,000
    };
    loadHistoryStatsReturn.isLoading = false;
    loadHistoryStatsReturn.isError = false;

    loadPlannerQuoteStatsReturn.data = {
      totalLoads: 30,
      draftCount: 5,
      sentCount: 8,
    };
    loadPlannerQuoteStatsReturn.isLoading = false;
    loadPlannerQuoteStatsReturn.isError = false;
  });

  // ---- Real data rendering (BUG-008 regression test) ----

  it("renders the Dashboard heading", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("shows real total loads count (not zero)", () => {
    render(<DashboardPage />);
    expect(screen.getByText("142")).toBeInTheDocument();
  });

  it("shows completed loads subtitle", () => {
    render(<DashboardPage />);
    expect(screen.getByText("98 completed")).toBeInTheDocument();
  });

  it("shows real active carriers count (not zero)", () => {
    render(<DashboardPage />);
    expect(screen.getByText("18")).toBeInTheDocument();
  });

  it("shows total carriers subtitle", () => {
    render(<DashboardPage />);
    expect(screen.getByText("25 total carriers")).toBeInTheDocument();
  });

  it("shows open quotes count (draft + sent)", () => {
    render(<DashboardPage />);
    // openQuotes = draftCount (5) + sentCount (8) = 13
    expect(screen.getByText("13")).toBeInTheDocument();
  });

  it("shows total quotes subtitle", () => {
    render(<DashboardPage />);
    expect(screen.getByText("30 total quotes")).toBeInTheDocument();
  });

  it("shows formatted revenue (not $0)", () => {
    render(<DashboardPage />);
    // 45000000 cents = $450,000
    expect(screen.getByText("$450,000")).toBeInTheDocument();
  });

  it("shows revenue source subtitle", () => {
    render(<DashboardPage />);
    expect(screen.getByText("From 142 loads")).toBeInTheDocument();
  });

  it("renders all 4 KPI card titles", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Total Loads")).toBeInTheDocument();
    expect(screen.getByText("Active Carriers")).toBeInTheDocument();
    expect(screen.getByText("Open Quotes")).toBeInTheDocument();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
  });

  it("renders the Logout button", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("renders the welcome card", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Welcome to Ultra-TMS")).toBeInTheDocument();
  });
});

describe("DashboardPage — Loading State", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    carrierStatsReturn.data = undefined;
    (carrierStatsReturn as any).isLoading = true;
    (carrierStatsReturn as any).isError = false;

    loadHistoryStatsReturn.data = undefined;
    loadHistoryStatsReturn.isLoading = true;
    loadHistoryStatsReturn.isError = false;

    loadPlannerQuoteStatsReturn.data = undefined;
    loadPlannerQuoteStatsReturn.isLoading = true;
    loadPlannerQuoteStatsReturn.isError = false;
  });

  it("shows loading indicators when data is loading", () => {
    render(<DashboardPage />);
    const loadingTexts = screen.getAllByText("Loading...");
    expect(loadingTexts.length).toBeGreaterThanOrEqual(1);
  });

  it("does not show hardcoded zeros while loading", () => {
    render(<DashboardPage />);
    // The KPI values should show "Loading...", not "0"
    const loadingIndicators = screen.getAllByText("Loading...");
    expect(loadingIndicators.length).toBeGreaterThanOrEqual(3); // loads, carriers, quotes show loading
  });
});

describe("DashboardPage — Error State", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    carrierStatsReturn.data = undefined;
    (carrierStatsReturn as any).isLoading = false;
    (carrierStatsReturn as any).isError = true;

    loadHistoryStatsReturn.data = undefined;
    loadHistoryStatsReturn.isLoading = false;
    loadHistoryStatsReturn.isError = true;

    loadPlannerQuoteStatsReturn.data = undefined;
    loadPlannerQuoteStatsReturn.isLoading = false;
    loadPlannerQuoteStatsReturn.isError = true;
  });

  it("shows error state for failed API calls", () => {
    render(<DashboardPage />);
    const errorTexts = screen.getAllByText("Failed to load");
    expect(errorTexts.length).toBeGreaterThanOrEqual(1);
  });
});

describe("DashboardPage — Zero/Empty Data", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    carrierStatsReturn.data = {
      total: 0,
      byStatus: {},
      byType: {},
    };
    (carrierStatsReturn as any).isLoading = false;
    (carrierStatsReturn as any).isError = false;

    loadHistoryStatsReturn.data = {
      totalLoads: 0,
      completedLoads: 0,
      totalRevenueCents: 0,
    };
    loadHistoryStatsReturn.isLoading = false;
    loadHistoryStatsReturn.isError = false;

    loadPlannerQuoteStatsReturn.data = {
      totalLoads: 0,
      draftCount: 0,
      sentCount: 0,
    };
    loadPlannerQuoteStatsReturn.isLoading = false;
    loadPlannerQuoteStatsReturn.isError = false;
  });

  it("shows zero values with appropriate subtexts for empty data", () => {
    render(<DashboardPage />);
    expect(screen.getByText("No carriers yet")).toBeInTheDocument();
    expect(screen.getByText("No quotes yet")).toBeInTheDocument();
    expect(screen.getByText("No revenue yet")).toBeInTheDocument();
    expect(screen.getByText("All loads in system")).toBeInTheDocument();
  });
});

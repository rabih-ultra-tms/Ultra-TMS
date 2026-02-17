import { render, screen, waitFor } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import * as React from "react";
import {
  carriersReturn,
  carrierStatsReturn,
} from "@/test/mocks/hooks-operations";

// Mock data
const mockCarriersData = {
  data: [
    {
      id: "c1",
      companyName: "Swift Trucking LLC",
      carrierType: "COMPANY",
      mcNumber: "MC123456",
      dotNumber: "DOT789012",
      city: "Dallas",
      state: "TX",
      phone: "555-100-2000",
      email: "dispatch@swift.com",
      status: "ACTIVE",
      insuranceExpiryDate: "2027-06-15",
      _count: { drivers: 12, trucks: 8 },
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-15T00:00:00Z",
    },
    {
      id: "c2",
      companyName: "Mike's Hauling",
      carrierType: "OWNER_OPERATOR",
      mcNumber: "MC654321",
      dotNumber: "DOT210987",
      city: "Chicago",
      state: "IL",
      phone: "555-200-3000",
      email: "mike@mikeshauling.com",
      status: "PREFERRED",
      _count: { drivers: 1, trucks: 1 },
      createdAt: "2026-01-10T00:00:00Z",
      updatedAt: "2026-01-20T00:00:00Z",
    },
  ],
  total: 2,
  page: 1,
  limit: 25,
  totalPages: 1,
};

const mockStats = {
  total: 2,
  byType: { COMPANY: 1, OWNER_OPERATOR: 1 },
  byStatus: { ACTIVE: 1, PREFERRED: 1 },
};

import CarriersPage from "@/app/(dashboard)/carriers/page";

describe("CarriersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    carriersReturn.data = mockCarriersData;
    carriersReturn.isLoading = false;
    carriersReturn.error = null;
    carriersReturn.refetch = jest.fn();
    carrierStatsReturn.data = mockStats;
  });

  it("renders the page title", () => {
    render(<CarriersPage />);
    expect(screen.getByText("Carriers")).toBeInTheDocument();
  });

  it("renders carrier data in the table", () => {
    render(<CarriersPage />);
    expect(screen.getByText("Swift Trucking LLC")).toBeInTheDocument();
    expect(screen.getByText("Mike's Hauling")).toBeInTheDocument();
  });

  it("renders MC and DOT numbers", () => {
    render(<CarriersPage />);
    expect(screen.getByText(/MC123456/)).toBeInTheDocument();
    expect(screen.getByText(/DOT789012/)).toBeInTheDocument();
  });

  it("renders location info", () => {
    render(<CarriersPage />);
    expect(screen.getByText("Dallas, TX")).toBeInTheDocument();
    expect(screen.getByText("Chicago, IL")).toBeInTheDocument();
  });

  it("renders status badges", () => {
    render(<CarriersPage />);
    const activeElements = screen.getAllByText("Active");
    expect(activeElements.length).toBeGreaterThanOrEqual(1);
    const preferredElements = screen.getAllByText("Preferred");
    expect(preferredElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders stats cards", () => {
    render(<CarriersPage />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Companies")).toBeInTheDocument();
    expect(screen.getByText("Owner-Ops")).toBeInTheDocument();
  });

  it("renders the Add Carrier button", () => {
    render(<CarriersPage />);
    expect(screen.getByText("Add Carrier")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<CarriersPage />);
    expect(
      screen.getByPlaceholderText("Search by name, MC#, DOT#, contact...")
    ).toBeInTheDocument();
  });

  it("opens the new carrier dialog when Add Carrier is clicked", async () => {
    const user = userEvent.setup();
    render(<CarriersPage />);

    await user.click(screen.getByText("Add Carrier"));

    await waitFor(() => {
      expect(screen.getByText("Add New Carrier")).toBeInTheDocument();
    });
  });

  it("carrier name links to detail page", () => {
    render(<CarriersPage />);
    const link = screen.getByText("Swift Trucking LLC");
    expect(link.closest("a")).toHaveAttribute("href", "/carriers/c1");
  });

  it("shows filter controls", () => {
    render(<CarriersPage />);
    expect(screen.getByPlaceholderText("State")).toBeInTheDocument();
  });
});

describe("CarriersPage — Loading State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    carriersReturn.data = undefined;
    carriersReturn.isLoading = true;
    carriersReturn.error = null;
    carriersReturn.refetch = jest.fn();
  });

  it("shows loading state when data is loading", () => {
    render(<CarriersPage />);
    expect(screen.getByText("Carriers")).toBeInTheDocument();
    expect(screen.queryByText("Swift Trucking LLC")).not.toBeInTheDocument();
  });
});

describe("CarriersPage — Empty State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    carriersReturn.data = { data: [], total: 0, page: 1, limit: 25, totalPages: 0 };
    carriersReturn.isLoading = false;
    carriersReturn.error = null;
    carriersReturn.refetch = jest.fn();
  });

  it("shows empty state when no carriers exist", () => {
    render(<CarriersPage />);
    expect(screen.getByText("No carriers found")).toBeInTheDocument();
  });
});

describe("CarriersPage — Error State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    carriersReturn.data = undefined;
    carriersReturn.isLoading = false;
    carriersReturn.error = new Error("Network error");
    carriersReturn.refetch = jest.fn();
  });

  it("shows error state when fetch fails", () => {
    render(<CarriersPage />);
    expect(screen.getByText("Error loading data")).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });
});

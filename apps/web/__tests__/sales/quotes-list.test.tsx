import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import {
  quotesReturn,
  quoteStatsReturn,
  deleteQuoteReturn,
  cloneQuoteReturn,
  sendQuoteReturn,
  convertQuoteReturn,
} from "@/test/mocks/hooks-sales-quotes";
import { mockPush } from "@/test/mocks/next-navigation";

import QuotesPage from "@/app/(dashboard)/quotes/page";

// Mock data
const mockQuotesData = {
  data: [
    {
      id: "q1",
      quoteNumber: "QT-2026-001",
      version: 1,
      status: "SENT",
      customerId: "cust-1",
      customerName: "Acme Corp",
      salesAgentId: "agent-1",
      salesAgentName: "Jane Smith",
      originCity: "Dallas",
      originState: "TX",
      destinationCity: "Houston",
      destinationState: "TX",
      distance: 240,
      serviceType: "FTL",
      equipmentType: "DRY_VAN",
      totalAmount: 2500,
      estimatedCost: 1800,
      marginPercent: 28,
      pickupDate: "2026-02-20",
      expiryDate: "2026-03-05",
      createdAt: "2026-02-10T08:00:00Z",
      updatedAt: "2026-02-12T10:00:00Z",
    },
    {
      id: "q2",
      quoteNumber: "QT-2026-002",
      version: 1,
      status: "DRAFT",
      customerId: "cust-2",
      customerName: "FoodMart Inc",
      originCity: "Chicago",
      originState: "IL",
      destinationCity: "Detroit",
      destinationState: "MI",
      distance: 280,
      serviceType: "FTL",
      equipmentType: "REEFER",
      totalAmount: 3200,
      estimatedCost: 2400,
      marginPercent: 25,
      pickupDate: "2026-02-22",
      expiryDate: "2026-03-07",
      createdAt: "2026-02-11T09:00:00Z",
      updatedAt: "2026-02-11T09:00:00Z",
    },
  ],
  total: 2,
  page: 1,
  limit: 25,
  totalPages: 1,
};

const mockStats = {
  totalQuotes: 45,
  activePipeline: 12,
  pipelineValue: 156000,
  wonThisMonth: 28000,
};

describe("QuotesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    quotesReturn.data = mockQuotesData;
    quotesReturn.isLoading = false;
    quotesReturn.error = null;
    quotesReturn.refetch = jest.fn();
    quoteStatsReturn.data = mockStats;
    quoteStatsReturn.isLoading = false;
    deleteQuoteReturn.mutate = jest.fn();
    deleteQuoteReturn.mutateAsync = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    deleteQuoteReturn.isPending = false;
    cloneQuoteReturn.mutate = jest.fn();
    sendQuoteReturn.mutate = jest.fn();
    convertQuoteReturn.mutate = jest.fn();
  });

  it("renders the page title", () => {
    render(<QuotesPage />);
    expect(screen.getByText("Quotes")).toBeInTheDocument();
  });

  it("renders the New Quote button", () => {
    render(<QuotesPage />);
    expect(screen.getByText("New Quote")).toBeInTheDocument();
  });

  it("renders quote data in the table", () => {
    render(<QuotesPage />);
    expect(screen.getByText("QT-2026-001")).toBeInTheDocument();
    expect(screen.getByText("QT-2026-002")).toBeInTheDocument();
  });

  it("renders customer names", () => {
    render(<QuotesPage />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("FoodMart Inc")).toBeInTheDocument();
  });

  it("renders stats cards", () => {
    render(<QuotesPage />);
    expect(screen.getByText("Total Quotes")).toBeInTheDocument();
    expect(screen.getByText("Active Pipeline")).toBeInTheDocument();
    expect(screen.getByText("Pipeline Value")).toBeInTheDocument();
    expect(screen.getByText("Won This Month")).toBeInTheDocument();
  });

  it("renders stats values", () => {
    render(<QuotesPage />);
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<QuotesPage />);
    expect(screen.getByPlaceholderText(/Search quotes/)).toBeInTheDocument();
  });

  it("renders status filter", () => {
    render(<QuotesPage />);
    expect(screen.getByText("Active Statuses")).toBeInTheDocument();
  });

  it("renders service type filter", () => {
    render(<QuotesPage />);
    expect(screen.getByText("All Types")).toBeInTheDocument();
  });
});

describe("QuotesPage — Loading State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    quotesReturn.data = undefined;
    quotesReturn.isLoading = true;
    quotesReturn.error = null;
    quotesReturn.refetch = jest.fn();
    quoteStatsReturn.data = undefined;
    quoteStatsReturn.isLoading = true;
    deleteQuoteReturn.mutate = jest.fn();
    deleteQuoteReturn.mutateAsync = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    deleteQuoteReturn.isPending = false;
    cloneQuoteReturn.mutate = jest.fn();
    sendQuoteReturn.mutate = jest.fn();
    convertQuoteReturn.mutate = jest.fn();
  });

  it("shows title during loading", () => {
    render(<QuotesPage />);
    expect(screen.getByText("Quotes")).toBeInTheDocument();
  });

  it("does not show quote data while loading", () => {
    render(<QuotesPage />);
    expect(screen.queryByText("QT-2026-001")).not.toBeInTheDocument();
  });
});

describe("QuotesPage — Empty State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    quotesReturn.data = { data: [], total: 0, page: 1, limit: 25, totalPages: 0 };
    quotesReturn.isLoading = false;
    quotesReturn.error = null;
    quotesReturn.refetch = jest.fn();
    quoteStatsReturn.data = mockStats;
    quoteStatsReturn.isLoading = false;
    deleteQuoteReturn.mutate = jest.fn();
    deleteQuoteReturn.mutateAsync = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    deleteQuoteReturn.isPending = false;
    cloneQuoteReturn.mutate = jest.fn();
    sendQuoteReturn.mutate = jest.fn();
    convertQuoteReturn.mutate = jest.fn();
  });

  it("shows empty state when no quotes exist", () => {
    render(<QuotesPage />);
    expect(screen.getByText(/no quotes/i)).toBeInTheDocument();
  });
});

describe("QuotesPage — Error State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    quotesReturn.data = undefined;
    quotesReturn.isLoading = false;
    quotesReturn.error = new Error("Failed to fetch quotes");
    quotesReturn.refetch = jest.fn();
    quoteStatsReturn.data = undefined;
    quoteStatsReturn.isLoading = false;
    deleteQuoteReturn.mutate = jest.fn();
    deleteQuoteReturn.mutateAsync = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    deleteQuoteReturn.isPending = false;
    cloneQuoteReturn.mutate = jest.fn();
    sendQuoteReturn.mutate = jest.fn();
    convertQuoteReturn.mutate = jest.fn();
  });

  it("shows error state when fetch fails", () => {
    render(<QuotesPage />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});

describe("QuotesPage — Navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    quotesReturn.data = mockQuotesData;
    quotesReturn.isLoading = false;
    quotesReturn.error = null;
    quotesReturn.refetch = jest.fn();
    quoteStatsReturn.data = mockStats;
    quoteStatsReturn.isLoading = false;
    deleteQuoteReturn.mutate = jest.fn();
    deleteQuoteReturn.mutateAsync = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    deleteQuoteReturn.isPending = false;
    cloneQuoteReturn.mutate = jest.fn();
    sendQuoteReturn.mutate = jest.fn();
    convertQuoteReturn.mutate = jest.fn();
  });

  it("navigates to new quote on button click", async () => {
    const user = userEvent.setup();
    render(<QuotesPage />);

    await user.click(screen.getByText("New Quote"));
    expect(mockPush).toHaveBeenCalledWith("/quotes/new");
  });
});

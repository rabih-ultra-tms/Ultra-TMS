import { render, screen } from "@/test/utils";
import { jest } from "@jest/globals";
import { Suspense } from "react";
import { act } from "@testing-library/react";
import {
  quoteReturn,
} from "@/test/mocks/hooks-sales-quotes";

import QuoteDetailPage from "@/app/(dashboard)/quotes/[id]/page";

// Mock quote detail data
const mockQuote = {
  id: "q1",
  quoteNumber: "QT-2026-001",
  version: 2,
  status: "SENT" as const,
  customerId: "cust-1",
  customerName: "Acme Corp",
  salesAgentId: "agent-1",
  salesAgentName: "Jane Smith",
  originCity: "Dallas",
  originState: "TX",
  destinationCity: "Houston",
  destinationState: "TX",
  distance: 240,
  serviceType: "FTL" as const,
  equipmentType: "DRY_VAN" as const,
  totalAmount: 2500,
  estimatedCost: 1800,
  marginPercent: 28,
  marginAmount: 700,
  pickupDate: "2026-02-20",
  expiryDate: "2026-03-05",
  commodity: "Electronics",
  weight: 42000,
  linehaulRate: 2200,
  fuelSurcharge: 200,
  accessorialsTotal: 100,
  ratePerMile: 10.42,
  contactName: "John Doe",
  contactEmail: "john@acme.com",
  contactPhone: "555-123-4567",
  stops: [
    {
      id: "s1",
      type: "PICKUP" as const,
      city: "Dallas",
      state: "TX",
      address: "123 Main St",
      zipCode: "75201",
      facilityName: "Warehouse A",
      sequence: 0,
    },
    {
      id: "s2",
      type: "DELIVERY" as const,
      city: "Houston",
      state: "TX",
      address: "456 Oak Ave",
      zipCode: "77001",
      facilityName: "Distribution Center",
      sequence: 1,
    },
  ],
  createdAt: "2026-02-10T08:00:00Z",
  updatedAt: "2026-02-12T10:00:00Z",
};

async function renderQuoteDetailPage(id: string) {
  const params = Promise.resolve({ id });
  let result: ReturnType<typeof render> | undefined;
  await act(async () => {
    result = render(
      <Suspense fallback={<div>Loading...</div>}>
        <QuoteDetailPage params={params} />
      </Suspense>
    );
  });
  return result!;
}

describe("QuoteDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    quoteReturn.data = mockQuote;
    quoteReturn.isLoading = false;
    quoteReturn.error = null;
    quoteReturn.refetch = jest.fn();
  });

  it("renders the quote number", async () => {
    await renderQuoteDetailPage("q1");
    // Quote number appears in breadcrumb and title
    const elements = screen.getAllByText("QT-2026-001");
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the version badge", async () => {
    await renderQuoteDetailPage("q1");
    expect(screen.getByText("v2")).toBeInTheDocument();
  });

  it("renders the customer name in subtitle", async () => {
    await renderQuoteDetailPage("q1");
    const elements = screen.getAllByText(/Acme Corp/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the lane info in subtitle", async () => {
    await renderQuoteDetailPage("q1");
    // Lane info may be split across elements, check for city names
    expect(screen.getAllByText(/Dallas/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Houston/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders all tab triggers", async () => {
    await renderQuoteDetailPage("q1");
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBe(4); // Overview, Versions, Timeline, Notes
  });

  it("renders breadcrumb with link to quotes list", async () => {
    await renderQuoteDetailPage("q1");
    const quotesLink = screen.getByText("Quotes");
    expect(quotesLink.closest("a")).toHaveAttribute("href", "/quotes");
  });

  it("renders back link to quotes list", async () => {
    await renderQuoteDetailPage("q1");
    const backLink = screen.getByText("Back to Quotes");
    expect(backLink.closest("a")).toHaveAttribute("href", "/quotes");
  });
});

describe("QuoteDetailPage — Loading State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    quoteReturn.data = undefined;
    quoteReturn.isLoading = true;
    quoteReturn.error = null;
    quoteReturn.refetch = jest.fn();
  });

  it("does not show quote data while loading", async () => {
    await renderQuoteDetailPage("q1");
    expect(screen.queryByText("QT-2026-001")).not.toBeInTheDocument();
  });
});

describe("QuoteDetailPage — Error State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    quoteReturn.data = undefined;
    quoteReturn.isLoading = false;
    quoteReturn.error = new Error("Quote not found");
    quoteReturn.refetch = jest.fn();
  });

  it("shows error state when fetch fails", async () => {
    await renderQuoteDetailPage("q-999");
    expect(screen.getByText("Failed to load details")).toBeInTheDocument();
  });

  it("shows error message", async () => {
    await renderQuoteDetailPage("q-999");
    expect(screen.getByText("Quote not found")).toBeInTheDocument();
  });
});

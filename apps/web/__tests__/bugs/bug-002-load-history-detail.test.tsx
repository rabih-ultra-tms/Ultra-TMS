/**
 * BUG-002 Regression Test: Load History Detail Page 404
 *
 * Verifies that /load-history/[id] renders correctly (no more 404).
 * Tests loading, error, and data states.
 */
import { render, screen } from "@/test/utils";
import { jest } from "@jest/globals";
import * as React from "react";
import { Suspense, act } from "react";
import { loadHistoryItemReturn } from "@/test/mocks/hooks-operations";

const mockLoad = {
  id: "lh-1",
  tenantId: "t1",
  quoteNumber: "Q-2026-001",
  status: "delivered",
  originCity: "Dallas",
  originState: "TX",
  destinationCity: "Chicago",
  destinationState: "IL",
  totalMiles: 920,
  equipmentTypeUsed: "DRY_VAN",
  customerRateCents: 225000,
  pickupDate: "2026-02-01T00:00:00Z",
  deliveryDate: "2026-02-03T00:00:00Z",
  createdAt: "2026-01-20T00:00:00Z",
  updatedAt: "2026-02-03T00:00:00Z",
};

import LoadHistoryDetailPage from "@/app/(dashboard)/load-history/[id]/page";

async function renderDetailPage(id: string) {
  const params = Promise.resolve({ id });
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <Suspense fallback={<div>Loading...</div>}>
        <LoadHistoryDetailPage params={params} />
      </Suspense>
    );
  });
  return result!;
}

describe("BUG-002: LoadHistoryDetailPage — Data State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadHistoryItemReturn.data = mockLoad;
    loadHistoryItemReturn.isLoading = false;
    loadHistoryItemReturn.error = null;
  });

  it("renders the route (origin → destination)", async () => {
    await renderDetailPage("lh-1");
    const dallasElements = screen.getAllByText(/Dallas/);
    expect(dallasElements.length).toBeGreaterThanOrEqual(1);
    const chicagoElements = screen.getAllByText(/Chicago/);
    expect(chicagoElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the quote number", async () => {
    await renderDetailPage("lh-1");
    expect(screen.getByText("#Q-2026-001")).toBeInTheDocument();
  });

  it("renders status badge", async () => {
    await renderDetailPage("lh-1");
    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  it("renders back link to load history list", async () => {
    await renderDetailPage("lh-1");
    const backLinks = screen.getAllByText(/Back|Load History/);
    const linkToList = backLinks.find(
      (el) => el.closest("a")?.getAttribute("href") === "/load-history"
    );
    expect(linkToList).toBeDefined();
  });

  it("renders breadcrumb navigation to /load-history", async () => {
    await renderDetailPage("lh-1");
    const breadcrumb = screen.getByText("Load History");
    expect(breadcrumb.closest("a")).toHaveAttribute("href", "/load-history");
  });

  it("renders Overview and Financials tabs", async () => {
    await renderDetailPage("lh-1");
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Financials")).toBeInTheDocument();
  });

  it("renders miles count", async () => {
    await renderDetailPage("lh-1");
    const milesElements = screen.getAllByText(/920/);
    expect(milesElements.length).toBeGreaterThanOrEqual(1);
  });
});

describe("BUG-002: LoadHistoryDetailPage — Loading State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadHistoryItemReturn.data = undefined;
    loadHistoryItemReturn.isLoading = true;
    loadHistoryItemReturn.error = null;
  });

  it("shows loading skeleton when data is loading", async () => {
    await renderDetailPage("lh-1");
    expect(screen.queryByText("Dallas, TX")).not.toBeInTheDocument();
  });
});

describe("BUG-002: LoadHistoryDetailPage — Error State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadHistoryItemReturn.data = undefined;
    loadHistoryItemReturn.isLoading = false;
    loadHistoryItemReturn.error = new Error("Network error");
  });

  it("shows error message when fetch fails", async () => {
    await renderDetailPage("lh-1");
    expect(screen.getByText("Unable to load details")).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("shows back link in error state", async () => {
    await renderDetailPage("lh-1");
    const backLink = screen.getByText("Back to Load History");
    expect(backLink.closest("a")).toHaveAttribute("href", "/load-history");
  });

  it("shows retry button in error state", async () => {
    await renderDetailPage("lh-1");
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });
});

describe("BUG-002: LoadHistoryDetailPage — Not Found State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadHistoryItemReturn.data = null;
    loadHistoryItemReturn.isLoading = false;
    loadHistoryItemReturn.error = null;
  });

  it("shows not found message when load is null", async () => {
    await renderDetailPage("nonexistent");
    expect(screen.getByText("Unable to load details")).toBeInTheDocument();
    expect(screen.getByText("Load not found")).toBeInTheDocument();
  });
});

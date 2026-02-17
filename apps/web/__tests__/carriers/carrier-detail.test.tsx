import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import * as React from "react";
import { Suspense, act } from "react";
import { mockPush } from "@/test/mocks/next-navigation";
import {
  carrierReturn,
  carrierDriversReturn,
} from "@/test/mocks/hooks-operations";

const mockCarrier = {
  id: "c1",
  tenantId: "t1",
  carrierType: "COMPANY" as const,
  companyName: "Swift Trucking LLC",
  mcNumber: "MC123456",
  dotNumber: "DOT789012",
  address: "100 Main St",
  city: "Dallas",
  state: "TX",
  zip: "75201",
  phone: "555-100-2000",
  email: "dispatch@swift.com",
  billingEmail: "billing@swift.com",
  paymentTermsDays: 30,
  preferredPaymentMethod: "ACH" as const,
  insuranceCompany: "National Ins",
  insurancePolicyNumber: "POL-001",
  insuranceExpiryDate: "2027-06-15",
  insuranceCargoLimitCents: 10000000,
  status: "ACTIVE" as const,
  notes: "Preferred carrier, reliable.",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-15T00:00:00Z",
};

import CarrierDetailPage from "@/app/(dashboard)/carriers/[id]/page";

async function renderDetailPage(id: string) {
  const params = Promise.resolve({ id });
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <Suspense fallback={<div>Loading...</div>}>
        <CarrierDetailPage params={params} />
      </Suspense>
    );
  });
  return result!;
}

describe("CarrierDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    carrierReturn.data = mockCarrier;
    carrierReturn.isLoading = false;
    carrierReturn.error = null;
    carrierReturn.refetch = jest.fn();
    carrierDriversReturn.data = [
      { id: "d1", carrierId: "c1", firstName: "John", lastName: "Smith" },
    ];
  });

  it("renders the carrier name as page title", async () => {
    await renderDetailPage("c1");
    expect(
      screen.getByRole("heading", { name: "Swift Trucking LLC" })
    ).toBeInTheDocument();
  });

  it("renders carrier type", async () => {
    await renderDetailPage("c1");
    const elements = screen.getAllByText("Company");
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders MC number", async () => {
    await renderDetailPage("c1");
    expect(screen.getByText(/MC#MC123456/)).toBeInTheDocument();
  });

  it("renders DOT number", async () => {
    await renderDetailPage("c1");
    expect(screen.getByText(/DOT#DOT789012/)).toBeInTheDocument();
  });

  it("renders status badge", async () => {
    await renderDetailPage("c1");
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders back link to carriers list", async () => {
    await renderDetailPage("c1");
    const backLink = screen.getByText("Back to Carriers");
    expect(backLink.closest("a")).toHaveAttribute("href", "/carriers");
  });

  it("renders breadcrumb navigation", async () => {
    await renderDetailPage("c1");
    const carriersLink = screen.getByText("Carriers");
    expect(carriersLink.closest("a")).toHaveAttribute("href", "/carriers");
  });

  it("renders Edit button", async () => {
    await renderDetailPage("c1");
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("navigates to edit page when Edit is clicked", async () => {
    const user = userEvent.setup();
    await renderDetailPage("c1");

    await user.click(screen.getByText("Edit"));
    expect(mockPush).toHaveBeenCalledWith("/carriers/c1/edit");
  });

  it("renders all tabs", async () => {
    await renderDetailPage("c1");
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Insurance")).toBeInTheDocument();
    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.getByText("Drivers")).toBeInTheDocument();
  });

  it("shows overview tab content by default", async () => {
    await renderDetailPage("c1");
    expect(screen.getByText("Company Information")).toBeInTheDocument();
    expect(screen.getByText("Contact Information")).toBeInTheDocument();
  });
});

describe("CarrierDetailPage — Loading State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    carrierReturn.data = undefined;
    carrierReturn.isLoading = true;
    carrierReturn.error = null;
    carrierReturn.refetch = jest.fn();
  });

  it("shows loading skeleton when data is loading", async () => {
    await renderDetailPage("c1");
    expect(screen.queryByText("Swift Trucking LLC")).not.toBeInTheDocument();
  });
});

describe("CarrierDetailPage — Error State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    carrierReturn.data = undefined;
    carrierReturn.isLoading = false;
    carrierReturn.error = new Error("Network error");
    carrierReturn.refetch = jest.fn();
  });

  it("shows error state when fetch fails", async () => {
    await renderDetailPage("c1");
    expect(screen.getByText("Failed to load details")).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("shows back button in error state", async () => {
    await renderDetailPage("c1");
    const backBtn = screen.getByText("Back to Carriers");
    expect(backBtn.closest("a")).toHaveAttribute("href", "/carriers");
  });
});

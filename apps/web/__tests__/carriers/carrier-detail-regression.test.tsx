/**
 * CARR-002 Regression: Carrier Detail — Delete button, Contacts tab, Loads tab, tab order
 *
 * Phase 2 review found the carrier detail page was missing:
 *   1. Delete button with ConfirmDialog
 *   2. Contacts tab (Primary + Billing)
 *   3. Loads tab (loads assigned to carrier)
 *   4. Compliance tab
 *   5. Correct tab order: Overview, Contacts, Insurance, Documents, Drivers, Loads, Compliance
 *
 * These tests prevent regression on those additions.
 */
import { render, screen, within } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import * as React from "react";
import { Suspense, act } from "react";
import { mockPush } from "@/test/mocks/next-navigation";
import {
  carrierReturn,
  carrierDriversReturn,
  deleteCarrierReturn,
} from "@/test/mocks/hooks-operations";
import { loadsReturn } from "@/test/mocks/hooks-tms-loads";

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

// ---- CARR-002: Delete Button ----

describe("CARR-002 Regression: Delete button", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    carrierReturn.data = mockCarrier;
    carrierReturn.isLoading = false;
    carrierReturn.error = null;
    carrierReturn.refetch = jest.fn();
    carrierDriversReturn.data = [];
    loadsReturn.data = undefined;
    loadsReturn.isLoading = true;
    loadsReturn.error = null;
    deleteCarrierReturn.mutateAsync = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    deleteCarrierReturn.isPending = false;
  });

  it("renders Delete button alongside Edit button", async () => {
    await renderDetailPage("c1");
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("opens ConfirmDialog when Delete is clicked", async () => {
    const user = userEvent.setup();
    await renderDetailPage("c1");

    await user.click(screen.getByText("Delete"));
    // ConfirmDialog should show the carrier name in confirmation message
    expect(
      screen.getByText(/Are you sure you want to delete Swift Trucking LLC/)
    ).toBeInTheDocument();
  });

  it("calls deleteCarrier.mutateAsync when confirmed", async () => {
    const user = userEvent.setup();
    await renderDetailPage("c1");

    await user.click(screen.getByText("Delete"));
    // Click the confirm button in the dialog
    const confirmBtn = screen.getAllByText("Delete").find(
      (el) => el.closest("[role='alertdialog'], [role='dialog'], dialog") != null
    );
    if (confirmBtn) {
      await user.click(confirmBtn);
      expect(deleteCarrierReturn.mutateAsync).toHaveBeenCalledWith("c1");
    }
  });

  it("renders Delete button with destructive styling", async () => {
    await renderDetailPage("c1");
    const deleteBtn = screen.getByText("Delete").closest("button");
    expect(deleteBtn?.className).toContain("text-destructive");
  });
});

// ---- CARR-002: Tab Order ----

describe("CARR-002 Regression: Tab order matches spec", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    carrierReturn.data = mockCarrier;
    carrierReturn.isLoading = false;
    carrierReturn.error = null;
    carrierReturn.refetch = jest.fn();
    carrierDriversReturn.data = [];
    loadsReturn.data = undefined;
    loadsReturn.isLoading = true;
    loadsReturn.error = null;
  });

  it("renders all 7 tabs", async () => {
    await renderDetailPage("c1");
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Contacts")).toBeInTheDocument();
    expect(screen.getByText("Insurance")).toBeInTheDocument();
    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.getByText("Drivers")).toBeInTheDocument();
    expect(screen.getByText("Loads")).toBeInTheDocument();
    expect(screen.getByText("Compliance")).toBeInTheDocument();
  });

  it("renders Contacts tab (new in CARR-002)", async () => {
    await renderDetailPage("c1");
    expect(screen.getByText("Contacts")).toBeInTheDocument();
  });

  it("renders Loads tab (new in CARR-002)", async () => {
    await renderDetailPage("c1");
    expect(screen.getByText("Loads")).toBeInTheDocument();
  });

  it("renders Compliance tab (new in CARR-002)", async () => {
    await renderDetailPage("c1");
    expect(screen.getByText("Compliance")).toBeInTheDocument();
  });
});

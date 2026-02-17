import { renderHook } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { jest } from "@jest/globals";
import { sendEmailReturn } from "@/test/mocks/hooks-communication-send-email";

import {
  useAutoEmail,
  loadToEmailData,
  dispatchLoadToEmailData,
  type AutoEmailLoadData,
} from "@/lib/hooks/communication/use-auto-email";

// ─── Test wrapper ────────────────────────────────────────────────────────────

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockLoadData: AutoEmailLoadData = {
  id: "load-1",
  loadNumber: "LD-2026-100",
  carrierId: "c1",
  carrierEmail: "carrier@fast-freight.com",
  carrierName: "Fast Freight",
  customerEmail: "billing@acme.com",
  customerId: "cust-1",
  customerName: "Acme Corp",
  originCity: "Atlanta",
  originState: "GA",
  destinationCity: "Miami",
  destinationState: "FL",
  pickupDate: "2026-02-18",
  deliveryDate: "2026-02-20",
};

// ─── useAutoEmail hook tests ─────────────────────────────────────────────────

describe("useAutoEmail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sendEmailReturn.mutate = jest.fn();
    sendEmailReturn.isPending = false;
  });

  it("returns triggerEmail function and isPending flag", () => {
    const { result } = renderHook(() => useAutoEmail(), {
      wrapper: createWrapper(),
    });
    expect(typeof result.current.triggerEmail).toBe("function");
    expect(result.current.isPending).toBe(false);
  });

  it("sends rate confirmation email with correct template", () => {
    const { result } = renderHook(() => useAutoEmail(), {
      wrapper: createWrapper(),
    });
    result.current.triggerEmail("rate_confirmation", mockLoadData);
    expect(sendEmailReturn.mutate).toHaveBeenCalledTimes(1);
    const payload = (sendEmailReturn.mutate as jest.Mock).mock.calls[0][0];
    expect(payload).toMatchObject({
      templateCode: "RATE_CONFIRMATION",
      recipientEmail: "carrier@fast-freight.com",
      recipientType: "CARRIER",
      entityType: "LOAD",
      entityId: "load-1",
    });
    expect(payload.subject).toContain("Rate Confirmation");
    expect(payload.subject).toContain("LD-2026-100");
  });

  it("sends load tender email to carrier", () => {
    const { result } = renderHook(() => useAutoEmail(), {
      wrapper: createWrapper(),
    });
    result.current.triggerEmail("load_tendered", mockLoadData);
    const payload = (sendEmailReturn.mutate as jest.Mock).mock.calls[0][0];
    expect(payload).toMatchObject({
      templateCode: "LOAD_ASSIGNED",
      recipientEmail: "carrier@fast-freight.com",
      recipientType: "CARRIER",
    });
    expect(payload.subject).toContain("Load Tender");
  });

  it("sends delivery confirmation to customer (not carrier)", () => {
    const { result } = renderHook(() => useAutoEmail(), {
      wrapper: createWrapper(),
    });
    result.current.triggerEmail("delivery_confirmation", mockLoadData);
    const payload = (sendEmailReturn.mutate as jest.Mock).mock.calls[0][0];
    expect(payload).toMatchObject({
      templateCode: "DOCUMENT_RECEIVED",
      recipientEmail: "billing@acme.com",
      recipientType: "CONTACT",
    });
    expect(payload.subject).toContain("Delivery Confirmation");
  });

  it("sends invoice email to customer", () => {
    const { result } = renderHook(() => useAutoEmail(), {
      wrapper: createWrapper(),
    });
    result.current.triggerEmail("invoice_sent", mockLoadData);
    const payload = (sendEmailReturn.mutate as jest.Mock).mock.calls[0][0];
    expect(payload).toMatchObject({
      templateCode: "INVOICE_CREATED",
      recipientEmail: "billing@acme.com",
      recipientType: "CONTACT",
    });
  });

  it("sends pickup reminder to carrier", () => {
    const { result } = renderHook(() => useAutoEmail(), {
      wrapper: createWrapper(),
    });
    result.current.triggerEmail("pickup_reminder", mockLoadData);
    const payload = (sendEmailReturn.mutate as jest.Mock).mock.calls[0][0];
    expect(payload).toMatchObject({
      templateCode: "LOAD_STATUS_UPDATE",
      recipientEmail: "carrier@fast-freight.com",
      recipientType: "CARRIER",
    });
  });

  it("does NOT send email when carrier email is missing", () => {
    const { result } = renderHook(() => useAutoEmail(), {
      wrapper: createWrapper(),
    });
    const dataNoEmail = { ...mockLoadData, carrierEmail: undefined };
    result.current.triggerEmail("rate_confirmation", dataNoEmail);
    expect(sendEmailReturn.mutate).not.toHaveBeenCalled();
  });

  it("does NOT send email when customer email is missing for customer-type emails", () => {
    const { result } = renderHook(() => useAutoEmail(), {
      wrapper: createWrapper(),
    });
    const dataNoCustomerEmail = { ...mockLoadData, customerEmail: undefined };
    result.current.triggerEmail("delivery_confirmation", dataNoCustomerEmail);
    expect(sendEmailReturn.mutate).not.toHaveBeenCalled();
  });

  it("includes attachments when provided", () => {
    const { result } = renderHook(() => useAutoEmail(), {
      wrapper: createWrapper(),
    });
    result.current.triggerEmail("rate_confirmation", mockLoadData, {
      attachments: [{ name: "rate-con.pdf", url: "/files/rate-con.pdf" }],
    });
    const payload = (sendEmailReturn.mutate as jest.Mock).mock.calls[0][0];
    expect(payload.attachments).toEqual([
      { name: "rate-con.pdf", url: "/files/rate-con.pdf" },
    ]);
  });

  it("includes extra variables when provided", () => {
    const { result } = renderHook(() => useAutoEmail(), {
      wrapper: createWrapper(),
    });
    result.current.triggerEmail("rate_confirmation", mockLoadData, {
      additionalVariables: { customField: "value" },
    });
    const payload = (sendEmailReturn.mutate as jest.Mock).mock.calls[0][0];
    expect(payload.variables.customField).toBe("value");
  });

  it("includes load data variables in payload", () => {
    const { result } = renderHook(() => useAutoEmail(), {
      wrapper: createWrapper(),
    });
    result.current.triggerEmail("rate_confirmation", mockLoadData);
    const payload = (sendEmailReturn.mutate as jest.Mock).mock.calls[0][0];
    expect(payload.variables).toMatchObject({
      loadNumber: "LD-2026-100",
      carrierName: "Fast Freight",
      customerName: "Acme Corp",
      originCity: "Atlanta",
      originState: "GA",
      destinationCity: "Miami",
      destinationState: "FL",
    });
  });
});

// ─── Helper function tests ──────────────────────────────────────────────────

describe("loadToEmailData", () => {
  it("extracts data from load object", () => {
    const load = {
      id: "load-1",
      loadNumber: "LD-2026-100",
      carrierId: "c1",
      carrier: {
        legalName: "Fast Freight",
        contactEmail: "contact@fast.com",
        dispatchEmail: "dispatch@fast.com",
      },
      order: {
        customer: {
          id: "cust-1",
          name: "Acme Corp",
          email: "acme@example.com",
          contactEmail: "billing@acme.com",
        },
      },
      originCity: "Atlanta",
      originState: "GA",
      destinationCity: "Miami",
      destinationState: "FL",
      pickupDate: "2026-02-18",
      deliveryDate: "2026-02-20",
    };

    const result = loadToEmailData(load);
    expect(result).toEqual({
      id: "load-1",
      loadNumber: "LD-2026-100",
      carrierId: "c1",
      carrierEmail: "dispatch@fast.com",
      carrierName: "Fast Freight",
      customerEmail: "billing@acme.com",
      customerId: "cust-1",
      customerName: "Acme Corp",
      originCity: "Atlanta",
      originState: "GA",
      destinationCity: "Miami",
      destinationState: "FL",
      pickupDate: "2026-02-18",
      deliveryDate: "2026-02-20",
    });
  });

  it("falls back to contactEmail when dispatchEmail is not set", () => {
    const load = {
      id: "load-2",
      loadNumber: "LD-2026-200",
      carrier: { contactEmail: "contact@carrier.com" },
    };
    const result = loadToEmailData(load);
    expect(result.carrierEmail).toBe("contact@carrier.com");
  });
});

describe("dispatchLoadToEmailData", () => {
  it("extracts data from dispatch load object", () => {
    const dispatchLoad = {
      id: 42,
      loadNumber: "LD-2026-042",
      carrier: { id: 10, name: "Road Runner", contactEmail: "rr@carrier.com" },
      customer: { id: 20, name: "Acme Corp" },
      stops: [
        {
          type: "PICKUP",
          city: "Dallas",
          state: "TX",
          appointmentDate: "2026-02-18",
        },
        {
          type: "DELIVERY",
          city: "Houston",
          state: "TX",
          appointmentDate: "2026-02-19",
        },
      ],
    };

    const result = dispatchLoadToEmailData(dispatchLoad);
    expect(result).toMatchObject({
      id: "42",
      loadNumber: "LD-2026-042",
      carrierId: "10",
      carrierEmail: "rr@carrier.com",
      carrierName: "Road Runner",
      customerId: "20",
      customerName: "Acme Corp",
      originCity: "Dallas",
      originState: "TX",
      destinationCity: "Houston",
      destinationState: "TX",
    });
  });
});

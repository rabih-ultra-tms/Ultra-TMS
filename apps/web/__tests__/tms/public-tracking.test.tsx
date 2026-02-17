import { render, screen } from "@/test/utils";
import { jest } from "@jest/globals";
import { Suspense } from "react";
import { act } from "@testing-library/react";
import {
  publicTrackingReturn,
  TrackingNotFoundError,
} from "@/test/mocks/hooks-tracking";

import TrackingPage from "@/app/track/[trackingCode]/page";

// Mock tracking data — only public-safe fields (no carrier rates, margins, internal notes)
const mockTrackingData = {
  loadNumber: "LD-2026-001",
  orderNumber: "ORD-2026-001",
  status: "IN_TRANSIT",
  equipmentType: "DRY_VAN",
  customerName: "Acme Corp",
  currentLocation: {
    lat: 31.9686,
    lng: -99.9018,
    city: "Abilene",
    state: "TX",
    updatedAt: "2026-02-15T14:30:00Z",
  },
  eta: "2026-02-15T18:00:00Z",
  pickupDate: "2026-02-15T08:00:00Z",
  deliveryDate: null,
  dispatchedAt: "2026-02-15T07:00:00Z",
  pickedUpAt: "2026-02-15T08:15:00Z",
  deliveredAt: null,
  stops: [
    {
      id: "s1",
      type: "PICKUP",
      sequence: 0,
      facilityName: "Warehouse A",
      city: "Dallas",
      state: "TX",
      zip: "75201",
      status: "DEPARTED",
      appointmentDate: "2026-02-15",
      appointmentTimeStart: "08:00",
      appointmentTimeEnd: "10:00",
      arrivedAt: "2026-02-15T07:55:00Z",
      departedAt: "2026-02-15T08:15:00Z",
      location: { lat: 32.7767, lng: -96.797 },
    },
    {
      id: "s2",
      type: "DELIVERY",
      sequence: 1,
      facilityName: "Distribution Center",
      city: "Houston",
      state: "TX",
      zip: "77001",
      status: "PENDING",
      appointmentDate: "2026-02-15",
      appointmentTimeStart: "16:00",
      appointmentTimeEnd: "18:00",
      arrivedAt: null,
      departedAt: null,
      location: { lat: 29.7604, lng: -95.3698 },
    },
  ],
};

async function renderTrackingPage(trackingCode: string) {
  const params = Promise.resolve({ trackingCode });
  let result: ReturnType<typeof render> | undefined;
  await act(async () => {
    result = render(
      <Suspense fallback={<div>Loading...</div>}>
        <TrackingPage params={params} />
      </Suspense>
    );
  });
  return result!;
}

describe("TrackingPage — Data Loaded", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    publicTrackingReturn.data = mockTrackingData;
    publicTrackingReturn.isLoading = false;
    publicTrackingReturn.error = null;
    publicTrackingReturn.refetch = jest.fn();
  });

  it("renders the Ultra TMS header", async () => {
    await renderTrackingPage("TRK-ABC123");
    expect(screen.getByText("Ultra TMS")).toBeInTheDocument();
  });

  it("renders Shipment Tracking label", async () => {
    await renderTrackingPage("TRK-ABC123");
    expect(screen.getByText("Shipment Tracking")).toBeInTheDocument();
  });

  it("renders the footer", async () => {
    await renderTrackingPage("TRK-ABC123");
    expect(screen.getByText("Powered by Ultra TMS")).toBeInTheDocument();
  });

  it("does NOT expose carrier rate or margin data", async () => {
    await renderTrackingPage("TRK-ABC123");
    // Sensitive fields should never appear in tracking view
    expect(screen.queryByText(/carrierRate/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/margin/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\$1,800/)).not.toBeInTheDocument();
  });
});

describe("TrackingPage — Loading State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    publicTrackingReturn.data = undefined;
    publicTrackingReturn.isLoading = true;
    publicTrackingReturn.error = null;
    publicTrackingReturn.refetch = jest.fn();
  });

  it("shows loading skeleton", async () => {
    await renderTrackingPage("TRK-ABC123");
    // Header should still render during loading
    expect(screen.getByText("Ultra TMS")).toBeInTheDocument();
  });
});

describe("TrackingPage — Not Found Error", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    publicTrackingReturn.data = undefined;
    publicTrackingReturn.isLoading = false;
    publicTrackingReturn.error = new TrackingNotFoundError("Shipment not found");
    publicTrackingReturn.refetch = jest.fn();
  });

  it("shows Shipment Not Found message", async () => {
    await renderTrackingPage("TRK-INVALID");
    expect(screen.getByText("Shipment Not Found")).toBeInTheDocument();
  });

  it("displays the invalid tracking code", async () => {
    await renderTrackingPage("TRK-INVALID");
    expect(screen.getByText("TRK-INVALID")).toBeInTheDocument();
  });
});

describe("TrackingPage — Generic Error", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    publicTrackingReturn.data = undefined;
    publicTrackingReturn.isLoading = false;
    publicTrackingReturn.error = new Error("Server error");
    publicTrackingReturn.refetch = jest.fn();
  });

  it("shows unable to load message", async () => {
    await renderTrackingPage("TRK-ABC123");
    expect(screen.getByText("Unable to Load Tracking Data")).toBeInTheDocument();
  });

  it("shows Try Again button for generic errors", async () => {
    await renderTrackingPage("TRK-ABC123");
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });
});

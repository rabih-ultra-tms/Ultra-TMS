import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import {
  stopsReturn,
  markArrivedReturn,
  markDepartedReturn,
} from "@/test/mocks/hooks-tms-stops";

import { StopsTable } from "@/components/tms/stops/stops-table";

const mockStops = [
  {
    id: "stop-1",
    orderId: "ord-1",
    loadId: "load-1",
    stopType: "PICKUP",
    stopSequence: 1,
    status: "DEPARTED",
    facilityName: "Warehouse Alpha",
    addressLine1: "123 Main St",
    city: "Dallas",
    state: "TX",
    postalCode: "75201",
    contactName: "John Smith",
    contactPhone: "(555) 123-4567",
    scheduledArrival: "2026-02-16T08:00:00Z",
    actualArrival: "2026-02-16T08:15:00Z",
    actualDeparture: "2026-02-16T09:30:00Z",
  },
  {
    id: "stop-2",
    orderId: "ord-1",
    loadId: "load-1",
    stopType: "DELIVERY",
    stopSequence: 2,
    status: "PENDING",
    facilityName: "Distribution Center Beta",
    addressLine1: "456 Oak Ave",
    city: "Houston",
    state: "TX",
    postalCode: "77001",
    contactName: "Jane Doe",
    contactPhone: "(555) 987-6543",
    scheduledArrival: "2026-02-17T10:00:00Z",
    actualArrival: null,
    actualDeparture: null,
  },
];

describe("StopsTable — Data Loaded", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    stopsReturn.data = mockStops;
    stopsReturn.isLoading = false;
    stopsReturn.isError = false;
    stopsReturn.error = null;
    stopsReturn.refetch = jest.fn();
    markArrivedReturn.mutate = jest.fn();
    markArrivedReturn.isPending = false;
    markDepartedReturn.mutate = jest.fn();
    markDepartedReturn.isPending = false;
  });

  it("renders the route summary bar with stop count", () => {
    render(<StopsTable orderId="ord-1" />);
    expect(screen.getByText("2 stops")).toBeInTheDocument();
  });

  it("shows completion percentage", () => {
    render(<StopsTable orderId="ord-1" />);
    expect(screen.getByText("50% complete")).toBeInTheDocument();
  });

  it("shows completed stop count", () => {
    render(<StopsTable orderId="ord-1" />);
    expect(screen.getByText("1 completed")).toBeInTheDocument();
  });

  it("renders the Add Stop button (disabled)", () => {
    render(<StopsTable orderId="ord-1" />);
    expect(screen.getByText("Add Stop (Coming Soon)")).toBeInTheDocument();
  });
});

describe("StopsTable — Loading State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    stopsReturn.data = undefined;
    stopsReturn.isLoading = true;
    stopsReturn.isError = false;
    stopsReturn.error = null;
  });

  it("shows loading skeletons", () => {
    render(<StopsTable orderId="ord-1" />);
    // Should not show stop data during loading
    expect(screen.queryByText("2 stops")).not.toBeInTheDocument();
  });
});

describe("StopsTable — Error State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    stopsReturn.data = undefined;
    stopsReturn.isLoading = false;
    stopsReturn.isError = true;
    stopsReturn.error = new Error("Failed to load stops");
    stopsReturn.refetch = jest.fn();
  });

  it("shows error message", () => {
    render(<StopsTable orderId="ord-1" />);
    expect(screen.getByText("Failed to load stops")).toBeInTheDocument();
  });

  it("renders Retry button", () => {
    render(<StopsTable orderId="ord-1" />);
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("calls refetch on Retry click", async () => {
    const user = userEvent.setup();
    render(<StopsTable orderId="ord-1" />);
    await user.click(screen.getByText("Retry"));
    expect(stopsReturn.refetch).toHaveBeenCalled();
  });
});

describe("StopsTable — Empty State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    stopsReturn.data = [];
    stopsReturn.isLoading = false;
    stopsReturn.isError = false;
    stopsReturn.error = null;
  });

  it("shows empty state message", () => {
    render(<StopsTable orderId="ord-1" />);
    expect(screen.getByText("No stops configured")).toBeInTheDocument();
  });

  it("shows guidance text about pickup and delivery", () => {
    render(<StopsTable orderId="ord-1" />);
    expect(
      screen.getByText(/every load needs at least one pickup/i)
    ).toBeInTheDocument();
  });

  it("renders disabled Add Pickup/Delivery Stop buttons", () => {
    render(<StopsTable orderId="ord-1" />);
    expect(screen.getByText("Add Pickup Stop")).toBeInTheDocument();
    expect(screen.getByText("Add Delivery Stop")).toBeInTheDocument();
  });
});

describe("StopsTable — Invalid Configuration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    stopsReturn.isLoading = false;
    stopsReturn.isError = false;
    stopsReturn.error = null;
  });

  it("shows warning when missing PICKUP stop", () => {
    stopsReturn.data = [
      {
        id: "stop-d",
        stopType: "DELIVERY",
        stopSequence: 1,
        status: "PENDING",
        facilityName: "DC",
        city: "Houston",
        state: "TX",
        postalCode: "77001",
        addressLine1: "456 Oak Ave",
      },
    ];
    render(<StopsTable orderId="ord-1" />);
    expect(screen.getByText(/Missing PICKUP stop/)).toBeInTheDocument();
  });

  it("shows warning when missing DELIVERY stop", () => {
    stopsReturn.data = [
      {
        id: "stop-p",
        stopType: "PICKUP",
        stopSequence: 1,
        status: "PENDING",
        facilityName: "Warehouse",
        city: "Dallas",
        state: "TX",
        postalCode: "75201",
        addressLine1: "123 Main St",
      },
    ];
    render(<StopsTable orderId="ord-1" />);
    expect(screen.getByText(/Missing DELIVERY stop/)).toBeInTheDocument();
  });
});

describe("StopsTable — Route Completion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    stopsReturn.isLoading = false;
    stopsReturn.isError = false;
    stopsReturn.error = null;
    stopsReturn.refetch = jest.fn();
  });

  it("shows 100% complete when all stops are departed", () => {
    stopsReturn.data = [
      {
        id: "stop-1",
        stopType: "PICKUP",
        stopSequence: 1,
        status: "DEPARTED",
        facilityName: "Warehouse",
        city: "Dallas",
        state: "TX",
        postalCode: "75201",
        addressLine1: "123 Main St",
      },
      {
        id: "stop-2",
        stopType: "DELIVERY",
        stopSequence: 2,
        status: "DEPARTED",
        facilityName: "DC",
        city: "Houston",
        state: "TX",
        postalCode: "77001",
        addressLine1: "456 Oak Ave",
      },
    ];
    render(<StopsTable orderId="ord-1" />);
    expect(screen.getByText("100% complete")).toBeInTheDocument();
  });

  it("shows 0% complete when no stops are departed", () => {
    stopsReturn.data = [
      {
        id: "stop-1",
        stopType: "PICKUP",
        stopSequence: 1,
        status: "PENDING",
        facilityName: "Warehouse",
        city: "Dallas",
        state: "TX",
        postalCode: "75201",
        addressLine1: "123 Main St",
      },
      {
        id: "stop-2",
        stopType: "DELIVERY",
        stopSequence: 2,
        status: "PENDING",
        facilityName: "DC",
        city: "Houston",
        state: "TX",
        postalCode: "77001",
        addressLine1: "456 Oak Ave",
      },
    ];
    render(<StopsTable orderId="ord-1" />);
    expect(screen.getByText("0% complete")).toBeInTheDocument();
  });
});

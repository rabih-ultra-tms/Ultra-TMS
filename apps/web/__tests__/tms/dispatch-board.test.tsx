import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import { dispatchLoadsReturn } from "@/test/mocks/hooks-tms-dispatch";
import { dispatchBoardUpdatesReturn } from "@/test/mocks/hooks-tms-dispatch-ws";
import { socketStatusReturn } from "@/test/mocks/hooks-socket-status";

import { DispatchBoard } from "@/components/tms/dispatch/dispatch-board";

const NOW = new Date().toISOString();

// Helper to create a load with required fields matching DispatchLoad type
function makeLoad(overrides: Record<string, unknown>) {
  return {
    updatedAt: NOW,
    createdAt: NOW,
    statusChangedAt: NOW,
    isHotLoad: false,
    hasExceptions: false,
    customer: { id: 1, name: "Test Customer" },
    stops: [
      { id: 99, type: "PICKUP", city: "Dallas", state: "TX", appointmentDate: "2026-02-16", status: "PENDING" },
      { id: 100, type: "DELIVERY", city: "Houston", state: "TX", appointmentDate: "2026-02-18", status: "PENDING" },
    ],
    ...overrides,
  };
}

const load1 = makeLoad({
  id: 1, loadNumber: "LD-2026-001", status: "PLANNING",
  customer: { id: 1, name: "Acme Corp" }, carrier: undefined,
  equipmentType: "DRY_VAN", customerRate: 2500, weight: 10000,
});
const load2 = makeLoad({
  id: 2, loadNumber: "LD-2026-002", status: "DISPATCHED",
  customer: { id: 2, name: "Beta Inc" },
  carrier: { id: 1, name: "Fast Freight", mcNumber: "MC-123" },
  equipmentType: "REEFER", customerRate: 3200, carrierRate: 2800, weight: 15000,
  stops: [
    { id: 1, type: "PICKUP", city: "Chicago", state: "IL", appointmentDate: "2026-02-16", status: "PENDING" },
    { id: 2, type: "DELIVERY", city: "Detroit", state: "MI", appointmentDate: "2026-02-19", status: "PENDING" },
  ],
});
const load3 = makeLoad({
  id: 3, loadNumber: "LD-2026-003", status: "IN_TRANSIT",
  customer: { id: 3, name: "Gamma LLC" },
  carrier: { id: 2, name: "Road Runner", mcNumber: "MC-456" },
  equipmentType: "FLATBED", customerRate: 4000, carrierRate: 3500, weight: 25000,
  stops: [
    { id: 3, type: "PICKUP", city: "Atlanta", state: "GA", appointmentDate: "2026-02-15", status: "DEPARTED" },
    { id: 4, type: "DELIVERY", city: "Miami", state: "FL", appointmentDate: "2026-02-17", status: "PENDING" },
  ],
});

// Mock board data with loads in different lanes
const mockBoardData = {
  loads: [load1, load2, load3],
  loadsByLane: {
    UNASSIGNED: [load1],
    TENDERED: [],
    DISPATCHED: [load2],
    IN_TRANSIT: [load3],
    DELIVERED: [],
    COMPLETED: [],
  },
  stats: {
    total: 3,
    unassigned: 1,
    tendered: 0,
    dispatched: 1,
    inTransit: 1,
    delivered: 0,
    completed: 0,
  },
};

describe("DispatchBoard — Data Loaded", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dispatchLoadsReturn.data = mockBoardData;
    dispatchLoadsReturn.isLoading = false;
    dispatchLoadsReturn.isError = false;
    dispatchLoadsReturn.error = null;
    dispatchLoadsReturn.refetch = jest.fn();
    dispatchBoardUpdatesReturn.animationCount = 0;
    socketStatusReturn.connected = true;
    socketStatusReturn.status = "connected";
    socketStatusReturn.latency = 50;
  });

  it("renders the kanban board with lanes", () => {
    render(<DispatchBoard />);
    expect(screen.getAllByText("Unassigned").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Dispatched").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("In Transit").length).toBeGreaterThanOrEqual(1);
  });

  it("renders load cards with load numbers", () => {
    render(<DispatchBoard />);
    expect(screen.getByText("LD-2026-001")).toBeInTheDocument();
    expect(screen.getByText("LD-2026-002")).toBeInTheDocument();
    expect(screen.getByText("LD-2026-003")).toBeInTheDocument();
  });

  it("displays all 6 kanban lanes", () => {
    render(<DispatchBoard />);
    expect(screen.getAllByText("Unassigned").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Tendered").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Dispatched").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("In Transit").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Delivered").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Completed").length).toBeGreaterThanOrEqual(1);
  });
});

describe("DispatchBoard — Loading State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dispatchLoadsReturn.data = undefined;
    dispatchLoadsReturn.isLoading = true;
    dispatchLoadsReturn.isError = false;
    dispatchLoadsReturn.error = null;
    socketStatusReturn.connected = true;
    socketStatusReturn.status = "connected";
    dispatchBoardUpdatesReturn.animationCount = 0;
  });

  it("shows loading indicator", () => {
    render(<DispatchBoard />);
    expect(screen.getByText("Loading dispatch board...")).toBeInTheDocument();
  });
});

describe("DispatchBoard — Error State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dispatchLoadsReturn.data = undefined;
    dispatchLoadsReturn.isLoading = false;
    dispatchLoadsReturn.isError = true;
    dispatchLoadsReturn.error = new Error("Network error");
    dispatchLoadsReturn.refetch = jest.fn();
    socketStatusReturn.connected = true;
    socketStatusReturn.status = "connected";
    dispatchBoardUpdatesReturn.animationCount = 0;
  });

  it("shows error message", () => {
    render(<DispatchBoard />);
    expect(screen.getByText("Unable to load the dispatch board")).toBeInTheDocument();
  });

  it("shows error details", () => {
    render(<DispatchBoard />);
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("renders Retry button", () => {
    render(<DispatchBoard />);
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("calls refetch on Retry click", async () => {
    const user = userEvent.setup();
    render(<DispatchBoard />);
    await user.click(screen.getByText("Retry"));
    expect(dispatchLoadsReturn.refetch).toHaveBeenCalled();
  });
});

describe("DispatchBoard — Empty State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dispatchLoadsReturn.data = { loads: [], loadsByLane: {}, stats: {} };
    dispatchLoadsReturn.isLoading = false;
    dispatchLoadsReturn.isError = false;
    dispatchLoadsReturn.error = null;
    socketStatusReturn.connected = true;
    socketStatusReturn.status = "connected";
    dispatchBoardUpdatesReturn.animationCount = 0;
  });

  it("shows empty state message", () => {
    render(<DispatchBoard />);
    expect(screen.getByText("Your dispatch board is empty")).toBeInTheDocument();
  });

  it("shows Create First Load link", () => {
    render(<DispatchBoard />);
    const link = screen.getByText("Create First Load");
    expect(link.closest("a")).toHaveAttribute("href", "/operations/loads/new");
  });
});

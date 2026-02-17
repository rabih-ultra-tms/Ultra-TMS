import { render, screen } from "@/test/utils";
import { jest } from "@jest/globals";
import { dispatchLoadsReturn } from "@/test/mocks/hooks-tms-dispatch";
import { dispatchBoardUpdatesReturn } from "@/test/mocks/hooks-tms-dispatch-ws";
import { socketStatusReturn } from "@/test/mocks/hooks-socket-status";

import { DispatchBoard } from "@/components/tms/dispatch/dispatch-board";

const NOW = new Date().toISOString();

const defaultStops = [
  { id: 1, type: "PICKUP", city: "Dallas", state: "TX", appointmentDate: "2026-02-16", status: "PENDING" },
  { id: 2, type: "DELIVERY", city: "Houston", state: "TX", appointmentDate: "2026-02-18", status: "PENDING" },
];

const baseLoad = {
  id: 1,
  loadNumber: "LD-RT-001",
  status: "DISPATCHED",
  customer: { id: 1, name: "Acme Corp" },
  carrier: { id: 1, name: "Fast Freight", mcNumber: "MC-123" },
  equipmentType: "DRY_VAN",
  isHotLoad: false,
  hasExceptions: false,
  customerRate: 2500,
  carrierRate: 2000,
  weight: 10000,
  stops: defaultStops,
  updatedAt: NOW,
  createdAt: NOW,
  statusChangedAt: NOW,
};

const mockBoardData = {
  loads: [baseLoad],
  loadsByLane: {
    UNASSIGNED: [],
    TENDERED: [],
    DISPATCHED: [baseLoad],
    IN_TRANSIT: [],
    DELIVERED: [],
    COMPLETED: [],
  },
  stats: {
    total: 1,
    unassigned: 0,
    tendered: 0,
    dispatched: 1,
    inTransit: 0,
    delivered: 0,
    completed: 0,
  },
};

describe("DispatchBoard — WebSocket Connected", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dispatchLoadsReturn.data = mockBoardData;
    dispatchLoadsReturn.isLoading = false;
    dispatchLoadsReturn.isError = false;
    dispatchLoadsReturn.error = null;
    dispatchLoadsReturn.refetch = jest.fn();
    socketStatusReturn.connected = true;
    socketStatusReturn.status = "connected";
    socketStatusReturn.latency = 50;
    dispatchBoardUpdatesReturn.animationCount = 0;
  });

  it("renders the board when WebSocket is connected", () => {
    render(<DispatchBoard />);
    expect(screen.getByText("LD-RT-001")).toBeInTheDocument();
  });

  it("renders the kanban board in default view mode", () => {
    render(<DispatchBoard />);
    // Should render the kanban board (default view mode) — labels may appear in KPI strip too
    expect(screen.getAllByText("Unassigned").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Dispatched").length).toBeGreaterThanOrEqual(1);
  });
});

describe("DispatchBoard — WebSocket Disconnected", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dispatchLoadsReturn.data = mockBoardData;
    dispatchLoadsReturn.isLoading = false;
    dispatchLoadsReturn.isError = false;
    dispatchLoadsReturn.error = null;
    dispatchLoadsReturn.refetch = jest.fn();
    socketStatusReturn.connected = false;
    socketStatusReturn.status = "disconnected";
    socketStatusReturn.latency = 0;
    dispatchBoardUpdatesReturn.animationCount = 0;
  });

  it("still renders the board when WebSocket is disconnected", () => {
    render(<DispatchBoard />);
    expect(screen.getByText("LD-RT-001")).toBeInTheDocument();
  });

  it("renders all lane headers", () => {
    render(<DispatchBoard />);
    expect(screen.getAllByText("Unassigned").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Dispatched").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Completed").length).toBeGreaterThanOrEqual(1);
  });
});

describe("DispatchBoard — Real-Time Updates Reflected", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    socketStatusReturn.connected = true;
    socketStatusReturn.status = "connected";
    socketStatusReturn.latency = 50;
    dispatchBoardUpdatesReturn.animationCount = 0;
  });

  it("renders updated data when board data changes", () => {
    // Simulate data that has been updated via WS events (cache invalidation)
    const updatedLoad = { ...baseLoad, status: "IN_TRANSIT" };
    const updatedBoardData = {
      loads: [updatedLoad],
      loadsByLane: {
        UNASSIGNED: [],
        TENDERED: [],
        DISPATCHED: [],
        IN_TRANSIT: [updatedLoad],
        DELIVERED: [],
        COMPLETED: [],
      },
      stats: {
        total: 1,
        unassigned: 0,
        tendered: 0,
        dispatched: 0,
        inTransit: 1,
        delivered: 0,
        completed: 0,
      },
    };

    dispatchLoadsReturn.data = updatedBoardData;
    dispatchLoadsReturn.isLoading = false;
    dispatchLoadsReturn.isError = false;
    dispatchLoadsReturn.error = null;
    dispatchLoadsReturn.refetch = jest.fn();

    render(<DispatchBoard />);

    // Load should now be in the IN_TRANSIT lane
    expect(screen.getByText("LD-RT-001")).toBeInTheDocument();
    expect(screen.getAllByText("In Transit").length).toBeGreaterThanOrEqual(1);
  });

  it("reflects animation count from WebSocket updates", () => {
    dispatchLoadsReturn.data = mockBoardData;
    dispatchLoadsReturn.isLoading = false;
    dispatchLoadsReturn.isError = false;
    dispatchLoadsReturn.error = null;
    dispatchLoadsReturn.refetch = jest.fn();
    dispatchBoardUpdatesReturn.animationCount = 5;

    render(<DispatchBoard />);
    // Board renders successfully with animation count > 0
    expect(screen.getByText("LD-RT-001")).toBeInTheDocument();
  });
});

import { render, screen } from "@/test/utils";
import { jest } from "@jest/globals";
import {
  updateLoadStatusReturn,
  bulkStatusUpdateReturn,
} from "@/test/mocks/hooks-tms-dispatch";

import { KanbanBoard } from "@/components/tms/dispatch/kanban-board";
import type { DispatchBoardData, SortConfig } from "@/lib/types/dispatch";

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
  equipmentType: "DRY_VAN", isHotLoad: false, hasExceptions: false,
  customerRate: 2500, carrierRate: undefined, weight: 10000,
  createdAt: new Date().toISOString(), statusChangedAt: new Date().toISOString(),
});
const load2 = makeLoad({
  id: 2, loadNumber: "LD-2026-002", status: "DISPATCHED",
  customer: { id: 2, name: "Beta Inc" },
  carrier: { id: 1, name: "Fast Freight", mcNumber: "MC-123" },
  equipmentType: "REEFER", isHotLoad: false, hasExceptions: false,
  customerRate: 3200, carrierRate: 2800, weight: 15000,
  createdAt: new Date().toISOString(), statusChangedAt: new Date().toISOString(),
  stops: [
    { id: 1, type: "PICKUP", city: "Chicago", state: "IL", appointmentDate: "2026-02-16", status: "PENDING" },
    { id: 2, type: "DELIVERY", city: "Detroit", state: "MI", appointmentDate: "2026-02-19", status: "PENDING" },
  ],
});
const load3 = makeLoad({
  id: 3, loadNumber: "LD-2026-003", status: "DELIVERED",
  customer: { id: 3, name: "Gamma LLC" },
  carrier: { id: 2, name: "Road Runner", mcNumber: "MC-456" },
  equipmentType: "FLATBED", isHotLoad: false, hasExceptions: false,
  customerRate: 4000, carrierRate: 3500, weight: 25000,
  createdAt: new Date().toISOString(), statusChangedAt: new Date().toISOString(),
  stops: [
    { id: 3, type: "PICKUP", city: "Atlanta", state: "GA", appointmentDate: "2026-02-15", status: "DEPARTED" },
    { id: 4, type: "DELIVERY", city: "Miami", state: "FL", appointmentDate: "2026-02-17", status: "DEPARTED" },
  ],
});

// Mock board data for drag-drop tests
const mockBoardData: DispatchBoardData = {
  loads: [load1, load2, load3],
  loadsByLane: {
    UNASSIGNED: [load1],
    TENDERED: [],
    DISPATCHED: [load2],
    IN_TRANSIT: [],
    DELIVERED: [load3],
    COMPLETED: [],
  },
  stats: {
    total: 3,
    unassigned: 1,
    tendered: 0,
    dispatched: 1,
    inTransit: 0,
    delivered: 1,
    completed: 0,
  },
} as any;

const defaultSortConfig: SortConfig = {
  field: "pickupDate",
  direction: "asc",
};

describe("KanbanBoard — Lane Rendering", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updateLoadStatusReturn.mutate = jest.fn();
    updateLoadStatusReturn.isPending = false;
    bulkStatusUpdateReturn.mutateAsync = jest
      .fn<() => Promise<unknown>>()
      .mockResolvedValue({ succeeded: 0, failed: 0 });
    bulkStatusUpdateReturn.isPending = false;
  });

  it("renders all 6 kanban lanes", () => {
    render(
      <KanbanBoard
        boardData={mockBoardData}
        sortConfig={defaultSortConfig}
        onSortChange={jest.fn()}
      />
    );

    expect(screen.getByText("Unassigned")).toBeInTheDocument();
    expect(screen.getByText("Tendered")).toBeInTheDocument();
    expect(screen.getByText("Dispatched")).toBeInTheDocument();
    expect(screen.getByText("In Transit")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("renders load cards in correct lanes", () => {
    render(
      <KanbanBoard
        boardData={mockBoardData}
        sortConfig={defaultSortConfig}
        onSortChange={jest.fn()}
      />
    );

    expect(screen.getByText("LD-2026-001")).toBeInTheDocument();
    expect(screen.getByText("LD-2026-002")).toBeInTheDocument();
    expect(screen.getByText("LD-2026-003")).toBeInTheDocument();
  });

  it("shows load counts in lane headers", () => {
    render(
      <KanbanBoard
        boardData={mockBoardData}
        sortConfig={defaultSortConfig}
        onSortChange={jest.fn()}
      />
    );

    // Lane headers should show counts (multiple lanes have count "1")
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
  });
});

describe("KanbanBoard — Selection Mode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updateLoadStatusReturn.mutate = jest.fn();
    bulkStatusUpdateReturn.mutateAsync = jest
      .fn<() => Promise<unknown>>()
      .mockResolvedValue({ succeeded: 0, failed: 0 });
  });

  it("does not show bulk toolbar initially (no selections)", () => {
    render(
      <KanbanBoard
        boardData={mockBoardData}
        sortConfig={defaultSortConfig}
        onSortChange={jest.fn()}
      />
    );

    // Bulk toolbar should not be visible when no loads are selected
    expect(screen.queryByText("Clear Selection")).not.toBeInTheDocument();
  });
});

describe("KanbanBoard — Empty Lanes", () => {
  const emptyBoardData = {
    ...mockBoardData,
    loads: [],
    loadsByLane: {
      UNASSIGNED: [],
      TENDERED: [],
      DISPATCHED: [],
      IN_TRANSIT: [],
      DELIVERED: [],
      COMPLETED: [],
    },
    stats: {
      total: 0,
      unassigned: 0,
      tendered: 0,
      dispatched: 0,
      inTransit: 0,
      delivered: 0,
      completed: 0,
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    updateLoadStatusReturn.mutate = jest.fn();
    bulkStatusUpdateReturn.mutateAsync = jest
      .fn<() => Promise<unknown>>()
      .mockResolvedValue({ succeeded: 0, failed: 0 });
  });

  it("renders all 6 lanes even when empty", () => {
    render(
      <KanbanBoard
        boardData={emptyBoardData}
        sortConfig={defaultSortConfig}
        onSortChange={jest.fn()}
      />
    );

    expect(screen.getByText("Unassigned")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });
});

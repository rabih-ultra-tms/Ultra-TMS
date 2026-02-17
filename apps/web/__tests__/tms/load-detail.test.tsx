import { render, screen } from "@/test/utils";
import { jest } from "@jest/globals";
import {
  loadReturn,
} from "@/test/mocks/hooks-tms-loads";

import { LoadDetailClient } from "@/app/(dashboard)/operations/loads/[id]/client-page";

// Mock data
const mockLoad = {
  id: "ld-1",
  loadNumber: "LD-2026-001",
  status: "DISPATCHED",
  carrierId: "car-1",
  driverName: "Mike Johnson",
  driverPhone: "555-111-2222",
  truckNumber: "TRK-100",
  trailerNumber: "TRL-200",
  carrierRate: 1800,
  equipmentType: "DRY_VAN",
  originCity: "Dallas",
  originState: "TX",
  destinationCity: "Houston",
  destinationState: "TX",
  pickupDate: "2026-02-15T08:00:00Z",
  deliveryDate: "2026-02-15T18:00:00Z",
  weight: 42000,
  miles: 240,
  commodity: "Electronics",
  orderId: "ord-1",
  tenantId: "t1",
  order: {
    id: "ord-1",
    orderNumber: "ORD-2026-001",
    customer: { id: "cust-1", name: "Acme Corp" },
  },
  carrier: {
    id: "car-1",
    legalName: "Swift Transport LLC",
    mcNumber: "MC123456",
  },
  stops: [
    {
      id: "s1",
      orderId: "ord-1",
      stopType: "PICKUP",
      stopSequence: 0,
      facilityName: "Warehouse A",
      address: "123 Main St",
      city: "Dallas",
      state: "TX",
      zip: "75201",
      status: "PENDING",
    },
    {
      id: "s2",
      orderId: "ord-1",
      stopType: "DELIVERY",
      stopSequence: 1,
      facilityName: "Distribution Center",
      address: "456 Oak Ave",
      city: "Houston",
      state: "TX",
      zip: "77001",
      status: "PENDING",
    },
  ],
  createdAt: "2026-02-10T08:00:00Z",
  updatedAt: "2026-02-15T10:00:00Z",
};

describe("LoadDetailClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadReturn.data = mockLoad;
    loadReturn.isLoading = false;
    loadReturn.error = null;
    loadReturn.refetch = jest.fn();
  });

  it("renders the load number", () => {
    render(<LoadDetailClient id="ld-1" />);
    // Load number appears in both breadcrumb and title
    const elements = screen.getAllByText(/LD-2026-001/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders all tab triggers", () => {
    render(<LoadDetailClient id="ld-1" />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBe(5); // Route & Stops, Carrier & Rate, Documents, Timeline, Check Calls
  });
});

describe("LoadDetailClient — Loading State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadReturn.data = undefined;
    loadReturn.isLoading = true;
    loadReturn.error = null;
    loadReturn.refetch = jest.fn();
  });

  it("shows loading skeleton", () => {
    render(<LoadDetailClient id="ld-1" />);
    // Should not show load data when loading
    expect(screen.queryByText(/LD-2026-001/)).not.toBeInTheDocument();
  });
});

describe("LoadDetailClient — Error State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadReturn.data = undefined;
    loadReturn.isLoading = false;
    loadReturn.error = new Error("Load not found");
    loadReturn.refetch = jest.fn();
  });

  it("shows error state", () => {
    render(<LoadDetailClient id="ld-999" />);
    expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<LoadDetailClient id="ld-999" />);
    expect(screen.getByText("Load not found")).toBeInTheDocument();
  });
});

describe("LoadDetailClient — Not Found State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadReturn.data = null;
    loadReturn.isLoading = false;
    loadReturn.error = null;
    loadReturn.refetch = jest.fn();
  });

  it("shows not found message", () => {
    render(<LoadDetailClient id="ld-missing" />);
    expect(screen.getByText("Load not found")).toBeInTheDocument();
  });
});

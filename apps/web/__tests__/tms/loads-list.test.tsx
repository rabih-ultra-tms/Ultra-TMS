import { render, screen, waitFor } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import {
  loadsReturn,
  loadStatsReturn,
} from "@/test/mocks/hooks-tms-loads";

import LoadsListPage from "@/app/(dashboard)/operations/loads/page";

// Mock data
const mockLoadsData = {
  data: [
    {
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
      createdAt: "2026-02-10T08:00:00Z",
      updatedAt: "2026-02-15T10:00:00Z",
    },
    {
      id: "ld-2",
      loadNumber: "LD-2026-002",
      status: "PENDING",
      equipmentType: "REEFER",
      originCity: "Chicago",
      originState: "IL",
      destinationCity: "Detroit",
      destinationState: "MI",
      pickupDate: "2026-02-16T06:00:00Z",
      deliveryDate: "2026-02-16T14:00:00Z",
      weight: 35000,
      miles: 280,
      commodity: "Frozen Food",
      order: {
        id: "ord-2",
        orderNumber: "ORD-2026-002",
        customer: { id: "cust-2", name: "FoodMart Inc" },
      },
      createdAt: "2026-02-11T09:00:00Z",
      updatedAt: "2026-02-11T09:00:00Z",
    },
  ],
  total: 2,
  page: 1,
  limit: 20,
};

const mockStats = {
  total: 847,
  unassigned: 23,
  inTransit: 234,
  deliveredToday: 56,
  avgMargin: 18.4,
  totalActive: 120,
};

describe("LoadsListPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadsReturn.data = mockLoadsData;
    loadsReturn.isLoading = false;
    loadsReturn.error = null;
    loadsReturn.refetch = jest.fn();
    loadStatsReturn.data = mockStats;
    loadStatsReturn.isLoading = false;
  });

  it("renders the page title", () => {
    render(<LoadsListPage />);
    expect(screen.getByText("Dispatch Board")).toBeInTheDocument();
  });

  it("renders New Load buttons", () => {
    render(<LoadsListPage />);
    const newLoadButtons = screen.getAllByText(/New Load/);
    expect(newLoadButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("has a New Load link to create page", () => {
    render(<LoadsListPage />);
    // The header New Load button is wrapped in a Link
    const links = screen.getAllByRole("link", { name: /New Load/ });
    expect(links[0]).toHaveAttribute("href", "/operations/loads/new");
  });
});

describe("LoadsListPage — Loading State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadsReturn.data = undefined;
    loadsReturn.isLoading = true;
    loadsReturn.error = null;
    loadsReturn.refetch = jest.fn();
    loadStatsReturn.data = undefined;
    loadStatsReturn.isLoading = true;
  });

  it("renders page title during loading", () => {
    render(<LoadsListPage />);
    expect(screen.getByText("Dispatch Board")).toBeInTheDocument();
  });
});

describe("LoadsListPage — Empty State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadsReturn.data = { data: [], total: 0, page: 1, limit: 20 };
    loadsReturn.isLoading = false;
    loadsReturn.error = null;
    loadsReturn.refetch = jest.fn();
    loadStatsReturn.data = mockStats;
    loadStatsReturn.isLoading = false;
  });

  it("renders page without crashing on empty data", () => {
    render(<LoadsListPage />);
    expect(screen.getByText("Dispatch Board")).toBeInTheDocument();
  });
});

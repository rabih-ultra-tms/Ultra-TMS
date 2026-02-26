import { render, screen } from "@/test/utils";
import { jest } from "@jest/globals";
import {
  orderReturn,
} from "@/test/mocks/hooks-tms-orders";

import OrderDetailPage from "@/app/(dashboard)/operations/orders/[id]/page";

// Mock order detail data
const mockOrder = {
  id: "ord-1",
  orderNumber: "ORD-2026-001",
  customerId: "cust-1",
  customerReference: "PO-12345",
  status: "BOOKED",
  stops: [
    {
      id: "s1",
      tenantId: "t1",
      stopType: "PICKUP",
      stopSequence: 0,
      facilityName: "Warehouse A",
      addressLine1: "123 Main St",
      city: "Dallas",
      state: "TX",
      postalCode: "75201",
      country: "US",
      appointmentRequired: false,
      status: "PENDING",
      createdAt: "2026-02-10T08:00:00Z",
      updatedAt: "2026-02-10T08:00:00Z",
    },
    {
      id: "s2",
      tenantId: "t1",
      stopType: "DELIVERY",
      stopSequence: 1,
      facilityName: "Distribution Center",
      addressLine1: "456 Oak Ave",
      city: "Houston",
      state: "TX",
      postalCode: "77001",
      country: "US",
      appointmentRequired: false,
      status: "PENDING",
      createdAt: "2026-02-10T08:00:00Z",
      updatedAt: "2026-02-10T08:00:00Z",
    },
  ],
  loads: [{ id: "l1", loadNumber: "LD-001", status: "DISPATCHED" }],
  items: [{ id: "i1", description: "Electronics", quantity: 50, weightLbs: 5000 }],
  customer: {
    id: "cust-1",
    name: "Acme Corp",
    contactName: "John Doe",
    contactEmail: "john@acme.com",
    contactPhone: "555-123-4567",
  },
  customerRate: 2500,
  totalCharges: 2750,
  commodity: "Electronics",
  weightLbs: 5000,
  equipmentType: "DRY_VAN",
  createdAt: "2026-02-10T08:00:00Z",
  updatedAt: "2026-02-10T10:00:00Z",
};

describe("OrderDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    orderReturn.data = mockOrder;
    orderReturn.isLoading = false;
    orderReturn.error = null;
    orderReturn.refetch = jest.fn();
  });

  it("renders the order number as title", () => {
    render(<OrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    expect(screen.getByRole("heading", { name: /ORD-2026-001/ })).toBeInTheDocument();
  });

  it("renders the status badge", () => {
    render(<OrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    const badges = screen.getAllByText("Booked");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the customer reference", () => {
    render(<OrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    const refs = screen.getAllByText(/PO-12345/);
    expect(refs.length).toBeGreaterThanOrEqual(1);
  });

  it("renders breadcrumb with order number", () => {
    render(<OrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    const elements = screen.getAllByText(/ORD-2026-001/);
    expect(elements.length).toBeGreaterThanOrEqual(2); // breadcrumb + title
  });

  it("renders the Edit Order button", () => {
    render(<OrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    expect(screen.getByText("Edit Order")).toBeInTheDocument();
  });

  it("Edit Order button links to edit page", () => {
    render(<OrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    const link = screen.getByText("Edit Order").closest("a");
    expect(link).toHaveAttribute("href", "/operations/orders/ord-1/edit");
  });

  it("renders all tab triggers", () => {
    render(<OrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBe(6); // Overview, Stops, Loads, Items, Documents, Timeline
  });

  it("renders stops count in tab label", () => {
    render(<OrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    expect(screen.getByText("Stops (2)")).toBeInTheDocument();
  });

  it("renders loads count in tab label", () => {
    render(<OrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    expect(screen.getByText("Loads (1)")).toBeInTheDocument();
  });

  it("renders items count in tab label", () => {
    render(<OrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    expect(screen.getByText("Items (1)")).toBeInTheDocument();
  });

  it("renders back link to orders list", () => {
    render(<OrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    const backLink = screen.getByText("Back to Orders");
    expect(backLink.closest("a")).toHaveAttribute("href", "/operations/orders");
  });
});

describe("OrderDetailPage — Loading State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    orderReturn.data = undefined;
    orderReturn.isLoading = true;
    orderReturn.error = null;
    orderReturn.refetch = jest.fn();
  });

  it("shows loading state", () => {
    render(<OrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    // DetailPage pattern shows loading skeleton
    expect(screen.queryByText("ORD-2026-001")).not.toBeInTheDocument();
  });
});

describe("OrderDetailPage — Error State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    orderReturn.data = undefined;
    orderReturn.isLoading = false;
    orderReturn.error = new Error("Order not found");
    orderReturn.refetch = jest.fn();
  });

  it("shows error state when fetch fails", () => {
    render(<OrderDetailPage params={Promise.resolve({ id: "ord-999" })} />);
    expect(screen.getByText("Failed to load details")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<OrderDetailPage params={Promise.resolve({ id: "ord-999" })} />);
    expect(screen.getByText("Order not found")).toBeInTheDocument();
  });
});

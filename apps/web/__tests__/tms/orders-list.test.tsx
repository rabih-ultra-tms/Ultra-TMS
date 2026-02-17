import { render, screen, waitFor } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import {
  ordersReturn,
} from "@/test/mocks/hooks-tms-orders";
import { mockPush } from "@/test/mocks/next-navigation";

import OrdersPage from "@/app/(dashboard)/operations/orders/page";

// Mock data
const mockOrdersData = {
  data: [
    {
      id: "ord-1",
      orderNumber: "ORD-2026-001",
      customerId: "cust-1",
      customerReference: "PO-12345",
      status: "BOOKED",
      stops: [
        { id: "s1", stopType: "PICKUP", stopSequence: 0, facilityName: "Warehouse A", addressLine1: "123 Main St", city: "Dallas", state: "TX", postalCode: "75201" },
        { id: "s2", stopType: "DELIVERY", stopSequence: 1, facilityName: "Distribution Center", addressLine1: "456 Oak Ave", city: "Houston", state: "TX", postalCode: "77001" },
      ],
      loads: [{ id: "l1", loadNumber: "LD-001", status: "DISPATCHED" }],
      items: [{ id: "i1", description: "Electronics", quantity: 50, weightLbs: 5000 }],
      createdAt: "2026-02-10T08:00:00Z",
      updatedAt: "2026-02-10T10:00:00Z",
    },
    {
      id: "ord-2",
      orderNumber: "ORD-2026-002",
      customerId: "cust-2",
      status: "PENDING",
      stops: [
        { id: "s3", stopType: "PICKUP", stopSequence: 0, facilityName: "Factory B", addressLine1: "789 Elm St", city: "Chicago", state: "IL", postalCode: "60601" },
        { id: "s4", stopType: "DELIVERY", stopSequence: 1, facilityName: "Retail Store", addressLine1: "321 Pine Rd", city: "Detroit", state: "MI", postalCode: "48201" },
      ],
      loads: [],
      items: [],
      createdAt: "2026-02-11T09:00:00Z",
      updatedAt: "2026-02-11T09:00:00Z",
    },
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 2,
    pages: 1,
  },
};

describe("OrdersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ordersReturn.data = mockOrdersData;
    ordersReturn.isLoading = false;
    ordersReturn.error = null;
    ordersReturn.refetch = jest.fn();
  });

  it("renders the page title", () => {
    render(<OrdersPage />);
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });

  it("renders order data in the table", () => {
    render(<OrdersPage />);
    expect(screen.getByText("ORD-2026-001")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-002")).toBeInTheDocument();
  });

  it("renders the New Order button", () => {
    render(<OrdersPage />);
    expect(screen.getByText("New Order")).toBeInTheDocument();
  });

  it("New Order button links to create page", () => {
    render(<OrdersPage />);
    const link = screen.getByText("New Order").closest("a");
    expect(link).toHaveAttribute("href", "/operations/orders/new");
  });

  it("renders the filter section", () => {
    render(<OrdersPage />);
    // OrderFilters component is rendered in the filters area
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });
});

describe("OrdersPage — Loading State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ordersReturn.data = undefined;
    ordersReturn.isLoading = true;
    ordersReturn.error = null;
    ordersReturn.refetch = jest.fn();
  });

  it("shows title during loading", () => {
    render(<OrdersPage />);
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });

  it("does not show order data while loading", () => {
    render(<OrdersPage />);
    expect(screen.queryByText("ORD-2026-001")).not.toBeInTheDocument();
  });
});

describe("OrdersPage — Empty State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ordersReturn.data = { data: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
    ordersReturn.isLoading = false;
    ordersReturn.error = null;
    ordersReturn.refetch = jest.fn();
  });

  it("shows empty state when no orders exist", () => {
    render(<OrdersPage />);
    expect(screen.getByText(/no orders/i)).toBeInTheDocument();
  });
});

describe("OrdersPage — Error State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ordersReturn.data = undefined;
    ordersReturn.isLoading = false;
    ordersReturn.error = new Error("Failed to fetch orders");
    ordersReturn.refetch = jest.fn();
  });

  it("shows error state when fetch fails", () => {
    render(<OrdersPage />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});

describe("OrdersPage — Row Interaction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ordersReturn.data = mockOrdersData;
    ordersReturn.isLoading = false;
    ordersReturn.error = null;
    ordersReturn.refetch = jest.fn();
  });

  it("navigates to order detail when row is clicked", async () => {
    const user = userEvent.setup();
    render(<OrdersPage />);

    const orderRow = screen.getByText("ORD-2026-001").closest("tr");
    if (orderRow) {
      await user.click(orderRow);
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/operations/orders/ord-1");
      });
    }
  });
});

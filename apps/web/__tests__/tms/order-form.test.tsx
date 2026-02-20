import { render, screen, waitFor } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import {
  createOrderReturn,
  updateOrderReturn,
  orderFromQuoteReturn,
} from "@/test/mocks/hooks-tms-orders";
import { mockPush } from "@/test/mocks/next-navigation";

import { OrderForm } from "@/components/tms/orders/order-form";

describe("OrderForm — Create Mode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createOrderReturn.isPending = false;
    createOrderReturn.mutateAsync = jest
      .fn<() => Promise<unknown>>()
      .mockResolvedValue({ id: "o-new" });
    updateOrderReturn.isPending = false;
    orderFromQuoteReturn.data = undefined;
    orderFromQuoteReturn.isLoading = false;
  });

  it("renders the New Order header", () => {
    render(<OrderForm />);
    expect(screen.getByText("New Order")).toBeInTheDocument();
  });

  it("renders the 5-step stepper with Customer as first step", () => {
    render(<OrderForm />);
    expect(screen.getAllByText("Customer").length).toBeGreaterThanOrEqual(1);
  });

  it("renders Cancel button", () => {
    render(<OrderForm />);
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders Save Draft button", () => {
    render(<OrderForm />);
    expect(screen.getByText("Save Draft")).toBeInTheDocument();
  });

  it("renders Next button on first step", () => {
    render(<OrderForm />);
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("does not render Back button on first step", () => {
    render(<OrderForm />);
    expect(screen.queryByText("Back")).not.toBeInTheDocument();
  });

  it("Cancel without changes navigates to orders list", async () => {
    const user = userEvent.setup();
    render(<OrderForm />);

    await user.click(screen.getByText("Cancel"));
    expect(mockPush).toHaveBeenCalledWith("/operations/orders");
  });
});

describe("OrderForm — Edit Mode", () => {
  const initialData = {
    customerId: "cust-1",
    customerName: "Test Customer",
    equipmentType: "DRY_VAN" as const,
    commodity: "Electronics",
    weight: 10000,
    customerRate: 2500,
    poNumber: "PO-123",
    stops: [],
    fuelSurcharge: 0,
    accessorials: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    createOrderReturn.isPending = false;
    updateOrderReturn.isPending = false;
    updateOrderReturn.mutateAsync = jest
      .fn<() => Promise<unknown>>()
      .mockResolvedValue({});
    orderFromQuoteReturn.data = undefined;
    orderFromQuoteReturn.isLoading = false;
  });

  it("renders Edit Order header in edit mode", () => {
    render(
      <OrderForm
        mode="edit"
        orderId="ord-1"
        initialData={initialData}
        orderStatus="PENDING"
      />
    );
    expect(screen.getByText("Edit Order")).toBeInTheDocument();
  });

  it("renders Save Changes button instead of Save Draft", () => {
    render(
      <OrderForm
        mode="edit"
        orderId="ord-1"
        initialData={initialData}
        orderStatus="PENDING"
      />
    );
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("Cancel without changes navigates to order detail", async () => {
    const user = userEvent.setup();
    render(
      <OrderForm
        mode="edit"
        orderId="ord-1"
        initialData={initialData}
        orderStatus="PENDING"
      />
    );

    await user.click(screen.getByText("Cancel"));
    expect(mockPush).toHaveBeenCalledWith("/operations/orders/ord-1");
  });
});

describe("OrderForm — Step Navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createOrderReturn.isPending = false;
    updateOrderReturn.isPending = false;
    orderFromQuoteReturn.data = undefined;
    orderFromQuoteReturn.isLoading = false;
  });

  it("shows all 5 step labels in the stepper", () => {
    render(<OrderForm />);
    // Step labels may appear multiple times (stepper + form content),
    // so use getAllByText and check at least one exists
    expect(screen.getAllByText("Customer").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Cargo").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Stops").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Rate").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Review").length).toBeGreaterThanOrEqual(1);
  });
});

describe("OrderForm — Submission", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createOrderReturn.isPending = false;
    createOrderReturn.mutateAsync = jest
      .fn<() => Promise<unknown>>()
      .mockResolvedValue({ id: "o-new" });
    updateOrderReturn.isPending = false;
    orderFromQuoteReturn.data = undefined;
    orderFromQuoteReturn.isLoading = false;
  });

  it("disables Save Draft when create is pending", () => {
    createOrderReturn.isPending = true;
    render(<OrderForm />);

    const saveDraftButtons = screen.getAllByText("Save Draft");
    // The sticky footer Save Draft button should be disabled
    for (const btn of saveDraftButtons) {
      if (btn.closest("button")) {
        expect(btn.closest("button")).toBeDisabled();
      }
    }
  });
});

describe("OrderForm — Summary Panel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createOrderReturn.isPending = false;
    updateOrderReturn.isPending = false;
    orderFromQuoteReturn.data = undefined;
    orderFromQuoteReturn.isLoading = false;
  });

  it("renders the Order Summary panel", () => {
    render(<OrderForm />);
    expect(screen.getByText("Order Summary")).toBeInTheDocument();
  });

  it("shows Not selected for empty customer", () => {
    render(<OrderForm />);
    expect(screen.getByText("Not selected")).toBeInTheDocument();
  });
});

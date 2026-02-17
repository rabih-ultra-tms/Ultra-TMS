import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import {
  createLoadReturn,
  updateLoadReturn,
  carriersReturn,
  orderReturn,
} from "@/test/mocks/hooks-tms-loads";

import { LoadFormSections, type LoadFormValues } from "@/components/tms/loads/load-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loadFormSchema } from "@/components/tms/loads/load-form";
import * as React from "react";
import { Form } from "@/components/ui/form";

// Wrapper to provide react-hook-form context to LoadFormSections
function LoadFormWrapper({
  mode = "create",
  isFromOrder = false,
  customerRate,
  loadStatus,
  defaultValues,
}: {
  mode?: "create" | "edit";
  isFromOrder?: boolean;
  customerRate?: number;
  loadStatus?: string;
  defaultValues?: Partial<LoadFormValues>;
}) {
  const form = useForm<LoadFormValues>({
    resolver: zodResolver(loadFormSchema) as any,
    defaultValues: {
      equipmentType: "",
      stops: [
        {
          stopType: "PICKUP",
          stopSequence: 1,
          addressLine1: "",
          city: "",
          state: "",
          postalCode: "",
          country: "US",
          appointmentRequired: false,
        },
        {
          stopType: "DELIVERY",
          stopSequence: 2,
          addressLine1: "",
          city: "",
          state: "",
          postalCode: "",
          country: "US",
          appointmentRequired: false,
        },
      ],
      accessorials: [],
      isHazmat: false,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()}>
        <LoadFormSections
          form={form}
          mode={mode}
          isFromOrder={isFromOrder}
          customerRate={customerRate}
          loadStatus={loadStatus}
        />
      </form>
    </Form>
  );
}

describe("LoadFormSections — Equipment & Freight", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createLoadReturn.isPending = false;
    updateLoadReturn.isPending = false;
    carriersReturn.data = undefined;
    carriersReturn.isLoading = false;
  });

  it("renders the Equipment & Freight section", () => {
    render(<LoadFormWrapper />);
    expect(screen.getByText("Equipment & Freight")).toBeInTheDocument();
  });

  it("renders the Equipment Type select", () => {
    render(<LoadFormWrapper />);
    expect(screen.getByText("Equipment Type *")).toBeInTheDocument();
  });

  it("renders weight, pieces, and pallets inputs", () => {
    render(<LoadFormWrapper />);
    expect(screen.getByText("Weight (lbs)")).toBeInTheDocument();
    expect(screen.getByText("Pieces")).toBeInTheDocument();
    expect(screen.getByText("Pallets")).toBeInTheDocument();
  });

  it("renders hazmat toggle", () => {
    render(<LoadFormWrapper />);
    expect(screen.getByText("Hazardous Materials")).toBeInTheDocument();
  });

  it("shows from-order description when isFromOrder is true", () => {
    render(<LoadFormWrapper isFromOrder />);
    expect(screen.getByText("Pre-filled from order")).toBeInTheDocument();
  });
});

describe("LoadFormSections — Stops", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createLoadReturn.isPending = false;
    updateLoadReturn.isPending = false;
  });

  it("renders the Stops section", () => {
    render(<LoadFormWrapper />);
    expect(screen.getByText("Stops")).toBeInTheDocument();
  });

  it("renders default pickup and delivery stops", () => {
    render(<LoadFormWrapper />);
    expect(screen.getAllByText(/Pickup/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Delivery/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders Add Pickup Stop and Add Delivery Stop buttons", () => {
    render(<LoadFormWrapper />);
    expect(screen.getByText("Add Pickup Stop")).toBeInTheDocument();
    expect(screen.getByText("Add Delivery Stop")).toBeInTheDocument();
  });

  it("adds a new pickup stop when Add Pickup Stop is clicked", async () => {
    const user = userEvent.setup();
    render(<LoadFormWrapper />);

    const addPickupBtn = screen.getByText("Add Pickup Stop");
    await user.click(addPickupBtn);

    // Should now have two Pickup entries
    const pickupLabels = screen.getAllByText(/Pickup/);
    expect(pickupLabels.length).toBeGreaterThanOrEqual(2);
  });
});

describe("LoadFormSections — Carrier Assignment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createLoadReturn.isPending = false;
    updateLoadReturn.isPending = false;
    carriersReturn.data = undefined;
    carriersReturn.isLoading = false;
  });

  it("renders the Carrier Assignment section", () => {
    render(<LoadFormWrapper />);
    expect(screen.getByText("Carrier Assignment")).toBeInTheDocument();
  });

  it("renders Select Carrier button when no carrier is selected", () => {
    render(<LoadFormWrapper />);
    expect(screen.getByText("Select Carrier")).toBeInTheDocument();
  });

  it("shows locked message when carrier is read-only in edit mode after pickup", () => {
    render(<LoadFormWrapper mode="edit" loadStatus="PICKED_UP" />);
    expect(
      screen.getByText(/Carrier assignment is locked after pickup/)
    ).toBeInTheDocument();
  });
});

describe("LoadFormSections — Dispatch Notes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createLoadReturn.isPending = false;
    updateLoadReturn.isPending = false;
  });

  it("renders the Dispatch Notes section", () => {
    render(<LoadFormWrapper />);
    expect(screen.getByText("Dispatch Notes")).toBeInTheDocument();
  });

  it("renders the notes textarea", () => {
    render(<LoadFormWrapper />);
    expect(
      screen.getByPlaceholderText("Add any special instructions or notes...")
    ).toBeInTheDocument();
  });
});

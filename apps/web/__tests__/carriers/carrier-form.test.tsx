import { render, screen, waitFor } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import * as React from "react";

// next/navigation and hooks are auto-mocked via moduleNameMapper

import { CarrierForm } from "@/components/carriers/carrier-form";

const mockSubmitFn = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);

describe("CarrierForm — Create Mode", () => {
  const mockSubmit = mockSubmitFn as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the create form title", () => {
    render(<CarrierForm onSubmit={mockSubmit} />);
    expect(screen.getByText("Add New Carrier")).toBeInTheDocument();
  });

  it("renders the description for create mode", () => {
    render(<CarrierForm onSubmit={mockSubmit} />);
    expect(
      screen.getByText("Create a new carrier profile.")
    ).toBeInTheDocument();
  });

  it("renders Company Information section", () => {
    render(<CarrierForm onSubmit={mockSubmit} />);
    expect(screen.getByText("Company Information")).toBeInTheDocument();
  });

  it("renders all form sections", () => {
    render(<CarrierForm onSubmit={mockSubmit} />);
    expect(screen.getByText("Company Information")).toBeInTheDocument();
    expect(screen.getByText("Status & Notes")).toBeInTheDocument();
    expect(screen.getByText("Contact Info")).toBeInTheDocument();
  });

  it("renders form fields", () => {
    render(<CarrierForm onSubmit={mockSubmit} />);
    expect(screen.getByText("Company Name")).toBeInTheDocument();
    expect(screen.getByText("MC Number")).toBeInTheDocument();
    expect(screen.getByText("DOT Number")).toBeInTheDocument();
    expect(screen.getByText("Internal Notes")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
  });

  it("renders Create Carrier submit button (disabled when pristine)", () => {
    render(<CarrierForm onSubmit={mockSubmit} />);
    const submitBtn = screen.getByText("Create Carrier");
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn.closest("button")).toBeDisabled();
  });

  it("enables submit button after entering data", async () => {
    const user = userEvent.setup();
    render(<CarrierForm onSubmit={mockSubmit} />);

    const nameInput = screen.getByPlaceholderText("Acme Trucking LLC");
    await user.type(nameInput, "Test Carrier");

    await waitFor(() => {
      const submitBtn = screen.getByText("Create Carrier");
      expect(submitBtn.closest("button")).not.toBeDisabled();
    });
  });

  it("shows validation error for short company name", async () => {
    const user = userEvent.setup();
    render(<CarrierForm onSubmit={mockSubmit} />);

    const nameInput = screen.getByPlaceholderText("Acme Trucking LLC");
    await user.type(nameInput, "A");
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText("Company name must be at least 2 characters")
      ).toBeInTheDocument();
    });
  });

  it("submits valid form data", async () => {
    const user = userEvent.setup();
    render(<CarrierForm onSubmit={mockSubmit} />);

    await user.type(
      screen.getByPlaceholderText("Acme Trucking LLC"),
      "Test Carrier Co"
    );

    const submitBtn = screen.getByText("Create Carrier");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    // FormPage passes (data, event) — check the first argument
    const submittedData = mockSubmit.mock.calls[0][0];
    expect(submittedData).toEqual(
      expect.objectContaining({
        companyName: "Test Carrier Co",
        carrierType: "COMPANY",
        status: "ACTIVE",
      })
    );
  });

  it("does not submit when form is pristine", () => {
    render(<CarrierForm onSubmit={mockSubmit} />);
    const submitBtn = screen.getByText("Create Carrier");
    expect(submitBtn.closest("button")).toBeDisabled();
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});

describe("CarrierForm — Edit Mode", () => {
  const mockSubmit = jest.fn<() => Promise<void>>().mockResolvedValue(undefined) as any;

  const initialData = {
    companyName: "Existing Carrier",
    carrierType: "OWNER_OPERATOR" as const,
    status: "PREFERRED" as const,
    mcNumber: "MC999",
    dotNumber: "DOT888",
    email: "existing@carrier.com",
    phone: "555-999-0000",
    address: "123 Existing St",
    city: "Boston",
    state: "MA",
    zip: "02101",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders edit form title", () => {
    render(
      <CarrierForm
        initialData={initialData}
        carrierId="c1"
        onSubmit={mockSubmit}
      />
    );
    expect(screen.getByText("Edit Carrier")).toBeInTheDocument();
  });

  it("renders edit form description", () => {
    render(
      <CarrierForm
        initialData={initialData}
        carrierId="c1"
        onSubmit={mockSubmit}
      />
    );
    expect(
      screen.getByText("Update carrier details and settings.")
    ).toBeInTheDocument();
  });

  it("pre-fills the company name field", () => {
    render(
      <CarrierForm
        initialData={initialData}
        carrierId="c1"
        onSubmit={mockSubmit}
      />
    );
    expect(screen.getByDisplayValue("Existing Carrier")).toBeInTheDocument();
  });

  it("pre-fills MC and DOT numbers", () => {
    render(
      <CarrierForm
        initialData={initialData}
        carrierId="c1"
        onSubmit={mockSubmit}
      />
    );
    expect(screen.getByDisplayValue("MC999")).toBeInTheDocument();
    expect(screen.getByDisplayValue("DOT888")).toBeInTheDocument();
  });

  it("pre-fills contact info", () => {
    render(
      <CarrierForm
        initialData={initialData}
        carrierId="c1"
        onSubmit={mockSubmit}
      />
    );
    expect(
      screen.getByDisplayValue("existing@carrier.com")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("555-999-0000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("123 Existing St")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Boston")).toBeInTheDocument();
    expect(screen.getByDisplayValue("MA")).toBeInTheDocument();
    expect(screen.getByDisplayValue("02101")).toBeInTheDocument();
  });

  it("renders Save Changes as submit label", () => {
    render(
      <CarrierForm
        initialData={initialData}
        carrierId="c1"
        onSubmit={mockSubmit}
      />
    );
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("submits updated data after editing", async () => {
    const user = userEvent.setup();
    render(
      <CarrierForm
        initialData={initialData}
        carrierId="c1"
        onSubmit={mockSubmit}
      />
    );

    const nameInput = screen.getByDisplayValue("Existing Carrier");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Carrier Name");

    const submitBtn = screen.getByText("Save Changes");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    // FormPage passes (data, event) — check the first argument
    const submittedData = mockSubmit.mock.calls[0][0];
    expect(submittedData).toEqual(
      expect.objectContaining({
        companyName: "Updated Carrier Name",
      })
    );
  });
});

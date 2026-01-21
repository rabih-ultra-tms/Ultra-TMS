import { jest } from "@jest/globals";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { CustomerTable } from "./customer-table";
import type { Customer } from "@/lib/types/crm";

const mockCustomers: Customer[] = [
  {
    id: "1",
    code: "CUST001",
    name: "Acme Corp",
    status: "ACTIVE",
    email: "info@acme.com",
    phone: "555-1234",
    tags: [],
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
];

describe("CustomerTable", () => {
  const mockOnView = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("renders customer data correctly", () => {
    render(<CustomerTable customers={mockCustomers} onView={mockOnView} />);

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("CUST001")).toBeInTheDocument();
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  it("calls onView when row action is clicked", async () => {
    const user = userEvent.setup();
    render(<CustomerTable customers={mockCustomers} onView={mockOnView} />);

    await user.click(screen.getByRole("button", { name: /view/i }));
    expect(mockOnView).toHaveBeenCalledWith("1");
  });
});

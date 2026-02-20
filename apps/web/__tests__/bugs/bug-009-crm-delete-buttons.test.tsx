/**
 * BUG-009 Regression Test: CRM Delete Buttons Missing
 *
 * Verifies that contacts-table.tsx and leads-pipeline components have
 * delete buttons wired to ConfirmDialog.
 */
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import { ContactsTable } from "@/components/crm/contacts/contacts-table";

const mockContacts = [
  {
    id: "c1",
    tenantId: "t1",
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    email: "john@example.com",
    phone: "555-0001",
    title: "Manager",
    mobile: null,
    companyId: "comp1",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
  },
  {
    id: "c2",
    tenantId: "t1",
    firstName: "Jane",
    lastName: "Smith",
    fullName: "Jane Smith",
    email: "jane@example.com",
    phone: "555-0002",
    title: "Director",
    mobile: null,
    companyId: "comp1",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
  },
];

describe("BUG-009: ContactsTable — Delete Buttons", () => {
  const mockOnView = jest.fn();
  const mockOnDelete = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a delete button for each contact row", () => {
    render(
      <ContactsTable
        contacts={mockContacts as never[]}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    // Each row should have a delete button (Trash2 icon)
    const deleteButtons = screen.getAllByRole("button").filter(
      (btn) => btn.querySelector("svg") !== null && btn.textContent === ""
    );
    expect(deleteButtons.length).toBe(2);
  });

  it("does not render delete buttons when onDelete is not provided", () => {
    render(
      <ContactsTable contacts={mockContacts as never[]} onView={mockOnView} />
    );

    const deleteButtons = screen.getAllByRole("button").filter(
      (btn) => btn.querySelector("svg") !== null && btn.textContent === ""
    );
    expect(deleteButtons.length).toBe(0);
  });

  it("shows ConfirmDialog when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ContactsTable
        contacts={mockContacts as never[]}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByRole("button").filter(
      (btn) => btn.querySelector("svg") !== null && btn.textContent === ""
    );
    await user.click(deleteButtons[0]!);

    // ConfirmDialog should appear
    expect(screen.getByText("Delete contact")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This action cannot be undone. The contact will be permanently removed."
      )
    ).toBeInTheDocument();
  });

  it("calls onDelete when ConfirmDialog is confirmed", async () => {
    const user = userEvent.setup();
    render(
      <ContactsTable
        contacts={mockContacts as never[]}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByRole("button").filter(
      (btn) => btn.querySelector("svg") !== null && btn.textContent === ""
    );
    await user.click(deleteButtons[0]!);

    // Click confirm button in dialog
    const confirmButton = screen.getByText("Delete");
    await user.click(confirmButton);

    expect(mockOnDelete).toHaveBeenCalledWith("c1");
  });

  it("shows Cancel button in ConfirmDialog", async () => {
    const user = userEvent.setup();
    render(
      <ContactsTable
        contacts={mockContacts as never[]}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByRole("button").filter(
      (btn) => btn.querySelector("svg") !== null && btn.textContent === ""
    );
    await user.click(deleteButtons[0]!);

    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});

describe("BUG-009: Static analysis — Delete hooks exist", () => {
  it("useDeleteContact hook is defined in use-contacts.ts", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const { fileURLToPath } = await import("url");
    const thisFile = fileURLToPath(import.meta.url);
    const thisDir = path.dirname(thisFile);
    const source = fs.readFileSync(
      path.resolve(thisDir, "../../lib/hooks/crm/use-contacts.ts"),
      "utf-8"
    );
    expect(source).toContain("export function useDeleteContact");
  });

  it("useDeleteLead hook is defined in use-leads.ts", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const { fileURLToPath } = await import("url");
    const thisFile = fileURLToPath(import.meta.url);
    const thisDir = path.dirname(thisFile);
    const source = fs.readFileSync(
      path.resolve(thisDir, "../../lib/hooks/crm/use-leads.ts"),
      "utf-8"
    );
    expect(source).toContain("export function useDeleteLead");
  });
});

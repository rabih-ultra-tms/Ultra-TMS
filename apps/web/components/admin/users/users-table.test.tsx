import { jest } from "@jest/globals";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { UsersTable } from "./users-table";
import type { User } from "@/lib/types/auth";

const mockUsers: User[] = [
  {
    id: "1",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    status: "ACTIVE",
    emailVerified: true,
    mfaEnabled: true,
    tenantId: "tenant-1",
    roles: [
      {
        id: "role-1",
        name: "admin",
        displayName: "Admin",
        description: "Admin role",
        isSystem: true,
        permissions: [],
        createdAt: "",
        updatedAt: "",
      },
    ],
    permissions: [],
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
];

describe("UsersTable", () => {
  const mockOnView = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders user data correctly", () => {
    render(<UsersTable users={mockUsers} onView={mockOnView} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  it("shows MFA enabled indicator", () => {
    render(<UsersTable users={mockUsers} onView={mockOnView} />);

    expect(screen.getByLabelText(/mfa enabled/i)).toBeInTheDocument();
  });

  it("calls onView when view button is clicked", async () => {
    const user = userEvent.setup();
    render(<UsersTable users={mockUsers} onView={mockOnView} />);

    await user.click(screen.getByRole("button", { name: /view/i }));
    expect(mockOnView).toHaveBeenCalledWith("1");
  });
});

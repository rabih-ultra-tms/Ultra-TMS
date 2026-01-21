import { jest } from "@jest/globals";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { LeadsTable } from "./leads-table";
import type { Lead } from "@/lib/types/crm";

const mockLeads: Lead[] = [
  {
    id: "1",
    title: "New opportunity",
    stage: "NEW",
    probability: 20,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
];

describe("LeadsTable", () => {
  const mockOnView = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("renders lead data", () => {
    render(<LeadsTable leads={mockLeads} onView={mockOnView} />);

    expect(screen.getByText("New opportunity")).toBeInTheDocument();
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });

  it("calls onView when action is clicked", async () => {
    const user = userEvent.setup();
    render(<LeadsTable leads={mockLeads} onView={mockOnView} />);

    await user.click(screen.getByRole("button", { name: /view/i }));
    expect(mockOnView).toHaveBeenCalledWith("1");
  });
});

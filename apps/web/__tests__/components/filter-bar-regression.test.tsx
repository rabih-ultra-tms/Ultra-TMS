/**
 * COMP-004 Regression: FilterBar search + dynamic filters + filter count
 *
 * Phase 1 review found FilterBar was a simple container (3/8 criteria).
 * It was redesigned with: debounced search, dynamic filter definitions,
 * active filter count badge. These tests prevent regression.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import * as React from "react";
import { FilterBar, type FilterDefinition } from "@/components/tms/filters/filter-bar";

// Mock the useDebounce hook to avoid timer issues in tests
jest.mock("@/lib/hooks", () => ({
  useDebounce: (value: string) => value,
}));

const MOCK_FILTERS: FilterDefinition[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Inactive", value: "INACTIVE" },
    ],
  },
  {
    name: "state",
    label: "State",
    type: "text",
    placeholder: "Filter by state",
  },
  {
    name: "dateRange",
    label: "Date Range",
    type: "date-range",
    placeholder: "Select dates",
  },
];

describe("COMP-004 Regression: FilterBar search input", () => {
  it("renders a search input with placeholder", () => {
    render(<FilterBar searchPlaceholder="Search carriers..." />);
    expect(
      screen.getByPlaceholderText("Search carriers...")
    ).toBeInTheDocument();
  });

  it("renders default placeholder when none provided", () => {
    render(<FilterBar />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("calls onSearchChange when user types", async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();

    render(<FilterBar onSearchChange={onSearch} />);
    const input = screen.getByPlaceholderText("Search...");
    await user.type(input, "test");

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
    });
  });

  it("shows clear button when search has value", async () => {
    const user = userEvent.setup();
    render(<FilterBar />);

    const input = screen.getByPlaceholderText("Search...");
    await user.type(input, "hello");

    // X button should appear
    const clearBtn = input.parentElement?.querySelector("button");
    expect(clearBtn).toBeTruthy();
  });
});

describe("COMP-004 Regression: Dynamic filter definitions", () => {
  it("renders select filter with options", () => {
    render(<FilterBar filters={MOCK_FILTERS} />);
    // Select element should be rendered with options
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select).toBeInTheDocument();
  });

  it("renders text filter input", () => {
    render(<FilterBar filters={MOCK_FILTERS} />);
    expect(screen.getByPlaceholderText("Filter by state")).toBeInTheDocument();
  });

  it("renders date-range filter button", () => {
    render(<FilterBar filters={MOCK_FILTERS} />);
    expect(screen.getByText("Select dates")).toBeInTheDocument();
  });

  it("calls onFilterChange when select filter changes", async () => {
    const user = userEvent.setup();
    const onFilterChange = jest.fn();

    render(
      <FilterBar
        filters={MOCK_FILTERS}
        onFilterChange={onFilterChange}
      />
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    await user.selectOptions(select, "ACTIVE");

    expect(onFilterChange).toHaveBeenCalledWith("status", "ACTIVE");
  });
});

describe("COMP-004 Regression: Active filter count badge", () => {
  it("shows filter count badge when filters are active", () => {
    render(
      <FilterBar
        filters={MOCK_FILTERS}
        filterValues={{ status: "ACTIVE" }}
        onClear={() => {}}
      />
    );
    // Badge showing count "1"
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("shows Clear all button when filters are active", () => {
    render(
      <FilterBar
        filters={MOCK_FILTERS}
        filterValues={{ status: "ACTIVE" }}
        onClear={() => {}}
        hasActiveFilters={true}
      />
    );
    expect(screen.getByText("Clear all")).toBeInTheDocument();
  });

  it("calls onClear when Clear all is clicked", async () => {
    const user = userEvent.setup();
    const onClear = jest.fn();

    render(
      <FilterBar
        filters={MOCK_FILTERS}
        filterValues={{ status: "ACTIVE" }}
        onClear={onClear}
        hasActiveFilters={true}
      />
    );

    await user.click(screen.getByText("Clear all"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("still supports children for custom FilterChip usage", () => {
    render(
      <FilterBar>
        <span>Custom Chip</span>
      </FilterBar>
    );
    expect(screen.getByText("Custom Chip")).toBeInTheDocument();
  });
});

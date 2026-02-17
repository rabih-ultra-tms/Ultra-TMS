import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import * as React from "react";
import { FilterBar, FilterDivider } from "@/components/tms/filters/filter-bar";

describe("FilterBar", () => {
  it("renders children", () => {
    render(
      <FilterBar>
        <span>Filter Chip 1</span>
        <span>Filter Chip 2</span>
      </FilterBar>
    );
    expect(screen.getByText("Filter Chip 1")).toBeInTheDocument();
    expect(screen.getByText("Filter Chip 2")).toBeInTheDocument();
  });

  it("does not show clear button when hasActiveFilters is false", () => {
    render(
      <FilterBar onClear={() => {}} hasActiveFilters={false}>
        <span>Chip</span>
      </FilterBar>
    );
    expect(screen.queryByText("Clear all")).not.toBeInTheDocument();
  });

  it("does not show clear button when onClear is not provided", () => {
    render(
      <FilterBar hasActiveFilters={true}>
        <span>Chip</span>
      </FilterBar>
    );
    expect(screen.queryByText("Clear all")).not.toBeInTheDocument();
  });

  it("shows clear button when hasActiveFilters and onClear are provided", () => {
    render(
      <FilterBar onClear={() => {}} hasActiveFilters={true}>
        <span>Chip</span>
      </FilterBar>
    );
    expect(screen.getByText("Clear all")).toBeInTheDocument();
  });

  it("calls onClear when clear button is clicked", async () => {
    const user = userEvent.setup();
    const onClear = jest.fn();

    render(
      <FilterBar onClear={onClear} hasActiveFilters={true}>
        <span>Chip</span>
      </FilterBar>
    );

    await user.click(screen.getByText("Clear all"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("renders a separator divider before the clear button", () => {
    const { container } = render(
      <FilterBar onClear={() => {}} hasActiveFilters={true}>
        <span>Chip</span>
      </FilterBar>
    );
    const separators = container.querySelectorAll('[role="separator"]');
    expect(separators.length).toBeGreaterThanOrEqual(1);
  });

  it("merges custom className", () => {
    const { container } = render(
      <FilterBar className="custom-class">
        <span>Chip</span>
      </FilterBar>
    );
    expect(container.firstElementChild?.className).toContain("custom-class");
  });

  it("defaults hasActiveFilters to false", () => {
    render(
      <FilterBar onClear={() => {}}>
        <span>Chip</span>
      </FilterBar>
    );
    expect(screen.queryByText("Clear all")).not.toBeInTheDocument();
  });
});

describe("FilterDivider", () => {
  it("renders a separator role element", () => {
    render(<FilterDivider />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    render(<FilterDivider className="extra-class" />);
    const sep = screen.getByRole("separator");
    expect(sep.className).toContain("extra-class");
  });
});

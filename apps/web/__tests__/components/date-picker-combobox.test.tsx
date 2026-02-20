/**
 * COMP-008 Regression: DatePicker + Combobox must exist and render
 *
 * Phase 1 review found these shadcn compositions were missing.
 * They were created from existing primitives (Calendar+Popover, Command+Popover).
 * These tests ensure they render correctly and handle basic interactions.
 */
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";

// ---- DatePicker ----

describe("COMP-008 Regression: DatePicker", () => {
  it("renders with default placeholder", () => {
    render(<DatePicker />);
    expect(screen.getByText("Pick a date")).toBeInTheDocument();
  });

  it("renders with custom placeholder", () => {
    render(<DatePicker placeholder="Select start date" />);
    expect(screen.getByText("Select start date")).toBeInTheDocument();
  });

  it("renders formatted date when value is provided", () => {
    render(<DatePicker value={new Date(2026, 1, 15)} />);
    // Should show formatted date instead of placeholder
    expect(screen.queryByText("Pick a date")).not.toBeInTheDocument();
  });

  it("renders as disabled when disabled prop is true", () => {
    render(<DatePicker disabled />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("has a calendar icon", () => {
    const { container } = render(<DatePicker />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });
});

// ---- Combobox ----

const MOCK_OPTIONS: ComboboxOption[] = [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b" },
  { label: "Option C", value: "c" },
];

describe("COMP-008 Regression: Combobox", () => {
  it("renders with default placeholder", () => {
    render(<Combobox options={MOCK_OPTIONS} />);
    expect(screen.getByText("Select...")).toBeInTheDocument();
  });

  it("renders with custom placeholder", () => {
    render(<Combobox options={MOCK_OPTIONS} placeholder="Choose carrier..." />);
    expect(screen.getByText("Choose carrier...")).toBeInTheDocument();
  });

  it("shows selected option label when value is set", () => {
    render(<Combobox options={MOCK_OPTIONS} value="b" />);
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("renders as disabled when disabled prop is true", () => {
    render(<Combobox options={MOCK_OPTIONS} disabled />);
    const button = screen.getByRole("combobox");
    expect(button).toBeDisabled();
  });

  it("has combobox role with aria-expanded attribute", () => {
    render(<Combobox options={MOCK_OPTIONS} />);
    const button = screen.getByRole("combobox");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("renders ChevronsUpDown icon", () => {
    const { container } = render(<Combobox options={MOCK_OPTIONS} />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it("exports ComboboxOption type and accepts options prop", () => {
    // Type-level regression: ensure the component accepts the options shape
    const options: ComboboxOption[] = [
      { label: "Test", value: "test" },
    ];
    render(<Combobox options={options} />);
    expect(screen.getByText("Select...")).toBeInTheDocument();
  });
});

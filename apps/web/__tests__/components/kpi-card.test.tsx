import { render, screen } from "@testing-library/react";
import * as React from "react";
import { KpiCard } from "@/components/tms/stats/kpi-card";
import { Truck } from "lucide-react";

describe("KpiCard", () => {
  it("renders label and value", () => {
    render(<KpiCard label="Total Loads" value={42} />);
    expect(screen.getByText("Total Loads")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders string value", () => {
    render(<KpiCard label="Revenue" value="$12,345" />);
    expect(screen.getByText("$12,345")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const { container } = render(
      <KpiCard label="Carriers" value={10} icon={<Truck data-testid="truck-icon" />} />
    );
    expect(screen.getByTestId("truck-icon")).toBeInTheDocument();
  });

  it("does not render icon container when icon is not provided", () => {
    const { container } = render(<KpiCard label="Test" value={0} />);
    // The icon span should not exist
    const iconSpans = container.querySelectorAll(".text-text-muted");
    // Only the label span has text-text-muted
    expect(iconSpans.length).toBeLessThanOrEqual(1);
  });

  // ---- Trend ----

  it("renders up trend with label", () => {
    render(
      <KpiCard label="Revenue" value="$50K" trend="up" trendLabel="+12%" />
    );
    expect(screen.getByText("+12%")).toBeInTheDocument();
    // Trend indicator should have success color class
    const trendEl = screen.getByText("+12%").closest("span");
    expect(trendEl?.className).toContain("text-success");
  });

  it("renders down trend with label", () => {
    render(
      <KpiCard label="Costs" value="$30K" trend="down" trendLabel="-5%" />
    );
    expect(screen.getByText("-5%")).toBeInTheDocument();
    const trendEl = screen.getByText("-5%").closest("span");
    expect(trendEl?.className).toContain("text-danger");
  });

  it("does not render trend when only trend is provided without trendLabel", () => {
    render(<KpiCard label="Metric" value={100} trend="up" />);
    // No trend element should be rendered (requires both trend + trendLabel)
    const container = screen.getByText("100").closest("div");
    expect(container?.querySelectorAll("svg")).toHaveLength(0);
  });

  it("does not render trend when only trendLabel is provided without trend", () => {
    render(<KpiCard label="Metric" value={100} trendLabel="+5%" />);
    // trendLabel alone isn't rendered (requires trend prop too)
    expect(screen.queryByText("+5%")).not.toBeInTheDocument();
  });

  // ---- Subtext ----

  it("renders subtext when provided", () => {
    render(<KpiCard label="Loads" value={50} subtext="Last 30 days" />);
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
  });

  it("does not render subtext when not provided", () => {
    const { container } = render(<KpiCard label="Loads" value={50} />);
    // Should only have label + value, no subtext span
    const subtextSpans = container.querySelectorAll('[class*="text-[11px]"]');
    // Only label has text-[11px], no extra subtext
    expect(subtextSpans).toHaveLength(1); // Just the label
  });

  // ---- Custom className ----

  it("merges custom className", () => {
    const { container } = render(
      <KpiCard label="Test" value={0} className="my-class" />
    );
    expect(container.firstElementChild?.className).toContain("my-class");
  });

  // ---- HTML attributes ----

  it("passes through additional HTML attributes", () => {
    render(
      <KpiCard label="Test" value={0} data-testid="kpi-test" />
    );
    expect(screen.getByTestId("kpi-test")).toBeInTheDocument();
  });
});

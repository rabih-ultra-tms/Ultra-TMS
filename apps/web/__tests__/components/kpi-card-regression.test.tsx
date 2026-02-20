/**
 * COMP-003 Regression: KPICard loading state + neutral trend
 *
 * Phase 1 review found KPICard was missing:
 *   1. loading={true} skeleton state
 *   2. trend="neutral" with gray Minus icon
 *
 * These tests ensure both features remain functional.
 */
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { KpiCard } from "@/components/tms/stats/kpi-card";

describe("COMP-003 Regression: KPICard loading state", () => {
  it("renders skeleton elements when loading=true", () => {
    const { container } = render(
      <KpiCard label="Revenue" value="$50K" loading />
    );
    // Should render Skeleton components (shimmer divs), not actual content
    const skeletons = container.querySelectorAll('[class*="animate-pulse"], [data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("does NOT render label or value text when loading", () => {
    render(<KpiCard label="Revenue" value="$50K" loading />);
    expect(screen.queryByText("Revenue")).not.toBeInTheDocument();
    expect(screen.queryByText("$50K")).not.toBeInTheDocument();
  });

  it("renders actual content when loading=false", () => {
    render(<KpiCard label="Revenue" value="$50K" loading={false} />);
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("$50K")).toBeInTheDocument();
  });

  it("defaults loading to false", () => {
    render(<KpiCard label="Revenue" value="$50K" />);
    expect(screen.getByText("Revenue")).toBeInTheDocument();
  });
});

describe("COMP-003 Regression: KPICard neutral trend", () => {
  it("renders neutral trend with muted color", () => {
    render(
      <KpiCard label="Margin" value="15%" trend="neutral" trendLabel="0%" />
    );
    const trendEl = screen.getByText("0%").closest("span");
    expect(trendEl?.className).toContain("text-text-muted");
  });

  it("renders neutral trend with Minus icon (SVG present)", () => {
    const { container } = render(
      <KpiCard label="Margin" value="15%" trend="neutral" trendLabel="0%" />
    );
    // The Minus icon should be rendered as an SVG
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it("does NOT use success or danger color for neutral trend", () => {
    render(
      <KpiCard label="Margin" value="15%" trend="neutral" trendLabel="0%" />
    );
    const trendEl = screen.getByText("0%").closest("span");
    expect(trendEl?.className).not.toContain("text-success");
    expect(trendEl?.className).not.toContain("text-danger");
  });
});

import { render, screen } from "@testing-library/react";
import * as React from "react";
import { StatusBadge } from "@/components/tms/primitives/status-badge";

describe("StatusBadge", () => {
  // ---- Status variants ----

  it("renders children text", () => {
    render(<StatusBadge status="transit">In Transit</StatusBadge>);
    expect(screen.getByText("In Transit")).toBeInTheDocument();
  });

  it.each([
    "transit",
    "unassigned",
    "tendered",
    "dispatched",
    "delivered",
    "atrisk",
  ] as const)("renders status variant: %s", (status) => {
    render(<StatusBadge status={status}>{status}</StatusBadge>);
    const badge = screen.getByText(status);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain(`bg-status-${status}-bg`);
    expect(badge.className).toContain(`text-status-${status}`);
    expect(badge.className).toContain(`border-status-${status}-border`);
  });

  // ---- Intent variants ----

  it.each(["success", "warning", "danger", "info"] as const)(
    "renders intent variant: %s",
    (intent) => {
      render(<StatusBadge intent={intent}>{intent}</StatusBadge>);
      const badge = screen.getByText(intent);
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain(`bg-${intent}-bg`);
      expect(badge.className).toContain(`text-${intent}`);
      expect(badge.className).toContain(`border-${intent}-border`);
    }
  );

  // ---- Status overrides intent ----

  it("uses status classes when both status and intent are provided", () => {
    render(
      <StatusBadge status="transit" intent="danger">
        Mixed
      </StatusBadge>
    );
    const badge = screen.getByText("Mixed");
    expect(badge.className).toContain("bg-status-transit-bg");
    expect(badge.className).not.toContain("bg-danger-bg");
  });

  // ---- Size variants ----

  it.each([
    ["sm", "text-[10px]"],
    ["md", "text-[11px]"],
    ["lg", "text-xs"],
  ] as const)("renders size %s with correct class", (size, expectedClass) => {
    render(
      <StatusBadge status="transit" size={size}>
        {size}
      </StatusBadge>
    );
    expect(screen.getByText(size).className).toContain(expectedClass);
  });

  it("defaults to md size", () => {
    render(<StatusBadge status="transit">Default</StatusBadge>);
    expect(screen.getByText("Default").className).toContain("text-[11px]");
  });

  // ---- Dot ----

  it("does not render dot by default", () => {
    const { container } = render(
      <StatusBadge status="transit">No Dot</StatusBadge>
    );
    const dots = container.querySelectorAll(".rounded-full");
    expect(dots).toHaveLength(0);
  });

  it("renders dot when withDot is true", () => {
    const { container } = render(
      <StatusBadge status="transit" withDot>
        With Dot
      </StatusBadge>
    );
    const dots = container.querySelectorAll(".rounded-full");
    expect(dots).toHaveLength(1);
  });

  // ---- Custom className ----

  it("merges custom className", () => {
    render(
      <StatusBadge status="transit" className="my-custom-class">
        Custom
      </StatusBadge>
    );
    expect(screen.getByText("Custom").className).toContain("my-custom-class");
  });

  // ---- HTML attributes ----

  it("passes through additional HTML attributes", () => {
    render(
      <StatusBadge status="transit" data-testid="badge-test">
        Attrs
      </StatusBadge>
    );
    expect(screen.getByTestId("badge-test")).toBeInTheDocument();
  });
});

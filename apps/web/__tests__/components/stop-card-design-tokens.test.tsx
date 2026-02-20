/**
 * COMP-010 Regression: StopCard + StopList must use design tokens, not hardcoded colors
 *
 * Phase 2 review found stop-card.tsx and stop-list.tsx used hardcoded Tailwind
 * colors (green-500, blue-500, gray-400) instead of design token classes.
 * They were replaced with getStatusClasses() from the design token system.
 *
 * These tests ensure:
 *   1. StopCard renders with design token classes (bg-status-*, text-status-*)
 *   2. StopList renders with design token classes on timeline dots
 *   3. No hardcoded color classes (green-500, blue-500, gray-400) remain
 *   4. All three stop types (PICKUP, DELIVERY, STOP) map to correct token families
 */
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { StopCard, type StopData } from "@/components/tms/stop-card";
import { StopList } from "@/components/tms/stop-list";
import { getStatusClasses } from "@/lib/design-tokens";

// ---- Fixtures ----

const PICKUP_STOP: StopData = {
  id: "s1",
  type: "PICKUP",
  status: "PENDING",
  location: {
    name: "Warehouse A",
    address: "100 Main St",
    city: "Dallas",
    state: "TX",
    zip: "75201",
  },
  scheduledTime: "2026-03-01T08:00:00Z",
};

const DELIVERY_STOP: StopData = {
  id: "s2",
  type: "DELIVERY",
  status: "COMPLETED",
  location: {
    name: "Client HQ",
    address: "200 Oak Ave",
    city: "Houston",
    state: "TX",
    zip: "77001",
  },
  scheduledTime: "2026-03-02T14:00:00Z",
  actualTime: "2026-03-02T13:45:00Z",
};

const GENERIC_STOP: StopData = {
  id: "s3",
  type: "STOP",
  status: "ARRIVED",
  location: {
    address: "300 Pine Rd",
    city: "Austin",
    state: "TX",
    zip: "78701",
  },
  scheduledTime: "2026-03-01T12:00:00Z",
};

// ---- StopCard: Design token classes ----

describe("COMP-010 Regression: StopCard uses design tokens", () => {
  it("PICKUP type uses 'delivered' token classes (green family)", () => {
    const { container } = render(<StopCard stop={PICKUP_STOP} />);
    const card = container.firstChild as HTMLElement;
    const classes = getStatusClasses("delivered");
    // Border-left should use design token border class
    expect(card.className).toContain(classes.border);
  });

  it("DELIVERY type uses 'dispatched' token classes (blue family)", () => {
    const { container } = render(<StopCard stop={DELIVERY_STOP} />);
    const card = container.firstChild as HTMLElement;
    const classes = getStatusClasses("dispatched");
    expect(card.className).toContain(classes.border);
  });

  it("STOP type uses 'unassigned' token classes (gray family)", () => {
    const { container } = render(<StopCard stop={GENERIC_STOP} />);
    const card = container.firstChild as HTMLElement;
    const classes = getStatusClasses("unassigned");
    expect(card.className).toContain(classes.border);
  });

  it("type label badge uses design token text+bg classes", () => {
    const { container } = render(<StopCard stop={PICKUP_STOP} />);
    const deliveredClasses = getStatusClasses("delivered");
    const badge = container.querySelector("span.uppercase");
    expect(badge?.className).toContain(deliveredClasses.text);
    expect(badge?.className).toContain(deliveredClasses.bg);
  });

  it("does NOT contain hardcoded border-l-green-500", () => {
    const { container } = render(<StopCard stop={PICKUP_STOP} />);
    expect(container.innerHTML).not.toContain("border-l-green-500");
    expect(container.innerHTML).not.toContain("border-l-green");
  });

  it("does NOT contain hardcoded border-l-blue-500", () => {
    const { container } = render(<StopCard stop={DELIVERY_STOP} />);
    expect(container.innerHTML).not.toContain("border-l-blue-500");
    expect(container.innerHTML).not.toContain("border-l-blue");
  });

  it("does NOT contain hardcoded border-l-gray-400", () => {
    const { container } = render(<StopCard stop={GENERIC_STOP} />);
    expect(container.innerHTML).not.toContain("border-l-gray-400");
    expect(container.innerHTML).not.toContain("border-l-gray");
  });

  it("actual time uses design token class text-status-delivered", () => {
    const { container } = render(<StopCard stop={DELIVERY_STOP} />);
    // Find all elements with the design token class
    const elements = container.querySelectorAll(".text-status-delivered");
    // At least one should contain "Actual" (the actual time span)
    const actualSpan = Array.from(elements).find((el) =>
      el.textContent?.includes("Actual")
    );
    expect(actualSpan).toBeTruthy();
  });

  it("renders stop type labels correctly", () => {
    const { rerender } = render(<StopCard stop={PICKUP_STOP} />);
    expect(screen.getByText(/Pickup/)).toBeInTheDocument();

    rerender(<StopCard stop={DELIVERY_STOP} />);
    expect(screen.getByText(/Delivery/)).toBeInTheDocument();

    rerender(<StopCard stop={GENERIC_STOP} />);
    expect(screen.getByText(/Stop/)).toBeInTheDocument();
  });
});

// ---- StopList: Design token classes on timeline dots ----

describe("COMP-010 Regression: StopList uses design tokens", () => {
  const allStops = [PICKUP_STOP, DELIVERY_STOP, GENERIC_STOP];

  it("renders all stops in the list", () => {
    render(<StopList stops={allStops} />);
    expect(screen.getByText(/Pickup/)).toBeInTheDocument();
    expect(screen.getByText(/Delivery/)).toBeInTheDocument();
    expect(screen.getByText(/Stop/)).toBeInTheDocument();
  });

  it("completed stop dot uses primary color (not hardcoded green)", () => {
    const { container } = render(<StopList stops={[DELIVERY_STOP]} />);
    const dot = container.querySelector(".rounded-full");
    // Completed stop should use primary classes
    expect(dot?.className).toContain("bg-primary");
    expect(dot?.className).toContain("border-primary");
  });

  it("pending stop dot uses design token classes (not hardcoded colors)", () => {
    const { container } = render(<StopList stops={[PICKUP_STOP]} />);
    const dot = container.querySelector(".rounded-full");
    const deliveredClasses = getStatusClasses("delivered");
    // Non-completed PICKUP should use delivered token border/text
    expect(dot?.className).toContain(deliveredClasses.border);
    expect(dot?.className).toContain(deliveredClasses.text);
  });

  it("does NOT contain hardcoded green/blue/gray dot colors", () => {
    const { container } = render(<StopList stops={allStops} />);
    expect(container.innerHTML).not.toContain("bg-green-500");
    expect(container.innerHTML).not.toContain("bg-blue-500");
    expect(container.innerHTML).not.toContain("bg-gray-400");
  });

  it("completed stop shows check icon", () => {
    const { container } = render(<StopList stops={[DELIVERY_STOP]} />);
    const dot = container.querySelector(".rounded-full");
    // Check icon is an SVG inside the dot
    const svg = dot?.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("non-completed stop shows sequence number", () => {
    const { container } = render(<StopList stops={[PICKUP_STOP]} />);
    const dot = container.querySelector(".rounded-full");
    // Should show "1" as the sequence number
    expect(dot?.textContent).toBe("1");
  });
});

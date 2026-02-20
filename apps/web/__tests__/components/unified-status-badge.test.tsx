/**
 * COMP-002 Regression: Unified StatusBadge must support all 14 entity types
 *
 * Phase 1 review found no unified StatusBadge existed — Admin/CRM badges used
 * hardcoded colors. This test ensures the unified component resolves all entity
 * types and renders via the Primitives StatusBadge with design tokens.
 */
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { UnifiedStatusBadge, type StatusEntity } from "@/components/shared/status-badge";

describe("COMP-002: UnifiedStatusBadge", () => {
  // ---- All 14 entity types render without error ----

  const entityStatusPairs: Array<[StatusEntity, string, string]> = [
    ["user", "ACTIVE", "Active"],
    ["user", "INACTIVE", "Inactive"],
    ["customer", "ACTIVE", "Active"],
    ["customer", "PROSPECT", "Prospect"],
    ["lead", "QUALIFIED", "Qualified"],
    ["lead", "WON", "Won"],
    ["order", "confirmed", "Confirmed"],
    ["load", "transit", "In Transit"],
    ["load", "delivered", "Delivered"],
    ["carrier", "active", "Active"],
    ["carrier", "blacklisted", "Blacklisted"],
    ["document", "complete", "Complete"],
    ["document", "expired", "Expired"],
    ["insurance", "valid", "valid"],
    ["quote", "DRAFT", "Draft"],
    ["invoice", "PAID", "Paid"],
    ["payment", "COMPLETED", "COMPLETED"],
    ["payable", "PENDING", "Pending"],
    ["settlement", "PAID", "Paid"],
    ["priority", "high", "High"],
  ];

  it.each(entityStatusPairs)(
    "renders entity=%s status=%s → label=%s",
    (entity, status, expectedLabel) => {
      render(
        <UnifiedStatusBadge entity={entity} status={status} />
      );
      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    }
  );

  // ---- All 14 entity types are covered ----

  it("supports all 14 entity types", () => {
    const allEntities: StatusEntity[] = [
      "user", "customer", "lead", "order", "load", "carrier",
      "document", "insurance", "quote", "invoice", "payment",
      "payable", "settlement", "priority",
    ];

    for (const entity of allEntities) {
      const { unmount } = render(
        <UnifiedStatusBadge entity={entity} status="ACTIVE" />
      );
      // Should render without throwing
      unmount();
    }
  });

  // ---- Wraps TMS Primitives StatusBadge ----

  it("renders with design token classes (not hardcoded colors)", () => {
    render(<UnifiedStatusBadge entity="carrier" status="active" />);
    const badge = screen.getByText("Active");
    // Should use design token CSS class pattern, not hardcoded colors
    expect(badge.className).toMatch(/bg-status-|bg-\w+-bg/);
  });

  // ---- Size prop passed through ----

  it("passes size prop to underlying badge", () => {
    render(
      <UnifiedStatusBadge entity="load" status="transit" size="lg" />
    );
    const badge = screen.getByText("In Transit");
    expect(badge.className).toContain("text-xs"); // lg size class
  });

  // ---- WithDot prop ----

  it("renders dot when withDot is true", () => {
    const { container } = render(
      <UnifiedStatusBadge entity="user" status="ACTIVE" withDot />
    );
    const dots = container.querySelectorAll(".rounded-full");
    expect(dots).toHaveLength(1);
  });

  // ---- Unknown status falls back gracefully ----

  it("falls back to raw status string for unknown status values", () => {
    render(
      <UnifiedStatusBadge entity="carrier" status="UNKNOWN_STATUS" />
    );
    expect(screen.getByText("UNKNOWN_STATUS")).toBeInTheDocument();
  });
});

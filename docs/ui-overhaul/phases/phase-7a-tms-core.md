# Phase 7A: TMS Core Component Migration

**Priority:** HIGH — These components appear on the most-used operational pages.
**Estimated patterns:** ~312 hardcoded colors, ~18 shadows, ~20 raw HTML

## Pre-work
1. Read `docs/ui-overhaul/token-mapping.md`
2. Run `pnpm dev` to have visual feedback
3. Keep dispatch board files UNTOUCHED (they are the design reference)

---

## Checklist

### Tracking (87 patterns — HIGH density)
- [ ] `components/tms/tracking/tracking-map.tsx` (53 colors, 3 shadows, 2 HTML)
- [ ] `components/tms/tracking/tracking-sidebar.tsx` (22 colors)
- [ ] `components/tms/tracking/tracking-pin-popup.tsx` (12 colors, 2 HTML)

### Stops (53 patterns)
- [ ] `components/tms/stops/stop-card.tsx` (46 colors, 1 shadow)
- [ ] `components/tms/stops/stops-table.tsx` (7 colors)

### Loads (82 patterns)
- [ ] `components/tms/loads/load-status-badge.tsx` (15 colors) — **KEY: unify with status tokens**
- [ ] `components/tms/loads/loads-data-table.tsx` (11 colors, 1 shadow)
- [ ] `components/tms/loads/carrier-selector.tsx` (11 colors)
- [ ] `components/tms/loads/load-timeline-tab.tsx` (7 colors)
- [ ] `components/tms/loads/load-carrier-tab.tsx` (6 colors)
- [ ] `components/tms/loads/kpi-stat-cards.tsx` (6 colors)
- [ ] `components/tms/loads/load-tracking-card.tsx` (5 colors)
- [ ] `components/tms/loads/load-drawer.tsx` (5 colors, 3 shadows)

### Dashboard (46 patterns)
- [ ] `components/tms/dashboard/ops-needs-attention.tsx` (14 colors, 9 HTML)
- [ ] `components/tms/dashboard/ops-alerts-panel.tsx` (12 colors, 6 HTML)
- [ ] `components/tms/dashboard/ops-kpi-cards.tsx` (10 colors, 6 shadows)
- [ ] `components/tms/dashboard/ops-activity-feed.tsx` (6 colors, 3 HTML)
- [ ] `components/tms/dashboard/ops-charts.tsx` (3 colors, 2 HTML)

### Shared (16 patterns)
- [ ] `components/tms/shared/status-badge.tsx` (12 colors) — **KEY: unify with status tokens**
- [ ] `components/tms/shared/financial-summary-card.tsx` (4 colors)

### Check Calls (22 patterns)
- [ ] `components/tms/checkcalls/check-call-timeline.tsx` (13 colors)
- [ ] `components/tms/checkcalls/overdue-checkcalls.tsx` (9 colors)

### Dispatch (10 patterns — LIGHT touch, dispatch board adjacent)
- [ ] `components/tms/dispatch/load-card.tsx` (8 colors, 2 shadows)
- [ ] `components/tms/dispatch/dispatch-toolbar.tsx` (4 colors)
- [ ] `components/tms/dispatch/kanban-lane.tsx` (2 colors)
> **Note:** Be extra careful with dispatch components. Only change structural colors (grays). Leave all status/semantic colors exactly as-is.

### Orders (10 patterns)
- [ ] `components/tms/orders/order-review-step.tsx` (5 colors)
- [ ] `components/tms/orders/order-stops-tab.tsx` (2 colors, 1 shadow)
- [ ] `components/tms/orders/order-detail-overview.tsx` (2 colors)
- [ ] `components/tms/orders/order-stops-builder.tsx` (1 color, 2 HTML)

### Other TMS (3 patterns)
- [ ] `components/tms/primitives/user-avatar.tsx` (1 color)
- [ ] `components/tms/primitives/custom-checkbox.tsx` (1 color)
- [ ] `components/tms/panels/slide-panel.tsx` (1 color)

---

## Build Verify
After completing ALL files above:
```bash
cd apps/web && npx next build
```

## Commit
```
style: migrate TMS core components to semantic tokens
```

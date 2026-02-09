# COMP-010: StopList Component

> **Phase:** 2 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (2-3h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs/12-Rabih-design-Process/04-tms-core/02-order-detail.md` — Order stops design

## Objective

Build a StopList component for displaying pickup/delivery stops in TMS screens. Every order and load has an ordered list of stops (pickup → intermediate → delivery). This component is used in: order detail, load detail, load planner, dispatch board.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/components/tms/stop-list.tsx` | Ordered stop display with addresses, dates, status |
| CREATE | `apps/web/components/tms/stop-card.tsx` | Individual stop card (address, date/time, type, status) |

## Acceptance Criteria

- [ ] Renders ordered list of stops with visual connector lines (vertical timeline style)
- [ ] Each stop shows: type (Pickup/Delivery/Stop), address, scheduled date/time, actual date/time, status
- [ ] Stop types color-coded (green for pickup, blue for delivery, gray for intermediate)
- [ ] Status badges (Pending, Arrived, Loaded/Unloaded, Completed)
- [ ] Compact mode (for sidebars/cards) and expanded mode (for detail pages)
- [ ] Uses design tokens for colors
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: COMP-001 (design tokens)
- Blocks: Phase 3 (TMS Core pages use StopList extensively)

## Reference

- Design: `dev_docs/12-Rabih-design-Process/04-tms-core/02-order-detail.md`
- Backend: Stop model in Prisma schema (pickup/delivery with addresses, dates, status)

# TMS-002: Order Detail Page

> **Phase:** 3 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** L (6h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — TMS Core hub
3. `dev_docs/12-Rabih-design-Process/04-tms-core/03-order-detail.md` — Design spec
4. `apps/web/components/patterns/detail-page.tsx` — DetailPage pattern (from PATT-002)

## Objective

Build the Order Detail page at `/operations/orders/:id`. Displays full order information with tabs for Overview, Stops, Loads, Documents, and Timeline. Sidebar shows customer info, rate/margin summary. Backend returns complete order data with related entities.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/operations/orders/[id]/page.tsx` | Order detail page with tabs |
| CREATE | `apps/web/components/tms/orders/order-detail-card.tsx` | Overview tab: order summary, customer, dates, charges |
| CREATE | `apps/web/components/tms/orders/order-stops-section.tsx` | Stops tab: pickup/delivery list with status |
| CREATE | `apps/web/components/tms/orders/order-loads-section.tsx` | Loads tab: loads created from this order |
| CREATE | `apps/web/components/tms/orders/order-timeline.tsx` | Timeline tab: activity history |
| MODIFY | `apps/web/lib/hooks/tms/use-orders.ts` | Add useOrder(id), useOrderStops(id), useOrderLoads(id), useOrderTimeline(id) |

## Acceptance Criteria

- [ ] `/operations/orders/:id` renders order detail (no 404)
- [ ] Overview tab: order number, customer name, status badge, pickup/delivery dates, origin/destination, total charges, margin
- [ ] Stops tab: ordered list of stops with type (PICKUP/DELIVERY), address, contact, status
- [ ] Loads tab: list of loads with load #, carrier, status, rate
- [ ] Timeline tab: chronological activity feed
- [ ] Edit button → `/operations/orders/:id/edit`
- [ ] Back button → `/operations/orders`
- [ ] Status change dropdown (valid transitions only per state machine)
- [ ] Loading, error, and empty states for each tab
- [ ] Active tab persisted in URL hash
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: PATT-002 (DetailPage pattern), TMS-001 (orders list for navigation)
- Blocks: TMS-005 (New Order Form references detail), TMS-006 (Edit Order)

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md` → Orders section
- Design spec: `dev_docs/12-Rabih-design-Process/04-tms-core/03-order-detail.md`
- Backend: `GET /api/v1/orders/:id`, `/stops`, `/loads`, `/documents`, `/timeline`

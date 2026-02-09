# TMS-001: Orders List Page

> **Phase:** 3 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** L (6h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — TMS Core hub (endpoints, status machines)
3. `dev_docs/12-Rabih-design-Process/04-tms-core/02-orders-list.md` — Design spec
4. `apps/web/components/patterns/list-page.tsx` — ListPage pattern (from PATT-001)

## Objective

Build the Orders List page at `/operations/orders`. This is the primary view for all TMS orders — dispatchers, sales reps, and ops managers use it constantly. Uses the ListPage pattern from Phase 2 with filters for status, customer, date range, and search. Backend `GET /api/v1/orders` is production-ready with pagination and filtering.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/operations/orders/page.tsx` | Orders list page using ListPage pattern |
| CREATE | `apps/web/components/tms/orders/orders-table.tsx` | Column definitions for DataGrid |
| CREATE | `apps/web/components/tms/orders/order-status-badge.tsx` | StatusBadge for order states (uses COMP-002) |
| CREATE | `apps/web/lib/hooks/tms/use-orders.ts` | React Query hooks: useOrders(filters), useOrderStats() |

## Acceptance Criteria

- [ ] `/operations/orders` renders order list with real data from API
- [ ] Columns: Order #, Customer, Status, Pickup Date, Delivery Date, Origin, Destination, Total Charges
- [ ] Filters: status (multi-select), customer (search), date range (pickup), text search
- [ ] Pagination works (page size selector, prev/next)
- [ ] Row click navigates to `/operations/orders/:id`
- [ ] "New Order" button navigates to `/operations/orders/new`
- [ ] Loading skeleton while fetching
- [ ] Empty state with "Create your first order" CTA
- [ ] Error state with retry button
- [ ] Search debounced at 300ms
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: PATT-001 (ListPage pattern), COMP-001 (design tokens), COMP-002 (StatusBadge), COMP-004 (FilterBar), COMP-005 (DataGrid)
- Blocks: TMS-002 (Order Detail — needs list for navigation)

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md` → Orders section
- Design spec: `dev_docs/12-Rabih-design-Process/04-tms-core/02-orders-list.md`
- Backend: `GET /api/v1/orders` (paginated, filterable), `GET /api/v1/orders/stats` (KPI)
- Status machine: PENDING → QUOTED → BOOKED → DISPATCHED → IN_TRANSIT → DELIVERED → INVOICED → COMPLETED

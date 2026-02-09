# TMS-003: Loads List Page

> **Phase:** 3 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** M (4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — TMS Core hub (loads endpoints, status machine)
3. `dev_docs/12-Rabih-design-Process/04-tms-core/05-loads-list.md` — Design spec
4. `apps/web/components/patterns/list-page.tsx` — ListPage pattern (from PATT-001)

## Objective

Build the Loads List page at `/operations/loads`. Similar to Orders List but with carrier and equipment columns. Dispatchers use this to manage active loads. Reuse the ListPage pattern with load-specific filters (status, carrier, equipment type, date range).

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/operations/loads/page.tsx` | Loads list page using ListPage pattern |
| CREATE | `apps/web/components/tms/loads/loads-table.tsx` | Column definitions for DataGrid |
| CREATE | `apps/web/components/tms/loads/load-status-badge.tsx` | StatusBadge for load states (uses COMP-002) |
| CREATE | `apps/web/lib/hooks/tms/use-loads.ts` | React Query hooks: useLoads(filters), useLoadStats() |

## Acceptance Criteria

- [ ] `/operations/loads` renders load list with real data
- [ ] Columns: Load #, Order #, Carrier, Status, Equipment, Pickup Date, Delivery Date, Origin, Destination, Rate
- [ ] Filters: status (multi-select), carrier (search), equipment type (select), date range
- [ ] Pagination works
- [ ] Row click navigates to `/operations/loads/:id`
- [ ] "New Load" button navigates to `/operations/loads/new`
- [ ] Loading, empty, error states
- [ ] Search debounced at 300ms
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: PATT-001 (ListPage pattern), COMP-001, COMP-002, COMP-004, COMP-005
- Blocks: TMS-004 (Load Detail)

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md` → Loads section
- Design spec: `dev_docs/12-Rabih-design-Process/04-tms-core/05-loads-list.md`
- Backend: `GET /api/v1/loads` (paginated, filterable), `GET /api/v1/loads/stats`
- Status machine: PLANNING → PENDING → TENDERED → ACCEPTED → DISPATCHED → AT_PICKUP → PICKED_UP → IN_TRANSIT → AT_DELIVERY → DELIVERED → COMPLETED

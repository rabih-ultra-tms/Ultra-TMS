# SALES-001: Quotes List Rebuild

> **Phase:** 3 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/03-sales.md` — Sales hub (PROTECTED: Load Planner)
3. `dev_docs/12-Rabih-design-Process/03-sales/02-quotes-list.md` — Design spec
4. `apps/web/components/patterns/list-page.tsx` — ListPage pattern (from PATT-001)

## Objective

Rebuild the Quotes List page from design spec. The existing page works but has hardcoded colors, missing debounce, and doesn't use design tokens. Build fresh at `/quotes` using the ListPage pattern. Existing code is reference only for API call patterns.

**IMPORTANT:** Do NOT touch the Load Planner (`/load-planner/[id]/edit`). It is PROTECTED.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/quotes/page.tsx` | New quotes list using ListPage pattern |
| CREATE | `apps/web/components/sales/quotes/quotes-table-v2.tsx` | Column definitions using DataGrid |
| MODIFY | `apps/web/components/sales/quotes/quote-status-badge.tsx` | Replace hardcoded colors with StatusBadge (COMP-002) |
| MODIFY | `apps/web/lib/hooks/use-quotes.ts` | Ensure useQuotes(filters) hook exists with pagination |

## Acceptance Criteria

- [ ] `/quotes` renders quote list with real data from `GET /api/v1/quotes`
- [ ] Columns: Quote #, Customer, Status, Pickup Date, Origin, Destination, Total, Margin %, Created
- [ ] Filters: status (multi-select), customer (search), date range, text search
- [ ] Status badges use design tokens (not hardcoded colors)
- [ ] Pagination works
- [ ] Row click → `/quotes/:id`
- [ ] "New Quote" button → `/quotes/new`
- [ ] Search debounced at 300ms
- [ ] Loading, empty, error states
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: PATT-001, COMP-001, COMP-002
- Blocks: SALES-002 (Quote Detail)

## Reference

- Hub: `dev_docs_v2/03-services/03-sales.md`
- Design spec: `dev_docs/12-Rabih-design-Process/03-sales/02-quotes-list.md`
- Backend: `GET /api/v1/quotes` (paginated), `GET /api/v1/quotes/stats`
- Existing code (reference only): `apps/web/app/(dashboard)/quotes/page.tsx`

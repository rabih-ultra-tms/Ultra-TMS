# COMP-005: DataGrid Component (TanStack Table Wrapper)

> **Phase:** 1 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** L (4-6h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/04-audit/components.md` — Current table usage

## Objective

Build a reusable DataGrid component wrapping TanStack Table (React Table v8). Every list page currently builds its own table with inconsistent column definitions, sorting, and pagination. DataGrid standardizes this with: column definitions, server-side pagination, row click handler, bulk selection, and skeleton loading.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/components/shared/data-grid.tsx` | DataGrid wrapper with TanStack Table |
| CREATE | `apps/web/components/shared/data-grid-pagination.tsx` | Pagination footer for DataGrid |

## Acceptance Criteria

- [ ] DataGrid accepts: columns (TanStack ColumnDef), data, isLoading, pagination (page, total, onPageChange)
- [ ] Skeleton loading state (uses DataTableSkeleton)
- [ ] Empty state (uses EmptyState)
- [ ] Error state (uses ErrorState)
- [ ] Row click handler (optional — navigates to detail page)
- [ ] Column sorting (server-side — emits sort params)
- [ ] Pagination footer with page info and prev/next buttons
- [ ] Bulk row selection (optional — checkbox column)
- [ ] Responsive: horizontal scroll on mobile
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: None (can start independently)
- Blocks: PATT-001 (list page pattern uses DataGrid)

## Reference

- TanStack Table v8 docs
- Existing tables: `users-table.tsx`, `contacts-table.tsx`, `leads-table.tsx` (for pattern reference)

# PATT-001: List Page Pattern Template

> **Phase:** 2 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** L (4-6h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/00-foundations/design-system.md`
3. `dev_docs/Claude-review-v1/04-screen-integration/02-page-patterns.md` — 7 page pattern specs

## Objective

Create a reference implementation of the List Page pattern. This is the most common page type (~60% of all screens). It combines: PageHeader, FilterBar, DataGrid, and Pagination. Once this pattern exists, every future list page follows it.

Build using the Carriers list page as the first real implementation (refactor from current ad-hoc version).

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/components/patterns/list-page.tsx` | ListPage wrapper component (composes FilterBar + DataGrid) |
| MODIFY | `apps/web/app/(dashboard)/carriers/page.tsx` | Refactor to use ListPage pattern (first implementation) |

## Acceptance Criteria

- [ ] ListPage component accepts: title, description, columns, dataHook, filters, createLink
- [ ] Renders: PageHeader + FilterBar + DataGrid + Pagination
- [ ] Handles 4 data states: loading (skeleton), error (retry), empty (action), data (table)
- [ ] Search debounced at 300ms
- [ ] Pagination managed internally
- [ ] "Add New" button links to create page
- [ ] Carriers page uses ListPage pattern and works correctly
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: COMP-004 (FilterBar), COMP-005 (DataGrid)
- Blocks: Phase 3+ (all list pages follow this pattern)

## Reference

- Page patterns: `dev_docs/Claude-review-v1/04-screen-integration/02-page-patterns.md`
- Carrier list: `apps/web/app/(dashboard)/carriers/page.tsx` (current implementation)

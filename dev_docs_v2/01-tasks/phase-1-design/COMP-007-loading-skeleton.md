# COMP-007: Page-Level Loading Skeleton Patterns

> **Phase:** 1 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (2-3h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/04-audit/components.md` — Existing skeleton components

## Objective

Create page-level skeleton patterns for the 3 main page types (list, detail, form). Currently only DataTableSkeleton exists. Detail and form pages show bare "Loading..." text. Skeleton patterns improve perceived performance.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/components/shared/list-page-skeleton.tsx` | Skeleton for list pages (filter bar + table) |
| CREATE | `apps/web/components/shared/detail-page-skeleton.tsx` | Skeleton for detail pages (header + tabs + content cards) |
| CREATE | `apps/web/components/shared/form-page-skeleton.tsx` | Skeleton for form pages (header + form fields) |

## Acceptance Criteria

- [ ] ListPageSkeleton: search bar shimmer + table skeleton (customizable rows/cols)
- [ ] DetailPageSkeleton: header shimmer + tab bar shimmer + 3 content card shimmers
- [ ] FormPageSkeleton: header shimmer + label/input pairs shimmer
- [ ] All use shadcn Skeleton component
- [ ] Configurable (column count, row count, section count)
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: None
- Blocks: PATT-001, PATT-002, PATT-003 (patterns use these skeletons)

## Reference

- Existing: `apps/web/components/shared/data-table-skeleton.tsx`

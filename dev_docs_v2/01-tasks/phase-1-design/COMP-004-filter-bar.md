# COMP-004: FilterBar Component

> **Phase:** 1 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (3-4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/00-foundations/design-system.md`

## Objective

Build a reusable FilterBar component for list pages. Every list page (carriers, orders, loads, quotes, contacts, leads) needs search + filters. Currently each page builds its own inconsistent filter UI. FilterBar standardizes this.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/components/shared/filter-bar.tsx` | Reusable search + filter row |

## Acceptance Criteria

- [ ] FilterBar accepts: searchPlaceholder, filters (array of {name, type, options}), onFilterChange callback
- [ ] Search input with debounce (300ms) built in
- [ ] Supports filter types: select (dropdown), date-range, text
- [ ] "Clear all" button resets all filters
- [ ] Active filter count shown as badge
- [ ] Responsive: wraps on mobile, row on desktop
- [ ] Uses design tokens
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: COMP-001 (design tokens)
- Blocks: PATT-001 (list page pattern uses FilterBar)

## Reference

- Design: `dev_docs/12-Rabih-design-Process/00-global/11-bulk-operations-patterns.md`
- Working example: `apps/web/app/(dashboard)/leads/page.tsx` (search + stage filter)

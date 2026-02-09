# CARR-001: Refactor Carrier List Page

> **Phase:** 2 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (2-3h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/04-audit/sales-carrier.md` — Carrier list issues
3. PATT-001 task file (list page pattern must be built first)

## Objective

Refactor the existing carrier list page to use the ListPage pattern from PATT-001. Replace hardcoded status colors with StatusBadge, add debounced search (already done in BUG-007), and ensure consistent UX with other list pages.

## File Plan

| Action | Path | What |
|--------|------|------|
| MODIFY | `apps/web/app/(dashboard)/carriers/page.tsx` | Refactor to use ListPage pattern |
| MODIFY | `apps/web/components/carriers/carriers-table.tsx` | Use StatusBadge, design token colors |

## Acceptance Criteria

- [ ] Carriers list uses ListPage pattern component
- [ ] Status column uses StatusBadge (not hardcoded colors)
- [ ] Search debounced at 300ms
- [ ] Pagination works correctly
- [ ] Row click navigates to `/carriers/[id]` (detail page from BUG-001)
- [ ] "Add Carrier" button links to `/carriers/new`
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: PATT-001 (list page pattern), COMP-002 (StatusBadge), BUG-001 (carrier detail must exist for row click)
- Blocks: None

## Reference

- Audit: `dev_docs_v2/04-audit/sales-carrier.md`
- Carrier UI spec: `dev_docs/11-ai-dev/web-dev-prompts/05-carrier-ui.md`

# BUG-007: Add Missing Search Debounce × 3

> **Phase:** 0 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** S (30min)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/04-audit/sales-carrier.md` — SC-005

## Objective

Add 300ms debounce to search inputs on 3 pages that currently fire an API request on every keystroke. The `useDebounce` hook already exists and is used in the Leads module.

## File Plan

| Action | Path | What |
|--------|------|------|
| MODIFY | `apps/web/app/(dashboard)/carriers/page.tsx` | Add useDebounce to search input |
| MODIFY | `apps/web/app/(dashboard)/quotes/page.tsx` | Add useDebounce to search input |
| MODIFY | `apps/web/app/(dashboard)/load-planner/page.tsx` | Add useDebounce to search input |

## Acceptance Criteria

- [ ] All 3 search inputs debounced at 300ms
- [ ] API not called on every keystroke
- [ ] Search still works correctly after debounce
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: None
- Blocks: None

## Reference

- Audit: `dev_docs_v2/04-audit/sales-carrier.md` → SC-005
- Working example: `apps/web/app/(dashboard)/leads/page.tsx` (line 30, uses useDebounce)

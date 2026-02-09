# BUG-006: Replace 7 × window.confirm() with ConfirmDialog

> **Phase:** 0 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** S (1-2h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/04-audit/sales-carrier.md` — SC-004
3. `apps/web/components/shared/confirm-dialog.tsx` — Existing ConfirmDialog component

## Objective

Replace all 7 instances of `window.confirm()` with the existing `ConfirmDialog` component. Browser native confirm dialogs are unstyled, not accessible, and inconsistent with the rest of the UI.

## File Plan

| Action | Path | What |
|--------|------|------|
| MODIFY | Multiple carrier and load-planner pages | Replace window.confirm() with ConfirmDialog |

## Acceptance Criteria

- [ ] Zero instances of `window.confirm()` in the codebase
- [ ] All confirmations use `ConfirmDialog` with proper title and message
- [ ] Destructive actions use the `destructive` variant
- [ ] Async operations show loading state during confirmation
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: None
- Blocks: None

## Reference

- Audit: `dev_docs_v2/04-audit/sales-carrier.md` → SC-004
- Existing component: `apps/web/components/shared/confirm-dialog.tsx`

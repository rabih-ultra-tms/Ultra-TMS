# COMP-006: ConfirmDialog Pattern Enforcement

> **Phase:** 1 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** S (1h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `apps/web/components/shared/confirm-dialog.tsx` — Existing component

## Objective

Verify the existing ConfirmDialog component supports all needed use cases (destructive delete, status change, navigation away from dirty form). Add any missing variants. This task is a prerequisite audit — the actual window.confirm replacement is BUG-006.

## File Plan

| Action | Path | What |
|--------|------|------|
| MODIFY | `apps/web/components/shared/confirm-dialog.tsx` | Add variants if needed (destructive, warning, info) |

## Acceptance Criteria

- [ ] ConfirmDialog supports: title, description, confirmLabel, cancelLabel
- [ ] `destructive` variant with red confirm button
- [ ] `warning` variant with amber confirm button
- [ ] Async onConfirm with loading state (button shows spinner during operation)
- [ ] Accessible (focus trapped, Escape to close, proper ARIA)
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: None
- Blocks: BUG-006 (window.confirm replacement uses this component)

## Reference

- Existing: `apps/web/components/shared/confirm-dialog.tsx`

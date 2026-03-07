# UX-001: Replace window.confirm() with ConfirmDialog (7 locations)

**Priority:** P0
**Service:** Frontend UX
**Scope:** Eliminate all browser-native confirm dialogs in favor of ConfirmDialog component

## Current State
A regression test (`__tests__/bugs/bug-006-window-confirm.test.ts`) already verifies that fixed pages no longer use `window.confirm()`. The `ConfirmDialog` component from `@/components/shared/confirm-dialog` is already used in:
- Carriers page (batch delete, individual delete via ConfirmDialog)
- Load History page (batch delete, individual delete via ConfirmDialog)
- Quote History page (batch delete, individual delete via ConfirmDialog)

These three pages have already been fixed to use ConfirmDialog. The regression test covers them. Any remaining `window.confirm()` calls may exist in other pages not yet audited (e.g., truck-types, admin pages, settings).

## Requirements
- Audit all frontend code for remaining `window.confirm()` or bare `confirm()` calls
- Replace each with the existing `ConfirmDialog` component
- Ensure destructive actions use `variant="destructive"` or `destructive` prop
- Add the replaced pages to the regression test

## Acceptance Criteria
- [ ] Zero `window.confirm()` calls in the entire frontend codebase
- [ ] Zero bare `confirm()` calls
- [ ] All replacements use `ConfirmDialog` component
- [ ] Destructive actions use red/destructive styling
- [ ] Regression test updated to cover all fixed files
- [ ] Existing regression test still passes

## Dependencies
- ConfirmDialog component already exists and is in use

## Estimated Effort
S

# ACC-005: Focus Management for Modals and Dialogs

**Priority:** P1
**Service:** Frontend Accessibility
**Scope:** Proper focus trapping and management in modals and dialogs

## Current State
Dialogs use shadcn/ui Dialog component (Radix UI), which provides some focus management. However, custom dialogs like ConfirmDialog may have inconsistent focus behavior. Focus may not return to trigger element on dialog close.

## Requirements
- Focus moves to dialog on open
- Focus trapped within dialog while open
- Focus returns to trigger element on close
- Escape key closes dialog
- Screen reader announces dialog title on open
- Background content marked as `aria-hidden` when dialog open

## Acceptance Criteria
- [ ] Focus moves to dialog content on open
- [ ] Focus trapped within dialog
- [ ] Focus returns to trigger on close
- [ ] Escape closes dialog
- [ ] Dialog title announced to screen reader
- [ ] Background marked aria-hidden

## Dependencies
- Radix UI Dialog already handles most of this; verify ConfirmDialog

## Estimated Effort
S

# UX-007: Toast Notifications for All CRUD Operations

**Priority:** P1
**Service:** Frontend UX
**Scope:** Ensure consistent toast notifications for all create, update, and delete operations

## Current State
Sonner toast notifications are used in most hooks but inconsistently. Some mutations show success toasts but not error toasts, or vice versa. Some pages handle toasts in the component instead of the hook.

## Requirements
- Audit all mutation hooks for consistent toast patterns
- Success: show green toast with entity name and action
- Error: show red toast with error message from API
- Loading: consider adding loading toasts for long operations
- Ensure no duplicate toasts (hook + component both showing)

## Acceptance Criteria
- [ ] All mutation hooks have `onSuccess` toast
- [ ] All mutation hooks have `onError` toast
- [ ] No duplicate toasts from hook + component
- [ ] Toast messages are user-friendly (not raw error strings)
- [ ] Consistent toast styling across all operations

## Dependencies
- None

## Estimated Effort
M

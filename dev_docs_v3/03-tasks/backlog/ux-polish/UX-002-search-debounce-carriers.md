# UX-002: Add Search Debounce to Carriers List

**Priority:** P0
**Service:** Carrier Management
**Scope:** Debounce search input on carriers page

## Current State
ALREADY FIXED. The carriers page (`apps/web/app/(dashboard)/carriers/page.tsx`) already uses `useDebounce` from `@/lib/hooks`:
```
const debouncedSearch = useDebounce(searchQuery, 300);
```
The debounced value is passed to `useCarriers({ search: debouncedSearch || undefined })`.

A regression test exists at `__tests__/bugs/bug-007-search-debounce.test.ts`.

## Requirements
- Verify the fix is working correctly (300ms debounce delay)
- Ensure regression test covers this page
- No additional work needed

## Acceptance Criteria
- [x] `useDebounce` hook used with 300ms delay
- [x] Debounced value passed to API query
- [x] Regression test exists
- [ ] Verify debounce works correctly at runtime (QS-008)

## Dependencies
- None -- already implemented

## Estimated Effort
S (verification only)

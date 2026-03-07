# UX-004: Add Search Debounce to Quote History List

**Priority:** P0
**Service:** Sales
**Scope:** Debounce search input on quote-history page

## Current State
ALREADY FIXED. The quote-history page (`apps/web/app/(dashboard)/quote-history/page.tsx`) already uses `useDebounce`:
```
const debouncedSearch = useDebounce(searchQuery, 300)
```
The debounced value is passed to `useLoadPlannerQuotes({ search: debouncedSearch })`.

## Requirements
- Verify the fix is working correctly (300ms debounce delay)
- Ensure regression test covers this page
- No additional work needed

## Acceptance Criteria
- [x] `useDebounce` hook used with 300ms delay
- [x] Debounced value passed to API query
- [ ] Verify debounce works correctly at runtime (QS-008)

## Dependencies
- None -- already implemented

## Estimated Effort
S (verification only)

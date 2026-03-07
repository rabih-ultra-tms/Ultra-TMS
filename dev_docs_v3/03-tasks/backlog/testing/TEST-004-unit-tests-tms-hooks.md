# TEST-004: Unit Tests for TMS Hooks

**Priority:** P0
**Service:** TMS Core
**Scope:** Unit test coverage for use-loads, use-orders, and use-dispatch hooks

## Current State
Three TMS hook files exist:
- `apps/web/lib/hooks/tms/use-loads.ts` -- 377 LOC, hooks for load CRUD, stats, timeline, carrier search, bulk operations
- `apps/web/lib/hooks/tms/use-orders.ts` -- order CRUD hooks
- `apps/web/lib/hooks/tms/use-dispatch.ts` -- dispatch assignment hooks

Key patterns to test:
- `unwrap<T>()` helper that extracts `data` from API envelope
- `useLoads` builds URLSearchParams manually from filter params
- `useCreateLoad` maps form fields to backend DTO (e.g., `fuelSurcharge` -> `fuelAdvance`)
- `useBulkUpdateLoadStatus` and `useBulkAssignCarrier` use `Promise.allSettled`

## Requirements
- Test all load hooks including bulk operations
- Test the `unwrap` helper function independently
- Test field mapping in `useCreateLoad` (fuelSurcharge -> fuelAdvance, accessorials -> accessorialCosts sum)
- Test `useBulkUpdateLoadStatus` partial success scenario (some fulfilled, some rejected)
- Test order and dispatch hooks

## Acceptance Criteria
- [ ] All load hooks tested (useLoads, useLoad, useLoadStats, useLoadTimeline, useCreateLoad, useUpdateLoad, useDeleteLoad)
- [ ] Bulk operation hooks test partial failure scenarios
- [ ] Field mapping logic verified in create/update mutations
- [ ] URLSearchParams construction tested with various filter combinations
- [ ] All order hooks tested
- [ ] All dispatch hooks tested
- [ ] Tests pass in CI

## Dependencies
- None beyond existing test infrastructure

## Estimated Effort
L

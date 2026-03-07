# TEST-003: Unit Tests for Operations Hooks

**Priority:** P0
**Service:** Operations
**Scope:** Unit test coverage for use-carriers and use-load-history hooks

## Current State
Two large hook files exist with minimal test coverage:
- `apps/web/lib/hooks/operations/use-carriers.ts` -- 519 LOC, 20+ hooks for carrier/driver/truck/document CRUD
- `apps/web/lib/hooks/operations/use-load-history.ts` -- load history list, stats, create, delete hooks

The carriers hook file is the largest in the project. It includes sub-resource hooks for drivers, trucks, and documents, each with their own CRUD operations.

## Requirements
- Test all carrier CRUD hooks (useCarriers, useCarrier, useCreateCarrier, useUpdateCarrier, useDeleteCarrier)
- Test carrier stats hook (useCarrierStats)
- Test driver sub-resource hooks (useCarrierDrivers, useCreateDriver, useUpdateDriver, useDeleteDriver)
- Test truck sub-resource hooks (useCarrierTrucks, useCreateTruck, useUpdateTruck, useDeleteTruck, useAssignDriverToTruck)
- Test document hooks (useCarrierDocuments, useCreateCarrierDocument, useDeleteCarrierDocument)
- Test "ById" variant hooks (useUpdateTruckById, useDeleteTruckById, useUpdateDriverById, useDeleteDriverById)
- Test load history hooks
- Verify the unwrap pattern for API envelope handling

## Acceptance Criteria
- [ ] All 20+ carrier hooks have tests
- [ ] All load history hooks have tests
- [ ] Query param cleaning logic in `useCarriers` is tested (equipmentTypes join, minScore filter)
- [ ] Cache invalidation patterns tested (multiple queryKey invalidations per mutation)
- [ ] Toast notifications verified on success/error
- [ ] Tests pass in CI

## Dependencies
- None beyond existing test infrastructure

## Estimated Effort
XL

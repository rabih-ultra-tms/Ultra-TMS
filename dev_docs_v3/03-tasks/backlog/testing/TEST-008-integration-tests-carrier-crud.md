# TEST-008: Integration Tests for Carrier CRUD

**Priority:** P1
**Service:** Carrier Management
**Scope:** Integration tests for carrier create, read, update, delete operations

## Current State
Carrier page at `/carriers` has full CRUD with bulk operations, filtering (type, status, state, tier, equipment, compliance, min score), and debounced search. Sub-resources include drivers, trucks, and documents.

## Requirements
- Test create carrier (dialog form) -> appears in list
- Test carrier detail view loads correctly
- Test edit carrier -> changes saved
- Test delete carrier (single and batch)
- Test bulk status update
- Test filter combinations
- Test sub-resource CRUD (drivers, trucks, documents)

## Acceptance Criteria
- [ ] Carrier CRUD lifecycle integration test
- [ ] Bulk operations (delete, status update) tested
- [ ] Filter + search combination tested
- [ ] Driver sub-resource CRUD tested
- [ ] Truck sub-resource CRUD tested
- [ ] Tests pass in CI

## Dependencies
- TEST-003 (operations hook unit tests) should be done first

## Estimated Effort
L

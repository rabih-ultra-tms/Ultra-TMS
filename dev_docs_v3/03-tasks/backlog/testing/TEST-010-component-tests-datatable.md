# TEST-010: Component Tests for DataTable

**Priority:** P1
**Service:** Shared Components
**Scope:** Component tests for the reusable DataTable component

## Current State
The DataTable/ListPage component is used across carriers, loads, and other list pages. It handles sorting, pagination, row selection, and bulk actions. No component-level tests exist.

## Requirements
- Test rendering with various column configurations
- Test sorting (click header -> sort state changes)
- Test row selection (single, select all, clear)
- Test pagination controls
- Test empty state rendering
- Test loading state rendering
- Test error state rendering
- Test bulk actions bar appears when rows selected

## Acceptance Criteria
- [ ] DataTable renders with provided columns and data
- [ ] Sorting interaction tested
- [ ] Row selection tested (single, all, clear)
- [ ] Pagination tested
- [ ] Empty/loading/error states tested
- [ ] Bulk actions bar tested
- [ ] Tests pass in CI

## Dependencies
- None

## Estimated Effort
M

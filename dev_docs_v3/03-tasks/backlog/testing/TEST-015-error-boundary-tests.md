# TEST-015: Error Boundary and Fallback Tests

**Priority:** P1
**Service:** Frontend Infrastructure
**Scope:** Test error boundaries and fallback UI components

## Current State
Error boundaries may exist but are not systematically tested. Pages should gracefully handle component crashes, network errors, and unexpected data shapes without showing blank screens.

## Requirements
- Test that error boundaries catch component render errors
- Test fallback UI displays user-friendly message
- Test "retry" functionality in error states
- Test network error handling in list pages (error state renders correctly)
- Test 404 pages for invalid routes
- Test 500-equivalent handling for API failures

## Acceptance Criteria
- [ ] Error boundary catches render errors and shows fallback
- [ ] Fallback UI has a "try again" action
- [ ] Network error states display correctly on list pages
- [ ] 404 page renders for invalid routes
- [ ] API failure shows error state (not blank screen)
- [ ] Tests pass in CI

## Dependencies
- None

## Estimated Effort
M

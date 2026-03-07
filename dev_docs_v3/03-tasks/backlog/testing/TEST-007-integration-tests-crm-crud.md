# TEST-007: Integration Tests for CRM CRUD

**Priority:** P1
**Service:** CRM
**Scope:** Integration tests for companies, contacts, and customers CRUD operations

## Current State
CRM pages exist for companies, contacts, and customers with list views and create/edit forms. No integration tests verify the full CRUD cycle through the UI.

## Requirements
- Test create entity -> appears in list
- Test edit entity -> changes reflected
- Test delete entity -> removed from list
- Test search/filter -> correct results displayed
- Test pagination -> correct page navigation

## Acceptance Criteria
- [ ] Company CRUD integration test
- [ ] Contact CRUD integration test
- [ ] Customer CRUD integration test
- [ ] Search and filter integration tested
- [ ] Tests pass in CI

## Dependencies
- TEST-002 (CRM hook unit tests) should be done first

## Estimated Effort
M

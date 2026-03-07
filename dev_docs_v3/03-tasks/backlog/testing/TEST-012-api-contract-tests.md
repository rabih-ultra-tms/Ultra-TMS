# TEST-012: API Contract Tests (Response Shape Validation)

**Priority:** P1
**Service:** All
**Scope:** Validate API response shapes match frontend type expectations

## Current State
Frontend hooks expect specific response shapes (e.g., `{ data: T }` envelope, `{ data: T[], pagination: {...} }` for lists). Multiple bugs have been caused by mismatches between actual API responses and frontend expectations. The `unwrap` helper pattern exists in some hooks but not all.

## Requirements
- Create contract tests that validate each API endpoint returns the expected shape
- Test single-item responses match `{ data: T }` envelope
- Test list responses match `{ data: T[], pagination: { page, limit, total, totalPages } }`
- Test error responses match `{ error: string, code: string }`
- Cover all MVP endpoints (auth, CRM, carriers, loads, orders, invoices)

## Acceptance Criteria
- [ ] Contract test for each MVP endpoint
- [ ] Response shapes validated with Zod or JSON schema
- [ ] Pagination structure validated
- [ ] Error response structure validated
- [ ] Tests run against actual API (not mocks)
- [ ] Tests pass in CI

## Dependencies
- API must be running (docker-compose up)

## Estimated Effort
L

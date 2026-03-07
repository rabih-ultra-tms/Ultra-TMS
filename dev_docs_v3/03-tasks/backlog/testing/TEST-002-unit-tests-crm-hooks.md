# TEST-002: Unit Tests for CRM Hooks

**Priority:** P0
**Service:** CRM
**Scope:** Unit test coverage for CRM hooks: use-companies, use-contacts, use-customers, use-leads

## Current State
Four CRM hook files exist with no test coverage:
- `apps/web/lib/hooks/crm/use-companies.ts` -- `useCompanies` (list query with search/pagination)
- `apps/web/lib/hooks/crm/use-contacts.ts` -- contact CRUD hooks
- `apps/web/lib/hooks/crm/use-customers.ts` -- customer CRUD hooks
- `apps/web/lib/hooks/crm/use-leads.ts` -- lead CRUD hooks

All use `apiClient` from `@/lib/api` and React Query. The `useCompanies` hook uses `PaginatedResponse<Customer>` type.

## Requirements
- Write unit tests for all exported hooks in each file
- Test list queries with various filter combinations
- Test CRUD mutations (create, update, delete) with success/error paths
- Verify correct query key structure for cache invalidation
- Verify correct API endpoint paths

## Acceptance Criteria
- [ ] All hooks in all 4 CRM files have tests
- [ ] List hooks test pagination params (page, limit, search)
- [ ] Mutation hooks test `onSuccess` cache invalidation
- [ ] Error handling paths tested
- [ ] Tests pass in CI

## Dependencies
- TEST-001 patterns can be reused for mocking setup

## Estimated Effort
M

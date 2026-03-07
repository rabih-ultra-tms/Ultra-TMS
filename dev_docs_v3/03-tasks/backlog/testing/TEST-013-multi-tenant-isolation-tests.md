# TEST-013: Multi-Tenant Isolation Tests

**Priority:** P0
**Service:** All
**Scope:** Verify data isolation between tenants

## Current State
All entities include `tenantId` and queries should filter by it. The codebase uses Prisma with `where: { tenantId, deletedAt: null }` pattern. However, no tests verify that tenant A cannot access tenant B's data.

## Requirements
- Create two test tenants with separate data
- Verify list endpoints only return data for the requesting tenant
- Verify detail endpoints return 404 for cross-tenant access
- Verify create operations assign correct tenantId
- Verify update/delete operations reject cross-tenant attempts
- Test at the API level (not just database level)

## Acceptance Criteria
- [ ] List endpoints filter by tenantId (carriers, loads, invoices, etc.)
- [ ] Detail endpoints return 404 for wrong tenantId
- [ ] Create operations use authenticated user's tenantId
- [ ] Cross-tenant update attempts rejected
- [ ] Cross-tenant delete attempts rejected
- [ ] Tests cover all MVP services
- [ ] Tests pass in CI

## Dependencies
- Database seeded with multi-tenant test data
- Auth tokens for different tenants

## Estimated Effort
L

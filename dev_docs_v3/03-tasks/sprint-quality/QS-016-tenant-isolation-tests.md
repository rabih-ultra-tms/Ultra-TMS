# QS-016: Tenant Isolation Tests

**Priority:** P0
**Effort:** M (4-6 hours)
**Status:** planned
**Assigned:** Claude Code
**Source:** Tribunal verdict TRIBUNAL-05, TRIBUNAL-08

---

## Objective

Write 5 integration tests verifying that Tenant A cannot see Tenant B's data across key entities.

## Context

Multi-tenant isolation is the most critical security property in a SaaS TMS. A single leak exposes customer data, carrier information, and financial records to unauthorized tenants. These tests serve as a regression safety net.

## Tests

1. Loads — Tenant A's loads not returned by Tenant B's query
2. Carriers — Tenant A's carriers not visible to Tenant B
3. Invoices — Tenant A's invoices not accessible by Tenant B
4. Orders — Tenant A's orders not returned for Tenant B
5. Customers — Tenant A's customers isolated from Tenant B

## Files

- Create: `apps/api/src/tests/tenant-isolation.spec.ts`

## Acceptance Criteria

- [ ] 5 tests written and passing
- [ ] Tests verify both findMany (list) and findFirst (detail) isolation
- [ ] Tests verify create doesn't allow cross-tenant injection
- [ ] Uses real Prisma client (not mocked) for maximum confidence

## Dependencies

- QS-014 (Prisma Client Extension) should be built first for cleaner test setup

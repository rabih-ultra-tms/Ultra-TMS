# QS-014: Prisma Client Extension for Auto tenantId

**Priority:** P0
**Effort:** L (4-8 hours)
**Status:** DONE (2026-03-09)
**Assigned:** Claude Code
**Source:** Tribunal verdict TRIBUNAL-05

---

## Objective

Create a Prisma Client Extension that automatically injects `tenantId` and `deletedAt: null` into every query, reducing reliance on 801 manual WHERE clauses.

## Context

Currently, every Prisma query must manually include `where: { tenantId, deletedAt: null }`. Missing even one creates a tenant data leak (SEV-1 incident). The Prisma Client Extension API (Prisma 4.16+) allows query-level middleware that auto-injects these filters.

## Files

- Create: `apps/api/src/prisma-tenant.extension.ts`
- Modify: `apps/api/src/prisma.service.ts` — apply extension
- Test: `apps/api/src/prisma-tenant.extension.spec.ts`

## Acceptance Criteria

- [ ] Extension auto-injects `tenantId` on reads (findMany, findFirst, findUnique, count, aggregate)
- [ ] Extension auto-injects `tenantId` on creates
- [ ] Extension auto-injects `deletedAt: null` on reads
- [ ] Skips injection for models without tenantId (log tables, enums)
- [ ] Doesn't double-filter if tenantId already provided
- [ ] All existing tests still pass
- [ ] 5+ new tests covering injection scenarios

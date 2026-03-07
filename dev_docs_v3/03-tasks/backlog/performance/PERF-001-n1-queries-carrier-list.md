# PERF-001: Fix N+1 Queries in Carrier List Endpoint

**Priority:** P1
**Service:** Carrier Management
**Scope:** Optimize the carrier list endpoint to avoid N+1 query patterns

## Current State
The carrier list endpoint in `apps/api/src/modules/carrier/carriers.service.ts` uses `findMany` to fetch carriers. The carrier scorecard computation (`getScorecard`) fetches additional data per carrier (loads, insurance certificates, carrier documents, FMCSA compliance logs) via separate queries. When the list page loads 25 carriers, this results in 25 x 4 = 100+ additional queries.

Evidence from test file (`carriers.service.spec.ts`): separate mocks for `load.findMany`, `insuranceCertificate.findMany`, `carrierDocument.findMany`, and `fmcsaComplianceLog.findMany` per carrier.

## Requirements
- Use Prisma `include` or `select` to eager-load related data in the list query
- Or batch-load scorecard data for all carriers in 1-2 queries instead of N
- Measure query count before and after
- Target: list page should execute fewer than 10 queries total

## Acceptance Criteria
- [ ] Carrier list query count reduced from 100+ to under 10
- [ ] Response time for 25-carrier page under 200ms
- [ ] No change to API response shape
- [ ] Existing tests updated if query patterns change
- [ ] Load testing confirms improvement

## Dependencies
- None

## Estimated Effort
M

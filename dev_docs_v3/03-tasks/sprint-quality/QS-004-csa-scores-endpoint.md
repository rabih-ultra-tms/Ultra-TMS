# QS-004: CSA Scores Endpoint (Real Data)

**Priority:** P1
**Effort:** S (1-2 hours)
**Status:** planned
**Assigned:** Codex

---

## Context Header (Read These First)

1. `apps/api/src/modules/carrier/carriers.controller.ts` — Find the CSA/performance endpoint
2. `apps/api/src/modules/carrier/carriers.service.ts` — Find the stub implementation
3. `apps/api/prisma/schema.prisma` — Find CsaScore model
4. `apps/web/lib/hooks/carriers/use-carrier-scorecard.ts` — Frontend hook calling this endpoint

---

## Objective

Replace the stub `GET /carriers/:id/performance` (or `GET /carriers/csa/:carrierId`) endpoint with real data from the `CsaScore` Prisma model. Currently the endpoint returns zeros or empty data.

---

## Current State

The endpoint exists but returns stub/empty data. The `CsaScore` model exists in Prisma schema:
```prisma
model CsaScore {
  id        String  @id @default(cuid())
  carrierId String
  category  String  // UNSAFE_DRIVING, HOS, DRIVER_FITNESS, etc.
  score     Float
  updatedAt DateTime
  carrier   Carrier @relation(...)
}
```

---

## File Plan

| File | Change |
|------|--------|
| `apps/api/src/modules/carrier/carriers.service.ts` | Replace stub with real `prisma.csaScore.findMany({ where: { carrierId } })` |
| `apps/api/src/modules/carrier/dto/carrier-performance.dto.ts` | Verify/create response DTO |

---

## Expected Response

```typescript
interface CarrierPerformanceDto {
  carrierId: string;
  overallScore: number;       // Calculated from CSA scores
  onTimeDeliveryRate: number; // From load history
  claimsRate: number;         // Claims per 100 loads
  csaScores: {
    category: string;
    score: number;
    threshold: number;        // FMCSA threshold for this category
    updatedAt: string;
  }[];
  loadStats: {
    totalLoads: number;
    completedLoads: number;
    cancelledLoads: number;
    avgDaysToDeliver: number;
  };
}
```

---

## Acceptance Criteria

1. `GET /api/v1/carriers/:id/performance` returns real data from `CsaScore` table for that carrier
2. If no CSA scores exist, returns empty `csaScores: []` array (not error)
3. `onTimeDeliveryRate` is calculated from `LoadHistory` records (not hardcoded)
4. Response correctly filters by `carrierId`
5. `pnpm check-types` passes with 0 errors
6. 1 unit test: carrier with CSA scores returns them; carrier without scores returns empty array

---

## Dependencies

- **Blocks:** Carrier Scorecard page being meaningful
- **Blocked by:** None

---

## Verification

```bash
# Create a CsaScore record for a carrier (or seed it)
# Then hit the endpoint
curl http://localhost:3001/api/v1/carriers/{carrierId}/performance

# Verify it returns actual CsaScore data, not zeros
```

# PST-17 Credit Management — Per-Service Tribunal Audit

> **Date:** 2026-03-08
> **Auditor:** Claude Opus 4.6
> **Verdict:** MODIFY
> **Health Score:** 7.0/10 (was 2.0/10, +5.0)
> **Hub Accuracy:** ~85% surface (names/counts/paths), ~65% depth (field details)

---

## Executive Summary

Credit is the **MOST ACCURATELY DOCUMENTED SERVICE of all 17 audited** at the surface level: endpoint count 100% (31=31, 6th perfect match), endpoint paths ~100% (best ever), model names 100% (5/5). However, data model field accuracy is only ~65%, with CollectionActivity and PaymentPlan hub descriptions missing 50-60% of actual fields. Backend code quality is good with clean architecture, EventEmitter integration for all state transitions, and proper tenant isolation in 4/5 sub-services. Collections service has a soft-delete gap. RolesGuard enforcement is uncertain — `@Roles()` decorator used without `RolesGuard` in `@UseGuards()`. Hub LOC claim (~2,337) is wrong — actual is 1,719 service code + 768 tests = 2,487 total.

---

## File Inventory

**33 files** in `apps/api/src/modules/credit/`:
- 5 controllers (145 + 92 + 87 + 115 + 104 = 543 LOC)
- 5 services (357 + 195 + 131 + 224 + 231 = 1,138 LOC)
- 5 spec files (217 + 129 + 55 + 157 + 210 = 768 LOC)
- 1 module (38 LOC)
- 17 DTOs/enums
- **Total service code: 1,719 LOC** (hub claims ~2,337)
- **Total with tests: 2,487 LOC**
- Frontend: **0 pages, 0 hooks, 0 components** (confirmed correct)

---

## Data Model Audit

### Model Names: 5 hub = 5 actual — **100% MATCH**

| Model | Hub Fields | Actual Fields | Hub Accuracy | Key Differences |
|-------|-----------|--------------|-------------|-----------------|
| CreditApplication | 22 | 34 | ~75% | Missing 12: creditReportUrl, reviewedById/At, denialReason, conditions, approvedAt, expiresAt, externalId, sourceSystem, customFields, createdById, updatedById |
| CreditLimit | 18 | 23 | ~85% | Missing 5: externalId, sourceSystem, customFields, createdById, updatedById |
| CreditHold | 12 | 18 | ~80% | Missing 6: externalId, sourceSystem, customFields, createdById, updatedById, deletedAt |
| CollectionActivity | 8 | 23 | ~40% | Missing 15 fields. Hub `type`→actual `activityType`. Hub `notes`→actual `description`. Hub `assignedToId` doesn't exist. Prisma adds invoiceId, subject, outcome, contact fields, promised payment fields |
| PaymentPlan | 13 | 26 | ~45% | Missing 15+ fields. Hub `totalOwed`→actual `totalAmount`. Hub `startDate`→actual `firstPaymentDate`. Hub `cancelledById` doesn't exist. Prisma adds planNumber, installmentCount/sPaid, nextPaymentDate, interestRate, lateFees, invoiceIds, approvedBy/At, completedAt, defaultedAt |

---

## Endpoint Audit

### Count: 31 hub = 31 actual — **100% MATCH** (6th perfect count)
### Paths: **~100% accurate** (best of all 17 services)

| Controller | Hub | Actual | Status |
|-----------|-----|--------|--------|
| CreditApplicationsController | 8 | 8 | All paths exact match |
| CollectionsController | 6 | 6 | All paths exact match |
| CreditHoldsController | 5 | 5 | All paths exact match |
| CreditLimitsController | 6 | 6 | All paths exact match |
| PaymentPlansController | 6 | 6 | All paths exact match |

---

## Security Audit

### Guards

| Controller | JwtAuthGuard | RolesGuard | @Roles | Tenant Isolation |
|-----------|:----------:|:---------:|:------:|:---------------:|
| CreditApplicationsController | YES | **NO** | YES | YES |
| CollectionsController | YES | **NO** | YES | YES |
| CreditHoldsController | YES | **NO** | YES | YES |
| CreditLimitsController | YES | **NO** | YES | YES |
| PaymentPlansController | YES | **NO** | YES | YES |

**CRITICAL FINDING:** All 5 controllers use `@Roles()` decorator but NONE include `RolesGuard` in `@UseGuards()`. If RolesGuard is not globally registered, all role restrictions are decorative — any authenticated user could approve applications, create holds, etc.

### Soft-Delete Compliance

| Sub-Service | Reads Filter deletedAt | Writes Set deletedAt | Status |
|------------|:---------------------:|:-------------------:|--------|
| Applications | YES (all) | YES (delete) | COMPLIANT |
| Limits | YES (all) | N/A | COMPLIANT |
| Holds | YES (all) | N/A | COMPLIANT |
| Collections | **NO** (queue + historyByCustomer) | N/A | **BUG** |
| Payment Plans | YES (all) | N/A | COMPLIANT |

**BUG: `CollectionsService.queue()` (line 21-26) and `historyByCustomer()` (line 39-42) query WITHOUT `deletedAt: null` filter.** Deleted collection activities will appear in queue and customer history.

---

## Business Logic Audit

### Implemented
1. Application workflow: PENDING → UNDER_REVIEW → APPROVED/DENIED
2. Approve auto-creates/upserts CreditLimit via `upsertCreditLimit()`
3. **11 EventEmitter events** across all state transitions
4. Payment plan: 20% minimum down payment, 12 installment max
5. Aging report with 5 buckets (CURRENT, 1-30, 31-60, 61-90, 90+)
6. Credit utilization calculation with threshold events at 80% and 100%
7. Limit increase endpoint with positive validation
8. Follow-ups due query (activities with followUpDate <= now)
9. Application/Plan number generation with collision retry (max 4 attempts)
10. Module exports all 5 services (unlike Agents which exports nothing)

### NOT Implemented
1. **CreditHold → CreditLimit auto-suspend**: Hub says holds auto-suspend limits. Code does NOT connect them.
2. **Expiration cron**: No scheduled job for CreditApplication/CreditLimit expiry
3. **Auto-default detection**: No logic to auto-mark PaymentPlans as DEFAULTED on missed payments
4. **No @Audit decorators**: Financial operations lack audit trail
5. **No @Throttle rate limiting**: No rate limiting on any endpoint
6. **Hold release silently succeeds**: Returns hold instead of throwing when already released

---

## Tests

| Spec File | Tests | LOC | Coverage |
|-----------|-------|-----|----------|
| credit-applications.service.spec.ts | 19 | 217 | Core workflow |
| payment-plans.service.spec.ts | 14 | 210 | CRUD + payments |
| credit-limits.service.spec.ts | 11 | 157 | CRUD + utilization |
| collections.service.spec.ts | 10 | 129 | Queue + aging |
| credit-holds.service.spec.ts | **4** | **55** | Basic only |
| **Total** | **58** | **768** | — |

Hub claim: "5 spec files (768 LOC)" — **LOC exactly correct** (768=768). Hub says "not verified green" — fair assessment.

---

## Hub Claims Verification

| Hub Claim | Verdict | Evidence |
|-----------|---------|----------|
| "5 controllers, 31 endpoints" | **TRUE** | Exact match |
| "~2,337 LOC" | **FALSE** | 1,719 LOC service code, 2,487 with tests |
| "All controllers: JwtAuthGuard + tenantId + @Roles" | **PARTIAL** | JwtAuthGuard yes, @Roles yes, RolesGuard NOT in @UseGuards |
| "5 spec files exist (768 LOC)" | **TRUE** | Exact match |
| "Frontend Not Built" | **TRUE** | 0 pages, 0 hooks, 0 components confirmed |
| "CreditHold -> CreditLimit auto-suspend unverified" | **CORRECT** — it's NOT implemented | No integration exists |
| "Payment plan defaulting logic unverified" | **CORRECT** — it's NOT implemented | No auto-default detection |
| Data model (5 models) | **Names 100%**, fields ~65% | CollectionActivity and PaymentPlan substantially incomplete |

---

## Tribunal Verdicts (5 Rounds)

1. **Surface accuracy vs depth accuracy**: Hub is excellent on surface (names, counts, paths) but poor on field details (~65%). Score reflects bifurcation.
2. **RolesGuard enforcement**: `@Roles()` without `RolesGuard` in `@UseGuards()` — MEDIUM-HIGH risk pending global registration verification.
3. **Collections soft-delete gap**: MEDIUM severity data quality issue. Not security but consistency.
4. **Hold → Limit integration gap**: P1 — documented behavior not implemented. Events emitted but no listener.
5. **Test distribution**: 58 tests adequate overall but holds (4 tests, 55 LOC) is dangerously thin.

---

## Action Items

| # | Priority | Action | Target |
|---|----------|--------|--------|
| 1 | **P0** | Verify RolesGuard global registration in main.ts. If NOT global, add to all 5 controllers | All controllers |
| 2 | **P1** | Add `deletedAt: null` to `CollectionsService.queue()` and `historyByCustomer()` | collections.service.ts:21,39 |
| 3 | **P1** | Implement CreditHold → CreditLimit auto-suspend (on hold.placed event) | credit-holds.service.ts |
| 4 | **P2** | Add expiration cron for CreditApplication + CreditLimit expiresAt | New cron job |
| 5 | **P2** | Add auto-default detection for PaymentPlan missed payments | New cron job |
| 6 | **P2** | Expand credit-holds.service.spec.ts from 4 → 12+ tests | holds spec |
| 7 | **P2** | Add @Audit decorators on approve, reject, record-payment, cancel | All financial endpoints |
| 8 | **P2** | Fix hold release to throw on already-released holds (match hub contract) | credit-holds.service.ts:93 |
| 9 | **P3** | Hub: Fix CollectionActivity data model (add 15 missing fields, fix names) | 17-credit.md |
| 10 | **P3** | Hub: Fix PaymentPlan data model (add 15+ fields, fix totalOwed→totalAmount) | 17-credit.md |
| 11 | **P3** | Hub: Fix CreditApplication data model (add 12 missing fields) | 17-credit.md |
| 12 | **P3** | Hub: Update LOC from ~2,337 to 1,719/2,487 | 17-credit.md |

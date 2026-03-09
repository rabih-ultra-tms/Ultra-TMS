# PST-18: Factoring Internal — Per-Service Tribunal Audit

> **Date:** 2026-03-08 | **Auditor:** Claude Opus 4.6
> **Hub file:** `dev_docs_v3/01-services/p2-extended/18-factoring-internal.md`
> **Backend module:** `apps/api/src/modules/factoring/` (35 files, 2,605 LOC)
> **Verdict:** MODIFY | **Health Score:** 7.5/10 (was 2.0)

---

## Phase 1: Hub vs Reality — Data Model

### Models (5/5 correct names — 100%)

| Hub Model | Prisma Model | Name Match | Field Accuracy |
|-----------|-------------|------------|----------------|
| FactoringCompany | FactoringCompany | 100% | ~85% — missing createdById, updatedById |
| CarrierFactoringStatus | CarrierFactoringStatus | 100% | ~85% — missing createdById, updatedById, Tenant relation |
| NOARecord | NOARecord | 100% | ~85% — missing createdById, updatedById, carrier relation |
| FactoredPayment | FactoredPayment | 100% | ~85% — missing createdById, updatedById |
| FactoringVerification | FactoringVerification | 100% | ~80% — missing createdById, updatedById, Document relation |

**Hub accuracy: ~90%.** All 5 model names correct. Core fields correct. Missing only standard audit fields (createdById/updatedById) and some relations (Document on FactoringVerification, Carrier on NOARecord).

### Enums

| Hub Enum | Actual | Match |
|----------|--------|-------|
| FactoringStatus (NONE/FACTORED/QUICK_PAY_ONLY) | FactoringStatus (same) | 100% |
| NOAStatus (PENDING/VERIFIED/ACTIVE/EXPIRED/RELEASED) | NoaStatus (same values, different casing) | 100% |
| FactoringCompanyStatus | FactoringCompanyStatus (ACTIVE/INACTIVE) | 100% |
| VerificationMethod (PHONE/EMAIL/API/FAX) | VerificationMethod (PHONE_CALL/EMAIL/FAX/ONLINE_PORTAL/MAIL) | ~40% — values differ |
| VerificationStatus (not documented) | VerificationStatus (PENDING/VERIFIED/PARTIAL/DECLINED) | Not in hub |
| FactoredPaymentStatus (not documented) | FactoredPaymentStatus (PENDING/SCHEDULED/PROCESSING/PAID/FAILED) | Not in hub |
| PaymentMethodType (not documented) | PaymentMethodType (ACH/CHECK/WIRE/CREDIT_CARD) | Not in hub |

**Finding:** Hub documents 4 enums; reality has 7. VerificationMethod values differ (hub says API/PHONE, code says ONLINE_PORTAL/PHONE_CALL/MAIL). 3 enums entirely undocumented.

---

## Phase 2: Hub vs Reality — Endpoints

### Endpoint Count: 30 = 30 (7th perfect match!)

| Controller | Hub Count | Actual Count | Match |
|-----------|-----------|-------------|-------|
| CarrierFactoringStatusController | 6 | 6 | 100% |
| FactoringCompaniesController | 6 | 6 | 100% |
| NoaRecordsController | 7 | 7 | 100% |
| FactoringVerificationsController | 6 | 6 | 100% |
| FactoredPaymentsController | 5 | 5 | 100% |
| **Total** | **30** | **30** | **100%** |

### Endpoint Paths: ~100% accurate

Every endpoint path in the hub matches the actual code. Controller prefixes, parameter names, HTTP methods — all correct.

**This is the MOST ACCURATE hub for endpoints of all 18 services audited.** Perfect count AND perfect paths.

---

## Phase 3: Security & Data Integrity

### Guard Coverage: 2/5 controllers have RolesGuard

| Controller | JwtAuthGuard | RolesGuard | @Roles | Risk |
|-----------|-------------|------------|--------|------|
| FactoringCompaniesController | Yes | **Yes** | ADMIN, FACTORING_MANAGER, ACCOUNTING | LOW |
| FactoringVerificationsController | Yes | **Yes** | ADMIN, FACTORING_MANAGER, ACCOUNTING, BILLING | LOW |
| CarrierFactoringStatusController | Yes | **No** | @Roles present but decorative | HIGH |
| NoaRecordsController | Yes | **No** | @Roles present but decorative | HIGH |
| FactoredPaymentsController | Yes | **No** | @Roles present but decorative | HIGH |

**Hub says "Unknown"** — now verified. 3/5 controllers have @Roles decorators but NO RolesGuard in @UseGuards, making roles decorative. Same systemic pattern seen in 8+ previous services.

### Tenant Isolation: 100%

All services consistently filter by tenantId. Cross-tenant data leaks found: **1 bug**.

**BUG: companyCode uniqueness check is cross-tenant.** In `FactoringCompaniesService.create()` line 18-19:
```typescript
findFirst({ where: { companyCode: dto.companyCode, deletedAt: null } })
```
Missing `tenantId` — a company code used in Tenant A would block Tenant B from using the same code.

Same bug in `update()` line 95-97.

### Soft-Delete Compliance: 90%

| Service | deletedAt Filter | Soft Delete on Remove |
|---------|-----------------|----------------------|
| FactoringCompaniesService | Yes | Yes (sets deletedAt + INACTIVE) |
| NoaRecordsService | Yes | Yes |
| FactoredPaymentsService | Yes | N/A (no remove) |
| FactoringVerificationsService | Yes | N/A (no remove) |
| CarrierFactoringStatusService | **No** on getOrCreateStatus | N/A |
| PaymentRoutingService | Yes | N/A |

**BUG:** `CarrierFactoringStatusService.getOrCreateStatus()` queries without `deletedAt: null`. A soft-deleted status record would still be returned and used for payment routing.

### SECURITY BUG: apiKey returned in plaintext

**CONFIRMED.** `FactoringCompaniesService.findAll()` and `findOne()` return the full Prisma object including the `apiKey` field. No field exclusion, no serialization interceptor, no `@Exclude()` decorator. Any authenticated user with ACCOUNTING role can read all factoring company API keys.

---

## Phase 4: Tests & DTO Validation

### Tests: 49 tests / 6 spec files / 656 LOC

| Spec File | Tests | LOC |
|-----------|-------|-----|
| factoring-companies.service.spec.ts | 11 | 142 |
| carrier-factoring-status.service.spec.ts | 5 | 86 |
| noa-records.service.spec.ts | 21 | 255 |
| factored-payments.service.spec.ts | 4 | 58 |
| factoring-verifications.service.spec.ts | 4 | 61 |
| payment-routing.service.spec.ts | 4 | 54 |
| **Total** | **49** | **656** |

**Hub claims "None" — FALSE (12th false "no tests" claim across all services).**

### DTO Validation: 16 DTO files (hub claims "only enums.ts")

| Sub-module | DTO Files | Count |
|-----------|-----------|-------|
| carrier-status/dto/ | enroll-quick-pay, override-factoring, update-carrier-factoring-status | 3 |
| companies/dto/ | create-factoring-company, update-factoring-company, factoring-company-query | 3 |
| noa/dto/ | create-noa-record, update-noa-record, verify-noa, release-noa, noa-query | 5 |
| payments/dto/ | payment-query, process-payment | 2 |
| verifications/dto/ | create-verification, respond-verification, verification-query | 3 |
| dto/ | enums | 1 |
| **Total** | | **17** |

**Hub says "only `enums.ts` in `dto/` dir" — FALSE.** 16 proper DTO files exist across sub-modules. Hub only checked the root `dto/` directory.

---

## Phase 5: Architecture & Business Logic

### Event-Driven Architecture: 10 EventEmitter events

| Event | Service | Purpose |
|-------|---------|---------|
| factoring.company.created | FactoringCompaniesService | New company registered |
| carrier.factoring.updated | CarrierFactoringStatusService, NoaRecordsService | Status change on carrier |
| carrier.quickpay.enrolled | CarrierFactoringStatusService | Quick-pay enrollment |
| noa.received | NoaRecordsService | New NOA created |
| noa.verified | NoaRecordsService | NOA verification completed |
| noa.released | NoaRecordsService | NOA relationship ended |
| noa.expired | NoaRecordsService | NOA auto-expired on read |
| verification.requested | FactoringVerificationsService | New verification initiated |
| verification.responded | FactoringVerificationsService | Verification response recorded |
| factored.payment.processed | FactoredPaymentsService | Payment processed |

**Hub documents 0 events.** This is a well-event-driven module.

### NOA Auto-Expiration

Hub says "No scheduled job for auto-expiring NOAs" — **PARTIALLY TRUE.** No cron job exists, but lazy auto-expiration IS implemented via `autoExpireIfNeeded()` in NoaRecordsService. On every read (findAll, findOne, getCarrierNoa), expired NOAs are automatically updated to EXPIRED status. This means NOAs expire when accessed but not proactively — a background-loading carrier detail page would trigger it, but batch reporting would not unless it reads each NOA.

### Payment Status in customFields

The `FactoredPaymentStatus` enum (PENDING/SCHEDULED/PROCESSING/PAID/FAILED) is NOT a Prisma column — payment status is stored inside `customFields.status` JSON path. This is architecturally fragile: no DB-level enum validation, no index on status, and JSON path queries are slower.

### Module Exports: All 6 services

```typescript
exports: [
  FactoringCompaniesService, NoaRecordsService,
  CarrierFactoringStatusService, FactoringVerificationsService,
  FactoredPaymentsService, PaymentRoutingService,
]
```

Well-designed for cross-module consumption (e.g., Accounting calling PaymentRoutingService).

### PaymentRoutingService: Excellent Business Logic

The `determineDestination()` method implements a proper priority chain:
1. Override (temporary factoring company override with expiry) → highest priority
2. FACTORED + active NOA → route to factoring company
3. QUICK_PAY_ONLY → route with quick-pay fee
4. Default → route to carrier directly

This is sophisticated, production-quality routing logic. Hub doesn't document the override system at all.

---

## Hub Known Issues Assessment

| Hub Issue | Hub Says | Reality | Accurate? |
|-----------|----------|---------|-----------|
| No frontend exists | Open | TRUE — 0 pages confirmed | YES |
| No tests | Open | FALSE — 49 tests / 6 spec files / 656 LOC | NO (12th false claim) |
| apiKey plaintext in GET | P1 Security | TRUE — CONFIRMED, no masking | YES |
| PaymentRoutingService no controller | By design | TRUE — internal service only | YES |
| Guard coverage not verified | P1 Security | NOW VERIFIED: 3/5 missing RolesGuard | UPDATED |
| No NOA auto-expire job | P2 | PARTIALLY FALSE — lazy expiration exists via autoExpireIfNeeded() | PARTIAL |
| DTO validation unknown | P2 | FALSE — 16 DTO files exist across sub-modules | NO |

---

## Tribunal Verdicts (5 Rounds)

### Round 1: Is the hub accurate enough to guide development?
**VERDICT:** Hub is the MOST ACCURATE of all 18 services for endpoint documentation (~100% path + count accuracy). Data model ~90%. But it falsely claims no tests, no DTOs, and misses the entire event-driven architecture. **MODIFY** — update sections 2, 6 (tests), 7 (DTOs), add events section.

### Round 2: Are there critical security issues?
**VERDICT:** YES, two:
1. **P0: apiKey plaintext leak** — any authenticated user with ACCOUNTING role reads factoring company API keys. Must add field exclusion.
2. **P1: 3/5 controllers decorative @Roles** — RolesGuard not in @UseGuards on CarrierFactoringStatus, NoaRecords, FactoredPayments.
3. **P2: companyCode cross-tenant uniqueness** — blocks unrelated tenants from using same codes.

### Round 3: Is the business logic correct?
**VERDICT:** Mostly excellent. PaymentRoutingService has sophisticated priority chain. NOA lifecycle (create→verify→activate→expire/release) properly updates CarrierFactoringStatus. Quick-pay enrollment correctly prevents status regression. One gap: payment status stored in customFields JSON instead of proper Prisma field — fragile but functional.

### Round 4: What's the real health score?
**VERDICT:** 7.5/10 (was 2.0, +5.5 — **NEW LARGEST SCORE JUMP**)
- Backend is fully implemented with proper business logic (+3)
- Event-driven architecture with 10 events (+1)
- 49 tests exist (+1)
- Full DTO validation (+0.5)
- Docked for: apiKey leak (-1), 3/5 RolesGuard missing (-0.5), companyCode cross-tenant (-0.5), payment status in JSON (-0.5)

### Round 5: What are the priority action items?
1. **P0:** Mask `apiKey` in FactoringCompany GET responses (add `@Exclude()` or select clause)
2. **P1:** Add `RolesGuard` to CarrierFactoringStatus, NoaRecords, FactoredPayments controllers
3. **P1:** Add `tenantId` to companyCode uniqueness check (create + update)
4. **P2:** Add `deletedAt: null` to `getOrCreateStatus()` query
5. **P2:** Move `FactoredPaymentStatus` from customFields to proper Prisma column
6. **P2:** Add cron job for proactive NOA expiration (supplement lazy expiration)
7. **DOC:** Update hub Section 2 — tests exist (49/6 spec/656 LOC)
8. **DOC:** Update hub Section 7 (DTO validation) — 16 DTO files, not "only enums.ts"
9. **DOC:** Update hub Section 11 known issues — 2/7 confirmed false
10. **DOC:** Add EventEmitter events documentation (10 events)
11. **DOC:** Update VerificationMethod enum values (PHONE_CALL not PHONE, ONLINE_PORTAL not API)
12. **DOC:** Document PaymentRoutingService override system

---

## Summary Statistics

| Metric | Hub Claims | Reality | Delta |
|--------|-----------|---------|-------|
| Endpoint count | ~30 | 30 | 0 (7th perfect match) |
| Endpoint paths | Listed | ~100% accurate | Best ever (tied) |
| Model names | 5 | 5 | 0 (100%) |
| Model fields | Documented | ~85% accurate | Missing audit fields |
| Enums | 4 | 7 | +3 undocumented |
| Tests | "None" | 49 tests / 6 specs / 656 LOC | 12th false claim |
| DTO files | "only enums.ts" | 17 files | False claim |
| Events | 0 documented | 10 EventEmitter events | Entirely undocumented |
| RolesGuard | "Unknown" | 2/5 controllers | Verified |
| Module exports | Not mentioned | All 6 services | Well-designed |
| Total LOC | Not mentioned | 2,605 | Substantial module |
| Health score | 2/10 | 7.5/10 | +5.5 (NEW LARGEST JUMP) |

**BATCH 3 (P2 Financial) COMPLETE: 5/5 services audited.**

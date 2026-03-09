# PST-14: Carrier Portal — Per-Service Tribunal Audit

> **Service:** #14 Carrier Portal
> **Hub file:** `dev_docs_v3/01-services/p1-post-mvp/14-carrier-portal.md`
> **Auditor:** Claude Opus 4.6 | **Date:** 2026-03-08
> **Verdict:** MODIFY | **Health Score:** 7.5/10 (was 2.5)

---

## Phase 1: Hub vs Reality — Data Model

### Models

| Hub Claim | Reality | Delta |
|-----------|---------|-------|
| 5 portal-specific models | **8 models** (6 portal-specific + 2 portal-linked) | Hub misses 3 models |
| CarrierSavedLoad listed under "Shared TMS Models" | CarrierSavedLoad is **portal-specific** (FK to CarrierPortalUser, not Carrier) | Misclassified |
| CarrierInvoiceSubmission listed under "Shared" | Portal-linked model with FK to CarrierPortalUser | Misclassified |
| No mention of CarrierQuickPayRequest | **Exists** — full quick pay workflow model (requestedAmount, feePercent, feeAmount, netAmount, QuickPayStatus enum) | Missing from hub |
| 5 enums | **6 enums** (missing PortalUserRole: ADMIN, USER, VIEW_ONLY) | -1 enum |

### Field Accuracy per Model

| Model | Hub Accuracy | Issues |
|-------|-------------|--------|
| CarrierPortalUser | ~80% | Missing: externalId, sourceSystem, createdById, updatedById. Role default is DISPATCHER not listed. Has CarrierQuickPayRequest[] and CarrierSavedLoad[] relations. |
| CarrierPortalSession | ~85% | Missing: externalId, sourceSystem, createdById, updatedById. carrierId is optional (hub implies required). |
| CarrierPortalDocument | ~85% | Missing: externalId, sourceSystem, createdById, updatedById. Same pattern. |
| CarrierPortalNotification | ~90% | Most accurate. Missing migration-first fields. |
| CarrierPortalActivityLog | ~85% | carrierId is optional (hub omits). Missing migration-first fields. |
| CarrierSavedLoad | 0% (not in hub Section 8) | Full model: postingId, notes, reminderDate, savedFrom + migration fields |
| CarrierInvoiceSubmission | 0% (mentioned as "Shared") | Portal-linked: invoiceNumber, amount, invoiceDate, status, reviewedBy |
| CarrierQuickPayRequest | 0% (not documented) | Full model: requestedAmount, feePercent (2%), feeAmount, netAmount, QuickPayStatus |

**Data Model Score: 6/10** — Core 5 models ~85% field-accurate, but 3 models missing/misclassified. Migration-first fields (externalId, sourceSystem, customFields, createdById, updatedById) systematically omitted from all models (cross-cutting pattern).

---

## Phase 2: Hub vs Reality — Endpoints

### Endpoint Count

| Hub Claim | Reality | Delta |
|-----------|---------|-------|
| 54 endpoints total | **56 endpoints total** | +2 (3.7% delta) |
| Auth: 7 | Auth: **7** | Match ✓ |
| Dashboard: 5 | Dashboard: **5** | Match ✓ |
| Users: 8 | Users: **8** | Match ✓ |
| Loads: 15 | Loads: **17** | +2 (save/unsave/saved/bid/matching) |
| Documents: 6 | Documents: **6** | Match ✓ |
| Invoices: 8 | Invoices: **8** | Match ✓ |
| Compliance: 5 | Compliance: **5** | Match ✓ |

### Endpoint Path Accuracy

**Auth Controller** — 5/7 paths correct (71%)

| Hub Path | Actual Path | Match? |
|----------|-------------|--------|
| POST /auth/login | POST /auth/login | ✓ |
| POST /auth/register | POST /auth/register | ✓ |
| POST /auth/forgot-password | POST /auth/forgot-password | ✓ |
| POST /auth/reset-password | POST /auth/reset-password | ✓ |
| POST /auth/verify | **GET /auth/verify-email/:token** | ✗ (method + path wrong) |
| POST /auth/refresh | POST /auth/refresh | ✓ |
| POST /auth/logout | POST /auth/logout | ✓ |

**Dashboard Controller** — 1/5 paths correct (20%)

| Hub Path | Actual Path | Match? |
|----------|-------------|--------|
| GET /dashboard | GET /dashboard | ✓ |
| GET /dashboard/stats | **GET /dashboard/active-loads** | ✗ |
| GET /dashboard/upcoming | **GET /dashboard/payment-summary** | ✗ |
| GET /dashboard/alerts | GET /dashboard/alerts | ✓ (close) |
| GET /dashboard/activity | **GET /dashboard/compliance** | ✗ |

**Loads Controller** — 10/17 paths (hub only documents 15, 2 missing)

| Hub Path | Actual Path | Match? |
|----------|-------------|--------|
| GET /loads | GET /loads | ✓ |
| GET /loads/available | GET /loads/available | ✓ |
| GET /loads/:id | GET /loads/:id | ✓ |
| POST /loads/:id/accept | POST /loads/:id/accept | ✓ |
| POST /loads/:id/reject | **POST /loads/:id/decline** | ✗ (reject→decline) |
| GET /loads/:id/stops | **Not found** | ✗ (phantom) |
| PATCH /loads/:id/stops/:stopId/arrive | **Not found** | ✗ (phantom) |
| PATCH /loads/:id/stops/:stopId/depart | **Not found** | ✗ (phantom) |
| GET /loads/:id/checkcalls | **Not found** | ✗ (phantom — no check call endpoints in portal) |
| POST /loads/:id/checkcalls | **Not found** | ✗ (phantom) |
| GET /loads/:id/rate-confirmation | **Not found** | ✗ (phantom) |
| POST /loads/:id/rate-confirmation/sign | **Not found** | ✗ (phantom) |
| GET /loads/:id/documents | **Not found in loads controller** | ✗ (in documents controller) |
| GET /loads/stats | **Not found** | ✗ (phantom) |
| GET /loads/:id/timeline | **Not found** | ✗ (phantom) |
| — | GET /loads/available/:id | Missing from hub |
| — | POST /loads/available/:id/save | Missing from hub |
| — | DELETE /loads/saved/:id | Missing from hub |
| — | GET /loads/saved | Missing from hub |
| — | POST /loads/:id/bid | Missing from hub |
| — | GET /loads/matching | Missing from hub |
| — | POST /loads/:id/status | Missing from hub |
| — | POST /loads/:id/location | Missing from hub |
| — | POST /loads/:id/eta | Missing from hub |
| — | POST /loads/:id/message | Missing from hub |

**CRITICAL FINDING:** Hub documents 15 loads endpoints. Reality has 17 endpoints, but **9 of hub's 15 are PHANTOM** (stops, checkcalls, rate-confirmation, timeline, stats don't exist). The real endpoints are completely different — save/bid/matching/status/location/eta/message pattern instead of stops/checkcalls/rate-con pattern.

**Invoices Controller** — 3/8 paths correct (37.5%)

| Hub Path | Actual Path | Match? |
|----------|-------------|--------|
| GET /invoices | GET /invoices | ✓ |
| GET /invoices/:id | GET /invoices/:id | ✓ |
| GET /invoices/stats | **POST /invoices** (submit) | ✗ |
| GET /settlements | GET /settlements | ✓ |
| GET /settlements/:id | GET /settlements/:id | ✓ |
| GET /payments | **GET /payment-history** | ✗ |
| GET /payments/:id | **POST /quick-pay/:settlementId** | ✗ |
| GET /payments/summary | **GET /settlements/:id/pdf** | ✗ |

**Documents Controller** — 4/6 paths correct (67%)

| Hub Path | Actual Path | Match? |
|----------|-------------|--------|
| GET /documents | GET /documents | ✓ |
| GET /documents/:id | GET /documents/:id | ✓ |
| POST /documents | POST /documents | ✓ |
| DELETE /documents/:id | DELETE /documents/:id | ✓ |
| GET /documents/:id/download | **POST /loads/:id/pod** | ✗ |
| POST /documents/upload | **POST /loads/:id/documents** | ✗ |

**Compliance Controller** — 2/5 paths correct (40%)

| Hub Path | Actual Path | Match? |
|----------|-------------|--------|
| GET /compliance | GET /compliance | ✓ |
| GET /compliance/insurance | **GET /compliance/documents** | ✗ |
| POST /compliance/insurance | **POST /compliance/documents** | ✗ |
| GET /compliance/authority | **GET /compliance/documents/:id** | ✗ |
| GET /compliance/expiring | GET /compliance/expiring | ✓ |

### Endpoint Accuracy Summary

| Controller | Hub Count | Actual Count | Paths Correct | Accuracy |
|------------|-----------|-------------|---------------|----------|
| Auth | 7 | 7 | 5/7 | 71% |
| Dashboard | 5 | 5 | 2/5 | 40% |
| Users | 8 | 8 | ~6/8 | 75% |
| Loads | 15 | 17 | 5/15 | 33% |
| Documents | 6 | 6 | 4/6 | 67% |
| Invoices | 8 | 8 | 4/8 | 50% |
| Compliance | 5 | 5 | 2/5 | 40% |
| **TOTAL** | **54** | **56** | **28/54** | **52%** |

**Endpoint Score: 5/10** — Count is close (54 vs 56, 96.4% accurate), but path accuracy is only 52%. The Loads controller is worst — 9 phantom endpoints, 7 real endpoints undocumented. The hub appears to have been written from the design specs, not from the actual code.

---

## Phase 3: Hub vs Reality — Frontend, Hooks, Components

| Hub Claim | Reality | Verdict |
|-----------|---------|---------|
| Frontend: "Not Built" — 0 pages | **0 pages** — confirmed | ✓ CORRECT |
| Components: "No components exist" | **0 components** — confirmed | ✓ CORRECT |
| Hooks: "No hooks exist" | **0 hooks** — confirmed | ✓ CORRECT |
| No separate portal app | Confirmed — portal would be part of main web app | ✓ CORRECT |

**Frontend Score: 10/10** — Hub is 100% accurate on frontend status. This is the first service where "Not Built" is genuinely correct.

---

## Phase 4: Hub vs Reality — Tests & Security

### Tests

| Hub Claim | Reality | Delta |
|-----------|---------|-------|
| "7 service spec files (likely stubs)" | **9 unit test files, ALL REAL** (0 stubs) | Hub wrong on count AND quality |
| "1 e2e test (80 lines, basic login)" | **1 e2e test, 179 LOC**, covers auth + profile + users + loads | Hub LOC wrong (80 vs 179) |
| Total: 8 test files | **10 test files** (9 unit + 1 e2e) | +2 (hub missed guard tests) |
| Implied: ~8 test cases | **69 test cases** | 8.6x more |
| No LOC estimate | **911 LOC total** | N/A |

**Hub missed:**
- `carrier-portal-auth.guard.spec.ts` (4 tests, 57 LOC)
- `carrier-scope.guard.spec.ts` (2 tests, 26 LOC)

**Test quality:** ALL 69 tests are real — proper mocks, assertions, error boundary testing. Hub's "(likely stubs)" claim is the 8th false "stubs" assertion across the audit series.

**Test Score: 3/10** — Hub wildly underestimates test suite (8→69 cases, "stubs"→real, 80→911 LOC).

### Security

| Hub Claim | Reality | Delta |
|-----------|---------|-------|
| "Logout endpoint missing auth guard" | **All 7 auth endpoints are unguarded** (correct pattern for auth). Logout uses `req.carrierPortalUser?.id` with optional chaining — not a crash risk, but logout without auth means anyone can call it (no-op). | Technically true but low-severity |
| "No API rate limiting on portal auth endpoints" | **Login HAS @Throttle** (5 req/60s). Register, forgot/reset password NOT throttled. | Partially false |
| "Separate JWT auth flow not tested e2e" | **E2E test covers full auth flow** (login→refresh→forgot→reset→relogin→logout) | FALSE |
| "Token storage strategy undefined" | Correct — no frontend exists, so strategy is indeed undefined | TRUE |
| Guard architecture | **Dual guard: CarrierPortalAuthGuard + CarrierScopeGuard** — same pattern as Customer Portal (PST-13). 50/56 endpoints protected. | Excellent |
| Tenant isolation | **95%** — All services filter by tenantId + carrierId. Login() queries by email only (no tenantId filter) — potential multi-tenant collision. | Good with 1 gap |
| Soft delete | **20%** — CRITICAL GAP. Only login() and listUsers() check `deletedAt: null`. Dashboard, compliance, documents, invoices, loads services all return soft-deleted records. | CRITICAL |

**Security Score: 7/10** — Dual guard architecture is solid (100% on protected routes), but soft-delete gap is critical and rate limiting is incomplete.

---

## Phase 5: Hub vs Reality — Known Issues

| # | Hub Issue | Verdict | Notes |
|---|-----------|---------|-------|
| 1 | "No frontend portal built at all" | **TRUE** ✓ | Confirmed — 0 pages, 0 components, 0 hooks |
| 2 | "54 backend endpoints with minimal tests" | **PARTIALLY FALSE** | 56 endpoints (not 54). 69 real tests, not "minimal". Hub's "(likely stubs)" is false. |
| 3 | "Logout endpoint missing auth guard" | **TRUE** but low severity | All auth endpoints unguarded (correct pattern). Optional chaining prevents crash. |
| 4 | "Register tenant resolution fragile" | **TRUE** | Falls back to 'default-tenant' — confirmed in auth service |
| 5 | "Document storage paths hardcoded" | **LIKELY TRUE** | Services create document records, no S3/cloud integration seen |
| 6 | "Mobile-optimized design not started" | **TRUE** ✓ | No frontend exists |
| 7 | "Rate confirmation e-signature not integrated" | **PARTIALLY FALSE** | No rate-con endpoint exists at all in portal (phantom in hub). Backend doesn't have rate-con sign. |
| 8 | "Separate JWT auth flow not tested e2e" | **FALSE** | E2E test covers full auth flow (179 LOC) |
| 9 | "Token storage strategy undefined" | **TRUE** ✓ | No frontend, so correct |
| 10 | "No WebSocket integration" | **TRUE** ✓ | Correct |
| 11 | "Support chat not designed" | **TRUE** ✓ | Correct |
| 12 | "No API rate limiting on portal auth endpoints" | **PARTIALLY FALSE** | Login HAS @Throttle. Others don't. |
| 13 | "Backend endpoint paths need verification" | **TRUE — CRITICAL** | 48% of paths wrong. Hub documents phantom endpoints. |

**Known Issues Score: 5/10** — 7 correct, 2 partially false, 2 false, 2 have wrong severity.

---

## Tribunal Rounds

### Round 1: "Hub endpoint paths are mostly inferred from design specs, not verified against code"

**Evidence:** 48% path inaccuracy. The Loads controller has 9 phantom endpoints (stops, checkcalls, rate-confirmation, timeline, stats) that match design specs exactly but don't exist in code. The real endpoints (save, bid, matching, status, location, eta, message) are completely undocumented.

**Verdict:** CONFIRMED. Hub Section 4 was written from design specs, not code. This is consistent with the systemic pattern found in PST-01 through PST-13.

### Round 2: "Test suite is much more comprehensive than hub suggests"

**Evidence:** Hub says "7 service spec files (likely stubs) + 1 e2e test (80 lines)". Reality: 10 files, 69 test cases, 911 LOC, 100% real tests. E2E is 179 LOC (2.2x hub estimate). This is the 8th service where hub's "stubs" claim is false.

**Verdict:** CONFIRMED. Hub systematically underestimates test quality across all services.

### Round 3: "Soft-delete gap is CRITICAL for portal — carriers could see deleted loads/invoices"

**Evidence:** Only `login()` and `listUsers()` check `deletedAt: null`. The loads service returns deleted loads. The invoices service returns deleted invoices/settlements. The documents service returns deleted documents. In a carrier-facing portal, showing deleted data is worse than in the internal TMS — it creates confusion, trust issues, and potential disputes.

**Counter-argument:** The data might never actually be soft-deleted since no delete endpoints exist for most entities.

**Verdict:** CRITICAL. While deletion may be rare, the gap means any admin-side soft-deletion leaks through to the portal. Must fix before portal frontend launch.

### Round 4: "Login tenant isolation gap — is it really exploitable?"

**Evidence:** `login()` queries `findFirst({ where: { email: dto.email, deletedAt: null } })` without tenantId. If the same email registers under two tenants, the first match wins — user could access wrong tenant's data.

**Counter-argument:** Registration requires `carrierId`, and carriers are tenant-scoped. So a CarrierPortalUser email is unique per `[tenantId, email]` (@@unique constraint). If tenant A and tenant B both have `driver@example.com`, login returns the first DB match.

**Verdict:** CONFIRMED VULNERABILITY. The @@unique constraint only prevents duplicates within a tenant, not across tenants. Login without tenantId is a cross-tenant auth bypass for shared email addresses.

### Round 5: "Quick pay system is completely undocumented"

**Evidence:** Hub Section 4 (Invoices) lists GET endpoints only for payments. Reality: `POST /quick-pay/:settlementId` endpoint exists with `RequestQuickPayDto`, 2% fee calculation, $100 minimum. `CarrierQuickPayRequest` model exists in Prisma. The entire quick pay workflow (request → fee calculation → net amount → status tracking) is undocumented.

**Verdict:** CONFIRMED. Quick pay is a significant business feature — carrier self-service early payment with fee — that the hub doesn't document at all.

---

## Health Score Calculation

| Category | Weight | Hub Score | Actual Score | Notes |
|----------|--------|-----------|-------------|-------|
| Data Model | 15% | 6/10 | 6/10 | 5 models ~85% accurate, 3 missing |
| Endpoints | 20% | 5/10 | 5/10 | Count 96% accurate, paths 52% accurate, 9 phantoms |
| Frontend | 10% | 10/10 | 10/10 | "Not Built" is genuinely correct |
| Tests | 10% | 3/10 | 3/10 | 8→69 cases, "stubs"→real, 2.2x LOC delta |
| Security | 20% | 7/10 | 7/10 | Dual guard excellent, soft-delete CRITICAL, login tenant gap |
| Known Issues | 10% | 5/10 | 5/10 | 7 correct, 4 wrong/partially wrong |
| Business Logic | 15% | 8/10 | 8/10 | Well-structured services, role-based access, quick pay |

**Overall Hub Documentation Quality: 5.5/10**

**Actual Code Quality: 7.5/10** (was hub's 2.5/10)
- Backend is well-architected: dual guard, 12 DTOs, 7 controllers, clean module structure
- 69 real tests covering auth, services, guards, and e2e
- Quick pay, saved loads, bid system — richer than hub suggests
- Dragged down by: soft-delete gaps (critical), login tenant isolation, incomplete rate limiting

---

## Action Items

### CRITICAL (fix before portal frontend launch)

1. **Fix soft-delete filtering** — Add `deletedAt: null` to ALL findMany/findFirst queries in dashboard, compliance, documents, invoices, loads services
2. **Fix login tenant isolation** — Add tenantId to login query (require tenant header or subdomain-based resolution)
3. **Fix rate limiting** — Add @Throttle to register, forgotPassword, resetPassword endpoints

### HIGH (hub corrections)

4. **Rewrite Section 4 (Endpoints)** — 48% of paths are wrong. Must verify every path against actual @Controller/@Get/@Post decorators
5. **Add missing Loads endpoints** — save, unsave, saved, bid, matching, status, location, eta, message (10 undocumented)
6. **Remove phantom Loads endpoints** — stops, checkcalls, rate-confirmation, timeline, stats don't exist
7. **Document CarrierQuickPayRequest model** — Full quick pay workflow model missing from hub
8. **Reclassify CarrierSavedLoad** — Portal-specific model, not "Shared TMS"
9. **Update test counts** — 10 files, 69 tests, 911 LOC, all real (not "7 stubs + 1 e2e 80 lines")
10. **Fix Known Issue #8** — "Separate JWT auth flow not tested e2e" is FALSE (179 LOC e2e exists)
11. **Fix Known Issue #12** — "No API rate limiting" is partially false (login IS throttled)

### MEDIUM (improvements)

12. **Add role-based guards for admin actions** — inviteUser, updateUser, deactivateUser have service-level role checks but no decorator-level @Roles() guard
13. **Document quick pay business rules** — 2% fee, $100 minimum settlement, acceptTerms required
14. **Add download endpoint** — Hub documents `GET /documents/:id/download` but it doesn't exist
15. **Consider check call endpoints** — Hub documents them (from design spec), actual implementation doesn't have them in portal. Decide if needed.

---

## Cross-Cutting Patterns (Reinforced)

1. **Migration-first fields omission** — All 8 models missing externalId/sourceSystem/customFields/createdById/updatedById from hub (systemic across ALL services)
2. **"Stubs" claim FALSE again** — 8th service with this error. Pattern is now undeniable: hub systematically claims tests are stubs when they are real.
3. **Hub written from specs not code** — Loads controller is the clearest proof: phantom endpoints match design specs exactly, real endpoints are completely different.
4. **Soft-delete gap** — 5th service with critical soft-delete gaps. Systemic issue across the codebase.
5. **Dual guard pattern** — Carrier Portal uses same CarrierPortalAuthGuard + CarrierScopeGuard pattern as Customer Portal's PortalAuthGuard + CompanyScopeGuard. Both are well-implemented.

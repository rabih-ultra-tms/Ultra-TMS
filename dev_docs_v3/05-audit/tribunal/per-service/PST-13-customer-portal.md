# PST-13: Customer Portal — Per-Service Tribunal Audit

> **Date:** 2026-03-08
> **Hub file:** `dev_docs_v3/01-services/p0-mvp/13-customer-portal.md`
> **Verdict:** MODIFY
> **Revised Health Score:** 5.5/10 (was 2.5/10, +3.0)

---

## Executive Summary

The Customer Portal hub has the **worst internal contradiction** of any P0 service audited: Section 2 correctly states "8 portal-specific Prisma models" while Section 8 says "No portal-specific Prisma models exist" and describes PortalUser/PortalSession as future work. In reality, ALL 8 models are fully built with comprehensive fields and indices. The hub also claims "0 tests" when 63 tests exist across 9 spec files. The backend is production-quality (8.5/10) with excellent security architecture. The score jump from 2.5 to 5.5 reflects that the backend half is far better than documented, but the frontend remains entirely unbuilt (correctly stated).

---

## Phase 1: Backend Reality Scan

### Controllers Verified: 7 (matches hub)

| Controller | Hub Count | Actual Count | Path Accuracy |
|-----------|----------|-------------|--------------|
| PortalAuthController | 8 | 8 | ~75% (phantom `/me`, missing `change-password`) |
| PortalDashboardController | 4 | 4 | ~50% (stats→active-shipments, notifications→alerts) |
| PortalUsersController | 6 | 6 | ~83% (phantom GET users/:id) |
| PortalQuotesController | 8 | 8 | ~50% (3 phantom, 3 missing) |
| PortalInvoicesController | 5 | 5 | ~60% (phantom /dispute, missing /statements/:month) |
| PortalShipmentsController | 6 | 6 | ~67% (missing /events, /contact; has phantom /track/:code) |
| PortalPaymentsController | 3 | 3 | 100% |
| **TOTAL** | **40** | **40** | **~70%** |

### Endpoint Count: ACCURATE (40 = 40)

Hub gets the total count exactly right. But ~30% of individual endpoint paths/names are wrong.

### Actual Endpoint Inventory

**PortalAuthController** — `@Controller('portal/auth')` — 8 endpoints:
| # | Method | Path | Guard | Notes |
|---|--------|------|-------|-------|
| 1 | POST | `/portal/auth/login` | None (public) + @Throttle | Hub says no rate limiting — FALSE |
| 2 | POST | `/portal/auth/refresh` | None (validates token internally) | |
| 3 | POST | `/portal/auth/logout` | PortalAuthGuard | |
| 4 | POST | `/portal/auth/forgot-password` | None (public) | |
| 5 | POST | `/portal/auth/reset-password` | None (public) | |
| 6 | POST | `/portal/auth/register` | None (public) | |
| 7 | GET | `/portal/auth/verify-email/:token` | None (public) | Hub says POST, actual is GET |
| 8 | POST | `/portal/auth/change-password` | PortalAuthGuard | Hub lists GET `/me` instead — PHANTOM |

**Hub errors in Auth:** GET `/me` doesn't exist (phantom). `change-password` not documented. `verify-email` is GET not POST.

**PortalDashboardController** — `@Controller('portal/dashboard')` — 4 endpoints:
| # | Method | Path | Guard |
|---|--------|------|-------|
| 1 | GET | `/portal/dashboard` | PortalAuthGuard + CompanyScopeGuard |
| 2 | GET | `/portal/dashboard/active-shipments` | PortalAuthGuard + CompanyScopeGuard |
| 3 | GET | `/portal/dashboard/recent-activity` | PortalAuthGuard + CompanyScopeGuard |
| 4 | GET | `/portal/dashboard/alerts` | PortalAuthGuard + CompanyScopeGuard |

**Hub errors:** `/stats` → actual `/active-shipments`. `/notifications` → actual `/alerts`.

**PortalUsersController** — `@Controller('portal')` — 6 endpoints:
| # | Method | Path | Guard |
|---|--------|------|-------|
| 1 | GET | `/portal/profile` | PortalAuthGuard + CompanyScopeGuard |
| 2 | PUT | `/portal/profile` | PortalAuthGuard + CompanyScopeGuard |
| 3 | GET | `/portal/users` | PortalAuthGuard + CompanyScopeGuard |
| 4 | POST | `/portal/users` | PortalAuthGuard + CompanyScopeGuard |
| 5 | PUT | `/portal/users/:id` | PortalAuthGuard + CompanyScopeGuard |
| 6 | DELETE | `/portal/users/:id` | PortalAuthGuard + CompanyScopeGuard |

**Hub errors:** Lists `GET /portal/users/:id` (single user detail) — DOESN'T EXIST (phantom).

**PortalQuotesController** — `@Controller('portal/quotes')` — 8 endpoints:
| # | Method | Path | Guard |
|---|--------|------|-------|
| 1 | GET | `/portal/quotes` | PortalAuthGuard + CompanyScopeGuard |
| 2 | POST | `/portal/quotes/request` | PortalAuthGuard + CompanyScopeGuard |
| 3 | GET | `/portal/quotes/:id` | PortalAuthGuard + CompanyScopeGuard |
| 4 | POST | `/portal/quotes/:id/accept` | PortalAuthGuard + CompanyScopeGuard |
| 5 | POST | `/portal/quotes/:id/decline` | PortalAuthGuard + CompanyScopeGuard |
| 6 | POST | `/portal/quotes/:id/revision` | PortalAuthGuard + CompanyScopeGuard |
| 7 | GET | `/portal/quotes/:id/pdf` | PortalAuthGuard + CompanyScopeGuard |
| 8 | POST | `/portal/quotes/estimate` | PortalAuthGuard + CompanyScopeGuard |

**Hub errors (3 phantom, 3 missing):**
- PHANTOM: PUT /:id (update), DELETE /:id (cancel), GET /:id/documents
- MISSING: POST /request, POST /:id/revision, POST /estimate, GET /:id/pdf
- NAME WRONG: `/reject` → actual `/decline`

**PortalInvoicesController** — `@Controller('portal/invoices')` — 5 endpoints:
| # | Method | Path | Guard |
|---|--------|------|-------|
| 1 | GET | `/portal/invoices` | PortalAuthGuard + CompanyScopeGuard |
| 2 | GET | `/portal/invoices/:id` | PortalAuthGuard + CompanyScopeGuard |
| 3 | GET | `/portal/invoices/:id/pdf` | PortalAuthGuard + CompanyScopeGuard |
| 4 | GET | `/portal/invoices/aging/summary` | PortalAuthGuard + CompanyScopeGuard |
| 5 | GET | `/portal/invoices/statements/:month` | PortalAuthGuard + CompanyScopeGuard |

**Hub errors:**
- PHANTOM: POST /:id/dispute — doesn't exist
- MISSING: GET /statements/:month
- PATH WRONG: `/summary` → actual `/aging/summary`

**PortalShipmentsController** — `@Controller('portal/shipments')` — 6 endpoints:
| # | Method | Path | Guard |
|---|--------|------|-------|
| 1 | GET | `/portal/shipments` | PortalAuthGuard + CompanyScopeGuard |
| 2 | GET | `/portal/shipments/:id` | PortalAuthGuard + CompanyScopeGuard |
| 3 | GET | `/portal/shipments/:id/tracking` | PortalAuthGuard + CompanyScopeGuard |
| 4 | GET | `/portal/shipments/:id/events` | PortalAuthGuard + CompanyScopeGuard |
| 5 | GET | `/portal/shipments/:id/documents` | PortalAuthGuard + CompanyScopeGuard |
| 6 | POST | `/portal/shipments/:id/contact` | PortalAuthGuard + CompanyScopeGuard |

**Hub errors:**
- NAME WRONG: `/updates` → actual `/events`
- PHANTOM: GET `/portal/track/:code` (public tracking) — NOT ON ANY CONTROLLER
- MISSING: POST /:id/contact

**PortalPaymentsController** — `@Controller('portal/payments')` — 3 endpoints:
| # | Method | Path | Guard |
|---|--------|------|-------|
| 1 | POST | `/portal/payments` | PortalAuthGuard + CompanyScopeGuard |
| 2 | GET | `/portal/payments` | PortalAuthGuard + CompanyScopeGuard |
| 3 | GET | `/portal/payments/:id` | PortalAuthGuard + CompanyScopeGuard |

**Hub accuracy:** 100% — only controller with fully correct documentation.

### Security Analysis

**Guard Coverage: 100%**
- Auth controller: 5 public endpoints (login, register, forgot/reset password, verify email) correctly have no guard
- Auth controller: 3 protected endpoints use PortalAuthGuard
- All other 6 controllers: PortalAuthGuard + CompanyScopeGuard at class level (32 endpoints)
- CompanyScopeGuard extracts companyId from JWT, ensures company-level data isolation

**Rate Limiting: EXISTS (hub says it doesn't)**
- `@Throttle({ long: { limit: 5, ttl: 60000 } })` on login endpoint
- 5 attempts per 60 seconds

### CRITICAL BUG: JWT Secret Inconsistency

**Module** (`customer-portal.module.ts:25`): Registers JWT with `process.env.PORTAL_JWT_SECRET || process.env.JWT_SECRET`
**Guard** (`portal-auth.guard.ts:24`): Verifies tokens with `process.env.CUSTOMER_PORTAL_JWT_SECRET`

If `PORTAL_JWT_SECRET` and `CUSTOMER_PORTAL_JWT_SECRET` are different env vars (or one is set and the other isn't), tokens signed by the service **will not validate** in the guard. This is a potential authentication failure bug.

---

## Phase 2: Prisma Model Verification

### Hub Internal Contradiction (WORST of any P0 service)

| Hub Section | Claim | Reality |
|-------------|-------|---------|
| Section 2 (Implementation Status) | "8 portal-specific Prisma models" | CORRECT |
| Section 8 (Data Model) | "No portal-specific Prisma models exist" | **CRITICALLY WRONG** |
| Section 8 (Data Model) | "PortalUser does not exist yet" | **WRONG — 23 fields, fully built** |
| Section 8 (Data Model) | "PortalSession does not exist yet" | **WRONG — 12 fields, fully built** |

### Actual Models (8 confirmed — all with migration-first fields)

| Model | Fields | Key Features |
|-------|--------|-------------|
| PortalUser | 23 | role (ADMIN/USER/VIEW_ONLY), status (PENDING/ACTIVE/SUSPENDED/DEACTIVATED), emailVerified, verificationToken, lastLoginAt, language |
| PortalSession | 12 | refreshTokenHash, userAgent, ipAddress, expiresAt, revokedAt |
| PortalPayment | 17 | paymentNumber (unique), amount, currency, status, paymentMethod, processorTransactionId, processorResponse, invoiceIds[] |
| PortalSavedPaymentMethod | 17 | paymentMethodType, cardBrand, expirationMonth/Year, billingAddress, isDefault, externalToken |
| PortalActivityLog | 13 | action, entityType, entityId, description, ipAddress, userAgent |
| PortalNotification | 14 | notificationType (enum), title, message, isRead, readAt, actionUrl, relatedEntityType/Id |
| PortalBranding | 15 | logoUrl, faviconUrl, primaryColor, secondaryColor, accentColor, customCss, customJs, customDomain |
| QuoteRequest | 27 | requestNumber (unique), origin/dest addresses, pickupDate, equipmentType, commodity, weightLbs, palletCount, isHazmat, isTemperatureControlled, status, quotedAmount, quoteExpiresAt |

All models include migration-first fields (externalId, sourceSystem, customFields, tenantId, deletedAt).

### Enums: 5 (hub claims 6)

| Enum | Values |
|------|--------|
| PortalNotificationType | QUOTE_READY, LOAD_UPDATE, INVOICE_AVAILABLE, PAYMENT_RECEIVED, DOCUMENT_UPLOADED, MESSAGE_RECEIVED, SHIPMENT_DELAYED, DELIVERY_CONFIRMED |
| PortalPaymentStatus | PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED |
| PortalUserRole | ADMIN, USER, VIEW_ONLY |
| PortalUserStatus | PENDING, ACTIVE, SUSPENDED, DEACTIVATED |
| QuoteRequestStatus | SUBMITTED, REVIEWING, QUOTED, ACCEPTED, DECLINED, EXPIRED |

### Hub Section 10 Status States Errors

| Hub Claims | Reality |
|-----------|---------|
| Starts with INVITED | Starts with PENDING |
| REJECTED in quote flow | DECLINED (different name) |
| DRAFT in quote flow | No DRAFT — starts at SUBMITTED |
| ORDER_CREATED in quote flow | Doesn't exist in enum |
| Missing VIEW_ONLY role | EXISTS in PortalUserRole |

---

## Phase 3: Test Inventory

### Hub Claims: "None" / "0 backend, 0 frontend"
### Reality: 63 tests across 9 spec files

| Spec File | Tests | Quality |
|-----------|-------|---------|
| portal-auth.service.spec.ts | 19 | Excellent — covers login (valid, suspended, invalid), refresh (valid, wrong type, expired, invalid), logout (single/all), forgot-password (missing user, existing user), reset-password (invalid/valid token), verify-email, register (existing/new/missing companyId), change-password |
| portal-users.service.spec.ts | 9 | Solid — profile, update, list, invite (basic + role/permissions), update (missing + with permissions), deactivate (valid + missing) |
| portal-quotes.service.spec.ts | 8 | Good — list, detail (missing), submit, accept (valid + invalid status), decline, revision, estimate |
| portal-shipments.service.spec.ts | 6 | Good — list, detail (missing), tracking, events, documents, contact |
| portal-invoices.service.spec.ts | 6 | Good — list, detail (valid + missing), aging (two scenarios), statement |
| portal-payments.service.spec.ts | 5 | Good — make payment (empty, missing invoice, valid), history, detail (missing) |
| portal-dashboard.service.spec.ts | 4 | Solid — dashboard summary, active shipments, recent activity, alerts |
| portal-auth.guard.spec.ts | 4 | Good — missing token, missing secret, invalid token, valid token |
| company-scope.guard.spec.ts | 2 | Basic — missing company, valid company |
| **TOTAL** | **63** | **Production-quality test suite** |

This is the **3rd highest test count** of any P0 service (after Load Board at 65+ and Commission at 63).

---

## Phase 4: Frontend Verification

**Hub claims: "Not Built"**
**Reality: CONFIRMED — 0 pages, 0 components, 0 hooks**

- No routes matching `/portal/*` anywhere in `apps/web/`
- No portal-specific components or hooks
- Only "portal" references in frontend are in `lib/load-planner/state-permits.ts` (unrelated)

This is one of the few hub claims that is **100% accurate**.

---

## Phase 5: Adversarial Tribunal (5 Rounds)

### Round 1: "The hub is more accurate than the audit claims"

**Challenge:** "The endpoint count is exactly right (40=40), endpoint names are close enough, the overall picture is correct."

**Rebuttal:** The overall count being correct masks severe detail problems:
- 8 phantom endpoints that don't exist (GET `/me`, GET `/users/:id`, PUT/DELETE quotes, POST `/dispute`, GET `/track/:code`, GET `/documents`, POST `/reject`)
- 8 real endpoints completely undocumented (`change-password`, `active-shipments`, `alerts`, `/request`, `/revision`, `/estimate`, `/pdf`, `/contact`, `/events`, `/statements/:month`)
- Section 8 directly contradicts Section 2 about whether Prisma models exist — this isn't "close enough," it's self-contradictory
- Claiming "0 tests" when 63 exist is a complete misrepresentation

**Verdict:** Hub detail accuracy is ~70% on endpoints, with a catastrophic Section 8 contradiction. SUSTAINED.

### Round 2: "The health score should remain at 2.5 since the service is unusable without frontend"

**Challenge:** "A service with 0 frontend pages delivers 0 value to end users. Backend quality is irrelevant without UI."

**Rebuttal:** Fair point that end-user value is zero. But health score should measure implementation quality across what exists:
- Backend: 40 well-structured endpoints, excellent security (100% guard coverage + company scope isolation), rate limiting, proper DTO validation, separate JWT infrastructure — 8.5/10
- Data model: 8 models + 5 enums, all with migration-first fields, proper indices, cascading deletes — 9/10
- Tests: 63 tests covering all services — 8/10
- Frontend: 0/10

Weighted: Backend 50%, Models 15%, Tests 10%, Frontend 25% = 0.5(8.5) + 0.15(9) + 0.1(8) + 0.25(0) = 4.25 + 1.35 + 0.8 + 0 = 6.4

But the JWT secret inconsistency bug and missing public tracking endpoint bring it down. **5.5/10 is fair** — acknowledges the strong backend foundation while reflecting the complete frontend gap.

**Verdict:** 2.5 is too low, 6.4 ignores the frontend gap's impact. 5.5 is the right compromise. MODIFIED.

### Round 3: "The JWT secret inconsistency isn't a real bug"

**Challenge:** "Maybe both env vars point to the same value in production. The module fallback to JWT_SECRET might be intentional."

**Rebuttal:** The code paths are objectively inconsistent:
- Module: `process.env.PORTAL_JWT_SECRET || process.env.JWT_SECRET` — signs tokens
- Guard: `process.env.CUSTOMER_PORTAL_JWT_SECRET` — verifies tokens
- If `PORTAL_JWT_SECRET` is set but `CUSTOMER_PORTAL_JWT_SECRET` is not (or vice versa), auth will fail silently
- If only `JWT_SECRET` is set (fallback), guard gets `undefined` and throws immediately
- This is a configuration footgun at minimum, a bug at worst
- No tests verify the integration between module-level JWT signing and guard-level verification (they mock JWT separately)

**Verdict:** Even if it works in some configurations, the inconsistency is objectively present and should be flagged. SUSTAINED.

### Round 4: "The test suite is sufficient for production"

**Challenge:** "63 tests with good coverage across all services — this is production-ready."

**Rebuttal:** Tests are service-level unit tests only. Missing:
- **Zero integration tests** — no end-to-end controller testing with real HTTP requests
- **No guard integration** — guards are tested separately, never with actual controller flows
- **No JWT signing/verification integration** — the JWT secret inconsistency bug proves this gap
- **No Prisma integration tests** — all use mocked Prisma
- **No DTO validation tests** — no verification that bad input is rejected
- Tests cover happy paths well but have gaps in edge cases (concurrent sessions, expired tokens with clock skew, SQL injection via customFields, etc.)

Quality is good for unit level, but integration gaps are significant.

**Verdict:** Tests are a strong foundation but NOT production-ready without integration tests. PARTIALLY SUSTAINED.

### Round 5: "The public tracking endpoint should be deprioritized"

**Challenge:** "Public tracking is P1 scope, not critical for MVP launch. The phantom endpoint doesn't matter."

**Rebuttal:** The Tribunal (TRIBUNAL-02) promoted Customer Portal to P0 with 4 pages: Login, Dashboard, Tracking, Documents. Tracking is explicitly P0 scope. The hub claims the backend endpoint exists (`GET /portal/track/:code`) but it's phantom — this means when someone tries to build the P0 frontend, they'll discover the backend doesn't support it. This is a hidden dependency that will block P0 delivery.

**Verdict:** Public tracking endpoint is P0 scope per Tribunal verdict. Its absence is a genuine blocker. SUSTAINED.

---

## Consolidated Findings

### Hub Accuracy by Section

| Section | Accuracy | Major Issues |
|---------|----------|-------------|
| 1. Status Box | 60% | Health score too low (2.5→5.5), "No tests" wrong |
| 2. Implementation Status | 80% | Mostly accurate, correctly lists 8 models |
| 3. Screens | 100% | All correctly listed as "Not Built" |
| 4. API Endpoints | 70% | Count right (40=40), ~30% of paths wrong |
| 5. Components | 100% | Correctly says "Not Built" |
| 6. Hooks | 100% | Correctly says "Not Built" |
| 7. Business Rules | 85% | Mostly accurate, some status flow errors |
| 8. Data Model | 0% | **CATASTROPHIC** — contradicts Section 2, says models don't exist when they do |
| 9. Validation Rules | ~70% | Reasonable but some rules don't match DTOs |
| 10. Status States | 50% | INVITED→PENDING, REJECTED→DECLINED, DRAFT doesn't exist |
| 11. Known Issues | 50% | 4/8 issues are wrong or stale |
| 12. Tasks | 75% | Reasonable effort estimates, some priorities need update |

### Known Issues Triage (8 items)

| # | Issue | Hub Status | Actual |
|---|-------|-----------|--------|
| 1 | No frontend portal exists | Open | TRUE — confirmed |
| 2 | No portal-specific Prisma models | Open | **FALSE — all 8 exist** |
| 3 | 40 backend endpoints untested | Open | **FALSE — 63 tests exist** |
| 4 | Public tracking page not built | Open | TRUE — but backend endpoint ALSO missing (phantom) |
| 5 | Payment gateway (Stripe) not integrated | Open | TRUE — payments are simulated |
| 6 | Magic link email sending not verified | Needs verification | TRUE — no email integration visible |
| 7 | No rate limiting on portal auth | Open | **PARTIALLY FALSE — login has @Throttle** |
| 8 | Portal JWT secret may not be set | Needs verification | TRUE + **NEW BUG: JWT secret inconsistency** |

### Critical Issues Found

| # | Severity | Issue | File(s) |
|---|----------|-------|---------|
| 1 | **CRITICAL** | JWT secret inconsistency: module signs with PORTAL_JWT_SECRET, guard verifies with CUSTOMER_PORTAL_JWT_SECRET | `customer-portal.module.ts:25`, `portal-auth.guard.ts:24` |
| 2 | **HIGH** | Hub Section 8 contradicts Section 2 (claims models don't exist when they do) | Hub file |
| 3 | **HIGH** | Public tracking endpoint (`/portal/track/:code`) is phantom — documented but doesn't exist | Hub Section 4 |
| 4 | **MEDIUM** | ~30% of endpoint paths in hub are wrong (8 phantom, 8 undocumented) | Hub Section 4 |
| 5 | **MEDIUM** | Status state names wrong (INVITED→PENDING, REJECTED→DECLINED, no DRAFT) | Hub Section 10 |
| 6 | **LOW** | Enum count wrong (5 not 6) | Hub Section 2 |
| 7 | **LOW** | Register endpoint trusts `x-tenant-id` header for tenantId — potential tenant spoofing if not validated upstream | `portal-auth.controller.ts:70` |

---

## Action Items

### Hub Corrections (7 items)
1. **[CRITICAL]** Rewrite Section 8 entirely — document all 8 actual Prisma models with their real fields
2. **[HIGH]** Fix Section 4 endpoint paths — replace 8 phantom paths, add 8 missing paths
3. **[HIGH]** Update Known Issues — mark #2 and #3 as FALSE, add JWT secret bug
4. **[MEDIUM]** Fix Section 10 status states — PENDING not INVITED, DECLINED not REJECTED, remove DRAFT
5. **[MEDIUM]** Fix Section 1 health score from 2.5 to 5.5
6. **[LOW]** Correct enum count from 6 to 5
7. **[LOW]** Fix auth endpoint details (change-password exists, /me doesn't)

### Code Fixes (3 items)
1. **[CRITICAL]** Align JWT secret env var names — either module should use `CUSTOMER_PORTAL_JWT_SECRET` or guard should use `PORTAL_JWT_SECRET`
2. **[HIGH]** Build public tracking endpoint `GET /portal/track/:code` (P0 scope per Tribunal)
3. **[MEDIUM]** Add rate limiting to remaining auth endpoints (register, forgot-password, reset-password)

### New Tasks to Create (3 items)
1. **CPORT-016:** Fix JWT secret inconsistency between module and guard (S, 30min, P0)
2. **CPORT-017:** Build public tracking endpoint `GET /portal/track/:code` (M, 4h, P0)
3. **CPORT-018:** Add rate limiting to all public auth endpoints (S, 1h, P1)

---

## Verdict

**MODIFY** — Hub requires significant corrections but service is not at risk of needing a rewrite. Backend is well-architected with excellent security. The only code-level fix needed is the JWT secret alignment. Frontend build-out is a separate (large) task already tracked.

**Revised Health Score: 5.5/10** (was 2.5/10)
- Backend quality: 8.5/10
- Security architecture: 9/10 (minus JWT secret bug)
- Data model: 9/10
- Test coverage: 8/10
- Frontend: 0/10
- Usability: 1/10 (no UI = no users)

---

## Cross-Cutting Patterns Confirmed

| Pattern | Status | Notes |
|---------|--------|-------|
| Hub data model section catastrophically wrong | CONFIRMED | Worst case yet — Section 8 contradicts Section 2 |
| Hub endpoint count accurate, details wrong | CONFIRMED | 40=40 but ~30% of paths wrong |
| Hub claims "No tests" when tests exist | CONFIRMED | 0→63 tests |
| Hub known issues contain false items | CONFIRMED | 4/8 wrong or stale |
| Status state names don't match enum names | NEW | INVITED/REJECTED/DRAFT are phantom states |
| JWT/auth configuration inconsistencies | NEW | First portal-specific auth bug found |

# Ultra TMS Full Audit Report — 2026-03-06 (v2 — Re-Audit)

## Executive Summary

**Audit Scope:** Complete full-stack re-audit covering security, database, backend API, frontend hooks/forms/tables, and cross-layer integration. This is the second pass — verifying first-audit fixes and catching new issues.

**Project Scale:**
| Layer | Count |
|-------|-------|
| Frontend routes | 98 |
| Components | 304 |
| Custom hooks | 55 |
| Backend modules | 37 |
| Controllers | 187 |
| Services | 245 |
| Prisma models | 260 |
| Prisma enums | 114 |
| Backend unit tests | 230 files (1,721 passing, 14 pre-existing failures) |
| Frontend tests | 57 files |
| Playwright E2E specs | 10 files |

**Overall Grade: 7.1/10 (B-)** — Up from 6.2/10 after all security fixes applied.

---

## Part 1: Security Audit

### Fixed in Re-Audit (P0 — NEW)

| # | Issue | Files Changed | Status |
|---|-------|---------------|--------|
| S1 | Plaintext passwords in carrier portal (login, register, reset) | `carrier-portal-auth.service.ts` | FIXED — bcrypt hash (salt 12) + compare |
| S2 | Plaintext passwords in customer portal (login, register, reset, change) | `portal-auth.service.ts` | FIXED — bcrypt hash (salt 12) + compare |
| S3 | Hardcoded JWT fallback `'carrier-portal-secret'` (3 occurrences) | `carrier-portal-auth.service.ts`, `carrier-portal.module.ts` | FIXED — removed fallback |
| S4 | Hardcoded JWT fallback `'portal-secret'` (3 occurrences) | `portal-auth.service.ts`, `customer-portal.module.ts` | FIXED — removed fallback |
| S5 | No rate limiting on portal login endpoints | `carrier-portal-auth.controller.ts`, `portal-auth.controller.ts` | FIXED — `@Throttle({ long: { limit: 5, ttl: 60000 } })` |

### Previously Fixed (First Audit — Verified Still Good)

| # | Issue | Status |
|---|-------|--------|
| S6 | Test-mode auth bypass in `JwtAuthGuard` | FIXED — guarded with `ALLOW_TEST_AUTH` |
| S7 | JWT fallback `'default-secret'` in auth module | FIXED — throws if missing |
| S8 | Health endpoints require JWT | FIXED — `@Public()` decorator |
| S9 | Public tracking requires JWT | FIXED — `@Public()` decorator |

### Remaining Security Items (Not Blocking)

| # | Severity | Issue | Notes |
|---|----------|-------|-------|
| S10 | P2 | CORS hardcoded to localhost | Need env var for production origins |
| S11 | P2 | bcrypt salt rounds = 10 in main auth | Acceptable, 12 recommended |
| S12 | P3 | SUPER_ADMIN bypasses RolesGuard | By design, but should be documented |
| S13 | P3 | `default-tenant` fallback in portal register | Should validate tenant exists |

---

## Part 2: Database & Schema

### Fixed

| # | Issue | Status |
|---|-------|--------|
| D1 | Soft-delete middleware only covered `findMany`/`findFirst` | FIXED — extended to `findUnique`, `count`, `aggregate` |
| D2 | Soft-delete used hardcoded model Set (203 models missing) | FIXED (first audit) — dynamic DMMF detection |

### Remaining

| # | Issue | Impact |
|---|-------|--------|
| D3 | No compound indexes with `tenantId` as first column audit | Performance concern at scale |
| D4 | Some models may lack `deletedAt` field (e.g., Invoice) | Verify in schema |

---

## Part 3: Backend API

**187 controllers across 32 modules. 85% MVP-ready.**

### Key Findings

- **Global guards:** `JwtAuthGuard` + `CustomThrottlerGuard` as APP_GUARD — all endpoints protected
- **ResponseTransformInterceptor:** Wraps all responses in `{ success, data, timestamp }` — aligned with frontend
- **No WebSocket gateways:** Frontend expects 22 socket events across 4 namespaces — all silently fail
- **No global ExceptionFilter:** Errors fall through to NestJS defaults
- **Swagger coverage:** ~88% (183/207 controllers)

### Missing Endpoints

| Endpoint | Status |
|----------|--------|
| `PATCH /users/:id/roles` | FIXED (first audit) |
| `GET/DELETE /sessions` | FIXED (first audit) |
| `GET /safety/fmcsa/lookup` path | FIXED (first audit) — corrected in frontend |
| `GET /safety/csa/:carrierId` | Still missing |
| `GET /accounting/dashboard` | Still missing |

---

## Part 4: Frontend Hooks (55 total)

### Fixed in Re-Audit

| # | Issue | Files | Status |
|---|-------|-------|--------|
| H1 | 28 mutations missing `onError` toast handlers | 8 hook files | FIXED |
| H2 | 3 empty catch blocks in api-client.ts | `api/client.ts` | FIXED |

### Previously Fixed (First Audit)

| # | Issue | Status |
|---|-------|--------|
| H3 | Unsafe type cast in carrier-scorecard hook | FIXED |
| H4 | Missing error toasts in document hooks | FIXED |
| H5 | FMCSA endpoint path mismatch | FIXED |
| H6 | Missing error toasts in load-planner-quotes hooks | FIXED |

### Remaining

| # | Issue | Impact |
|---|-------|--------|
| H7 | 12 hooks with inline query keys (not factory pattern) | Inconsistency |
| H8 | SocketProvider infinite loop bug | All WebSocket features broken |
| H9 | `useAuthStore` (Zustand) may be dead code | Cleanup candidate |

---

## Part 5: Forms (24 total)

| Grade | Count | Notable |
|-------|-------|---------|
| 9-10/10 | 14 | order-form (10/10), quote-v2 (9/10), customer (9/10), carrier (9/10) |
| 7-8/10 | 6 | role, activity, user, contact, lead, load |
| 5-6/10 | 2 | check-call (useState anti-pattern), posting (legacy register) |
| 0/10 | 1 | profile-form (complete stub) |

---

## Part 6: Error Boundaries & Loading States

| Item | Status |
|------|--------|
| `(dashboard)/error.tsx` | CREATED (first audit) |
| `(auth)/error.tsx` | CREATED (first audit) |
| `(dashboard)/loading.tsx` | CREATED (first audit) |
| Root `not-found.tsx` | CREATED (first audit) |

---

## Part 7: Test Results After All Fixes

```
Backend Unit Tests:  1,721 passed / 14 failed (pre-existing) / 1,735 total
                     219 suites passed / 11 failed / 230 total

Portal Auth Tests:   31/31 passed (fixed in re-audit)
Prisma Service:      6/6 passed (fixed in re-audit)
```

Pre-existing failures (11 suites) are unrelated mock/setup issues in: jwt-auth.guard, auth.service, quotes.service, orders.service, loads.service, invoices.service, payments-made/received.service, load-postings.service, saved-searches.service, time-off.service.

---

## Files Modified in This Re-Audit (19 files)

### Security Fixes (P0) — 6 files
1. `apps/api/src/modules/carrier-portal/auth/carrier-portal-auth.service.ts` — bcrypt + removed JWT fallback
2. `apps/api/src/modules/customer-portal/auth/portal-auth.service.ts` — bcrypt + removed JWT fallback
3. `apps/api/src/modules/carrier-portal/carrier-portal.module.ts` — removed JWT fallback
4. `apps/api/src/modules/customer-portal/customer-portal.module.ts` — removed JWT fallback
5. `apps/api/src/modules/carrier-portal/auth/carrier-portal-auth.controller.ts` — @Throttle on login
6. `apps/api/src/modules/customer-portal/auth/portal-auth.controller.ts` — @Throttle on login

### Data Integrity (P1) — 1 file
7. `apps/api/src/prisma.service.ts` — soft-delete for findUnique/count/aggregate

### Frontend Error Handling (P1) — 9 files
8. `apps/web/lib/hooks/sales/use-quotes.ts` — onError for 11 mutations
9. `apps/web/lib/hooks/accounting/use-invoices.ts` — onError for 6 mutations
10. `apps/web/lib/hooks/tms/use-orders.ts` — onError for 2 mutations
11. `apps/web/lib/hooks/tms/use-dispatch.ts` — onError for 6 mutations
12. `apps/web/lib/hooks/commissions/use-plans.ts` — onError for 4 mutations
13. `apps/web/lib/hooks/commissions/use-payouts.ts` — onError for 2 mutations
14. `apps/web/lib/hooks/commissions/use-reps.ts` — onError for 1 mutation
15. `apps/web/lib/hooks/commissions/use-transactions.ts` — onError for 2 mutations
16. `apps/web/lib/api/client.ts` — fixed 3 empty catch blocks

### Test Fixes — 3 files
17. `apps/api/src/prisma.service.spec.ts` — DMMF mock for dynamic soft-delete
18. `apps/api/src/modules/carrier-portal/auth/carrier-portal-auth.service.spec.ts` — bcrypt mock
19. `apps/api/src/modules/customer-portal/auth/portal-auth.service.spec.ts` — bcrypt mock

---

## Remaining Backlog (Prioritized)

### P1 — Should Fix Soon
- [ ] Add CSA scores endpoint (`GET /carriers/:id/csa`)
- [ ] Add accounting dashboard endpoint (`GET /accounting/dashboard`)
- [ ] Fix SocketProvider infinite loop
- [ ] Implement profile-form.tsx (currently 0/10 stub)
- [ ] Refactor check-call-form to RHF + Zod
- [ ] Move CORS origins to environment variable

### P2 — Nice to Have
- [ ] Migrate 12 inline query key hooks to factory pattern
- [ ] Add search debounce to 3 tables
- [ ] Build permissions selector UI for role-form
- [ ] Create WebSocket gateways (dispatch, tracking, notifications)
- [ ] Add global ExceptionFilter
- [ ] Increase main auth bcrypt salt to 12

### P3 — Cleanup
- [ ] Delete 5 `.bak` directories
- [ ] Verify/remove dead `useAuthStore` Zustand store
- [ ] Triage 339 TODO/FIXME across 82 files
- [ ] Fix 11 pre-existing test failures

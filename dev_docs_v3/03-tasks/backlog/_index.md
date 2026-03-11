# Backlog — Ultra TMS

> Tasks queued for post-Quality Sprint execution.
> Last updated: 2026-03-11 (P0 audit — resolved stale items, cross-tenant fixes applied)
> Format: ID | Title | Priority | Effort | Notes

---

## P0 — Build Missing Screens (Post-Quality Sprint)

> **2026-03-11 Audit:** BUILD-001 through BUILD-006 already exist as real implementations (verified via code scan). Reclassified as DONE.

| ID            | Title                              | Priority | Effort | Notes                                                                                                 |
| ------------- | ---------------------------------- | -------- | ------ | ----------------------------------------------------------------------------------------------------- |
| ~~BUILD-001~~ | ~~Accounting Dashboard Screen~~    | ~~P0~~   | ~~L~~  | **DONE** — 98 LOC, real API calls to `/accounting/dashboard`                                          |
| ~~BUILD-002~~ | ~~Invoice List Screen~~            | ~~P0~~   | ~~L~~  | **DONE** — 128 LOC, full CRUD with pagination/filters                                                 |
| ~~BUILD-003~~ | ~~Invoice Create Form~~            | ~~P0~~   | ~~M~~  | **DONE** — 13 LOC wrapper → InvoiceForm component                                                     |
| ~~BUILD-004~~ | ~~Invoice Detail Screen~~          | ~~P0~~   | ~~M~~  | **DONE** — 184 LOC, 3-tab view with send/void/PDF                                                     |
| ~~BUILD-005~~ | ~~Settlement List Screen~~         | ~~P0~~   | ~~M~~  | **DONE** — 71 LOC, real API calls with filters                                                        |
| ~~BUILD-006~~ | ~~Settlement Detail Screen~~       | ~~P0~~   | ~~M~~  | **DONE** — 423 LOC, approval workflow, financial summary                                              |
| ~~BUILD-007~~ | ~~Payment List Screen~~            | ~~P1~~   | ~~M~~  | **DONE** — 120 LOC, real API, RHF+Zod form, 453 LOC detail page (8.5/10)                              |
| ~~BUILD-008~~ | ~~Commission Dashboard Screen~~    | ~~P1~~   | ~~L~~  | **DONE** — 180 LOC, real API, KPI cards, top reps table, error state added (8/10)                     |
| ~~BUILD-009~~ | ~~Commission Plans Screen~~        | ~~P1~~   | ~~M~~  | **DONE** — 224 LOC, real API, filters, pagination, RHF+Zod plan form (8/10)                           |
| ~~BUILD-010~~ | ~~Commission Transactions Screen~~ | ~~P1~~   | ~~M~~  | **DONE** — 191 LOC, real API, approve/void with reason validation (8.5/10)                            |
| ~~BUILD-011~~ | ~~Load Board Screen~~              | ~~P2~~   | ~~L~~  | **DONE** — Backend fully implemented (geo search, bids, tenders, expiration). 4 frontend pages built. |

---

## P0 — Fix Known Bugs (Post-Quality Sprint)

> **2026-03-11 Audit:** BUG-001, BUG-012, BUG-016 already resolved. Cross-tenant security fixes (SEC-TENANT) applied.

| ID          | Title                                  | Priority | Effort | Notes                                                                                                                             |
| ----------- | -------------------------------------- | -------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| ~~BUG-001~~ | ~~Carrier Detail 404~~                 | ~~P0~~   | ~~M~~  | **DONE** — page exists (198 LOC, 8 tabs, fully functional)                                                                        |
| ~~BUG-002~~ | ~~Load History Detail 404~~            | ~~P1~~   | ~~S~~  | **CLOSED** — Not a bug. Loads shown via CarrierLoadsTab. Load history at `/load-history/[id]` exists (192 LOC).                   |
| ~~BUG-009~~ | ~~CRM Contacts — Add delete button~~   | ~~P1~~   | ~~S~~  | **DONE** — Delete button + ConfirmDialog in `contacts-table.tsx`, `useDeleteContact()` hook wired                                 |
| ~~BUG-010~~ | ~~CRM Leads — Add delete button~~      | ~~P1~~   | ~~S~~  | **DONE** — Delete button + ConfirmDialog in `leads-table.tsx`, `useDeleteLead()` hook wired                                       |
| ~~BUG-011~~ | ~~CRM Lead — Add convert button~~      | ~~P1~~   | ~~M~~  | **DONE** — "Convert to Customer" button on lead detail (WON stage), `LeadConvertDialog` + `useConvertLead()` hook                 |
| ~~BUG-012~~ | ~~localStorage token storage (XSS)~~   | ~~P0~~   | ~~M~~  | **DONE** — HTTP-only cookies implemented, zero localStorage usage                                                                 |
| ~~BUG-013~~ | ~~Pipeline stage confirm dialog~~      | ~~P1~~   | ~~S~~  | **DONE** — Pipeline drag-drop uses ConfirmDialog (warning variant) for stage changes                                              |
| ~~BUG-014~~ | ~~window.confirm() remaining x3~~      | ~~P1~~   | ~~S~~  | **DONE** — Zero window.confirm() calls remain. All 4 pages use ConfirmDialog. Regression test at `bug-006-window-confirm.test.ts` |
| ~~BUG-015~~ | ~~No search debounce on carrier list~~ | ~~P2~~   | ~~S~~  | **DONE** — Already implemented: `useDebounce(searchQuery, 300)` in carriers page                                                  |
| ~~BUG-016~~ | ~~useDashboard KPI cards hardcoded 0~~ | ~~P1~~   | ~~S~~  | **DONE** — 3 real API hooks fetch live data (carriers, loads, quotes stats)                                                       |

---

## DONE — Cross-Tenant Security Fixes (2026-03-11)

> **SEC-TENANT:** Added `tenantId` to WHERE clauses on all mutation operations that were missing it.
> **10 vulnerabilities fixed across 7 services.** See commit for details.

| Service              | File                            | Fix                                                     |
| -------------------- | ------------------------------- | ------------------------------------------------------- |
| Carrier (Documents)  | `documents.service.ts`          | 4 update calls: added `tenantId` to WHERE               |
| Carrier (Drivers)    | `drivers.service.ts`            | 1 delete call: added `tenantId` to WHERE                |
| Carrier (Insurances) | `insurances.service.ts`         | 1 delete call: added `tenantId` to WHERE                |
| Auth (Roles)         | `roles.service.ts`              | 1 delete call: added `tenantId` to WHERE                |
| Load Board (Rules)   | `rules.service.ts`              | 1 soft-delete: added `tenantId` to WHERE                |
| TMS (Loads)          | `loads.service.ts`              | 2 tenderRecipient updateMany: added `tenantId` to WHERE |
| Load Board (Bids)    | `load-bids.service.ts`          | 1 loadBid updateMany: added `tenantId` to WHERE         |
| Sales (Quotes)       | `quotes.service.ts`             | 1 quoteStop deleteMany: added `tenantId` to WHERE       |
| Commission (Payouts) | `commission-payouts.service.ts` | 3 commissionEntry updateMany: added `tenantId` to WHERE |

---

## DONE — TMS Core Verification (Post-QS-008)

> **2026-03-11 Audit:** QS-008 verified ALL 12 TMS Core routes PASS. All screens are real implementations, not stubs.

| ID          | Title                                | Priority | Effort | Notes                                                                 |
| ----------- | ------------------------------------ | -------- | ------ | --------------------------------------------------------------------- |
| ~~TMS-001~~ | ~~TMS Core — Verify Orders screens~~ | ~~P0~~   | —      | **DONE** — All 4 order routes PASS (7-9/10 quality)                   |
| ~~TMS-002~~ | ~~TMS Core — Verify Loads screens~~  | ~~P0~~   | —      | **DONE** — All 5 load routes PASS (7-9/10 quality)                    |
| ~~TMS-003~~ | ~~TMS Core — Verify Dispatch Board~~ | ~~P0~~   | —      | **DONE** — 240+ LOC with kanban, WebSocket, optimistic updates (8/10) |
| ~~TMS-004~~ | ~~TMS Core — Verify Tracking Map~~   | ~~P1~~   | —      | **DONE** — 761 LOC Google Maps with real-time GPS tracking (8/10)     |
| ~~TMS-005~~ | ~~TMS Core — Operations Dashboard~~  | ~~P1~~   | —      | **DONE** — 189 LOC with 6 KPI cards, live updates (8/10)              |

---

## P1 — Security Hardening

| ID          | Title                                      | Priority | Effort | Notes                                                                                                                                                                      |
| ----------- | ------------------------------------------ | -------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~SEC-001~~ | ~~Add CSP headers to Next.js config~~      | ~~P1~~   | ~~M~~  | **DONE** — CSP tightened (Google Maps domains, worker-src, frame-src), HSTS + DNS prefetch added, `helmet` added to NestJS backend                                         |
| ~~SEC-002~~ | ~~Add rate limiting (@nestjs/throttler)~~  | ~~P1~~   | ~~M~~  | **DONE** — Global ThrottlerGuard (3 tiers), @Throttle on login (5/min), refresh (10/min), forgot-password (3/min), reset-password (5/min), email/SMS send, public tracking |
| ~~SEC-003~~ | ~~Verify CSRF protection~~                 | ~~P1~~   | ~~S~~  | **DONE** — Verified: SameSite=Lax on cookies, CORS credentials:true, origin whitelist. Baseline CSRF protection in place.                                                  |
| ~~SEC-004~~ | ~~Add gitleaks pre-commit hook~~           | ~~P2~~   | ~~S~~  | **DONE** — `.husky/pre-commit` already has gitleaks scanning (soft enforcement if installed)                                                                               |
| ~~SEC-005~~ | ~~Account lockout after 10 failed logins~~ | ~~P2~~   | ~~M~~  | **DONE** — Redis-backed lockout with configurable `maxLoginAttempts` (default 5) and `lockoutDuration` (default 15min)                                                     |
| ~~SEC-006~~ | ~~Verify HubSpot webhook signature~~       | ~~P1~~   | ~~S~~  | **DONE** — HubspotWebhookGuard with SHA256 + timing-safe comparison already implemented                                                                                    |

---

## P1 — Testing Coverage

| ID           | Title                                   | Priority | Effort | Notes                                                                                                           |
| ------------ | --------------------------------------- | -------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| ~~TEST-001~~ | ~~Add Playwright E2E: Login flow~~      | ~~P0~~   | ~~M~~  | **DONE** — 183 LOC, 14 tests in `apps/e2e/tests/auth/login.spec.ts` (global setup, auth fixtures, 3 test users) |
| ~~TEST-002~~ | ~~Add Playwright E2E: Quote creation~~  | ~~P1~~   | ~~M~~  | **DONE** — `apps/e2e/tests/sales/quote-lifecycle.spec.ts` exists                                                |
| ~~TEST-003~~ | ~~Add Playwright E2E: Load lifecycle~~  | ~~P1~~   | ~~L~~  | **DONE** — `apps/e2e/tests/operations/loads-lifecycle.spec.ts` exists                                           |
| ~~TEST-004~~ | ~~Add unit tests: Accounting service~~  | ~~P1~~   | ~~M~~  | **DONE** — 5 spec files (pdf, reports, chart-of-accounts, invoices, journal-entries)                            |
| ~~TEST-005~~ | ~~Add unit tests: Commission service~~  | ~~P1~~   | ~~M~~  | **DONE** — 3 spec files (entries, payouts, plans)                                                               |
| ~~TEST-006~~ | ~~Add unit tests: TMS Core operations~~ | ~~P1~~   | ~~L~~  | **DONE** — 4 spec files (loads, orders, stops, tracking)                                                        |

---

## P2 — Infrastructure

| ID            | Title                                      | Priority | Effort | Notes                                                                                                                                       |
| ------------- | ------------------------------------------ | -------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~INFRA-001~~ | ~~Set up CI/CD pipeline (GitHub Actions)~~ | ~~P1~~   | ~~L~~  | **DONE** — `.github/workflows/ci.yml`: 3 jobs (lint+typecheck, test w/ Postgres+Redis, build). Runs on push/PR to main.                     |
| ~~INFRA-002~~ | ~~Add structured logging (Pino)~~          | ~~P2~~   | ~~M~~  | **DONE** — `nestjs-pino` replaces default NestJS logger in `main.ts`                                                                        |
| ~~INFRA-003~~ | ~~Add correlation IDs~~                    | ~~P2~~   | ~~M~~  | **DONE** — `CorrelationIdMiddleware` generates UUID per request, propagates via `x-correlation-id` header + logs                            |
| ~~INFRA-004~~ | ~~Add Sentry error tracking~~              | ~~P2~~   | ~~M~~  | **DONE** — `@sentry/node` + `@sentry/nextjs` installed. Backend: interceptor + filter. Frontend: client lib + init. Opt-in via `SENTRY_DSN` |
| ~~INFRA-005~~ | ~~Performance budgets (LCP, bundle size)~~ | ~~P2~~   | ~~M~~  | **DONE** — `@next/bundle-analyzer` + `lighthouserc.js` with LCP/CLS/TBT budgets. Run: `pnpm --filter web build:analyze`                     |
| ~~INFRA-006~~ | ~~Implement cloud storage (S3/Azure/GCS)~~ | ~~P2~~   | ~~L~~  | **DONE** — `@aws-sdk/client-s3` installed. `S3StorageService` + `LocalStorageService` via `STORAGE_DRIVER` env var                          |

---

## P2 — UX Polish

| ID         | Title                                     | Priority | Effort | Notes                                                                                                         |
| ---------- | ----------------------------------------- | -------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| ~~UX-001~~ | ~~Add search debounce to all list pages~~ | ~~P2~~   | ~~S~~  | **DONE** — Custom `useDebounce` hook deployed across 8+ list pages with tests                                 |
| ~~UX-002~~ | ~~Replace window.confirm() everywhere~~   | ~~P2~~   | ~~S~~  | **DONE** — Zero `window.confirm()` calls remain. All pages use ConfirmDialog.                                 |
| ~~UX-003~~ | ~~Add export buttons (Orders, Loads)~~    | ~~P3~~   | ~~M~~  | **DONE** — Client-side CSV export on Orders + Loads pages. Exports visible or selected rows.                  |
| ~~UX-004~~ | ~~Add bulk status update (Orders)~~       | ~~P3~~   | ~~M~~  | **DONE** — `useBulkUpdateOrderStatus` hook + bulk action bar with status selector dialog on Orders page.      |
| ~~UX-005~~ | ~~Add aging report UI~~                   | ~~P2~~   | ~~M~~  | **DONE** — Backend endpoint + frontend page with customer/date filters fully built                            |
| ~~UX-006~~ | ~~Wire carrier documents API to UI~~      | ~~P2~~   | ~~M~~  | **DONE** — File upload via `FileInterceptor` + `IStorageService`, download URL endpoint, localStorage removed |

---

## P3 — Pre-Launch

| ID             | Title                            | Priority | Effort | Notes                                                                                                                                                      |
| -------------- | -------------------------------- | -------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LEGAL-001      | Privacy Policy document          | P2       | -      | Legal review required                                                                                                                                      |
| LEGAL-002      | Terms of Service document        | P2       | -      | Legal review required                                                                                                                                      |
| ~~LAUNCH-001~~ | ~~Production environment setup~~ | ~~P1~~   | ~~L~~  | **DONE** — Dockerfiles (API + Web multi-stage), `docker-compose.prod.yml` with resource limits, healthchecks, restart policies, `.dockerignore`            |
| ~~LAUNCH-002~~ | ~~Monitoring & alerting setup~~  | ~~P1~~   | ~~L~~  | **DONE** — Health endpoints (`/health`, `/ready`, `/live`), Pino structured logging, Sentry framework (opt-in via `SENTRY_DSN`), `helmet` security headers |
| ~~LAUNCH-003~~ | ~~Database backup strategy~~     | ~~P0~~   | ~~M~~  | **DONE** — 3 scripts (`pg-backup.sh`, `pg-restore.sh`, `pg-verify.sh`), GitHub Actions daily at 2AM UTC, rotation policy (7/4/12)                          |
| DOCS-001       | User onboarding guide            | P2       | L      | Help center content                                                                                                                                        |

---

## Deferred Services (P2/P3 — Not Building Yet)

These services have backend modules but no frontend is planned until post-MVP:

| Service                          | Backend Status | Frontend Priority                |
| -------------------------------- | -------------- | -------------------------------- |
| Claims                           | Partial        | P1 (after TMS Core + Accounting) |
| Documents                        | Partial        | P1 (after Claims)                |
| Communication                    | Partial        | P1                               |
| Customer Portal                  | Partial        | P2                               |
| Carrier Portal                   | Partial        | P2                               |
| Contracts                        | Partial        | P2                               |
| Credit                           | Partial        | P2                               |
| Factoring                        | Partial        | P2                               |
| Agents                           | Partial        | P2                               |
| Analytics                        | Partial        | P2                               |
| Workflow                         | Partial        | P3                               |
| Search                           | Partial        | P2                               |
| Integration Hub                  | Partial        | P3                               |
| EDI                              | Partial        | P3                               |
| Safety, HR, Scheduler, Help Desk | Partial        | P3                               |

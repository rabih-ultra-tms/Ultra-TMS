# Backlog — Ultra TMS

> Tasks queued for post-Quality Sprint execution.
> Last updated: 2026-03-11 (P0 audit — resolved stale items, cross-tenant fixes applied)
> Format: ID | Title | Priority | Effort | Notes

---

## P0 — Build Missing Screens (Post-Quality Sprint)

> **2026-03-11 Audit:** BUILD-001 through BUILD-006 already exist as real implementations (verified via code scan). Reclassified as DONE.

| ID            | Title                           | Priority | Effort   | Notes                                                        |
| ------------- | ------------------------------- | -------- | -------- | ------------------------------------------------------------ |
| ~~BUILD-001~~ | ~~Accounting Dashboard Screen~~ | ~~P0~~   | ~~L~~    | **DONE** — 98 LOC, real API calls to `/accounting/dashboard` |
| ~~BUILD-002~~ | ~~Invoice List Screen~~         | ~~P0~~   | ~~L~~    | **DONE** — 128 LOC, full CRUD with pagination/filters        |
| ~~BUILD-003~~ | ~~Invoice Create Form~~         | ~~P0~~   | ~~M~~    | **DONE** — 13 LOC wrapper → InvoiceForm component            |
| ~~BUILD-004~~ | ~~Invoice Detail Screen~~       | ~~P0~~   | ~~M~~    | **DONE** — 184 LOC, 3-tab view with send/void/PDF            |
| ~~BUILD-005~~ | ~~Settlement List Screen~~      | ~~P0~~   | ~~M~~    | **DONE** — 71 LOC, real API calls with filters               |
| ~~BUILD-006~~ | ~~Settlement Detail Screen~~    | ~~P0~~   | ~~M~~    | **DONE** — 423 LOC, approval workflow, financial summary     |
| BUILD-007     | Payment List Screen             | P1       | M (2-4h) | Already exists (120 LOC) — needs QA                          |
| BUILD-008     | Commission Dashboard Screen     | P1       | L (4-8h) | Backend partial                                              |
| BUILD-009     | Commission Plans Screen         | P1       | M (2-4h) | Already exists (224 LOC) — needs QA                          |
| BUILD-010     | Commission Transactions Screen  | P1       | M (2-4h) | Already exists (191 LOC) — needs QA                          |
| BUILD-011     | Load Board Screen               | P2       | L (4-8h) | Backend all stubs — needs real impl                          |

---

## P0 — Fix Known Bugs (Post-Quality Sprint)

> **2026-03-11 Audit:** BUG-001, BUG-012, BUG-016 already resolved. Cross-tenant security fixes (SEC-TENANT) applied.

| ID          | Title                                  | Priority | Effort | Notes                                                                                                                                                                                           |
| ----------- | -------------------------------------- | -------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~BUG-001~~ | ~~Carrier Detail 404~~                 | ~~P0~~   | ~~M~~  | **DONE** — page exists (198 LOC, 8 tabs, fully functional)                                                                                                                                      |
| BUG-002     | Load History Detail 404                | P1       | S (1h) | Route `carriers/[id]/load-history/[loadId]` not needed — loads shown via CarrierLoadsTab in carrier detail. Load history at `/load-history/[id]` exists (192 LOC). **Reclassified: not a bug.** |
| BUG-009     | CRM Contacts — Add delete button       | P1       | S (1h) | Backend `DELETE /crm/contacts/:id` exists                                                                                                                                                       |
| BUG-010     | CRM Leads — Add delete button          | P1       | S (1h) | Backend `DELETE /crm/opportunities/:id` exists                                                                                                                                                  |
| BUG-011     | CRM Lead — Add convert button          | P1       | M (2h) | `POST /crm/opportunities/:id/convert` (verify endpoint)                                                                                                                                         |
| ~~BUG-012~~ | ~~localStorage token storage (XSS)~~   | ~~P0~~   | ~~M~~  | **DONE** — HTTP-only cookies implemented, zero localStorage usage                                                                                                                               |
| BUG-013     | Pipeline stage confirm dialog          | P1       | S (1h) | Add ConfirmDialog before stage change                                                                                                                                                           |
| BUG-014     | window.confirm() remaining x3          | P1       | S (2h) | Replace with ConfirmDialog in 3 places                                                                                                                                                          |
| BUG-015     | No search debounce on carrier list     | P2       | S (1h) | Use `use-debounce` hook on search input                                                                                                                                                         |
| ~~BUG-016~~ | ~~useDashboard KPI cards hardcoded 0~~ | ~~P1~~   | ~~S~~  | **DONE** — 3 real API hooks fetch live data (carriers, loads, quotes stats)                                                                                                                     |

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

| ID      | Title                                    | Priority | Effort   | Notes                                                              |
| ------- | ---------------------------------------- | -------- | -------- | ------------------------------------------------------------------ |
| SEC-001 | Add CSP headers to Next.js config        | P1       | M (2-4h) | next.config.js headers()                                           |
| SEC-002 | Add rate limiting (@nestjs/throttler)    | P1       | M (2-4h) | 5 req/min auth, 100 req/min API                                    |
| SEC-003 | Verify CSRF protection (SameSite cookie) | P1       | S (1h)   | Check auth cookie config                                           |
| SEC-004 | Add gitleaks pre-commit hook             | P2       | S (1h)   | Secret scanning                                                    |
| SEC-005 | Account lockout after 10 failed logins   | P2       | M (2-4h) | Track in Redis                                                     |
| SEC-006 | Verify HubSpot webhook signature         | P1       | S (1h)   | `hubspot.controller.ts:30` — currently accepts unverified payloads |

---

## P1 — Testing Coverage

| ID       | Title                               | Priority | Effort   | Notes                  |
| -------- | ----------------------------------- | -------- | -------- | ---------------------- |
| TEST-001 | Add Playwright E2E: Login flow      | P0       | M (2-4h) | Most critical flow     |
| TEST-002 | Add Playwright E2E: Quote creation  | P1       | M (2-4h) | Revenue-critical flow  |
| TEST-003 | Add Playwright E2E: Load lifecycle  | P1       | L (4-8h) | End-to-end TMS flow    |
| TEST-004 | Add unit tests: Accounting service  | P1       | M (2-4h) | 0% coverage currently  |
| TEST-005 | Add unit tests: Commission service  | P1       | M (2-4h) | 0% coverage currently  |
| TEST-006 | Add unit tests: TMS Core operations | P1       | L (4-8h) | <5% coverage currently |

---

## P2 — Infrastructure

| ID        | Title                                  | Priority | Effort   | Notes                                                                                |
| --------- | -------------------------------------- | -------- | -------- | ------------------------------------------------------------------------------------ |
| INFRA-001 | Set up CI/CD pipeline (GitHub Actions) | P1       | L (4-8h) | No .github/workflows/ currently                                                      |
| INFRA-002 | Add structured logging (Pino)          | P2       | M (2-4h) | Replace NestJS default logger                                                        |
| INFRA-003 | Add correlation IDs                    | P2       | M (2-4h) | Cross-service request tracing                                                        |
| INFRA-004 | Add Sentry error tracking              | P2       | M (2-4h) | Frontend + backend                                                                   |
| INFRA-005 | Performance budgets (LCP, bundle size) | P2       | M (2-4h) | Lighthouse CI integration                                                            |
| INFRA-006 | Implement cloud storage (S3/Azure/GCS) | P2       | L (4-8h) | `file-upload.util.ts` + `companies.controller.ts` — file uploads throw in production |

---

## P2 — UX Polish

| ID     | Title                                 | Priority | Effort   | Notes                                                                           |
| ------ | ------------------------------------- | -------- | -------- | ------------------------------------------------------------------------------- |
| UX-001 | Add search debounce to all list pages | P2       | S (2h)   | Apply use-debounce hook                                                         |
| UX-002 | Replace window.confirm() everywhere   | P2       | S (2h)   | Already partially done                                                          |
| UX-003 | Add export buttons (Orders, Loads)    | P3       | M (2-4h) | Backend endpoints exist (unused)                                                |
| UX-004 | Add bulk status update (Orders)       | P3       | M (2-4h) | Backend endpoint exists (unused)                                                |
| UX-005 | Add aging report UI                   | P2       | M (2-4h) | After QS-003 aging bucket endpoint                                              |
| UX-006 | Wire carrier documents API to UI      | P2       | M (2-4h) | `carrier-documents-section.tsx` — shows static checklist, needs API integration |

---

## P3 — Pre-Launch

| ID         | Title                        | Priority | Effort | Notes                        |
| ---------- | ---------------------------- | -------- | ------ | ---------------------------- |
| LEGAL-001  | Privacy Policy document      | P2       | -      | Legal review required        |
| LEGAL-002  | Terms of Service document    | P2       | -      | Legal review required        |
| LAUNCH-001 | Production environment setup | P1       | L      | Docker deploy config         |
| LAUNCH-002 | Monitoring & alerting setup  | P1       | L      | Uptime, error rate alerts    |
| LAUNCH-003 | Database backup strategy     | P0       | M      | Automated PostgreSQL backups |
| DOCS-001   | User onboarding guide        | P2       | L      | Help center content          |

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

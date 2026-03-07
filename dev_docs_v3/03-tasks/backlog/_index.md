# Backlog — Ultra TMS

> Tasks queued for post-Quality Sprint execution.
> Last updated: 2026-03-07
> Format: ID | Title | Priority | Effort | Notes

---

## P0 — Build Missing Screens (Post-Quality Sprint)

These screens have no frontend implementation. All backend APIs exist.

| ID | Title | Priority | Effort | Notes |
|----|-------|----------|--------|-------|
| BUILD-001 | Accounting Dashboard Screen | P0 | L (4-8h) | QS-003 endpoint needed first |
| BUILD-002 | Invoice List Screen | P0 | L (4-8h) | `GET /accounting/invoices` exists |
| BUILD-003 | Invoice Create Form | P0 | M (2-4h) | `POST /accounting/invoices` exists |
| BUILD-004 | Invoice Detail Screen | P0 | M (2-4h) | `GET /accounting/invoices/:id` exists |
| BUILD-005 | Settlement List Screen | P0 | M (2-4h) | `GET /accounting/settlements` exists |
| BUILD-006 | Settlement Detail Screen | P0 | M (2-4h) | |
| BUILD-007 | Payment List Screen | P1 | M (2-4h) | |
| BUILD-008 | Commission Dashboard Screen | P1 | L (4-8h) | Backend partial |
| BUILD-009 | Commission Plans Screen | P1 | M (2-4h) | |
| BUILD-010 | Commission Transactions Screen | P1 | M (2-4h) | |
| BUILD-011 | Load Board Screen | P2 | L (4-8h) | Backend all stubs — needs real impl |

---

## P0 — Fix Known Bugs (Post-Quality Sprint)

| ID | Title | Priority | Effort | Notes |
|----|-------|----------|--------|-------|
| BUG-001 | Carrier Detail 404 — Create page.tsx | P0 | M (2-4h) | `apps/web/app/(dashboard)/carriers/[id]/page.tsx` missing |
| BUG-002 | Load History Detail 404 | P0 | M (2-4h) | `carriers/[id]/load-history/[loadId]/page.tsx` missing |
| BUG-009 | CRM Contacts — Add delete button | P1 | S (1h) | Backend `DELETE /crm/contacts/:id` exists |
| BUG-010 | CRM Leads — Add delete button | P1 | S (1h) | Backend `DELETE /crm/opportunities/:id` exists |
| BUG-011 | CRM Lead — Add convert button | P1 | M (2h) | `POST /crm/opportunities/:id/convert` (verify endpoint) |
| BUG-012 | localStorage token storage (XSS) | P0 | M (2-4h) | Remove `localStorage.getItem('token')` from API client |
| BUG-013 | Pipeline stage confirm dialog | P1 | S (1h) | Add ConfirmDialog before stage change |
| BUG-014 | window.confirm() remaining x3 | P1 | S (2h) | Replace with ConfirmDialog in 3 places |
| BUG-015 | No search debounce on carrier list | P2 | S (1h) | Use `use-debounce` hook on search input |
| BUG-016 | useDashboard KPI cards hardcoded 0 | P1 | S (1h) | QS-003 needed first, then wire dashboard hook |

---

## P1 — TMS Core Verification (Post-QS-008)

After QS-008 runtime verification discovers actual status of TMS Core screens:

| ID | Title | Priority | Effort | Notes |
|----|-------|----------|--------|-------|
| TMS-001 | TMS Core — Verify and fix Orders screens | P0 | Unknown | Depends on QS-008 result |
| TMS-002 | TMS Core — Verify and fix Loads screens | P0 | Unknown | Depends on QS-008 result |
| TMS-003 | TMS Core — Verify and fix Dispatch Board | P0 | Unknown | QS-001 (WS) required first |
| TMS-004 | TMS Core — Verify and fix Tracking Map | P1 | Unknown | QS-001 (WS) required first |
| TMS-005 | TMS Core — Operations Dashboard | P1 | Unknown | May need dashboard KPI fix |

---

## P1 — Security Hardening

| ID | Title | Priority | Effort | Notes |
|----|-------|----------|--------|-------|
| SEC-001 | Add CSP headers to Next.js config | P1 | M (2-4h) | next.config.js headers() |
| SEC-002 | Add rate limiting (@nestjs/throttler) | P1 | M (2-4h) | 5 req/min auth, 100 req/min API |
| SEC-003 | Verify CSRF protection (SameSite cookie) | P1 | S (1h) | Check auth cookie config |
| SEC-004 | Add gitleaks pre-commit hook | P2 | S (1h) | Secret scanning |
| SEC-005 | Account lockout after 10 failed logins | P2 | M (2-4h) | Track in Redis |

---

## P1 — Testing Coverage

| ID | Title | Priority | Effort | Notes |
|----|-------|----------|--------|-------|
| TEST-001 | Add Playwright E2E: Login flow | P0 | M (2-4h) | Most critical flow |
| TEST-002 | Add Playwright E2E: Quote creation | P1 | M (2-4h) | Revenue-critical flow |
| TEST-003 | Add Playwright E2E: Load lifecycle | P1 | L (4-8h) | End-to-end TMS flow |
| TEST-004 | Add unit tests: Accounting service | P1 | M (2-4h) | 0% coverage currently |
| TEST-005 | Add unit tests: Commission service | P1 | M (2-4h) | 0% coverage currently |
| TEST-006 | Add unit tests: TMS Core operations | P1 | L (4-8h) | <5% coverage currently |

---

## P2 — Infrastructure

| ID | Title | Priority | Effort | Notes |
|----|-------|----------|--------|-------|
| INFRA-001 | Set up CI/CD pipeline (GitHub Actions) | P1 | L (4-8h) | No .github/workflows/ currently |
| INFRA-002 | Add structured logging (Pino) | P2 | M (2-4h) | Replace NestJS default logger |
| INFRA-003 | Add correlation IDs | P2 | M (2-4h) | Cross-service request tracing |
| INFRA-004 | Add Sentry error tracking | P2 | M (2-4h) | Frontend + backend |
| INFRA-005 | Performance budgets (LCP, bundle size) | P2 | M (2-4h) | Lighthouse CI integration |

---

## P2 — UX Polish

| ID | Title | Priority | Effort | Notes |
|----|-------|----------|--------|-------|
| UX-001 | Add search debounce to all list pages | P2 | S (2h) | Apply use-debounce hook |
| UX-002 | Replace window.confirm() everywhere | P2 | S (2h) | Already partially done |
| UX-003 | Add export buttons (Orders, Loads) | P3 | M (2-4h) | Backend endpoints exist (unused) |
| UX-004 | Add bulk status update (Orders) | P3 | M (2-4h) | Backend endpoint exists (unused) |
| UX-005 | Add aging report UI | P2 | M (2-4h) | After QS-003 aging bucket endpoint |

---

## P3 — Pre-Launch

| ID | Title | Priority | Effort | Notes |
|----|-------|----------|--------|-------|
| LEGAL-001 | Privacy Policy document | P2 | - | Legal review required |
| LEGAL-002 | Terms of Service document | P2 | - | Legal review required |
| LAUNCH-001 | Production environment setup | P1 | L | Docker deploy config |
| LAUNCH-002 | Monitoring & alerting setup | P1 | L | Uptime, error rate alerts |
| LAUNCH-003 | Database backup strategy | P0 | M | Automated PostgreSQL backups |
| DOCS-001 | User onboarding guide | P2 | L | Help center content |

---

## Deferred Services (P2/P3 — Not Building Yet)

These services have backend modules but no frontend is planned until post-MVP:

| Service | Backend Status | Frontend Priority |
|---------|---------------|-------------------|
| Claims | Partial | P1 (after TMS Core + Accounting) |
| Documents | Partial | P1 (after Claims) |
| Communication | Partial | P1 |
| Customer Portal | Partial | P2 |
| Carrier Portal | Partial | P2 |
| Contracts | Partial | P2 |
| Credit | Partial | P2 |
| Factoring | Partial | P2 |
| Agents | Partial | P2 |
| Analytics | Partial | P2 |
| Workflow | Partial | P3 |
| Search | Partial | P2 |
| Integration Hub | Partial | P3 |
| EDI | Partial | P3 |
| Safety, HR, Scheduler, Help Desk | Partial | P3 |

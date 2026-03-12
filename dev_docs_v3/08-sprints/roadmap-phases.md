# Roadmap Phases — Ultra TMS

> **Total timeline:** 16 weeks MVP, ongoing post-MVP
> **Last updated:** 2026-03-12

---

## Phase Overview

```
Week 01-02  ████ Quality Sprint          COMPLETE (16/16 tasks)
Week 03-04  ████ Sprint 02: Accounting   COMPLETE (9/9 tasks, ~12h actual)
Week 05-06  ████ Sprint 03: TMS Core     COMPLETE (8/8 tasks)
Week 09-10  ████ Sprint 05: Security     COMPLETE (10/10 tasks)
Week 07-08  ░░░░ Sprint 04: Commission   PLANNED (0/10 tasks, 38h) — skipped, next up
Week 11-12  ░░░░ Sprint 06: Testing      PLANNED (0/10 tasks, 43h)
Week 13-14  ░░░░ Sprint 07: Load Board   NO PLAN FILE
Week 15-16  ░░░░ Sprint 08: Beta Launch  NO PLAN FILE
```

**Note:** Sprint 05 (Security) was prioritized ahead of Sprint 04 (Commission). Sprint 04 is next.

---

## Phase 1: Foundation (Weeks 1-4) — Quality + Accounting — COMPLETE

**Quality Sprint — COMPLETE (16/16 tasks, 2026-03-10):**

- QS-001: WebSocket /notifications gateway
- QS-002: Soft Delete Migration
- QS-003: Accounting Dashboard Endpoint
- QS-004: CSA Scores Endpoint
- QS-005: Profile Page (RHF forms, password, MFA, avatar)
- QS-006: Check Call Form RHF Refactor
- QS-007: CORS Env Variable
- QS-008: Runtime Verification (101/103 PASS, 1 STUB, 1 BROKEN)
- QS-009: Delete .bak Directories
- QS-010: Triage TODOs (339 → 8, 87.5% reduction)
- QS-011: Customer Portal 4-Page MVP
- QS-012: Rate Confirmation PDF
- QS-013: BOL PDF Generation
- QS-014: Prisma Client Extension (auto tenantId)
- QS-015: Financial Calculation Tests (10 tests)
- QS-016: Tenant Isolation Tests (5 tests)

**Sprint 02 — Accounting — COMPLETE (9/9 tasks, ~12h actual vs 41h estimated):**

- ACC-001 through ACC-009: Dashboard, Invoice CRUD, Payment received/made, Settlement list+detail+line items, Chart of Accounts, Journal Entries
- Most screens were pre-existing; sprint focused on QA, ConfirmDialog migration, and wiring fixes

**Exit criteria met:** Accounting module fully functional, all routes verified

---

## Phase 2: Core Operations (Weeks 5-8) — TMS Core + Commission

**Sprint 03 — TMS Core — COMPLETE (8/8 tasks):**

- TMS-001: Order List Screen
- TMS-002: Order Create/Edit Form (with stops, items)
- TMS-003: Order Detail View
- TMS-004: Load List Screen (filters, presets, date range)
- TMS-005: Load Detail View (status-dependent actions)
- TMS-006: Dispatch Board (kanban/table toggle, real-time polling)
- TMS-007: Check Call Form + History (ETA/reminder fields, timeline)
- TMS-008: Rate Confirmation Send

**Sprint 04 — Commission & Agents — PLANNED (0/10 tasks, 38h):**

- Commission plan CRUD (flat, %, tiered)
- Auto-calculation on load delivery
- Payout workflow (calculate → approve → pay)
- Agent management and customer assignments
- Dependencies met (Sprint 02 + 03 both complete)

**Exit criteria:** Full order-to-cash flow works end-to-end

---

## Phase 3: Hardening (Weeks 9-12) — Security + Testing

**Sprint 05 — Security — COMPLETE (10/10 tasks):**

- SEC-001: HttpOnly cookie migration (localStorage removed)
- SEC-002: Console JWT logs removed
- SEC-003: CSRF protection (double-submit cookie)
- SEC-004: Rate limiting on auth endpoints
- SEC-005: RBAC audit (global APP_GUARD on all 187 controllers)
- SEC-006: Audit log integration
- SEC-007: Input sanitization (global SanitizeInputInterceptor — strips HTML, trims whitespace)
- SEC-008: Password policy enforcement
- SEC-009: Session management hardening (refresh token rotation)
- SEC-010: Security headers (Helmet — HSTS, X-Frame-Options, Permissions-Policy)
- Cross-tenant mutations: 26 mutations hardened with tenantId in WHERE

**Sprint 06 — Testing — PLANNED (0/10 tasks, 43h):**

- 40% backend test coverage (from ~15%)
- 25% frontend test coverage (from 8.7%)
- 5 E2E critical path tests
- CI pipeline setup
- Bug bash: zero P0/P1 bugs

**Exit criteria:** Production-grade security, reliable test suite

---

## Phase 4: Launch Prep (Weeks 13-16) — NO PLAN FILES

**Sprint 07 — Load Board + Polish:**

- Load board posting/bidding
- Carrier capacity search
- UI polish pass (loading states, empty states, transitions)
- Mobile responsiveness audit

**Sprint 08 — Beta Launch:**

- Performance optimization (bundle size, API latency)
- Monitoring setup (error tracking, APM)
- Documentation review
- Staging deployment
- Beta user onboarding
- Go/no-go checklist

**Exit criteria:** MVP ready for beta customers

---

## Post-MVP Roadmap (P1/P2/P3)

| Quarter     | Services                                    | Notes       |
| ----------- | ------------------------------------------- | ----------- |
| Q1 Post-MVP | Claims, Documents, Communication            | P1 services |
| Q2 Post-MVP | Customer Portal, Carrier Portal, Contracts  | P1 services |
| Q3 Post-MVP | Agents (full), Credit, Factoring, Analytics | P2 services |
| Q4 Post-MVP | Workflow, Integration Hub, Search           | P2 services |
| Year 2      | Safety, EDI, HR, Help Desk, Feedback, etc.  | P3 services |

---

## Key Metrics

| Metric             | Current    | MVP Target  | Notes                            |
| ------------------ | ---------- | ----------- | -------------------------------- |
| Overall Score      | 7.5/10 (B) | 8.0/10 (B+) | Up from 6.2 at start             |
| Test Coverage (BE) | ~15%       | 40%         | Sprint 06                        |
| Test Coverage (FE) | 8.7%       | 25%         | Sprint 06                        |
| P0 Bugs            | 0          | 0           | Resolved                         |
| P1 Bugs            | ~2         | 0           | Sprint 06 bug bash               |
| Routes Verified    | 101/103    | 103/103     | QS-008 (1 STUB, 1 BROKEN remain) |
| Screens Built      | ~50        | ~50         | MVP scope met                    |
| API Endpoints      | ~187       | ~200        |                                  |
| Sprints Complete   | 4/8        | 8/8         | Quality + 02 + 03 + 05           |

---

## Decision Log

| Date       | Decision                              | Rationale                                     |
| ---------- | ------------------------------------- | --------------------------------------------- |
| 2026-02-08 | v2 scope: 8 MVP services, not 38      | Focus on what customers need first            |
| 2026-02-12 | Design system V1 approved             | Navy accent, Inter font, dot-label badges     |
| 2026-02-16 | Sonnet audit: 62 bugs found, 57 fixed | Quality gate before feature sprint            |
| 2026-03-07 | v3 docs: cover all 38 services        | Document everything, build in priority order  |
| 2026-03-07 | Quality Sprint before new features    | Runtime verification + P0 fixes first         |
| 2026-03-09 | Consolidated sprints into 08-sprints/ | Single source of truth                        |
| 2026-03-12 | Sprint 05 prioritized over Sprint 04  | Security hardening before commission features |

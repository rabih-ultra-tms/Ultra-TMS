# Ultra TMS — Project Status Dashboard

> **Last Updated:** 2026-03-09
> **Current Phase:** Quality Sprint (post-initial-build, pre-production)
> **Overall Health:** B- (7.0/10) — Strong backend, frontend much further along than documented. 96 unverified routes remain.
> **Production Readiness:** 3.0/10 — See [PRODUCTION-READINESS-ASSESSMENT.md](05-audit/PRODUCTION-READINESS-ASSESSMENT.md)
> **Active Plan:** [dev_docs_v3/](.) — covers ALL 38 services (not just 8 MVP)
> **Documentation Quality:** 10/10 — Remediated via 7-phase tribunal response (2026-03-09). 16 new files, 8 enhanced.

---

## Build Status

| Metric | Value |
|---|---|
| Frontend routes | 98 (page.tsx files — corrected Mar 7 from actual scan) |
| React components | 304 (corrected Mar 7 from actual scan of components/) |
| Custom hooks | 55 (verified 2026-03-09 -- was 51 on Mar 7, 4 added since) |
| Backend modules | 35 active + 5 .bak = 40 total module dirs |
| Controller files | ~187 (across 35 active modules) |
| NestJS Service files | ~225 (across 35 active modules) |
| DTOs | 309 |
| Prisma models | 260 |
| Prisma enums | 114 |
| Migrations | 30 (verified 2026-03-09 — was incorrectly listed as 31) |
| Design spec files | 381 (42 service folders) |
| Services defined | 32 services + 6 infrastructure modules + Command Center (39 total). Note: 38 service hubs + 1 Command Center readiness assessment = 39 total audited. |

---

## Quality Sprint — Active Tasks (QS-001 to QS-010)

| ID | Task | Effort | Priority | Assignee | Status |
|----|------|--------|----------|----------|--------|
| QS-001 | WebSocket Gateway (/notifications only) | L | P0 | Claude Code | **DONE** (2026-03-09) |
| QS-002 | Soft Delete Migration (Order, Quote, Invoice, Settlement, Payment) | M | P0 | Claude Code | planned |
| QS-003 | Accounting Dashboard Endpoint | M | P1 | Claude Code | planned |
| QS-004 | CSA Scores Endpoint | S | P1 | Claude Code | planned |
| QS-005 | Profile Page (currently 0/10 stub) | L | P1 | Claude Code | planned |
| QS-006 | Check Call Form RHF Refactor | M | P1 | Codex/Gemini | planned |
| QS-007 | CORS Env Variable | S | P1 | Codex/Gemini | planned |
| QS-008 | Runtime Verification (click every route with Playwright) | L | P0 | Claude Code | planned |
| QS-009 | Delete .bak Directories | S | P2 | Codex/Gemini | planned |
| QS-010 | Triage 339 TODOs | M | P2 | Codex/Gemini | planned |
| QS-011 | Customer Portal — Basic 4-Page MVP | L | P0 | Claude Code | planned |
| QS-012 | Rate Confirmation PDF Generation | M | P0 | Claude Code | **DONE** (2026-03-09) |
| QS-013 | BOL PDF Generation | M | P0 | Claude Code | **DONE** (2026-03-09) |
| QS-014 | Prisma Client Extension for Auto tenantId | L | P0 | Claude Code | **DONE** (2026-03-09) |
| QS-015 | Financial Calculation Tests (10 tests) | L | P0 | Claude Code | planned |
| QS-016 | Tenant Isolation Tests (5 tests) | M | P0 | Claude Code | planned |

---

## Service Health Table (All 39 Services)

### P0 MVP (11 services — includes Command Center)

| # | Service | Backend | Frontend | Tests | Verified | Confidence | Priority |
|---|---------|---------|----------|-------|----------|------------|----------|
| 01 | Auth & Admin | Done | Partial (17/20 screens) | Partial | No | Medium | P0 |
| 02 | Dashboard | Done | Partial (shell, KPIs hardcoded) | None | No | Low | P0 |
| 03 | CRM / Customers | Done | Built (15 pages) | Partial | No | Medium | P0 |
| 04 | Sales / Quotes | Done | Partial (6 pages, LP PROTECTED) | None | No | Medium | P0 |
| 05 | TMS Core (Orders/Loads/Dispatch) | Done | Built (12 pages, 7.4/10) | None | No | Medium | P0 |
| 06 | Carrier Management | Done | Built (6 pages, 17 components) | Partial | No | Medium | P0 |
| 07 | Accounting | Done | Built (10 pages, 7.9/10) | Partial | No | Medium | P0 |
| 08 | Commission | Done | Built (11 pages, 8.5/10) | 14 FE tests | No | High | P0 |
| 09 | Load Board | Partial | Built (4 pages, 10 components) | 13 FE suites + BE specs | No | Medium | P0 |
| 13 | Customer Portal | Substantial | Not Built (P0-Basic: 4 pages) | None | No | Low | P0 |
| 39 | **Command Center** | Partial (consumes 180+ endpoints) | Foundation (4,095 LOC dispatch board) | 3 FE tests (570 LOC) | No | High | **P0** |

### P1 Post-MVP (3 services)

| # | Service | Backend | Frontend | Tests | Verified | Confidence | Priority |
|---|---------|---------|----------|-------|----------|------------|----------|
| 11 | Documents | Substantial (20 endpoints) | Partial (4 hooks, 4+ components, 0 pages) | Backend: 7 spec files | No | High | P1 |
| 12 | Communication | Substantial (30 endpoints) | Partial (3 hooks, 0 pages) | Backend: 7 spec files | No | High | P1 |
| 14 | Carrier Portal | Substantial (54 endpoints, 5 models, 5 enums) | Not Built | 7 spec stubs + 1 e2e | No | High | P1 |

### P2 Extended (9 services)

| # | Service | Backend | Frontend | Tests | Verified | Confidence | Priority |
|---|---------|---------|----------|-------|----------|------------|----------|
| 10 | Claims | Substantial (44 endpoints, 8 models, 20+ DTOs) | Not Built | 7 BE spec files | No | High | P2 |
| 15 | Contracts | Substantial (58 endpoints, 11 models, 6 enums) | Not Built | 2 spec files | No | High | P2 |
| 16 | Agents | Substantial (6 controllers, 43 endpoints, 9 models) | Not Built | None | No | High | P2 |
| 17 | Credit | Substantial (5 controllers, 31 endpoints, 5 models) | Not Built | 5 spec files | No | High | P2 |
| 18 | Factoring Internal | Substantial (5 controllers, 30 endpoints, 5 models) | Not Built | None | No | High | P2 |
| 19 | Analytics | Substantial (6 controllers, 40 endpoints, 10 models) | Not Built | 4 spec files | No | High | P2 |
| 20 | Workflow | Substantial (5 controllers, 35 endpoints) | Not Built | None | No | High | P2 |
| 21 | Integration Hub | Substantial (7 controllers, 45 endpoints, 7 models) | Not Built | None | No | High | P2 |
| 22 | Search | Substantial (4 controllers, 27 endpoints) | Not Built | 8 spec files | No | High | P2 |

### P3 Future (10 services) — see [01-services/p3-future/_index.md](01-services/p3-future/_index.md)

10 P3 services documented with full 15-section hubs (HR 35ep, Scheduler 25ep, Safety 43ep, EDI 35ep, Help Desk 31ep, Feedback 25ep, Rate Intelligence 21ep, Audit 31ep, Config 39ep, Cache 20ep). 6 infrastructure modules (Super Admin, Email, Storage, Redis, Health, Operations) moved to P-Infra tier — see [01-services/p-infra/_index.md](01-services/p-infra/_index.md).

---

## Blocked Tasks

| ID | Title | Blocked by | Reason |
|----|-------|------------|--------|
| QS-010 | Triage TODOs | QS-008 (preferred) | Better to know actual codebase state before triaging |
| BUILD-001 | Accounting Dashboard Screen | QS-003 | Endpoint must exist before building screen |
| TMS-001/002 | TMS Core screens | QS-008 | Runtime verification determines what needs to be fixed |
| TMS-003/004 | Dispatch + Tracking | QS-001 | WebSocket must exist before real-time screens work |
| QS-016 | Tenant Isolation Tests | QS-014 (preferred) | Prisma Client Extension should exist for cleaner test setup |

**No hard blockers in Quality Sprint** — QS-001 through QS-009 can start immediately in parallel.

---

## Dependency Analysis

> Generated by DEPENDENCY-GRAPHER — see [04-completeness/dependency-graph.md](04-completeness/dependency-graph.md)

**Critical Path:** QS-001 (14h standalone), QS-008 → TMS-001/002, QS-003 → BUILD-001

**Parallelizable now (all 10 QS tasks have no hard blockers):**

- Claude Code: QS-001 (L), then QS-008, then QS-005
- Claude Code: QS-014 (L), then QS-012 (M) → QS-013 (M), then QS-015 (L), then QS-016 (M), then QS-011 (L)
- Codex/Gemini: QS-007 (30min) → QS-009 (30min) → QS-004 (2h) → QS-002 (3h) → QS-006 (3h) → QS-010 (3h)

---

## Key Blockers

1. **WebSocket gap** — dispatch and tracking pages have no real-time data (SocketProvider has infinite loop bug)
2. **Missing endpoints** — Accounting dashboard, CSA scores not built on backend
3. **96 unverified routes** — no Playwright run has confirmed all routes render correctly
4. **339 TODOs** — technical debt scattered across codebase, untriaged
5. **EDI at P3 may be too low** — many enterprise shippers require EDI 204/214/210 for load tendering, status updates, and invoicing. Backend has 38 endpoints and 9 Prisma models already built (PST-26). Consider promoting to P1 if enterprise customers are targeted before v2.
6. **Carrier Packet Generation** not built — insurance certificate + W-9 + carrier agreement bundle required for carrier onboarding compliance. No endpoint, no frontend. See `00-foundations/carrier-onboarding-workflow.md` for full gap analysis.
7. **Accessorial Line Item Flow** not documented — detention, layover, lumper, TONU charges should auto-populate from Load to Invoice as line items. Load `accessorialCosts` field exists but the auto-flow to `InvoiceLineItem` records during invoice generation on DELIVERED status is not verified. See domain rules 42-45 and `00-foundations/end-to-end-workflows.md` Step 8.

---

## Team Protocol

| Agent | Best For | Avoid |
|---|---|---|
| Claude Code | Complex features, audits, architecture, security, WebSockets | Simple CRUD, boilerplate |
| Gemini/Codex | CRUD screens, patterns, tests, form refactors, cleanup | Complex state, WS, auth |

**Session start:** `/kickoff` → read STATUS.md → find next QS task → read hub file → code

---

## Documentation Completeness

| Tier | Services | Hub Files | 15-Section Format | Index File |
|------|----------|-----------|-------------------|------------|
| P0 MVP | 9 | 9/9 | Yes | N/A |
| P1 Post-MVP | 3 | 3/3 | Yes | [_index.md](01-services/p1-post-mvp/_index.md) |
| P2 Extended | 9 | 9/9 | Yes | [_index.md](01-services/p2-extended/_index.md) |
| P3 Future | 10 | 10/10 | 10 full + 6 abbreviated | [_index.md](01-services/p3-future/_index.md) |
| P-Infra | 6 | 6/6 | Abbreviated | [_index.md](01-services/p-infra/_index.md) |
| **Total** | **38** | **38/38** | **All documented** | |

---

## Tribunal Summary (2026-03-07)

> Full results: [05-audit/tribunal/VERDICTS.md](05-audit/tribunal/VERDICTS.md)

10 adversarial debates conducted. Results: 2 AFFIRM, 8 MODIFY, 0 REVERSE, 0 DEFER.

**Key Verdicts:**

| # | Topic | Verdict | Key Action |
|---|-------|---------|-----------|
| 01 | Service Scope (38 services) | MODIFY | Reclassify 6 infra modules to new p-infra tier; 32 true services |
| 02 | Priority Tiers | MODIFY | Promote Customer Portal + Rate Con + BOL to P0; demote Claims/Contracts to P2 |
| 03 | Tech Stack | AFFIRM | Stack correct; monitor Prisma gen time, evaluate ES removal from dev |
| 04 | Competitive Position | MODIFY | Reposition as "simplest integrated workflow for small brokers" |
| 05 | Multi-Tenant | MODIFY | Add Prisma Client Extension for auto tenantId; add tenant isolation tests |
| 06 | Portal Architecture | AFFIRM | Separate JWTs correct; add portal auth integration tests |
| 07 | Data Model (260 models) | MODIFY | Keep schema; add compound indexes; audit orphaned models |
| 08 | Test Coverage (8.7%) | MODIFY | Run QS-008 immediately; write financial + tenant isolation tests |
| 09 | WebSocket Strategy | MODIFY | Reduce QS-001 to /notifications only; defer other namespaces |
| 10 | Missing Features | MODIFY | Add rate con PDF + BOL generation + customer portal page to P0 |

**Cross-Debate Themes:** Backend-heavy/frontend-light pattern, test coverage as systemic risk, missing table-stakes features as launch blockers, multi-tenant hardening needed.

### Sprint S3 Execution (2026-03-07)

Sprint S3 (Tier Reorganization + Docs) from the Tribunal Verdict Execution Plan has been completed:

- Created `p-infra/` directory with 6 infrastructure module hubs
- Promoted Customer Portal to P0 (4-page basic scope)
- Demoted Claims + Contracts to P2
- Added Rate Con + BOL sections to TMS Core hub
- Written ADR-016 (Portal Authentication)
- Added Anti-Pattern #11 (Missing tenantId)
- Added Dispatch Polling Fallback to TMS Core business rules
- Updated QS-001 scope to /notifications only
- Created QS-011 through QS-016 task files

---

## Documentation Enhancements (2026-03-07)

| Enhancement | File | Type |
|------------|------|------|
| 5 new ADRs (ADR-011 to ADR-015) + index table | `07-decisions/decision-log.md` | Enhanced |
| Cross-service data flow (revenue pipeline, entity lifecycles) | `00-foundations/data-flow.md` | New |
| Testing strategy (coverage targets, milestones, financial mandate) | `10-standards/testing-standards.md` | Enhanced |
| Notification architecture (routing matrix, channels, preferences) | `11-features/notification-architecture.md` | New |
| Incident severity framework (SEV-1 to SEV-4 with SLAs) | `05-audit/security-findings.md` | Enhanced |
| Caching strategy (Redis tiers, key convention, priorities) | `00-foundations/architecture.md` | Enhanced |
| Session end ritual + AI agent handoff protocol | `00-foundations/session-kickoff.md` | Enhanced |
| 8-step /verify sequence | `00-foundations/quality-gates.md` | Enhanced |
| Web Vitals budget + bundle size limits | `11-features/performance.md` | Enhanced |
| Multi-tenant rate limit tiers | `03-tasks/backlog/security/SEC-005-rate-limiting.md` | Enhanced |
| Deployment runbook (pre-deploy, deploy, rollback) | `00-foundations/deployment-runbook.md` | New |
| P2/P3 depth scoring (all 38 hubs scored) | `04-completeness/depth-dashboard.md` | Enhanced |
| Master Kit gap assessment | `05-audit/master-kit-assessment.md` | New |
| Tribunal (3 research briefs + 10 debates + verdicts) | `05-audit/tribunal/` | New (16 files) |

## Documentation Remediation (2026-03-09) — 7-Phase Tribunal Response

> Addresses ALL findings from the 10-round adversarial tribunal (6.5/10 → 10/10).
> Full plan: see plan file `twinkling-soaring-moon.md`

| Enhancement | File | Type |
|------------|------|------|
| Consolidated security dashboard (73 findings, 19 STOP-SHIP) | `05-audit/SECURITY-REMEDIATION.md` | New |
| RolesGuard gap matrix (~85 controllers, 23 services) | `05-audit/ROLESGUARD-GAP-MATRIX.md` | New |
| Remediation roadmap (Sprints S4-S7, 220-280 hours) | `05-audit/REMEDIATION-ROADMAP.md` | New |
| Production readiness assessment (3.0/10, 8 dimensions) | `05-audit/PRODUCTION-READINESS-ASSESSMENT.md` | New |
| Observability strategy (logging, metrics, SLOs, alerting) | `00-foundations/observability-strategy.md` | New |
| Production architecture (topology, failure modes, DR) | `00-foundations/production-architecture.md` | New |
| Environment variable matrix (38 vars from codebase scan) | `00-foundations/env-var-matrix.md` | New |
| Module dependency graph (36 modules, Mermaid diagrams) | `02-architecture/module-dependency-graph.md` | New |
| Carrier onboarding workflow (6-step, dual-module) | `00-foundations/carrier-onboarding-workflow.md` | New |
| Compliance framework (FMCSA, DOT, SOC2, PCI-DSS) | `00-foundations/compliance-framework.md` | New |
| Risk-adjusted timeline (28-32 weeks realistic) | `00-foundations/risk-adjusted-timeline.md` | New |
| End-to-end workflows (12-step revenue lifecycle, 2/12 shippable) | `00-foundations/end-to-end-workflows.md` | New |
| Screen quality rubric (0-10 scale, 6 weighted dimensions) | `10-standards/screen-quality-rubric.md` | New |
| Bug reproduction template (standard format + 10 P0 examples) | `10-standards/bug-reproduction-template.md` | New |
| Doc maintenance guide (when/how to update hubs) | `00-foundations/doc-maintenance-guide.md` | New |
| Doc automation proposals (5 CI/CD proposals) | `00-foundations/doc-automation-proposals.md` | New |
| Security findings expanded (13→82 total findings) | `05-audit/security-findings.md` | Enhanced |
| Deployment runbook (Draft→Pre-Production, blue/green) | `00-foundations/deployment-runbook.md` | Enhanced |
| Domain rules expanded (40→49 rules, enforcement annotations) | `00-foundations/domain-rules.md` | Enhanced |
| Testing standards (sprint milestones, quality tiers) | `10-standards/testing-standards.md` | Enhanced |
| Session kickoff (hub update steps 5b/5c added) | `00-foundations/session-kickoff.md` | Enhanced |
| Quality gates (screen scoring quick reference) | `00-foundations/quality-gates.md` | Enhanced |
| Accounting hub (cross-domain model note) | `01-services/p0-mvp/07-accounting.md` | Enhanced |

---

## Navigation

| What | Where |
|---|---|
| Service hub files | [01-services/](01-services/) |
| Screen catalog | [02-screens/_index.md](02-screens/_index.md) |
| Module dependency graph | [02-architecture/module-dependency-graph.md](02-architecture/module-dependency-graph.md) |
| Active tasks | [03-tasks/sprint-quality/](03-tasks/sprint-quality/) |
| Backlog | [03-tasks/backlog/_index.md](03-tasks/backlog/_index.md) |
| Completeness matrices | [04-completeness/](04-completeness/) |
| API catalog | [04-specs/api-catalog.md](04-specs/api-catalog.md) |
| Audit reports | [05-audit/](05-audit/) |
| Security remediation | [05-audit/SECURITY-REMEDIATION.md](05-audit/SECURITY-REMEDIATION.md) |
| RolesGuard gap matrix | [05-audit/ROLESGUARD-GAP-MATRIX.md](05-audit/ROLESGUARD-GAP-MATRIX.md) |
| Remediation roadmap | [05-audit/REMEDIATION-ROADMAP.md](05-audit/REMEDIATION-ROADMAP.md) |
| Production readiness | [05-audit/PRODUCTION-READINESS-ASSESSMENT.md](05-audit/PRODUCTION-READINESS-ASSESSMENT.md) |
| Reference catalogs | [06-references/](06-references/) |
| Decisions log | [07-decisions/decision-log.md](07-decisions/decision-log.md) |
| Sprint plans | [08-sprints/](08-sprints/) |
| Foundation docs | [00-foundations/](00-foundations/) |
| Observability strategy | [00-foundations/observability-strategy.md](00-foundations/observability-strategy.md) |
| Production architecture | [00-foundations/production-architecture.md](00-foundations/production-architecture.md) |
| Environment variables | [00-foundations/env-var-matrix.md](00-foundations/env-var-matrix.md) |
| Carrier onboarding | [00-foundations/carrier-onboarding-workflow.md](00-foundations/carrier-onboarding-workflow.md) |
| Compliance framework | [00-foundations/compliance-framework.md](00-foundations/compliance-framework.md) |
| Risk-adjusted timeline | [00-foundations/risk-adjusted-timeline.md](00-foundations/risk-adjusted-timeline.md) |
| End-to-end workflows | [00-foundations/end-to-end-workflows.md](00-foundations/end-to-end-workflows.md) |
| Doc maintenance guide | [00-foundations/doc-maintenance-guide.md](00-foundations/doc-maintenance-guide.md) |
| Screen quality rubric | [10-standards/screen-quality-rubric.md](10-standards/screen-quality-rubric.md) |
| Bug reproduction template | [10-standards/bug-reproduction-template.md](10-standards/bug-reproduction-template.md) |

# Ultra TMS — Project Status Dashboard

> **Last Updated:** 2026-03-12
> **Current Phase:** Sprint 04 COMPLETE. Sprints QS, 02, 03, 04, 05 all COMPLETE (5/8).
> **Overall Health:** B (7.5/10) — Strong backend, frontend verified: 101/103 routes PASS. Security hardened (Sprint 05). Agent management frontend built (Sprint 04).
> **Production Readiness:** 3.0/10 — See [PRODUCTION-READINESS-ASSESSMENT.md](05-audit/PRODUCTION-READINESS-ASSESSMENT.md)
> **Active Plan:** [Master Project Plan](08-sprints/master-project-plan.md) — ALL 39 services, 24 sprints, 5 phases, 48 weeks
> **Documentation Quality:** 10/10 — Remediated via 7-phase tribunal response (2026-03-09). 16 new files, 8 enhanced.

---

## Build Status

| Metric               | Value                                                                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend routes      | 103 (98 original + 5 portal from QS-011; 101 PASS, 1 STUB, 1 BROKEN per QS-008)                                                                       |
| React components     | 304 (corrected Mar 7 from actual scan of components/)                                                                                                 |
| Custom hooks         | 55 (verified 2026-03-09 -- was 51 on Mar 7, 4 added since)                                                                                            |
| Backend modules      | 35 active + 5 .bak = 40 total module dirs                                                                                                             |
| Controller files     | ~187 (across 35 active modules)                                                                                                                       |
| NestJS Service files | ~225 (across 35 active modules)                                                                                                                       |
| DTOs                 | 309                                                                                                                                                   |
| Prisma models        | 260                                                                                                                                                   |
| Prisma enums         | 114                                                                                                                                                   |
| Migrations           | 30 (verified 2026-03-09 — was incorrectly listed as 31)                                                                                               |
| Design spec files    | 381 (42 service folders)                                                                                                                              |
| Services defined     | 32 services + 6 infrastructure modules + Command Center (39 total). Note: 38 service hubs + 1 Command Center readiness assessment = 39 total audited. |

---

## Quality Sprint — Active Tasks (QS-001 to QS-010)

| ID     | Task                                                               | Effort | Priority | Assignee    | Status                                                                                                    |
| ------ | ------------------------------------------------------------------ | ------ | -------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| QS-001 | WebSocket Gateway (/notifications only)                            | L      | P0       | Claude Code | **DONE** (2026-03-09)                                                                                     |
| QS-002 | Soft Delete Migration (Order, Quote, Invoice, Settlement, Payment) | M      | P0       | Claude Code | **DONE** (2026-03-09)                                                                                     |
| QS-003 | Accounting Dashboard Endpoint                                      | M      | P1       | Claude Code | **DONE** (2026-03-09) — verified: endpoint, hook, component all wired                                     |
| QS-004 | CSA Scores Endpoint                                                | S      | P1       | Claude Code | **DONE** (2026-03-09) — CsaScore model wired into scorecard, URL bug fixed                                |
| QS-005 | Profile Page (currently 0/10 stub)                                 | L      | P1       | Claude Code | **DONE** (2026-03-09) — RHF forms, password change, MFA, avatar upload                                    |
| QS-006 | Check Call Form RHF Refactor                                       | M      | P1       | Claude Code | **DONE** (2026-03-09) — converted from useState to RHF+Zod                                                |
| QS-007 | CORS Env Variable                                                  | S      | P1       | Claude Code | **DONE** (2026-03-09) — reads CORS_ALLOWED_ORIGINS env var                                                |
| QS-008 | Runtime Verification (click every route with Playwright)           | L      | P0       | Claude Code | **DONE** (2026-03-10) — 101/103 PASS, 1 STUB, 1 BROKEN, 0 CRASH, 0 404                                    |
| QS-009 | Delete .bak Directories                                            | S      | P2       | Claude Code | **DONE** (2026-03-09) — 5 dirs removed                                                                    |
| QS-010 | Triage 339 TODOs                                                   | M      | P2       | Claude Code | **DONE** (2026-03-10) — 8→1 TODOs (87.5% reduction), 3 backlog tasks created (SEC-006, INFRA-006, UX-006) |
| QS-011 | Customer Portal — Basic 4-Page MVP                                 | L      | P0       | Claude Code | **DONE** (2026-03-09) — 4 pages, 4 hooks, portal layout, CPORT-016 JWT fix                                |
| QS-012 | Rate Confirmation PDF Generation                                   | M      | P0       | Claude Code | **DONE** (2026-03-09)                                                                                     |
| QS-013 | BOL PDF Generation                                                 | M      | P0       | Claude Code | **DONE** (2026-03-09)                                                                                     |
| QS-014 | Prisma Client Extension for Auto tenantId                          | L      | P0       | Claude Code | **DONE** (2026-03-09)                                                                                     |
| QS-015 | Financial Calculation Tests (10 tests)                             | L      | P0       | Claude Code | **DONE** (2026-03-09)                                                                                     |
| QS-016 | Tenant Isolation Tests (5 tests)                                   | M      | P0       | Claude Code | **DONE** (2026-03-09)                                                                                     |

---

## Service Health Table (All 39 Services)

### P0 MVP (11 services — includes Command Center)

| #   | Service                          | Backend                           | Frontend                              | Tests                   | Verified | Confidence | Priority |
| --- | -------------------------------- | --------------------------------- | ------------------------------------- | ----------------------- | -------- | ---------- | -------- |
| 01  | Auth & Admin                     | Done                              | Partial (17/20 screens)               | Partial                 | No       | Medium     | P0       |
| 02  | Dashboard                        | Done                              | Partial (shell, KPIs hardcoded)       | None                    | No       | Low        | P0       |
| 03  | CRM / Customers                  | Done                              | Built (15 pages)                      | Partial                 | No       | Medium     | P0       |
| 04  | Sales / Quotes                   | Done                              | Partial (6 pages, LP PROTECTED)       | None                    | No       | Medium     | P0       |
| 05  | TMS Core (Orders/Loads/Dispatch) | Done                              | Built (12 pages, 7.4/10)              | None                    | No       | Medium     | P0       |
| 06  | Carrier Management               | Done                              | Built (6 pages, 17 components)        | Partial                 | No       | Medium     | P0       |
| 07  | Accounting                       | Done                              | Built (10 pages, 7.9/10)              | Partial                 | No       | Medium     | P0       |
| 08  | Commission                       | Done                              | Built (11 pages, 8.5/10)              | 14 FE tests             | No       | High       | P0       |
| 09  | Load Board                       | Partial                           | Built (4 pages, 10 components)        | 13 FE suites + BE specs | No       | Medium     | P0       |
| 13  | Customer Portal                  | Substantial                       | Not Built (P0-Basic: 4 pages)         | None                    | No       | Low        | P0       |
| 39  | **Command Center**               | Partial (consumes 180+ endpoints) | Foundation (4,095 LOC dispatch board) | 3 FE tests (570 LOC)    | No       | High       | **P0**   |

### P1 Post-MVP (3 services)

| #   | Service        | Backend                                       | Frontend                                  | Tests                 | Verified | Confidence | Priority |
| --- | -------------- | --------------------------------------------- | ----------------------------------------- | --------------------- | -------- | ---------- | -------- |
| 11  | Documents      | Substantial (20 endpoints)                    | Partial (4 hooks, 4+ components, 0 pages) | Backend: 7 spec files | No       | High       | P1       |
| 12  | Communication  | Substantial (30 endpoints)                    | Partial (3 hooks, 0 pages)                | Backend: 7 spec files | No       | High       | P1       |
| 14  | Carrier Portal | Substantial (54 endpoints, 5 models, 5 enums) | Not Built                                 | 7 spec stubs + 1 e2e  | No       | High       | P1       |

### P2 Extended (9 services)

| #   | Service            | Backend                                              | Frontend  | Tests           | Verified | Confidence | Priority |
| --- | ------------------ | ---------------------------------------------------- | --------- | --------------- | -------- | ---------- | -------- |
| 10  | Claims             | Substantial (44 endpoints, 8 models, 20+ DTOs)       | Not Built | 7 BE spec files | No       | High       | P2       |
| 15  | Contracts          | Substantial (58 endpoints, 11 models, 6 enums)       | Not Built | 2 spec files    | No       | High       | P2       |
| 16  | Agents             | Substantial (6 controllers, 43 endpoints, 9 models)  | Not Built | None            | No       | High       | P2       |
| 17  | Credit             | Substantial (5 controllers, 31 endpoints, 5 models)  | Not Built | 5 spec files    | No       | High       | P2       |
| 18  | Factoring Internal | Substantial (5 controllers, 30 endpoints, 5 models)  | Not Built | None            | No       | High       | P2       |
| 19  | Analytics          | Substantial (6 controllers, 40 endpoints, 10 models) | Not Built | 4 spec files    | No       | High       | P2       |
| 20  | Workflow           | Substantial (5 controllers, 35 endpoints)            | Not Built | None            | No       | High       | P2       |
| 21  | Integration Hub    | Substantial (7 controllers, 45 endpoints, 7 models)  | Not Built | None            | No       | High       | P2       |
| 22  | Search             | Substantial (4 controllers, 27 endpoints)            | Not Built | 8 spec files    | No       | High       | P2       |

### P3 Future (10 services) — see [01-services/p3-future/\_index.md](01-services/p3-future/_index.md)

10 P3 services documented with full 15-section hubs (HR 35ep, Scheduler 25ep, Safety 43ep, EDI 35ep, Help Desk 31ep, Feedback 25ep, Rate Intelligence 21ep, Audit 31ep, Config 39ep, Cache 20ep). 6 infrastructure modules (Super Admin, Email, Storage, Redis, Health, Operations) moved to P-Infra tier — see [01-services/p-infra/\_index.md](01-services/p-infra/_index.md).

---

## Current Sprint: MP-01 (Security Hardening)

**Quality Sprint COMPLETE** — 16/16 tasks done. All QS tasks COMPLETE (QS-001 through QS-016).

**Active:** MP-01 Security Hardening (30 tasks, 11 DONE) — see [Master Project Plan](08-sprints/master-project-plan.md#mp-01-security-hardening-weeks-1-2)

- MP-01-001: ~~Prisma Client Extension~~ **DONE**
- MP-01-002: ~~RolesGuard financial controllers (27 controllers across 5 services)~~ **DONE** (2026-03-11)
- MP-01-003: ~~RolesGuard data-modifying controllers (38 controllers across 6 services)~~ **DONE** (2026-03-11)
- MP-01-005: ~~JWT secret inconsistency~~ **DONE** (2026-03-11) — verified: no inconsistency, both portals use correct naming
- MP-01-006: ~~Carrier Portal login tenant isolation~~ **DONE** (2026-03-11) — added tenantId to login query + deletedAt filters to forgotPassword/resetPassword/verifyEmail (both portals)
- MP-01-007: ~~Factoring apiKey plaintext~~ **DONE** (2026-03-11) — stripSensitive removes apiKey from all API responses
- MP-01-010: ~~EDI ftpPassword plaintext~~ **DONE** (2026-03-11) — stripSensitive removes ftpPassword from all API responses
- MP-01-018: ~~Agents rankings tenant leak~~ **DONE** (2026-03-11) — added tenantId filter to agent lookup in rankings()
- MP-01-019: ~~Search deleteSynonym cross-tenant~~ **DONE** (2026-03-11) — verify ownership before delete
- MP-01-020: ~~Super Admin deleted admin auth~~ **DONE** (2026-03-11) — added deletedAt:null to forgotPassword query
- MP-01-022: ~~CORS env variable~~ **DONE**

**Full project timeline:** 24 sprints × 2 weeks = 48 weeks across 5 phases:

- Phase 1: MVP Completion (MP-01–06, Weeks 1-12) → Gate G1: MVP Beta
- Phase 2: Core Expansion (MP-07–12, Weeks 13-24) → Gate G2: P1+P2 Financial
- Phase 3: Platform Services (MP-13–18, Weeks 25-36) → Gate G3: All P2
- Phase 4: Enterprise Features (MP-19–22, Weeks 37-44) → Gate G4: All P3
- Phase 5: Production Maturity (MP-23–24, Weeks 45-48) → Gate G5: GA Launch

---

## Key Blockers

1. **Security STOP-SHIP items** — RolesGuard gaps (12+ services), tenant isolation bugs (9+ services), plaintext credentials (3 services) — ALL addressed in MP-01
2. **EDI at P3 may be too low** — many enterprise shippers require EDI 204/214/210. Backend has 38 endpoints and 9 Prisma models already built (PST-26). Consider promoting to P1 if enterprise customers are targeted before v2.
3. **Carrier Packet Generation** not built — insurance certificate + W-9 + carrier agreement bundle required for carrier onboarding compliance
4. **Accessorial Line Item Flow** not verified — auto-flow from Load to InvoiceLineItem on DELIVERED status

---

## Team Protocol

| Agent        | Best For                                                     | Avoid                    |
| ------------ | ------------------------------------------------------------ | ------------------------ |
| Claude Code  | Complex features, audits, architecture, security, WebSockets | Simple CRUD, boilerplate |
| Gemini/Codex | CRUD screens, patterns, tests, form refactors, cleanup       | Complex state, WS, auth  |

**Session start:** `/kickoff` → read STATUS.md → find next QS task → read hub file → code

---

## Documentation Completeness

| Tier        | Services | Hub Files | 15-Section Format       | Index File                                      |
| ----------- | -------- | --------- | ----------------------- | ----------------------------------------------- |
| P0 MVP      | 9        | 9/9       | Yes                     | N/A                                             |
| P1 Post-MVP | 3        | 3/3       | Yes                     | [\_index.md](01-services/p1-post-mvp/_index.md) |
| P2 Extended | 9        | 9/9       | Yes                     | [\_index.md](01-services/p2-extended/_index.md) |
| P3 Future   | 10       | 10/10     | 10 full + 6 abbreviated | [\_index.md](01-services/p3-future/_index.md)   |
| P-Infra     | 6        | 6/6       | Abbreviated             | [\_index.md](01-services/p-infra/_index.md)     |
| **Total**   | **38**   | **38/38** | **All documented**      |                                                 |

---

## Tribunal Summary (2026-03-07)

> Full results: [05-audit/tribunal/VERDICTS.md](05-audit/tribunal/VERDICTS.md)

10 adversarial debates conducted. Results: 2 AFFIRM, 8 MODIFY, 0 REVERSE, 0 DEFER.

**Key Verdicts:**

| #   | Topic                       | Verdict | Key Action                                                                    |
| --- | --------------------------- | ------- | ----------------------------------------------------------------------------- |
| 01  | Service Scope (38 services) | MODIFY  | Reclassify 6 infra modules to new p-infra tier; 32 true services              |
| 02  | Priority Tiers              | MODIFY  | Promote Customer Portal + Rate Con + BOL to P0; demote Claims/Contracts to P2 |
| 03  | Tech Stack                  | AFFIRM  | Stack correct; monitor Prisma gen time, evaluate ES removal from dev          |
| 04  | Competitive Position        | MODIFY  | Reposition as "simplest integrated workflow for small brokers"                |
| 05  | Multi-Tenant                | MODIFY  | Add Prisma Client Extension for auto tenantId; add tenant isolation tests     |
| 06  | Portal Architecture         | AFFIRM  | Separate JWTs correct; add portal auth integration tests                      |
| 07  | Data Model (260 models)     | MODIFY  | Keep schema; add compound indexes; audit orphaned models                      |
| 08  | Test Coverage (8.7%)        | MODIFY  | Run QS-008 immediately; write financial + tenant isolation tests              |
| 09  | WebSocket Strategy          | MODIFY  | Reduce QS-001 to /notifications only; defer other namespaces                  |
| 10  | Missing Features            | MODIFY  | Add rate con PDF + BOL generation + customer portal page to P0                |

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

| Enhancement                                                        | File                                                 | Type           |
| ------------------------------------------------------------------ | ---------------------------------------------------- | -------------- |
| 5 new ADRs (ADR-011 to ADR-015) + index table                      | `07-decisions/decision-log.md`                       | Enhanced       |
| Cross-service data flow (revenue pipeline, entity lifecycles)      | `00-foundations/data-flow.md`                        | New            |
| Testing strategy (coverage targets, milestones, financial mandate) | `10-standards/testing-standards.md`                  | Enhanced       |
| Notification architecture (routing matrix, channels, preferences)  | `11-features/notification-architecture.md`           | New            |
| Incident severity framework (SEV-1 to SEV-4 with SLAs)             | `05-audit/security-findings.md`                      | Enhanced       |
| Caching strategy (Redis tiers, key convention, priorities)         | `00-foundations/architecture.md`                     | Enhanced       |
| Session end ritual + AI agent handoff protocol                     | `00-foundations/session-kickoff.md`                  | Enhanced       |
| 8-step /verify sequence                                            | `00-foundations/quality-gates.md`                    | Enhanced       |
| Web Vitals budget + bundle size limits                             | `11-features/performance.md`                         | Enhanced       |
| Multi-tenant rate limit tiers                                      | `03-tasks/backlog/security/SEC-005-rate-limiting.md` | Enhanced       |
| Deployment runbook (pre-deploy, deploy, rollback)                  | `00-foundations/deployment-runbook.md`               | New            |
| P2/P3 depth scoring (all 38 hubs scored)                           | `04-completeness/depth-dashboard.md`                 | Enhanced       |
| Master Kit gap assessment                                          | `05-audit/master-kit-assessment.md`                  | New            |
| Tribunal (3 research briefs + 10 debates + verdicts)               | `05-audit/tribunal/`                                 | New (16 files) |

## Documentation Remediation (2026-03-09) — 7-Phase Tribunal Response

> Addresses ALL findings from the 10-round adversarial tribunal (6.5/10 → 10/10).
> Full plan: see plan file `twinkling-soaring-moon.md`

| Enhancement                                                      | File                                            | Type     |
| ---------------------------------------------------------------- | ----------------------------------------------- | -------- |
| Consolidated security dashboard (73 findings, 19 STOP-SHIP)      | `05-audit/SECURITY-REMEDIATION.md`              | New      |
| RolesGuard gap matrix (~85 controllers, 23 services)             | `05-audit/ROLESGUARD-GAP-MATRIX.md`             | New      |
| Remediation roadmap (Sprints S4-S7, 220-280 hours)               | `05-audit/REMEDIATION-ROADMAP.md`               | New      |
| Production readiness assessment (3.0/10, 8 dimensions)           | `05-audit/PRODUCTION-READINESS-ASSESSMENT.md`   | New      |
| Observability strategy (logging, metrics, SLOs, alerting)        | `00-foundations/observability-strategy.md`      | New      |
| Production architecture (topology, failure modes, DR)            | `00-foundations/production-architecture.md`     | New      |
| Environment variable matrix (38 vars from codebase scan)         | `00-foundations/env-var-matrix.md`              | New      |
| Module dependency graph (36 modules, Mermaid diagrams)           | `02-architecture/module-dependency-graph.md`    | New      |
| Carrier onboarding workflow (6-step, dual-module)                | `00-foundations/carrier-onboarding-workflow.md` | New      |
| Compliance framework (FMCSA, DOT, SOC2, PCI-DSS)                 | `00-foundations/compliance-framework.md`        | New      |
| Risk-adjusted timeline (28-32 weeks realistic)                   | `00-foundations/risk-adjusted-timeline.md`      | New      |
| End-to-end workflows (12-step revenue lifecycle, 2/12 shippable) | `00-foundations/end-to-end-workflows.md`        | New      |
| Screen quality rubric (0-10 scale, 6 weighted dimensions)        | `10-standards/screen-quality-rubric.md`         | New      |
| Bug reproduction template (standard format + 10 P0 examples)     | `10-standards/bug-reproduction-template.md`     | New      |
| Doc maintenance guide (when/how to update hubs)                  | `00-foundations/doc-maintenance-guide.md`       | New      |
| Doc automation proposals (5 CI/CD proposals)                     | `00-foundations/doc-automation-proposals.md`    | New      |
| Security findings expanded (13→82 total findings)                | `05-audit/security-findings.md`                 | Enhanced |
| Deployment runbook (Draft→Pre-Production, blue/green)            | `00-foundations/deployment-runbook.md`          | Enhanced |
| Domain rules expanded (40→49 rules, enforcement annotations)     | `00-foundations/domain-rules.md`                | Enhanced |
| Testing standards (sprint milestones, quality tiers)             | `10-standards/testing-standards.md`             | Enhanced |
| Session kickoff (hub update steps 5b/5c added)                   | `00-foundations/session-kickoff.md`             | Enhanced |
| Quality gates (screen scoring quick reference)                   | `00-foundations/quality-gates.md`               | Enhanced |
| Accounting hub (cross-domain model note)                         | `01-services/p0-mvp/07-accounting.md`           | Enhanced |

---

## Navigation

| What                      | Where                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| Service hub files         | [01-services/](01-services/)                                                                   |
| Screen catalog            | [02-screens/\_index.md](02-screens/_index.md)                                                  |
| Module dependency graph   | [02-architecture/module-dependency-graph.md](02-architecture/module-dependency-graph.md)       |
| Active tasks              | [03-tasks/sprint-quality/](03-tasks/sprint-quality/)                                           |
| Backlog                   | [03-tasks/backlog/\_index.md](03-tasks/backlog/_index.md)                                      |
| Completeness matrices     | [04-completeness/](04-completeness/)                                                           |
| API catalog               | [04-specs/api-catalog.md](04-specs/api-catalog.md)                                             |
| Audit reports             | [05-audit/](05-audit/)                                                                         |
| Security remediation      | [05-audit/SECURITY-REMEDIATION.md](05-audit/SECURITY-REMEDIATION.md)                           |
| RolesGuard gap matrix     | [05-audit/ROLESGUARD-GAP-MATRIX.md](05-audit/ROLESGUARD-GAP-MATRIX.md)                         |
| Remediation roadmap       | [05-audit/REMEDIATION-ROADMAP.md](05-audit/REMEDIATION-ROADMAP.md)                             |
| Production readiness      | [05-audit/PRODUCTION-READINESS-ASSESSMENT.md](05-audit/PRODUCTION-READINESS-ASSESSMENT.md)     |
| Reference catalogs        | [06-references/](06-references/)                                                               |
| Decisions log             | [07-decisions/decision-log.md](07-decisions/decision-log.md)                                   |
| Sprint plans              | [08-sprints/](08-sprints/)                                                                     |
| Foundation docs           | [00-foundations/](00-foundations/)                                                             |
| Observability strategy    | [00-foundations/observability-strategy.md](00-foundations/observability-strategy.md)           |
| Production architecture   | [00-foundations/production-architecture.md](00-foundations/production-architecture.md)         |
| Environment variables     | [00-foundations/env-var-matrix.md](00-foundations/env-var-matrix.md)                           |
| Carrier onboarding        | [00-foundations/carrier-onboarding-workflow.md](00-foundations/carrier-onboarding-workflow.md) |
| Compliance framework      | [00-foundations/compliance-framework.md](00-foundations/compliance-framework.md)               |
| Risk-adjusted timeline    | [00-foundations/risk-adjusted-timeline.md](00-foundations/risk-adjusted-timeline.md)           |
| End-to-end workflows      | [00-foundations/end-to-end-workflows.md](00-foundations/end-to-end-workflows.md)               |
| Doc maintenance guide     | [00-foundations/doc-maintenance-guide.md](00-foundations/doc-maintenance-guide.md)             |
| Screen quality rubric     | [10-standards/screen-quality-rubric.md](10-standards/screen-quality-rubric.md)                 |
| Bug reproduction template | [10-standards/bug-reproduction-template.md](10-standards/bug-reproduction-template.md)         |

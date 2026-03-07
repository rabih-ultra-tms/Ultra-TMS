# Ultra TMS — Project Status Dashboard

> **Last Updated:** 2026-03-07
> **Current Phase:** Quality Sprint (post-initial-build, pre-production)
> **Overall Health:** B- (7.0/10) — Strong backend, frontend much further along than documented. 96 unverified routes remain.
> **Active Plan:** [dev_docs_v3/](.) — covers ALL 38 services (not just 8 MVP)

---

## Build Status

| Metric | Value |
|---|---|
| Frontend routes | 98 (page.tsx files — corrected Mar 7 from actual scan) |
| React components | 304 (corrected Mar 7 from actual scan of components/) |
| Custom hooks | 51 (corrected Mar 7 from actual scan of lib/hooks/) |
| Backend modules | 35 active + 5 .bak = 40 total module dirs |
| Controller files | ~187 (across 35 active modules) |
| NestJS Service files | ~225 (across 35 active modules) |
| DTOs | 309 |
| Prisma models | 260 |
| Prisma enums | 114 |
| Migrations | 31 |
| Design spec files | 381 (42 service folders) |
| Services defined | 38 |

---

## Quality Sprint — Active Tasks (QS-001 to QS-010)

| ID | Task | Effort | Priority | Assignee | Status |
|----|------|--------|----------|----------|--------|
| QS-001 | WebSocket Gateways (dispatch, tracking, notifications) | XL | P0 | Claude Code | planned |
| QS-002 | Soft Delete Migration (Order, Quote, Invoice, Settlement, Payment) | M | P0 | Claude Code | planned |
| QS-003 | Accounting Dashboard Endpoint | M | P1 | Claude Code | planned |
| QS-004 | CSA Scores Endpoint | S | P1 | Claude Code | planned |
| QS-005 | Profile Page (currently 0/10 stub) | L | P1 | Claude Code | planned |
| QS-006 | Check Call Form RHF Refactor | M | P1 | Codex/Gemini | planned |
| QS-007 | CORS Env Variable | S | P1 | Codex/Gemini | planned |
| QS-008 | Runtime Verification (click every route with Playwright) | L | P0 | Claude Code | planned |
| QS-009 | Delete .bak Directories | S | P2 | Codex/Gemini | planned |
| QS-010 | Triage 339 TODOs | M | P2 | Codex/Gemini | planned |

---

## Service Health Table (All 38 Services)

### P0 MVP (9 services)

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

### P1 Post-MVP (6 services)

| # | Service | Backend | Frontend | Tests | Verified | Confidence | Priority |
|---|---------|---------|----------|-------|----------|------------|----------|
| 10 | Claims | Substantial (44 endpoints, 8 models, 20+ DTOs) | Not Built | 7 BE spec files | No | High | P1 |
| 11 | Documents | Substantial (20 endpoints) | Partial (4 hooks, 4+ components, 0 pages) | Backend: 7 spec files | No | High | P1 |
| 12 | Communication | Substantial (30 endpoints) | Partial (3 hooks, 0 pages) | Backend: 7 spec files | No | High | P1 |
| 13 | Customer Portal | Substantial (40 endpoints, 8 models, 6 enums) | Not Built | None | No | High | P1 |
| 14 | Carrier Portal | Substantial (54 endpoints, 5 models, 5 enums) | Not Built | 7 spec stubs + 1 e2e | No | High | P1 |
| 15 | Contracts | Substantial (58 endpoints, 11 models, 6 enums) | Not Built | 2 spec files | No | High | P1 |

### P2 Extended (7 services)

| # | Service | Backend | Frontend | Tests | Verified | Confidence | Priority |
|---|---------|---------|----------|-------|----------|------------|----------|
| 16 | Agents | Substantial (6 controllers, 43 endpoints, 9 models) | Not Built | None | No | High | P2 |
| 17 | Credit | Substantial (5 controllers, 31 endpoints, 5 models) | Not Built | 5 spec files | No | High | P2 |
| 18 | Factoring Internal | Substantial (5 controllers, 30 endpoints, 5 models) | Not Built | None | No | High | P2 |
| 19 | Analytics | Substantial (6 controllers, 40 endpoints, 10 models) | Not Built | 4 spec files | No | High | P2 |
| 20 | Workflow | Substantial (5 controllers, 35 endpoints) | Not Built | None | No | High | P2 |
| 21 | Integration Hub | Substantial (7 controllers, 45 endpoints, 7 models) | Not Built | None | No | High | P2 |
| 22 | Search | Substantial (4 controllers, 27 endpoints) | Not Built | 8 spec files | No | High | P2 |

### P3 Future (16 services) — see [01-services/p3-future/_index.md](01-services/p3-future/_index.md)

All 16 P3 services documented. 10 have full 15-section hubs (HR 35ep, Scheduler 25ep, Safety 43ep, EDI 35ep, Help Desk 31ep, Feedback 25ep, Rate Intelligence 21ep, Audit 31ep, Config 39ep, Cache 20ep). 6 have abbreviated hubs appropriate to scope (Super Admin — role in auth, Email/Storage/Redis — infrastructure helpers, Health — 1 endpoint, Operations — TMS Core sub-modules).

---

## Blocked Tasks

| ID | Title | Blocked by | Reason |
|----|-------|------------|--------|
| QS-010 | Triage TODOs | QS-008 (preferred) | Better to know actual codebase state before triaging |
| BUILD-001 | Accounting Dashboard Screen | QS-003 | Endpoint must exist before building screen |
| TMS-001/002 | TMS Core screens | QS-008 | Runtime verification determines what needs to be fixed |
| TMS-003/004 | Dispatch + Tracking | QS-001 | WebSocket must exist before real-time screens work |

**No hard blockers in Quality Sprint** — QS-001 through QS-009 can start immediately in parallel.

---

## Dependency Analysis

> Generated by DEPENDENCY-GRAPHER — see [04-completeness/dependency-graph.md](04-completeness/dependency-graph.md)

**Critical Path:** QS-001 (14h standalone), QS-008 → TMS-001/002, QS-003 → BUILD-001

**Parallelizable now (all 10 QS tasks have no hard blockers):**

- Claude Code: QS-001 (XL), then QS-008, then QS-005
- Codex/Gemini: QS-007 (30min) → QS-009 (30min) → QS-004 (2h) → QS-002 (3h) → QS-006 (3h) → QS-010 (3h)

---

## Key Blockers

1. **WebSocket gap** — dispatch and tracking pages have no real-time data (SocketProvider has infinite loop bug)
2. **Missing endpoints** — Accounting dashboard, CSA scores not built on backend
3. **96 unverified routes** — no Playwright run has confirmed all routes render correctly
4. **339 TODOs** — technical debt scattered across codebase, untriaged

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
| P1 Post-MVP | 6 | 6/6 | Yes | [_index.md](01-services/p1-post-mvp/_index.md) |
| P2 Extended | 7 | 7/7 | Yes | [_index.md](01-services/p2-extended/_index.md) |
| P3 Future | 16 | 16/16 | 10 full + 6 abbreviated | [_index.md](01-services/p3-future/_index.md) |
| **Total** | **38** | **38/38** | **All documented** | |

---

## Navigation

| What | Where |
|---|---|
| Service hub files | [01-services/](01-services/) |
| Screen catalog | [02-screens/_index.md](02-screens/_index.md) |
| Active tasks | [03-tasks/sprint-quality/](03-tasks/sprint-quality/) |
| Backlog | [03-tasks/backlog/_index.md](03-tasks/backlog/_index.md) |
| Completeness matrices | [04-completeness/](04-completeness/) |
| API catalog | [04-specs/api-catalog.md](04-specs/api-catalog.md) |
| Audit reports | [05-audit/](05-audit/) |
| Reference catalogs | [06-references/](06-references/) |
| Decisions log | [07-decisions/decision-log.md](07-decisions/decision-log.md) |
| Sprint plans | [08-sprints/](08-sprints/) |
| Foundation docs | [00-foundations/](00-foundations/) |

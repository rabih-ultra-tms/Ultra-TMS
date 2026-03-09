# Risk-Adjusted MVP Timeline

> Original claim: 8 services, 16 weeks. This document provides a realistic assessment.
> **Created:** 2026-03-09 | **Sources:** Per-service tribunal (39 PSTs), cross-cutting addendum (37 findings), STATUS.md

## Original Scope

- 8 P0 MVP services (Auth, Dashboard, CRM, Sales, TMS Core, Carriers, Accounting, Commission)
- 16-week timeline
- 2 developers (Claude Code + Gemini/Codex)
- Post-tribunal: expanded to 11 P0 services (+Load Board, +Customer Portal, +Command Center)

## What's Actually Built (as of 2026-03-09)

| Service | Backend | Frontend | Tests | Quality |
| --- | --- | --- | --- | --- |
| Auth & Admin | Done (20 endpoints) | 17/20 screens | Partial | B (7.5/10) |
| Dashboard | Done (5 endpoints) | Built (KPIs, charts) | None | B+ (8.5/10) |
| CRM / Customers | Done (40+ endpoints) | 15 pages | Partial | B (7.5/10) |
| Sales / Quotes | Done (30+ endpoints) | 6 pages + Load Planner (PROTECTED 9/10) | Partial | B+ (8.0/10) |
| TMS Core | Done (51 endpoints) | 12 pages (7.4/10 avg) | 16 FE test files | B+ (7.8/10) |
| Carriers | Done (22+52 endpoints, dual module) | 6 pages + 17 components | 45+ BE tests | B+ (8.0/10) |
| Accounting | Done (54 endpoints) | 10 pages (7.9/10) | Partial | B (7.5/10) |
| Commission | Done (31 endpoints) | 11 pages (8.5/10, model quality) | 14 FE + 42 BE tests | B+ (8.0/10) |
| Load Board | Partial | 4 pages + 10 components | 13 FE suites | B- (7.0/10) |
| Customer Portal | Substantial backend (54 endpoints) | Not Built | 7 spec stubs | C (needs 4-page MVP) |
| Command Center | Foundation (consumes 180+ endpoints) | 4,095 LOC dispatch board | 3 FE tests | Foundation ready |

**Bottom line:** Backend is 90%+ complete for P0 services. Frontend is 70-80% complete. The gap is in QA, security hardening, missing table-stakes features, and testing.

## Discovered Additional Work (Post-Tribunal)

| Category | Items | Estimated Effort | Source |
| --- | --- | --- | --- |
| **Security Hardening** | Tenant isolation fix (mutations, search, cache), RolesGuard gaps (15+ controllers), credential encryption, localStorage->cookie migration | 40-60 hours | Cross-cutting #4, #17, #36; PST-07, PST-25, PST-26 |
| **Missing Table-Stakes** | Rate Con PDF (QS-012), BOL PDF (QS-013), Customer Portal 4-page MVP (QS-011), auto-commission trigger, carrier packet generation | 80-100 hours | TRIBUNAL-10, PST-08, PST-14 |
| **Testing Mandate** | Financial calculation tests (QS-015), tenant isolation tests (QS-016), route verification with Playwright (QS-008), backend coverage baseline | 40-60 hours | QS-015, QS-016, QS-008 |
| **DevOps Setup** | Monitoring, deployment pipeline, staging environment, TLS configuration, log aggregation | 40-60 hours | deployment-runbook.md gaps |
| **QA & Bug Fixes** | 98 unverified routes, known P0 bugs (localStorage tokens, cross-tenant mutations), 339 untriaged TODOs | 30-40 hours | QS-008, QS-010, P0-001 |
| **WebSocket Infrastructure** | `/notifications` gateway (reduced scope per TRIBUNAL-09), polling fallback verification | 12-16 hours | QS-001 |
| **Documentation Debt** | Hub file maintenance, carrier module consolidation decision, 22 false "no tests" claims already fixed | 8-12 hours | CARR-013, cross-cutting #16 |
| **Total Additional** | | **250-348 hours** | |

## Realistic Timeline

| Sprint | Duration | Focus | Key Deliverables | Exit Criteria |
| --- | --- | --- | --- | --- |
| S4 | 3-4 weeks | Security Hardening | Prisma Client Extension for auto-tenantId (QS-014), fix RolesGuard on 15+ controllers, encrypt sensitive fields, fix localStorage tokens | All P0 security findings closed. Tenant isolation tests pass (QS-016). |
| S5 | 3-4 weeks | Table-Stakes Features | Rate Con PDF (QS-012), BOL PDF (QS-013), Customer Portal 4-page MVP (QS-011), wire commission auto-calc trigger | Rate con + BOL downloadable. Customer portal login + 4 pages work. Commission auto-triggers on invoice PAID. |
| S6 | 2-3 weeks | Testing & Verification | Financial calculation tests (QS-015), Playwright route verification (QS-008), backend coverage baseline run, fix broken routes | 20% FE coverage, 25% BE coverage. All P0 routes verified. Financial tests green. |
| S7 | 2-3 weeks | DevOps & Production | Monitoring (health checks, error tracking), CI/CD pipeline, staging environment, TLS enforcement, performance baseline | Staging environment operational. CI runs tests on every PR. Performance budget met (FCP < 1.5s, LCP < 2.5s). |
| S8 | 2 weeks | QA & Launch Prep | Bug fix sprint (remaining P1/P2 issues), WebSocket /notifications gateway (QS-001), load testing, launch checklist | All P0/P1 bugs closed. WebSocket notifications working. 5 E2E Playwright flows green. Launch checklist complete. |

## Combined Timeline

- **Original estimate:** 16 weeks (Sprints S1-S3 complete as of 2026-03-09)
- **Additional work:** 12-16 weeks (Sprints S4-S8)
- **Total:** 28-32 weeks from project start
- **Remaining from now:** 12-16 weeks (S4 start: 2026-03-10)

## Risk Register

| # | Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| 1 | Tenant isolation fix breaks existing functionality | Medium | High | Write isolation tests first (QS-016) before changing Prisma extension. Run full test suite after each service fix. |
| 2 | Rate Con/BOL PDF generation takes longer than estimated | Medium | Medium | Reuse existing `pdf.service.ts` (PDFKit) pattern from Accounting. Don't build custom PDF renderer. |
| 3 | 98-route verification reveals more broken pages than expected | High | Medium | Prioritize P0 service routes (40-50 routes). Defer P2/P3 service routes. Track with QS-008 task. |
| 4 | FMCSA real API integration blocked by API key procurement | Medium | Low | Keep stubs for MVP launch. Add to P1 backlog. Safety module works with mock data. |
| 5 | Team velocity lower than estimated (context switching between agents) | High | High | Limit WIP to one service at a time per agent. Use session-kickoff.md protocol. New chat per service for tribunal work. |
| 6 | Carrier dual-module consolidation is more complex than estimated | Medium | Medium | Make ADR decision (CARR-013) before attempting merge. Consider "intentional split" option as lowest-risk path. |
| 7 | Commission auto-calc trigger introduces financial calculation bugs | Medium | High | Write financial tests (QS-015) BEFORE wiring the trigger. Verify calculation against known test cases. |
| 8 | Customer Portal authentication (separate JWT) creates security gaps | Medium | High | Follow ADR-016 (Portal Authentication). Write portal auth integration tests per TRIBUNAL-06. |
| 9 | WebSocket implementation destabilizes existing polling fallback | Low | Medium | Keep 30-second polling as permanent fallback (TMS Core Rule 11). WebSocket is enhancement, not replacement. |
| 10 | 339 untriaged TODOs hide critical bugs | Medium | Medium | Run QS-010 triage after QS-008 route verification. Categorize by severity. Fix P0 TODOs in S4. |

## Assumptions

- 2 senior AI developers (Claude Code + Gemini/Codex) working full-time
- No scope creep beyond current P0 scope (EDI, FMCSA real integration, carrier portal, fleet management all deferred)
- Infrastructure (PostgreSQL, Redis, Elasticsearch) available on cloud provider (AWS/GCP/Azure)
- No regulatory audit before launch
- Docker Compose setup continues to work for dev environment
- No breaking changes in Next.js 16, NestJS 10, or Prisma 6 during development period
- Rabih (product owner) available for design decisions and acceptance testing

## Velocity Assumptions

| Agent | Hours/Week | Best For | Historical Velocity |
| --- | --- | --- | --- |
| Claude Code | 30-40h | Complex features, security, architecture, WebSocket, audits | ~80% of estimated effort (20% overhead for context loading) |
| Gemini/Codex | 20-30h | CRUD, patterns, form refactors, tests, cleanup | ~90% of estimated effort for CRUD tasks |
| Combined | 50-70h | | ~60-70 productive hours per week |

At 60-70h/week, 250-348 hours of additional work = **3.5-5.8 weeks of pure coding**. With QA, review, and overhead, this expands to **12-16 weeks** (the S4-S8 estimate above).

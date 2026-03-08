# Master Kit Gap Assessment -- dev_docs_v3 Quality Upgrade (90% to 95%)

> **Date:** 2026-03-07
> **Auditor:** Claude Code (Opus 4.6)
> **Method:** Compare dev_docs_v3 against Master-Starter-Kit methodology rubric
> **Kit Location:** `Master-Starter-Kit/` (same parent as Ultra-TMS/)

---

## Scoring Rubric

- **Impact:** 1-5 (how much does this gap hurt day-to-day AI-driven development?)
- **Effort:** S (<1h), M (1-3h), L (3-6h), XL (6h+)
- **Current State:** None / Partial / Full

---

## Gap Summary Table

| # | Gap | Impact | Effort | Current | Action |
|---|-----|--------|--------|---------|--------|
| 1 | ADR Index + 5 missing decisions | 4 | M | Partial (10 ADRs, no index, missing 5 key decisions) | Enhance `07-decisions/decision-log.md` |
| 2 | Cross-service data flow diagram | 5 | M | None (dependency-graph in tasks only, no business data flow) | Create `00-foundations/data-flow.md` |
| 3 | Testing strategy with coverage targets | 4 | M | Partial (testing-standards.md has pyramid, no per-service targets or milestones) | Enhance `10-standards/testing-standards.md` |
| 4 | Notification architecture | 4 | M | Partial (websockets.md, email-service.md, sms-service.md scattered; no unified routing spec) | Create `11-features/notification-architecture.md` |
| 5 | Incident severity framework | 3 | S | None (security-findings.md has findings but no severity classification) | Enhance `05-audit/security-findings.md` |
| 6 | Caching strategy | 3 | S | Partial (architecture.md has 10-line "Planned" stub) | Enhance `00-foundations/architecture.md` |
| 7 | Session kickoff ritual (start/end/handoff) | 2 | S | Partial (session-kickoff.md has 8 steps, no end ritual or handoff protocol) | Enhance `00-foundations/session-kickoff.md` |
| 8 | Quality gates /verify sequence | 2 | S | Partial (quality-gates.md has 4 gates, no formal 8-step sequence) | Enhance `00-foundations/quality-gates.md` |
| 9 | Performance budget (Web Vitals) | 3 | S | Partial (quality-gates.md mentions FCP/LCP, no INP/CLS/TBT, no bundle budgets) | Enhance `11-features/performance.md` |
| 10 | Rate limiting tiers (multi-tenant) | 2 | S | Partial (SEC-005 backlog task exists, no tier definitions) | Enhance backlog task |
| 11 | Deployment runbook | 3 | M | None (INFRA-001/002 are implementation tasks, not a runbook) | Create `00-foundations/deployment-runbook.md` |
| 12 | P2/P3 depth scoring | 2 | M | Partial (depth-dashboard.md scores P0/P1 only, P2/P3 not scored) | Enhance `04-completeness/depth-dashboard.md` |

---

## Skipped Items (Low Value for Current Stage)

| Item | Kit Source | Why Skip |
|------|-----------|----------|
| Feature flags policy | `11-new-capabilities/feature-flags.md` | Not using feature flags yet; premature |
| i18n setup | `11-new-capabilities/i18n-setup.md` | English-only product; no international expansion planned |
| Analytics event taxonomy | `11-new-capabilities/analytics-tracking.md` | Pre-revenue; no analytics infrastructure yet |
| Anti-slop verification log | `07-ui-design-system/anti-slop-rules.md` | 31 TMS components already approved; design system locked |
| Contributor guide | `06-development-workflow/` | Single team (2 AI agents); overhead not justified |

---

## Detailed Gap Analysis

### Gap 1: ADR Expansion

**Current:** 10 ADRs (ADR-001 through ADR-010) in `07-decisions/decision-log.md`. All follow consistent format (Date, Status LOCKED, Decision, Rationale, Alternatives, Do-NOT-Change). No quick-lookup index table.

**Missing decisions:**
- Why Socket.io over SSE or raw WebSockets (relevant to QS-001)
- Why row-level tenantId over schema-per-tenant or DB-per-tenant
- Why universal soft deletes (deletedAt on 248 of 260 models)
- Why React Hook Form + Zod over alternatives (relevant to Load Planner forms)
- Why Redis for queues (BullMQ) and cache

**Kit pattern:** Master-Starter-Kit tracks decisions as they're made, with explicit "Do NOT change" warnings. This prevents relitigating during Quality Sprint.

### Gap 2: Cross-Service Data Flow

**Current:** No business data flow document exists. `architecture.md` has a tech-stack diagram (browser -> Next.js -> NestJS -> Prisma -> PostgreSQL). Task dependency graphs exist in sprint files. But no diagram showing the revenue pipeline: Quote -> Order -> Load -> Dispatch -> Delivery -> Invoice -> Payment -> Settlement -> Commission.

**Kit pattern:** Cross-service data flow with entity lifecycle state machines (ASCII diagrams), service-to-service dependency tables, and key foreign key chains.

**Impact:** Without this, any agent working on Accounting doesn't know what upstream events trigger invoice creation. Any agent on Commission doesn't know when settlement data flows in.

### Gap 3: Testing Strategy

**Current:** `testing-standards.md` has testing pyramid, file naming, mocking patterns, and commands. No per-service coverage targets, no milestones (current 8.7% -> sprint-end -> v1.0), no "What NOT to test" guidance, no financial module mandate.

**Kit pattern:** Coverage targets by service, milestone dates, minimum coverage gates for production readiness, and explicit list of things not worth testing (upstream library components, static config).

### Gap 4: Notification Architecture

**Current:** Three separate files cover channels: `websockets.md` (Socket.io for real-time), `email-service.md` (SendGrid), `sms-service.md` (Twilio). No unified routing spec answering "When load status changes, which channels fire?"

**Kit pattern:** Unified notification routing matrix (event x channel), user preference model, quiet hours, rate limiting per user, digest batching.

### Gap 5: Incident Severity Framework

**Current:** `security-findings.md` lists 13 findings with open/closed status but no severity classification system. No defined response times.

**Kit pattern:** SEV-1 through SEV-4 with response SLAs, classification rules (any tenant data leak = SEV-1), escalation matrix.

### Gap 6: Caching Strategy

**Current:** `architecture.md` has a stub: "Redis 7 configured in docker-compose. Planned: session cache, query cache, WebSocket adapter." No TTL tiers, no key convention, no implementation priority.

**Kit pattern:** Multi-layer cache (CDN, browser, API, Redis) with TTL per data type, key convention `{tenantId}:{entity}:{scope}`, stale-while-revalidate pattern.

### Gap 7-8: Session Ritual + Quality Gates

**Current:** Both files exist with useful content. Session kickoff has 8 steps. Quality gates has 4 gates + checklist. Missing: session-end ritual, AI agent handoff protocol, formal 8-step /verify sequence.

**Kit pattern:** Session start (70 sec) + end (90 sec) rituals. 8-gate /verify sequence: typecheck -> lint -> test -> build -> design-verify -> Playwright -> state verification.

### Gap 9: Performance Budget

**Current:** `quality-gates.md` mentions FCP < 1.5s and LCP < 2.5s. No INP, CLS, TBT targets. No bundle size budgets. No per-route exceptions.

**Kit pattern:** Full Web Vitals budget table + bundle size limits + per-route exceptions for heavy pages.

### Gap 10: Rate Limiting

**Current:** SEC-005 backlog task has basic requirements. No multi-tenant tier definitions, no plan-based limits.

**Kit pattern:** Per-plan limits (Free/Pro/Enterprise), sliding-window rate limiter, `X-RateLimit-*` headers.

### Gap 11: Deployment Runbook

**Current:** INFRA-001 (CI/CD) and INFRA-002 (Docker config) are implementation tasks. No step-by-step runbook for deploying, verifying health, or rolling back.

**Kit pattern:** Pre-deployment checklist, deployment steps, rollback procedure, smoke tests.

### Gap 12: P2/P3 Depth Scoring

**Current:** `depth-dashboard.md` scores all 9 P0 hubs (8-10/10) and all 6 P1 hubs (6.5-7/10). P2 (7 services) and P3 (16 services) are not scored.

**Kit pattern:** Every service hub scored against the depth rubric, regardless of priority tier.

---

## Implementation Plan

See plan file for detailed execution waves. Summary:

- **3 new files** created (data-flow, notification-architecture, deployment-runbook)
- **9 files enhanced** in place (no parallel structures)
- **16 Tribunal files** created for adversarial stress-test
- **Estimated effort:** 8-10 hours total across all phases

---

## Before/After Scoring

> Completed 2026-03-07 after all 4 phases.

| Dimension | Before | After | Delta |
|-----------|--------|-------|-------|
| Service hub depth (P0) | 8.8/10 avg | 8.8/10 avg (unchanged) | +0 (already strong) |
| Service hub depth (P1) | 6.8/10 avg | 6.8/10 avg (unchanged) | +0 (already strong) |
| Service hub depth (P2) | Not scored | 9.6/10 avg (all pass) | Scored |
| Service hub depth (P3) | Not scored | 9.3/10 avg (features), 1.5/10 (infra stubs) | Scored |
| Architecture docs | 7/10 | 9/10 | +2 (data flow, caching, ADRs, notifications) |
| Testing docs | 5/10 | 8.5/10 | +3.5 (coverage targets, milestones, mandate) |
| Operations docs | 3/10 | 8/10 | +5 (severity framework, deployment runbook, /verify) |
| Session workflow | 6/10 | 8.5/10 | +2.5 (end ritual, handoff protocol) |
| Performance docs | 4/10 | 8/10 | +4 (Web Vitals, bundle budgets, per-route) |
| Security docs | 6/10 | 8/10 | +2 (severity framework, rate limit tiers) |
| Strategic clarity | 6/10 | 9/10 | +3 (Tribunal: 10 debates, verdicts, action items) |
| Overall confidence | 9.0/10 | **9.5/10** | **+0.5** |

### What Changed

**Phase 2 (12 enhancements):**
- 3 new files: data-flow.md, notification-architecture.md, deployment-runbook.md
- 9 enhanced files: ADRs, testing strategy, severity framework, caching, session kickoff, quality gates, performance budget, rate limiting, depth dashboard
- All 38 service hubs now scored against depth rubric (32 feature services pass, 6 infra stubs correctly flagged)

**Phase 3 (Tribunal — 16 files):**
- 3 research briefs (competitor matrix, table-stakes audit, multi-tenant patterns)
- 10 structured debates with prosecution, defense, cross-examination, and verdicts
- 51 consolidated action items across P0/P1/P2/P3 priorities
- 5 proposed new ADRs (ADR-016 through ADR-020)
- Key strategic finding: "Backend-heavy, frontend-light" pattern confirmed across all debates

### Why 9.5 and Not 10

The remaining 0.5 gap:
- Tribunal verdicts are recommendations, not yet executed (tier changes, Prisma Client Extension, financial tests)
- 6 infrastructure stubs remain low-scored (correct but incomplete)
- No Playwright-verified route screenshots yet (QS-008 still planned)
- ADR-016 through ADR-020 are proposed but not yet formalized in decision-log.md|

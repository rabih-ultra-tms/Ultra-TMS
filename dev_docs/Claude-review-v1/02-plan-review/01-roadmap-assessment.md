# Roadmap Assessment

**Project:** Ultra TMS - 3PL Logistics Platform
**Review Date:** 2026-02-07
**Reviewer:** Claude Opus 4.6
**Scope:** 162-week development roadmap, Phase A (78-week MVP) deep-dive

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Phase A: 78-Week MVP Realism Check](#2-phase-a-78-week-mvp-realism-check)
3. [Current Velocity Assessment](#3-current-velocity-assessment)
4. [Sprint Sizing Analysis](#4-sprint-sizing-analysis)
5. [Milestone Realism](#5-milestone-realism)
6. [Phase B-E Value Assessment](#6-phase-b-e-value-assessment)
7. [Resource Allocation](#7-resource-allocation)
8. [Risk Factors and Critical Path](#8-risk-factors-and-critical-path)
9. [Industry Comparison](#9-industry-comparison)
10. [Recommendations](#10-recommendations)

---

## 1. Executive Summary

The 162-week roadmap (`dev_docs/05-roadmap/52-roadmap-overview.md`) is **ambitious but structurally sound** for the documentation it covers. Phase A targets a complete internal MVP across 12 sections (auth, CRM, sales, TMS core, carrier, accounting, operations, governance, extended features, analytics, customer portal, and final polish). At 2 developers working 30 hrs/week each (60 hrs/week total, 4,680 hours for Phase A), this is the equivalent of roughly 1.5 full-time developers over 18 months.

**Verdict: Phase A is achievable in 78 weeks, but only if the scope is trimmed to P0/P1 features.** The current plan attempts to build a feature-complete enterprise TMS in Phase A. A realistic MVP for first paying user needs approximately 40-50 weeks of focused P0 work. The remaining 28-38 weeks in Phase A should be reserved for P1 polish and integration hardening.

**Key Findings:**
- Current velocity (4 weeks of actual development) has produced 5 fully-built modules, 49 frontend pages, 115 components, and 257 Prisma models -- this is **strong foundational velocity**
- Sprint sizing is uneven: some weeks carry 2x the complexity of others
- Milestones M7-M9 (operations, platform services, EDI/analytics) are over-scoped for the allocated time
- Phase B-E are placeholders with minimal planning; their 84-week estimate is reasonable given team scaling assumptions
- The critical path runs through TMS Core -- everything downstream (carrier assignment, invoicing, tracking) depends on Orders and Loads being fully functional

---

## 2. Phase A: 78-Week MVP Realism Check

### 2.1 Total Hours Budget

| Metric | Value |
|--------|-------|
| Engineers | 2 |
| Hours/week each | 30 |
| Total weekly hours | 60 |
| Phase A weeks | 78 |
| **Total Phase A hours** | **4,680** |
| Overhead (meetings, review, context-switching) | ~20% |
| **Effective coding hours** | **~3,744** |

### 2.2 Scope vs. Capacity Assessment

The Phase A plan (`dev_docs/05-roadmap/53-roadmap-phase-a.md`) covers **18 service categories** in its delivery schedule:

| Service Block | Weeks Allocated | Estimated Hours | Complexity |
|---------------|-----------------|-----------------|------------|
| Foundation (setup, infra, DB) | 1-4 (4 weeks) | 240 | Medium |
| Auth & Admin | 5-8 (4 weeks) | 240 | Medium |
| CRM + HubSpot Integration | 9-16 (8 weeks) | 480 | High |
| Sales & Quoting | 17-24 (8 weeks) | 480 | High |
| TMS Core (orders, loads, dispatch, tracking) | 25-32 (8 weeks) | 480 | **Very High** |
| Carrier Management | 33-42 (10 weeks) | 600 | High |
| Accounting (invoicing, payables, GL, QB) | 43-54 (12 weeks) | 720 | **Very High** |
| Operations (claims, docs, comms) | 55-62 (8 weeks) | 480 | Medium-High |
| Platform Services (analytics, workflow, audit) | 63-70 (8 weeks) | 480 | Medium |
| Analytics & Reporting | 71-74 (4 weeks) | 240 | Medium |
| Customer Portal | 75-77 (3 weeks) | 180 | Medium |
| Polish & Launch | 78 (1 week) | 60 | Low |
| **Total** | **78 weeks** | **4,680** | -- |

### 2.3 Realism Verdict by Section

| Section | Weeks | Verdict | Notes |
|---------|-------|---------|-------|
| Foundation | 4 | **Realistic** | Already completed. Monorepo, Docker, Prisma all working |
| Auth & Admin | 4 | **Realistic** | Already completed. 5 controllers, 6 services, full RBAC |
| CRM + HubSpot | 8 | **Mostly realistic** | CRM module exists (companies, contacts, opportunities). HubSpot sync is the risk |
| Sales & Quoting | 8 | **Tight** | Sales module scaffolded (quotes, rate contracts, accessorials). Rate calculation engine is complex |
| TMS Core | 8 | **Under-estimated** | This is the heart of the system. 8 weeks for orders + loads + dispatch board + stops + tracking + rate confirmations is aggressive. Should be 12-14 weeks |
| Carrier Management | 10 | **Realistic** | Carrier module has 6 services. FMCSA integration adds uncertainty but 10 weeks is fair |
| Accounting | 12 | **Tight** | QuickBooks integration + GL + settlements + commission is enterprise-grade complexity. 12 weeks assumes no scope creep |
| Operations | 8 | **Over-scoped** | Claims + OCR + e-signatures + email/SMS integration + customer portal in 8 weeks with 2 devs is too much |
| Platform Services | 8 | **Deferrable** | Analytics, workflow engine, audit trails -- these are Phase B material, not MVP |
| Analytics & Reporting | 4 | **Deferrable** | Custom report builder is a product in itself. Not MVP |
| Customer Portal | 3 | **Deferrable** | Nice-to-have for MVP. Internal users can share tracking info manually |
| Polish & Launch | 1 | **Dangerously short** | 1 week for final testing + deployment + data migration + user training is unrealistic. Needs 4-6 weeks minimum |

### 2.4 Adjusted Timeline Estimate

If building everything currently in Phase A scope:

| Section | Current Weeks | Realistic Weeks | Delta |
|---------|---------------|-----------------|-------|
| Foundation | 4 | 4 (done) | 0 |
| Auth & Admin | 4 | 4 (done) | 0 |
| CRM + HubSpot | 8 | 8 | 0 |
| Sales & Quoting | 8 | 10 | +2 |
| TMS Core | 8 | 14 | +6 |
| Carrier Management | 10 | 10 | 0 |
| Accounting | 12 | 14 | +2 |
| Operations | 8 | 10 | +2 |
| Platform Services | 8 | 10 | +2 |
| Analytics & Reporting | 4 | 6 | +2 |
| Customer Portal | 3 | 4 | +1 |
| Polish & Launch | 1 | 6 | +5 |
| **Total** | **78** | **100** | **+22** |

**Without scope reduction, Phase A realistically requires ~100 weeks**, not 78. With MVP prioritization (cutting platform services, analytics, customer portal, and most of operations to Phase B), **Phase A can be completed in 60-65 weeks** with a much sharper product.

---

## 3. Current Velocity Assessment

### 3.1 What Got Built in ~4 Weeks of Active Development

Based on the code review (`dev_docs/Claude-review-v1/01-code-review/02-backend-module-audit.md`):

**Backend (apps/api/):**
- 38 active NestJS module directories (22 fully implemented, 6 partially implemented, 10 infrastructure/utility)
- 257 Prisma models across 9,854 lines of schema
- ~95+ controllers, ~120+ services, ~100+ spec files, ~180+ DTOs
- 5 fully-built core modules: auth, crm, sales, carrier, tms (with real business logic)
- Key infrastructure: JWT auth with refresh rotation, Redis sessions, bcrypt, rate limiting, MFA, account lockout

**Frontend (apps/web/):**
- 49 page.tsx files (routes)
- 115 React components
- Auth flow: login, register, MFA, forgot/reset password, verify email (6 pages)
- Dashboard: admin (users, roles, permissions, tenants, settings, audit), CRM (companies, contacts, leads, activities), operations (carriers, customers, load planner, quotes, truck types)

**Documentation:**
- 93 documentation files in `dev_docs/`
- 89 detailed screen design specs in `dev_docs/12-Rabih-design-Process/`
- 11 development standards docs
- 2-part API contract registry

### 3.2 Velocity Metrics

| Metric | Value | Per Week |
|--------|-------|----------|
| Backend modules built | 22 fully implemented | ~5.5/week |
| Prisma models defined | 257 | ~64/week |
| Frontend pages | 49 | ~12/week |
| Components | 115 | ~29/week |
| Spec files | ~100+ | ~25/week |

**Context:** This velocity includes significant AI-assisted development (Claude Code). The documentation-first approach (93 docs created before much code) frontloaded planning. Actual feature-building velocity will likely slow as complexity increases (e.g., dispatch board, rate calculation engine, QuickBooks integration).

### 3.3 Velocity Concerns

1. **Scaffolded vs. Complete:** Many of the 22 "fully implemented" modules have controllers and services with real logic, but the depth of business rules implementation varies. The auth module (532-line service) is production-grade. Other modules may be thinner.
2. **Frontend test gap:** Only ~10 test files for 115+ components. Testing velocity is near zero.
3. **Integration testing:** No evidence of end-to-end API integration testing across modules (e.g., order creation triggering carrier assignment triggering invoicing).
4. **No deployment history:** No CI/CD runs, no staging environment, no production deployment to date. First deploy will uncover configuration issues.

---

## 4. Sprint Sizing Analysis

### 4.1 Sprint Structure

The Phase A plan uses 2-week sprints (39 sprints across 78 weeks). Each sprint is defined in `dev_docs/05-roadmap/53-roadmap-phase-a.md` with checkbox task lists.

### 4.2 Sprint Complexity Distribution

| Sprint | Weeks | Feature Area | Task Count | Complexity Score (1-10) |
|--------|-------|--------------|------------|-------------------------|
| 1-2 | 1-4 | Foundation | 12 | 4 |
| 3-4 | 5-8 | Auth & Admin | 12 | 5 |
| 5-8 | 9-16 | CRM + HubSpot | 20 | 7 |
| 9-12 | 17-24 | Sales & Quoting | 16 | 7 |
| 13-16 | 25-32 | TMS Core | 16 | **9** |
| 17-21 | 33-42 | Carrier Management | 20 | 7 |
| 22-27 | 43-54 | Accounting | 24 | **9** |
| 28-31 | 55-62 | Operations | 16 | 6 |
| 32-35 | 63-70 | Platform Services | 16 | 5 |
| 36-39 | 71-78 | Polish & Launch | 16 | 6 |

### 4.3 Sizing Problems

1. **TMS Core (Sprints 13-16) is under-sized.** The dispatch board alone is a 2-3 week feature (drag-and-drop Kanban with real-time updates, carrier matching, status workflows). Combined with multi-stop order management, load building, tracking map with live updates, and rate confirmation PDF generation -- this block needs 12-14 weeks, not 8.

2. **Accounting (Sprints 22-27) carries hidden complexity.** QuickBooks Online integration requires OAuth, webhooks, field mapping, reconciliation logic, and handling QB's API quirks. This alone is 3-4 weeks. Adding GL entries, commission calculation, carrier settlements, and aging reports pushes this well beyond 12 weeks.

3. **Operations (Sprints 28-31) packs too many unrelated features.** Claims management, OCR document processing, e-signature integration, email/SMS integration, and a customer portal are each standalone modules. Bundling them in 8 weeks assumes each gets ~1.5 weeks, which is insufficient for production quality.

4. **Polish & Launch (Sprints 36-39) is dangerously front-loaded with testing.** Integration testing, performance testing, security audit, UAT, and deployment automation all crammed into 8 weeks at the end, after 70 weeks of feature development. Testing should be continuous, not a phase.

---

## 5. Milestone Realism

### 5.1 Milestone-by-Milestone Assessment

Source: `dev_docs/05-roadmap/52-roadmap-overview.md` Go-Live Schedule + `53-roadmap-phase-a.md` milestones

| Milestone | Week | Target | Achievable? | Risk Level |
|-----------|------|--------|-------------|------------|
| M1: Auth & Admin live | 8 | User management, RBAC, tenant isolation | **Yes** (already done) | Low |
| M2: CRM Integration | 16 | HubSpot bidirectional sync working | **Likely** | Medium -- HubSpot API rate limits, webhook reliability |
| M3: Sales module | 24 | Full quoting workflow | **Likely** | Medium -- rate calculation engine complexity |
| M4: TMS Core operational | 32 | Orders, loads, dispatch, basic tracking | **At risk** | **High** -- dispatch board + tracking map are the hardest screens in the app |
| M5: Carrier management | 42 | Carrier onboarding, FMCSA, portal MVP | **Likely** (if M4 is on time) | Medium -- FMCSA API is straightforward but carrier portal adds scope |
| M6: Accounting integrated | 54 | Invoicing, payables, settlements, QB sync | **At risk** | **High** -- QuickBooks integration is notoriously complex |
| M7: Operations complete | 62 | Claims, documents, communications | **Over-scoped** | **High** -- OCR + e-signatures + email/SMS are each significant integrations |
| M8: Platform services live | 70 | Analytics, workflow, audit, config | **Deferrable** | Medium -- valuable but not MVP-critical |
| M9: Phase A complete | 78 | Everything tested, deployed, documented | **Unrealistic at current scope** | **Very High** -- 1 week for final launch is insufficient |

### 5.2 Milestone Dependency Risks

The plan is strictly sequential. If M4 (TMS Core) slips by 4 weeks, everything downstream shifts:

```
M4 slip (+4 weeks)
  -> M5 starts week 36 instead of 33
    -> M6 starts week 46 instead of 43
      -> M7 starts week 58 instead of 55
        -> Phase A extends to week 82+
```

There is no buffer built into the schedule. Every section starts immediately after the previous one ends.

---

## 6. Phase B-E Value Assessment

### 6.1 Phase B: Enhancement (Weeks 79-104, 26 weeks)

Source: `dev_docs/05-roadmap/54-roadmap-phase-b.md`

**Scope:** Internal CRM (replace HubSpot), mobile apps, advanced analytics, enhanced workflow, driver portal.

**Assessment:** Ambitious for 26 weeks, even with 2-3 engineers. Replacing HubSpot with an internal CRM is a major undertaking. Mobile apps (React Native) add a new platform to maintain. This phase would benefit from being split: CRM enhancement first (12 weeks), then mobile apps as a separate initiative.

**Value:** High. Removing the HubSpot dependency eliminates a major cost center and integration point.

### 6.2 Phase C: SaaS Launch (Weeks 105-128, 24 weeks)

**Scope:** Multi-tenant SaaS offering, fleet manager and trucking company verticals.

**Assessment:** SaaS launch requires billing infrastructure (Stripe), onboarding flows, tenant provisioning, usage metering, and customer support tooling. Adding 2 new verticals simultaneously multiplies complexity. Should focus on SaaS infrastructure first, then one vertical at a time.

**Value:** Very high. This is where revenue diversification begins.

### 6.3 Phase D: Expansion (Weeks 129-146, 18 weeks)

**Scope:** Freight forwarder and warehouse/fulfillment verticals.

**Assessment:** These verticals have significantly different workflows from freight brokerage. Freight forwarding involves customs, international documentation, and ocean/air carrier management. Warehouse/fulfillment is essentially a separate WMS. 18 weeks is optimistic.

**Value:** Moderate. Market expansion, but each vertical is a niche.

### 6.4 Phase E: Specialty (Weeks 147-162, 16 weeks)

**Scope:** Household goods, final mile, auto transport, bulk/tanker verticals.

**Assessment:** These are specialty verticals with unique requirements. Household goods has HHG-specific regulations. Auto transport needs VIN tracking and multi-car carrier management. These could each be standalone products.

**Value:** Low-to-moderate for initial investment. High specialization means smaller addressable market per vertical.

### 6.5 Overall B-E Assessment

Phases B-E represent 84 additional weeks of development. The assumption of scaling to 4-6 engineers by Phase C is reasonable but unbudgeted. Phase B is well-defined; Phases C-E are high-level outlines that will require significant planning before execution.

**Recommendation:** Treat Phases B-E as a strategic direction, not a committed plan. Each phase should be re-planned 4-6 weeks before it begins based on what was learned in the previous phase.

---

## 7. Resource Allocation

### 7.1 Current Team Structure

- **2 engineers, 30 hrs/week each**
- AI-assisted development (Claude Code) as a force multiplier
- No dedicated QA, DevOps, design, or product management

### 7.2 Resource Gaps

| Role | Impact | When Critical |
|------|--------|---------------|
| **QA Engineer** | Testing is entirely developer-driven. Integration testing is minimal. | Now -- from TMS Core onward |
| **DevOps Engineer** | No CI/CD runs, no staging environment, no production deployment | Week 20 -- before GL-3 (first user-facing deploy) |
| **Product Manager** | No one prioritizing features, managing scope, or defining acceptance criteria | Now -- scope creep is the #1 schedule risk |
| **UX Designer** | 89 design specs exist but are text-based. No high-fidelity mockups or user testing | Phase B (not critical for internal MVP) |

### 7.3 AI Leverage Assessment

Claude Code significantly accelerates scaffolding, boilerplate generation, and documentation. Based on observed output (257 models, 115 components, 93 docs in ~4 weeks), AI assistance is providing roughly a 2-3x productivity multiplier for initial implementation.

However, AI leverage diminishes for:
- Complex business logic debugging (rate calculation edge cases)
- Third-party API integration (QuickBooks, HubSpot, FMCSA quirks)
- UI/UX refinement (visual polish, interaction design)
- Performance optimization (query tuning, caching strategy)
- Security hardening (penetration testing, auth edge cases)

**Realistic AI multiplier for Phase A remaining work: 1.5-2x** (down from the 2-3x seen in foundation/scaffolding phase).

---

## 8. Risk Factors and Critical Path

### 8.1 Critical Path

```
Foundation (done)
  -> Auth (done)
    -> CRM (partially done)
      -> Sales (scaffolded)
        -> TMS Core (scaffolded) ** CRITICAL **
          -> Carrier Management (scaffolded)
            -> Accounting (scaffolded)
              -> Polish & Deploy
```

**TMS Core is the critical bottleneck.** Orders and Loads are referenced by virtually every downstream module:
- Carrier Management needs loads to assign carriers to
- Accounting needs delivered loads to invoice
- Tracking needs loads with active status
- Dispatch Board needs the full order-to-load workflow
- Rate Confirmations need load + carrier + rate data

Any delay in TMS Core cascades through the entire remaining schedule.

### 8.2 Top 10 Risk Factors

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| 1 | TMS Core takes longer than 8 weeks | **High** | **Critical** | Add 4-6 week buffer; start with Order CRUD, then Load, then Dispatch Board as separate milestones |
| 2 | QuickBooks integration complexity | **High** | **High** | Use a QB integration library (e.g., `node-quickbooks`); budget 4 weeks for QB alone |
| 3 | Scope creep in accounting module | **High** | **High** | Define MVP invoicing (no GL, no commission) separately from full accounting |
| 4 | No staging environment | **Medium** | **High** | Set up staging on Railway/Render before week 20 |
| 5 | HubSpot sync reliability | **Medium** | **Medium** | Implement circuit breaker + manual sync fallback; test with real HubSpot data early |
| 6 | Developer burnout (30 hrs/week x 78 weeks = 18 months) | **Medium** | **High** | Build in 1-week recovery sprints every 12 weeks |
| 7 | Real-time features (WebSocket tracking, dispatch board) | **Medium** | **Medium** | Use Socket.io with Redis adapter; prototype dispatch board early |
| 8 | No integration tests | **High** | **Medium** | Start writing integration tests from TMS Core onward; cover critical workflows |
| 9 | First production deployment failures | **Medium** | **Medium** | Do a "dry run" deploy by week 12 even if only auth is live |
| 10 | FMCSA/SAFER API availability | **Low** | **Medium** | Cache responses; build carrier management UI to work without API if needed |

### 8.3 Schedule Buffer Recommendation

The current plan has zero buffer. Industry best practice for software projects is 15-25% contingency.

- **78 weeks x 20% buffer = 15.6 weeks**
- **Recommended:** Add 2-week buffer after each major milestone (M2, M4, M6), plus a 4-week buffer before launch. Total: 10 weeks of buffer.
- This extends Phase A to 88 weeks, or **reduces scope to fit 78 weeks with 10 weeks of breathing room**.

---

## 9. Industry Comparison

### 9.1 TMS Build Timelines (Industry Benchmarks)

| Company/Product | Team Size | Time to MVP | Scope at MVP |
|----------------|-----------|-------------|--------------|
| Rose Rocket | 6-8 engineers | ~18 months | Orders, dispatch, tracking, basic invoicing |
| Turvo | 10+ engineers | ~24 months | Collaborative TMS with visibility |
| Tai TMS | 4-6 engineers | ~12 months | Basic brokerage TMS |
| McLeod Express (rewrite) | 20+ engineers | 36+ months | Full-featured enterprise TMS |
| Typical startup TMS | 3-5 engineers | 12-18 months | Core brokerage workflow |

### 9.2 Ultra TMS Comparison

- **Team:** 2 engineers (smallest team in comparison)
- **Target scope:** Enterprise-grade 38-service TMS (largest scope in comparison)
- **Timeline:** 78 weeks / 18 months (mid-range timeline)
- **AI multiplier:** Unique advantage, roughly doubling effective team to ~3-4 equivalent developers

**Assessment:** With AI assistance, Ultra TMS's effective team is comparable to a small startup team (3-4 devs). However, the scope is more comparable to a McLeod rewrite than a startup MVP. The mismatch between scope and team size is the fundamental risk.

### 9.3 What Comparable Teams Ship in 18 Months

A 2-developer team building a freight brokerage TMS with AI assistance should realistically aim for:

1. Auth + user management
2. Customer/company management (CRM basics, no HubSpot sync initially)
3. Quoting (basic rate entry, not full rate engine)
4. Order management (create, edit, status tracking)
5. Load management (assign carrier, track status)
6. Dispatch board (basic, not full Kanban with drag-and-drop)
7. Carrier management (profile, insurance tracking)
8. Basic invoicing (from delivered loads)
9. Basic reporting (revenue, margin, load count)

This represents roughly **P0 features only** -- the absolute minimum for a first paying customer to use the system.

---

## 10. Recommendations

### R1: Adopt MVP Tiers (P0/P1/P2/P3)

**Action:** Re-categorize all 362 screens into priority tiers. See `03-mvp-reprioritization.md` for the detailed breakdown.

**Impact:** Reduces Phase A scope by 40-50%, making 78 weeks achievable with buffer.

### R2: Extend TMS Core Allocation

**Action:** Increase TMS Core from 8 weeks to 14 weeks. Split into sub-milestones:
- M4a (Week 28): Order CRUD + Status Workflow
- M4b (Week 32): Load Management + Stop Management
- M4c (Week 36): Dispatch Board + Basic Tracking

**Impact:** De-risks the most critical milestone.

### R3: Build in Schedule Buffers

**Action:** Add 2-week recovery/buffer sprints at weeks 20, 36, 52, and 68.

**Impact:** 8 weeks of buffer for scope adjustment, bug fixing, and burnout prevention.

### R4: Set Up Deployment Pipeline by Week 12

**Action:** Deploy auth module to a staging environment before starting Sales module. Validate the full CI/CD and infrastructure pipeline early.

**Impact:** Eliminates deployment risk and builds confidence.

### R5: Move Platform Services to Phase B

**Action:** Defer analytics, workflow engine, audit trail, and config service to Phase B. These are valuable but not required for a first paying user.

**Impact:** Frees 8 weeks in Phase A for TMS Core buffer and integration testing.

### R6: Simplify Accounting for MVP

**Action:** Build basic invoicing and carrier pay only. Defer GL, QuickBooks integration, commission engine, and financial reporting to a later milestone.

**Impact:** Reduces accounting from 12 weeks to 6 weeks, freeing 6 weeks of capacity.

### R7: Start Integration Testing from TMS Core

**Action:** Mandate integration tests for every critical workflow starting with Order creation. Use the API contract registry (`dev_docs/09-contracts/76-screen-api-contract-registry.md`) as the test specification.

**Impact:** Catches cross-module bugs early rather than in a final "testing phase."

### R8: Plan for a Soft Launch

**Action:** Replace the 1-week "Polish & Launch" with a 4-week soft launch:
- Week 1: Internal team uses system for real loads (dogfooding)
- Week 2: Fix critical issues found
- Week 3: Onboard 1-2 pilot users
- Week 4: Stabilize and document

**Impact:** Dramatically reduces launch risk.

### 10.1 Revised Phase A Timeline (Recommended)

| Section | Original Weeks | Recommended Weeks | Change |
|---------|---------------|-------------------|--------|
| Foundation + Auth | 1-8 | 1-8 (done) | -- |
| CRM + HubSpot | 9-16 | 9-16 | -- |
| Buffer #1 | -- | 17-18 | +2 |
| Sales & Quoting | 17-24 | 19-26 | -- |
| TMS Core (expanded) | 25-32 | 27-40 | +6 |
| Buffer #2 | -- | 41-42 | +2 |
| Carrier Management | 33-42 | 43-50 | -2 (trimmed) |
| Basic Accounting | 43-54 | 51-56 | -6 (MVP scope) |
| Buffer #3 | -- | 57-58 | +2 |
| Integration Testing | -- | 59-62 | +4 |
| Operations (MVP: docs + notifications only) | 55-62 | 63-66 | -4 (trimmed) |
| Soft Launch | 78 | 67-70 | +3 |
| **Phase A MVP Done** | **Week 78** | **Week 70** | **-8 weeks** |
| **Remaining weeks for P1 features** | 0 | 71-78 (8 weeks) | +8 |

This revised timeline delivers a **shippable MVP by week 70** with 8 weeks of remaining Phase A time for P1 features, buffer, or early Phase B work.

---

## Appendix: Source Documents Referenced

| Document | Path |
|----------|------|
| Roadmap Overview | `dev_docs/05-roadmap/52-roadmap-overview.md` |
| Phase A Detail | `dev_docs/05-roadmap/53-roadmap-phase-a.md` |
| Phase B Detail | `dev_docs/05-roadmap/54-roadmap-phase-b.md` |
| Master Development Guide | `dev_docs/00-master/00-master-development-guide.md` |
| Backend Module Audit | `dev_docs/Claude-review-v1/01-code-review/02-backend-module-audit.md` |
| Architecture Assessment | `dev_docs/Claude-review-v1/01-code-review/01-architecture-assessment.md` |
| API Contract Registry | `dev_docs/09-contracts/76-screen-api-contract-registry.md` |
| Development Standards | `dev_docs/08-standards/65-development-standards-overview.md` |
| Testing Strategy | `dev_docs/08-standards/72-testing-strategy.md` |
| Pre-Feature Checklist | `dev_docs/08-standards/74-pre-feature-checklist.md` |
| Design Specs | `dev_docs/12-Rabih-design-Process/` (89 detailed screen specs) |
| Prisma Schema | `apps/api/prisma/schema.prisma` (9,854 lines, 257 models) |

---

*Document Version: 1.0.0*
*Review Date: 2026-02-07*
*Reviewer: Claude Opus 4.6*

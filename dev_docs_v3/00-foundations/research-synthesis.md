# Research Synthesis — Ultra TMS

> **Purpose:** Tribunal-equivalent executive summary synthesized from all existing research.
> **Sources:** Claude review v1 (37 files), Gemini review v2 (2 files), service definitions, audits, stakeholder feedback.
> **Last Updated:** 2026-03-07

---

## Project Vision (Locked)

Ultra TMS is a **multi-tenant 3PL TMS SaaS platform** targeting small-to-medium freight brokers who need a modern, integrated alternative to legacy systems like McLeod, TMW, or Aljex.

**Core value proposition:**
1. All-in-one: CRM + quotes + dispatch + tracking + accounting in one platform
2. Modern UX: Clean interface that brokers actually want to use (vs. legacy ugly TMS systems)
3. Multi-tenant: Sell to multiple brokerages, not custom installs
4. AI-powered: Load Planner with AI cargo extraction (competitive differentiator)

**Who is this for?** Small-to-medium freight brokers (10-100 users per tenant). NOT for massive carriers with 10,000 trucks — this is a broker-focused tool.

---

## Architecture Decisions (Final — Do Not Relitigate)

### What Was Decided and Why

| Decision | Choice | Rationale |
|---|---|---|
| Monorepo | pnpm + Turborepo | Shared code between web/api, single CI pipeline |
| Frontend | Next.js 16 App Router | SSR for SEO, React ecosystem, team familiarity |
| Backend | NestJS 10 | TypeScript-first, modular, decorator patterns match Java/Spring experience |
| Database | PostgreSQL + Prisma 6 | Relational data (loads have complex relationships), Prisma type safety |
| Multi-tenant | Row-level tenantId | Simplest to implement, acceptable performance at current scale |
| Auth | JWT HttpOnly cookies | XSS-safe, simpler than OAuth for B2B SaaS |
| State | React Query + Zustand | React Query handles server state caching, Zustand for UI state |
| Forms | RHF + Zod | Type-safe forms, excellent DX, industry standard |
| Design | Rabih V1 | Stakeholder approved — navy accent, Inter font, dot-label badges |
| Cache | Redis | Industry standard, future job queue support |
| Search | Elasticsearch | Full-text search with aggregations for load board |

### What Was Explicitly Rejected

| Alternative | Why Rejected |
|---|---|
| tRPC | Team unfamiliar, REST is more universal for future API consumers |
| GraphQL | Overhead not justified for current scale |
| Separate schema per tenant | Database management complexity at scale |
| MySQL | PostgreSQL is better for complex relational queries |
| Redux | React Query covers server state; Zustand simpler for UI state |
| Class-based components | Hooks-first is modern standard |

---

## Competitive Analysis Summary

| Competitor | Strength | Our Advantage |
|---|---|---|
| McLeod | Feature complete, market leader | Modern UX, faster onboarding, SaaS (no install) |
| TMW Systems | Enterprise-grade | Modern tech stack, more affordable |
| Aljex | Popular with small brokers | Better UI/UX, AI-powered Load Planner |
| Turvo | Modern UX | More TMS features, better carrier management |
| DAT TMS | Load board integration | More complete TMS features |

**Our positioning:** Best UX + AI assistance + complete TMS in one platform, at a price small brokers can afford.

**28 feature gaps vs. competitors identified** in Claude review v1. The most critical for credibility:
1. Real-time dispatch board (QS-001)
2. Customer portal with tracking (P1)
3. Carrier portal with POD upload (P1)
4. External load board integration (P3)

---

## Feature Priority Verdicts (MoSCoW)

### Must Have (MVP — cannot launch without these)

1. Auth & multi-tenant (DONE)
2. CRM — customer and contact management (DONE)
3. Quote creation and Load Planner (DONE — Load Planner PROTECTED)
4. Load management — create, dispatch, track status (DONE)
5. Carrier management — list, qualify, assign (DONE)
6. Invoice and settlement management (BUILT but unverified)
7. Real-time dispatch board + tracking (NOT BUILT — QS-001)
8. User management + RBAC (DONE)

### Should Have (P1 — within 90 days)

1. Customer portal with self-service tracking
2. Carrier portal with load acceptance + POD upload
3. Document management (S3 storage)
4. Email notifications (SendGrid)
5. Claims management
6. Contracts management

### Could Have (P2 — within 6 months)

1. Analytics dashboard (advanced)
2. Workflow automation
3. Integration hub (ERP, QuickBooks)
4. Credit management
5. Elasticsearch-powered search
6. Agent management with commission splitting
7. Factoring integration

### Won't Have (P3 — not this year)

ELD, EDI, Mobile app, HR, Advanced Safety, Cross-border, Fuel cards, External load board integration

---

## Key Risks Identified

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| WebSocket infrastructure too complex to build quickly | Medium | High | QS-001 is P0 — start immediately |
| 96 routes have bugs that block MVP credibility | High | High | QS-008 (runtime verification) — run before any P1 work |
| Multi-tenant data isolation bug | Low | Critical | Code review mandatory on all queries; QS-008 will reveal any leaks |
| Load Planner regression | Low | Critical | PROTECTED — do not touch without explicit permission |
| Team capacity (2 devs) insufficient for scope | Medium | Medium | Quality Sprint narrows scope to what matters most |
| Technical debt (339 TODOs) slows future development | High | Medium | QS-010 — triage and categorize, don't just ignore |

---

## Stakeholder Decisions (Binding)

1. **Rabih V1 design APPROVED** — navy accent, Inter font, warm borders. Approved 2026-02-12. No redesign.
2. **8 services = MVP scope** — not 38. Other services are future.
3. **Load Board deferred from MVP** — was originally MVP, deferred Feb 12 due to complexity.
4. **Load Planner is PROTECTED** — 1,825 LOC, AI integration, production-ready. Do not rebuild.
5. **Truck Types is PROTECTED** — gold standard CRUD, do not rebuild.
6. **16-week MVP timeline** — originally planned Feb-May 2026.

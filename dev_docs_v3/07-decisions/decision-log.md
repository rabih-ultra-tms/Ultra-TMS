# Architecture Decision Log — Ultra TMS

> Purpose: Prevent relitigating old decisions. If a decision is here, it is LOCKED.
> To change a decision, add a new entry with a date and rationale — don't edit the old one.
> Last updated: 2026-03-07

---

## ADR-001: Monorepo with pnpm + Turborepo

**Date:** Pre-project (Jan 2026)
**Status:** LOCKED

**Decision:** Single repository for frontend (Next.js) + backend (NestJS) + shared packages, managed with pnpm workspaces and Turborepo for build orchestration.

**Rationale:**
- Single source of truth for types — shared TypeScript types between frontend and backend
- Simplified deployment pipeline — one repo, one CI/CD
- Turborepo's caching makes builds fast even in a monorepo
- pnpm workspaces handle inter-package dependencies cleanly

**Alternatives considered:**
- Separate repos (polyrepo): rejected — type sync becomes a manual process, PR coordination across repos is painful
- nx: rejected — Turborepo is simpler for this stack

**Do NOT change to:** polyrepo, Yarn, npm, nx (all require significant migration effort for no clear gain)

---

## ADR-002: NestJS Modular Monolith (not Microservices)

**Date:** Pre-project (Jan 2026)
**Status:** LOCKED

**Decision:** Single NestJS application with 40 modules. Each module is self-contained (controller, service, DTOs) but runs in one process.

**Rationale:**
- Team size: 2 developers — microservices overhead (service discovery, distributed tracing, network latency) isn't justified
- Can be extracted to microservices later if needed — NestJS module boundaries make this feasible
- Prisma is hard to share across microservices without a dedicated data service
- Simpler deployment (one Docker image, not 40)

**Alternatives considered:**
- True microservices: rejected — premature for current team size
- Serverless functions: rejected — cold starts + DB connection pooling is painful with Prisma

**Future migration path:** When team grows, extract modules to microservices using NestJS's built-in microservice transport (TCP or NATS).

---

## ADR-003: PostgreSQL + Prisma (not MongoDB or other)

**Date:** Pre-project (Jan 2026)
**Status:** LOCKED

**Decision:** PostgreSQL 15 as primary database. Prisma 6 as ORM. Row-level tenantId for multi-tenancy.

**Rationale:**
- TMS data is highly relational (Order → Load → Stop → CheckCall, Carrier → Load → Invoice → Settlement)
- MongoDB would require manual joins for these relations
- Prisma's type safety + migration system is excellent for a growing schema (260 models)
- Row-level tenancy is simpler to audit than schema-per-tenant

**Alternatives considered:**
- MongoDB: rejected — document model doesn't fit relational TMS data
- MySQL: rejected — PostgreSQL has better JSON support and full-text search
- Schema-per-tenant multi-tenancy: rejected — 260 models × N tenants = unmanageable migration complexity
- Drizzle ORM: rejected — Prisma has better ecosystem + typing at time of decision

**Do NOT change to:** MongoDB, MySQL, schema-per-tenant (breaking change requiring full migration)

---

## ADR-004: Next.js App Router (not Pages Router)

**Date:** Pre-project (Jan 2026)
**Status:** LOCKED

**Decision:** Next.js 16 with App Router. All pages in `app/(dashboard)/` and `app/(auth)/`. No Pages Router files.

**Rationale:**
- App Router is the Next.js standard as of Next.js 13+
- React Server Components enable better performance for data-heavy TMS pages
- Nested layouts (`(dashboard)/layout.tsx`) cleanly handle auth gates
- Route groups keep auth pages separate from dashboard pages

**Alternatives considered:**
- Pages Router: rejected — it's legacy in Next.js 16
- Remix: rejected — team more familiar with Next.js
- SPA (no SSR): rejected — SEO and initial load performance matter for customer-facing tracking page

---

## ADR-005: React Query for Server State, Zustand for Client State

**Date:** Pre-project (Jan 2026)
**Status:** LOCKED

**Decision:** React Query (TanStack Query) handles all server state (API calls, caching, refetching). Zustand handles global client state (UI state, selected items, filters).

**Rationale:**
- React Query's caching + invalidation eliminates need for manual loading state management
- Automatic refetching on window focus keeps data fresh
- DevTools for debugging cache state
- Zustand is simpler than Redux for the limited global state needs of this app

**Do NOT use:** Redux, SWR, Apollo Client, fetch() directly in components (use hooks always)

---

## ADR-006: JWT in HttpOnly Cookies (not localStorage)

**Date:** Pre-project (Jan 2026, reinforced Mar 2026)
**Status:** LOCKED — **currently violated by BUG-012 (localStorage tokens)**

**Decision:** JWT access tokens stored in HttpOnly cookies. Frontend NEVER reads or stores tokens in localStorage or sessionStorage.

**Rationale:**
- HttpOnly cookies are inaccessible to JavaScript — prevents XSS token theft
- `SameSite=Strict` + `Secure` prevents CSRF
- Axios sends cookies automatically — no manual Authorization header injection needed

**Current violation:** `apps/web/lib/api/client.ts` lines 59, 77 read from localStorage. This is a P1 bug (BUG-012) and must be fixed.

**Do NOT revert to:** localStorage tokens (security regression), sessionStorage (same XSS risk as localStorage)

---

## ADR-007: Design System — Rabih V1 (Approved Feb 12 2026)

**Date:** 2026-02-12
**Status:** LOCKED — Stakeholder approved

**Decision:** 3-layer token architecture (brand → semantic → Tailwind). 31 TMS components in `apps/web/components/tms/`. Linear.app aesthetic (dark slate-900 sidebar, white content, blue-600 primary). Inter font. Dot-label status badges.

**Rationale:** Stakeholder (Rabih) approved V1 design explicitly on Feb 12. The design system is the visual language of the product.

**Do NOT change:** Colors, fonts, component shapes, status badge style without explicit stakeholder approval.

---

## ADR-008: shadcn/ui as Primitive Layer

**Date:** Pre-project (Jan 2026)
**Status:** LOCKED

**Decision:** shadcn/ui (Radix UI + Tailwind) provides all primitive components (Button, Input, Dialog, Table, etc.). Custom TMS components are built on top of shadcn/ui primitives.

**Rationale:**
- shadcn/ui is copy-paste based — components live in the codebase (not a dependency)
- Radix UI provides accessible, headless primitives
- Tailwind integration is seamless
- 37 components already installed in `apps/web/components/ui/`

**Do NOT modify:** Files in `apps/web/components/ui/` (shadcn-managed). Add new shadcn components via `npx shadcn-ui@latest add {component}`.

---

## ADR-009: Multi-AI Development Team

**Date:** 2026-02-08
**Status:** LOCKED — operational decision

**Decision:** Two AI agents collaborate: Claude Code handles complex features, audits, architecture. Gemini/Codex handles CRUD patterns, boilerplate, form refactors, tests.

**Rationale:**
- Different AI tools have different strengths
- Parallelization: 2 agents can work on independent tasks simultaneously
- Shared context via CLAUDE.md, AGENTS.md, GEMINI.md

**Protocol:**
- Claude Code: reads CLAUDE.md (this project's source of truth)
- Gemini: reads GEMINI.md + AGENTS.md
- Codex: reads .github/copilot-instructions.md
- All agents update STATUS.md and CHANGELOG.md after completing tasks

---

## ADR-010: dev_docs_v3 as Active Source of Truth (Mar 7 2026)

**Date:** 2026-03-07
**Status:** LOCKED

**Decision:** `dev_docs_v3/` is the active, living source of truth for all 38 services. `dev_docs/` and `dev_docs_v2/` are historical read-only references.

**Rationale:**
- dev_docs_v2 only covered 8 MVP services — insufficient scope
- dev_docs had 381 design specs but no implementation awareness
- dev_docs_v3 merges all 3 sources into a single hub per service
- Master Starter Kit methodology applied retroactively to mid-project state

**Supersedes:** dev_docs_v2/STATUS.md (replaced by dev_docs_v3/STATUS.md), dev_docs_v2/03-services/ (replaced by dev_docs_v3/01-services/)

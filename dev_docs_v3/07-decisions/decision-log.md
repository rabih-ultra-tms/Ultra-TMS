# Architecture Decision Log — Ultra TMS

> Purpose: Prevent relitigating old decisions. If a decision is here, it is LOCKED.
> To change a decision, add a new entry with a date and rationale — don't edit the old one.
> Last updated: 2026-03-07

## Quick-Lookup Index

| ADR | Decision | Date | Category |
|-----|----------|------|----------|
| [ADR-001](#adr-001-monorepo-with-pnpm--turborepo) | Monorepo with pnpm + Turborepo | Jan 2026 | Infrastructure |
| [ADR-002](#adr-002-nestjs-modular-monolith-not-microservices) | NestJS Modular Monolith | Jan 2026 | Architecture |
| [ADR-003](#adr-003-postgresql--prisma-not-mongodb-or-other) | PostgreSQL + Prisma | Jan 2026 | Database |
| [ADR-004](#adr-004-nextjs-app-router-not-pages-router) | Next.js App Router | Jan 2026 | Frontend |
| [ADR-005](#adr-005-react-query-for-server-state-zustand-for-client-state) | React Query + Zustand | Jan 2026 | State Management |
| [ADR-006](#adr-006-jwt-in-httponly-cookies-not-localstorage) | JWT in HttpOnly Cookies | Jan 2026 | Security |
| [ADR-007](#adr-007-design-system--rabih-v1-approved-feb-12-2026) | Design System — Rabih V1 | Feb 2026 | Design |
| [ADR-008](#adr-008-shadcnui-as-primitive-layer) | shadcn/ui as Primitive Layer | Jan 2026 | Design |
| [ADR-009](#adr-009-multi-ai-development-team) | Multi-AI Development Team | Feb 2026 | Process |
| [ADR-010](#adr-010-dev_docs_v3-as-active-source-of-truth-mar-7-2026) | dev_docs_v3 as Source of Truth | Mar 2026 | Documentation |
| [ADR-011](#adr-011-socketio-for-real-time-communication) | Socket.io for Real-Time Communication | Mar 2026 | Infrastructure |
| [ADR-012](#adr-012-row-level-tenant-isolation-tenantid) | Row-Level Tenant Isolation (tenantId) | Mar 2026 | Security |
| [ADR-013](#adr-013-universal-soft-deletes-deletedat) | Universal Soft Deletes (deletedAt) | Mar 2026 | Database |
| [ADR-014](#adr-014-react-hook-form--zod-for-form-management) | React Hook Form + Zod | Mar 2026 | Frontend |
| [ADR-015](#adr-015-redis-for-queues-bullmq-and-cache) | Redis for Queues (BullMQ) and Cache | Mar 2026 | Infrastructure |
| [ADR-016](#adr-016-separate-portal-jwt-secrets) | Separate Portal JWT Secrets | Mar 2026 | Security |

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

---

## ADR-011: Socket.io for Real-Time Communication

**Date:** 2026-03-07
**Status:** LOCKED

**Decision:** Socket.io with Redis adapter for WebSocket communication across 4 namespaces (events, dispatch, tracking, notifications).

**Rationale:**
- NestJS first-class support via `@WebSocketGateway` — no external libraries needed
- Built-in room management for per-tenant and per-load channels
- Automatic reconnection with exponential backoff — critical for dispatch reliability
- Redis adapter enables horizontal scaling across multiple API instances
- Typed events via `socket-config.ts` prevent contract drift between frontend and backend

**Alternatives considered:**
- Server-Sent Events (SSE): rejected — simpler but no bidirectional communication (dispatch needs two-way)
- Raw WebSockets: rejected — no automatic reconnection, no room abstraction, manual protocol design
- Ably / Pusher: rejected — vendor lock-in, recurring cost, less control over event schema

**Note:** Frontend socket infrastructure already built (`socket-provider.tsx`, `socket-config.ts`). Backend gateways are QS-001.

**Do NOT change to:** raw WebSockets (loses reconnection/rooms), SSE (loses bidirectional), third-party realtime service (vendor lock-in)

---

## ADR-012: Row-Level Tenant Isolation (tenantId)

**Date:** 2026-03-07
**Status:** LOCKED

**Decision:** Every entity has a `tenantId` column. Application-level filtering via JWT-extracted tenantId in every query. No PostgreSQL RLS.

**Rationale:**
- Simplest pattern at current scale (<100 tenants) — no database-level complexity
- All services receive tenantId from `JwtAuthGuard` — consistent extraction point
- 801 `tenantId` references in `schema.prisma` confirm comprehensive coverage across 260 models
- RLS adds query planning overhead and debugging complexity that is not justified at this scale
- Application-level filtering is auditable — every query is visible in code

**Alternatives considered:**
- Schema-per-tenant: rejected — migration nightmare with 260 models (260 x N tenants = unmanageable)
- Database-per-tenant: rejected — connection pool explosion, operational overhead per tenant
- PostgreSQL RLS (Row-Level Security): rejected — debugging opacity, query planner overhead, Prisma compatibility concerns

**Future:** Add Prisma middleware for automatic `tenantId` injection when scale demands it.

**Do NOT change to:** schema-per-tenant or DB-per-tenant (breaking infrastructure change requiring full migration)

---

## ADR-013: Universal Soft Deletes (deletedAt)

**Date:** 2026-03-07
**Status:** LOCKED

**Decision:** 248 of 260 Prisma models have a `deletedAt` field. All queries MUST include `deletedAt: null`. The 12 models without it are log/audit tables where deletion is never appropriate.

**Rationale:**
- Regulatory compliance — 7-year freight record retention required by FMCSA and DOT
- Audit trail — every record's lifecycle is preserved for dispute resolution
- Customer data recovery — accidental deletions are reversible without backups
- Cascade safety — no orphaned records from hard deletes breaking relational integrity

**Alternatives considered:**
- Hard delete + audit log: rejected — loses relational integrity, audit log becomes disconnected from live data
- Event sourcing: rejected — massive complexity increase for a CRUD-dominant application

**Note:** QS-002 task addresses 5 models currently missing soft delete migration.

**Do NOT change to:** hard deletes (regulatory risk, data loss risk, cascade breakage)

---

## ADR-014: React Hook Form + Zod for Form Management

**Date:** 2026-03-07
**Status:** LOCKED

**Decision:** All forms use React Hook Form with `zodResolver`. Zod schemas define validation. No Formik, no Yup.

**Rationale:**
- Type inference from Zod schemas — one schema provides DTO + validation + TypeScript types (single source of truth)
- Better performance than Formik for large forms — Load Planner has 30+ fields and needs uncontrolled input performance
- Controlled vs uncontrolled flexibility — can optimize per field
- Smaller bundle size than Formik + Yup combination
- Zod schemas are reusable for API request validation (shared between frontend and backend)

**Alternatives considered:**
- Formik + Yup: rejected — slower re-renders on large forms, requires separate type definitions from validation
- Native form actions (React 19): rejected — insufficient validation capabilities for complex TMS forms
- TanStack Form: rejected — newer library with less ecosystem support and fewer examples at time of decision

**Do NOT change to:** Formik (performance regression on large forms), Yup (loses Zod type inference), no-library approach (loses validation consistency)

---

## ADR-015: Redis for Queues (BullMQ) and Cache

**Date:** 2026-03-07
**Status:** LOCKED

**Decision:** Single Redis 7 instance serves three purposes: BullMQ job queue, application cache, and Socket.io adapter.

**Rationale:**
- Already in `docker-compose.yml` stack — no additional infrastructure to provision
- BullMQ is production-proven for Node.js job queues (rate confirmation generation, email dispatch, report generation)
- Single Redis instance avoids infrastructure sprawl at current scale
- Key prefixing (`bull:`, `cache:`, `socket:`) prevents namespace collision between the three use cases

**Alternatives considered:**
- RabbitMQ: rejected — heavier operational overhead, separate infrastructure, AMQP protocol complexity
- AWS SQS: rejected — AWS vendor lock-in, not available in local Docker development
- Inngest: rejected — newer service with less control over retry policies and job scheduling

**Future:** Separate Redis instances if load exceeds single-instance capacity or if cache eviction policies conflict with queue durability requirements.

**Do NOT change to:** RabbitMQ (infrastructure sprawl), SQS (vendor lock-in), in-memory queues (no persistence, no horizontal scaling)

---

## ADR-016: Separate Portal JWT Secrets

**Date:** 2026-03-07
**Status:** LOCKED — per Tribunal verdict TRIBUNAL-06

**Decision:** Customer Portal and Carrier Portal each have their own JWT secret (`CUSTOMER_PORTAL_JWT_SECRET`, `CARRIER_PORTAL_JWT_SECRET`), separate from the main application JWT secret (`JWT_SECRET`). Three distinct token issuers, three distinct validation paths.

**Rationale:**
- **Blast radius containment:** Compromising one secret doesn't grant access to the other two authentication domains
- **Industry standard:** Enterprise SaaS platforms (Salesforce, HubSpot) use separate auth domains for internal users vs external portals
- **Scope isolation:** Portal tokens carry different claims (company-scope for customers, carrier-scope for carriers) — mixing secrets risks accidental cross-portal access
- **Token lifecycle independence:** Portal tokens can have different expiry policies (e.g., 30-day customer sessions vs 8-hour carrier sessions) without affecting internal user auth

**Architecture:**

- **Main App:** `JWT_SECRET` — internal users (dispatchers, admins, sales reps). Full access to all tenant data within role permissions.
- **Customer Portal:** `CUSTOMER_PORTAL_JWT_SECRET` — customer contacts. Scoped to their company's orders, loads, invoices, documents. Cannot see other customers' data.
- **Carrier Portal:** `CARRIER_PORTAL_JWT_SECRET` — carrier contacts. Scoped to their carrier's assigned loads, settlements, documents. Cannot see other carriers' data.

**Implementation pattern:** Thin-controller facade. Portal controllers reuse core service logic but apply scope guards:

```typescript
// Customer Portal controller reuses OrdersService
@UseGuards(CustomerPortalJwtGuard, CompanyScopeGuard)
@Get('orders')
findOrders(@CurrentCompany() companyId: string) {
  return this.ordersService.findByCustomer(companyId);
}
```

**Alternatives considered:**

- Single JWT secret for all three: rejected — one compromise exposes all authentication domains
- OAuth2 with separate identity providers: rejected — premature complexity for current scale
- Session-based auth for portals: rejected — stateless JWT is simpler for API-first architecture

**Do NOT change to:** single shared JWT secret (security regression), session-based portal auth (breaks API-first pattern)

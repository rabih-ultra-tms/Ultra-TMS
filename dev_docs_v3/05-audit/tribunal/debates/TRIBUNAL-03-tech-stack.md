# TRIBUNAL-03: Tech Stack Validation

> **Filed:** 2026-03-07
> **Presiding:** Architecture Review Board
> **Respondent:** Ultra TMS Engineering (AI agents)
> **Related ADRs:** ADR-003 (PostgreSQL + Prisma), ADR-004 (Next.js App Router), ADR-002 (NestJS Modular Monolith), ADR-015 (Redis)
> **Evidence:** `00-evidence-pack.md`, `01-competitor-matrix.md`, `decision-log.md`

---

## Charge

Ultra TMS runs Next.js 16 (App Router) + NestJS 10 + PostgreSQL 15 + Prisma 6 + Redis 7 + Elasticsearch 8.13. This is a modern, full-featured stack -- arguably the most modern in the TMS market. But for a pre-revenue product built entirely by AI agents, with zero production users and an 8.7% frontend test coverage rate, the question is whether this stack introduces unnecessary complexity. Would simpler tools have gotten the product to market faster?

---

## Prosecution (The Case Against)

### 1. Next.js App Router Adds Complexity With Zero SEO Benefit

Ultra TMS is a 100% authenticated dashboard application. Every page sits behind a login wall. There are no public-facing pages that require search engine indexing. The App Router's primary selling points -- React Server Components, streaming SSR, metadata API -- are designed for SEO-driven and content-heavy applications. For an auth-gated dashboard, these features add complexity (server/client component boundaries, `"use client"` directives, hydration bugs) without delivering value. A Vite + React Router SPA would eliminate this entire complexity layer while being faster to develop, faster to build, and faster at page transitions (no server round-trips for navigation).

ADR-004 claims SEO matters for a "customer-facing tracking page." That page does not exist. It is not in the P0 MVP scope. It is listed as a P2 feature (Customer Portal). The decision to use App Router was made for a page that may not ship for 6+ months.

### 2. Prisma 6 With 260 Models Creates Real Overhead

The `schema.prisma` file is 9,938 lines long. Prisma client generation must parse this entire schema and generate TypeScript types for 260 models and 114 enums. This affects:

- **Cold-start time:** Every `prisma generate` run and every CI build pays this cost. As models grow, generation time grows linearly.
- **Bundle size:** The generated Prisma client includes type definitions and runtime code for all 260 models, even if a given service only touches 5 of them.
- **IDE performance:** TypeScript language server must index 260 model types, slowing autocomplete and type-checking in large files.
- **Migration complexity:** 31 migrations and counting. Each new migration must account for 260 models' worth of foreign key relationships.

Drizzle ORM, which generates no client and uses SQL-like TypeScript directly, would eliminate the generation step entirely. For a schema this large, the difference is material.

### 3. Elasticsearch Is Imported But Unused at Current Scale

Elasticsearch 8.13 runs in `docker-compose.yml` alongside Kibana. It consumes ~1-2 GB of RAM on every developer machine and in every CI pipeline. Search functionality is a P2 feature. The load board (which would benefit most from full-text search) currently has 4 pages with basic filtering. PostgreSQL's built-in `tsvector` full-text search would handle the current and near-future search requirements without a dedicated search engine.

### 4. Redis Has Three Roles But Only One Is Active

ADR-015 defines three uses for Redis: BullMQ job queues, application cache, and Socket.io adapter. As of today:

- **BullMQ queues:** Used for rate confirmation generation and email dispatch. This is the only active use case.
- **Application cache:** No cache-aside or write-through patterns are implemented in any service module. Zero `cache:` prefixed keys in the codebase.
- **Socket.io adapter:** WebSocket gateways do not exist (0 `@WebSocketGateway` decorators in `apps/api/src/`). The Redis adapter has nothing to adapt.

Two-thirds of Redis's justification is vapor. BullMQ alone does not require a Redis instance in `docker-compose.yml` -- in-process queues (like `p-queue` or `fastq`) would suffice for a single-instance deployment.

### 5. NestJS Decorator Overhead Is Heavy for an AI-Built Product

NestJS uses decorators, dependency injection, class-validator DTOs, and a module/provider system inspired by Angular. This creates 309 DTO files, ~225 service classes, and ~187 controllers -- a massive surface area. For AI agents that generate code, the decorator-heavy pattern means more boilerplate per endpoint, more files to coordinate, and more places for inconsistencies.

A lighter alternative like Fastify + Zod (or even Hono + Zod) would produce the same API surface with fewer files, no DI container, and Zod schemas that serve as both validation and TypeScript types (eliminating the DTO layer entirely).

---

## Defense (The Case For)

### 1. Next.js App Router Delivers Real DX and Architectural Wins

The App Router's nested layout system is a genuine architectural advantage for a dashboard application. Ultra TMS has route groups (`(auth)`, `(dashboard)`) with shared layouts that handle authentication gates, sidebar rendering, and provider wrapping. Without nested layouts, every page would need to independently manage these concerns. The API proxy (`next.config.js` rewriting `/api/v1/*` to `localhost:3001`) eliminates CORS entirely in development and production -- a problem that plagues SPA + separate API architectures. The file-based routing with 98 routes is maintainable precisely because of App Router conventions.

Furthermore, React Server Components enable the future customer-facing tracking page (P2) and customer portal to be fast and SEO-friendly when built. Switching to a SPA now would mean switching back later.

### 2. Prisma Type Safety Has Prevented Dozens of Bugs

With 260 models and 801 `tenantId` references, type safety is not optional -- it is a survival mechanism. Every relation, every query, every include/select is type-checked at compile time. Raw SQL or Drizzle would require manual type definitions for every query result. In an AI-built codebase where two different AI agents write code, Prisma's generated types are the single most reliable contract between the database and application layers.

The migration system has produced 31 clean migrations. The schema is the source of truth for the entire data model. This is working as designed.

### 3. These Decisions Are LOCKED -- Changing Now Costs Months

ADR-003 (PostgreSQL + Prisma) and ADR-004 (Next.js App Router) are locked decisions. Migrating from Prisma to Drizzle would require rewriting every service method in 40 modules (~225 service classes). Migrating from Next.js App Router to Vite SPA would require rewriting the routing layer, layout system, and API proxy for 98 routes. Either migration would consume 4-8 weeks of development time -- time that should be spent fixing the 13 open quality sprint tasks and shipping the MVP.

The cost of the "wrong" stack choice has already been paid. The cost of switching is still ahead.

### 4. NestJS Modular Monolith Supports Future Extraction

ADR-002 chose a modular monolith specifically because the team is 2 developers (AI agents). The 40-module structure means each module (carrier, accounting, commission, etc.) is self-contained with its own controller, service, and DTOs. When the team grows, modules can be extracted to microservices using NestJS's built-in transport layer (TCP, NATS, gRPC). The DI container, while verbose, ensures every dependency is explicit and testable.

No competitor in Ultra TMS's market segment has this level of backend modularity. McLeod's monolithic C#/WinForms application and Aljex's legacy codebase demonstrate what happens without modular architecture.

### 5. The Stack Is the Most Modern in the TMS Market

The competitor matrix confirms it: Ultra TMS's stack is objectively the most modern in the entire TMS industry. McLeod runs WinForms/C#. Aljex has a 2010-era UI. Even Rose Rocket/TMS.ai, which rebranded as AI-native, runs older React/Node versions. This modernity translates to faster feature velocity, better developer tooling, and easier recruitment (when human developers join).

---

## Cross-Examination

| Question | Finding |
|----------|---------|
| What is Prisma client generation time for the 9,938-line schema? | Not benchmarked. Must be measured. If >10 seconds, it impacts DX and CI pipeline. |
| Does Next.js SSR actually slow down dashboard page transitions? | No evidence of SSR latency in dashboard navigation. Client-side navigation via `next/link` is SPA-like. Server components primarily affect initial page load, not transitions. |
| Is the frontend bundle bloated by unused framework features? | Not audited. `next/bundle-analyzer` should be run to identify dead code from RSC runtime, unused SSR machinery, and Elasticsearch client imports. |
| How much RAM does Elasticsearch consume in development? | ~1.5 GB default heap. This is 15-20% of a typical developer machine's available RAM, consumed by a feature that is P2. |
| Would Prisma Client Extensions reduce the "missed tenantId" risk enough to justify the schema size? | Yes. Tribunal Research Brief 3 (`03-multi-tenant-patterns.md`) recommends this as the highest-impact action (4-8 hours). The schema size is a sunk cost; the extension mitigates its risk. |
| How many `"use client"` directives exist in the codebase? | Not counted. A high count would indicate that most components are client-rendered anyway, weakening the RSC argument. |

---

## Evidence Exhibits

| ID | Evidence | Source | Relevance |
|----|----------|--------|-----------|
| E-01 | 260 Prisma models, 114 enums, 9,938 schema lines | `00-evidence-pack.md` | Prisma generation overhead |
| E-02 | 98 frontend routes, all behind auth | `00-evidence-pack.md` | SSR/SEO argument is moot for current scope |
| E-03 | 0 `@WebSocketGateway` files in backend | QS-001 task | Redis Socket.io adapter is unused |
| E-04 | 0 cache-aside implementations in any module | Code search | Redis cache role is unused |
| E-05 | ADR-003, ADR-004 status: LOCKED | `decision-log.md` | Migration cost would be prohibitive |
| E-06 | Competitor stacks: McLeod (WinForms/C#), Aljex (legacy), Rose Rocket (older React/Node) | `01-competitor-matrix.md` | Ultra TMS has the most modern stack in market |
| E-07 | Docker-compose includes Elasticsearch + Kibana | `docker-compose.yml` | ~1.5 GB RAM consumed for P2 feature |
| E-08 | 309 DTOs, ~225 services, ~187 controllers | `00-evidence-pack.md` | NestJS boilerplate surface area |
| E-09 | BullMQ is the only active Redis consumer | Code search | 2 of 3 Redis roles are inactive |
| E-10 | ADR-004 cites SEO for customer tracking page | `decision-log.md` | That page is P2, not P0 MVP |

---

## Verdict: AFFIRM WITH NOTES

**The stack is correct. Do not change it.**

ADR-003 (PostgreSQL + Prisma) and ADR-004 (Next.js App Router) are validated. The type safety, modularity, and modern tooling justify the complexity. The cost of switching exceeds the cost of the current overhead. No competitor in Ultra TMS's market segment has a more capable foundation.

However, the stack carries dead weight that should be addressed:

1. **Elasticsearch is unjustified at P0.** Remove it from `docker-compose.yml` for development. Re-add when search features reach implementation (P2). Developers should not pay 1.5 GB of RAM for a feature that does not exist.

2. **Redis cache and Socket.io adapter roles are vapor.** Acceptable because the infrastructure cost is negligible (Redis is already running for BullMQ), but these roles should not be cited as justification for Redis until they are implemented.

3. **Prisma generation time must be benchmarked.** If `prisma generate` exceeds 10 seconds, investigate Prisma's `--no-engine` flag or schema splitting strategies. The 9,938-line schema will only grow.

4. **Bundle analysis is overdue.** Run `next/bundle-analyzer` to identify unused SSR machinery, RSC runtime overhead, and dead imports. An auth-gated dashboard should not ship framework code designed for public pages.

5. **Count `"use client"` directives.** If >80% of components are client-rendered, the RSC complexity is paying for nothing. Document the ratio and revisit if the number is extreme.

---

## Action Items

| # | Action | Priority | Effort | Owner |
|---|--------|----------|--------|-------|
| 1 | Remove Elasticsearch + Kibana from dev `docker-compose.yml` | P1 | 30 min | Next session |
| 2 | Benchmark `prisma generate` time; log in STATUS.md | P2 | 15 min | Next session |
| 3 | Run `next/bundle-analyzer`; document top 10 largest chunks | P2 | 1 hour | Backlog |
| 4 | Count `"use client"` directives across `apps/web/` | P3 | 15 min | Backlog |
| 5 | Implement Prisma Client Extension for auto tenantId (per Research Brief 3) | P1 | 4-8 hours | QS task |

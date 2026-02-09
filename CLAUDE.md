# Ultra TMS - 3PL Logistics Platform

> **Multi-AI Project:** This project supports multiple AI tools (Claude Code, Gemini, Codex, Copilot).
> If you're NOT using Claude Code, read `AGENTS.md` instead — it's the universal entry point.
> If you ARE using Claude Code, this file auto-loads — continue below.

**Monorepo:** Next.js 16 + React 19 + NestJS 10 + PostgreSQL + Prisma 6 + Redis + Elasticsearch
**Architecture:** Migration-first, multi-tenant, modular monolith (40 modules)
**Repo:** `rabih-ultra-tms/Ultra-TMS` | Contributor: `primovera12`
**MVP Focus:** 8 services, ~30 screens, 16-week timeline (not 38 services / 362 screens)

## Current State (as of 2026-02-08)

**Overall Score: 6.2/10 (C+)** — Strong foundation, excellent documentation, weak execution.

| Area | Grade | Status |
|------|-------|--------|
| Architecture & Infra | B+ | Solid monorepo, modern stack, well-structured modules |
| Code Quality | C+ | 29 bugs (4 critical), 858-line monoliths, 8.7% frontend test coverage |
| Design Quality | D+ | Great docs but implementation uses hardcoded colors, browser confirm(), bare "Loading..." |
| Planning & Docs | A | 504 doc files, 89 screen specs with 15-section detail |
| Industry Readiness | D | 28 feature gaps vs competitors. TMS Core frontend not wired up |

**What works:** Auth, CRM (basic CRUD), Sales (basic CRUD), Carrier list (buggy)
**What exists but is disconnected from frontend:** LoadsService (19KB), OrdersService (22KB), RateConfirmationService, Check Calls, dispatch/assignCarrier logic — **do NOT rebuild these, wire them up**
**What's not built:** TMS Core frontend pages, Dispatch Board, Accounting, Operations dashboards

Reviews: `dev_docs/Claude-review-v1/` (37 files) | `dev_docs/gemini-review-v2/` (2 files — corrects Claude's backend assessment)

## UI Strategy: Rebuild from Design Specs

**All frontend screens are being rebuilt from the 89 design specs.** Existing UI code is reference only (for API call patterns), not code to patch.

**PROTECT LIST — Do NOT rebuild these pages (they work):**
- **Load Planner** (`/load-planner/[id]/edit`) — 1,825 LOC, AI cargo extraction, Google Maps, full quote lifecycle. Production-ready.
- **Truck Types** (`/truck-types`) — 8/10 quality, clean CRUD with inline editing. Gold standard.
- **Login** (`/login`) — 8/10 quality, working auth flow.

**ALWAYS fix regardless of rebuild:**
- Security bugs (JWT console logs, localStorage tokens) — apply to shared code, not page-specific
- Sidebar 404 links — navigation config, not page code

**For every other screen:** Build fresh from design spec. Don't patch old code.

## P0 MVP Scope

**Only these 8 services are in scope for the 16-week MVP:**

| # | Service | Status | Priority |
|---|---------|--------|----------|
| 1 | Auth & Admin | Existing UI | Rebuild from spec |
| 2 | CRM / Customers | Existing UI | Rebuild from spec |
| 3 | Sales / Quotes + Load Planner | Load Planner works, quotes basic | Rebuild quotes, PROTECT Load Planner |
| 4 | TMS Core (Orders, Loads, Dispatch) | Backend exists, no frontend | Build from spec |
| 5 | Carrier Management | Existing UI (buggy, 404s) | Rebuild from spec, PROTECT Truck Types |
| 6 | Accounting (Invoices, Settlements) | Not built | Build from spec |
| 7 | Load Board | Not built | Build from spec |
| 8 | Commission | Not built | Build from spec |

All other services (Compliance, Safety, Fleet, Warehousing, etc.) are **future — do not build**.

**16-week phases:** See `dev_docs/Claude-review-v1/00-executive-summary/prioritized-action-plan.md`

## Known Critical Issues

**Must fix before building new features:**

| Bug | File | Impact |
|-----|------|--------|
| Carrier detail 404 | `carriers/page.tsx` → no `carriers/[id]/page.tsx` | Core CRUD broken |
| Load history detail 404 | `load-history/page.tsx` → no `load-history/[id]/page.tsx` | Core CRUD broken |
| 5 sidebar links to 404 | `lib/config/navigation.ts` → invoices, settlements, reports, help, settings | Broken navigation |
| `useMemo` side effect | `truck-types/page.tsx:270` | Form data won't populate in React 19 |
| JWT logged to console | `admin/layout.tsx` (10 console.logs) | Security vulnerability |
| localStorage tokens | `lib/api/client.ts:59,77` | Contradicts XSS-safe cookie policy |
| `window.confirm()` x7 | carriers, load-history, quote-history, truck-types | Should use ConfirmDialog |
| No search debounce x3 | carriers, load-history, quote-history | API hammered on every keystroke |

Full inventory: `dev_docs/Claude-review-v1/01-code-review/05-bug-inventory.md` (29 bugs total)

## Starting Any Work Session

1. **Read the service hub file** → `dev_docs_v2/03-services/{service}.md` — single source of truth (status, screens, API, components, bugs, tasks, design links)
2. Read `dev_docs_v2/STATUS.md` → find your specific task and check assignments
3. Read the task file in `dev_docs_v2/01-tasks/{current-phase}/` → detailed acceptance criteria
4. Maximum 6 files before coding — see `dev_docs_v2/00-foundations/session-kickoff.md`

**Hub files (source of truth):** `dev_docs_v2/03-services/` — one file per MVP service with everything consolidated.
**Execution layer:** `dev_docs_v2/` has bite-size tasks, audit results, design tokens, and quality gates.
**Spec layer:** `dev_docs/` has design specs, dev prompts, service definitions, and reviews.

## Before Building: Discovery Checklist

Before starting any feature, verify:

1. **Read the service hub file** in `dev_docs_v2/03-services/` — has screens, API, components, bugs, tasks, and design links all in one place.
2. **Check dev_docs_v2/STATUS.md** — Is there already a task file for this work? Use it.
3. **Does the backend already exist?** Search `apps/api/src/modules/` for existing services — LoadsService, OrdersService, RateConfirmationService, etc. are already implemented. Don't rebuild.
4. **Is there a design spec?** Check `dev_docs/12-Rabih-design-Process/` for the screen's 15-section spec file
5. **What's the screen priority?** Check `dev_docs/Claude-review-v1/04-screen-integration/03-screen-priority-matrix.md`
6. **Read the quality gates:** `dev_docs_v2/00-foundations/quality-gates.md` (quick ref) or `dev_docs/Claude-review-v1/03-design-strategy/05-quality-gates.md` (full)
7. **Read the design-to-code workflow:** `dev_docs/Claude-review-v1/04-screen-integration/01-design-to-code-workflow.md`

## Essential Reading Order

Pick the list that matches your task:

**Fixing bugs:**
1. `dev_docs/Claude-review-v1/01-code-review/05-bug-inventory.md` — All 29 bugs with file paths and line numbers

**Building a new screen:**
1. Design spec in `dev_docs/12-Rabih-design-Process/{service-folder}/{screen}.md`
2. `dev_docs/08-standards/74-pre-feature-checklist.md`
3. `dev_docs/Claude-review-v1/04-screen-integration/01-design-to-code-workflow.md`
4. `dev_docs/Claude-review-v1/03-design-strategy/05-quality-gates.md`

**Refactoring existing pages:**
1. `dev_docs/Claude-review-v1/03-design-strategy/01-current-state-diagnosis.md` — Root cause analysis
2. `dev_docs/Claude-review-v1/03-design-strategy/02-design-system-enforcement.md` — Token system, ESLint rules

**Understanding scope & priorities:**
1. `dev_docs/Claude-review-v1/02-plan-review/03-mvp-reprioritization.md` — P0/P1/P2/P3 tiers
2. `dev_docs/Claude-review-v1/00-executive-summary/prioritized-action-plan.md` — 16-week plan

## Commands

```bash
# Development
pnpm dev                          # Start all (web:3000, api:3001)
docker-compose up -d              # Start infra (PostgreSQL, Redis, ES, Kibana)

# Build & Verify
pnpm build                        # Build all apps
pnpm check-types                  # TypeScript check (strict mode)
pnpm lint                         # ESLint across monorepo
pnpm format                       # Prettier format

# Database (run from root)
pnpm --filter api prisma:generate # Generate Prisma client
pnpm --filter api prisma:migrate  # Run migrations
pnpm --filter api prisma:studio   # Open Prisma Studio
pnpm --filter api prisma:seed     # Seed database

# Testing
pnpm --filter web test            # Web: Jest 30 + Testing Library + MSW
pnpm --filter web test:watch      # Web: watch mode
pnpm --filter web test:coverage   # Web: coverage report
pnpm --filter api test            # API: Jest 29 + Supertest
pnpm --filter api test:unit       # API: unit tests only
pnpm --filter api test:e2e        # API: e2e tests only
```

## Architecture

```
apps/
  web/          Next.js 16 (App Router) - port 3000
    app/
      (auth)/         Public pages (login, register, verify-email)
      (dashboard)/    Protected pages (all TMS screens)
    components/ui/    shadcn/ui components
    lib/              API client, hooks, utilities
  api/          NestJS 10 - port 3001, prefix /api/v1
    src/modules/      40 service modules (auth, crm, sales, tms, carrier...)
    prisma/           schema.prisma + migrations + seed
  docs/         Documentation app
packages/
  ui/                 Shared React components (@repo/ui)
  eslint-config/      Shared ESLint config (@repo/eslint-config)
  typescript-config/  Shared TS config (@repo/typescript-config)
```

**Path aliases:** `@/*` (web root), `@repo/ui` (shared UI package)
**State:** React Query (server state) + Zustand (client state)
**Forms:** React Hook Form + Zod validation
**API proxy:** Frontend `/api/v1/*` rewrites to `localhost:3001/api/v1/*` (see `apps/web/next.config.js`)

## The 5 Golden Rules

1. **Every interactive element MUST work** - No buttons without `onClick`, no links without `href`, no empty handlers, no TODO placeholders
2. **API contracts before code** - Define request/response format before building. Document in contract registry
3. **Screen -> API -> Database traceability** - Every screen maps to endpoints, every endpoint maps to database operations
4. **Type safety is mandatory** - No `any` types. Types must match runtime data. API response types must match actual returns
5. **Verify before shipping** - All buttons work, all API calls succeed, loading/error/empty states handled, console clean

## Code Conventions

### API Response Format (mandatory)

```typescript
// Single item
{ data: T, message?: string }

// List with pagination
{ data: T[], pagination: { page: number, limit: number, total: number, totalPages: number } }

// Error
{ error: string, code: string, details?: object }
```

### Auth Guards (mandatory on all endpoints except /health)

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.DISPATCHER)
```

### Multi-Tenant Queries (mandatory)

```typescript
// ALWAYS filter by tenantId + soft delete
await prisma.carrier.findMany({
  where: { tenantId, deletedAt: null }
});
```

### Migration-First Fields (on all entities)

Every entity includes: `external_id`, `source_system`, `custom_fields`, `tenant_id`

### Validation Pipe (global in main.ts)

`whitelist: true, transform: true, forbidNonWhitelisted: true` - DTOs strip unknown fields automatically

## Key Files

| File | Purpose |
|------|---------|
| `turbo.json` | Monorepo task pipeline |
| `pnpm-workspace.yaml` | Workspace definition |
| `docker-compose.yml` | PostgreSQL 15, Redis 7, ES 8.13, Kibana |
| `apps/api/src/main.ts` | API bootstrap (guards, CORS, validation, Swagger) |
| `apps/api/prisma/schema.prisma` | Database schema (source of truth) |
| `apps/web/next.config.js` | API proxy rewrite rules |
| `apps/web/app/layout.tsx` | Root layout with providers |
| `dev_docs/00-master/00-master-development-guide.md` | Master development reference |
| `dev_docs/08-standards/65-development-standards-overview.md` | Golden rules + standards index |
| `dev_docs/12-Rabih-design-Process/` | 89 screen specs with full UX/UI details |

## Environment

**Required:** `DATABASE_URL`, `JWT_SECRET`, `REDIS_URL`
**Portal auth:** `CUSTOMER_PORTAL_JWT_SECRET`, `CARRIER_PORTAL_JWT_SECRET`
**Optional:** `SENDGRID_API_KEY`, `TWILIO_ACCOUNT_SID`
**Docker defaults:** DB_USER=postgres, DB_PASSWORD=postgres, DB_NAME=ultra_tms, REDIS_PASSWORD=redis_password

## Design System

- **Style:** Modern SaaS (Linear.app aesthetic) - dark slate-900 sidebar, white content, blue-600 primary
- **Components:** shadcn/ui (Radix UI + Tailwind 4) in `apps/web/components/ui/`
- **Icons:** Lucide React
- **Status colors:** See `dev_docs/12-Rabih-design-Process/00-global/03-status-color-system.md`

## Plugin Workflow

13 plugins installed. Use them in this order during development:

| Stage | Plugin | Command |
|-------|--------|---------|
| Plan | superpowers | `/brainstorming`, `/writing-plans` |
| Research | context7 | Auto - queries library docs (Next.js, Prisma, NestJS) |
| Build | feature-dev | `/feature-dev [description]` - 7-phase guided development |
| Design | frontend-design | `/frontend-design` - production-grade UI from screen specs |
| Test | playwright | Browser automation for E2E visual testing |
| Review | pr-review-toolkit | `/review-pr` - multi-agent code review |
| Review | code-review | `/code-review` - quick standalone review |
| Commit | commit-commands | `/commit`, `/commit-push-pr` |
| Maintain | claude-md-management | `/revise-claude-md`, `/claude-md-improver` |

## Gotchas

1. **Always filter `tenantId`** - Queries without it leak data across tenants
2. **Always check `deletedAt: null`** - Soft deletes are used everywhere
3. **API proxy** - Frontend calls `/api/v1/*`, Next.js rewrites to `:3001`. Don't call `:3001` directly from client
4. **TypeScript strict mode** - `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are enabled
5. **No `src/` in web app** - Files live in `app/`, `components/`, `lib/` directly
6. **`pnpm --filter`** - Use `pnpm --filter api` or `pnpm --filter web` for app-specific commands
7. **Work log** - Update `dev_docs/weekly-reports/work-log.md` after every session (use `/log`)
8. **Swagger** - Available at `localhost:3001/api-docs` when API is running
9. **ValidationPipe strips unknowns** - Only DTO-declared fields pass through
10. **CORS** - Only `localhost:3000` and `localhost:3002` are allowed origins

## Before Any Feature

Read these docs in order:
1. `dev_docs/08-standards/74-pre-feature-checklist.md` - What to verify
2. `dev_docs/08-standards/65-development-standards-overview.md` - Golden rules
3. Relevant standard: API (`66`), Database (`67`), Frontend (`68`), UI (`69`), Types (`70`)

After implementation: all interactive elements work, API calls succeed, loading/error/empty states handled, console clean, work log updated.

# Ultra TMS - AI Agent Guide

> **What is this?** Universal entry point for any AI coding assistant (Codex, Gemini, Copilot, Claude, Cursor, etc.)
> Auto-loads in OpenAI Codex. For other tools: read this file first at the start of every session.
> For deeper project details, read `CLAUDE.md` (works for any AI despite the name).

---

## Project Overview

**Ultra TMS** is a 3PL logistics management platform (Transportation Management System).

- **Monorepo:** `apps/web` (Next.js 16 + React 19) + `apps/api` (NestJS 10) + PostgreSQL/Prisma 6
- **Stack:** Tailwind 4, shadcn/ui, React Query, Zustand, React Hook Form + Zod
- **Repo:** `rabih-ultra-tms/Ultra-TMS` on GitHub
- **MVP Scope:** 8 services, ~30 screens, 16-week sprint
- **Current Phase:** Phase 0 — Emergency Fixes (Week 1)
- **Overall Score:** C+ (6.4/10), targeting B+ (8/10) by Week 16
- **Team:** 2 developers using different AI tools

### What Works

- Auth, CRM (basic CRUD), Sales (basic CRUD), Carrier list (buggy)
- Backend services are **production-ready** (LoadsService 19KB, OrdersService 22KB, 150+ endpoints)

### What Needs Building

- TMS Core frontend pages, Dispatch Board, Accounting, Operations dashboards
- All frontend screens are being **rebuilt from 89 design specs** — don't patch old code

---

## Essential Commands

```bash
# Development
pnpm dev                          # Start all (web:3000, api:3001)
docker-compose up -d              # Start infra (PostgreSQL, Redis, ES, Kibana)

# Verify (MUST pass before every commit)
pnpm check-types                  # TypeScript strict mode
pnpm lint                         # ESLint across monorepo

# Build (must pass before PR)
pnpm build                        # Build all apps

# Database
pnpm --filter api prisma:generate # Generate Prisma client
pnpm --filter api prisma:migrate  # Run migrations
pnpm --filter api prisma:studio   # Open Prisma Studio

# Testing
pnpm --filter web test            # Frontend: Jest 30 + Testing Library
pnpm --filter api test            # Backend: Jest 29 + Supertest
```

---

## Quick Start (Your First 2 Minutes)

1. **Read this file completely** (you are here)
2. **Read `dev_docs_v2/STATUS.md`** — find an unclaimed task in the current phase
3. **Claim the task** (see Task Protocol below)
4. **Read the task file** in `dev_docs_v2/01-tasks/{phase}/` — it has acceptance criteria and a Context Header
5. **Follow the Context Header** — it lists exactly which files to read (max 6 total)
6. **Start coding**

---

## Project Architecture

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
packages/
  ui/                 Shared React components (@repo/ui)
  eslint-config/      Shared ESLint config
  typescript-config/  Shared TS config
```

**Path aliases:** `@/*` (web root), `@repo/ui` (shared UI)
**API proxy:** Frontend `/api/v1/*` rewrites to `localhost:3001/api/v1/*` (see `apps/web/next.config.js`)
**Swagger:** Available at `localhost:3001/api-docs` when API is running

---

## Golden Rules

1. **Backend exists and works — WIRE UP, don't rebuild.** Search `apps/api/src/modules/` before building anything. LoadsService, OrdersService, RateConfirmationService, Check Calls, dispatch/assignCarrier are all implemented.
2. **Max 6 files before coding.** Task files list exactly which ones via Context Headers. If a file isn't listed, you don't need it.
3. **No `any` types.** TypeScript strict mode is enforced (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
4. **No hardcoded colors.** Use semantic Tailwind classes (see design tokens in `dev_docs_v2/00-foundations/design-system.md`).
5. **No `console.log` in committed code.**
6. **Multi-tenant: always filter by `tenantId`.** Queries without it leak data across tenants.
7. **Soft deletes: always filter `deletedAt: null`.** Never hard-delete records.
8. **Every button must work.** No empty `onClick`, no `href="#"`, no TODO placeholders.
9. **4 states on every page:** Loading (skeleton), Error (with retry), Empty (with CTA), Success (with data).
10. **Destructive actions use `ConfirmDialog`**, never `window.confirm()`.

### PROTECT LIST — Do NOT Touch These Pages

- **Load Planner** (`/load-planner/[id]/edit`) — 1,825 LOC, AI cargo extraction, Google Maps. Production-ready.
- **Truck Types** (`/truck-types`) — 8/10 quality, clean CRUD with inline editing. Gold standard.
- **Login** (`/login`) — 8/10 quality, working auth flow.

---

## Documentation Map

All project docs are in two layers:

### Execution Layer: `dev_docs_v2/` (read this)

| Folder | Contents |
|--------|----------|
| `STATUS.md` | Task dashboard — find your task here |
| `00-foundations/` | Session kickoff guide, design system tokens, quality gates |
| `01-tasks/` | 65 bite-size task files organized by phase |
| `02-components/_index.md` | 117 components cataloged |
| `03-services/` | **8 hub files** — one per MVP service, single source of truth |
| `04-audit/` | 6 audit reports from live code analysis |
| `05-references/` | Developer reference docs |

### Spec Layer: `dev_docs/` (go deeper when needed)

| Folder | Contents |
|--------|----------|
| `12-Rabih-design-Process/` | 89 screen specs with 15-section detail (wireframes, data fields, components) |
| `11-ai-dev/` | AI-optimized dev prompts for API and web development |
| `09-contracts/` | Screen-API contract registry |
| `Claude-review-v1/` | 37-file code audit with specific findings |
| `weekly-reports/` | Work log and weekly HTML reports |

### Service Hub Files (Start Here for Any Service)

Each hub file in `dev_docs_v2/03-services/` consolidates everything about a service:

| Service | Hub File | Backend Status | Frontend Status |
|---------|----------|---------------|-----------------|
| Auth & Admin | `01-auth-admin.md` | Working | Rebuild from spec |
| Dashboard | `01.1-dashboard-shell.md` | Working | Rebuild from spec |
| CRM | `02-crm.md` | Working | Rebuild from spec |
| Sales | `03-sales.md` | Working | Rebuild (PROTECT Load Planner) |
| TMS Core | `04-tms-core.md` | Production (65 endpoints) | Not built |
| Carrier | `05-carrier.md` | Working (40 endpoints) | Rebuild (PROTECT Truck Types) |
| Accounting | `06-accounting.md` | Production (~53 endpoints) | Not built |
| Load Board | `07-load-board.md` | Production (~25 endpoints) | Not built |
| Commission | `08-commission.md` | Production (~19 endpoints) | Not built |

---

## Code Conventions

### API Response Format

```typescript
// Single item
{ data: T, message?: string }

// List with pagination
{ data: T[], pagination: { page: number, limit: number, total: number, totalPages: number } }

// Error
{ error: string, code: string, details?: object }
```

### Auth Guards (mandatory on all endpoints)

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.DISPATCHER)
```

### Multi-Tenant Queries

```typescript
await prisma.carrier.findMany({
  where: { tenantId, deletedAt: null }  // ALWAYS both
});
```

### Design System

- **Style:** Modern SaaS (Linear.app aesthetic) — dark slate-900 sidebar, white content, blue-600 primary
- **Components:** shadcn/ui (Radix UI + Tailwind 4) in `apps/web/components/ui/`
- **Icons:** Lucide React only
- **Status colors:** 8 semantic families (emerald=success, amber=warning, red=danger, blue=info, gray=neutral, indigo=in-progress, violet=queued, cyan=special)
- **Full reference:** `dev_docs_v2/00-foundations/design-system.md`

---

## Task Protocol (2 Developers)

### Before Starting

1. `git pull origin main` — get latest changes
2. Read `dev_docs_v2/STATUS.md` — find an unclaimed task (Assigned = "—")
3. Write your name in the "Assigned" column, change status to `IN PROGRESS`
4. **Commit and push the claim immediately:**
   ```bash
   git add dev_docs_v2/STATUS.md && git commit -m "task: claim TASK-ID" && git push
   ```
5. If a task is already assigned to someone else — pick a different task
6. Read the task file in `dev_docs_v2/01-tasks/{phase}/`

### While Working

- Follow the task file's Context Header (max 6 files to read)
- Follow the acceptance criteria checklist
- If blocked: change status to `BLOCKED`, add a note in the task file

### After Completing

1. Mark task `DONE` in STATUS.md, add today's date in "Updated" column
2. Run `pnpm check-types && pnpm lint` (must pass)
3. Add entry to `dev_docs/weekly-reports/work-log.md` (see `WORKFLOWS.md` for template)
4. Add any non-obvious discoveries to `LEARNINGS.md`
5. Commit with conventional format: `feat:`, `fix:`, `docs:`, `refactor:`
6. Push to remote

---

## Session End Checklist

Before ending any coding session:

- [ ] STATUS.md updated (task marked DONE or progress noted)
- [ ] `pnpm check-types` passes
- [ ] `pnpm lint` passes
- [ ] No `console.log` in your changes
- [ ] No `any` types in your changes
- [ ] Work logged in `dev_docs/weekly-reports/work-log.md`
- [ ] Discoveries added to `LEARNINGS.md` (if any)
- [ ] Changes committed and pushed

---

## Environment

**Required env vars:** `DATABASE_URL`, `JWT_SECRET`, `REDIS_URL`
**Docker defaults:** DB_USER=postgres, DB_PASSWORD=postgres, DB_NAME=ultra_tms
**CORS:** Only `localhost:3000` and `localhost:3002` allowed

---

## For More Detail

| Topic | File |
|-------|------|
| Full project context | `CLAUDE.md` (works for any AI) |
| Manual workflow commands | `WORKFLOWS.md` |
| Component/design decisions without MCP | `dev_docs_v2/00-foundations/design-toolkit-guide.md` |
| Shared knowledge base | `LEARNINGS.md` |
| Quality gate checklists | `dev_docs_v2/00-foundations/quality-gates.md` |
| Design system tokens | `dev_docs_v2/00-foundations/design-system.md` |
| Session kickoff guide | `dev_docs_v2/00-foundations/session-kickoff.md` |

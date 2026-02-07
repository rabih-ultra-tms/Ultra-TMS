# Ultra TMS - 3PL Logistics Platform

**Monorepo:** Next.js 16 + React 19 + NestJS 10 + PostgreSQL + Prisma 6 + Redis + Elasticsearch
**Architecture:** Migration-first, multi-tenant, modular monolith (40 modules, 362+ screens planned)
**Repo:** `rabih-ultra-tms/Ultra-TMS` | Contributor: `primovera12`

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

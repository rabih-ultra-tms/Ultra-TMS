# Project Brief — Ultra TMS

> **Status:** Active development (mid-build, not greenfield)
> **Last Updated:** 2026-03-07
> **Source of truth:** This file (dev_docs_v3/)

---

## CONFIG Block

```
PROJECT_NAME=Ultra TMS
PROJECT_SLUG=ultra-tms
GITHUB_ORG=rabih-ultra-tms
GITHUB_REPO=Ultra-TMS
CONTRIBUTOR=primovera12

FRONTEND_FRAMEWORK=Next.js 16 (App Router)
BACKEND_FRAMEWORK=NestJS 10
DATABASE=PostgreSQL 15
ORM=Prisma 6
CACHE=Redis 7
SEARCH=Elasticsearch 8.13
UI_LIBRARY=shadcn/ui (Radix UI + Tailwind 4)
STATE_MANAGEMENT=React Query (server) + Zustand (client)
FORMS=React Hook Form + Zod
ICONS=Lucide React

FRONTEND_PORT=3000
BACKEND_PORT=3001
DB_PORT=5432
REDIS_PORT=6379
ES_PORT=9200
KIBANA_PORT=5601

FRONTEND_APP_PATH=apps/web
BACKEND_APP_PATH=apps/api
COMPONENT_LIBRARY_PATH=apps/web/components
BACKEND_SRC=apps/api/src
PRISMA_SCHEMA=apps/api/prisma/schema.prisma

API_STYLE=REST
API_PREFIX=/api/v1
API_ENVELOPE_DATA_KEY=data
API_PAGINATION_KEY=pagination
API_URL_DEFAULT=http://localhost:3001

PKG_MANAGER=pnpm
BUILD_CMD=pnpm build
TEST_CMD_FRONTEND=pnpm --filter web test
TEST_CMD_BACKEND=pnpm --filter api test
LINT_CMD=pnpm lint
TYPECHECK_CMD=pnpm check-types
FORMAT_CMD=pnpm format

AUTH_STRATEGY=JWT (HttpOnly cookies)
AUTH_LIBRARY=@nestjs/jwt + Passport
ROLES_LIST=SUPER_ADMIN,ADMIN,DISPATCHER,ACCOUNTING,MANAGER,DRIVER,CARRIER_AGENT,CUSTOMER_REP
MULTI_TENANT=true (row-level tenantId isolation)

TEAM_SIZE=2
DEV_1=Claude Code (complex features, audits, architecture)
DEV_2=Gemini/Codex (CRUD screens, patterns, tests)
WEEKLY_CAPACITY=30h (2 devs × 15h/week)

MVP_SERVICE_COUNT=9
TOTAL_SERVICES=38
TOTAL_ROUTES=96
TOTAL_COMPONENTS=318
TOTAL_MODELS=260
TOTAL_CONTROLLERS=223
TOTAL_BACKEND_MODULES=42

SWAGGER_URL=http://localhost:3001/api-docs
STORYBOOK_PORT=6006
```

---

## Project Identity

**Ultra TMS** is a multi-tenant 3PL (Third-Party Logistics) Transportation Management System built as a SaaS platform. It enables freight brokers and logistics companies to manage:
- Customer relationships (CRM)
- Load and order lifecycle (create → dispatch → deliver → invoice)
- Carrier management (qualifications, rates, performance)
- Financial operations (invoices, settlements, commissions, accounting)
- Compliance and safety (safety scores, document management)
- Real-time dispatch and tracking (WebSockets)

**Target users:** Freight brokers, 3PL operators, dispatchers, accounting teams, carrier partners, shipping customers.

**Business model:** Multi-tenant SaaS — each company (tenant) has isolated data, their own users, carriers, customers, and loads.

---

## Scope Definition

### What's Built (mid-project state as of 2026-03-07)

| Layer | Count | Quality |
|---|---|---|
| Backend modules | 42 (39 active) | B+ (strong, mostly working) |
| API controllers | 223 | Mixed (Production + Stubs) |
| Prisma models | 260 | B+ (complete, well-structured) |
| Frontend routes | 96 | C (many untested/unverified) |
| React components | 318 | C+ (69% good, 31% needs work) |

### What's NOT Built Yet

- Real-time WebSocket features (dispatch board, tracking, notifications)
- Several backend endpoints called by frontend (CSA scores, accounting dashboard)
- Several frontend screens (Load Board pages, Customer Portal, Carrier Portal)
- CI/CD pipeline (no GitHub Actions)
- Structured logging / observability (Pino, Sentry)
- Comprehensive test coverage (72 tests, only carrier fully tested)

---

## Feasibility Math

**Current capacity:** 2 developers × 15h/week = 30h/week

Quality sprint (4 weeks): 120h → fix what's broken, verify all routes
P1 post-MVP features (8 weeks): 240h → Claims, Documents, Communication, Portals, Contracts
P2 extended (12 weeks): 360h → Agents, Credit, Factoring, Analytics, Workflow, Integration, Search

**Rule:** Ship Quality Sprint → verify all 96 routes work → then build P1 features. Do not add P1 features until P0 quality is confirmed.

---

## Tech Stack Decisions (locked — see decision-log.md for rationale)

| Decision | Choice | Status |
|---|---|---|
| Monorepo | pnpm + Turborepo | DONE — not changing |
| Frontend | Next.js 16 App Router | DONE — not changing |
| Backend | NestJS 10 modular monolith | DONE — not changing |
| Database | PostgreSQL + Prisma | DONE — not changing |
| Auth | JWT HttpOnly cookies + RBAC | DONE — P0 security fixes applied |
| Design | Rabih V1 (navy accent, Inter, warm borders) | APPROVED by stakeholder |
| State | React Query + Zustand | DONE — not changing |
| Forms | RHF + Zod | DONE — not changing |
| Multi-tenant | Row-level tenantId | DONE — not changing |

---

## Environment Variables Required

```bash
# Required
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ultra_tms
JWT_SECRET=<your-secret>
REDIS_URL=redis://:redis_password@localhost:6379

# Portal auth
CUSTOMER_PORTAL_JWT_SECRET=<secret>
CARRIER_PORTAL_JWT_SECRET=<secret>

# Optional (for integrations)
SENDGRID_API_KEY=<key>
TWILIO_ACCOUNT_SID=<sid>
TWILIO_AUTH_TOKEN=<token>
CORS_ORIGIN=http://localhost:3000

# Docker defaults
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ultra_tms
REDIS_PASSWORD=redis_password
```

# Where Things Live — Ultra TMS Quick Reference

> The "where is X?" lookup guide.
> Last updated: 2026-03-07

---

## Planning Docs

| What | Where |
|------|-------|
| Current task dashboard | `dev_docs_v3/STATUS.md` |
| Active sprint tasks | `dev_docs_v3/03-tasks/sprint-quality/` |
| Backlog | `dev_docs_v3/03-tasks/backlog/_index.md` |
| Service hub files (source of truth) | `dev_docs_v3/01-services/p0-mvp/` |
| Screen catalog | `dev_docs_v3/02-screens/_index.md` |
| API catalog | `dev_docs_v3/04-specs/api-catalog.md` |
| Session kickoff protocol | `dev_docs_v3/00-foundations/session-kickoff.md` |
| Design system | `dev_docs_v3/00-foundations/design-system.md` |
| Quality gates | `dev_docs_v3/00-foundations/quality-gates.md` |
| Domain rules | `dev_docs_v3/00-foundations/domain-rules.md` |
| Protect list | `dev_docs_v3/PROTECT-LIST.md` |
| Change log | `dev_docs_v3/CHANGELOG.md` |

---

## Backend Code

| What | Where |
|------|-------|
| All backend modules | `apps/api/src/modules/` |
| Auth module | `apps/api/src/modules/auth/` |
| CRM module | `apps/api/src/modules/crm/` |
| TMS Core (orders, loads, stops) | `apps/api/src/modules/operations/` |
| Dispatch & Tracking | `apps/api/src/modules/tms/` |
| Carriers | `apps/api/src/modules/carrier/` |
| Accounting | `apps/api/src/modules/accounting/` |
| Commission | `apps/api/src/modules/commission/` |
| Load Board | `apps/api/src/modules/load-board/` |
| Sales & Quotes | `apps/api/src/modules/sales/` |
| Prisma schema | `apps/api/prisma/schema.prisma` |
| Migrations | `apps/api/prisma/migrations/` |
| API bootstrap (main.ts) | `apps/api/src/main.ts` |
| Swagger docs | `localhost:3001/api-docs` (when running) |

---

## Frontend Code

| What | Where |
|------|-------|
| All pages | `apps/web/app/(dashboard)/` |
| Auth pages | `apps/web/app/(auth)/` |
| TMS Design System (31 components) | `apps/web/components/tms/` |
| shadcn/ui primitives | `apps/web/components/ui/` |
| Domain components | `apps/web/components/{service}/` |
| Hooks | `apps/web/lib/hooks/` |
| API client | `apps/web/lib/api/client.ts` |
| Navigation config | `apps/web/lib/config/navigation.ts` |
| Global CSS + design tokens | `apps/web/app/globals.css` |
| Storybook stories | `apps/web/stories/` |
| Next.js config | `apps/web/next.config.js` |

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `apps/web/lib/api/client.ts` | Axios instance — `baseURL: /api/v1` |
| `apps/web/app/layout.tsx` | Root layout — all providers |
| `apps/web/app/(dashboard)/layout.tsx` | Dashboard shell — sidebar, auth check |
| `apps/web/lib/config/navigation.ts` | Sidebar navigation definition |
| `apps/web/app/globals.css` | Design tokens (CSS custom properties) |
| `apps/api/src/main.ts` | API bootstrap (CORS, guards, Swagger) |
| `apps/api/src/app.module.ts` | Root NestJS module (all sub-modules imported) |
| `apps/api/prisma/schema.prisma` | Database schema (single source of truth) |
| `turbo.json` | Monorepo build pipeline |
| `pnpm-workspace.yaml` | Workspace package definitions |
| `docker-compose.yml` | PostgreSQL, Redis, Elasticsearch, Kibana |

---

## Specific Code Patterns

| Pattern | Where to Find Example |
|---------|----------------------|
| NestJS controller pattern | `apps/api/src/modules/crm/customers.controller.ts` |
| NestJS service pattern | `apps/api/src/modules/crm/crm.service.ts` |
| DTO with validation | `apps/api/src/modules/crm/dto/create-customer.dto.ts` |
| React Query hook | `apps/web/lib/hooks/crm/use-customers.ts` |
| Page with 4 states | `apps/web/app/(dashboard)/crm/companies/page.tsx` |
| Protected page | Any dashboard page (relies on `(dashboard)/layout.tsx`) |
| Form with RHF + Zod | `apps/web/app/(dashboard)/crm/companies/create/page.tsx` |
| Gold standard component | `apps/web/app/(dashboard)/truck-types/page.tsx` |
| 9/10 quality (PROTECTED) | `apps/web/app/(dashboard)/load-planner/[id]/edit/page.tsx` |

---

## Reference Docs

| What | Where |
|------|-------|
| Backend module map | `dev_docs_v3/04-specs/catalogs/backend-modules.md` |
| Component catalog | `dev_docs_v3/04-specs/catalogs/frontend-components.md` |
| Hook catalog | `dev_docs_v3/04-specs/catalogs/frontend-hooks.md` |
| Prisma model catalog | `dev_docs_v3/04-specs/catalogs/prisma-models.md` |
| Prisma schema docs | `dev_docs_v3/04-specs/catalogs/prisma-schema-docs.md` |
| API catalog | `dev_docs_v3/04-specs/api-catalog.md` |
| Latest audit | `dev_docs_v3/05-audit/latest-audit.md` |
| Security findings | `dev_docs_v3/05-audit/security-findings.md` |
| Technical debt | `dev_docs_v3/05-audit/technical-debt.md` |
| Anti-patterns to avoid | `dev_docs_v3/05-audit/recurring-patterns.md` |

---

## Design Specs

| What | Where |
|------|-------|
| All 381 design specs | `dev_docs/12-Rabih-design-Process/` |
| Auth screens spec | `dev_docs/12-Rabih-design-Process/01-auth/` |
| CRM screens spec | `dev_docs/12-Rabih-design-Process/03-crm/` |
| TMS Core screens spec | `dev_docs/12-Rabih-design-Process/05-tms/` |
| Carrier screens spec | `dev_docs/12-Rabih-design-Process/06-carriers/` |
| Accounting screens spec | `dev_docs/12-Rabih-design-Process/07-accounting/` |
| Design system spec | `dev_docs/12-Rabih-design-Process/00-global/` |
| Status color system | `dev_docs/12-Rabih-design-Process/00-global/03-status-color-system.md` |

---

## Testing

| What | Where |
|------|-------|
| Frontend tests | `apps/web/**/*.test.ts(x)` |
| Backend tests | `apps/api/src/**/*.spec.ts` |
| E2E tests | `apps/web/e2e/` (mostly empty) |
| Carrier tests (45 — most coverage) | `apps/api/src/modules/carrier/**/*.spec.ts` |
| Run frontend tests | `pnpm --filter web test` |
| Run backend tests | `pnpm --filter api test` |
| Run coverage | `pnpm --filter web test:coverage` |

---

## Commands Quick Reference

```bash
# Start everything
docker-compose up -d        # Start infra
pnpm dev                    # Start web:3000 + api:3001

# Type checking + linting
pnpm check-types            # Must be 0 errors
pnpm lint                   # Must be 0 warnings

# Database
pnpm --filter api prisma:generate   # Regenerate client
pnpm --filter api prisma:migrate    # Run migrations
pnpm --filter api prisma:studio     # Open Prisma Studio (port 5555)

# Testing
pnpm --filter web test
pnpm --filter api test

# Storybook
pnpm storybook              # Opens on port 6006

# Find a route in the backend
grep -r "'/carriers" apps/api/src/modules/  # Find route

# Count files
find apps/web/app -name "page.tsx" | wc -l   # Count routes
find apps/web/components -name "*.tsx" | wc -l  # Count components
```

---

## Historical Docs (Read-Only)

| What | Where | Status |
|------|-------|--------|
| Original 162-week plan | `dev_docs/` | READ-ONLY — historical reference |
| 381 design specs | `dev_docs/12-Rabih-design-Process/` | READ-ONLY — use as design reference |
| Claude review v1 (37 files) | `dev_docs/Claude-review-v1/` | READ-ONLY — superseded by v3 audit |
| Gemini review v2 (2 files) | `dev_docs/gemini-review-v2/` | READ-ONLY |
| v2 sprint tasks (71/72 done) | `dev_docs_v2/01-tasks/` | READ-ONLY — completed work |
| v2 service hubs (8 services) | `dev_docs_v2/03-services/` | READ-ONLY — superseded by v3 hubs |
| v2 status | `dev_docs_v2/STATUS.md` | READ-ONLY — superseded by v3 STATUS.md |
| Master Starter Kit | `Master-Starter-Kit/` | READ-ONLY — methodology reference |

# Ultra TMS - GitHub Copilot Instructions

> **First action:** Read `AGENTS.md` for full project context, task protocol, and coding standards.

## Project

Ultra TMS is a 3PL logistics platform. Monorepo with `apps/web` (Next.js 16) and `apps/api` (NestJS 10).

## Code Standards (Enforced)

- No `any` types — TypeScript strict mode with `noUncheckedIndexedAccess`
- No hardcoded color values — use semantic Tailwind classes (see `dev_docs_v2/00-foundations/design-system.md`)
- No `console.log` in committed code
- No `window.confirm()` — use ConfirmDialog component
- Multi-tenant: always filter by `tenantId`
- Soft deletes: always filter `deletedAt: null`
- Every page needs 4 states: loading (skeleton), error (retry), empty (CTA), success (data)
- Every button needs a real `onClick` handler
- Components from `@/components/ui/` (shadcn/ui), icons from `lucide-react`

## Before Every Feature

1. Read `AGENTS.md` (full context)
2. Read `dev_docs_v2/STATUS.md` (find your task)
3. Read the task file in `dev_docs_v2/01-tasks/{phase}/` (has Context Header listing exactly what to read)
4. Check if backend already exists in `apps/api/src/modules/` — wire up, don't rebuild

## Verify Before Commit

```bash
pnpm check-types && pnpm lint    # Both must pass
```

## After Coding

1. Update `dev_docs_v2/STATUS.md` (mark task DONE)
2. Log session in `dev_docs/weekly-reports/work-log.md` (see `WORKFLOWS.md` for template)
3. Add discoveries to `LEARNINGS.md`
4. Commit with conventional format (`feat:`, `fix:`, `docs:`, `refactor:`)

## PROTECT LIST — Do NOT Modify

- Load Planner (`/load-planner/[id]/edit`) — production-ready
- Truck Types (`/truck-types`) — gold standard
- Login (`/login`) — working auth flow

## Key Paths

- Task dashboard: `dev_docs_v2/STATUS.md`
- Service hub files: `dev_docs_v2/03-services/{service}.md`
- Design specs: `dev_docs/12-Rabih-design-Process/`
- Quality gates: `dev_docs_v2/00-foundations/quality-gates.md`
- Manual workflows: `WORKFLOWS.md`

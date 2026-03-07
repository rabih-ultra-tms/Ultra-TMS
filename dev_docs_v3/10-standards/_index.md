# Development Standards Index

> Source: Consolidated from `dev_docs/08-standards/` (files 65-75)
> Last updated: 2026-03-07

## Quick Reference

| File | Covers | When to Read |
|------|--------|-------------|
| [api-design.md](api-design.md) | REST API patterns, response format, pagination | Before building any endpoint |
| [database-design.md](database-design.md) | Prisma schema, naming, migration-first fields | Before any schema change |
| [frontend-architecture.md](frontend-architecture.md) | React patterns, page templates, state management | Before building any screen |
| [ui-components.md](ui-components.md) | shadcn/ui usage, design tokens, component standards | Before building UI |
| [type-safety.md](type-safety.md) | TypeScript strict mode, no `any`, type contracts | Always |
| [authentication.md](authentication.md) | JWT, RBAC, multi-tenant queries, guards | Before any auth-related work |
| [testing-standards.md](testing-standards.md) | Jest, Testing Library, E2E, coverage targets | Before writing tests |
| [error-handling.md](error-handling.md) | Error boundaries, API errors, user feedback | Before building error flows |
| [performance.md](performance.md) | Bundle size, query optimization, caching | Before optimization work |
| [pitfalls.md](pitfalls.md) | Common mistakes and how to avoid them | Always — read first |

## The 5 Golden Rules

1. **Every interactive element MUST work** — No empty onClick, no TODO placeholders
2. **API contracts before code** — Define request/response before building
3. **Screen → API → Database traceability** — Every screen maps to endpoints maps to DB ops
4. **Type safety is mandatory** — No `any`. Types must match runtime data
5. **Verify before shipping** — All buttons work, API calls succeed, loading/error/empty states handled

## Pre-Flight Checklists

- **Before any feature:** Read `pitfalls.md` + relevant standard file
- **Before any PR:** Run `pnpm check-types && pnpm lint && pnpm build`
- **Before any deploy:** Run full test suite + Playwright E2E

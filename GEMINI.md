# Ultra TMS - Gemini Configuration

> This file auto-loads in Gemini CLI / Gemini Code Assist.
> **First action:** Read `AGENTS.md` for full project context, task protocol, and coding standards.

---

## Quick Reference

**Stack:** Next.js 16 + React 19 + NestJS 10 + PostgreSQL/Prisma 6 (monorepo: `apps/web` + `apps/api`)
**MVP:** 8 services, ~30 screens, 16-week sprint
**Current Phase:** Phase 0 — Emergency Fixes

## Before Coding

1. Read `AGENTS.md` (full project context, architecture, conventions)
2. Read `dev_docs_v2/STATUS.md` (find an unclaimed task, claim it, push)
3. Read the task file in `dev_docs_v2/01-tasks/{phase}/`
4. Follow the task's Context Header (max 6 files total)

## Golden Rules

1. Backend exists — **wire up, don't rebuild** (search `apps/api/src/modules/` first)
2. No `any` types, no hardcoded colors, no `console.log`
3. Always filter by `tenantId` AND `deletedAt: null`
4. Every button must have a real handler, every page needs 4 states (loading/error/empty/success)
5. PROTECT LIST: Don't touch Load Planner, Truck Types, or Login pages

## Verify Before Commit

```bash
pnpm check-types && pnpm lint    # Both must pass
```

## Gemini-Specific Notes

- You don't have MCP design servers — see `dev_docs_v2/00-foundations/design-toolkit-guide.md` for manual component/design decisions
- You don't have `/kickoff` or `/log` commands — see `WORKFLOWS.md` for manual step-by-step equivalents
- For component lookups: visit https://ui.shadcn.com/docs/components and https://magicui.design/docs
- Design tokens are in `dev_docs_v2/00-foundations/design-system.md`

## After Coding

1. Update `dev_docs_v2/STATUS.md` (mark task DONE)
2. Log session in `dev_docs/weekly-reports/work-log.md` (see template in `WORKFLOWS.md`)
3. Add discoveries to `LEARNINGS.md`
4. Commit with conventional format (`feat:`, `fix:`, `docs:`)
5. Push

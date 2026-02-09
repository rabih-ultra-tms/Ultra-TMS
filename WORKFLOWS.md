# Ultra TMS - Manual Workflows

> **What is this?** Step-by-step equivalents of Claude Code's automated commands.
> Use these if you're working with Gemini, Codex, Copilot, Cursor, or any tool without `/slash` commands.

---

## Session Kickoff (replaces `/kickoff`)

**When:** At the start of every coding session.

1. `git pull origin main` to get latest changes
2. Read `AGENTS.md` if you haven't already (project context)
3. Read `dev_docs_v2/STATUS.md` — scan for unclaimed tasks (Assigned = "—")
4. Pick a task in the current phase that isn't blocked
5. **Claim it:** Write your name in "Assigned", change status to `IN PROGRESS`
6. Commit + push immediately: `git add dev_docs_v2/STATUS.md && git commit -m "task: claim TASK-ID" && git push`
7. Read the task file in `dev_docs_v2/01-tasks/{phase}/{TASK-ID}.md`
8. Follow the Context Header — read only the files listed (max 6)
9. If the task is for a specific service, read the hub file at `dev_docs_v2/03-services/{service}.md`
10. Start coding

---

## Session Logging (replaces `/log`)

**When:** At the end of every coding session.

1. Check what you did: `git log --oneline --since="today"`
2. Read `dev_docs/weekly-reports/work-log.md`
3. Add a new entry at the top (below the header), using this template:

```markdown
## Session: YYYY-MM-DD (Day of Week)

### Developer: [Your Name]
### AI Tool: [Gemini Pro / Codex 5.2 / Copilot / Claude Code / etc.]
### Commit(s): `hash` — Short description

**What was done:**
[1-3 sentence summary of the session's work]

**Files created/changed:** [count] files

**Task(s) completed:** [TASK-ID, TASK-ID]

**Key learnings:**
- [Something the other developer should know]
- [API behavior discovered, pattern that works well, gotcha avoided]

**Unblocked tasks:** [Tasks that can now be started because of this work]
```

4. Commit: `git add dev_docs/weekly-reports/work-log.md && git commit -m "docs: log session YYYY-MM-DD"`

---

## Pre-Feature Check (replaces `/preflight`)

**When:** Before building any new screen or feature.

1. **Find the contract:** Check `dev_docs/09-contracts/76-screen-api-contract-registry.md` for the screen's API endpoints
2. **Find the design spec:** Search `dev_docs/12-Rabih-design-Process/` for the screen's spec file
3. **Check backend exists:** Search `apps/api/src/modules/` for existing controller/service/DTOs
4. **Check frontend exists:** Search `apps/web/app/(dashboard)/` for existing pages
5. **Check hooks exist:** Search `apps/web/lib/hooks/` for React Query hooks
6. **Check Prisma schema:** Read `apps/api/prisma/schema.prisma` for the data model

Report:
- Contract defined? Yes/No
- Backend exists? Yes/No/Partial
- Frontend exists? Yes/No/Partial
- Design spec available? Yes/No
- Schema ready? Yes/No

If backend doesn't exist, build it first (see Scaffold API below).

---

## Quality Gate Check (replaces `/quality-gate`)

**When:** Before committing code.

Run these checks in sequence:

```bash
pnpm lint                    # Must pass (zero errors)
pnpm check-types             # Must pass (zero errors)
pnpm --filter api test       # Backend tests pass
pnpm --filter web test       # Frontend tests pass
pnpm build                   # Full build succeeds
```

Then verify manually:
- [ ] Every button has a real `onClick` handler
- [ ] Every link has a real `href`
- [ ] No `console.log` in the diff
- [ ] No `any` types in the diff
- [ ] Loading, error, and empty states exist on every page
- [ ] No hardcoded color values (use Tailwind semantic classes)
- [ ] No `window.confirm()` — use ConfirmDialog
- [ ] Multi-tenant filters applied (tenantId + deletedAt: null)

Full checklist: `dev_docs_v2/00-foundations/quality-gates.md`

---

## Scaffold a Frontend Page (replaces `/scaffold-screen`)

**When:** Building a new page from a design spec.

1. Identify the screen type: **list**, **detail**, **form**, or **dashboard**
2. Check if the page already exists in `apps/web/app/(dashboard)/`
3. Reference the gold standard patterns:
   - **List page:** Study `apps/web/app/(dashboard)/carriers/page.tsx` or `/truck-types`
   - **Detail page:** Study the pattern in existing detail pages
   - **Form page:** Use React Hook Form + Zod (see `AGENTS.md` conventions)
4. Create the page file at `apps/web/app/(dashboard)/{resource}/page.tsx`

Every page must include:
- `'use client'` directive
- shadcn/ui components from `@/components/ui/`
- Lucide icons from `lucide-react`
- 4 states: Loading (skeleton), Error (retry button), Empty (CTA), Success (data)
- TypeScript types (no `any`)
- Status color maps as `Record<Status, string>`

If React Query hooks don't exist, create them at `apps/web/lib/hooks/{resource}.ts` using the pattern:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export function useResources(params) {
  return useQuery({
    queryKey: ['resources', params],
    queryFn: () => apiClient.get('/api/v1/resources', { params }),
  });
}
```

---

## Scaffold a Backend Module (replaces `/scaffold-api`)

**When:** Building a new API module.

1. Check if module exists in `apps/api/src/modules/`
2. Check Prisma schema at `apps/api/prisma/schema.prisma` for the model
3. Reference the carrier module as a pattern: `apps/api/src/modules/carrier/`
4. Create these files at `apps/api/src/modules/{resource}/`:
   - `dto/create-{resource}.dto.ts` — class-validator decorators
   - `dto/{resource}-query.dto.ts` — search, status filter, pagination
   - `dto/update-{resource}.dto.ts` — `PartialType(CreateDto)`
   - `{resource}s.service.ts` — CRUD with tenantId + deletedAt filtering
   - `{resource}s.controller.ts` — routes with `@UseGuards(JwtAuthGuard, RolesGuard)`
   - `{resource}.module.ts` — NestJS module registration
   - `{resource}s.service.spec.ts` — basic test structure
5. Register in `apps/api/src/app.module.ts`
6. Verify: `pnpm --filter api exec tsc --noEmit`

---

## Component/Design Decisions (replaces MCP design toolkit)

**When:** You need to pick a UI component or make design decisions but don't have MCP servers.

See `dev_docs_v2/00-foundations/design-toolkit-guide.md` for the full decision tree.

Quick reference:
- **shadcn/ui docs:** https://ui.shadcn.com/docs/components
- **magicui docs:** https://magicui.design/docs
- **Already installed components:** button, card, dialog, dropdown-menu, input, label, select, separator, sheet, skeleton, table, tabs, textarea, toast, tooltip, badge, avatar, checkbox, command, form, popover, scroll-area, switch, alert-dialog, collapsible
- **Design tokens:** `dev_docs_v2/00-foundations/design-system.md`
- **Gold standard pages:** Truck Types (data table), Load Planner (complex form), Login (auth)

---

## Session End Checklist

Before ending any coding session, verify all of these:

- [ ] `dev_docs_v2/STATUS.md` updated (task marked DONE or progress noted)
- [ ] `pnpm check-types` passes
- [ ] `pnpm lint` passes
- [ ] No `console.log` in your changes
- [ ] No `any` types in your changes
- [ ] Session logged in `dev_docs/weekly-reports/work-log.md`
- [ ] Discoveries added to `LEARNINGS.md` (if any)
- [ ] Changes committed with conventional format (`feat:`, `fix:`, `docs:`)
- [ ] Pushed to remote

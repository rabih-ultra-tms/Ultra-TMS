# CC-001: Command Center Container + Route

**Priority:** P0
**Effort:** S (4 hours)
**Status:** planned
**Assigned:** Claude Code
**Dependencies:** None

---

## Context Header (Read These First)

1. `dev_docs_v3/01-services/p0-mvp/39-command-center.md` — Command Center hub file
2. `apps/web/components/tms/dispatch/dispatch-board.tsx` — Existing dispatch board (240 LOC)
3. `apps/web/components/tms/dispatch/dispatch-toolbar.tsx` — Existing toolbar (332 LOC)
4. `apps/web/lib/hooks/tms/use-dispatch.ts` — Existing dispatch hook (611 LOC)
5. `dev_docs/12-Rabih-design-Process/39-command-center/01-command-center.md` — Screen spec

---

## Objective

Create the `/command-center` route and main container component that wraps the existing dispatch board with domain tabs and layout mode switching.

---

## Acceptance Criteria

- [ ] Route `/command-center` renders the CommandCenter component
- [ ] Domain tabs visible: Loads (default), Quotes, Carriers, Tracking, Alerts
- [ ] Active tab persists in URL query param `?tab=loads`
- [ ] Layout mode toggle: Board (default), Split, Dashboard, Focus
- [ ] Layout mode persists in URL query param `?layout=board`
- [ ] Loads tab renders the existing DispatchBoard component (imported, not copied)
- [ ] Other tabs show placeholder panels ("Coming Soon — Quotes Panel")
- [ ] Sidebar navigation includes "Command Center" link
- [ ] Page has proper metadata (title, breadcrumbs)
- [ ] `pnpm build` passes with no errors
- [ ] `pnpm check-types` passes with no errors

---

## File Plan

### New Files

| File | Purpose |
|------|---------|
| `apps/web/app/(dashboard)/command-center/page.tsx` | Route entry point with metadata |
| `apps/web/components/tms/command-center/command-center.tsx` | Main container: tabs, layout mode, state |
| `apps/web/components/tms/command-center/command-center-toolbar.tsx` | Domain tabs + layout toggle + search |
| `apps/web/lib/hooks/tms/use-command-center.ts` | State management: active tab, layout mode, drawer |

### Modified Files

| File | Change |
|------|--------|
| `apps/web/components/layout/sidebar.tsx` | Add Command Center nav item |

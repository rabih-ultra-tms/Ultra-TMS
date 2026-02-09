# BUG-003: Sidebar Has 404 Links

> **Phase:** 0 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** S (1-2h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/04-audit/auth-admin.md` — sidebar issues

## Objective

Audit every sidebar navigation link and either fix the destination or hide links that point to unbuilt pages. Users should never see a 404 from the sidebar.

## File Plan

| Action | Path | What |
|--------|------|------|
| MODIFY | `apps/web/components/layout/app-sidebar.tsx` | Remove or disable links to unbuilt pages |
| MODIFY | `apps/web/lib/config/navigation.ts` | Update nav config (if separate from sidebar) |

## Acceptance Criteria

- [ ] Every sidebar link navigates to a working page (no 404s)
- [ ] Links to future features either removed or marked "Coming Soon" (disabled)
- [ ] No changes to working links
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: None
- Blocks: None

## Reference

- Bug inventory: `dev_docs/Claude-review-v1/01-code-review/05-bug-inventory.md`

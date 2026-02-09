# PATT-002: Detail Page Pattern Template

> **Phase:** 2 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** M (3-4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/00-foundations/design-system.md`
3. `dev_docs/Claude-review-v1/04-screen-integration/02-page-patterns.md`

## Objective

Create a reference implementation of the Detail Page pattern. Used for viewing entity details with tabs. Combines: PageHeader with back button + actions, Tabs, content sections. Build using the User Detail page as reference, then apply to Carrier Detail (BUG-001).

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/components/patterns/detail-page.tsx` | DetailPage wrapper (header + tabs + content) |

## Acceptance Criteria

- [ ] DetailPage accepts: title, subtitle, backLink, actions (buttons), tabs (array of {label, content})
- [ ] Renders: PageHeader with back arrow + action buttons, Tabs navigation, tab content area
- [ ] Handles 3 data states: loading (detail skeleton), error (retry), data
- [ ] Actions slot supports: Edit, Delete, and custom action buttons
- [ ] Active tab persisted in URL hash (e.g., `/carriers/123#insurance`)
- [ ] Breadcrumb navigation (e.g., Carriers > ABC Trucking)
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: COMP-002 (StatusBadge), COMP-007 (detail skeleton)
- Blocks: CARR-002 (carrier detail uses this pattern), Phase 3+ (all detail pages)

## Reference

- Page patterns: `dev_docs/Claude-review-v1/04-screen-integration/02-page-patterns.md`
- Working example: `apps/web/app/(dashboard)/admin/users/[id]/page.tsx`

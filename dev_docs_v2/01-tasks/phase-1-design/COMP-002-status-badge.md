# COMP-002: Unified StatusBadge Component

> **Phase:** 1 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** M (2-3h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/00-foundations/design-system.md` — Status color families
3. `dev_docs_v2/04-audit/components.md` — Existing status badge components

## Objective

Create a single unified `StatusBadge` component that replaces the 4 separate per-module status badges (UserStatusBadge, CustomerStatusBadge, LeadStageBadge, carrier status inline). It should accept an entity type and status value, and render the correct color from design tokens.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/components/shared/status-badge.tsx` | Unified StatusBadge with entity-aware color mapping |
| MODIFY | `apps/web/components/admin/users/user-status-badge.tsx` | Re-export from shared StatusBadge (backwards compat) |
| MODIFY | `apps/web/components/crm/customers/customer-status-badge.tsx` | Re-export from shared StatusBadge |
| MODIFY | `apps/web/components/crm/leads/lead-stage-badge.tsx` | Re-export from shared StatusBadge |

## Acceptance Criteria

- [ ] Single StatusBadge component handles all entity types (user, customer, lead, order, load, carrier)
- [ ] Colors come from design tokens (not hardcoded hex)
- [ ] Accepts props: `entity` (string), `status` (string), optional `size` (sm/md/lg)
- [ ] Existing pages work unchanged (old badges re-export from new one)
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: COMP-001 (design tokens)
- Blocks: PATT-001, PATT-002, PATT-003 (page patterns use StatusBadge)

## Reference

- Design tokens: `dev_docs_v2/00-foundations/design-system.md`
- Color system: `dev_docs/12-Rabih-design-Process/00-global/03-status-color-system.md`

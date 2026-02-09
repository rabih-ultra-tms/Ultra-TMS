# COMP-001: Design Tokens Foundation

> **Phase:** 1 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** L (4-6h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/00-foundations/design-system.md` — Token reference
3. `dev_docs/12-Rabih-design-Process/00-global/03-status-color-system.md` — Full color spec

## Objective

Create a centralized design token system using CSS custom properties and Tailwind 4 configuration. Every color, spacing value, and typography size should come from tokens — no hardcoded values. This is the foundation for all Phase 1 components.

## File Plan

| Action | Path | What |
|--------|------|------|
| MODIFY | `apps/web/app/globals.css` | Add CSS custom properties for all design tokens (colors, spacing, typography) |
| MODIFY | `apps/web/tailwind.config.ts` | Extend theme with token references |
| CREATE | `apps/web/lib/design-tokens.ts` | TypeScript constants for tokens (status colors, entity colors) |

## Acceptance Criteria

- [ ] 8 status color families defined as CSS custom properties (emerald, amber, red, blue, gray, indigo, violet, cyan)
- [ ] Typography scale (6 levels) defined as tokens
- [ ] Spacing system (7 contexts) defined as tokens
- [ ] Tailwind config uses CSS custom properties (not hardcoded hex)
- [ ] TypeScript constants export all status colors for programmatic use
- [ ] No hardcoded color hex values in new code
- [ ] Existing pages still render correctly (backwards compatible)
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: None
- Blocks: COMP-002 (StatusBadge), COMP-003 (KPICard), all Phase 2+ work

## Reference

- Design system: `dev_docs_v2/00-foundations/design-system.md`
- Color system: `dev_docs/12-Rabih-design-Process/00-global/03-status-color-system.md`
- Quality gates: `dev_docs_v2/00-foundations/quality-gates.md`

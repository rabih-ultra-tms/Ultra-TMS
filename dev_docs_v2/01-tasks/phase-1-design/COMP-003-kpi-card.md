# COMP-003: KPICard Component

> **Phase:** 1 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** M (2-3h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/00-foundations/design-system.md` — Visual style
3. `dev_docs/12-Rabih-design-Process/01.1-dashboard-shell/01-main-dashboard.md` — Dashboard design

## Objective

Build a reusable KPICard component for the dashboard and other metric displays. It should show a title, value, trend indicator (up/down/neutral with percentage), and optional icon. Replaces the current hardcoded-to-zero dashboard cards.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/components/shared/kpi-card.tsx` | KPICard with title, value, trend, icon |

## Acceptance Criteria

- [ ] KPICard renders: title (string), value (number or formatted string), trend (percentage + direction)
- [ ] Trend shows green arrow up for positive, red arrow down for negative, gray for neutral
- [ ] Supports optional icon (Lucide icon component)
- [ ] Loading state (skeleton shimmer)
- [ ] Uses design tokens for colors
- [ ] Responsive (stacks on mobile)
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: COMP-001 (design tokens)
- Blocks: BUG-008 (dashboard hardcoded — will use KPICard)

## Reference

- Dashboard design: `dev_docs/12-Rabih-design-Process/01.1-dashboard-shell/01-main-dashboard.md`

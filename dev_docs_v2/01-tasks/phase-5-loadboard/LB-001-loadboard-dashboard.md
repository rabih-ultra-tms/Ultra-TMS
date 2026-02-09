# LB-001: Load Board Dashboard

> **Phase:** 5 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (3h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/07-load-board.md` — Load Board hub
3. `dev_docs/12-Rabih-design-Process/07-load-board/01-load-board-dashboard.md` — Design spec

## Objective

Build the Load Board Dashboard at `/load-board`. KPI cards showing active postings, pending bids, average time-to-cover, and coverage rate. Entry point to load board features.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/load-board/page.tsx` | Load board dashboard |
| CREATE | `apps/web/components/load-board/lb-dashboard-stats.tsx` | KPI cards |
| CREATE | `apps/web/components/load-board/lb-recent-postings.tsx` | Recent postings list |
| CREATE | `apps/web/lib/hooks/load-board/use-loadboard-dashboard.ts` | React Query hook for dashboard data |

## Acceptance Criteria

- [ ] `/load-board` renders dashboard with KPI cards
- [ ] KPIs: active postings count, pending bids count, avg time-to-cover, coverage rate %
- [ ] Recent postings list with status badges
- [ ] Quick links: "Post Load", "Search Available", "My Postings"
- [ ] Loading skeletons
- [ ] Uses KPICard component (COMP-003)
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: COMP-003 (KPICard), COMP-001 (design tokens)
- Blocks: None

## Reference

- Hub: `dev_docs_v2/03-services/07-load-board.md`
- Backend: `GET /api/v1/load-board/dashboard`

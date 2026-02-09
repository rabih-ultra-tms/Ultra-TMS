# BUG-008: Dashboard Hardcoded to Zeros

> **Phase:** 0 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (2-3h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/04-audit/auth-admin.md` — UX-001
3. `dev_docs/12-Rabih-design-Process/01.1-dashboard-shell/01-main-dashboard.md` — Dashboard design spec

## Objective

Wire the dashboard KPI cards to real API data. Currently all metrics show 0. The backend has endpoints for orders, loads, carriers, and quotes that can provide real counts and totals.

## File Plan

| Action | Path | What |
|--------|------|------|
| MODIFY | `apps/web/app/(dashboard)/page.tsx` | Wire KPI cards to real API endpoints |
| CREATE | `apps/web/lib/hooks/use-dashboard.ts` | Hook to fetch dashboard stats (order count, load count, carrier count, revenue) |

## Acceptance Criteria

- [ ] Dashboard shows real order count (from GET /api/v1/orders with count)
- [ ] Dashboard shows real load count (from GET /api/v1/loads with count)
- [ ] Dashboard shows real carrier count (from GET /api/v1/carriers with count)
- [ ] Dashboard shows real quote count or revenue metric
- [ ] Loading state while fetching
- [ ] Error state if API fails
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: None
- Blocks: None

## Reference

- Audit: `dev_docs_v2/04-audit/auth-admin.md` → UX-001
- Design: `dev_docs/12-Rabih-design-Process/01.1-dashboard-shell/01-main-dashboard.md`

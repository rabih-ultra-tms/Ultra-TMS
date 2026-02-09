# COM-001: Commission Dashboard

> **Phase:** 6 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (3h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/08-commission.md` — Commission hub
3. `dev_docs/12-Rabih-design-Process/08-commission/01-commission-dashboard.md` — Design spec

## Objective

Build the Commission Dashboard at `/commissions`. KPI cards: pending commission total, paid MTD/YTD, average commission rate, top performing reps.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/commissions/page.tsx` | Commission dashboard |
| CREATE | `apps/web/components/commissions/commission-dashboard-stats.tsx` | KPI cards |
| CREATE | `apps/web/lib/hooks/commissions/use-commission-dashboard.ts` | Dashboard hook |

## Acceptance Criteria

- [ ] `/commissions` renders dashboard
- [ ] KPIs: pending total, paid this month, paid this year, avg rate, top 5 reps
- [ ] Quick links to Reps, Plans, Transactions, Payouts
- [ ] Uses KPICard component (COMP-003)
- [ ] Loading skeletons
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: COMP-003 (KPICard)
- Blocks: None

## Reference

- Hub: `dev_docs_v2/03-services/08-commission.md`
- Backend: `GET /api/v1/commissions/dashboard`

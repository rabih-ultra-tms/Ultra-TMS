# ACC-001: Accounting Dashboard

> **Phase:** 6 | **Priority:** P1 | **Status:** DONE
> **Effort:** M (4h)
> **Assigned:** Claude Code
> **Completed:** February 17, 2026

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/06-accounting.md` — Accounting hub
3. `dev_docs/12-Rabih-design-Process/06-accounting/01-accounting-dashboard.md` — Design spec

## Objective

Build the Accounting Dashboard at `/accounting`. KPI cards for total AR, total AP, overdue invoice count, DSO (Days Sales Outstanding), and revenue MTD. Entry point to all accounting features.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/accounting/page.tsx` | Accounting dashboard |
| CREATE | `apps/web/components/accounting/acc-dashboard-stats.tsx` | KPI cards |
| CREATE | `apps/web/components/accounting/acc-recent-invoices.tsx` | Recent invoices list |
| CREATE | `apps/web/lib/hooks/accounting/use-accounting-dashboard.ts` | React Query hook |

## Acceptance Criteria

- [ ] `/accounting` renders dashboard with KPI cards
- [ ] KPIs: total AR balance, total AP balance, overdue invoice count, DSO, revenue MTD
- [ ] Recent invoices list with status badges
- [ ] Quick links to Invoices, Payments, Settlements, Aging
- [ ] Uses KPICard component (COMP-003)
- [ ] Loading skeletons
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: COMP-003 (KPICard), COMP-001 (design tokens)
- Blocks: None

## Reference

- Hub: `dev_docs_v2/03-services/06-accounting.md`
- Backend: `GET /api/v1/accounting/dashboard`

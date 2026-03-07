# BLD-013: Accounting Dashboard

**Priority:** P0
**Service:** Accounting
**Route:** `/accounting`
**Page file:** `apps/web/app/(dashboard)/accounting/page.tsx`

## Current State
Fully built (97 LOC). Uses `useAccountingDashboard` and `useRecentInvoices` hooks. Renders KPI stat cards (`AccDashboardStats`), quick links grid (Invoices, Payments, Settlements, Aging Reports with icons and descriptions), and recent invoices table (`AccRecentInvoices`). Clean layout with semantic token colors.

## Requirements
- Verify `useAccountingDashboard` connects to `GET /accounting/dashboard` (endpoint exists in `AccountingController`)
- Verify `useRecentInvoices` connects to backend
- KPI cards should show: total receivables, total payables, cash flow, overdue amounts
- Quick links navigate correctly to sub-pages

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Dashboard KPIs reflect real financial data
- [ ] Quick links navigate to correct pages

## Dependencies
- Backend: `GET /accounting/dashboard` (exists in `accounting.controller.ts`)
- Hook: `apps/web/lib/hooks/accounting/use-accounting-dashboard.ts`
- Components: `AccDashboardStats`, `AccRecentInvoices`

## Estimated Effort
S

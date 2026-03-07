# BLD-022: Aging Report

**Priority:** P0
**Service:** Accounting
**Route:** `/accounting/reports/aging`
**Page file:** `apps/web/app/(dashboard)/accounting/reports/aging/page.tsx`

## Current State
Fully built (154 LOC). Features customer filter dropdown (loaded via `useCustomers` with limit 200), as-of date picker, apply/clear filter buttons. Uses `useAgingReport` hook. Renders `AgingReport` component with buckets, customers, and total outstanding. Back navigation to accounting dashboard. Error state with retry.

## Requirements
- Verify `useAgingReport` connects to `GET /accounting/aging` (endpoint exists in `AccountingController`)
- Verify aging buckets (current, 1-30, 31-60, 61-90, 90+) match backend implementation
- Customer filter loads up to 200 customers -- may need search/pagination for large tenant datasets
- As-of date allows historical point-in-time reporting

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Aging buckets display correctly
- [ ] Customer and date filters work
- [ ] Report totals are accurate

## Dependencies
- Backend: `GET /accounting/aging` (exists in `accounting.controller.ts`)
- Hook: `apps/web/lib/hooks/accounting/use-aging.ts`
- Components: `AgingReport`

## Estimated Effort
S

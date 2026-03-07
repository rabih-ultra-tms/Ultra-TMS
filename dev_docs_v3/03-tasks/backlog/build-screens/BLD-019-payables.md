# BLD-019: Payables

**Priority:** P0
**Service:** Accounting
**Route:** `/accounting/payables`
**Page file:** `apps/web/app/(dashboard)/accounting/payables/page.tsx`

## Current State
Fully built (70 LOC). Uses `ListPage` pattern with `usePayables` hook. Minimal page with filters (status, date range, search), data table, and pagination. No header actions (no "create payable" button -- payables are typically auto-generated from delivered loads). Row click navigates to `/accounting/payables/${row.id}` (detail page may not exist).

## Requirements
- Verify payable detail route exists (row click navigates to `/accounting/payables/:id`)
- Verify `usePayables` hook connects to backend
- Payables should auto-generate when loads are delivered (BACK-008 dependency)
- May need a "Create Settlement" action to group payables

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Payables list shows carrier amounts owed
- [ ] Row click navigates to valid detail page

## Dependencies
- Backend: `GET /payments-made` or equivalent payables endpoint
- Hook: `apps/web/lib/hooks/accounting/use-payables.ts`
- Components: `ListPage`, `PayableFilters`, `getPayableColumns`

## Estimated Effort
S

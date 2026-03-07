# BLD-020: Settlements List

**Priority:** P0
**Service:** Accounting
**Route:** `/accounting/settlements`
**Page file:** `apps/web/app/(dashboard)/accounting/settlements/page.tsx`

## Current State
Fully built (71 LOC). Uses `ListPage` pattern with `useSettlements` hook. Filters by status, date range, search. No header actions for creating settlements (creation may be done from payables grouping). Row click navigates to settlement detail.

## Requirements
- Verify `useSettlements` connects to backend `GET /settlements`
- Consider adding "Create Settlement" action (group payables by carrier into settlement)
- Verify settlement statuses match backend enum (CREATED, APPROVED, PROCESSED, PAID)

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Settlement list shows all carrier settlements
- [ ] Status filtering works correctly

## Dependencies
- Backend: `GET /settlements`
- Hook: `apps/web/lib/hooks/accounting/use-settlements.ts`
- Components: `ListPage`, `SettlementFilters`, `getSettlementColumns`

## Estimated Effort
S

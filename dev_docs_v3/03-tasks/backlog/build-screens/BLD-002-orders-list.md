# BLD-002: Orders List

**Priority:** P0
**Service:** TMS Core
**Route:** `/operations/orders`
**Page file:** `apps/web/app/(dashboard)/operations/orders/page.tsx`

## Current State
Fully built (165 LOC). Uses `ListPage` pattern with `useOrders` hook. Has stats cards (total, pending, in-transit, delivered), order filters, column definitions with status change and delete actions. URL-driven pagination and filtering (page, limit, search, status, fromDate, toDate, customerId). Row selection and row click navigation to detail page.

## Requirements
- Verify `useOrders` hook connects to backend `GET /orders` endpoint
- Delete handler shows "not available yet" toast -- needs real implementation or removal
- Status change uses `useUpdateOrder` with `any` type cast -- needs proper typing
- Stats computed from current page data only (not server totals) -- may need server-side stats endpoint

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Pagination synced with URL params
- [ ] Filters produce correct API queries

## Dependencies
- Backend: `GET /orders`, `PATCH /orders/:id`
- Hook: `apps/web/lib/hooks/tms/use-orders.ts`
- Components: `ListPage`, `OrderFilters`, `getOrderColumns`

## Estimated Effort
S

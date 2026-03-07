# BLD-004: Order Detail

**Priority:** P0
**Service:** TMS Core
**Route:** `/operations/orders/[id]`
**Page file:** `apps/web/app/(dashboard)/operations/orders/[id]/page.tsx`

## Current State
Fully built (114 LOC). Uses `DetailPage` pattern with tabs: Overview, Stops, Loads, Items, Documents (placeholder), Timeline. Status badge with intent mapping. Actions: Edit Order button, dropdown with Duplicate (disabled) and Cancel (disabled). Breadcrumb navigation. Uses React 19 `use()` for params unwrapping.

## Requirements
- Documents tab shows placeholder "coming soon" -- needs real document management
- Duplicate Order action is disabled -- implement or remove
- Cancel Order action is disabled -- implement status transition
- Verify all tab components render real data

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] All tabs render correctly with real order data
- [ ] Status transitions work end-to-end

## Dependencies
- Backend: `GET /orders/:id`
- Hook: `apps/web/lib/hooks/tms/use-orders.ts` (useOrder)
- Components: `DetailPage`, `OrderDetailOverview`, `OrderStopsTab`, `OrderLoadsTab`, `OrderItemsTab`, `OrderTimelineTab`

## Estimated Effort
M

# BLD-003: Order Create

**Priority:** P0
**Service:** TMS Core
**Route:** `/operations/orders/new`
**Page file:** `apps/web/app/(dashboard)/operations/orders/new/page.tsx`

## Current State
Minimal page wrapper (13 LOC). Renders `OrderForm` component inside a `Suspense` boundary with `FormPageSkeleton` fallback. All form logic lives in the `OrderForm` component.

## Requirements
- Verify `OrderForm` component is fully functional with all required fields
- Multi-step wizard for customer, cargo, stops, rate and billing
- Customer search/select integration
- Stop management (add/remove/reorder)
- Rate calculation with accessorials

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Form validation with Zod schema
- [ ] Successful submission creates order and navigates to detail

## Dependencies
- Backend: `POST /orders`
- Hook: `apps/web/lib/hooks/tms/use-orders.ts` (useCreateOrder)
- Components: `OrderForm`, `FormPageSkeleton`

## Estimated Effort
L

# BLD-005: Order Edit

**Priority:** P0
**Service:** TMS Core
**Route:** `/operations/orders/[id]/edit`
**Page file:** `apps/web/app/(dashboard)/operations/orders/[id]/edit/page.tsx`

## Current State
Fully built (180 LOC). Loads existing order with `useOrder`, maps to form values via `mapOrderToFormValues` helper. Handles Prisma Decimal conversion with `toNum`. Populates `OrderForm` in edit mode with `initialData` and `orderStatus`. Loading, error, and not-found states all handled with appropriate UI. Uses React 19 `use()` for params.

## Requirements
- Verify all form fields populate correctly from order data
- Ensure Prisma Decimal conversion handles edge cases
- `customFields` fallback parsing for non-column fields (priority, hazmat details, accessorials, payment terms)
- Stop mapping uses index for sequence (verify correctness)

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Form pre-populated with existing order data
- [ ] Save updates order and navigates back

## Dependencies
- Backend: `GET /orders/:id`, `PATCH /orders/:id`
- Hook: `apps/web/lib/hooks/tms/use-orders.ts` (useOrder, useUpdateOrder)
- Components: `OrderForm`

## Estimated Effort
M

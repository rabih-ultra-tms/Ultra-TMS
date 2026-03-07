# BLD-007: Load Create

**Priority:** P0
**Service:** TMS Core
**Route:** `/operations/loads/new`
**Page file:** `apps/web/app/(dashboard)/operations/loads/new/page.tsx`

## Current State
Fully built (120 LOC). Uses `FormPage` pattern with `LoadFormSections`. Supports creating from scratch or pre-filling from an order via `?orderId=` URL param. Uses `useOrder` to fetch order data for pre-fill, `useCreateLoad` for submission. Default values include 2 stops (PICKUP + DELIVERY). Zod validation via `loadFormSchema`.

## Requirements
- Verify `useCreateLoad` connects to backend `POST /loads`
- Order pre-fill maps all fields correctly (stops, cargo, equipment)
- Carrier assignment during creation (optional)
- Accessorials array management

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Order pre-fill works when orderId param present
- [ ] Form validation prevents invalid submissions

## Dependencies
- Backend: `POST /loads`, `GET /orders/:id`
- Hook: `apps/web/lib/hooks/tms/use-loads.ts` (useCreateLoad, useOrder)
- Components: `FormPage`, `LoadFormSections`

## Estimated Effort
M

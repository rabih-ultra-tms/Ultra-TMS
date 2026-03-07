# BLD-018: Payment Detail

**Priority:** P0
**Service:** Accounting
**Route:** `/accounting/payments/[id]`
**Page file:** `apps/web/app/(dashboard)/accounting/payments/[id]/page.tsx`

## Current State
Fully built (452 LOC). Uses `DetailPage` pattern with tabs: Overview (payment details, financial summary, customer, timeline, notes), Allocations (read-only table of invoice allocations), Allocate Payment (interactive allocation to invoices). Actions: Save Allocation (conditional on changes), Delete (conditional on status). Uses `useAllocatePayment` for allocation management. Loads customer's open invoices for allocation via `useInvoices`.

## Requirements
- Verify params typing for Next.js 16 (uses old `{ params: { id: string } }` pattern)
- Verify invoice loading for allocation (fetches up to 100 invoices for the customer)
- Allocation state management syncs correctly with server data via `useEffect`
- Financial calculations (applied, unapplied) must be accurate

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Payment allocation workflow works end-to-end
- [ ] Financial calculations (applied, unapplied) are accurate
- [ ] Status-dependent actions enabled/disabled correctly

## Dependencies
- Backend: `GET /payments-received/:id`, `POST /payments-received/:id/allocate`, `DELETE /payments-received/:id`
- Hook: `apps/web/lib/hooks/accounting/use-payments.ts`, `apps/web/lib/hooks/accounting/use-invoices.ts`
- Components: `DetailPage`, `PaymentStatusBadge`, `PaymentAllocation`

## Estimated Effort
M

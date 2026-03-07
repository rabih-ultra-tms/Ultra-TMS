# BLD-017: Payments List

**Priority:** P0
**Service:** Accounting
**Route:** `/accounting/payments`
**Page file:** `apps/web/app/(dashboard)/accounting/payments/page.tsx`

## Current State
Fully built (120 LOC). Uses `ListPage` pattern with `usePayments` hook. Features: payment filters (status, method, date range), delete payment action, "Record Payment" button opens dialog with `RecordPaymentForm` component (imported from co-located `record-payment-form.tsx`). URL-driven pagination and filtering.

## Requirements
- Verify `RecordPaymentForm` component works end-to-end
- Verify payment deletion connects to backend with proper confirmation
- Filter by payment method (CHECK, ACH, WIRE, CREDIT_CARD)
- Consider adding confirmation dialog before delete

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Record Payment dialog creates payment and refreshes list
- [ ] Delete action works with confirmation

## Dependencies
- Backend: `GET /payments-received`, `POST /payments-received`, `DELETE /payments-received/:id`
- Hook: `apps/web/lib/hooks/accounting/use-payments.ts`
- Components: `ListPage`, `PaymentFilters`, `getPaymentColumns`, `RecordPaymentForm`

## Estimated Effort
S

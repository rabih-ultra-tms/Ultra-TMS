# BACK-009: Payment Recording and Reconciliation

**Priority:** P0
**Module:** `apps/api/src/modules/accounting/`
**Endpoint(s):** `POST /payments-received`, `GET /payments-received`, `GET /payments-received/:id`, `POST /payments-received/:id/allocate`, `DELETE /payments-received/:id`

## Current State
PaymentsReceivedService and controller exist. Frontend payment pages support recording payments, viewing details, and allocating payments to invoices. The allocation workflow manages applied vs unapplied amounts.

## Requirements
- Record payments with method (CHECK, ACH, WIRE, CREDIT_CARD), amount, reference number
- Allocate payment to one or more invoices
- Track applied vs unapplied amounts
- Update invoice status when fully paid
- Payment reversal/void capability
- Reconciliation report (matched vs unmatched payments)

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Allocation updates invoice balances correctly
- [ ] Overpayment handled (credit balance)

## Dependencies
- Prisma model: Payment, PaymentAllocation
- Related modules: accounting/invoices

## Estimated Effort
M

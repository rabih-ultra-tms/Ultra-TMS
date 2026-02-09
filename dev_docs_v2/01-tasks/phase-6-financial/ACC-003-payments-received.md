# ACC-003: Payments Received

> **Phase:** 6 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/06-accounting.md` — Accounting hub
3. `dev_docs/12-Rabih-design-Process/06-accounting/07-payments-received.md` — Design spec

## Objective

Build the Payments Received screens at `/accounting/payments`. List customer payments with record and allocation functionality. One payment can be split across multiple invoices.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/accounting/payments/page.tsx` | Payments list |
| CREATE | `apps/web/app/(dashboard)/accounting/payments/[id]/page.tsx` | Payment detail |
| CREATE | `apps/web/components/accounting/payments-table.tsx` | Payments list columns |
| CREATE | `apps/web/components/accounting/payment-allocation.tsx` | Allocation grid (split across invoices) |
| CREATE | `apps/web/lib/hooks/accounting/use-payments.ts` | Payment hooks |

## Acceptance Criteria

- [ ] `/accounting/payments` renders payments list
- [ ] Record payment form: customer, amount, method (check/ACH/wire/credit card), date, reference #
- [ ] Allocation grid: select invoices to apply payment against, split amounts
- [ ] Payment detail shows allocation breakdown
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: ACC-002 (Invoices must exist for allocation)
- Blocks: None

## Reference

- Hub: `dev_docs_v2/03-services/06-accounting.md`
- Backend: 8 payment received endpoints + `/allocate`

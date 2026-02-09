# ACC-004: Carrier Payables

> **Phase:** 6 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** S (2h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/06-accounting.md` — Accounting hub

## Objective

Build the Carrier Payables list at `/accounting/payables`. Shows amounts owed to carriers for delivered loads. Linked from load data.

**Business rules:**
- Carrier eligible for payment after: load DELIVERED + POD received + payment terms elapsed
- Quick pay discount: `(daysEarly × 0.02 × carrierRate) / 30`

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/accounting/payables/page.tsx` | Payables list |
| CREATE | `apps/web/components/accounting/payables-table.tsx` | Payables columns |
| CREATE | `apps/web/lib/hooks/accounting/use-payables.ts` | Payables hooks |

## Acceptance Criteria

- [ ] `/accounting/payables` renders carrier payables list
- [ ] Columns: carrier, load #, amount, status (pending/eligible/paid), delivery date, payment due
- [ ] Filter by carrier, status, date range
- [ ] Quick pay indicator for eligible payables
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: PATT-001
- Blocks: ACC-005 (Settlements group payables)

## Reference

- Hub: `dev_docs_v2/03-services/06-accounting.md`
- Backend: `GET /api/v1/payments-made` (payables)

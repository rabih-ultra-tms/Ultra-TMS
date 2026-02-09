# COM-004: Commission Transactions

> **Phase:** 6 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (3h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/08-commission.md` — Commission hub

## Objective

Build the Commission Transactions list at `/commissions/transactions`. Shows all earned commissions with approve/void actions. Filter by rep, date range, status.

**Status machine:** PENDING → APPROVED → PAID/VOID

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/commissions/transactions/page.tsx` | Transactions list |
| CREATE | `apps/web/components/commissions/transactions-table.tsx` | Transaction columns |
| CREATE | `apps/web/lib/hooks/commissions/use-transactions.ts` | Transaction hooks |

## Acceptance Criteria

- [ ] `/commissions/transactions` renders transactions list
- [ ] Columns: date, rep name, load #, order amount, margin %, commission amount, status
- [ ] Filters: rep (search), date range, status (multi-select)
- [ ] Approve button → POST `/approve` (for PENDING transactions)
- [ ] Void button → POST `/void` with reason (ConfirmDialog)
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: PATT-001
- Blocks: COM-005 (Payouts aggregate approved transactions)

## Reference

- Hub: `dev_docs_v2/03-services/08-commission.md`
- Backend: 4 transaction endpoints

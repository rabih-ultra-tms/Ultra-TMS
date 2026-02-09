# COM-005: Payout Processing

> **Phase:** 6 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/08-commission.md` — Commission hub

## Objective

Build the Payout Processing screens at `/commissions/payouts`. Generate payouts from approved transactions, then process them (ACH/check/wire).

**Payout status:** PENDING → PROCESSING → PAID/FAILED

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/commissions/payouts/page.tsx` | Payouts list |
| CREATE | `apps/web/app/(dashboard)/commissions/payouts/[id]/page.tsx` | Payout detail |
| CREATE | `apps/web/components/commissions/payout-table.tsx` | Payout columns |
| CREATE | `apps/web/components/commissions/payout-detail-card.tsx` | Payout detail with transactions |
| CREATE | `apps/web/lib/hooks/commissions/use-payouts.ts` | Payout hooks |

## Acceptance Criteria

- [ ] `/commissions/payouts` renders payouts list
- [ ] "Generate Payout" → POST `/api/v1/commissions/payouts` (aggregates approved transactions for rep)
- [ ] Payout detail: rep, total amount, transactions included, payment method
- [ ] "Process" button → POST `/process` with method (ACH/check/wire)
- [ ] Status badges: PENDING, PROCESSING, PAID, FAILED
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: COM-004 (Transactions must be approved first)
- Blocks: None

## Reference

- Hub: `dev_docs_v2/03-services/08-commission.md`
- Backend: 4 payout endpoints

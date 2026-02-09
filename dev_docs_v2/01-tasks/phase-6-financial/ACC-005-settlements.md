# ACC-005: Settlements

> **Phase:** 6 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/06-accounting.md` — Accounting hub (settlement endpoints)

## Objective

Build the Settlements screens at `/accounting/settlements`. Settlements group multiple carrier payables into a single payout. Workflow: create settlement → approve → process payout.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/accounting/settlements/page.tsx` | Settlements list |
| CREATE | `apps/web/app/(dashboard)/accounting/settlements/[id]/page.tsx` | Settlement detail |
| CREATE | `apps/web/components/accounting/settlement-table.tsx` | Settlement list columns |
| CREATE | `apps/web/components/accounting/settlement-detail-card.tsx` | Settlement detail with line items |
| CREATE | `apps/web/lib/hooks/accounting/use-settlements.ts` | Settlement hooks |

## Acceptance Criteria

- [ ] `/accounting/settlements` renders settlement list
- [ ] Create settlement: select carrier + payables to group
- [ ] Settlement detail: line items, total, deductions, net payout
- [ ] Approve button → POST `/approve`
- [ ] Process button → POST `/process` (after approval)
- [ ] Status badges: Created → Approved → Processed → Paid
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: ACC-004 (Payables must exist)
- Blocks: None

## Reference

- Hub: `dev_docs_v2/03-services/06-accounting.md`
- Backend: 10 settlement endpoints

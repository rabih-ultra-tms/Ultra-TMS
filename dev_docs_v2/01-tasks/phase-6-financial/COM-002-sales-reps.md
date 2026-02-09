# COM-002: Sales Reps List + Detail

> **Phase:** 6 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/08-commission.md` — Commission hub

## Objective

Build the Sales Reps list and detail pages. List shows reps with assigned plan, pending earnings, and MTD/YTD totals. Detail shows transaction history and plan assignment.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/commissions/reps/page.tsx` | Reps list |
| CREATE | `apps/web/app/(dashboard)/commissions/reps/[id]/page.tsx` | Rep detail |
| CREATE | `apps/web/components/commissions/rep-commissions-table.tsx` | Reps table columns |
| CREATE | `apps/web/components/commissions/rep-detail-card.tsx` | Rep summary + transaction history |
| CREATE | `apps/web/lib/hooks/commissions/use-reps.ts` | Reps hooks |

## Acceptance Criteria

- [ ] `/commissions/reps` renders reps list
- [ ] Columns: name, email, assigned plan, pending earnings, paid MTD, paid YTD
- [ ] `/commissions/reps/:id` renders rep detail with summary + transaction history
- [ ] "Assign Plan" button → select plan from dropdown
- [ ] Transaction history: date, load #, amount, status, plan used
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: PATT-001, PATT-002
- Blocks: None

## Reference

- Hub: `dev_docs_v2/03-services/08-commission.md`
- Backend: 4 sales rep endpoints

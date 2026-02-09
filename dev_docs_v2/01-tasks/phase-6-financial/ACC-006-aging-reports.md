# ACC-006: Aging Reports

> **Phase:** 6 | **Priority:** P2 | **Status:** NOT STARTED
> **Effort:** M (3h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/06-accounting.md` — Accounting hub

## Objective

Build the Aging Reports page at `/accounting/reports/aging`. Visualizes outstanding receivables by age bucket: 0-30, 31-60, 61-90, 90+ days. Critical for Emily (AR Specialist) to manage collections.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/accounting/reports/aging/page.tsx` | Aging report page |
| CREATE | `apps/web/components/accounting/aging-report.tsx` | Bucket visualization (bar chart + table) |
| CREATE | `apps/web/lib/hooks/accounting/use-aging.ts` | Aging report hooks |

## Acceptance Criteria

- [ ] `/accounting/reports/aging` renders aging report
- [ ] Bar chart: 4 buckets (0-30, 31-60, 61-90, 90+ days) with dollar amounts
- [ ] Detail table: customers with outstanding amounts per bucket
- [ ] Click customer → drills down to their invoices
- [ ] Filter by customer, date as-of
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: ACC-002 (Invoices data)
- Blocks: None

## Reference

- Hub: `dev_docs_v2/03-services/06-accounting.md`
- Backend: `GET /api/v1/accounting/aging`
- Persona: Emily (AR Specialist) — DSO reduction, visibility

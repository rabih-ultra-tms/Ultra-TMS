# COM-006: Commission Reports

> **Phase:** 6 | **Priority:** P2 | **Status:** NOT STARTED
> **Effort:** S (2h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/08-commission.md` — Commission hub

## Objective

Build the Commission Reports page at `/commissions/reports`. Three report types: rep earnings by month, plan usage analysis, and payout summary.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/commissions/reports/page.tsx` | Reports page |
| CREATE | `apps/web/components/commissions/earnings-chart.tsx` | Monthly earnings chart |

## Acceptance Criteria

- [ ] `/commissions/reports` renders reports page
- [ ] Rep earnings chart: bar chart showing monthly earnings per rep
- [ ] Plan usage: which plans are active, how many reps on each
- [ ] Payout summary: total paid by month, by method
- [ ] Date range filter
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: COM-001 (Dashboard provides context)
- Blocks: None

## Reference

- Hub: `dev_docs_v2/03-services/08-commission.md`

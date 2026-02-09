# COM-003: Commission Plans CRUD

> **Phase:** 6 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** L (6h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/08-commission.md` — Commission hub
3. `dev_docs/12-Rabih-design-Process/08-commission/02-commission-plans.md` — Design spec

## Objective

Build Commission Plans list and editor. Plans define how reps earn commissions. Supports 4 plan types with a tier editor for tiered plans.

**Business rules — tiered commission rates by margin %:**
- ≥25% margin: tier3 rate (e.g., 15%)
- ≥18% margin: tier2 rate (e.g., 12%)
- ≥12% margin: tier1 rate (e.g., 10%)
- <12% margin: base rate (e.g., 8%)

**Plan types:** PERCENTAGE, FLAT, TIERED_PERCENTAGE, TIERED_FLAT

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/commissions/plans/page.tsx` | Plans list |
| CREATE | `apps/web/app/(dashboard)/commissions/plans/new/page.tsx` | Create plan |
| CREATE | `apps/web/app/(dashboard)/commissions/plans/[id]/page.tsx` | Plan detail |
| CREATE | `apps/web/components/commissions/commission-plan-card.tsx` | Plan summary card |
| CREATE | `apps/web/components/commissions/commission-plan-form.tsx` | Plan create/edit form |
| CREATE | `apps/web/components/commissions/tier-editor.tsx` | Tier configuration (add/remove tiers with min/max/rate) |
| CREATE | `apps/web/lib/hooks/commissions/use-plans.ts` | Plans hooks |

## Acceptance Criteria

- [ ] `/commissions/plans` renders plans list with type, name, active status
- [ ] `/commissions/plans/new` renders create form with plan type selector
- [ ] For TIERED types: tier editor allows add/remove tiers with min margin %, max margin %, rate %
- [ ] "Set as Default" action → POST `/activate`
- [ ] Plan detail shows configuration + which reps use this plan
- [ ] Zod validation
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: PATT-001, PATT-003
- Blocks: COM-002 (Reps reference plans)

## Reference

- Hub: `dev_docs_v2/03-services/08-commission.md`
- Backend: 6 commission plan endpoints

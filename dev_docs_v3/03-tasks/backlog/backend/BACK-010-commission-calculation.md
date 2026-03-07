# BACK-010: Commission Calculation Engine

**Priority:** P0
**Module:** `apps/api/src/modules/commission/`
**Endpoint(s):** Commission plans CRUD, commission entries, commission payouts, commission dashboard

## Current State
Commission module exists with full structure: `commission-plans.service.ts`, `commission-entries.service.ts`, `commission-payouts.service.ts`, `commissions-dashboard.service.ts` plus corresponding controllers. All have spec files. Need to verify these are wired up and calculating correctly.

## Requirements
- Commission plan configuration (percentage, flat rate, tiered)
- Auto-calculate commission entries when loads are delivered
- Commission tied to sales rep / agent on order
- Payout generation and tracking
- Dashboard with commission summaries
- Support multiple commission structures per plan

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Commission auto-calculates on load delivery
- [ ] Dashboard shows accurate commission data

## Dependencies
- Prisma model: CommissionPlan, CommissionEntry, CommissionPayout
- Related modules: tms/loads, tms/orders, auth (users/sales reps)

## Estimated Effort
L

# MP-09 Chunk 3: Contracts Frontend (8 Tasks)

> **Status:** Starting 2026-03-15
> **Scope:** Build all 8 Contracts pages (dashboard, list, detail, builder, edit, templates, renewals, reports)
> **Dependencies:** Chunk 1 (API client, hooks, validators) — COMPLETE ✅
> **Effort:** 8 tasks, ~30 hours
> **Backend:** 58 endpoints across 8 controllers, all built + tested

---

## Overview

Contracts is the **richest P2 backend** (58 endpoints!) with complex state management (approval workflow, amendments, rate tables, SLAs, volume commitments, fuel surcharge). This chunk builds all 8 frontend pages to match the backend capability.

**Backend Stats:**
- 8 controllers (Contracts, RateTables, RateLanes, Templates, Amendments, FuelSurcharge, VolumeCommitments, SLAs)
- 58 endpoints verified by PST-15 tribunal
- 13 Prisma models (Contract, Amendment, RateTable, RateLane, SLA, VolumeCommitment, FuelSurchargeTable, FuelSurchargeTier, Template, Metric, Clause, LaneRate, RateContract)
- 6 enums (ContractType, ContractStatus, RateUnit, FuelSurchargeUnit, AmendmentType, SLAMetric)

**Frontend Tasks (8 pages):**
1. Dashboard — KPIs (active, expiring, expired, revenue under contract)
2. List — Filterable by type, status, customer, carrier
3. Detail — Tabs (Overview, Rate Tables, Lanes, Amendments, SLAs, Volume, Documents)
4. Builder — 4-step wizard (type/party, terms, rates, SLAs, review)
5. Edit — Edit with amendment tracking
6. Templates — Template library for reuse
7. Renewals — Upcoming renewals queue
8. Reports — Expiry, rate comparison, volume vs commitment

---

## Task 1: Contracts Dashboard

**Files:**
- `apps/web/app/(dashboard)/contracts/page.tsx`
- `apps/web/app/(dashboard)/contracts/layout.tsx`
- `apps/web/components/contracts/ContractsDashboardStats.tsx`

**Requirements:**
- 4 KPI cards: Active Contracts, Expiring (30 days), Expired, Revenue Under Contract
- Recent contracts list
- Chart: Contract status distribution
- Link to `/contracts/list`

---

## Task 2: Contracts List

**Files:**
- `apps/web/app/(dashboard)/contracts/list/page.tsx`
- `apps/web/components/contracts/ContractFilters.tsx`
- `apps/web/components/contracts/ContractCard.tsx`

**Requirements:**
- Filterable by: Type, Status, Customer, Carrier, Date Range
- Paginated list (20 per page)
- Each row: ID, parties, status badge, expiry date, revenue

---

## Task 3: Contracts Detail

**Files:**
- `apps/web/app/(dashboard)/contracts/[id]/page.tsx`
- `apps/web/components/contracts/ContractDetailTabs.tsx`
- `apps/web/components/contracts/ContractOverviewTab.tsx`
- `apps/web/components/contracts/RateTablesTab.tsx`
- `apps/web/components/contracts/AmendmentsTab.tsx`
- `apps/web/components/contracts/SLAsTab.tsx`
- (Additional tabs for Lanes, Volume, Documents)

**Requirements:**
- 7 tabs: Overview, Rate Tables, Lanes, Amendments, SLAs, Volume, Documents
- Complex tab content (rate tables with nested lanes, amendment history, SLA tracking)

---

## Task 4: Contract Builder (Wizard)

**Files:**
- `apps/web/app/(dashboard)/contracts/new/page.tsx`
- `apps/web/components/contracts/ContractBuilder.tsx`
- `apps/web/components/contracts/BuilderStep1.tsx` (Type, Parties)
- `apps/web/components/contracts/BuilderStep2.tsx` (Terms)
- `apps/web/components/contracts/BuilderStep3.tsx` (Rates)
- `apps/web/components/contracts/BuilderStep4.tsx` (SLAs)

**Requirements:**
- 4-step wizard
- Step 1: Contract type, customer, carrier, contract period
- Step 2: Payment terms, currency, incoterms
- Step 3: Rate table builder (lanes and pricing)
- Step 4: SLA settings, review

---

## Task 5: Contract Edit

**Files:**
- `apps/web/app/(dashboard)/contracts/[id]/edit/page.tsx`

**Requirements:**
- Edit form for active contracts
- Create amendment when edited (not direct update)
- Show amendment history
- Approval workflow

---

## Task 6: Contract Templates

**Files:**
- `apps/web/app/(dashboard)/contracts/templates/page.tsx`
- `apps/web/components/contracts/TemplateCard.tsx`
- `apps/web/components/contracts/TemplateBuilder.tsx`

**Requirements:**
- Template library view
- Create/edit/delete templates
- Clone template → new contract

---

## Task 7: Contract Renewals

**Files:**
- `apps/web/app/(dashboard)/contracts/renewals/page.tsx`

**Requirements:**
- Queue of expiring contracts (30+ days)
- Renew button
- Auto-renewal settings

---

## Task 8: Contract Reports

**Files:**
- `apps/web/app/(dashboard)/contracts/reports/page.tsx`

**Requirements:**
- Expiry report (by month)
- Rate comparison report
- Volume vs commitment tracking
- Fuel surcharge impact

---

## Quality Gates

✅ All TypeScript strict mode
✅ All Zod validation
✅ All API integration
✅ Loading/error/empty states
✅ Responsive design
✅ Accessible

---

## Success Criteria

- [ ] All 8 pages built
- [ ] All tabs/workflows functional
- [ ] All API endpoints tested
- [ ] TypeScript checks pass
- [ ] Build passes
- [ ] Spec compliance approved
- [ ] Code quality approved

---

## Timeline

**Mon-Wed:** Tasks 1-4 (dashboard, list, detail, builder)
**Thu-Fri:** Tasks 5-8 (edit, templates, renewals, reports)

---

## Notes

- Contracts is **revenue-critical** — ensure accuracy in rate calculations, SLA tracking
- Rate table builder is complex — may need dedicated component
- Amendment workflow requires careful state management
- Use Commission (8.5/10) as quality reference


# PST-08: Commission

> **Service:** Commission (08)
> **Hub file:** `dev_docs_v3/01-services/p0-mvp/08-commission.md`
> **Auditor:** Claude Code (Opus 4.6)
> **Date:** 2026-03-08
> **Verdict:** MODIFY
> **Hub Score:** 8.0/10 → **Verified Score: 8.5/10** (+0.5)

---

## Executive Summary

Commission is the **cleanest P0 service audited so far** — and the hub is the most accurate of any hub reviewed. However, significant gaps remain: the hub documents 3 data models with ~45 fields; reality is **7 Prisma models with 169 fields**. The hub lists 9 endpoints; reality is **31 endpoints across 5 controllers**. The hub names the models wrong ("Commission" → actual is `CommissionEntry`, "CommissionPayment" → actual is `CommissionPayout`). Four entire models are missing from the hub: `CommissionPlanTier`, `UserCommissionAssignment`, `AgentCommission`, `AgentPayout`.

**Biggest finding:** The hub says security is "Unknown" — reality is **100% auth guard coverage on all 31 endpoints**. Issue #3 in the known issues list is FALSE. Additionally, the hub claims 14 frontend tests exist but completely misses the **42 backend test cases** across 4 spec files. This is the first P0 service with comprehensive backend test coverage.

**Soft-delete gap:** 21/34 service methods (60%) don't filter `deletedAt: null` — CommissionEntry, CommissionPayout, and AgentCommission queries will return deleted records. CommissionPlans is the only sub-service that properly filters.

**Frontend quality confirmed:** All 5 hooks use a consistent `unwrap()` helper for envelope handling — tied with Accounting for best envelope consistency across all P0 services. All 11 pages match hub descriptions. The 8.5/10 average quality rating is accurate.

---

## Phase 1: Data Model Audit

### Hub Claims vs Reality

| Hub Model | Actual Model | Hub Fields | Actual Fields | Accuracy |
|-----------|-------------|------------|---------------|----------|
| Commission | **CommissionEntry** | 16 | 35 | ~40% — wrong model name, missing 19 fields (entryType, calculationBasis, basisAmount, isSplit, splitPercent, parentEntryId, commissionPeriod, notes, reversedAt, reversedBy, reversalReason, payoutId, paidAt, createdById, updatedById, customFields, deletedAt, externalId, sourceSystem). Hub has phantom fields: `grossRevenue`, `commissionRate`, `adjustmentAmt`, `finalAmt` (not in Prisma) |
| CommissionPlan | CommissionPlan | 11 | 23 | ~50% — missing 12 fields (description, planType, status, effectiveDate, endDate, flatAmount, percentRate, calculationBasis, minimumMarginPercent, rules, customFields, externalId, sourceSystem). Hub has phantom fields: `baseRate`, `bonusTriggers`, `salesRepId` (not in Prisma — plans use UserCommissionAssignment for rep linking) |
| CommissionPayment | **CommissionPayout** | 10 | 28 | ~30% — wrong model name, completely different structure. Hub says simple `totalAmt + method + referenceNum`; actual has `payoutNumber`, `grossCommission`, `drawRecovery`, `adjustments`, `netPayout`, approval workflow (`approvedBy`, `approvedAt`), `paymentMethod`, `paymentReference`, `paidAt`, migration fields |

### Models Missing From Hub (4 total)

| Model | Fields | Purpose | Critical? |
|-------|--------|---------|-----------|
| CommissionPlanTier | 18 | Tier definitions (thresholdType, thresholdMin/Max, rateType, rateAmount, periodType) — separate table, not JSON as hub claims | YES |
| UserCommissionAssignment | 19 | Links users to plans with overrides (overrideRate, overrideFlat, drawAmount, drawRecoverable, effectiveDate/endDate) | YES |
| AgentCommission | 25 | Separate commission tracking for agents (agentId, splitRate, splitType, commissionBase, grossCommission, netCommission, loadMargin, loadRevenue) | YES |
| AgentPayout | 21 | Agent-specific payouts with statement documents and draw recovery | YES |

### Hub Data Model Accuracy: ~25%

The hub describes a simplified 3-model system. Reality has **7 Prisma models with 169 total fields**. Key structural errors:
1. **Wrong model names:** "Commission" → `CommissionEntry`, "CommissionPayment" → `CommissionPayout`
2. **Tiers are a separate table**, not JSON as hub claims (`CommissionPlanTier` with 18 fields, proper `thresholdType`/`rateType` enums)
3. **Plans don't have `salesRepId`** — rep-to-plan linking uses `UserCommissionAssignment` (many-to-many with overrides)
4. **Entire Agent commission system undocumented** — `AgentCommission` + `AgentPayout` models with agent-specific split tracking
5. Hub `Commission.grossRevenue/commissionRate/adjustmentAmt/finalAmt` are phantom fields (Prisma uses `basisAmount/rateApplied/commissionAmount`)

---

## Phase 2: API Endpoints Audit

### Hub Claims: 9 endpoints → Actual: 31 endpoints (3.4x more)

| Controller | Hub Endpoints | Actual Endpoints | Missing From Hub |
|-----------|--------------|-----------------|------------------|
| CommissionEntries | 3 (list, detail, calculate) | 7 | +4 (approve, reverse, calculate-for-load, user-earnings) |
| CommissionPayouts | 2 (list, record) | 6 | +4 (detail, approve, process, void) |
| CommissionPlans | 3 (list, create, update) | 6 | +3 (detail, delete, get-active) |
| CommissionsDashboard | 1 (stats) | 9 | +8 (reports, reps list/detail/transactions/assign-plan, transactions list/approve/void) — **entire controller practically missing from hub** |
| AgentCommissions | 0 | 3 | **Entire controller missing** (agent commissions list, agent performance, agent rankings) |

### Endpoint Routing Detail

Hub claims all endpoints are under `/api/v1/commission` (singular). Actual routing:
- `/commissions/entries/*` — 7 endpoints
- `/commissions/payouts/*` — 6 endpoints
- `/commissions/plans/*` — 6 endpoints
- `/commissions/dashboard`, `/commissions/reports`, `/commissions/reps/*`, `/commissions/transactions/*` — 9 endpoints
- `/agents/:id/commissions`, `/agents/:id/performance`, `/agents/rankings` — 3 endpoints

Hub uses singular `/commission`; actual uses plural `/commissions`. Frontend hooks correctly use plural.

### Known Issues That Are FALSE

| Hub Issue | Severity | Verdict | Evidence |
|-----------|----------|---------|----------|
| "Security guards on commission endpoints need verification" (#3) | P1 | **FALSE — ALL 31 ENDPOINTS HAVE GUARDS** | Every controller uses `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles()` with appropriate role restrictions. Class-level guards on CommissionsDashboard and AgentCommissions controllers. |

### Known Issues Still Valid

| Hub Issue | Severity | Verdict | Evidence |
|-----------|----------|---------|----------|
| "Commission auto-calculation trigger needs verification" (#1) | P1 | **VALID** | `calculateLoadCommission()` method exists in CommissionEntriesService but needs runtime verification that it's triggered on invoice PAID event. No event listener or cron job found — likely needs manual trigger or accounting integration. |

---

## Phase 3: Frontend Audit

### Screens (Hub Section 3)

| Screen | Hub Quality | Verified Quality | Delta | Notes |
|--------|------------|-----------------|-------|-------|
| Commission Dashboard | 9/10 | 9/10 | 0 | KPI stats via `useCommissionDashboard`, quick links, top reps table |
| Plans List | 8/10 | 8/10 | 0 | Search, type filter, pagination, CRUD links |
| Plan Detail | 8/10 | 8/10 | 0 | Plan card with tier details, assigned reps |
| Plan Create | 9/10 | 9/10 | 0 | Full form with TierEditor component |
| Plan Edit | 9/10 | 9/10 | 0 | Edit form with loading + error states |
| Sales Reps List | 8/10 | 8/10 | 0 | Rep table with commission totals, search + pagination |
| Sales Rep Detail | 8/10 | 8/10 | 0 | KPIs + plan assignment + transaction history |
| Transactions | 8/10 | 8/10 | 0 | Search, status/date filters, approve/void actions |
| Payouts List | 8/10 | 8/10 | 0 | Status filter, generate payout dialog |
| Payout Detail | 8/10 | 8/10 | 0 | Summary + included transactions + process action |
| Reports | 8/10 | 8/10 | 0 | Earnings chart, plan usage, payout summary, date range |

**Screen ratings: ACCURATE.** This is the only P0 service where hub screen quality scores match reality. Average: 8.3/10.

### Components (Hub Section 5)

Hub claims 10 components. Reality: **10 components confirmed** — all names and paths match.

Notable: `EarningsChart.tsx` actually exports 3 components (`EarningsChart`, `PlanUsageCard`, `PayoutSummaryCard`). `PayoutDetailCard.tsx` exports 2 (`PayoutSummary`, `PayoutTransactions`). `RepDetailCard.tsx` exports 2 (`RepSummary`, `TransactionHistory`). Total exported components: ~16.

Uses TMS design system `KpiCard` from `@/components/tms/stats/kpi-card` in dashboard stats and rep detail.

### Hooks (Hub Section 6)

Hub claims 5 hooks. Reality: **5 hook files with 16+ exported hook functions**.

| Hook File | Hub Lists | Actual Exports | Hidden Functions |
|-----------|-----------|---------------|------------------|
| use-commission-dashboard.ts | 1 hook | 1 hook + 2 interfaces + query keys | — |
| use-plans.ts | 1 hook | 6 hooks (usePlans, usePlan, useCreatePlan, useUpdatePlan, useDeletePlan, useActivatePlan) + 7 types | Hub misses 5 CRUD hooks |
| use-reps.ts | 1 hook | 4 hooks (useReps, useRep, useRepTransactions, useAssignPlan) | Hub misses 3 hooks |
| use-transactions.ts | 1 hook | 3 hooks (useTransactions, useApproveTransaction, useVoidTransaction) | Hub misses 2 mutation hooks |
| use-payouts.ts | 1 hook | 4 hooks (usePayouts, usePayout, useGeneratePayout, useProcessPayout) | Hub misses 3 hooks |

Hub lists 5 hooks; reality is **18 hook functions** (3.6x more). This matches cross-cutting finding #15.

### Envelope Unwrapping

All 5 hooks use the same pattern:

```typescript
function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}
```

For list queries, hooks additionally extract pagination manually: `const raw = response as { data: any[]; pagination: ... }`.

**Verdict: BEST envelope consistency** — identical pattern across all files, no anti-patterns. Tied with Accounting for cleanest implementation.

### Data Transformations

Two hooks include `mapPayout()` and `mapTransaction()` functions that transform backend field names to frontend interfaces (e.g., `user.firstName + user.lastName` → `repName`, status `REVERSED` → `VOID`). Well-structured.

Frontend plan types (PERCENTAGE, FLAT, TIERED_PERCENTAGE, TIERED_FLAT) are mapped to backend types (PERCENT_REVENUE, FLAT_FEE, TIERED, CUSTOM) in the plan form component.

---

## Phase 4: Security & Quality Audit

### Auth Guards: 100% ✓

All 31 endpoints across 5 controllers have `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles()`. Role assignments are appropriate:
- **ADMIN only:** Create/update/delete plans, process payouts
- **ADMIN + ACCOUNTING:** Create entries, create payouts, calculate commissions
- **ADMIN + ACCOUNTING + SALES_MANAGER + AGENT_MANAGER:** Read entries/payouts
- **Dashboard endpoints:** Broader access (includes ACCOUNTING_MANAGER, SUPER_ADMIN)
- **Agent endpoints:** ADMIN + AGENT_MANAGER + ACCOUNTING + AGENT

**No role guard gaps found.** This disproves cross-cutting finding #17 for Commission (Accounting had 6/10 controllers missing guards; Commission has 0 gaps).

### Tenant Isolation: 100% ✓

All 34 service methods filter by `tenantId`. Create operations set `tenantId`. No cross-tenant mutation vectors found. This is the **cleanest tenant isolation of any P0 service**.

### Soft-Delete Filtering: 60% ⚠️

| Sub-Service | Methods | Filters deletedAt? | Verdict |
|-------------|---------|-------------------|---------|
| CommissionPlans | 7 | YES (6/6 queries) | ✓ CLEAN |
| CommissionEntries | 7 | NO (0/7 queries) | ⚠️ GAP |
| CommissionPayouts | 6 | NO (0/6 queries) | ⚠️ GAP |
| CommissionsDashboard | 11 | PARTIAL (3/8 queries) | ⚠️ GAP |
| AgentCommissions | 3 | NO (0/3 queries) | ⚠️ GAP |

**Impact:** Deleted commission entries and payouts will appear in queries, inflate dashboard KPIs, and show in transaction lists. All models have `deletedAt` field but only Plans service filters it.

### Tests

| Layer | Hub Claims | Actual | Delta |
|-------|-----------|--------|-------|
| Frontend | 14 tests, 3 suites | 21 tests, 3 suites | +7 tests (hub undercounts) |
| Backend | **Not mentioned** | **42 tests, 4 spec files** | **Hub completely misses backend tests** |
| **Total** | **14** | **63** | **+49 tests (+350%)** |

Backend test breakdown:
- `commission-entries.service.spec.ts` — 12 tests (CRUD, approve, reverse, load commission calc)
- `commission-payouts.service.spec.ts` — 17 tests (CRUD, approval, processing, void, draw recovery)
- `commission-plans.service.spec.ts` — 7 tests (CRUD, soft-delete, tiers, active plans)
- `agent-commissions.service.spec.ts` — 6 tests (list, performance, rankings)

This is the **most tested P0 service** — 63 total tests. Hub claims Commission is "zero anti-patterns found" but misses all backend tests.

### Transaction Safety

Multi-step operations like `createPayout` (create payout + link entries) and `processPayout` (update payout + mark entries PAID) are **NOT wrapped in Prisma transactions**. Race conditions could leave entries linked to a failed payout or marked PAID without a completed payout.

---

## Phase 5: Adversarial Tribunal (5 Rounds)

### Round 1: Hub Accuracy Challenge

**Prosecution:** The hub claims 3 models, 9 endpoints, 5 hooks. Reality: 7 models, 31 endpoints, 18 hook functions. Hub data model accuracy is ~25%. Model names are wrong. The hub is fundamentally inaccurate.

**Defense:** Unlike previous services (Accounting 15%, TMS Core 30%), Commission's hub at least gets the screen inventory, component list, and quality ratings right. The frontend documentation is the most accurate of any P0 hub. The data model and endpoint sections are outdated but the hub itself acknowledges them as "Partial."

**Verdict:** Hub accuracy is MIXED. Frontend sections: 90%+ accurate (best of any P0). Backend sections: 25-30% accurate (better than Accounting's 15% but still poor). **MODIFY — rewrite Sections 4, 6, 8; Sections 1-3, 5 are largely fine.**

### Round 2: "Cleanest Implementation" Claim Challenge

**Prosecution:** The hub claims Commission is "the cleanest implementation — zero anti-patterns found." But 60% of backend queries lack soft-delete filtering. Multi-step operations lack transaction wrapping. That's not "zero anti-patterns."

**Defense:** In the context of what was audited at the time (frontend code quality, envelope handling, component structure, no hardcoded data, no TODOs), the claim was valid. The soft-delete gap is a cross-cutting systemic issue affecting ALL services, not a Commission-specific anti-pattern.

**Verdict:** The "zero anti-patterns" claim should be **qualified** — "zero frontend anti-patterns." Backend has 2 gaps (soft-delete, transactions). Still the cleanest service overall, but the claim needs context.

### Round 3: Test Coverage Challenge

**Prosecution:** Hub says "14 FE tests" and doesn't mention backend tests at all. Reality is 63 tests (21 FE + 42 BE). This massively understates test coverage and will cause QS tasks to double-count test-writing effort.

**Defense:** The hub was written before backend spec files were added. The known issues section correctly updated the "No tests" claim to "FIXED — 14 FE tests exist" but never scanned for backend tests.

**Verdict:** Hub must update test count from 14 to 63, add backend test inventory, and re-evaluate COMM-108 task ("Write commission tests") — backend already has 42 tests, effort should focus on integration tests and coverage gaps, not starting from scratch.

### Round 4: Agent Commission System Challenge

**Prosecution:** The hub doesn't mention agents at ALL. There's an entire `AgentCommission` model (25 fields), `AgentPayout` model (21 fields), `AgentCommissionsController` (3 endpoints), and `AgentCommissionsService` (3 methods) — all completely undocumented. Business rules section mentions "Sales Reps" but agents have a parallel commission system.

**Defense:** The Agent system was likely added after the hub was written. It's a separate module (`modules/agents/commissions/`) rather than part of the core commission module.

**Verdict:** The hub MUST document the agent commission system. The business rules section needs a new rule about agent vs sales rep commission tracking. The data model section needs AgentCommission + AgentPayout. **This is the only P0 service with a dual-entity commission structure.**

### Round 5: Auto-Calculation Trigger Challenge

**Prosecution:** The hub's #1 known issue — "Commission auto-calculation trigger (on invoice PAID) needs verification" — has been listed since the hub was created. `calculateLoadCommission()` exists in the service but there's no event listener, no cron job, and no accounting integration that calls it automatically. This is likely a manual-only calculation, not auto-triggered.

**Defense:** The method IS implemented with complex plan-type handling (flat fee, percent revenue, percent margin, tiered). It needs a trigger mechanism wired in, but the calculation logic itself is complete.

**Verdict:** COMM-107 task ("Verify auto-calculation trigger") should be **reclassified to "Wire auto-calculation trigger"** — the trigger mechanism doesn't exist, it needs to be BUILT (event listener on invoice status change). The calculation logic is ready.

---

## Final Verdict: MODIFY

### Health Score: 8.0/10 → 8.5/10 (+0.5)

| Dimension | Hub Score | Verified Score | Notes |
|-----------|----------|---------------|-------|
| Frontend Quality | 8.5/10 | 8.5/10 | Accurate — cleanest implementation, best envelope consistency |
| Backend Quality | 6/10 (implied "Partial") | 8.5/10 | 31 endpoints, 100% guards, 100% tenant isolation, 42 tests |
| Documentation Accuracy | 8/10 (high confidence) | 5/10 | Frontend sections accurate, backend sections ~25% accurate |
| Test Coverage | 3/10 (14 tests) | 7/10 (63 tests) | Hub misses all backend tests |
| Security | Unknown | 9/10 | 100% guards, 100% tenant isolation, soft-delete gap |

**Overall: 8.5/10** — Commission is genuinely the strongest P0 service. Best envelope consistency, best tenant isolation, most tested, no role guard gaps. Main gaps: soft-delete filtering (60% coverage), missing transaction wrapping, undocumented agent commission system.

---

## Action Items

| # | Action | Priority | Effort | Owner |
|---|--------|----------|--------|-------|
| 1 | Rewrite hub Section 8 (Data Model) — fix model names (Commission→CommissionEntry, CommissionPayment→CommissionPayout), add 4 missing models (CommissionPlanTier, UserCommissionAssignment, AgentCommission, AgentPayout), fix tiers from JSON to separate table | P0 | 2h | Claude Code |
| 2 | Rewrite hub Section 4 (API Endpoints) — 31 actual vs 9 documented, add CommissionsDashboard (9 endpoints) and AgentCommissions (3 endpoints) controllers, fix route prefix to plural `/commissions/` | P0 | 1-2h | Claude Code |
| 3 | Update hub Section 6 (Hooks) — 18 hook functions not 5, list all CRUD/mutation hooks per file | P0 | 30min | Claude Code |
| 4 | Close known issue #3 (security guards) — FALSE, all 31 endpoints have JwtAuthGuard + RolesGuard | P0 | 5min | Claude Code |
| 5 | Update hub test count from 14 to 63, add backend test inventory (4 spec files, 42 tests) | P0 | 15min | Claude Code |
| 6 | Add `deletedAt: null` filter to CommissionEntry queries (7 methods) | P1 | 1h | Claude Code |
| 7 | Add `deletedAt: null` filter to CommissionPayout queries (6 methods) | P1 | 1h | Claude Code |
| 8 | Add `deletedAt: null` filter to AgentCommission queries (3 methods) | P1 | 30min | Claude Code |
| 9 | Wrap `createPayout` and `processPayout` in Prisma `$transaction` blocks | P1 | 1h | Claude Code |
| 10 | Reclassify COMM-107 from "Verify" to "Wire auto-calculation trigger" — need event listener on invoice PAID | P1 | 3-4h | Claude Code |
| 11 | Re-evaluate COMM-108 ("Write commission tests") — 42 BE tests already exist, focus on integration tests and coverage gaps | P1 | 2h (reduced from 4h) | Claude Code |
| 12 | Add Agent commission system to hub business rules (Section 7) and dependencies (Section 15) | P1 | 30min | Claude Code |
| 13 | Qualify "zero anti-patterns" claim in hub Section 1 to "zero frontend anti-patterns" | P0 | 5min | Claude Code |

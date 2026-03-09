# Service Hub: Commission (08)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-08 tribunal)
> **Original definition:** `dev_docs/02-services/` (Commission service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/07-commission/` (files)
> **v2 hub (historical):** `dev_docs_v2/03-services/08-commission.md`
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/batch-1-p0/PST-08-commission.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | A- (8.5/10) |
| **Confidence** | High — code-verified via PST-08 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Production — 31 endpoints across 5 controllers (entries, payouts, plans, dashboard, agent commissions) |
| **Frontend** | Built — 11 pages, 18 hook functions (5 files), 10 components. Avg quality 8.5/10. Model implementation. |
| **Tests** | 63 total — 21 frontend (3 suites), 42 backend (4 spec files) |
| **Security** | Strong — 100% auth guards (JwtAuthGuard + RolesGuard) on all 31 endpoints, 100% tenant isolation |
| **Reference Quality** | Cleanest P0 service — zero frontend anti-patterns. Backend has soft-delete gap (60% coverage). |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Commission service definition in dev_docs |
| Design Specs | Done | Design specs in dev_docs/12-Rabih-design-Process/07-commission/ |
| Backend Controllers | Production | 5 controllers: CommissionEntries, CommissionPayouts, CommissionPlans, CommissionsDashboard, AgentCommissions |
| Backend Services | Production | 4 service files: entries, payouts, plans, agent-commissions + dashboard controller |
| Prisma Models | Production | 7 models: CommissionEntry, CommissionPlan, CommissionPlanTier, CommissionPayout, UserCommissionAssignment, AgentCommission, AgentPayout (169 total fields) |
| Frontend Pages | Built | 11 pages in `app/(dashboard)/commissions/` |
| React Hooks | Built | 5 hook files, 18 exported hook functions in `lib/hooks/commissions/` |
| Components | Built | 10 components in `components/commissions/` |
| Tests | Built | 63 tests — FE: `__tests__/commissions/commissions.test.tsx` (21 tests, 3 suites) + BE: 4 spec files (42 tests) |
| Security | Strong | All 31 endpoints have JwtAuthGuard + RolesGuard with appropriate role restrictions |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Commission Dashboard | `/commissions` | Built | 9/10 | KPI stats, earnings chart, recent transactions |
| Commission Plans List | `/commissions/plans` | Built | 8/10 | Plans table with CRUD |
| Commission Plan Detail | `/commissions/plans/[id]` | Built | 8/10 | Plan card with tier details |
| Commission Plan Create | `/commissions/plans/new` | Built | 9/10 | Form with tier editor |
| Commission Plan Edit | `/commissions/plans/[id]/edit` | Built | 9/10 | Edit form |
| Sales Reps List | `/commissions/reps` | Built | 8/10 | Reps table with commission totals |
| Sales Rep Detail | `/commissions/reps/[id]` | Built | 8/10 | Rep detail with commission history |
| Transactions | `/commissions/transactions` | Built | 8/10 | Transaction log with filters |
| Payouts List | `/commissions/payouts` | Built | 8/10 | Payout table |
| Payout Detail | `/commissions/payouts/[id]` | Built | 8/10 | Payout breakdown |
| Commission Reports | `/commissions/reports` | Built | 8/10 | Reports view |

---

## 4. API Endpoints

### Commission Entries (`/api/v1/commissions/entries/*`)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/commissions/entries` | CommissionEntriesController | Production | List commission entries |
| GET | `/api/v1/commissions/entries/:id` | CommissionEntriesController | Production | Entry detail |
| POST | `/api/v1/commissions/entries` | CommissionEntriesController | Production | Create entry (ADMIN + ACCOUNTING) |
| POST | `/api/v1/commissions/entries/:id/approve` | CommissionEntriesController | Production | Approve entry |
| POST | `/api/v1/commissions/entries/:id/reverse` | CommissionEntriesController | Production | Reverse entry |
| POST | `/api/v1/commissions/entries/calculate-for-load` | CommissionEntriesController | Production | Calculate commission for a specific load |
| GET | `/api/v1/commissions/entries/user-earnings` | CommissionEntriesController | Production | Get user earnings summary |

### Commission Payouts (`/api/v1/commissions/payouts/*`)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/commissions/payouts` | CommissionPayoutsController | Production | List payouts |
| GET | `/api/v1/commissions/payouts/:id` | CommissionPayoutsController | Production | Payout detail |
| POST | `/api/v1/commissions/payouts` | CommissionPayoutsController | Production | Create payout (ADMIN + ACCOUNTING) |
| POST | `/api/v1/commissions/payouts/:id/approve` | CommissionPayoutsController | Production | Approve payout |
| POST | `/api/v1/commissions/payouts/:id/process` | CommissionPayoutsController | Production | Process payout (ADMIN only) |
| POST | `/api/v1/commissions/payouts/:id/void` | CommissionPayoutsController | Production | Void payout |

### Commission Plans (`/api/v1/commissions/plans/*`)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/commissions/plans` | CommissionPlansController | Production | List plans |
| GET | `/api/v1/commissions/plans/:id` | CommissionPlansController | Production | Plan detail |
| POST | `/api/v1/commissions/plans` | CommissionPlansController | Production | Create plan (ADMIN only) |
| PATCH | `/api/v1/commissions/plans/:id` | CommissionPlansController | Production | Update plan (ADMIN only) |
| DELETE | `/api/v1/commissions/plans/:id` | CommissionPlansController | Production | Soft-delete plan (ADMIN only) |
| GET | `/api/v1/commissions/plans/active` | CommissionPlansController | Production | Get active plans |

### Commissions Dashboard (`/api/v1/commissions/dashboard`, `/reports`, `/reps/*`, `/transactions/*`)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/commissions/dashboard` | CommissionsDashboardController | Production | Dashboard KPIs (pending, paid MTD/YTD, avg rate, top reps) |
| GET | `/api/v1/commissions/reports` | CommissionsDashboardController | Production | Earnings, plan usage, payout summary |
| GET | `/api/v1/commissions/reps` | CommissionsDashboardController | Production | List sales reps with commission totals |
| GET | `/api/v1/commissions/reps/:id` | CommissionsDashboardController | Production | Rep detail with earnings |
| GET | `/api/v1/commissions/reps/:id/transactions` | CommissionsDashboardController | Production | Rep transaction history |
| POST | `/api/v1/commissions/reps/:id/assign-plan` | CommissionsDashboardController | Production | Assign commission plan to rep |
| GET | `/api/v1/commissions/transactions` | CommissionsDashboardController | Production | List all transactions |
| POST | `/api/v1/commissions/transactions/:id/approve` | CommissionsDashboardController | Production | Approve transaction |
| POST | `/api/v1/commissions/transactions/:id/void` | CommissionsDashboardController | Production | Void transaction |

### Agent Commissions (`/api/v1/agents/*`)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/agents/:id/commissions` | AgentCommissionsController | Production | List agent commissions |
| GET | `/api/v1/agents/:id/performance` | AgentCommissionsController | Production | Agent performance metrics |
| GET | `/api/v1/agents/rankings` | AgentCommissionsController | Production | Agent rankings |

---

## 5. Components

10 components exist in `components/commissions/`:

| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| CommissionDashboardStats | `components/commissions/commission-dashboard-stats.tsx` | Built | 4 KPIs using KpiCard |
| CommissionPlanCard | `components/commissions/commission-plan-card.tsx` | Built | Plan display card |
| CommissionPlanForm | `components/commissions/commission-plan-form.tsx` | Built | Full form with tier editor, type mapping to backend |
| TierEditor | `components/commissions/tier-editor.tsx` | Built | Tier threshold/rate CRUD |
| RepCommissionsTable | `components/commissions/rep-commissions-table.tsx` | Built | Reps with commission totals |
| RepDetailCard | `components/commissions/rep-detail-card.tsx` | Built | Exports: RepSummary, TransactionHistory |
| TransactionsTable | `components/commissions/transactions-table.tsx` | Built | Search, status/date filters, approve/void actions |
| PayoutTable | `components/commissions/payout-table.tsx` | Built | Status filter, generate payout dialog |
| PayoutDetailCard | `components/commissions/payout-detail-card.tsx` | Built | Exports: PayoutSummary, PayoutTransactions |
| EarningsChart | `components/commissions/earnings-chart.tsx` | Built | Exports: EarningsChart, PlanUsageCard, PayoutSummaryCard |

Uses TMS design system `KpiCard` from `@/components/tms/stats/kpi-card` in dashboard stats and rep detail.

---

## 6. Hooks

5 hook files in `lib/hooks/commissions/`, exporting 18 hook functions total:

### `use-commission-dashboard.ts`
| Hook | Endpoint | Notes |
|------|----------|-------|
| `useCommissionDashboard()` | `/commissions/dashboard` | 30s cache, includes topReps array |

### `use-plans.ts`
| Hook | Endpoint | Notes |
|------|----------|-------|
| `usePlans()` | `/commissions/plans` | List with pagination |
| `usePlan()` | `/commissions/plans/:id` | Single plan detail |
| `useCreatePlan()` | `POST /commissions/plans` | Mutation |
| `useUpdatePlan()` | `PATCH /commissions/plans/:id` | Mutation |
| `useDeletePlan()` | `DELETE /commissions/plans/:id` | Mutation |
| `useActivatePlan()` | `/commissions/plans/active` | Get active plans |

### `use-reps.ts`
| Hook | Endpoint | Notes |
|------|----------|-------|
| `useReps()` | `/commissions/reps` | List reps with commission totals |
| `useRep()` | `/commissions/reps/:id` | Rep detail |
| `useRepTransactions()` | `/commissions/reps/:id/transactions` | Rep transaction history |
| `useAssignPlan()` | `POST /commissions/reps/:id/assign-plan` | Mutation |

### `use-transactions.ts`
| Hook | Endpoint | Notes |
|------|----------|-------|
| `useTransactions()` | `/commissions/transactions` | List with filters |
| `useApproveTransaction()` | `POST /commissions/transactions/:id/approve` | Mutation |
| `useVoidTransaction()` | `POST /commissions/transactions/:id/void` | Mutation |

### `use-payouts.ts`
| Hook | Endpoint | Notes |
|------|----------|-------|
| `usePayouts()` | `/commissions/payouts` | List payouts |
| `usePayout()` | `/commissions/payouts/:id` | Payout detail |
| `useGeneratePayout()` | `POST /commissions/payouts` | Create payout mutation |
| `useProcessPayout()` | `POST /commissions/payouts/:id/process` | Process payout mutation |

**Envelope handling:** All 5 files use identical `unwrap<T>()` helper — best envelope consistency across all P0 services. List queries extract pagination manually. Data transformations via `mapPayout()` and `mapTransaction()` functions. Frontend plan types mapped to backend types in form component.

---

## 7. Business Rules

1. **Commission Trigger:** Commission is calculated when an invoice status changes to PAID. Calculated commission = (invoice total x commission rate) based on the sales rep's active commission plan. Commission is NOT calculated on drafts or unpaid invoices. **Note:** `calculateLoadCommission()` method exists but auto-trigger mechanism (event listener on invoice PAID) needs to be wired — see COMM-107.
2. **Commission Plans:** Each sales rep is assigned a commission plan via `UserCommissionAssignment` (many-to-many with overrides). Assignments support `overrideRate`, `overrideFlat`, `drawAmount`, `drawRecoverable`, `effectiveDate`/`endDate`. Plan history is preserved (plan changes don't recalculate historical commissions).
3. **Tiered Commission:** Plans can have tiers stored in the `CommissionPlanTier` table (separate model, not JSON). Tiers define `thresholdType`, `thresholdMin`/`thresholdMax`, `rateType`, `rateAmount`, `periodType`. Plan types: PERCENT_REVENUE, FLAT_FEE, TIERED, CUSTOM (frontend maps to PERCENTAGE, FLAT, TIERED_PERCENTAGE, TIERED_FLAT).
4. **Attribution:** Commission is attributed to the sales rep who created the original quote. If no quote, to the user who created the order. Attribution cannot be changed after the invoice is paid.
5. **Manager Override:** ADMIN can manually adjust a commission amount (e.g., for credits, disputes). All overrides are logged to AuditLog with reason. Adjusted commissions show a flag in the UI.
6. **Commission Payment Cycle:** Default: monthly on the 15th. Paid via check or ACH. Payment is recorded separately from commission calculation — commission can be earned but held pending payment. Payouts have approval workflow (`approvedBy`, `approvedAt`).
7. **Dispute Window:** Sales reps have 30 days from month-end to dispute a commission calculation. After 30 days, the commission is locked and cannot be adjusted without ADMIN override.
8. **Excluded Revenue:** Some revenue types may be excluded from commission: specific customers (e.g., house accounts), accessorials only (no line haul component), fuel surcharges. Exclusions are defined per commission plan.
9. **Agent Commission System:** A parallel commission system exists for agents (`AgentCommission` + `AgentPayout` models). Agents have separate split tracking (`splitRate`, `splitType`, `commissionBase`, `grossCommission`, `netCommission`), performance metrics, and rankings. Agent payouts include statement documents and draw recovery. Managed via `AgentCommissionsController` (3 endpoints).

---

## 8. Data Model

### CommissionEntry (actual Prisma model — hub previously called this "Commission")
```
CommissionEntry {
  id                String (UUID)
  tenantId          String
  invoiceId         String? (FK → Invoice)
  orderId           String? (FK → Order)
  loadId            String? (FK → Load)
  userId            String (FK → User — sales rep)
  planId            String? (FK → CommissionPlan)
  entryType         String (e.g., LOAD_COMMISSION, ADJUSTMENT, BONUS)
  calculationBasis  String (e.g., REVENUE, MARGIN, FLAT)
  basisAmount       Decimal (the base amount used for calculation)
  rateApplied       Decimal (% or flat rate applied)
  commissionAmount  Decimal (calculated result)
  isSplit           Boolean (default: false)
  splitPercent      Decimal? (if split with another rep)
  parentEntryId     String? (FK → self, for split tracking)
  commissionPeriod  String? (e.g., "2026-03")
  status            CommissionStatus (PENDING, APPROVED, PAID, DISPUTED, REVERSED)
  notes             String?
  reversedAt        DateTime?
  reversedBy        String?
  reversalReason    String?
  payoutId          String? (FK → CommissionPayout)
  paidAt            DateTime?
  createdById       String?
  updatedById       String?
  customFields      Json?
  deletedAt         DateTime?
  externalId        String?
  sourceSystem      String?
  createdAt         DateTime
  updatedAt         DateTime
}
```

### CommissionPlan
```
CommissionPlan {
  id                    String (UUID)
  tenantId              String
  name                  String
  description           String?
  planType              String (PERCENT_REVENUE, FLAT_FEE, TIERED, CUSTOM)
  status                String (ACTIVE, INACTIVE, ARCHIVED)
  effectiveDate         DateTime?
  endDate               DateTime?
  flatAmount            Decimal? (for FLAT_FEE type)
  percentRate           Decimal? (for PERCENT_REVENUE type)
  calculationBasis      String? (REVENUE, MARGIN, FLAT)
  minimumMarginPercent  Decimal? (threshold for commission eligibility)
  isActive              Boolean
  rules                 Json? (custom rules/exclusions)
  customFields          Json?
  externalId            String?
  sourceSystem          String?
  createdAt             DateTime
  updatedAt             DateTime
  deletedAt             DateTime?
  tiers                 CommissionPlanTier[] (relation)
  assignments           UserCommissionAssignment[] (relation)
}
```

### CommissionPlanTier (missing from previous hub — tiers are a separate table, NOT JSON)
```
CommissionPlanTier {
  id              String (UUID)
  tenantId        String
  planId          String (FK → CommissionPlan)
  tierNumber      Int (ordering)
  thresholdType   String (REVENUE, MARGIN, LOAD_COUNT)
  thresholdMin    Decimal
  thresholdMax    Decimal?
  rateType        String (PERCENTAGE, FLAT)
  rateAmount      Decimal
  periodType      String (MONTHLY, QUARTERLY, ANNUAL)
  customFields    Json?
  externalId      String?
  sourceSystem    String?
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime?
}
```

### UserCommissionAssignment (missing from previous hub — links users to plans)
```
UserCommissionAssignment {
  id                String (UUID)
  tenantId          String
  userId            String (FK → User)
  planId            String (FK → CommissionPlan)
  overrideRate      Decimal? (rep-specific rate override)
  overrideFlat      Decimal? (rep-specific flat override)
  drawAmount        Decimal? (guaranteed draw amount)
  drawRecoverable   Boolean (default: true)
  effectiveDate     DateTime
  endDate           DateTime?
  status            String (ACTIVE, INACTIVE)
  customFields      Json?
  externalId        String?
  sourceSystem      String?
  createdAt         DateTime
  updatedAt         DateTime
  deletedAt         DateTime?
}
```

### CommissionPayout (actual Prisma model — hub previously called this "CommissionPayment")
```
CommissionPayout {
  id                String (UUID)
  tenantId          String
  userId            String (FK → User — sales rep)
  payoutNumber      String (unique identifier)
  periodStart       DateTime
  periodEnd         DateTime
  grossCommission   Decimal
  drawRecovery      Decimal (default: 0)
  adjustments       Decimal (default: 0)
  netPayout         Decimal (gross - draw - adjustments)
  status            PayoutStatus (DRAFT, PENDING_APPROVAL, APPROVED, PROCESSING, PAID, VOID)
  approvedBy        String? (FK → User)
  approvedAt        DateTime?
  paymentMethod     String? (CHECK, ACH)
  paymentReference  String?
  paidAt            DateTime?
  entries           CommissionEntry[] (relation — linked entries)
  customFields      Json?
  externalId        String?
  sourceSystem      String?
  createdAt         DateTime
  updatedAt         DateTime
  deletedAt         DateTime?
}
```

### AgentCommission (missing from previous hub — parallel agent commission system)
```
AgentCommission {
  id                String (UUID)
  tenantId          String
  agentId           String (FK → User)
  loadId            String? (FK → Load)
  orderId           String? (FK → Order)
  invoiceId         String? (FK → Invoice)
  splitType         String (PERCENTAGE, FLAT)
  splitRate         Decimal
  commissionBase    Decimal (revenue or margin basis)
  grossCommission   Decimal
  netCommission     Decimal
  loadMargin        Decimal?
  loadRevenue       Decimal?
  status            CommissionStatus (PENDING, APPROVED, PAID, REVERSED)
  payoutId          String? (FK → AgentPayout)
  paidAt            DateTime?
  customFields      Json?
  externalId        String?
  sourceSystem      String?
  createdAt         DateTime
  updatedAt         DateTime
  deletedAt         DateTime?
}
```

### AgentPayout (missing from previous hub — agent-specific payouts)
```
AgentPayout {
  id                String (UUID)
  tenantId          String
  agentId           String (FK → User)
  payoutNumber      String
  periodStart       DateTime
  periodEnd         DateTime
  grossCommission   Decimal
  drawRecovery      Decimal
  adjustments       Decimal
  netPayout         Decimal
  status            PayoutStatus
  approvedBy        String?
  approvedAt        DateTime?
  paymentMethod     String?
  paymentReference  String?
  statementDocument String? (document reference)
  paidAt            DateTime?
  customFields      Json?
  externalId        String?
  sourceSystem      String?
  createdAt         DateTime
  updatedAt         DateTime
  deletedAt         DateTime?
}
```

**Total: 7 Prisma models, 169 fields.**

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `rateApplied` | 0-100 Decimal | "Commission rate must be between 0% and 100%" |
| Plan `percentRate` | Min 0, max 20 (business limit) | "Commission rate cannot exceed 20%" |
| `invoiceId` | Must be PAID invoice | "Commission can only be calculated on paid invoices" |
| `userId` | Must be SALES_REP or ADMIN role | "User is not a sales representative" |
| Plan tiers | `thresholdMin` < `thresholdMax`, ascending order | "Tier thresholds must be in ascending order" |
| Attribution | Cannot change after invoice PAID | "Commission attribution is locked after payment" |
| Payout `netPayout` | Must equal `grossCommission - drawRecovery - adjustments` | Calculated field validation |

---

## 10. Status States

### Commission Entry Status Machine
```
PENDING (invoice paid, calculation done) → APPROVED (accounting review)
APPROVED → PAID (payout processed)
PENDING/APPROVED → DISPUTED (sales rep challenges)
DISPUTED → APPROVED (after resolution)
APPROVED/PAID → REVERSED (reversal with reason)
```

### Payout Status Machine
```
DRAFT (created) → PENDING_APPROVAL (submitted)
PENDING_APPROVAL → APPROVED (manager approval)
APPROVED → PROCESSING (payment initiated)
PROCESSING → PAID (payment confirmed)
PENDING_APPROVAL/APPROVED → VOID (cancelled)
```

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| Commission auto-calculation trigger (on invoice PAID) needs to be WIRED — not just verified | P1 | **Open** | `calculateLoadCommission()` method exists with full plan-type handling, but no event listener or cron job triggers it. Needs event listener on invoice status change. See COMM-107. |
| Soft-delete gap: 60% of backend queries don't filter `deletedAt: null` | P1 BUG | **Open** | CommissionEntry (0/7), CommissionPayout (0/6), AgentCommission (0/3), Dashboard (3/8) queries missing filter. Only CommissionPlans (6/6) properly filters. Deleted records inflate KPIs and appear in transaction lists. |
| Multi-step operations lack Prisma `$transaction` wrapping | P2 BUG | **Open** | `createPayout` (create payout + link entries) and `processPayout` (update payout + mark entries PAID) are not transactional. Race conditions could leave orphaned state. |
| ~~No tests~~ | — | ~~FIXED~~ | ~~63 tests exist — 21 FE (3 suites) + 42 BE (4 spec files)~~ |
| ~~Security guards on commission endpoints need verification~~ | — | ~~FIXED~~ | ~~FALSE — all 31 endpoints have JwtAuthGuard + RolesGuard with appropriate role restrictions. 100% auth guard coverage confirmed by PST-08.~~ |

**Previously listed — now resolved:**
- ~~Sidebar link to `/commission` returns 404~~ — Routes to `/commissions` (plural), pages exist
- ~~No frontend screens built~~ — 11 pages exist (audited 2026-03-07)
- ~~No hooks exist~~ — 5 hook files, 18 hook functions built in `lib/hooks/commissions/`
- ~~Commission plan UI not built~~ — Plans CRUD fully built (create, detail, edit)

---

## 12. Tasks

### Completed (verified by PST-08 tribunal)
| Task ID | Title | Status |
|---------|-------|--------|
| COMM-101 | ~~Fix sidebar navigation~~ | **Done** — routes work |
| COMM-106 | ~~Write commission hooks~~ | **Done** — 18 hook functions across 5 files |
| COMM-109 | ~~Verify security guards on commission endpoints~~ | **Done** — 100% coverage confirmed by PST-08 |

### Open (from tribunal findings)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| COMM-102 | QA Commission Dashboard (exists, 9/10) | S (30m) | P1 |
| COMM-103 | QA Commission Plans CRUD (exists, 8-9/10) | S (30m) | P1 |
| COMM-104 | QA Commission Reports (exists, 8/10) | S (30m) | P1 |
| COMM-105 | QA Commission Payouts (exists, 8/10) | S (30m) | P1 |
| COMM-107 | Wire auto-calculation trigger on invoice PAID event (not just verify — trigger mechanism needs to be BUILT) | M (3-4h) | P0 |
| COMM-108 | Expand commission test coverage — 42 BE tests already exist, focus on integration tests and soft-delete edge cases | M (2h) | P1 |
| COMM-110 | Add `deletedAt: null` filter to CommissionEntry queries (7 methods) | M (1h) | P1 |
| COMM-111 | Add `deletedAt: null` filter to CommissionPayout queries (6 methods) | M (1h) | P1 |
| COMM-112 | Add `deletedAt: null` filter to AgentCommission queries (3 methods) | S (30m) | P1 |
| COMM-113 | Wrap `createPayout` and `processPayout` in Prisma `$transaction` blocks | M (1h) | P1 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Commission Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/07-commission/01-commission-dashboard.md` |
| Commission Plans | Full 15-section | `dev_docs/12-Rabih-design-Process/07-commission/02-commission-plans.md` |
| Commission Reports | Full 15-section | `dev_docs/12-Rabib-design-Process/07-commission/03-commission-reports.md` |
| Commission Payments | Full 15-section | `dev_docs/12-Rabih-design-Process/07-commission/04-commission-payments.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Commission frontend in scope | 11 pages built, avg 8.5/10 quality | Exceeds plan |
| Auto-calculation on invoice paid | Backend method exists, trigger not wired | Needs COMM-107 |
| 6 screens planned | 11 built (model implementation quality) | Exceeds plan |
| Tests required | 63 tests (21 FE + 42 BE) — most tested P0 service | Exceeds plan |
| 6 hooks planned | 18 hook functions across 5 files | Exceeds plan |
| 5 components planned | 10 components built (~16 exported components) | Exceeds plan |
| 3 data models | 7 Prisma models (169 fields) including agent system | Exceeds plan |
| Security unknown | 100% auth guards, 100% tenant isolation | Exceeds plan |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles — ADMIN, ACCOUNTING, ACCOUNTING_MANAGER, SALES_MANAGER, AGENT_MANAGER, AGENT, SUPER_ADMIN roles)
- Accounting (invoice PAID events trigger commission calculation)
- CRM (customer attribution, excluded accounts)
- Sales & Quotes (quote creator = commission attribution)
- TMS Core (order/load data for revenue calculation)
- Agents module (`modules/agents/commissions/` — AgentCommissionsController + AgentCommissionsService)

**Depended on by:**
- Dashboard Shell (commission dashboard KPIs — CommissionsDashboardController)
- Analytics (commission costs in profitability reports)
- HR (sales rep payroll integration — P3)

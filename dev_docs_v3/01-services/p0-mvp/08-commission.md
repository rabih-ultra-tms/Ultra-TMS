# Service Hub: Commission (08)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Commission service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/07-commission/` (files)
> **v2 hub (historical):** `dev_docs_v2/03-services/08-commission.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B (8/10) |
| **Confidence** | High — re-audited 2026-03-07, all 11 pages verified |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — commission module exists in `apps/api/src/modules/commission/` |
| **Frontend** | Built — 11 pages, 5 hooks, 10 components. Avg quality 8.5/10. Model implementation. |
| **Tests** | Frontend: 14 tests (3 suites — DashboardStats, PlanCard, TierEditor) |
| **Reference Quality** | Commission module is the cleanest implementation — zero anti-patterns found |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Commission service definition in dev_docs |
| Design Specs | Done | Design specs in dev_docs/12-Rabih-design-Process/07-commission/ |
| Backend Controller | Partial | `apps/api/src/modules/commission/commission.controller.ts` |
| Backend Service | Partial | `apps/api/src/modules/commission/commission.service.ts` |
| Prisma Models | Partial | Commission, CommissionPlan, CommissionPayment models |
| Frontend Pages | Built | 11 pages in `app/(dashboard)/commissions/` |
| React Hooks | Built | 5 hooks in `lib/hooks/commissions/` |
| Components | Built | 10 components in `components/commissions/` |
| Tests | Built | `__tests__/commissions/commissions.test.tsx` — 14 tests, 3 component suites |
| Security | Unknown | Need to verify guards on commission endpoints |

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

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/commission` | CommissionController | Partial | List commissions |
| GET | `/api/v1/commission/:id` | CommissionController | Partial | Commission detail |
| POST | `/api/v1/commission/calculate` | CommissionController | Partial | Calculate for order/load |
| GET | `/api/v1/commission/plans` | CommissionController | Partial | Commission plans list |
| POST | `/api/v1/commission/plans` | CommissionController | Partial | Create plan |
| PUT | `/api/v1/commission/plans/:id` | CommissionController | Partial | Update plan |
| GET | `/api/v1/commission/payments` | CommissionController | Partial | Payment records |
| POST | `/api/v1/commission/payments` | CommissionController | Partial | Record payment |
| GET | `/api/v1/commission/stats` | CommissionController | Partial | Summary stats |

---

## 5. Components

10 components exist in `components/commissions/`:

| Component | Path | Status |
|-----------|------|--------|
| CommissionDashboardStats | `components/commissions/commission-dashboard-stats.tsx` | Built |
| CommissionPlanCard | `components/commissions/commission-plan-card.tsx` | Built |
| CommissionPlanForm | `components/commissions/commission-plan-form.tsx` | Built |
| TierEditor | `components/commissions/tier-editor.tsx` | Built |
| RepCommissionsTable | `components/commissions/rep-commissions-table.tsx` | Built |
| RepDetailCard | `components/commissions/rep-detail-card.tsx` | Built |
| TransactionsTable | `components/commissions/transactions-table.tsx` | Built |
| PayoutTable | `components/commissions/payout-table.tsx` | Built |
| PayoutDetailCard | `components/commissions/payout-detail-card.tsx` | Built |
| EarningsChart | `components/commissions/earnings-chart.tsx` | Built |

---

## 6. Hooks

5 hooks exist in `lib/hooks/commissions/`:

| Hook | File | Status |
|------|------|--------|
| `useCommissionDashboard` | `use-commission-dashboard.ts` | Built |
| `usePlans` | `use-plans.ts` | Built |
| `useReps` | `use-reps.ts` | Built |
| `useTransactions` | `use-transactions.ts` | Built |
| `usePayouts` | `use-payouts.ts` | Built |

---

## 7. Business Rules

1. **Commission Trigger:** Commission is calculated when an invoice status changes to PAID. Calculated commission = (invoice total × commission rate) based on the sales rep's active commission plan. Commission is NOT calculated on drafts or unpaid invoices.
2. **Commission Plans:** Each sales rep (SALES_REP role) is assigned exactly one active commission plan at a time. Plans define: base rate (%), tiered rate thresholds, bonus triggers, and excluded customers. Plan history is preserved (plan changes don't recalculate historical commissions).
3. **Tiered Commission:** Plans can have tiers: e.g., 3% on first $100k/month revenue, 4% on $100k-$250k, 5% above $250k. Tiers reset monthly on the 1st. MTD tracking is required for accurate real-time commission display.
4. **Attribution:** Commission is attributed to the sales rep who created the original quote. If no quote, to the user who created the order. Attribution cannot be changed after the invoice is paid.
5. **Manager Override:** ADMIN can manually adjust a commission amount (e.g., for credits, disputes). All overrides are logged to AuditLog with reason. Adjusted commissions show a flag in the UI.
6. **Commission Payment Cycle:** Default: monthly on the 15th. Paid via check or ACH. Payment is recorded separately from commission calculation — commission can be earned but held pending payment.
7. **Dispute Window:** Sales reps have 30 days from month-end to dispute a commission calculation. After 30 days, the commission is locked and cannot be adjusted without ADMIN override.
8. **Excluded Revenue:** Some revenue types may be excluded from commission: specific customers (e.g., house accounts), accessorials only (no line haul component), fuel surcharges. Exclusions are defined per commission plan.

---

## 8. Data Model

### Commission
```
Commission {
  id            String (UUID)
  invoiceId     String (FK → Invoice)
  orderId       String (FK → Order)
  salesRepId    String (FK → User)
  planId        String (FK → CommissionPlan)
  grossRevenue  Decimal (invoice total)
  commissionRate Decimal (% from plan)
  commissionAmt Decimal (calculated)
  adjustmentAmt Decimal (default: 0, from admin overrides)
  finalAmt      Decimal (commissionAmt + adjustmentAmt)
  status        CommissionStatus (PENDING, APPROVED, PAID, DISPUTED)
  paidAt        DateTime?
  paymentId     String? (FK → CommissionPayment)
  tenantId      String
  createdAt     DateTime
  updatedAt     DateTime
}
```

### CommissionPlan
```
CommissionPlan {
  id          String (UUID)
  name        String
  baseRate    Decimal (%)
  tiers       Json (array of {threshold, rate})
  bonusTriggers Json?
  isActive    Boolean
  salesRepId  String? (null = default plan)
  tenantId    String
  createdAt   DateTime
  updatedAt   DateTime
  deletedAt   DateTime?
}
```

### CommissionPayment
```
CommissionPayment {
  id           String (UUID)
  salesRepId   String (FK → User)
  periodStart  DateTime
  periodEnd    DateTime
  totalAmt     Decimal
  commissions  Commission[] (FK from Commission.paymentId)
  paidAt       DateTime
  method       String (CHECK, ACH)
  referenceNum String?
  tenantId     String
  createdAt    DateTime
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `commissionRate` | 0-100 Decimal | "Commission rate must be between 0% and 100%" |
| Plan `baseRate` | Min 0, max 20 (business limit) | "Commission rate cannot exceed 20%" |
| `invoiceId` | Must be PAID invoice | "Commission can only be calculated on paid invoices" |
| `salesRepId` | Must be SALES_REP or ADMIN role | "User is not a sales representative" |
| Plan tiers | Thresholds must be ascending | "Tier thresholds must be in ascending order" |
| Attribution | Cannot change after invoice PAID | "Commission attribution is locked after payment" |

---

## 10. Status States

### Commission Status Machine
```
PENDING (invoice paid, calculation done) → APPROVED (accounting review)
APPROVED → PAID (payment recorded)
PENDING/APPROVED → DISPUTED (sales rep challenges)
DISPUTED → APPROVED (after resolution)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| Commission auto-calculation trigger (on invoice PAID) needs verification | P1 | `apps/api/src/modules/accounting/` | Needs check |
| ~~No tests~~ | — | — | FIXED — 14 FE tests exist (DashboardStats, PlanCard, TierEditor) |
| Security guards on commission endpoints need verification | P1 | `apps/api/src/modules/commission/` | Needs check |

**Previously listed — now resolved:**
- ~~Sidebar link to `/commission` returns 404~~ — Routes to `/commissions` (plural), pages exist
- ~~No frontend screens built~~ — 11 pages exist (audited 2026-03-07)
- ~~No hooks exist~~ — 5 hooks built in `lib/hooks/commissions/`
- ~~Commission plan UI not built~~ — Plans CRUD fully built (create, detail, edit)

---

## 12. Tasks

### Quality Sprint (Active)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| (No active QS task — backlog) | — | — | — |

### Backlog
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| COMM-101 | ~~Fix sidebar navigation~~ — DONE, routes work | — | ~~P0~~ |
| COMM-102 | QA Commission Dashboard (exists, 9/10) | S (30m) | P1 |
| COMM-103 | QA Commission Plans CRUD (exists, 8-9/10) | S (30m) | P1 |
| COMM-104 | QA Commission Reports (exists, 8/10) | S (30m) | P1 |
| COMM-105 | QA Commission Payouts (exists, 8/10) | S (30m) | P1 |
| COMM-106 | ~~Write commission hooks~~ — DONE, 5 hooks exist | — | ~~P0~~ |
| COMM-107 | Verify auto-calculation trigger on invoice PAID event | M (2h) | P0 |
| COMM-108 | Write commission tests | M (4h) | P1 |
| COMM-109 | Verify security guards on commission endpoints | S (1h) | P1 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Commission Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/07-commission/01-commission-dashboard.md` |
| Commission Plans | Full 15-section | `dev_docs/12-Rabih-design-Process/07-commission/02-commission-plans.md` |
| Commission Reports | Full 15-section | `dev_docs/12-Rabih-design-Process/07-commission/03-commission-reports.md` |
| Commission Payments | Full 15-section | `dev_docs/12-Rabih-design-Process/07-commission/04-commission-payments.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Commission frontend in scope | 11 pages built, avg 8.5/10 quality | Exceeds plan |
| Auto-calculation on invoice paid | Backend partial, trigger uncertain | Needs verification |
| 6 screens planned | 11 built (model implementation quality) | Exceeds plan |
| Tests required | 0 tests | Gap |
| 6 hooks planned | 5 hooks built (bundled CRUD design) | Complete |
| 5 components planned | 10 components built | Exceeds plan |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles — ACCOUNTING + ADMIN + SALES_REP roles)
- Accounting (invoice PAID events trigger commission calculation)
- CRM (customer attribution, excluded accounts)
- Sales & Quotes (quote creator = commission attribution)
- TMS Core (order/load data for revenue calculation)

**Depended on by:**
- Analytics (commission costs in profitability reports)
- HR (sales rep payroll integration — P3)

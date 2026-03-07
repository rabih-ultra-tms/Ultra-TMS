# Service Hub: Commission (08)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Commission service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/07-commission/` (files)
> **v2 hub (historical):** `dev_docs_v2/03-services/08-commission.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (3/10) |
| **Confidence** | Medium — backend reviewed; frontend confirmed not built |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — commission module exists in `apps/api/src/modules/commission/` |
| **Frontend** | Not Built — sidebar link exists but routes to 404 |
| **Tests** | None |
| **Sidebar Link** | `/commission` links exist but no page behind them |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Commission service definition in dev_docs |
| Design Specs | Done | Design specs in dev_docs/12-Rabih-design-Process/07-commission/ |
| Backend Controller | Partial | `apps/api/src/modules/commission/commission.controller.ts` |
| Backend Service | Partial | `apps/api/src/modules/commission/commission.service.ts` |
| Prisma Models | Partial | Commission, CommissionPlan, CommissionPayment models |
| Frontend Pages | Not Built | 0 screens exist |
| React Hooks | Not Built | Must be created |
| Components | Not Built | Must be created |
| Tests | None | |
| Security | Unknown | Need to verify guards on commission endpoints |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Commission Dashboard | `/commission` | Not Built | — | Sidebar link 404 |
| Commission Reports | `/commission/reports` | Not Built | — | |
| Agent Commissions | `/commission/agents` | Not Built | — | Per-agent breakdown |
| Commission Plans | `/commission/plans` | Not Built | — | Plan management |
| Commission Payments | `/commission/payments` | Not Built | — | Payment records |
| Commission Detail | `/commission/[id]` | Not Built | — | Per-order commission |

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

All must be built:

| Component | Planned Path | Priority |
|-----------|-------------|----------|
| CommissionDashboard | `components/commission/commission-dashboard.tsx` | P0 |
| CommissionTable | `components/commission/commission-table.tsx` | P0 |
| CommissionPlanForm | `components/commission/commission-plan-form.tsx` | P0 |
| AgentCommissionCard | `components/commission/agent-commission-card.tsx` | P0 |
| CommissionPaymentForm | `components/commission/commission-payment-form.tsx` | P0 |

---

## 6. Hooks

All must be built:

| Hook | Endpoints | Priority |
|------|-----------|----------|
| `useCommissions` | GET `/commission` | P0 |
| `useCommissionStats` | GET `/commission/stats` | P0 |
| `useCommissionPlans` | GET `/commission/plans` | P0 |
| `useCreateCommissionPlan` | POST `/commission/plans` | P0 |
| `useCommissionPayments` | GET `/commission/payments` | P0 |
| `useRecordCommissionPayment` | POST `/commission/payments` | P0 |

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
| Sidebar link to `/commission` returns 404 | P1 | `lib/config/navigation.ts` | Open |
| No frontend screens built | P0 | `(dashboard)/commission/` | Open |
| No hooks exist | P0 | — | Must Build |
| Commission auto-calculation trigger (on invoice PAID) needs verification | P1 | `apps/api/src/modules/accounting/` | Needs check |
| No tests | P0 | — | Must Build |
| Commission plan UI not built | P0 | — | Open |

---

## 12. Tasks

### Quality Sprint (Active)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| (No active QS task — backlog) | — | — | — |

### Backlog
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| COMM-101 | Fix sidebar navigation link for `/commission` | S (30m) | P0 |
| COMM-102 | Build Commission Dashboard | L (6h) | P0 |
| COMM-103 | Build Commission Plans management | M (4h) | P0 |
| COMM-104 | Build Commission Reports (per-agent, per-period) | L (6h) | P1 |
| COMM-105 | Build Commission Payments tracking | M (4h) | P1 |
| COMM-106 | Write commission hooks | S (2h) | P0 |
| COMM-107 | Verify auto-calculation trigger on invoice PAID event | M (2h) | P0 |
| COMM-108 | Write commission tests | M (4h) | P1 |

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
| Commission frontend in scope | Frontend 0% built | Gap |
| Auto-calculation on invoice paid | Backend partial, trigger uncertain | Needs verification |
| 6 screens planned | 0 built | 100% gap |
| Tests required | 0 tests | Critical gap |

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

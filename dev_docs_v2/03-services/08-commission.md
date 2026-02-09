# Service 08: Commission

> **Grade:** B+ (8.0/10) Backend / 0% Frontend | **Priority:** Build | **Phase:** 6 (weeks 14-16)
> **Web Prompt:** `dev_docs/11-ai-dev/web-dev-prompts/08-commission-ui.md`
> **Design Specs:** `dev_docs/12-Rabih-design-Process/08-commission/` (6 files)

---

## Status Summary

Backend is substantially implemented with Commission plans, entry tracking, payout calculations, and rep management. ~702 LOC across core services. Frontend is 0% complete -- no screens built yet. Grade reflects solid backend (B+) with tiered plans, auto-calculations, and payout state machines. Phase 6 placement aligns with post-MVP timeline for sales rep payouts.

---

## Screens

| Screen | Route | Status | Quality | Task ID | Notes |
|--------|-------|--------|---------|---------|-------|
| Commission Dashboard | `/commissions` | Not Built | -- | -- | Phase 6 |
| Sales Reps List | `/commissions/reps` | Not Built | -- | -- | Phase 6 |
| Rep Commission Detail | `/commissions/reps/[id]` | Not Built | -- | -- | Phase 6 |
| Commission Plans | `/commissions/plans` | Not Built | -- | -- | Phase 6 |
| Plan Create | `/commissions/plans/new` | Not Built | -- | -- | Phase 6 |
| Plan Detail | `/commissions/plans/[id]` | Not Built | -- | -- | Phase 6 |
| Commission Payouts | `/commissions/payouts` | Not Built | -- | -- | Phase 6 |
| Payout Detail | `/commissions/payouts/[id]` | Not Built | -- | -- | Phase 6 |
| Commission Reports | `/commissions/reports` | Not Built | -- | -- | Phase 6 |

---

## Backend API

### Commission Plans (6 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/commissions/plans` | GET/POST | Production | List + Create plan |
| `/api/v1/commissions/plans/:id` | GET/PUT/DELETE | Production | Full CRUD |
| `/api/v1/commissions/plans/:id/activate` | POST | Production | Set as default |

### Sales Reps (4 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/commissions/reps` | GET | Production | List reps with earnings |
| `/api/v1/commissions/reps/:id` | GET | Production | Rep detail |
| `/api/v1/commissions/reps/:id/plan` | POST | Production | Assign commission plan |
| `/api/v1/commissions/reps/:id/transactions` | GET | Production | Transaction history |

### Transactions (4 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/commissions/transactions` | GET | Production | List all transactions |
| `/api/v1/commissions/transactions/:id` | GET | Production | Transaction detail |
| `/api/v1/commissions/transactions/:id/approve` | POST | Production | Approve earned commission |
| `/api/v1/commissions/transactions/:id/void` | POST | Production | Void transaction with reason |

### Payouts (4 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/commissions/payouts` | GET/POST | Production | List + Generate payout |
| `/api/v1/commissions/payouts/:id` | GET | Production | Payout detail |
| `/api/v1/commissions/payouts/:id/process` | POST | Production | Process payment (ACH/check/wire) |

### Dashboard (1 endpoint -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/commissions/dashboard` | GET | Production | KPI data (pending, paid, top reps) |

---

## Frontend Components

**Status: 0 components exist. All must be built in Phase 6.**

| Component | Path | Notes |
|-----------|------|-------|
| CommissionDashboardStats | `components/commissions/commission-dashboard-stats.tsx` | To build |
| RepCommissionsTable | `components/commissions/rep-commissions-table.tsx` | To build |
| CommissionPlanCard | `components/commissions/commission-plan-card.tsx` | To build |
| CommissionPlanForm | `components/commissions/commission-plan-form.tsx` | To build |
| TierEditor | `components/commissions/tier-editor.tsx` | To build |
| PayoutTable | `components/commissions/payout-table.tsx` | To build |
| EarningsChart | `components/commissions/earnings-chart.tsx` | To build |

---

## Design Specs

| Screen | Spec File | Content Level |
|--------|-----------|---------------|
| Service Overview | `00-service-overview.md` | Overview |
| Commission Dashboard | `01-commission-dashboard.md` | Full 15-section |
| Commission Plans | `02-commission-plans.md` | Full 15-section |
| Plan Editor | `03-plan-editor.md` | Full 15-section |
| Commission Calculator | `04-commission-calculator.md` | Full 15-section |
| Commission Statements | `05-commission-statements.md` | Full 15-section |
| Payout History | `06-payout-history.md` | Full 15-section |

---

## Open Bugs

None known. Backend verified production-ready.

---

## Tasks

| Task ID | Title | Phase | Status | Effort |
|---------|-------|-------|--------|--------|
| COM-001 | Build Commission Dashboard | 6 | NOT STARTED | M (3h) |
| COM-002 | Build Sales Reps list & detail | 6 | NOT STARTED | M (4h) |
| COM-003 | Build Commission Plans (CRUD + tier editor) | 6 | NOT STARTED | L (6h) |
| COM-004 | Build Commission Transactions list | 6 | NOT STARTED | M (3h) |
| COM-005 | Build Payout generation & processing | 6 | NOT STARTED | M (4h) |
| COM-006 | Build Commission Reports | 6 | NOT STARTED | S (2h) |

---

## Key Business Rules

### Commission Plan Types
| Type | Code | Calculation |
|------|------|-------------|
| Margin Percentage | MARGIN_PERCENT | `commission = orderMargin × rate%` |
| Revenue Percentage | REVENUE_PERCENT | `commission = customerRate × rate%` |
| Flat Per Load | FLAT_PER_LOAD | `commission = flatAmount` per completed load |
| Tiered Margin | TIERED_MARGIN | Rate varies by margin % (see tiers below) |

### Default Tiered Rates
| Margin % | Commission Rate | Example (on $1,000 margin) |
|----------|----------------|---------------------------|
| ≥ 25% | 15% | $150 |
| ≥ 18% | 12% | $120 |
| ≥ 12% | 10% | $100 |
| < 12% | 8% | $80 |

### Earning & Payment Rules
| Rule | Detail |
|------|--------|
| **Earned When** | Order status = DELIVERED + invoice created |
| **Payable When** | Customer payment received (reduces clawback risk) |
| **Void Conditions** | Order cancelled, invoice voided, or manager override |
| **Payout Frequency** | Weekly, biweekly, or monthly (configurable per rep) |
| **Payout Methods** | ACH (direct deposit), check, wire transfer |

## Key References

| Document | Path | What It Contains |
|----------|------|------------------|
| Data Dictionary | `dev_docs/11-ai-dev/91-data-dictionary.md` | Commission, Plan, Payout schemas |
| Business Rules | `dev_docs/11-ai-dev/92-business-rules-reference.md` | Tiered rates, earning conditions |

---

## Dependencies

- **Depends on:** Auth, Sales (quotes/orders), TMS Core (order revenue), design tokens (COMP-001)
- **Depended on by:** Payroll integration, financial dashboards

---

## What to Build Next (Ordered)

1. **Build Commission Dashboard** -- KPI cards (pending total, paid this month/year, avg rate, top reps). 3h.
2. **Build Sales Reps List** -- Table: name, email, assigned plan, pending earnings, MTD/YTD. 2h.
3. **Build Rep Detail** -- Summary card, transaction history, assign plan button. 2h.
4. **Build Commission Plans** -- List + create/edit. Tier editor (min/max/rate per tier). 6h.
5. **Build Transaction History** -- List, approve/void buttons, filter by rep/date/status. 3h.
6. **Build Payout Page** -- List payouts, generate, process (ACH/check/wire). 4h.
7. **Build Reports** -- Rep earnings by month, plan usage, payout summary. 2h.

---

## Implementation Notes

- Plan types: PERCENTAGE, FLAT, TIERED_PERCENTAGE, TIERED_FLAT
- Transaction status: PENDING > APPROVED > PAID/VOID
- Auto-calculation: order revenue x rate (or tiered lookup) = commission amount
- Payout frequency: weekly, biweekly, monthly with configurable delay
- Payout state: PENDING > PROCESSING > PAID/FAILED

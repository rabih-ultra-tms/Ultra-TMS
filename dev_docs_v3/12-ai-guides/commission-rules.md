# Commission Domain Rules

> AI Dev Guide | Source: `dev_docs_v3/01-services/p0-mvp/08-commission.md`

---

## Commission Trigger

- Commission is calculated when an invoice status changes to PAID.
- Formula: `commission = invoiceTotal * commissionRate` (from sales rep's active plan).
- Commission is NOT calculated on drafts or unpaid invoices.

## Commission Plans

- Each sales rep (SALES_REP role) is assigned exactly one active plan at a time.
- Plans define: base rate (%), tiered rate thresholds, bonus triggers, excluded customers.
- Plan changes don't recalculate historical commissions -- history is preserved.

## Plan Types

| Plan Type | Basis | Example |
|-----------|-------|---------|
| MARGIN_PERCENT | % of gross margin | 10% of margin |
| REVENUE_PERCENT | % of customer rate | 3% of rate |
| FLAT_PER_LOAD | Fixed amount per load | $50 per load |
| TIERED_MARGIN | Varies by margin % | 8-15% based on margin |

## Tiered Commission

- Plans can have tiers: e.g., 3% on first $100k/month, 4% on $100k-$250k, 5% above $250k.
- Tiers reset monthly on the 1st.
- MTD tracking required for accurate real-time commission display.

## Attribution Rules

- Commission attributed to the sales rep who created the original quote.
- If no quote, attributed to the user who created the order.
- Attribution CANNOT be changed after the invoice is paid.

## Manager Override

- ADMIN can manually adjust a commission amount (for credits, disputes).
- All overrides logged to AuditLog with reason.
- Adjusted commissions show a flag in the UI.

## Payment Cycle

- Default: monthly on the 15th.
- Paid via check or ACH.
- Payment recorded separately from commission calculation.
- Commission can be earned but held pending payment.

## Dispute Window

- Sales reps have 30 days from month-end to dispute a calculation.
- After 30 days, commission is locked and cannot be adjusted without ADMIN override.

## Excluded Revenue

Per commission plan, the following may be excluded:
- Specific customers (e.g., house accounts)
- Accessorials only (no line haul component)
- Fuel surcharges

## Commission Status Machine

```
PENDING (invoice paid, calculation done) -> APPROVED (accounting review)
APPROVED -> PAID (payment recorded)
PENDING/APPROVED -> DISPUTED (sales rep challenges)
DISPUTED -> APPROVED (after resolution)
```

## Validation Rules

| Field | Rule |
|-------|------|
| `commissionRate` | 0-100% Decimal |
| Plan `baseRate` | Max 20% (business limit) |
| `invoiceId` | Must be PAID invoice |
| `salesRepId` | Must be SALES_REP or ADMIN role |
| Plan tiers | Thresholds must be ascending |
| Attribution | Cannot change after invoice PAID |

## API Endpoints

| Method | Path | Status |
|--------|------|--------|
| GET | `/api/v1/commission` | Partial |
| GET | `/api/v1/commission/:id` | Partial |
| POST | `/api/v1/commission/calculate` | Partial |
| GET/POST | `/api/v1/commission/plans` | Partial |
| PUT | `/api/v1/commission/plans/:id` | Partial |
| GET/POST | `/api/v1/commission/payments` | Partial |
| GET | `/api/v1/commission/stats` | Partial |

## Critical Status

- Frontend: 0% built -- sidebar link 404s
- Backend: partial -- auto-calculation trigger needs verification
- No hooks, no tests, no components exist

# Accounting Domain Rules (Industry)

> AI Dev Guide | AR/AP cycle, aging buckets, settlement types, factoring basics

---

## The AR/AP Cycle in 3PL

```
Customer places order -> Carrier delivers freight
   |                        |
   v                        v
Invoice customer (AR)    Settle with carrier (AP)
   |                        |
   v                        v
Collect payment          Pay carrier
   |                        |
   v                        v
Revenue recognized       Cost recognized
```

The broker's profit = AR collected - AP paid.

## Accounts Receivable (AR)

### Invoice Lifecycle

1. **Draft** -- Auto-generated when order status = DELIVERED
2. **Sent** -- Emailed to customer (PDF attachment)
3. **Viewed** -- Customer opened email (tracking pixel)
4. **Partial** -- Partial payment received
5. **Paid** -- Full payment received
6. **Overdue** -- Past due date, escalation begins

### Aging Buckets

| Bucket | Days Outstanding | Action |
|--------|-----------------|--------|
| Current | 0-30 | Normal monitoring |
| 30 Days | 31-60 | Friendly reminder email |
| 60 Days | 61-90 | Second notice, credit hold warning |
| 90+ Days | > 90 | Credit hold applied, final notice, consider collections |

### Collection Escalation

```
Day 1: Friendly reminder email
Day 7: Second notice
Day 14: Phone call from accounting
Day 30: Final notice email
Day 45: Credit hold warning
Day 60: Credit hold applied (auto)
Day 90: Consider collections agency
```

### Credit Hold Rules

Auto-triggered when:
- Any invoice 60+ days overdue
- 3+ invoices 30+ days overdue
- Customer balance exceeds credit limit

Manual release requires:
- Outstanding balance brought current
- ACCOUNTING role review and approval
- Logged to audit trail

## Accounts Payable (AP)

### Settlement Lifecycle

1. **Pending** -- Auto-generated when load = DELIVERED
2. **Approved** -- Accounting reviews and approves amounts
3. **Processing** -- Payment initiated (ACH/check cut)
4. **Paid** -- Payment completed

### Payment Methods

| Method | Timing | Fee | Notes |
|--------|--------|-----|-------|
| ACH | 1-3 business days | None | Standard for NET30 |
| Check | 5-7 business days | None | Traditional |
| Wire | Same day | $25-35 fee | For large/urgent payments |
| Quick Pay | 2 days | 2-3% discount | Carrier gets paid fast, broker keeps fee |

### Quick Pay Calculation

```
Quick Pay fee = (daysEarly * 0.02 * carrierRate) / 30
Example: NET30 carrier, quick pay in 2 days
  Fee = (28 * 0.02 * $2000) / 30 = $37.33
  Carrier receives: $2000 - $37.33 = $1,962.67
```

## Factoring

### How It Works

1. Carrier delivers load
2. Instead of waiting 30 days for broker payment, carrier sells invoice to factoring company
3. Factoring company pays carrier immediately (minus 2-5% fee)
4. Broker pays the factoring company on normal terms

### Impact on TMS

- When `carrier.factoring = true`, payments go to `carrier.factoringCompany` address
- Invoice format may need to show factoring company as payee
- Notice of Assignment (NOA) on file

## Revenue Recognition

Revenue is recognized when:
1. Load is DELIVERED (service completed)
2. Invoice is created (documentation)
3. Payment is received (cash basis) OR invoice is sent (accrual basis)

Most 3PLs use **accrual basis** -- revenue recognized when invoiced.

## Tax Considerations

- Freight transportation is generally exempt from sales tax in most US states
- However, accessorial services (warehousing, packaging) may be taxable
- Current implementation: tax is informational only (displayed but not auto-calculated)
- P3 roadmap: integrate with Avalara/TaxJar for automated tax calculation

## Key Metrics

| Metric | Formula | Target |
|--------|---------|--------|
| DSO (Days Sales Outstanding) | (AR / Revenue) * 365 | < 35 days |
| DPO (Days Payable Outstanding) | (AP / Cost) * 365 | Match carrier terms |
| Bad Debt Ratio | (Write-offs / Revenue) * 100 | < 1% |
| Collection Rate | (Collected / Invoiced) * 100 | > 98% |
| Gross Margin | (Revenue - Cost) / Revenue | > 15% |

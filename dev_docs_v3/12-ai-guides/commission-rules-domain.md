# Commission Domain Rules (Industry)

> AI Dev Guide | Rep types, tier structures, split commissions, override commissions

---

## Sales Rep Types in 3PL

| Type | Role | Commission Basis |
|------|------|-----------------|
| **Outside Sales** | Brings in new customers | Higher rate (10-15% of margin), decreasing over time |
| **Inside Sales** | Manages existing accounts, handles quotes | Standard rate (8-12% of margin) |
| **Account Manager** | Retains and grows accounts | Lower rate (5-8% of margin) + retention bonus |
| **Sales Manager** | Oversees team | Override commission on team's production |

## Commission Plan Types

### 1. Percentage of Margin

Most common in 3PL. Commission = margin * rate.

```
If margin = $400 and rate = 10%:
  Commission = $400 * 0.10 = $40
```

### 2. Percentage of Revenue

Used for high-volume, low-margin accounts.

```
If revenue = $2500 and rate = 3%:
  Commission = $2500 * 0.03 = $75
```

### 3. Flat Per Load

Simple, predictable. Used for new reps or specific lanes.

```
Commission = $50 per delivered load
```

### 4. Tiered Margin

Rate increases with higher margin percentage:

| Margin % | Commission Rate |
|----------|----------------|
| < 12% | 8% of margin |
| 12-18% | 10% of margin |
| 18-25% | 12% of margin |
| > 25% | 15% of margin |

This incentivizes reps to negotiate better rates.

## Tier Structures

### Monthly Volume Tiers

Rate increases as monthly revenue grows:

| Monthly Revenue | Commission Rate |
|----------------|----------------|
| $0 - $100,000 | 3% of margin |
| $100,001 - $250,000 | 4% of margin |
| $250,001 - $500,000 | 5% of margin |
| $500,001+ | 6% of margin |

**Important:** Tiers reset on the 1st of each month. MTD tracking is required for accurate real-time display.

### Retroactive vs Progressive Tiers

- **Progressive:** Higher rate only applies to revenue above the threshold (like tax brackets)
- **Retroactive:** Higher rate applies to ALL revenue once threshold is hit

Ultra TMS supports both via the `tiers` JSON field on CommissionPlan.

## Split Commissions

When multiple reps are involved in an account:

```
Customer: ABC Manufacturing
  - James (brought the customer): 60% of commission
  - Lisa (manages day-to-day): 40% of commission

Load margin: $400, commission rate: 10%
  James: $400 * 0.10 * 0.60 = $24
  Lisa:  $400 * 0.10 * 0.40 = $16
```

Split rules are defined per customer, not per load.

## Override Commissions

Sales managers earn a small percentage on their team's production:

```
Manager: Sarah Operations
Override rate: 2% of margin on all team loads

Team member Maria books $50,000 margin this month:
  Sarah's override: $50,000 * 0.02 = $1,000
  (In addition to Maria's own commission)
```

## Commission Calculation Rules

### When is commission earned?

1. Load must be DELIVERED
2. Invoice must be created
3. **Payable when:** Customer payment received (cash basis)

### Attribution Rules

| Scenario | Commission Goes To |
|----------|--------------------|
| Rep created the quote | Quote creator |
| No quote, rep created order | Order creator |
| Customer has assigned rep | Assigned rep |
| Multiple reps claimed | Split per plan rules |

### What's excluded?

Per commission plan configuration:
- House accounts (no rep attribution)
- Fuel surcharges (often excluded from commission basis)
- Accessorial-only charges
- Specific named customers
- Loads below minimum margin threshold

## Payment Cycle

```
Month 1: Loads delivered, commissions calculated
Month 2 Day 1-5: Accounting reviews and approves
Month 2 Day 15: Commission payment issued
```

- Payment methods: Check or ACH
- Minimum payout threshold: $50 (below this, rolls to next month)
- Dispute window: 30 days from month-end

## Clawback Rules

If a customer invoice is voided or written off AFTER commission is paid:

1. Commission is reversed in the next payment cycle
2. Sales rep is notified
3. Reversal logged to audit trail
4. Minimum balance check prevents negative payouts

## Key Metrics

| Metric | Formula | Purpose |
|--------|---------|---------|
| Commission as % of Revenue | Total commissions / Total revenue | Should be 2-5% |
| Commission as % of Margin | Total commissions / Total margin | Should be 15-25% |
| Loads per Rep | Total loads / Number of reps | Productivity measure |
| Revenue per Rep | Total revenue / Number of reps | Performance ranking |
| MTD Attainment | Current month revenue / Monthly target | Progress tracking |

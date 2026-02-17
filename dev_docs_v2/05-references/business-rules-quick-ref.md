# Business Rules Quick Reference

> **Source:** `dev_docs/11-ai-dev/92-business-rules-reference.md` + Prisma schema
> **Purpose:** Scannable reference for frontend developers building TMS screens

---

## 1. Margin Rules

| Rule | Value | Notes |
|------|-------|-------|
| Margin formula | `(customerRate + fuelSurcharge + customerAccessorials) - (carrierRate + carrierAccessorials)` | Includes all accessorials |
| Margin % formula | `margin / totalRevenue × 100` | Based on total revenue, not customer rate alone |
| Warning threshold | < 15% | Show yellow warning on load form |
| Hard floor | Configurable per tenant | Cannot book below this % |
| Target display | By lane | Show historical margin for same origin/dest |

---

## 2. Credit Management

| Rule | Value | Trigger |
|------|-------|---------|
| Credit hold: over limit | `currentBalance > creditLimit` | Auto-hold |
| Credit hold: 60+ days past due | Any invoice 60+ days overdue | Auto-hold |
| Credit hold: 3× past due | 3+ invoices 30+ days overdue | Auto-hold |
| COD customers | Always allowed to create loads | Payment handled separately |
| PREPAID customers | Always allowed to create loads | Payment handled separately |
| PENDING/HOLD/DENIED | **Cannot** create loads | Must resolve first |
| Credit limit check | `loadAmount <= creditLimit - currentBalance` | On order creation for APPROVED customers |

### Credit Status Transitions

| From | To | Trigger |
|------|-----|---------|
| PENDING | APPROVED | Credit check passed |
| PENDING | DENIED | Credit check failed |
| PENDING | COD | Customer requests COD |
| APPROVED | HOLD | Past due or over limit |
| APPROVED | COD | Customer requests |
| HOLD | APPROVED | Balance cleared |
| HOLD | DENIED | Extended non-payment |
| COD | APPROVED | Credit review passed |
| DENIED | PENDING | Re-apply for credit |

---

## 3. Detention Calculations

| Parameter | Default Value |
|-----------|---------------|
| Free time (pickup) | 2 hours |
| Free time (delivery) | 2 hours |
| Rate after free time | $75/hour |
| Max billable hours | 8 hours (cap) |
| Clock starts at | Arrival time |
| Max charge per stop | 8h × $75 = **$600** |

**Formula:** `billableHours = min(max(0, totalHours - freeHours), 8)` → `charge = billableHours × $75`

---

## 4. TONU (Truck Ordered Not Used)

| Rule | Value |
|------|-------|
| Applies when | Load cancelled after dispatch + 2h window |
| Fee formula | 25% of carrier rate |
| Max fee | $500 |
| Fee = | `min(carrierRate × 0.25, 500)` |
| Free cancellation window | Within 2h of dispatch, load still in DISPATCHED status |
| Pre-dispatch cancellation | No fee (PENDING or COVERED status) |
| Terminal states | Cannot cancel DELIVERED, COMPLETED, or already CANCELLED |

---

## 5. Check Call Intervals

| Threshold | Action |
|-----------|--------|
| Default interval | Every 4 hours |
| 2h overdue | Reminder sent to driver |
| 4h overdue | Alert dispatcher |
| 8h overdue | Alert manager |
| 24h overdue | Critical alert |

### Invoice Collection Escalation

| Days Past Due | Action |
|---------------|--------|
| 7 days | Friendly reminder |
| 14 days | Second notice |
| 30 days | Final notice |
| 45 days | Credit hold warning |
| 60 days | Credit hold applied |

---

## 6. Load Status Transitions

### Valid Transitions

| Current Status | Allowed Next Status(es) |
|----------------|------------------------|
| `PENDING` | COVERED, CANCELLED |
| `COVERED` | DISPATCHED, PENDING (carrier removed), CANCELLED |
| `DISPATCHED` | EN_ROUTE_PICKUP, COVERED, CANCELLED |
| `EN_ROUTE_PICKUP` | AT_PICKUP, CANCELLED |
| `AT_PICKUP` | LOADED, CANCELLED |
| `LOADED` | EN_ROUTE_DELIVERY |
| `EN_ROUTE_DELIVERY` | AT_DELIVERY |
| `AT_DELIVERY` | DELIVERED |
| `DELIVERED` | COMPLETED |
| `COMPLETED` | _(terminal)_ |
| `CANCELLED` | _(terminal)_ |

### Status Flow Diagram

```
PENDING → COVERED → DISPATCHED → EN_ROUTE_PICKUP → AT_PICKUP → LOADED
                                                                    ↓
COMPLETED ← DELIVERED ← AT_DELIVERY ← EN_ROUTE_DELIVERY ←─────────┘
```

Any non-terminal status → CANCELLED (except after LOADED)

---

## 7. Accessorial Codes

| Code | Name | Default Rate | Billable To |
|------|------|-------------|-------------|
| `DETENTION` | Detention (per hour) | $75/hr | Customer |
| `LAYOVER` | Layover (per day) | $350/day | Customer |
| `LUMPER` | Lumper fee | Pass-through | Customer |
| `TONU` | Truck ordered not used | $250–500 | Customer |
| `REWEIGH` | Scale/reweigh | $35 | Customer |
| `STOP_OFF` | Additional stop | $150/stop | Customer |
| `TARPING` | Flatbed tarping | $75–150 | Customer |
| `HAZMAT` | Hazmat handling | Varies | Customer |
| `TEAM` | Team driver premium | $0.20/mi | Customer |
| `EXPEDITED` | Expedited surcharge | 20–50% | Customer |
| `FUEL` | Fuel surcharge | Varies | Customer |

---

## 8. Weight & Dimension Limits

| Parameter | Value |
|-----------|-------|
| Weight range | 1–80,000 lbs |
| Overweight threshold | > 45,000 lbs (standard dry van) |
| Pickup date max future | 90 days |
| Delivery date rule | Must be >= pickup date |
| Temperature min/max | min must be < max (reefer only) |

### Standard Truck Capacities

| Equipment Type | Max Weight | Notes |
|---------------|------------|-------|
| Dry Van | 45,000 lbs | Standard 53' |
| Reefer | 43,500 lbs | Reefer unit weight offset |
| Flatbed | 48,000 lbs | Standard |
| Step Deck | 43,000 lbs | Lower deck clearance |

---

## 9. Insurance Minimums

| Coverage Type | Minimum Required | Notes |
|--------------|-----------------|-------|
| Auto liability | $750,000 | Required for dispatch eligibility |
| Cargo insurance | $100,000 | Required if provided |
| Expiry check | Must be future date | Cannot dispatch with expired insurance |
| Expiry warning | Within 30 days | Compliance status = WARNING |
| Below minimum | Any amount < required | Compliance status = EXPIRED |

### Carrier Compliance Calculation

| Condition | Compliance Status |
|-----------|-------------------|
| Insurance valid + amount >= $750K | `COMPLIANT` |
| Insurance expiring within 30 days | `WARNING` |
| Insurance expired OR amount < $750K | `EXPIRED` |
| No insurance on file | `EXPIRED` |

---

## 10. Invoice Rules

| Rule | Value |
|------|-------|
| Can invoice when | Load status = DELIVERED or COMPLETED |
| POD requirement | Configurable per tenant (`requirePOD` setting) |
| Cannot invoice if | Already invoiced (`invoiceId` exists) |
| Due date formula | `invoiceCreatedAt + customer.paymentTerms` |
| Default payment terms | NET30 (30 days) |

### Payment Terms

| Code | Days | Description |
|------|------|-------------|
| `NET15` | 15 | Due in 15 days |
| `NET21` | 21 | Due in 21 days |
| `NET30` | 30 | Due in 30 days **(default)** |
| `NET45` | 45 | Due in 45 days |
| `COD` | 0 | Cash on delivery |
| `PREPAID` | -1 | Payment before service |

### Invoice Statuses

| Status | Meaning | Available Actions |
|--------|---------|-------------------|
| `DRAFT` | Not yet sent | Edit, Send, Delete |
| `SENT` | Sent to customer | Record Payment, Void |
| `PARTIAL` | Partially paid | Record Payment |
| `PAID` | Fully paid | None |
| `OVERDUE` | Past due date | Send Reminder, Credit Hold |
| `VOID` | Cancelled | None |
| `DISPUTED` | Customer dispute | Resolve, Adjust |

### Carrier Payment Rules

| Rule | Condition |
|------|-----------|
| Can pay when | Load DELIVERED or COMPLETED |
| POD requirement | Configurable (`requirePODBeforePayment`) |
| Payment timing | After `carrier.paymentTerms` days elapsed |
| Quick pay | 2-day payout, fee = `(daysEarly × 0.02 × carrierRate) / 30` |

---

## 11. Commission Rules

### Earning Conditions

| Condition | Required |
|-----------|----------|
| Load status | Must be DELIVERED |
| Invoice | Must be created |
| Payable when | Customer payment received |

### Commission Plan Types

| Plan Type | Basis | Example |
|-----------|-------|---------|
| `MARGIN_PERCENT` | % of gross margin | 10% of margin |
| `REVENUE_PERCENT` | % of customer rate | 3% of rate |
| `FLAT_PER_LOAD` | Fixed amount per load | $50 per load |
| `TIERED_MARGIN` | Varies by margin % | 8–15% based on margin tier |

### Tiered Margin Thresholds (Default)

| Margin % | Tier | Commission Rate |
|----------|------|-----------------|
| < 12% | Below minimum | Base rate (e.g. 8%) |
| 12–17% | Tier 1 | `plan.tier1Rate` (e.g. 10%) |
| 18–24% | Tier 2 | `plan.tier2Rate` (e.g. 12%) |
| >= 25% | Tier 3 | `plan.tier3Rate` (e.g. 15%) |

### Commission Status Flow (Prisma)

| Status | Meaning |
|--------|---------|
| `CALCULATED` | Commission computed from delivered load |
| `APPROVED` | Manager approved for payout |
| `PAID` | Included in payout |
| `ADJUSTED` | Manual adjustment applied |
| `VOIDED` | Cancelled |

### Payout Status Flow (Prisma)

| Status | Meaning |
|--------|---------|
| `PENDING` | Awaiting approval |
| `APPROVED` | Ready for processing |
| `PROCESSING` | Payment in progress |
| `PAID` | Payout completed |
| `FAILED` | Payment failed |

---

## Appendix: Carrier Status Transitions

| From | To | Trigger |
|------|-----|---------|
| PENDING | ACTIVE | Admin approval + all docs valid |
| PENDING | INACTIVE | Admin rejection |
| ACTIVE | INACTIVE | Admin action or compliance failure |
| ACTIVE | BLACKLISTED | Fraud/severe issue |
| INACTIVE | ACTIVE | Reactivation + docs valid |
| INACTIVE | BLACKLISTED | Fraud discovered |
| BLACKLISTED | _(permanent)_ | Requires new carrier record |

## Appendix: Carrier Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `mcNumber` | Exactly 6 digits | "MC Number must be 6 digits" |
| `dotNumber` | 5–8 digits | "DOT Number must be 5-8 digits" |
| `mcNumber` | Unique per tenant | "Carrier with this MC# already exists" |
| `insuranceExpiry` | Must be future date | "Insurance must not be expired" |
| `insuranceAmount` | Min $750,000 | "Liability insurance must be at least $750,000" |
| `cargoInsurance` | Min $100,000 (if provided) | "Cargo insurance must be at least $100,000" |
| `email` | Valid email format | "Invalid email address" |
| `phone` | Valid E.164 format | "Invalid phone number" |

## Appendix: Customer Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `code` | 2–20 uppercase alphanumeric | "Customer code must be 2-20 uppercase letters/numbers" |
| `code` | Unique per tenant | "Customer code already exists" |
| `email` | Valid email format | "Invalid email address" |
| `creditLimit` | Min 0 | "Credit limit cannot be negative" |
| `paymentTerms` | 0–90 days | "Payment terms must be 0-90 days" |

## Appendix: Load Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `deliveryDate` | Must be >= pickupDate | "Delivery date must be on or after pickup date" |
| `customerRate` | Must be > 0 | "Customer rate must be greater than 0" |
| `carrierRate` | Should be < customerRate | Warning: "Carrier rate exceeds customer rate" |
| `weight` | 1–80,000 lbs | "Weight must be between 1 and 80,000 lbs" |
| `pickupDate` | Max 90 days future | "Pickup date too far in future" |
| `equipmentType` | Must be valid enum | "Invalid equipment type" |
| `temperature.min` | Must be < temperature.max | "Min temp must be less than max temp" |

## Appendix: Dispatch Pre-flight Checklist

Before dispatching a load, ALL of the following must be true:

- [ ] Carrier status = `ACTIVE`
- [ ] Carrier compliance = `COMPLIANT`
- [ ] Carrier insurance not expired (and valid through delivery date)
- [ ] Carrier insurance >= $750,000
- [ ] Customer not on credit hold (or is COD/PREPAID)
- [ ] Carrier rate set and > 0
- [ ] Pickup date not in the past
- [ ] Load status = `COVERED`
- [ ] Carrier assigned (`carrierId` exists)

## Appendix: Invoice Pre-flight Checklist

- [ ] Load status = `DELIVERED` or `COMPLETED`
- [ ] POD received (if tenant requires it)
- [ ] Load not already invoiced

## Appendix: Carrier Payment Pre-flight Checklist

- [ ] Load delivered
- [ ] POD received (if tenant requires it)
- [ ] Payment terms elapsed (or quick pay approved)

---

## Appendix: Auto-Notification Triggers

| Event | Recipients | Channels |
|-------|-----------|----------|
| Load dispatched | Carrier, Driver | Email, SMS, Push |
| Approaching pickup | Dispatcher | Email, In-app |
| Load delivered | Customer, Sales Rep | Email |
| POD received | Customer | Email |
| Invoice created | Customer | Email |
| Invoice overdue | Customer, Accounting | Email |
| Carrier insurance expiring | Carrier Relations, Carrier | Email |
| Credit hold triggered | Sales Rep, Customer | Email |

---

## Appendix: Load Number Format

- Pattern: `{PREFIX}-{YEAR}-{SEQUENCE}`
- Example: `FM-2025-0001`
- Prefix: tenant configurable (default: `LD`)
- Sequence: auto-increment per tenant per year, zero-padded to 4 digits

---

> **Navigation:** Back to [Doc Map](./doc-map.md) | [STATUS Dashboard](../STATUS.md)

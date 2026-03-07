# 3PL Business Model

> AI Dev Guide | How a 3PL freight broker makes money, margin structure

---

## What is a 3PL?

A Third-Party Logistics (3PL) provider acts as an intermediary between shippers (companies that need to move freight) and carriers (companies that own trucks). The 3PL does NOT own trucks -- it arranges transportation and earns the spread between what the shipper pays and what the carrier receives.

## Revenue Model

```
Customer (Shipper) pays $2,500 for a load
  - The 3PL keeps the "spread" (margin)
Carrier receives $2,100 for hauling
  - Margin = $2,500 - $2,100 = $400
  - Margin % = $400 / $2,500 = 16%
```

### Revenue Components

| Component | Description | Example |
|-----------|-------------|---------|
| Line haul | Base transportation charge | $2,200 |
| Fuel surcharge | Variable charge for fuel costs | $200 |
| Accessorials | Extra charges (detention, liftgate, etc.) | $100 |
| **Total customer rate** | | **$2,500** |

### Cost Components

| Component | Description | Example |
|-----------|-------------|---------|
| Carrier line haul | Amount paid to carrier | $1,900 |
| Fuel surcharge (carrier) | Carrier fuel surcharge | $150 |
| Accessorials (carrier) | Carrier accessorial costs | $50 |
| **Total carrier cost** | | **$2,100** |

### Margin

```
Gross margin = Total revenue - Total cost = $2,500 - $2,100 = $400
Margin % = $400 / $2,500 = 16%
```

**Ultra TMS enforces a minimum 15% margin.** Below this threshold, dispatcher/manager override with justification is required.

## Typical Margin Ranges

| Load Type | Typical Margin % | Volume |
|-----------|-----------------|--------|
| Contract (repeat customer) | 12-18% | High volume, stable |
| Spot (one-time) | 15-25% | Lower volume, volatile |
| Expedited | 20-35% | Urgent, premium pricing |
| Specialized (hazmat, oversized) | 18-30% | Niche, fewer carriers |

## Revenue Streams

### Primary Revenue
1. **Brokerage margin** -- The spread between customer rate and carrier rate (80-90% of revenue)

### Secondary Revenue
2. **Quick Pay fees** -- 2-3% fee charged to carriers who want payment in 2 days instead of 30
3. **Accessorial markup** -- Marking up detention, lumper, and other accessorial charges
4. **Fuel surcharge spread** -- Difference between customer FSC and carrier FSC

### Future Revenue (not yet in Ultra TMS)
5. **Technology licensing** -- Offering TMS as SaaS to smaller brokers
6. **Data analytics** -- Lane pricing data sold to market participants
7. **Financial services** -- Carrier factoring, insurance brokerage

## Cost Structure

### Variable Costs (per load)
- Carrier payment (85-90% of revenue)
- Commission to sales rep (2-5% of revenue or 10-20% of margin)
- Payment processing fees

### Fixed Costs (monthly)
- Salaries (dispatchers, sales reps, accounting)
- Software (TMS, load boards, communication tools)
- Office space
- Insurance (broker's bond, errors & omissions)
- Technology infrastructure

## Key Business Metrics

| Metric | Formula | Target |
|--------|---------|--------|
| **Gross margin %** | (Revenue - Carrier cost) / Revenue | > 15% |
| **Revenue per load** | Total revenue / Total loads | $1,500-3,000 |
| **Loads per day** | Total loads booked | Growth metric |
| **Revenue per employee** | Total revenue / Headcount | $500K-1M/year |
| **DSO** | Days Sales Outstanding | < 35 days |
| **Carrier payment terms** | Average days to pay carrier | 15-30 days |
| **Load-to-truck ratio** | Loads available / Trucks available | Market indicator |

## The Broker's Day

### Sales Rep
1. Prospect for new customers (calls, emails, networking)
2. Create quotes for customer requests
3. Use Load Planner for rate estimation
4. Follow up on pending quotes
5. Track commission earnings

### Dispatcher
1. Check Operations Dashboard for pending loads
2. Find carriers for pending loads (search, load boards, contacts)
3. Negotiate carrier rates
4. Dispatch loads and confirm with carriers
5. Track in-transit loads (check calls every 4 hours)
6. Handle exceptions (delays, cancellations, claims)

### Accounting
1. Review auto-generated invoices
2. Send invoices to customers
3. Record payments received
4. Approve carrier settlements
5. Process carrier payments
6. Monitor aging and credit holds

## How Ultra TMS Supports This

| Business Need | TMS Feature | Status |
|--------------|-------------|--------|
| Find and quote customers | CRM + Sales/Quotes | Built (basic) |
| Plan loads and routes | Load Planner | Built (9/10, PROTECTED) |
| Find carriers | Carrier Management + Load Board | Partial |
| Dispatch loads | TMS Core (Dispatch Board) | Backend only |
| Track shipments | Tracking Map + Check Calls | Backend only |
| Invoice customers | Accounting (Invoices) | Not built |
| Pay carriers | Accounting (Settlements) | Not built |
| Track commissions | Commission module | Not built |
| Compliance | Carrier Management (FMCSA) | Built |

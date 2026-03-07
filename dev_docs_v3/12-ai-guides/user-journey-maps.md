# User Journey Maps

> AI Dev Guide | Key user flows for dispatcher, accountant, and sales rep

---

## Journey 1: Dispatcher Books a Load

### Actors: Dispatcher, Carrier

### Flow

```
1. DASHBOARD
   Dispatcher opens Operations Dashboard
   Sees: 5 pending loads, 12 in-transit, 3 overdue check calls
   -> Clicks "Pending Loads"

2. ORDERS LIST
   Views orders needing carrier assignment
   Filters: Status = PENDING, Equipment = DRY_VAN
   -> Clicks on Order #ORD-202603-015

3. ORDER DETAIL
   Reviews: Customer (ABC Mfg), pickup (Dallas TX), delivery (Chicago IL)
   Stops: 2 (pickup + delivery), Weight: 42,000 lbs
   -> Clicks "Find Carrier"

4. CARRIER SEARCH
   Searches: equipment DRY_VAN, lane TX-IL
   Sees: 5 carriers, sorted by performance score
   Checks: insurance valid, authority active, not blacklisted
   -> Selects "Express Freight Lines" (score: 96.5%)

5. RATE NEGOTIATION
   Customer rate: $2,500
   Carrier rate entered: $2,100
   Margin: $400 (16%) -- above 15% minimum
   -> Clicks "Assign Carrier"

6. DISPATCH
   System validates: carrier ACTIVE, insured, authorized
   Rate confirmation generated (PDF)
   -> Clicks "Dispatch Load"

7. CONFIRMATION
   Load status: PENDING -> DISPATCHED
   Rate con emailed to carrier
   SMS sent to driver: "Load LD-202603-00015: Pickup Dallas TX tomorrow 8am"
   Check call schedule created (every 4 hours)

8. TRACKING
   Dispatcher monitors on Tracking Map
   Check calls come in every 4 hours
   ETA updates shown in real-time
   -> Load delivered, POD received
```

### Screens Involved

| Step | Screen | Status |
|------|--------|--------|
| 1 | Operations Dashboard | Not Built |
| 2 | Orders List | Not Built |
| 3 | Order Detail | Not Built |
| 4 | Carrier Search | Built (basic, in carriers page) |
| 5 | Load Form (assign carrier) | Not Built |
| 6 | Dispatch Board | Not Built |
| 7 | Automated (backend) | Backend ready |
| 8 | Tracking Map | Not Built |

---

## Journey 2: Accountant Invoices a Customer

### Actors: Accounting User

### Flow

```
1. ACCOUNTING DASHBOARD
   Opens Accounting Dashboard
   Sees: 8 loads delivered (uninvoiced), AR total: $125,000
   -> Clicks "Uninvoiced Loads"

2. INVOICES LIST
   Views auto-generated draft invoices
   Each draft created when load = DELIVERED
   -> Clicks on Invoice #INV-202603-042

3. INVOICE DETAIL
   Reviews line items:
   - Line haul: $2,500
   - Fuel surcharge: $200
   - Detention (2 hrs): $150
   Total: $2,850
   Customer: ABC Manufacturing, Terms: NET30
   -> Clicks "Send Invoice"

4. SEND INVOICE
   PDF generated, emailed to billing contact
   Invoice status: DRAFT -> SENT
   Due date calculated: today + 30 days

5. PAYMENT TRACKING
   35 days later: Invoice is OVERDUE
   System auto-sent reminder at day 1, 7
   -> Accounting sends manual follow-up

6. RECORD PAYMENT
   Customer pays via ACH
   -> Clicks "Record Payment"
   Amount: $2,850, Method: ACH, Ref: ACH-9876
   Invoice status: SENT -> PAID

7. COMMISSION TRIGGER
   Invoice PAID -> auto-calculates commission
   Sales rep James Wilson: 10% of $400 margin = $40
   Commission status: PENDING

8. CARRIER SETTLEMENT
   -> Clicks "Settlements"
   Reviews settlement for carrier Express Freight Lines
   Settlement: $2,100 + $50 FSC = $2,150
   -> Approves and processes ACH payment
   Settlement status: PENDING -> APPROVED -> PAID
```

### Screens Involved

| Step | Screen | Status |
|------|--------|--------|
| 1 | Accounting Dashboard | Not Built |
| 2 | Invoices List | Not Built |
| 3 | Invoice Detail | Not Built |
| 4 | Send Invoice (action) | Backend partial |
| 5 | Aging Report | Not Built |
| 6 | Record Payment (form) | Not Built |
| 7 | Commission (auto) | Backend partial |
| 8 | Settlements List/Detail | Not Built |

---

## Journey 3: Sales Rep Earns Commission

### Actors: Sales Rep

### Flow

```
1. CRM -- LEAD MANAGEMENT
   Sales rep creates lead: "New prospect -- XYZ Corp"
   Lead status: NEW
   -> Qualifies through pipeline: NEW -> QUALIFIED -> PROPOSAL

2. QUOTE CREATION
   Opens Load Planner for rate estimation
   Pastes customer email -> AI extracts cargo details
   Google Maps calculates route: Dallas -> Chicago, 920 miles
   -> Creates quote: $2,500 for DRY_VAN shipment

3. QUOTE SENT
   Quote emailed to prospect
   Quote status: DRAFT -> SENT
   7-day expiry timer starts

4. QUOTE ACCEPTED
   Customer accepts quote
   -> System creates Order from quote data
   Lead stage: WON -> CONVERTED
   Customer record created from lead

5. LOAD DISPATCHED & DELIVERED
   Dispatcher handles dispatch (Journey 1)
   Load delivered successfully

6. INVOICE PAID
   Accounting invoices and collects payment (Journey 2)
   Invoice status: PAID

7. COMMISSION CALCULATED
   System auto-calculates:
   - Attributed to sales rep who created quote
   - Margin: $400, Commission plan: 10%
   - Commission: $40
   - Status: PENDING

8. COMMISSION DASHBOARD
   Sales rep views Commission Dashboard
   Sees: MTD commissions: $2,400
   Sees: Current tier: 4% (revenue $180k, next tier at $250k)
   -> Monthly payout on the 15th

9. COMMISSION PAID
   Accounting approves commissions
   ACH payment to sales rep
   Commission status: APPROVED -> PAID
```

### Screens Involved

| Step | Screen | Status |
|------|--------|--------|
| 1 | Leads List/Pipeline | Built (basic, bugs) |
| 2 | Load Planner | Built (9/10, PROTECTED) |
| 3 | Quote Send (action) | Backend built |
| 4 | Quote Accept (action) | Backend built |
| 5 | Dispatch/Tracking | Not Built |
| 6 | Invoice/Payment | Not Built |
| 7 | Commission (auto) | Backend partial |
| 8 | Commission Dashboard | Not Built |
| 9 | Commission Payments | Not Built |

---

## Journey Gap Analysis

| Journey | Steps with UI | Steps without UI | Completion |
|---------|--------------|-----------------|------------|
| Dispatcher books load | 1/8 | 7/8 | 12% |
| Accountant invoices | 0/8 | 8/8 | 0% |
| Sales rep earns commission | 2/9 | 7/9 | 22% |

This analysis shows that the critical end-to-end user journeys are not yet completeable in the UI, despite strong backend support. TMS Core frontend screens are the highest priority gap.

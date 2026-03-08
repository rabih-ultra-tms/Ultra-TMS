# Cross-Service Data Flow Map

> **Source of Truth** — dev_docs_v3 era | Created: 2026-03-07
> **Purpose:** Map how data flows between Ultra TMS's 9 P0 services, from lead capture to revenue collection.
> **Audience:** AI agents and developers who need to understand entity relationships and service boundaries before writing code.

---

## 1. Revenue Pipeline (Critical Path)

Every dollar of revenue follows this path. A break at any stage blocks downstream revenue.

```
 LEAD CAPTURE          QUOTING             ORDER MGMT           EXECUTION
 ============         =========           ===========          ===========

 +----------+       +----------+        +----------+        +------------+
 |   Lead   | ----> |  Quote   | -----> |  Order   | -----> |    Load    |
 | (CRM)    |       | (Sales)  |        | (TMS)    |        |  (TMS)     |
 +----------+       +----------+        +----------+        +------------+
  Opportunity         Q-YYYYMM-NNN       ORD-YYYYMM-NNN      LD-YYYYMM-NNNNN
  stage: NEW          status: DRAFT      status: PENDING      status: PLANNING
       |                   |                   |                    |
       v                   v                   v                    v
  QUALIFIED            SENT              BOOKED               DISPATCHED
       |                   |                   |                    |
       v                   v                   v                    v
  WON/CONVERTED       ACCEPTED           DISPATCHED           AT_PICKUP
                      (auto-creates       IN_TRANSIT           PICKED_UP
                       Order)             DELIVERED             IN_TRANSIT
                                                               AT_DELIVERY
                                                               DELIVERED


 FINANCIALS              SETTLEMENT            COMPENSATION
 ===========            ============          ==============

 +----------+        +-------------+        +------------+
 | Invoice  | -----> | Settlement  | -----> | Commission |
 | (Acctg)  |        | (Acctg)     |        | (Commssn)  |
 +----------+        +-------------+        +------------+
  INV-YYYYMM-NNN      SET-YYYYMM-NNN        Per invoice
  status: DRAFT        status: PENDING        status: PENDING
       |                    |                      |
       v                    v                      v
  SENT                 APPROVED               APPROVED
       |                    |                      |
       v                    v                      v
  PAID                 PAID                    PAID
```

### Pipeline in One Line

```
Lead -> Quote -> Order -> Load -> Dispatch -> Check Calls -> Delivery -> Invoice -> Payment -> Settlement -> Commission
(CRM)  (Sales)  (TMS)   (TMS)    (TMS)        (TMS)         (TMS)      (Acctg)    (Acctg)    (Acctg)      (Commission)
```

### Key Conversion Points

| From | To | Trigger | Endpoint | What Happens |
|------|----|---------|----------|--------------|
| Lead -> Customer | `POST /crm/opportunities/:id/convert` | Sales rep converts won lead | Creates Customer record in CRM |
| Quote -> Order | `POST /sales/quotes/:id/accept` | Customer accepts quote | Calls `POST /orders/from-quote/:quoteId` internally |
| Order -> Load | `POST /loads` with `orderId` | Dispatcher creates load(s) for order | Load FK references Order; stops copied from order |
| Load -> Dispatch | `POST /loads/:id/dispatch` | Dispatcher assigns carrier + driver | Carrier/driver FKs set; status -> DISPATCHED |
| Delivery -> Invoice | Auto on DELIVERED status | Order status reaches DELIVERED | Draft invoice auto-created from order rate data |
| Delivery -> Settlement | Auto on Load DELIVERED | Load delivered + carrier cost known | Draft settlement auto-created from load carrier cost |
| Invoice PAID -> Commission | Auto on invoice PAID | Payment completes invoice | Commission calculated: invoice total x plan rate |

---

## 2. Entity Lifecycle State Machines

### 2a. Opportunity (Lead) Stages

```
NEW -> QUALIFIED -> PROPOSAL -> NEGOTIATION -> WON -> CONVERTED
                                            \-> LOST
```

### 2b. Quote Status Machine

```
DRAFT -> SENT -> ACCEPTED (auto-creates Order)
              \-> REJECTED
              \-> EXPIRED (auto, system job at midnight)

REJECTED/EXPIRED -> DRAFT (via clone)
DRAFT -> DELETED (soft delete)
```

### 2c. Order Status Machine

```
PENDING -> QUOTED -> BOOKED -> DISPATCHED -> IN_TRANSIT -> DELIVERED -> INVOICED -> COMPLETED
                                                                                         |
PENDING/QUOTED/BOOKED/DISPATCHED/IN_TRANSIT ----------------------------------------> CANCELLED
```

- Status transitions are validated server-side -- no skip-ahead allowed.
- CANCELLED is only reachable from PENDING through IN_TRANSIT.

### 2d. Load Status Machine

```
PLANNING -> PENDING -> TENDERED -> ACCEPTED -> DISPATCHED
                            \-> CANCELLED (carrier rejects)

DISPATCHED -> AT_PICKUP -> PICKED_UP -> IN_TRANSIT -> AT_DELIVERY -> DELIVERED -> COMPLETED
```

- Once PICKED_UP, assigned carrier CANNOT be changed (carrier lock-down).
- TONU fee ($250 default) applies if cancelled after dispatch.

### 2e. Stop Status Machine

```
PENDING -> ARRIVED -> DEPARTED -> COMPLETED
```

- Detention auto-calculated on DEPARTED if (actualTime - freeTime) > 0. Rate: $75/hr, max 8hr.

### 2f. Invoice Status Machine

```
DRAFT -> SENT (manual, creates PDF, emails customer)
SENT -> VIEWED (email open tracking)
SENT/VIEWED -> PARTIAL (partial payment received)
SENT/VIEWED/PARTIAL -> PAID (full payment)
SENT/VIEWED -> OVERDUE (auto on due date pass)
OVERDUE -> PAID (payment recorded)
Any -> DISPUTED (customer disputes)
Any -> VOID (admin only, irreversible)
```

- 60+ days overdue auto-triggers CRM credit HOLD on customer.

### 2g. Settlement Status Machine

```
PENDING -> APPROVED (accounting review) -> PROCESSING (payment initiated) -> PAID
PENDING/APPROVED -> DISPUTED (carrier disputes amount)
DISPUTED -> APPROVED (after resolution)
```

- Settlement cannot be paid until the related invoice is SENT or PAID.

### 2h. Commission Status Machine

```
PENDING (auto on invoice PAID) -> APPROVED (accounting review) -> PAID (payout recorded)
PENDING/APPROVED -> DISPUTED (sales rep challenges, 30-day window)
DISPUTED -> APPROVED (after resolution)
```

### 2i. Carrier Status Machine

```
PENDING -> ACTIVE (onboarding complete: MC/DOT + FMCSA AUTHORIZED + insurance)
ACTIVE -> INACTIVE (voluntary)
ACTIVE -> SUSPENDED (auto: insurance expired; or manual)
ACTIVE -> BLACKLISTED (admin only, permanent until admin reversal)
SUSPENDED -> ACTIVE (insurance renewed + admin confirm)
BLACKLISTED -> ACTIVE (ADMIN only, documented reason)
```

### 2j. Insurance Status Machine

```
ACTIVE -> EXPIRING_SOON (auto, 30 days before expiry)
EXPIRING_SOON -> EXPIRED (auto, on expiry date -- triggers carrier SUSPENDED)
EXPIRED -> ACTIVE (new certificate uploaded + verified)
```

---

## 3. Service-to-Service Data Dependencies

| # | Source Service | Event / Trigger | Consumer Service | Data Passed | Mechanism |
|---|---------------|-----------------|------------------|-------------|-----------|
| 1 | CRM | Lead converted (stage -> CONVERTED) | CRM | Creates Customer record | `POST /crm/opportunities/:id/convert` |
| 2 | CRM | Customer credit status | Sales, TMS Core | creditStatus (HOLD blocks quote accept + order create) | Checked via `GET /crm/customers/:id` |
| 3 | Sales | Quote accepted | TMS Core | Quote data (customer, stops, rate, commodity) | `POST /sales/quotes/:id/accept` -> `POST /orders/from-quote/:quoteId` |
| 4 | Sales | Quote created | Commission | Quote creator = commission attribution (salesRepId) | FK: Quote.createdBy -> User.id |
| 5 | TMS Core | Load created with carrierId | Carrier Mgmt | Carrier compliance check (ACTIVE + insured + authorized) | Validated in LoadsService before assignment |
| 6 | TMS Core | Load dispatched | Carrier Mgmt | carrierId, driverId assigned to load | `POST /loads/:id/dispatch` |
| 7 | TMS Core | Order status -> DELIVERED | Accounting | Order rate data (revenue, cost, line items) | Auto-generates draft Invoice |
| 8 | TMS Core | Load status -> DELIVERED | Accounting | Load carrier cost (lineHaul, fuel, accessorials) | Auto-generates draft Settlement |
| 9 | TMS Core | Load status changes | Dashboard | Real-time KPI updates | WebSocket `/dispatch` namespace (QS-001) |
| 10 | TMS Core | Load location updates | Dashboard | GPS coordinates, ETA | WebSocket `/tracking` namespace (QS-001) |
| 11 | Accounting | Invoice status -> PAID | Commission | invoiceId, orderId, total amount | Auto-triggers commission calculation |
| 12 | Accounting | Invoice 60+ days overdue | CRM | customerId, overdue amount | Auto-sets customer creditStatus -> HOLD |
| 13 | Accounting | Settlement approved + paid | Carrier Mgmt | carrierId, payment amount, method | Settlement.carrierId FK |
| 14 | Carrier Mgmt | Insurance expired | TMS Core | Carrier status -> SUSPENDED | Carrier cannot be assigned to loads |
| 15 | Carrier Mgmt | FMCSA lookup result | Carrier Mgmt | Authority status, CSA scores | `POST /carriers/fmcsa/lookup` |
| 16 | Carrier Mgmt | Carrier performance score | Sales (Load Planner) | Score, preferred status | PREFERRED carriers shown first in carrier selector |
| 17 | Auth | JWT issued on login | All services | userId, tenantId, roles | JWT cookie -> JwtAuthGuard on every request |
| 18 | TMS Core | Available loads | Load Board | Load details for external posting | Load Board reads from loads table |

---

## 4. Key Prisma Foreign Key Chains

### 4a. Revenue Chain (Customer to Payment)

```
Customer (CRM)
  |
  +-- customerId --> Order (TMS Core)
  |                    |
  |                    +-- orderId --> Load (TMS Core)
  |                    |                |
  |                    |                +-- loadId --> Stop (TMS Core)
  |                    |                +-- loadId --> CheckCall (TMS Core)
  |                    |                +-- loadId --> TrackingEvent (TMS Core)
  |                    |                +-- carrierId --> Carrier (Carrier Mgmt)
  |                    |                +-- driverId --> CarrierDriver (Carrier Mgmt)
  |                    |                +-- loadId --> Settlement (Accounting)
  |                    |                                   |
  |                    |                                   +-- carrierId --> Carrier
  |                    |
  |                    +-- orderId --> Invoice (Accounting)
  |                    |                |
  |                    |                +-- invoiceId --> Payment (Accounting)
  |                    |                +-- invoiceId --> Commission (Commission)
  |                    |
  |                    +-- quoteId --> Quote (Sales)
  |                                     |
  |                                     +-- quoteId --> QuoteItem (Sales)
  |                                     +-- quoteId --> QuoteStop (Sales)
  |
  +-- customerId --> Contact (CRM)
  +-- customerId --> Opportunity (CRM)
  +-- customerId --> Invoice (Accounting) [denormalized FK for direct lookup]
```

### 4b. Carrier Chain

```
Carrier (Carrier Mgmt)
  |
  +-- carrierId --> CarrierContact
  +-- carrierId --> CarrierDriver
  +-- carrierId --> CarrierInsurance
  +-- carrierId --> CarrierDocument
  +-- carrierId --> Load (assigned loads)
  +-- carrierId --> Settlement (carrier payments)
```

### 4c. Commission Chain

```
User (Auth) [SALES_REP role]
  |
  +-- salesRepId --> Commission
  |                    |
  |                    +-- invoiceId --> Invoice (Accounting)
  |                    +-- orderId --> Order (TMS Core)
  |                    +-- planId --> CommissionPlan
  |                    +-- paymentId --> CommissionPayment
  |
  +-- salesRepId --> CommissionPlan (one active plan per rep)
  +-- salesRepId --> CommissionPayment (monthly payout records)
```

### 4d. Quote-to-Order Conversion (Data Copy)

When a quote is accepted, data is COPIED (not linked by FK alone):

```
Quote                        Order
-----                        -----
customerId          ->       customerId
QuoteStop[]         ->       Stop[] (copied, new IDs)
QuoteItem[]         ->       rate fields (revenue, cost, margin)
totalRevenue        ->       revenue
totalCost           ->       cost
marginPercent       ->       margin
Quote.id            ->       Order.quoteId (back-reference FK)
Quote.createdBy     ->       Commission attribution (salesRepId)
```

---

## 5. Cross-Cutting Data Flows

### 5a. Multi-Tenant Isolation

Every request follows this path:

```
Client -> JWT Cookie -> JwtAuthGuard -> Extract tenantId -> Service layer -> Prisma WHERE tenantId = ?
```

- `tenantId` is embedded in the JWT at login.
- Every Prisma query MUST include `tenantId` in the WHERE clause.
- No cross-tenant data access is possible at the service layer.
- Models with tenantId: Customer, Order, Load, Stop, Invoice, Settlement, Payment, Commission, Carrier, Quote, and all sub-entities.

### 5b. Soft Delete Pattern

```
All reads:  WHERE deletedAt IS NULL  (default filter)
All deletes: SET deletedAt = NOW()   (never hard delete)
```

- Applied to: Customer, Contact, Opportunity, Order, Load, Stop, Quote, Carrier, CarrierInsurance, CommissionPlan.
- Financial records (Invoice, Settlement, Payment): soft delete restricted to SUPER_ADMIN only (7-year retention).
- Soft-deleted carriers still appear in historical load queries (audit trail).

### 5c. Audit Trail

```
All mutations -> createdBy / updatedBy (FK -> User.id)
               -> createdAt / updatedAt (auto timestamps)
```

- Status changes on Order, Load, Invoice, Settlement, Commission are logged to AuditLog.
- Admin overrides (commission adjustments, blacklist, credit hold release) require a reason field logged to AuditLog.

### 5d. API Envelope Convention

All API responses follow the standard envelope:

```
Single entity:  { data: T }
List endpoint:  { data: T[], pagination: { page, limit, total, totalPages } }
```

- Frontend hooks MUST unwrap: `response.data.data` (not `response.data`).
- Hooks use `unwrap()` and `unwrapPaginated()` helpers for consistent extraction.

### 5e. Number Format Conventions

| Entity | Format | Example | Generation |
|--------|--------|---------|------------|
| Order | `ORD-{YYYYMM}-{NNN}` | ORD-202603-001 | Server-side, sequential per tenant per month |
| Load | `LD-{YYYYMM}-{NNNNN}` | LD-202603-00001 | Server-side, sequential per tenant per month |
| Quote | `Q-{YYYYMM}-{NNN}` | Q-202603-001 | Server-side, auto-generated |
| Invoice | `INV-{YYYYMM}-{NNN}` | INV-202603-001 | Server-side, auto-generated |
| Settlement | `SET-{YYYYMM}-{NNN}` | SET-202603-001 | Server-side, auto-generated |

---

## 6. Data Flow Diagram — Full System

```
                                    +------------------+
                                    |   Auth & Admin   |
                                    |  (JWT, Roles,    |
                                    |   tenantId)      |
                                    +--------+---------+
                                             |
                              JWT cookie on every request
                                             |
         +-----------------------------------+-----------------------------------+
         |                    |              |              |                     |
         v                    v              v              v                     v
  +-----------+      +------------+   +----------+   +----------+        +-----------+
  |    CRM    |      |   Sales &  |   | TMS Core |   | Carrier  |        |   Load    |
  | Customers |----->|   Quotes   |-->| Orders   |<--| Mgmt     |        |   Board   |
  | Contacts  |      | Load Plan  |   | Loads    |   | Drivers  |        | (postings)|
  | Leads     |      | Rate Table |   | Stops    |   | Insurance|        +-----------+
  +-----------+      +------------+   | Dispatch |   | Docs     |              ^
       |  ^                           | Tracking |   | FMCSA    |              |
       |  |                           +----+-----+   +----------+         reads loads
       |  |                                |               ^
       |  |       +------------------------+               |
       |  |       | DELIVERED status                       |
       |  |       v                              carrier assignment
       |  |  +-----------+                     compliance check
       |  |  | Accounting|-------------------------------------+
       |  +--| Invoices  |                                     |
       |     | Payments  |                               +-----+------+
       |     | Settlmnts |------------------------------>| Commission |
       |     +-----------+    invoice PAID               | Plans      |
       |          |           triggers calc              | Payouts    |
       |          |                                      +------------+
       |          v
       |   60+ days overdue
       +-- auto credit HOLD
```

### Data Flow Summary Table

| Flow | Source Entity | Target Entity | Direction | Timing |
|------|-------------|---------------|-----------|--------|
| Lead to Customer | Opportunity | Customer | CRM internal | Manual (sales rep converts) |
| Quote to Order | Quote | Order | Sales -> TMS | On quote acceptance (data copied) |
| Order to Load | Order | Load | TMS internal | Manual (dispatcher creates loads) |
| Load to Carrier | Load | Carrier | TMS -> Carrier | On dispatch (FK assignment) |
| Order to Invoice | Order | Invoice | TMS -> Accounting | Auto on DELIVERED status |
| Load to Settlement | Load | Settlement | TMS -> Accounting | Auto on DELIVERED status |
| Invoice to Commission | Invoice | Commission | Accounting -> Commission | Auto on PAID status |
| Invoice overdue to Credit Hold | Invoice | Customer | Accounting -> CRM | Auto at 60+ days overdue |
| Carrier insurance expiry | CarrierInsurance | Carrier | Carrier internal | Auto (scheduled job) |

---

## 7. Quick Reference — "Where Does X Live?"

| If you need... | Service | Prisma Model(s) | API Prefix |
|---------------|---------|-----------------|------------|
| Customer/company data | CRM | Customer, Contact, Opportunity | `/crm/` |
| Quotes and rates | Sales | Quote, QuoteItem, QuoteStop, RateTable | `/sales/` |
| Orders | TMS Core | Order | `/orders/` |
| Loads, stops, tracking | TMS Core | Load, Stop, CheckCall, TrackingEvent | `/loads/`, `/stops/`, `/checkcalls/` |
| Dispatch board | TMS Core | Load (filtered by status) | `/loads/` + WebSocket `/dispatch` |
| Carrier profiles | Carrier Mgmt | Carrier, CarrierContact, CarrierDriver, CarrierInsurance, CarrierDocument | `/carriers/` |
| Invoices (customer billing) | Accounting | Invoice, InvoiceLineItem, Payment | `/accounting/invoices/`, `/accounting/payments/` |
| Settlements (carrier payment) | Accounting | Settlement | `/accounting/settlements/` |
| Commission calculations | Commission | Commission, CommissionPlan, CommissionPayment | `/commission/` |
| User auth and roles | Auth | User, Tenant, Role | `/auth/` |

# Route Map — All MVP Routes

> Every screen in the 16-week MVP, grouped by service. 47 routes total.

---

## Protected Routes (DO NOT REBUILD)

| Route | Screen | Quality | Notes |
|-------|--------|---------|-------|
| `/load-planner/[id]/edit` | Load Planner | 8/10 | 1,825 LOC, AI cargo + Google Maps, works |
| `/truck-types` | Truck Types | 8/10 | Gold standard, clean CRUD |
| `/login` | Login | 8/10 | Works, good quality |

---

## Auth & Admin (Service 01)

| Route | Screen | Task ID | Status | Phase |
|-------|--------|---------|--------|-------|
| `/` | Main Dashboard | BUG-008 | Rebuild | 0 |
| `/login` | Login | — | PROTECTED | — |
| `/register` | Register | — | Stub | Future |
| `/forgot-password` | Forgot Password | — | Stub | Future |
| `/reset-password` | Reset Password | — | Stub | Future |
| `/profile` | Profile | — | Stub | Future |
| `/settings` | Settings | — | Stub | Future |

---

## CRM (Service 02)

| Route | Screen | Task ID | Status | Phase |
|-------|--------|---------|--------|-------|
| `/companies` | Companies List | — | Built (7/10) | — |
| `/companies/[id]` | Company Detail | — | Built (7/10) | — |
| `/contacts` | Contacts List | BUG-009 | Built (6/10) | 0 |
| `/contacts/[id]` | Contact Detail | — | Built (6/10) | — |
| `/leads` | Leads List | BUG-010 | Built (6/10) | 0 |

---

## Sales (Service 03)

| Route | Screen | Task ID | Status | Phase |
|-------|--------|---------|--------|-------|
| `/quotes` | Quotes List | SALES-001 | Rebuild | 3 |
| `/quotes/[id]` | Quote Detail | SALES-002 | Rebuild | 3 |
| `/quotes/new` | Quote Create | SALES-003 | Rebuild | 3 |
| `/quotes/[id]/edit` | Quote Edit | SALES-003 | Rebuild | 3 |
| `/load-planner/[id]/edit` | Load Planner | — | PROTECTED | — |

---

## TMS Core (Service 04)

| Route | Screen | Task ID | Status | Phase |
|-------|--------|---------|--------|-------|
| `/operations` | Operations Dashboard | TMS-012 | Build | 4 |
| `/operations/orders` | Orders List | TMS-001 | Build | 3 |
| `/operations/orders/[id]` | Order Detail | TMS-002 | Build | 3 |
| `/operations/orders/new` | New Order | TMS-005 | Build | 4 |
| `/operations/orders/[id]/edit` | Edit Order | TMS-006 | Build | 4 |
| `/operations/loads` | Loads List | TMS-003 | Build | 3 |
| `/operations/loads/[id]` | Load Detail | TMS-004 | Build | 3 |
| `/operations/loads/new` | New Load | TMS-007 | Build | 4 |
| `/operations/loads/[id]/edit` | Edit Load | TMS-008 | Build | 4 |
| `/operations/loads/[id]/rate-con` | Rate Confirmation | TMS-014 | Build | 5 |
| `/operations/dispatch` | Dispatch Board | TMS-011 | Build | 4 |
| `/operations/tracking` | Tracking Map | TMS-013 | Build | 5 |

---

## Carrier (Service 05)

| Route | Screen | Task ID | Status | Phase |
|-------|--------|---------|--------|-------|
| `/carriers` | Carriers List | CARR-001 | Rebuild | 2 |
| `/carriers/[id]` | Carrier Detail | BUG-001, CARR-002 | Build + Upgrade | 0, 2 |
| `/carriers/new` | Carrier Create | — | Built (5/10) | — |
| `/carriers/[id]/edit` | Carrier Edit | — | Built (5/10) | — |
| `/truck-types` | Truck Types | — | PROTECTED | — |
| `/load-history` | Load History | BUG-002 | Fix | 0 |

---

## Accounting (Service 06)

| Route | Screen | Task ID | Status | Phase |
|-------|--------|---------|--------|-------|
| `/accounting` | Dashboard | ACC-001 | Build | 6 |
| `/accounting/invoices` | Invoices List | ACC-002 | Build | 6 |
| `/accounting/invoices/[id]` | Invoice Detail | ACC-002 | Build | 6 |
| `/accounting/invoices/new` | Invoice Create | ACC-002 | Build | 6 |
| `/accounting/payments` | Payments Received | ACC-003 | Build | 6 |
| `/accounting/payables` | Carrier Payables | ACC-004 | Build | 6 |
| `/accounting/settlements` | Settlements | ACC-005 | Build | 6 |
| `/accounting/reports/aging` | Aging Reports | ACC-006 | Build | 6 |

---

## Load Board (Service 07)

| Route | Screen | Task ID | Status | Phase |
|-------|--------|---------|--------|-------|
| `/load-board` | Dashboard | LB-001 | Build | 5 |
| `/load-board/post` | Post Load | LB-002 | Build | 5 |
| `/load-board/search` | Available Loads | LB-003 | Build | 5 |
| `/load-board/postings/[id]` | Posting Detail + Bids | LB-004, LB-005 | Build | 5 |

---

## Commission (Service 08)

| Route | Screen | Task ID | Status | Phase |
|-------|--------|---------|--------|-------|
| `/commissions` | Dashboard | COM-001 | Build | 6 |
| `/commissions/reps` | Sales Reps List | COM-002 | Build | 6 |
| `/commissions/reps/[id]` | Rep Detail | COM-002 | Build | 6 |
| `/commissions/plans` | Commission Plans | COM-003 | Build | 6 |
| `/commissions/plans/new` | Plan Create | COM-003 | Build | 6 |
| `/commissions/plans/[id]` | Plan Detail | COM-003 | Build | 6 |
| `/commissions/transactions` | Transactions | COM-004 | Build | 6 |
| `/commissions/payouts` | Payouts | COM-005 | Build | 6 |
| `/commissions/reports` | Reports | COM-006 | Build | 6 |

---

## Summary

| Category | Count |
|----------|-------|
| PROTECTED (do not touch) | 3 |
| Already built (good enough) | 8 |
| Fix/Rebuild in Phase 0 | 5 |
| Build new (Phases 2-6) | 31 |
| **Total MVP Routes** | **47** |

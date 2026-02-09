# Backend Wiring Audit

**Grade:** B- (7.5/10)
**Date:** February 8, 2026

---

## Summary

43 modules, 150+ endpoints, ~42K LOC across services and controllers. The backend is substantially implemented. Core TMS services (Orders, Loads, Carriers, Sales, Accounting) are production-grade with full CRUD, status machines, event emission, and Prisma integration. Future services (Agents, Claims, Contracts, etc.) have wired controllers but empty service implementations.

**Key finding:** The backend is ahead of the frontend. Most P0 MVP work is wiring frontend screens to existing endpoints, not building new backend.

---

## Verified Claims

| Claim | Verdict | Evidence |
|-------|---------|----------|
| LoadsService ~19KB | VERIFIED | 656 lines, full CRUD + status machines + check calls + PDF generation |
| OrdersService ~22KB | VERIFIED | 730 lines, full CRUD + status transitions + clone + convert from quote |
| RateConfirmationService exists | VERIFIED | Embedded in LoadsService.generateRateConfirmation() (lines 440-522) |
| Check Calls service exists | VERIFIED | LoadsService.addCheckCall() (lines 362-413) with location tracking |
| assignCarrier dispatch logic exists | VERIFIED | LoadsService.assignCarrier() (lines 201-255) with carrier validation + event emission |

---

## Tier 1: Production-Ready (Ship Today)

| Module | Services | Controllers | LOC | Key Features |
|--------|----------|-------------|-----|-------------|
| TMS Core | 4 | 4 | 1,862 | Orders, Loads, Stops, Tracking. Full CRUD, status machines, PDF gen, check calls |
| Carrier | 5 | 6 | 1,454 | Onboarding, tier qualification, insurance validation, driver/contact/doc mgmt |
| Load Board | 11 | 9 | 2,407 | Postings, Bids, Tenders, Leads, Capacity search, Geocoding, Rules engine |
| Sales | 5 | 4 | 1,945 | Quotes, Rate Contracts, Accessorial Rates, Performance, Rate Calculation |
| CRM | 5 | 5 | 1,177 | Companies, Contacts, Opportunities, Activities, HubSpot integration |
| Accounting | 10 | 8 | 2,056 | Invoices, Settlements, Payments, Journal Entries, Chart of Accounts, PDF/Reports |
| Operations | 8 | 5 | 1,989 | Load Planner, Truck Types, Load History, Carriers sub, quote/dispatch workflow |

**Tier 1 Total:** 48 services, 41 controllers, 220 files, 13,090 LOC

---

## Tier 2: Partially Implemented

| Module | Status | LOC | Notes |
|--------|--------|-----|-------|
| Commission | Wired | 702 | Entry tracking, Payout calculations, Plans. Ready for frontend. |
| Rate Intelligence | Wired | 515 | Lookup/History exist. Alerts/Analytics are stubs. |
| Communication | Wired | — | Email (SendGrid), SMS (Twilio), Templates, Notifications. Providers configured. |
| Search | Wired | — | Elasticsearch module + indexing services. Partial implementation. |

---

## Tier 3: Stubs (Controllers Only, No Service Logic)

| Module | Controllers | Notes |
|--------|-------------|-------|
| Agents | 6 | Pure stubs, will 404 if called |
| Claims | 7 | Pure stubs |
| Contracts | 9 | Pure stubs |
| Credit | 5 | Pure stubs |
| Workflow | 4 | Pure stubs |
| Factoring | 6 | Pure stubs |
| Safety | 9 | Pure stubs |

---

## Core API Routes (Production-Ready)

```
TMS:
  POST   /api/v1/orders               Create order (with stops & items)
  GET    /api/v1/orders               List orders (paginated, filterable)
  GET    /api/v1/orders/:id           Get order detail
  PUT    /api/v1/orders/:id           Update order
  POST   /api/v1/orders/:id/clone     Clone order
  PATCH  /api/v1/orders/:id/status    Change status
  POST   /api/v1/orders/:id/cancel    Cancel order
  POST   /api/v1/orders/from-quote/:quoteId    Convert quote to order

Loads:
  POST   /api/v1/loads                Create load
  GET    /api/v1/loads                List loads (status/carrier filtering)
  GET    /api/v1/loads/board          Load board view (grouped by status)
  GET    /api/v1/loads/:id            Get load detail
  PUT    /api/v1/loads/:id            Update load
  POST   /api/v1/loads/:id/assign-carrier   Assign carrier + driver
  POST   /api/v1/loads/:id/dispatch   Dispatch load
  PATCH  /api/v1/loads/:id/status     Update status
  POST   /api/v1/loads/:id/check-calls  Log check call
  GET    /api/v1/loads/:id/check-calls   List check calls
  GET    /api/v1/loads/:id/rate-confirmation  Generate PDF
  DELETE /api/v1/loads/:id            Soft delete

Carriers:
  POST   /api/v1/carriers             Create carrier
  GET    /api/v1/carriers             List carriers
  GET    /api/v1/carriers/:id         Get carrier detail
  PUT    /api/v1/carriers/:id         Update carrier
  POST   /api/v1/carriers/:id/onboard Onboard carrier
  POST   /api/v1/carriers/:id/documents   Upload document
  GET    /api/v1/carriers/:id/documents   List documents
  [+ Drivers, Insurances, Contacts CRUD]

Sales:
  POST   /api/v1/quotes               Create quote
  GET    /api/v1/quotes               List quotes
  PATCH  /api/v1/quotes/:id/status    Change status
  POST   /api/v1/quotes/:id/convert   Convert to order

Accounting:
  POST   /api/v1/invoices             Create invoice
  GET    /api/v1/invoices             List invoices
  PATCH  /api/v1/invoices/:id/status  Change status
  POST   /api/v1/settlements          Create settlement
  GET    /api/v1/payments-received    Customer payments
  GET    /api/v1/payments-made        Carrier payouts
  GET    /api/v1/journal-entries      Ledger entries
  GET    /api/v1/chart-of-accounts    Account structure
```

---

## Auth & Security

All endpoints protected by:
1. `JwtAuthGuard` — validates Bearer token
2. `RolesGuard` — checks role-based access
3. Tenant isolation — all queries filter by `tenantId`
4. Soft delete enforcement — all queries check `deletedAt: null`

No public endpoints except `/api/health` and auth routes.

---

## Database Integration

All production services use Prisma with:
- Full type safety from auto-generated schema
- Eager loading with `include` (prevents N+1)
- Transaction support for complex operations
- Pagination with offset/limit
- Event emission on mutations (e.g., `order.created`, `load.assigned`)

---

## Frontend Disconnection Map

| Backend Service | Frontend Status | Action Needed |
|----------------|-----------------|---------------|
| TMS Orders/Loads | Not built | Build screens (Phase 3) |
| Load Board | Not built | Build screens (Phase 3) |
| Accounting | Not built | Build screens (Phase 6) |
| Commission | Not built | Build screens (Phase 6) |
| Carrier Detail | Missing page (404) | Build detail page (Phase 0) |
| Load History Detail | Missing page (404) | Build detail page (Phase 0) |
| Dashboard stats | Hardcoded zeros | Wire to real APIs (Phase 0) |
| CRM Delete | Backend ready, no UI | Add delete buttons (Phase 0) |

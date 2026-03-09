# End-to-End Workflow Analysis

> Purpose: Document which steps in the revenue lifecycle actually work vs have no-op handlers
> **Created:** 2026-03-09 | **Sources:** PST-04 (Sales), PST-05 (TMS Core), PST-07 (Accounting), PST-08 (Commission), data-flow.md

## Revenue Lifecycle

```
Quote -> Order -> Load -> Dispatch -> Track -> Deliver -> POD -> Invoice -> Settlement -> Commission
(Sales)  (TMS)   (TMS)   (TMS)      (TMS)    (TMS)     (Docs) (Acctg)   (Acctg)      (Commission)
```

## Step-by-Step Status

### 1. Quote Creation

- **Status:** Working
- **Frontend:** `/sales/quotes/new` (8.0/10 per PST-04, 6 pages total in Sales)
- **Backend:** `POST /sales/quotes` (QuotesController, 30+ endpoints)
- **Known Issues:**
  - Margin enforcement is dead code (not wired) — PST-04
  - Quote expiry cron does NOT exist — EXPIRED status in state machine but no auto-expiry logic
  - `QuoteItem` model referenced in hub does NOT exist in Prisma (cross-cutting #10)
- **Shippable?** Partially -- quotes can be created but margins are not enforced and quotes never auto-expire

### 2. Order Creation (from Quote)

- **Status:** Working
- **Frontend:** `/operations/orders` (7/10 per PST-05), `/operations/orders/new` (6/10 wrapper)
- **Backend:** `POST /orders/from-quote/:quoteId` (OrdersController, 19 endpoints)
- **Conversion flow:** Quote ACCEPTED -> auto-creates Order (data copied: customer, stops, rate, commodity per data-flow.md Section 4d)
- **Known Issues:** None critical at this step
- **Shippable?** Yes

### 3. Load Creation (from Order)

- **Status:** Working
- **Frontend:** `/operations/loads/new` (8/10), optional `orderId` pre-fill
- **Backend:** `POST /loads` with optional `orderId` FK (LoadsController, 15 endpoints)
- **Known Issues:**
  - Data model was ~30% accurate in original docs (now corrected per PST-05 tribunal)
  - Load form has hazmat conditional fields, stop mapping with fallback logic
- **Shippable?** Yes

### 4. Dispatch (assign carrier to load)

- **Status:** Partial
- **Frontend:** `/operations/dispatch` (4,095 LOC dispatch board, PROTECTED). Components: kanban board, table view, drag-drop, carrier selector, optimistic updates.
- **Backend:** `POST /loads/:id/dispatch`, `POST /loads/:id/assign-carrier` (LoadsController)
- **Known Issues:**
  - No WebSocket gateway (QS-001) -- frontend handlers READY (`use-dispatch-ws.ts` 526 LOC) but backend gateway missing
  - 30-second React Query polling as fallback (TMS Core Rule 11)
  - Load tender/accept/reject endpoints NOT BUILT (TMS-018) -- carrier cannot formally accept/reject a tendered load
  - No real-time carrier communication
- **Shippable?** No -- dispatch board renders and carrier assignment works via REST, but no real-time updates and no carrier tender/accept workflow

### 5. Tracking (in-transit updates)

- **Status:** Not Working (as real-time)
- **Frontend:** `/operations/tracking` (tracking map, 400+ LOC with Google Maps, color-coded markers, sidebar)
- **Backend:** `GET /operations/tracking/positions`, `GET /operations/tracking/positions/:loadId` (2 endpoints)
- **Known Issues:**
  - WebSocket `/tracking` namespace not implemented (QS-001)
  - No TrackingEvent model -- tracking stored on Load model (`currentLocationLat/Lng`, `lastTrackingUpdate`, `eta`) + CheckCall records
  - `use-tracking.ts` has 15-second polling fallback but no WebSocket connection
  - CheckCall architecture: nested under loads (`/loads/:id/check-calls`), 2 endpoints only
  - `use-checkcalls.ts` has 11 fragile field fallback chains (TMS-019)
- **Shippable?** No -- tracking page renders but has no live data source. Manual check calls work.

### 6. Delivery Confirmation

- **Status:** Partial
- **Frontend:** Load status can be updated manually via Load Detail page (status dropdown)
- **Backend:** `PATCH /loads/:id/status` transitions load through AT_DELIVERY -> DELIVERED
- **Known Issues:**
  - No automated POD capture workflow (driver doesn't have a "confirm delivery" button)
  - Stop arrival/departure timestamps tracked via `POST /orders/:orderId/stops/:id/arrive` and `/depart`
  - Detention auto-calculated on stop departure if beyond free time (TMS Core Rule 7)
- **Shippable?** Partially -- manual status update works for internal dispatchers, no automated driver-side flow

### 7. POD (Proof of Delivery)

- **Status:** Partial
- **Frontend:** Document upload exists in Load Detail documents tab
- **Backend:** Documents service handles uploads (20 endpoints per PST-11)
- **Known Issues:**
  - Upload architecture mismatch: frontend sends FormData, backend expects @Body() DTO (PST-11)
  - No POD-to-invoice auto-trigger (delivery confirmation should trigger draft invoice creation)
  - No POD-specific document type enforcement
- **Shippable?** No -- upload architecture mismatch prevents reliable document upload

### 8. Invoice Generation

- **Status:** Working
- **Frontend:** `/accounting/invoices` (10 pages, 7.9/10 per PST-07). Full lifecycle: list, detail, create, edit (missing), void.
- **Backend:** 54 endpoints across Accounting module. Full double-entry accounting with InvoiceLineItem, Payment, JournalEntry models.
- **Known Issues:**
  - Invoice Edit page missing (`/accounting/invoices/[id]/edit` -- no route)
  - 4 cross-tenant bugs in payments-received (invoice operations inside transactions skip tenantId -- PST-07, cross-cutting #21)
  - Soft-delete gaps: Reports service adds `deletedAt: null` but other services don't (cross-cutting #18)
  - 6/10 controllers missing RolesGuard (cross-cutting #17) -- any authenticated user can approve settlements, post journal entries
  - Dashboard endpoint EXISTS despite hub claiming "Not Built" (cross-cutting #19, QS-003 reclassified)
- **Shippable?** Partially -- invoices can be created and sent, but cross-tenant bugs and RolesGuard gaps are P0 security issues

### 9. Settlement (carrier payment)

- **Status:** Working
- **Frontend:** `/accounting/settlements` exists (list page)
- **Backend:** Settlement endpoints exist in Accounting module
- **Known Issues:**
  - Settlement Create page missing (`/accounting/settlements/new` -- no route)
  - Settlement-to-carrier payment flow: PENDING -> APPROVED -> PROCESSING -> PAID lifecycle exists
  - Settlement cannot be paid until related invoice is SENT or PAID (data-flow.md Section 2g)
- **Shippable?** Partially -- settlements can be viewed but creation page is missing

### 10. Commission Calculation

- **Status:** Not Working (auto-trigger missing)
- **Frontend:** `/commissions` (11 pages, 8.5/10 model quality per PST-08). Best P0 frontend module.
- **Backend:** 31 endpoints across Commission module. CommissionPlan, CommissionEntry, CommissionPayout, AgentCommission models (7 models total). 42 BE tests + 14 FE tests.
- **Known Issues:**
  - **Auto-calculation trigger NOT WIRED** (PST-08): invoice PAID event should trigger commission calculation but the event listener does not exist. Commissions must be manually triggered.
  - Multi-step operations lack transaction wrapping: `createPayout` and `processPayout` not in `$transaction` (cross-cutting #23)
  - Soft-delete gaps: 21/34 methods (60%) don't filter `deletedAt` (cross-cutting #22)
  - Agent commission system (`AgentCommission` + `AgentPayout`) exists but is undocumented in hub (cross-cutting #25)
- **Shippable?** No -- commissions must be manually calculated, auto-trigger not wired, transaction safety missing

### 11. Rate Confirmation PDF

- **Status:** Partial
- **Frontend:** `/operations/loads/[id]/rate-con` (9/10, 232 LOC) -- Generate/Download/Email buttons exist
- **Backend:** `GET /loads/:id/rate-confirmation` exists. `pdf.service.ts` has `generateInvoicePdf()` using PDFKit.
- **Task:** QS-012 -- extend `pdf.service.ts` with `generateRateConfirmationPdf()`, add send-via-email endpoint
- **Shippable?** No -- frontend buttons exist but PDF generation for rate con is not complete

### 12. Bill of Lading (BOL)

- **Status:** Not Built
- **Frontend:** No page, no component
- **Backend:** No endpoint
- **Task:** QS-013 (depends on QS-012 shared PDF infrastructure)
- **Shippable?** No -- table-stakes feature missing entirely

## Summary

| Step | Status | Shippable? | Blocker |
| --- | --- | --- | --- |
| 1. Quote | Working | Partial | Margin enforcement dead, no auto-expiry |
| 2. Order | Working | Yes | -- |
| 3. Load | Working | Yes | -- |
| 4. Dispatch | Partial | No | No WebSocket (QS-001), no tender/accept (TMS-018) |
| 5. Tracking | Not Working | No | No WebSocket, no live data source |
| 6. Delivery | Partial | Partial | No automated driver-side flow |
| 7. POD | Partial | No | Upload architecture mismatch (PST-11) |
| 8. Invoice | Working | Partial | Cross-tenant bugs (PST-07), RolesGuard gaps |
| 9. Settlement | Working | Partial | Settlement Create page missing |
| 10. Commission | Not Working | No | Auto-calc trigger not wired (PST-08) |
| 11. Rate Con | Partial | No | PDF generation incomplete (QS-012) |
| 12. BOL | Not Built | No | Entire feature missing (QS-013) |

## Verdict

**2 of 12 steps fully shippable (Order, Load). 5 of 12 partially shippable. 5 of 12 not shippable.**

### Critical Path to "Shippable MVP"

To make all 12 steps at least partially shippable:

1. **QS-014** (Prisma Client Extension) -- fixes cross-tenant bugs in invoicing (Step 8)
2. **QS-012** (Rate Con PDF) -- makes Step 11 shippable
3. **QS-013** (BOL PDF) -- makes Step 12 shippable
4. **PST-08 fix** (wire commission auto-calc trigger) -- makes Step 10 shippable
5. **PST-11 fix** (document upload architecture) -- makes Step 7 shippable
6. **QS-001** (WebSocket /notifications) -- improves Steps 4 and 5 (though polling fallback exists)
7. **TMS-018** (load tender/accept/reject endpoints) -- completes Step 4 workflow

**Minimum effort for "all steps partially shippable":** ~60-80 hours across items 1-5 above.

### What a Demo Would Look Like Today

A sales demo can show: Quote creation -> Order creation -> Load creation -> Carrier assignment (dispatch board) -> Manual status updates through lifecycle -> Invoice creation -> Settlement viewing -> Commission dashboard. The demo must avoid: real-time tracking, automated POD, commission auto-calculation, rate con PDF download, BOL generation.

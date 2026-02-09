# Service 04: TMS Core

> **Grade:** A- Backend / 0% Frontend (0.5/10 Overall) | **Priority:** P0 - Critical Path | **Phase:** 2-5 (build)
> **Web Prompt:** `dev_docs/11-ai-dev/web-dev-prompts/04-tms-core-ui.md`
> **API Prompt:** `dev_docs/11-ai-dev/api-dev-prompts/01-tms-core-api.md`
> **Design Specs:** `dev_docs/12-Rabih-design-Process/04-tms-core/` (15 files)

---

## Status Summary

Backend is **100% production-ready**: OrdersService (730 LOC), LoadsService (656 LOC), StopsService, TrackingService, and CheckCallService with full CRUD, status machines, PDF generation, event emission, and multi-tenant validation. **Frontend is 0% built** -- all 14 screens must be created from scratch. No routes exist. This is the most critical service in Ultra TMS; every dollar of revenue flows through TMS Core. 65 API endpoints are tested and production-ready. The sole blocker is frontend screens.

---

## Screens

| Screen | Route | Status | Quality | Task ID | Notes |
|--------|-------|--------|---------|---------|-------|
| Operations Dashboard | `/operations` | Not Built | -- | -- | KPI cards, load status breakdown, alerts, activity feed. Real-time WebSocket. Phase 4. |
| Orders List | `/operations/orders` | Not Built | -- | -- | Table with multi-status filters, pagination, search, date range. Phase 2. |
| Order Detail | `/operations/orders/:id` | Not Built | -- | -- | Tabs: Overview, Stops, Loads, Documents, Timeline. Sidebar: customer info, rate, margin. Phase 2. |
| New Order Form | `/operations/orders/new` | Not Built | -- | -- | Multi-step form: customer selector, stops builder, rate entry. Pre-fill from quote. Phase 3. |
| Edit Order Form | `/operations/orders/:id/edit` | Not Built | -- | -- | Same as create, edit mode. Phase 3. |
| Loads List | `/operations/loads` | Not Built | -- | -- | Table with status filters, carrier filter, equipment filter. Pagination. Phase 2. |
| Load Detail | `/operations/loads/:id` | Not Built | -- | -- | Tabs: Overview, Stops, Tracking, Documents. Sidebar: carrier info, rate, margin. Phase 2. |
| New Load Form | `/operations/loads/new` | Not Built | -- | -- | Form inherits from order (pre-filled). Carrier assignment section. Phase 3. |
| Edit Load Form | `/operations/loads/:id/edit` | Not Built | -- | -- | Same as create. Carrier field read-only after PICKED_UP. Phase 3. |
| Dispatch Board | `/operations/dispatch` | Not Built | -- | -- | **Critical Real-Time** Kanban with status columns. Drag-drop load cards. Bulk actions. Phase 4. |
| Tracking Map | `/operations/tracking` | Not Built | -- | -- | Live map with GPS pins. Sidebar list. Real-time position updates. Phase 4. |
| Stop Management | `/operations/loads/:id/stops` | Not Built | -- | -- | List + inline edit. Status badges. Arrival/departure buttons. Phase 3. |
| Check Call Log | `/operations/loads/:id/checkcalls` | Not Built | -- | -- | Timeline view with add-new form. Phase 3. |
| Rate Confirmation | `/operations/loads/:id/rate-con` | Not Built | -- | -- | Document preview. PDF export. Phase 5. |

---

## Backend API

### Orders (18 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/orders` | GET/POST | Production | List (paginated, filterable) + Create with stops |
| `/api/v1/orders/:id` | GET/PUT/PATCH/DELETE | Production | Full CRUD, soft delete |
| `/api/v1/orders/:id/status` | PATCH | Production | State machine validated |
| `/api/v1/orders/:id/clone` | POST | Production | Clone with date adjustment |
| `/api/v1/orders/:id/loads` | GET | Production | Get all loads for order |
| `/api/v1/orders/:id/documents` | GET | Production | Get attached documents |
| `/api/v1/orders/:id/timeline` | GET | Production | Activity timeline |
| `/api/v1/orders/:id/notes` | GET/POST | Production | Add/retrieve notes |
| `/api/v1/orders/stats` | GET | Production | KPI data (counts by status, totals) |
| `/api/v1/orders/bulk-status` | POST | Production | Update status for multiple orders |
| `/api/v1/orders/export` | POST | Production | Export to CSV/Excel |
| `/api/v1/orders/:id/audit` | GET | Production | Audit trail |
| `/api/v1/orders/from-quote/:quoteId` | POST | Production | Convert quote to order (pre-fill) |

### Loads (22 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/loads` | GET/POST | Production | List (status/carrier filtering) + Create |
| `/api/v1/loads/:id` | GET/PUT/PATCH/DELETE | Production | Full CRUD |
| `/api/v1/loads/:id/status` | PATCH | Production | State machine validated |
| `/api/v1/loads/:id/assign` | POST | Production | Assign carrier + validate compliance |
| `/api/v1/loads/:id/tender` | POST | Production | Send tender to carrier |
| `/api/v1/loads/:id/accept` | POST | Production | Accept carrier response |
| `/api/v1/loads/:id/reject` | POST | Production | Reject carrier response |
| `/api/v1/loads/:id/dispatch` | POST | Production | Mark dispatched + emit events |
| `/api/v1/loads/:id/stops` | GET | Production | Get all stops |
| `/api/v1/loads/:id/checkcalls` | GET | Production | Get check call log |
| `/api/v1/loads/:id/documents` | GET | Production | Get documents (BOL, POD, etc.) |
| `/api/v1/loads/:id/timeline` | GET | Production | Activity timeline |
| `/api/v1/loads/:id/notes` | GET/POST | Production | Add/retrieve notes |
| `/api/v1/loads/:id/rate-confirmation` | GET | Production | Generate/get rate confirmation PDF |
| `/api/v1/loads/stats` | GET | Production | KPI data |
| `/api/v1/loads/export` | POST | Production | Export to CSV/Excel |
| `/api/v1/loads/:id/audit` | GET | Production | Audit trail |

### Stops (10 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/stops` | GET | Production | List (filtered by loadId) |
| `/api/v1/stops/:id` | GET/PUT/DELETE | Production | Full CRUD |
| `/api/v1/stops/:id/status` | PATCH | Production | Update stop status |
| `/api/v1/stops/:id/arrive` | PATCH | Production | Mark arrived with timestamp |
| `/api/v1/stops/:id/depart` | PATCH | Production | Mark departed with timestamp |
| `/api/v1/stops/reorder` | POST | Production | Reorder stops within load |
| `/api/v1/stops/:id/detention` | GET | Production | Calculate detention time |

### Check Calls (8 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/checkcalls` | GET/POST | Production | List (filtered by loadId) + Create |
| `/api/v1/checkcalls/:id` | GET/PUT/DELETE | Production | Full CRUD |
| `/api/v1/checkcalls/overdue` | GET | Production | Loads missing check calls (>4 hours) |
| `/api/v1/checkcalls/bulk` | POST | Production | Create multiple at once |
| `/api/v1/checkcalls/stats` | GET | Production | Statistics |

### Dashboard & Tracking (7 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/operations/dashboard` | GET | Production | KPI data (role-aware) |
| `/api/v1/operations/dashboard/charts` | GET | Production | Chart data (loads by status, revenue trend) |
| `/api/v1/operations/dashboard/alerts` | GET | Production | Active alerts/exceptions |
| `/api/v1/operations/dashboard/activity` | GET | Production | Recent activity feed |
| `/api/v1/operations/dashboard/needs-attention` | GET | Production | Loads needing immediate attention |
| `/api/v1/operations/tracking/positions` | GET | Production | Current GPS positions for all in-transit loads |
| `/api/v1/operations/tracking/positions/:loadId` | GET | Production | GPS position history for one load |

**Total: 65 endpoints, all production-ready, fully tested, multi-tenant validated, soft-delete enforced.**

---

## Frontend Components

**Status: 0 components exist. All must be built.**

| Component | Path | Quality | Notes |
|-----------|------|---------|-------|
| OrdersTable | `components/tms/orders/orders-table.tsx` | -- | Not built |
| OrderForm | `components/tms/orders/order-form.tsx` | -- | Not built |
| OrderDetailCard | `components/tms/orders/order-detail-card.tsx` | -- | Not built |
| OrderStatusBadge | `components/tms/orders/order-status-badge.tsx` | -- | Not built |
| OrderTimeline | `components/tms/orders/order-timeline.tsx` | -- | Not built |
| LoadsTable | `components/tms/loads/loads-table.tsx` | -- | Not built |
| LoadForm | `components/tms/loads/load-form.tsx` | -- | Not built |
| LoadDetailCard | `components/tms/loads/load-detail-card.tsx` | -- | Not built |
| LoadStatusBadge | `components/tms/loads/load-status-badge.tsx` | -- | Not built |
| LoadStopsList | `components/tms/loads/load-stops-list.tsx` | -- | Not built |
| LoadCarrierSection | `components/tms/loads/load-carrier-section.tsx` | -- | Not built |
| DispatchBoard | `components/tms/dispatch/dispatch-board.tsx` | -- | Not built. **Critical for Maria (dispatcher).** |
| DispatchLane | `components/tms/dispatch/dispatch-lane.tsx` | -- | Not built |
| DispatchCard | `components/tms/dispatch/dispatch-card.tsx` | -- | Not built. Draggable. |
| StopsTable | `components/tms/stops/stops-table.tsx` | -- | Not built |
| StopForm | `components/tms/stops/stop-form.tsx` | -- | Not built |
| StopCard | `components/tms/stops/stop-card.tsx` | -- | Not built |
| TrackingMap | `components/tms/tracking/tracking-map.tsx` | -- | Not built. Real-time GPS. |
| TrackingSidebar | `components/tms/tracking/tracking-sidebar.tsx` | -- | Not built |

---

## Design Specs

| Screen | Spec File | Content Level |
|--------|-----------|---------------|
| Service Overview | `00-service-overview.md` | Full (688 lines) |
| Operations Dashboard | `01-operations-dashboard.md` | Full 15-section |
| Orders List | `02-orders-list.md` | Full 15-section |
| Order Detail | `03-order-detail.md` | Full 15-section |
| Order Entry | `04-order-entry.md` | Full 15-section |
| Loads List | `05-loads-list.md` | Full 15-section |
| Load Detail | `06-load-detail.md` | Full 15-section |
| Load Builder | `07-load-builder.md` | Full 15-section |
| Dispatch Board | `08-dispatch-board.md` | Full 15-section |
| Stop Management | `09-stop-management.md` | Full 15-section |
| Tracking Map | `10-tracking-map.md` | Full 15-section |
| Status Updates | `11-status-updates.md` | Full 15-section |
| Load Timeline | `12-load-timeline.md` | Full 15-section |
| Check Calls | `13-check-calls.md` | Full 15-section |
| Appointment Scheduler | `14-appointment-scheduler.md` | Full 15-section |

---

## Open Bugs

None. Backend has zero known bugs. Frontend not yet built.

---

## Tasks

> **Revised v2** — Estimates updated per logistics expert review. Dispatch Board split 5 ways. New tasks added.

| Task ID | Title | Phase | Status | Effort |
|---------|-------|-------|--------|--------|
| TMS-001 | Build Orders List page | 3 | NOT STARTED | L (7h) ⬆️ |
| TMS-002 | Build Order Detail page (tabs) | 3 | NOT STARTED | L (8h) ⬆️ |
| TMS-003 | Build Loads List page | 3 | NOT STARTED | M (5h) ⬆️ |
| TMS-004 | Build Load Detail page (tabs) | 3 | NOT STARTED | L (8h) ⬆️ |
| TMS-005 | Build New Order Form (multi-step, 4 sessions) | 4 | NOT STARTED | XL (12h) ⬆️ |
| TMS-006 | Build Edit Order Form | 4 | NOT STARTED | M (5h) ⬆️ |
| TMS-007 | Build New Load Form (3 sessions) | 4 | NOT STARTED | L (9h) ⬆️ |
| TMS-008 | Build Edit Load Form | 4 | NOT STARTED | M (5h) ⬆️ |
| TMS-009 | Build Stop Management (inline edit) | 4 | NOT STARTED | L (6h) ⬆️ |
| TMS-010 | Build Check Call Log (timeline + form) | 4 | NOT STARTED | L (6h) ⬆️ |
| **TMS-011a** | **Dispatch: Data layer** | 4 | NOT STARTED | L (8-10h) |
| **TMS-011b** | **Dispatch: Kanban UI** | 4 | NOT STARTED | L (8-10h) |
| **TMS-011c** | **Dispatch: Drag-drop** | 4 | NOT STARTED | XL (12-16h) |
| **TMS-011d** | **Dispatch: Real-time sync** | 4 | NOT STARTED | L (8-12h) |
| **TMS-011e** | **Dispatch: Bulk actions + polish** | 4 | NOT STARTED | M (4-6h) |
| TMS-012 | Build Operations Dashboard (KPI + alerts) | 4 | NOT STARTED | L (9h) ⬆️ |
| TMS-013 | Build Tracking Map (live GPS) | 5 | NOT STARTED | L (12h) ⬆️ |
| TMS-014 | Build Rate Confirmation (PDF preview) | 5 | NOT STARTED | L (6h) ⬆️ |
| **TMS-015** | **Public Tracking Page** (no auth) | 3 | NOT STARTED | L (8-12h) |
| **DOC-001** | **Document Upload on Load Detail** | 3 | NOT STARTED | M (4-6h) |
| **COMM-001** | **5 Automated Emails** | 5 | NOT STARTED | L (8-12h) |

---

## Key Business Rules

### Order Rules
| Rule | Detail |
|------|--------|
| **Credit Check** | Customer credit checked on order creation; auto-hold if over limit |
| **Auto Credit Hold** | Triggers if: balance > credit limit, or 3+ invoices overdue > 60 days |
| **Margin Enforcement** | Same 15% minimum as quotes; warns dispatcher if below |
| **Cancellation** | Orders can be cancelled from PENDING, QUOTED, BOOKED, DISPATCHED, IN_TRANSIT |
| **TONU Fee** | If cancelled after carrier dispatched: Truck Order Not Used fee applies ($250-$500) |
| **Load Number Format** | `LD-{YYYYMM}-{NNNNN}` (auto-generated, sequential per tenant) |
| **Weight Limits** | 1–80,000 lbs per load; reject if outside range |

### Stop Rules
| Rule | Detail |
|------|--------|
| **Detention Calculation** | `detentionCharge = max(0, actualTime - freeTime) × hourlyRate` |
| **Free Time** | Default 2 hours (configurable per customer/carrier) |
| **Detention Rate** | $75/hour default (configurable) |
| **Detention Cap** | 8 hours maximum per stop |

### Check Call Intervals
| Phase | Interval | Notes |
|-------|----------|-------|
| Pre-pickup | 1 hour before | Confirm driver en route |
| In transit | Every 4 hours | Position + ETA update |
| Pre-delivery | 1 hour before | Confirm on schedule |
| Post-delivery | Within 24 hours | Confirm POD received |

### Accessorial Codes
| Code | Description | Default Rate |
|------|-------------|-------------|
| DET | Detention | $75/hr after 2h free |
| TONU | Truck Order Not Used | $250–$500 flat |
| LUMP | Lumper | Cost + 15% markup |
| FUEL | Fuel Surcharge | % of line haul |
| STOP | Additional Stop | $50–$150/stop |

## Key References

| Document | Path | What It Contains |
|----------|------|------------------|
| Data Dictionary | `dev_docs/11-ai-dev/91-data-dictionary.md` | Order, Load, Stop, CheckCall schemas |
| Business Rules | `dev_docs/11-ai-dev/92-business-rules-reference.md` | Credit, margin, detention, TONU rules |
| WebSocket Standards | `dev_docs/10-features/79-real-time-websocket-standards.md` | Socket.io namespaces, events, auth |
| Contract Registry | `dev_docs/06-external/76-contract-structure.md` | Rate contract + accessorial structure |

---

## Dependencies

**Depends on:**
- Auth & Admin (user context, role/permissions, tenant ID) -- Built
- CRM (customer lookup, credit status, contact info) -- Built
- Sales (quote data for conversion to order) -- Built
- Carrier (carrier directory, compliance status, insurance) -- In Progress (has 404s)

**Depended on by:**
- Accounting (delivered orders for invoicing, carrier rates for settlement)
- Load Board (available loads for external posting)
- Commission (order revenue for commission calculations)
- Customer Portal (order status, tracking, delivery confirmation)
- Carrier Portal (load assignments, stop details, check call submission)
- Communication (email/SMS triggers on status changes)

---

## What to Build Next (Ordered)

### Phase 2: Viewing Layer (Weeks 5-6)
1. **Orders List page** (6h) -- Filter by status, customer, date range. Pagination. Wire to `GET /api/v1/orders`.
2. **Order Detail page** (6h) -- Tabs: Overview, Stops, Loads, Documents, Timeline. Sidebar: customer info, rate/margin.
3. **Loads List page** (4h) -- Reuse Orders list pattern. Add carrier column, equipment type filter.
4. **Load Detail page** (6h) -- Tabs: Overview, Stops, Tracking, Documents, Timeline. Sidebar: carrier info.

### Phase 3: Creation & Editing (Weeks 7-8)
5. **New Order Form** (10h) -- Multi-step: customer selector, commodity, equipment, stops builder, rate entry.
6. **Edit Order Form** (4h) -- Reuse create form. Cannot change customer.
7. **New Load Form** (7h) -- Inherit from order. Carrier assignment. Rate negotiation field.
8. **Edit Load Form** (4h) -- Carrier field read-only after PICKED_UP.
9. **Stop Management** (5h) -- Inline edit. Mark Arrived/Departed. Detention timer.
10. **Check Call Log** (5h) -- Timeline view. Add form. Types: CHECK_CALL, ARRIVAL, DEPARTURE, DELAY, ISSUE.

### Phase 3 additions (new)
- **Public Tracking Page** (8-12h) -- `/track/[code]`, public, no auth. Eliminates 50% of "where's my truck" calls.
- **Document Upload on Load Detail** (4-6h) -- POD/BOL upload on Load Detail. Triggers invoicing cycle.

### Phase 4: Operations Power Tools (Weeks 8-10)
11. **Dispatch Board** (40-60h, split into 5 sub-tasks) -- Kanban + drag-drop + real-time sync + bulk actions. Both developers.
12. **Tracking Map** (12h) -- Live GPS pins. Sidebar load list. Real-time updates every 30s.
13. **Operations Dashboard** (9h) -- KPI cards, charts, alerts, "Needs Attention" section.

### Phase 5: Documents + Emails (Weeks 11-13)
14. **Rate Confirmation** (6h) -- Document preview. PDF export. Email to carrier.
15. **5 Automated Emails** (8-12h) -- Rate con, tender notification, pickup reminder, delivery confirmation, invoice.

---

## Status Machine Reference

### Order States
```
PENDING -> QUOTED -> BOOKED -> DISPATCHED -> IN_TRANSIT -> DELIVERED -> INVOICED -> COMPLETED
CANCELLED (from: PENDING, QUOTED, BOOKED, DISPATCHED, IN_TRANSIT)
```

### Load States
```
PLANNING -> PENDING -> TENDERED -> ACCEPTED -> DISPATCHED -> AT_PICKUP -> PICKED_UP -> IN_TRANSIT -> AT_DELIVERY -> DELIVERED -> COMPLETED
CANCELLED (carrier rejects from TENDERED)
```

### Stop States
```
PENDING -> ARRIVED -> DEPARTED -> COMPLETED
```

---

## Real-Time Requirements

| Screen | WebSocket Namespace | Key Events | Polling Fallback |
|--------|-------------------|-----------|-----------------|
| Dispatch Board | `/dispatch` | load:status:changed, load:created, load:assigned | 10s |
| Tracking Map | `/tracking` | load:location:updated, load:eta:updated | 15s |
| Operations Dashboard | `/dispatch`, `/tracking` | load:status:changed, order:created | 30s |
| Load Detail | `/dispatch`, `/tracking` | load:status:changed, checkcall:received | 30s |

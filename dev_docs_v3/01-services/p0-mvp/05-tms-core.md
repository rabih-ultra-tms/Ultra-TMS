# Service Hub: TMS Core — Orders, Loads, Dispatch (05)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (TMS Core service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/04-tms-core/` (15 files)
> **v2 hub (historical):** `dev_docs_v2/03-services/04-tms-core.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | A- Backend (9/10) / 0 Frontend (0/10) / Overall: C (5/10) |
| **Confidence** | High — backend audited; frontend confirmed 0 routes |
| **Last Verified** | 2026-03-07 |
| **Backend** | Production — 65 endpoints, fully tested, multi-tenant validated |
| **Frontend** | Not Built — 0 of 14 screens exist |
| **Tests** | Backend: Tested | Frontend: None (nothing to test) |
| **Active Sprint** | QS-001 (WebSocket Gateways), then TMS-001 through TMS-008 |
| **Revenue Impact** | CRITICAL — every dollar of revenue flows through TMS Core |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Full TMS Core definition in dev_docs |
| Design Specs | Done | 15 files, all 15-section, including Dispatch Board |
| Backend — Orders | Production | `apps/api/src/modules/tms/orders/` — 730 LOC, 18 endpoints |
| Backend — Loads | Production | `apps/api/src/modules/tms/loads/` — 656 LOC, 22 endpoints |
| Backend — Stops | Production | `apps/api/src/modules/tms/stops/` — 10 endpoints |
| Backend — Check Calls | Production | `apps/api/src/modules/tms/checkcalls/` — 8 endpoints |
| Backend — Dashboard | Production | `apps/api/src/modules/operations/` — 5 endpoints |
| Backend — Tracking | Production | `apps/api/src/modules/tms/tracking/` — 2 endpoints |
| Prisma Models | Production | Order, Load, Stop, CheckCall, TrackingEvent |
| Frontend Pages | Not Built | 0 routes exist; no page.tsx files |
| React Hooks | Not Built | Must be created |
| Components | Not Built | Must be created |
| WebSocket Gateways | Not Built | QS-001 — Critical blocker for Dispatch + Tracking |
| Tests (Frontend) | Not Built | Must be created |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Operations Dashboard | `/operations` | Not Built | — | KPI cards, load status breakdown, alerts, activity. Real-time WebSocket |
| Orders List | `/operations/orders` | Not Built | — | Table: multi-status filters, pagination, search, date range |
| Order Detail | `/operations/orders/[id]` | Not Built | — | Tabs: Overview, Stops, Loads, Documents, Timeline |
| New Order Form | `/operations/orders/new` | Not Built | — | Multi-step: customer selector, stops builder, rate entry. Pre-fill from quote |
| Edit Order Form | `/operations/orders/[id]/edit` | Not Built | — | Same as create, edit mode |
| Loads List | `/operations/loads` | Not Built | — | Table: status filters, carrier filter, equipment filter |
| Load Detail | `/operations/loads/[id]` | Not Built | — | Tabs: Overview, Stops, Tracking, Documents |
| New Load Form | `/operations/loads/new` | Not Built | — | Inherits from order. Carrier assignment section |
| Edit Load Form | `/operations/loads/[id]/edit` | Not Built | — | Carrier field read-only after PICKED_UP |
| Dispatch Board | `/operations/dispatch` | Not Built | — | CRITICAL: Kanban, drag-drop, bulk actions, real-time |
| Tracking Map | `/operations/tracking` | Not Built | — | Live GPS pins, sidebar, real-time 30s updates |
| Stop Management | `/operations/loads/[id]/stops` | Not Built | — | List + inline edit. Arrival/departure buttons |
| Check Call Log | `/operations/loads/[id]/checkcalls` | Not Built | — | Timeline + add-new form |
| Rate Confirmation | `/operations/loads/[id]/rate-con` | Not Built | — | Document preview. PDF export |

---

## 4. API Endpoints

### Orders (18 endpoints — Production)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/orders` | OrdersController | Production |
| POST | `/api/v1/orders` | OrdersController | Production |
| GET | `/api/v1/orders/:id` | OrdersController | Production |
| PUT | `/api/v1/orders/:id` | OrdersController | Production |
| PATCH | `/api/v1/orders/:id` | OrdersController | Production |
| DELETE | `/api/v1/orders/:id` | OrdersController | Production (soft delete) |
| PATCH | `/api/v1/orders/:id/status` | OrdersController | Production |
| POST | `/api/v1/orders/:id/clone` | OrdersController | Production |
| GET | `/api/v1/orders/:id/loads` | OrdersController | Production |
| GET | `/api/v1/orders/:id/documents` | OrdersController | Production |
| GET | `/api/v1/orders/:id/timeline` | OrdersController | Production |
| GET | `/api/v1/orders/:id/notes` | OrdersController | Production |
| POST | `/api/v1/orders/:id/notes` | OrdersController | Production |
| GET | `/api/v1/orders/stats` | OrdersController | Production |
| POST | `/api/v1/orders/bulk-status` | OrdersController | Production |
| POST | `/api/v1/orders/export` | OrdersController | Production |
| GET | `/api/v1/orders/:id/audit` | OrdersController | Production |
| POST | `/api/v1/orders/from-quote/:quoteId` | OrdersController | Production |

### Loads (22 endpoints — Production)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/loads` | LoadsController | Production |
| POST | `/api/v1/loads` | LoadsController | Production |
| GET | `/api/v1/loads/:id` | LoadsController | Production |
| PUT | `/api/v1/loads/:id` | LoadsController | Production |
| PATCH | `/api/v1/loads/:id` | LoadsController | Production |
| DELETE | `/api/v1/loads/:id` | LoadsController | Production |
| PATCH | `/api/v1/loads/:id/status` | LoadsController | Production |
| POST | `/api/v1/loads/:id/assign` | LoadsController | Production |
| POST | `/api/v1/loads/:id/tender` | LoadsController | Production |
| POST | `/api/v1/loads/:id/accept` | LoadsController | Production |
| POST | `/api/v1/loads/:id/reject` | LoadsController | Production |
| POST | `/api/v1/loads/:id/dispatch` | LoadsController | Production |
| GET | `/api/v1/loads/:id/stops` | LoadsController | Production |
| GET | `/api/v1/loads/:id/checkcalls` | LoadsController | Production |
| GET | `/api/v1/loads/:id/documents` | LoadsController | Production |
| GET | `/api/v1/loads/:id/timeline` | LoadsController | Production |
| GET | `/api/v1/loads/:id/notes` | LoadsController | Production |
| POST | `/api/v1/loads/:id/notes` | LoadsController | Production |
| GET | `/api/v1/loads/:id/rate-confirmation` | LoadsController | Production |
| GET | `/api/v1/loads/stats` | LoadsController | Production |
| POST | `/api/v1/loads/export` | LoadsController | Production |
| GET | `/api/v1/loads/:id/audit` | LoadsController | Production |

### Stops (10 endpoints — Production)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/stops` | StopsController | Production |
| GET | `/api/v1/stops/:id` | StopsController | Production |
| PUT | `/api/v1/stops/:id` | StopsController | Production |
| DELETE | `/api/v1/stops/:id` | StopsController | Production |
| PATCH | `/api/v1/stops/:id/status` | StopsController | Production |
| PATCH | `/api/v1/stops/:id/arrive` | StopsController | Production |
| PATCH | `/api/v1/stops/:id/depart` | StopsController | Production |
| POST | `/api/v1/stops/reorder` | StopsController | Production |
| GET | `/api/v1/stops/:id/detention` | StopsController | Production |

### Check Calls (8 endpoints — Production)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/checkcalls` | CheckCallsController | Production |
| POST | `/api/v1/checkcalls` | CheckCallsController | Production |
| GET | `/api/v1/checkcalls/:id` | CheckCallsController | Production |
| PUT | `/api/v1/checkcalls/:id` | CheckCallsController | Production |
| DELETE | `/api/v1/checkcalls/:id` | CheckCallsController | Production |
| GET | `/api/v1/checkcalls/overdue` | CheckCallsController | Production |
| POST | `/api/v1/checkcalls/bulk` | CheckCallsController | Production |
| GET | `/api/v1/checkcalls/stats` | CheckCallsController | Production |

### Operations Dashboard (5 endpoints — Production)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/operations/dashboard` | OperationsController | Production |
| GET | `/api/v1/operations/dashboard/charts` | OperationsController | Production |
| GET | `/api/v1/operations/dashboard/alerts` | OperationsController | Production |
| GET | `/api/v1/operations/dashboard/activity` | OperationsController | Production |
| GET | `/api/v1/operations/dashboard/needs-attention` | OperationsController | Production |

### Tracking (2 endpoints — Production)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/operations/tracking/positions` | OperationsController | Production |
| GET | `/api/v1/operations/tracking/positions/:loadId` | OperationsController | Production |

**Total: 65 endpoints, all production-ready.**

---

## 5. Components

All must be built — none currently exist:

| Component | Planned Path | Priority |
|-----------|-------------|----------|
| OrdersTable | `components/tms/orders/orders-table.tsx` | P0 |
| OrderForm | `components/tms/orders/order-form.tsx` | P0 |
| OrderDetailCard | `components/tms/orders/order-detail-card.tsx` | P0 |
| OrderStatusBadge | `components/tms/orders/order-status-badge.tsx` | P0 |
| OrderTimeline | `components/tms/orders/order-timeline.tsx` | P0 |
| LoadsTable | `components/tms/loads/loads-table.tsx` | P0 |
| LoadForm | `components/tms/loads/load-form.tsx` | P0 |
| LoadDetailCard | `components/tms/loads/load-detail-card.tsx` | P0 |
| LoadStatusBadge | `components/tms/loads/load-status-badge.tsx` | P0 |
| LoadStopsList | `components/tms/loads/load-stops-list.tsx` | P0 |
| LoadCarrierSection | `components/tms/loads/load-carrier-section.tsx` | P0 |
| DispatchBoard | `components/tms/dispatch/dispatch-board.tsx` | P0-Critical |
| DispatchLane | `components/tms/dispatch/dispatch-lane.tsx` | P0-Critical |
| DispatchCard | `components/tms/dispatch/dispatch-card.tsx` | P0-Critical |
| StopsTable | `components/tms/stops/stops-table.tsx` | P0 |
| StopForm | `components/tms/stops/stop-form.tsx` | P0 |
| StopCard | `components/tms/stops/stop-card.tsx` | P0 |
| TrackingMap | `components/tms/tracking/tracking-map.tsx` | P1 |
| TrackingSidebar | `components/tms/tracking/tracking-sidebar.tsx` | P1 |
| CheckCallTimeline | `components/tms/loads/check-call-timeline.tsx` | P0 |
| CheckCallForm | `components/tms/loads/check-call-form.tsx` | P0 |

---

## 6. Hooks

All must be built — none currently exist:

| Hook | Endpoints | Priority |
|------|-----------|----------|
| `useOrders` | GET `/orders` | P0 |
| `useOrder` | GET `/orders/:id` | P0 |
| `useCreateOrder` | POST `/orders` | P0 |
| `useUpdateOrderStatus` | PATCH `/orders/:id/status` | P0 |
| `useLoads` | GET `/loads` | P0 |
| `useLoad` | GET `/loads/:id` | P0 |
| `useAssignCarrier` | POST `/loads/:id/assign` | P0 |
| `useDispatchLoad` | POST `/loads/:id/dispatch` | P0 |
| `useStops` | GET `/stops` | P0 |
| `useArriveStop` | PATCH `/stops/:id/arrive` | P0 |
| `useDepartStop` | PATCH `/stops/:id/depart` | P0 |
| `useCheckCalls` | GET `/checkcalls` | P0 |
| `useCreateCheckCall` | POST `/checkcalls` | P0 |
| `useOperationsDashboard` | GET `/operations/dashboard` | P0 |
| `useTrackingPositions` | GET `/operations/tracking/positions` | P1 |

---

## 7. Business Rules

1. **Order Status Machine (Strictly Enforced):** PENDING → QUOTED → BOOKED → DISPATCHED → IN_TRANSIT → DELIVERED → INVOICED → COMPLETED. Cancellation is allowed from PENDING through IN_TRANSIT only. Status transitions are validated server-side — no skip-ahead transitions allowed.
2. **Load Number Format:** `LD-{YYYYMM}-{NNNNN}` where NNNNN is sequential per tenant per month. Generated server-side on create. Never user-supplied. Example: `LD-202603-00001`.
3. **Carrier Assignment Validation:** Before assigning a carrier to a load: (1) Carrier status must be ACTIVE. (2) Insurance must not be expired. (3) Authority must be AUTHORIZED per FMCSA. (4) If load is hazmat, carrier must have Hazmat endorsement. ALL four checks must pass. Assignment fails with specific error if any fail.
4. **Carrier Lock-Down:** Once a load reaches PICKED_UP status, the assigned carrier CANNOT be changed. The carrier field becomes read-only in the UI and the backend rejects PATCH requests to it. Only ADMIN can override via super-admin panel.
5. **Weight Limits:** Loads must be between 1 and 80,000 lbs. Values outside this range are rejected at DTO validation with message: "Weight must be between 1 and 80,000 lbs".
6. **Check Call Intervals:** Pre-pickup: 1 hour before. In-transit: every 4 hours. Pre-delivery: 1 hour before. Overdue check calls appear in `/checkcalls/overdue` and surface as P1 alerts on the Operations Dashboard.
7. **Detention Calculation:** `detentionCharge = max(0, (actualTime - freeTime)) × hourlyRate`. Default free time: 2 hours. Default rate: $75/hr. Maximum detention: 8 hours per stop. Detention is automatically calculated when a stop moves from ARRIVED to DEPARTED beyond free time.
8. **TONU Fee:** If a carrier is dispatched and the load is then cancelled, a Truck Order Not Used (TONU) fee applies. Default: $250 flat. Configurable per carrier. TONU is automatically added as an accessorial charge. Dispatcher must acknowledge the TONU before cancellation completes.
9. **Soft Delete Required:** Orders, Loads, and Stops use soft delete. `deletedAt` field is set; hard deletes are forbidden. Deleted records are excluded from all list queries by default (filter: `deletedAt: null`).
10. **Real-Time Events (WebSocket):** Dispatch Board subscribes to `/dispatch` namespace. Key events: `load:status:changed`, `load:created`, `load:assigned`. Tracking Map subscribes to `/tracking` namespace. Key events: `load:location:updated`, `load:eta:updated`. WebSocket auth uses same JWT cookie.

---

## 8. Data Model

### Order
```
Order {
  id             String (UUID)
  orderNumber    String (auto: ORD-{YYYYMM}-{NNN})
  status         OrderStatus (PENDING, QUOTED, BOOKED, DISPATCHED, IN_TRANSIT, DELIVERED, INVOICED, COMPLETED, CANCELLED)
  customerId     String (FK → Customer)
  quoteId        String? (FK → Quote, if created from quote)
  revenue        Decimal (total billed to customer)
  cost           Decimal (total carrier cost)
  margin         Decimal (revenue - cost)
  loads          Load[]
  stops          Stop[]
  notes          Note[]
  tenantId       String
  createdBy      String (FK → User)
  createdAt      DateTime
  updatedAt      DateTime
  deletedAt      DateTime? (soft delete)
  external_id    String?
  custom_fields  Json?
}
```

### Load
```
Load {
  id              String (UUID)
  loadNumber      String (auto: LD-{YYYYMM}-{NNNNN})
  status          LoadStatus (PLANNING, PENDING, TENDERED, ACCEPTED, DISPATCHED, AT_PICKUP, PICKED_UP, IN_TRANSIT, AT_DELIVERY, DELIVERED, COMPLETED, CANCELLED)
  orderId         String (FK → Order)
  carrierId       String? (FK → Carrier, assigned after tendering)
  driverId        String? (FK → Driver)
  equipmentType   EquipmentType (DRY_VAN, REEFER, FLATBED, etc.)
  weight          Decimal (lbs, 1-80000)
  stops           Stop[]
  checkCalls      CheckCall[]
  trackingEvents  TrackingEvent[]
  tenantId        String
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime?
}
```

### Stop
```
Stop {
  id           String (UUID)
  loadId       String (FK → Load)
  sequence     Int (order within load)
  type         StopType (PICKUP, DELIVERY, INTERMEDIATE)
  status       StopStatus (PENDING, ARRIVED, DEPARTED, COMPLETED)
  address      Json (street, city, state, zip, lat, lng)
  scheduledAt  DateTime
  arrivedAt    DateTime? (set on arrive action)
  departedAt   DateTime? (set on depart action)
  freeTimeHrs  Decimal (default: 2)
  detention    Decimal? (calculated)
  notes        String?
}
```

### CheckCall
```
CheckCall {
  id         String (UUID)
  loadId     String (FK → Load)
  type       CheckCallType (CHECK_CALL, ARRIVAL, DEPARTURE, DELAY, ISSUE, ETA_UPDATE)
  message    String
  lat        Decimal?
  lng        Decimal?
  eta        DateTime?
  createdBy  String (FK → User)
  createdAt  DateTime
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `weight` | 1–80,000 lbs, IsDecimal | "Weight must be between 1 and 80,000 lbs" |
| `equipmentType` | IsEnum(EquipmentType) | "Invalid equipment type" |
| `customerId` | IsUUID, must exist in tenant | "Customer not found" |
| `carrierId` | IsUUID, carrier must be ACTIVE + insured | "Carrier not available for assignment" |
| Order `status` | Valid transition only | "Invalid status transition from X to Y" |
| Load `status` | Valid transition only | "Invalid status transition from X to Y" |
| `stops` | Min 2 per load (1 pickup, 1 delivery) | "Load must have at least one pickup and one delivery stop" |
| `sequence` | Must be unique within load | "Stop sequence conflict" |

---

## 10. Status States

### Order Status Machine
```
PENDING → QUOTED (quote created) → BOOKED (quote accepted)
BOOKED → DISPATCHED (load dispatched) → IN_TRANSIT → DELIVERED
DELIVERED → INVOICED → COMPLETED
PENDING/QUOTED/BOOKED/DISPATCHED/IN_TRANSIT → CANCELLED
```

### Load Status Machine
```
PLANNING → PENDING → TENDERED (sent to carrier) → ACCEPTED → DISPATCHED
DISPATCHED → AT_PICKUP → PICKED_UP → IN_TRANSIT → AT_DELIVERY → DELIVERED → COMPLETED
TENDERED → CANCELLED (carrier rejects)
```

### Stop Status Machine
```
PENDING → ARRIVED (driver arrives) → DEPARTED (driver departs) → COMPLETED
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| 0 frontend screens exist | P0 Blocker | `apps/web/app/(dashboard)/operations/` | Not Built |
| WebSocket gateways not implemented | P0 Blocker | `apps/api/src/gateways/` | QS-001 |
| No hooks exist for any TMS Core endpoint | P0 | `apps/web/lib/hooks/tms/` | Must Build |
| Check Call Form needs RHF refactor (QS-006 target) | P1 | (future component) | Open |
| Soft delete not on Order, Quote, Invoice, Settlement, Payment | P1 DB | Migration needed | QS-002 |
| No tests for any frontend TMS screens | P0 | — | Must Build |

---

## 12. Tasks

### Quality Sprint (Active)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| QS-001 | WebSocket Gateways (dispatch + tracking + notifications + dashboard) | XL (12-16h) | Open |
| QS-002 | Soft Delete Migration (Order, Quote, Invoice, Settlement, Payment) | M (2-4h) | Open |
| QS-006 | Check Call Form RHF Refactor | M (2-4h) | Open |

### Phase 1 Backlog (TMS Core screens)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| TMS-001 | Build Orders List page | L (7h) | P0 |
| TMS-002 | Build Order Detail page (tabs) | L (8h) | P0 |
| TMS-003 | Build Loads List page | M (5h) | P0 |
| TMS-004 | Build Load Detail page (tabs) | L (8h) | P0 |
| TMS-005 | Build New Order Form (multi-step) | XL (12h) | P0 |
| TMS-006 | Build Edit Order Form | M (5h) | P0 |
| TMS-007 | Build New Load Form | L (9h) | P0 |
| TMS-008 | Build Edit Load Form | M (5h) | P0 |
| TMS-009 | Build Stop Management | L (6h) | P0 |
| TMS-010 | Build Check Call Log | L (6h) | P0 |
| TMS-011a | Dispatch: Data layer | L (8-10h) | P0 |
| TMS-011b | Dispatch: Kanban UI | L (8-10h) | P0 |
| TMS-011c | Dispatch: Drag-drop | XL (12-16h) | P0 |
| TMS-011d | Dispatch: Real-time sync | L (8-12h) | P0 |
| TMS-011e | Dispatch: Bulk actions + polish | M (4-6h) | P0 |
| TMS-012 | Build Operations Dashboard | L (9h) | P0 |
| TMS-013 | Build Tracking Map (live GPS) | L (12h) | P1 |
| TMS-014 | Build Rate Confirmation (PDF preview) | L (6h) | P1 |
| TMS-015 | Public Tracking Page | L (8-12h) | P1 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Operations Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/04-tms-core/01-operations-dashboard.md` |
| Orders List | Full 15-section | `dev_docs/12-Rabih-design-Process/04-tms-core/02-orders-list.md` |
| Order Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/04-tms-core/03-order-detail.md` |
| Order Entry | Full 15-section | `dev_docs/12-Rabih-design-Process/04-tms-core/04-order-entry.md` |
| Loads List | Full 15-section | `dev_docs/12-Rabih-design-Process/04-tms-core/05-loads-list.md` |
| Load Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/04-tms-core/06-load-detail.md` |
| Load Builder | Full 15-section | `dev_docs/12-Rabih-design-Process/04-tms-core/07-load-builder.md` |
| Dispatch Board | Full 15-section | `dev_docs/12-Rabih-design-Process/04-tms-core/08-dispatch-board.md` |
| Stop Management | Full 15-section | `dev_docs/12-Rabih-design-Process/04-tms-core/09-stop-management.md` |
| Tracking Map | Full 15-section | `dev_docs/12-Rabih-design-Process/04-tms-core/10-tracking-map.md` |
| Status Updates | Full 15-section | `dev_docs/12-Rabih-design-Process/04-tms-core/11-status-updates.md` |
| Load Timeline | Full 15-section | `dev_docs/12-Rabih-design-Process/04-tms-core/12-load-timeline.md` |
| Check Calls | Full 15-section | `dev_docs/12-Rabih-design-Process/04-tms-core/13-check-calls.md` |
| Appointment Scheduler | Full 15-section | `dev_docs/12-Rabih-design-Process/04-tms-core/14-appointment-scheduler.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Frontend to be built first | Backend built first (A-), frontend 0% | Reversed build order |
| 14 screens planned | 0 built | 100% gap |
| WebSocket in "Phase 4" | WebSocket needed in Phase 1 for Dispatch Board | Moved forward |
| Single TMS module | Separate Orders, Loads, Stops, CheckCalls modules | Better modularity |
| Dispatch Board = 1 task | Dispatch Board split into 5 sub-tasks | Complexity increase |
| Public Tracking Page = future | Moved to P1 (reduces support calls by 50%) | Priority up |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles, tenantId) — P0
- CRM (customer lookup, credit status check before order creation) — P0
- Carrier Management (carrier assignment, compliance check) — P0
- Sales & Quotes (quote → order conversion) — P0
- WebSocket infrastructure (QS-001) — Must be built first

**Depended on by:**
- Accounting (delivered orders → invoicing, carrier costs → settlement)
- Load Board (available loads for external posting)
- Commission (order revenue for commission calculations)
- Customer Portal (order status, tracking, delivery confirmation)
- Carrier Portal (load assignments, stop details, check call submission)
- Communication (email/SMS triggers on status changes)
- Analytics (revenue trends, load metrics)

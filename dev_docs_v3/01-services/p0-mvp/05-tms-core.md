# Service Hub: TMS Core — Orders, Loads, Dispatch (05)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (TMS Core service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/04-tms-core/` (15 files)
> **v2 hub (historical):** `dev_docs_v2/03-services/04-tms-core.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | A- Backend (9/10) / B Frontend (7.4/10) / Overall: B+ (8/10) |
| **Confidence** | High — backend audited; frontend audited 2026-03-07 |
| **Last Verified** | 2026-03-07 |
| **Backend** | Production — 65 endpoints, fully tested, multi-tenant validated |
| **Frontend** | Built — 12 of 14 screens exist (10 real, 2 wrapper-stubs delegating to components) |
| **Tests** | Backend: Tested. Frontend: None (screens exist but untested) |
| **Active Sprint** | QS-001 (WebSocket Gateways), QS-008 (Runtime Verification) |
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
| Frontend Pages | Built | 12 page.tsx files in `app/(dashboard)/operations/` |
| React Hooks | Built | 10 hooks in `lib/hooks/tms/` (orders, loads, stops, checkcalls, dispatch, dispatch-ws, tracking, ops-dashboard, load-board, rate-confirmation) |
| Components | Built | ~95 components in `components/tms/` (dispatch board, kanban, order forms, load forms, stops, tracking map, check calls, dashboards) |
| WebSocket Gateways | Not Built | QS-001 — Critical blocker for Dispatch + Tracking real-time features |
| Tests (Frontend) | Not Built | Screens exist but have 0 test coverage |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Operations Dashboard | `/operations` | Built | 8/10 | KPI cards, alerts, activity feed, needs-attention. WebSocket via SocketProvider `/dispatch`. Role-based scope (personal vs team) |
| Orders List | `/operations/orders` | Built | 7/10 | Stats cards, pagination, search, status filter. Row selection state exists but no bulk action buttons. Delete is no-op toast |
| Order Detail | `/operations/orders/[id]` | Built | 8/10 | 6 tabs: Overview, Stops, Loads, Items, Documents (Phase 3), Timeline. Actions menu (Edit, Duplicate disabled, Cancel disabled) |
| New Order Form | `/operations/orders/new` | Built (wrapper) | 6/10 | Thin Suspense wrapper delegating to `<OrderForm>` component. Form quality depends on component |
| Edit Order Form | `/operations/orders/[id]/edit` | Built | 9/10 | Robust Prisma Decimal conversion, complex form mapping, proper error/loading/not-found states |
| Loads List | `/operations/loads` | Built | 8/10 | KPI stat cards, filter bar, data table with row click drawer. Page title mislabeled "Dispatch Board" |
| Load Detail | `/operations/loads/[id]` | Built (wrapper) | 7/10 | Server wrapper delegating to LoadDetailClient component |
| New Load Form | `/operations/loads/new` | Built | 8/10 | Optional orderId pre-fill, stop mapping, hazmat/reefer conditional fields, accessorials |
| Edit Load Form | `/operations/loads/[id]/edit` | Built | 9/10 | Robust Decimal conversion, stop data mapping, carrier/order normalization, load status restrictions |
| Dispatch Board | `/operations/dispatch` | Built (wrapper) | 5/10 | Wrapper with Suspense + skeleton. Delegates to `<DispatchBoard>` component (~243 LOC with kanban, filters, WebSocket status, optimistic updates) |
| Tracking Map | `/operations/tracking` | Built (wrapper) | 5/10 | Wrapper with SocketProvider `/tracking`. Delegates to `<TrackingMap>` component |
| Stop Management | `/operations/loads/[id]/stops` | Not Built | — | Stops are managed via tabs in Load Detail, not a separate route |
| Check Call Log | `/operations/loads/[id]/checkcalls` | Not Built | — | Check calls managed via tab in Load Detail, not a separate route |
| Rate Confirmation | `/operations/loads/[id]/rate-con` | Built | 9/10 | Options sidebar, custom message, load summary, Generate/Download/Email actions, PDF preview, blob cleanup on unmount |

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

~95 components exist in `components/tms/`. Key components by domain:

**Orders** (built):
- `orders/order-form.tsx` — Multi-step form (customer, stops, cargo, rate, review)
- `orders/order-columns.tsx` — TanStack React Table column definitions
- `orders/order-filters.tsx` — Search + status filter bar
- `orders/order-detail-overview.tsx` — Detail tab content
- `orders/order-stops-tab.tsx`, `order-loads-tab.tsx`, `order-items-tab.tsx`, `order-documents-tab.tsx`, `order-timeline-tab.tsx`, `order-notes-tab.tsx`
- `orders/order-customer-step.tsx`, `order-cargo-step.tsx`, `order-rate-step.tsx`, `order-review-step.tsx`, `order-stops-builder.tsx`

**Loads** (built):
- `loads/load-form.tsx` — Load creation/edit form
- `loads/loads-data-table.tsx`, `loads/loads-filter-bar.tsx` — List page components
- `loads/load-detail-header.tsx`, `load-carrier-tab.tsx`, `load-route-tab.tsx`, `load-timeline-tab.tsx`, `load-documents-tab.tsx`, `load-check-calls-tab.tsx`
- `loads/load-status-badge.tsx`, `load-summary-card.tsx`, `load-drawer.tsx`, `load-tracking-card.tsx`
- `loads/carrier-selector.tsx`, `column-settings-drawer.tsx`, `kpi-stat-cards.tsx`

**Dispatch** (built):
- `dispatch/dispatch-board.tsx` — Main board (~243 LOC, kanban + table views)
- `dispatch/kanban-board.tsx`, `kanban-lane.tsx`, `load-card.tsx`
- `dispatch/dispatch-data-table.tsx`, `dispatch-detail-drawer.tsx`
- `dispatch/dispatch-toolbar.tsx`, `dispatch-stats-bar.tsx`, `dispatch-kpi-strip.tsx`, `dispatch-bulk-toolbar.tsx`
- `dispatch/dispatch-board-skeleton.tsx`
- `dispatch/new-load-dialog.tsx`, `new-quote-dialog.tsx`

**Tracking** (built):
- `tracking/tracking-map.tsx` — Map component
- `tracking/tracking-sidebar.tsx` — Load list sidebar
- `tracking/tracking-pin-popup.tsx` — Map pin popup

**Stops** (built):
- `stops/stops-table.tsx`, `stop-card.tsx`, `stop-actions.tsx`

**Check Calls** (built):
- `checkcalls/check-call-form.tsx`, `check-call-timeline.tsx`, `overdue-checkcalls.tsx`

**Dashboard** (built):
- `dashboard/ops-kpi-cards.tsx`, `ops-charts.tsx`, `ops-alerts-panel.tsx`, `ops-activity-feed.tsx`, `ops-needs-attention.tsx`

**Shared TMS primitives** (built):
- `primitives/status-badge.tsx`, `status-dot.tsx`, `search-input.tsx`, `custom-checkbox.tsx`, `user-avatar.tsx`
- `tables/data-table.tsx`, `table-pagination.tsx`, `bulk-action-bar.tsx`, `density-toggle.tsx`, `group-header.tsx`
- `panels/slide-panel.tsx`, `panel-tabs.tsx`, `quick-actions.tsx`
- `cards/route-card.tsx`, `info-grid.tsx`, `field-list.tsx`
- `filters/filter-bar.tsx`, `filter-chip.tsx`, `status-dropdown.tsx`, `column-visibility.tsx`
- `stats/stat-item.tsx`, `stats-bar.tsx`, `kpi-card.tsx`
- `shared/status-badge.tsx`, `financial-summary-card.tsx`, `metadata-card.tsx`, `timeline-feed.tsx`
- `finance/finance-breakdown.tsx`
- `documents/document-list.tsx`, `upload-zone.tsx`, `permit-list.tsx`, `rate-con-preview.tsx`, `document-actions.tsx`
- `emails/email-preview-dialog.tsx`
- `timeline/timeline.tsx`
- `alerts/alert-banner.tsx`

---

## 6. Hooks

All 10 hooks exist in `lib/hooks/tms/`. All use `unwrap()` helper for proper `{ data: T }` envelope handling.

| Hook | File | Endpoints | Quality | Notes |
|------|------|-----------|---------|-------|
| `useOrders` / `useOrder` / `useCreateOrder` / `useUpdateOrder` | `use-orders.ts` | GET/POST/PUT/PATCH `/orders`, `/orders/:id`, `/orders/:id/status` | 9/10 | `unwrap()` + `unwrapPaginated()`, `mapFormToApi()` conversion, cache invalidation |
| `useLoads` / `useLoad` / `useCreateLoad` / `useUpdateLoad` | `use-loads.ts` | GET/POST/PUT/PATCH `/loads`, `/loads/:id`, `/loads/:id/assign` | 8/10 | Defensive `toNum()` for Prisma Decimal, bulk status/carrier assignment |
| `useStops` / `useArriveStop` / `useDepartStop` | `use-stops.ts` | GET/PUT/PATCH `/stops`, `/stops/:id/arrive`, `/stops/:id/depart` | 8/10 | Stop reorder support |
| `useCheckCalls` / `useCreateCheckCall` | `use-checkcalls.ts` | GET/POST `/checkcalls`, `/checkcalls/overdue` | 8/10 | Overdue check calls query |
| `useDispatchBoard` / `useDispatchLoad` | `use-dispatch.ts` | GET `/loads` (board view), POST `/loads/:id/dispatch` | 8/10 | Complex `RawBoardLoad` → `DispatchLoad` normalization, optimistic updates with rollback |
| `useDispatchWebSocket` | `use-dispatch-ws.ts` | WebSocket `/dispatch` namespace | 7/10 | Event listeners, cache updates via `setQueriesData` |
| `useTrackingPositions` | `use-tracking.ts` | GET `/operations/tracking/positions` | 7/10 | WebSocket integration, 15s polling fallback, ETA status derivation |
| `useOperationsDashboard` / `useDashboardLiveUpdates` | `use-ops-dashboard.ts` | GET `/operations/dashboard/*` (5 endpoints) | 8/10 | WebSocket event subscription for cache invalidation, period/scope/comparison params |
| `useLoadBoard*` | `use-load-board.ts` | Load board dashboard/postings endpoints | 7/10 | Dashboard stats, postings CRUD |
| `useRateConfirmation` | `use-rate-confirmation.ts` | GET `/loads/:id/rate-confirmation` | 8/10 | PDF generation |

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
| WebSocket gateways not implemented | P0 Blocker | `apps/api/src/gateways/` | QS-001 — dispatch/tracking pages exist but lack real-time data |
| Loads list page title says "Dispatch Board" | P2 UX | `operations/loads/page.tsx` | Open — cosmetic mislabel |
| Orders list delete is no-op | P1 UX | `operations/orders/page.tsx` | Open — shows toast "not available yet" |
| Orders list bulk actions UI missing | P1 UX | `operations/orders/page.tsx` | Row selection state exists but no action buttons |
| Dispatch/Tracking are thin wrappers | P2 | `operations/dispatch/page.tsx`, `operations/tracking/page.tsx` | Components handle logic — verify component quality at runtime |
| Column visibility not persisted | P2 UX | `operations/loads/page.tsx` | Resets on navigation |
| `as any` type assertions | P2 Code | `orders/page.tsx:98`, `orders/[id]/edit/page.tsx:124` | Minor — acceptable workarounds |
| Soft delete not on Order, Quote, Invoice, Settlement, Payment | P1 DB | Migration needed | QS-002 |
| No tests for any frontend TMS screens | P1 | — | 12 screens exist, 0 test coverage |
| Check Call Form needs RHF refactor | P1 | `components/tms/checkcalls/check-call-form.tsx` | QS-006 |

---

## 12. Tasks

### Quality Sprint (Active)

| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| QS-001 | WebSocket Gateways (dispatch + tracking + notifications + dashboard) | XL (12-16h) | Open |
| QS-002 | Soft Delete Migration (Order, Quote, Invoice, Settlement, Payment) | M (2-4h) | Open |
| QS-006 | Check Call Form RHF Refactor | M (2-4h) | Open |
| QS-008 | Runtime Verification — click all 12 TMS routes with Playwright | L (6h) | Open |

### QA Backlog (screens exist — verify and fix)

| Task ID | Title | Effort | Priority | Notes |
|---------|-------|--------|----------|-------|
| TMS-001 | QA Orders List (fix delete no-op, add bulk action buttons) | S (2h) | P0 | Page exists 7/10 |
| TMS-002 | QA Order Detail (verify all 6 tabs render, actions work) | S (2h) | P0 | Page exists 8/10 |
| TMS-003 | QA Loads List (fix page title "Dispatch Board" → "Loads", persist column settings) | S (1h) | P0 | Page exists 8/10 |
| TMS-004 | QA Load Detail (verify LoadDetailClient renders, tabs work) | S (2h) | P0 | Page exists 7/10 |
| TMS-005 | QA New Order Form (verify OrderForm component, all steps work) | M (3h) | P0 | Wrapper exists 6/10, form component needs audit |
| TMS-006 | QA Edit Order Form (verify pre-population, Decimal handling) | S (1h) | P0 | Page exists 9/10 |
| TMS-007 | QA New Load Form (verify orderId pre-fill, hazmat fields) | S (1h) | P0 | Page exists 8/10 |
| TMS-008 | QA Edit Load Form (verify Decimal conversion, status restrictions) | S (1h) | P0 | Page exists 9/10 |
| TMS-009 | Verify Stop Management via Load Detail tabs | S (1h) | P0 | No separate route — stops managed in load detail |
| TMS-010 | Verify Check Call Log via Load Detail tabs | S (1h) | P0 | No separate route — check calls managed in load detail |
| TMS-011 | QA Dispatch Board (verify kanban, drag-drop, WebSocket status, optimistic updates) | M (4h) | P0 | Component exists but needs QS-001 for real-time |
| TMS-012 | QA Operations Dashboard (verify KPI cards, alerts, activity feed with real data) | S (2h) | P0 | Page exists 8/10 |
| TMS-013 | QA Tracking Map (verify map renders, pins, sidebar, WebSocket) | M (3h) | P1 | Component exists but needs QS-001 for real-time |
| TMS-014 | QA Rate Confirmation (verify PDF generation, download, email) | S (1h) | P1 | Page exists 9/10 |
| TMS-015 | Build Public Tracking Page | L (8-12h) | P1 | Not yet built |

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
| Frontend to be built first | Backend A-, frontend B (7.4/10) | Both substantially built |
| 14 screens planned | 12 built (10 real, 2 wrappers), 2 integrated into tabs | ~86% complete |
| WebSocket in "Phase 4" | WebSocket needed in Phase 1 for Dispatch Board | QS-001 — still the critical blocker |
| Single TMS module | Separate Orders, Loads, Stops, CheckCalls modules | Better modularity |
| Dispatch Board = 1 task | Dispatch board component built with kanban + table views | QA needed, not a build task |
| Public Tracking Page = future | Moved to P1 (reduces support calls by 50%) | Only unbuilt screen |
| All screens "Not Built" in docs | 12 screens built during v2 sprint (71/72 tasks) | Docs were never updated post-v2 |

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

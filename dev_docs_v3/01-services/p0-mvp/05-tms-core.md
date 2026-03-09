# Service Hub: TMS Core — Orders, Loads, Dispatch (05)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-05 tribunal corrections applied)
> **Original definition:** `dev_docs/02-services/` (TMS Core service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/04-tms-core/` (15 files)
> **v2 hub (historical):** `dev_docs_v2/03-services/04-tms-core.md`
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/batch-1-p0/PST-05-tms-core.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B+ (7.8/10) |
| **Confidence** | High — code-verified via PST-05 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Production — 51 endpoints across 5 controllers, multi-tenant validated, 100% tenant isolation + soft delete + auth guards |
| **Frontend** | Built — 12 of 14 screens exist (10 real, 2 wrapper-stubs delegating to substantial components) |
| **Tests** | Backend: Tested. Frontend: 16 test files in `__tests__/tms/` |
| **Active Sprint** | QS-001 (WebSocket Gateways), QS-008 (Runtime Verification) |
| **Revenue Impact** | CRITICAL — every dollar of revenue flows through TMS Core |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Full TMS Core definition in dev_docs |
| Design Specs | Done | 15 files, all 15-section, including Dispatch Board |
| Backend — Orders | Production | `apps/api/src/modules/tms/orders/` — 730 LOC, 19 endpoints |
| Backend — Loads | Production | `apps/api/src/modules/tms/loads/` — 656 LOC, 15 endpoints |
| Backend — Stops | Production | `apps/api/src/modules/tms/stops/` — 8 endpoints, **nested under `/orders/:orderId/stops/`** |
| Backend — Check Calls | Production | **2 endpoints, nested under `/loads/:id/check-calls`** — NO standalone controller |
| Backend — Dashboard | Production | `apps/api/src/modules/operations/` — 5 endpoints |
| Backend — Tracking | Production | `apps/api/src/modules/tms/tracking/` — 2 endpoints |
| Prisma Models | Production | Order, Load, Stop, CheckCall (4 models — no TrackingEvent) |
| Frontend Pages | Built | 12 page.tsx files in `app/(dashboard)/operations/` |
| React Hooks | Built | 10 hooks in `lib/hooks/tms/` — 3 envelope patterns (not all use unwrap()) |
| Components | Built | ~95 components in `components/tms/` (dispatch board, kanban, order forms, load forms, stops, tracking map, check calls, dashboards) |
| WebSocket Gateways | Not Built | QS-001 — Backend gateway missing. Frontend handlers READY (dispatch-ws 526 LOC, tracking hooks wired) |
| Tests (Frontend) | Built | 16 test files in `__tests__/tms/` (check-call, dispatch-board, dispatch-drag-drop, dispatch-realtime, load-detail, load-form, loads-list, order-detail, order-form, orders-list, public-tracking, rate-confirmation, stop-management, tracking-map + 2 regression) |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Operations Dashboard | `/operations` | Built | 8/10 | 189 LOC, WebSocket via SocketProvider `/dispatch`, role-based scope (personal vs team), 6 widgets |
| Orders List | `/operations/orders` | Built | 7/10 | 165 LOC, stats, pagination, search, status filter. Row selection state exists but no bulk action buttons. Delete is no-op toast. Status change uses `as any` |
| Order Detail | `/operations/orders/[id]` | Built | 8/10 | 114 LOC, 6 tabs with dynamic counts, edit button works |
| New Order Form | `/operations/orders/new` | Built (wrapper) | 6/10 | 13 LOC thin wrapper, delegates to `<OrderForm>` component |
| Edit Order Form | `/operations/orders/[id]/edit` | Built | 9/10 | 180 LOC, Prisma Decimal conversion, complex form mapping, proper error/loading/not-found states |
| Loads List | `/operations/loads` | Built | 8/10 | 147 LOC, KPI stat cards, filter bar, data table, row-click drawer |
| Load Detail | `/operations/loads/[id]` | Built (wrapper) | 7/10 | 6 LOC server + 120 LOC client, 5 tabs, tab persistence in URL hash |
| New Load Form | `/operations/loads/new` | Built | 8/10 | 120 LOC, optional orderId pre-fill, stop mapping, hazmat conditional fields |
| Edit Load Form | `/operations/loads/[id]/edit` | Built | 9/10 | 160 LOC, Decimal conversion, stop data mapping with fallback logic, status restrictions |
| Dispatch Board | `/operations/dispatch` | Built | 5/10 page / 8/10 actual | 29 LOC wrapper + 200+ LOC DispatchBoard component with kanban, filters, WebSocket, optimistic updates |
| Tracking Map | `/operations/tracking` | Built | 5/10 page / 8/10 actual | 33 LOC wrapper + 400+ LOC TrackingMap with Google Maps, real-time positions, color-coded markers |
| Stop Management | `/operations/loads/[id]/stops` | Not Built | — | Stops are managed via tabs in Load Detail, not a separate route |
| Check Call Log | `/operations/loads/[id]/checkcalls` | Not Built | — | Check calls managed via tab in Load Detail, not a separate route |
| Rate Confirmation | `/operations/loads/[id]/rate-con` | Built | 9/10 | 232 LOC, options panel, custom message, load summary, Generate/Download/Email actions, PDF preview, blob cleanup on unmount |

---

## 4. API Endpoints

### Orders (19 endpoints — Production)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/orders` | OrdersController | Production |
| POST | `/api/v1/orders` | OrdersController | Production |
| GET | `/api/v1/orders/:id` | OrdersController | Production |
| PUT | `/api/v1/orders/:id` | OrdersController | Production |
| DELETE | `/api/v1/orders/:id` | OrdersController | Production (soft delete) |
| PATCH | `/api/v1/orders/:id/status` | OrdersController | Production |
| POST | `/api/v1/orders/:id/cancel` | OrdersController | Production |
| POST | `/api/v1/orders/:id/clone` | OrdersController | Production |
| GET | `/api/v1/orders/:id/loads` | OrdersController | Production |
| GET | `/api/v1/orders/:id/history` | OrdersController | Production |
| GET | `/api/v1/orders/:id/timeline` | OrdersController | Production |
| POST | `/api/v1/orders/from-template/:templateId` | OrdersController | Production |
| POST | `/api/v1/orders/from-quote/:quoteId` | OrdersController | Production |
| GET | `/api/v1/orders/stats` | OrdersController | Production |
| GET | `/api/v1/orders/:id/items` | OrdersController | Production |
| POST | `/api/v1/orders/:id/items` | OrdersController | Production |
| PUT | `/api/v1/orders/:id/items/:itemId` | OrdersController | Production |
| DELETE | `/api/v1/orders/:id/items/:itemId` | OrdersController | Production |
| POST | `/api/v1/orders/:id/create-load` | OrdersController | Production |

### Loads (15 endpoints — Production)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/loads` | LoadsController | Production |
| POST | `/api/v1/loads` | LoadsController | Production |
| GET | `/api/v1/loads/:id` | LoadsController | Production |
| PUT | `/api/v1/loads/:id` | LoadsController | Production |
| DELETE | `/api/v1/loads/:id` | LoadsController | Production (soft delete) |
| PATCH | `/api/v1/loads/:id/status` | LoadsController | Production |
| POST | `/api/v1/loads/:id/assign` | LoadsController | Production |
| PATCH | `/api/v1/loads/:id/assign` | LoadsController | Production |
| POST | `/api/v1/loads/:id/assign-carrier` | LoadsController | Production |
| POST | `/api/v1/loads/:id/dispatch` | LoadsController | Production |
| GET | `/api/v1/loads/board` | LoadsController | Production |
| PUT | `/api/v1/loads/:id/location` | LoadsController | Production |
| GET | `/api/v1/loads/:id/rate-confirmation` | LoadsController | Production |
| GET | `/api/v1/loads/stats` | LoadsController | Production |
| GET | `/api/v1/loads/:id/timeline` | LoadsController | Production |

### Stops (8 endpoints — Production, nested under Orders)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/orders/:orderId/stops` | StopsController | Production | **Nested under orders** |
| POST | `/api/v1/orders/:orderId/stops` | StopsController | Production | |
| GET | `/api/v1/orders/:orderId/stops/:id` | StopsController | Production | |
| PUT | `/api/v1/orders/:orderId/stops/:id` | StopsController | Production | |
| DELETE | `/api/v1/orders/:orderId/stops/:id` | StopsController | Production | |
| POST | `/api/v1/orders/:orderId/stops/:id/arrive` | StopsController | Production | POST, not PATCH |
| POST | `/api/v1/orders/:orderId/stops/:id/depart` | StopsController | Production | POST, not PATCH |
| POST | `/api/v1/orders/:orderId/stops/reorder` | StopsController | Production | |

### Check Calls (2 endpoints — Production, nested under Loads)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/loads/:id/check-calls` | LoadsController | Production | **Nested under loads — no standalone CheckCalls controller** |
| POST | `/api/v1/loads/:id/check-calls` | LoadsController | Production | |

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

**Total: 51 endpoints, all production-ready.**

### Security Audit (Backend)

| Check | Status | Evidence |
|-------|--------|---------|
| Tenant Isolation | 100% VERIFIED | All 39 database queries filter by tenantId |
| Soft Delete | 100% VERIFIED | All 37 list/detail queries filter `deletedAt: null` |
| Auth Guards | 100% VERIFIED | `@UseGuards(JwtAuthGuard)` on all controllers |
| Role Guards | PARTIAL | Some endpoints have `@Roles()` (stats, rate-con, templates), most don't |

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
- `tracking/tracking-map.tsx` — Map component (400+ LOC with Google Maps, real-time positions, color-coded markers)
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

10 hooks exist in `lib/hooks/tms/`. **3 envelope unwrap patterns** detected: standard `unwrap()`, manual destructure, and hybrid reshape. Not all hooks use `unwrap()` as previously claimed.

| Hook | File | LOC | Envelope Pattern | Quality | Notes |
|------|------|-----|-----------------|---------|-------|
| `useOrders` / `useOrder` / `useCreateOrder` / `useUpdateOrder` | `use-orders.ts` | 228 | `unwrap()` helper | 9/10 | `unwrap()` + `unwrapPaginated()`, `mapFormToApi()` conversion, cache invalidation |
| `useLoads` / `useLoad` / `useCreateLoad` / `useUpdateLoad` | `use-loads.ts` | 377 | Mixed (unwrap + manual destructure) | 8/10 | Defensive `toNum()` for Prisma Decimal, bulk status/carrier assignment |
| `useStops` / `useArriveStop` / `useDepartStop` | `use-stops.ts` | 271 | `unwrap()` helper | 8/10 | Stop reorder support |
| `useCheckCalls` / `useCreateCheckCall` | `use-checkcalls.ts` | 167 | Manual unwrap + 11 field fallbacks | 6/10 | **FRAGILE** — 11 field name fallback chains (e.g., `cc.type ?? cc.status`, `cc.latitude ?? cc.lat`). Will break silently if backend changes field names |
| `useDispatchBoard` / `useDispatchLoad` | `use-dispatch.ts` | 612 | `unwrap()` helper | 9/10 | Complex `RawBoardLoad` → `DispatchLoad` normalization, optimistic updates with rollback |
| `useDispatchWebSocket` | `use-dispatch-ws.ts` | 526 | N/A (WebSocket) | 7/10 | Event listeners, cache updates via `setQueriesData` |
| `useTrackingPositions` | `use-tracking.ts` | 273 | `unwrap()` helper | 7/10 | WebSocket integration, 15s polling fallback, ETA status derivation |
| `useOperationsDashboard` / `useDashboardLiveUpdates` | `use-ops-dashboard.ts` | 276 | `unwrap()` helper | 8/10 | WebSocket event subscription for cache invalidation, period/scope/comparison params |
| `useLoadBoard*` | `use-load-board.ts` | 62 | `unwrap()` helper | 7/10 | Dashboard stats, postings CRUD |
| `useRateConfirmation` | `use-rate-confirmation.ts` | 121 | N/A (PDF blob) | 8/10 | PDF generation |

---

## 7. Business Rules

1. **Order Status Machine (Strictly Enforced):** PENDING -> QUOTED -> BOOKED -> DISPATCHED -> IN_TRANSIT -> DELIVERED -> INVOICED -> COMPLETED. Cancellation is allowed from PENDING through IN_TRANSIT only. Status transitions are validated server-side — no skip-ahead transitions allowed.
2. **Load Number Format:** `LD-{YYYYMM}-{NNNNN}` where NNNNN is sequential per tenant per month. Generated server-side on create. Never user-supplied. Example: `LD-202603-00001`.
3. **Carrier Assignment Validation:** Before assigning a carrier to a load: (1) Carrier status must be ACTIVE. (2) Insurance must not be expired. (3) Authority must be AUTHORIZED per FMCSA. (4) If load is hazmat, carrier must have Hazmat endorsement. ALL four checks must pass. Assignment fails with specific error if any fail.
4. **Carrier Lock-Down:** Once a load reaches PICKED_UP status, the assigned carrier CANNOT be changed. The carrier field becomes read-only in the UI and the backend rejects PATCH requests to it. Only ADMIN can override via super-admin panel.
5. **Weight Limits:** Loads must be between 1 and 80,000 lbs. Values outside this range are rejected at DTO validation with message: "Weight must be between 1 and 80,000 lbs".
6. **Check Call Intervals:** Pre-pickup: 1 hour before. In-transit: every 4 hours. Pre-delivery: 1 hour before. Overdue check calls appear in `/checkcalls/overdue` and surface as P1 alerts on the Operations Dashboard.
7. **Detention Calculation:** `detentionCharge = max(0, (actualTime - freeTime)) * hourlyRate`. Default free time: 2 hours. Default rate: $75/hr. Maximum detention: 8 hours per stop. Detention is automatically calculated when a stop moves from ARRIVED to DEPARTED beyond free time.
8. **TONU Fee:** If a carrier is dispatched and the load is then cancelled, a Truck Order Not Used (TONU) fee applies. Default: $250 flat. Configurable per carrier. TONU is automatically added as an accessorial charge. Dispatcher must acknowledge the TONU before cancellation completes.
9. **Soft Delete Required:** Orders, Loads, Stops, and CheckCalls use soft delete. `deletedAt` field is set; hard deletes are forbidden. Deleted records are excluded from all list queries by default (filter: `deletedAt: null`).
10. **Real-Time Events (WebSocket):** Dispatch Board subscribes to `/dispatch` namespace. Key events: `load:status:changed`, `load:created`, `load:assigned`. Tracking Map subscribes to `/tracking` namespace. Key events: `load:location:updated`, `load:eta:updated`. WebSocket auth uses same JWT cookie.
11. **Dispatch Polling Fallback (MVP):** Until WebSocket gateways are fully deployed (QS-001), the Dispatch Board uses React Query with a 30-second polling interval as a fallback. `use-dispatch.ts` refetches the load list every 30s. This provides near-real-time updates without WebSocket dependency. Once QS-001 is complete, polling interval increases to 5 minutes (stale backup only). Per Tribunal verdict TRIBUNAL-09.
12. **Nested Resource Routing:** Stops are nested under Orders (`/orders/:orderId/stops/`). Check Calls are nested under Loads (`/loads/:id/check-calls`). Neither has a standalone top-level controller.
13. **Driver Data on Load:** Driver is stored as denormalized strings (`driverName`, `driverPhone`) on Load, NOT as a FK to a Driver model. No `driverId` FK exists.
14. **Tracking via Load Model:** Real-time tracking data is stored directly on Load (`currentLocationLat`, `currentLocationLng`, `currentCity`, `currentState`, `lastTrackingUpdate`, `eta`) and CheckCall records. There is no separate TrackingEvent model.

---

## 8. Data Model

> **Note:** All "status" and "type" fields below are `String @db.VarChar(N)` — application-enforced via DTOs, NOT database-level enums. See Section 10 for the valid values.

### Order (from Prisma schema)
```
Order {
  id                   String    @id @default(uuid())
  tenantId             String
  orderNumber          String    @db.VarChar(50) (auto: ORD-{YYYYMM}-{NNN})
  customerReference    String?   @db.VarChar(100)
  poNumber             String?   @db.VarChar(100)
  bolNumber            String?   @db.VarChar(100)
  customerId           String    (FK -> Company)
  customerContactId    String?   (FK -> Contact)
  quoteId              String?   (FK -> Quote)
  salesRepId           String?   (FK -> User)
  status               String    @default("PENDING") @db.VarChar(30)
  customerRate         Decimal?  @db.Decimal(10,2)
  accessorialCharges   Decimal   @default(0) @db.Decimal(10,2)
  fuelSurcharge        Decimal   @default(0) @db.Decimal(10,2)
  totalCharges         Decimal?  @db.Decimal(10,2)
  currency             String    @default("USD") @db.VarChar(3)
  commodity            String?   @db.VarChar(255)
  commodityClass       String?   @db.VarChar(10)
  weightLbs            Decimal?  @db.Decimal(10,2)
  pieceCount           Int?
  palletCount          Int?
  equipmentType        String?   @db.VarChar(30)
  isHazmat             Boolean   @default(false)
  hazmatClass          String?   @db.VarChar(20)
  temperatureMin       Decimal?  @db.Decimal(5,2)
  temperatureMax       Decimal?  @db.Decimal(5,2)
  orderDate            DateTime  @default(now())
  requiredDeliveryDate DateTime?
  actualDeliveryDate   DateTime?
  specialInstructions  String?
  internalNotes        String?
  isHot                Boolean   @default(false)
  isTeam               Boolean   @default(false)
  isExpedited          Boolean   @default(false)
  externalId           String?   @db.VarChar(255)
  sourceSystem         String?   @db.VarChar(100)
  customFields         Json      @default("{}")
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  deletedAt            DateTime?
  createdById          String?
  updatedById          String?

  // Relations
  loads                Load[]
  stops                Stop[]
  items                OrderItem[]
  documents            Document[]
  commissions          AgentCommission[]
  invoices             Invoice[]
  statusHistory        StatusHistory[]
}
```

**Hub vs reality:** Previous hub listed `revenue`, `cost`, `margin` fields — these DO NOT EXIST (calculated at query time). Previous hub listed `createdBy` — actual field is `createdById`. Status is `String`, not an enum. Missing 15+ real fields (customerReference, poNumber, bolNumber, commodity, weightLbs, pieceCount, equipmentType, isHazmat, salesRepId, temperatures, flags).

### Load (from Prisma schema)
```
Load {
  id                       String    @id @default(uuid())
  tenantId                 String
  loadNumber               String    @db.VarChar(50) (auto: LD-{YYYYMM}-{NNNNN})
  orderId                  String?   (FK -> Order)
  carrierId                String?   (FK -> Carrier)
  driverName               String?   @db.VarChar(100)
  driverPhone              String?   @db.VarChar(20)
  truckNumber              String?   @db.VarChar(20)
  trailerNumber            String?   @db.VarChar(20)
  status                   String    @default("PENDING") @db.VarChar(30)
  carrierRate              Decimal?  @db.Decimal(10,2)
  accessorialCosts         Decimal   @default(0) @db.Decimal(10,2)
  fuelAdvance              Decimal   @default(0) @db.Decimal(10,2)
  totalCost                Decimal?  @db.Decimal(10,2)
  currentLocationLat       Decimal?  @db.Decimal(10,7)
  currentLocationLng       Decimal?  @db.Decimal(10,7)
  currentCity              String?   @db.VarChar(100)
  currentState             String?   @db.VarChar(50)
  lastTrackingUpdate       DateTime?
  eta                      DateTime?
  equipmentType            String?   @db.VarChar(30)
  equipmentLength          Int?
  equipmentWeightLimit     Int?
  dispatchedAt             DateTime?
  pickedUpAt               DateTime?
  deliveredAt              DateTime?
  rateConfirmationSent     Boolean   @default(false)
  rateConfirmationSigned   Boolean   @default(false)
  dispatchNotes            String?
  externalId               String?   @db.VarChar(255)
  sourceSystem             String?   @db.VarChar(100)
  customFields             Json      @default("{}")
  createdAt                DateTime  @default(now())
  updatedAt                DateTime  @updatedAt
  createdById              String?
  updatedById              String?
  deletedAt                DateTime?

  // Relations
  checkCalls               CheckCall[]
  stops                    Stop[]
  documents                Document[]
  invoices                 Invoice[]
  commissions              AgentCommission[]
  statusHistory            StatusHistory[]
  loadTenders              LoadTender[]
  loadPostings             LoadPosting[]
  settlementLineItems      SettlementLineItem[]
}
```

**Hub vs reality:** Previous hub listed `driverId` FK — DOES NOT EXIST (uses `driverName`/`driverPhone` strings). Listed `weight` — DOES NOT EXIST (weight is on Order as `weightLbs`). Listed `trackingEvents TrackingEvent[]` — PHANTOM (TrackingEvent model does not exist). Missing 30+ real fields (carrierRate, currentLocation*, eta, rateConfirmation*, equipment*, timestamps).

### Stop (from Prisma schema)
```
Stop {
  id                   String    @id @default(uuid())
  tenantId             String
  orderId              String    (FK -> Order)
  loadId               String?   (FK -> Load)
  stopType             String    @db.VarChar(20)
  stopSequence         Int
  facilityName         String?   @db.VarChar(255)
  addressLine1         String    @db.VarChar(255)
  addressLine2         String?   @db.VarChar(255)
  city                 String    @db.VarChar(100)
  state                String    @db.VarChar(50)
  postalCode           String    @db.VarChar(20)
  country              String    @default("USA") @db.VarChar(50)
  latitude             Decimal?  @db.Decimal(10,7)
  longitude            Decimal?  @db.Decimal(10,7)
  contactName          String?   @db.VarChar(100)
  contactPhone         String?   @db.VarChar(20)
  contactEmail         String?   @db.VarChar(255)
  appointmentRequired  Boolean   @default(false)
  appointmentDate      DateTime?
  appointmentTimeStart String?   @db.VarChar(10)
  appointmentTimeEnd   String?   @db.VarChar(10)
  appointmentNumber    String?   @db.VarChar(50)
  status               String    @default("PENDING") @db.VarChar(20)
  arrivedAt            DateTime?
  departedAt           DateTime?
  weightLbs            Decimal?  @db.Decimal(10,2)
  pieceCount           Int?
  palletCount          Int?
  specialInstructions  String?
  driverInstructions   String?
  accessorials         Json      @default("[]")
  externalId           String?   @db.VarChar(255)
  sourceSystem         String?   @db.VarChar(100)
  customFields         Json      @default("{}")
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  createdById          String?
  updatedById          String?
  deletedAt            DateTime?

  // Relations
  items                OrderItem[]
  statusHistory        StatusHistory[]
}
```

**Hub vs reality:** Previous hub listed `address Json` — WRONG, address is denormalized into 10 separate fields (facilityName, addressLine1/2, city, state, postalCode, country, latitude, longitude). Listed `sequence` — actual field is `stopSequence`. Listed `scheduledAt` — DOES NOT EXIST (uses appointmentDate + appointmentTimeStart/End). Listed `freeTimeHrs` and `detention` — DO NOT EXIST. Listed `type` — actual field is `stopType`. Missing: `orderId` FK, contact fields, appointment fields, weight/piece/pallet fields.

### CheckCall (from Prisma schema)
```
CheckCall {
  id             String    @id @default(uuid())
  tenantId       String
  loadId         String    (FK -> Load)
  city           String?   @db.VarChar(100)
  state          String?   @db.VarChar(50)
  latitude       Decimal?  @db.Decimal(10,7)
  longitude      Decimal?  @db.Decimal(10,7)
  status         String?   @db.VarChar(30)
  notes          String?
  contacted      String?   @db.VarChar(50)
  contactMethod  String?   @db.VarChar(20)
  eta            DateTime?
  milesRemaining Int?
  source         String?   @db.VarChar(30)
  createdAt      DateTime  @default(now())
  createdById    String?
  customFields   Json      @default("{}")
  deletedAt      DateTime?
  externalId     String?   @db.VarChar(255)
  sourceSystem   String?   @db.VarChar(100)
  updatedAt      DateTime  @updatedAt
  updatedById    String?
}
```

**Hub vs reality:** Previous hub listed `type CheckCallType` — field DOES NOT EXIST (no type field at all). Listed `message` — DOES NOT EXIST (actual field is `notes`). Listed `lat`/`lng` — actual fields are `latitude`/`longitude`. Listed `createdBy` — actual is `createdById`. Missing: city, state, status, contacted, contactMethod, milesRemaining, source, deletedAt.

### ~~TrackingEvent~~ — PHANTOM MODEL

TrackingEvent does NOT exist anywhere in the Prisma schema. Tracking data is stored on the Load model (`currentLocationLat`, `currentLocationLng`, `currentCity`, `currentState`, `lastTrackingUpdate`, `eta`) and in CheckCall records.

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `weightLbs` (Order) | Decimal, optional | — |
| `equipmentType` | String, optional, validated in DTO | "Invalid equipment type" |
| `customerId` | IsUUID, must exist in tenant | "Customer not found" |
| `carrierId` | IsUUID, carrier must be ACTIVE + insured | "Carrier not available for assignment" |
| Order `status` | Valid transition only (String, DTO-enforced) | "Invalid status transition from X to Y" |
| Load `status` | Valid transition only (String, DTO-enforced) | "Invalid status transition from X to Y" |
| `stops` | Min 2 per load (1 pickup, 1 delivery) | "Load must have at least one pickup and one delivery stop" |
| `stopSequence` | Must be unique within order (@@unique constraint) | "Stop sequence conflict" |
| `tenantId` | Extracted from JWT — never user-supplied | — |
| Soft delete | All queries filter `deletedAt: null` | — |

**Note on enums:** All "enum" values (OrderStatus, LoadStatus, StopType, StopStatus) are application-enforced via DTO validation. The database stores them as `String @db.VarChar(N)`. There is no `CheckCallType` enum — the `type` field does not exist on CheckCall.

---

## 10. Status States

### Order Status Machine
```
PENDING -> QUOTED (quote created) -> BOOKED (quote accepted)
BOOKED -> DISPATCHED (load dispatched) -> IN_TRANSIT -> DELIVERED
DELIVERED -> INVOICED -> COMPLETED
PENDING/QUOTED/BOOKED/DISPATCHED/IN_TRANSIT -> CANCELLED
```
**Implementation:** `status String @default("PENDING") @db.VarChar(30)` — validated in DTO, not a Prisma enum.

### Load Status Machine
```
PLANNING -> PENDING -> TENDERED (sent to carrier) -> ACCEPTED -> DISPATCHED
DISPATCHED -> AT_PICKUP -> PICKED_UP -> IN_TRANSIT -> AT_DELIVERY -> DELIVERED -> COMPLETED
TENDERED -> CANCELLED (carrier rejects)
```
**Implementation:** `status String @default("PENDING") @db.VarChar(30)` — validated in DTO, not a Prisma enum.

**Note:** tender/accept/reject endpoints are NOT YET BUILT (see TMS-018). The status values exist but the workflow endpoints are missing.

### Stop Status Machine
```
PENDING -> ARRIVED (driver arrives) -> DEPARTED (driver departs) -> COMPLETED
```
**Implementation:** `status String @default("PENDING") @db.VarChar(20)` — validated in DTO, not a Prisma enum.

### Stop Type
```
PICKUP | DELIVERY | (other values possible — String field, not constrained enum)
```
**Implementation:** `stopType String @db.VarChar(20)` — validated in DTO.

### ~~CheckCallType~~ — PHANTOM ENUM
The `type` field does not exist on CheckCall. The previous hub documented 6 values (CHECK_CALL, ARRIVAL, DEPARTURE, DELAY, ISSUE, ETA_UPDATE) for a non-existent field. CheckCall has a `status` field (String) instead.

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| WebSocket gateways not implemented | P0 Blocker | `apps/api/src/gateways/` | QS-001 — Frontend handlers READY (dispatch-ws 526 LOC, tracking hooks wired). Backend gateway missing |
| Loads list page title says "Dispatch Board" | P2 UX | `operations/loads/page.tsx` | Open — cosmetic mislabel. Needs runtime verification |
| Orders list delete is no-op | P1 UX | `operations/orders/page.tsx` | Open — shows toast "not available yet" |
| Orders list bulk actions UI missing | P1 UX | `operations/orders/page.tsx` | Row selection state exists but no action buttons |
| Dispatch/Tracking page wrappers are thin | P2 Info | `operations/dispatch/page.tsx`, `operations/tracking/page.tsx` | **Clarified** — page.tsx files are 29-33 LOC wrappers, but actual component implementations are substantial (200-400+ LOC with kanban, maps, real-time, optimistic updates). Component quality is 8/10 |
| Column visibility not persisted | P2 UX | `operations/loads/page.tsx` | Resets on navigation |
| `as any` type assertions | P2 Code | `orders/page.tsx:98`, `orders/[id]/edit/page.tsx:124` | Minor — `formData: {} as any`, `status: newStatus as any` |
| ~~Soft delete not on Order~~ | ~~P1 DB~~ | ~~Migration needed~~ | ~~**CLOSED** — Order model HAS `deletedAt` field in Prisma schema. Quote, Invoice, Settlement, Payment need separate verification~~ |
| ~~No tests for any frontend TMS screens~~ | ~~P1~~ | — | ~~**CLOSED** — 16 test files exist in `__tests__/tms/` (check-call, dispatch-board, dispatch-drag-drop, dispatch-realtime, load-detail, load-form, loads-list, order-detail, order-form, orders-list, public-tracking, rate-confirmation, stop-management, tracking-map + 2 regression)~~ |
| Check Call Form needs RHF refactor | P1 | `components/tms/checkcalls/check-call-form.tsx` | QS-006 — uses `useState` + manual validation, not React Hook Form |
| use-checkcalls.ts has 11 field fallbacks | P1 Code | `lib/hooks/tms/use-checkcalls.ts` | Open — fragile field mapping (e.g., `cc.type ?? cc.status`, `cc.latitude ?? cc.lat`). Will break silently if backend changes |
| Orders status change uses `as any` | P1 Code | `operations/orders/page.tsx` | Open — needs proper type mapping |
| Load tender/accept/reject not built | P1 Feature | Backend | TMS-018 — carrier workflow endpoints missing |

---

## 12. Tasks

### Quality Sprint (Active)

| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| QS-001 | WebSocket Gateways (dispatch + tracking + notifications + dashboard) | XL (12-16h) | Open |
| QS-006 | Check Call Form RHF Refactor | M (2-4h) | Open |
| QS-008 | Runtime Verification — click all 12 TMS routes with Playwright | L (6h) | Open |

### From PST-05 Tribunal

| Task ID | Title | Effort | Priority | Status |
|---------|-------|--------|----------|--------|
| TMS-016 | Wire Orders delete to API (currently no-op toast) | S (1h) | P1 | Open |
| TMS-017 | Fix Orders status change type assertions | S (1h) | P1 | Open |
| TMS-018 | Implement Load tender/accept/reject endpoints | L (4-6h) | P1 | Open |
| TMS-019 | Refactor use-checkcalls.ts field mapping (11 fallbacks) | S (1h) | P1 | Open |
| TMS-020 | ~~Rewrite hub data model section from Prisma schema~~ | M (3-4h) | P0 | **Done** (this correction) |
| TMS-021 | ~~Rewrite hub API endpoints section (51 actual vs 65 claimed)~~ | M (2-3h) | P0 | **Done** (this correction) |

### QA Backlog (screens exist — verify and fix)

| Task ID | Title | Effort | Priority | Notes |
|---------|-------|--------|----------|-------|
| TMS-001 | QA Orders List (fix delete no-op, add bulk action buttons) | S (2h) | P0 | Page exists 7/10 |
| TMS-002 | QA Order Detail (verify all 6 tabs render, actions work) | S (2h) | P0 | Page exists 8/10 |
| TMS-003 | QA Loads List (fix page title "Dispatch Board" -> "Loads", persist column settings) | S (1h) | P0 | Page exists 8/10 |
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

## 12b. Rate Confirmation & BOL Generation (Tribunal Verdicts)

> Added per TRIBUNAL-02, TRIBUNAL-04, TRIBUNAL-10 verdicts (2026-03-07).
> These are table-stakes features for any TMS — promoted to P0 scope.

### Rate Confirmation

**Status:** Backend endpoint EXISTS (`GET /api/v1/loads/:id/rate-confirmation`). Frontend page EXISTS (`/operations/loads/[id]/rate-con`, 9/10 quality). PDF generation partially built via `pdf.service.ts` (PDFKit).

**What's needed:**

- `POST /api/v1/loads/:id/rate-confirmation/generate` — generate rate con PDF (extend `pdf.service.ts`)
- `POST /api/v1/loads/:id/rate-confirmation/send` — email rate con to carrier (SendGrid)
- Update Load model: set `rateConfirmationSent` timestamp on send
- Verify frontend Generate/Download/Email buttons work end-to-end

**PDF content:** Load details (number, dates, equipment), carrier info, pickup/delivery addresses, rates and accessorials, terms and conditions, signature line.

**Task:** QS-012 (Rate Con PDF Generation)

### BOL (Bill of Lading) Generation

**Status:** Not Built. No backend endpoint, no frontend page.

**What's needed:**

- `POST /api/v1/loads/:id/bol` — generate BOL PDF
- Frontend button on Load Detail page to generate/preview/download BOL
- BOL template in `pdf.service.ts` or separate `document-generation.service.ts`

**PDF content:** Shipper/consignee info, commodity description, weight, piece count, special instructions, hazmat placards (if applicable), reference numbers, carrier name, standard BOL terms.

**Task:** QS-013 (BOL PDF Generation)

### Shared PDF Infrastructure

Both features reuse `apps/api/src/modules/accounting/services/pdf.service.ts` which already has `generateInvoicePdf()` using PDFKit (pdfkit@0.17.2). The same pattern (service method -> PDFKit -> Buffer -> response) applies to rate con and BOL.

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
| Frontend to be built first | Backend 9/10 quality, frontend 7.75/10 avg | Both substantially built |
| 14 screens planned | 12 built (10 real, 2 wrappers), 2 integrated into tabs | ~86% complete |
| 65 API endpoints | 51 actual endpoints (14 phantom removed) | 78% of claimed count |
| WebSocket in "Phase 4" | WebSocket needed in Phase 1 for Dispatch Board | QS-001 — still the critical blocker |
| Single TMS module | Separate Orders, Loads, Stops, CheckCalls modules | Better modularity |
| Dispatch Board = 1 task | Dispatch board component built with kanban + table views | QA needed, not a build task |
| Public Tracking Page = future | Moved to P1 (reduces support calls by 50%) | Only unbuilt screen |
| All screens "Not Built" in docs | 12 screens built during v2 sprint (71/72 tasks) | Docs were never updated post-v2 |
| Hub claimed 0 frontend tests | 16 test files exist in `__tests__/tms/` | Hub was wrong |
| Hub data model ~30% accurate | Rewritten from Prisma schema | TrackingEvent was phantom, 60-80% field errors per model |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles, tenantId) — P0
- CRM (customer lookup, credit status check before order creation) — P0
- Carrier Management (carrier assignment, compliance check) — P0
- Sales & Quotes (quote -> order conversion) — P0
- WebSocket infrastructure (QS-001) — Must be built first

**Depended on by:**
- Accounting (delivered orders -> invoicing, carrier costs -> settlement)
- Load Board (available loads for external posting)
- Commission (order revenue for commission calculations)
- Customer Portal (order status, tracking, delivery confirmation)
- Carrier Portal (load assignments, stop details, check call submission)
- Communication (email/SMS triggers on status changes)
- Analytics (revenue trends, load metrics)

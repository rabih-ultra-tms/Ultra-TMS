# Sprint 03 — TMS Core Build Design Spec

> **Date:** 2026-03-11
> **Duration:** 2 weeks | **Budget:** 40h
> **Goal:** Order lifecycle works end-to-end: create order, assign carrier, dispatch, track check calls, mark delivered. Dispatch board shows real-time load status.

---

## Approach: Hybrid (Upgrade + Rebuild)

Existing TMS code totals ~21,000 lines across 71 files. Rather than a full rebuild, we upgrade strong screens and rebuild only stubs/weak screens.

### Task Assessment

| Task    | Screen            | LOC Exists                   | Approach                      | Effort |
| ------- | ----------------- | ---------------------------- | ----------------------------- | ------ |
| TMS-001 | Order List        | 384 + 4,175 components       | Upgrade                       | 4h     |
| TMS-002 | Order Create/Edit | 180 + 623 form               | Upgrade                       | 8h     |
| TMS-003 | Order Detail      | 114 + 5 tabs                 | Upgrade                       | 6h     |
| TMS-004 | Load List         | 201 + 3,857 components       | Upgrade                       | 3h     |
| TMS-005 | Load Detail       | 120 + 516 header             | Upgrade                       | 4h     |
| TMS-006 | Dispatch Board    | 29 (stub) + 4,091 components | Rebuild page, wire components | 10h    |
| TMS-007 | Check Call Form   | 17 (stub)                    | Rebuild                       | 3h     |
| TMS-008 | Rate Con Send     | 232                          | Upgrade                       | 2h     |

---

## Architecture

### Backend (existing — no changes)

- **Orders Controller:** 19 endpoints (CRUD, stops, items, loads, timeline, status)
- **Loads Controller:** 23 endpoints (CRUD, dispatch, check-calls, rate-con, BOL, tender)
- All endpoints use `JwtAuthGuard`, `@CurrentTenant()` decorator, soft-delete filtering

### Frontend Stack

- React Query hooks for data fetching (existing pattern in codebase)
- shadcn/ui components (existing)
- React Hook Form + Zod for forms (existing pattern)
- Polling for dispatch board real-time updates (WebSocket QS-001 not ready)

### API Hooks Required

```
useOrders(filters)        → GET /api/v1/orders
useOrder(id)              → GET /api/v1/orders/:id
useCreateOrder()          → POST /api/v1/orders
useUpdateOrder()          → PUT /api/v1/orders/:id
useOrderTimeline(id)      → GET /api/v1/orders/:id/timeline
useLoads(filters)         → GET /api/v1/loads
useLoad(id)               → GET /api/v1/loads/:id
useLoadBoard()            → GET /api/v1/loads/board
useLoadStats()            → GET /api/v1/loads/stats
useDispatchLoad()         → PATCH /api/v1/loads/:id/dispatch
useAssignCarrier()        → POST /api/v1/loads/:id/assign-carrier
useUpdateLoadStatus()     → PATCH /api/v1/loads/:id/status
useCheckCalls(loadId)     → GET /api/v1/loads/:id/check-calls
useCreateCheckCall()      → POST /api/v1/loads/:id/check-calls
useRateConfirmation()     → POST /api/v1/loads/:id/rate-confirmation
useSendRateConfirmation() → POST /api/v1/loads/:id/rate-confirmation/send
```

---

## Screen Designs

### TMS-001: Order List (Upgrade)

**Design spec:** `dev_docs/12-Rabih-design-Process/04-tms-core/02-orders-list.md`

Upgrade existing page at `operations/orders/page.tsx` (384 lines):

- Verify KPI cards work (Total Active, Pending, In Transit, Delivered Today)
- Ensure filter bar matches spec (status, customer, date range, equipment, dispatcher)
- Wire up bulk actions (status change, export)
- Add export CSV functionality
- Verify column visibility respects `finance_view` permission
- Ensure pagination is server-side with proper loading states

### TMS-002: Order Create/Edit (Upgrade)

**Design spec:** `dev_docs/12-Rabih-design-Process/04-tms-core/04-order-entry.md`

Upgrade existing multi-step form (623-line order-form.tsx + 4 step components):

- Verify all steps work: Customer → Stops → Cargo → Rate → Review
- Wire form submission to POST/PUT /orders endpoints
- Ensure Zod validation matches backend DTO
- Test customer selector integration (CRM data)
- Add stop builder with pickup/delivery types
- Verify edit mode loads existing order data correctly

### TMS-003: Order Detail (Upgrade)

**Design spec:** `dev_docs/12-Rabih-design-Process/04-tms-core/03-order-detail.md`

Upgrade existing detail page (114 lines + tab components):

- Wire overview tab to order data
- Wire timeline tab to GET /orders/:id/timeline
- Wire loads tab to GET /orders/:id/loads with "Create Load" action
- Wire items tab to order items endpoints
- Add status change actions with forward-only validation
- Add "Create Load" flow that navigates to load builder

### TMS-004: Load List (Upgrade)

**Design spec:** `dev_docs/12-Rabih-design-Process/04-tms-core/05-loads-list.md`

Upgrade existing page (201 lines + loads-data-table, filter-bar):

- Verify data table columns match spec
- Wire filter bar to server-side filtering
- Add status badge component (load-status-badge.tsx exists at 143 lines)
- Ensure KPI stat cards show correct metrics
- Add row actions: View, Edit, Dispatch, Clone

### TMS-005: Load Detail (Upgrade)

**Design spec:** `dev_docs/12-Rabih-design-Process/04-tms-core/06-load-detail.md`

Upgrade existing detail (120-line client-page + 516-line header + tabs):

- Wire all tabs: Overview, Route, Carrier, Documents, Timeline, Check Calls
- Add status-dependent action buttons (Dispatch, Add Check Call, Confirm Delivery)
- Wire carrier assignment flow
- Add tracking map snippet (static for now, no GPS integration)
- Wire documents tab to rate-con and BOL endpoints
- Add detention time display

### TMS-006: Dispatch Board (Rebuild page + wire components)

**Design spec:** `dev_docs/12-Rabih-design-Process/04-tms-core/08-dispatch-board.md`

Rebuild the 29-line stub page, leveraging existing components:

- **dispatch-board.tsx** (240 lines) — board orchestrator
- **kanban-board.tsx** (364 lines) — kanban view
- **kanban-lane.tsx** (106 lines) — swim lanes
- **load-card.tsx** (407 lines) — load cards
- **dispatch-data-table.tsx** (489 lines) — table view
- **dispatch-detail-drawer.tsx** (1,535 lines) — detail drawer
- **dispatch-toolbar.tsx** (332 lines) — toolbar with filters

New work:

- Wire page to orchestrate toolbar → board → drawer flow
- Implement view switcher (Kanban / Table)
- Wire kanban lanes to load statuses: PENDING → TENDERED → DISPATCHED → IN_TRANSIT → DELIVERED
- Add drag-and-drop status transitions with validation (forward-only, carrier required for TENDERED)
- Wire 30-second polling for real-time updates (fallback for WebSocket)
- Add "at-risk" flagging (PENDING > 24h = orange border)
- Wire detail drawer to open on card click
- KPI strip showing lane counts

### TMS-007: Check Call Form + History (Rebuild)

**Design spec:** `dev_docs/12-Rabih-design-Process/04-tms-core/13-check-calls.md`

Build from scratch (existing tab is 17 lines):

- Check call history list with color-coded ETA status (green/yellow/red)
- Quick-entry form: location (city/state), ETA, status, notes
- Wire to POST/GET /loads/:id/check-calls
- "Next check call reminder" scheduler
- Integrate as tab in Load Detail AND standalone at /operations/check-calls
- Support backdated entries (up to 4h)

### TMS-008: Rate Confirmation Send (Upgrade)

**Design spec:** implied from load detail + existing 232-line page

Upgrade existing rate-con page:

- Wire "Generate PDF" to POST /loads/:id/rate-confirmation
- Wire "Send to Carrier" to POST /loads/:id/rate-confirmation/send
- Add email preview before sending
- Show sent/signed status tracking
- Add to Load Detail documents tab as action

---

## Execution Order

1. TMS-001 Order List (foundation)
2. TMS-002 Order Create/Edit
3. TMS-003 Order Detail
4. TMS-004 Load List (can parallel with orders)
5. TMS-005 Load Detail
6. TMS-007 Check Call Form (needed by dispatch board)
7. TMS-006 Dispatch Board (biggest, depends on load + check call components)
8. TMS-008 Rate Con Send (independent)

## Acceptance Criteria

- [ ] Order CRUD with stops (pickup/delivery), items, customer selection
- [ ] Order-to-load assignment flow
- [ ] Load status progression: PENDING → DISPATCHED → PICKED_UP → IN_TRANSIT → DELIVERED
- [ ] Dispatch board: Kanban + Table views, status filters, polling updates
- [ ] Check call creation with location, ETA, status
- [ ] Rate confirmation generation and send
- [ ] Status history timeline on load detail
- [ ] All screens wire to existing backend endpoints
- [ ] Loading, error, and empty states on all screens

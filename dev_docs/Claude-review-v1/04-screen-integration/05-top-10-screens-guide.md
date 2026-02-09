# Top 10 Screens Implementation Guide

> Detailed implementation guide for the 10 highest-priority unbuilt screens in Ultra TMS, with file structure, hooks, component lists, API endpoints, time estimates, and risk factors.

---

## Overview

These 10 screens form the minimum viable TMS. They are ordered by the recommended build sequence from the Screen Priority Matrix (File 03). Each screen section includes everything a developer needs to begin implementation without further research.

**Reference documents for each screen:**
- Design spec: `dev_docs/12-Rabih-design-Process/{service}/{screen}.md`
- Component build order: `dev_docs/Claude-review-v1/04-screen-integration/02-component-build-order.md`
- Pattern library: `dev_docs/Claude-review-v1/04-screen-integration/04-pattern-library-plan.md`
- Design-to-code workflow: `dev_docs/Claude-review-v1/04-screen-integration/01-design-to-code-workflow.md`

---

## Screen 1: Operations Dashboard

**Spec:** `dev_docs/12-Rabih-design-Process/04-tms-core/01-operations-dashboard.md`
**Route:** `/(dashboard)/operations`
**Pattern:** Dashboard Page (Pattern 4)
**Priority:** P0 #1 | **Estimated hours:** 25-40h

### Why Build First

This is the landing page for all operations roles. It surfaces the metrics and alerts that drive every other interaction in the TMS. Building it first validates KPICard, Chart, and Grid components that are reused across 42+ dashboard screens.

### File Structure

```
apps/web/app/(dashboard)/operations/
  page.tsx                              # Main dashboard page (~200 lines)
  loading.tsx                           # Skeleton loading state

apps/web/components/operations/
  operations-kpi-strip.tsx              # 6 KPI cards in responsive grid
  operations-load-status-chart.tsx      # Horizontal bar chart: loads by status
  operations-revenue-trend.tsx          # 30-day revenue line chart
  operations-alerts-list.tsx            # Exception/alert cards with actions
  operations-activity-feed.tsx          # Recent activity timeline
  operations-needs-attention.tsx        # Mini board of loads needing attention
  operations-quick-actions.tsx          # Quick navigation cards

apps/web/lib/hooks/operations/
  use-operations-dashboard.ts           # Combined dashboard data hooks
  use-operations-kpis.ts               # KPI metrics query
  use-operations-alerts.ts             # Alerts/exceptions query
  use-operations-activity.ts           # Activity feed query
```

### Hooks to Create

| Hook | Endpoint | Refresh Interval | Purpose |
|------|---------|-----------------|---------|
| `useOperationsKPIs(dateRange)` | GET /api/v1/operations/kpis | 120s (WebSocket) | 6 KPI card values with trends |
| `useLoadsByStatus(dateRange)` | GET /api/v1/loads/stats/by-status | 300s | Chart data: load count per status |
| `useRevenueTrend(period)` | GET /api/v1/operations/revenue-trend | 300s | 30-day revenue line chart data |
| `useOperationsAlerts()` | GET /api/v1/operations/alerts | 60s (WebSocket) | Active exceptions list |
| `useOperationsActivity(limit)` | GET /api/v1/operations/activity | 60s | Recent activity feed items |
| `useNeedsAttention()` | GET /api/v1/loads?needsAttention=true | 120s | Loads requiring dispatcher action |

### Components from Build Order

| Component | Sprint | Status |
|-----------|--------|--------|
| KPICard | F1 | Build |
| Statistic | F1 | Build |
| Chart (bar, line) | T3 | Build |
| Grid | F3 | Build |
| DateRangePicker | F2 | Build |
| LoadStatusBadge | F1 | Build |
| Banner | F3 | Build |

### Risk Factors

- **Chart library selection:** The shadcn Chart component wraps Recharts. Verify Recharts meets the design spec's chart requirements before committing.
- **WebSocket integration:** Dashboard requires real-time KPI updates. If WebSocket infrastructure is not ready, implement with polling (refetchInterval) and upgrade later.
- **Permission-gated metrics:** Revenue and margin KPIs are hidden for Dispatcher role. Implement early to establish the permission pattern.

---

## Screen 2: Orders List

**Spec:** `dev_docs/12-Rabih-design-Process/04-tms-core/02-orders-list.md`
**Route:** `/(dashboard)/orders`
**Pattern:** List Page (Pattern 1)
**Priority:** P0 #4 | **Estimated hours:** 20-30h

### Why Build Second

This is the first List page to be built with the DataGrid component. It validates the entire List Page pattern (FilterBar, DataGrid, URL-synced filters, batch actions, mobile cards) that will be reused across 134 List screens.

### File Structure

```
apps/web/app/(dashboard)/orders/
  page.tsx                              # Main list page (~180 lines)
  loading.tsx                           # Skeleton loading state

apps/web/components/orders/
  orders-stats-bar.tsx                  # Order status count cards
  orders-columns.tsx                    # DataGrid column definitions
  orders-filters.tsx                    # Order-specific filter fields
  order-create-dialog.tsx               # Quick create dialog (or redirect to wizard)
  order-status-badge.tsx                # Order-specific status badge

apps/web/lib/hooks/orders/
  use-orders.ts                         # Paginated orders list query
  use-order-stats.ts                    # Order status counts
  use-create-order.ts                   # Create order mutation
  use-delete-order.ts                   # Delete order mutation
```

### Hooks to Create

| Hook | Endpoint | Purpose |
|------|---------|---------|
| `useOrders(filters)` | GET /api/v1/orders | Paginated orders list |
| `useOrderStats()` | GET /api/v1/orders/stats | Status counts for stats bar |
| `useCreateOrder()` | POST /api/v1/orders | Quick create (or redirect to wizard) |
| `useDeleteOrder()` | DELETE /api/v1/orders/:id | Soft delete with confirmation |
| `useBulkUpdateOrders()` | PATCH /api/v1/orders/bulk | Bulk status update |

### Components from Build Order

| Component | Sprint | Status |
|-----------|--------|--------|
| DataGrid | T3 | Build |
| FilterBar | Phase 3 | Enhance |
| SearchInput | F1 | Build |
| DateRangePicker | F2 | Build |
| MultiSelect | F2 | Build |
| LoadStatusBadge | F1 | Build (order variant) |

### Risk Factors

- **DataGrid complexity:** This is the first time DataGrid is used in production. Budget extra time for sorting, filtering, column resize, and virtual scrolling edge cases.
- **Column definitions:** Define columns as a separate file (`orders-columns.tsx`) to keep the page clean and enable potential column customization later.

---

## Screen 3: Loads List

**Spec:** `dev_docs/12-Rabih-design-Process/04-tms-core/05-loads-list.md`
**Route:** `/(dashboard)/loads`
**Pattern:** List Page (Pattern 1)
**Priority:** P0 #5 | **Estimated hours:** 20-30h

### Why Build Third

Second List page validates DataGrid reusability. Loads List has more complex status logic than Orders (6 load statuses vs 4 order statuses) and introduces the LoadCard mobile view.

### File Structure

```
apps/web/app/(dashboard)/loads/
  page.tsx                              # Main list page (~180 lines)
  loading.tsx                           # Skeleton loading state

apps/web/components/loads/
  loads-stats-bar.tsx                   # Load status count cards
  loads-columns.tsx                     # DataGrid column definitions
  loads-filters.tsx                     # Load-specific filter fields
  load-mobile-card.tsx                  # Mobile card view using LoadCard

apps/web/lib/hooks/loads/
  use-loads.ts                          # Paginated loads list query
  use-load-stats.ts                     # Load status counts
```

### Hooks to Create

| Hook | Endpoint | Purpose |
|------|---------|---------|
| `useLoads(filters)` | GET /api/v1/loads | Paginated loads list |
| `useLoadStats()` | GET /api/v1/loads/stats | Status counts for stats bar |
| `useBulkUpdateLoads()` | PATCH /api/v1/loads/bulk | Bulk status update |

### Risk Factors

- **LoadCard in mobile view:** The LoadCard component built in Sprint T1 is reused here for mobile rendering. Verify it works in both Dispatch Board (full view) and Loads List (compact view) contexts.

---

## Screen 4: Order Entry (5-Step Wizard)

**Spec:** `dev_docs/12-Rabih-design-Process/04-tms-core/04-order-entry.md`
**Route:** `/(dashboard)/orders/new`
**Pattern:** Form Page -- Wizard Variant (Pattern 3)
**Priority:** P0 #3 | **Estimated hours:** 40-60h

### Why Build Fourth

This is the most complex form in the system (58 fields across 5 steps). Building it validates the Stepper, CustomerSelector, EquipmentSelector, StopList, CurrencyInput, and wizard state management pattern. Every other multi-step form (Carrier Onboarding, Lead Import) reuses this pattern.

### File Structure

```
apps/web/app/(dashboard)/orders/new/
  page.tsx                              # Wizard container (~150 lines)

apps/web/components/orders/
  order-wizard.tsx                      # Wizard state machine (~200 lines)
  order-step-customer.tsx               # Step 1: Customer & Reference
  order-step-cargo.tsx                  # Step 2: Cargo Details
  order-step-stops.tsx                  # Step 3: Stops (Pickup & Delivery)
  order-step-rate.tsx                   # Step 4: Rate & Billing
  order-step-review.tsx                 # Step 5: Review & Submit
  order-summary-panel.tsx               # Right panel: live order summary
  order-duplicate-warning.tsx           # Duplicate detection dialog

apps/web/lib/hooks/orders/
  use-create-order.ts                   # (already exists from Screen 2)
  use-order-defaults.ts                 # Default values for new orders

apps/web/lib/schemas/
  order-entry-schema.ts                 # Zod schema for all 58 fields
```

### Hooks to Create

| Hook | Endpoint | Purpose |
|------|---------|---------|
| `useCreateOrder()` | POST /api/v1/orders | Submit completed order |
| `useOrderDefaults()` | GET /api/v1/orders/defaults | Default equipment, terms |
| `useValidateOrder()` | POST /api/v1/orders/validate | Server-side validation before submit |
| `useCheckDuplicate()` | POST /api/v1/orders/check-duplicate | Duplicate detection (customer + PO + date) |
| `useQuoteData(quoteId)` | GET /api/v1/quotes/:id | Pre-fill from quote conversion |
| `useCloneOrder(orderId)` | GET /api/v1/orders/:id | Pre-fill from clone action |
| `useCustomerCreditStatus(customerId)` | GET /api/v1/customers/:id/credit | Credit hold warning |

### Components from Build Order

| Component | Sprint | Status |
|-----------|--------|--------|
| Stepper | F3 | Build |
| CustomerSelector | T2 | Build |
| EquipmentSelector | T2 | Build |
| StopList | T2 | Build |
| CurrencyInput | F2 | Build |
| DatePicker | F2 | Build |
| TimePicker | F2 | Build |
| CheckboxGroup | F2 | Build |
| MultiSelect | F2 | Build |
| Panel | F3 | Build |
| AddressAutocomplete | Exists | Reuse |

### Risk Factors

- **58 fields across 5 steps:** This is the highest field count in the system. The Zod schema must handle conditional validation (e.g., hazmat fields required only when hazmat toggle is on, reefer temperature required only for reefer equipment).
- **Quote conversion pre-fill:** When arriving from a quote, all fields must pre-populate correctly. Test with edge cases: quotes with accessorials, multi-stop quotes, expired quotes.
- **Per-step validation:** Each step must validate independently before allowing Next. Use React Hook Form's `trigger()` with field arrays per step.
- **Autosave:** Consider implementing autosave to localStorage every 30 seconds for long forms, restoring on page revisit (with a "Resume draft?" prompt).

---

## Screen 5: Load Detail

**Spec:** `dev_docs/12-Rabih-design-Process/04-tms-core/06-load-detail.md`
**Route:** `/(dashboard)/loads/[id]`
**Pattern:** Detail Page -- 3-Column Variant (Pattern 2)
**Priority:** P0 #6 | **Estimated hours:** 40-60h

### Why Build Fifth

This is the most information-dense screen in the system (58 load fields, 5 tabs, 3-column layout, inline map, WebSocket real-time updates). It establishes the Detail Page pattern reused by Order Detail, Carrier Detail, and 30+ other detail pages.

### File Structure

```
apps/web/app/(dashboard)/loads/[id]/
  page.tsx                              # Main detail page (~200 lines)
  loading.tsx                           # Skeleton loading state

apps/web/components/loads/
  load-header-bar.tsx                   # Load ID, status, carrier, actions
  load-summary-panel.tsx                # Left panel: key load info
  load-route-tab.tsx                    # Tab: Route with StopTimeline
  load-carrier-tab.tsx                  # Tab: Carrier & driver info
  load-documents-tab.tsx                # Tab: Documents with checklist
  load-timeline-tab.tsx                 # Tab: Event timeline
  load-check-calls-tab.tsx              # Tab: Check call history
  load-tracking-card.tsx                # Right panel: map + ETA + GPS
  load-rate-section.tsx                 # Rate breakdown (permission-gated)
  load-actions-menu.tsx                 # Actions dropdown (status-aware)

apps/web/lib/hooks/loads/
  use-load.ts                           # Single load query
  use-load-route.ts                     # Stops and route data
  use-load-documents.ts                 # Documents for this load
  use-load-timeline.ts                  # Timeline events
  use-load-check-calls.ts              # Check call history
  use-load-tracking.ts                  # GPS position and ETA
  use-update-load-status.ts             # Status transition mutation
```

### Hooks to Create

| Hook | Endpoint | Refresh | Purpose |
|------|---------|---------|---------|
| `useLoad(id)` | GET /api/v1/loads/:id | -- | Load data |
| `useLoadRoute(id)` | GET /api/v1/loads/:id/route | -- | Stops with addresses |
| `useLoadDocuments(id)` | GET /api/v1/loads/:id/documents | -- | Rate conf, BOL, POD |
| `useLoadTimeline(id)` | GET /api/v1/loads/:id/timeline | 60s | Event history |
| `useLoadCheckCalls(id)` | GET /api/v1/loads/:id/check-calls | -- | Check call records |
| `useLoadTracking(id)` | GET /api/v1/loads/:id/tracking | 60s (WS) | GPS position, ETA |
| `useUpdateLoadStatus()` | PATCH /api/v1/loads/:id/status | -- | Status transition |
| `useUpdateLoad()` | PATCH /api/v1/loads/:id | -- | Edit load fields |
| `useAddCheckCall()` | POST /api/v1/loads/:id/check-calls | -- | Log new check call |

### Components from Build Order

| Component | Sprint | Status |
|-----------|--------|--------|
| Panel | F3 | Build |
| DescriptionList | F3 | Build |
| StopTimeline | T1 | Build |
| LoadTimeline | T1 | Build |
| CheckCallLog | T1 | Build |
| DocumentChecklist | T1 | Build |
| LoadStatusBadge | F1 | Build |
| TrackingMapContainer | T4 | Build |
| CarrierAssignmentModal | T4 | Build |
| Statistic | F1 | Build |
| CurrencyInput | F2 | Build |
| Accordion | Phase 0 | Install |
| Resizable | Phase 0 | Install |
| Tabs | Exists | Reuse |

### Risk Factors

- **3-column layout on desktop:** Use CSS Grid or the Resizable component. The left panel (25%) and right panel (25%) are fixed-ish; the center panel (50%) holds the tabbed content.
- **Tab-scoped data loading:** Each tab should fetch its data lazily (only when the tab is activated) to avoid loading all 5 data sources on page open. Use React Query's `enabled` option.
- **Status-aware actions:** The Actions dropdown changes based on load status. A PLANNING load shows "Edit", "Assign Carrier", "Delete". A DISPATCHED load shows "Add Check Call", "Update Status". A DELIVERED load shows "Upload POD", "Generate Invoice". Build a state machine for this.
- **Permission-gated rate section:** Revenue and margin must be hidden for roles without `finance_view`. Implement as a conditional render on the entire rate section, not just individual fields.

---

## Screen 6: Dispatch Board

**Spec:** `dev_docs/12-Rabih-design-Process/04-tms-core/08-dispatch-board.md`
**Route:** `/(dashboard)/dispatch`
**Pattern:** Board Page (Pattern 5)
**Priority:** P0 #2 | **Estimated hours:** 60-90h

### Why Build Sixth (Not Second)

Despite being the #2 priority screen, the Dispatch Board is built sixth because it depends on the most components (KanbanBoard, LoadCard, CarrierAssignmentModal, TrackingMapContainer, FilterBar, KPICard). Building simpler screens first validates these components individually before assembling them into the most complex screen.

### File Structure

```
apps/web/app/(dashboard)/dispatch/
  page.tsx                              # Main board page (~250 lines)
  loading.tsx                           # Skeleton loading state

apps/web/components/dispatch/
  dispatch-toolbar.tsx                  # View toggle, filters, search, actions
  dispatch-kpi-strip.tsx                # 8 status count cards (collapsible)
  dispatch-kanban-view.tsx              # Kanban view container
  dispatch-timeline-view.tsx            # Timeline/Gantt view (alternate)
  dispatch-map-view.tsx                 # Map view (alternate, reuses TrackingMap)
  dispatch-load-context-menu.tsx        # Right-click menu for load cards
  dispatch-confirmation-dialog.tsx      # Dispatch confirmation modal
  dispatch-tender-countdown.tsx         # Carrier acceptance countdown timer
  dispatch-mini-map.tsx                 # Bottom-right map overlay

apps/web/lib/hooks/dispatch/
  use-dispatch-board.ts                 # Board data grouped by status
  use-dispatch-stats.ts                 # KPI counts per status
  use-move-load.ts                      # Drag-drop status change mutation
  use-assign-carrier.ts                 # Carrier assignment mutation
  use-dispatch-load.ts                  # Dispatch action mutation
  use-dispatch-updates.ts              # WebSocket real-time updates
```

### Hooks to Create

| Hook | Endpoint | Refresh | Purpose |
|------|---------|---------|---------|
| `useDispatchBoardLoads(filters)` | GET /api/v1/loads?groupBy=status | 30s (WS) | Board data |
| `useDispatchStats(dateRange)` | GET /api/v1/loads/stats | 30s | KPI counts |
| `useMoveLoad()` | PATCH /api/v1/loads/:id/status | -- | Drag-drop optimistic |
| `useAssignCarrier()` | POST /api/v1/loads/:id/assign | -- | Carrier assignment |
| `useDispatchLoad()` | POST /api/v1/loads/:id/dispatch | -- | Dispatch action |
| `useAvailableCarriers(filters)` | GET /api/v1/carriers?available=true | -- | Assignment modal |
| `useDispatchUpdates()` | WebSocket /dispatch | Realtime | Live board updates |

### Components from Build Order

| Component | Sprint | Status |
|-----------|--------|--------|
| KanbanBoard | T4 | Build |
| KanbanLane | T4 | Build |
| LoadCard | T1 | Build |
| CarrierAssignmentModal | T4 | Build |
| TrackingMapContainer | T4 | Build (mini-map) |
| FilterBar | Phase 3 | Enhance |
| SearchInput | F1 | Build |
| KPICard | F1 | Build |
| MultiSelect | F2 | Build |
| DateRangePicker | F2 | Build |
| ToggleGroup | Phase 0 | Install |
| ContextMenu | Phase 0 | Install |

### Risk Factors

- **@dnd-kit performance:** With 100+ cards across 6 lanes, drag-and-drop performance can degrade. Implement virtual scrolling within lanes (only render visible cards).
- **Optimistic updates on drag-drop:** When a card is dragged between lanes, it must move immediately (optimistic) and revert if the API call fails. Test thoroughly with network throttling.
- **WebSocket coordination:** When two dispatchers are viewing the same board, load status changes from one must appear on the other's screen within 2 seconds. Test with multiple browser tabs.
- **Backward transitions:** Moving a card backward in the pipeline (e.g., DELIVERED back to IN_TRANSIT) requires admin permission and a reason code modal. Build the permission check and modal into the drag handler.
- **Three view modes:** The spec describes Kanban, Timeline, and Map views. Build Kanban first (primary), then add Timeline and Map as separate components sharing the same data hooks.

---

## Screen 7: Tracking Map

**Spec:** `dev_docs/12-Rabih-design-Process/04-tms-core/10-tracking-map.md`
**Route:** `/(dashboard)/tracking`
**Pattern:** Map Page (Pattern 6)
**Priority:** P0 #8 | **Estimated hours:** 40-60h

### Why Build Seventh

The Tracking Map is the second most complex screen and the first full Map Page. It validates the TrackingMapContainer, geofence rendering, marker clustering, and GPS WebSocket updates. These patterns are reused by Vehicle Locations, Location History, and portal tracking screens.

### File Structure

```
apps/web/app/(dashboard)/tracking/
  page.tsx                              # Map page (~180 lines)

apps/web/components/tracking/
  tracking-toolbar.tsx                  # Floating toolbar overlay
  tracking-side-panel.tsx               # Slide-in load details panel
  tracking-stop-timeline-mini.tsx       # Compact stop progress in side panel
  tracking-status-legend.tsx            # Color legend overlay (green/yellow/red)
  tracking-timeline-strip.tsx           # Bottom strip: today's stops
  tracking-kiosk-mode.tsx               # Full-screen kiosk wrapper

apps/web/lib/hooks/tracking/
  use-map-loads.ts                      # All loads with GPS positions
  use-load-route-polyline.ts            # Planned vs actual route
  use-geofences.ts                      # Facility geofence boundaries
  use-gps-updates.ts                    # WebSocket GPS position stream
```

### Hooks to Create

| Hook | Endpoint | Refresh | Purpose |
|------|---------|---------|---------|
| `useMapLoads(filters)` | GET /api/v1/loads/map | 60s (WS) | All active loads with lat/lng |
| `useLoadRoutePolyline(id)` | GET /api/v1/loads/:id/route/polyline | -- | Planned + actual route paths |
| `useGeofences(bounds)` | GET /api/v1/facilities/geofences | -- | Geofence polygons for visible area |
| `useGPSUpdates()` | WebSocket /tracking | Realtime | Live GPS position stream |
| `useTrafficLayer()` | Google Maps Traffic API | Built-in | Traffic overlay |
| `useWeatherOverlay(bounds)` | OpenWeatherMap API | 300s | Weather overlay |

### Components from Build Order

| Component | Sprint | Status |
|-----------|--------|--------|
| TrackingMapContainer | T4 | Build |
| LoadCard (condensed) | T1 | Build |
| StopTimeline (mini) | T1 | Build |
| LoadStatusBadge | F1 | Build |
| FilterBar | Phase 3 | Enhance |
| ToggleGroup | Phase 0 | Install |
| Sheet | Exists | Reuse |

### Risk Factors

- **Map provider costs:** Google Maps charges per API call. Implement map tile caching and limit geocoding calls. Consider Mapbox as an alternative with more predictable pricing.
- **Marker clustering:** With 200+ markers, the map must cluster at lower zoom levels. Use Google Maps MarkerClusterer or deck.gl for WebGL rendering.
- **GPS stale data:** Markers with no GPS update in 30+ minutes must show a "stale" visual (grayed out with clock icon). Implement a timer per marker.
- **Geofence crossing detection:** When a load crosses a geofence boundary, the system auto-generates a stop:arrived or stop:departed event. This is a backend concern but the frontend must handle the resulting WebSocket event.

---

## Screen 8: Check Calls

**Spec:** `dev_docs/12-Rabih-design-Process/04-tms-core/13-check-calls.md`
**Route:** `/(dashboard)/loads/[id]/check-calls` and `/(dashboard)/operations/check-calls`
**Pattern:** List Page + Form Hybrid (Pattern 1 + Pattern 3)
**Priority:** P0 #9 | **Estimated hours:** 20-30h

### Why Build Eighth

Check Calls is relatively simple (list + form) but is operationally critical -- dispatchers log 15-30 check calls per day. It validates the CheckCallLog component and the quick-entry form pattern. It also has two entry modes: load-scoped (tab on Load Detail) and fleet-scoped (standalone page).

### File Structure

```
apps/web/app/(dashboard)/loads/[id]/check-calls/
  page.tsx                              # Load-scoped check calls (~120 lines)

apps/web/app/(dashboard)/operations/check-calls/
  page.tsx                              # Fleet-scoped check calls (~180 lines)

apps/web/components/check-calls/
  check-call-list.tsx                   # Chronological list of check calls
  check-call-form.tsx                   # Quick entry form (inline or modal)
  check-call-card.tsx                   # Single check call display card
  check-call-reminder-dialog.tsx        # Schedule next check call reminder
  check-call-overdue-alert.tsx          # Overdue check call warning

apps/web/lib/hooks/check-calls/
  use-check-calls.ts                    # List query (load-scoped or fleet-scoped)
  use-create-check-call.ts             # Create mutation
  use-schedule-reminder.ts              # Schedule next check call
  use-overdue-check-calls.ts            # Overdue loads query
```

### Hooks to Create

| Hook | Endpoint | Purpose |
|------|---------|---------|
| `useCheckCalls(loadId?, filters?)` | GET /api/v1/check-calls | List (scoped or fleet-wide) |
| `useCreateCheckCall()` | POST /api/v1/check-calls | Log new check call |
| `useScheduleReminder()` | POST /api/v1/check-calls/reminders | Set next reminder |
| `useOverdueCheckCalls()` | GET /api/v1/check-calls/overdue | Loads missing check calls |

### Components from Build Order

| Component | Sprint | Status |
|-----------|--------|--------|
| CheckCallLog | T1 | Build |
| LoadStatusBadge | F1 | Build |
| SearchInput | F1 | Build |
| DateRangePicker | F2 | Build |
| TimePicker | F2 | Build |
| Panel | F3 | Build |

### Risk Factors

- **GPS auto-fill:** When a driver has an active tracking device, the check call form should auto-populate lat/lng and location fields. Requires integration with the GPS data source.
- **30-second target:** The spec targets 30 seconds per check call. The form must be optimized for speed: keyboard focus on location field on open, tab-order through fields, Enter to submit.
- **Two entry modes:** The component must work both as a standalone page (fleet-scoped with load search) and as a tab within Load Detail (load-scoped with load pre-filled).

---

## Screen 9: Quote Builder

**Spec:** `dev_docs/12-Rabih-design-Process/03-sales/04-quote-builder.md`
**Route:** `/(dashboard)/quotes/new` and `/(dashboard)/quotes/[id]/edit`
**Pattern:** Form Page -- Dual Mode (Pattern 3)
**Priority:** P0 #7 | **Estimated hours:** 40-60h

### Why Build Ninth

The Quote Builder is the primary revenue-generating screen -- sales agents use it to respond to customer rate requests within 60 seconds. It validates the RateCalculator, LaneSearch, and CurrencyInput components. It introduces the Quick Quote / Full Quote dual-mode pattern.

### File Structure

```
apps/web/app/(dashboard)/quotes/new/
  page.tsx                              # Quote builder container (~150 lines)

apps/web/app/(dashboard)/quotes/[id]/edit/
  page.tsx                              # Edit mode (loads existing quote)

apps/web/components/quotes/
  quote-mode-toggle.tsx                 # Quick Quote / Full Quote tab toggle
  quick-quote-form.tsx                  # Simplified single-page form
  full-quote-form.tsx                   # Multi-section full quote form
  rate-calculator-panel.tsx             # Right panel: live rate calculation
  market-rate-comparison.tsx            # DAT/Truckstop rate comparison widget
  quote-margin-indicator.tsx            # Visual margin gauge
  quote-accessorials-section.tsx        # Accessorial charges picker
  quote-send-dialog.tsx                 # Email quote to customer dialog

apps/web/lib/hooks/quotes/
  use-create-quote.ts                   # Create mutation
  use-update-quote.ts                   # Update mutation
  use-calculate-rate.ts                 # Rate calculation query
  use-market-rates.ts                   # Market rate comparison data
  use-customer-rates.ts                 # Customer-specific contract rates
  use-fuel-surcharge.ts                 # Current FSC rate
  use-accessorial-rates.ts             # Pre-configured accessorial prices
  use-send-quote.ts                     # Send quote via email

apps/web/lib/schemas/
  quote-schema.ts                       # Zod schema for quick + full quote
```

### Hooks to Create

| Hook | Endpoint | Purpose |
|------|---------|---------|
| `useCreateQuote()` | POST /api/v1/quotes | Create new quote |
| `useUpdateQuote()` | PATCH /api/v1/quotes/:id | Update draft quote |
| `useCalculateRate(lane, equipment)` | POST /api/v1/quotes/calculate-rate | Auto-calculate rate |
| `useMarketRates(lane, equipment)` | GET /api/v1/rates/market | DAT/Truckstop comparison |
| `useCustomerRates(customerId, lane)` | GET /api/v1/rates/customer | Contract rate lookup |
| `useFuelSurcharge()` | GET /api/v1/rates/fuel-surcharge | Current FSC rate |
| `useAccessorialRates()` | GET /api/v1/rates/accessorials | Accessorial price list |
| `useSendQuote()` | POST /api/v1/quotes/:id/send | Send quote email |
| `useQuote(id)` | GET /api/v1/quotes/:id | Load existing quote for edit |

### Components from Build Order

| Component | Sprint | Status |
|-----------|--------|--------|
| RateCalculator | T5 | Build |
| QuoteBuilder form | T5 | Build |
| CustomerSelector | T2 | Build |
| LaneSearch | T2 | Build |
| EquipmentSelector | T2 | Build |
| CurrencyInput | F2 | Build |
| DatePicker | F2 | Build |
| Statistic | F1 | Build |
| MultiSelect | F2 | Build |

### Risk Factors

- **60-second Quick Quote target:** The Quick Quote form must be extremely fast. Pre-focus the customer field on open. Auto-calculate rate on lane + equipment selection. Minimize required fields.
- **Rate calculation accuracy:** The rate engine must consider contract rates, rate table matches, and market rates in priority order. If no rate source is available, the agent enters manually.
- **Minimum margin enforcement:** Quotes below the minimum margin (default 12%) must trigger a manager approval workflow. Build the below-margin warning and approval request into the submit flow.
- **Market rate integration:** DAT and Truckstop API integrations may not be available at launch. Build the market rate comparison widget with a graceful fallback (empty state: "Market rates unavailable").

---

## Screen 10: Load Builder

**Spec:** `dev_docs/12-Rabih-design-Process/04-tms-core/07-load-builder.md`
**Route:** `/(dashboard)/loads/new`
**Pattern:** Form Page (Pattern 3)
**Priority:** P0 #10 | **Estimated hours:** 30-40h

### Why Build Tenth

The Load Builder creates loads from orders or from scratch. It reuses many components already built for Order Entry (StopList, CustomerSelector, CarrierSelector, EquipmentSelector) but adds carrier assignment and route optimization features. This is the final screen in the order-to-dispatch chain.

### File Structure

```
apps/web/app/(dashboard)/loads/new/
  page.tsx                              # Load builder page (~180 lines)

apps/web/components/loads/
  load-builder-form.tsx                 # Main form with sections
  load-order-linker.tsx                 # Link load to existing order(s)
  load-route-optimizer.tsx              # Route optimization widget
  load-carrier-section.tsx              # Carrier assignment section
  load-rate-breakdown.tsx               # Rate breakdown with margin

apps/web/lib/hooks/loads/
  use-create-load.ts                    # Create load mutation
  use-optimize-route.ts                 # Route optimization query
  use-load-from-order.ts               # Pre-fill from order conversion
  use-clone-load.ts                     # Pre-fill from clone action

apps/web/lib/schemas/
  load-builder-schema.ts                # Zod schema for load creation
```

### Hooks to Create

| Hook | Endpoint | Purpose |
|------|---------|---------|
| `useCreateLoad()` | POST /api/v1/loads | Create new load |
| `useOptimizeRoute(stops)` | POST /api/v1/loads/optimize-route | Multi-stop optimization |
| `useLoadFromOrder(orderId)` | GET /api/v1/orders/:id | Pre-fill from order |
| `useCloneLoad(loadId)` | GET /api/v1/loads/:id | Pre-fill from clone |
| `useAvailableCarriers(lane, equip)` | GET /api/v1/carriers?available=true | Carrier suggestions |

### Components from Build Order

| Component | Sprint | Status |
|-----------|--------|--------|
| StopList | T2 | Build |
| CustomerSelector | T2 | Build |
| CarrierSelector | T2 | Build |
| EquipmentSelector | T2 | Build |
| CurrencyInput | F2 | Build |
| DatePicker | F2 | Build |
| TimePicker | F2 | Build |
| AddressAutocomplete | Exists | Reuse |
| Panel | F3 | Build |

### Risk Factors

- **Order-to-load conversion:** When creating a load from an order, all order data must map correctly to load fields. Test field mapping edge cases: orders with multiple commodities, orders with hazmat flags, orders with accessorials.
- **Route optimization:** The optimize endpoint may not exist yet. Build the UI with a "Suggest Route" button that gracefully handles both success and "not available" states.
- **Multi-order loads:** A single load can consolidate multiple orders (LTL). The Load Builder must support linking multiple orders and showing consolidated stop lists.

---

## Summary Table

| # | Screen | Pattern | Hours | Components Needed | Highest Risk |
|---|--------|---------|-------|------------------|-------------|
| 1 | Operations Dashboard | Dashboard | 25-40h | 7 | WebSocket setup |
| 2 | Orders List | List | 20-30h | 6 | DataGrid first use |
| 3 | Loads List | List | 20-30h | 4 | LoadCard mobile reuse |
| 4 | Order Entry | Form (Wizard) | 40-60h | 11 | 58-field validation |
| 5 | Load Detail | Detail (3-col) | 40-60h | 14 | Tab-scoped loading |
| 6 | Dispatch Board | Board | 60-90h | 12 | Drag-drop performance |
| 7 | Tracking Map | Map | 40-60h | 7 | Map provider costs |
| 8 | Check Calls | List+Form | 20-30h | 6 | 30-second speed target |
| 9 | Quote Builder | Form (Dual) | 40-60h | 9 | Rate engine accuracy |
| 10 | Load Builder | Form | 30-40h | 9 | Multi-order loads |
| **Total** | | | **335-500h** | **47 unique** | |

**Calendar estimate:** 8-13 weeks with 1 developer, 5-8 weeks with 2 developers, 4-6 weeks with 3 developers. These estimates include component building time from the Component Build Order.

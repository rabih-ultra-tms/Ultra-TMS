# 07 - Real-Time Feature Map

> Maps which screens need real-time updates via WebSocket, which use polling, and which are static. Defines the WebSocket architecture, event catalog, optimistic update strategy, and graceful degradation plan.

---

## Overview

Ultra TMS uses a tiered real-time strategy to keep the UI current without overwhelming the server or client. Not every screen needs live data -- a dispatch board demands sub-second updates while a settings page can be entirely static.

**Technology:** Socket.io over WebSocket with automatic fallback to long-polling.

**Namespaces:**

| Namespace | Purpose | Primary Consumers |
|-----------|---------|-------------------|
| `/dispatch` | Load assignment, status changes, carrier responses | Dispatch Board, Load Detail, Order Detail |
| `/tracking` | GPS location, ETA, check calls, stop events | Tracking Map, Load Detail, Stop Management |
| `/notifications` | System notifications, alerts, compliance warnings | Notification Center, all screens (toast overlay) |

**Event Naming Convention:** `entity:action` or `entity:sub-entity:action`

Examples:
- `load:status:changed`
- `load:location:updated`
- `order:created`
- `checkcall:received`
- `notification:new`

---

## Real-Time Levels

Each screen is assigned one of four real-time levels:

| Level | Description | Update Mechanism | Target Latency |
|-------|-------------|-----------------|----------------|
| **Critical Real-Time** | Must have WebSocket; core functionality depends on live data | WebSocket (required) | < 2 seconds |
| **Enhanced Real-Time** | Benefits significantly from WebSocket but works without it | WebSocket (preferred) + polling fallback | < 5 seconds |
| **Polling** | Periodic refresh is sufficient; data changes less frequently | Polling at fixed intervals | 15-60 seconds |
| **Static** | No automatic refresh needed; data changes only on user action | Manual refresh / navigation | N/A |

---

## Screen-by-Screen Real-Time Map

### Critical Real-Time Screens

These screens **require** WebSocket connections to function properly. If WebSocket is unavailable, aggressive polling is used as a fallback.

| Screen | Route | Namespace | WebSocket Events | What Updates Live | Polling Fallback | Notes |
|--------|-------|-----------|-----------------|-------------------|-----------------|-------|
| Dispatch Board | `/operations/dispatch` | `/dispatch` | `load:created`, `load:status:changed`, `load:dispatched`, `load:assigned`, `load:updated` | Load cards move between columns (unassigned, tendered, accepted, in-transit, delivered); new loads appear; carrier assignment reflected instantly | 10s interval | Primary dispatcher workspace; must feel instant. Stale data causes double-booking. |
| Tracking Map | `/operations/tracking` | `/tracking` | `load:location:updated`, `load:eta:updated`, `checkcall:received`, `stop:arrived`, `stop:departed` | Map markers move in real time; ETA recalculates; stop status badges update; geofence arrival/departure fires | 15s interval | Map pins animate between positions. Cluster/uncluster as zoom changes. |
| Notification Center | `/notifications` | `/notifications` | `notification:new`, `carrier:compliance:alert`, `carrier:insurance:expiring` | New notifications appear at top of list; unread badge count increments; toast notifications pop up | 30s interval | Global overlay accessible from any screen. Bell icon badge updates everywhere. |

### Enhanced Real-Time Screens

These screens are **significantly better** with WebSocket but remain functional using polling alone.

| Screen | Route | Namespace | WebSocket Events | What Updates Live | Polling Fallback | Notes |
|--------|-------|-----------|-----------------|-------------------|-----------------|-------|
| Operations Dashboard | `/dashboard` (ops roles) | `/dispatch`, `/tracking` | `load:status:changed`, `load:created`, `order:created`, `order:status:changed` | KPI counters (active loads, in-transit, exceptions) update in place; recent activity feed appends new items | 30s interval | Dashboard widgets update independently. Only active KPI tiles refresh. |
| Load Detail | `/operations/loads/:id` | `/dispatch`, `/tracking` | `load:status:changed`, `load:assigned`, `load:location:updated`, `load:eta:updated`, `checkcall:received`, `stop:arrived`, `stop:departed` | Status badge changes; carrier assignment section updates; location/ETA section refreshes; check call timeline appends; stop statuses update | 30s interval | Only subscribes to events for the specific load being viewed. Unsubscribes on navigate away. |
| Order Detail | `/operations/orders/:id` | `/dispatch` | `order:status:changed`, `order:updated`, `load:status:changed`, `load:created` | Order status updates; linked loads section reflects new loads or status changes | 30s interval | Subscribes to events for this order and all its child loads. |
| Load List | `/operations/loads` | `/dispatch` | `load:created`, `load:status:changed` | New loads appear in list (if matching current filters); status column updates | 30s interval | Debounces updates to avoid list flickering. Batches multiple events into single re-render. |
| Order List | `/operations/orders` | `/dispatch` | `order:created`, `order:status:changed` | New orders appear; status badges update in-place | 30s interval | Same debounce/batch strategy as Load List. |
| Check Call Log | `/operations/loads/:id/checkcalls` | `/tracking` | `checkcall:received` | New check calls prepend to timeline | 30s interval | Only for check calls on the currently-viewed load. |
| Stop Management | `/operations/loads/:id/stops` | `/tracking` | `stop:arrived`, `stop:departed`, `load:eta:updated` | Stop status badges transition (en route -> arrived -> departed); ETA column updates | 30s interval | Visual indicator shows which stop is "active". |

### Polling Screens

These screens use periodic background polling. WebSocket events are not subscribed to directly, though the global notification overlay still functions.

| Screen | Route | Polling Interval | What Refreshes | Notes |
|--------|-------|-----------------|----------------|-------|
| Customer List | `/crm/customers` | 60s | Row data, status indicators | Low-change data; manual refresh button also available |
| Lead List | `/crm/leads` | 60s | Lead status, last activity | Sales-oriented; changes are infrequent |
| Quote List | `/sales/quotes` | 60s | Quote status, expiration countdown | Countdown timer runs client-side between polls |
| Carrier Directory | `/carriers` | 60s | Compliance status badges | Badge color may change if compliance alert fires |
| Carrier Scorecard | `/carriers/:id/scorecard` | 120s | Score values, trend charts | Historical data; rarely changes in real time |
| Compliance Dashboard | `/carriers/compliance` | 60s | Compliance flags, expiration dates | May flash alert if `carrier:compliance:alert` arrives via notification namespace |
| Insurance Tracking | `/carriers/insurance` | 60s | Expiration dates, status flags | Same as compliance; alert via notification |
| Invoice List (AR) | `/accounting/invoices` | 60s | Payment status, aging bucket | Financial data; changes on payment receipt |
| Carrier Pay (AP) | `/accounting/carrier-pay` | 60s | Settlement status | Changes when settlements are approved/paid |
| Settlement Detail | `/accounting/settlements/:id` | 60s | Status, line items | Usually viewed during active review |
| Aging Reports | `/accounting/aging` | 120s | Aging buckets, totals | Report data; recalculated periodically |
| Operations Reports | `/reports/operations` | 120s | Report data, charts | Historical/aggregated data |
| Financial Reports | `/reports/financial` | 120s | Report data, charts | Same as operations reports |
| Sales Reports | `/reports/sales` | 120s | Pipeline, win rates | Aggregated metrics |
| Carrier Reports | `/reports/carriers` | 120s | Performance metrics | Aggregated from scorecard data |
| Audit Log | `/admin/audit-log` | 60s | New log entries | Admin-only; append-only data |

### Static Screens

These screens load data once and do not auto-refresh. Changes are triggered only by user actions (form submissions, navigation).

| Screen | Route | Notes |
|--------|-------|-------|
| New Order Form | `/operations/orders/new` | Form state is local until submission |
| Edit Order Form | `/operations/orders/:id/edit` | Loads data once; warns if stale on save (optimistic lock) |
| New Load Form | `/operations/loads/new` | Same as order form |
| Edit Load Form | `/operations/loads/:id/edit` | Stale check on save via `updatedAt` comparison |
| New Quote Form | `/sales/quotes/new` | Local form state |
| Edit Quote Form | `/sales/quotes/:id/edit` | Stale check on save |
| New Customer Form | `/crm/customers/new` | Local form state |
| Edit Customer Form | `/crm/customers/:id/edit` | Stale check on save |
| Carrier Onboarding Form | `/carriers/onboarding/new` | Multi-step wizard; local state |
| New Invoice Form | `/accounting/invoices/new` | Local form state |
| User Management | `/admin/users` | Low-change admin data; manual refresh |
| Role Management | `/admin/roles` | Configuration data; rarely changes |
| Tenant Settings | `/admin/settings` | Configuration; manual save |
| Integrations | `/admin/integrations` | Setup screens; static |
| Workflow Rules | `/admin/workflows` | Rule configuration; static |
| Platform Config | `/admin/platform` | Super Admin only; static |
| My Profile | `/settings/profile` | User edits their own data |
| Notification Preferences | `/settings/notifications` | User configuration |

---

## WebSocket Event Catalog

Complete list of all WebSocket events used across the system.

### Dispatch Namespace (`/dispatch`)

| Event | Payload Summary | Emitted When | Consumed By |
|-------|----------------|-------------|-------------|
| `load:created` | `{ loadId, orderId, status, origin, destination, pickupDate }` | A new load is created from an order | Dispatch Board, Load List, Order Detail, Dashboard |
| `load:updated` | `{ loadId, changedFields }` | Any load field is updated (non-status) | Dispatch Board, Load Detail |
| `load:status:changed` | `{ loadId, previousStatus, newStatus, changedBy, timestamp }` | Load status transitions (e.g., Pending -> Dispatched -> In Transit -> Delivered) | Dispatch Board, Load List, Load Detail, Order Detail, Dashboard |
| `load:dispatched` | `{ loadId, carrierId, carrierName, dispatchedBy, timestamp }` | Load is dispatched / tendered to a carrier | Dispatch Board, Load Detail |
| `load:assigned` | `{ loadId, carrierId, carrierName, driverId, driverName }` | Carrier/driver is assigned (after tender acceptance) | Dispatch Board, Load Detail |
| `order:created` | `{ orderId, customerId, customerName, status }` | A new order is created | Order List, Dashboard |
| `order:updated` | `{ orderId, changedFields }` | Any order field is updated (non-status) | Order Detail |
| `order:status:changed` | `{ orderId, previousStatus, newStatus, changedBy, timestamp }` | Order status transitions | Order List, Order Detail, Dashboard |

### Tracking Namespace (`/tracking`)

| Event | Payload Summary | Emitted When | Consumed By |
|-------|----------------|-------------|-------------|
| `load:location:updated` | `{ loadId, lat, lng, heading, speed, timestamp, source }` | New GPS position received (ELD, driver app, or manual) | Tracking Map, Load Detail |
| `load:eta:updated` | `{ loadId, stopId, previousEta, newEta, reason }` | ETA recalculated based on new position or traffic | Tracking Map, Load Detail, Stop Management |
| `checkcall:received` | `{ loadId, checkCallId, type, location, notes, timestamp, source }` | A check call is logged (auto or manual) | Load Detail, Check Call Log, Tracking Map |
| `stop:arrived` | `{ loadId, stopId, stopType, arrivedAt, geofenceTriggered }` | Vehicle arrives at a stop (geofence or manual) | Tracking Map, Load Detail, Stop Management |
| `stop:departed` | `{ loadId, stopId, stopType, departedAt }` | Vehicle departs from a stop | Tracking Map, Load Detail, Stop Management |

### Notifications Namespace (`/notifications`)

| Event | Payload Summary | Emitted When | Consumed By |
|-------|----------------|-------------|-------------|
| `notification:new` | `{ notificationId, type, title, message, severity, targetRoles[], targetUsers[], link }` | Any system notification is generated | Notification Center, global toast overlay |
| `carrier:compliance:alert` | `{ carrierId, carrierName, alertType, details, severity }` | Carrier compliance issue detected (expired docs, authority revoked, safety rating change) | Notification Center, Compliance Dashboard (via toast) |
| `carrier:insurance:expiring` | `{ carrierId, carrierName, insuranceType, expirationDate, daysRemaining }` | Carrier insurance within 30/15/7/1 day(s) of expiration | Notification Center, Insurance Tracking (via toast) |

---

## Subscription Management

### Room-Based Subscriptions

Socket.io rooms are used to scope events to relevant subscribers:

| Room Pattern | Example | Who Joins | Purpose |
|-------------|---------|-----------|---------|
| `tenant:{tenantId}` | `tenant:abc123` | All connected users of a tenant | Tenant-scoped broadcasts |
| `load:{loadId}` | `load:LD-2024-00542` | Users viewing a specific load detail | Load-specific events |
| `order:{orderId}` | `order:ORD-2024-01234` | Users viewing a specific order detail | Order-specific events |
| `role:{role}` | `role:dispatcher` | All users with a given role | Role-targeted notifications |
| `user:{userId}` | `user:usr_789` | A specific user | Direct/personal notifications |

### Lifecycle

1. **Connect** - Client connects to the relevant namespace(s) on page load or app initialization
2. **Join Rooms** - Client joins tenant room automatically; joins entity rooms when navigating to detail screens
3. **Leave Rooms** - Client leaves entity rooms when navigating away from detail screens
4. **Disconnect** - Clean disconnect on logout or tab close; server cleans up stale connections after timeout

### Connection Limits

- Each client maintains at most **3 namespace connections** (dispatch, tracking, notifications)
- Namespaces are connected lazily: only when the user navigates to a screen that needs them
- The `/notifications` namespace connects on app load for all authenticated users
- `/dispatch` connects when any operations screen is visited
- `/tracking` connects when tracking map or load detail with location is visited

---

## Optimistic Updates

Certain user-initiated mutations should update the UI **immediately** before the server confirms the change. This provides a snappy, responsive feel. If the server rejects the change, the UI rolls back and shows an error.

### Optimistic Update Candidates

| Action | Screen(s) | Optimistic Behavior | Rollback Behavior |
|--------|-----------|---------------------|-------------------|
| Change load status | Dispatch Board, Load Detail | Card immediately moves to new column / status badge updates | Card moves back to original column; toast error: "Status update failed" |
| Assign carrier to load | Dispatch Board, Load Detail | Carrier name appears on load card; load moves to "Tendered" | Carrier name removed; load returns to "Unassigned"; error toast |
| Submit check call | Check Call Log, Load Detail | Check call appears in timeline with "sending..." indicator | Check call removed from timeline; error toast |
| Mark stop arrived/departed | Stop Management, Load Detail | Stop badge transitions to Arrived/Departed | Badge reverts; error toast |
| Create new order | Order List | New order row appears at top of list with "saving..." state | Row removed; error toast |
| Update load notes | Load Detail | Notes field updates immediately | Reverts to previous value; error toast |
| Acknowledge notification | Notification Center | Notification moves to "read" state; badge count decrements | Notification returns to "unread"; badge count re-increments |

### Optimistic Update Implementation Pattern

```
// Conceptual pattern (not literal code)

1. User triggers action (e.g., clicks "Mark as In Transit")
2. Dispatch optimistic update to local state immediately
3. Show visual feedback (status changes, card moves)
4. Send mutation to server API
5a. Server confirms (200 OK):
    - Local state already correct; no further action
    - Server also emits WebSocket event; other clients update
5b. Server rejects (4xx/5xx):
    - Roll back local state to pre-mutation snapshot
    - Show error toast with reason from server
    - Log rollback event for debugging
```

### Actions That Are NOT Optimistic

These actions are too consequential or irreversible to show before server confirmation:

| Action | Reason |
|--------|--------|
| Cancel order | Destructive; requires confirmation modal and server-side validation |
| Cancel load | Destructive; may trigger carrier notification |
| Void invoice | Financial; cannot be shown optimistically |
| Approve settlement / issue payment | Financial; requires server-side authorization |
| Delete any record | Destructive; must confirm server-side |
| Carrier tender (send to external) | External side effect; must confirm delivery |
| Split / merge loads | Complex server logic; result is unpredictable client-side |

---

## Graceful Degradation

When WebSocket connections fail or are unavailable, the system degrades gracefully to polling-based updates. Users are informed of the degraded state but can continue working.

### Degradation Tiers

| Tier | Condition | Behavior |
|------|-----------|----------|
| **Tier 0: Full Real-Time** | WebSocket connected on all namespaces | All screens receive instant updates; no polling active |
| **Tier 1: Partial Real-Time** | Some namespaces connected, others failed | Connected namespaces work normally; failed ones fall back to polling |
| **Tier 2: Polling Only** | No WebSocket connections available | All screens use polling at tier-appropriate intervals |
| **Tier 3: Manual Only** | Polling also fails (network issues) | User sees "Connection lost" banner; manual refresh only; offline queue for mutations |

### Polling Fallback Intervals by Screen Criticality

When WebSocket is unavailable, screens fall back to polling at intervals based on their real-time level:

| Real-Time Level | Polling Interval (Degraded) | Polling Interval (Normal, no WS) | Notes |
|-----------------|---------------------------|--------------------------------|-------|
| Critical Real-Time | 10 seconds | 15 seconds | Aggressive polling to compensate for missing WebSocket |
| Enhanced Real-Time | 30 seconds | 30 seconds | Same as normal polling |
| Polling | 60 seconds | 60-120 seconds | Standard intervals; no change |
| Static | No polling | No polling | No change; always manual |

### Reconnection Strategy

When a WebSocket connection drops, the client follows this reconnection sequence:

```
Attempt 1: Immediate reconnect (0s delay)
Attempt 2: After 1 second
Attempt 3: After 2 seconds
Attempt 4: After 4 seconds
Attempt 5: After 8 seconds
Attempt 6: After 16 seconds
Attempt 7+: Every 30 seconds (cap)

After 5 minutes of failed reconnection:
  - Show persistent "Real-time updates unavailable" banner
  - Switch to polling mode for all screens
  - Continue reconnection attempts in background at 30s interval

On successful reconnect:
  - Dismiss banner
  - Rejoin all previously-joined rooms
  - Request "catch-up" events since last known timestamp
  - Disable polling fallbacks as WebSocket takes over
```

### User-Facing Indicators

| State | Visual Indicator | Location |
|-------|-----------------|----------|
| Connected (real-time active) | Small green dot next to "Live" label | Top-right status bar |
| Reconnecting | Pulsing yellow dot; "Reconnecting..." text | Top-right status bar |
| Disconnected (polling fallback) | Orange dot; "Updates may be delayed" text | Top-right status bar; subtle banner on critical screens |
| Fully offline | Red banner: "Connection lost. Some features may not work." | Full-width banner below top nav |

### Catch-Up Mechanism

When reconnecting after a disconnection, the client must "catch up" on events missed during the outage:

1. Client stores `lastEventTimestamp` for each namespace
2. On reconnect, client emits `sync:request` with `{ lastEventTimestamp, rooms[] }`
3. Server responds with `sync:response` containing all events since that timestamp (capped at 100 events or 5 minutes, whichever is smaller)
4. Client applies events sequentially to update local state
5. If gap is too large (> 5 minutes), server responds with `sync:full-refresh-required`
6. Client triggers a full data reload for the active screen instead of applying individual events

### Offline Mutation Queue

When the client is fully offline (Tier 3), user-initiated mutations are queued locally:

| Behavior | Detail |
|----------|--------|
| Queue storage | IndexedDB (persists across page reloads) |
| Queue limit | 50 mutations maximum |
| Mutation types queued | Check calls, status updates, notes, document uploads (metadata only) |
| Mutation types NOT queued | Financial actions, deletions, carrier tenders (too consequential) |
| On reconnect | Queue is processed in order; conflicts are flagged for user resolution |
| Conflict resolution | Server returns `409 Conflict` if entity state has changed; user sees diff and chooses |

---

## Portal Real-Time Behavior

### Customer Portal

| Screen | Real-Time Level | Mechanism | Events | Notes |
|--------|----------------|-----------|--------|-------|
| Dashboard | Polling | 60s poll | N/A | Summary KPIs; low urgency |
| Order List | Polling | 60s poll | N/A | Status column refreshes |
| Order Detail | Enhanced Real-Time | WebSocket `/dispatch` | `order:status:changed` | Customer sees status updates live |
| Tracking | Critical Real-Time | WebSocket `/tracking` | `load:location:updated`, `load:eta:updated`, `stop:arrived`, `stop:departed` | Simplified map view; same real-time requirement as internal |
| Invoices | Polling | 120s poll | N/A | Payment status updates |
| Documents | Static | Manual | N/A | Downloads only |

### Carrier Portal

| Screen | Real-Time Level | Mechanism | Events | Notes |
|--------|----------------|-----------|--------|-------|
| Dashboard | Polling | 60s poll | N/A | Load summary and payment status |
| Available Loads | Enhanced Real-Time | WebSocket `/dispatch` | `load:created`, `load:assigned` | New tenders appear live; assigned loads disappear from available |
| My Loads | Enhanced Real-Time | WebSocket `/dispatch` | `load:status:changed` | Status column updates |
| Load Detail | Enhanced Real-Time | WebSocket `/dispatch`, `/tracking` | `load:status:changed`, `load:eta:updated`, `stop:arrived`, `stop:departed` | Driver-facing detail with stop info |
| Check Calls | Enhanced Real-Time | WebSocket `/tracking` | `checkcall:received` | Confirms their own submissions; shows dispatcher-entered calls |
| Settlements | Polling | 120s poll | N/A | Payment status updates |
| Documents | Static | Manual | N/A | Upload/download only |

---

## Performance Considerations

### Event Throttling

To prevent UI overload on busy screens:

| Event Type | Throttle Strategy | Interval |
|------------|-------------------|----------|
| `load:location:updated` | Throttle per load | Max 1 update per 5 seconds per load on map; 15 seconds on detail |
| `load:status:changed` | No throttle | Every status change matters; apply immediately |
| `notification:new` | Batch | Accumulate for 2 seconds, then render batch |
| List updates (load:created, etc.) | Debounce | Wait 3 seconds after last event before re-rendering list |

### Bandwidth Optimization

| Strategy | Detail |
|----------|--------|
| Delta payloads | Events contain only changed fields, not full entity |
| Namespace lazy loading | Only connect to namespaces needed by current screen |
| Room-based scoping | Server only sends events to rooms the client has joined |
| Compression | Socket.io `perMessageDeflate` enabled for production |
| Binary protocol | Location updates use binary encoding for lat/lng/heading/speed |

### Memory Management

| Concern | Mitigation |
|---------|------------|
| Event listener accumulation | Unsubscribe from events and leave rooms on component unmount |
| Location history buffer | Keep max 100 location points per load in memory; older points discarded |
| Notification list | Keep max 200 notifications in memory; paginate for older |
| Reconnection timer cleanup | Clear all timers on intentional disconnect (logout, navigation) |

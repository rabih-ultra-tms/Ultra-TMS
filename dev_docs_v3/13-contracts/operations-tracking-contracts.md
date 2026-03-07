# Operations & Tracking Screen-to-API Contracts

> Verified from hook source code on 2026-03-07

---

## Operations Dashboard

**Source:** `apps/web/lib/hooks/tms/use-ops-dashboard.ts`

All endpoints are under `/operations/dashboard/` and use `@CurrentTenant()` and `@CurrentUser()` decorators on the backend.

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useOpsDashboardKpis` | GET | `/operations/dashboard/kpis?period=&scope=&comparisonPeriod=` | URLSearchParams | `DashboardKPIs` (unwrapped) |
| `useOpsDashboardCharts` | GET | `/operations/dashboard/charts?period=` | URLSearchParams | `ChartData[]` (unwrapped) |
| `useOpsDashboardAlerts` | GET | `/operations/dashboard/alerts` | -- | `Alert[]` (unwrapped) |
| `useOpsDashboardActivity` | GET | `/operations/dashboard/activity?limit=` | URLSearchParams | `Activity[]` (unwrapped) |
| `useOpsDashboardNeedsAttention` | GET | `/operations/dashboard/needs-attention` | -- | `NeedsAttention[]` (unwrapped) |

### Ops Dashboard Cache Keys

```typescript
["ops-dashboard", "kpis", params]
["ops-dashboard", "charts", params]
["ops-dashboard", "alerts"]
["ops-dashboard", "activity", limit]
["ops-dashboard", "needs-attention"]
```

---

## Dispatch Board (REST)

**Source:** `apps/web/lib/hooks/tms/use-dispatch.ts`

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useDispatchBoard` | GET | `/loads/board?status=&carrierId=&equipmentType=&fromDate=&toDate=` | URLSearchParams | `DispatchBoardData` (unwrapped) |
| `useAssignCarrier` | PATCH | `/loads/:loadId/assign` | `{ carrierId }` | `Load` (unwrapped) |
| `useUpdateLoadStatus` | PATCH | `/loads/:loadId/status` | `{ status }` | `Load` (unwrapped) |

### Dispatch Board Cache Keys

```typescript
["dispatch-board", params]
["loads"]  // invalidated on assign/status change
```

---

## Dispatch Board (WebSocket)

**Source:** `apps/web/lib/hooks/tms/use-dispatch-ws.ts`

**STATUS:** WebSocket gateway NOT BUILT YET (QS-001 task). The hooks exist but connect to a namespace that does not have a backend gateway.

### Target WebSocket Contract

```typescript
// Target namespace: ws://localhost:3001/dispatch
// Connection: uses auth token from cookie

// Server -> Client events:
socket.on('load-assigned', (data: { loadId: string, carrierId: string, carrier: Carrier }) => {});
socket.on('load-unassigned', (data: { loadId: string }) => {});
socket.on('load-status-changed', (data: { loadId: string, status: string, previousStatus: string }) => {});
socket.on('board-update', (data: { loads: Load[] }) => {});

// Client -> Server events:
socket.emit('subscribe-board', { filters: DispatchFilters });
socket.emit('unsubscribe-board', {});
socket.emit('assign-carrier', { loadId: string, carrierId: string });
```

### Hooks Provided

| Hook | Purpose | Backend Status |
|------|---------|----------------|
| `useDispatchSocket` | Connects to `/dispatch` namespace | No gateway |
| `useDispatchBoardUpdates` | Listens for `board-update` events | No gateway |
| `useDispatchAssign` | Emits `assign-carrier` via WebSocket | No gateway |

---

## Tracking Map (REST)

**Source:** `apps/web/lib/hooks/tms/use-tracking.ts`

**IMPORTANT:** Tracking uses `/loads` endpoint with status filters for position data, NOT `/tms/tracking`.

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useTrackingLoads` | GET | `/loads?status=IN_TRANSIT&status=DISPATCHED` | URLSearchParams | `{ data: Load[], pagination }` (unwrapped, mapped to positions) |
| `useTrackingLoad` | GET | `/loads/:loadId` | -- | `Load` (unwrapped, with position data) |

### Position Data Mapping

```typescript
// Loads are mapped to tracking positions:
{
  loadId: load.id,
  lat: load.lastKnownLat,
  lng: load.lastKnownLng,
  timestamp: load.lastPositionUpdate,
  speed: load.currentSpeed,
  heading: load.currentHeading,
  status: load.status,
  carrier: load.carrier,
  origin: load.stops[0],
  destination: load.stops[load.stops.length - 1],
}
```

### Tracking Cache Keys

```typescript
["tracking-loads", params]
["tracking-load", loadId]
```

---

## Tracking Map (WebSocket)

**Source:** `apps/web/lib/hooks/tms/use-tracking.ts`

**STATUS:** WebSocket gateway NOT BUILT YET (QS-001 task). The hooks exist but connect to a namespace that does not have a backend gateway.

### Target WebSocket Contract

```typescript
// Target namespace: ws://localhost:3001/tracking
// Connection: uses auth token from cookie

// Server -> Client events:
socket.on('position-update', (data: {
  loadId: string,
  lat: number,
  lng: number,
  timestamp: string,
  speed?: number,
  heading?: number,
}) => {});

socket.on('status-change', (data: {
  loadId: string,
  status: string,
  previousStatus: string,
  timestamp: string,
}) => {});

socket.on('eta-update', (data: {
  loadId: string,
  eta: string,
  nextStopId: string,
}) => {});

// Client -> Server events:
socket.emit('subscribe-load', { loadId: string });
socket.emit('unsubscribe-load', { loadId: string });
socket.emit('subscribe-all', {});
socket.emit('unsubscribe-all', {});
```

---

## Notifications (WebSocket)

**STATUS:** WebSocket gateway NOT BUILT YET (QS-001 task).

### Target WebSocket Contract

```typescript
// Target namespace: ws://localhost:3001/notifications

// Server -> Client events:
socket.on('notification', (data: Notification) => {});
socket.on('unread-count', (data: { count: number }) => {});

// Client -> Server events:
socket.emit('mark-read', { notificationId: string });
socket.emit('mark-all-read', {});
```

### REST Fallback (exists)

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useNotifications` | GET | `/communication/notifications?page=&limit=` | URLSearchParams | `{ data: Notification[], pagination }` |
| `useUnreadCount` | GET | `/communication/notifications/unread-count` | -- | `{ count: number }` (**DIVERGENT: not wrapped in `{ data }`**) |
| `useMarkRead` | PATCH | `/communication/notifications/:id/read` | -- | `Notification` (unwrapped) |

### Notification Cache Keys

```typescript
["notifications", "list", params]
["notifications", "unread-count"]
```

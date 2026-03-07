# useTracking (TMS)

**File:** `apps/web/lib/hooks/tms/use-tracking.ts`
**LOC:** 273

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useTrackingData` | `(loadId: string) => UseQueryResult<TrackingData>` |
| `useTrackingHistory` | `(loadId: string, params?: TrackingHistoryParams) => UseQueryResult<TrackingPoint[]>` |
| `useUpdatePosition` | `() => UseMutationResult<void, Error, { loadId: string; position: Position }>` |
| `useTrackingLiveUpdates` | `(loadId: string) => { position: Position | null; isConnected: boolean }` |
| `useGeofenceAlerts` | `(loadId: string) => UseQueryResult<GeofenceAlert[]>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useTrackingData | GET | /tracking/:loadId | TrackingData |
| useTrackingHistory | GET | /tracking/:loadId/history | TrackingPoint[] |
| useUpdatePosition | POST | /tracking/:loadId/position | void |
| useGeofenceAlerts | GET | /tracking/:loadId/geofence-alerts | GeofenceAlert[] |
| useTrackingLiveUpdates | WS | /tracking namespace | Position (via events) |

## Envelope Handling

Returns raw apiClient responses. No explicit envelope unwrap.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["tracking", loadId]` | default | `!!loadId` |
| `["tracking", loadId, "history", params]` | default | `!!loadId` |
| `["tracking", loadId, "geofence-alerts"]` | default | `!!loadId` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useUpdatePosition | POST /tracking/:loadId/position | tracking data | No |

## WebSocket Integration

`useTrackingLiveUpdates` connects to the `/tracking` WebSocket namespace. Listens for:

- `position:update` -- updates local position state and invalidates tracking query
- `geofence:enter` -- invalidates geofence alerts
- `geofence:exit` -- invalidates geofence alerts

Uses `useState` for real-time position rather than React Query cache for instant map updates.

## Quality Assessment

- **Score:** 6/10
- **Anti-patterns:**
  - WebSocket namespace `/tracking` may not exist on backend yet (QS-001 task)
  - `useTrackingLiveUpdates` mixes WebSocket state with React state -- should use `setQueryData` for consistency
  - No `refetchInterval` fallback when WebSocket is disconnected
  - GPS position updates via POST mutation seem inverted -- typically the server pushes positions, not the frontend
  - No debouncing on position updates
- **Dependencies:** `apiClient`, `useSocket` from `@/lib/socket/socket-provider`, `useQueryClient`

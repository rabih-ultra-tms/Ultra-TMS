# TrackingMap

**File:** `apps/web/components/tms/tracking/tracking-map.tsx`
**LOC:** 761

## Props Interface

Internally manages its own state. No external props required (reads from hooks).

## Behavior

Full-screen Google Maps component for real-time load tracking. The most complex tracking component.

### Features

1. **Color-coded markers** by ETA status:
   - `on-time` -- Green (`bg-emerald-500`)
   - `tight` -- Yellow (`bg-amber-500`)
   - `at-risk` -- Red (`bg-red-500`)
   - `stale` -- Gray (`bg-gray-400`)

2. **Hover tooltip**: Load summary on marker hover
3. **Click -> InfoWindow**: Popup with load details via `TrackingPinPopup` (120 LOC)
4. **Detail side panel**: Sheet component with full load info via `TrackingSidebar` (258 LOC)
5. **Real-time updates**:
   - WebSocket for position updates via `useTrackingPositions`
   - 15-second polling fallback when WebSocket is disconnected
6. **Toolbar**: Status filter buttons + search input

### Sub-Components

- `TrackingPinPopup` (120 LOC) -- InfoWindow content for a clicked marker
- `TrackingSidebar` (258 LOC) -- Side panel with load list, filters, and detail view

### Map Configuration

```typescript
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };
```

Uses `@react-google-maps/api` with `useJsApiLoader` for Maps API.

## Used By

- `/tracking` page (full-screen tracking view)
- Dispatch board (embedded view)

## Dependencies

- `@react-google-maps/api` (GoogleMap, Marker, InfoWindow, useJsApiLoader)
- `@/lib/google-maps` (GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES)
- `@/lib/hooks/tms/use-tracking` (useTrackingPositions, useLoadTrackingDetail, ETA types)
- `@/components/ui/` (Button, Input, Badge, Sheet, ScrollArea, Skeleton)
- `sonner` (toast notifications)
- Lucide icons

## Accessibility

- Search input for finding specific loads
- Status filter buttons for filtering by ETA status
- Sheet dialog for load details

## Known Issues

Depends on `GOOGLE_MAPS_API_KEY` environment variable. Map will not render without a valid key.

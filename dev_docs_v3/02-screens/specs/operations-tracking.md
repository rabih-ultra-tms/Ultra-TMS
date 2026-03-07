# Operations Tracking Map

**Route:** `/operations/tracking`
**File:** `apps/web/app/(dashboard)/operations/tracking/page.tsx`
**LOC:** 33
**Status:** Complete

## Data Flow

- **Hooks:** None in page.tsx -- all inside TrackingMap component
- **API calls:** Via WebSocket `/tracking` namespace (real-time GPS positions)
- **Envelope:** Unknown from page.tsx

## UI Components

- **Pattern:** Custom (SocketProvider wrapper around TrackingMap)
- **Key components:** SocketProvider (`lib/socket/socket-provider` namespace=SOCKET_NAMESPACES.TRACKING), TrackingMap (`components/tms/tracking/tracking-map`)
- **Interactive elements:** All inside TrackingMap (Google Maps, markers, InfoWindows, sidebar).

## State Management

- **URL params:** None
- **React Query keys:** None in page.tsx

## Quality Assessment

- **Score:** 7/10 (for wrapper quality)
- **Bugs:** None
- **Anti-patterns:** None -- clean server component with metadata and SocketProvider
- **Missing:** Has Next.js `metadata` export. WebSocket connection established via SocketProvider. Full assessment requires reading TrackingMap component. Architecture documented in file header comments (15s polling fallback when WS down).

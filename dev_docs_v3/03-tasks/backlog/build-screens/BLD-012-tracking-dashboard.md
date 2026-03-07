# BLD-012: Tracking Dashboard

**Priority:** P0
**Service:** TMS Core
**Route:** `/operations/tracking`
**Page file:** `apps/web/app/(dashboard)/operations/tracking/page.tsx`

## Current State
Server component (33 LOC) with Next.js metadata. Uses `SocketProvider` with `/tracking` namespace from `SOCKET_NAMESPACES` config. Renders `TrackingMap` component for full-screen GPS tracking. Architecture documented in file comments: TrackingMap handles Google Maps, markers, InfoWindow, detail panel; TrackingSidebar shows active loads list.

## Requirements
- Verify `TrackingMap` component renders Google Maps with live markers
- WebSocket `/tracking` namespace must be implemented server-side (QS-001)
- 15-second polling fallback when WebSocket is disconnected
- Active loads sidebar with list of in-transit loads
- InfoWindow on marker click with load details
- Detail panel for selected load

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Map renders with Google Maps API
- [ ] Real-time position updates via WebSocket
- [ ] Fallback polling when WS disconnected
- [ ] Load selection shows detail panel

## Dependencies
- Backend: `GET /tracking/positions`, WebSocket `/tracking` namespace (QS-001), TrackingService in TMS module
- Hook: Tracking hooks with WebSocket integration
- Components: `TrackingMap`, `SocketProvider`
- External: Google Maps API key

## Estimated Effort
XL

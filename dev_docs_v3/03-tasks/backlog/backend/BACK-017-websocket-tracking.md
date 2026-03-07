# BACK-017: WebSocket Tracking Namespace

**Priority:** P0 (QS-001 related)
**Module:** `apps/api/src/modules/tms/` (or new gateway file)
**Endpoint(s):** WebSocket namespace `/tracking`

## Current State
Frontend tracking page uses `SocketProvider` with `/tracking` namespace from `SOCKET_NAMESPACES` config. TrackingService exists (`tracking.service.ts`, `tracking.controller.ts`) with REST endpoints. WebSocket gateway is missing per QS-001 audit. Frontend docs mention 15-second polling fallback when WS is down.

## Requirements
- Create WebSocket gateway for `/tracking` namespace
- Events: position-update, eta-update, geofence-enter, geofence-exit
- Accept position updates from drivers/ELD devices
- Broadcast position updates to tracking map clients
- Room-based subscriptions (by load, by carrier)
- JWT authentication on WebSocket connection
- Position history storage for playback

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied (WsJwtGuard)
- [ ] Multi-tenant filtered (room per tenant)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Real-time position updates displayed on map
- [ ] Fallback polling works when WS disconnected

## Dependencies
- Prisma model: Load, TrackingPosition
- Related modules: auth, tms/tracking

## Estimated Effort
L

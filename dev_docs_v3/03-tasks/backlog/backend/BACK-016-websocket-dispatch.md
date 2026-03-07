# BACK-016: WebSocket Dispatch Namespace

**Priority:** P0 (QS-001 related)
**Module:** `apps/api/src/modules/tms/` (or new gateway file)
**Endpoint(s):** WebSocket namespace `/dispatch`

## Current State
Frontend `SocketProvider` connects to `/dispatch` namespace (used by operations dashboard and dispatch board pages). Backend WebSocket gateways are missing per QS-001 audit. The `useDashboardLiveUpdates` hook subscribes to real-time events.

## Requirements
- Create WebSocket gateway for `/dispatch` namespace
- Events: load-created, load-updated, load-status-changed, load-assigned, load-unassigned
- Broadcast load changes to all connected dispatchers
- Room-based subscriptions (by tenant, by dispatcher)
- JWT authentication on WebSocket connection
- Heartbeat/reconnection handling

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied (WsJwtGuard)
- [ ] Multi-tenant filtered (room per tenant)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Real-time events received by frontend
- [ ] Connection survives page navigation

## Dependencies
- Prisma model: Load
- Related modules: auth (JWT validation), tms/loads

## Estimated Effort
M

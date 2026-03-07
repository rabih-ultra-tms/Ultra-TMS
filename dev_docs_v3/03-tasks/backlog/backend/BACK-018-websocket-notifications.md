# BACK-018: WebSocket Notification Namespace

**Priority:** P0 (QS-001 related)
**Module:** `apps/api/src/modules/communication/` (or new gateway file)
**Endpoint(s):** WebSocket namespace `/notifications`

## Current State
Communication module has NotificationsService and NotificationsController with REST endpoints. WebSocket gateway for real-time notifications is missing per QS-001 audit. Frontend likely expects in-app notifications via WebSocket.

## Requirements
- Create WebSocket gateway for `/notifications` namespace
- Events: new-notification, notification-read, notification-dismissed
- Notification types: load alerts, payment received, settlement approved, system messages
- Per-user notification delivery (authenticated connection)
- Unread count tracking
- Notification persistence and history
- JWT authentication on WebSocket connection

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied (WsJwtGuard)
- [ ] Multi-tenant filtered (per-user rooms)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Notifications appear in real-time in UI
- [ ] Unread count updates without page refresh

## Dependencies
- Prisma model: Notification
- Related modules: auth, communication/notifications

## Estimated Effort
M

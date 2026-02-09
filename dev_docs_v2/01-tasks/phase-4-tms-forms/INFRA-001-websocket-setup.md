# INFRA-001: WebSocket Infrastructure

> **Phase:** 4 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** L (5h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — Real-Time Requirements table
3. `dev_docs/10-features/79-real-time-websocket-standards.md` — Full WebSocket architecture

## Objective

Set up Socket.io client infrastructure for real-time features. This is a prerequisite for Dispatch Board (TMS-011), Tracking Map (TMS-013), and Operations Dashboard (TMS-012). Creates a SocketProvider context, useSocketEvent hook, and graceful degradation with polling fallback.

**Architecture:**
- Transport: Socket.io (WebSocket + polling fallback)
- Auth: JWT on connection (from httpOnly cookie)
- Tenant isolation: room-based (`tenant:{tenantId}`)
- Namespaces: `/dispatch`, `/tracking`
- Key events: `load:status:changed`, `load:location:updated`, `load:dispatched`, `load:delivered`

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/lib/socket/socket-provider.tsx` | React context: connects on login, disconnects on logout |
| CREATE | `apps/web/lib/socket/use-socket-event.ts` | Hook: subscribe to typed events, auto-cleanup |
| CREATE | `apps/web/lib/socket/use-socket-status.ts` | Hook: connection status (connected/disconnected/reconnecting) |
| CREATE | `apps/web/lib/socket/socket-config.ts` | Namespace URLs, reconnection config, event type definitions |
| MODIFY | `apps/web/app/(dashboard)/layout.tsx` | Wrap dashboard with SocketProvider |

## Acceptance Criteria

- [ ] SocketProvider connects to backend Socket.io on dashboard mount
- [ ] JWT auth passed on connection handshake
- [ ] useSocketEvent hook correctly subscribes/unsubscribes to events
- [ ] TypeScript event types for all TMS events (load:status:changed, etc.)
- [ ] Connection status indicator (optional: small dot in header)
- [ ] Graceful degradation: if WebSocket fails, components fall back to polling
- [ ] Reconnection: 5 attempts with 1s delay
- [ ] No memory leaks (cleanup on unmount)
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: None (standalone infrastructure)
- Blocks: TMS-011 (Dispatch Board), TMS-012 (Operations Dashboard), TMS-013 (Tracking Map)

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md` → Real-Time Requirements
- WebSocket standards: `dev_docs/10-features/79-real-time-websocket-standards.md`
- Backend gateway: Socket.io with Redis adapter, WsJwtGuard, tenant room isolation
- Namespaces: `/dispatch` (load status events), `/tracking` (GPS position events)

# QS-001: WebSocket Gateways

**Priority:** P0
**Effort:** XL (12-16 hours)
**Status:** planned
**Assigned:** Claude Code

---

## Context Header (Read These First)

1. `apps/api/src/modules/tms/dispatch.controller.ts` — Dispatch REST controller (understand existing dispatch logic)
2. `apps/api/src/modules/tms/tracking.controller.ts` — Tracking REST controller
3. `apps/web/lib/hooks/tms/use-dispatch-ws.ts` — Broken WS hook (understand expected interface)
4. `apps/web/lib/hooks/tms/use-tracking.ts` — Partial WS hook (REST works, WS missing)
5. `apps/web/components/providers/socket-provider.tsx` — Socket.io client setup
6. `dev_docs_v3/01-services/p0-mvp/05-tms-core.md` — TMS Core service hub

---

## Objective

Implement Socket.io WebSocket gateways for 4 namespaces: `/dispatch`, `/tracking`, `/notifications`, and `/dashboard`. The REST APIs all exist and work — this task adds the real-time layer on top.

---

## Background

The frontend has hook stubs for WebSocket (`use-dispatch-ws.ts`, `use-tracking.ts`) but the backend has NO WebSocket gateways implemented. The `SocketProvider` connects to the server but no namespaces exist to handle the connections. This makes Dispatch Board and Tracking Map non-functional for real-time updates.

---

## File Plan

### Backend — New Files

| File | Purpose |
|------|---------|
| `apps/api/src/modules/tms/gateways/dispatch.gateway.ts` | Dispatch namespace — load status updates, carrier assignment events |
| `apps/api/src/modules/tms/gateways/tracking.gateway.ts` | Tracking namespace — GPS position broadcasts |
| `apps/api/src/modules/tms/gateways/notifications.gateway.ts` | Global notifications — check call alerts, load alerts |
| `apps/api/src/modules/operations/gateways/dashboard.gateway.ts` | Dashboard namespace — KPI updates |

### Backend — Modified Files

| File | Change |
|------|--------|
| `apps/api/src/modules/tms/tms.module.ts` | Register all 3 gateways as providers |
| `apps/api/src/modules/operations/operations.module.ts` | Register dashboard gateway |
| `apps/api/src/modules/operations/loads.service.ts` | Emit WS events on load status change |
| `apps/api/src/modules/operations/orders.service.ts` | Emit WS events on order status change |

### Frontend — Modified Files

| File | Change |
|------|--------|
| `apps/web/lib/hooks/tms/use-dispatch-ws.ts` | Implement WS subscription for dispatch events |
| `apps/web/lib/hooks/tms/use-tracking.ts` | Add WS subscription for position updates |
| `apps/web/lib/hooks/tms/use-ops-dashboard.ts` | Add WS subscription for dashboard KPI updates |
| `apps/web/components/layout/notification-bell.tsx` | Wire up to notifications namespace |

---

## Acceptance Criteria

1. `GET localhost:3001/socket.io/?EIO=4` returns `0{...}` handshake — Socket.io server is running
2. `/dispatch` namespace: when a load status changes via REST, connected dispatch board clients receive a `load:updated` event within 500ms
3. `/tracking` namespace: when a `Position` record is created, all clients tracking that load receive `position:update` event with `{loadId, lat, lng, timestamp}`
4. `/notifications` namespace: check call overdue events arrive at the notification bell without page refresh
5. `/dashboard` namespace: dashboard KPI cards update in real-time when load status changes (no manual refresh needed)
6. Auth gate: WebSocket connections require valid JWT — unauthenticated connections are rejected with code 4001
7. Multi-tenant: each tenant's clients only receive events for their own tenant's loads

---

## Technical Approach

```typescript
// Gateway pattern (NestJS)
@WebSocketGateway({
  namespace: '/dispatch',
  cors: { origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'] }
})
@UseGuards(WsJwtGuard)
export class DispatchGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    // Validate JWT, get tenantId, join tenant room
    await client.join(`tenant:${tenantId}`);
  }

  // Service calls this when load status changes
  emitLoadUpdate(tenantId: string, load: LoadDto) {
    this.server.to(`tenant:${tenantId}`).emit('load:updated', load);
  }
}
```

---

## Dependencies

- **Blocks:** QS-005 (profile notifications), accounting screens (notification alerts)
- **Blocked by:** None
- **Requires:** Socket.io installed (already in docker-compose + likely in package.json)

---

## Verification Steps

```bash
# 1. Start app
pnpm dev

# 2. Use Playwright to navigate to dispatch board
# 3. Open Network tab — should show WebSocket connection to /dispatch
# 4. Update a load status via API
# 5. Verify dispatch board updates without page refresh
# 6. Take screenshot for QS-008 verification record
```

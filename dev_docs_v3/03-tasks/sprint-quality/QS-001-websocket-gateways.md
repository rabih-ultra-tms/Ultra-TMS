# QS-001: WebSocket Gateway — /notifications Only

**Priority:** P0
**Effort:** L (4-6 hours)
**Status:** DONE (2026-03-09)
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

Implement Socket.io WebSocket gateway for the `/notifications` namespace only. Other namespaces (`/dispatch`, `/tracking`, `/dashboard`) are deferred to QS-001b and QS-001c per Tribunal verdict TRIBUNAL-09.

---

## Background

The frontend has hook stubs for WebSocket (`use-dispatch-ws.ts`, `use-tracking.ts`) but the backend has NO WebSocket gateways implemented. The `SocketProvider` connects to the server but no namespaces exist to handle the connections. This makes Dispatch Board and Tracking Map non-functional for real-time updates.

---

## File Plan

### Backend — New Files

| File | Purpose |
|------|---------|
| `apps/api/src/modules/tms/gateways/notifications.gateway.ts` | Global notifications — check call alerts, load alerts |

> **Deferred:** `dispatch.gateway.ts`, `tracking.gateway.ts`, and `dashboard.gateway.ts` are deferred to QS-001b and QS-001c per Tribunal verdict TRIBUNAL-09.

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
2. `/notifications` namespace: check call overdue events arrive at the notification bell without page refresh
3. Auth gate: WebSocket connections require valid JWT — unauthenticated connections are rejected with code 4001
4. Multi-tenant: each tenant's clients only receive events for their own tenant's loads

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

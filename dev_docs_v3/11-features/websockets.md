# WebSockets & Real-Time Communication

> Source: `dev_docs/10-features/79-real-time-websocket-standards.md`
> Last updated: 2026-03-07

---

## Overview

Ultra TMS uses **Socket.io** on top of NestJS WebSocket gateways for real-time features. Redis Pub/Sub serves as the adapter for horizontal scaling.

**Status:** QS-001 task — WebSocket gateways are planned but not yet implemented. The existing `SocketProvider` has an infinite loop bug.

---

## Namespaces

| Namespace | Purpose | Consumers |
|-----------|---------|-----------|
| `/dispatch` | Load assignment updates, board refresh | Dispatch Board |
| `/tracking` | GPS position updates, ETA changes | Load Tracking Map |
| `/notifications` | Status alerts, system messages | All pages (bell icon) |
| `/dashboard` | KPI metric updates | Main Dashboard |

---

## Architecture

```
Frontend (socket.io-client)
    ↕ WebSocket
NestJS Gateway (Socket.io server)
    ↕ Redis Pub/Sub
Backend Services (emit events)
```

Redis adapter enables multiple API instances to share WebSocket state.

---

## Core Rules

1. **Authenticate ALL connections** — JWT token required in handshake `auth.token`
2. **Tenant isolation** — Every socket joins room `tenant:{tenantId}`. Never broadcast across tenants
3. **Graceful degradation** — App MUST work if WebSocket is down (polling fallback via React Query)
4. **Rate limiting** — Use `WsThrottlerGuard` to prevent abuse

---

## NestJS Gateway Pattern

```typescript
@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
  namespace: '/dispatch',
})
@UseGuards(WsJwtGuard, WsThrottlerGuard)
export class DispatchGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const user = await this.authenticate(client);
    client.join(`tenant:${user.tenantId}`);
    client.join(`user:${user.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('load:subscribe')
  handleLoadSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { loadId: string },
  ) {
    client.join(`load:${data.loadId}`);
  }
}
```

---

## Frontend Hook Pattern

```typescript
// lib/hooks/useSocket.ts
export function useSocket(namespace: string) {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`${WS_URL}${namespace}`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    return () => { socket.disconnect(); };
  }, [namespace, token]);

  return socketRef;
}
```

---

## Event Naming Convention

```
{entity}:{action}

Examples:
  load:statusChanged
  load:assigned
  load:locationUpdate
  notification:new
  dashboard:metricsUpdate
```

---

## Room Strategy

| Room Pattern | Purpose |
|-------------|---------|
| `tenant:{tenantId}` | All tenant-wide broadcasts |
| `user:{userId}` | User-specific notifications |
| `load:{loadId}` | Load detail watchers |
| `dispatch:{dispatcherId}` | Dispatcher-specific updates |

---

## Redis Adapter Setup

```typescript
// main.ts or gateway module
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
await Promise.all([pubClient.connect(), subClient.connect()]);
server.adapter(createAdapter(pubClient, subClient));
```

---

## Fallback Strategy

When WebSocket is unavailable:
1. React Query polls on its standard `refetchInterval` (e.g., 30s for dashboard)
2. UI shows "Live updates paused" indicator
3. Manual refresh button always available
4. Reconnection is automatic with exponential backoff

---

## Security Checklist

- [ ] JWT validated on every connection handshake
- [ ] Tenant room enforced — no cross-tenant leaks
- [ ] Rate limiting via `WsThrottlerGuard`
- [ ] No sensitive data in WebSocket payloads (use IDs, fetch details via REST)
- [ ] Connection timeout after inactivity (configurable)

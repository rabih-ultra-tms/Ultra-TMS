# 74 - Real-Time & WebSocket Standards

**Socket.io patterns for live updates in the 3PL Platform**

---

## âš ï¸ CLAUDE CODE: Real-Time Requirements

1. **Use Socket.io** - Battle-tested, fallback support, room management
2. **Authenticate ALL connections** - JWT token required
3. **Tenant isolation is critical** - Never broadcast across tenants
4. **Graceful degradation** - App must work if WebSocket fails (poll fallback)

---

## Why Real-Time Matters

| Feature           | Why Real-Time                       |
| ----------------- | ----------------------------------- |
| Load Tracking Map | Live GPS updates, driver locations  |
| Dispatch Board    | Instant load assignment visibility  |
| Notifications     | Immediate alerts for status changes |
| Check Calls       | Real-time driver check-ins          |
| Chat/Messages     | Instant communication with drivers  |
| Dashboard KPIs    | Live metrics updates                |

---

## Architecture Overview

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   Frontend      â”‚     â”‚   API Gateway    â”‚     â”‚   Backend       â”‚
â”‚   (React)       â”‚â—„â”€â”€â”€â–ºâ”‚   (Socket.io)    â”‚â—„â”€â”€â”€â–ºâ”‚   (NestJS)      â”‚
â”‚                 â”‚     â”‚                  â”‚     â”‚                 â”‚
â”‚  socket.io-     â”‚     â”‚  Namespace:      â”‚     â”‚  Events via     â”‚
â”‚  client         â”‚     â”‚  /dispatch       â”‚     â”‚  Redis PubSub   â”‚
â”‚                 â”‚     â”‚  /tracking       â”‚     â”‚                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â”‚  /notifications  â”‚     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                               â”‚
                               â–¼
                        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                        â”‚      Redis       â”‚
                        â”‚   (Pub/Sub +     â”‚
                        â”‚    Adapter)      â”‚
                        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## NestJS WebSocket Gateway Setup

### Installation

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install @socket.io/redis-adapter redis
```

### Gateway Configuration

```typescript
// apps/api/src/gateways/events.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '@/common/guards/ws-jwt.guard';
import { WsThrottlerGuard } from '@/common/guards/ws-throttler.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  namespace: '/events',
})
@UseGuards(WsJwtGuard, WsThrottlerGuard)
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Extract user from JWT (set by WsJwtGuard)
      const user = client.data.user;

      if (!user) {
        client.disconnect();
        return;
      }

      // Join tenant room (CRITICAL for isolation)
      await client.join(`tenant:${user.tenantId}`);

      // Join user-specific room for direct messages
      await client.join(`user:${user.id}`);

      // Join role-based rooms
      for (const role of user.roles) {
        await client.join(`role:${user.tenantId}:${role}`);
      }

      this.logger.log(`Client connected: ${client.id} (User: ${user.id})`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Emit to specific tenant
  emitToTenant(tenantId: string, event: string, data: any) {
    this.server.to(`tenant:${tenantId}`).emit(event, data);
  }

  // Emit to specific user
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Emit to users with specific role in tenant
  emitToRole(tenantId: string, role: string, event: string, data: any) {
    this.server.to(`role:${tenantId}:${role}`).emit(event, data);
  }
}
```

### WebSocket JWT Guard

```typescript
// apps/api/src/common/guards/ws-jwt.guard.ts

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractToken(client);

      if (!token) {
        throw new WsException('Unauthorized');
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;

      return true;
    } catch (error) {
      throw new WsException('Unauthorized');
    }
  }

  private extractToken(client: Socket): string | undefined {
    // Try auth header first
    const authHeader = client.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Fall back to query param (for initial connection)
    return client.handshake.auth?.token || client.handshake.query?.token;
  }
}
```

---

## Event Namespaces

### Dispatch Namespace

```typescript
// apps/api/src/gateways/dispatch.gateway.ts

@WebSocketGateway({ namespace: '/dispatch' })
@UseGuards(WsJwtGuard)
export class DispatchGateway {
  @WebSocketServer()
  server: Server;

  // Join load-specific room for tracking
  @SubscribeMessage('join:load')
  async handleJoinLoad(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { loadId: string }
  ) {
    const user = client.data.user;
    // Verify user has access to this load
    await client.join(`load:${data.loadId}`);
    return { joined: true };
  }

  @SubscribeMessage('leave:load')
  async handleLeaveLoad(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { loadId: string }
  ) {
    await client.leave(`load:${data.loadId}`);
    return { left: true };
  }
}
```

### Tracking Namespace

```typescript
// apps/api/src/gateways/tracking.gateway.ts

@WebSocketGateway({ namespace: '/tracking' })
@UseGuards(WsJwtGuard)
export class TrackingGateway {
  @WebSocketServer()
  server: Server;

  // Driver sends location update
  @SubscribeMessage('location:update')
  async handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { loadId: string; lat: number; lng: number }
  ) {
    const user = client.data.user;

    // Store location
    await this.trackingService.updateLocation(data.loadId, {
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date(),
      driverId: user.driverId,
    });

    // Broadcast to load watchers
    this.server.to(`load:${data.loadId}`).emit('location:updated', {
      loadId: data.loadId,
      location: { lat: data.lat, lng: data.lng },
      timestamp: new Date().toISOString(),
    });

    return { received: true };
  }

  // Emit location to all tracking map viewers
  broadcastLoadLocation(tenantId: string, loadId: string, location: Location) {
    this.server.to(`tenant:${tenantId}`).emit('load:location', {
      loadId,
      location,
    });
  }
}
```

---

## Event Definitions

### Standard Event Schema

```typescript
// packages/shared-types/src/events/index.ts

// Base event interface
export interface WebSocketEvent<T = unknown> {
  event: string;
  data: T;
  timestamp: string;
  tenantId: string;
}

// Load Events
export interface LoadStatusChangedEvent {
  loadId: string;
  loadNumber: string;
  previousStatus: LoadStatus;
  newStatus: LoadStatus;
  updatedBy: string;
}

export interface LoadLocationUpdatedEvent {
  loadId: string;
  loadNumber: string;
  location: {
    lat: number;
    lng: number;
  };
  eta?: string;
  speed?: number;
}

export interface LoadDispatchedEvent {
  loadId: string;
  loadNumber: string;
  carrierId: string;
  carrierName: string;
  driverId?: string;
  driverName?: string;
}

// Notification Events
export interface NotificationEvent {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  link?: string;
  userId?: string; // If specific to user
}

// Check Call Events
export interface CheckCallReceivedEvent {
  loadId: string;
  loadNumber: string;
  location: string;
  notes: string;
  eta?: string;
  receivedAt: string;
}
```

### Event Names Convention

```typescript
// Use colon-separated namespacing
const EVENT_NAMES = {
  // Load events
  LOAD_CREATED: 'load:created',
  LOAD_UPDATED: 'load:updated',
  LOAD_STATUS_CHANGED: 'load:status:changed',
  LOAD_DISPATCHED: 'load:dispatched',
  LOAD_LOCATION_UPDATED: 'load:location:updated',
  LOAD_DELIVERED: 'load:delivered',

  // Carrier events
  CARRIER_CREATED: 'carrier:created',
  CARRIER_UPDATED: 'carrier:updated',
  CARRIER_COMPLIANCE_ALERT: 'carrier:compliance:alert',

  // Notification events
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',

  // Chat/Message events
  MESSAGE_NEW: 'message:new',
  MESSAGE_READ: 'message:read',

  // System events
  SYSTEM_MAINTENANCE: 'system:maintenance',
  SYSTEM_ANNOUNCEMENT: 'system:announcement',
} as const;
```

---

## Emitting Events from Services

### Event Service

```typescript
// apps/api/src/services/event.service.ts

import { Injectable } from '@nestjs/common';
import { EventsGateway } from '@/gateways/events.gateway';
import { RedisService } from '@/redis/redis.service';

@Injectable()
export class EventService {
  constructor(
    private eventsGateway: EventsGateway,
    private redis: RedisService
  ) {}

  // Emit to tenant (all connected users)
  emitToTenant<T>(tenantId: string, event: string, data: T) {
    this.eventsGateway.emitToTenant(tenantId, event, {
      event,
      data,
      timestamp: new Date().toISOString(),
      tenantId,
    });
  }

  // Emit to specific user
  emitToUser<T>(userId: string, event: string, data: T) {
    this.eventsGateway.emitToUser(userId, event, {
      event,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // Emit to role (e.g., all dispatchers)
  emitToRole<T>(tenantId: string, role: string, event: string, data: T) {
    this.eventsGateway.emitToRole(tenantId, role, event, {
      event,
      data,
      timestamp: new Date().toISOString(),
      tenantId,
    });
  }

  // For distributed systems: publish to Redis
  async publish<T>(channel: string, data: T) {
    await this.redis.publish(channel, JSON.stringify(data));
  }
}
```

### Using in Load Service

```typescript
// apps/api/src/modules/load/load.service.ts

@Injectable()
export class LoadService {
  constructor(
    private prisma: PrismaService,
    private eventService: EventService
  ) {}

  async updateStatus(
    loadId: string,
    status: LoadStatus,
    tenantId: string,
    userId: string
  ) {
    const load = await this.prisma.load.findFirst({
      where: { id: loadId, tenantId },
    });

    const previousStatus = load.status;

    const updatedLoad = await this.prisma.load.update({
      where: { id: loadId },
      data: { status, updatedById: userId },
    });

    // Emit real-time event
    this.eventService.emitToTenant(tenantId, 'load:status:changed', {
      loadId,
      loadNumber: load.loadNumber,
      previousStatus,
      newStatus: status,
      updatedBy: userId,
    });

    // Also emit to users watching this specific load
    this.eventService.emitToRoom(`load:${loadId}`, 'load:status:changed', {
      loadId,
      loadNumber: load.loadNumber,
      previousStatus,
      newStatus: status,
    });

    return updatedLoad;
  }

  async dispatch(
    loadId: string,
    carrierId: string,
    tenantId: string,
    userId: string
  ) {
    const load = await this.prisma.load.update({
      where: { id: loadId },
      data: {
        carrierId,
        status: 'DISPATCHED',
        dispatchedAt: new Date(),
        dispatchedById: userId,
      },
      include: { carrier: true },
    });

    // Notify all dispatchers
    this.eventService.emitToRole(tenantId, 'DISPATCH', 'load:dispatched', {
      loadId,
      loadNumber: load.loadNumber,
      carrierId,
      carrierName: load.carrier.name,
    });

    // Notify the carrier (if they have portal access)
    this.eventService.emitToTenant(tenantId, 'carrier:load:assigned', {
      loadId,
      loadNumber: load.loadNumber,
      carrierId,
    });

    return load;
  }
}
```

---

## Frontend Integration

### Socket Provider

```typescript
// lib/socket.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL + '/events', {
      auth: { token },
      transports: ['websocket', 'polling'], // Prefer websocket, fallback to polling
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
```

### Event Hooks

```typescript
// hooks/use-socket-event.ts
import { useEffect } from 'react';
import { useSocket } from '@/lib/socket';

export function useSocketEvent<T>(
  event: string,
  handler: (data: T) => void,
) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [socket, event, handler]);
}

// Usage in component
function LoadsPage() {
  const [loads, setLoads] = useState<Load[]>([]);

  // Listen for load status changes
  useSocketEvent<LoadStatusChangedEvent>('load:status:changed', (data) => {
    setLoads(prev =>
      prev.map(load =>
        load.id === data.loadId
          ? { ...load, status: data.newStatus }
          : load
      )
    );
    toast.info(`Load ${data.loadNumber} status: ${data.newStatus}`);
  });

  // Listen for new loads
  useSocketEvent<Load>('load:created', (newLoad) => {
    setLoads(prev => [newLoad, ...prev]);
    toast.success(`New load created: ${newLoad.loadNumber}`);
  });

  return <LoadTable loads={loads} />;
}
```

### Live Tracking Map

```typescript
// components/tracking/live-map.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket, useSocketEvent } from '@/lib/socket';
import Map from '@/components/map';

interface LoadLocation {
  loadId: string;
  loadNumber: string;
  location: { lat: number; lng: number };
  eta?: string;
}

export function LiveTrackingMap() {
  const { socket, connected } = useSocket();
  const [locations, setLocations] = useState<Map<string, LoadLocation>>(new Map());

  // Initial load of active loads
  useEffect(() => {
    fetch('/api/v1/loads/active')
      .then(res => res.json())
      .then(data => {
        const initialLocations = new Map();
        data.data.forEach((load: any) => {
          if (load.currentLocation) {
            initialLocations.set(load.id, {
              loadId: load.id,
              loadNumber: load.loadNumber,
              location: load.currentLocation,
            });
          }
        });
        setLocations(initialLocations);
      });
  }, []);

  // Listen for location updates
  useSocketEvent<LoadLocation>('load:location:updated', useCallback((data) => {
    setLocations(prev => {
      const updated = new Map(prev);
      updated.set(data.loadId, data);
      return updated;
    });
  }, []));

  return (
    <div className="relative h-full">
      {!connected && (
        <div className="absolute top-2 right-2 bg-yellow-100 px-2 py-1 rounded text-sm">
          Reconnecting...
        </div>
      )}
      <Map markers={Array.from(locations.values())} />
    </div>
  );
}
```

---

## Graceful Degradation

### Polling Fallback

```typescript
// hooks/use-data-with-realtime.ts
import { useState, useEffect, useCallback } from 'react';
import { useSocket, useSocketEvent } from '@/lib/socket';

interface UseDataWithRealtimeOptions<T> {
  fetchFn: () => Promise<T[]>;
  socketEvent: string;
  pollInterval?: number;  // Fallback polling interval
}

export function useDataWithRealtime<T extends { id: string }>(
  options: UseDataWithRealtimeOptions<T>
) {
  const { fetchFn, socketEvent, pollInterval = 30000 } = options;
  const { connected } = useSocket();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time updates when connected
  useSocketEvent<T>(socketEvent, (updated) => {
    setData(prev =>
      prev.map(item => (item.id === updated.id ? updated : item))
    );
  });

  // Fallback polling when not connected
  useEffect(() => {
    if (connected) return; // No need to poll if socket connected

    const interval = setInterval(fetchData, pollInterval);
    return () => clearInterval(interval);
  }, [connected, fetchData, pollInterval]);

  return { data, loading, refetch: fetchData, isRealtime: connected };
}

// Usage
function LoadsPage() {
  const { data: loads, loading, isRealtime } = useDataWithRealtime({
    fetchFn: () => fetch('/api/v1/loads').then(r => r.json()).then(r => r.data),
    socketEvent: 'load:updated',
    pollInterval: 15000,
  });

  return (
    <div>
      {!isRealtime && (
        <Badge variant="outline">Updates every 15s</Badge>
      )}
      <LoadTable loads={loads} />
    </div>
  );
}
```

---

## Redis Adapter (Scaling)

```typescript
// apps/api/src/gateways/gateway.module.ts

import { Module } from '@nestjs/common';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

@Module({
  providers: [
    {
      provide: 'SOCKET_IO_ADAPTER',
      useFactory: async () => {
        const pubClient = createClient({ url: process.env.REDIS_URL });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);

        return createAdapter(pubClient, subClient);
      },
    },
  ],
})
export class GatewayModule {}
```

---

## WebSocket Checklist

### Before Implementing Real-Time Feature

- [ ] Event name follows convention (colon-separated)
- [ ] Event data interface defined in shared-types
- [ ] Tenant isolation verified (using tenant rooms)
- [ ] Authentication guard in place
- [ ] Fallback polling implemented

### Security Checklist

- [ ] JWT validated on connection
- [ ] User can only join authorized rooms
- [ ] Tenant data never leaks to other tenants
- [ ] Rate limiting on message events
- [ ] Input validation on all received data

---

## Cross-References

- **Screen-API Registry (doc 72)**: Screens 04.10 (Tracking Map), 04.08 (Dispatch Board) require WebSockets
- **Auth Standards (doc 67)**: WebSocket auth uses same JWT as REST
- **Testing Strategy (doc 68)**: Add WebSocket integration tests
- **Performance Standards (doc 80)**: Redis adapter for scaling

---

## Navigation

- **Previous:** [i18n Standards](./73-i18n-standards.md)
- **Next:** [File Upload & Storage Standards](./75-file-upload-storage-standards.md)

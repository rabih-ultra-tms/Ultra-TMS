# Socket.io Client Infrastructure

WebSocket infrastructure for real-time updates in Ultra TMS. Built with Socket.io, React hooks, and TypeScript.

## Features

- ✅ JWT authentication on connection
- ✅ Auto-reconnection (5 attempts with exponential backoff)
- ✅ Graceful degradation (polling fallback)
- ✅ TypeScript event definitions
- ✅ Connection status monitoring
- ✅ Latency tracking
- ✅ Memory leak prevention (auto-cleanup)
- ✅ Multiple namespace support

## Installation

Already installed and configured. The `SocketProvider` is wrapped around the dashboard layout.

## Usage Examples

### 1. Listen to Real-Time Events

```tsx
'use client';

import { useSocketEvent, SOCKET_EVENTS } from '@/lib/socket';
import type { LoadStatusChangedEvent } from '@/lib/socket';

function LoadsPage() {
  const [loads, setLoads] = useState<Load[]>([]);

  // Listen for load status changes
  useSocketEvent<LoadStatusChangedEvent>(
    SOCKET_EVENTS.LOAD_STATUS_CHANGED,
    (data) => {
      setLoads((prev) =>
        prev.map((load) =>
          load.id === data.loadId
            ? { ...load, status: data.newStatus }
            : load
        )
      );
      toast.info(`Load ${data.loadNumber} status: ${data.newStatus}`);
    }
  );

  return <LoadTable loads={loads} />;
}
```

### 2. Monitor Connection Status

```tsx
'use client';

import { useSocketStatus } from '@/lib/socket';

function StatusIndicator() {
  const { status, connected, latency } = useSocketStatus();

  return (
    <div>
      {connected ? (
        <span>✅ Real-time Connected ({latency}ms)</span>
      ) : status === 'reconnecting' ? (
        <span>🔄 Reconnecting...</span>
      ) : (
        <span>⚠️ Disconnected</span>
      )}
    </div>
  );
}
```

### 3. Emit Events to Server

```tsx
'use client';

import { useSocketEmit } from '@/lib/socket';

function JoinLoadRoom({ loadId }: { loadId: string }) {
  const emit = useSocketEmit();

  useEffect(() => {
    emit('join:load', { loadId });

    return () => {
      emit('leave:load', { loadId });
    };
  }, [loadId, emit]);

  return <div>Watching load {loadId}</div>;
}
```

### 4. Listen to Multiple Events

```tsx
'use client';

import { useSocketEvents, SOCKET_EVENTS } from '@/lib/socket';

function Dashboard() {
  const [data, setData] = useState({
    loads: [],
    orders: [],
  });

  useSocketEvents({
    [SOCKET_EVENTS.LOAD_CREATED]: (load) => {
      setData((prev) => ({ ...prev, loads: [load, ...prev.loads] }));
    },
    [SOCKET_EVENTS.ORDER_CREATED]: (order) => {
      setData((prev) => ({ ...prev, orders: [order, ...prev.orders] }));
    },
  });

  return <div>...</div>;
}
```

### 5. Join Specific Rooms

```tsx
'use client';

import { useSocketRoom } from '@/lib/socket';

function LoadDetail({ loadId }: { loadId: string }) {
  const { join, leave } = useSocketRoom();

  useEffect(() => {
    join('load', loadId);

    return () => {
      leave('load', loadId);
    };
  }, [loadId, join, leave]);

  return <div>Load details</div>;
}
```

## Available Events

### Load Events
- `load:created` - New load created
- `load:updated` - Load details updated
- `load:status:changed` - Load status changed
- `load:dispatched` - Load dispatched to carrier
- `load:location:updated` - GPS location updated
- `load:delivered` - Load delivered
- `load:eta:updated` - ETA updated

### Order Events
- `order:created` - New order created
- `order:updated` - Order details updated
- `order:status:changed` - Order status changed

### Carrier Events
- `carrier:created` - New carrier added
- `carrier:updated` - Carrier details updated
- `carrier:compliance:alert` - Compliance issue detected
- `carrier:load:assigned` - Load assigned to carrier

### Notification Events
- `notification:new` - New notification
- `notification:read` - Notification marked as read

### Check Call Events
- `checkcall:received` - Driver check-in received

### System Events
- `system:maintenance` - Maintenance scheduled
- `system:announcement` - System announcement

## Architecture

```
Frontend (React)          Backend (NestJS)
     │                          │
     │    WebSocket (Socket.io) │
     │◄──────────────────────────┤
     │                          │
     │   JWT Authentication     │
     │◄──────────────────────────┤
     │                          │
     │   Join tenant:{id} room  │
     │◄──────────────────────────┤
     │                          │
     │   Receive events         │
     │◄──────────────────────────┤
```

## Configuration

Environment variables in `.env.local`:

```bash
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## Graceful Degradation

If WebSocket connection fails, components should implement polling fallback:

```tsx
function LoadsPage() {
  const { connected } = useSocketStatus();
  const [loads, setLoads] = useState([]);

  // Initial fetch
  useEffect(() => {
    fetchLoads().then(setLoads);
  }, []);

  // Real-time updates
  useSocketEvent('load:updated', (load) => {
    setLoads((prev) => prev.map((l) => (l.id === load.id ? load : l)));
  });

  // Polling fallback
  useEffect(() => {
    if (connected) return; // Skip polling if WebSocket is connected

    const interval = setInterval(() => {
      fetchLoads().then(setLoads);
    }, 15000); // Poll every 15s

    return () => clearInterval(interval);
  }, [connected]);

  return <LoadTable loads={loads} />;
}
```

## Files

- `socket-config.ts` - Event types, namespaces, connection config
- `socket-provider.tsx` - React context provider, connection management
- `use-socket-event.ts` - Hooks for subscribing to events
- `use-socket-status.ts` - Connection status monitoring
- `index.ts` - Public API exports

## Next Steps

1. **Backend Gateway** - Ensure Socket.io gateway is running on the backend
2. **Authentication** - Verify JWT validation on WebSocket connections
3. **Tenant Isolation** - Confirm room-based isolation works
4. **Event Emission** - Wire up backend services to emit events (LoadService, OrderService, etc.)

## Related Tasks

- TMS-011: Dispatch Board (requires real-time load updates)
- TMS-012: Operations Dashboard (requires real-time KPI updates)
- TMS-013: Tracking Map (requires real-time GPS updates)

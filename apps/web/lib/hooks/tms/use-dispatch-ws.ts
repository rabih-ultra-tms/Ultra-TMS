/**
 * Dispatch Board WebSocket Hooks
 *
 * Real-time event subscriptions for dispatch board.
 * Handles load:status:changed, load:assigned, load:created, etc.
 * Updates React Query cache for optimistic UI sync.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/lib/socket/socket-provider';
import { SOCKET_EVENTS } from '@/lib/socket/socket-config';
import { toast } from 'sonner';
import type {
  CheckCallReceivedEvent,
  DispatchBoardData,
  DispatchLoad,
  LoadAssignedEvent,
  LoadCreatedEvent,
  LoadDispatchedEvent,
  LoadEtaUpdatedEvent,
  LoadLocationUpdatedEvent,
  LoadStatusChangedEvent,
  LoadUpdatedEvent,
} from '@/lib/types/dispatch';
import { STATUS_TO_LANE } from '@/lib/types/dispatch';
import { dispatchKeys } from './use-dispatch';

/**
 * Batch update configuration
 */
const BATCH_WINDOW_MS = 500; // Batch events within 500ms window
const MAX_CONCURRENT_ANIMATIONS = 20; // Limit visual updates

/**
 * Event batching for performance
 */
class EventBatcher {
  private updates: Set<number> = new Set();
  private timer: NodeJS.Timeout | null = null;
  private callback: (loadIds: number[]) => void;

  constructor(callback: (loadIds: number[]) => void) {
    this.callback = callback;
  }

  add(loadId: number) {
    this.updates.add(loadId);

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      const loadIds = Array.from(this.updates);
      this.updates.clear();
      this.callback(loadIds);
    }, BATCH_WINDOW_MS);
  }

  flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    const loadIds = Array.from(this.updates);
    this.updates.clear();
    if (loadIds.length > 0) {
      this.callback(loadIds);
    }
  }

  clear() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.updates.clear();
  }
}

/**
 * Main dispatch board WebSocket hook
 */
export function useDispatchBoardUpdates(options?: {
  enabled?: boolean;
  onLoadCreated?: (event: LoadCreatedEvent) => void;
  onLoadStatusChanged?: (event: LoadStatusChangedEvent) => void;
  onLoadAssigned?: (event: LoadAssignedEvent) => void;
  playSound?: boolean;
  showToasts?: boolean;
}) {
  const { socket, connected } = useSocket();
  const queryClient = useQueryClient();
  const batcherRef = useRef<EventBatcher | null>(null);
  const animationCountRef = useRef(0);

  const enabled = options?.enabled !== false;
  const playSound = options?.playSound ?? false;
  const showToasts = options?.showToasts ?? true;

  // Initialize batcher
  useEffect(() => {
    if (!batcherRef.current) {
      batcherRef.current = new EventBatcher((loadIds) => {
        // Invalidate board queries after batch update
        queryClient.invalidateQueries({ queryKey: dispatchKeys.all });
      });
    }

    return () => {
      batcherRef.current?.clear();
    };
  }, [queryClient]);

  /**
   * Update board cache with new/modified load
   */
  const updateBoardCache = useCallback(
    (loadId: number, updateFn: (load: DispatchLoad) => Partial<DispatchLoad>) => {
      queryClient.setQueriesData<DispatchBoardData>(
        { queryKey: ['dispatch', 'board'] },
        (old) => {
          if (!old) return old;

          const updatedLoads = old.loads.map((load) =>
            load.id === loadId ? { ...load, ...updateFn(load) } : load
          );

          // Re-group by lane if status changed
          const loadsByLane = { ...old.loadsByLane };
          updatedLoads.forEach((load) => {
            const lane = STATUS_TO_LANE[load.status];
            const oldLane = old.loads.find((l) => l.id === load.id);
            if (oldLane && STATUS_TO_LANE[oldLane.status] !== lane) {
              // Remove from old lane
              const oldLaneKey = STATUS_TO_LANE[oldLane.status];
              loadsByLane[oldLaneKey] = loadsByLane[oldLaneKey].filter((l) => l.id !== load.id);
              // Add to new lane
              loadsByLane[lane] = [...loadsByLane[lane], load];
            } else if (!oldLane) {
              // New load - add to lane
              loadsByLane[lane] = [...loadsByLane[lane], load];
            }
          });

          return {
            ...old,
            loads: updatedLoads,
            loadsByLane,
          };
        }
      );

      // Also update single load query if exists
      queryClient.setQueryData<DispatchLoad>(dispatchKeys.load(loadId), (old) => {
        if (!old) return old;
        return { ...old, ...updateFn(old) };
      });

      // Track animation count
      animationCountRef.current++;
      if (animationCountRef.current > MAX_CONCURRENT_ANIMATIONS) {
        // Skip animation by using instant update
        return;
      }

      setTimeout(() => {
        animationCountRef.current = Math.max(0, animationCountRef.current - 1);
      }, 300);
    },
    [queryClient]
  );

  /**
   * Play notification sound
   */
  const playNotificationSound = useCallback(() => {
    if (playSound && typeof window !== 'undefined') {
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Silently fail if sound doesn't play
        });
      } catch {
        // Ignore errors
      }
    }
  }, [playSound]);

  /**
   * Handle load:created event
   */
  const handleLoadCreated = useCallback(
    (event: LoadCreatedEvent) => {
      // Add new load to cache
      const newLoad: Partial<DispatchLoad> = {
        id: event.loadId,
        status: event.status,
        isHotLoad: false,
        hasExceptions: false,
        stops: [],
        customer: { id: event.customerId, name: '' },
        equipmentType: event.equipmentType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusChangedAt: new Date().toISOString(),
      };

      // Trigger refetch to get full load data
      queryClient.invalidateQueries({ queryKey: dispatchKeys.all });

      if (showToasts) {
        toast.success('New Load Created', {
          description: `Load #${event.loadId} added to board`,
        });
      }

      playNotificationSound();
      options?.onLoadCreated?.(event);
    },
    [queryClient, toast, showToasts, playNotificationSound, options]
  );

  /**
   * Handle load:status:changed event
   */
  const handleLoadStatusChanged = useCallback(
    (event: LoadStatusChangedEvent) => {
      updateBoardCache(event.loadId, (load) => ({
        status: event.newStatus,
        statusChangedAt: event.timestamp,
        updatedAt: event.timestamp,
      }));

      if (showToasts && event.changedByName) {
        toast.info('Load Status Updated', {
          description: `Load #${event.loadId} moved to ${event.newStatus} by ${event.changedByName}`,
        });
      }

      batcherRef.current?.add(event.loadId);
      options?.onLoadStatusChanged?.(event);
    },
    [updateBoardCache, toast, showToasts, options]
  );

  /**
   * Handle load:assigned event
   */
  const handleLoadAssigned = useCallback(
    (event: LoadAssignedEvent) => {
      updateBoardCache(event.loadId, (load) => ({
        carrier: {
          id: event.carrierId,
          name: event.carrierName,
        },
        driver: event.driverId
          ? {
              id: event.driverId,
              firstName: event.driverName?.split(' ')[0] || '',
              lastName: event.driverName?.split(' ')[1] || '',
            }
          : undefined,
        updatedAt: new Date().toISOString(),
      }));

      if (showToasts) {
        toast.info('Carrier Assigned', {
          description: `${event.carrierName} assigned to Load #${event.loadId}`,
        });
      }

      batcherRef.current?.add(event.loadId);
      options?.onLoadAssigned?.(event);
    },
    [updateBoardCache, toast, showToasts, options]
  );

  /**
   * Handle load:dispatched event
   */
  const handleLoadDispatched = useCallback(
    (event: LoadDispatchedEvent) => {
      updateBoardCache(event.loadId, (load) => ({
        status: 'DISPATCHED',
        statusChangedAt: event.timestamp,
        updatedAt: event.timestamp,
        carrier: {
          id: event.carrierId,
          name: event.carrierName,
        },
      }));

      if (showToasts) {
        toast.info('Load Dispatched', {
          description: `Load #${event.loadId} dispatched to ${event.carrierName}`,
        });
      }

      batcherRef.current?.add(event.loadId);
    },
    [updateBoardCache, toast, showToasts]
  );

  /**
   * Handle load:location:updated event
   */
  const handleLoadLocationUpdated = useCallback(
    (event: LoadLocationUpdatedEvent) => {
      updateBoardCache(event.loadId, () => ({
        updatedAt: event.timestamp,
        lastCheckCallAt: event.timestamp,
      }));

      batcherRef.current?.add(event.loadId);
    },
    [updateBoardCache]
  );

  /**
   * Handle load:eta:updated event
   */
  const handleLoadEtaUpdated = useCallback(
    (event: LoadEtaUpdatedEvent) => {
      updateBoardCache(event.loadId, (load) => {
        const updatedStops = load.stops.map((stop) =>
          stop.id === event.stopId
            ? { ...stop, appointmentDate: event.newEta }
            : stop
        );
        return { stops: updatedStops, updatedAt: new Date().toISOString() };
      });

      if (showToasts && event.reason) {
        toast.info('ETA Updated', {
          description: `Load #${event.loadId} ETA changed: ${event.reason}`,
        });
      }

      batcherRef.current?.add(event.loadId);
    },
    [updateBoardCache, toast, showToasts]
  );

  /**
   * Handle checkcall:received event
   */
  const handleCheckCallReceived = useCallback(
    (event: CheckCallReceivedEvent) => {
      updateBoardCache(event.loadId, () => ({
        lastCheckCallAt: event.timestamp,
        updatedAt: event.timestamp,
      }));

      batcherRef.current?.add(event.loadId);
    },
    [updateBoardCache]
  );

  /**
   * Handle load:updated event (generic field updates)
   */
  const handleLoadUpdated = useCallback(
    (event: LoadUpdatedEvent) => {
      updateBoardCache(event.loadId, () => ({
        ...event.changedFields,
        updatedAt: new Date().toISOString(),
      }));

      batcherRef.current?.add(event.loadId);
    },
    [updateBoardCache]
  );

  /**
   * Subscribe to WebSocket events
   */
  useEffect(() => {
    if (!socket || !connected || !enabled) {
      return;
    }

    // Subscribe to events
    socket.on(SOCKET_EVENTS.LOAD_CREATED, handleLoadCreated);
    socket.on(SOCKET_EVENTS.LOAD_STATUS_CHANGED, handleLoadStatusChanged);
    socket.on(SOCKET_EVENTS.LOAD_DISPATCHED, handleLoadDispatched);
    socket.on(SOCKET_EVENTS.CARRIER_LOAD_ASSIGNED, handleLoadAssigned);
    socket.on(SOCKET_EVENTS.LOAD_LOCATION_UPDATED, handleLoadLocationUpdated);
    socket.on(SOCKET_EVENTS.LOAD_ETA_UPDATED, handleLoadEtaUpdated);
    socket.on(SOCKET_EVENTS.CHECKCALL_RECEIVED, handleCheckCallReceived);
    socket.on(SOCKET_EVENTS.LOAD_UPDATED, handleLoadUpdated);

    // Cleanup on unmount
    return () => {
      socket.off(SOCKET_EVENTS.LOAD_CREATED, handleLoadCreated);
      socket.off(SOCKET_EVENTS.LOAD_STATUS_CHANGED, handleLoadStatusChanged);
      socket.off(SOCKET_EVENTS.LOAD_DISPATCHED, handleLoadDispatched);
      socket.off(SOCKET_EVENTS.CARRIER_LOAD_ASSIGNED, handleLoadAssigned);
      socket.off(SOCKET_EVENTS.LOAD_LOCATION_UPDATED, handleLoadLocationUpdated);
      socket.off(SOCKET_EVENTS.LOAD_ETA_UPDATED, handleLoadEtaUpdated);
      socket.off(SOCKET_EVENTS.CHECKCALL_RECEIVED, handleCheckCallReceived);
      socket.off(SOCKET_EVENTS.LOAD_UPDATED, handleLoadUpdated);

      // Flush any pending batched updates
      batcherRef.current?.flush();
    };
  }, [
    socket,
    connected,
    enabled,
    handleLoadCreated,
    handleLoadStatusChanged,
    handleLoadDispatched,
    handleLoadAssigned,
    handleLoadLocationUpdated,
    handleLoadEtaUpdated,
    handleCheckCallReceived,
    handleLoadUpdated,
  ]);

  return {
    connected,
    animationCount: animationCountRef.current,
  };
}

/**
 * Hook for tracking map WebSocket updates
 */
export function useLoadLocationUpdates(options?: {
  enabled?: boolean;
  onLocationUpdate?: (event: LoadLocationUpdatedEvent) => void;
}) {
  const { socket, connected } = useSocket();
  const enabled = options?.enabled !== false;

  useEffect(() => {
    if (!socket || !connected || !enabled) {
      return;
    }

    const handleLocationUpdate = (event: LoadLocationUpdatedEvent) => {
      options?.onLocationUpdate?.(event);
    };

    socket.on(SOCKET_EVENTS.LOAD_LOCATION_UPDATED, handleLocationUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.LOAD_LOCATION_UPDATED, handleLocationUpdate);
    };
  }, [socket, connected, enabled, options]);

  return { connected };
}

/**
 * Hook for check call updates
 */
export function useCheckCallUpdates(options?: {
  enabled?: boolean;
  onCheckCallReceived?: (event: CheckCallReceivedEvent) => void;
}) {
  const { socket, connected } = useSocket();
  const queryClient = useQueryClient();
  const enabled = options?.enabled !== false;

  useEffect(() => {
    if (!socket || !connected || !enabled) {
      return;
    }

    const handleCheckCall = (event: CheckCallReceivedEvent) => {
      // Invalidate load query to refresh check call data
      queryClient.invalidateQueries({ queryKey: ['checkcalls'] });
      options?.onCheckCallReceived?.(event);
    };

    socket.on(SOCKET_EVENTS.CHECKCALL_RECEIVED, handleCheckCall);

    return () => {
      socket.off(SOCKET_EVENTS.CHECKCALL_RECEIVED, handleCheckCall);
    };
  }, [socket, connected, enabled, queryClient, options]);

  return { connected };
}

/**
 * Hook for ETA updates
 */
export function useEtaUpdates(options?: {
  enabled?: boolean;
  onEtaUpdate?: (event: LoadEtaUpdatedEvent) => void;
}) {
  const { socket, connected } = useSocket();
  const enabled = options?.enabled !== false;

  useEffect(() => {
    if (!socket || !connected || !enabled) {
      return;
    }

    const handleEtaUpdate = (event: LoadEtaUpdatedEvent) => {
      options?.onEtaUpdate?.(event);
    };

    socket.on(SOCKET_EVENTS.LOAD_ETA_UPDATED, handleEtaUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.LOAD_ETA_UPDATED, handleEtaUpdate);
    };
  }, [socket, connected, enabled, options]);

  return { connected };
}

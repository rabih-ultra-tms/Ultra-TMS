/**
 * Hook for subscribing to Socket.io events with automatic cleanup
 * Usage: useSocketEvent('load:status:changed', (data) => { ... })
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSocket } from './socket-provider';
import type { SocketEventName } from './socket-config';

/**
 * Subscribe to a Socket.io event with automatic cleanup on unmount
 * @param event - Event name to listen for
 * @param handler - Callback function to handle the event
 */
export function useSocketEvent<T = unknown>(
  event: SocketEventName | string,
  handler: (data: T) => void
) {
  const { socket, connected } = useSocket();
  const handlerRef = useRef(handler);

  // Update handler ref when it changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  // Stable callback that uses the ref
  const stableHandler = useCallback((data: T) => {
    handlerRef.current(data);
  }, []);

  useEffect(() => {
    if (!socket || !connected) {
      return;
    }

    socket.on(event, stableHandler);

    return () => {
      socket.off(event, stableHandler);
    };
  }, [socket, connected, event, stableHandler]);
}

/**
 * Subscribe to multiple events at once
 * Usage: useSocketEvents({ 'load:created': handleCreate, 'load:updated': handleUpdate })
 */
export function useSocketEvents<T = unknown>(
  events: Record<string, (data: T) => void>
) {
  const { socket, connected } = useSocket();
  // Store handlers in a ref so inline objects don't cause re-subscription every render
  const eventsRef = useRef(events);
  useEffect(() => {
    eventsRef.current = events;
  });

  // Stable list of event names — only re-subscribe when the set of events changes
  const eventNames = Object.keys(events).sort().join(',');

  useEffect(() => {
    if (!socket || !connected) {
      return;
    }

    const currentEvents = eventsRef.current;
    const entries = Object.entries(currentEvents);

    // Wrap each handler so it always calls the latest ref
    const wrappedEntries = entries.map(([event]) => {
      const wrapped = (data: T) => eventsRef.current[event]?.(data);
      return [event, wrapped] as const;
    });

    wrappedEntries.forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      wrappedEntries.forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
    // Re-subscribe only when socket, connection status, or the set of event names changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, connected, eventNames]);
}

/**
 * Hook to emit events to the server
 * Usage: const emit = useSocketEmit(); emit('join:load', { loadId: '123' })
 */
export function useSocketEmit() {
  const { socket } = useSocket();

  return useCallback(
    <T = unknown>(event: string, data?: T): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        if (!socket) {
          reject(new Error('Socket not connected'));
          return;
        }

        socket.emit(event, data, (response: unknown) => {
          resolve(response);
        });
      });
    },
    [socket]
  );
}

/**
 * Hook to join a specific room (e.g., for load-specific events)
 * Usage: const { join, leave } = useSocketRoom(); join('load', '123')
 */
export function useSocketRoom() {
  const emit = useSocketEmit();

  const join = useCallback(
    async (roomType: 'load' | 'order', id: string) => {
      try {
        await emit(`join:${roomType}`, { [`${roomType}Id`]: id });
      } catch {
        // Silently fail - server may not support room joins yet
      }
    },
    [emit]
  );

  const leave = useCallback(
    async (roomType: 'load' | 'order', id: string) => {
      try {
        await emit(`leave:${roomType}`, { [`${roomType}Id`]: id });
      } catch {
        // Silently fail
      }
    },
    [emit]
  );

  return { join, leave };
}

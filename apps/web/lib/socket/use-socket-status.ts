/**
 * Hook for monitoring Socket.io connection status
 * Usage: const { status, connected, reconnecting } = useSocketStatus()
 */

'use client';

import { useSocket } from './socket-provider';
import type { ConnectionStatus } from './socket-config';

export interface SocketStatusResult {
  /** Current connection status */
  status: ConnectionStatus;
  /** True if currently connected */
  connected: boolean;
  /** True if currently attempting to reconnect */
  reconnecting: boolean;
  /** Error message if status is 'error' */
  error: string | null;
  /** Latency in milliseconds (ping time) */
  latency: number | null;
}

/**
 * Monitor Socket.io connection status
 */
export function useSocketStatus(): SocketStatusResult {
  const { connected, status, error, latency } = useSocket();

  return {
    status,
    connected,
    reconnecting: status === 'reconnecting',
    error,
    latency,
  };
}

/**
 * Hook to check if real-time updates are active
 * Returns true if connected, false if falling back to polling
 */
export function useIsRealtime(): boolean {
  const { connected } = useSocketStatus();
  return connected;
}

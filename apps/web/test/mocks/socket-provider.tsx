/**
 * Manual mock for @/lib/socket/socket-provider
 *
 * Provides a no-op SocketProvider and a useSocket hook that returns
 * a controllable mock state via globalThis.
 */
import * as React from "react";

const KEY = "__SOCKET_PROVIDER_MOCK__";

interface MockState {
  socketContext: {
    socket: unknown;
    connected: boolean;
    status: string;
    error: string | null;
    latency: number | null;
  };
}

function getShared(): MockState {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      socketContext: {
        socket: null,
        connected: true,
        status: "connected",
        error: null,
        latency: 50,
      },
    };
  }
  return (globalThis as any)[KEY];
}

const shared = getShared();

export const socketContextReturn = shared.socketContext;

export function useSocket() {
  return shared.socketContext;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

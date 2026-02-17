/**
 * Manual mock for @/lib/socket/use-socket-status
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */

const KEY = "__HOOKS_SOCKET_STATUS_MOCK__";

interface MockState {
  socketStatus: Record<string, unknown>;
}

function getShared(): MockState {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      socketStatus: {
        connected: true,
        status: "connected",
        latency: 50,
      },
    };
  }
  return (globalThis as any)[KEY];
}

const shared = getShared();

export const socketStatusReturn = shared.socketStatus;

export function useSocketStatus() {
  return shared.socketStatus;
}

export function useIsRealtime(): boolean {
  return !!(shared.socketStatus as any).connected;
}

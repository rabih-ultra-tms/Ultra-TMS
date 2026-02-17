/**
 * Manual mock for @/lib/hooks/tms/use-dispatch-ws
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from "@jest/globals";

const KEY = "__HOOKS_TMS_DISPATCH_WS_MOCK__";

interface MockState {
  dispatchBoardUpdates: Record<string, unknown>;
}

function getShared(): MockState {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      dispatchBoardUpdates: {
        animationCount: 0,
      },
    };
  }
  return (globalThis as any)[KEY];
}

const shared = getShared();

export const dispatchBoardUpdatesReturn = shared.dispatchBoardUpdates;

export function useDispatchBoardUpdates() {
  return shared.dispatchBoardUpdates;
}

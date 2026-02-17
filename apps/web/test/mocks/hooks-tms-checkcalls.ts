/**
 * Manual mock for @/lib/hooks/tms/use-checkcalls
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from "@jest/globals";

const KEY = "__HOOKS_TMS_CHECKCALLS_MOCK__";

// Re-export types so components can import them from the mock
export interface CreateCheckCallData {
  loadId: string;
  type: "CHECK_CALL" | "ARRIVAL" | "DEPARTURE" | "DELAY" | "ISSUE";
  city: string;
  state: string;
  locationDescription?: string;
  notes?: string;
  gpsSource?: "GPS" | "MANUAL";
}

export interface CheckCall {
  id: string;
  loadId: string;
  type: "CHECK_CALL" | "ARRIVAL" | "DEPARTURE" | "DELAY" | "ISSUE";
  calledAt: string;
  city: string;
  state: string;
  locationDescription?: string;
  gpsSource?: "GPS" | "MANUAL";
  etaToNextStop?: string;
  notes?: string;
  calledBy: { id: string; name: string };
  source: string;
  createdAt: string;
}

interface MockState {
  checkCalls: Record<string, unknown>;
  createCheckCall: Record<string, unknown>;
  overdueCheckCalls: Record<string, unknown>;
  checkCallStats: Record<string, unknown>;
}

function getShared(): MockState {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      checkCalls: {
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      },
      createCheckCall: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({ id: "cc-new" }),
        isPending: false,
      },
      overdueCheckCalls: {
        data: undefined,
        isLoading: false,
      },
      checkCallStats: {
        data: undefined,
        isLoading: false,
      },
    };
  }
  return (globalThis as any)[KEY];
}

const shared = getShared();

export const checkCallsReturn = shared.checkCalls;
export const createCheckCallReturn = shared.createCheckCall;
export const overdueCheckCallsReturn = shared.overdueCheckCalls;
export const checkCallStatsReturn = shared.checkCallStats;

export function useCheckCalls() {
  return shared.checkCalls;
}
export function useCreateCheckCall() {
  return shared.createCheckCall;
}
export function useOverdueCheckCalls() {
  return shared.overdueCheckCalls;
}
export function useCheckCallStats() {
  return shared.checkCallStats;
}

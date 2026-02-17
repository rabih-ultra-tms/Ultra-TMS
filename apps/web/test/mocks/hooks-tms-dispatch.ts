/**
 * Manual mock for @/lib/hooks/tms/use-dispatch
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from "@jest/globals";

const KEY = "__HOOKS_TMS_DISPATCH_MOCK__";

interface MockState {
  dispatchLoads: Record<string, unknown>;
  dispatchBoardStats: Record<string, unknown>;
  dispatchLoad: Record<string, unknown>;
  updateLoadStatus: Record<string, unknown>;
  assignCarrier: Record<string, unknown>;
  sendDispatch: Record<string, unknown>;
  bulkStatusUpdate: Record<string, unknown>;
  bulkDispatch: Record<string, unknown>;
  updateLoadEta: Record<string, unknown>;
}

function getShared(): MockState {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      dispatchLoads: {
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
      },
      dispatchBoardStats: {
        data: undefined,
        isLoading: true,
      },
      dispatchLoad: {
        data: undefined,
        isLoading: true,
      },
      updateLoadStatus: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      assignCarrier: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      sendDispatch: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      bulkStatusUpdate: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({ succeeded: 2, failed: 0 }),
        isPending: false,
      },
      bulkDispatch: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({ succeeded: 2, failed: 0 }),
        isPending: false,
      },
      updateLoadEta: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
    };
  }
  return (globalThis as any)[KEY];
}

const shared = getShared();

export const dispatchLoadsReturn = shared.dispatchLoads;
export const dispatchBoardStatsReturn = shared.dispatchBoardStats;
export const dispatchLoadReturn = shared.dispatchLoad;
export const updateLoadStatusReturn = shared.updateLoadStatus;
export const assignCarrierReturn = shared.assignCarrier;
export const sendDispatchReturn = shared.sendDispatch;
export const bulkStatusUpdateReturn = shared.bulkStatusUpdate;
export const bulkDispatchReturn = shared.bulkDispatch;
export const updateLoadEtaReturn = shared.updateLoadEta;

export const dispatchKeys = {
  all: ["dispatch"] as const,
  board: (filters?: unknown) => ["dispatch", "board", filters] as const,
  stats: (filters?: unknown) => ["dispatch", "stats", filters] as const,
  load: (id: number) => ["dispatch", "load", id] as const,
};

export function useDispatchLoads() {
  return shared.dispatchLoads;
}
export function useDispatchBoardStats() {
  return shared.dispatchBoardStats;
}
export function useDispatchLoad() {
  return shared.dispatchLoad;
}
export function useUpdateLoadStatus() {
  return shared.updateLoadStatus;
}
export function useAssignCarrier() {
  return shared.assignCarrier;
}
export function useSendDispatch() {
  return shared.sendDispatch;
}
export function useBulkStatusUpdate() {
  return shared.bulkStatusUpdate;
}
export function useBulkDispatch() {
  return shared.bulkDispatch;
}
export function useUpdateLoadEta() {
  return shared.updateLoadEta;
}

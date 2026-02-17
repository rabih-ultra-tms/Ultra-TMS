/**
 * Manual mock for @/lib/hooks/tms/use-loads
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from "@jest/globals";

const KEY = "__HOOKS_TMS_LOADS_MOCK__";

interface MockState {
  loads: Record<string, unknown>;
  load: Record<string, unknown>;
  loadStats: Record<string, unknown>;
  loadTimeline: Record<string, unknown>;
  createLoad: Record<string, unknown>;
  updateLoad: Record<string, unknown>;
  carriers: Record<string, unknown>;
  order: Record<string, unknown>;
}

function getShared(): MockState {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      loads: {
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      },
      load: {
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      },
      loadStats: {
        data: undefined,
        isLoading: true,
      },
      loadTimeline: {
        data: undefined,
        isLoading: true,
      },
      createLoad: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({ id: "l-new" }),
        isPending: false,
      },
      updateLoad: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      carriers: {
        data: undefined,
        isLoading: true,
      },
      order: {
        data: undefined,
        isLoading: false,
        error: null,
      },
    };
  }
  return (globalThis as any)[KEY];
}

const shared = getShared();

export const loadsReturn = shared.loads;
export const loadReturn = shared.load;
export const loadStatsReturn = shared.loadStats;
export const loadTimelineReturn = shared.loadTimeline;
export const createLoadReturn = shared.createLoad;
export const updateLoadReturn = shared.updateLoad;
export const carriersReturn = shared.carriers;
export const orderReturn = shared.order;

export function useLoads() {
  return shared.loads;
}
export function useLoad() {
  return shared.load;
}
export function useLoadStats() {
  return shared.loadStats;
}
export function useLoadTimeline() {
  return shared.loadTimeline;
}
export function useCreateLoad() {
  return shared.createLoad;
}
export function useUpdateLoad() {
  return shared.updateLoad;
}
export function useCarriers() {
  return shared.carriers;
}
export function useOrder() {
  return shared.order;
}

/**
 * Manual mock for @/lib/hooks/tms/use-stops
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from "@jest/globals";

const KEY = "__HOOKS_TMS_STOPS_MOCK__";

interface MockState {
  stops: Record<string, unknown>;
  stop: Record<string, unknown>;
  stopDetention: Record<string, unknown>;
  markArrived: Record<string, unknown>;
  markDeparted: Record<string, unknown>;
  updateStopStatus: Record<string, unknown>;
  createStop: Record<string, unknown>;
  updateStop: Record<string, unknown>;
  deleteStop: Record<string, unknown>;
  reorderStops: Record<string, unknown>;
}

function getShared(): MockState {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      stops: {
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
      },
      stop: {
        data: undefined,
        isLoading: true,
        error: null,
      },
      stopDetention: {
        data: undefined,
        isLoading: false,
      },
      markArrived: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      markDeparted: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      updateStopStatus: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      createStop: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({ id: "stop-new" }),
        isPending: false,
      },
      updateStop: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      deleteStop: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
        isPending: false,
      },
      reorderStops: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue([]),
        isPending: false,
      },
    };
  }
  return (globalThis as any)[KEY];
}

const shared = getShared();

export const stopsReturn = shared.stops;
export const stopReturn = shared.stop;
export const stopDetentionReturn = shared.stopDetention;
export const markArrivedReturn = shared.markArrived;
export const markDepartedReturn = shared.markDeparted;
export const updateStopStatusReturn = shared.updateStopStatus;
export const createStopReturn = shared.createStop;
export const updateStopReturn = shared.updateStop;
export const deleteStopReturn = shared.deleteStop;
export const reorderStopsReturn = shared.reorderStops;

export function useStops() {
  return shared.stops;
}
export function useStop() {
  return shared.stop;
}
export function useStopDetention() {
  return shared.stopDetention;
}
export function useMarkArrived() {
  return shared.markArrived;
}
export function useMarkDeparted() {
  return shared.markDeparted;
}
export function useUpdateStopStatus() {
  return shared.updateStopStatus;
}
export function useCreateStop() {
  return shared.createStop;
}
export function useUpdateStop() {
  return shared.updateStop;
}
export function useDeleteStop() {
  return shared.deleteStop;
}
export function useReorderStops() {
  return shared.reorderStops;
}

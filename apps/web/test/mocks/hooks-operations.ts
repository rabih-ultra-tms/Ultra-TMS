/**
 * Manual mock for @/lib/hooks/operations
 *
 * Used by moduleNameMapper in jest.config.ts. Tests configure the mutable
 * `*Return` exports in their beforeEach blocks.
 *
 * Uses globalThis to guarantee shared state across ESM module instances
 * (the test may import from @/test/mocks/hooks-operations while the component
 * imports from @/lib/hooks/operations — both resolve here, but ESM may
 * create separate module instances).
 *
 * Example:
 *   import { carriersReturn } from "@/test/mocks/hooks-operations";
 *   beforeEach(() => {
 *     carriersReturn.data = { data: [...], total: 2 };
 *     carriersReturn.isLoading = false;
 *   });
 */
import { jest } from "@jest/globals";

// ---------------------------------------------------------------------------
// Shared state via globalThis (survives ESM module duplication)
// ---------------------------------------------------------------------------

const KEY = "__HOOKS_OPS_MOCK__";

interface MockState {
  carriers: Record<string, unknown>;
  carrier: Record<string, unknown>;
  carrierStats: Record<string, unknown>;
  carrierDrivers: Record<string, unknown>;
  createCarrier: Record<string, unknown>;
  updateCarrier: Record<string, unknown>;
  deleteCarrier: Record<string, unknown>;
}

function getShared(): MockState {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      carriers: {
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      },
      carrier: {
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      },
      carrierStats: {
        data: undefined,
      },
      carrierDrivers: {
        data: [],
      },
      createCarrier: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<{ id: string }>>().mockResolvedValue({ id: "c-new" }),
        isPending: false,
      },
      updateCarrier: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<Record<string, unknown>>>().mockResolvedValue({}),
        isPending: false,
      },
      deleteCarrier: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
        isPending: false,
      },
    };
  }
  return (globalThis as any)[KEY];
}

const shared = getShared();

// ---------------------------------------------------------------------------
// Carrier hooks — exports point to shared objects
// ---------------------------------------------------------------------------

export const carriersReturn = shared.carriers;
export const carrierReturn = shared.carrier;
export const carrierStatsReturn = shared.carrierStats;
export const carrierDriversReturn = shared.carrierDrivers;
export const createCarrierReturn = shared.createCarrier;
export const updateCarrierReturn = shared.updateCarrier;
export const deleteCarrierReturn = shared.deleteCarrier;

export function useCarriers() {
  return shared.carriers;
}
export function useCarrier() {
  return shared.carrier;
}
export function useCarrierStats() {
  return shared.carrierStats;
}
export function useCarrierDrivers() {
  return shared.carrierDrivers;
}
export function useCreateCarrier() {
  return shared.createCarrier;
}
export function useUpdateCarrier() {
  return shared.updateCarrier;
}
export function useDeleteCarrier() {
  return shared.deleteCarrier;
}

// ---------------------------------------------------------------------------
// Stubs for other hooks in the barrel (so imports don't break)
// ---------------------------------------------------------------------------

export function useLoadPlannerQuotes() {
  return { data: undefined, isLoading: true };
}
export function useLoadPlannerQuote() {
  return { data: undefined, isLoading: true };
}
export function useLoadHistory() {
  return { data: undefined, isLoading: true };
}
export function useTruckTypes() {
  return { data: undefined, isLoading: true };
}
export function useEquipment() {
  return { data: undefined, isLoading: true };
}
export function useInlandServiceTypes() {
  return { data: undefined, isLoading: true };
}
export function useTenantServices() {
  return { data: undefined, isLoading: true };
}

// Catch-all for any other exports
export function useCarrierDriver() {
  return { data: undefined, isLoading: true };
}
export function useCreateDriver(): { mutate: jest.Mock; isPending: boolean } {
  return { mutate: jest.fn(), isPending: false };
}
export function useUpdateDriver(): { mutate: jest.Mock; isPending: boolean } {
  return { mutate: jest.fn(), isPending: false };
}
export function useDeleteDriver(): { mutate: jest.Mock; isPending: boolean } {
  return { mutate: jest.fn(), isPending: false };
}
export function useCarrierTrucks() {
  return { data: [], isLoading: false };
}
export function useCarrierTruck() {
  return { data: undefined, isLoading: true };
}
export function useCreateTruck(): { mutate: jest.Mock; isPending: boolean } {
  return { mutate: jest.fn(), isPending: false };
}
export function useUpdateTruck(): { mutate: jest.Mock; isPending: boolean } {
  return { mutate: jest.fn(), isPending: false };
}
export function useDeleteTruck(): { mutate: jest.Mock; isPending: boolean } {
  return { mutate: jest.fn(), isPending: false };
}
export function useAssignDriverToTruck(): { mutate: jest.Mock; isPending: boolean } {
  return { mutate: jest.fn(), isPending: false };
}

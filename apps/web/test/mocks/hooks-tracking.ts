/**
 * Manual mock for @/lib/hooks/tracking/use-public-tracking
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from "@jest/globals";

const KEY = "__HOOKS_TRACKING_MOCK__";

interface MockState {
  publicTracking: Record<string, unknown>;
}

function getShared(): MockState {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      publicTracking: {
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      },
    };
  }
  return (globalThis as any)[KEY];
}

const shared = getShared();

export const publicTrackingReturn = shared.publicTracking;

export class TrackingNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TrackingNotFoundError";
  }
}

export function usePublicTracking() {
  return shared.publicTracking;
}

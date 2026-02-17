/**
 * Manual mock for @/lib/hooks/tms/use-tracking
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from "@jest/globals";

const KEY = "__HOOKS_TMS_TRACKING_MOCK__";

interface MockState {
  trackingPositions: Record<string, unknown>;
  loadTrackingDetail: Record<string, unknown>;
  updateLoadStatus: Record<string, unknown>;
  createCheckCall: Record<string, unknown>;
}

function getShared(): MockState {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      trackingPositions: {
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
      },
      loadTrackingDetail: {
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
      },
      updateLoadStatus: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      createCheckCall: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
    };
  }
  return (globalThis as any)[KEY];
}

const shared = getShared();

export const trackingPositionsReturn = shared.trackingPositions;
export const loadTrackingDetailReturn = shared.loadTrackingDetail;
export const updateLoadStatusReturn = shared.updateLoadStatus;
export const createCheckCallReturn = shared.createCheckCall;

// Types re-exported (same as real module)
export type EtaStatus = "on-time" | "tight" | "at-risk" | "stale";

export interface TrackingPosition {
  loadId: string;
  loadNumber: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  timestamp: string;
  status: string;
  eta: string | null;
  etaStatus: EtaStatus;
  carrier: { id: string; name: string; mcNumber: string } | null;
  driver: { name: string; phone: string } | null;
  origin: string;
  destination: string;
  equipmentType: string;
}

export interface TrackingFilters {
  etaStatus?: EtaStatus[];
  equipmentType?: string[];
  carrierId?: string;
  customerId?: string;
}

export interface TrackingStop {
  id: string;
  sequence: number;
  stopType: "PICKUP" | "DELIVERY";
  facilityName: string;
  city: string;
  state: string;
  status: string;
  appointmentTimeFrom: string | null;
}

export interface TrackingLoadDetail {
  id: string;
  loadNumber: string;
  status: string;
  eta: string | null;
  carrier: { id: string; name: string; mcNumber: string } | null;
  driver: { name: string; phone: string } | null;
  truckNumber: string | null;
  trailerNumber: string | null;
  stops: TrackingStop[];
  lastCheckCall: { timestamp: string; location: string; notes: string } | null;
  totalMiles: number | null;
  remainingMiles: number | null;
}

export const trackingKeys = {
  all: ["tracking"] as const,
  positions: () => ["tracking", "positions"] as const,
  loadDetail: (loadId: string) => ["tracking", "load", loadId] as const,
};

export const ETA_STATUS_COLORS: Record<EtaStatus, string> = {
  "on-time": "#10B981",
  tight: "#F59E0B",
  "at-risk": "#EF4444",
  stale: "#9CA3AF",
};

export const ETA_STATUS_LABELS: Record<EtaStatus, string> = {
  "on-time": "On Time",
  tight: "Tight",
  "at-risk": "At Risk",
  stale: "Stale GPS",
};

export function formatTimestampAge(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`;
}

export function isGpsStale(timestamp: string): boolean {
  return Date.now() - new Date(timestamp).getTime() > 30 * 60_000;
}

export function useTrackingPositions() {
  return shared.trackingPositions;
}

export function useLoadTrackingDetail() {
  return shared.loadTrackingDetail;
}

export function useUpdateLoadStatus() {
  return shared.updateLoadStatus;
}

export function useCreateTrackingCheckCall() {
  return shared.createCheckCall;
}

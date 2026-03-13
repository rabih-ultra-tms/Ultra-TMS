/**
 * Manual mock for @/lib/hooks/command-center/use-command-center
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from '@jest/globals';

const KEY = '__HOOKS_COMMAND_CENTER_MOCK__';

interface MockState {
  kpis: Record<string, unknown>;
  alerts: Record<string, unknown>;
  activity: Record<string, unknown>;
  acknowledgeAlert: Record<string, unknown>;
  carrierMatch: Record<string, unknown>;
  bulkDispatch: Record<string, unknown>;
}

function getShared(): MockState {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      kpis: {
        data: {
          loads: {
            today: 24,
            pending: 5,
            inTransit: 12,
            delivered: 7,
            atRisk: 2,
          },
          quotes: { active: 18, pendingApproval: 4 },
          carriers: { available: 35, onLoad: 12 },
          revenue: { today: 45200, margin: 18.5 },
          performance: { onTimePercent: 94.2 },
        },
        isLoading: false,
        isError: false,
      },
      alerts: {
        data: [
          {
            id: 'stale-checkcall-1',
            type: 'STALE_CHECK_CALL',
            severity: 'critical',
            title: 'No check call: LD-2026-100',
            description: 'Last check call was 6h ago. Carrier: Fast Freight',
            entityType: 'load',
            entityId: '1',
            createdAt: new Date().toISOString(),
            acknowledged: false,
          },
          {
            id: 'unassigned-2',
            type: 'UNASSIGNED_LOAD',
            severity: 'warning',
            title: 'Unassigned: LD-2026-101',
            description: 'Created 8h ago with no carrier assigned',
            entityType: 'load',
            entityId: '2',
            createdAt: new Date().toISOString(),
            acknowledged: false,
          },
        ],
        total: 2,
        isLoading: false,
        isError: false,
      },
      activity: {
        data: [
          {
            id: 'act-1',
            action: 'LOAD_CREATED',
            entityType: 'Load',
            entityId: '1',
            userId: 'user-1',
            metadata: null,
            createdAt: new Date().toISOString(),
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        isLoading: false,
      },
      acknowledgeAlert: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      carrierMatch: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({
          loadId: '1',
          loadNumber: 'LD-2026-100',
          lane: { origin: 'Dallas, TX', destination: 'Houston, TX' },
          suggestions: [],
          totalEligible: 0,
        }),
        isPending: false,
      },
      bulkDispatch: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({
          action: 'DISPATCH',
          total: 2,
          succeeded: 2,
          failed: 0,
          results: [
            { loadId: '1', loadNumber: 'LD-001', success: true },
            { loadId: '2', loadNumber: 'LD-002', success: true },
          ],
        }),
        isPending: false,
        isError: false,
      },
    };
  }
  return (globalThis as any)[KEY];
}

const shared = getShared();

// Exported refs for test manipulation
export const kpisReturn = shared.kpis;
export const alertsReturn = shared.alerts;
export const activityReturn = shared.activity;
export const acknowledgeAlertReturn = shared.acknowledgeAlert;
export const carrierMatchReturn = shared.carrierMatch;
export const bulkDispatchReturn = shared.bulkDispatch;

// ── Hook exports (match real module interface) ──

export const commandCenterKeys = {
  all: ['command-center'] as const,
  kpis: (period?: string) =>
    [...commandCenterKeys.all, 'kpis', period ?? 'today'] as const,
  alerts: (severity?: string) =>
    [...commandCenterKeys.all, 'alerts', severity ?? 'all'] as const,
  activity: (page?: number) =>
    [...commandCenterKeys.all, 'activity', page ?? 1] as const,
  autoMatch: (loadId: string) =>
    [...commandCenterKeys.all, 'auto-match', loadId] as const,
};

export interface CommandCenterKPIs {
  loads: {
    today: number;
    pending: number;
    inTransit: number;
    delivered: number;
    atRisk: number;
  };
  quotes: { active: number; pendingApproval: number };
  carriers: { available: number; onLoad: number };
  revenue: { today: number; margin: number };
  performance: { onTimePercent: number };
}

export interface CommandCenterAlert {
  id: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface ActivityEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface CarrierMatchScores {
  lane: number;
  rate: number;
  performance: number;
  availability: number;
  composite: number;
}

export interface CarrierMatchSuggestion {
  carrierId: string;
  carrierName: string;
  mcNumber: string | null;
  tier: string | null;
  equipmentTypes: string[];
  scores: CarrierMatchScores;
  laneHistory: number;
  activeLoads: number;
  servesLane: boolean;
  equipmentMatch: boolean;
}

export interface AutoMatchResult {
  loadId: string;
  loadNumber: string;
  lane: { origin: string; destination: string };
  suggestions: CarrierMatchSuggestion[];
  totalEligible: number;
}

export interface BulkDispatchResult {
  loadId: string;
  loadNumber: string;
  success: boolean;
  error?: string;
}

export interface BulkDispatchResponse {
  action: BulkDispatchAction;
  total: number;
  succeeded: number;
  failed: number;
  results: BulkDispatchResult[];
}

export type BulkDispatchAction =
  | 'ASSIGN_CARRIER'
  | 'DISPATCH'
  | 'UPDATE_STATUS';

export function useCommandCenterKPIs() {
  return getShared().kpis;
}

export function useCommandCenterAlerts() {
  return getShared().alerts;
}

export function useAcknowledgeAlert() {
  return getShared().acknowledgeAlert;
}

export function useCommandCenterActivity() {
  return getShared().activity;
}

export function useCarrierMatch() {
  return getShared().carrierMatch;
}

export function useBulkDispatchCommand() {
  return getShared().bulkDispatch;
}

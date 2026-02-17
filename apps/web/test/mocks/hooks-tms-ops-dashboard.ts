/**
 * Manual mock for @/lib/hooks/tms/use-ops-dashboard
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from "@jest/globals";

const KEY = "__HOOKS_TMS_OPS_DASHBOARD_MOCK__";

// Re-export types so components can import them from the mock
export type Period = "today" | "thisWeek" | "thisMonth";
export type Scope = "personal" | "team";
export type ComparisonPeriod = "yesterday" | "lastWeek" | "lastMonth";

interface MockState {
  dashboardKPIs: Record<string, unknown>;
  dashboardCharts: Record<string, unknown>;
  dashboardAlerts: Record<string, unknown>;
  dashboardActivity: Record<string, unknown>;
  needsAttention: Record<string, unknown>;
}

function getShared(): MockState {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      dashboardKPIs: {
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      },
      dashboardCharts: {
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      },
      dashboardAlerts: {
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      },
      dashboardActivity: {
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      },
      needsAttention: {
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

export const dashboardKPIsReturn = shared.dashboardKPIs;
export const dashboardChartsReturn = shared.dashboardCharts;
export const dashboardAlertsReturn = shared.dashboardAlerts;
export const dashboardActivityReturn = shared.dashboardActivity;
export const needsAttentionReturn = shared.needsAttention;

export const dashboardKeys = {
  all: ["operations", "dashboard"] as const,
  kpis: (period?: string, scope?: string, comparison?: string) =>
    [...dashboardKeys.all, "kpis", period, scope, comparison] as const,
  charts: (period?: string) => [...dashboardKeys.all, "charts", period] as const,
  alerts: () => [...dashboardKeys.all, "alerts"] as const,
  activity: (period?: string) => [...dashboardKeys.all, "activity", period] as const,
  needsAttention: () => [...dashboardKeys.all, "needs-attention"] as const,
};

export function useDashboardKPIs() {
  return shared.dashboardKPIs;
}
export function useDashboardCharts() {
  return shared.dashboardCharts;
}
export function useDashboardAlerts() {
  return shared.dashboardAlerts;
}
export function useDashboardActivity() {
  return shared.dashboardActivity;
}
export function useNeedsAttention() {
  return shared.needsAttention;
}
export function useDashboardLiveUpdates() {
  // No-op for tests — just return void
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

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
  quotes: {
    active: number;
    pendingApproval: number;
  };
  carriers: {
    available: number;
    onLoad: number;
  };
  revenue: {
    today: number;
    margin: number;
  };
  performance: {
    onTimePercent: number;
  };
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

export function useCommandCenterKPIs(period?: string) {
  return useQuery({
    queryKey: commandCenterKeys.kpis(period),
    queryFn: async () => {
      const params = period ? `?period=${period}` : '';
      const response = await apiClient.get(`/command-center/kpis${params}`);
      return unwrap<CommandCenterKPIs>(response);
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useCommandCenterAlerts(severity?: string) {
  return useQuery({
    queryKey: commandCenterKeys.alerts(severity),
    queryFn: async () => {
      const params =
        severity && severity !== 'all' ? `?severity=${severity}` : '';
      const response = await apiClient.get(`/command-center/alerts${params}`);
      const body = response as { data: CommandCenterAlert[]; total: number };
      return body;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: string) => {
      return apiClient.patch(`/command-center/alerts/${alertId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commandCenterKeys.alerts() });
    },
  });
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

export function useCommandCenterActivity(page = 1, limit = 10) {
  return useQuery({
    queryKey: commandCenterKeys.activity(page),
    queryFn: async () => {
      const response = await apiClient.get(
        `/command-center/activity?page=${page}&limit=${limit}`
      );
      return response as {
        data: ActivityEntry[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// --- Auto-Match ---

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

export function useCarrierMatch(loadId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/command-center/auto-match', {
        loadId,
      });
      return unwrap<AutoMatchResult>(response);
    },
  });
}

// --- Bulk Dispatch ---

export type BulkDispatchAction = 'ASSIGN_CARRIER' | 'DISPATCH' | 'UPDATE_STATUS';

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

export function useBulkDispatchCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      loadIds: string[];
      action: BulkDispatchAction;
      carrierId?: string;
      targetStatus?: string;
      notes?: string;
    }) => {
      const response = await apiClient.post(
        '/command-center/bulk-dispatch',
        params
      );
      return unwrap<BulkDispatchResponse>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch'] });
      queryClient.invalidateQueries({ queryKey: commandCenterKeys.all });
    },
  });
}

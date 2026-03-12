import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface AgentCommission {
  id: string;
  agentId: string;
  loadId?: string | null;
  orderId?: string | null;
  customerId?: string | null;
  splitType: string;
  splitRate: number;
  commissionBase: number;
  grossCommission: number;
  netCommission: number;
  loadRevenue?: number | null;
  loadMargin?: number | null;
  status: string;
  commissionPeriod?: string | null;
  createdAt: string;
}

export interface AgentPerformance {
  totalCommissions: number;
  totalPaid: number;
  avgCommission: number;
  loadCount: number;
  pendingAmount: number;
}

export interface AgentCommissionParams {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface AgentCommissionListResponse {
  data: AgentCommission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===========================
// Query Keys
// ===========================

export const agentCommissionKeys = {
  all: ['agents', 'commissions'] as const,
  byAgent: (agentId: string, params?: AgentCommissionParams) =>
    [...agentCommissionKeys.all, agentId, ...(params ? [params] : [])] as const,
  performance: (agentId: string) =>
    [...agentCommissionKeys.all, 'performance', agentId] as const,
};

// ===========================
// Helpers
// ===========================

function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

// ===========================
// Query Hooks
// ===========================

export function useAgentCommissions(
  agentId: string,
  params: AgentCommissionParams = {}
) {
  return useQuery<AgentCommissionListResponse>({
    queryKey: agentCommissionKeys.byAgent(agentId, params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.status && params.status !== 'all')
        searchParams.set('status', params.status);
      if (params.startDate) searchParams.set('startDate', params.startDate);
      if (params.endDate) searchParams.set('endDate', params.endDate);

      const query = searchParams.toString();
      const url = query
        ? `/agents/${agentId}/commissions?${query}`
        : `/agents/${agentId}/commissions`;
      const response = await apiClient.get(url);
      const raw = response as {
        data: AgentCommission[];
        pagination: AgentCommissionListResponse['pagination'];
      };
      return {
        data: raw.data ?? [],
        pagination: raw.pagination ?? {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };
    },
    enabled: !!agentId,
    placeholderData: (previousData) => previousData,
  });
}

export function useAgentPerformance(agentId: string) {
  return useQuery<AgentPerformance>({
    queryKey: agentCommissionKeys.performance(agentId),
    queryFn: async () => {
      const response = await apiClient.get(`/agents/${agentId}/performance`);
      return unwrap<AgentPerformance>(response);
    },
    enabled: !!agentId,
  });
}

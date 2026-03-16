import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface AgentRanking {
  rank: number;
  agentId: string;
  agentCode: string;
  companyName: string;
  contactFirstName?: string | null;
  contactLastName?: string | null;
  commission?: number | null;
  loadCount?: number | null;
  avgCommission?: number | null;
  totalPaid?: number | null;
  status?: string | null;
}

export interface AgentRankingsParams {
  top?: number;
  page?: number;
  limit?: number;
  period?: string;
  metric?: 'commission' | 'loads' | 'avgCommission';
}

interface AgentRankingsResponse {
  data: AgentRanking[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===========================
// Query Keys
// ===========================

export const agentRankingsKeys = {
  all: ['agents', 'rankings'] as const,
  list: (params?: AgentRankingsParams) =>
    [...agentRankingsKeys.all, ...(params ? [params] : [])] as const,
};

// ===========================
// Query Hooks
// ===========================

export function useAgentRankings(params: AgentRankingsParams = {}) {
  return useQuery<AgentRankingsResponse>({
    queryKey: agentRankingsKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.top) searchParams.set('top', params.top.toString());
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.period) searchParams.set('period', params.period);
      if (params.metric) searchParams.set('metric', params.metric);

      const query = searchParams.toString();
      const url = query ? `/agents/rankings?${query}` : '/agents/rankings';
      const response = await apiClient.get(url);
      const raw = response as {
        data: AgentRanking[];
        pagination?: AgentRankingsResponse['pagination'];
      };
      return {
        data: raw.data ?? [],
        pagination: raw.pagination ?? {
          page: 1,
          limit: params.limit ?? 20,
          total: raw.data?.length ?? 0,
          totalPages: Math.ceil((raw.data?.length ?? 0) / (params.limit ?? 20)),
        },
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - rankings are less frequently updated
    placeholderData: (previousData) => previousData,
  });
}

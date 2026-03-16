import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface AgentStatement {
  id: string;
  agentId: string;
  period: string;
  startDate: string;
  endDate: string;
  totalCommission?: number | null;
  totalPaid?: number | null;
  totalPending?: number | null;
  loadCount?: number | null;
  status?: string | null;
  pdfUrl?: string | null;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentStatementParams {
  page?: number;
  limit?: number;
  period?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface AgentStatementListResponse {
  data: AgentStatement[];
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

export const agentStatementKeys = {
  all: ['agents', 'statements'] as const,
  byAgent: (agentId: string, params?: AgentStatementParams) =>
    [...agentStatementKeys.all, agentId, ...(params ? [params] : [])] as const,
  detail: (agentId: string, statementId: string) =>
    [...agentStatementKeys.all, agentId, 'detail', statementId] as const,
};

// ===========================
// Query Hooks
// ===========================

export function useAgentStatements(
  agentId: string,
  params: AgentStatementParams = {}
) {
  return useQuery<AgentStatementListResponse>({
    queryKey: agentStatementKeys.byAgent(agentId, params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.period) searchParams.set('period', params.period);
      if (params.startDate) searchParams.set('startDate', params.startDate);
      if (params.endDate) searchParams.set('endDate', params.endDate);
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

      const query = searchParams.toString();
      const url = query
        ? `/agents/${agentId}/statements?${query}`
        : `/agents/${agentId}/statements`;
      const response = await apiClient.get(url);
      const raw = response as {
        data: AgentStatement[];
        pagination: AgentStatementListResponse['pagination'];
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

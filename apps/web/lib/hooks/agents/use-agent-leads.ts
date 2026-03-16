import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface AgentLead {
  id: string;
  agentId: string;
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone?: string | null;
  industry?: string | null;
  estimatedValue?: number | null;
  status: string;
  source?: string | null;
  qualifiedDate?: string | null;
  convertedDate?: string | null;
  rejectedDate?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConvertLeadInput {
  customerId?: string;
  notes?: string;
}

export interface RejectLeadInput {
  reason: string;
}

export interface AgentLeadParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface AgentLeadListResponse {
  data: AgentLead[];
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

export const agentLeadKeys = {
  all: ['agents', 'leads'] as const,
  byAgent: (agentId: string, params?: AgentLeadParams) =>
    [...agentLeadKeys.all, agentId, ...(params ? [params] : [])] as const,
  detail: (agentId: string, leadId: string) =>
    [...agentLeadKeys.all, agentId, 'detail', leadId] as const,
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

export function useAgentLeads(agentId: string, params: AgentLeadParams = {}) {
  return useQuery<AgentLeadListResponse>({
    queryKey: agentLeadKeys.byAgent(agentId, params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.status && params.status !== 'all')
        searchParams.set('status', params.status);
      if (params.search) searchParams.set('search', params.search);
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

      const query = searchParams.toString();
      const url = query
        ? `/agents/${agentId}/leads?${query}`
        : `/agents/${agentId}/leads`;
      const response = await apiClient.get(url);
      const raw = response as {
        data: AgentLead[];
        pagination: AgentLeadListResponse['pagination'];
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

// ===========================
// Mutation Hooks
// ===========================

export function useQualifyLead(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const response = await apiClient.post(
        `/agents/${agentId}/leads/${leadId}/qualify`
      );
      return unwrap<AgentLead>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: agentLeadKeys.all,
      });
      toast.success('Lead qualified successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to qualify lead');
    },
  });
}

export function useConvertLead(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leadId,
      ...input
    }: ConvertLeadInput & { leadId: string }) => {
      const response = await apiClient.post(
        `/agents/${agentId}/leads/${leadId}/convert`,
        input
      );
      return unwrap<AgentLead>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: agentLeadKeys.all,
      });
      toast.success('Lead converted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to convert lead');
    },
  });
}

export function useRejectLead(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leadId,
      ...input
    }: RejectLeadInput & { leadId: string }) => {
      const response = await apiClient.post(
        `/agents/${agentId}/leads/${leadId}/reject`,
        input
      );
      return unwrap<AgentLead>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: agentLeadKeys.all,
      });
      toast.success('Lead rejected successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject lead');
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface Agent {
  id: string;
  tenantId: string;
  agentCode: string;
  companyName: string;
  dbaName?: string | null;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone?: string | null;
  agentType: string;
  status: string;
  tier?: string | null;
  territories?: string[] | null;
  industryFocus?: string[] | null;
  legalEntityType?: string | null;
  taxId?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  paymentMethod?: string | null;
  bankName?: string | null;
  bankRouting?: string | null;
  bankAccount?: string | null;
  bankAccountType?: string | null;
  activatedAt?: string | null;
  terminatedAt?: string | null;
  terminationReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentContact {
  id: string;
  agentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  agentType?: string;
  tier?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateAgentInput {
  agentCode: string;
  companyName: string;
  dbaName?: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone?: string;
  agentType: string;
  tier?: string;
  territories?: string[];
  industryFocus?: string[];
  legalEntityType?: string;
  taxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  paymentMethod?: string;
  bankName?: string;
  bankRouting?: string;
  bankAccount?: string;
  bankAccountType?: string;
}

export interface UpdateAgentInput {
  companyName?: string;
  dbaName?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
  contactPhone?: string;
  agentType?: string;
  tier?: string;
  territories?: string[];
  industryFocus?: string[];
  legalEntityType?: string;
  taxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  paymentMethod?: string;
  bankName?: string;
  bankRouting?: string;
  bankAccount?: string;
  bankAccountType?: string;
}

export interface AgentContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  isPrimary?: boolean;
}

interface AgentListResponse {
  data: Agent[];
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

export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (params: AgentListParams) => [...agentKeys.lists(), params] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
  contacts: (agentId: string) =>
    [...agentKeys.all, 'contacts', agentId] as const,
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

export function useAgents(params: AgentListParams = {}) {
  return useQuery<AgentListResponse>({
    queryKey: agentKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.search) searchParams.set('search', params.search);
      if (params.status && params.status !== 'all')
        searchParams.set('status', params.status);
      if (params.agentType && params.agentType !== 'all')
        searchParams.set('agentType', params.agentType);
      if (params.tier && params.tier !== 'all')
        searchParams.set('tier', params.tier);
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

      const query = searchParams.toString();
      const url = query ? `/agents?${query}` : '/agents';
      const response = await apiClient.get(url);
      const raw = response as {
        data: Agent[];
        pagination: AgentListResponse['pagination'];
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
    placeholderData: (previousData) => previousData,
  });
}

export function useAgent(id: string) {
  return useQuery<Agent>({
    queryKey: agentKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/agents/${id}`);
      return unwrap<Agent>(response);
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useAgentContacts(agentId: string) {
  return useQuery<AgentContact[]>({
    queryKey: agentKeys.contacts(agentId),
    queryFn: async () => {
      const response = await apiClient.get(`/agents/${agentId}/contacts`);
      return unwrap<AgentContact[]>(response);
    },
    enabled: !!agentId,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAgentInput) => {
      const response = await apiClient.post('/agents', input);
      return unwrap<Agent>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create agent');
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateAgentInput & { id: string }) => {
      const response = await apiClient.put(`/agents/${id}`, input);
      return unwrap<Agent>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update agent');
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete agent');
    },
  });
}

export function useActivateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/agents/${id}/activate`);
      return unwrap<Agent>(response);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success('Agent activated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to activate agent');
    },
  });
}

export function useSuspendAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await apiClient.post(`/agents/${id}/suspend`, {
        reason,
      });
      return unwrap<Agent>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success('Agent suspended successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to suspend agent');
    },
  });
}

export function useTerminateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await apiClient.post(`/agents/${id}/terminate`, {
        reason,
      });
      return unwrap<Agent>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success('Agent terminated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to terminate agent');
    },
  });
}

export function useAddContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      agentId,
      ...input
    }: AgentContactInput & { agentId: string }) => {
      const response = await apiClient.post(
        `/agents/${agentId}/contacts`,
        input
      );
      return unwrap<AgentContact>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agentKeys.contacts(variables.agentId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add contact');
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      agentId,
      contactId,
      ...input
    }: AgentContactInput & { agentId: string; contactId: string }) => {
      const response = await apiClient.put(
        `/agents/${agentId}/contacts/${contactId}`,
        input
      );
      return unwrap<AgentContact>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agentKeys.contacts(variables.agentId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update contact');
    },
  });
}

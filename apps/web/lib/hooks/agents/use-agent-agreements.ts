import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface AgentAgreement {
  id: string;
  agentId: string;
  agreementNumber: string;
  effectiveDate: string;
  expirationDate?: string | null;
  splitType: string;
  splitRate?: number | null;
  minimumPayout?: number | null;
  minimumPerLoad?: number | null;
  drawAmount?: number | null;
  drawFrequency?: string | null;
  drawRecoverable?: boolean | null;
  sunsetEnabled?: boolean | null;
  sunsetPeriodMonths?: number | null;
  protectionPeriodMonths?: number | null;
  paymentDay?: number | null;
  status: string;
  version?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgreementInput {
  agentId: string;
  agreementNumber: string;
  effectiveDate: string;
  expirationDate?: string;
  splitType: string;
  splitRate?: number;
  minimumPayout?: number;
  minimumPerLoad?: number;
  drawAmount?: number;
  drawFrequency?: string;
  drawRecoverable?: boolean;
  sunsetEnabled?: boolean;
  sunsetPeriodMonths?: number;
  protectionPeriodMonths?: number;
  paymentDay?: number;
}

export interface UpdateAgreementInput {
  effectiveDate?: string;
  expirationDate?: string;
  splitType?: string;
  splitRate?: number;
  minimumPayout?: number;
  minimumPerLoad?: number;
  drawAmount?: number;
  drawFrequency?: string;
  drawRecoverable?: boolean;
  sunsetEnabled?: boolean;
  sunsetPeriodMonths?: number;
  protectionPeriodMonths?: number;
  paymentDay?: number;
}

// ===========================
// Query Keys
// ===========================

export const agreementKeys = {
  all: ['agents', 'agreements'] as const,
  byAgent: (agentId: string) => [...agreementKeys.all, agentId] as const,
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

export function useAgentAgreements(agentId: string) {
  return useQuery<AgentAgreement[]>({
    queryKey: agreementKeys.byAgent(agentId),
    queryFn: async () => {
      const response = await apiClient.get(`/agents/${agentId}/agreements`);
      return unwrap<AgentAgreement[]>(response);
    },
    enabled: !!agentId,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export function useCreateAgreement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, ...input }: CreateAgreementInput) => {
      const response = await apiClient.post(
        `/agents/${agentId}/agreements`,
        input
      );
      return unwrap<AgentAgreement>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agreementKeys.byAgent(variables.agentId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create agreement');
    },
  });
}

export function useUpdateAgreement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: UpdateAgreementInput & { agreementId: string; agentId: string }
    ) => {
      const { agreementId, agentId: _aid, ...body } = input;
      const response = await apiClient.put(
        `/agent-agreements/${agreementId}`,
        body
      );
      return unwrap<AgentAgreement>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agreementKeys.byAgent(variables.agentId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update agreement');
    },
  });
}

export function useActivateAgreement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { agreementId: string; agentId: string }) => {
      const response = await apiClient.post(
        `/agent-agreements/${input.agreementId}/activate`
      );
      return unwrap<AgentAgreement>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agreementKeys.byAgent(variables.agentId),
      });
      toast.success('Agreement activated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to activate agreement');
    },
  });
}

export function useTerminateAgreement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { agreementId: string; agentId: string }) => {
      const response = await apiClient.post(
        `/agent-agreements/${input.agreementId}/terminate`
      );
      return unwrap<AgentAgreement>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agreementKeys.byAgent(variables.agentId),
      });
      toast.success('Agreement terminated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to terminate agreement');
    },
  });
}

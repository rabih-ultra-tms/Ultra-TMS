import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface AgentCustomerAssignment {
  id: string;
  agentId: string;
  customerId: string;
  assignmentType: string;
  status: string;
  splitPercent?: number | null;
  isProtected: boolean;
  protectionStart?: string | null;
  protectionEnd?: string | null;
  inSunset: boolean;
  sunsetStartDate?: string | null;
  currentSunsetRate?: number | null;
  overrideSplitRate?: number | null;
  overrideReason?: string | null;
  customer?: {
    id: string;
    name: string;
    companyName?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssignCustomerInput {
  agentId: string;
  customerId: string;
  assignmentType: string;
  splitPercent?: number;
  isProtected?: boolean;
  protectionStart?: string;
  protectionEnd?: string;
}

// ===========================
// Query Keys
// ===========================

export const assignmentKeys = {
  all: ['agents', 'assignments'] as const,
  byAgent: (agentId: string) => [...assignmentKeys.all, agentId] as const,
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

export function useAgentCustomers(agentId: string) {
  return useQuery<AgentCustomerAssignment[]>({
    queryKey: assignmentKeys.byAgent(agentId),
    queryFn: async () => {
      const response = await apiClient.get(`/agents/${agentId}/customers`);
      return unwrap<AgentCustomerAssignment[]>(response);
    },
    enabled: !!agentId,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export function useAssignCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, ...input }: AssignCustomerInput) => {
      const response = await apiClient.post(
        `/agents/${agentId}/customers`,
        input
      );
      return unwrap<AgentCustomerAssignment>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.byAgent(variables.agentId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign customer');
    },
  });
}

export function useTransferAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      assignmentId: string;
      agentId: string;
      targetAgentId: string;
    }) => {
      const response = await apiClient.post(
        `/agent-assignments/${input.assignmentId}/transfer`,
        { targetAgentId: input.targetAgentId }
      );
      return unwrap<AgentCustomerAssignment>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.byAgent(variables.agentId),
      });
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.byAgent(variables.targetAgentId),
      });
      toast.success('Assignment transferred successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to transfer assignment');
    },
  });
}

export function useStartSunset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { assignmentId: string; agentId: string }) => {
      const response = await apiClient.post(
        `/agent-assignments/${input.assignmentId}/start-sunset`
      );
      return unwrap<AgentCustomerAssignment>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.byAgent(variables.agentId),
      });
      toast.success('Sunset period started');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start sunset period');
    },
  });
}

export function useTerminateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { assignmentId: string; agentId: string }) => {
      const response = await apiClient.post(
        `/agent-assignments/${input.assignmentId}/terminate`
      );
      return unwrap<AgentCustomerAssignment>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.byAgent(variables.agentId),
      });
      toast.success('Assignment terminated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to terminate assignment');
    },
  });
}

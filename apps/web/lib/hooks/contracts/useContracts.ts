'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { contractsApi } from '@/lib/api/contracts/client';
import type {
  Contract,
  ContractFilters,
  PaginatedResponse,
} from '@/lib/api/contracts/types';
import type { CreateContractInput } from '@/lib/api/contracts/validators';

// ===========================
// Query Keys
// ===========================

export const contractKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractKeys.all, 'list'] as const,
  list: (filters?: ContractFilters, page?: number, limit?: number) =>
    [...contractKeys.lists(), { filters, page, limit }] as const,
  details: () => [...contractKeys.all, 'detail'] as const,
  detail: (id: string) => [...contractKeys.details(), id] as const,
};

// ===========================
// Utilities
// ===========================

/**
 * Extract error message from various error types
 * Handles API structured errors, Error objects, and unknown errors
 */
function getErrorMessage(error: any): string {
  if (error?.message) {
    return error.message;
  }
  if (error?.data?.message) {
    return error.data.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An error occurred';
}

// ===========================
// Types
// ===========================

interface UseContractsOptions {
  filters?: ContractFilters;
  page?: number;
  limit?: number;
}

// ===========================
// Hook
// ===========================

export function useContracts(options: UseContractsOptions = {}) {
  const queryClient = useQueryClient();
  const { filters, page = 1, limit = 20 } = options;

  // List query
  const listQuery = useQuery<PaginatedResponse<Contract>>({
    queryKey: contractKeys.list(filters, page, limit),
    queryFn: () => contractsApi.list(filters, page, limit),
    // 5 minutes: balance between fresh data and avoiding unnecessary requests
    staleTime: 5 * 60 * 1000,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateContractInput) => contractsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      toast.success('Contract created successfully');
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<CreateContractInput> & { id: string }) => {
      const { id, ...payload } = data;
      return contractsApi.update(id, payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      toast.success('Contract updated successfully');
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => contractsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      toast.success('Contract deleted successfully');
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    contracts: listQuery.data?.data || [],
    pagination: listQuery.data?.pagination,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
    create: (data: CreateContractInput) => createMutation.mutateAsync(data),
    update: (id: string, payload: Partial<CreateContractInput>) =>
      updateMutation.mutateAsync({ id, ...payload }),
    delete: (id: string) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

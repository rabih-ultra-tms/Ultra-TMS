'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { contractsApi } from '@/lib/api/contracts/client';
import type { Contract, ContractFilters } from '@/lib/api/contracts/types';
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
// Types
// ===========================

interface UseContractsOptions {
  filters?: ContractFilters;
  page?: number;
  limit?: number;
}

interface ContractListResponse {
  data: Contract[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===========================
// Hook
// ===========================

export function useContracts(options: UseContractsOptions = {}) {
  const queryClient = useQueryClient();
  const { filters, page = 1, limit = 20 } = options;

  // List query
  const listQuery = useQuery<ContractListResponse>({
    queryKey: contractKeys.list(filters, page, limit),
    queryFn: async () => {
      const response = await contractsApi.list(filters, page, limit);
      return response as ContractListResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateContractInput) => contractsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      toast.success('Contract created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create contract');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: Partial<CreateContractInput> }) =>
      contractsApi.update(data.id, data.payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      toast.success('Contract updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update contract');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => contractsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      toast.success('Contract deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete contract');
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
      updateMutation.mutateAsync({ id, payload }),
    delete: (id: string) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

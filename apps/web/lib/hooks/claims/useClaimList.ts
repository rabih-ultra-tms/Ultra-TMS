'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { claimsClient } from '@/lib/api/claims';
import type {
  ClaimFilters,
  ClaimListResponse,
  CreateClaimDTO,
  UpdateClaimDTO,
} from '@/lib/api/claims/types';

// ===========================
// Query Keys
// ===========================

export const claimKeys = {
  all: ['claims'] as const,
  lists: () => [...claimKeys.all, 'list'] as const,
  list: (filters?: ClaimFilters, page?: number, limit?: number) =>
    [...claimKeys.lists(), { filters, page, limit }] as const,
  details: () => [...claimKeys.all, 'detail'] as const,
  detail: (id: string) => [...claimKeys.details(), id] as const,
};

// ===========================
// Utilities
// ===========================

/**
 * Extract error message from various error types
 * Handles API structured errors, Error objects, and unknown errors
 */
function getErrorMessage(error: unknown): string {
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

interface UseClaimListOptions {
  filters?: ClaimFilters;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

// ===========================
// Hook
// ===========================

export function useClaimList(options: UseClaimListOptions = {}) {
  const queryClient = useQueryClient();
  const { filters, page = 1, limit = 20, enabled = true } = options;

  // List query
  const listQuery = useQuery<ClaimListResponse>({
    queryKey: claimKeys.list(filters, page, limit),
    queryFn: () => claimsClient.list(filters, page, limit),
    // 5 minutes: balance between fresh data and avoiding unnecessary requests
    staleTime: 5 * 60 * 1000,
    enabled,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateClaimDTO) => claimsClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimKeys.lists() });
      toast.success('Claim created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateClaimDTO & { id: string }) => {
      const { id, ...payload } = data;
      return claimsClient.update(id, payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: claimKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: claimKeys.lists() });
      toast.success('Claim updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => claimsClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimKeys.lists() });
      toast.success('Claim deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    claims: listQuery.data?.data || [],
    pagination: listQuery.data?.pagination,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
    create: (data: CreateClaimDTO) => createMutation.mutateAsync(data),
    update: (id: string, payload: UpdateClaimDTO) =>
      updateMutation.mutateAsync({ id, ...payload }),
    delete: (id: string) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

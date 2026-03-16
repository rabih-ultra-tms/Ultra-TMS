import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface CreditLimit {
  id: string;
  tenantId: string;
  companyId: string;
  creditAmount: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXCEEDED' | 'EXPIRED';
  approvedAt: string;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreditUtilization {
  companyId: string;
  creditLimit: number;
  amountUsed: number;
  amountAvailable: number;
  percentageUsed: number;
  thresholdExceeded: boolean;
  warningThreshold?: number | null;
  lastCalculatedAt: string;
}

export interface CreditLimitListParams {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'SUSPENDED' | 'EXCEEDED' | 'EXPIRED';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCreditLimitInput {
  companyId: string;
  creditAmount: number;
  expiresAt?: string;
}

export interface UpdateCreditLimitInput {
  creditAmount?: number;
  expiresAt?: string;
}

interface CreditLimitListResponse {
  data: CreditLimit[];
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

export const creditLimitKeys = {
  all: ['credit-limits'] as const,
  lists: () => [...creditLimitKeys.all, 'list'] as const,
  list: (params: CreditLimitListParams) =>
    [...creditLimitKeys.lists(), params] as const,
  details: () => [...creditLimitKeys.all, 'detail'] as const,
  detail: (companyId: string) =>
    [...creditLimitKeys.details(), companyId] as const,
  utilizations: () => [...creditLimitKeys.all, 'utilization'] as const,
  utilization: (companyId: string) =>
    [...creditLimitKeys.utilizations(), companyId] as const,
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

export function useCreditLimits(params: CreditLimitListParams = {}) {
  return useQuery<CreditLimitListResponse>({
    queryKey: creditLimitKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.status) searchParams.set('status', params.status);
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

      const query = searchParams.toString();
      const url = query ? `/credit/limits?${query}` : '/credit/limits';
      const response = await apiClient.get(url);
      const raw = response as {
        data: CreditLimit[];
        pagination: CreditLimitListResponse['pagination'];
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

export function useCreditLimit(companyId: string) {
  return useQuery<CreditLimit>({
    queryKey: creditLimitKeys.detail(companyId),
    queryFn: async () => {
      const response = await apiClient.get(`/credit/limits/${companyId}`);
      return unwrap<CreditLimit>(response);
    },
    enabled: !!companyId,
    staleTime: 30_000,
  });
}

export function useCreditUtilization(companyId: string) {
  return useQuery<CreditUtilization>({
    queryKey: creditLimitKeys.utilization(companyId),
    queryFn: async () => {
      const response = await apiClient.get(
        `/credit/limits/${companyId}/utilization`
      );
      return unwrap<CreditUtilization>(response);
    },
    enabled: !!companyId,
    staleTime: 60_000, // Utilization can be cached slightly longer
  });
}

// ===========================
// Mutation Hooks
// ===========================

export function useCreateCreditLimit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCreditLimitInput) => {
      const response = await apiClient.post('/credit/limits', input);
      return unwrap<CreditLimit>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditLimitKeys.lists() });
      toast.success('Credit limit created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create credit limit');
    },
  });
}

export function useUpdateCreditLimit(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateCreditLimitInput) => {
      const response = await apiClient.put(
        `/credit/limits/${companyId}`,
        input
      );
      return unwrap<CreditLimit>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: creditLimitKeys.detail(companyId),
      });
      queryClient.invalidateQueries({ queryKey: creditLimitKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: creditLimitKeys.utilization(companyId),
      });
      toast.success('Credit limit updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update credit limit');
    },
  });
}

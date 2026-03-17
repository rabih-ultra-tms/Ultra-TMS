import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface CreditHold {
  id: string;
  tenantId: string;
  companyId: string;
  placedDate?: string;
  reason: 'FRAUD' | 'PAYMENT' | 'COMPLIANCE' | 'OTHER';
  status: 'ACTIVE' | 'RELEASED';
  releasedAt?: string | null;
  releasedBy?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreditHoldListParams {
  page?: number;
  limit?: number;
  companyId?: string;
  status?: 'ACTIVE' | 'RELEASED';
  reason?: 'FRAUD' | 'PAYMENT' | 'COMPLIANCE' | 'OTHER';
  active?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCreditHoldInput {
  companyId: string;
  reason: 'FRAUD' | 'PAYMENT' | 'COMPLIANCE' | 'OTHER';
  notes?: string;
}

export interface ReleaseCreditHoldInput {
  holdId: string;
  notes?: string;
}

interface CreditHoldListResponse {
  data: CreditHold[];
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

export const creditHoldKeys = {
  all: ['credit-holds'] as const,
  lists: () => [...creditHoldKeys.all, 'list'] as const,
  list: (params: CreditHoldListParams) =>
    [...creditHoldKeys.lists(), params] as const,
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

export function useCreditHolds(params: CreditHoldListParams = {}) {
  return useQuery<CreditHoldListResponse>({
    queryKey: creditHoldKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.companyId) searchParams.set('companyId', params.companyId);
      if (params.status) searchParams.set('status', params.status);
      if (params.reason) searchParams.set('reason', params.reason);
      if (params.active !== undefined)
        searchParams.set('active', params.active.toString());
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

      const query = searchParams.toString();
      const url = query ? `/credit/holds?${query}` : '/credit/holds';
      const response = await apiClient.get(url);
      const raw = response as {
        data: CreditHold[];
        pagination: CreditHoldListResponse['pagination'];
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

// ===========================
// Mutation Hooks
// ===========================

export function useCreateCreditHold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCreditHoldInput) => {
      const response = await apiClient.post('/credit/holds', input);
      return unwrap<CreditHold>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditHoldKeys.lists() });
      toast.success('Credit hold placed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create credit hold');
    },
  });
}

export function useReleaseCreditHold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ReleaseCreditHoldInput) => {
      const response = await apiClient.post(
        `/credit/holds/${input.holdId}/release`,
        { notes: input.notes }
      );
      return unwrap<CreditHold>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditHoldKeys.lists() });
      toast.success('Credit hold released successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to release credit hold');
    },
  });
}

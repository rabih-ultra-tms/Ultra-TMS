import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface CommissionRep {
  id: string;
  name: string;
  email: string;
  planId: string | null;
  planName: string | null;
  pendingAmount: number;
  paidMTD: number;
  paidYTD: number;
  loadCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface RepTransaction {
  id: string;
  date: string;
  loadId: string;
  loadNumber: string;
  orderNumber: string;
  amount: number;
  rate: number;
  planName: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'VOID';
  createdAt: string;
}

export interface RepListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface RepListResponse {
  data: CommissionRep[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TransactionsResponse {
  data: RepTransaction[];
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

export const repKeys = {
  all: ['commissions', 'reps'] as const,
  lists: () => [...repKeys.all, 'list'] as const,
  list: (params: RepListParams) => [...repKeys.lists(), params] as const,
  details: () => [...repKeys.all, 'detail'] as const,
  detail: (id: string) => [...repKeys.details(), id] as const,
  transactions: (id: string, page?: number) =>
    [...repKeys.all, 'transactions', id, { page }] as const,
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

export function useReps(params: RepListParams = {}) {
  return useQuery<RepListResponse>({
    queryKey: repKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.search) searchParams.set('search', params.search);
      if (params.status && params.status !== 'all')
        searchParams.set('status', params.status);
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

      const query = searchParams.toString();
      const url = query ? `/commissions/reps?${query}` : '/commissions/reps';
      const response = await apiClient.get(url);
      // The global interceptor returns { success, data: [...], pagination: {...} }
      const raw = response as { data: any[]; pagination: RepListResponse['pagination'] };
      return {
        data: raw.data ?? [],
        pagination: raw.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useRep(id: string) {
  return useQuery<CommissionRep>({
    queryKey: repKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/commissions/reps/${id}`);
      return unwrap<CommissionRep>(response);
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useRepTransactions(id: string, page = 1, limit = 20) {
  return useQuery<TransactionsResponse>({
    queryKey: repKeys.transactions(id, page),
    queryFn: async () => {
      const response = await apiClient.get(
        `/commissions/reps/${id}/transactions?page=${page}&limit=${limit}`
      );
      const raw = response as { data: any[]; pagination: TransactionsResponse['pagination'] };
      return {
        data: raw.data ?? [],
        pagination: raw.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    },
    enabled: !!id,
    placeholderData: (previousData) => previousData,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export function useAssignPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ repId, planId }: { repId: string; planId: string }) => {
      const response = await apiClient.post(`/commissions/reps/${repId}/plan`, {
        planId,
      });
      return unwrap<CommissionRep>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: repKeys.detail(variables.repId),
      });
      queryClient.invalidateQueries({ queryKey: repKeys.lists() });
    },
  });
}

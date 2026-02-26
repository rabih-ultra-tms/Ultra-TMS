import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface PayoutTransaction {
  id: string;
  loadNumber: string;
  orderNumber: string;
  commissionAmount: number;
  date: string;
}

export interface CommissionPayout {
  id: string;
  repId: string;
  repName: string;
  totalAmount: number;
  transactionCount: number;
  paymentMethod: 'ACH' | 'CHECK' | 'WIRE' | null;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
  periodStart: string;
  periodEnd: string;
  processedAt: string | null;
  createdAt: string;
  transactions?: PayoutTransaction[];
}

export interface PayoutListParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PayoutListResponse {
  data: CommissionPayout[];
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

export const payoutKeys = {
  all: ['commissions', 'payouts'] as const,
  lists: () => [...payoutKeys.all, 'list'] as const,
  list: (params: PayoutListParams) => [...payoutKeys.lists(), params] as const,
  details: () => [...payoutKeys.all, 'detail'] as const,
  detail: (id: string) => [...payoutKeys.details(), id] as const,
};

// ===========================
// Helpers
// ===========================

function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

function mapPayout(raw: any): CommissionPayout {
  const firstName = raw.user?.firstName ?? '';
  const lastName = raw.user?.lastName ?? '';
  const repName = `${firstName} ${lastName}`.trim() || raw.user?.email || 'Unknown';
  return {
    id: raw.id,
    repId: raw.userId,
    repName,
    totalAmount: raw.netPayout != null ? Number(raw.netPayout) : 0,
    transactionCount: raw._count?.entries ?? 0,
    paymentMethod: raw.paymentMethod ?? null,
    status: raw.status ?? 'PENDING',
    periodStart: raw.periodStart,
    periodEnd: raw.periodEnd,
    processedAt: raw.paidAt ?? null,
    createdAt: raw.createdAt,
  };
}

// ===========================
// Query Hooks
// ===========================

export function usePayouts(params: PayoutListParams = {}) {
  return useQuery<PayoutListResponse>({
    queryKey: payoutKeys.list(params),
    queryFn: async () => {
      const searchParams: Record<string, string | number | undefined> = {};
      if (params.page) searchParams.page = params.page;
      if (params.limit) searchParams.limit = params.limit;
      if (params.status && params.status !== 'all')
        searchParams.status = params.status;
      if (params.sortBy) searchParams.sortBy = params.sortBy;
      if (params.sortOrder) searchParams.sortOrder = params.sortOrder;

      const response = await apiClient.get(
        '/commissions/payouts',
        searchParams
      );
      const raw = response as { data: any[]; pagination: PayoutListResponse['pagination'] };
      return {
        data: (raw.data ?? []).map(mapPayout),
        pagination: raw.pagination,
      };
    },
    placeholderData: (previousData) => previousData,
  });
}

export function usePayout(id: string) {
  return useQuery<CommissionPayout>({
    queryKey: payoutKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/commissions/payouts/${id}`);
      return unwrap<CommissionPayout>(response);
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export function useGeneratePayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (repId: string) => {
      const response = await apiClient.post('/commissions/payouts', { repId });
      return unwrap<CommissionPayout>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutKeys.lists() });
    },
  });
}

export function useProcessPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      payoutId,
      method,
    }: {
      payoutId: string;
      method: 'ACH' | 'CHECK' | 'WIRE';
    }) => {
      const response = await apiClient.post(
        `/commissions/payouts/${payoutId}/process`,
        { method }
      );
      return unwrap<CommissionPayout>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: payoutKeys.detail(variables.payoutId),
      });
      queryClient.invalidateQueries({ queryKey: payoutKeys.lists() });
    },
  });
}

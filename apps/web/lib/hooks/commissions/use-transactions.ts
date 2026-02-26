import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface CommissionTransaction {
  id: string;
  date: string;
  repId: string;
  repName: string;
  loadId: string;
  loadNumber: string;
  orderNumber: string;
  orderAmount: number;
  marginPercent: number;
  commissionAmount: number;
  rate: number;
  planName: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'VOID';
  voidReason?: string;
  createdAt: string;
}

export interface TransactionListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface TransactionListResponse {
  data: CommissionTransaction[];
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

export const transactionKeys = {
  all: ['commissions', 'transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (params: TransactionListParams) =>
    [...transactionKeys.lists(), params] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};

// ===========================
// Helpers
// ===========================

function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

function mapTransaction(raw: any): CommissionTransaction {
  const firstName = raw.user?.firstName ?? '';
  const lastName = raw.user?.lastName ?? '';
  const repName = `${firstName} ${lastName}`.trim() || raw.user?.email || 'Unknown';
  return {
    id: raw.id,
    date: raw.commissionPeriod ?? raw.createdAt,
    repId: raw.userId,
    repName,
    loadId: raw.loadId ?? '',
    loadNumber: raw.load?.loadNumber ?? 'N/A',
    orderNumber: raw.order?.orderNumber ?? 'N/A',
    orderAmount: raw.order?.totalCharges != null ? Number(raw.order.totalCharges) : 0,
    marginPercent: raw.rateApplied != null ? Number(raw.rateApplied) : 0,
    commissionAmount: Number(raw.commissionAmount ?? 0),
    rate: Number(raw.rateApplied ?? 0),
    planName: raw.plan?.name ?? 'N/A',
    status: raw.status === 'REVERSED' ? 'VOID' : (raw.status ?? 'PENDING'),
    voidReason: raw.reversalReason ?? undefined,
    createdAt: raw.createdAt,
  };
}

// ===========================
// Query Hooks
// ===========================

export function useTransactions(params: TransactionListParams = {}) {
  return useQuery<TransactionListResponse>({
    queryKey: transactionKeys.list(params),
    queryFn: async () => {
      const searchParams: Record<string, string | number | undefined> = {};
      if (params.page) searchParams.page = params.page;
      if (params.limit) searchParams.limit = params.limit;
      if (params.search) searchParams.search = params.search;
      if (params.status && params.status !== 'all')
        searchParams.status = params.status;
      if (params.startDate) searchParams.startDate = params.startDate;
      if (params.endDate) searchParams.endDate = params.endDate;
      if (params.sortBy) searchParams.sortBy = params.sortBy;
      if (params.sortOrder) searchParams.sortOrder = params.sortOrder;

      const response = await apiClient.get(
        '/commissions/transactions',
        searchParams
      );
      const raw = response as { data: any[]; pagination: TransactionListResponse['pagination'] };
      return {
        data: (raw.data ?? []).map(mapTransaction),
        pagination: raw.pagination,
      };
    },
    placeholderData: (previousData) => previousData,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export function useApproveTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await apiClient.post(
        `/commissions/transactions/${transactionId}/approve`
      );
      return unwrap<CommissionTransaction>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
}

export function useVoidTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      transactionId,
      reason,
    }: {
      transactionId: string;
      reason: string;
    }) => {
      const response = await apiClient.post(
        `/commissions/transactions/${transactionId}/void`,
        { reason }
      );
      return unwrap<CommissionTransaction>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
}

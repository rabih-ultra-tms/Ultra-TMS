import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface CollectionAccount {
  id: string;
  tenantId: string;
  companyId: string;
  outstandingAmount: number;
  daysOverdue: number;
  agingBucket: '0-30' | '31-60' | '61-90' | '91-120' | '120+';
  invoiceCount: number;
  lastPaymentDate?: string | null;
  nextFollowupDate?: string | null;
  status?: 'PENDING' | 'COMPLETED' | 'FAILED';
  activityType?: 'CALL' | 'EMAIL' | 'PAYMENT' | 'FOLLOW_UP';
  activityDate?: string;
  amount?: number;
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgingBucket {
  name: string;
  range: string;
  label?: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface AgingReport {
  buckets: AgingBucket[];
  totalOutstanding: number;
  totalCount: number;
  generatedAt: string;
}

export interface CollectionsQueueParams {
  page?: number;
  limit?: number;
  agingBucket?: '0-30' | '31-60' | '61-90' | '91-120' | '120+';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface CollectionsQueueResponse {
  data: CollectionAccount[];
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

export const collectionsKeys = {
  all: ['credit-collections'] as const,
  queues: () => [...collectionsKeys.all, 'queue'] as const,
  queue: (params: CollectionsQueueParams) =>
    [...collectionsKeys.queues(), params] as const,
  reports: () => [...collectionsKeys.all, 'report'] as const,
  report: () => [...collectionsKeys.reports(), 'aging'] as const,
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

export function useCollectionsQueue(params: CollectionsQueueParams = {}) {
  return useQuery<CollectionsQueueResponse>({
    queryKey: collectionsKeys.queue(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.agingBucket)
        searchParams.set('agingBucket', params.agingBucket);
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

      const query = searchParams.toString();
      const url = query
        ? `/credit/collections?${query}`
        : '/credit/collections';
      const response = await apiClient.get(url);
      const raw = response as {
        data: CollectionAccount[];
        pagination: CollectionsQueueResponse['pagination'];
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

export function useAgingReport() {
  return useQuery<AgingReport>({
    queryKey: collectionsKeys.report(),
    queryFn: async () => {
      const response = await apiClient.get('/credit/collections/aging');
      return unwrap<AgingReport>(response);
    },
    staleTime: 300_000, // Cache aging report for 5 minutes
  });
}

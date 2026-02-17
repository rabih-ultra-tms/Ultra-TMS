import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface AgingBucket {
  label: string;
  minDays: number;
  maxDays: number | null;
  totalAmount: number;
  invoiceCount: number;
}

export interface AgingCustomerRow {
  customerId: string;
  customerName: string;
  current: number;    // 0-30 days
  days31to60: number;
  days61to90: number;
  days90plus: number;
  totalOutstanding: number;
  invoiceCount: number;
}

export interface AgingReportData {
  buckets: AgingBucket[];
  customers: AgingCustomerRow[];
  totalOutstanding: number;
  asOfDate: string;
}

export interface AgingParams {
  customerId?: string;
  asOfDate?: string;
}

// ===========================
// Query Keys
// ===========================

export const agingKeys = {
  all: ['accounting', 'aging'] as const,
  report: (params: AgingParams) => [...agingKeys.all, params] as const,
};

// ===========================
// Helpers
// ===========================

function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

// ===========================
// Hooks
// ===========================

export function useAgingReport(params: AgingParams = {}) {
  return useQuery<AgingReportData>({
    queryKey: agingKeys.report(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.customerId) searchParams.set('customerId', params.customerId);
      if (params.asOfDate) searchParams.set('asOfDate', params.asOfDate);

      const query = searchParams.toString();
      const url = query ? `/accounting/aging?${query}` : '/accounting/aging';
      const response = await apiClient.get(url);
      return unwrap<AgingReportData>(response);
    },
    staleTime: 60_000,
  });
}

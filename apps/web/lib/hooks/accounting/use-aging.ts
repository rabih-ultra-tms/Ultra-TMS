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

/**
 * Backend returns buckets as an object keyed by label (e.g. { current: { amount, invoices }, '31-60': ... }).
 * Frontend expects AgingBucket[]. This transforms the object shape into the expected array.
 */
function normalizeBuckets(raw: unknown): AgingBucket[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    return Object.entries(raw as Record<string, { min?: number; max?: number; amount?: number; invoices?: unknown[] }>).map(
      ([label, bucket]) => ({
        label,
        minDays: bucket.min ?? 0,
        maxDays: bucket.max === Infinity ? null : (bucket.max ?? null),
        totalAmount: bucket.amount ?? 0,
        invoiceCount: Array.isArray(bucket.invoices) ? bucket.invoices.length : 0,
      }),
    );
  }
  return [];
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
      const raw = unwrap<Record<string, unknown>>(response);
      return {
        buckets: normalizeBuckets(raw.buckets),
        customers: Array.isArray(raw.customers) ? raw.customers as AgingCustomerRow[] : [],
        totalOutstanding: typeof raw.totalOutstanding === 'number' ? raw.totalOutstanding : 0,
        asOfDate: typeof raw.asOfDate === 'string' ? raw.asOfDate : new Date().toISOString(),
      };
    },
    staleTime: 60_000,
  });
}

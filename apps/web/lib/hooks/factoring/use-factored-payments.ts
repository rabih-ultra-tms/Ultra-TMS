import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Types
export interface FactoredPayment {
  id: string;
  settlementId: string;
  factoringCompanyId: string;
  paymentAmount: number | null;
  paymentDate: string | null;
  paymentMethod: 'ACH' | 'CHECK' | 'WIRE' | 'CREDIT_CARD' | null;
  verificationCode: string | null;
  notes: string | null;
  customFields: { status?: FactoredPaymentStatus } & Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  settlement?: { id: string; carrierId: string; totalAmount: number };
  factoringCompany?: { id: string; name: string; companyCode: string };
}

export type FactoredPaymentStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED';

export interface FactoredPaymentList {
  data: FactoredPayment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentFilters {
  status?: FactoredPaymentStatus;
  factoringCompanyId?: string;
  settlementId?: string;
  carrierId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface ProcessPaymentDto {
  paymentAmount?: number;
  paymentDate?: string;
  paymentMethod?: 'ACH' | 'CHECK' | 'WIRE' | 'CREDIT_CARD';
  verificationCode?: string;
  notes?: string;
  status?: FactoredPaymentStatus;
}

// Query key factory
const factoringKeys = {
  all: () => ['factoring'] as const,
  payments: () => ['factoring', 'payments'] as const,
  paymentsList: (filters?: PaymentFilters) =>
    ['factoring', 'payments', 'list', filters] as const,
  payment: (id: string) => ['factoring', 'payments', id] as const,
  stats: () => ['factoring', 'stats'] as const,
};

// Unwrap utility to peel the envelope pattern
function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

// Hook: List factored payments
export function useFactoredPayments(filters?: PaymentFilters) {
  return useQuery<FactoredPaymentList>({
    queryKey: factoringKeys.paymentsList(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.factoringCompanyId)
        params.set('factoringCompanyId', filters.factoringCompanyId);
      if (filters?.settlementId)
        params.set('settlementId', filters.settlementId);
      if (filters?.carrierId) params.set('carrierId', filters.carrierId);
      if (filters?.fromDate) params.set('fromDate', filters.fromDate);
      if (filters?.toDate) params.set('toDate', filters.toDate);
      const page = filters?.page ?? 1;
      const limit = filters?.limit ?? 20;
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      const response = await apiClient.get(`/factored-payments?${params}`);
      return response as FactoredPaymentList;
    },
    staleTime: 30_000,
  });
}

// Hook: Get single factored payment
export function useFactoredPayment(id: string) {
  return useQuery<FactoredPayment>({
    queryKey: factoringKeys.payment(id),
    queryFn: async () => {
      const response = await apiClient.get(`/factored-payments/${id}`);
      return unwrap<FactoredPayment>(response);
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

// Hook: Process factored payment (mutation)
export function useProcessPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: ProcessPaymentDto }) =>
      apiClient.post(`/factored-payments/${id}/process`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: factoringKeys.payments() });
    },
  });
}

// Hook: Get factoring stats (derived from payments list)
export function useFactoringStats() {
  const { data } = useFactoredPayments({ limit: 1000 });
  const payments = data?.data ?? [];

  return {
    totalFactoredYTD: payments
      .filter((p) => p.customFields?.status === 'PAID')
      .reduce((sum, p) => sum + (p.paymentAmount ?? 0), 0),
    pendingCount: payments.filter((p) => p.customFields?.status === 'PENDING')
      .length,
    scheduledAmount: payments
      .filter((p) => p.customFields?.status === 'SCHEDULED')
      .reduce((sum, p) => sum + (p.paymentAmount ?? 0), 0),
    failedCount: payments.filter((p) => p.customFields?.status === 'FAILED')
      .length,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface PaymentPlanInstallment {
  id?: string;
  dueDate: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paidDate?: string | null;
  notes?: string;
}

export interface PaymentPlan {
  id: string;
  tenantId: string;
  companyId: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  installmentAmount: number;
  installmentFrequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY';
  status: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  installments?: PaymentPlanInstallment[];
  nextPaymentDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentPlanListParams {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePaymentPlanInput {
  companyId: string;
  totalAmount: number;
  installmentAmount: number;
  installmentFrequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY';
  startDate: string;
}

export interface UpdatePaymentPlanInput {
  installmentAmount?: number;
  installmentFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY';
  endDate?: string;
}

export interface RecordPaymentInput {
  amount: number;
  paymentMethod: string;
  reference?: string;
}

interface PaymentPlanListResponse {
  data: PaymentPlan[];
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

export const paymentPlanKeys = {
  all: ['payment-plans'] as const,
  lists: () => [...paymentPlanKeys.all, 'list'] as const,
  list: (params: PaymentPlanListParams) =>
    [...paymentPlanKeys.lists(), params] as const,
  details: () => [...paymentPlanKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentPlanKeys.details(), id] as const,
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

export function usePaymentPlans(params: PaymentPlanListParams = {}) {
  return useQuery<PaymentPlanListResponse>({
    queryKey: paymentPlanKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.status) searchParams.set('status', params.status);
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

      const query = searchParams.toString();
      const url = query
        ? `/credit/payment-plans?${query}`
        : '/credit/payment-plans';
      const response = await apiClient.get(url);
      const raw = response as {
        data: PaymentPlan[];
        pagination: PaymentPlanListResponse['pagination'];
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

export function usePaymentPlan(id: string) {
  return useQuery<PaymentPlan>({
    queryKey: paymentPlanKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/credit/payment-plans/${id}`);
      return unwrap<PaymentPlan>(response);
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export function useCreatePaymentPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePaymentPlanInput) => {
      const response = await apiClient.post('/credit/payment-plans', input);
      return unwrap<PaymentPlan>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentPlanKeys.lists() });
      toast.success('Payment plan created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create payment plan');
    },
  });
}

export function useUpdatePaymentPlan(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdatePaymentPlanInput) => {
      const response = await apiClient.put(
        `/credit/payment-plans/${planId}`,
        input
      );
      return unwrap<PaymentPlan>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentPlanKeys.detail(planId),
      });
      queryClient.invalidateQueries({ queryKey: paymentPlanKeys.lists() });
      toast.success('Payment plan updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update payment plan');
    },
  });
}

export function useRecordPayment(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RecordPaymentInput) => {
      const response = await apiClient.post(
        `/credit/payment-plans/${planId}/record-payment`,
        input
      );
      return unwrap<PaymentPlan>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentPlanKeys.detail(planId),
      });
      queryClient.invalidateQueries({ queryKey: paymentPlanKeys.lists() });
      toast.success('Payment recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record payment');
    },
  });
}

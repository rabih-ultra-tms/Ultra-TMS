import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface CreditApplication {
  id: string;
  tenantId: string;
  companyId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  creditLimit?: number | null;
  appliedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  requestedAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditApplicationListParams {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCreditApplicationInput {
  companyId: string;
  requestedAmount: number;
}

export interface ApproveCreditApplicationInput {
  creditLimit: number;
}

export interface RejectCreditApplicationInput {
  rejectionReason: string;
}

interface CreditApplicationListResponse {
  data: CreditApplication[];
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

export const creditApplicationKeys = {
  all: ['credit-applications'] as const,
  lists: () => [...creditApplicationKeys.all, 'list'] as const,
  list: (params: CreditApplicationListParams) =>
    [...creditApplicationKeys.lists(), params] as const,
  details: () => [...creditApplicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...creditApplicationKeys.details(), id] as const,
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

export function useCreditApplications(
  params: CreditApplicationListParams = {}
) {
  return useQuery<CreditApplicationListResponse>({
    queryKey: creditApplicationKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.status) searchParams.set('status', params.status);
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

      const query = searchParams.toString();
      const url = query
        ? `/credit/applications?${query}`
        : '/credit/applications';
      const response = await apiClient.get(url);
      const raw = response as {
        data: CreditApplication[];
        pagination: CreditApplicationListResponse['pagination'];
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

export function useCreditApplication(id: string) {
  return useQuery<CreditApplication>({
    queryKey: creditApplicationKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/credit/applications/${id}`);
      return unwrap<CreditApplication>(response);
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export function useCreateCreditApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCreditApplicationInput) => {
      const response = await apiClient.post('/credit/applications', input);
      return unwrap<CreditApplication>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: creditApplicationKeys.lists(),
      });
      toast.success('Credit application created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create credit application');
    },
  });
}

export function useApproveCreditApplication(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ApproveCreditApplicationInput) => {
      const response = await apiClient.post(
        `/credit/applications/${applicationId}/approve`,
        input
      );
      return unwrap<CreditApplication>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: creditApplicationKeys.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: creditApplicationKeys.lists(),
      });
      toast.success('Credit application approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve credit application');
    },
  });
}

export function useRejectCreditApplication(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RejectCreditApplicationInput) => {
      const response = await apiClient.post(
        `/credit/applications/${applicationId}/reject`,
        input
      );
      return unwrap<CreditApplication>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: creditApplicationKeys.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: creditApplicationKeys.lists(),
      });
      toast.success('Credit application rejected successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject credit application');
    },
  });
}

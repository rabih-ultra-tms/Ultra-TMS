import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

// Frontend-friendly aliases used by form UI
export type PlanType =
  | 'PERCENTAGE'
  | 'FLAT'
  | 'TIERED_PERCENTAGE'
  | 'TIERED_FLAT';

// Backend PlanType enum values (what the API actually returns)
export type BackendPlanType =
  | 'FLAT_FEE'
  | 'PERCENT_REVENUE'
  | 'PERCENT_MARGIN'
  | 'TIERED'
  | 'CUSTOM';

export interface PlanTier {
  minMargin: number;
  maxMargin: number | null;
  rate: number;
}

// Backend tier structure (what the API actually returns)
export interface BackendPlanTier {
  id: string;
  tierNumber: number;
  tierName: string | null;
  thresholdType: string;
  thresholdMin: number;
  thresholdMax: number | null;
  rateType: string;
  rateAmount: number;
  periodType: string | null;
}

// Matches the actual API response from Prisma
export interface CommissionPlan {
  id: string;
  name: string;
  planType: BackendPlanType;
  description: string | null;
  percentRate: number | null;
  flatAmount: number | null;
  tiers: BackendPlanTier[];
  status: string;
  isDefault: boolean;
  effectiveDate: string;
  endDate: string | null;
  _count?: { assignments: number; entries: number };
  createdAt: string;
  updatedAt: string;
}

export interface PlanListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PlanListResponse {
  data: CommissionPlan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePlanInput {
  name: string;
  planType: string;
  description?: string;
  percentRate?: number;
  flatAmount?: number;
  effectiveDate: string;
  endDate?: string;
  calculationBasis?: string;
  minimumMarginPercent?: number;
  isDefault?: boolean;
  tiers?: {
    tierNumber: number;
    tierName?: string;
    thresholdType: string;
    thresholdMin: number;
    thresholdMax?: number;
    rateType: string;
    rateAmount: number;
    periodType?: string;
  }[];
}

export interface UpdatePlanInput {
  name?: string;
  description?: string;
  status?: string;
  endDate?: string;
  flatAmount?: number;
  percentRate?: number;
}

// ===========================
// Query Keys
// ===========================

export const planKeys = {
  all: ['commissions', 'plans'] as const,
  lists: () => [...planKeys.all, 'list'] as const,
  list: (params: PlanListParams) => [...planKeys.lists(), params] as const,
  details: () => [...planKeys.all, 'detail'] as const,
  detail: (id: string) => [...planKeys.details(), id] as const,
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

export function usePlans(params: PlanListParams = {}) {
  return useQuery<PlanListResponse>({
    queryKey: planKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.search) searchParams.set('search', params.search);
      if (params.type && params.type !== 'all')
        searchParams.set('type', params.type);
      if (params.isActive && params.isActive !== 'all')
        searchParams.set('isActive', params.isActive);
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

      const query = searchParams.toString();
      const url = query ? `/commissions/plans?${query}` : '/commissions/plans';
      const response = await apiClient.get(url);
      // The global interceptor returns { success, data: [...], pagination: {...} }
      const raw = response as { data: any[]; pagination: PlanListResponse['pagination'] };
      return {
        data: raw.data ?? [],
        pagination: raw.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    },
    placeholderData: (previousData) => previousData,
  });
}

export function usePlan(id: string) {
  return useQuery<CommissionPlan>({
    queryKey: planKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/commissions/plans/${id}`);
      return unwrap<CommissionPlan>(response);
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePlanInput) => {
      const response = await apiClient.post('/commissions/plans', input);
      return unwrap<CommissionPlan>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdatePlanInput & { id: string }) => {
      const response = await apiClient.patch(`/commissions/plans/${id}`, input);
      return unwrap<CommissionPlan>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: planKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/commissions/plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
    },
  });
}

export function useActivatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(
        `/commissions/plans/${id}/activate`
      );
      return unwrap<CommissionPlan>(response);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: planKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
    },
  });
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export type AccountType =
  | 'ASSET'
  | 'LIABILITY'
  | 'EQUITY'
  | 'REVENUE'
  | 'EXPENSE';

export type NormalBalance = 'DEBIT' | 'CREDIT';

export interface ChartOfAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  accountSubType?: string;
  parentAccountId?: string;
  description?: string;
  normalBalance: NormalBalance;
  isActive: boolean;
  isSystemAccount: boolean;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChartOfAccountsParams {
  page?: number;
  limit?: number;
  type?: AccountType | 'all';
  active?: boolean;
}

export interface ChartOfAccountsResponse {
  data: ChartOfAccount[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAccountPayload {
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  accountSubType?: string;
  parentAccountId?: string;
  description?: string;
  normalBalance: NormalBalance;
  isActive?: boolean;
}

// ===========================
// Query Keys
// ===========================

export const chartOfAccountsKeys = {
  all: ['chart-of-accounts'] as const,
  lists: () => [...chartOfAccountsKeys.all, 'list'] as const,
  list: (params: ChartOfAccountsParams) =>
    [...chartOfAccountsKeys.lists(), params] as const,
  details: () => [...chartOfAccountsKeys.all, 'detail'] as const,
  detail: (id: string) => [...chartOfAccountsKeys.details(), id] as const,
};

// ===========================
// Helpers
// ===========================

function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  if (body.pagination) {
    return { data: body.data, pagination: body.pagination } as T;
  }
  return (body.data ?? response) as T;
}

// ===========================
// Query Hooks
// ===========================

export function useChartOfAccounts(params: ChartOfAccountsParams) {
  return useQuery<ChartOfAccountsResponse>({
    queryKey: chartOfAccountsKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.type && params.type !== 'all')
        searchParams.set('type', params.type);
      if (params.active !== undefined)
        searchParams.set('active', params.active.toString());

      const response = await apiClient.get(
        `/chart-of-accounts?${searchParams.toString()}`
      );
      return unwrap<ChartOfAccountsResponse>(response);
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useAccount(id: string) {
  return useQuery<ChartOfAccount>({
    queryKey: chartOfAccountsKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/chart-of-accounts/${id}`);
      return unwrap<ChartOfAccount>(response);
    },
    enabled: !!id,
    staleTime: 30_000,
    retry: 2,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAccountPayload) => {
      const response = await apiClient.post('/chart-of-accounts', payload);
      return unwrap<ChartOfAccount>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chartOfAccountsKeys.all });
      toast.success('Account created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create account');
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: Partial<CreateAccountPayload> & { id: string }) => {
      const response = await apiClient.put(`/chart-of-accounts/${id}`, payload);
      return unwrap<ChartOfAccount>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chartOfAccountsKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: chartOfAccountsKeys.lists() });
      toast.success('Account updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update account');
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/chart-of-accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chartOfAccountsKeys.all });
      toast.success('Account deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete account');
    },
  });
}

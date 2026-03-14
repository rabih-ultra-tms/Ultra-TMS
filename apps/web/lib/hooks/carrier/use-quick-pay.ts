'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export enum QuickPayStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
}

export enum QuickPayReason {
  EMERGENCY = 'Emergency',
  FUEL = 'Fuel',
  SUPPLIES = 'Supplies',
  OTHER = 'Other',
}

export interface QuickPayRequest {
  id: string;
  carrierId: string;
  amount: number;
  fee: number;
  netAmount: number;
  reason: string;
  notes?: string;
  status: QuickPayStatus;
  trackingNumber: string;
  requestDate: string;
  approvalDate?: string;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuickPayInput {
  amount: number;
  reason: string;
  notes?: string;
}

export interface QuickPayResponse {
  id: string;
  trackingNumber: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: QuickPayStatus;
}

export const quickPayKeys = {
  all: ['quick-pay'] as const,
  list: () => [...quickPayKeys.all, 'list'] as const,
  detail: (id: string) => [...quickPayKeys.all, 'detail', id] as const,
  calculate: (amount: number) =>
    [...quickPayKeys.all, 'calculate', amount] as const,
};

export function useQuickPayHistory() {
  return useQuery({
    queryKey: quickPayKeys.list(),
    queryFn: async () => {
      const response = await apiClient.get<QuickPayRequest[]>(
        '/carrier-portal/quick-pay'
      );
      return response;
    },
    staleTime: 30_000,
  });
}

export function useQuickPayStatus(requestId: string) {
  return useQuery({
    queryKey: quickPayKeys.detail(requestId),
    queryFn: async () => {
      const response = await apiClient.get<QuickPayRequest>(
        `/carrier-portal/quick-pay/${requestId}`
      );
      return response;
    },
    staleTime: 30_000,
    enabled: !!requestId,
  });
}

export function useCreateQuickPayRequest(settlementId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateQuickPayInput) => {
      const response = await apiClient.post<QuickPayResponse>(
        `/carrier-portal/quick-pay/${settlementId}`,
        input
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: quickPayKeys.list(),
      });
    },
  });
}

export function useCancelQuickPayRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      await apiClient.post(`/carrier-portal/quick-pay/${requestId}/cancel`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: quickPayKeys.list(),
      });
    },
  });
}

// Fee calculation helper
export function calculateQuickPayFee(amount: number): number {
  const percentage = amount * 0.02;
  return Math.max(percentage, 100);
}

export function calculateNetAmount(amount: number, fee: number): number {
  return amount - fee;
}

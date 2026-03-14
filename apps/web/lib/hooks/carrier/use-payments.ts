'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export interface Payment {
  id: string;
  loadId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentDate: string;
  paymentMethod: string;
  paymentNumber?: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settlement {
  id: string;
  settlementNumber: string;
  settlementDate: string;
  dueDate: string;
  grossAmount: number;
  deductionsTotal: number;
  quickPayFee: number;
  netAmount: number;
  amountPaid: number;
  balanceDue: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  totalEarnings: number;
  pendingPayments: number;
  lastPaymentDate?: string;
  totalPayments: number;
}

export interface PaymentFilters {
  status?: PaymentStatus | 'ALL';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const paymentKeys = {
  all: ['payments'] as const,
  list: (filters?: PaymentFilters) =>
    [...paymentKeys.all, 'list', filters] as const,
  detail: (id: string) => [...paymentKeys.all, 'detail', id] as const,
  summary: () => [...paymentKeys.all, 'summary'] as const,
  settlements: (filters?: { limit?: number; offset?: number }) =>
    [...paymentKeys.all, 'settlements', filters] as const,
};

export function usePaymentHistory(filters?: PaymentFilters) {
  return useQuery({
    queryKey: paymentKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.status && filters.status !== 'ALL') {
        params.append('status', filters.status);
      }
      if (filters?.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        params.append('endDate', filters.endDate);
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }
      if (filters?.offset) {
        params.append('offset', filters.offset.toString());
      }

      const queryString = params.toString();
      const path = queryString
        ? `/carrier-portal/payments?${queryString}`
        : '/carrier-portal/payments';

      const response = await apiClient.get<Payment[]>(path);
      return response;
    },
    staleTime: 30_000,
  });
}

export function usePaymentSummary() {
  return useQuery({
    queryKey: paymentKeys.summary(),
    queryFn: async () => {
      const response = await apiClient.get<PaymentSummary>(
        '/carrier-portal/payments/summary'
      );
      return response;
    },
    staleTime: 30_000,
  });
}

export function usePaymentDetail(paymentId: string) {
  return useQuery({
    queryKey: paymentKeys.detail(paymentId),
    queryFn: async () => {
      const response = await apiClient.get<Payment>(
        `/carrier-portal/payments/${paymentId}`
      );
      return response;
    },
    staleTime: 60_000,
  });
}

export function useSettlementHistory(filters?: {
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: paymentKeys.settlements(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }
      if (filters?.offset) {
        params.append('offset', filters.offset.toString());
      }

      const queryString = params.toString();
      const path = queryString
        ? `/carrier-portal/settlements?${queryString}`
        : '/carrier-portal/settlements';

      const response = await apiClient.get<Settlement[]>(path);
      return response;
    },
    staleTime: 30_000,
  });
}

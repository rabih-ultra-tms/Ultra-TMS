"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// ===========================
// Types
// ===========================

export type PaymentStatus = "PENDING" | "APPLIED" | "PARTIAL" | "VOIDED";

export type PaymentMethod = "CHECK" | "ACH" | "WIRE" | "CREDIT_CARD";

export interface PaymentAllocation {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  invoiceTotal: number;
  invoiceBalance: number;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  status: PaymentStatus;
  customerId: string;
  customerName: string;
  amount: number;
  appliedAmount: number;
  unappliedAmount: number;
  method: PaymentMethod;
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
  allocations: PaymentAllocation[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
  method?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface PaymentListResponse {
  data: Payment[];
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

export const paymentKeys = {
  all: ["payments-received"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: (params: PaymentListParams) =>
    [...paymentKeys.lists(), params] as const,
  details: () => [...paymentKeys.all, "detail"] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
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

export function usePayments(params: PaymentListParams) {
  return useQuery<PaymentListResponse>({
    queryKey: paymentKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.search) searchParams.set("search", params.search);
      if (params.status && params.status !== "all")
        searchParams.set("status", params.status);
      if (params.customerId)
        searchParams.set("customerId", params.customerId);
      if (params.method && params.method !== "all")
        searchParams.set("method", params.method);
      if (params.fromDate) searchParams.set("fromDate", params.fromDate);
      if (params.toDate) searchParams.set("toDate", params.toDate);
      if (params.sortBy) searchParams.set("sortBy", params.sortBy);
      if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

      const response = await apiClient.get(
        `/payments-received?${searchParams.toString()}`
      );
      return unwrap<PaymentListResponse>(response);
    },
    placeholderData: (previousData) => previousData,
  });
}

export function usePayment(id: string) {
  return useQuery<Payment>({
    queryKey: paymentKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/payments-received/${id}`);
      return unwrap<Payment>(response);
    },
    enabled: !!id,
    staleTime: 30_000,
    retry: 2,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export interface CreatePaymentPayload {
  customerId: string;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
}

export interface AllocatePaymentPayload {
  allocations: {
    invoiceId: string;
    amount: number;
  }[];
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePaymentPayload) => {
      const response = await apiClient.post("/payments-received", payload);
      return unwrap<Payment>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: Partial<CreatePaymentPayload> & { id: string }) => {
      const response = await apiClient.put(`/payments-received/${id}`, payload);
      return unwrap<Payment>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/payments-received/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
}

export function useAllocatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: AllocatePaymentPayload & { id: string }) => {
      const response = await apiClient.post(
        `/payments-received/${id}/allocate`,
        payload
      );
      return unwrap<Payment>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      // Also invalidate invoices since allocation affects balances
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

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

export type PayableStatus = "PENDING" | "ELIGIBLE" | "PAID" | "PROCESSING";

export interface Payable {
  id: string;
  carrierId: string;
  carrierName: string;
  loadId: string;
  loadNumber: string;
  amount: number;
  status: PayableStatus;
  deliveryDate: string;
  paymentDueDate: string;
  quickPayEligible: boolean;
  quickPayDiscount: number;
  quickPayAmount: number;
  paymentTerms: string;
  settlementId?: string;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayableListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  carrierId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface PayableListResponse {
  data: Payable[];
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

export const payableKeys = {
  all: ["payments-made"] as const,
  lists: () => [...payableKeys.all, "list"] as const,
  list: (params: PayableListParams) =>
    [...payableKeys.lists(), params] as const,
  details: () => [...payableKeys.all, "detail"] as const,
  detail: (id: string) => [...payableKeys.details(), id] as const,
};

// ===========================
// Helpers
// ===========================

function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body["data"] ?? response) as T;
}

// ===========================
// Query Hooks
// ===========================

export function usePayables(params: PayableListParams) {
  return useQuery<PayableListResponse>({
    queryKey: payableKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.search) searchParams.set("search", params.search);
      if (params.status && params.status !== "all")
        searchParams.set("status", params.status);
      if (params.carrierId) searchParams.set("carrierId", params.carrierId);
      if (params.fromDate) searchParams.set("fromDate", params.fromDate);
      if (params.toDate) searchParams.set("toDate", params.toDate);
      if (params.sortBy) searchParams.set("sortBy", params.sortBy);
      if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

      const response = await apiClient.get(
        `/payments-made?${searchParams.toString()}`
      );
      return unwrap<PayableListResponse>(response);
    },
    placeholderData: (previousData) => previousData,
  });
}

export function usePayable(id: string) {
  return useQuery<Payable>({
    queryKey: payableKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/payments-made/${id}`);
      return unwrap<Payable>(response);
    },
    enabled: !!id,
    staleTime: 30_000,
    retry: 2,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export function useProcessPayable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/payments-made/${id}/process`);
      return unwrap<Payable>(response);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: payableKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: payableKeys.lists() });
    },
  });
}

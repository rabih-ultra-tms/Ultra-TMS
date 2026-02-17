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

export type SettlementStatus = "CREATED" | "APPROVED" | "PROCESSED" | "PAID";

export interface SettlementLineItem {
  id: string;
  payableId: string;
  loadNumber: string;
  description: string;
  amount: number;
}

export interface Settlement {
  id: string;
  settlementNumber: string;
  carrierId: string;
  carrierName: string;
  status: SettlementStatus;
  lineItems: SettlementLineItem[];
  grossAmount: number;
  deductions: number;
  netAmount: number;
  approvedAt?: string;
  approvedBy?: string;
  processedAt?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementListParams {
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

interface SettlementListResponse {
  data: Settlement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateSettlementPayload {
  carrierId: string;
  payableIds: string[];
  deductions?: number;
  notes?: string;
}

// ===========================
// Query Keys
// ===========================

export const settlementKeys = {
  all: ["settlements"] as const,
  lists: () => [...settlementKeys.all, "list"] as const,
  list: (params: SettlementListParams) =>
    [...settlementKeys.lists(), params] as const,
  details: () => [...settlementKeys.all, "detail"] as const,
  detail: (id: string) => [...settlementKeys.details(), id] as const,
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

export function useSettlements(params: SettlementListParams) {
  return useQuery<SettlementListResponse>({
    queryKey: settlementKeys.list(params),
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
        `/settlements?${searchParams.toString()}`
      );
      return unwrap<SettlementListResponse>(response);
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useSettlement(id: string) {
  return useQuery<Settlement>({
    queryKey: settlementKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/settlements/${id}`);
      return unwrap<Settlement>(response);
    },
    enabled: !!id,
    staleTime: 30_000,
    retry: 2,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export function useCreateSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSettlementPayload) => {
      const response = await apiClient.post("/settlements", payload);
      return unwrap<Settlement>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.lists() });
    },
  });
}

export function useApproveSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/settlements/${id}/approve`);
      return unwrap<Settlement>(response);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: settlementKeys.lists() });
    },
  });
}

export function useProcessSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/settlements/${id}/process`);
      return unwrap<Settlement>(response);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: settlementKeys.lists() });
    },
  });
}

export function useDeleteSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/settlements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.lists() });
    },
  });
}

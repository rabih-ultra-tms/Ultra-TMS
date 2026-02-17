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

export type InvoiceStatus =
  | "DRAFT"
  | "PENDING"
  | "SENT"
  | "VIEWED"
  | "PARTIAL"
  | "PAID"
  | "OVERDUE"
  | "VOID";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  loadId?: string;
  loadNumber?: string;
}

export interface InvoicePayment {
  id: string;
  paymentNumber: string;
  amount: number;
  date: string;
  method: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  customerId: string;
  customerName: string;
  orderId?: string;
  orderNumber?: string;
  loadId?: string;
  loadNumber?: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  lineItems: InvoiceLineItem[];
  payments?: InvoicePayment[];
  sentAt?: string;
  viewedAt?: string;
  paidAt?: string;
  voidedAt?: string;
  voidReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface InvoiceListResponse {
  data: Invoice[];
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

export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (params: InvoiceListParams) =>
    [...invoiceKeys.lists(), params] as const,
  details: () => [...invoiceKeys.all, "detail"] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
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

export function useInvoices(params: InvoiceListParams) {
  return useQuery<InvoiceListResponse>({
    queryKey: invoiceKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.search) searchParams.set("search", params.search);
      if (params.status && params.status !== "all")
        searchParams.set("status", params.status);
      if (params.customerId)
        searchParams.set("customerId", params.customerId);
      if (params.fromDate) searchParams.set("fromDate", params.fromDate);
      if (params.toDate) searchParams.set("toDate", params.toDate);
      if (params.sortBy) searchParams.set("sortBy", params.sortBy);
      if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

      const response = await apiClient.get(
        `/invoices?${searchParams.toString()}`
      );
      return unwrap<InvoiceListResponse>(response);
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: invoiceKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/invoices/${id}`);
      return unwrap<Invoice>(response);
    },
    enabled: !!id,
    staleTime: 30_000,
    retry: 2,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export interface CreateInvoicePayload {
  customerId: string;
  orderId?: string;
  loadId?: string;
  invoiceDate: string;
  paymentTerms: string;
  notes?: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    loadId?: string;
  }[];
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateInvoicePayload) => {
      const response = await apiClient.post("/invoices", payload);
      return unwrap<Invoice>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: Partial<CreateInvoicePayload> & { id: string }) => {
      const response = await apiClient.put(`/invoices/${id}`, payload);
      return unwrap<Invoice>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/invoices/${id}/send`);
      return unwrap<Invoice>(response);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useVoidInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await apiClient.post(`/invoices/${id}/void`, {
        reason,
      });
      return unwrap<Invoice>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: InvoiceStatus;
    }) => {
      const response = await apiClient.patch(`/invoices/${id}/status`, {
        status,
      });
      return unwrap<Invoice>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

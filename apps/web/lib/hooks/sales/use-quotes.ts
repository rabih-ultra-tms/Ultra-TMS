import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  Quote,
  QuoteListParams,
  QuoteListResponse,
  QuoteStats,
} from "@/types/quotes";

const QUOTES_KEY = "quotes";

export function useQuotes(params: QuoteListParams) {
  return useQuery({
    queryKey: [QUOTES_KEY, "list", params],
    queryFn: async () => {
      const cleanParams: Record<string, string | number> = {
        page: Number(params.page) || 1,
        limit: Number(params.limit) || 25,
      };

      if (params.search) cleanParams.search = params.search;
      if (params.status) cleanParams.status = params.status;
      if (params.customerId) cleanParams.customerId = params.customerId;
      if (params.serviceType) cleanParams.serviceType = params.serviceType;
      if (params.fromDate) cleanParams.fromDate = params.fromDate;
      if (params.toDate) cleanParams.toDate = params.toDate;
      if (params.sortBy) cleanParams.sortBy = params.sortBy;
      if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;

      return await apiClient.get<QuoteListResponse>("/quotes", cleanParams);
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useQuoteStats() {
  return useQuery({
    queryKey: [QUOTES_KEY, "stats"],
    queryFn: async () => {
      return await apiClient.get<QuoteStats>("/quotes/stats");
    },
    staleTime: 30000,
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/quotes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY] });
    },
  });
}

export function useCloneQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.post<Quote>(`/quotes/${id}/clone`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY] });
    },
  });
}

export function useSendQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.post<Quote>(`/quotes/${id}/send`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY] });
    },
  });
}

export function useConvertQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.post<Quote>(`/quotes/${id}/convert`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY] });
    },
  });
}

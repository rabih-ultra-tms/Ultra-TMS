import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  Quote,
  QuoteDetail,
  QuoteListParams,
  QuoteListResponse,
  QuoteStats,
  QuoteVersion,
  QuoteTimelineEvent,
  QuoteNote,
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
      return await apiClient.post<{ orderId: string; orderNumber: string }>(`/quotes/${id}/convert`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY] });
    },
  });
}

// --- Detail page hooks ---

export function useQuote(id: string) {
  return useQuery({
    queryKey: [QUOTES_KEY, "detail", id],
    queryFn: () => apiClient.get<QuoteDetail>(`/quotes/${id}`),
    enabled: !!id,
  });
}

export function useQuoteVersions(id: string) {
  return useQuery({
    queryKey: [QUOTES_KEY, "versions", id],
    queryFn: () => apiClient.get<QuoteVersion[]>(`/quotes/${id}/versions`),
    enabled: !!id,
  });
}

export function useQuoteTimeline(id: string) {
  return useQuery({
    queryKey: [QUOTES_KEY, "timeline", id],
    queryFn: () => apiClient.get<QuoteTimelineEvent[]>(`/quotes/${id}/timeline`),
    enabled: !!id,
  });
}

export function useQuoteNotes(id: string) {
  return useQuery({
    queryKey: [QUOTES_KEY, "notes", id],
    queryFn: () => apiClient.get<QuoteNote[]>(`/quotes/${id}/notes`),
    enabled: !!id,
  });
}

export function useAddQuoteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      return await apiClient.post<QuoteNote>(`/quotes/${id}/notes`, { content });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY, "notes", variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY, "timeline", variables.id] });
    },
  });
}

export function useAcceptQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.post<Quote>(`/quotes/${id}/accept`);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY, "detail", id] });
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY, "timeline", id] });
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY] });
    },
  });
}

export function useRejectQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await apiClient.post<Quote>(`/quotes/${id}/reject`, { reason });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY, "detail", variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY, "timeline", variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY] });
    },
  });
}

export function useCreateQuoteVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.post<Quote>(`/quotes/${id}/version`);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY, "detail", id] });
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY, "versions", id] });
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY] });
    },
  });
}

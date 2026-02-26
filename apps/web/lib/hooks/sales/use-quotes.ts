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
  QuoteFormValues,
  CalculateRateRequest,
  CalculateRateResponse,
} from "@/types/quotes";

const QUOTES_KEY = "quotes";

function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

/** Map frontend QuoteFormValues field names → API DTO field names */
function mapFormToDto(data: QuoteFormValues): Record<string, unknown> {
  const { accessorials, ...rest } = data;

  const accessorialsTotal = accessorials?.reduce(
    (sum, a) => sum + Number(a.amount ?? 0),
    0,
  ) ?? 0;

  const stops = rest.stops?.map((s) => {
    const raw = s as unknown as Record<string, unknown>;
    return {
      stopType: raw.stopType ?? s.type,
      stopSequence: raw.stopSequence ?? s.sequence,
      city: s.city,
      state: s.state,
      addressLine1: (raw.addressLine1 ?? s.address ?? "") as string,
      addressLine2: raw.addressLine2 as string | undefined,
      postalCode: (raw.postalCode ?? raw.zipCode ?? "") as string,
      facilityName: s.facilityName,
      contactName: s.contactName,
      contactPhone: s.contactPhone,
      notes: s.notes,
    };
  });

  const validUntil = rest.validityDays
    ? new Date(Date.now() + rest.validityDays * 86_400_000).toISOString()
    : undefined;

  return {
    companyId: rest.customerId,
    contactId: rest.contactId,
    customerName: rest.customerName,
    serviceType: rest.serviceType,
    equipmentType: rest.equipmentType,
    commodity: rest.commodity,
    weightLbs: rest.weight,
    pieces: rest.pieces,
    pallets: rest.pallets,
    linehaulRate: rest.linehaulRate,
    fuelSurcharge: rest.fuelSurcharge,
    accessorialsTotal,
    totalAmount: (rest.linehaulRate ?? 0) + (rest.fuelSurcharge ?? 0) + accessorialsTotal,
    internalNotes: rest.internalNotes,
    validUntil,
    stops,
  };
}

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
      const response = await apiClient.get<{ data: QuoteStats }>("/quotes/stats");
      return response.data;
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
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: [QUOTES_KEY, "detail", id] });
      queryClient.removeQueries({ queryKey: [QUOTES_KEY, "timeline", id] });
      queryClient.removeQueries({ queryKey: [QUOTES_KEY, "notes", id] });
      queryClient.removeQueries({ queryKey: [QUOTES_KEY, "versions", id] });
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY, "list"] });
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY, "stats"] });
    },
  });
}

export function useCloneQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<unknown>(`/quotes/${id}/clone`);
      return unwrap<Quote>(res);
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
      const res = await apiClient.post<unknown>(`/quotes/${id}/send`);
      return unwrap<Quote>(res);
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
      const res = await apiClient.post<unknown>(`/quotes/${id}/convert`);
      return unwrap<{ orderId: string; orderNumber: string }>(res);
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
    queryFn: async () => {
      const res = await apiClient.get<unknown>(`/quotes/${id}`);
      return unwrap<QuoteDetail>(res);
    },
    enabled: !!id,
  });
}

export function useQuoteVersions(id: string) {
  return useQuery({
    queryKey: [QUOTES_KEY, "versions", id],
    queryFn: async () => {
      const res = await apiClient.get<unknown>(`/quotes/${id}/versions`);
      return unwrap<QuoteVersion[]>(res);
    },
    enabled: !!id,
  });
}

export function useQuoteTimeline(id: string) {
  return useQuery({
    queryKey: [QUOTES_KEY, "timeline", id],
    queryFn: async () => {
      const res = await apiClient.get<unknown>(`/quotes/${id}/timeline`);
      return unwrap<QuoteTimelineEvent[]>(res);
    },
    enabled: !!id,
  });
}

export function useQuoteNotes(id: string) {
  return useQuery({
    queryKey: [QUOTES_KEY, "notes", id],
    queryFn: async () => {
      const res = await apiClient.get<unknown>(`/quotes/${id}/notes`);
      return unwrap<QuoteNote[]>(res);
    },
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
      const res = await apiClient.post<unknown>(`/quotes/${id}/accept`);
      return unwrap<Quote>(res);
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
      const res = await apiClient.post<unknown>(`/quotes/${id}/reject`, { reason });
      return unwrap<Quote>(res);
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
      const res = await apiClient.post<unknown>(`/quotes/${id}/version`);
      return unwrap<Quote>(res);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY, "detail", id] });
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY, "versions", id] });
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY] });
    },
  });
}

// --- Form hooks ---

export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: QuoteFormValues) => {
      const dto = mapFormToDto(data);
      const res = await apiClient.post<unknown>("/quotes", dto);
      return unwrap<Quote>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY] });
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: QuoteFormValues }) => {
      const dto = mapFormToDto(data);
      const res = await apiClient.patch<unknown>(`/quotes/${id}`, dto);
      return unwrap<Quote>(res);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY, "detail", variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY] });
    },
  });
}

export function useCalculateRate() {
  return useMutation({
    mutationFn: async (params: CalculateRateRequest) => {
      return await apiClient.post<CalculateRateResponse>("/quotes/calculate-rate", params);
    },
  });
}

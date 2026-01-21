import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, type PaginatedResponse } from "@/lib/api";
import type { Lead, LeadListParams } from "@/lib/types/crm";
import { toast } from "sonner";

export const leadKeys = {
  all: ["leads"] as const,
  lists: () => [...leadKeys.all, "list"] as const,
  list: (params: LeadListParams) => [...leadKeys.lists(), params] as const,
  details: () => [...leadKeys.all, "detail"] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
  pipeline: () => [...leadKeys.all, "pipeline"] as const,
};

export function useLeads(params: LeadListParams = {}) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => apiClient.get<PaginatedResponse<Lead>>("/crm/opportunities", params),
  });
}

export function useLeadsPipeline() {
  return useQuery({
    queryKey: leadKeys.pipeline(),
    queryFn: () => apiClient.get<{ data: Record<string, Lead[]> }>("/crm/opportunities/pipeline"),
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Lead }>(`/crm/opportunities/${id}`),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Lead>) => apiClient.post<{ data: Lead }>("/crm/opportunities", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.pipeline() });
      toast.success("Lead created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create lead");
    },
  });
}

export function useUpdateLeadStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      apiClient.patch(`/crm/opportunities/${id}/stage`, { stage }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: leadKeys.pipeline() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update stage");
    },
  });
}

export function useConvertLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { customerId?: string } }) =>
      apiClient.post(`/crm/opportunities/${id}/convert`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.pipeline() });
      toast.success("Lead converted to customer");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to convert lead");
    },
  });
}

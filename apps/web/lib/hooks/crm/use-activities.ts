import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, type PaginatedResponse } from "@/lib/api";
import type { Activity, ActivityListParams } from "@/lib/types/crm";
import { toast } from "sonner";

export const activityKeys = {
  all: ["activities"] as const,
  lists: () => [...activityKeys.all, "list"] as const,
  list: (params: ActivityListParams) => [...activityKeys.lists(), params] as const,
  details: () => [...activityKeys.all, "detail"] as const,
  detail: (id: string) => [...activityKeys.details(), id] as const,
};

export function useActivities(params: ActivityListParams = {}) {
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: () => apiClient.get<PaginatedResponse<Activity>>("/crm/activities", params),
  });
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: activityKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Activity }>(`/crm/activities/${id}`),
    enabled: !!id,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Activity>) =>
      apiClient.post<{ data: Activity }>("/crm/activities", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      toast.success("Activity logged");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to log activity");
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Activity> }) =>
      apiClient.patch<{ data: Activity }>(`/crm/activities/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      toast.success("Activity updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update activity");
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/crm/activities/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      toast.success("Activity deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete activity");
    },
  });
}

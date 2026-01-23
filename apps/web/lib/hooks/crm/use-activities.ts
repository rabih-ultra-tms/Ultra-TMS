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

function normalizeActivity(activity: Record<string, unknown>): Activity {
  const activityType = (activity.activityType || activity.type) as Activity["type"];
  const leadId = (activity.leadId || activity.opportunityId) as string | undefined;
  const assignedToId = (activity.assignedToId || activity.ownerId) as string | undefined;
  const assignedTo = (activity.assignedTo || activity.owner) as Activity["assignedTo"];

  return {
    ...(activity as unknown as Activity),
    type: activityType,
    leadId,
    assignedToId,
    assignedTo,
  };
}

function mapActivityListParams(
  params: ActivityListParams
): Record<string, string | number | boolean | undefined | null> {
  return {
    ...params,
    activityType: params.type,
    opportunityId: params.leadId,
  };
}

function mapActivityCreateInput(data: Partial<Activity>) {
  const leadId = data.leadId;
  const companyId = data.companyId;
  const contactId = data.contactId;

  const entityType = leadId
    ? "OPPORTUNITY"
    : companyId
      ? "COMPANY"
      : contactId
        ? "CONTACT"
        : undefined;

  const entityId = leadId || companyId || contactId;

  return {
    activityType: data.type,
    subject: data.subject,
    description: data.description,
    activityDate: data.activityDate,
    dueDate: data.dueDate,
    durationMinutes: data.durationMinutes,
    companyId,
    contactId,
    opportunityId: leadId,
    ownerId: data.assignedToId,
    entityType,
    entityId,
  };
}

function mapActivityUpdateInput(data: Partial<Activity>) {
  return {
    subject: data.subject,
    description: data.description,
    activityDate: data.activityDate,
    dueDate: data.dueDate,
    durationMinutes: data.durationMinutes,
    completedAt: data.completedAt,
    priority: (data as { priority?: string }).priority,
    status: (data as { status?: string }).status,
    outcome: (data as { outcome?: string }).outcome,
    ownerId: data.assignedToId,
    leadId: data.leadId,
  };
}

export function useActivities(params: ActivityListParams = {}) {
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Activity>>(
        "/crm/activities",
        mapActivityListParams(params)
      );
      return {
        ...response,
        data: response.data.map((activity) => normalizeActivity(activity as unknown as Record<string, unknown>)),
      };
    },
  });
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: activityKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<{ data: Activity }>(`/crm/activities/${id}`);
      return { data: normalizeActivity(response.data as unknown as Record<string, unknown>) };
    },
    enabled: !!id,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Activity>) => {
      const response = await apiClient.post<{ data: Activity }>(
        "/crm/activities",
        mapActivityCreateInput(data)
      );
      return { data: normalizeActivity(response.data as unknown as Record<string, unknown>) };
    },
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<Activity> }) => {
      const response = await apiClient.patch<{ data: Activity }>(
        `/crm/activities/${id}`,
        mapActivityUpdateInput(data)
      );
      return { data: normalizeActivity(response.data as unknown as Record<string, unknown>) };
    },
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

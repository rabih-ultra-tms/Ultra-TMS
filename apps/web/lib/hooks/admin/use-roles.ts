import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Role } from "@/lib/types/auth";
import { toast } from "sonner";

interface RolesResponse {
  data: Role[];
}

export const roleKeys = {
  all: ["admin", "roles"] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.all,
    queryFn: () => apiClient.get<RolesResponse>("/roles"),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Role }>(`/roles/${id}`),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.post("/roles", data),
    onSuccess: () => {
      toast.success("Role created");
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create role");
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient.put(`/roles/${id}`, data),
    onSuccess: (_, { id }) => {
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update role");
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => apiClient.delete(`/roles/${roleId}`),
    onSuccess: () => {
      toast.success("Role deleted");
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete role");
    },
  });
}

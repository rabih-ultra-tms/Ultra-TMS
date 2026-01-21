import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Role, Permission } from "@/lib/types/auth";
import { toast } from "sonner";

export const roleKeys = {
  all: ["roles"] as const,
  list: () => [...roleKeys.all, "list"] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
  permissions: () => [...roleKeys.all, "permissions"] as const,
};

export function useRoles(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: () => apiClient.get<{ data: Role[] }>("/roles"),
    enabled: options?.enabled,
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Role }>(`/roles/${id}`),
    enabled: !!id,
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: roleKeys.permissions(),
    queryFn: () => apiClient.get<{ data: Permission[] }>("/roles/permissions"),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Role> & { permissionIds?: string[] }) =>
      apiClient.post<{ data: Role }>("/roles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.list() });
      toast.success("Role created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create role");
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Role> & { permissionIds?: string[] };
    }) => apiClient.put<{ data: Role }>(`/roles/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.list() });
      toast.success("Role updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update role");
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.list() });
      toast.success("Role deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete role");
    },
  });
}

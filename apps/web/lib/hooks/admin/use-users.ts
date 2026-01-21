import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, PaginatedResponse } from "@/lib/api";
import type { User } from "@/lib/types/auth";
import { toast } from "sonner";

export interface UsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  roleId?: string;
}

export const userKeys = {
  all: ["admin", "users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: UsersListParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useUsers(params: UsersListParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<User>>(
        "/admin/users",
        params as Record<string, string | number | boolean | null | undefined>
      ),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => apiClient.get<{ data: User }>(`/admin/users/${id}`),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User> & { password?: string; sendInvite?: boolean }) =>
      apiClient.post<{ data: User }>("/admin/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create user");
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      apiClient.patch<{ data: User }>(`/admin/users/${id}`, data),
    onSuccess: (_response, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user");
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      apiClient.patch(`/admin/users/${id}/status`, { status, reason }),
    onSuccess: (_response, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });
}

export function useAssignRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      apiClient.put(`/admin/users/${userId}/roles`, { roleIds }),
    onSuccess: (_response, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      toast.success("Roles updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update roles");
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: (userId: string) => apiClient.post(`/admin/users/${userId}/reset-password`),
    onSuccess: () => {
      toast.success("Password reset email sent");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send reset email");
    },
  });
}

export function useUnlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => apiClient.post(`/admin/users/${userId}/unlock`),
    onSuccess: (_response, userId: string) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User unlocked");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unlock user");
    },
  });
}

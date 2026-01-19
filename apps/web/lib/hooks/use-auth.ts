"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient, ApiError } from "@/lib/api";
import { AUTH_CONFIG } from "@/lib/config/auth";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  data: {
    user: User;
  };
}

export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const response = await apiClient.get<AuthResponse>("/auth/me");
      return response.data.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<User, ApiError, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
      return response.data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.user(), user);
      toast.success("Welcome back!", { description: `Logged in as ${user.email}` });
      router.push(AUTH_CONFIG.defaultRedirect);
    },
    onError: (error) => {
      if (error.status === 401) {
        toast.error("Invalid credentials", {
          description: "Please check your email and password.",
        });
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => apiClient.post("/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
      router.push(AUTH_CONFIG.loginPath);
    },
    onSettled: () => {
      queryClient.clear();
    },
  });
}

export function useHasPermission(permission: string): boolean {
  const { data: user } = useCurrentUser();
  return user?.permissions?.includes(permission) ?? false;
}

export function useHasRole(roles: string | string[]): boolean {
  const { data: user } = useCurrentUser();
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return user ? roleArray.includes(user.role) : false;
}

/**
 * Auth hooks for DASHBOARD pages only.
 * ⚠️ Do NOT import these in auth form components - causes compilation deadlock.
 */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient, ApiError } from "@/lib/api";
import { AUTH_CONFIG } from "@/lib/config/auth";
import { toast } from "sonner";
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  MFAVerifyRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordRequest,
  Session,
} from "@/lib/types/auth";

export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  sessions: () => [...authKeys.all, "sessions"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const response = await apiClient.get<{ data: User }>("/auth/me");
      return response.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: (data) => apiClient.post<LoginResponse>("/auth/login", data),
    onSuccess: (response) => {
      if (response.requiresMfa) {
        router.push(`/mfa?token=${response.mfaToken}`);
      } else {
        queryClient.setQueryData(authKeys.user(), { data: response.user });
        router.push(AUTH_CONFIG.defaultRedirect);
        toast.success("Welcome back!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Invalid credentials");
    },
  });
}

export function useVerifyMFA() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: MFAVerifyRequest) =>
      apiClient.post<LoginResponse>("/auth/mfa/verify", data),
    onSuccess: (response) => {
      queryClient.setQueryData(authKeys.user(), { data: response.user });
      router.push(AUTH_CONFIG.defaultRedirect);
      toast.success("Welcome back!");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Invalid verification code");
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => apiClient.post("/auth/register", data),
    onSuccess: () => {
      router.push("/login?registered=true");
      toast.success("Registration successful! Please check your email to verify your account.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Registration failed");
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
      toast.success("Logged out successfully");
    },
    onError: () => {
      queryClient.clear();
      router.push(AUTH_CONFIG.loginPath);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: PasswordResetRequest) =>
      apiClient.post("/auth/forgot-password", data),
    onSuccess: () => {
      toast.success("If an account exists with that email, you will receive a password reset link.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to send reset email");
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: PasswordResetConfirm) =>
      apiClient.post("/auth/reset-password", data),
    onSuccess: () => {
      router.push("/login?reset=true");
      toast.success("Password reset successfully! Please login with your new password.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to reset password");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      apiClient.post("/auth/change-password", data),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to change password");
    },
  });
}

export function useEnableMFA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (method: "TOTP" | "SMS" | "EMAIL") =>
      apiClient.post<{ data: { secret: string; qrCode: string } }>("/auth/mfa/enable", {
        method,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to enable MFA");
    },
  });
}

export function useConfirmMFA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => apiClient.post("/auth/mfa/confirm", { code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      toast.success("MFA enabled successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Invalid verification code");
    },
  });
}

export function useDisableMFA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password: string) => apiClient.post("/auth/mfa/disable", { password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      toast.success("MFA disabled");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to disable MFA");
    },
  });
}

export function useSessions() {
  return useQuery({
    queryKey: authKeys.sessions(),
    queryFn: () => apiClient.get<{ data: Session[] }>("/auth/sessions"),
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => apiClient.delete(`/auth/sessions/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
      toast.success("Session revoked");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to revoke session");
    },
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.delete("/auth/sessions"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
      toast.success("All other sessions revoked");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to revoke sessions");
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
  if (!user) {
    return false;
  }

  const normalize = (value: string) => value.replace(/-/g, "_").toUpperCase();
  const targetRoles = roleArray.map(normalize);

  const rolesFromArray = user.roles?.map((role) => role.name).filter(Boolean) ?? [];
  const roleNameFallback = (user as { roleName?: string })?.roleName;
  const roleObjectFallback = (user as { role?: { name?: string } })?.role?.name;

  const userRoles = [
    ...rolesFromArray,
    ...(roleNameFallback ? [roleNameFallback] : []),
    ...(roleObjectFallback ? [roleObjectFallback] : []),
  ];

  return userRoles.some((role) => targetRoles.includes(normalize(role)));
}


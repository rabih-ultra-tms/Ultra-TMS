import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Tenant, TenantSettings } from "@/lib/types/auth";
import { toast } from "sonner";

export const tenantKeys = {
  all: ["admin", "tenant"] as const,
  settings: () => [...tenantKeys.all, "settings"] as const,
};

export function useTenant() {
  return useQuery({
    queryKey: tenantKeys.all,
    queryFn: () => apiClient.get<Tenant>("/tenant"),
  });
}

export function useTenantSettings() {
  return useQuery({
    queryKey: tenantKeys.settings(),
    queryFn: () => apiClient.get<TenantSettings>("/tenant/settings"),
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.put("/tenant", data),
    onSuccess: () => {
      toast.success("Company information updated");
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update company information");
    },
  });
}

export function useUpdateTenantSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.put("/tenant/settings", data),
    onSuccess: () => {
      toast.success("Settings updated");
      queryClient.invalidateQueries({ queryKey: tenantKeys.settings() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update settings");
    },
  });
}
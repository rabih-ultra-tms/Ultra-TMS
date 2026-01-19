import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

export interface SessionLog {
  id: string;
  jti: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  lastActivityAt: string;
  createdAt: string;
}

const securityLogKeys = {
  all: ["admin", "security-log"] as const,
};

export function useSessionLogs() {
  return useQuery({
    queryKey: securityLogKeys.all,
    queryFn: () => apiClient.get<{ data: SessionLog[] }>("/sessions"),
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => apiClient.delete(`/sessions/${sessionId}`),
    onSuccess: () => {
      toast.success("Session revoked");
      queryClient.invalidateQueries({ queryKey: securityLogKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to revoke session");
    },
  });
}

export function useRevokeAllSessions() {
  return useMutation({
    mutationFn: () => apiClient.post("/auth/logout-all"),
    onSuccess: () => {
      toast.success("All sessions revoked");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to revoke sessions");
    },
  });
}

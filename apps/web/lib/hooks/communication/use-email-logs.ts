"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface EmailLog {
  id: string;
  channel: string;
  templateCode?: string;
  recipientEmail?: string;
  recipientName?: string;
  subject?: string;
  body?: string;
  status: "PENDING" | "SENT" | "DELIVERED" | "OPENED" | "CLICKED" | "FAILED" | "BOUNCED";
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  errorMessage?: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
  template?: {
    id: string;
    name: string;
    code: string;
  };
}

interface EmailLogsResponse {
  data: EmailLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useEmailLogs(entityType: string, entityId: string) {
  return useQuery<EmailLog[]>({
    queryKey: ["email-logs", entityType, entityId],
    queryFn: async () => {
      const response = await apiClient.get<EmailLogsResponse>(
        "/communication/email/logs",
        { entityType, entityId, limit: 50 }
      );
      const body = response as EmailLogsResponse;
      return body.data ?? [];
    },
    enabled: !!entityId,
    staleTime: 30_000,
  });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

export interface SendEmailPayload {
  templateCode?: string;
  subject?: string;
  body?: string;
  bodyHtml?: string;
  recipientEmail: string;
  recipientName?: string;
  recipientType?: "USER" | "CARRIER" | "CONTACT" | "DRIVER";
  recipientId?: string;
  entityType?: "LOAD" | "ORDER" | "CARRIER" | "COMPANY";
  entityId?: string;
  variables?: Record<string, unknown>;
  language?: "en" | "es";
  attachments?: Array<{ name: string; url: string; mimeType?: string }>;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
}

interface SendEmailResponse {
  data: {
    success: boolean;
    logId: string;
    messageId?: string;
    error?: string;
  };
}

export function useSendEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendEmailPayload) => {
      const response = await apiClient.post<SendEmailResponse>(
        "/communication/email/send",
        payload
      );
      return response.data ?? response;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Email sent successfully");
      } else {
        toast.error(`Email failed: ${data.error || "Unknown error"}`);
      }
      queryClient.invalidateQueries({ queryKey: ["email-logs"] });
      queryClient.invalidateQueries({ queryKey: ["load-timeline"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send email: ${error.message}`);
    },
  });
}

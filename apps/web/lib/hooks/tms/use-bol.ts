"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

export interface BolOptions {
  includeHazmat?: boolean;
  includeSpecialInstructions?: boolean;
}

async function fetchBolPdf(
  loadId: string,
  options: BolOptions
): Promise<Blob> {
  const url = apiClient.getFullUrl(`/loads/${loadId}/bol`);

  const accessToken =
    typeof window !== "undefined"
      ? (() => {
          const cookieName =
            process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "accessToken";
          const parts = document.cookie.split(";").map((p) => p.trim());
          const match = parts.find((p) => p.startsWith(`${cookieName}=`));
          return match
            ? decodeURIComponent(match.substring(cookieName.length + 1))
            : undefined;
        })()
      : undefined;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/pdf,application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(options),
  });

  if (!res.ok) {
    let message = `Failed to generate BOL (${res.status})`;
    try {
      const errBody = await res.json();
      if (errBody?.message) message = errBody.message;
    } catch {
      // response wasn't JSON
    }
    throw new Error(message);
  }

  return res.blob();
}

export function useBol(loadId: string) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const generateMutation = useMutation({
    mutationFn: (options: BolOptions = {}) => fetchBolPdf(loadId, options),
    onSuccess: (blob) => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    },
    onError: (error: Error) => {
      toast.error("Failed to generate Bill of Lading", {
        description: error.message,
      });
    },
  });

  const download = useCallback(() => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `bol-${loadId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [pdfUrl, loadId]);

  const cleanup = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  }, [pdfUrl]);

  return {
    pdfUrl,
    generate: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    generateError: generateMutation.error,
    download,
    cleanup,
    hasGenerated: !!pdfUrl,
  };
}

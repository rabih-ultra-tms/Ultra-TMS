"use client";

import { FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RateConPreviewProps {
  /** Blob URL of the generated PDF */
  pdfUrl: string | null;
  /** Whether the PDF is currently being generated */
  isLoading: boolean;
  /** Error message if generation failed */
  error?: Error | null;
  /** Additional class names */
  className?: string;
}

export function RateConPreview({
  pdfUrl,
  isLoading,
  error,
  className,
}: RateConPreviewProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-muted/20 min-h-[600px]",
          className
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-text-muted">Generating rate confirmation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border border-danger/30 bg-danger-bg min-h-[600px]",
          className
        )}
      >
        <FileText className="h-8 w-8 text-danger" />
        <p className="text-sm font-medium text-danger">
          Failed to generate rate confirmation
        </p>
        <p className="text-xs text-text-muted max-w-md text-center">
          {error.message}
        </p>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-muted/20 min-h-[600px]",
          className
        )}
      >
        <FileText className="h-10 w-10 text-text-muted" />
        <p className="text-sm text-text-muted">
          Click &quot;Generate PDF&quot; to create the rate confirmation
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border overflow-hidden bg-white",
        className
      )}
    >
      <iframe
        src={pdfUrl}
        title="Rate Confirmation Preview"
        className="w-full min-h-[700px] border-0"
      />
    </div>
  );
}

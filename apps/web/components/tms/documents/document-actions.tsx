"use client";

import { Download, Mail, FileOutput, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DocumentActionsProps {
  /** Generate the PDF */
  onGenerate: () => void;
  /** Download the generated PDF */
  onDownload: () => void;
  /** Email to carrier */
  onEmailCarrier: () => void;
  /** Whether PDF has been generated */
  hasGenerated: boolean;
  /** Whether PDF is currently generating */
  isGenerating: boolean;
  /** Whether email is currently being sent */
  isEmailing: boolean;
  /** Additional class names */
  className?: string;
}

export function DocumentActions({
  onGenerate,
  onDownload,
  onEmailCarrier,
  hasGenerated,
  isGenerating,
  isEmailing,
  className,
}: DocumentActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={onGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileOutput className="h-4 w-4 mr-2" />
        )}
        {hasGenerated ? "Regenerate PDF" : "Generate PDF"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onDownload}
        disabled={!hasGenerated || isGenerating}
      >
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </Button>

      <Button
        variant="default"
        size="sm"
        onClick={onEmailCarrier}
        disabled={isEmailing || isGenerating}
      >
        {isEmailing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Mail className="h-4 w-4 mr-2" />
        )}
        Email to Carrier
      </Button>
    </div>
  );
}

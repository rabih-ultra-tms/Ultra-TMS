"use client";

import * as React from "react";
import { CheckCircle, Clock, AlertCircle, Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// DocumentList — Document checklist with status icons and action buttons
//
// v5 spec reference:
//   Item: flex row, center items, gap 10px, 10px 0 padding, border-bottom
//   Icon: 28px, 6px radius, centered
//     complete: success-bg, success text
//     pending: bg-main, text-muted
//     missing: danger-bg, danger text
//   Info: flex-1
//     Name: 12px/500, text-primary
//     Status: 10px, text-muted, mt 1px
//   Download btn: 28px, 1px border, 6px radius, transparent bg
//     Hover: sapphire border + text
//   Upload btn: same styling as download
// ---------------------------------------------------------------------------

export type DocumentStatus = "complete" | "pending" | "missing";

export interface DocumentItem {
  /** Unique key */
  key: string;
  /** Document name */
  name: string;
  /** Document status */
  status: DocumentStatus;
  /** Status text (e.g. "Uploaded", "Pending", "Missing") */
  statusText?: string;
  /** Show download button (for complete docs) */
  downloadable?: boolean;
  /** Show upload button (for pending/missing docs) */
  uploadable?: boolean;
  /** Download handler */
  onDownload?: () => void;
  /** Upload handler */
  onUpload?: () => void;
}

export interface DocumentListProps {
  /** List of documents */
  documents: DocumentItem[];
  /** Additional class names */
  className?: string;
}

const iconConfig: Record<DocumentStatus, { icon: typeof CheckCircle; className: string }> = {
  complete: { icon: CheckCircle, className: "bg-success-bg text-success" },
  pending: { icon: Clock, className: "bg-background text-text-muted" },
  missing: { icon: AlertCircle, className: "bg-danger-bg text-danger" },
};

const defaultStatusText: Record<DocumentStatus, string> = {
  complete: "Uploaded",
  pending: "Pending",
  missing: "Missing",
};

export function DocumentList({ documents, className }: DocumentListProps) {
  return (
    <div className={cn("", className)}>
      {documents.map((doc, index) => {
        const { icon: Icon, className: iconClass } = iconConfig[doc.status];

        return (
          <div
            key={doc.key}
            className={cn(
              "flex items-center gap-2.5 py-2.5",
              index < documents.length - 1 && "border-b border-border"
            )}
          >
            {/* Status icon */}
            <div
              className={cn(
                "size-7 rounded-md flex items-center justify-center shrink-0",
                iconClass
              )}
            >
              <Icon className="size-4" />
            </div>

            {/* Doc info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-text-primary truncate">
                {doc.name}
              </div>
              <div className="text-[10px] text-text-muted mt-[1px]">
                {doc.statusText ?? defaultStatusText[doc.status]}
              </div>
            </div>

            {/* Action buttons */}
            {doc.downloadable && (
              <button
                onClick={doc.onDownload}
                className={cn(
                  "size-7 border border-border rounded-md bg-transparent",
                  "flex items-center justify-center shrink-0",
                  "text-text-muted cursor-pointer",
                  "transition-all duration-150",
                  "hover:border-primary hover:text-primary"
                )}
                aria-label={`Download ${doc.name}`}
              >
                <Download className="size-3.5" />
              </button>
            )}
            {doc.uploadable && (
              <button
                onClick={doc.onUpload}
                className={cn(
                  "size-7 border border-border rounded-md bg-transparent",
                  "flex items-center justify-center shrink-0",
                  "text-text-muted cursor-pointer",
                  "transition-all duration-150",
                  "hover:border-primary hover:text-primary"
                )}
                aria-label={`Upload ${doc.name}`}
              >
                <Upload className="size-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

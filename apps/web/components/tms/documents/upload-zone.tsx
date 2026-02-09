"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// UploadZone — Dashed-border drop zone matching v5 design
//
// Two variants:
//   "full" (default): Large zone with 36px icon, 24px padding, mt 16px
//   "inline": Compact per-item zone, 24px icon, 12px padding, 6px margin
//
// v5 spec reference:
//   Border: 2px dashed border color, 8px radius (full) / 6px (inline)
//   Hover: sapphire border, sapphire-light bg, sapphire icon+text
//   Drag-over: same as hover
// ---------------------------------------------------------------------------

export interface UploadZoneProps {
  /** Display variant */
  variant?: "full" | "inline";
  /** Upload text */
  text?: string;
  /** Click handler */
  onClick?: () => void;
  /** Drag-and-drop handler */
  onDrop?: (files: FileList) => void;
  /** Additional class names */
  className?: string;
}

export function UploadZone({
  variant = "full",
  text,
  onClick,
  onDrop,
  className,
}: UploadZoneProps) {
  const [dragOver, setDragOver] = React.useState(false);

  const defaultText = variant === "full"
    ? "Drop files here or click to upload"
    : "Drop file or click";

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = React.useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        onDrop?.(e.dataTransfer.files);
      }
    },
    [onDrop]
  );

  return (
    <div
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed border-border text-center cursor-pointer",
        "transition-all duration-200",
        // Hover & drag-over
        "hover:border-primary hover:bg-primary-light",
        "hover:[&_svg]:text-primary",
        "hover:[&_.upload-text]:text-primary",
        dragOver && "border-primary bg-primary-light",
        dragOver && "[&_svg]:text-primary [&_.upload-text]:text-primary",
        // Variant sizing
        variant === "full" && "rounded-lg p-6 mt-4",
        variant === "inline" && "rounded-md p-3 my-1.5",
        className
      )}
      role="button"
      tabIndex={0}
      aria-label={text ?? defaultText}
    >
      <Upload
        className={cn(
          "mx-auto text-text-muted transition-colors duration-200",
          variant === "full" ? "size-9 mb-2" : "size-6 mb-1"
        )}
      />
      <div
        className={cn(
          "upload-text text-text-muted transition-colors duration-200",
          variant === "full" ? "text-xs" : "text-[11px]"
        )}
      >
        {text ?? defaultText}
      </div>
    </div>
  );
}

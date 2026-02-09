"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// BulkActionBar — Slides in when table rows are selected
//
// v5 spec:
//   Height: 40px, primary-light bg, primary-border bottom border
//   Contents: "{n} selected" label + action buttons + close button (right)
//   Action buttons: 26px, 11px font, sapphire color, 5px radius
// ---------------------------------------------------------------------------

export interface BulkAction {
  /** Unique key */
  key: string;
  /** Button label */
  label: string;
  /** Optional icon (rendered before label) */
  icon?: React.ReactNode;
  /** Click handler */
  onClick: () => void;
}

export interface BulkActionBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Actions to display */
  actions: BulkAction[];
  /** Called when the close (×) button is clicked — should clear selection */
  onClose: () => void;
  /** Additional class names */
  className?: string;
}

export function BulkActionBar({
  selectedCount,
  actions,
  onClose,
  className,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "h-10 flex items-center px-5 gap-3 shrink-0",
        "bg-primary-light border-b border-primary-border",
        "animate-in slide-in-from-top-2 duration-200",
        className
      )}
    >
      {/* Selection count */}
      <span className="text-xs font-semibold text-primary">
        {selectedCount} selected
      </span>

      {/* Action buttons */}
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            action.onClick();
          }}
          className={cn(
            "h-[26px] px-2.5 rounded-[5px]",
            "border border-primary-border bg-surface",
            "text-primary text-[11px] font-medium",
            "inline-flex items-center gap-1",
            "cursor-pointer transition-colors duration-150",
            "hover:bg-primary-light"
          )}
        >
          {action.icon}
          {action.label}
        </button>
      ))}

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className={cn(
          "ml-auto bg-transparent border-none",
          "text-text-muted hover:text-text-primary",
          "cursor-pointer flex items-center",
          "transition-colors duration-150"
        )}
        aria-label="Clear selection"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

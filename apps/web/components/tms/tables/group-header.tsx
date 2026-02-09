"use client";

import * as React from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/tms/primitives";
import type { StatusColorToken } from "@/lib/design-tokens";

// ---------------------------------------------------------------------------
// GroupHeader — Collapsible status-group row for the DataTable
//
// v5 spec:
//   Height: 32px, filter-bg background, border-bottom
//   Contents: 6px status dot + 9px uppercase label + count pill + chevron
//   Chevron rotates 180° when collapsed
// ---------------------------------------------------------------------------

export interface GroupHeaderProps {
  /** Status color token for the dot */
  status: StatusColorToken;
  /** Display label (e.g. "In Transit") */
  label: string;
  /** Number of items in this group */
  count: number;
  /** Whether the group is expanded */
  isExpanded: boolean;
  /** Toggle expand/collapse */
  onToggle: () => void;
  /** Number of columns to span */
  colSpan: number;
  /** Additional class names */
  className?: string;
}

export function GroupHeader({
  status,
  label,
  count,
  isExpanded,
  onToggle,
  colSpan,
  className,
}: GroupHeaderProps) {
  return (
    <tr
      className={cn("cursor-pointer select-none group", className)}
      onClick={onToggle}
    >
      <td
        colSpan={colSpan}
        className={cn(
          "bg-surface-filter px-3 h-8 border-b border-border",
          "transition-colors duration-200",
          "group-hover:bg-surface-hover"
        )}
      >
        <div className="flex items-center gap-2">
          {/* Status dot */}
          <StatusDot status={status} size="sm" />

          {/* Label */}
          <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-text-primary">
            {label}
          </span>

          {/* Count pill */}
          <span
            className={cn(
              "text-[9px] font-semibold text-text-muted",
              "bg-surface border border-border rounded-[10px]",
              "px-1.5 py-[1px] leading-[1.4]"
            )}
          >
            {count}
          </span>

          {/* Chevron — rotates when collapsed */}
          <ChevronUp
            className={cn(
              "ml-auto size-4 text-text-muted transition-transform duration-300",
              !isExpanded && "rotate-180"
            )}
          />
        </div>
      </td>
    </tr>
  );
}

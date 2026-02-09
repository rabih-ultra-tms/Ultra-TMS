"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Filter Bar — 44px horizontal scrollable container for filter chips
//
// v5 spec: 44px height, bg-filter, border-bottom, 20px padding,
//          6px gap, horizontal scroll with hidden scrollbar,
//          clear button on the right (auto margin-left).
// ---------------------------------------------------------------------------

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show "Clear all" button */
  onClear?: () => void;
  /** Whether any filters are active (shows clear button) */
  hasActiveFilters?: boolean;
}

export function FilterBar({
  onClear,
  hasActiveFilters = false,
  className,
  children,
  ...props
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex items-center h-11 px-5 gap-1.5",
        "border-b border-border bg-surface-filter",
        "overflow-x-auto no-scrollbar shrink-0",
        "transition-colors duration-200",
        className
      )}
      {...props}
    >
      {children}
      {hasActiveFilters && onClear && (
        <>
          <FilterDivider />
          <button
            type="button"
            onClick={onClear}
            className="ml-auto shrink-0 text-[11px] text-text-muted hover:text-danger transition-colors duration-150 px-1"
          >
            Clear all
          </button>
        </>
      )}
    </div>
  );
}

/** Vertical divider between chip groups */
export function FilterDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("w-px h-5 bg-border-soft shrink-0", className)}
      role="separator"
    />
  );
}

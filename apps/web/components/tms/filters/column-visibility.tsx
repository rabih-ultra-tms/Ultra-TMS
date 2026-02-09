"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CustomCheckbox } from "@/components/tms/primitives";

// ---------------------------------------------------------------------------
// Column Visibility Dropdown — Checkbox list for showing/hiding table columns
//
// v5 spec: 200px wide, 8px radius, shadow-md, 8px vertical padding,
//          items: 6px 12px padding, 11px/500 font, checkbox + label.
// ---------------------------------------------------------------------------

export interface ColumnOption {
  id: string;
  label: string;
}

export interface ColumnVisibilityProps {
  /** Column options */
  columns: ColumnOption[];
  /** Currently visible column IDs */
  visible: string[];
  /** Called when visibility changes */
  onChange: (visible: string[]) => void;
  /** Whether the dropdown is open */
  open: boolean;
  /** Called when open state changes */
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export function ColumnVisibility({
  columns,
  visible,
  onChange,
  open,
  onOpenChange,
  className,
}: ColumnVisibilityProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onOpenChange]);

  function toggleColumn(id: string) {
    if (visible.includes(id)) {
      onChange(visible.filter((v) => v !== id));
    } else {
      onChange([...visible, id]);
    }
  }

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full right-0 mt-1 z-50",
        "w-[200px] bg-surface border border-border rounded-lg",
        "shadow-md py-2",
        className
      )}
    >
      {columns.map((col) => {
        const isVisible = visible.includes(col.id);
        return (
          <button
            key={col.id}
            type="button"
            onClick={() => toggleColumn(col.id)}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-1.5 text-left",
              "text-[11px] font-medium text-text-secondary",
              "hover:bg-surface-hover transition-colors duration-100"
            )}
          >
            <CustomCheckbox
              checked={isVisible}
              onCheckedChange={() => toggleColumn(col.id)}
              tabIndex={-1}
            />
            <span>{col.label}</span>
          </button>
        );
      })}
    </div>
  );
}

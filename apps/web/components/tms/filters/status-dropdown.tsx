"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/tms/primitives";
import type { StatusColorToken } from "@/lib/design-tokens";

// ---------------------------------------------------------------------------
// Status Dropdown — Dropdown with colored status dots, counts, checkable items
//
// v5 spec: 200px wide, 8px radius, shadow-md, 4px vertical padding,
//          items: 7px 12px padding, 12px/500 font, status dot + label + count.
//          Active item = sapphire-light bg, sapphire text, 600 weight.
// ---------------------------------------------------------------------------

export interface StatusOption {
  value: string;
  label: string;
  color: StatusColorToken;
  count?: number;
}

export interface StatusDropdownProps {
  /** Status options to display */
  options: StatusOption[];
  /** Currently selected values */
  selected: string[];
  /** Called when selection changes */
  onChange: (selected: string[]) => void;
  /** Whether the dropdown is open */
  open: boolean;
  /** Called when open state changes */
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export function StatusDropdown({
  options,
  selected,
  onChange,
  open,
  onOpenChange,
  className,
}: StatusDropdownProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
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

  function toggleItem(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full left-0 mt-1 z-50",
        "w-[200px] bg-surface border border-border rounded-lg",
        "shadow-md py-1",
        className
      )}
    >
      {options.map((opt) => {
        const isActive = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggleItem(opt.value)}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-[7px] text-left",
              "text-xs font-medium transition-colors duration-100",
              isActive
                ? "bg-primary-light text-primary font-semibold"
                : "text-text-secondary hover:bg-surface-hover"
            )}
          >
            <StatusDot status={opt.color} size="md" />
            <span className="flex-1">{opt.label}</span>
            {opt.count != null && (
              <span className="text-[10px] font-semibold text-text-muted">
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Filter Chip — Pill button with icon, label, count badge, active state
//
// v5 spec: 28px height, 11px/500, 6px radius, 10px padding,
//          active = sapphire-light bg + sapphire-border + sapphire text,
//          count badge = sapphire bg, white text, 9px/600, pill shape.
// ---------------------------------------------------------------------------

export interface FilterChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon element (e.g. lucide icon) */
  icon?: React.ReactNode;
  /** Active/selected state */
  active?: boolean;
  /** Count badge value */
  count?: number;
}

export function FilterChip({
  icon,
  active = false,
  count,
  className,
  children,
  ...props
}: FilterChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1 shrink-0",
        "h-7 px-2.5 rounded-md border text-[11px] font-medium",
        "cursor-pointer whitespace-nowrap transition-all duration-150",
        active
          ? "bg-primary-light border-primary-border text-primary"
          : "bg-surface border-border text-text-secondary hover:border-primary-border hover:text-text-primary",
        className
      )}
      {...props}
    >
      {icon && <span className="[&>svg]:size-3.5">{icon}</span>}
      {children}
      {count != null && count > 0 && (
        <span className="bg-primary text-white text-[9px] font-semibold px-[5px] py-px rounded-full leading-[1.4]">
          {count}
        </span>
      )}
    </button>
  );
}

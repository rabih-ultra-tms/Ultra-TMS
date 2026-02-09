"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlignJustify, List, StretchHorizontal } from "lucide-react";

// ---------------------------------------------------------------------------
// Density Toggle — 3-way segmented control (compact / default / spacious)
//
// v5 spec: border group, 28×28 buttons, 6px radius, 14px icons.
//          Active = sapphire-light bg + sapphire color.
// ---------------------------------------------------------------------------

export type Density = "compact" | "default" | "spacious";

export interface DensityToggleProps {
  value: Density;
  onChange: (density: Density) => void;
  className?: string;
}

const densityOptions: { value: Density; icon: React.ReactNode; title: string }[] = [
  { value: "compact", icon: <AlignJustify className="size-3.5" />, title: "Compact" },
  { value: "default", icon: <List className="size-3.5" />, title: "Default" },
  { value: "spacious", icon: <StretchHorizontal className="size-3.5" />, title: "Spacious" },
];

export function DensityToggle({
  value,
  onChange,
  className,
}: DensityToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex border border-border rounded-md overflow-hidden",
        className
      )}
      role="radiogroup"
      aria-label="Table density"
    >
      {densityOptions.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          title={opt.title}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex items-center justify-center size-7",
            "border-none cursor-pointer transition-all duration-150",
            i < densityOptions.length - 1 && "border-r border-border",
            value === opt.value
              ? "bg-primary-light text-primary"
              : "bg-surface text-text-muted hover:text-text-secondary"
          )}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

// ---------------------------------------------------------------------------
// Stat Item — Label (uppercase 10px) + value (bold 13px) + optional trend
//
// v5 spec: flex row with 8px gap, 16px horizontal padding, right border.
//          Label: 10px/500, uppercase, 0.05em tracking, text-muted.
//          Value: 13px/700, text-primary.
//          Trend: 10px/600, green=up, red=down, with arrow icon.
// ---------------------------------------------------------------------------

export interface StatItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  /** Trend direction — renders arrow + applies color */
  trend?: "up" | "down";
  /** Trend label text (e.g. "+12%") */
  trendLabel?: string;
}

export function StatItem({
  label,
  value,
  trend,
  trendLabel,
  className,
  ...props
}: StatItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 border-r border-border",
        "last:border-r-0 first:pl-0",
        className
      )}
      {...props}
    >
      <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted whitespace-nowrap">
        {label}
      </span>
      <span className="text-[13px] font-bold text-text-primary whitespace-nowrap">
        {value}
      </span>
      {trend && trendLabel && (
        <span
          className={cn(
            "flex items-center gap-px text-[10px] font-semibold",
            trend === "up" && "text-success",
            trend === "down" && "text-danger"
          )}
        >
          {trend === "up" ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          {trendLabel}
        </span>
      )}
    </div>
  );
}

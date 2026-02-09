"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

// ---------------------------------------------------------------------------
// KPI Card — Dashboard metric card with icon, label, value, trend
//
// Used on dashboard pages. Not directly in v5 dispatch board, but follows
// the same token system and typography conventions.
// ---------------------------------------------------------------------------

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon element */
  icon?: React.ReactNode;
  /** Metric label */
  label: string;
  /** Metric value */
  value: string | number;
  /** Trend direction */
  trend?: "up" | "down";
  /** Trend label (e.g. "+12%") */
  trendLabel?: string;
  /** Optional subtext below value */
  subtext?: string;
}

export function KpiCard({
  icon,
  label,
  value,
  trend,
  trendLabel,
  subtext,
  className,
  ...props
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-4 rounded-lg border border-border bg-surface",
        "transition-colors duration-200",
        className
      )}
      {...props}
    >
      {/* Header: icon + label */}
      <div className="flex items-center gap-2">
        {icon && (
          <span className="text-text-muted [&>svg]:size-4">{icon}</span>
        )}
        <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
          {label}
        </span>
      </div>

      {/* Value + trend */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-text-primary">{value}</span>
        {trend && trendLabel && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold",
              trend === "up" && "text-success",
              trend === "down" && "text-danger"
            )}
          >
            {trend === "up" ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}
            {trendLabel}
          </span>
        )}
      </div>

      {/* Subtext */}
      {subtext && (
        <span className="text-[11px] text-text-muted">{subtext}</span>
      )}
    </div>
  );
}

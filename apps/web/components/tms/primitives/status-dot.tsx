"use client";

import { cn } from "@/lib/utils";
import type { StatusColorToken, Intent } from "@/lib/design-tokens";

// ---------------------------------------------------------------------------
// Status Dot — Small colored circle indicator
//
// Matches v5 design: 7px dot, optional pulse animation for live indicators.
// ---------------------------------------------------------------------------

const dotSizeMap = {
  sm: "size-1.5", // 6px
  md: "size-[7px]", // 7px — v5 default
  lg: "size-2", // 8px
} as const;

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** TMS status color token */
  status?: StatusColorToken;
  /** Semantic intent color */
  intent?: Intent;
  /** Dot size */
  size?: "sm" | "md" | "lg";
  /** Enable pulse animation (for live/active indicators) */
  pulse?: boolean;
}

export function StatusDot({
  status,
  intent,
  size = "md",
  pulse = false,
  className,
  ...props
}: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full shrink-0",
        dotSizeMap[size],
        status && `bg-status-${status}`,
        !status && intent && `bg-${intent}`,
        pulse && "animate-pulse-dot",
        className
      )}
      role="presentation"
      {...props}
    />
  );
}

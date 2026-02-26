"use client";

import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { StatusColorToken, Intent } from "@/lib/design-tokens";

// ---------------------------------------------------------------------------
// Status Badge — Displays a status or intent label with colored background
//
// Uses the 3-layer token system:
//   status variants → --status-{name} / --status-{name}-bg / --status-{name}-border
//   intent variants → --{intent} / --{intent}-bg / --{intent}-border
// ---------------------------------------------------------------------------

const statusBadgeVariants = cva(
  "inline-flex items-center justify-center gap-1.5 font-semibold border rounded-[4px] leading-none whitespace-nowrap",
  {
    variants: {
      status: {
        transit:
          "bg-status-transit-bg text-status-transit border-status-transit-border",
        unassigned:
          "bg-status-unassigned-bg text-status-unassigned border-status-unassigned-border",
        tendered:
          "bg-status-tendered-bg text-status-tendered border-status-tendered-border",
        dispatched:
          "bg-status-dispatched-bg text-status-dispatched border-status-dispatched-border",
        delivered:
          "bg-status-delivered-bg text-status-delivered border-status-delivered-border",
        atrisk:
          "bg-status-atrisk-bg text-status-atrisk border-status-atrisk-border",
      },
      intent: {
        success: "bg-success-bg text-success border-success-border",
        warning: "bg-warning-bg text-warning border-warning-border",
        danger: "bg-danger-bg text-danger border-danger-border",
        info: "bg-info-bg text-info border-info-border",
      },
      size: {
        sm: "text-[10px] px-1.5 py-[2px]",
        md: "text-[11px] px-2 py-[3px]",
        lg: "text-xs px-2.5 py-1",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** One of the 6 TMS status colors */
  status?: StatusColorToken;
  /** Semantic intent (overridden by status if both provided) */
  intent?: Intent;
  /** Badge size */
  size?: "sm" | "md" | "lg";
  /** Show a colored dot before the label */
  withDot?: boolean;
  children: React.ReactNode;
}

export function StatusBadge({
  status,
  intent,
  size,
  withDot = false,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        statusBadgeVariants({
          status: status ?? undefined,
          intent: !status ? intent : undefined,
          size,
        }),
        className
      )}
      {...props}
    >
      {withDot && (
        <span
          className={cn(
            "inline-block size-[7px] rounded-full shrink-0",
            status ? `bg-status-${status}` : undefined,
            !status && intent ? `bg-${intent}` : undefined
          )}
        />
      )}
      {children}
    </span>
  );
}

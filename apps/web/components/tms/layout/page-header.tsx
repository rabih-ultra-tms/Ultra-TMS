"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// PageHeader — 48px header bar matching dispatch v5 design
//
// v5 spec reference:
//   Height: 48px, flex row, center items, 0 20px padding
//   Border-bottom, surface bg
//   Left: title (14px/600)
//   Center: search input (flex-1, max-w 320px, margin auto)
//   Right: action buttons area
// ---------------------------------------------------------------------------

export interface PageHeaderProps {
  /** Page title */
  title?: React.ReactNode;
  /** Center slot (typically a search input) */
  center?: React.ReactNode;
  /** Right-side actions (buttons, notifications, user avatar) */
  actions?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function PageHeader({
  title,
  center,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "h-12 flex items-center gap-4 px-5",
        "border-b border-border bg-surface",
        "shrink-0",
        "transition-colors duration-200",
        className
      )}
    >
      {/* Left: title */}
      {title && (
        <div className="text-sm font-semibold text-text-primary whitespace-nowrap">
          {title}
        </div>
      )}

      {/* Center: search / custom */}
      {center && (
        <div className="flex-1 max-w-xs mx-auto">
          {center}
        </div>
      )}

      {/* Push actions right if no center */}
      {!center && <div className="flex-1" />}

      {/* Right: actions */}
      {actions && (
        <div className="flex items-center gap-1 shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}

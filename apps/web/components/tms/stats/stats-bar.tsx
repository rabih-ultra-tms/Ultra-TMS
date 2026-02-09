"use client";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Stats Bar — 40px horizontal bar of stat items, separated by borders
//
// v5 spec: 40px height, flex row, 20px padding, border-bottom,
//          bg-surface, smooth transition.
// ---------------------------------------------------------------------------

export interface StatsBarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function StatsBar({ className, children, ...props }: StatsBarProps) {
  return (
    <div
      className={cn(
        "flex items-center h-10 px-5",
        "border-b border-border bg-surface",
        "shrink-0 transition-colors duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// InfoGrid — 2-column grid of InfoCell components matching v5 design
//
// v5 spec reference:
//   Grid: 2-col, gap 10px
//   Cell: 10px 12px padding, bg-main, 6px radius, 1px border
//     Label: 9px/600, uppercase, 0.05em tracking, text-muted, mb 3px
//     Value: 13px/600, text-primary
//     Sub:   10px, text-secondary, mt 1px
// ---------------------------------------------------------------------------

export interface InfoCell {
  /** Unique key */
  key: string;
  /** Uppercase label */
  label: string;
  /** Main value */
  value: React.ReactNode;
  /** Optional sub-text below value */
  subText?: string;
}

export interface InfoGridProps {
  /** Cells to render in the grid */
  cells: InfoCell[];
  /** Number of columns (default 2) */
  columns?: 1 | 2 | 3;
  /** Additional class names */
  className?: string;
}

const columnClass = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
} as const;

export function InfoGrid({
  cells,
  columns = 2,
  className,
}: InfoGridProps) {
  return (
    <div className={cn("grid gap-2.5", columnClass[columns], className)}>
      {cells.map((cell) => (
        <div
          key={cell.key}
          className="py-2.5 px-3 bg-background rounded-md border border-border"
        >
          <div className="text-[9px] font-semibold uppercase tracking-[0.05em] text-text-muted mb-[3px]">
            {cell.label}
          </div>
          <div className="text-[13px] font-semibold text-text-primary">
            {cell.value}
          </div>
          {cell.subText && (
            <div className="text-[10px] text-text-secondary mt-[1px]">
              {cell.subText}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

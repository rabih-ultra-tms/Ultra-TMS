"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// FieldList — Vertical list of label/value rows matching v5 design
//
// v5 spec reference:
//   Row: flex, justify-between, 6px 0 padding, border-bottom
//   Last child: no border-bottom
//   Label: 11px, text-muted
//   Value: 11px/500, text-primary
// ---------------------------------------------------------------------------

export interface FieldItem {
  /** Unique key */
  key: string;
  /** Left-side label */
  label: string;
  /** Right-side value (text or custom node) */
  value: React.ReactNode;
}

export interface FieldListProps {
  /** List of field items */
  fields: FieldItem[];
  /** Additional class names */
  className?: string;
}

export function FieldList({ fields, className }: FieldListProps) {
  return (
    <div className={cn("", className)}>
      {fields.map((field, index) => (
        <div
          key={field.key}
          className={cn(
            "flex justify-between items-baseline py-1.5",
            index < fields.length - 1 && "border-b border-border"
          )}
        >
          <span className="text-[11px] text-text-muted">{field.label}</span>
          <span className="text-[11px] font-medium text-text-primary">
            {field.value}
          </span>
        </div>
      ))}
    </div>
  );
}

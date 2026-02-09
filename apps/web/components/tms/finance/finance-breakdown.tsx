"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// FinanceBreakdown — Revenue/cost line items, totals, and margin box
//
// v5 spec reference:
//   Section: mb 16px
//   Header: 10px/600, uppercase, tracking 0.05em, text-muted, mb 8px
//   Row: flex justify-between, 5px 0 padding
//     Label: 11px, text-secondary
//     Value: 11px/600, text-primary
//   Total row: border-top, pt 6px, mt 4px, value 13px/700
//   Margin box: 14px padding, 8px radius, text-center, 12px 0 margin
//     Pct: 24px/700, colored by threshold
//     Amt: 12px/500, text-secondary
//   Thresholds: >=16% success, >=10% primary, <10% danger
// ---------------------------------------------------------------------------

export interface FinanceLineItem {
  /** Unique key */
  key: string;
  /** Line item label */
  label: string;
  /** Formatted value string */
  value: string;
}

export interface FinanceSection {
  /** Section title (e.g. "Revenue", "Cost") */
  title: string;
  /** Line items */
  items: FinanceLineItem[];
  /** Total row */
  total?: { label: string; value: string };
}

export interface MarginDisplay {
  /** Margin percentage (e.g. 18.2) */
  percentage: number;
  /** Formatted dollar amount (e.g. "$628") */
  amount: string;
}

export interface FinanceBreakdownProps {
  /** Finance sections (revenue, cost, payment status, etc.) */
  sections: FinanceSection[];
  /** Margin box display (omit to hide) */
  margin?: MarginDisplay;
  /** Additional class names */
  className?: string;
}

function getMarginIntent(pct: number): "success" | "primary" | "danger" | "muted" {
  if (pct >= 16) return "success";
  if (pct >= 10) return "primary";
  if (pct > 0) return "danger";
  return "muted";
}

const marginBgClass = {
  success: "bg-success-bg border-success",
  primary: "bg-primary-light border-primary-border",
  danger: "bg-danger-bg border-danger",
  muted: "bg-background border-border",
} as const;

const marginTextClass = {
  success: "text-success",
  primary: "text-primary",
  danger: "text-danger",
  muted: "text-text-muted",
} as const;

export function FinanceBreakdown({
  sections,
  margin,
  className,
}: FinanceBreakdownProps) {
  return (
    <div className={cn("", className)}>
      {sections.map((section, sIdx) => (
        <div key={section.title} className={cn("mb-4", sIdx === sections.length - 1 && !margin && "mb-0")}>
          {/* Section header */}
          <div className="text-[10px] font-semibold uppercase tracking-[0.05em] text-text-muted mb-2">
            {section.title}
          </div>

          {/* Line items */}
          {section.items.map((item) => (
            <div
              key={item.key}
              className="flex justify-between py-[5px]"
            >
              <span className="text-[11px] text-text-secondary">
                {item.label}
              </span>
              <span className="text-[11px] font-semibold text-text-primary">
                {item.value}
              </span>
            </div>
          ))}

          {/* Total row */}
          {section.total && (
            <div className="flex justify-between border-t border-border pt-1.5 mt-1">
              <span className="text-[11px] font-semibold text-text-secondary">
                {section.total.label}
              </span>
              <span className="text-[13px] font-bold text-text-primary">
                {section.total.value}
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Margin box */}
      {margin && (
        <div
          className={cn(
            "p-3.5 rounded-lg text-center my-3 border",
            marginBgClass[getMarginIntent(margin.percentage)]
          )}
        >
          <div
            className={cn(
              "text-2xl font-bold",
              marginTextClass[getMarginIntent(margin.percentage)]
            )}
          >
            {margin.percentage > 0 ? `${margin.percentage.toFixed(1)}%` : "\u2014"}
          </div>
          <div className="text-xs font-medium text-text-secondary mt-0.5">
            {margin.percentage > 0 ? `${margin.amount} margin` : "No carrier assigned"}
          </div>
        </div>
      )}
    </div>
  );
}

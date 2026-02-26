"use client";

import * as React from "react";
import type { CarrierLoadHistoryItem } from "@/types/carriers";

interface ScorecardLoadHistoryProps {
  loads: CarrierLoadHistoryItem[];
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

function formatRatePerMile(cents: number): string {
  return `$${(cents / 100).toFixed(2)}/mi`;
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export function ScorecardLoadHistory({ loads }: ScorecardLoadHistoryProps) {
  if (loads.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No completed loads found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Route
            </th>
            <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Delivered
            </th>
            <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Rate
            </th>
            <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              $/Mile
            </th>
            <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Miles
            </th>
          </tr>
        </thead>
        <tbody>
          {loads.map((load) => (
            <tr
              key={load.id}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td className="py-2 px-3 text-xs">
                <span className="font-medium">
                  {load.originCity}, {load.originState}
                </span>
                <span className="text-muted-foreground"> &rarr; </span>
                <span className="font-medium">
                  {load.destinationCity}, {load.destinationState}
                </span>
              </td>
              <td className="py-2 px-3 text-xs text-muted-foreground">
                {load.deliveryDate
                  ? formatRelativeDate(load.deliveryDate)
                  : "\u2014"}
              </td>
              <td className="py-2 px-3 text-xs text-right font-mono">
                {formatCents(load.carrierRateCents)}
              </td>
              <td className="py-2 px-3 text-xs text-right font-mono text-muted-foreground">
                {load.ratePerMileCarrierCents > 0
                  ? formatRatePerMile(load.ratePerMileCarrierCents)
                  : "\u2014"}
              </td>
              <td className="py-2 px-3 text-xs text-right text-muted-foreground">
                {load.totalMiles != null
                  ? Number(load.totalMiles).toFixed(0)
                  : "\u2014"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

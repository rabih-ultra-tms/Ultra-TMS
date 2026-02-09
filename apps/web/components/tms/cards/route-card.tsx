"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// RouteCard — Origin/Destination route visualization matching v5 design
//
// v5 spec reference:
//   Container: 14px padding, bg-main, 1px border, 8px radius, mb 16px
//   Point: flex row, gap 12px
//     Dot: 10px, rounded, mt 4px (origin = sapphire, dest = success)
//     City: 13px/600, text-primary
//     Date: 11px, text-secondary
//   Connector: 2px wide, 20px tall, border-soft, ml 4px
//   Miles info: 11px, text-muted, mt 8px, ml 22px
// ---------------------------------------------------------------------------

export interface RoutePoint {
  /** City/location name */
  city: string;
  /** Date/time string */
  dateTime?: string;
  /** Whether this point is late (renders in danger color) */
  isLate?: boolean;
}

export interface RouteCardProps {
  /** Origin point */
  origin: RoutePoint;
  /** Destination point */
  destination: RoutePoint;
  /** Summary line below the route (e.g. "1,200 miles · ~22h drive · $2.50/mi") */
  summary?: string;
  /** Additional class names */
  className?: string;
}

export function RouteCard({
  origin,
  destination,
  summary,
  className,
}: RouteCardProps) {
  return (
    <div
      className={cn(
        "p-3.5 bg-background border border-border rounded-lg mb-4",
        className
      )}
    >
      {/* Origin */}
      <div className="flex items-start gap-3">
        <div className="size-2.5 rounded-full bg-primary mt-1 shrink-0" />
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-text-primary">
            {origin.city}
          </div>
          {origin.dateTime && (
            <div
              className={cn(
                "text-[11px] mt-[1px]",
                origin.isLate ? "text-danger" : "text-text-secondary"
              )}
            >
              {origin.dateTime}
            </div>
          )}
        </div>
      </div>

      {/* Connector line */}
      <div className="w-0.5 h-5 bg-border-soft ml-1 my-0.5" />

      {/* Destination */}
      <div className="flex items-start gap-3">
        <div className="size-2.5 rounded-full bg-success mt-1 shrink-0" />
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-text-primary">
            {destination.city}
          </div>
          {destination.dateTime && (
            <div
              className={cn(
                "text-[11px] mt-[1px]",
                destination.isLate ? "text-danger" : "text-text-secondary"
              )}
            >
              {destination.dateTime}
            </div>
          )}
        </div>
      </div>

      {/* Miles / summary info */}
      {summary && (
        <div className="text-[11px] text-text-muted mt-2 ml-[22px]">
          {summary}
        </div>
      )}
    </div>
  );
}

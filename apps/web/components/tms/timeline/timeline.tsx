"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Timeline — Vertical timeline with completed/current/pending events
//
// v5 spec reference:
//   Container: relative, padding-left 20px
//   Vertical line: absolute, left 5px, 2px wide, border color
//   Event: relative, pb 16px, pl 16px (last-child pb 0)
//   Dot: absolute left -20px top 2px, 12px, 2px border (surface bg)
//     completed: success bg, solid
//     current: sapphire bg, pulse animation
//     pending: border-soft bg, dashed border
//   Time: 10px, text-muted, mb 2px
//   Desc: 12px/500, text-primary (pending: text-muted, italic)
//   Label: 9px/600, uppercase, tracking, inline pill (e.g. "In Progress")
// ---------------------------------------------------------------------------

export type TimelineEventState = "completed" | "current" | "pending";

export interface TimelineEvent {
  /** Unique key */
  key: string;
  /** Event state */
  state: TimelineEventState;
  /** Time string (e.g. "Feb 5, 2:30 PM" or "Awaiting") */
  time: string;
  /** Event description */
  description: string;
  /** Optional label pill (e.g. "In Progress") */
  label?: string;
  /** Label intent for coloring */
  labelIntent?: "primary" | "success" | "warning" | "danger";
}

export interface TimelineProps {
  /** List of events in chronological order */
  events: TimelineEvent[];
  /** Additional class names */
  className?: string;
}

const dotStateClass: Record<TimelineEventState, string> = {
  completed: "bg-success border-solid",
  current: "bg-primary border-solid animate-pulse-dot",
  pending: "bg-border-soft border-dashed",
};

const labelIntentClass: Record<string, string> = {
  primary: "bg-primary-light text-primary",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
};

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn("relative pl-5", className)}>
      {/* Vertical line */}
      <div className="absolute left-[5px] top-0 bottom-0 w-0.5 bg-border" />

      {events.map((event, index) => (
        <div
          key={event.key}
          className={cn(
            "relative pl-4",
            index < events.length - 1 ? "pb-4" : "pb-0"
          )}
        >
          {/* Dot */}
          <div
            className={cn(
              "absolute -left-5 top-0.5 size-3 rounded-full",
              "border-2 border-surface",
              dotStateClass[event.state]
            )}
          />

          {/* Time */}
          <div className="text-[10px] text-text-muted mb-0.5">
            {event.time}
          </div>

          {/* Description */}
          <div
            className={cn(
              "text-xs font-medium text-text-primary",
              event.state === "pending" && "text-text-muted italic"
            )}
          >
            {event.description}
          </div>

          {/* Label pill */}
          {event.label && (
            <span
              className={cn(
                "inline-block mt-0.5",
                "text-[9px] font-semibold uppercase tracking-[0.05em]",
                "px-1.5 py-[1px] rounded-[3px]",
                labelIntentClass[event.labelIntent ?? "primary"]
              )}
            >
              {event.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

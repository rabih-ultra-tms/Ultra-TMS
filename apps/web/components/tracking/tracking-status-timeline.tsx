"use client";

import { cn } from "@/lib/utils";
import { MapPin, Package, Truck, CheckCircle2, Clock } from "lucide-react";
import type { PublicStopData } from "@/lib/hooks/tracking/use-public-tracking";

interface TrackingStatusTimelineProps {
  stops: PublicStopData[];
}

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0,
  EN_ROUTE: 1,
  ARRIVED: 2,
  LOADING: 3,
  UNLOADING: 3,
  DEPARTED: 4,
  COMPLETED: 5,
};

function getStopIcon(stop: PublicStopData, isComplete: boolean) {
  if (isComplete) return CheckCircle2;
  if (stop.status === "ARRIVED") return MapPin;
  if (stop.type === "PICKUP") return Package;
  return Truck;
}

function getStopStatusLabel(stop: PublicStopData): string {
  switch (stop.status) {
    case "COMPLETED":
    case "DEPARTED":
      return stop.type === "PICKUP" ? "Picked Up" : "Delivered";
    case "ARRIVED":
      return "Arrived";
    case "EN_ROUTE":
      return "En Route";
    default:
      return "Pending";
  }
}

function formatTimestamp(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatAppointment(
  date: string | null,
  timeStart: string | null,
  timeEnd: string | null
): string | null {
  if (!date) return null;
  const d = new Date(date);
  const dateStr = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  if (timeStart && timeEnd) return `${dateStr}, ${timeStart} - ${timeEnd}`;
  if (timeStart) return `${dateStr}, ${timeStart}`;
  return dateStr;
}

export function TrackingStatusTimeline({
  stops,
}: TrackingStatusTimelineProps) {
  const sortedStops = [...stops].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="relative">
      {sortedStops.map((stop, index) => {
        const departedThreshold = STATUS_ORDER["DEPARTED"] ?? 4;
        const isComplete =
          (STATUS_ORDER[stop.status] ?? 0) >= departedThreshold;
        const isActive = stop.status === "ARRIVED" || stop.status === "EN_ROUTE";
        const isLast = index === sortedStops.length - 1;
        const Icon = getStopIcon(stop, isComplete);

        return (
          <div key={stop.id} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Vertical line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[15px] top-[32px] h-[calc(100%-16px)] w-0.5",
                  isComplete ? "bg-primary" : "bg-border"
                )}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                isComplete
                  ? "border-primary bg-primary text-primary-foreground"
                  : isActive
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border bg-background text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-medium uppercase tracking-wider",
                    stop.type === "PICKUP"
                      ? "text-blue-600"
                      : "text-emerald-600"
                  )}
                >
                  {stop.type}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    isComplete
                      ? "bg-emerald-50 text-emerald-700"
                      : isActive
                        ? "bg-primary-light text-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {isActive && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                  )}
                  {getStopStatusLabel(stop)}
                </span>
              </div>

              <p className="mt-1 font-medium text-foreground">
                {stop.facilityName || `${stop.city}, ${stop.state}`}
              </p>

              {stop.facilityName && (
                <p className="text-sm text-muted-foreground">
                  {stop.city}, {stop.state}
                  {stop.zip ? ` ${stop.zip}` : ""}
                </p>
              )}

              {/* Timestamps */}
              <div className="mt-1.5 flex flex-col gap-0.5 text-xs text-muted-foreground">
                {stop.arrivedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Arrived: {formatTimestamp(stop.arrivedAt)}
                  </span>
                )}
                {stop.departedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Departed: {formatTimestamp(stop.departedAt)}
                  </span>
                )}
                {!stop.arrivedAt && !stop.departedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatAppointment(
                      stop.appointmentDate,
                      stop.appointmentTimeStart,
                      stop.appointmentTimeEnd
                    ) ?? "Scheduled"}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

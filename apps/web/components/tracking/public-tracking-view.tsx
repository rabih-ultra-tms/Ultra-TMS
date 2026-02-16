"use client";

import { RefreshCw, Truck, Calendar, Clock, Package } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/tms/primitives/status-badge";
import { TrackingStatusTimeline } from "./tracking-status-timeline";
import { TrackingMapMini } from "./tracking-map-mini";
import type {
  PublicTrackingData,
} from "@/lib/hooks/tracking/use-public-tracking";
import type { StatusColorToken, Intent } from "@/lib/design-tokens";

interface PublicTrackingViewProps {
  data: PublicTrackingData;
  trackingCode: string;
}

const LOAD_STATUS_MAP: Record<
  string,
  { label: string; status?: StatusColorToken; intent?: Intent }
> = {
  PENDING: { label: "Pending", status: "unassigned" },
  PLANNING: { label: "Planning", status: "unassigned" },
  TENDERED: { label: "Tendered", status: "tendered" },
  ACCEPTED: { label: "Accepted", status: "tendered" },
  DISPATCHED: { label: "Dispatched", status: "dispatched" },
  AT_PICKUP: { label: "At Pickup", status: "transit" },
  PICKED_UP: { label: "Picked Up", status: "transit" },
  IN_TRANSIT: { label: "In Transit", status: "transit" },
  AT_DELIVERY: { label: "At Delivery", status: "transit" },
  DELIVERED: { label: "Delivered", status: "delivered" },
  COMPLETED: { label: "Completed", intent: "success" },
  CANCELLED: { label: "Cancelled", status: "atrisk" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "--";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "--";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getProgressPercent(status: string): number {
  const order = [
    "PENDING",
    "PLANNING",
    "TENDERED",
    "ACCEPTED",
    "DISPATCHED",
    "AT_PICKUP",
    "PICKED_UP",
    "IN_TRANSIT",
    "AT_DELIVERY",
    "DELIVERED",
    "COMPLETED",
  ];
  const index = order.indexOf(status);
  if (index === -1) return 0;
  return Math.round((index / (order.length - 1)) * 100);
}

export function PublicTrackingView({
  data,
  trackingCode,
}: PublicTrackingViewProps) {
  const queryClient = useQueryClient();
  const statusInfo = LOAD_STATUS_MAP[data.status] ?? {
    label: data.status,
    status: "unassigned" as StatusColorToken,
  };
  const progress = getProgressPercent(data.status);
  const origin = data.stops.find((s) => s.type === "PICKUP");
  const destination = [...data.stops].reverse().find((s) => s.type === "DELIVERY");

  return (
    <div className="space-y-6">
      {/* Header card with status overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tracking Number</p>
              <CardTitle className="text-xl font-bold tracking-tight">
                {data.loadNumber}
              </CardTitle>
              {data.customerName && (
                <p className="text-sm text-muted-foreground">
                  Shipment for {data.customerName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge
                status={statusInfo.status}
                intent={statusInfo.intent}
                size="lg"
                withDot
              >
                {statusInfo.label}
              </StatusBadge>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: ["public-tracking", trackingCode],
                  })
                }
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>
                {origin ? `${origin.city}, ${origin.state}` : "Origin"}
              </span>
              <span>
                {destination
                  ? `${destination.city}, ${destination.state}`
                  : "Destination"}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Key info grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Pickup
              </div>
              <p className="text-sm font-medium">
                {formatDate(data.pickupDate)}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Delivery
              </div>
              <p className="text-sm font-medium">
                {formatDate(data.deliveryDate)}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                ETA
              </div>
              <p className="text-sm font-medium">
                {data.eta ? formatDateTime(data.eta) : "--"}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Package className="h-3.5 w-3.5" />
                Equipment
              </div>
              <p className="text-sm font-medium">
                {data.equipmentType || "--"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map + Timeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Route visualization */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-4 w-4" />
              Route
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrackingMapMini
              stops={data.stops}
              currentLocation={data.currentLocation}
            />
          </CardContent>
        </Card>

        {/* Stop timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Shipment Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {data.stops.length > 0 ? (
              <TrackingStatusTimeline stops={data.stops} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No stop information available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Auto-refresh indicator */}
      <p className="text-center text-xs text-muted-foreground">
        This page auto-refreshes every 5 minutes. Last updated:{" "}
        {new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </p>
    </div>
  );
}

export function PublicTrackingViewSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-6 h-2 w-full rounded-full" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

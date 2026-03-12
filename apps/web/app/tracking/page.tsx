"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  Search,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  Package,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface TrackingStop {
  type: string;
  sequence: number;
  city: string;
  state: string;
  status: string;
  appointmentDate: string | null;
  arrivedAt: string | null;
  departedAt: string | null;
}

interface StatusHistoryEntry {
  fromStatus: string | null;
  toStatus: string;
  timestamp: string;
}

interface TrackingResult {
  trackingNumber: string;
  status: string;
  origin: { city: string; state: string } | null;
  destination: { city: string; state: string } | null;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  lastKnownLocation: {
    city: string;
    state: string;
    updatedAt: string | null;
  } | null;
  timeline: {
    dispatchedAt: string | null;
    pickedUpAt: string | null;
    deliveredAt: string | null;
  };
  stops: TrackingStop[];
  statusHistory: StatusHistoryEntry[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: "Pending",
    color: "text-slate-600",
    bgColor: "bg-slate-100",
  },
  DISPATCHED: {
    label: "Dispatched",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  AT_PICKUP: {
    label: "At Pickup",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  IN_TRANSIT: {
    label: "In Transit",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  AT_DELIVERY: {
    label: "At Delivery",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  DELIVERED: {
    label: "Delivered",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

function getStatusConfig(status: string) {
  return (
    STATUS_CONFIG[status] || {
      label: status,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    }
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const STATUS_ORDER = [
  "PENDING",
  "DISPATCHED",
  "AT_PICKUP",
  "IN_TRANSIT",
  "AT_DELIVERY",
  "DELIVERED",
];

function ProgressBar({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const isCancelled = currentStatus === "CANCELLED";

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center py-4">
        <Badge variant="destructive" className="text-sm px-4 py-1.5">
          Shipment Cancelled
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-4 px-2">
      {STATUS_ORDER.map((status, index) => {
        const config = getStatusConfig(status);
        const isComplete = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <React.Fragment key={status}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                  isComplete
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-slate-400",
                  isCurrent && "ring-2 ring-blue-200"
                )}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center max-w-[70px]",
                  isComplete ? "text-blue-600" : "text-slate-400"
                )}
              >
                {config.label}
              </span>
            </div>
            {index < STATUS_ORDER.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-1 mt-[-20px]",
                  index < currentIndex ? "bg-blue-600" : "bg-slate-200"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function TrackingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCode = searchParams.get("code") || "";

  const [trackingCode, setTrackingCode] = React.useState(initialCode);
  const [result, setResult] = React.useState<TrackingResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searched, setSearched] = React.useState(false);

  const fetchTracking = React.useCallback(async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/public/tracking/${encodeURIComponent(code.trim())}`,
        { method: "GET" }
      );

      if (res.status === 404) {
        setError("No shipment found with that tracking number.");
        return;
      }
      if (res.status === 429) {
        setError("Too many requests. Please wait a moment and try again.");
        return;
      }
      if (!res.ok) {
        setError("Something went wrong. Please try again later.");
        return;
      }

      const json = await res.json();
      setResult(json.data);
    } catch {
      setError("Unable to connect to the tracking service. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch if code is in the URL
  React.useEffect(() => {
    if (initialCode) {
      fetchTracking(initialCode);
    }
    // eslint-disable-next-line
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    // Update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set("code", trackingCode.trim());
    router.replace(url.pathname + url.search);
    fetchTracking(trackingCode);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Ultra TMS
            </h1>
            <p className="text-xs text-slate-500">Shipment Tracking</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Search */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Track Your Shipment</CardTitle>
            <CardDescription>
              Enter your tracking number to see the current status of your
              shipment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="e.g. LD-202602-00145"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={loading || !trackingCode.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Track"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* No results */}
        {searched && !loading && !error && !result && (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <Package className="h-12 w-12" />
            <p className="text-sm">No shipment found</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Status card */}
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Tracking Number</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {result.trackingNumber}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "text-sm px-3 py-1",
                      getStatusConfig(result.status).bgColor,
                      getStatusConfig(result.status).color
                    )}
                    variant="outline"
                  >
                    {getStatusConfig(result.status).label}
                  </Badge>
                </div>

                <ProgressBar currentStatus={result.status} />

                {/* Origin / Destination */}
                {(result.origin || result.destination) && (
                  <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg bg-slate-50 p-4">
                    {result.origin && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs text-slate-500">Origin</p>
                          <p className="text-sm font-medium text-slate-900">
                            {result.origin.city}, {result.origin.state}
                          </p>
                        </div>
                      </div>
                    )}
                    {result.origin && result.destination && (
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    )}
                    {result.destination && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="text-xs text-slate-500">Destination</p>
                          <p className="text-sm font-medium text-slate-900">
                            {result.destination.city},{" "}
                            {result.destination.state}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Dates */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    <Clock className="mr-1.5 inline h-4 w-4" />
                    Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Estimated Delivery</span>
                    <span className="font-medium text-slate-900">
                      {formatDate(result.estimatedDelivery)}
                    </span>
                  </div>
                  {result.actualDelivery && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Actual Delivery</span>
                      <span className="font-medium text-green-600">
                        {formatDateTime(result.actualDelivery)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Dispatched</span>
                    <span className="font-medium text-slate-900">
                      {formatDateTime(result.timeline.dispatchedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Picked Up</span>
                    <span className="font-medium text-slate-900">
                      {formatDateTime(result.timeline.pickedUpAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Last Known Location */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    <MapPin className="mr-1.5 inline h-4 w-4" />
                    Last Known Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.lastKnownLocation ? (
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        {result.lastKnownLocation.city},{" "}
                        {result.lastKnownLocation.state}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Updated{" "}
                        {formatDateTime(result.lastKnownLocation.updatedAt)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">
                      No location data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stops timeline */}
            {result.stops.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    Stops
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {result.stops.map((stop, index) => {
                      const isComplete =
                        stop.status === "COMPLETED" ||
                        stop.status === "DEPARTED";
                      const isActive =
                        stop.status === "ARRIVED" ||
                        stop.status === "EN_ROUTE";

                      return (
                        <div key={index} className="flex gap-4">
                          {/* Timeline line */}
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full border-2",
                                isComplete
                                  ? "border-green-500 bg-green-500 text-white"
                                  : isActive
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-slate-300 bg-white"
                              )}
                            >
                              {isComplete ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <Circle className="h-3 w-3" />
                              )}
                            </div>
                            {index < result.stops.length - 1 && (
                              <div
                                className={cn(
                                  "w-0.5 flex-1 min-h-[24px]",
                                  isComplete ? "bg-green-300" : "bg-slate-200"
                                )}
                              />
                            )}
                          </div>
                          {/* Stop info */}
                          <div className="pb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-900">
                                {stop.type === "PICKUP"
                                  ? "Pickup"
                                  : stop.type === "DELIVERY"
                                    ? "Delivery"
                                    : `Stop ${stop.sequence}`}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  isComplete
                                    ? "border-green-200 text-green-700"
                                    : isActive
                                      ? "border-blue-200 text-blue-700"
                                      : "border-slate-200 text-slate-500"
                                )}
                              >
                                {stop.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mt-0.5">
                              {stop.city}, {stop.state}
                            </p>
                            {stop.appointmentDate && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                Scheduled: {formatDate(stop.appointmentDate)}
                              </p>
                            )}
                            {stop.arrivedAt && (
                              <p className="text-xs text-slate-400">
                                Arrived: {formatDateTime(stop.arrivedAt)}
                              </p>
                            )}
                            {stop.departedAt && (
                              <p className="text-xs text-slate-400">
                                Departed: {formatDateTime(stop.departedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status history */}
            {result.statusHistory.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    Status History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.statusHistory.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {entry.fromStatus && (
                            <>
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                {getStatusConfig(entry.fromStatus).label}
                              </Badge>
                              <ArrowRight className="h-3 w-3 text-slate-400" />
                            </>
                          )}
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              getStatusConfig(entry.toStatus).color
                            )}
                          >
                            {getStatusConfig(entry.toStatus).label}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-500">
                          {formatDateTime(entry.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Initial state */}
        {!searched && !loading && (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <Truck className="h-12 w-12" />
            <p className="text-sm">
              Enter a tracking number above to get started
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-4 text-center text-xs text-slate-400">
        Ultra TMS &mdash; Transportation Management System
      </footer>
    </div>
  );
}

export default function PublicTrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <TrackingPageContent />
    </Suspense>
  );
}

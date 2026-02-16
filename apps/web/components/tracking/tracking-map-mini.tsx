"use client";

import { MapPin, Truck, Navigation } from "lucide-react";
import type { PublicStopData } from "@/lib/hooks/tracking/use-public-tracking";

interface TrackingMapMiniProps {
  stops: PublicStopData[];
  currentLocation: {
    lat: number;
    lng: number;
    city: string | null;
    state: string | null;
    updatedAt: string | null;
  } | null;
}

export function TrackingMapMini({
  stops,
  currentLocation,
}: TrackingMapMiniProps) {
  const origin = stops.find((s) => s.type === "PICKUP");
  const destination = [...stops].reverse().find((s) => s.type === "DELIVERY");

  return (
    <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Static visual route display */}
      <div className="flex flex-col items-center justify-center px-6 py-8">
        {/* Origin */}
        {origin && (
          <div className="flex items-center gap-3 self-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Origin
              </p>
              <p className="font-medium text-foreground">
                {origin.city}, {origin.state}
              </p>
            </div>
          </div>
        )}

        {/* Route line with truck */}
        <div className="relative my-3 flex h-24 w-full items-center justify-center">
          <div className="absolute left-5 top-0 h-full w-0.5 bg-gradient-to-b from-blue-400 via-primary to-emerald-400" />

          {/* Current location indicator on the route */}
          {currentLocation && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                <Truck className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Current Location
                </p>
                <p className="text-sm font-medium text-foreground">
                  {currentLocation.city && currentLocation.state
                    ? `${currentLocation.city}, ${currentLocation.state}`
                    : `${currentLocation.lat.toFixed(3)}, ${currentLocation.lng.toFixed(3)}`}
                </p>
                {currentLocation.updatedAt && (
                  <p className="text-xs text-muted-foreground">
                    Updated{" "}
                    {new Date(currentLocation.updatedAt).toLocaleString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* No GPS indicator */}
          {!currentLocation && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted text-muted-foreground">
                <Navigation className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">
                GPS data unavailable
              </p>
            </div>
          )}
        </div>

        {/* Destination */}
        {destination && (
          <div className="flex items-center gap-3 self-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Destination
              </p>
              <p className="font-medium text-foreground">
                {destination.city}, {destination.state}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

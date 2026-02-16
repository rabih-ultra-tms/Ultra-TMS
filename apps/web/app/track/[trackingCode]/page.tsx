"use client";

import { use } from "react";
import { Package, AlertTriangle, Search } from "lucide-react";
import {
  usePublicTracking,
  TrackingNotFoundError,
} from "@/lib/hooks/tracking/use-public-tracking";
import {
  PublicTrackingView,
  PublicTrackingViewSkeleton,
} from "@/components/tracking/public-tracking-view";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TrackingPageProps {
  params: Promise<{ trackingCode: string }>;
}

export default function TrackingPage({ params }: TrackingPageProps) {
  const { trackingCode } = use(params);
  const { data, isLoading, error, refetch } = usePublicTracking(trackingCode);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              Ultra TMS
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            Shipment Tracking
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        {isLoading && <PublicTrackingViewSkeleton />}

        {!isLoading && error && (
          <NotFoundState
            isNotFound={error instanceof TrackingNotFoundError}
            trackingCode={trackingCode}
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && data && (
          <PublicTrackingView data={data} trackingCode={trackingCode} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6 mt-12">
        <div className="mx-auto max-w-4xl px-4 text-center text-xs text-muted-foreground">
          <p>Powered by Ultra TMS</p>
          <p className="mt-1">
            For questions about this shipment, contact your account
            representative.
          </p>
        </div>
      </footer>
    </div>
  );
}

function NotFoundState({
  isNotFound,
  trackingCode,
  onRetry,
}: {
  isNotFound: boolean;
  trackingCode: string;
  onRetry: () => void;
}) {
  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="flex flex-col items-center py-12 text-center">
        {isNotFound ? (
          <>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Shipment Not Found
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn&apos;t find a shipment with tracking number{" "}
              <span className="font-mono font-medium text-foreground">
                {trackingCode}
              </span>
              .
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Please check the tracking number and try again.
            </p>
          </>
        ) : (
          <>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Unable to Load Tracking Data
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Something went wrong while fetching the shipment data. Please try
              again.
            </p>
            <Button variant="outline" className="mt-4" onClick={onRetry}>
              Try Again
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useStops } from '@/lib/hooks/tms/use-stops';
import { AlertCircle, MapPin, Plus, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';
import { StopActions } from './stop-actions';
import { StopCard } from './stop-card';

interface StopsTableProps {
  orderId: string;
}

function StopsTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Route Summary Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Stop Cards Skeleton */}
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-l-4 border-l-gray-300">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function StopsTable({ orderId }: StopsTableProps) {
  const { data: stops, isLoading, isError, error, refetch } = useStops(orderId);

  const routeMetrics = useMemo(() => {
    if (!stops || stops.length === 0) {
      return {
        totalStops: 0,
        completedStops: 0,
        completionPercentage: 0,
        hasPickup: false,
        hasDelivery: false,
      };
    }

    const completedStops = stops.filter((stop) => stop.status === 'DEPARTED').length;
    const completionPercentage =
      stops.length > 0 ? Math.round((completedStops / stops.length) * 100) : 0;
    const hasPickup = stops.some((stop) => stop.stopType === 'PICKUP');
    const hasDelivery = stops.some((stop) => stop.stopType === 'DELIVERY');

    return {
      totalStops: stops.length,
      completedStops,
      completionPercentage,
      hasPickup,
      hasDelivery,
    };
  }, [stops]);

  if (isLoading) {
    return <StopsTableSkeleton />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            {error instanceof Error ? error.message : 'Failed to load stops'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="ml-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!stops || stops.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No stops configured
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              This load has no stops configured. Every load needs at least one pickup
              and one delivery stop.
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <Button disabled>
                <Plus className="mr-2 h-4 w-4" />
                Add Pickup Stop
              </Button>
              <Button variant="outline" disabled>
                <Plus className="mr-2 h-4 w-4" />
                Add Delivery Stop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!routeMetrics.hasPickup || !routeMetrics.hasDelivery) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid stop configuration: Every load must have at least one PICKUP and one
          DELIVERY stop.
          {!routeMetrics.hasPickup && ' Missing PICKUP stop.'}
          {!routeMetrics.hasDelivery && ' Missing DELIVERY stop.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Route Summary Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-900">
                  {routeMetrics.totalStops} {routeMetrics.totalStops === 1 ? 'stop' : 'stops'}
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-600">
                  {routeMetrics.completedStops} completed
                </span>
              </div>
              <span className="font-semibold text-gray-900">
                {routeMetrics.completionPercentage}% complete
              </span>
            </div>
            <Progress value={routeMetrics.completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Stops List */}
      <div className="space-y-0">
        {stops.map((stop, index) => (
          <div key={stop.id} className="space-y-4">
            <div className="flex flex-col gap-4">
              <StopCard stop={stop} isLast={index === stops.length - 1} />
              {stop.status !== 'DEPARTED' && stop.status !== 'SKIPPED' && (
                <div className="px-6 pb-4">
                  <StopActions stop={stop} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Future Enhancement: Add Stop Button */}
      <div className="pt-4">
        <Button variant="outline" className="w-full" disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add Stop (Coming Soon)
        </Button>
      </div>
    </div>
  );
}

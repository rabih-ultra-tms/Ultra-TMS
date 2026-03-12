'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface TrackingData {
  trackingNumber: string;
  status: string;
  origin: { city: string; state: string } | null;
  destination: { city: string; state: string } | null;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  lastKnownLocation: {
    city: string;
    state: string;
    updatedAt: string;
  } | null;
  timeline: {
    dispatchedAt: string | null;
    pickedUpAt: string | null;
    deliveredAt: string | null;
  };
  stops: Array<{
    type: string;
    sequence: number;
    city: string;
    state: string;
    status: string;
    appointmentDate: string | null;
    arrivedAt: string | null;
    departedAt: string | null;
  }>;
  statusHistory: Array<{
    fromStatus: string;
    toStatus: string;
    timestamp: string;
  }>;
}

export default function PublicTrackingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-tracking', code],
    queryFn: async () => {
      const res = await fetch(`/api/v1/public/tracking/${code}`);
      if (!res.ok) {
        throw new Error('Shipment not found');
      }
      return res.json() as Promise<{ data: TrackingData }>;
    },
  });

  const tracking = data?.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">
            Track Your Shipment
          </h1>
          <p className="mt-2 text-gray-600">
            Enter your tracking code to see real-time shipment updates
          </p>
        </div>

        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">
                    Shipment Not Found
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    Could not find a shipment with tracking code &quot;{code}
                    &quot;. Please check the code and try again.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {tracking && !error && (
          <div className="space-y-6">
            {/* Status Overview */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {tracking.trackingNumber}
                    </h2>
                    <p className="mt-1 text-blue-100">Tracking Code</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${
                      tracking.status === 'DELIVERED'
                        ? 'bg-green-500 text-white'
                        : tracking.status === 'IN_TRANSIT'
                          ? 'bg-blue-500 text-white'
                          : 'bg-yellow-500 text-white'
                    }`}
                  >
                    {tracking.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600">
                      Origin
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {tracking.origin
                        ? `${tracking.origin.city}, ${tracking.origin.state}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">
                      Destination
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {tracking.destination
                        ? `${tracking.destination.city}, ${tracking.destination.state}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">
                      Est. Delivery
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {tracking.estimatedDelivery
                        ? new Date(
                            tracking.estimatedDelivery
                          ).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">
                      {tracking.actualDelivery
                        ? 'Delivered'
                        : 'Current Location'}
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {tracking.actualDelivery
                        ? new Date(tracking.actualDelivery).toLocaleDateString()
                        : tracking.lastKnownLocation
                          ? `${tracking.lastKnownLocation.city}, ${tracking.lastKnownLocation.state}`
                          : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shipment Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Dispatched */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-4 w-4 rounded-full bg-blue-600" />
                      <div className="mt-2 h-12 w-0.5 bg-gray-200" />
                    </div>
                    <div className="pb-4">
                      <p className="font-semibold text-gray-900">Dispatched</p>
                      <p className="text-sm text-gray-600">
                        {tracking.timeline.dispatchedAt
                          ? new Date(
                              tracking.timeline.dispatchedAt
                            ).toLocaleString()
                          : 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* Picked Up */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-4 w-4 rounded-full ${
                          tracking.timeline.pickedUpAt
                            ? 'bg-blue-600'
                            : 'border-2 border-gray-300 bg-white'
                        }`}
                      />
                      <div className="mt-2 h-12 w-0.5 bg-gray-200" />
                    </div>
                    <div className="pb-4">
                      <p className="font-semibold text-gray-900">Picked Up</p>
                      <p className="text-sm text-gray-600">
                        {tracking.timeline.pickedUpAt
                          ? new Date(
                              tracking.timeline.pickedUpAt
                            ).toLocaleString()
                          : 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* In Transit (Current) */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-4 w-4 rounded-full ${
                          tracking.status === 'IN_TRANSIT' ||
                          tracking.timeline.deliveredAt
                            ? 'bg-blue-600'
                            : 'border-2 border-gray-300 bg-white'
                        }`}
                      />
                      <div className="mt-2 h-12 w-0.5 bg-gray-200" />
                    </div>
                    <div className="pb-4">
                      <p className="font-semibold text-gray-900">In Transit</p>
                      <p className="text-sm text-gray-600">
                        {tracking.lastKnownLocation
                          ? `Last seen in ${tracking.lastKnownLocation.city}, ${tracking.lastKnownLocation.state}`
                          : 'No location data'}
                      </p>
                    </div>
                  </div>

                  {/* Delivered */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-4 w-4 rounded-full ${
                          tracking.timeline.deliveredAt
                            ? 'bg-green-600'
                            : 'border-2 border-gray-300 bg-white'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Delivered</p>
                      <p className="text-sm text-gray-600">
                        {tracking.timeline.deliveredAt
                          ? new Date(
                              tracking.timeline.deliveredAt
                            ).toLocaleString()
                          : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stops Information */}
            {tracking.stops.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stops</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tracking.stops.map((stop, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  stop.type === 'PICKUP'
                                    ? 'default'
                                    : stop.type === 'DELIVERY'
                                      ? 'secondary'
                                      : 'outline'
                                }
                              >
                                {stop.type === 'PICKUP'
                                  ? 'Pickup'
                                  : stop.type === 'DELIVERY'
                                    ? 'Delivery'
                                    : 'Stop'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Stop #{stop.sequence}
                              </span>
                            </div>
                            <p className="mt-2 font-semibold text-gray-900">
                              {stop.city}, {stop.state}
                            </p>
                            {stop.appointmentDate && (
                              <p className="text-sm text-gray-600">
                                Scheduled:{' '}
                                {new Date(
                                  stop.appointmentDate
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              stop.status === 'COMPLETED'
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : stop.status === 'IN_PROGRESS'
                                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                                  : 'border-yellow-200 bg-yellow-50 text-yellow-700'
                            }
                          >
                            {stop.status}
                          </Badge>
                        </div>
                        {stop.arrivedAt && (
                          <p className="mt-2 text-xs text-gray-500">
                            Arrived: {new Date(stop.arrivedAt).toLocaleString()}
                          </p>
                        )}
                        {stop.departedAt && (
                          <p className="text-xs text-gray-500">
                            Departed:{' '}
                            {new Date(stop.departedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status History */}
            {tracking.statusHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tracking.statusHistory.map((history, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 border-b pb-3 last:border-0"
                      >
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {history.fromStatus}
                          </Badge>
                          <span className="text-gray-400">→</span>
                          <Badge variant="outline" className="text-xs">
                            {history.toStatus}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 ml-auto">
                          {new Date(history.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

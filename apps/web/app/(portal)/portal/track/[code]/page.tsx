'use client';

import { useEffect, useState } from 'react';
import { useShipmentTracking } from '@/lib/hooks/usePortalData';
import { Card } from '@/components/ui/card';

export default function TrackingPage({ params }: { params: { code: string } }) {
  const { data: tracking, isLoading, error } = useShipmentTracking(params.code);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Track Shipment
        </h1>
        <p className="mt-2 text-slate-600">
          Tracking code:{' '}
          <code className="bg-slate-100 px-2 py-1 rounded font-mono text-sm">
            {params.code}
          </code>
        </p>
      </div>

      {isLoading && (
        <Card className="p-6">
          <p className="text-center text-slate-500">
            Loading tracking information...
          </p>
        </Card>
      )}

      {error && (
        <Card className="p-6 bg-red-50 border border-red-200">
          <p className="text-red-800">
            Unable to find shipment with tracking code: {params.code}
          </p>
        </Card>
      )}

      {tracking && Array.isArray(tracking) && tracking.length > 0 && (
        <>
          {/* Status Section */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Status
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="text-lg font-bold text-slate-900">
                    {tracking[0]?.status || 'In Transit'}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Current Location
                  </p>
                  <p className="mt-1 text-slate-900">
                    {tracking[0]?.location || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Latest Update
                  </p>
                  <p className="mt-1 text-slate-900">
                    {tracking[0]?.timestamp
                      ? new Date(tracking[0].timestamp).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )
                      : 'TBD'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline Section */}
          {tracking.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">
                Timeline
              </h3>
              <div className="space-y-6">
                {tracking.map((event: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-slate-400" />
                      {idx < tracking.length - 1 && (
                        <div className="w-0.5 h-12 bg-slate-200 mt-2" />
                      )}
                    </div>
                    <div className="pb-4 flex-1">
                      <p className="font-medium text-slate-900">
                        {event.status || event.description || 'Event'}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {event.timestamp
                          ? new Date(event.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })
                          : event.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {tracking && Array.isArray(tracking) && tracking.length === 0 && (
        <Card className="p-6 bg-slate-50 border border-slate-200">
          <p className="text-center text-slate-600">
            No tracking events available yet.
          </p>
        </Card>
      )}
    </div>
  );
}

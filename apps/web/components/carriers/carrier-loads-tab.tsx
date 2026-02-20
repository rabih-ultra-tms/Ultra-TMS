'use client';

import { useLoads } from '@/lib/hooks/tms/use-loads';
import { StatusBadge } from '@/components/tms/primitives/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Truck, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import type { StatusColorToken, Intent } from '@/lib/design-tokens';

const LOAD_STATUS_CONFIG: Record<string, { status?: StatusColorToken; intent?: Intent; label: string }> = {
  UNASSIGNED: { status: 'unassigned', label: 'Unassigned' },
  TENDERED: { status: 'tendered', label: 'Tendered' },
  DISPATCHED: { status: 'dispatched', label: 'Dispatched' },
  IN_TRANSIT: { status: 'transit', label: 'In Transit' },
  DELIVERED: { status: 'delivered', label: 'Delivered' },
  AT_RISK: { status: 'atrisk', label: 'At Risk' },
  CANCELLED: { intent: 'danger', label: 'Cancelled' },
};

interface CarrierLoadsTabProps {
  carrierId: string;
}

export function CarrierLoadsTab({ carrierId }: CarrierLoadsTabProps) {
  const { data, isLoading, error } = useLoads({
    carrierId,
    page: 1,
    limit: 20,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4" />
            Recent Loads
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Failed to load carrier loads. Please try again.
        </CardContent>
      </Card>
    );
  }

  const loads = data?.data ?? [];

  if (loads.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-3">
          <Truck className="h-10 w-10 text-muted-foreground" />
          <h3 className="font-medium">No loads assigned</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            This carrier has no loads assigned yet. Loads will appear here once dispatched.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Truck className="h-4 w-4" />
          Recent Loads ({data?.total ?? loads.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {loads.map((load) => {
            const statusConfig = LOAD_STATUS_CONFIG[load.status] ?? {
              status: 'unassigned' as const,
              label: load.status,
            };
            const route = [
              load.originCity && load.originState
                ? `${load.originCity}, ${load.originState}`
                : null,
              load.destinationCity && load.destinationState
                ? `${load.destinationCity}, ${load.destinationState}`
                : null,
            ]
              .filter(Boolean)
              .join(' → ');

            return (
              <div
                key={load.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/operations/loads/${load.id}`}
                      className="text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      {load.loadNumber}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <StatusBadge
                      status={statusConfig.status}
                      intent={statusConfig.intent}
                      size="sm"
                    >
                      {statusConfig.label}
                    </StatusBadge>
                  </div>
                  {route && (
                    <p className="text-xs text-muted-foreground">{route}</p>
                  )}
                </div>
                <div className="text-right space-y-1">
                  {load.pickupDate && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(load.pickupDate), 'MMM d, yyyy')}
                    </p>
                  )}
                  {load.carrierRate != null && (
                    <p className="text-xs font-medium">
                      ${(load.carrierRate / 100).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useOverdueCheckCalls, type OverdueCheckCall } from '@/lib/hooks/tms/use-checkcalls';
import { AlertCircle, PhoneCall, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export function OverdueCheckCalls() {
  const { data: overdueLoads, isLoading, error } = useOverdueCheckCalls();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-900">Failed to load overdue check calls</p>
        </div>
      </Card>
    );
  }

  if (!overdueLoads || overdueLoads.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <PhoneCall className="w-12 h-12 mx-auto text-green-500 mb-3" />
          <h3 className="font-semibold text-lg mb-2">All loads up to date</h3>
          <p className="text-sm text-muted-foreground">
            No loads are currently overdue for check calls ({'>'}{4} hours)
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold">Overdue Check Calls</h3>
          <Badge variant="destructive" className="ml-2">
            {overdueLoads.length}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {overdueLoads.map((load: OverdueCheckCall) => (
          <Card key={load.loadId} className="p-4 border-l-4 border-l-red-500">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    href={`/operations/loads/${load.loadId}`}
                    className="font-mono font-semibold text-blue-600 hover:underline"
                  >
                    {load.loadNumber}
                  </Link>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {load.status}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">{load.carrierName}</span>
                    {load.driverName && ` • Driver: ${load.driverName}`}
                  </p>
                  {load.lastCheckCallAt ? (
                    <p>
                      Last check call: {format(new Date(load.lastCheckCallAt), 'MMM dd, h:mm a')}
                    </p>
                  ) : (
                    <p className="text-red-600 font-medium">No check calls logged</p>
                  )}
                  <p className="text-red-600 font-medium">
                    Overdue by {load.hoursOverdue.toFixed(1)} hours
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/operations/loads/${load.loadId}#checkcalls`}>
                    <PhoneCall className="w-4 h-4 mr-1" />
                    Log Call
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/operations/loads/${load.loadId}`}>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}

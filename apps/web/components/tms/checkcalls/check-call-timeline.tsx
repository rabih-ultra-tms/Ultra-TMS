'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCheckCalls, type CheckCall } from '@/lib/hooks/tms/use-checkcalls';
import { format, formatDistanceToNow } from 'date-fns';
import {
  PhoneCall,
  MapPin,
  AlertCircle,
  Clock,
  TruckIcon,
} from 'lucide-react';

interface CheckCallTimelineProps {
  loadId: string;
}

const CHECK_CALL_TYPE_CONFIG: Record<
  CheckCall['type'],
  { label: string; icon: typeof PhoneCall; color: string }
> = {
  CHECK_CALL: {
    label: 'Check Call',
    icon: PhoneCall,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  ARRIVAL: {
    label: 'Arrival',
    icon: MapPin,
    color: 'bg-green-50 text-green-700 border-green-200',
  },
  DEPARTURE: {
    label: 'Departure',
    icon: TruckIcon,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  DELAY: {
    label: 'Delay',
    icon: AlertCircle,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  ISSUE: {
    label: 'Issue',
    icon: AlertCircle,
    color: 'bg-red-50 text-red-700 border-red-200',
  },
};

function calculateTimeSinceLastCheckCall(lastCheckCallAt: string): {
  hours: number;
  isOverdue: boolean;
} {
  const now = new Date();
  const lastCall = new Date(lastCheckCallAt);
  const hours = (now.getTime() - lastCall.getTime()) / (1000 * 60 * 60);
  return { hours, isOverdue: hours > 4 };
}

function CheckCallCard({ checkCall }: { checkCall: CheckCall }) {
  const config = CHECK_CALL_TYPE_CONFIG[checkCall.type] ?? CHECK_CALL_TYPE_CONFIG.CHECK_CALL;
  const Icon = config.icon;

  return (
    <Card className="p-4 relative">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={cn('font-medium', config.color)}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {format(new Date(checkCall.calledAt), 'MMM dd, h:mm a')}
            </span>
            <span className="text-xs text-muted-foreground">
              ({formatDistanceToNow(new Date(checkCall.calledAt), { addSuffix: true })})
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">
                {checkCall.city}, {checkCall.state}
              </span>
              {checkCall.gpsSource === 'GPS' && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  GPS
                </Badge>
              )}
            </div>

            {checkCall.locationDescription && (
              <p className="text-sm text-muted-foreground pl-6">
                {checkCall.locationDescription}
              </p>
            )}

            {checkCall.etaToNextStop && (
              <div className="flex items-center gap-2 text-sm pl-6">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>
                  ETA: {format(new Date(checkCall.etaToNextStop), 'MMM dd, h:mm a')}
                </span>
              </div>
            )}

            {checkCall.notes && (
              <div className="pl-6 pt-2 border-t">
                <p className="text-sm text-foreground italic">{checkCall.notes}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-3 pt-3 border-t text-xs text-muted-foreground">
            <span>
              Logged by: <span className="font-medium">{checkCall.calledBy.name}</span>
            </span>
            <Badge variant="outline" className="text-xs">
              {checkCall.source}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

function TimelineGap({ previousCheckCall, currentCheckCall }: {
  previousCheckCall: CheckCall;
  currentCheckCall: CheckCall;
}) {
  const gapMs = new Date(previousCheckCall.calledAt).getTime() - new Date(currentCheckCall.calledAt).getTime();
  const gapHours = gapMs / (1000 * 60 * 60);
  const isOverdue = gapHours > 4;

  const gapText = gapHours < 1
    ? `${Math.round(gapHours * 60)} min gap`
    : `${gapHours.toFixed(1)}h gap`;

  return (
    <div className="flex items-center justify-center py-2">
      <div className={cn(
        'text-xs px-2 py-1 rounded',
        isOverdue
          ? 'bg-red-50 text-red-700 font-medium'
          : 'text-muted-foreground'
      )}>
        {gapText}
        {isOverdue && ' ⚠️ OVERDUE'}
      </div>
    </div>
  );
}

function OverdueWarning({ lastCheckCallAt }: { lastCheckCallAt: string }) {
  const { hours, isOverdue } = calculateTimeSinceLastCheckCall(lastCheckCallAt);

  if (!isOverdue) return null;

  return (
    <Card className="p-4 bg-red-50 border-red-200 mb-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <div>
          <p className="font-medium text-red-900">Check Call Overdue</p>
          <p className="text-sm text-red-700">
            Last check call was {hours.toFixed(1)} hours ago ({'>'}{4}h threshold)
          </p>
        </div>
      </div>
    </Card>
  );
}

export function CheckCallTimeline({ loadId }: CheckCallTimelineProps) {
  const { data: checkCalls, isLoading, error } = useCheckCalls(loadId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-900">Failed to load check calls</p>
        </div>
      </Card>
    );
  }

  if (!checkCalls || checkCalls.length === 0) {
    return (
      <Card className="p-8 text-center">
        <PhoneCall className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-semibold text-lg mb-2">No check calls logged yet</h3>
        <p className="text-sm text-muted-foreground">
          Check calls record driver status updates during transit. Log the first check call when
          the driver contacts you.
        </p>
      </Card>
    );
  }

  const lastCheckCall = checkCalls[0];
  if (!lastCheckCall) {
    return null;
  }

  return (
    <div className="space-y-4">
      <OverdueWarning lastCheckCallAt={lastCheckCall.calledAt} />

      <div className="space-y-2">
        {checkCalls.map((checkCall: CheckCall, index: number) => {
          const nextCheckCall = checkCalls[index + 1];
          return (
            <div key={checkCall.id}>
              <CheckCallCard checkCall={checkCall} />
              {nextCheckCall && (
                <TimelineGap
                  previousCheckCall={checkCall}
                  currentCheckCall={nextCheckCall}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

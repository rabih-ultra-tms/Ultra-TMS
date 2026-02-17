'use client';

import { useDashboardActivity, type Period } from '@/lib/hooks/tms/use-ops-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

interface OpsActivityFeedProps {
  period?: Period;
  maxVisible?: number;
  onViewAll?: () => void;
}

export function OpsActivityFeed({
  period = 'today',
  maxVisible = 10,
  onViewAll,
}: OpsActivityFeedProps) {
  const { data: activities, isLoading, error } = useDashboardActivity(period);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <Skeleton className="mb-4 h-5 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-900">Unable to load activity</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-600 underline hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  const visibleActivities = activities?.slice(0, maxVisible) || [];

  const handleEntityClick = (activity: typeof activities[0]) => {
    if (activity.entityType === 'load') {
      router.push(`/operations/loads/${activity.entityId}`);
    } else if (activity.entityType === 'order') {
      router.push(`/operations/orders/${activity.entityId}`);
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = parseISO(timestamp);

    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      {/* Header */}
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Today&apos;s Activity
      </h3>

      {/* Activity List */}
      {visibleActivities.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-text-muted">
          No activity yet. Create your first order to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleActivities.map((activity) => (
            <div
              key={activity.id}
              className="group flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
            >
              {/* Timestamp */}
              <div className="flex-shrink-0 pt-0.5">
                <span className="text-[11px] font-medium text-text-muted">
                  {formatTime(activity.timestamp)}
                </span>
              </div>

              {/* Separator */}
              <span className="text-text-muted">—</span>

              {/* Content */}
              <div className="flex-1 min-w-0 text-xs text-text-muted">
                <span className="font-medium text-text-primary">
                  {activity.userName}
                </span>{' '}
                {activity.action}{' '}
                <button
                  onClick={() => handleEntityClick(activity)}
                  className="font-mono font-semibold text-blue-600 hover:underline"
                >
                  {activity.entityNumber}
                </button>
                {activity.description && (
                  <span className="ml-1">{activity.description}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All link */}
      {activities && activities.length > maxVisible && (
        <button
          onClick={onViewAll}
          className="mt-4 w-full text-center text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          View full activity log
        </button>
      )}
    </div>
  );
}

'use client';

import { useCollectionsQueue } from '@/lib/hooks/credit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  Phone,
  Mail,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { formatCurrency, formatDateTimeShort } from '@/lib/utils/format';

interface CollectionActivityLogProps {
  companyId: string;
}

export function CollectionActivityLog({
  companyId,
}: CollectionActivityLogProps) {
  const {
    data: collectionsData,
    isLoading,
    error,
  } = useCollectionsQueue({
    companyId,
  });

  const activities = collectionsData?.data || [];

  if (isLoading) {
    return <ActivityLogSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <p className="text-sm text-red-700">
          Failed to load activity log. Please try again.
        </p>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CALL':
        return <Phone className="h-5 w-5 text-blue-600" />;
      case 'EMAIL':
        return <Mail className="h-5 w-5 text-purple-600" />;
      case 'PAYMENT':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'FOLLOW_UP':
        return <CheckCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CALL: 'Phone Call',
      EMAIL: 'Email',
      PAYMENT: 'Payment Received',
      FOLLOW_UP: 'Follow Up',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800' },
      FAILED: { bg: 'bg-red-100', text: 'text-red-800' },
    };
    const badge = badges[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
    };
    return badge;
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collection Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">No activity recorded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collection Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0 divide-y divide-gray-200">
          {activities.map((activity, index) => {
            const badge = getStatusBadge(activity.status || 'PENDING');
            return (
              <div
                key={activity.id || index}
                className="py-4 first:pt-0 last:pb-0"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 pt-1">
                    {getActivityIcon(activity.activityType || 'FOLLOW_UP')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {getActivityTypeLabel(
                            activity.activityType || 'FOLLOW_UP'
                          )}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTimeShort(
                            new Date(activity.activityDate || Date.now())
                          )}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${badge.bg} ${badge.text}`}
                      >
                        {activity.status || 'PENDING'}
                      </span>
                    </div>

                    {activity.amount && activity.activityType === 'PAYMENT' && (
                      <p className="text-lg font-semibold text-green-600 mt-2">
                        {formatCurrency(activity.amount)}
                      </p>
                    )}

                    {activity.notes && (
                      <p className="text-sm text-gray-700 mt-2 break-words">
                        {activity.notes}
                      </p>
                    )}

                    {activity.assignedTo && (
                      <p className="text-xs text-gray-600 mt-2">
                        Assigned to:{' '}
                        <span className="font-medium">
                          {activity.assignedTo}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activities.length > 5 && (
          <div className="mt-4 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All Activities
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityLogSkeleton() {
  return (
    <div data-testid="activity-log-skeleton">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-5 w-5 flex-shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

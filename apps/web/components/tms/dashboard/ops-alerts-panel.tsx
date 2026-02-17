'use client';

import { useDashboardAlerts, type DashboardAlert } from '@/lib/hooks/tms/use-ops-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Eye, Phone, Edit, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface OpsAlertsPanelProps {
  maxVisible?: number;
  onViewAll?: () => void;
}

export function OpsAlertsPanel({
  maxVisible = 5,
  onViewAll,
}: OpsAlertsPanelProps) {
  const { data: alerts, isLoading, error, refetch } = useDashboardAlerts();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-900">Unable to load alerts</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-sm text-red-600 underline hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  const visibleAlerts = alerts?.slice(0, maxVisible) || [];
  const totalAlerts = alerts?.length || 0;

  const handleAlertClick = (alert: DashboardAlert) => {
    if (alert.entityType === 'load') {
      router.push(`/operations/loads/${alert.entityId}`);
    } else if (alert.entityType === 'order') {
      router.push(`/operations/orders/${alert.entityId}`);
    } else if (alert.entityType === 'carrier') {
      router.push(`/carriers/${alert.entityId}`);
    }
  };

  const getActionButton = (alert: DashboardAlert) => {
    switch (alert.actionType) {
      case 'call':
        return (
          <button
            className="rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-text-primary hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              handleAlertClick(alert);
            }}
          >
            <Phone className="inline size-3 mr-1" />
            Call
          </button>
        );
      case 'update':
        return (
          <button
            className="rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-text-primary hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              handleAlertClick(alert);
            }}
          >
            <Edit className="inline size-3 mr-1" />
            Update
          </button>
        );
      case 'log':
        return (
          <button
            className="rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-text-primary hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              handleAlertClick(alert);
            }}
          >
            <FileText className="inline size-3 mr-1" />
            Log
          </button>
        );
      case 'view':
      default:
        return (
          <button
            className="rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-text-primary hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              handleAlertClick(alert);
            }}
          >
            <Eye className="inline size-3 mr-1" />
            View
          </button>
        );
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Alerts & Exceptions
          {totalAlerts > 0 && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
              {totalAlerts}
            </span>
          )}
        </h3>
      </div>

      {/* Alerts List */}
      {visibleAlerts.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-text-muted">
          No active alerts — you&apos;re all clear!
        </div>
      ) : (
        <div className="space-y-3">
          {visibleAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`group cursor-pointer rounded-lg border-l-4 bg-gray-50 p-3 transition-all hover:shadow-md ${
                alert.severity === 'critical'
                  ? 'border-l-red-500'
                  : alert.severity === 'warning'
                  ? 'border-l-amber-500'
                  : 'border-l-blue-500'
              }`}
              onClick={() => handleAlertClick(alert)}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <AlertTriangle
                  className={`mt-0.5 size-4 flex-shrink-0 ${
                    alert.severity === 'critical'
                      ? 'text-red-600'
                      : alert.severity === 'warning'
                      ? 'text-amber-600'
                      : 'text-blue-600'
                  }`}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Entity number */}
                  <div className="mb-1">
                    <span className="font-mono text-xs font-semibold text-text-primary">
                      {alert.entityNumber}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-xs text-text-muted">{alert.message}</p>

                  {/* Time ago */}
                  <p className="mt-1 text-[10px] text-text-muted">
                    {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                  </p>
                </div>

                {/* Action button */}
                <div className="flex-shrink-0">
                  {getActionButton(alert)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All link */}
      {totalAlerts > maxVisible && (
        <button
          onClick={onViewAll}
          className="mt-4 w-full text-center text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          View all {totalAlerts} alerts
        </button>
      )}
    </div>
  );
}

'use client';

/**
 * Command Center Alerts Panel
 *
 * Real-time alerts panel with severity filtering, auto-refresh indicator,
 * and summary stats. Shows stale check calls, unassigned loads, expiring insurance.
 *
 * MP-05-010: Alert system (real-time panel)
 */

import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  Shield,
  Loader2,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useCommandCenterAlerts,
  useAcknowledgeAlert,
} from '@/lib/hooks/command-center/use-command-center';
import type { CommandCenterAlert } from '@/lib/hooks/command-center/use-command-center';
import { useCommandCenterStore } from '@/lib/stores/command-center-store';
import type { DrawerEntityType } from '@/lib/hooks/tms/use-command-center';

type SeverityFilter = 'all' | 'critical' | 'warning' | 'info';

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
    badge: 'destructive' as const,
    label: 'Critical',
  },
  warning: {
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    badge: 'secondary' as const,
    label: 'Warning',
  },
  info: {
    icon: Shield,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    badge: 'outline' as const,
    label: 'Info',
  },
};

const FILTER_TABS: { value: SeverityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
];

export function AlertsPanel() {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const {
    data: alertsData,
    isLoading,
    isFetching,
    dataUpdatedAt,
    refetch,
  } = useCommandCenterAlerts();
  const acknowledgeAlert = useAcknowledgeAlert();
  const openDrawer = useCommandCenterStore((s) => s.openDrawer);

  const alerts = alertsData?.data ?? [];

  const filteredAlerts = useMemo(
    () =>
      severityFilter === 'all'
        ? alerts
        : alerts.filter((a) => a.severity === severityFilter),
    [alerts, severityFilter]
  );

  const severityCounts = useMemo(() => {
    const counts = { critical: 0, warning: 0, info: 0 };
    for (const alert of alerts) {
      counts[alert.severity]++;
    }
    return counts;
  }, [alerts]);

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header with summary stats */}
      <div className="shrink-0 border-b border-border px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            Alerts
            {alerts.length > 0 && (
              <span className="ml-1.5 text-muted-foreground">
                ({alerts.length})
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-[10px] text-muted-foreground">
                Updated {lastUpdated}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={cn(
                  'h-3.5 w-3.5',
                  isFetching && 'animate-spin'
                )}
              />
            </Button>
          </div>
        </div>

        {/* Severity summary badges */}
        {alerts.length > 0 && (
          <div className="flex items-center gap-2">
            {severityCounts.critical > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-red-600 font-medium">
                  {severityCounts.critical} critical
                </span>
              </div>
            )}
            {severityCounts.warning > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-amber-600 font-medium">
                  {severityCounts.warning} warning
                </span>
              </div>
            )}
            {severityCounts.info > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-blue-600 font-medium">
                  {severityCounts.info} info
                </span>
              </div>
            )}
          </div>
        )}

        {/* Severity filter tabs */}
        {alerts.length > 0 && (
          <div className="flex items-center gap-1" role="tablist">
            <Filter className="h-3 w-3 text-muted-foreground mr-1" />
            {FILTER_TABS.map((tab) => {
              const count =
                tab.value === 'all'
                  ? alerts.length
                  : severityCounts[tab.value];
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={
                    severityFilter === tab.value ? 'true' : 'false'
                  }
                  onClick={() => setSeverityFilter(tab.value)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                    severityFilter === tab.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className="ml-1 opacity-70">({count})</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Alert list or empty state */}
      {filteredAlerts.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30">
              <Shield className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-sm font-medium">
              {severityFilter === 'all' ? 'All Clear' : 'No Matching Alerts'}
            </p>
            <p className="text-xs text-muted-foreground">
              {severityFilter === 'all'
                ? 'No alerts at this time'
                : `No ${severityFilter} alerts. Try a different filter.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {filteredAlerts.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              onAcknowledge={() => acknowledgeAlert.mutate(alert.id)}
              onOpenEntity={() =>
                openDrawer(
                  alert.entityType as DrawerEntityType,
                  alert.entityId
                )
              }
            />
          ))}
        </div>
      )}

      {/* Auto-refresh indicator */}
      {isFetching && !isLoading && (
        <div className="shrink-0 border-t border-border px-4 py-1.5 flex items-center gap-2 bg-muted/30">
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            Refreshing alerts...
          </span>
        </div>
      )}
    </div>
  );
}

function AlertRow({
  alert,
  onAcknowledge,
  onOpenEntity,
}: {
  alert: CommandCenterAlert;
  onAcknowledge: () => void;
  onOpenEntity: () => void;
}) {
  const config = SEVERITY_CONFIG[alert.severity];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-start gap-3 px-4 py-3', config.bg)}>
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', config.color)} />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEntity}
            className="text-sm font-medium hover:underline truncate text-left"
          >
            {alert.title}
          </button>
          <Badge variant={config.badge} className="shrink-0 text-[10px]">
            {alert.severity}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{alert.description}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 text-xs h-7"
        onClick={onAcknowledge}
      >
        Dismiss
      </Button>
    </div>
  );
}

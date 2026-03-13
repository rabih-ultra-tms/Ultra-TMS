'use client';

/**
 * Command Center Alerts Panel
 *
 * Functional alerts panel showing real-time alerts from the backend:
 * stale check calls, unassigned loads, expiring insurance.
 */

import { AlertTriangle, Clock, Shield, Loader2 } from 'lucide-react';
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

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
    badge: 'destructive' as const,
  },
  warning: {
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    badge: 'secondary' as const,
  },
  info: {
    icon: Shield,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    badge: 'outline' as const,
  },
};

export function AlertsPanel() {
  const { data: alertsData, isLoading } = useCommandCenterAlerts();
  const acknowledgeAlert = useAcknowledgeAlert();
  const openDrawer = useCommandCenterStore((s) => s.openDrawer);

  const alerts = alertsData?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30">
            <Shield className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="text-sm font-medium">All Clear</p>
          <p className="text-xs text-muted-foreground">
            No alerts at this time
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Alerts ({alerts.length})</h3>
      </div>
      <div className="divide-y divide-border">
        {alerts.map((alert) => (
          <AlertRow
            key={alert.id}
            alert={alert}
            onAcknowledge={() => acknowledgeAlert.mutate(alert.id)}
            onOpenEntity={() =>
              openDrawer(alert.entityType as DrawerEntityType, alert.entityId)
            }
          />
        ))}
      </div>
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

'use client';

/**
 * Command Center KPI Strip
 *
 * Horizontal strip of key performance indicators shown below the toolbar.
 * Fetches real data from GET /command-center/kpis and displays per-tab metrics.
 */

import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useCommandCenterKPIs,
  useCommandCenterAlerts,
} from '@/lib/hooks/command-center/use-command-center';
import { useCommandCenterStore } from '@/lib/stores/command-center-store';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { CCTab } from '@/lib/hooks/tms/use-command-center';

interface KPIItem {
  label: string;
  value: string | number;
  icon: typeof Package;
  color?: string;
}

interface CommandCenterKPIStripProps {
  activeTab: CCTab;
}

export function CommandCenterKPIStrip({
  activeTab,
}: CommandCenterKPIStripProps) {
  const { data: kpis, isLoading } = useCommandCenterKPIs();
  const { data: alertsData } = useCommandCenterAlerts();
  const { kpiStripCollapsed, toggleKpiStrip } = useCommandCenterStore();

  const alertCounts = alertsData?.data
    ? {
        total: alertsData.data.length,
        critical: alertsData.data.filter((a) => a.severity === 'critical')
          .length,
        warning: alertsData.data.filter((a) => a.severity === 'warning').length,
        info: alertsData.data.filter((a) => a.severity === 'info').length,
      }
    : undefined;

  const items = getKPIsForTab(activeTab, kpis, alertCounts);

  if (items.length === 0) return null;

  return (
    <div className="border-b border-border bg-muted/30">
      <div className="flex items-center px-4 py-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground"
          onClick={toggleKpiStrip}
          aria-label={
            kpiStripCollapsed ? 'Expand KPI strip' : 'Collapse KPI strip'
          }
        >
          {kpiStripCollapsed ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )}
        </Button>
        {!kpiStripCollapsed && (
          <div className="flex items-center gap-6 px-3 py-1">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-5 w-10" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                ))
              : items.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        color ?? 'text-muted-foreground'
                      )}
                    />
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-semibold tabular-nums">
                        {value}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {label}
                      </span>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface AlertCounts {
  total: number;
  critical: number;
  warning: number;
  info: number;
}

function getKPIsForTab(
  tab: CCTab,
  kpis: ReturnType<typeof useCommandCenterKPIs>['data'] | undefined,
  alertCounts?: AlertCounts
): KPIItem[] {
  if (tab === 'alerts') {
    if (!alertCounts) return [{ label: 'Loading', value: '—', icon: Package }];
    return [
      {
        label: 'Total',
        value: alertCounts.total,
        icon: AlertTriangle,
        color: 'text-orange-600',
      },
      {
        label: 'Critical',
        value: alertCounts.critical,
        icon: AlertTriangle,
        color: 'text-red-600',
      },
      {
        label: 'Warning',
        value: alertCounts.warning,
        icon: Clock,
        color: 'text-amber-600',
      },
      {
        label: 'Info',
        value: alertCounts.info,
        icon: Shield,
        color: 'text-blue-600',
      },
      ...(kpis
        ? [
            {
              label: 'At Risk',
              value: kpis.loads.atRisk,
              icon: Truck,
              color: 'text-red-600',
            },
          ]
        : []),
    ];
  }

  if (!kpis) {
    return [{ label: 'Loading', value: '—', icon: Package }];
  }

  switch (tab) {
    case 'loads':
      return [
        {
          label: 'Today',
          value: kpis.loads.today,
          icon: Package,
          color: 'text-blue-600',
        },
        {
          label: 'Pending',
          value: kpis.loads.pending,
          icon: Clock,
          color: 'text-amber-600',
        },
        {
          label: 'In Transit',
          value: kpis.loads.inTransit,
          icon: Truck,
          color: 'text-cyan-600',
        },
        {
          label: 'Delivered',
          value: kpis.loads.delivered,
          icon: CheckCircle,
          color: 'text-emerald-600',
        },
        {
          label: 'At Risk',
          value: kpis.loads.atRisk,
          icon: AlertTriangle,
          color: 'text-red-600',
        },
        {
          label: 'Revenue',
          value: `$${(kpis.revenue.today / 1000).toFixed(1)}K`,
          icon: DollarSign,
          color: 'text-emerald-600',
        },
        {
          label: 'On-Time',
          value: `${kpis.performance.onTimePercent}%`,
          icon: TrendingUp,
          color: 'text-indigo-600',
        },
      ];
    case 'quotes':
      return [
        {
          label: 'Active',
          value: kpis.quotes.active,
          icon: Package,
          color: 'text-blue-600',
        },
        {
          label: 'Pending',
          value: kpis.quotes.pendingApproval,
          icon: Clock,
          color: 'text-amber-600',
        },
      ];
    case 'carriers':
      return [
        {
          label: 'Available',
          value: kpis.carriers.available,
          icon: Users,
          color: 'text-emerald-600',
        },
        {
          label: 'On Load',
          value: kpis.carriers.onLoad,
          icon: Truck,
          color: 'text-blue-600',
        },
      ];
    case 'tracking':
      return [
        {
          label: 'In Transit',
          value: kpis.loads.inTransit,
          icon: Truck,
          color: 'text-cyan-600',
        },
        {
          label: 'On-Time',
          value: `${kpis.performance.onTimePercent}%`,
          icon: TrendingUp,
          color: 'text-indigo-600',
        },
        {
          label: 'At Risk',
          value: kpis.loads.atRisk,
          icon: AlertTriangle,
          color: 'text-red-600',
        },
      ];
    default:
      return [];
  }
}

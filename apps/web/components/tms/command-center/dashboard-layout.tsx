'use client';

/**
 * Dashboard Layout — Command Center Layout Mode
 *
 * Widget grid for ops managers: KPI cards, alerts list, activity feed,
 * and summary panels. Overview-first layout with no kanban/table.
 *
 * MP-05-008
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
  Loader2,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertsPanel } from './alerts-panel';
import {
  useCommandCenterKPIs,
  type CommandCenterKPIs,
} from '@/lib/hooks/command-center/use-command-center';

interface KPICardConfig {
  label: string;
  value: string | number;
  icon: typeof Package;
  color: string;
  bgColor: string;
  change?: string;
}

function KPICard({ label, value, icon: Icon, color, bgColor }: KPICardConfig) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', bgColor)}>
          <Icon className={cn('h-5 w-5', color)} />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function KPICardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

function buildKPICards(kpis: CommandCenterKPIs): KPICardConfig[] {
  return [
    {
      label: 'Loads Today',
      value: kpis.loads.today,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950/40',
    },
    {
      label: 'Pending',
      value: kpis.loads.pending,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-950/40',
    },
    {
      label: 'In Transit',
      value: kpis.loads.inTransit,
      icon: Truck,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100 dark:bg-cyan-950/40',
    },
    {
      label: 'Delivered',
      value: kpis.loads.delivered,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-950/40',
    },
    {
      label: 'At Risk',
      value: kpis.loads.atRisk,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-950/40',
    },
    {
      label: 'Revenue Today',
      value: `$${(kpis.revenue.today / 1000).toFixed(1)}K`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-950/40',
    },
    {
      label: 'Margin',
      value: `${kpis.revenue.margin}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-950/40',
    },
    {
      label: 'On-Time %',
      value: `${kpis.performance.onTimePercent}%`,
      icon: TrendingUp,
      color: 'text-violet-600',
      bgColor: 'bg-violet-100 dark:bg-violet-950/40',
    },
    {
      label: 'Active Quotes',
      value: kpis.quotes.active,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950/40',
    },
    {
      label: 'Carriers Available',
      value: kpis.carriers.available,
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-950/40',
    },
  ];
}

function ActivityFeedPlaceholder() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center">
        <div className="text-center space-y-2">
          <Activity className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Recent activity</p>
          <p className="text-xs text-muted-foreground/70">
            Wire to GET /command-center/activity
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardLayout() {
  const { data: kpis, isLoading } = useCommandCenterKPIs();

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 gap-4">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <KPICardSkeleton key={i} />)
          : kpis
            ? buildKPICards(kpis).slice(0, 5).map((card) => (
                <KPICard key={card.label} {...card} />
              ))
            : null}
      </div>

      {/* Secondary KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <KPICardSkeleton key={i} />)
          : kpis
            ? buildKPICards(kpis).slice(5).map((card) => (
                <KPICard key={card.label} {...card} />
              ))
            : null}
      </div>

      {/* Bottom section: Alerts + Activity Feed side by side */}
      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 min-h-[300px]">
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <AlertsPanel />
          </CardContent>
        </Card>

        <ActivityFeedPlaceholder />
      </div>
    </div>
  );
}

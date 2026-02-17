'use client';

/**
 * Dispatch KPI Strip
 *
 * Displays load counts by status at the top of the board.
 */

import { Card } from '@/components/ui/card';
import type { DispatchBoardStats } from '@/lib/types/dispatch';
import { cn } from '@/lib/utils';

interface DispatchKpiStripProps {
  stats: DispatchBoardStats;
}

interface KpiCardProps {
  label: string;
  value: number;
  variant?: 'default' | 'warning' | 'danger' | 'success';
}

function KpiCard({ label, value, variant = 'default' }: KpiCardProps) {
  const variantStyles = {
    default: 'bg-background border',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    danger: 'bg-red-50 border-red-200 text-red-900',
    success: 'bg-lime-50 border-lime-200 text-lime-900',
  };

  return (
    <Card className={cn('px-4 py-2.5', variantStyles[variant])}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-lg font-bold tabular-nums">{value}</span>
      </div>
    </Card>
  );
}

export function DispatchKpiStrip({ stats }: DispatchKpiStripProps) {
  return (
    <div className="border-b bg-muted/30 px-6 py-3">
      <div className="grid grid-cols-8 gap-3">
        <KpiCard
          label="Unassigned"
          value={stats.unassigned}
          variant={stats.unassigned > 10 ? 'danger' : 'default'}
        />
        <KpiCard label="Tendered" value={stats.tendered} />
        <KpiCard label="Dispatched" value={stats.dispatched} />
        <KpiCard label="In Transit" value={stats.inTransit} />
        <KpiCard label="At Stop" value={stats.atStop} variant={stats.atStop > 0 ? 'warning' : 'default'} />
        <KpiCard label="Delivered" value={stats.deliveredToday} variant="success" />
        <KpiCard label="Total Active" value={stats.totalActive} />
        <KpiCard
          label="At Risk"
          value={stats.atRisk}
          variant={stats.atRisk > 0 ? 'danger' : 'default'}
        />
      </div>
    </div>
  );
}

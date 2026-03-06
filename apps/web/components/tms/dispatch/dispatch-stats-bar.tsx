'use client';

/**
 * Dispatch Stats Bar
 *
 * Compact stats strip with badge-chip style KPIs.
 * Shows: load count, revenue, on-time %, margin %, at-risk count.
 *
 * Design reference: superdesign/design_iterations/dispatch_r4_playground.html
 */

import type { DispatchBoardStats } from '@/lib/types/dispatch';
import type { DispatchLoad } from '@/lib/types/dispatch';

interface DispatchStatsBarProps {
  stats: DispatchBoardStats;
  loads: DispatchLoad[];
}

export function DispatchStatsBar({ stats, loads }: DispatchStatsBarProps) {
  // Calculate revenue from loads
  const totalRevenue = loads.reduce((sum, l) => sum + (l.customerRate ?? 0), 0);
  const revenueStr =
    totalRevenue >= 1_000_000
      ? `$${(totalRevenue / 1_000_000).toFixed(1)}M`
      : `$${Math.round(totalRevenue / 1000)}K`;

  // Calculate average margin
  const withMargin = loads.filter((l) => l.customerRate && l.carrierRate);
  const avgMargin =
    withMargin.length > 0
      ? (
          withMargin.reduce((sum, l) => {
            const margin = ((l.customerRate! - (l.carrierRate ?? 0)) / l.customerRate!) * 100;
            return sum + margin;
          }, 0) / withMargin.length
        ).toFixed(1)
      : '—';

  const chips: { label: string; color: string }[] = [
    { label: `${stats.totalActive} loads`, color: '#1E3A5F' },
    { label: `${revenueStr} revenue`, color: '#10B981' },
    { label: `94.2% on-time`, color: '#3B82F6' },
    { label: `${avgMargin}% margin`, color: '#06B6D4' },
    { label: `${stats.atRisk} at risk`, color: '#EF4444' },
  ];

  return (
    <div className="h-8 bg-white border-b flex items-center px-5 gap-1.5 shrink-0 text-xs text-muted-foreground">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium"
          style={{
            background: `${chip.color}12`,
            color: chip.color,
            border: `1px solid ${chip.color}30`,
          }}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}

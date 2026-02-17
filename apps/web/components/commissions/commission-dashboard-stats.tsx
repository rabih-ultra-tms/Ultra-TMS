'use client';

import { KpiCard } from '@/components/tms/stats/kpi-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Percent,
} from 'lucide-react';
import type { CommissionDashboardData } from '@/lib/hooks/commissions/use-commission-dashboard';

interface CommissionDashboardStatsProps {
  data: CommissionDashboardData | undefined;
  isLoading: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatChange(value: number | undefined): {
  trend: 'up' | 'down';
  label: string;
} | null {
  if (value === undefined || value === 0) return null;
  return {
    trend: value > 0 ? 'up' : 'down',
    label: `${value > 0 ? '+' : ''}${value.toFixed(1)}%`,
  };
}

export function CommissionDashboardStats({ data, isLoading }: CommissionDashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-lg" />
        ))}
      </div>
    );
  }

  const pendingChange = formatChange(data?.pendingChange);
  const mtdChange = formatChange(data?.paidMTDChange);
  const ytdChange = formatChange(data?.paidYTDChange);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        icon={<DollarSign />}
        label="Pending Commission"
        value={formatCurrency(data?.pendingTotal ?? 0)}
        trend={pendingChange?.trend}
        trendLabel={pendingChange?.label}
        subtext="Awaiting approval/payout"
      />
      <KpiCard
        icon={<TrendingUp />}
        label="Paid This Month"
        value={formatCurrency(data?.paidMTD ?? 0)}
        trend={mtdChange?.trend}
        trendLabel={mtdChange?.label}
        subtext="Month to date"
      />
      <KpiCard
        icon={<Calendar />}
        label="Paid This Year"
        value={formatCurrency(data?.paidYTD ?? 0)}
        trend={ytdChange?.trend}
        trendLabel={ytdChange?.label}
        subtext="Year to date"
      />
      <KpiCard
        icon={<Percent />}
        label="Avg Commission Rate"
        value={`${(data?.avgCommissionRate ?? 0).toFixed(1)}%`}
        subtext="Across all reps"
      />
    </div>
  );
}

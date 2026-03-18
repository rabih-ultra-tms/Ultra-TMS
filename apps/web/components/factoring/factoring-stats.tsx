'use client';

import { KpiCard } from '@/components/tms/stats/kpi-card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Clock, AlertCircle, TrendingUp } from 'lucide-react';

interface FactoringStatsProps {
  totalFactoredYTD: number;
  pendingCount: number;
  scheduledAmount: number;
  failedCount: number;
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

export function FactoringStats({
  totalFactoredYTD,
  pendingCount,
  scheduledAmount,
  failedCount,
  isLoading,
}: FactoringStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        icon={<DollarSign />}
        label="Total Factored"
        value={formatCurrency(totalFactoredYTD)}
        subtext="Year to date"
      />
      <KpiCard
        icon={<Clock />}
        label="Pending"
        value={pendingCount.toString()}
        subtext="Awaiting approval"
        variant={pendingCount > 0 ? 'warning' : 'default'}
      />
      <KpiCard
        icon={<TrendingUp />}
        label="Scheduled"
        value={formatCurrency(scheduledAmount)}
        subtext="Upcoming payments"
      />
      <KpiCard
        icon={<AlertCircle />}
        label="Failed"
        value={failedCount.toString()}
        subtext="Needs attention"
        variant={failedCount > 0 ? 'danger' : 'default'}
      />
    </div>
  );
}

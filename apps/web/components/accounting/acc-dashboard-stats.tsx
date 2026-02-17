'use client';

import { KpiCard } from '@/components/tms/stats/kpi-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  CreditCard,
  AlertTriangle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import type { AccountingDashboardData } from '@/lib/hooks/accounting/use-accounting-dashboard';

interface AccDashboardStatsProps {
  data: AccountingDashboardData | undefined;
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

export function AccDashboardStats({ data, isLoading }: AccDashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-lg" />
        ))}
      </div>
    );
  }

  const arChange = formatChange(data?.totalARChange);
  const apChange = formatChange(data?.totalAPChange);
  const overdueChange = formatChange(data?.overdueChange);
  const dsoChange = formatChange(data?.dsoChange);
  const revenueChange = formatChange(data?.revenueMTDChange);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <KpiCard
        icon={<DollarSign />}
        label="Accounts Receivable"
        value={formatCurrency(data?.totalAR ?? 0)}
        trend={arChange?.trend}
        trendLabel={arChange?.label}
        subtext="Total outstanding"
      />
      <KpiCard
        icon={<CreditCard />}
        label="Accounts Payable"
        value={formatCurrency(data?.totalAP ?? 0)}
        trend={apChange?.trend}
        trendLabel={apChange?.label}
        subtext="Owed to carriers"
      />
      <KpiCard
        icon={<AlertTriangle />}
        label="Overdue Invoices"
        value={data?.overdueInvoiceCount ?? 0}
        trend={overdueChange?.trend}
        trendLabel={overdueChange?.label}
        subtext="Past due date"
      />
      <KpiCard
        icon={<Clock />}
        label="DSO"
        value={`${data?.dso ?? 0} days`}
        trend={dsoChange?.trend}
        trendLabel={dsoChange?.label}
        subtext="Days sales outstanding"
      />
      <KpiCard
        icon={<TrendingUp />}
        label="Revenue MTD"
        value={formatCurrency(data?.revenueMTD ?? 0)}
        trend={revenueChange?.trend}
        trendLabel={revenueChange?.label}
        subtext="Month to date"
      />
    </div>
  );
}

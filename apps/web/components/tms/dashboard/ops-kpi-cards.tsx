'use client';

import { KpiCard } from '@/components/tms/stats/kpi-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Truck,
  Send,
  PackageCheck,
  Clock,
  TrendingUp as TrendingUpIcon,
  DollarSign,
} from 'lucide-react';
import { useDashboardKPIs, type Period, type Scope, type ComparisonPeriod } from '@/lib/hooks/tms/use-ops-dashboard';
import { useCurrentUser } from '@/lib/hooks/use-auth';

interface OpsKPICardsProps {
  period?: Period;
  scope?: Scope;
  comparison?: ComparisonPeriod;
  onCardClick?: (cardType: string) => void;
}

export function OpsKPICards({
  period = 'today',
  scope = 'personal',
  comparison = 'yesterday',
  onCardClick,
}: OpsKPICardsProps) {
  const { data: user } = useCurrentUser();
  const { data: kpis, isLoading, error } = useDashboardKPIs(period, scope, comparison);

  // Check if user has finance_view permission
  const hasFinanceView = user?.permissions?.includes('finance_view') ||
    ['Super Admin', 'Admin', 'Ops Manager'].includes(user?.role || '');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: hasFinanceView ? 6 : 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[110px]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        <p className="font-semibold">Unable to load dashboard metrics</p>
        <p className="mt-1 text-red-700">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-red-600 underline hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!kpis) return null;

  const formatTrend = (change: number, isPercentage = false): string => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}${isPercentage ? '%' : ''}`;
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const comparisonText = comparison === 'yesterday' ? 'vs yesterday' :
    comparison === 'lastWeek' ? 'vs last week' : 'vs last month';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {/* Active Loads */}
      <KpiCard
        icon={<Truck className="text-blue-600" />}
        label="Active Loads"
        value={kpis.activeLoads.toLocaleString()}
        trend={kpis.activeLoadsChange >= 0 ? 'up' : 'down'}
        trendLabel={formatTrend(kpis.activeLoadsChange)}
        subtext={comparisonText}
        onClick={() => onCardClick?.('active-loads')}
        className="cursor-pointer hover:border-blue-300 hover:shadow-md"
      />

      {/* Dispatched Today */}
      <KpiCard
        icon={<Send className="text-indigo-600" />}
        label="Dispatched Today"
        value={kpis.dispatchedToday.toLocaleString()}
        trend={kpis.dispatchedTodayChange >= 0 ? 'up' : 'down'}
        trendLabel={formatTrend(kpis.dispatchedTodayChange)}
        subtext={comparisonText}
        onClick={() => onCardClick?.('dispatched-today')}
        className="cursor-pointer hover:border-indigo-300 hover:shadow-md"
      />

      {/* Deliveries Today */}
      <KpiCard
        icon={<PackageCheck className="text-green-600" />}
        label="Deliveries Today"
        value={kpis.deliveredToday.toLocaleString()}
        trend={kpis.deliveredTodayChange >= 0 ? 'up' : 'down'}
        trendLabel={formatTrend(kpis.deliveredTodayChange)}
        subtext={comparisonText}
        onClick={() => onCardClick?.('deliveries-today')}
        className="cursor-pointer hover:border-green-300 hover:shadow-md"
      />

      {/* On-Time % */}
      <KpiCard
        icon={
          <Clock
            className={
              kpis.onTimePercentage >= 95
                ? 'text-emerald-600'
                : kpis.onTimePercentage >= 85
                ? 'text-amber-500'
                : 'text-red-500'
            }
          />
        }
        label="On-Time %"
        value={`${kpis.onTimePercentage.toFixed(1)}%`}
        trend={kpis.onTimePercentageChange >= 0 ? 'up' : 'down'}
        trendLabel={formatTrend(kpis.onTimePercentageChange, true)}
        subtext={comparisonText}
        onClick={() => onCardClick?.('on-time')}
        className="cursor-pointer hover:border-emerald-300 hover:shadow-md"
      />

      {/* Average Margin % - only for finance_view roles */}
      {hasFinanceView && (
        <KpiCard
          icon={
            <TrendingUpIcon
              className={
                kpis.averageMargin >= 15
                  ? 'text-green-600'
                  : kpis.averageMargin >= 5
                  ? 'text-amber-500'
                  : 'text-red-500'
              }
            />
          }
          label="Avg Margin %"
          value={`${kpis.averageMargin.toFixed(1)}%`}
          trend={kpis.averageMarginChange >= 0 ? 'up' : 'down'}
          trendLabel={formatTrend(kpis.averageMarginChange, true)}
          subtext={comparisonText}
          onClick={() => onCardClick?.('avg-margin')}
          className="cursor-pointer hover:border-green-300 hover:shadow-md"
        />
      )}

      {/* Revenue MTD - only for finance_view roles */}
      {hasFinanceView && (
        <KpiCard
          icon={<DollarSign className="text-green-600" />}
          label="Revenue MTD"
          value={formatCurrency(kpis.revenueMTD)}
          trend={kpis.revenueMTDChange >= 0 ? 'up' : 'down'}
          trendLabel={`${formatTrend(kpis.revenueMTDChange)}%`}
          subtext={comparisonText}
          onClick={() => onCardClick?.('revenue-mtd')}
          className="cursor-pointer hover:border-green-300 hover:shadow-md"
        />
      )}
    </div>
  );
}

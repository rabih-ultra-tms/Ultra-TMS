'use client';

import { useCreditLimits, useCreditHolds } from '@/lib/hooks/credit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils/format';
import { AlertCircle } from 'lucide-react';

interface CreditDashboardCardsProps {
  tenantId: string;
}

export function CreditDashboardCards({ tenantId }: CreditDashboardCardsProps) {
  const {
    data: limits,
    isLoading: limitsLoading,
    error: limitsError,
  } = useCreditLimits({
    tenantId,
    status: 'ACTIVE',
  });

  const {
    data: holds,
    isLoading: holdsLoading,
    error: holdsError,
  } = useCreditHolds({
    tenantId,
    status: 'ACTIVE',
  });

  const isLoading = limitsLoading || holdsLoading;
  const hasError = limitsError || holdsError;

  if (isLoading) {
    return <CreditDashboardSkeleton />;
  }

  if (hasError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <p className="text-sm text-red-700">
          Failed to load credit dashboard. Please try again.
        </p>
      </div>
    );
  }

  const totalLimits =
    limits?.data?.reduce((sum, limit) => sum + limit.creditLimit, 0) || 0;
  const totalUtilized =
    limits?.data?.reduce((sum, limit) => sum + (limit.utilized || 0), 0) || 0;
  const utilizationPercent =
    totalLimits > 0 ? Math.round((totalUtilized / totalLimits) * 100) : 0;
  const activeHolds = holds?.data?.length || 0;
  const companiesWithIssues = (limits?.data || []).filter((limit) => {
    const utilization =
      limit.creditLimit > 0 ? (limit.utilized || 0) / limit.creditLimit : 0;
    return utilization >= 0.8 || activeHolds > 0;
  }).length;

  const kpis = [
    {
      title: 'Total Limits Issued',
      value: formatCurrency(totalLimits),
      icon: '💰',
      change: '+2.5%',
    },
    {
      title: 'Total Utilized',
      value: formatCurrency(totalUtilized),
      icon: '📊',
      change: '+1.2%',
    },
    {
      title: 'Utilization Rate',
      value: `${utilizationPercent}%`,
      icon: '📈',
      change: utilizationPercent > 75 ? '⚠️ High' : '✓ Healthy',
    },
    {
      title: 'Active Holds',
      value: activeHolds.toString(),
      icon: '🔒',
      change: activeHolds > 0 ? 'Requires Action' : 'No Issues',
    },
    {
      title: 'Companies with Issues',
      value: companiesWithIssues.toString(),
      icon: '⚠️',
      change: `of ${limits?.data?.length || 0}`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {kpis.map((kpi, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {kpi.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-gray-500 mt-1">{kpi.change}</p>
              </div>
              <span className="text-3xl">{kpi.icon}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CreditDashboardSkeleton() {
  return (
    <div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
      data-testid="credit-dashboard-skeleton"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

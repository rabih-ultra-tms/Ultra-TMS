'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ===========================
// Rep Earnings Bar Chart
// ===========================

export interface RepEarning {
  repName: string;
  month: string;
  earned: number;
  paid: number;
}

interface EarningsChartProps {
  data: RepEarning[];
  isLoading: boolean;
}

export function EarningsChart({ data, isLoading }: EarningsChartProps) {
  const maxAmount = Math.max(...data.map((d) => Math.max(d.earned, d.paid)), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rep Earnings by Month</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            No earnings data for this period.
          </p>
        ) : (
          <div className="space-y-4">
            {data.map((item, idx) => {
              const earnedWidth = (item.earned / maxAmount) * 100;
              const paidWidth = (item.paid / maxAmount) * 100;

              return (
                <div key={`${item.repName}-${item.month}-${idx}`}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-text-primary">
                      {item.repName}
                    </span>
                    <span className="text-text-muted">{item.month}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="relative h-5 w-full overflow-hidden rounded bg-gray-100">
                      <div
                        className="absolute inset-y-0 left-0 rounded bg-brand-accent transition-all duration-300"
                        style={{ width: `${earnedWidth}%` }}
                      />
                      <span className="absolute right-2 top-0.5 text-[10px] font-medium text-text-secondary">
                        Earned: {formatCurrency(item.earned)}
                      </span>
                    </div>
                    <div className="relative h-5 w-full overflow-hidden rounded bg-gray-100">
                      <div
                        className="absolute inset-y-0 left-0 rounded bg-green-500 transition-all duration-300"
                        style={{ width: `${paidWidth}%` }}
                      />
                      <span className="absolute right-2 top-0.5 text-[10px] font-medium text-text-secondary">
                        Paid: {formatCurrency(item.paid)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-4 border-t border-border pt-3 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded bg-brand-accent" />
                Earned
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded bg-green-500" />
                Paid
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===========================
// Plan Usage Card
// ===========================

export interface PlanUsage {
  planName: string;
  repCount: number;
  totalEarned: number;
}

interface PlanUsageCardProps {
  data: PlanUsage[];
  isLoading: boolean;
}

export function PlanUsageCard({ data, isLoading }: PlanUsageCardProps) {
  const maxReps = Math.max(...data.map((d) => d.repCount), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Plan Usage</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            No active plans.
          </p>
        ) : (
          <div className="space-y-3">
            {data.map((plan) => {
              const widthPercent = (plan.repCount / maxReps) * 100;
              return (
                <div key={plan.planName}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-text-primary">
                      {plan.planName}
                    </span>
                    <span className="text-text-muted">
                      {plan.repCount} rep{plan.repCount !== 1 ? 's' : ''} ·{' '}
                      {formatCurrency(plan.totalEarned)}
                    </span>
                  </div>
                  <div className="relative h-6 w-full overflow-hidden rounded bg-gray-100">
                    <div
                      className="absolute inset-y-0 left-0 rounded bg-blue-500 transition-all duration-300"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===========================
// Payout Summary Card
// ===========================

export interface PayoutMonthSummary {
  month: string;
  totalPaid: number;
  achCount: number;
  checkCount: number;
  wireCount: number;
}

interface PayoutSummaryCardProps {
  data: PayoutMonthSummary[];
  isLoading: boolean;
}

export function PayoutSummaryCard({ data, isLoading }: PayoutSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Payout Summary by Month</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            No payout data for this period.
          </p>
        ) : (
          <div className="space-y-3">
            {data.map((month) => (
              <div
                key={month.month}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {month.month}
                  </p>
                  <p className="text-xs text-text-muted">
                    ACH: {month.achCount} · Check: {month.checkCount} · Wire:{' '}
                    {month.wireCount}
                  </p>
                </div>
                <p className="text-lg font-semibold text-text-primary">
                  {formatCurrency(month.totalPaid)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

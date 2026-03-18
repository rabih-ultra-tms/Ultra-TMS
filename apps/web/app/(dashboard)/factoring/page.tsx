'use client';

import { Button } from '@/components/ui/button';
import { FactoringStats } from '@/components/factoring/factoring-stats';
import { PaymentsTable } from '@/components/factoring/payments-table';
import { useFactoringStats, useFactoredPayments } from '@/lib/hooks/factoring';
import { useRouter } from 'next/navigation';

export default function FactoringDashboard() {
  const router = useRouter();

  const { totalFactoredYTD, pendingCount, scheduledAmount, failedCount } =
    useFactoringStats();
  const { data: paymentsData, isLoading: paymentsLoading } =
    useFactoredPayments({
      limit: 10,
    });

  return (
    <div className="space-y-8">
      {/* KPI Stats */}
      <FactoringStats
        totalFactoredYTD={totalFactoredYTD}
        pendingCount={pendingCount}
        scheduledAmount={scheduledAmount}
        failedCount={failedCount}
        isLoading={paymentsLoading}
      />

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Button
          variant="outline"
          className="h-24 flex flex-col items-center justify-center"
          onClick={() => router.push('/factoring/companies')}
        >
          <div className="text-lg font-semibold">Factoring Companies</div>
          <div className="text-sm text-muted-foreground">Manage providers</div>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col items-center justify-center"
          onClick={() => router.push('/factoring/payments')}
        >
          <div className="text-lg font-semibold">Payments</div>
          <div className="text-sm text-muted-foreground">View all advances</div>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col items-center justify-center"
          onClick={() => router.push('/factoring/noa')}
        >
          <div className="text-lg font-semibold">NOA Records</div>
          <div className="text-sm text-muted-foreground">Verification</div>
        </Button>
      </div>

      {/* Recent Payments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Payments</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/factoring/payments')}
          >
            View All
          </Button>
        </div>
        <PaymentsTable
          payments={paymentsData?.data ?? []}
          isLoading={paymentsLoading}
          onProcess={() => {}} // Dashboard doesn't process, just shows
        />
      </div>
    </div>
  );
}

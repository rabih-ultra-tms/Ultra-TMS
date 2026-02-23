'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SocketProvider } from '@/lib/socket/socket-provider';
import {
  useDashboardLiveUpdates,
  type Period,
  type Scope,
  type ComparisonPeriod,
} from '@/lib/hooks/tms/use-ops-dashboard';
import { OpsKPICards } from '@/components/tms/dashboard/ops-kpi-cards';
import { OpsCharts } from '@/components/tms/dashboard/ops-charts';
import { OpsAlertsPanel } from '@/components/tms/dashboard/ops-alerts-panel';
import { OpsActivityFeed } from '@/components/tms/dashboard/ops-activity-feed';
import { OpsNeedsAttention } from '@/components/tms/dashboard/ops-needs-attention';
import { useCurrentUser } from '@/lib/hooks/use-auth';
import { Plus, LayoutDashboard, Map } from 'lucide-react';

function OperationsDashboardContent() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const [period, setPeriod] = useState<Period>('today');
  const [comparison, setComparison] = useState<ComparisonPeriod>('yesterday');

  // Determine scope based on user roles (roles is an array of { name: string })
  const scope: Scope = (user?.roles ?? []).some((r: { name: string }) =>
    ['Super Admin', 'Admin', 'Ops Manager'].includes(r.name)
  )
    ? 'team'
    : 'personal';

  // Subscribe to real-time updates
  useDashboardLiveUpdates(period, scope, comparison);

  const handleKPICardClick = (cardType: string) => {
    switch (cardType) {
      case 'active-loads':
        router.push(
          '/operations/loads?status=PENDING,TENDERED,ACCEPTED,DISPATCHED,AT_PICKUP,PICKED_UP,IN_TRANSIT,AT_DELIVERY'
        );
        break;
      case 'dispatched-today':
        router.push('/operations/loads?status=DISPATCHED&dateFrom=today');
        break;
      case 'deliveries-today':
        router.push('/operations/loads?status=DELIVERED&dateFrom=today');
        break;
      case 'on-time':
        router.push('/operations/loads?onTime=false&dateFrom=thisWeek');
        break;
      case 'avg-margin':
        router.push('/operations/loads?sort=margin&order=asc');
        break;
      case 'revenue-mtd':
        router.push('/operations/orders?dateFrom=monthStart&dateTo=today');
        break;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Operations Dashboard
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Real-time overview of your freight operations
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/operations/orders/new')}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="size-4" />
            New Order
          </button>
          <button
            onClick={() => router.push('/operations/dispatch')}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50"
          >
            <LayoutDashboard className="size-4" />
            Dispatch Board
          </button>
          <button
            onClick={() => router.push('/operations/tracking')}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50"
          >
            <Map className="size-4" />
            Tracking Map
          </button>
        </div>
      </div>

      {/* Period Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setPeriod('today')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            period === 'today'
              ? 'bg-blue-600 text-white'
              : 'bg-surface text-text-primary hover:bg-gray-50 border border-border'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setPeriod('thisWeek')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            period === 'thisWeek'
              ? 'bg-blue-600 text-white'
              : 'bg-surface text-text-primary hover:bg-gray-50 border border-border'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setPeriod('thisMonth')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            period === 'thisMonth'
              ? 'bg-blue-600 text-white'
              : 'bg-surface text-text-primary hover:bg-gray-50 border border-border'
          }`}
        >
          This Month
        </button>

        {/* Comparison Period Toggle (subtle, on the right) */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-text-muted">Compare to:</span>
          <select
            value={comparison}
            onChange={(e) => setComparison(e.target.value as ComparisonPeriod)}
            className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-primary"
          >
            <option value="yesterday">Yesterday</option>
            <option value="lastWeek">Last Week</option>
            <option value="lastMonth">Last Month</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <OpsKPICards
        period={period}
        scope={scope}
        comparison={comparison}
        onCardClick={handleKPICardClick}
      />

      {/* Charts Row */}
      <OpsCharts period={period} />

      {/* Alerts & Activity Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OpsAlertsPanel
          maxVisible={5}
          onViewAll={() => router.push('/operations/alerts')}
        />
        <OpsActivityFeed
          period={period}
          maxVisible={10}
          onViewAll={() => router.push('/operations/activity')}
        />
      </div>

      {/* Needs Attention Section */}
      <OpsNeedsAttention
        maxVisible={6}
        onViewAll={() =>
          router.push('/operations/loads?needsAttention=true')
        }
      />
    </div>
  );
}

export default function OperationsDashboardPage() {
  return (
    <SocketProvider namespace="/dispatch">
      <OperationsDashboardContent />
    </SocketProvider>
  );
}

'use client';

import { useDashboardCharts, type Period } from '@/lib/hooks/tms/use-ops-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks/use-auth';

interface OpsChartsProps {
  period?: Period;
}

export function OpsCharts({ period = 'today' }: OpsChartsProps) {
  const { data: user } = useCurrentUser();
  const { data: charts, isLoading, error, refetch } = useDashboardCharts(period);
  const router = useRouter();

  // user.roles is an array of { name: string }, not user.role
  const hasFinanceView = user?.permissions?.includes('finance_view') ||
    (user?.roles ?? []).some((r: { name: string }) =>
      ['Super Admin', 'Admin', 'Ops Manager'].includes(r.name)
    );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        <p className="font-semibold">Unable to load charts</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-red-600 underline hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!charts) return null;

  const handleBarClick = (status: string) => {
    router.push(`/operations/loads?status=${status}`);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Loads by Status Bar Chart */}
      <LoadsByStatusChart
        data={charts.loadsByStatus}
        onBarClick={handleBarClick}
      />

      {/* Revenue Trend Chart - only for finance_view roles */}
      {hasFinanceView && (
        <RevenueTrendChart data={charts.revenueTrend} />
      )}

      {/* Alternative chart for non-finance users */}
      {!hasFinanceView && (
        <div className="flex items-center justify-center rounded-lg border border-border bg-surface p-8">
          <p className="text-sm text-text-muted">
            Additional operational charts available
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// Loads by Status Bar Chart
// ============================================

interface LoadsByStatusChartProps {
  data: Array<{ status: string; count: number; color: string }>;
  onBarClick: (status: string) => void;
}

function LoadsByStatusChart({ data, onBarClick }: LoadsByStatusChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Loads by Status
      </h3>
      <div className="space-y-3">
        {data.map((item) => {
          const widthPercent = (item.count / maxCount) * 100;
          const statusLabel = item.status
            .split('_')
            .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
            .join(' ');

          return (
            <div key={item.status} className="group">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-text-muted">{statusLabel}</span>
                <span className="font-semibold text-text-primary">{item.count}</span>
              </div>
              <div className="relative h-6 w-full overflow-hidden rounded bg-gray-100">
                <button
                  onClick={() => onBarClick(item.status)}
                  className="absolute inset-y-0 left-0 transition-all duration-300 hover:opacity-80"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: item.color,
                  }}
                  aria-label={`View ${item.count} ${statusLabel} loads`}
                />
              </div>
            </div>
          );
        })}
      </div>
      {data.length === 0 && (
        <div className="flex h-40 items-center justify-center text-sm text-text-muted">
          No load data available
        </div>
      )}
    </div>
  );
}

// ============================================
// Revenue Trend Line Chart
// ============================================

interface RevenueTrendChartProps {
  data: Array<{ date: string; revenue: number }>;
}

function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  if (!data || data.length < 2) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-border bg-surface">
        <p className="text-sm text-text-muted">
          {!data || data.length === 0 ? 'No revenue data available' : 'Insufficient data for trend chart'}
        </p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const minRevenue = Math.min(...data.map((d) => d.revenue), 0);
  const yRange = maxRevenue - minRevenue;
  const chartHeight = 300;
  const chartWidth = 100; // percentage
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };

  // Create SVG path for line chart (guarded against division by zero)
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const y = yRange === 0
      ? chartHeight / 2
      : chartHeight - ((point.revenue - minRevenue) / yRange) * chartHeight;
    return { x, y, revenue: point.revenue, date: point.date };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Create area fill path
  const areaPath = `${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  // Format currency for Y-axis
  const formatCurrency = (value: number): string => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  // Y-axis ticks
  const yTicks = [
    minRevenue,
    minRevenue + (maxRevenue - minRevenue) * 0.25,
    minRevenue + (maxRevenue - minRevenue) * 0.5,
    minRevenue + (maxRevenue - minRevenue) * 0.75,
    maxRevenue,
  ];

  // Format date for X-axis (show first, middle, last)
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Revenue Trend (30 Days)
      </h3>
      <div className="relative">
        <svg
          viewBox={`0 0 ${chartWidth + padding.left + padding.right} ${
            chartHeight + padding.top + padding.bottom
          }`}
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Y-axis labels */}
          {yTicks.map((tick, i) => {
            const y =
              padding.top +
              chartHeight -
              (yRange === 0 ? 0.5 : (tick - minRevenue) / yRange) * chartHeight;
            return (
              <text
                key={i}
                x={padding.left - 10}
                y={y}
                textAnchor="end"
                alignmentBaseline="middle"
                className="fill-text-muted text-[10px]"
              >
                {formatCurrency(tick)}
              </text>
            );
          })}

          {/* X-axis labels */}
          {[0, Math.floor(data.length / 2), data.length - 1].map((index) => {
            const point = points[index];
            if (!point) return null;
            return (
              <text
                key={index}
                x={padding.left + point.x}
                y={padding.top + chartHeight + 20}
                textAnchor="middle"
                className="fill-text-muted text-[10px]"
              >
                {data[index] ? formatDate(data[index].date) : ''}
              </text>
            );
          })}

          {/* Chart group */}
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Area fill */}
            <path
              d={areaPath}
              className="fill-blue-100 opacity-30"
            />

            {/* Line */}
            <path
              d={linePath}
              className="fill-none stroke-blue-600 stroke-2"
            />

            {/* Data points */}
            {points.map((point, i) => (
              <g key={i}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  className="fill-blue-600 stroke-white stroke-2"
                />
                <title>{`${formatDate(point.date)}: ${formatCurrency(point.revenue)}`}</title>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

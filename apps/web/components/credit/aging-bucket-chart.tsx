'use client';

import { useAgingReport } from '@/lib/hooks/credit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';

interface AgingBucketChartProps {
  tenantId: string;
}

export function AgingBucketChart({ _tenantId }: AgingBucketChartProps) {
  const { data: agingReport, isLoading, error } = useAgingReport();

  if (isLoading) {
    return <AgingChartSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <p className="text-sm text-red-700">
          Failed to load aging report. Please try again.
        </p>
      </div>
    );
  }

  const buckets = agingReport?.buckets || [];

  if (buckets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aging Bucket Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">No aging data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = buckets.reduce(
    (sum, bucket) => sum + (bucket.amount || 0),
    0
  );

  // Define bucket colors
  const bucketColors = [
    'bg-green-500', // 0-30: healthy
    'bg-lime-500', // 31-60: caution
    'bg-yellow-500', // 61-90: warning
    'bg-orange-500', // 91-120: critical
    'bg-red-600', // 120+: overdue
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aging Bucket Analysis</CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Total AR: {formatCurrency(totalAmount)}
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Stacked Bar Chart */}
        <div>
          <div className="flex gap-2 h-16 rounded-lg overflow-hidden shadow-sm">
            {buckets.map((bucket, index) => {
              const percentage =
                totalAmount > 0 ? (bucket.amount / totalAmount) * 100 : 0;
              return (
                <div
                  key={bucket.label || index}
                  className={`${bucketColors[index]} transition-all hover:shadow-md cursor-pointer relative group`}
                  style={{ width: `${Math.max(percentage, 2)}%` }}
                  title={`${bucket.label}: ${formatCurrency(bucket.amount)} (${percentage.toFixed(1)}%)`}
                >
                  {percentage > 8 && (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-xs font-bold text-white">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  )}
                  {/* Tooltip */}
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white px-3 py-2 rounded text-xs whitespace-nowrap z-10">
                    {bucket.label}: {formatCurrency(bucket.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bucket Details Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-3 py-2 font-semibold text-gray-700">
                  Bucket
                </th>
                <th className="text-right px-3 py-2 font-semibold text-gray-700">
                  Amount
                </th>
                <th className="text-right px-3 py-2 font-semibold text-gray-700">
                  % of Total
                </th>
                <th className="text-right px-3 py-2 font-semibold text-gray-700">
                  Count
                </th>
              </tr>
            </thead>
            <tbody>
              {buckets.map((bucket, index) => {
                const percentage =
                  totalAmount > 0 ? (bucket.amount / totalAmount) * 100 : 0;
                return (
                  <tr
                    key={bucket.label || index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${bucketColors[index]}`}
                        />
                        <span className="font-medium text-gray-900">
                          {bucket.label}
                        </span>
                      </div>
                    </td>
                    <td className="text-right px-3 py-3 text-gray-700">
                      {formatCurrency(bucket.amount || 0)}
                    </td>
                    <td className="text-right px-3 py-3 text-gray-700">
                      {percentage.toFixed(1)}%
                    </td>
                    <td className="text-right px-3 py-3 text-gray-700">
                      {bucket.count || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Health Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Current (0-30 days)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-lime-500" />
                <span>Early (31-60 days)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Aging (61-90 days)</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Alert Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span>Critical (91-120 days)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                <span>Overdue (120+ days)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AgingChartSkeleton() {
  return (
    <div data-testid="aging-chart-skeleton">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent className="space-y-8">
          <Skeleton className="h-16 w-full rounded-lg" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

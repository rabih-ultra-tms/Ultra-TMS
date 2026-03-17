'use client';

import { useState } from 'react';
import { useAgentPerformance } from '@/lib/hooks/agents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AgentPerformanceChartProps {
  agentId: string;
  period?: 'month' | 'quarter' | 'year';
}

// Simple bar chart component
function _SimpleChart({
  data,
}: {
  data: Array<{ label: string; value: number }>;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-text-primary">
              {item.label}
            </span>
            <span className="text-sm text-text-muted">
              {item.value.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AgentPerformanceChart({
  agentId,
  period = 'month',
}: AgentPerformanceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<
    'month' | 'quarter' | 'year'
  >(period);
  const { data, isLoading, error } = useAgentPerformance(agentId);

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">
            Failed to load performance data: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  const performance = data;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Performance</CardTitle>
        <Select
          value={selectedPeriod}
          onValueChange={(v: any) => setSelectedPeriod(v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : !performance ? (
          <div className="py-8 text-center">
            <p className="text-sm text-text-muted">
              No performance data available
            </p>
          </div>
        ) : (
          <>
            {/* KPI Summary */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs font-medium text-text-secondary">
                  Commission
                </p>
                <p className="text-lg font-bold text-text-primary">
                  $
                  {(performance?.totalCommissions ?? 0).toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 0,
                    }
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-text-secondary">Loads</p>
                <p className="text-lg font-bold text-text-primary">
                  {performance?.loadCount ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-text-secondary">
                  Avg Commission
                </p>
                <p className="text-lg font-bold text-text-primary">
                  ${(performance?.avgCommission ?? 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-text-secondary">
                  Pending
                </p>
                <p className="text-lg font-bold text-text-primary">
                  $
                  {(performance?.pendingAmount ?? 0).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="pt-2 border-t">
              <p className="text-sm text-text-muted">
                Total Paid: $
                {(performance?.totalPaid ?? 0).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

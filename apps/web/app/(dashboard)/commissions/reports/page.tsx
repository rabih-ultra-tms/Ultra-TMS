'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  EarningsChart,
  PlanUsageCard,
  PayoutSummaryCard,
} from '@/components/commissions/earnings-chart';
import type {
  RepEarning,
  PlanUsage,
  PayoutMonthSummary,
} from '@/components/commissions/earnings-chart';

// ===========================
// Types
// ===========================

interface ReportsData {
  earnings: RepEarning[];
  planUsage: PlanUsage[];
  payoutSummary: PayoutMonthSummary[];
}

// ===========================
// Hook
// ===========================

function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

function useCommissionReports(startDate: string, endDate: string) {
  return useQuery<ReportsData>({
    queryKey: ['commissions', 'reports', { startDate, endDate }],
    queryFn: async () => {
      const params: Record<string, string | undefined> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      // The backend may return all report data in one call or we
      // fetch from the dashboard endpoint which aggregates data.
      // Attempt dedicated reports endpoint first, fall back to
      // assembling from dashboard data.
      const response = await apiClient.get(
        '/commissions/reports',
        params
      );
      const data = unwrap<Record<string, unknown>>(response);

      return {
        earnings: (data.earnings ?? []) as RepEarning[],
        planUsage: (data.planUsage ?? []) as PlanUsage[],
        payoutSummary: (data.payoutSummary ?? []) as PayoutMonthSummary[],
      };
    },
    staleTime: 60_000,
  });
}

// ===========================
// Helpers
// ===========================

function getDefaultDateRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().split('T')[0] ?? '',
    end: end.toISOString().split('T')[0] ?? '',
  };
}

// ===========================
// Page
// ===========================

export default function CommissionReportsPage() {
  const defaults = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);

  const { data, isLoading } = useCommissionReports(startDate, endDate);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Commission Reports
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Analyze rep earnings, plan usage, and payout trends.
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <Label htmlFor="startDate" className="text-xs text-text-muted">
            From
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="endDate" className="text-xs text-text-muted">
            To
          </Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EarningsChart
          data={data?.earnings ?? []}
          isLoading={isLoading}
        />
        <PlanUsageCard
          data={data?.planUsage ?? []}
          isLoading={isLoading}
        />
      </div>

      <PayoutSummaryCard
        data={data?.payoutSummary ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Truck, Star, CheckSquare, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCarrierScorecard } from "@/lib/hooks/carriers/use-carrier-scorecard";
import { ScoreGauge } from "@/components/carriers/scorecard/score-gauge";
import { PerformanceMetricCard } from "@/components/carriers/scorecard/performance-metric-card";
import { TierBadge } from "@/components/carriers/tier-badge";
import { TierProgressionBar } from "@/components/carriers/scorecard/tier-progression-bar";
import { ScorecardLoadHistory } from "@/components/carriers/scorecard/scorecard-load-history";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export default function CarrierScorecardPage() {
  const params = useParams();
  const router = useRouter();
  const carrierId = params.id as string;

  const { data, isLoading, error } = useCarrierScorecard(carrierId);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <p className="text-destructive">Failed to load scorecard.</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const { carrier } = data;
  const score = Number(carrier.performanceScore ?? 0);
  const loads = carrier.LoadHistory ?? [];

  // Build monthly load count and avg rate chart data (last 6 months)
  const now = new Date();
  const monthlyChartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const monthLoads = loads.filter((l) => {
      if (!l.deliveryDate) return false;
      const ld = new Date(l.deliveryDate);
      return ld.getFullYear() === d.getFullYear() && ld.getMonth() === d.getMonth();
    });
    const avgRate =
      monthLoads.length > 0
        ? monthLoads.reduce((sum, l) => sum + l.carrierRateCents, 0) / monthLoads.length / 100
        : 0;
    return {
      month: MONTH_NAMES[d.getMonth()] ?? "",
      loads: monthLoads.length,
      avgRate: Math.round(avgRate),
    };
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/carriers/${carrierId}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Carrier
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            {carrier.companyName} — Performance Scorecard
          </h1>
        </div>
        <TierBadge tier={carrier.tier} size="md" />
      </div>

      <div className="p-6 space-y-6 overflow-auto">
        {/* Score + Tier Progression */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Performance Score
              </p>
              <ScoreGauge score={score} size={200} />
              <p className="text-xs text-muted-foreground text-center">
                Based on {carrier.totalLoadsCompleted ?? 0} completed loads
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent className="p-6 space-y-8">
              <TierProgressionBar score={score} />

              {/* Score breakdown */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Score Breakdown
                </p>
                <div className="space-y-1.5 text-xs">
                  {[
                    { label: "On-Time Pickup (25%)", val: carrier.onTimePickupRate, inverse: false, isRating: false },
                    { label: "On-Time Delivery (25%)", val: carrier.onTimeDeliveryRate, inverse: false, isRating: false },
                    { label: "Claims Rate (20%)", val: carrier.claimsRate, inverse: true, isRating: false },
                    { label: "Acceptance Rate (15%)", val: carrier.acceptanceRate, inverse: false, isRating: false },
                    { label: "Rating (15%)", val: carrier.avgRating, inverse: false, isRating: true },
                  ].map(({ label, val, inverse, isRating }) => {
                    const displayVal =
                      val != null
                        ? isRating
                          ? `${Number(val).toFixed(1)}/5`
                          : inverse
                          ? `${Number(val).toFixed(1)} claims/100`
                          : `${Number(val).toFixed(1)}%`
                        : "—";
                    return (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{displayVal}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PerformanceMetricCard
            title="On-Time Pickup"
            value={carrier.onTimePickupRate != null ? Number(carrier.onTimePickupRate) : null}
            icon={Clock}
            target={95}
            format="percent"
          />
          <PerformanceMetricCard
            title="On-Time Delivery"
            value={carrier.onTimeDeliveryRate != null ? Number(carrier.onTimeDeliveryRate) : null}
            icon={Truck}
            target={95}
            format="percent"
          />
          <PerformanceMetricCard
            title="Avg Rating"
            value={carrier.avgRating != null ? Number(carrier.avgRating) : null}
            icon={Star}
            target={4.5}
            format="rating"
          />
          <PerformanceMetricCard
            title="Acceptance Rate"
            value={carrier.acceptanceRate != null ? Number(carrier.acceptanceRate) : null}
            icon={CheckSquare}
            target={90}
            format="percent"
          />
          <PerformanceMetricCard
            title="Claims Rate"
            value={carrier.claimsRate != null ? Number(carrier.claimsRate) : null}
            icon={AlertTriangle}
            format="number"
          />
          <PerformanceMetricCard
            title="Total Loads"
            value={carrier.totalLoadsCompleted ?? null}
            icon={TrendingUp}
            format="number"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Loads Per Month (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="loads" fill="#6366f1" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Avg Rate Per Month (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: number) => `$${v}`}
                  />
                  <Tooltip
                    formatter={(v: number | undefined) =>
                      v != null ? `$${v}` : ""
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="avgRate"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Load History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Load History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScorecardLoadHistory loads={loads} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

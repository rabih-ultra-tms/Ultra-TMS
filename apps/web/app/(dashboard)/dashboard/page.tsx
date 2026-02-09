"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Truck, Users, FileText, DollarSign } from "lucide-react";
import { useCarrierStats, useLoadHistoryStats, useLoadPlannerQuoteStats } from "@/lib/hooks/operations";
import { useLogout } from "@/lib/hooks";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

interface KPICardProps {
  title: string;
  icon: React.ReactNode;
  value: string | number;
  subtitle: string;
  isLoading: boolean;
  isError: boolean;
}

function KPICard({ title, icon, value, subtitle, isLoading, isError }: KPICardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">Failed to load</span>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const logout = useLogout();

  const carrierStats = useCarrierStats();
  const loadStats = useLoadHistoryStats();
  const quoteStats = useLoadPlannerQuoteStats();

  const activeCarriers = carrierStats.data?.byStatus?.ACTIVE ?? 0;
  const totalCarriers = carrierStats.data?.total ?? 0;

  const totalLoads = loadStats.data?.totalLoads ?? 0;
  const completedLoads = loadStats.data?.completedLoads ?? 0;
  const totalRevenueCents = loadStats.data?.totalRevenueCents ?? 0;

  const openQuotes = (quoteStats.data?.draftCount ?? 0) + (quoteStats.data?.sentCount ?? 0);
  const totalQuotes = quoteStats.data?.totalLoads ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button variant="outline" onClick={() => logout.mutate()} disabled={logout.isPending}>
          {logout.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Loads"
          icon={<Truck className="h-4 w-4 text-muted-foreground" />}
          value={totalLoads}
          subtitle={completedLoads > 0 ? `${completedLoads} completed` : "All loads in system"}
          isLoading={loadStats.isLoading}
          isError={loadStats.isError}
        />

        <KPICard
          title="Active Carriers"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          value={activeCarriers}
          subtitle={totalCarriers > 0 ? `${totalCarriers} total carriers` : "No carriers yet"}
          isLoading={carrierStats.isLoading}
          isError={carrierStats.isError}
        />

        <KPICard
          title="Open Quotes"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          value={openQuotes}
          subtitle={totalQuotes > 0 ? `${totalQuotes} total quotes` : "No quotes yet"}
          isLoading={quoteStats.isLoading}
          isError={quoteStats.isError}
        />

        <KPICard
          title="Revenue"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          value={formatCurrency(totalRevenueCents)}
          subtitle={totalLoads > 0 ? `From ${totalLoads} loads` : "No revenue yet"}
          isLoading={loadStats.isLoading}
          isError={loadStats.isError}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome to Ultra-TMS</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your Transportation Management System dashboard. Get started by adding loads,
            carriers, and managing your logistics operations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  Truck,
  Users,
  FileText,
  DollarSign,
  ArrowRight,
  LayoutDashboard,
  Package,
  Building2,
  ClipboardList,
} from "lucide-react";
import { useCarrierStats } from "@/lib/hooks/operations";
import { useLoadStats } from "@/lib/hooks/tms/use-loads";
import { useQuoteStats } from "@/lib/hooks/sales/use-quotes";
import { cn } from "@/lib/utils";

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
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  subtitle: string;
  isLoading: boolean;
  isError: boolean;
  accentClass: string;
}

function KPICard({ title, icon: Icon, value, subtitle, isLoading, isError, accentClass }: KPICardProps) {
  return (
    <Card className="relative overflow-hidden shadow-sm">
      <div className={cn("absolute left-0 top-0 h-full w-1", accentClass)} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pl-5">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-text-secondary">{title}</CardTitle>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", accentClass.replace("bg-", "bg-") + "/10")}>
          <Icon className={cn("h-4 w-4", accentClass.replace("bg-", "text-"))} />
        </div>
      </CardHeader>
      <CardContent className="pl-5">
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
            <div className="text-2xl font-bold tabular-nums">{value}</div>
            <p className="text-xs text-text-muted">{subtitle}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

const quickActions = [
  { label: "Dispatch Board", href: "/operations/dispatch", icon: LayoutDashboard, description: "Manage active loads" },
  { label: "New Load", href: "/operations/loads/new", icon: Package, description: "Create a shipment" },
  { label: "Carriers", href: "/carriers", icon: Truck, description: "Browse carrier network" },
  { label: "Companies", href: "/companies", icon: Building2, description: "Customer accounts" },
  { label: "Quotes", href: "/quotes", icon: ClipboardList, description: "Sales pipeline" },
];

export default function DashboardPage() {
  const carrierStats = useCarrierStats();
  const loadStats = useLoadStats();
  const quoteStats = useQuoteStats();

  const activeCarriers = carrierStats.data?.byStatus?.ACTIVE ?? 0;
  const totalCarriers = carrierStats.data?.total ?? 0;

  const totalLoads = loadStats.data?.total ?? 0;
  const inTransitLoads = loadStats.data?.byStatus?.['IN_TRANSIT'] ?? 0;
  const totalRevenueCents = loadStats.data?.totalRevenueCents ?? 0;

  const openQuotes = quoteStats.data?.activePipeline ?? 0;
  const totalQuotes = quoteStats.data?.totalQuotes ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-text-secondary">Operations overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Loads"
          icon={Truck}
          value={totalLoads}
          subtitle={inTransitLoads > 0 ? `${inTransitLoads} in transit` : "All loads in system"}
          isLoading={loadStats.isLoading}
          isError={loadStats.isError}
          accentClass="bg-primary"
        />

        <KPICard
          title="Active Carriers"
          icon={Users}
          value={activeCarriers}
          subtitle={totalCarriers > 0 ? `${totalCarriers} total carriers` : "No carriers yet"}
          isLoading={carrierStats.isLoading}
          isError={carrierStats.isError}
          accentClass="bg-status-dispatched"
        />

        <KPICard
          title="Open Quotes"
          icon={FileText}
          value={openQuotes}
          subtitle={totalQuotes > 0 ? `${totalQuotes} total quotes` : "No quotes yet"}
          isLoading={quoteStats.isLoading}
          isError={quoteStats.isError}
          accentClass="bg-status-unassigned"
        />

        <KPICard
          title="Revenue"
          icon={DollarSign}
          value={formatCurrency(totalRevenueCents)}
          subtitle={totalLoads > 0 ? `From ${totalLoads} loads` : "No revenue yet"}
          isLoading={loadStats.isLoading}
          isError={loadStats.isError}
          accentClass="bg-status-delivered"
        />
      </div>

      <div>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="group cursor-pointer shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <action.icon className="h-4 w-4 text-text-secondary group-hover:text-primary transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{action.label}</p>
                    <p className="text-xs text-text-muted truncate">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

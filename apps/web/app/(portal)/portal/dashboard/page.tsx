'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  usePortalDashboard,
  usePortalActiveShipments,
  usePortalRecentActivity,
} from '@/lib/hooks/portal/use-portal-dashboard';
import { Package, FileText, DollarSign, Clock, ArrowRight } from 'lucide-react';

export default function PortalDashboardPage() {
  const { data: overview, isLoading: overviewLoading } = usePortalDashboard();
  const { data: activeShipments, isLoading: shipmentsLoading } = usePortalActiveShipments();
  const { data: recentActivity, isLoading: activityLoading } = usePortalRecentActivity();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome to your customer portal</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-2 h-4 w-24" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <KPICard
              icon={Package}
              label="Active Shipments"
              value={overview?.activeShipments ?? 0}
              href="/portal/shipments"
            />
            <KPICard
              icon={FileText}
              label="Pending Invoices"
              value={overview?.pendingInvoices ?? 0}
              href="/portal/documents"
            />
            <KPICard
              icon={DollarSign}
              label="Total Spend"
              value={`$${(overview?.totalSpend ?? 0).toLocaleString()}`}
            />
            <KPICard
              icon={FileText}
              label="Documents"
              value={overview?.documentsAvailable ?? 0}
              href="/portal/documents"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Shipments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Active Shipments</CardTitle>
            <Link href="/portal/shipments" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {shipmentsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : !activeShipments?.length ? (
              <p className="py-4 text-center text-sm text-gray-500">No active shipments</p>
            ) : (
              <div className="space-y-3">
                {activeShipments.slice(0, 5).map((shipment) => (
                  <Link
                    key={shipment.id}
                    href={`/portal/shipments/${shipment.id}`}
                    className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium">{shipment.loadNumber}</p>
                      <p className="text-xs text-gray-500">
                        {shipment.origin} &rarr; {shipment.destination}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{shipment.status}</Badge>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : !recentActivity?.length ? (
              <p className="py-4 text-center text-sm text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    <div>
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  href?: string;
}) {
  const content = (
    <Card className={href ? 'transition-colors hover:border-blue-200' : ''}>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

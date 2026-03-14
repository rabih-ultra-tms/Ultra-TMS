'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useCarrierDashboardData,
  useCarrierProfile,
  usePendingPayments,
  useActiveDrivers,
  useComplianceDocs,
} from '@/lib/hooks/carrier/use-carrier-dashboard';
import { useAvailableLoads } from '@/lib/hooks/useCarrierData';
import {
  Package,
  DollarSign,
  Users,
  AlertCircle,
  Clock,
  FileCheck,
  Zap,
  User,
  Upload,
} from 'lucide-react';
import React from 'react';

export default function CarrierDashboardPage() {
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useCarrierDashboardData();
  const { data: profile, isLoading: profileLoading } = useCarrierProfile();
  const { data: availableLoads } = useAvailableLoads();
  const { data: pendingPayments } = usePendingPayments();
  const { data: activeDrivers } = useActiveDrivers();
  const { data: complianceDocs, isLoading: complianceLoading } =
    useComplianceDocs();

  const carrierName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile?.email || 'Carrier';

  // Calculate pending payments total
  const pendingPaymentsTotal = (pendingPayments || []).reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  );

  // Calculate compliance status
  const calculateCompliancePercentage = () => {
    if (!complianceDocs || complianceDocs.length === 0) return 0;
    const completedDocs = (complianceDocs || []).filter(
      (doc) => doc.status === 'APPROVED' || doc.status === 'VERIFIED'
    ).length;
    return Math.round((completedDocs / complianceDocs.length) * 100);
  };

  const compliancePercentage = calculateCompliancePercentage();
  const hasComplianceIssues = compliancePercentage < 80;

  if (dashboardError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-2">
            Error loading dashboard data
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Failed to load dashboard. Please try refreshing the page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {profileLoading ? (
          <Skeleton className="h-4 w-48 mt-2" />
        ) : (
          <p className="text-sm text-gray-500 mt-2">
            Welcome back, {carrierName}
          </p>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
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
              label="Available Loads"
              value={availableLoads?.length ?? dashboardData?.activeLoads ?? 0}
              href="/carrier/loads"
            />
            <KPICard
              icon={DollarSign}
              label="Pending Payments"
              value={`$${pendingPaymentsTotal.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              href="/carrier/payments"
            />
            <KPICard
              icon={Users}
              label="Active Drivers"
              value={activeDrivers?.length ?? 0}
              href="/carrier/drivers"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : !dashboardData?.recentActivity ||
              dashboardData.recentActivity.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">
                No recent activity
              </p>
            ) : (
              <div className="space-y-3">
                {dashboardData.recentActivity.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 border-b pb-3 last:border-0"
                  >
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Status Section */}
        <Card
          className={
            hasComplianceIssues ? 'border-orange-200 bg-orange-50/50' : ''
          }
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Compliance Status</CardTitle>
            {hasComplianceIssues ? (
              <AlertCircle className="h-4 w-4 text-orange-600" />
            ) : (
              <FileCheck className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {complianceLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-2 w-full" />
              </div>
            ) : (
              <>
                {/* Compliance Percentage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Overall Status
                    </span>
                    <span
                      className={`text-xl font-bold ${
                        compliancePercentage >= 80
                          ? 'text-green-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {compliancePercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        compliancePercentage >= 80
                          ? 'bg-green-600'
                          : 'bg-orange-600'
                      }`}
                      style={{ width: `${compliancePercentage}%` }}
                    />
                  </div>
                </div>

                {/* Documents Status */}
                <div className="space-y-2">
                  {complianceDocs && complianceDocs.length > 0 ? (
                    <>
                      <p className="text-sm font-medium text-gray-700">
                        Documents
                      </p>
                      {complianceDocs.slice(0, 3).map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 bg-white rounded border text-sm"
                        >
                          <span className="text-gray-600">
                            {doc.documentType}
                          </span>
                          <Badge
                            variant={
                              doc.status === 'APPROVED' ||
                              doc.status === 'VERIFIED'
                                ? 'default'
                                : 'secondary'
                            }
                            className={
                              doc.status === 'APPROVED' ||
                              doc.status === 'VERIFIED'
                                ? 'bg-green-100 text-green-800'
                                : ''
                            }
                          >
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">
                      No compliance documents uploaded
                    </p>
                  )}
                </div>

                {hasComplianceIssues && (
                  <div className="p-3 bg-orange-100 text-orange-800 text-sm rounded">
                    <p className="font-medium">Action Required</p>
                    <p className="text-xs mt-1">
                      Please upload missing compliance documents.
                    </p>
                  </div>
                )}

                <Link href="/carrier/documents" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Manage Documents
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <QuickLinkButton
              icon={Package}
              label="View Loads"
              href="/carrier/loads"
            />
            <QuickLinkButton
              icon={Upload}
              label="Upload Documents"
              href="/carrier/documents"
            />
            <QuickLinkButton
              icon={Users}
              label="Manage Drivers"
              href="/carrier/drivers"
            />
            <QuickLinkButton
              icon={Zap}
              label="Quick Pay"
              href="/carrier/quick-pay"
            />
            <QuickLinkButton
              icon={DollarSign}
              label="View Payments"
              href="/carrier/payments"
            />
            <QuickLinkButton
              icon={User}
              label="Update Profile"
              href="/carrier/profile"
            />
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-900">
              <AlertCircle className="h-4 w-4" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboardData.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded border text-sm ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-red-100 border-red-200 text-red-800'
                      : 'bg-yellow-100 border-yellow-200 text-yellow-800'
                  }`}
                >
                  {alert.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
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

function QuickLinkButton({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Button
        variant="outline"
        size="sm"
        className="w-full h-auto flex flex-col items-center gap-2 py-3"
      >
        <Icon className="h-4 w-4" />
        <span className="text-xs text-center">{label}</span>
      </Button>
    </Link>
  );
}

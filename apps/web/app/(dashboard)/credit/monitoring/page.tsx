'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/error-boundary';
import { CreditDashboardCards } from '@/components/credit';
import { ListPageSkeleton } from '@/components/shared/list-page-skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load monitoring dashboard
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Please refresh the page or contact support.
        </p>
      </div>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Refresh Page
      </Button>
    </div>
  );
}

function MonitoringContent() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Credit Health Indicators</h2>
        <Suspense fallback={<ListPageSkeleton rows={2} columns={4} />}>
          <CreditDashboardCards tenantId="default" />
        </Suspense>
      </div>

      {/* Threshold Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-yellow-600" />
            Utilization Threshold Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50">
              <h4 className="font-semibold text-yellow-900">
                80%+ Utilization
              </h4>
              <p className="text-sm text-yellow-800 mt-1">
                Customers approaching credit limit - monitor closely for
                potential holds.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-orange-200 bg-orange-50">
              <h4 className="font-semibold text-orange-900">
                100% Utilization (Exceeded)
              </h4>
              <p className="text-sm text-orange-800 mt-1">
                Credit limit exceeded - collection action or credit hold may be
                required.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-blue-900">Within Limits</h4>
              <p className="text-sm text-blue-800 mt-1">
                Customers using less than 80% of credit limit - continue normal
                monitoring.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <span>
                Review aging reports weekly to identify at-risk accounts
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <span>Place holds on accounts approaching 100% utilization</span>
            </li>
            <li className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <span>Monitor collections queue for overdue payments</span>
            </li>
            <li className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <span>
                Adjust credit limits based on payment history and credit profile
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreditMonitoringPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Credit Monitoring
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor credit health, utilization, and holds across your portfolio
          </p>
        </div>

        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link
            href="/credit"
            className="hover:text-foreground transition-colors"
          >
            Credit
          </Link>
          {' > '}
          <span className="text-foreground font-medium">Monitoring</span>
        </nav>

        {/* Monitoring Content */}
        <Suspense fallback={<ListPageSkeleton rows={8} columns={2} />}>
          <MonitoringContent />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

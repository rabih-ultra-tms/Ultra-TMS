'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/error-boundary';
import { AgingBucketChart } from '@/components/credit';
import { ListPageSkeleton } from '@/components/shared/list-page-skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, RefreshCw } from 'lucide-react';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load reports
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

function ReportsContent() {
  const handleExport = (format: 'csv' | 'pdf') => {
    // Export functionality would be implemented here
    console.log(`Exporting report as ${format}`);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="mr-2 size-4" />
              Export as CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="mr-2 size-4" />
              Export as PDF
            </Button>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 size-4" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Aging Analysis Chart */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Aging Analysis</h2>
        <Suspense fallback={<ListPageSkeleton rows={6} columns={2} />}>
          <AgingBucketChart _tenantId="default" />
        </Suspense>
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold mt-1">-</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Issued Limits
              </p>
              <p className="text-2xl font-bold mt-1">-</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Utilized</p>
              <p className="text-2xl font-bold mt-1">-</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Utilization</p>
              <p className="text-2xl font-bold mt-1">-</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Report Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Set up automated report delivery
          </p>
          <Button variant="outline">Configure Schedule</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreditReportsPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Credit Reports</h1>
          <p className="text-muted-foreground mt-2">
            View credit analysis reports and export data
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
          <span className="text-foreground font-medium">Reports</span>
        </nav>

        {/* Reports Content */}
        <Suspense fallback={<ListPageSkeleton rows={8} columns={2} />}>
          <ReportsContent />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

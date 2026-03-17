'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { CreditDashboardCards, AgingBucketChart } from '@/components/credit';
import { ListPageSkeleton } from '@/components/shared/list-page-skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp } from 'lucide-react';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load credit dashboard
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

function DashboardSkeleton() {
  return <ListPageSkeleton rows={6} columns={4} />;
}

export default function CreditDashboardPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Credit Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor credit limits, utilization, and holds across your
              customers
            </p>
          </div>
          <Button asChild>
            <Link href="/credit/applications/new">
              <Plus className="mr-2 size-4" />
              New Application
            </Link>
          </Button>
        </div>

        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <span className="text-foreground font-medium">Credit</span>
          {' > '}
          <span>Dashboard</span>
        </nav>

        {/* KPI Cards */}
        <div className="mb-8">
          <Suspense fallback={<DashboardSkeleton />}>
            <CreditDashboardCards tenantId="default" />
          </Suspense>
        </div>

        {/* Aging Analysis Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Suspense fallback={<DashboardSkeleton />}>
              <AgingBucketChart tenantId="default" />
            </Suspense>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="size-4" />
                Quick Links
              </h3>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/credit/applications">View Applications</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/credit/review">Review Queue</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/credit/limits">Credit Limits</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/credit/collections">Collections</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

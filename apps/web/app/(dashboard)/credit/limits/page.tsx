'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/error-boundary';
import { useCreditLimits } from '@/lib/hooks/credit';
import { CreditLimitCard } from '@/components/credit';
import { ListPageSkeleton } from '@/components/shared/list-page-skeleton';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle } from 'lucide-react';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load credit limits
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

function LimitsContent() {
  const { data, isLoading, error } = useCreditLimits();

  if (isLoading) {
    return <ListPageSkeleton rows={6} columns={4} />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <p className="text-sm text-red-700">
          Failed to load credit limits. Please try again.
        </p>
      </div>
    );
  }

  const limits = data?.data || [];

  if (limits.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
        <h3 className="font-semibold text-gray-900 mb-2">No Credit Limits</h3>
        <p className="text-sm text-gray-600 mb-6">
          No credit limits have been issued yet.
        </p>
        <Button asChild>
          <Link href="/credit/applications/new">
            <Plus className="mr-2 size-4" />
            New Application
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {limits.map((limit) => (
        <CreditLimitCard key={limit.id} limit={limit} />
      ))}
    </div>
  );
}

export default function CreditLimitsPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Credit Limits</h1>
            <p className="text-muted-foreground mt-2">
              View all issued credit limits and utilization status
            </p>
          </div>
          <Button asChild>
            <Link href="/credit/applications/new">
              <Plus className="mr-2 size-4" />
              New Limit
            </Link>
          </Button>
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
          <span className="text-foreground font-medium">Limits</span>
        </nav>

        {/* Limits Grid */}
        <Suspense fallback={<ListPageSkeleton rows={6} columns={4} />}>
          <LimitsContent />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

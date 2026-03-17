'use client';

import { use, Suspense } from 'react';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/error-boundary';
import { CreditApplicationDetail } from '@/components/credit';
import { ListPageSkeleton } from '@/components/shared/list-page-skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load application details
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

function DetailContent({ applicationId }: { applicationId: string }) {
  return <CreditApplicationDetail applicationId={applicationId} mode="view" />;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CreditApplicationDetailPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="outline" className="mb-4">
            <Link href="/credit/applications">
              <ArrowLeft className="mr-2 size-4" />
              Back to Applications
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Credit Application Details
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and manage credit application information
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
          <Link
            href="/credit/applications"
            className="hover:text-foreground transition-colors"
          >
            Applications
          </Link>
          {' > '}
          <span className="text-foreground font-medium">Details</span>
        </nav>

        {/* Detail Content */}
        <Suspense fallback={<ListPageSkeleton rows={8} columns={2} />}>
          <DetailContent applicationId={id} />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

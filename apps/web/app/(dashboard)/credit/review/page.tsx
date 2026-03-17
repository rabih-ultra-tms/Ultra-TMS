'use client';

import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/error-boundary';
import { CreditApplicationList } from '@/components/credit';
import { ListPageSkeleton } from '@/components/shared/list-page-skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load review queue
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

function ReviewQueueContent() {
  const router = useRouter();

  const handleApplicationSelect = (applicationId: string) => {
    router.push(`/credit/applications/${applicationId}`);
  };

  return (
    <>
      <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-yellow-900">Action Required</h3>
          <p className="text-sm text-yellow-800 mt-1">
            Review pending credit applications below. Click on any application
            to review and take action.
          </p>
        </div>
      </div>

      <CreditApplicationList
        status="PENDING"
        onSelect={handleApplicationSelect}
      />
    </>
  );
}

export default function CreditReviewQueuePage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Credit Review Queue
          </h1>
          <p className="text-muted-foreground mt-2">
            Pending credit applications waiting for approval
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
          <span className="text-foreground font-medium">Review Queue</span>
        </nav>

        {/* Queue Content */}
        <Suspense fallback={<ListPageSkeleton rows={10} columns={5} />}>
          <ReviewQueueContent />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

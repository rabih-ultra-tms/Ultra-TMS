'use client';

import { use, Suspense } from 'react';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/error-boundary';
import {
  CollectionActivityLog,
  PaymentPlanTimeline,
} from '@/components/credit';
import { ListPageSkeleton } from '@/components/shared/list-page-skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load collection details
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

function DetailContent({ collectionId }: { collectionId: string }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Activity Log */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
          <CollectionActivityLog _companyId={collectionId} />
        </div>
      </div>

      <div className="space-y-8">
        {/* Payment Plan Timeline */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Payment Plan</h2>
          <PaymentPlanTimeline planId={collectionId} />
        </div>

        {/* Actions */}
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Actions</h3>
          <div className="space-y-2">
            <Button className="w-full" variant="default">
              Log Activity
            </Button>
            <Button className="w-full" variant="outline">
              Update Payment Plan
            </Button>
            <Button className="w-full" variant="outline">
              Send Notice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CreditCollectionDetailPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="outline" className="mb-4">
            <Link href="/credit/collections">
              <ArrowLeft className="mr-2 size-4" />
              Back to Collections
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Collection Details
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage collection activities and payment plans
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
            href="/credit/collections"
            className="hover:text-foreground transition-colors"
          >
            Collections
          </Link>
          {' > '}
          <span className="text-foreground font-medium">Details</span>
        </nav>

        {/* Detail Content */}
        <Suspense fallback={<ListPageSkeleton rows={8} columns={2} />}>
          <DetailContent collectionId={id} />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

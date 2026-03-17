'use client';

import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/error-boundary';
import { CreditApplicationForm } from '@/components/credit';
import { ListPageSkeleton } from '@/components/shared/list-page-skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load application form
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

function FormContent() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push(`/credit/applications`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <CreditApplicationForm onSuccess={handleSuccess} />
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Application Info</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Required Fields</p>
              <p className="text-xs mt-1">
                Company name, requested limit, and financial information are
                required.
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Processing Time</p>
              <p className="text-xs mt-1">
                Applications are reviewed within 2-3 business days.
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Documentation</p>
              <p className="text-xs mt-1">
                Financial statements and references are required for approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreditApplicationNewPage() {
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
            New Credit Application
          </h1>
          <p className="text-muted-foreground mt-2">
            Submit a new credit limit application for a customer
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
          <span className="text-foreground font-medium">New</span>
        </nav>

        {/* Form Content */}
        <Suspense fallback={<ListPageSkeleton rows={8} columns={2} />}>
          <FormContent />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

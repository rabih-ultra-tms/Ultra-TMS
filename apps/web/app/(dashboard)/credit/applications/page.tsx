'use client';

import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/error-boundary';
import { CreditApplicationList } from '@/components/credit';
import { ListPageSkeleton } from '@/components/shared/list-page-skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load applications
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

function ListContent() {
  const router = useRouter();

  const handleApplicationSelect = (applicationId: string) => {
    router.push(`/credit/applications/${applicationId}`);
  };

  return <CreditApplicationList onSelect={handleApplicationSelect} />;
}

export default function CreditApplicationsPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Credit Applications
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and track all credit limit applications
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
          <Link
            href="/credit"
            className="hover:text-foreground transition-colors"
          >
            Credit
          </Link>
          {' > '}
          <span className="text-foreground font-medium">Applications</span>
        </nav>

        {/* List Content */}
        <Suspense fallback={<ListPageSkeleton rows={10} columns={5} />}>
          <ListContent />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/error-boundary';
import { CollectionActivityLog } from '@/components/credit';
import { ListPageSkeleton } from '@/components/shared/list-page-skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load collections queue
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

function CollectionsContent() {
  const [agingBucketFilter, setAgingBucketFilter] = useState('all');
  const [selectedCompanyId] = useState<string>('');

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-3 items-center">
        <Select value={agingBucketFilter} onValueChange={setAgingBucketFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by aging bucket" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buckets</SelectItem>
            <SelectItem value="CURRENT">Current (0-30 days)</SelectItem>
            <SelectItem value="30_60">30-60 Days</SelectItem>
            <SelectItem value="60_90">60-90 Days</SelectItem>
            <SelectItem value="90_PLUS">90+ Days</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      {/* Collections Activity Log */}
      {selectedCompanyId && (
        <CollectionActivityLog _companyId={selectedCompanyId} />
      )}
    </div>
  );
}

export default function CreditCollectionsPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Collections Queue
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage overdue accounts and collection activities
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
          <span className="text-foreground font-medium">Collections</span>
        </nav>

        {/* Collections Content */}
        <Suspense fallback={<ListPageSkeleton rows={10} columns={5} />}>
          <CollectionsContent />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

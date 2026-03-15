'use client';

import { Suspense } from 'react';
import { NewClaimWizard } from '@/components/claims/NewClaimWizard';
import { Skeleton } from '@/components/ui/skeleton';

function NewClaimPageContent() {
  return <NewClaimWizard />;
}

function NewClaimPageFallback() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>
      <Skeleton className="h-24" />
      <Skeleton className="h-96" />
    </div>
  );
}

export default function NewClaimPage() {
  return (
    <Suspense fallback={<NewClaimPageFallback />}>
      <NewClaimPageContent />
    </Suspense>
  );
}

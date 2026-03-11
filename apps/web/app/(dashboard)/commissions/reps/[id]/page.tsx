import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { RepDetailClient } from './rep-detail-client';

function RepDetailSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-lg" />
    </div>
  );
}

export default async function RepDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<RepDetailSkeleton />}>
      <RepDetailClient repId={id} />
    </Suspense>
  );
}

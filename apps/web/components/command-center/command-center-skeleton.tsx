'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function CommandCenterSkeleton() {
  return (
    <div className="flex h-full flex-col gap-3">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between border-b border-border px-1 pb-3">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-md" />
          ))}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
      {/* KPI strip skeleton */}
      <div className="grid grid-cols-7 gap-3 px-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      {/* Board skeleton */}
      <div className="flex-1 px-1">
        <div className="grid h-full grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-8 w-full rounded-md" />
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

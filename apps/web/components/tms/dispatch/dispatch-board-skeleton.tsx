/**
 * Dispatch Board Skeleton
 *
 * Loading skeleton for the dispatch board.
 * Shows 6 lane skeletons with card placeholders.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function DispatchBoardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Toolbar Skeleton */}
      <div className="border-b bg-background">
        <div className="flex items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-[280px]" />
          </div>
          <div className="flex flex-1 items-center gap-2 max-w-2xl">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 flex-1 max-w-xs" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-2 px-6 pb-3">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      {/* KPI Strip Skeleton */}
      <div className="border-b bg-muted/30 px-6 py-3">
        <div className="grid grid-cols-8 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="px-4 py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-8" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Kanban Board Skeleton */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full gap-4 overflow-x-auto p-6 bg-muted/10">
          {Array.from({ length: 6 }).map((_, laneIdx) => (
            <div
              key={laneIdx}
              className="flex w-[320px] flex-shrink-0 flex-col rounded-lg bg-muted/30"
            >
              {/* Lane Header Skeleton */}
              <div className="flex items-center justify-between gap-2 rounded-t-lg border-b border-t-4 bg-background px-4 py-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
              </div>

              {/* Lane Cards Skeleton */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {Array.from({ length: 3 + (laneIdx % 3) }).map((_, cardIdx) => (
                  <div key={cardIdx} className="rounded-lg border bg-background shadow-sm p-3">
                    <div className="space-y-2">
                      {/* Load number + icons */}
                      <div className="flex items-start justify-between">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-4" />
                      </div>

                      {/* Route */}
                      <Skeleton className="h-4 w-full" />

                      {/* Carrier */}
                      <Skeleton className="h-4 w-32" />

                      {/* Dates */}
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-20" />
                      </div>

                      {/* Margin */}
                      <Skeleton className="h-4 w-24" />

                      {/* Footer */}
                      <div className="flex justify-between pt-1 border-t">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

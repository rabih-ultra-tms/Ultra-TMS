"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// DetailPageSkeleton — shimmer skeleton for detail/view pages
//
// Shows: page header shimmer + tab bar shimmer + N content card shimmers.
// Configurable via `sections` and `showTabs` props.
// ---------------------------------------------------------------------------

interface DetailPageSkeletonProps {
    /** Number of content card sections to show (default 3) */
    sections?: number;
    /** Show the tab bar shimmer (default true) */
    showTabs?: boolean;
    /** Additional CSS classes */
    className?: string;
}

export function DetailPageSkeleton({
    sections = 3,
    showTabs = true,
    className,
}: DetailPageSkeletonProps) {
    return (
        <div className={cn("flex flex-col gap-6 p-6", className)}>
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-5 w-5 rounded" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-7 w-48 rounded" />
                        <Skeleton className="h-4 w-32 rounded" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-24 rounded-md" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                </div>
            </div>

            {/* Tab bar */}
            {showTabs && (
                <div className="flex items-center gap-4 border-b border-border pb-2">
                    <Skeleton className="h-8 w-20 rounded" />
                    <Skeleton className="h-8 w-20 rounded" />
                    <Skeleton className="h-8 w-20 rounded" />
                    <Skeleton className="h-8 w-20 rounded" />
                </div>
            )}

            {/* Content cards */}
            {Array.from({ length: sections }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border p-5">
                    {/* Card header */}
                    <Skeleton className="h-5 w-36 rounded mb-4" />

                    {/* Card content — field pairs */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {Array.from({ length: 4 }).map((_, j) => (
                            <div key={j} className="flex flex-col gap-1.5">
                                <Skeleton className="h-3 w-20 rounded" />
                                <Skeleton className="h-4 w-full rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

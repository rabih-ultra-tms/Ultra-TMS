"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// ListPageSkeleton — shimmer skeleton for list/table pages
//
// Shows: filter bar shimmer + table header + N placeholder rows.
// Configurable via `rows` and `columns` props.
// ---------------------------------------------------------------------------

interface ListPageSkeletonProps {
    /** Number of visible skeleton rows (default 10) */
    rows?: number;
    /** Number of table columns (default 6) */
    columns?: number;
    /** Additional CSS classes */
    className?: string;
}

export function ListPageSkeleton({
    rows = 10,
    columns = 6,
    className,
}: ListPageSkeletonProps) {
    return (
        <div className={cn("flex flex-col gap-0", className)}>
            {/* Filter bar shimmer */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
                <Skeleton className="h-9 w-64 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <div className="ml-auto flex items-center gap-2">
                    <Skeleton className="h-8 w-28 rounded-md" />
                </div>
            </div>

            {/* Table header */}
            <div className="grid gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <div
                    className="grid gap-4"
                    style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                >
                    {Array.from({ length: columns }).map((_, i) => (
                        <Skeleton key={i} className="h-3.5 w-20 rounded" />
                    ))}
                </div>
            </div>

            {/* Table rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div
                    key={rowIdx}
                    className="grid gap-4 px-4 py-3 border-b border-border last:border-b-0"
                    style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                >
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <Skeleton
                            key={colIdx}
                            className={cn(
                                "h-4 rounded",
                                colIdx === 0 ? "w-32" : "w-full"
                            )}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

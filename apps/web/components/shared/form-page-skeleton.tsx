"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// FormPageSkeleton — shimmer skeleton for form/edit pages
//
// Shows: page header shimmer + form field pairs (label + input).
// Configurable via `fields` and `sections` props.
// ---------------------------------------------------------------------------

interface FormPageSkeletonProps {
    /** Number of form sections (default 2) */
    sections?: number;
    /** Number of fields per section (default 4) */
    fieldsPerSection?: number;
    /** Show a two-column layout for fields (default true) */
    twoColumn?: boolean;
    /** Additional CSS classes */
    className?: string;
}

export function FormPageSkeleton({
    sections = 2,
    fieldsPerSection = 4,
    twoColumn = true,
    className,
}: FormPageSkeletonProps) {
    return (
        <div className={cn("flex flex-col gap-6 p-6", className)}>
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-7 w-40 rounded" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-20 rounded-md" />
                    <Skeleton className="h-9 w-28 rounded-md" />
                </div>
            </div>

            {/* Form sections */}
            {Array.from({ length: sections }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border p-5">
                    {/* Section header */}
                    <Skeleton className="h-5 w-44 rounded mb-5" />

                    {/* Form fields */}
                    <div
                        className={cn(
                            "gap-x-8 gap-y-5",
                            twoColumn ? "grid grid-cols-2" : "flex flex-col"
                        )}
                    >
                        {Array.from({ length: fieldsPerSection }).map((_, j) => (
                            <div key={j} className="flex flex-col gap-2">
                                <Skeleton className="h-3.5 w-24 rounded" />
                                <Skeleton className="h-10 w-full rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Bottom action bar */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-32 rounded-md" />
            </div>
        </div>
    );
}

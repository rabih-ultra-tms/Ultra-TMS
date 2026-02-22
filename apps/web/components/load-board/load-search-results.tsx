"use client";

import Link from "next/link";
import { MapPin, ArrowRight, Truck, Weight, Calendar, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { LoadPosting } from "@/types/load-board";

interface LoadSearchResultsProps {
    postings?: LoadPosting[];
    isLoading: boolean;
    isError: boolean;
    onRetry?: () => void;
}

function formatCurrency(value: number | undefined): string {
    if (value == null) return "Contact for rate";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
    }).format(value);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function timeAgo(dateString: string): string {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) return "Just posted";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function LoadSearchResults({
    postings,
    isLoading,
    isError,
    onRetry,
}: LoadSearchResultsProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
                <p className="text-sm text-destructive">
                    Failed to load results.
                </p>
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-2 text-sm text-primary underline"
                    >
                        Try again
                    </button>
                )}
            </div>
        );
    }

    if (!postings?.length) {
        return (
            <div className="rounded-lg border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                    No loads match your search criteria. Try expanding your
                    radius or adjusting filters.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">
                {postings.length} result{postings.length !== 1 ? "s" : ""} found
            </p>
            {postings.map((posting) => (
                <Link
                    key={posting.id}
                    href={`/load-board/postings/${posting.id}`}
                    className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                    <div className="flex items-start justify-between gap-4">
                        {/* Route */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-sm font-medium">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span>
                                    {posting.originCity}, {posting.originState}
                                </span>
                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>
                                    {posting.destCity}, {posting.destState}
                                </span>
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Truck className="h-3 w-3" />
                                    {posting.equipmentType}
                                </span>
                                {posting.weight && (
                                    <span className="flex items-center gap-1">
                                        <Weight className="h-3 w-3" />
                                        {posting.weight.toLocaleString()} lbs
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(posting.pickupDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {posting.viewCount} views
                                </span>
                            </div>
                        </div>

                        {/* Rate + Meta */}
                        <div className="text-right shrink-0">
                            <span className="text-sm font-semibold">
                                {posting.showRate
                                    ? formatCurrency(posting.postedRate)
                                    : "Contact for rate"}
                            </span>
                            {posting.rateType === "PER_MILE" && (
                                <Badge
                                    variant="outline"
                                    className="ml-1.5 text-[10px]"
                                >
                                    /mi
                                </Badge>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {timeAgo(posting.createdAt)}
                            </p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

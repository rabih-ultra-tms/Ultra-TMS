"use client";

import Link from "next/link";
import { MapPin, ArrowRight, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecentPosting, PostingStatus } from "@/types/load-board";

interface LbRecentPostingsProps {
    postings?: RecentPosting[];
    isLoading: boolean;
}

const STATUS_CONFIG: Record<
    PostingStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
    ACTIVE: { label: "Active", variant: "default" },
    BOOKED: { label: "Booked", variant: "secondary" },
    EXPIRED: { label: "Expired", variant: "destructive" },
    CANCELLED: { label: "Cancelled", variant: "outline" },
};

function formatCurrency(value: number | undefined): string {
    if (value == null) return "Contact for rate";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
    }).format(value);
}

function timeAgo(dateString: string): string {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function LbRecentPostings({
    postings,
    isLoading,
}: LbRecentPostingsProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">
                        Recent Postings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!postings?.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">
                        Recent Postings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        No active postings. Post a load to get started.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">
                    Recent Postings
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {postings.map((posting) => {
                    const config = STATUS_CONFIG[posting.status];
                    return (
                        <Link
                            key={posting.id}
                            href={`/load-board/postings/${posting.id}`}
                            className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>
                                        {posting.originCity},{" "}
                                        {posting.originState}
                                    </span>
                                    <ArrowRight className="h-3 w-3 mx-1" />
                                    <span>
                                        {posting.destCity},{" "}
                                        {posting.destState}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="text-sm font-medium">
                                    {formatCurrency(posting.postedRate)}
                                </span>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MessageSquare className="h-3 w-3" />
                                    {posting.bidCount}
                                </div>
                                <Badge variant={config.variant}>
                                    {config.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {timeAgo(posting.createdAt)}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </CardContent>
        </Card>
    );
}

"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useState } from "react";
import {
    usePosting,
    useBids,
    useAcceptBid,
    useRejectBid,
    useCounterBid,
    useCancelPosting,
    useCarrierMatches,
    useTenderToCarrier,
} from "@/lib/hooks/load-board";
import { PostingDetailCard } from "@/components/load-board/posting-detail-card";
import { BidsList } from "@/components/load-board/bids-list";
import { CarrierMatchesPanel } from "@/components/load-board/carrier-matches-panel";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function PostingDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    // Queries
    const { data: posting, isLoading: postingLoading } = usePosting(id);
    const { data: bidsResponse, isLoading: bidsLoading } = useBids(id);
    const { data: matches, isLoading: matchesLoading } =
        useCarrierMatches(id);

    // Mutations
    const acceptBid = useAcceptBid(id);
    const rejectBid = useRejectBid(id);
    const counterBid = useCounterBid(id);
    const cancelPosting = useCancelPosting(id);
    const tenderToCarrier = useTenderToCarrier(id);

    const bids = bidsResponse?.data;

    if (postingLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    if (!posting) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/load-board">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Load Board
                    </Link>
                </Button>
                <div className="rounded-lg border p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Posting not found.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/load-board">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Posting Detail
                    </h1>
                </div>
                {posting.status === "ACTIVE" && (
                    <Button
                        variant="outline"
                        className="text-destructive"
                        onClick={() => setShowCancelDialog(true)}
                        disabled={cancelPosting.isPending}
                    >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel Posting
                    </Button>
                )}
            </div>

            {/* Posting Detail */}
            <PostingDetailCard posting={posting} isLoading={false} />

            {/* Bids */}
            <BidsList
                bids={bids}
                isLoading={bidsLoading}
                postingStatus={posting.status}
                onAccept={(bidId) => acceptBid.mutate(bidId)}
                onReject={(bidId, reason) =>
                    rejectBid.mutate({ bidId, reason })
                }
                onCounter={(bidId, counterAmount, counterNotes) =>
                    counterBid.mutate({ bidId, counterAmount, counterNotes })
                }
                isAccepting={acceptBid.isPending}
                isRejecting={rejectBid.isPending}
                isCountering={counterBid.isPending}
            />

            {/* Carrier Matches (LB-005) */}
            <CarrierMatchesPanel
                matches={matches}
                isLoading={matchesLoading}
                onTender={(carrierId) => tenderToCarrier.mutate(carrierId)}
                isTendering={tenderToCarrier.isPending}
            />

            {/* Cancel Confirmation */}
            <ConfirmDialog
                open={showCancelDialog}
                title="Cancel Posting"
                description="Are you sure you want to cancel this posting? Active bids will be rejected."
                confirmLabel="Cancel Posting"
                variant="destructive"
                onConfirm={() => {
                    cancelPosting.mutate();
                    setShowCancelDialog(false);
                }}
                onCancel={() => setShowCancelDialog(false)}
            />
        </div>
    );
}

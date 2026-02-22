"use client";

import { useState } from "react";
import { Check, X, ArrowLeftRight, Truck, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { BidCounterDialog } from "./bid-counter-dialog";
import type { LoadBid, BidStatus } from "@/types/load-board";

interface BidsListProps {
    bids?: LoadBid[];
    isLoading: boolean;
    postingStatus: string;
    onAccept: (bidId: string) => void;
    onReject: (bidId: string, reason: string) => void;
    onCounter: (bidId: string, amount: number, notes?: string) => void;
    isAccepting: boolean;
    isRejecting: boolean;
    isCountering: boolean;
}

const BID_STATUS_MAP: Record<
    BidStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
    PENDING: { label: "Pending", variant: "default" },
    ACCEPTED: { label: "Accepted", variant: "secondary" },
    REJECTED: { label: "Rejected", variant: "destructive" },
    COUNTERED: { label: "Countered", variant: "outline" },
    EXPIRED: { label: "Expired", variant: "destructive" },
    WITHDRAWN: { label: "Withdrawn", variant: "outline" },
};

function formatCurrency(value: number): string {
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
        hour: "numeric",
        minute: "2-digit",
    });
}

export function BidsList({
    bids,
    isLoading,
    postingStatus,
    onAccept,
    onReject,
    onCounter,
    isAccepting,
    isRejecting,
    isCountering,
}: BidsListProps) {
    const [acceptBidId, setAcceptBidId] = useState<string | null>(null);
    const [rejectBidId, setRejectBidId] = useState<string | null>(null);
    const [counterBidId, setCounterBidId] = useState<string | null>(null);

    const canActOnBids = postingStatus === "ACTIVE";

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Bids</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!bids?.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Bids</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        No bids received yet.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">
                        Bids ({bids.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {bids.map((bid) => {
                        const statusConfig = BID_STATUS_MAP[bid.status];
                        return (
                            <div
                                key={bid.id}
                                className="flex items-center justify-between rounded-md border p-3"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                            {bid.carrier?.companyName ??
                                                bid.carrier?.legalName ??
                                                "Unknown Carrier"}
                                        </span>
                                        {bid.carrier?.mcNumber && (
                                            <span className="text-xs text-muted-foreground">
                                                MC#{bid.carrier.mcNumber}
                                            </span>
                                        )}
                                        <Badge variant={statusConfig.variant}>
                                            {statusConfig.label}
                                        </Badge>
                                    </div>
                                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground text-sm">
                                            {formatCurrency(bid.bidAmount)}
                                        </span>
                                        {bid.counterAmount && (
                                            <span className="text-primary">
                                                Counter:{" "}
                                                {formatCurrency(
                                                    bid.counterAmount
                                                )}
                                            </span>
                                        )}
                                        {bid.driverName && (
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {bid.driverName}
                                            </span>
                                        )}
                                        {bid.truckNumber && (
                                            <span className="flex items-center gap-1">
                                                <Truck className="h-3 w-3" />
                                                {bid.truckNumber}
                                            </span>
                                        )}
                                        {bid.driverPhone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {bid.driverPhone}
                                            </span>
                                        )}
                                        <span>
                                            {formatDate(bid.createdAt)}
                                        </span>
                                    </div>
                                    {bid.notes && (
                                        <p className="mt-1 text-xs text-muted-foreground italic">
                                            {bid.notes}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                {canActOnBids && bid.status === "PENDING" && (
                                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                                        <Button
                                            size="sm"
                                            variant="default"
                                            onClick={() =>
                                                setAcceptBidId(bid.id)
                                            }
                                            disabled={isAccepting}
                                        >
                                            <Check className="h-3.5 w-3.5 mr-1" />
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setCounterBidId(bid.id)
                                            }
                                            disabled={isCountering}
                                        >
                                            <ArrowLeftRight className="h-3.5 w-3.5 mr-1" />
                                            Counter
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                setRejectBidId(bid.id)
                                            }
                                            disabled={isRejecting}
                                        >
                                            <X className="h-3.5 w-3.5 mr-1" />
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Accept Confirmation */}
            <ConfirmDialog
                open={acceptBidId !== null}
                title="Accept Bid"
                description="Accepting this bid will mark the posting as COVERED and reject all other bids. This cannot be undone."
                confirmLabel="Accept Bid"
                onConfirm={() => {
                    if (acceptBidId) onAccept(acceptBidId);
                    setAcceptBidId(null);
                }}
                onCancel={() => setAcceptBidId(null)}
            />

            {/* Reject Confirmation */}
            <ConfirmDialog
                open={rejectBidId !== null}
                title="Reject Bid"
                description="Are you sure you want to reject this bid?"
                confirmLabel="Reject"
                variant="destructive"
                onConfirm={() => {
                    if (rejectBidId) onReject(rejectBidId, "Not competitive");
                    setRejectBidId(null);
                }}
                onCancel={() => setRejectBidId(null)}
            />

            {/* Counter Dialog */}
            <BidCounterDialog
                open={counterBidId !== null}
                onOpenChange={(open) => {
                    if (!open) setCounterBidId(null);
                }}
                onSubmit={(amount, notes) => {
                    if (counterBidId) onCounter(counterBidId, amount, notes);
                    setCounterBidId(null);
                }}
                isPending={isCountering}
            />
        </>
    );
}

"use client";

import {
    MapPin,
    ArrowRight,
    Truck,
    Weight,
    Calendar,
    DollarSign,
    Eye,
    MessageSquare,
    Package,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { LoadPosting, PostingStatus } from "@/types/load-board";

interface PostingDetailCardProps {
    posting?: LoadPosting;
    isLoading: boolean;
}

const STATUS_MAP: Record<
    PostingStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
    ACTIVE: { label: "Active", variant: "default" },
    BOOKED: { label: "Booked", variant: "secondary" },
    EXPIRED: { label: "Expired", variant: "destructive" },
    CANCELLED: { label: "Cancelled", variant: "outline" },
};

function formatCurrency(value: number | undefined): string {
    if (value == null) return "—";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
    }).format(value);
}

function formatDate(dateString: string | undefined): string {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function PostingDetailCard({
    posting,
    isLoading,
}: PostingDetailCardProps) {
    if (isLoading || !posting) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardContent>
            </Card>
        );
    }

    const statusConfig = STATUS_MAP[posting.status];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <span>Posting Detail</span>
                        <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                        </Badge>
                    </CardTitle>
                    {posting.load && (
                        <p className="text-sm text-muted-foreground mt-1">
                            Load #{posting.load.loadNumber}
                            {posting.load.order?.customer?.companyName &&
                                ` — ${posting.load.order.customer.companyName}`}
                        </p>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {/* Route */}
                <div className="flex items-center gap-2 text-base font-medium mb-4">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                        {posting.originCity}, {posting.originState}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span>
                        {posting.destCity}, {posting.destState}
                    </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    <DetailItem
                        icon={<Truck className="h-3.5 w-3.5" />}
                        label="Equipment"
                        value={posting.equipmentType}
                    />
                    {posting.weight && (
                        <DetailItem
                            icon={<Weight className="h-3.5 w-3.5" />}
                            label="Weight"
                            value={`${posting.weight.toLocaleString()} lbs`}
                        />
                    )}
                    {posting.commodity && (
                        <DetailItem
                            icon={<Package className="h-3.5 w-3.5" />}
                            label="Commodity"
                            value={posting.commodity}
                        />
                    )}
                    <DetailItem
                        icon={<DollarSign className="h-3.5 w-3.5" />}
                        label="Rate"
                        value={
                            posting.showRate
                                ? `${formatCurrency(posting.postedRate)} ${posting.rateType === "PER_MILE" ? "/mi" : ""}`
                                : "Contact for rate"
                        }
                    />
                    <DetailItem
                        icon={<Calendar className="h-3.5 w-3.5" />}
                        label="Pickup"
                        value={formatDate(posting.pickupDate)}
                    />
                    <DetailItem
                        icon={<Calendar className="h-3.5 w-3.5" />}
                        label="Delivery"
                        value={formatDate(posting.deliveryDate)}
                    />
                    <DetailItem
                        icon={<Eye className="h-3.5 w-3.5" />}
                        label="Views"
                        value={String(posting.viewCount)}
                    />
                    <DetailItem
                        icon={<MessageSquare className="h-3.5 w-3.5" />}
                        label="Bids"
                        value={String(posting.bidCount)}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function DetailItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                {icon}
                {label}
            </div>
            <p className="text-sm font-medium">{value}</p>
        </div>
    );
}

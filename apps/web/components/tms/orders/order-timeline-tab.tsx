"use client";

import { useMemo } from "react";
import { useOrderTimeline } from "@/lib/hooks/tms/use-orders";
import { TimelineEvent } from "@/types/orders";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
    FileText,
    UserPlus,
    CheckCircle,
    Truck,
    Info,
    Clock,
    ShieldCheck,
    Package,
    DollarSign,
} from "lucide-react";

interface OrderTimelineTabProps {
    orderId: string;
}

const getIcon = (eventType: string) => {
    switch (eventType) {
        case "STATUS_CHANGE":
            return <Truck className="h-4 w-4" />;
        case "DOCUMENT":
            return <FileText className="h-4 w-4" />;
        case "ASSIGNMENT":
            return <UserPlus className="h-4 w-4" />;
        case "CREATED":
            return <CheckCircle className="h-4 w-4" />;
        case "APPROVAL":
            return <ShieldCheck className="h-4 w-4" />;
        case "SHIPMENT":
            return <Package className="h-4 w-4" />;
        case "BILLING":
            return <DollarSign className="h-4 w-4" />;
        default:
            return <Info className="h-4 w-4" />;
    }
};

const getColor = (eventType: string) => {
    switch (eventType) {
        case "STATUS_CHANGE":
            return "bg-blue-100 text-blue-600 border-blue-200";
        case "DOCUMENT":
            return "bg-purple-100 text-purple-600 border-purple-200";
        case "ASSIGNMENT":
            return "bg-orange-100 text-orange-600 border-orange-200";
        case "CREATED":
            return "bg-green-100 text-green-600 border-green-200";
        case "APPROVAL":
            return "bg-emerald-100 text-emerald-600 border-emerald-200";
        case "SHIPMENT":
            return "bg-indigo-100 text-indigo-600 border-indigo-200";
        case "BILLING":
            return "bg-amber-100 text-amber-600 border-amber-200";
        default:
            return "bg-slate-100 text-slate-600 border-slate-200";
    }
};

export function OrderTimelineTab({ orderId }: OrderTimelineTabProps) {
    const { data: events, isLoading } = useOrderTimeline(orderId);

    const sortedEvents = useMemo(() => {
        if (!events) return [];
        return [...events].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }, [events]);

    if (isLoading) {
        return (
            <div className="space-y-6 pl-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        );
    }

    if (sortedEvents.length === 0) {
        return (
            <div className="text-muted-foreground p-8 text-center">
                No timeline events recorded yet.
            </div>
        );
    }

    return (
        <div className="space-y-8 pl-2">
            <h3 className="text-lg font-medium mb-4">Activity Timeline</h3>
            <div className="relative border-l ml-3 space-y-8">
                {sortedEvents.map((event: TimelineEvent) => (
                    <div key={event.id} className="ml-6 relative">
                        <div
                            className={cn(
                                "absolute -left-[37px] top-1 w-8 h-8 rounded-full border flex items-center justify-center z-10 bg-white",
                                getColor(event.eventType)
                            )}
                        >
                            {getIcon(event.eventType)}
                        </div>

                        <div className="flex flex-col gap-1 bg-card rounded-md border p-3 shadow-sm hover:bg-muted/30 transition-colors">
                            <div className="flex justify-between items-start">
                                <span className="font-medium text-sm">
                                    {event.description}
                                </span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(event.timestamp).toLocaleString()}
                                </span>
                            </div>
                            {event.userName && (
                                <div className="text-xs text-muted-foreground mt-1 font-medium">
                                    by {event.userName}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

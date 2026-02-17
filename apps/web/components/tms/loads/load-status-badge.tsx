"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LoadStatus } from "@/types/loads";
import type { LucideIcon } from "lucide-react";
import {
    PenLine,
    Clock,
    SendHorizonal,
    ThumbsUp,
    Send,
    MapPin,
    PackageOpen,
    Truck,
    MapPinCheck,
    PackageCheck,
    CircleCheckBig,
    XCircle
} from "lucide-react";

interface LoadStatusBadgeProps {
    status: LoadStatus;
    className?: string;
    variant?: "default" | "dot-label"; // Design has multiple variants, implementing dot-label as main for list
}

export function LoadStatusBadge({ status, className, variant = "default" }: LoadStatusBadgeProps) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG[LoadStatus.PLANNING];
    const Icon = config.icon;

    if (variant === "dot-label") {
        return (
            <div className={cn("flex items-center gap-2 text-sm font-medium", className)}>
                <div className={cn("h-2 w-2 rounded-full", config.dotColor)} />
                <span className="text-foreground">{config.label}</span>
            </div>
        )
    }

    return (
        <Badge
            variant="outline"
            className={cn(
                "gap-1.5 px-2 py-0.5 text-xs font-semibold border-0",
                config.bgColor,
                config.textColor,
                className
            )}
        >
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
}

// Configuration map based on design system
const STATUS_CONFIG: Record<LoadStatus, { label: string; icon: LucideIcon; bgColor: string; textColor: string; dotColor: string }> = {
    [LoadStatus.PLANNING]: {
        label: "Planning",
        icon: PenLine,
        bgColor: "bg-slate-100",
        textColor: "text-slate-700",
        dotColor: "bg-slate-500"
    },
    [LoadStatus.PENDING]: {
        label: "Pending",
        icon: Clock,
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
        dotColor: "bg-gray-500"
    },
    [LoadStatus.TENDERED]: {
        label: "Tendered",
        icon: SendHorizonal,
        bgColor: "bg-violet-100",
        textColor: "text-violet-700",
        dotColor: "bg-violet-500"
    },
    [LoadStatus.ACCEPTED]: {
        label: "Accepted",
        icon: ThumbsUp,
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
        dotColor: "bg-blue-500"
    },
    [LoadStatus.DISPATCHED]: {
        label: "Dispatched",
        icon: Send,
        bgColor: "bg-indigo-100",
        textColor: "text-indigo-700",
        dotColor: "bg-indigo-500"
    },
    [LoadStatus.AT_PICKUP]: {
        label: "At Pickup",
        icon: MapPin,
        bgColor: "bg-amber-100",
        textColor: "text-amber-800",
        dotColor: "bg-amber-600"
    },
    [LoadStatus.PICKED_UP]: {
        label: "Picked Up",
        icon: PackageOpen,
        bgColor: "bg-cyan-100",
        textColor: "text-cyan-800",
        dotColor: "bg-cyan-600"
    },
    [LoadStatus.IN_TRANSIT]: {
        label: "In Transit",
        icon: Truck,
        bgColor: "bg-sky-100",
        textColor: "text-sky-800",
        dotColor: "bg-sky-600"
    },
    [LoadStatus.AT_DELIVERY]: {
        label: "At Delivery",
        icon: MapPinCheck,
        bgColor: "bg-teal-100",
        textColor: "text-teal-800",
        dotColor: "bg-teal-600"
    },
    [LoadStatus.DELIVERED]: {
        label: "Delivered",
        icon: PackageCheck,
        bgColor: "bg-lime-100",
        textColor: "text-lime-800",
        dotColor: "bg-lime-600"
    },
    [LoadStatus.COMPLETED]: {
        label: "Completed",
        icon: CircleCheckBig,
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-800",
        dotColor: "bg-emerald-600"
    },
    [LoadStatus.CANCELLED]: {
        label: "Cancelled",
        icon: XCircle,
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        dotColor: "bg-red-600"
    },
};

"use client";

import { useOrder } from "@/lib/hooks/tms/use-orders";
import { DetailPage, DetailTab } from "@/components/patterns/detail-page";
import { OrderDetailOverview } from "@/components/tms/orders/order-detail-overview";
import { OrderStopsTab } from "@/components/tms/orders/order-stops-tab";
import { OrderLoadsTab } from "@/components/tms/orders/order-loads-tab";
import { OrderItemsTab } from "@/components/tms/orders/order-items-tab";
import {
    LayoutDashboard,
    MapPin,
    Truck,
    Package,
    History,
    FileText,
    MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/tms/primitives/status-badge";
import { STATUS_INTENTS, STATUS_LABELS } from "@/components/tms/orders/order-columns";
import Link from "next/link";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
    const { data: order, isLoading, error, refetch } = useOrder(params.id);

    // --- Actions Menu ---
    const actions = (
        <>
            <Button variant="outline" size="sm" asChild>
                <Link href={`/operations/orders/${params.id}/edit`}>Edit Order</Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled>Duplicate Order</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" disabled>Cancel Order</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );

    // --- Tabs Configuration ---
    const tabs: DetailTab[] = [
        {
            value: "overview",
            label: "Overview",
            icon: LayoutDashboard,
            content: order ? <OrderDetailOverview order={order} /> : null
        },
        {
            value: "stops",
            label: `Stops (${order?.stops.length || 0})`,
            icon: MapPin,
            content: order ? <OrderStopsTab order={order} /> : null
        },
        {
            value: "loads",
            label: `Loads (${order?.loads.length || 0})`,
            icon: Truck,
            content: order ? <OrderLoadsTab order={order} /> : null
        },
        {
            value: "items",
            label: `Items (${order?.items.length || 0})`,
            icon: Package,
            content: order ? <OrderItemsTab order={order} /> : null
        },
        {
            value: "documents",
            label: "Documents",
            icon: FileText,
            content: <div className="p-8 text-center text-muted-foreground">Document management coming soon in Phase 3.</div>
        },
        {
            value: "history",
            label: "Timeline",
            icon: History,
            content: <div className="p-8 text-center text-muted-foreground">Order timeline coming soon in Phase 3.</div>
        },
    ];

    return (
        <DetailPage
            title={order?.orderNumber || "Order Details"}
            subtitle={order?.customerReference && `Ref: ${order.customerReference}`}
            tags={order && (
                <StatusBadge intent={STATUS_INTENTS[order.status]} withDot>
                    {STATUS_LABELS[order.status]}
                </StatusBadge>
            )}
            actions={actions}
            backLink="/operations/orders"
            backLabel="Back to Orders"
            breadcrumb={<span>Operations / Orders / {order?.orderNumber || "..."}</span>}
            tabs={tabs}
            isLoading={isLoading}
            error={error as Error}
            onRetry={refetch}
        />
    );
}

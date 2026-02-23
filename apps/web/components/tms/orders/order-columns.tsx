"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Order, OrderStatus } from "@/types/orders";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, Truck, Ban, Building2 } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/tms/primitives/status-badge";
import { Intent } from "@/lib/design-tokens";
import { Badge } from "@/components/ui/badge";

// --- Constants ---

export const STATUS_INTENTS: Record<OrderStatus, Intent> = {
    PENDING: "info",
    QUOTED: "info",
    BOOKED: "success",
    DISPATCHED: "success",
    IN_TRANSIT: "warning",
    DELIVERED: "success",
    INVOICED: "success",
    COMPLETED: "success",
    CANCELLED: "danger",
    ON_HOLD: "warning",
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING: "Pending",
    QUOTED: "Quoted",
    BOOKED: "Booked",
    DISPATCHED: "Dispatched",
    IN_TRANSIT: "In Transit",
    DELIVERED: "Delivered",
    INVOICED: "Invoiced",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    ON_HOLD: "On Hold",
};

const EQUIPMENT_LABELS: Record<string, string> = {
    DRY_VAN: "Dry Van",
    REEFER: "Reefer",
    FLATBED: "Flatbed",
    STEP_DECK: "Step Deck",
    POWER_ONLY: "Power Only",
    HOTSHOT: "Hotshot",
    CONTAINER: "Container",
    OTHER: "Other",
};

// --- Helpers ---

const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
};

const formatCurrency = (amount?: number) => {
    if (amount == null) return "-";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const timeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
};

// --- Columns ---

interface OrderColumnsProps {
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: OrderStatus) => void;
}

export const getOrderColumns = ({
    onDelete: _onDelete,
    onStatusChange,
}: OrderColumnsProps): ColumnDef<Order>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                onClick={(e) => e.stopPropagation()}
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
    },
    {
        accessorKey: "orderNumber",
        header: "Order #",
        cell: ({ row }) => {
            const order = row.original;
            return (
                <div className="flex flex-col">
                    <Link
                        href={`/operations/orders/${order.id}`}
                        className="font-mono text-sm font-medium hover:underline text-primary"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {order.orderNumber}
                    </Link>
                    {order.customerReference && (
                        <span
                            className="text-xs text-muted-foreground truncate max-w-[140px]"
                            title={order.customerReference}
                        >
                            Ref: {order.customerReference}
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <StatusBadge
                    intent={STATUS_INTENTS[status]}
                    withDot
                    size="sm"
                >
                    {STATUS_LABELS[status]}
                </StatusBadge>
            );
        },
        size: 130,
    },
    {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => {
            const order = row.original;
            const name = order.customer?.name;
            return (
                <div className="flex items-center gap-2 max-w-[180px]">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span
                        className="text-sm font-medium truncate"
                        title={name || order.customerId}
                    >
                        {name || "—"}
                    </span>
                </div>
            );
        },
    },
    {
        id: "route",
        header: "Route",
        cell: ({ row }) => {
            const stops = row.original.stops;
            const firstStop = stops.find((s) => s.stopSequence === 1) ?? stops[0];
            const lastStop =
                stops.length > 1
                    ? [...stops].sort(
                          (a, b) => b.stopSequence - a.stopSequence
                      )[0]
                    : null;

            if (!firstStop)
                return (
                    <span className="text-sm text-muted-foreground">
                        No stops
                    </span>
                );

            return (
                <div className="flex flex-col text-sm">
                    <div className="flex items-center gap-1.5">
                        <span className="font-medium">
                            {firstStop.city}, {firstStop.state}
                        </span>
                        {lastStop && (
                            <>
                                <span className="text-muted-foreground">→</span>
                                <span className="font-medium">
                                    {lastStop.city}, {lastStop.state}
                                </span>
                            </>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {formatDate(firstStop.appointmentDate)}
                        {lastStop?.appointmentDate &&
                            ` — ${formatDate(lastStop.appointmentDate)}`}
                    </span>
                </div>
            );
        },
        size: 220,
    },
    {
        id: "equipment",
        header: "Equipment",
        cell: ({ row }) => {
            const type = row.original.equipmentType;
            if (!type) return <span className="text-muted-foreground">—</span>;
            return (
                <div className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">
                        {EQUIPMENT_LABELS[type] || type}
                    </span>
                </div>
            );
        },
        size: 120,
    },
    {
        id: "rate",
        header: () => <div className="text-right">Rate</div>,
        cell: ({ row }) => {
            const rate = row.original.totalCharges ?? row.original.customerRate;
            return (
                <div className="text-right text-sm font-medium tabular-nums">
                    {formatCurrency(rate)}
                </div>
            );
        },
        size: 100,
    },
    {
        id: "loads",
        header: () => <div className="text-center">Loads</div>,
        cell: ({ row }) => {
            const count =
                row.original._count?.loads ?? row.original.loads.length;
            return (
                <div className="text-center">
                    {count > 0 ? (
                        <Badge variant="secondary" className="text-xs font-medium">
                            {count}
                        </Badge>
                    ) : (
                        <span className="text-muted-foreground text-sm">0</span>
                    )}
                </div>
            );
        },
        size: 70,
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
            <span
                className="text-sm text-muted-foreground"
                title={new Date(row.original.createdAt).toLocaleString()}
            >
                {timeAgo(row.original.createdAt)}
            </span>
        ),
        size: 90,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const order = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/operations/orders/${order.id}`}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {order.status !== OrderStatus.CANCELLED && (
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStatusChange(
                                        order.id,
                                        OrderStatus.CANCELLED
                                    );
                                }}
                                className="text-destructive"
                            >
                                <Ban className="mr-2 h-4 w-4" />
                                Cancel Order
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
        size: 50,
    },
];

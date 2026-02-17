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
import { MoreHorizontal, FileText } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/tms/primitives/status-badge";
import { Intent } from "@/lib/design-tokens";

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
    PENDING: 'Pending',
    QUOTED: 'Quoted',
    BOOKED: 'Booked',
    DISPATCHED: 'Dispatched',
    IN_TRANSIT: 'In Transit',
    DELIVERED: 'Delivered',
    INVOICED: 'Invoiced',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    ON_HOLD: 'On Hold',
};

// --- Helpers ---

const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
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
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
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
                            className="font-medium hover:underline text-primary"
                        >
                            {order.orderNumber}
                        </Link>
                        {order.customerReference && (
                            <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={order.customerReference}>
                                Ref: {order.customerReference}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            id: "customer", // customerId is just an ID, ideally we'd have company name from a join or separate fetch
            header: "Customer",
            cell: ({ row }) => {
                const order = row.original;
                // In a real app, customer name would be populated via include relations
                // For now, we might display ID or a placeholder if name isn't available
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Customer {order.customerId.slice(0, 8)}...</span>
                    </div>
                );
            },
        },
        {
            id: "origin",
            header: "Origin",
            cell: ({ row }) => {
                const firstStop = row.original.stops.find(s => s.stopSequence === 1);
                if (!firstStop) return <span className="text-muted-foreground">-</span>;
                return (
                    <div className="flex flex-col text-sm">
                        <span className="font-medium">{firstStop.city}, {firstStop.state}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(firstStop.appointmentDate)}</span>
                    </div>
                );
            },
        },
        {
            id: "destination",
            header: "Destination",
            cell: ({ row }) => {
                // Last stop is destination
                const lastStop = [...row.original.stops].sort((a, b) => b.stopSequence - a.stopSequence)[0];
                if (!lastStop || lastStop.stopSequence === 1) return <span className="text-muted-foreground">-</span>;
                return (
                    <div className="flex flex-col text-sm">
                        <span className="font-medium">{lastStop.city}, {lastStop.state}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(lastStop.appointmentDate)}</span>
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
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const order = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
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
                            <DropdownMenuItem onClick={() => onStatusChange(order.id, OrderStatus.CANCELLED)} className="text-destructive">
                                Cancel Order
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

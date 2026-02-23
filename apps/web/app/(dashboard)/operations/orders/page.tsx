"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ListPage } from "@/components/patterns/list-page";
import { getOrderColumns } from "@/components/tms/orders/order-columns";
import { OrderFilters } from "@/components/tms/orders/order-filters";
import { useOrders, useUpdateOrder } from "@/lib/hooks/tms/use-orders";
import { OrderStatus, Order } from "@/types/orders";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Package, Clock, Truck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

function StatsCard({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}
            >
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-2xl font-semibold tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

export default function OrdersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const updateOrder = useUpdateOrder();

    // Parse URL params
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as OrderStatus) || undefined;
    const fromDate = searchParams.get("fromDate") || undefined;
    const toDate = searchParams.get("toDate") || undefined;
    const customerId = searchParams.get("customerId") || undefined;

    // Fetch data
    const { data, isLoading, error, refetch } = useOrders({
        page,
        limit,
        search,
        status,
        fromDate,
        toDate,
        customerId,
    });

    // Row selection state
    const [rowSelection, setRowSelection] = useState({});

    // Compute stats from current data
    const stats = useMemo(() => {
        const orders = data?.data || [];
        return {
            total: data?.pagination?.total || 0,
            pending: orders.filter((o) => o.status === OrderStatus.PENDING).length,
            inTransit: orders.filter((o) => o.status === OrderStatus.IN_TRANSIT).length,
            delivered: orders.filter((o) => o.status === OrderStatus.DELIVERED).length,
        };
    }, [data]);

    // Handlers
    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`?${params.toString()}`);
    };

    const handleRowClick = (row: Order) => {
        router.push(`/operations/orders/${row.id}`);
    };

    const handleDelete = async (_id: string) => {
        toast.info("Delete not available yet");
    };

    const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await updateOrder.mutateAsync({ id, formData: {} as any, status: newStatus as any });
            toast.success(`Order status changed to ${newStatus}`);
        } catch {
            toast.error("Failed to update order status");
        }
    };

    return (
        <ListPage
            title="Orders"
            description="Manage customer orders and shipments."
            headerActions={
                <Button asChild>
                    <Link href="/operations/orders/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Order
                    </Link>
                </Button>
            }
            stats={
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatsCard
                        label="Total Orders"
                        value={stats.total}
                        icon={Package}
                        color="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                    />
                    <StatsCard
                        label="Pending"
                        value={stats.pending}
                        icon={Clock}
                        color="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                    />
                    <StatsCard
                        label="In Transit"
                        value={stats.inTransit}
                        icon={Truck}
                        color="bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
                    />
                    <StatsCard
                        label="Delivered"
                        value={stats.delivered}
                        icon={CheckCircle2}
                        color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                    />
                </div>
            }
            filters={<OrderFilters />}
            data={data?.data || []}
            columns={getOrderColumns({
                onDelete: handleDelete,
                onStatusChange: handleStatusChange,
            })}
            total={data?.pagination?.total || 0}
            page={page}
            pageSize={limit}
            pageCount={data?.pagination?.pages || 1}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            error={error ? (error as Error) : null}
            onRetry={refetch}
            onRowClick={handleRowClick}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            entityLabel="orders"
        />
    );
}

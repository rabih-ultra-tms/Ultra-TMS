"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ListPage } from "@/components/patterns/list-page";
import { getOrderColumns } from "@/components/tms/orders/order-columns";
import { OrderFilters } from "@/components/tms/orders/order-filters";
import { useOrders } from "@/lib/hooks/tms/use-orders";
import { OrderStatus, Order } from "@/types/orders";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function OrdersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

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
        customerId
    });

    // Row selection state
    const [rowSelection, setRowSelection] = useState({});

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
        if (!confirm("Are you sure you want to delete this order?")) return;
        // In a real app, use a proper mutation and dialog
        alert("Delete not implemented yet");
    };

    const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
        // In a real app, use a proper mutation
        console.log("Change status", id, newStatus);
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
            filters={<OrderFilters />}
            data={data?.data || []}
            columns={getOrderColumns({
                onDelete: handleDelete,
                onStatusChange: handleStatusChange
            })}
            total={data?.pagination.total || 0}
            page={page}
            pageSize={limit}
            pageCount={data?.pagination.pages || 1}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            error={error ? (error as Error) : null}
            onRetry={refetch}
            onRowClick={handleRowClick}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            entityLabel="orders"
        // Optional: add stats bar here when implemented
        />
    );
}

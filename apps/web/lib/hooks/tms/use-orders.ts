"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { OrderListParams, OrderListResponse, Order } from "@/types/orders";

// ... existing useOrders ...

export function useOrder(id: string) {
    return useQuery<Order>({
        queryKey: ['order', id],
        queryFn: async () => {
            const response = await apiClient.get<Order>(`/api/v1/orders/${id}`);
            return response;
        },
        enabled: !!id,
    });
}

export function useOrders(params: OrderListParams) {
    return useQuery<OrderListResponse>({
        queryKey: ['orders', params],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params.page) searchParams.set('page', params.page.toString());
            if (params.limit) searchParams.set('limit', params.limit.toString());
            if (params.search) searchParams.set('search', params.search);
            if (params.status && params.status !== 'all') searchParams.set('status', params.status);
            if (params.fromDate) searchParams.set('fromDate', params.fromDate);
            if (params.toDate) searchParams.set('toDate', params.toDate);

            const response = await apiClient.get<OrderListResponse>(`/api/v1/orders?${searchParams.toString()}`);
            return response;
        },
        placeholderData: (previousData) => previousData,
    });
}

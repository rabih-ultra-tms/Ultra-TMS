"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { OrderListParams, OrderListResponse, Order, OrderDetailResponse, TimelineEvent, OrderDocument } from "@/types/orders";
import type { OrderLoad } from "@/types/orders";

export function useOrder(id: string) {
    return useQuery<OrderDetailResponse>({
        queryKey: ['order', id],
        queryFn: async () => {
            const response = await apiClient.get<OrderDetailResponse>(`/orders/${id}`);
            return response;
        },
        enabled: !!id,
        staleTime: 30000,
        retry: 2,
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

            const response = await apiClient.get<OrderListResponse>(`/orders?${searchParams.toString()}`);
            return response;
        },
        placeholderData: (previousData) => previousData,
    });
}

export function useOrderLoads(orderId: string) {
    return useQuery<OrderLoad[]>({
        queryKey: ['order-loads', orderId],
        queryFn: async () => {
            const response = await apiClient.get<OrderLoad[]>(`/orders/${orderId}/loads`);
            return response;
        },
        enabled: !!orderId,
        staleTime: 30000,
    });
}

export function useOrderTimeline(orderId: string) {
    return useQuery<TimelineEvent[]>({
        queryKey: ['order-timeline', orderId],
        queryFn: async () => {
            const response = await apiClient.get<TimelineEvent[]>(`/orders/${orderId}/timeline`);
            return response;
        },
        enabled: !!orderId,
        staleTime: 60000,
    });
}

export function useOrderDocuments(orderId: string) {
    return useQuery<OrderDocument[]>({
        queryKey: ['order-documents', orderId],
        queryFn: async () => {
            const response = await apiClient.get<OrderDocument[]>(`/orders/${orderId}/documents`);
            return response;
        },
        enabled: !!orderId,
        staleTime: 60000,
    });
}

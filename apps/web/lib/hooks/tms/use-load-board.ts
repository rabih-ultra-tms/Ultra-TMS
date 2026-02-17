"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { LoadBoardFilters, LoadBoardListResponse, LoadBoardStats, LoadPost } from "@/types/load-board";

function unwrap<T>(response: unknown): T {
    const body = response as Record<string, unknown>;
    return (body.data ?? response) as T;
}

export function useLoadPosts(filters: LoadBoardFilters) {
    return useQuery<LoadBoardListResponse>({
        queryKey: ['load-posts', filters],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (filters.page) searchParams.set('page', filters.page.toString());
            if (filters.limit) searchParams.set('limit', filters.limit.toString());
            if (filters.search) searchParams.set('search', filters.search);
            if (filters.status && filters.status !== 'all') searchParams.set('status', filters.status);
            if (filters.originState) searchParams.set('originState', filters.originState);
            if (filters.destState) searchParams.set('destState', filters.destState);
            if (filters.pickupDateFrom) searchParams.set('pickupDateFrom', filters.pickupDateFrom);
            if (filters.pickupDateTo) searchParams.set('pickupDateTo', filters.pickupDateTo);
            if (filters.minRate) searchParams.set('minRate', filters.minRate.toString());
            if (filters.maxRate) searchParams.set('maxRate', filters.maxRate.toString());
            if (filters.equipmentType?.length) {
                searchParams.set('equipmentType', filters.equipmentType.join(','));
            }

            const response = await apiClient.get(
                `/load-board/posts?${searchParams.toString()}`
            );
            return unwrap<LoadBoardListResponse>(response);
        },
        placeholderData: (previousData) => previousData,
    });
}

export function useLoadPost(id: string) {
    return useQuery<LoadPost>({
        queryKey: ['load-post', id],
        queryFn: async () => {
            const response = await apiClient.get(`/load-board/posts/${id}`);
            return unwrap<LoadPost>(response);
        },
        enabled: !!id,
        staleTime: 30000,
    });
}

export function useLoadBoardStats() {
    return useQuery<LoadBoardStats>({
        queryKey: ['load-board-stats'],
        queryFn: async () => {
            const response = await apiClient.get('/load-board/stats');
            return unwrap<LoadBoardStats>(response);
        },
        staleTime: 60000,
    });
}

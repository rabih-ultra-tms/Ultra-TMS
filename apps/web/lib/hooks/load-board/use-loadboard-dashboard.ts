"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { LoadBoardDashboardStats, RecentPosting } from "@/types/load-board";

function unwrap<T>(response: unknown): T {
    const body = response as Record<string, unknown>;
    return (body.data ?? response) as T;
}

export const dashboardKeys = {
    all: ["load-board-dashboard"] as const,
    stats: () => [...dashboardKeys.all, "stats"] as const,
    recent: () => [...dashboardKeys.all, "recent"] as const,
};

export function useLoadBoardDashboardStats() {
    return useQuery<LoadBoardDashboardStats>({
        queryKey: dashboardKeys.stats(),
        queryFn: async () => {
            const response = await apiClient.get("/load-board/analytics/posts");
            return unwrap<LoadBoardDashboardStats>(response);
        },
        staleTime: 60_000,
    });
}

export function useRecentPostings(limit = 10) {
    return useQuery<RecentPosting[]>({
        queryKey: [...dashboardKeys.recent(), limit],
        queryFn: async () => {
            const response = await apiClient.get(
                `/load-postings?limit=${limit}&status=ACTIVE`
            );
            const body = response as Record<string, unknown>;
            const data = (body.data ?? []) as RecentPosting[];
            return data;
        },
        staleTime: 30_000,
    });
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import type {
    LoadPosting,
    LoadPostingListResponse,
    LoadPostingSearchFilters,
    CreateLoadPostingPayload,
    LoadBid,
    LoadBidListResponse,
    CarrierMatch,
} from "@/types/load-board";

function unwrap<T>(response: unknown): T {
    const body = response as Record<string, unknown>;
    return (body.data ?? response) as T;
}

// --- Query Keys ---

export const postingKeys = {
    all: ["load-postings"] as const,
    lists: () => [...postingKeys.all, "list"] as const,
    list: (params: LoadPostingSearchFilters) =>
        [...postingKeys.lists(), params] as const,
    details: () => [...postingKeys.all, "detail"] as const,
    detail: (id: string) => [...postingKeys.details(), id] as const,
    bids: (postingId: string) =>
        [...postingKeys.all, "bids", postingId] as const,
    matches: (postingId: string) =>
        [...postingKeys.all, "matches", postingId] as const,
};

// --- Posting Queries ---

export function usePostings(filters: LoadPostingSearchFilters) {
    return useQuery<LoadPostingListResponse>({
        queryKey: postingKeys.list(filters),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.originCity)
                params.set("originCity", filters.originCity);
            if (filters.originState)
                params.set("originState", filters.originState);
            if (filters.originRadius)
                params.set("radiusMiles", filters.originRadius.toString());
            if (filters.destCity) params.set("destCity", filters.destCity);
            if (filters.destState) params.set("destState", filters.destState);
            if (filters.equipmentType)
                params.set("equipmentType", filters.equipmentType);
            if (filters.pickupDateFrom)
                params.set("pickupDateFrom", filters.pickupDateFrom);
            if (filters.pickupDateTo)
                params.set("pickupDateTo", filters.pickupDateTo);
            if (filters.minRate)
                params.set("minRate", filters.minRate.toString());
            if (filters.maxRate)
                params.set("maxRate", filters.maxRate.toString());
            if (filters.status) params.set("status", filters.status);
            if (filters.page) params.set("page", filters.page.toString());
            if (filters.limit) params.set("limit", filters.limit.toString());

            const response = await apiClient.get(
                `/load-postings?${params.toString()}`
            );
            return unwrap<LoadPostingListResponse>(response);
        },
        placeholderData: (prev) => prev,
    });
}

export function useSearchPostings(filters: LoadPostingSearchFilters) {
    return useQuery<LoadPostingListResponse>({
        queryKey: ["load-postings-search", filters],
        queryFn: async () => {
            const response = await apiClient.post(
                "/load-postings/search",
                filters
            );
            return unwrap<LoadPostingListResponse>(response);
        },
        placeholderData: (prev) => prev,
        enabled:
            !!(filters.originCity || filters.originState || filters.destCity || filters.destState || filters.equipmentType),
    });
}

export function usePosting(id: string) {
    return useQuery<LoadPosting>({
        queryKey: postingKeys.detail(id),
        queryFn: async () => {
            const response = await apiClient.get(`/load-postings/${id}`);
            return unwrap<LoadPosting>(response);
        },
        enabled: !!id,
        staleTime: 15_000,
    });
}

// --- Posting Mutations ---

export function useCreatePosting() {
    const queryClient = useQueryClient();
    return useMutation<LoadPosting, Error, CreateLoadPostingPayload>({
        mutationFn: async (payload) => {
            const response = await apiClient.post("/load-postings", payload);
            return unwrap<LoadPosting>(response);
        },
        onSuccess: () => {
            toast.success("Posting created successfully");
            void queryClient.invalidateQueries({
                queryKey: postingKeys.all,
            });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create posting");
        },
    });
}

export function useUpdatePosting(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: Partial<CreateLoadPostingPayload>) => {
            const response = await apiClient.put(
                `/load-postings/${id}`,
                payload
            );
            return unwrap<LoadPosting>(response);
        },
        onSuccess: () => {
            toast.success("Posting updated");
            void queryClient.invalidateQueries({
                queryKey: postingKeys.detail(id),
            });
            void queryClient.invalidateQueries({
                queryKey: postingKeys.lists(),
            });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update posting");
        },
    });
}

export function useCancelPosting(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const response = await apiClient.put(`/load-postings/${id}`, {
                status: "CANCELLED",
            });
            return unwrap<LoadPosting>(response);
        },
        onSuccess: () => {
            toast.success("Posting cancelled");
            void queryClient.invalidateQueries({
                queryKey: postingKeys.all,
            });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to cancel posting");
        },
    });
}

// --- Bid Queries ---

export function useBids(postingId: string) {
    return useQuery<LoadBidListResponse>({
        queryKey: postingKeys.bids(postingId),
        queryFn: async () => {
            const response = await apiClient.get(
                `/load-bids/posting/${postingId}`
            );
            return unwrap<LoadBidListResponse>(response);
        },
        enabled: !!postingId,
        staleTime: 10_000,
    });
}

// --- Bid Mutations ---

export function useAcceptBid(postingId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (bidId: string) => {
            const response = await apiClient.post(
                `/load-bids/${bidId}/accept`,
                {}
            );
            return unwrap<LoadBid>(response);
        },
        onSuccess: () => {
            toast.success("Bid accepted — posting is now COVERED");
            void queryClient.invalidateQueries({
                queryKey: postingKeys.bids(postingId),
            });
            void queryClient.invalidateQueries({
                queryKey: postingKeys.detail(postingId),
            });
            void queryClient.invalidateQueries({
                queryKey: postingKeys.lists(),
            });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to accept bid");
        },
    });
}

export function useRejectBid(postingId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            bidId,
            reason,
        }: {
            bidId: string;
            reason: string;
        }) => {
            const response = await apiClient.post(
                `/load-bids/${bidId}/reject`,
                { rejectionReason: reason }
            );
            return unwrap<LoadBid>(response);
        },
        onSuccess: () => {
            toast.success("Bid rejected");
            void queryClient.invalidateQueries({
                queryKey: postingKeys.bids(postingId),
            });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to reject bid");
        },
    });
}

export function useCounterBid(postingId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            bidId,
            counterAmount,
            counterNotes,
        }: {
            bidId: string;
            counterAmount: number;
            counterNotes?: string;
        }) => {
            const response = await apiClient.post(
                `/load-bids/${bidId}/counter`,
                { counterAmount, counterNotes }
            );
            return unwrap<LoadBid>(response);
        },
        onSuccess: () => {
            toast.success("Counter-offer sent");
            void queryClient.invalidateQueries({
                queryKey: postingKeys.bids(postingId),
            });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to send counter-offer");
        },
    });
}

// --- Carrier Match Queries ---

export function useCarrierMatches(postingId: string) {
    return useQuery<CarrierMatch[]>({
        queryKey: postingKeys.matches(postingId),
        queryFn: async () => {
            const response = await apiClient.get(
                `/load-bids/posting/${postingId}/matches`
            );
            const body = response as Record<string, unknown>;
            return (body.data ?? []) as CarrierMatch[];
        },
        enabled: !!postingId,
        staleTime: 60_000,
    });
}

export function useTenderToCarrier(postingId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (carrierId: string) => {
            const response = await apiClient.post("/load-tenders", {
                postingId,
                carrierId,
                tenderType: "SPECIFIC",
            });
            return unwrap<unknown>(response);
        },
        onSuccess: () => {
            toast.success("Tender sent to carrier");
            void queryClient.invalidateQueries({
                queryKey: postingKeys.matches(postingId),
            });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to tender to carrier");
        },
    });
}

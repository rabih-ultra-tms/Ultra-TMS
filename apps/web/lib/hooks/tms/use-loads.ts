"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { LoadListParams, LoadListResponse, Load, LoadDetailResponse } from "@/types/loads";
import { OperationsCarrier } from "@/types/carriers";
import { OrderDetailResponse } from "@/types/orders";

// Helper to unwrap { data: T } envelope from apiClient responses
function unwrap<T>(response: unknown): T {
    const body = response as Record<string, unknown>;
    return (body.data ?? response) as T;
}

export function useLoads(params: LoadListParams) {
    return useQuery<LoadListResponse>({
        queryKey: ['loads', params],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params.page) searchParams.set('page', params.page.toString());
            if (params.limit) searchParams.set('limit', params.limit.toString());
            if (params.search) searchParams.set('search', params.search);
            if (params.status && params.status !== 'all') {
                const statusVal = Array.isArray(params.status) ? params.status.join(',') : params.status;
                searchParams.set('status', statusVal);
            }
            if (params.carrierId) searchParams.set('carrierId', params.carrierId);
            if (params.equipmentType) searchParams.set('equipmentType', params.equipmentType);
            if (params.fromDate) searchParams.set('fromDate', params.fromDate);
            if (params.toDate) searchParams.set('toDate', params.toDate);

            const response = await apiClient.get(`/loads?${searchParams.toString()}`);
            return unwrap<LoadListResponse>(response);
        },
        placeholderData: (previousData) => previousData,
    });
}

export function useLoad(id: string) {
    return useQuery<LoadDetailResponse>({
        queryKey: ['load', id],
        queryFn: async () => {
            const response = await apiClient.get(`/loads/${id}`);
            return unwrap<LoadDetailResponse>(response);
        },
        enabled: !!id,
        staleTime: 30000,
        retry: 2,
    });
}

// STUB: No backend endpoint for load stats — disabled until backend adds GET /loads/stats
export function useLoadStats() {
    return useQuery({
        queryKey: ['load-stats'],
        queryFn: async () => {
            return {
                total: 0,
                unassigned: 0,
                inTransit: 0,
                deliveredToday: 0,
                avgMargin: 0,
                totalActive: 0
            };
        },
        enabled: false, // No backend endpoint exists yet
    });
}

// STUB: No backend endpoint for load timeline — disabled until backend adds GET /loads/:id/timeline
export function useLoadTimeline(id: string) {
    return useQuery({
        queryKey: ['load-timeline', id],
        queryFn: async () => {
            return [] as Array<{ id: string; type: string; title: string; description: string; date: string; user: string }>;
        },
        enabled: false, // No backend endpoint exists yet
    });
}

// --- Create Load ---

export interface CreateLoadInput {
    orderId?: string;
    equipmentType: string;
    commodity?: string;
    weight?: number;
    pieces?: number;
    pallets?: number;
    isHazmat?: boolean;
    hazmatClass?: string;
    temperatureMin?: number;
    temperatureMax?: number;
    specialHandling?: string[];
    stops: Array<{
        stopType: 'PICKUP' | 'DELIVERY';
        stopSequence: number;
        facilityName?: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        postalCode: string;
        country?: string;
        contactName?: string;
        contactPhone?: string;
        contactEmail?: string;
        appointmentRequired?: boolean;
        appointmentDate?: string;
        appointmentTimeStart?: string;
        appointmentTimeEnd?: string;
        specialInstructions?: string;
    }>;
    carrierId?: string;
    driverName?: string;
    driverPhone?: string;
    truckNumber?: string;
    trailerNumber?: string;
    carrierRate?: number;
    accessorials?: Array<{ type: string; amount: number }>;
    fuelSurcharge?: number;
    carrierPaymentTerms?: string;
    dispatchNotes?: string;
}

export function useCreateLoad() {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateLoadInput) => {
            const response = await apiClient.post('/loads', data);
            return unwrap<Load>(response);
        },
        onSuccess: (load) => {
            queryClient.invalidateQueries({ queryKey: ['loads'] });
            if (load.order?.id) {
                queryClient.invalidateQueries({ queryKey: ['order', load.order.id] });
            }
            toast.success('Load created successfully', {
                description: `Load ${load.loadNumber} has been created`,
            });
            router.push(`/operations/loads/${load.id}`);
        },
        onError: (error: Error) => {
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || error?.message || 'Failed to create load';
            toast.error('Error creating load', {
                description: errorMessage,
            });
        },
    });
}

// --- Update Load ---

export type UpdateLoadInput = CreateLoadInput;

export function useUpdateLoad(loadId: string) {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateLoadInput) => {
            // Backend uses @Put(':id') for load updates
            const response = await apiClient.put(`/loads/${loadId}`, data);
            return unwrap<Load>(response);
        },
        onSuccess: (load) => {
            queryClient.invalidateQueries({ queryKey: ['loads'] });
            queryClient.invalidateQueries({ queryKey: ['load', loadId] });
            if (load.order?.id) {
                queryClient.invalidateQueries({ queryKey: ['order', load.order.id] });
            }
            toast.success('Load updated successfully', {
                description: `Load ${load.loadNumber} has been updated`,
            });
            router.push(`/operations/loads/${load.id}`);
        },
        onError: (error: Error) => {
            const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || error?.message || 'Failed to update load';
            toast.error('Error updating load', {
                description: errorMessage,
            });
        },
    });
}

// --- Carrier Search ---

export interface CarrierSearchParams {
    search?: string;
    equipmentType?: string;
    originState?: string;
    destState?: string;
    tier?: string;
    compliance?: 'COMPLIANT' | 'WARNING' | 'ALL';
    sort?: 'score' | 'rate' | 'recent' | 'preferred';
    page?: number;
    limit?: number;
}

export interface CarrierWithScore extends OperationsCarrier {
    scorecard?: {
        score: number;
        onTimePercentage: number;
        claimsRate: number;
    };
    laneRate?: number;
    lastUsedDate?: string;
    loadsCompleted?: number;
    tier?: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
}

export function useCarriers(params: CarrierSearchParams) {
    return useQuery<{ data: CarrierWithScore[]; total: number }>({
        queryKey: ['carriers', 'search', params],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params.search) searchParams.set('search', params.search);
            if (params.equipmentType) searchParams.set('equipmentType', params.equipmentType);
            if (params.originState) searchParams.set('originState', params.originState);
            if (params.destState) searchParams.set('destState', params.destState);
            if (params.tier) searchParams.set('tier', params.tier);
            if (params.compliance) searchParams.set('compliance', params.compliance);
            if (params.sort) searchParams.set('sort', params.sort);
            if (params.page) searchParams.set('page', params.page.toString());
            if (params.limit) searchParams.set('limit', params.limit.toString());

            const response = await apiClient.get(
                `/carriers?${searchParams.toString()}`
            );
            return unwrap<{ data: CarrierWithScore[]; total: number }>(response);
        },
        staleTime: 300000, // 5 minutes
    });
}

// --- Order Detail (for pre-fill) ---

export function useOrder(orderId: string | undefined) {
    return useQuery<OrderDetailResponse>({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const response = await apiClient.get(`/orders/${orderId}`);
            return unwrap<OrderDetailResponse>(response);
        },
        enabled: !!orderId,
        staleTime: 60000,
    });
}

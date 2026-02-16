"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { LoadListParams, LoadListResponse, Load, LoadDetailResponse, CheckCall } from "@/types/loads";
import { OperationsCarrier } from "@/types/carriers";
import { OrderDetailResponse } from "@/types/orders";

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

            // Backend returns { data, total, page, limit } directly for loads
            const response = await apiClient.get<LoadListResponse>(`/loads?${searchParams.toString()}`);
            return response;
        },
        placeholderData: (previousData) => previousData,
    });
}

export function useLoad(id: string) {
    return useQuery<LoadDetailResponse>({
        queryKey: ['load', id],
        queryFn: async () => {
            const response = await apiClient.get<LoadDetailResponse>(`/loads/${id}`);
            return response;
        },
        enabled: !!id,
        staleTime: 30000,
        retry: 2,
    });
}

export function useLoadStats() {
    return useQuery({
        queryKey: ['load-stats'],
        queryFn: async () => {
            return {
                total: 847,
                unassigned: 23,
                inTransit: 234,
                deliveredToday: 56,
                avgMargin: 18.4,
                totalActive: 120
            };
        }
    });
}

// --- Mocks for Missing Endpoints ---

// useLoadDocuments removed — replaced by useDocuments("LOAD", id) in @/lib/hooks/documents/use-documents

export function useLoadTimeline(id: string) {
    return useQuery({
        queryKey: ['load-timeline', id],
        queryFn: async () => {
            // Mock timeline
            await new Promise(resolve => setTimeout(resolve, 500));
            return [
                { id: '1', type: 'status', title: 'Load Dispatched', description: 'Load dispatched to Swift Transport', date: '2025-02-10T10:30:00Z', user: 'Maria D.' },
                { id: '2', type: 'document', title: 'Rate Confirmation Signed', description: 'Carrier signed rate confirmation', date: '2025-02-10T10:15:00Z', user: 'System' },
                { id: '3', type: 'assignment', title: 'Carrier Assigned', description: 'Assigned to Swift Transport', date: '2025-02-10T09:00:00Z', user: 'Maria D.' },
                { id: '4', type: 'creation', title: 'Load Created', description: 'Load created from Order #1234', date: '2025-02-10T08:00:00Z', user: 'System' },
            ];
        },
        enabled: !!id
    });
}

export function useCheckCalls(loadId: string) {
    return useQuery<CheckCall[]>({
        queryKey: ['check-calls', loadId],
        queryFn: async () => {
            const response = await apiClient.get<CheckCall[]>(`/loads/${loadId}/check-calls`);
            return response;
        },
        enabled: !!loadId,
        staleTime: 60000,
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
            const response = await apiClient.post<Load>('/loads', data);
            return response;
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
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create load';
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
            const response = await apiClient.put<Load>(`/loads/${loadId}`, data);
            return response;
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

            const response = await apiClient.get<{ data: CarrierWithScore[]; total: number }>(
                `/carriers?${searchParams.toString()}`
            );
            return response;
        },
        staleTime: 300000, // 5 minutes
    });
}

// --- Order Detail (for pre-fill) ---

export function useOrder(orderId: string | undefined) {
    return useQuery<OrderDetailResponse>({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const response = await apiClient.get<OrderDetailResponse>(`/orders/${orderId}`);
            return response;
        },
        enabled: !!orderId,
        staleTime: 60000,
    });
}

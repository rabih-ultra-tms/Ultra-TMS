"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { LoadListParams, LoadListResponse, Load, LoadDetailResponse, LoadStatus, LoadStats } from "@/types/loads";
import { OperationsCarrier } from "@/types/carriers";
import { OrderDetailResponse } from "@/types/orders";
import { orderKeys } from "./use-orders";

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
            // API returns { success, data, pagination: { page, limit, total, totalPages } }
            // Map to LoadListResponse shape expected by page components
            const body = response as { data?: Load[]; pagination?: { total?: number; page?: number; limit?: number } };
            return {
                data: body.data ?? [],
                total: body.pagination?.total ?? 0,
                page: body.pagination?.page ?? 1,
                limit: body.pagination?.limit ?? 20,
            };
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

export function useLoadStats() {
    return useQuery({
        queryKey: ['load-stats'],
        queryFn: async () => {
            const response = await apiClient.get<{ data: LoadStats }>('/loads/stats');
            return response.data;
        },
        staleTime: 30000,
    });
}

// Wire to GET /loads/:id/check-calls — maps check-call entries to timeline events
export function useLoadTimeline(id: string) {
    return useQuery({
        queryKey: ['load-timeline', id],
        queryFn: async () => {
            const response = await apiClient.get(`/loads/${id}/check-calls?limit=50`);
            const body = response as { data?: Array<Record<string, unknown>> };
            const calls = body.data ?? [];
            return calls.map((cc): { id: string; type: string; title: string; description: string; date: string; user: string } => ({
                id: String(cc.id),
                type: 'status',
                title: cc.status ? `Status: ${String(cc.status)}` : 'Check Call',
                description: [
                    cc.city && cc.state ? `${String(cc.city)}, ${String(cc.state)}` : null,
                    cc.notes ? String(cc.notes) : null,
                ].filter(Boolean).join(' — ') || 'Location update',
                date: String(cc.createdAt ?? new Date().toISOString()),
                user: cc.createdById ? String(cc.createdById) : 'System',
            }));
        },
        enabled: !!id,
        staleTime: 30000,
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
            const payload: Record<string, unknown> = {
                ...(data.orderId ? { orderId: data.orderId } : {}),
                ...(data.carrierId ? { carrierId: data.carrierId } : {}),
                ...(data.equipmentType ? { equipmentType: data.equipmentType } : {}),
                ...(data.driverName ? { driverName: data.driverName } : {}),
                ...(data.driverPhone ? { driverPhone: data.driverPhone } : {}),
                ...(data.truckNumber ? { truckNumber: data.truckNumber } : {}),
                ...(data.trailerNumber ? { trailerNumber: data.trailerNumber } : {}),
                ...(data.carrierRate !== undefined ? { carrierRate: data.carrierRate } : {}),
                ...(data.dispatchNotes ? { dispatchNotes: data.dispatchNotes } : {}),
                // Map fuelSurcharge → fuelAdvance
                ...(data.fuelSurcharge !== undefined ? { fuelAdvance: data.fuelSurcharge } : {}),
                // Map accessorials array → accessorialCosts (sum)
                ...(data.accessorials?.length
                    ? { accessorialCosts: data.accessorials.reduce((sum, a) => sum + (a.amount || 0), 0) }
                    : {}),
            };
            const response = await apiClient.post('/loads', payload);
            return unwrap<Load>(response);
        },
        onSuccess: (load) => {
            queryClient.invalidateQueries({ queryKey: ['loads'] });
            if (load.order?.id) {
                queryClient.invalidateQueries({ queryKey: orderKeys.detail(load.order.id) });
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
            // Map form values to backend DTO fields — same shape as CreateLoadDto
            const payload: Record<string, unknown> = {
                ...(data.orderId ? { orderId: data.orderId } : {}),
                ...(data.carrierId ? { carrierId: data.carrierId } : {}),
                ...(data.equipmentType ? { equipmentType: data.equipmentType } : {}),
                ...(data.driverName ? { driverName: data.driverName } : {}),
                ...(data.driverPhone ? { driverPhone: data.driverPhone } : {}),
                ...(data.truckNumber ? { truckNumber: data.truckNumber } : {}),
                ...(data.trailerNumber ? { trailerNumber: data.trailerNumber } : {}),
                ...(data.carrierRate !== undefined ? { carrierRate: data.carrierRate } : {}),
                ...(data.dispatchNotes ? { dispatchNotes: data.dispatchNotes } : {}),
                // Map fuelSurcharge → fuelAdvance
                ...(data.fuelSurcharge !== undefined ? { fuelAdvance: data.fuelSurcharge } : {}),
                // Map accessorials array → accessorialCosts (sum)
                ...(data.accessorials?.length
                    ? { accessorialCosts: data.accessorials.reduce((sum, a) => sum + (a.amount || 0), 0) }
                    : {}),
            };
            const response = await apiClient.put(`/loads/${loadId}`, payload);
            return unwrap<Load>(response);
        },
        onSuccess: (load) => {
            queryClient.invalidateQueries({ queryKey: ['loads'] });
            queryClient.invalidateQueries({ queryKey: ['load', loadId] });
            if (load.order?.id) {
                queryClient.invalidateQueries({ queryKey: orderKeys.detail(load.order.id) });
            }
            toast.success('Load updated successfully', {
                description: `Load ${load.loadNumber} has been updated`,
            });
            router.push(`/operations/loads/${loadId}`);
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
        queryKey: orderKeys.detail(orderId ?? ''),
        queryFn: async () => {
            const response = await apiClient.get(`/orders/${orderId}`);
            return unwrap<OrderDetailResponse>(response);
        },
        enabled: !!orderId,
        staleTime: 60000,
    });
}

// --- Delete Load ---

export function useDeleteLoad() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (loadId: string) => {
            await apiClient.delete(`/loads/${loadId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loads'] });
            toast.success('Load deleted');
        },
        onError: (error: Error) => {
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || error?.message || 'Failed to delete load';
            toast.error('Error deleting load', { description: errorMessage });
        },
    });
}

// --- Bulk Update Load Status ---

export function useBulkUpdateLoadStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ loadIds, status }: { loadIds: string[]; status: LoadStatus }) => {
            const results = await Promise.allSettled(
                loadIds.map((id) => apiClient.patch(`/loads/${id}/status`, { status }))
            );
            const updated = results.filter((r) => r.status === 'fulfilled').length;
            const failed = results.filter((r) => r.status === 'rejected').length;
            return { updated, failed };
        },
        onSuccess: ({ updated, failed }) => {
            queryClient.invalidateQueries({ queryKey: ['loads'] });
            if (failed > 0) {
                toast.warning(`Updated ${updated} loads, ${failed} failed`);
            } else {
                toast.success(`${updated} load${updated !== 1 ? 's' : ''} updated`);
            }
        },
        onError: (error: Error) => {
            toast.error('Failed to update status', { description: error.message });
        },
    });
}

// --- Bulk Assign Carrier ---

export function useBulkAssignCarrier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ loadIds, carrierId }: { loadIds: string[]; carrierId: string }) => {
            const results = await Promise.allSettled(
                loadIds.map((id) => apiClient.patch(`/loads/${id}/assign`, { carrierId }))
            );
            const updated = results.filter((r) => r.status === 'fulfilled').length;
            const failed = results.filter((r) => r.status === 'rejected').length;
            return { updated, failed };
        },
        onSuccess: ({ updated, failed }) => {
            queryClient.invalidateQueries({ queryKey: ['loads'] });
            if (failed > 0) {
                toast.warning(`Assigned carrier to ${updated} loads, ${failed} failed`);
            } else {
                toast.success(`Carrier assigned to ${updated} load${updated !== 1 ? 's' : ''}`);
            }
        },
        onError: (error: Error) => {
            toast.error('Failed to assign carrier', { description: error.message });
        },
    });
}

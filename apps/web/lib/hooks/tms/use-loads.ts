"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { LoadListParams, LoadListResponse, Load, LoadDetailResponse, CheckCall } from "@/types/loads";

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

export function useLoadDocuments(id: string) {
    return useQuery({
        queryKey: ['load-documents', id],
        queryFn: async () => {
            // Mock documents
            await new Promise(resolve => setTimeout(resolve, 500));
            return [
                { id: '1', type: 'Justification', name: 'Rate Confirmation.pdf', status: 'signed', date: '2025-02-10T10:00:00Z', url: '#' },
                { id: '2', type: 'BOL', name: 'Bill of Lading.pdf', status: 'uploaded', date: '2025-02-10T08:00:00Z', url: '#' },
            ];
        },
        enabled: !!id
    });
}

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

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { OrderListParams, OrderListResponse, Order, OrderDetailResponse, TimelineEvent, OrderDocument } from "@/types/orders";
import type { OrderLoad } from "@/types/orders";
import type { OrderFormValues } from "@/components/tms/orders/order-form-schema";

// --- Query Keys ---

export const orderKeys = {
    all: ['orders'] as const,
    lists: () => [...orderKeys.all, 'list'] as const,
    list: (params: OrderListParams) => [...orderKeys.lists(), params] as const,
    details: () => [...orderKeys.all, 'detail'] as const,
    detail: (id: string) => [...orderKeys.details(), id] as const,
};

// Helper to unwrap { data: T } envelope from apiClient responses
function unwrap<T>(response: unknown): T {
    const body = response as Record<string, unknown>;
    return (body.data ?? response) as T;
}

export function useOrder(id: string) {
    return useQuery<OrderDetailResponse>({
        queryKey: ['order', id],
        queryFn: async () => {
            const response = await apiClient.get(`/orders/${id}`);
            return unwrap<OrderDetailResponse>(response);
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

            const response = await apiClient.get(`/orders?${searchParams.toString()}`);
            return unwrap<OrderListResponse>(response);
        },
        placeholderData: (previousData) => previousData,
    });
}

export function useOrderLoads(orderId: string) {
    return useQuery<OrderLoad[]>({
        queryKey: ['order-loads', orderId],
        queryFn: async () => {
            const response = await apiClient.get(`/orders/${orderId}/loads`);
            return unwrap<OrderLoad[]>(response);
        },
        enabled: !!orderId,
        staleTime: 30000,
    });
}

export function useOrderTimeline(orderId: string) {
    return useQuery<TimelineEvent[]>({
        queryKey: ['order-timeline', orderId],
        queryFn: async () => {
            const response = await apiClient.get(`/orders/${orderId}/timeline`);
            return unwrap<TimelineEvent[]>(response);
        },
        enabled: !!orderId,
        staleTime: 60000,
    });
}

export function useOrderDocuments(orderId: string) {
    return useQuery<OrderDocument[]>({
        queryKey: ['order-documents', orderId],
        queryFn: async () => {
            const response = await apiClient.get(`/orders/${orderId}/documents`);
            return unwrap<OrderDocument[]>(response);
        },
        enabled: !!orderId,
        staleTime: 60000,
    });
}

// --- Mutation Hooks ---

interface CreateOrderPayload {
    formData: OrderFormValues;
    status: 'PENDING' | 'BOOKED';
}

export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ formData, status }: CreateOrderPayload) => {
            const payload = mapFormToApi(formData, status);
            const response = await apiClient.post('/orders', payload);
            return unwrap<Order>(response);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        },
    });
}

export function useUpdateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, formData, status }: { id: string } & CreateOrderPayload) => {
            const payload = mapFormToApi(formData, status);
            const response = await apiClient.patch(`/orders/${id}`, payload);
            return unwrap<Order>(response);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        },
    });
}

export function useOrderFromQuote(quoteId: string) {
    return useQuery<OrderDetailResponse>({
        queryKey: ['order-from-quote', quoteId],
        queryFn: async () => {
            const response = await apiClient.get(`/quotes/${quoteId}`);
            return unwrap<OrderDetailResponse>(response);
        },
        enabled: !!quoteId,
        staleTime: Infinity,
    });
}

// --- Helper: map form values to API payload ---

function mapFormToApi(formData: OrderFormValues, status: 'PENDING' | 'BOOKED') {
    return {
        customerId: formData.customerId,
        status,
        customerReferenceNumber: formData.customerReferenceNumber || undefined,
        poNumber: formData.poNumber || undefined,
        bolNumber: formData.bolNumber || undefined,
        salesRepId: formData.salesRepId || undefined,
        priority: formData.priority,
        internalNotes: formData.internalNotes || undefined,
        commodity: formData.commodity,
        weightLbs: formData.weight,
        pieceCount: formData.pieces ?? undefined,
        palletCount: formData.pallets ?? undefined,
        equipmentType: formData.equipmentType,
        isHazmat: formData.isHazmat,
        hazmatClass: formData.isHazmat ? formData.hazmatClass : undefined,
        hazmatUnNumber: formData.isHazmat ? formData.hazmatUnNumber : undefined,
        hazmatPlacard: formData.isHazmat ? formData.hazmatPlacard : undefined,
        temperatureMin: formData.equipmentType === 'REEFER' ? formData.tempMin : undefined,
        temperatureMax: formData.equipmentType === 'REEFER' ? formData.tempMax : undefined,
        specialHandling: formData.specialHandling,
        customerRate: formData.customerRate ?? undefined,
        fuelSurcharge: formData.fuelSurcharge ?? undefined,
        estimatedCarrierRate: formData.estimatedCarrierRate ?? undefined,
        paymentTerms: formData.paymentTerms,
        billingContactId: formData.billingContactId || undefined,
        billingNotes: formData.billingNotes || undefined,
        accessorials: formData.accessorials
            .filter((a: { type: string; amount: number }) => a.type && a.amount > 0)
            .map((a: { type: string; amount: number; notes?: string }) => ({
                type: a.type,
                amount: a.amount,
                notes: a.notes || undefined,
            })),
        stops: formData.stops.map((stop: OrderFormValues['stops'][number], index: number) => ({
            stopType: stop.type,
            stopSequence: index,
            facilityName: stop.facilityName || undefined,
            addressLine1: stop.address,
            city: stop.city,
            state: stop.state,
            postalCode: stop.zipCode,
            contactName: stop.contactName || undefined,
            contactPhone: stop.contactPhone || undefined,
            appointmentDate: stop.appointmentDate || undefined,
            appointmentTimeStart: stop.appointmentTimeFrom || undefined,
            appointmentTimeEnd: stop.appointmentTimeTo || undefined,
            specialInstructions: stop.instructions || undefined,
            referenceNumber: stop.referenceNumber || undefined,
        })),
    };
}

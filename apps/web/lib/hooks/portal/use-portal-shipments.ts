'use client';

import { useQuery } from '@tanstack/react-query';
import { portalApi } from '@/lib/api/portal-client';

export interface PortalShipment {
  id: string;
  loadNumber: string;
  referenceNumber?: string;
  origin: string;
  destination: string;
  status: string;
  pickupDate?: string;
  deliveryDate?: string;
  eta?: string;
  weight?: number;
  commodity?: string;
}

export interface PortalShipmentDetail extends PortalShipment {
  carrierName?: string;
  driverName?: string;
  driverPhone?: string;
  stops: Array<{
    id: string;
    type: string;
    city: string;
    state: string;
    appointmentDate?: string;
    arrivedAt?: string;
    departedAt?: string;
    status: string;
  }>;
}

export interface TrackingEvent {
  id: string;
  type: string;
  description: string;
  city?: string;
  state?: string;
  timestamp: string;
}

export const portalShipmentKeys = {
  all: ['portal-shipments'] as const,
  list: () => [...portalShipmentKeys.all, 'list'] as const,
  detail: (id: string) => [...portalShipmentKeys.all, 'detail', id] as const,
  tracking: (id: string) => [...portalShipmentKeys.all, 'tracking', id] as const,
};

export function usePortalShipments() {
  return useQuery({
    queryKey: portalShipmentKeys.list(),
    queryFn: async () => {
      const response = await portalApi.get<{ data: PortalShipment[] }>('/portal/shipments');
      return response.data;
    },
    staleTime: 30_000,
  });
}

export function usePortalShipment(id: string) {
  return useQuery({
    queryKey: portalShipmentKeys.detail(id),
    queryFn: async () => {
      const response = await portalApi.get<{ data: PortalShipmentDetail }>(`/portal/shipments/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function usePortalShipmentTracking(id: string) {
  return useQuery({
    queryKey: portalShipmentKeys.tracking(id),
    queryFn: async () => {
      const response = await portalApi.get<{ data: TrackingEvent[] }>(`/portal/shipments/${id}/tracking`);
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 60_000, // Auto-refresh tracking every minute
  });
}

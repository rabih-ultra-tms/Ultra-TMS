'use client';

import { useQuery } from '@tanstack/react-query';
import { portalApi } from '@/lib/api/portal-client';

interface DashboardOverview {
  activeShipments: number;
  pendingInvoices: number;
  totalSpend: number;
  documentsAvailable: number;
}

interface ActiveShipment {
  id: string;
  loadNumber: string;
  origin: string;
  destination: string;
  status: string;
  eta?: string;
  pickupDate?: string;
  deliveryDate?: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

export const portalDashboardKeys = {
  all: ['portal-dashboard'] as const,
  overview: () => [...portalDashboardKeys.all, 'overview'] as const,
  activeShipments: () => [...portalDashboardKeys.all, 'active-shipments'] as const,
  recentActivity: () => [...portalDashboardKeys.all, 'recent-activity'] as const,
};

export function usePortalDashboard() {
  return useQuery({
    queryKey: portalDashboardKeys.overview(),
    queryFn: async () => {
      const response = await portalApi.get<{ data: DashboardOverview }>('/portal/dashboard');
      return response.data;
    },
    staleTime: 30_000,
  });
}

export function usePortalActiveShipments() {
  return useQuery({
    queryKey: portalDashboardKeys.activeShipments(),
    queryFn: async () => {
      const response = await portalApi.get<{ data: ActiveShipment[] }>('/portal/dashboard/active-shipments');
      return response.data;
    },
    staleTime: 30_000,
  });
}

export function usePortalRecentActivity() {
  return useQuery({
    queryKey: portalDashboardKeys.recentActivity(),
    queryFn: async () => {
      const response = await portalApi.get<{ data: RecentActivity[] }>('/portal/dashboard/recent-activity');
      return response.data;
    },
    staleTime: 30_000,
  });
}

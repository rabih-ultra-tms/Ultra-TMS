'use client';

import { useQuery } from '@tanstack/react-query';
import { carrierClient } from '@/lib/api/carrier-client';

export interface CarrierDashboardData {
  activeLoads: number;
  pendingPayments: number;
  activeDrivers: number;
  complianceStatus: string;
  compliancePercentage: number;
  alerts: Array<{ id: string; message: string; severity: string }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export interface CarrierProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  language?: string;
}

export const carrierDashboardKeys = {
  all: ['carrier-dashboard'] as const,
  data: () => [...carrierDashboardKeys.all, 'data'] as const,
  profile: () => [...carrierDashboardKeys.all, 'profile'] as const,
  loads: () => [...carrierDashboardKeys.all, 'loads'] as const,
  payments: () => [...carrierDashboardKeys.all, 'payments'] as const,
  drivers: () => [...carrierDashboardKeys.all, 'drivers'] as const,
  compliance: () => [...carrierDashboardKeys.all, 'compliance'] as const,
};

export function useCarrierDashboardData() {
  return useQuery({
    queryKey: carrierDashboardKeys.data(),
    queryFn: async () => {
      const response = await carrierClient.getDashboardData();
      return response;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useCarrierProfile() {
  return useQuery({
    queryKey: carrierDashboardKeys.profile(),
    queryFn: async () => {
      const response = await carrierClient.getProfile();
      return response as CarrierProfile;
    },
    staleTime: 60_000,
  });
}

export function usePendingPayments() {
  return useQuery({
    queryKey: carrierDashboardKeys.payments(),
    queryFn: async () => {
      const response = await carrierClient.getPaymentHistory({
        status: 'PENDING',
      });
      return Array.isArray(response) ? response : [];
    },
    staleTime: 30_000,
  });
}

export function useActiveDrivers() {
  return useQuery({
    queryKey: carrierDashboardKeys.drivers(),
    queryFn: async () => {
      const response = await carrierClient.getDrivers();
      return Array.isArray(response) ? response : [];
    },
    staleTime: 30_000,
  });
}

export function useComplianceDocs() {
  return useQuery({
    queryKey: carrierDashboardKeys.compliance(),
    queryFn: async () => {
      const response = await carrierClient.getComplianceDocs();
      return Array.isArray(response) ? response : [];
    },
    staleTime: 60_000,
  });
}

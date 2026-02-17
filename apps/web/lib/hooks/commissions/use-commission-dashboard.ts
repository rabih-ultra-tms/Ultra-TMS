import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface TopRep {
  id: string;
  name: string;
  email: string;
  pendingAmount: number;
  paidMTD: number;
  paidYTD: number;
  loadCount: number;
}

export interface CommissionDashboardData {
  pendingTotal: number;
  paidMTD: number;
  paidYTD: number;
  avgCommissionRate: number;
  topReps: TopRep[];
  pendingChange?: number;
  paidMTDChange?: number;
  paidYTDChange?: number;
}

// ===========================
// Query Keys
// ===========================

export const commissionKeys = {
  all: ['commissions'] as const,
  dashboard: () => [...commissionKeys.all, 'dashboard'] as const,
};

// ===========================
// Helpers
// ===========================

function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

// ===========================
// Hooks
// ===========================

export function useCommissionDashboard() {
  return useQuery<CommissionDashboardData>({
    queryKey: commissionKeys.dashboard(),
    queryFn: async () => {
      const response = await apiClient.get('/commissions/dashboard');
      return unwrap<CommissionDashboardData>(response);
    },
    staleTime: 30_000,
  });
}

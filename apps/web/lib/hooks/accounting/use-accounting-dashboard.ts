import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface AccountingDashboardData {
  totalAR: number;
  totalAP: number;
  overdueInvoiceCount: number;
  dso: number;
  revenueMTD: number;
  cashCollectedMTD: number;
  totalARChange?: number;
  totalAPChange?: number;
  overdueChange?: number;
  dsoChange?: number;
  revenueMTDChange?: number;
}

export interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
}

export type InvoiceStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'SENT'
  | 'VIEWED'
  | 'PARTIAL'
  | 'PAID'
  | 'OVERDUE'
  | 'VOID';

interface DashboardResponse {
  data: AccountingDashboardData;
}

interface InvoicesResponse {
  data: RecentInvoice[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===========================
// Query Keys
// ===========================

export const accountingKeys = {
  all: ['accounting'] as const,
  dashboard: () => [...accountingKeys.all, 'dashboard'] as const,
  recentInvoices: () => [...accountingKeys.all, 'recent-invoices'] as const,
};

// ===========================
// Hooks
// ===========================

export function useAccountingDashboard() {
  return useQuery({
    queryKey: accountingKeys.dashboard(),
    queryFn: async () => {
      const response = await apiClient.get<DashboardResponse>(
        '/accounting/dashboard'
      );
      return response.data ?? (response as unknown as AccountingDashboardData);
    },
    staleTime: 30_000,
  });
}

export function useRecentInvoices(limit = 10) {
  return useQuery({
    queryKey: accountingKeys.recentInvoices(),
    queryFn: async () => {
      const response = await apiClient.get<InvoicesResponse>('/invoices', {
        limit,
        page: 1,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      return response.data ?? (response as unknown as RecentInvoice[]);
    },
    staleTime: 30_000,
  });
}

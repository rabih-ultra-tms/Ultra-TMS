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

// ===========================
// Query Keys
// ===========================

export const accountingKeys = {
  all: ['accounting'] as const,
  dashboard: () => [...accountingKeys.all, 'dashboard'] as const,
  recentInvoices: () => [...accountingKeys.all, 'recent-invoices'] as const,
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

export function useAccountingDashboard() {
  return useQuery({
    queryKey: accountingKeys.dashboard(),
    queryFn: async () => {
      const response = await apiClient.get('/accounting/dashboard');
      return unwrap<AccountingDashboardData>(response);
    },
    staleTime: 30_000,
  });
}

export function useRecentInvoices(limit = 10) {
  return useQuery({
    queryKey: accountingKeys.recentInvoices(),
    queryFn: async () => {
      const response = await apiClient.get('/invoices', {
        take: limit,
        skip: 0,
      });
      const body = response as Record<string, unknown>;
      const inner = (body.data ?? body) as Record<string, unknown>;
      const arr = (inner as Record<string, unknown>).invoices ?? inner;
      if (!Array.isArray(arr)) return [];

      // Map backend Invoice shape to RecentInvoice
      return arr.map((inv: Record<string, unknown>): RecentInvoice => ({
        id: String(inv.id ?? ''),
        invoiceNumber: String(inv.invoiceNumber ?? ''),
        customerName:
          (inv.customerName as string) ??
          ((inv.company as Record<string, unknown> | undefined)?.name as string) ??
          'Unknown',
        amount: Number(inv.amount ?? inv.totalAmount ?? 0),
        dueDate: String(inv.dueDate ?? ''),
        status: (inv.status as InvoiceStatus) ?? 'DRAFT',
        createdAt: String(inv.createdAt ?? ''),
      }));
    },
    staleTime: 30_000,
  });
}

/**
 * Manual mock for @/lib/hooks/accounting/*
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from '@jest/globals';
import {
  mockInvoices,
  mockSettlements,
  mockPaymentsReceived,
  mockPaymentsMade,
  mockChartOfAccounts,
  mockAccountingDashboard,
  mockPagination,
} from '@/test/data/accounting-fixtures';

const KEY = '__HOOKS_ACCOUNTING_MOCK__';

interface MockState {
  dashboard: Record<string, unknown>;
  recentInvoices: Record<string, unknown>;
  invoices: Record<string, unknown>;
  invoice: Record<string, unknown>;
  createInvoice: Record<string, unknown>;
  sendInvoice: Record<string, unknown>;
  voidInvoice: Record<string, unknown>;
  deleteInvoice: Record<string, unknown>;
  updateInvoice: Record<string, unknown>;
  updateInvoiceStatus: Record<string, unknown>;
  paymentsReceived: Record<string, unknown>;
  paymentReceived: Record<string, unknown>;
  createPaymentReceived: Record<string, unknown>;
  paymentsMade: Record<string, unknown>;
  paymentMade: Record<string, unknown>;
  createPaymentMade: Record<string, unknown>;
  chartOfAccounts: Record<string, unknown>;
  chartOfAccount: Record<string, unknown>;
  createChartOfAccount: Record<string, unknown>;
  payments: Record<string, unknown>;
  payment: Record<string, unknown>;
  createPayment: Record<string, unknown>;
  allocatePayment: Record<string, unknown>;
  payables: Record<string, unknown>;
  settlements: Record<string, unknown>;
  settlement: Record<string, unknown>;
  createSettlement: Record<string, unknown>;
  approveSettlement: Record<string, unknown>;
  processSettlement: Record<string, unknown>;
  deleteSettlement: Record<string, unknown>;
  agingReport: Record<string, unknown>;
}

function getShared(): MockState {
  const g = globalThis as unknown as Record<string, MockState>;
  if (!g[KEY]) {
    g[KEY] = {
      dashboard: {
        data: mockAccountingDashboard,
        isLoading: false,
        error: null,
      },
      recentInvoices: {
        data: mockInvoices.slice(0, 3),
        isLoading: false,
        error: null,
      },
      invoices: {
        data: mockInvoices,
        isLoading: false,
        error: null,
        pagination: mockPagination,
      },
      invoice: {
        data: mockInvoices[0],
        isLoading: false,
        error: null,
      },
      createInvoice: {
        mutateAsync: jest
          .fn<() => Promise<unknown>>()
          .mockResolvedValue(mockInvoices[0]),
        isPending: false,
      },
      sendInvoice: {
        mutate: jest.fn(),
        isPending: false,
      },
      voidInvoice: {
        mutate: jest.fn(),
        isPending: false,
      },
      deleteInvoice: {
        mutate: jest.fn(),
        isPending: false,
      },
      updateInvoice: {
        mutateAsync: jest
          .fn<() => Promise<unknown>>()
          .mockResolvedValue(mockInvoices[0]),
        isPending: false,
      },
      updateInvoiceStatus: {
        mutateAsync: jest
          .fn<() => Promise<unknown>>()
          .mockResolvedValue(mockInvoices[0]),
        isPending: false,
      },
      paymentsReceived: {
        data: mockPaymentsReceived,
        isLoading: false,
        error: null,
        pagination: mockPagination,
      },
      paymentReceived: {
        data: mockPaymentsReceived[0],
        isLoading: false,
        error: null,
      },
      createPaymentReceived: {
        mutateAsync: jest
          .fn<() => Promise<unknown>>()
          .mockResolvedValue(mockPaymentsReceived[0]),
        isPending: false,
      },
      paymentsMade: {
        data: mockPaymentsMade,
        isLoading: false,
        error: null,
        pagination: mockPagination,
      },
      paymentMade: {
        data: mockPaymentsMade[0],
        isLoading: false,
        error: null,
      },
      createPaymentMade: {
        mutateAsync: jest
          .fn<() => Promise<unknown>>()
          .mockResolvedValue(mockPaymentsMade[0]),
        isPending: false,
      },
      chartOfAccounts: {
        data: mockChartOfAccounts,
        isLoading: false,
        error: null,
        pagination: mockPagination,
      },
      chartOfAccount: {
        data: mockChartOfAccounts[0],
        isLoading: false,
        error: null,
      },
      createChartOfAccount: {
        mutateAsync: jest
          .fn<() => Promise<unknown>>()
          .mockResolvedValue(mockChartOfAccounts[0]),
        isPending: false,
      },
      payments: {
        data: mockPaymentsReceived,
        isLoading: false,
        error: null,
        pagination: mockPagination,
      },
      payment: {
        data: mockPaymentsReceived[0],
        isLoading: false,
        error: null,
      },
      createPayment: {
        mutateAsync: jest
          .fn<() => Promise<unknown>>()
          .mockResolvedValue(mockPaymentsReceived[0]),
        isPending: false,
      },
      allocatePayment: {
        mutate: jest.fn(),
        isPending: false,
      },
      payables: {
        data: mockSettlements,
        isLoading: false,
        error: null,
        pagination: mockPagination,
      },
      settlements: {
        data: mockSettlements,
        isLoading: false,
        error: null,
        pagination: mockPagination,
      },
      settlement: {
        data: mockSettlements[0],
        isLoading: false,
        error: null,
      },
      createSettlement: {
        mutateAsync: jest
          .fn<() => Promise<unknown>>()
          .mockResolvedValue(mockSettlements[0]),
        isPending: false,
      },
      approveSettlement: {
        mutate: jest.fn(),
        isPending: false,
      },
      processSettlement: {
        mutate: jest.fn(),
        isPending: false,
      },
      deleteSettlement: {
        mutate: jest.fn(),
        isPending: false,
      },
      agingReport: {
        data: mockInvoices.filter(
          (inv) => inv.status === 'SENT' || inv.status === 'PARTIAL'
        ),
        isLoading: false,
        error: null,
        pagination: mockPagination,
      },
    };
  }
  return (globalThis as unknown as Record<string, MockState>)[KEY]!;
}

const shared = getShared();

// Query key exports
export const accountingKeys = {
  all: ['accounting'] as const,
  dashboard: () => ['accounting', 'dashboard'] as const,
  recentInvoices: () => ['accounting', 'recent-invoices'] as const,
};

export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => ['invoices', 'list'] as const,
  list: (params: unknown) => ['invoices', 'list', params] as const,
  details: () => ['invoices', 'detail'] as const,
  detail: (id: string) => ['invoices', 'detail', id] as const,
};

// Hook exports
export function useAccountingDashboard() {
  return shared.dashboard;
}
export function useRecentInvoices() {
  return shared.recentInvoices;
}
export function useInvoices() {
  return shared.invoices;
}
export function useInvoice() {
  return shared.invoice;
}
export function useCreateInvoice() {
  return shared.createInvoice;
}
export function useSendInvoice() {
  return shared.sendInvoice;
}
export function useVoidInvoice() {
  return shared.voidInvoice;
}
export function useDeleteInvoice() {
  return shared.deleteInvoice;
}
export function useUpdateInvoice() {
  return shared.updateInvoice;
}
export function useUpdateInvoiceStatus() {
  return shared.updateInvoiceStatus;
}
export function usePaymentsReceived() {
  return shared.paymentsReceived;
}
export function usePaymentReceived() {
  return shared.paymentReceived;
}
export function useCreatePaymentReceived() {
  return shared.createPaymentReceived;
}
export function usePaymentsMade() {
  return shared.paymentsMade;
}
export function usePaymentMade() {
  return shared.paymentMade;
}
export function useCreatePaymentMade() {
  return shared.createPaymentMade;
}
export function useChartOfAccounts() {
  return shared.chartOfAccounts;
}
export function useChartOfAccount() {
  return shared.chartOfAccount;
}
export function useCreateChartOfAccount() {
  return shared.createChartOfAccount;
}
export function usePayments() {
  return shared.payments;
}
export function usePayment() {
  return shared.payment;
}
export function useCreatePayment() {
  return shared.createPayment;
}
export function useAllocatePayment() {
  return shared.allocatePayment;
}
export function useDeletePayment() {
  return shared.deleteInvoice;
}
export function usePayables() {
  return shared.payables;
}
export function usePayable() {
  return shared.payables;
}
export function useSettlements() {
  return shared.settlements;
}
export function useSettlement() {
  return shared.settlement;
}
export function useCreateSettlement() {
  return shared.createSettlement;
}
export function useApproveSettlement() {
  return shared.approveSettlement;
}
export function useProcessSettlement() {
  return shared.processSettlement;
}
export function useDeleteSettlement() {
  return shared.deleteSettlement;
}
export function useAgingReport() {
  return shared.agingReport;
}

// Type re-exports (interfaces used in components)
export type InvoiceStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'SENT'
  | 'VIEWED'
  | 'PARTIAL'
  | 'PAID'
  | 'OVERDUE'
  | 'VOID';
export type PaymentStatus = 'PENDING' | 'APPLIED' | 'PARTIAL' | 'VOIDED';
export type PayableStatus = 'PENDING' | 'ELIGIBLE' | 'PAID' | 'PROCESSING';
export type SettlementStatus = 'CREATED' | 'APPROVED' | 'PROCESSED' | 'PAID';
export type PaymentMethod = 'CHECK' | 'ACH' | 'WIRE' | 'CREDIT_CARD';

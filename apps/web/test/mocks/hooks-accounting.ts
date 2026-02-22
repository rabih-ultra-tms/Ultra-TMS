/**
 * Manual mock for @/lib/hooks/accounting/*
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from "@jest/globals";

const KEY = "__HOOKS_ACCOUNTING_MOCK__";

interface MockState {
    dashboard: Record<string, unknown>;
    recentInvoices: Record<string, unknown>;
    invoices: Record<string, unknown>;
    invoice: Record<string, unknown>;
    createInvoice: Record<string, unknown>;
    sendInvoice: Record<string, unknown>;
    voidInvoice: Record<string, unknown>;
    deleteInvoice: Record<string, unknown>;
    payments: Record<string, unknown>;
    payment: Record<string, unknown>;
    createPayment: Record<string, unknown>;
    allocatePayment: Record<string, unknown>;
    payables: Record<string, unknown>;
    settlements: Record<string, unknown>;
    settlement: Record<string, unknown>;
    approveSettlement: Record<string, unknown>;
    processSettlement: Record<string, unknown>;
    agingReport: Record<string, unknown>;
}

function getShared(): MockState {
    const g = globalThis as unknown as Record<string, MockState>;
    if (!g[KEY]) {
        g[KEY] = {
            dashboard: { data: undefined, isLoading: true },
            recentInvoices: { data: undefined, isLoading: true },
            invoices: { data: undefined, isLoading: true },
            invoice: { data: undefined, isLoading: true },
            createInvoice: {
                mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({ id: "inv-new" }),
                isPending: false,
            },
            sendInvoice: { mutate: jest.fn(), isPending: false },
            voidInvoice: { mutate: jest.fn(), isPending: false },
            deleteInvoice: { mutate: jest.fn(), isPending: false },
            payments: { data: undefined, isLoading: true },
            payment: { data: undefined, isLoading: true },
            createPayment: { mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({ id: "pay-new" }), isPending: false },
            allocatePayment: { mutate: jest.fn(), isPending: false },
            payables: { data: undefined, isLoading: true },
            settlements: { data: undefined, isLoading: true },
            settlement: { data: undefined, isLoading: true },
            approveSettlement: { mutate: jest.fn(), isPending: false },
            processSettlement: { mutate: jest.fn(), isPending: false },
            agingReport: { data: undefined, isLoading: true },
        };
    }
    return (globalThis as unknown as Record<string, MockState>)[KEY]!;
}

const shared = getShared();

// Query key exports
export const accountingKeys = {
    all: ["accounting"] as const,
    dashboard: () => ["accounting", "dashboard"] as const,
    recentInvoices: () => ["accounting", "recent-invoices"] as const,
};

export const invoiceKeys = {
    all: ["invoices"] as const,
    lists: () => ["invoices", "list"] as const,
    list: (params: unknown) => ["invoices", "list", params] as const,
    details: () => ["invoices", "detail"] as const,
    detail: (id: string) => ["invoices", "detail", id] as const,
};

// Hook exports
export function useAccountingDashboard() { return shared.dashboard; }
export function useRecentInvoices() { return shared.recentInvoices; }
export function useInvoices() { return shared.invoices; }
export function useInvoice() { return shared.invoice; }
export function useCreateInvoice() { return shared.createInvoice; }
export function useSendInvoice() { return shared.sendInvoice; }
export function useVoidInvoice() { return shared.voidInvoice; }
export function useDeleteInvoice() { return shared.deleteInvoice; }
export function useUpdateInvoice() { return shared.invoice; }
export function useUpdateInvoiceStatus() { return shared.invoice; }
export function usePayments() { return shared.payments; }
export function usePayment() { return shared.payment; }
export function useCreatePayment() { return shared.createPayment; }
export function useAllocatePayment() { return shared.allocatePayment; }
export function useDeletePayment() { return shared.deleteInvoice; }
export function usePayables() { return shared.payables; }
export function usePayable() { return shared.payables; }
export function useSettlements() { return shared.settlements; }
export function useSettlement() { return shared.settlement; }
export function useCreateSettlement() { return shared.createInvoice; }
export function useApproveSettlement() { return shared.approveSettlement; }
export function useProcessSettlement() { return shared.processSettlement; }
export function useDeleteSettlement() { return shared.deleteInvoice; }
export function useAgingReport() { return shared.agingReport; }

// Type re-exports (interfaces used in components)
export type InvoiceStatus = "DRAFT" | "PENDING" | "SENT" | "VIEWED" | "PARTIAL" | "PAID" | "OVERDUE" | "VOID";
export type PaymentStatus = "PENDING" | "APPLIED" | "PARTIAL" | "VOIDED";
export type PayableStatus = "PENDING" | "ELIGIBLE" | "PAID" | "PROCESSING";
export type SettlementStatus = "CREATED" | "APPROVED" | "PROCESSED" | "PAID";
export type PaymentMethod = "CHECK" | "ACH" | "WIRE" | "CREDIT_CARD";

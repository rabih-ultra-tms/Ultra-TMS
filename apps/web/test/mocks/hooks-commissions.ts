/**
 * Manual mock for @/lib/hooks/commissions/*
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from "@jest/globals";

const KEY = "__HOOKS_COMMISSIONS_MOCK__";

interface MockState {
    dashboard: Record<string, unknown>;
    plans: Record<string, unknown>;
    plan: Record<string, unknown>;
    createPlan: Record<string, unknown>;
    updatePlan: Record<string, unknown>;
    deletePlan: Record<string, unknown>;
    activatePlan: Record<string, unknown>;
    reps: Record<string, unknown>;
    rep: Record<string, unknown>;
    repTransactions: Record<string, unknown>;
    assignPlan: Record<string, unknown>;
    transactions: Record<string, unknown>;
    approveTransaction: Record<string, unknown>;
    voidTransaction: Record<string, unknown>;
    payouts: Record<string, unknown>;
    payout: Record<string, unknown>;
    generatePayout: Record<string, unknown>;
    processPayout: Record<string, unknown>;
}

function getShared(): MockState {
    const g = globalThis as unknown as Record<string, MockState>;
    if (!g[KEY]) {
        g[KEY] = {
            dashboard: { data: undefined, isLoading: true },
            plans: { data: undefined, isLoading: true },
            plan: { data: undefined, isLoading: true },
            createPlan: { mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({ id: "plan-new" }), isPending: false },
            updatePlan: { mutate: jest.fn(), isPending: false },
            deletePlan: { mutate: jest.fn(), isPending: false },
            activatePlan: { mutate: jest.fn(), isPending: false },
            reps: { data: undefined, isLoading: true },
            rep: { data: undefined, isLoading: true },
            repTransactions: { data: undefined, isLoading: true },
            assignPlan: { mutate: jest.fn(), isPending: false },
            transactions: { data: undefined, isLoading: true },
            approveTransaction: { mutate: jest.fn(), isPending: false },
            voidTransaction: { mutate: jest.fn(), isPending: false },
            payouts: { data: undefined, isLoading: true },
            payout: { data: undefined, isLoading: true },
            generatePayout: { mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({ id: "payout-new" }), isPending: false },
            processPayout: { mutate: jest.fn(), isPending: false },
        };
    }
    return (globalThis as unknown as Record<string, MockState>)[KEY]!;
}

const shared = getShared();

// Query key exports
export const commissionKeys = {
    all: ["commissions"] as const,
    dashboard: () => ["commissions", "dashboard"] as const,
};

export const planKeys = {
    all: ["commissions", "plans"] as const,
    lists: () => ["commissions", "plans", "list"] as const,
    list: (params: unknown) => ["commissions", "plans", "list", params] as const,
    details: () => ["commissions", "plans", "detail"] as const,
    detail: (id: string) => ["commissions", "plans", "detail", id] as const,
};

// Hook exports
export function useCommissionDashboard() { return shared.dashboard; }
export function usePlans() { return shared.plans; }
export function usePlan() { return shared.plan; }
export function useCreatePlan() { return shared.createPlan; }
export function useUpdatePlan() { return shared.updatePlan; }
export function useDeletePlan() { return shared.deletePlan; }
export function useActivatePlan() { return shared.activatePlan; }
export function useReps() { return shared.reps; }
export function useRep() { return shared.rep; }
export function useRepTransactions() { return shared.repTransactions; }
export function useAssignPlan() { return shared.assignPlan; }
export function useTransactions() { return shared.transactions; }
export function useApproveTransaction() { return shared.approveTransaction; }
export function useVoidTransaction() { return shared.voidTransaction; }
export function usePayouts() { return shared.payouts; }
export function usePayout() { return shared.payout; }
export function useGeneratePayout() { return shared.generatePayout; }
export function useProcessPayout() { return shared.processPayout; }

// Type re-exports
export type PlanType = "PERCENTAGE" | "FLAT" | "TIERED_PERCENTAGE" | "TIERED_FLAT";
export type BackendPlanType = "FLAT_FEE" | "PERCENT_REVENUE" | "PERCENT_MARGIN" | "TIERED" | "CUSTOM";
export interface PlanTier { minMargin: number; maxMargin: number | null; rate: number; }
export interface BackendPlanTier {
    id: string; tierNumber: number; tierName: string | null; thresholdType: string;
    thresholdMin: number; thresholdMax: number | null; rateType: string;
    rateAmount: number; periodType: string | null;
}
export interface CommissionPlan {
    id: string; name: string; planType: BackendPlanType; description: string | null;
    percentRate: number | null; flatAmount: number | null; tiers: BackendPlanTier[];
    status: string; isDefault: boolean; effectiveDate: string; endDate: string | null;
    _count?: { assignments: number; entries: number };
    createdAt: string; updatedAt: string;
}

# 08 - Commission UI Implementation

> **Service:** Commission (Sales Rep & Agent Commissions)  
> **Priority:** P2 - Medium  
> **Pages:** 6  
> **API Endpoints:** 20  
> **Dependencies:** Foundation ✅, Auth API ✅, Commission API ✅  
> **Doc Reference:** [15-service-commission.md](../../02-services/15-service-commission.md)

---

## 📋 Overview

The Commission UI provides interfaces for managing sales representative commissions, commission plans, and payout processing. This includes commission calculations, plan management, earnings tracking, and payout history.

### Key Screens
- Commission dashboard
- Sales rep commissions list
- Commission detail/history
- Commission plans management
- Payout processing
- Commission reports

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Commission API is deployed

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── commissions/
│   ├── page.tsx                    # Commission dashboard
│   ├── reps/
│   │   ├── page.tsx                # Sales reps list
│   │   └── [id]/
│   │       └── page.tsx            # Rep commission detail
│   ├── plans/
│   │   ├── page.tsx                # Commission plans
│   │   ├── new/
│   │   │   └── page.tsx            # Create plan
│   │   └── [id]/
│   │       └── page.tsx            # Plan detail
│   ├── payouts/
│   │   ├── page.tsx                # Payouts list
│   │   └── [id]/
│   │       └── page.tsx            # Payout detail
│   └── reports/
│       └── page.tsx                # Commission reports
```

---

## 🎨 Components to Create

```
components/commissions/
├── commission-dashboard-stats.tsx  # Dashboard metrics
├── rep-commissions-table.tsx       # Reps list
├── commission-history-table.tsx    # Transaction history
├── commission-summary-card.tsx     # Earnings summary
├── commission-plan-card.tsx        # Plan overview
├── commission-plan-form.tsx        # Create/edit plan
├── tier-editor.tsx                 # Tiered commission setup
├── payout-table.tsx                # Payouts list
├── payout-detail-card.tsx          # Payout breakdown
├── process-payout-form.tsx         # Process payout
├── commission-filters.tsx          # Filter controls
└── earnings-chart.tsx              # Earnings visualization
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/commission.ts`

```typescript
export type CommissionType = 
  | 'PERCENTAGE'
  | 'FLAT'
  | 'TIERED_PERCENTAGE'
  | 'TIERED_FLAT';

export type CommissionStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'PAID'
  | 'VOID';

export interface SalesRep {
  id: string;
  userId: string;
  name: string;
  email: string;
  
  // Commission
  commissionPlanId: string;
  commissionPlanName: string;
  
  // Metrics
  pendingCommissions: number;
  paidCommissions: number;
  totalEarnings: number;
  
  // Period
  mtdEarnings: number;
  ytdEarnings: number;
  
  isActive: boolean;
  createdAt: string;
}

export interface CommissionTransaction {
  id: string;
  repId: string;
  repName: string;
  status: CommissionStatus;
  
  // Source
  orderId: string;
  orderNumber: string;
  loadId?: string;
  loadNumber?: string;
  
  // Amounts
  orderRevenue: number;
  commissionableAmount: number;
  commissionRate: number;
  commissionAmount: number;
  
  // Plan
  planId: string;
  planName: string;
  tier?: string;
  
  // Dates
  orderDate: string;
  calculatedAt: string;
  approvedAt?: string;
  paidAt?: string;
  
  // Payout
  payoutId?: string;
}

export interface CommissionPlan {
  id: string;
  name: string;
  description?: string;
  type: CommissionType;
  isDefault: boolean;
  isActive: boolean;
  
  // Base rate (for PERCENTAGE/FLAT)
  baseRate?: number;
  
  // Tiers (for TIERED types)
  tiers?: CommissionTier[];
  
  // Conditions
  includeAccessorials: boolean;
  includeFuelSurcharge: boolean;
  minOrderValue?: number;
  
  // Payment
  paymentFrequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  paymentDelay: number; // days after order
  
  createdAt: string;
  updatedAt: string;
}

export interface CommissionTier {
  id: string;
  minValue: number;
  maxValue?: number;
  rate: number;
  tierOrder: number;
}

export interface CommissionPayout {
  id: string;
  payoutNumber: string;
  repId: string;
  repName: string;
  
  // Period
  periodStart: string;
  periodEnd: string;
  
  // Amounts
  grossAmount: number;
  adjustments: number;
  netAmount: number;
  
  // Details
  transactionCount: number;
  
  // Status
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
  
  // Payment
  paymentMethod?: string;
  paymentReference?: string;
  paidAt?: string;
  
  createdAt: string;
}

export interface CommissionDashboardData {
  pendingTotal: number;
  pendingCount: number;
  paidThisMonth: number;
  paidThisYear: number;
  avgCommissionRate: number;
  topReps: Array<{ id: string; name: string; earnings: number }>;
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/commissions/use-commissions.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  SalesRep,
  CommissionTransaction,
  CommissionPlan,
  CommissionPayout,
  CommissionDashboardData,
} from '@/lib/types/commission';
import { toast } from 'sonner';

export const commissionKeys = {
  all: ['commissions'] as const,
  dashboard: () => [...commissionKeys.all, 'dashboard'] as const,
  
  reps: () => [...commissionKeys.all, 'reps'] as const,
  repsList: (params?: Record<string, unknown>) => [...commissionKeys.reps(), 'list', params] as const,
  repDetail: (id: string) => [...commissionKeys.reps(), 'detail', id] as const,
  repTransactions: (id: string, params?: Record<string, unknown>) => [...commissionKeys.reps(), 'transactions', id, params] as const,
  
  plans: () => [...commissionKeys.all, 'plans'] as const,
  planDetail: (id: string) => [...commissionKeys.plans(), id] as const,
  
  payouts: () => [...commissionKeys.all, 'payouts'] as const,
  payoutsList: (params?: Record<string, unknown>) => [...commissionKeys.payouts(), 'list', params] as const,
  payoutDetail: (id: string) => [...commissionKeys.payouts(), 'detail', id] as const,
};

// Dashboard
export function useCommissionDashboard() {
  return useQuery({
    queryKey: commissionKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: CommissionDashboardData }>('/commissions/dashboard'),
  });
}

// Sales Reps
export function useSalesReps(params = {}) {
  return useQuery({
    queryKey: commissionKeys.repsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<SalesRep>>('/commissions/reps', params),
  });
}

export function useSalesRep(id: string) {
  return useQuery({
    queryKey: commissionKeys.repDetail(id),
    queryFn: () => apiClient.get<{ data: SalesRep }>(`/commissions/reps/${id}`),
    enabled: !!id,
  });
}

export function useRepTransactions(repId: string, params = {}) {
  return useQuery({
    queryKey: commissionKeys.repTransactions(repId, params),
    queryFn: () => apiClient.get<PaginatedResponse<CommissionTransaction>>(`/commissions/reps/${repId}/transactions`, params),
    enabled: !!repId,
  });
}

export function useAssignPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ repId, planId }: { repId: string; planId: string }) =>
      apiClient.post(`/commissions/reps/${repId}/plan`, { planId }),
    onSuccess: (_, { repId }) => {
      queryClient.invalidateQueries({ queryKey: commissionKeys.repDetail(repId) });
      toast.success('Plan assigned');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign plan');
    },
  });
}

// Commission Plans
export function useCommissionPlans() {
  return useQuery({
    queryKey: commissionKeys.plans(),
    queryFn: () => apiClient.get<{ data: CommissionPlan[] }>('/commissions/plans'),
  });
}

export function useCommissionPlan(id: string) {
  return useQuery({
    queryKey: commissionKeys.planDetail(id),
    queryFn: () => apiClient.get<{ data: CommissionPlan }>(`/commissions/plans/${id}`),
    enabled: !!id,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<CommissionPlan>) =>
      apiClient.post<{ data: CommissionPlan }>('/commissions/plans', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commissionKeys.plans() });
      toast.success('Plan created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create plan');
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CommissionPlan> }) =>
      apiClient.patch<{ data: CommissionPlan }>(`/commissions/plans/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: commissionKeys.planDetail(id) });
      queryClient.invalidateQueries({ queryKey: commissionKeys.plans() });
      toast.success('Plan updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update plan');
    },
  });
}

// Payouts
export function usePayouts(params = {}) {
  return useQuery({
    queryKey: commissionKeys.payoutsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<CommissionPayout>>('/commissions/payouts', params),
  });
}

export function usePayout(id: string) {
  return useQuery({
    queryKey: commissionKeys.payoutDetail(id),
    queryFn: () => apiClient.get<{ data: CommissionPayout }>(`/commissions/payouts/${id}`),
    enabled: !!id,
  });
}

export function useGeneratePayout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ repId, periodEnd }: { repId: string; periodEnd: string }) =>
      apiClient.post<{ data: CommissionPayout }>('/commissions/payouts/generate', { repId, periodEnd }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commissionKeys.payouts() });
      toast.success('Payout generated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate payout');
    },
  });
}

export function useProcessPayout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, paymentMethod }: { id: string; paymentMethod: string }) =>
      apiClient.post(`/commissions/payouts/${id}/process`, { paymentMethod }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: commissionKeys.payoutDetail(id) });
      queryClient.invalidateQueries({ queryKey: commissionKeys.payouts() });
      toast.success('Payout processed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to process payout');
    },
  });
}

// Approve/Void Transactions
export function useApproveTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (transactionId: string) =>
      apiClient.post(`/commissions/transactions/${transactionId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commissionKeys.reps() });
      queryClient.invalidateQueries({ queryKey: commissionKeys.dashboard() });
      toast.success('Transaction approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve');
    },
  });
}

export function useVoidTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ transactionId, reason }: { transactionId: string; reason: string }) =>
      apiClient.post(`/commissions/transactions/${transactionId}/void`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commissionKeys.reps() });
      queryClient.invalidateQueries({ queryKey: commissionKeys.dashboard() });
      toast.success('Transaction voided');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to void');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/commission-store.ts`

```typescript
import { createStore } from './create-store';
import { CommissionStatus } from '@/lib/types/commission';

interface CommissionFilters {
  repSearch: string;
  transactionStatus: CommissionStatus | '';
  dateRange: { from?: Date; to?: Date };
}

interface CommissionState {
  filters: CommissionFilters;
  selectedRepId: string | null;
  isPayoutDialogOpen: boolean;
  isPlanDialogOpen: boolean;
  
  setFilter: <K extends keyof CommissionFilters>(key: K, value: CommissionFilters[K]) => void;
  resetFilters: () => void;
  setSelectedRep: (id: string | null) => void;
  setPayoutDialogOpen: (open: boolean) => void;
  setPlanDialogOpen: (open: boolean) => void;
}

const defaultFilters: CommissionFilters = {
  repSearch: '',
  transactionStatus: '',
  dateRange: {},
};

export const useCommissionStore = createStore<CommissionState>('commission-store', (set, get) => ({
  filters: defaultFilters,
  selectedRepId: null,
  isPayoutDialogOpen: false,
  isPlanDialogOpen: false,
  
  setFilter: (key, value) =>
    set({ filters: { ...get().filters, [key]: value } }),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setSelectedRep: (id) => set({ selectedRepId: id }),
  
  setPayoutDialogOpen: (open) => set({ isPayoutDialogOpen: open }),
  
  setPlanDialogOpen: (open) => set({ isPlanDialogOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/commission.ts`

```typescript
import { z } from 'zod';

export const commissionPlanFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FLAT', 'TIERED_PERCENTAGE', 'TIERED_FLAT']),
  baseRate: z.number().positive().optional(),
  tiers: z.array(z.object({
    minValue: z.number().min(0),
    maxValue: z.number().positive().optional(),
    rate: z.number().positive(),
    tierOrder: z.number().int().positive(),
  })).optional(),
  includeAccessorials: z.boolean().default(true),
  includeFuelSurcharge: z.boolean().default(false),
  minOrderValue: z.number().positive().optional(),
  paymentFrequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']),
  paymentDelay: z.number().int().min(0),
  isDefault: z.boolean().default(false),
});

export const generatePayoutSchema = z.object({
  repId: z.string().min(1, 'Sales rep is required'),
  periodEnd: z.string().min(1, 'Period end date is required'),
});

export const processPayoutSchema = z.object({
  paymentMethod: z.enum(['ACH', 'CHECK', 'WIRE']),
});

export const voidTransactionSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
});

export type CommissionPlanFormData = z.infer<typeof commissionPlanFormSchema>;
export type GeneratePayoutFormData = z.infer<typeof generatePayoutSchema>;
export type ProcessPayoutFormData = z.infer<typeof processPayoutSchema>;
export type VoidTransactionFormData = z.infer<typeof voidTransactionSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/commissions/commission-dashboard-stats.tsx`
- [ ] `components/commissions/rep-commissions-table.tsx`
- [ ] `components/commissions/commission-history-table.tsx`
- [ ] `components/commissions/commission-summary-card.tsx`
- [ ] `components/commissions/commission-plan-card.tsx`
- [ ] `components/commissions/commission-plan-form.tsx`
- [ ] `components/commissions/tier-editor.tsx`
- [ ] `components/commissions/payout-table.tsx`
- [ ] `components/commissions/payout-detail-card.tsx`
- [ ] `components/commissions/process-payout-form.tsx`
- [ ] `components/commissions/commission-filters.tsx`
- [ ] `components/commissions/earnings-chart.tsx`

### Pages
- [ ] `app/(dashboard)/commissions/page.tsx`
- [ ] `app/(dashboard)/commissions/reps/page.tsx`
- [ ] `app/(dashboard)/commissions/reps/[id]/page.tsx`
- [ ] `app/(dashboard)/commissions/plans/page.tsx`
- [ ] `app/(dashboard)/commissions/plans/new/page.tsx`
- [ ] `app/(dashboard)/commissions/plans/[id]/page.tsx`
- [ ] `app/(dashboard)/commissions/payouts/page.tsx`
- [ ] `app/(dashboard)/commissions/payouts/[id]/page.tsx`
- [ ] `app/(dashboard)/commissions/reports/page.tsx`

### Hooks & Stores
- [ ] `lib/types/commission.ts`
- [ ] `lib/validations/commission.ts`
- [ ] `lib/hooks/commissions/use-commissions.ts`
- [ ] `lib/stores/commission-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [09-claims-ui.md](./09-claims-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/15-service-commission.md)
- [API Review](../../api-review-docs/08-commission-review.html)

# 17 - Factoring UI Implementation

> **Service:** Factoring (Internal Factoring Management)  
> **Priority:** P2 - Medium  
> **Pages:** 6  
> **API Endpoints:** 20  
> **Dependencies:** Foundation ✅, Auth API ✅, Factoring API ✅, Accounting API ✅  
> **Doc Reference:** [23-service-factoring-internal.md](../../02-services/23-service-factoring-internal.md)

---

## 📋 Overview

The Factoring UI provides interfaces for managing internal factoring operations, including invoice purchasing, advance payments, collections, and factoring reserves. This enables the TMS to offer factoring services to carriers.

### Key Screens
- Factoring dashboard
- Submitted invoices
- Purchase/fund invoices
- Advance payments
- Collections tracking
- Reserves management
- Factoring reports

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Factoring API is deployed
- [ ] Accounting API is accessible

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── factoring/
│   ├── page.tsx                    # Factoring dashboard
│   ├── submissions/
│   │   ├── page.tsx                # Submitted invoices
│   │   └── [id]/
│   │       └── page.tsx            # Submission detail
│   ├── funded/
│   │   ├── page.tsx                # Funded invoices
│   │   └── [id]/
│   │       └── page.tsx            # Funded detail
│   ├── collections/
│   │   └── page.tsx                # Collections
│   ├── reserves/
│   │   └── page.tsx                # Reserve accounts
│   └── reports/
│       └── page.tsx                # Factoring reports
```

---

## 🎨 Components to Create

```
components/factoring/
├── factoring-dashboard-stats.tsx   # Dashboard metrics
├── volume-chart.tsx                # Volume trends
├── submissions-table.tsx           # Submitted invoices
├── submission-detail.tsx           # Submission view
├── submission-review-form.tsx      # Review/approve
├── funded-invoices-table.tsx       # Funded list
├── funded-detail.tsx               # Funded invoice view
├── advance-card.tsx                # Advance summary
├── fund-invoice-form.tsx           # Fund/purchase form
├── collections-table.tsx           # Collections list
├── collection-detail.tsx           # Collection status
├── collection-action-form.tsx      # Log collection activity
├── reserve-account-card.tsx        # Reserve summary
├── reserve-transactions.tsx        # Reserve history
├── factoring-filters.tsx           # Filter controls
├── aging-by-debtor.tsx             # Debtor aging
└── fee-calculator.tsx              # Fee calculation
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/factoring.ts`

```typescript
export type SubmissionStatus = 
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'FUNDED'
  | 'CANCELLED';

export type FundedInvoiceStatus = 
  | 'FUNDED'
  | 'PARTIAL_COLLECTED'
  | 'COLLECTED'
  | 'DISPUTED'
  | 'WRITTEN_OFF';

export type CollectionStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COLLECTED'
  | 'DISPUTED'
  | 'WRITTEN_OFF';

export interface FactoringSubmission {
  id: string;
  submissionNumber: string;
  status: SubmissionStatus;
  
  // Carrier
  carrierId: string;
  carrierName: string;
  carrierMC: string;
  
  // Invoice
  invoiceNumber: string;
  invoiceAmount: number;
  invoiceDate: string;
  
  // Debtor (Customer)
  debtorId: string;
  debtorName: string;
  
  // Load Reference
  loadId?: string;
  loadNumber?: string;
  
  // Documents
  invoiceDocUrl?: string;
  bolUrl?: string;
  podUrl?: string;
  rateConUrl?: string;
  
  // Review
  reviewNotes?: string;
  reviewedById?: string;
  reviewedAt?: string;
  
  // Rejection
  rejectionReason?: string;
  
  submittedAt: string;
  createdAt: string;
}

export interface FundedInvoice {
  id: string;
  fundingNumber: string;
  status: FundedInvoiceStatus;
  
  // Submission Reference
  submissionId: string;
  submissionNumber: string;
  
  // Carrier
  carrierId: string;
  carrierName: string;
  
  // Debtor
  debtorId: string;
  debtorName: string;
  
  // Invoice
  invoiceNumber: string;
  invoiceAmount: number;
  invoiceDate: string;
  dueDate: string;
  
  // Advance
  advancePercent: number;
  advanceAmount: number;
  advanceFee: number;
  netAdvance: number;
  advancePaidAt: string;
  
  // Reserve
  reserveAmount: number;
  
  // Collection
  collectedAmount: number;
  collectionStatus: CollectionStatus;
  daysOutstanding: number;
  
  // Fees
  discountFee: number;
  additionalFees: number;
  totalFees: number;
  
  // Final Settlement
  finalAmount?: number;
  settledAt?: string;
  
  fundedAt: string;
  createdAt: string;
}

export interface CollectionItem {
  id: string;
  fundedInvoiceId: string;
  fundingNumber: string;
  
  // Debtor
  debtorId: string;
  debtorName: string;
  debtorContact?: string;
  debtorPhone?: string;
  debtorEmail?: string;
  
  // Invoice
  invoiceNumber: string;
  invoiceAmount: number;
  dueDate: string;
  daysOverdue: number;
  
  // Status
  status: CollectionStatus;
  
  // Activity
  lastContactDate?: string;
  lastContactMethod?: string;
  nextFollowUpDate?: string;
  
  // Notes
  notes?: string;
  
  // Resolution
  collectedAmount?: number;
  collectedAt?: string;
  disputeReason?: string;
  writeOffReason?: string;
}

export interface CollectionActivity {
  id: string;
  collectionItemId: string;
  
  activityType: 'CALL' | 'EMAIL' | 'LETTER' | 'PAYMENT_RECEIVED' | 'DISPUTE' | 'NOTE';
  description: string;
  outcome?: string;
  
  amountCollected?: number;
  
  performedById: string;
  performedByName: string;
  performedAt: string;
}

export interface ReserveAccount {
  id: string;
  carrierId: string;
  carrierName: string;
  
  // Balance
  currentBalance: number;
  pendingReleases: number;
  availableBalance: number;
  
  // Totals
  totalDeposits: number;
  totalReleases: number;
  totalDeductions: number;
  
  // Status
  isActive: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface ReserveTransaction {
  id: string;
  reserveAccountId: string;
  
  type: 'DEPOSIT' | 'RELEASE' | 'DEDUCTION' | 'ADJUSTMENT';
  
  amount: number;
  runningBalance: number;
  
  // Reference
  fundedInvoiceId?: string;
  fundingNumber?: string;
  
  description: string;
  
  performedById: string;
  performedAt: string;
}

export interface FactoringDashboardData {
  // Volume
  totalFunded: number;
  fundedThisMonth: number;
  pendingSubmissions: number;
  
  // Collections
  outstandingAmount: number;
  overdueAmount: number;
  collectedThisMonth: number;
  
  // Reserves
  totalReserves: number;
  
  // Performance
  avgDaysToCollect: number;
  collectionRate: number;
  
  // Fees
  feesEarnedThisMonth: number;
  
  // Charts
  volumeByMonth: Array<{ month: string; funded: number; collected: number }>;
  agingBreakdown: Array<{ bucket: string; amount: number; count: number }>;
}

export interface FactoringRates {
  advancePercent: number;
  discountRate: number; // daily or flat
  discountType: 'DAILY' | 'FLAT';
  minFee: number;
  additionalDayRate?: number;
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/factoring/use-factoring.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  FactoringSubmission,
  FundedInvoice,
  CollectionItem,
  CollectionActivity,
  ReserveAccount,
  ReserveTransaction,
  FactoringDashboardData,
} from '@/lib/types/factoring';
import { toast } from 'sonner';

export const factoringKeys = {
  all: ['factoring'] as const,
  dashboard: () => [...factoringKeys.all, 'dashboard'] as const,
  
  submissions: () => [...factoringKeys.all, 'submissions'] as const,
  submissionsList: (params?: Record<string, unknown>) => [...factoringKeys.submissions(), 'list', params] as const,
  submissionDetail: (id: string) => [...factoringKeys.submissions(), 'detail', id] as const,
  
  funded: () => [...factoringKeys.all, 'funded'] as const,
  fundedList: (params?: Record<string, unknown>) => [...factoringKeys.funded(), 'list', params] as const,
  fundedDetail: (id: string) => [...factoringKeys.funded(), 'detail', id] as const,
  
  collections: () => [...factoringKeys.all, 'collections'] as const,
  collectionsList: (params?: Record<string, unknown>) => [...factoringKeys.collections(), 'list', params] as const,
  collectionDetail: (id: string) => [...factoringKeys.collections(), 'detail', id] as const,
  collectionActivities: (id: string) => [...factoringKeys.collections(), 'activities', id] as const,
  
  reserves: () => [...factoringKeys.all, 'reserves'] as const,
  reservesList: (params?: Record<string, unknown>) => [...factoringKeys.reserves(), 'list', params] as const,
  reserveDetail: (id: string) => [...factoringKeys.reserves(), 'detail', id] as const,
  reserveTransactions: (id: string) => [...factoringKeys.reserves(), 'transactions', id] as const,
};

// Dashboard
export function useFactoringDashboard() {
  return useQuery({
    queryKey: factoringKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: FactoringDashboardData }>('/factoring/dashboard'),
  });
}

// Submissions
export function useSubmissions(params = {}) {
  return useQuery({
    queryKey: factoringKeys.submissionsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<FactoringSubmission>>('/factoring/submissions', params),
  });
}

export function useSubmission(id: string) {
  return useQuery({
    queryKey: factoringKeys.submissionDetail(id),
    queryFn: () => apiClient.get<{ data: FactoringSubmission }>(`/factoring/submissions/${id}`),
    enabled: !!id,
  });
}

export function useApproveSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      apiClient.post(`/factoring/submissions/${id}/approve`, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: factoringKeys.submissions() });
      toast.success('Submission approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve');
    },
  });
}

export function useRejectSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.post(`/factoring/submissions/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: factoringKeys.submissions() });
      toast.success('Submission rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject');
    },
  });
}

// Fund Invoice
export function useFundInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ submissionId, advancePercent, fees }: { 
      submissionId: string; 
      advancePercent: number;
      fees?: { discountFee: number; additionalFees?: number };
    }) =>
      apiClient.post<{ data: FundedInvoice }>(`/factoring/submissions/${submissionId}/fund`, { advancePercent, fees }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: factoringKeys.submissions() });
      queryClient.invalidateQueries({ queryKey: factoringKeys.funded() });
      queryClient.invalidateQueries({ queryKey: factoringKeys.dashboard() });
      toast.success('Invoice funded');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to fund invoice');
    },
  });
}

// Funded Invoices
export function useFundedInvoices(params = {}) {
  return useQuery({
    queryKey: factoringKeys.fundedList(params),
    queryFn: () => apiClient.get<PaginatedResponse<FundedInvoice>>('/factoring/funded', params),
  });
}

export function useFundedInvoice(id: string) {
  return useQuery({
    queryKey: factoringKeys.fundedDetail(id),
    queryFn: () => apiClient.get<{ data: FundedInvoice }>(`/factoring/funded/${id}`),
    enabled: !!id,
  });
}

// Collections
export function useCollections(params = {}) {
  return useQuery({
    queryKey: factoringKeys.collectionsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<CollectionItem>>('/factoring/collections', params),
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: factoringKeys.collectionDetail(id),
    queryFn: () => apiClient.get<{ data: CollectionItem }>(`/factoring/collections/${id}`),
    enabled: !!id,
  });
}

export function useCollectionActivities(collectionId: string) {
  return useQuery({
    queryKey: factoringKeys.collectionActivities(collectionId),
    queryFn: () => apiClient.get<{ data: CollectionActivity[] }>(`/factoring/collections/${collectionId}/activities`),
    enabled: !!collectionId,
  });
}

export function useLogCollectionActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ collectionId, activity }: { collectionId: string; activity: Partial<CollectionActivity> }) =>
      apiClient.post(`/factoring/collections/${collectionId}/activities`, activity),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: factoringKeys.collectionDetail(collectionId) });
      queryClient.invalidateQueries({ queryKey: factoringKeys.collectionActivities(collectionId) });
      toast.success('Activity logged');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to log activity');
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ collectionId, amount, notes }: { collectionId: string; amount: number; notes?: string }) =>
      apiClient.post(`/factoring/collections/${collectionId}/payment`, { amount, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: factoringKeys.collections() });
      queryClient.invalidateQueries({ queryKey: factoringKeys.funded() });
      queryClient.invalidateQueries({ queryKey: factoringKeys.reserves() });
      toast.success('Payment recorded');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record payment');
    },
  });
}

export function useWriteOffCollection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ collectionId, reason }: { collectionId: string; reason: string }) =>
      apiClient.post(`/factoring/collections/${collectionId}/write-off`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: factoringKeys.collections() });
      queryClient.invalidateQueries({ queryKey: factoringKeys.funded() });
      toast.success('Collection written off');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to write off');
    },
  });
}

// Reserves
export function useReserveAccounts(params = {}) {
  return useQuery({
    queryKey: factoringKeys.reservesList(params),
    queryFn: () => apiClient.get<PaginatedResponse<ReserveAccount>>('/factoring/reserves', params),
  });
}

export function useReserveAccount(id: string) {
  return useQuery({
    queryKey: factoringKeys.reserveDetail(id),
    queryFn: () => apiClient.get<{ data: ReserveAccount }>(`/factoring/reserves/${id}`),
    enabled: !!id,
  });
}

export function useReserveTransactions(reserveId: string, params = {}) {
  return useQuery({
    queryKey: factoringKeys.reserveTransactions(reserveId),
    queryFn: () => apiClient.get<PaginatedResponse<ReserveTransaction>>(`/factoring/reserves/${reserveId}/transactions`, params),
    enabled: !!reserveId,
  });
}

export function useReleaseReserve() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reserveId, amount, description }: { reserveId: string; amount: number; description: string }) =>
      apiClient.post(`/factoring/reserves/${reserveId}/release`, { amount, description }),
    onSuccess: (_, { reserveId }) => {
      queryClient.invalidateQueries({ queryKey: factoringKeys.reserveDetail(reserveId) });
      queryClient.invalidateQueries({ queryKey: factoringKeys.reserveTransactions(reserveId) });
      toast.success('Reserve released');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to release reserve');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/factoring-store.ts`

```typescript
import { createStore } from './create-store';
import { SubmissionStatus, CollectionStatus } from '@/lib/types/factoring';

interface FactoringFilters {
  search: string;
  submissionStatus: SubmissionStatus | '';
  collectionStatus: CollectionStatus | '';
  carrierId: string;
  debtorId: string;
  dateRange: { from?: Date; to?: Date };
  overdueOnly: boolean;
}

interface FactoringState {
  filters: FactoringFilters;
  selectedSubmissionId: string | null;
  selectedFundedId: string | null;
  selectedCollectionId: string | null;
  isFundDialogOpen: boolean;
  isActivityDialogOpen: boolean;
  isPaymentDialogOpen: boolean;
  
  setFilter: <K extends keyof FactoringFilters>(key: K, value: FactoringFilters[K]) => void;
  resetFilters: () => void;
  setSelectedSubmission: (id: string | null) => void;
  setSelectedFunded: (id: string | null) => void;
  setSelectedCollection: (id: string | null) => void;
  setFundDialogOpen: (open: boolean) => void;
  setActivityDialogOpen: (open: boolean) => void;
  setPaymentDialogOpen: (open: boolean) => void;
}

const defaultFilters: FactoringFilters = {
  search: '',
  submissionStatus: '',
  collectionStatus: '',
  carrierId: '',
  debtorId: '',
  dateRange: {},
  overdueOnly: false,
};

export const useFactoringStore = createStore<FactoringState>('factoring-store', (set, get) => ({
  filters: defaultFilters,
  selectedSubmissionId: null,
  selectedFundedId: null,
  selectedCollectionId: null,
  isFundDialogOpen: false,
  isActivityDialogOpen: false,
  isPaymentDialogOpen: false,
  
  setFilter: (key, value) =>
    set({ filters: { ...get().filters, [key]: value } }),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setSelectedSubmission: (id) => set({ selectedSubmissionId: id }),
  
  setSelectedFunded: (id) => set({ selectedFundedId: id }),
  
  setSelectedCollection: (id) => set({ selectedCollectionId: id }),
  
  setFundDialogOpen: (open) => set({ isFundDialogOpen: open }),
  
  setActivityDialogOpen: (open) => set({ isActivityDialogOpen: open }),
  
  setPaymentDialogOpen: (open) => set({ isPaymentDialogOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/factoring.ts`

```typescript
import { z } from 'zod';

export const approveSubmissionSchema = z.object({
  notes: z.string().optional(),
});

export const rejectSubmissionSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
});

export const fundInvoiceSchema = z.object({
  advancePercent: z.number().min(0).max(100, 'Advance must be 0-100%'),
  discountFee: z.number().min(0, 'Fee must be positive'),
  additionalFees: z.number().min(0).optional(),
});

export const collectionActivitySchema = z.object({
  activityType: z.enum(['CALL', 'EMAIL', 'LETTER', 'PAYMENT_RECEIVED', 'DISPUTE', 'NOTE']),
  description: z.string().min(1, 'Description is required'),
  outcome: z.string().optional(),
  amountCollected: z.number().positive().optional(),
});

export const recordPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().optional(),
});

export const writeOffSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
});

export const releaseReserveSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
});

export type ApproveSubmissionData = z.infer<typeof approveSubmissionSchema>;
export type RejectSubmissionData = z.infer<typeof rejectSubmissionSchema>;
export type FundInvoiceData = z.infer<typeof fundInvoiceSchema>;
export type CollectionActivityData = z.infer<typeof collectionActivitySchema>;
export type RecordPaymentData = z.infer<typeof recordPaymentSchema>;
export type WriteOffData = z.infer<typeof writeOffSchema>;
export type ReleaseReserveData = z.infer<typeof releaseReserveSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/factoring/factoring-dashboard-stats.tsx`
- [ ] `components/factoring/volume-chart.tsx`
- [ ] `components/factoring/submissions-table.tsx`
- [ ] `components/factoring/submission-detail.tsx`
- [ ] `components/factoring/submission-review-form.tsx`
- [ ] `components/factoring/funded-invoices-table.tsx`
- [ ] `components/factoring/funded-detail.tsx`
- [ ] `components/factoring/advance-card.tsx`
- [ ] `components/factoring/fund-invoice-form.tsx`
- [ ] `components/factoring/collections-table.tsx`
- [ ] `components/factoring/collection-detail.tsx`
- [ ] `components/factoring/collection-action-form.tsx`
- [ ] `components/factoring/reserve-account-card.tsx`
- [ ] `components/factoring/reserve-transactions.tsx`
- [ ] `components/factoring/factoring-filters.tsx`
- [ ] `components/factoring/aging-by-debtor.tsx`
- [ ] `components/factoring/fee-calculator.tsx`

### Pages
- [ ] `app/(dashboard)/factoring/page.tsx`
- [ ] `app/(dashboard)/factoring/submissions/page.tsx`
- [ ] `app/(dashboard)/factoring/submissions/[id]/page.tsx`
- [ ] `app/(dashboard)/factoring/funded/page.tsx`
- [ ] `app/(dashboard)/factoring/funded/[id]/page.tsx`
- [ ] `app/(dashboard)/factoring/collections/page.tsx`
- [ ] `app/(dashboard)/factoring/reserves/page.tsx`
- [ ] `app/(dashboard)/factoring/reports/page.tsx`

### Hooks & Stores
- [ ] `lib/types/factoring.ts`
- [ ] `lib/validations/factoring.ts`
- [ ] `lib/hooks/factoring/use-factoring.ts`
- [ ] `lib/stores/factoring-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [18-analytics-ui.md](./18-analytics-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/23-service-factoring-internal.md)
- [API Review](../../api-review-docs/17-factoring-review.html)

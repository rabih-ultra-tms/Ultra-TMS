# 16 - Credit UI Implementation

> **Service:** Credit (Credit Management & Risk Assessment)  
> **Priority:** P2 - Medium  
> **Pages:** 6  
> **API Endpoints:** 18  
> **Dependencies:** Foundation ✅, Auth API ✅, Credit API ✅  
> **Doc Reference:** [14-service-credit.md](../../02-services/14-service-credit.md) (if exists)

---

## 📋 Overview

The Credit UI provides interfaces for managing customer credit assessments, credit limits, credit holds, and payment risk analysis. This includes credit applications, limit adjustments, and credit monitoring.

### Key Screens
- Credit dashboard
- Customer credit profiles
- Credit applications
- Credit limit management
- Credit holds
- Risk monitoring
- Payment history analysis

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] CRM prompt (02) is complete
- [ ] Credit API is deployed

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── credit/
│   ├── page.tsx                    # Credit dashboard
│   ├── customers/
│   │   ├── page.tsx                # Customer credit list
│   │   └── [id]/
│   │       └── page.tsx            # Customer credit profile
│   ├── applications/
│   │   ├── page.tsx                # Credit applications
│   │   └── [id]/
│   │       └── page.tsx            # Application review
│   ├── holds/
│   │   └── page.tsx                # Credit holds
│   └── reports/
│       └── page.tsx                # Credit reports
```

---

## 🎨 Components to Create

```
components/credit/
├── credit-dashboard-stats.tsx      # Dashboard metrics
├── credit-risk-chart.tsx           # Risk distribution
├── customer-credit-table.tsx       # Credit profiles list
├── customer-credit-card.tsx        # Credit summary
├── credit-profile-detail.tsx       # Full credit view
├── credit-score-badge.tsx          # Score indicator
├── credit-limit-form.tsx           # Adjust limit
├── credit-application-form.tsx     # New application
├── application-review.tsx          # Review interface
├── credit-history-timeline.tsx     # Credit history
├── payment-history-table.tsx       # Payment patterns
├── credit-hold-card.tsx            # Hold status
├── credit-hold-form.tsx            # Place/release hold
├── aging-analysis.tsx              # AR aging
├── credit-alerts.tsx               # Risk alerts
├── credit-filters.tsx              # Filter controls
└── credit-notes.tsx                # Notes/comments
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/credit.ts`

```typescript
export type CreditStatus = 
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'CONDITIONAL'
  | 'DENIED'
  | 'SUSPENDED'
  | 'ON_HOLD';

export type CreditRiskLevel = 
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type CreditHoldReason = 
  | 'PAST_DUE'
  | 'OVER_LIMIT'
  | 'RETURNED_PAYMENT'
  | 'FRAUD_SUSPECTED'
  | 'MANUAL_REVIEW'
  | 'OTHER';

export interface CustomerCredit {
  id: string;
  customerId: string;
  customerName: string;
  
  // Status
  status: CreditStatus;
  riskLevel: CreditRiskLevel;
  
  // Limits
  creditLimit: number;
  availableCredit: number;
  usedCredit: number;
  utilizationPercent: number;
  
  // Score
  creditScore?: number;
  lastScoreUpdate?: string;
  
  // Terms
  paymentTerms: string;
  paymentTermsDays: number;
  
  // History
  avgDaysToPay: number;
  onTimePaymentRate: number;
  totalPaid: number;
  totalOutstanding: number;
  
  // Aging
  aging: AgingBuckets;
  
  // Hold
  isOnHold: boolean;
  holdReason?: CreditHoldReason;
  holdPlacedAt?: string;
  holdPlacedBy?: string;
  holdNotes?: string;
  
  // Dates
  lastReviewDate?: string;
  nextReviewDate?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface AgingBuckets {
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  over90: number;
}

export interface CreditApplication {
  id: string;
  customerId: string;
  customerName: string;
  
  // Request
  requestedLimit: number;
  requestedTerms: string;
  
  // Status
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'DENIED' | 'WITHDRAWN';
  
  // Review
  assignedToId?: string;
  assignedToName?: string;
  
  // Business Info
  businessInfo: {
    yearsInBusiness: number;
    annualRevenue: number;
    employeeCount: number;
    industry: string;
  };
  
  // Trade References
  tradeReferences: TradeReference[];
  
  // Bank Reference
  bankReference?: {
    bankName: string;
    accountType: string;
    accountNumber: string;
    routingNumber: string;
  };
  
  // Documents
  documents: { name: string; url: string }[];
  
  // Decision
  approvedLimit?: number;
  approvedTerms?: string;
  decisionNotes?: string;
  decidedById?: string;
  decidedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface TradeReference {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  creditLimit?: number;
  paymentHistory?: string;
  verified: boolean;
  verifiedAt?: string;
}

export interface CreditHold {
  id: string;
  customerId: string;
  customerName: string;
  
  reason: CreditHoldReason;
  notes?: string;
  
  placedById: string;
  placedByName: string;
  placedAt: string;
  
  releasedById?: string;
  releasedByName?: string;
  releasedAt?: string;
  releaseNotes?: string;
  
  // Impact
  blockedOrders: number;
  blockedAmount: number;
}

export interface CreditLimitChange {
  id: string;
  customerId: string;
  
  previousLimit: number;
  newLimit: number;
  changeAmount: number;
  changePercent: number;
  
  reason: string;
  
  changedById: string;
  changedByName: string;
  changedAt: string;
  
  approvedById?: string;
  approvedAt?: string;
}

export interface PaymentHistoryEntry {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paidDate?: string;
  
  amount: number;
  amountPaid: number;
  
  daysToPay: number;
  wasLate: boolean;
  daysLate: number;
}

export interface CreditDashboardData {
  totalCustomers: number;
  totalCreditExtended: number;
  totalOutstanding: number;
  utilizationRate: number;
  pendingApplications: number;
  customersOnHold: number;
  highRiskCustomers: number;
  avgDaysToPay: number;
  riskDistribution: { level: CreditRiskLevel; count: number }[];
  agingSummary: AgingBuckets;
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/credit/use-credit.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  CustomerCredit,
  CreditApplication,
  CreditHold,
  CreditLimitChange,
  PaymentHistoryEntry,
  CreditDashboardData,
} from '@/lib/types/credit';
import { toast } from 'sonner';

export const creditKeys = {
  all: ['credit'] as const,
  dashboard: () => [...creditKeys.all, 'dashboard'] as const,
  
  customers: () => [...creditKeys.all, 'customers'] as const,
  customersList: (params?: Record<string, unknown>) => [...creditKeys.customers(), 'list', params] as const,
  customerDetail: (id: string) => [...creditKeys.customers(), 'detail', id] as const,
  customerHistory: (id: string) => [...creditKeys.customers(), 'history', id] as const,
  
  applications: () => [...creditKeys.all, 'applications'] as const,
  applicationsList: (params?: Record<string, unknown>) => [...creditKeys.applications(), 'list', params] as const,
  applicationDetail: (id: string) => [...creditKeys.applications(), 'detail', id] as const,
  
  holds: () => [...creditKeys.all, 'holds'] as const,
  holdsList: (params?: Record<string, unknown>) => [...creditKeys.holds(), 'list', params] as const,
};

// Dashboard
export function useCreditDashboard() {
  return useQuery({
    queryKey: creditKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: CreditDashboardData }>('/credit/dashboard'),
  });
}

// Customer Credits
export function useCustomerCredits(params = {}) {
  return useQuery({
    queryKey: creditKeys.customersList(params),
    queryFn: () => apiClient.get<PaginatedResponse<CustomerCredit>>('/credit/customers', params),
  });
}

export function useCustomerCredit(customerId: string) {
  return useQuery({
    queryKey: creditKeys.customerDetail(customerId),
    queryFn: () => apiClient.get<{ data: CustomerCredit }>(`/credit/customers/${customerId}`),
    enabled: !!customerId,
  });
}

export function usePaymentHistory(customerId: string, params = {}) {
  return useQuery({
    queryKey: creditKeys.customerHistory(customerId),
    queryFn: () => apiClient.get<PaginatedResponse<PaymentHistoryEntry>>(`/credit/customers/${customerId}/payments`, params),
    enabled: !!customerId,
  });
}

// Adjust Credit Limit
export function useAdjustCreditLimit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, newLimit, reason }: { 
      customerId: string; 
      newLimit: number; 
      reason: string;
    }) =>
      apiClient.post<{ data: CustomerCredit }>(`/credit/customers/${customerId}/limit`, { newLimit, reason }),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: creditKeys.customerDetail(customerId) });
      queryClient.invalidateQueries({ queryKey: creditKeys.customers() });
      toast.success('Credit limit updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update credit limit');
    },
  });
}

// Update Payment Terms
export function useUpdatePaymentTerms() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, paymentTerms, paymentTermsDays }: { 
      customerId: string; 
      paymentTerms: string;
      paymentTermsDays: number;
    }) =>
      apiClient.patch(`/credit/customers/${customerId}/terms`, { paymentTerms, paymentTermsDays }),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: creditKeys.customerDetail(customerId) });
      toast.success('Payment terms updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update terms');
    },
  });
}

// Credit Applications
export function useCreditApplications(params = {}) {
  return useQuery({
    queryKey: creditKeys.applicationsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<CreditApplication>>('/credit/applications', params),
  });
}

export function useCreditApplication(id: string) {
  return useQuery({
    queryKey: creditKeys.applicationDetail(id),
    queryFn: () => apiClient.get<{ data: CreditApplication }>(`/credit/applications/${id}`),
    enabled: !!id,
  });
}

export function useCreateCreditApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<CreditApplication>) =>
      apiClient.post<{ data: CreditApplication }>('/credit/applications', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditKeys.applications() });
      toast.success('Application submitted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit application');
    },
  });
}

export function useApproveApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, approvedLimit, approvedTerms, notes }: { 
      id: string; 
      approvedLimit: number;
      approvedTerms: string;
      notes?: string;
    }) =>
      apiClient.post(`/credit/applications/${id}/approve`, { approvedLimit, approvedTerms, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditKeys.applications() });
      queryClient.invalidateQueries({ queryKey: creditKeys.customers() });
      toast.success('Application approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve application');
    },
  });
}

export function useDenyApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.post(`/credit/applications/${id}/deny`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditKeys.applications() });
      toast.success('Application denied');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to deny application');
    },
  });
}

// Credit Holds
export function useCreditHolds(params = {}) {
  return useQuery({
    queryKey: creditKeys.holdsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<CreditHold>>('/credit/holds', params),
  });
}

export function usePlaceCreditHold() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, reason, notes }: { 
      customerId: string; 
      reason: string;
      notes?: string;
    }) =>
      apiClient.post<{ data: CreditHold }>('/credit/holds', { customerId, reason, notes }),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: creditKeys.customerDetail(customerId) });
      queryClient.invalidateQueries({ queryKey: creditKeys.holds() });
      toast.success('Credit hold placed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to place hold');
    },
  });
}

export function useReleaseCreditHold() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ holdId, notes }: { holdId: string; notes?: string }) =>
      apiClient.post(`/credit/holds/${holdId}/release`, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditKeys.holds() });
      queryClient.invalidateQueries({ queryKey: creditKeys.customers() });
      toast.success('Credit hold released');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to release hold');
    },
  });
}

// Verify Trade Reference
export function useVerifyTradeReference() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ applicationId, referenceId, verified, notes }: { 
      applicationId: string;
      referenceId: string;
      verified: boolean;
      notes?: string;
    }) =>
      apiClient.post(`/credit/applications/${applicationId}/references/${referenceId}/verify`, { verified, notes }),
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: creditKeys.applicationDetail(applicationId) });
      toast.success('Reference verified');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify reference');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/credit-store.ts`

```typescript
import { createStore } from './create-store';
import { CreditStatus, CreditRiskLevel } from '@/lib/types/credit';

interface CreditFilters {
  search: string;
  status: CreditStatus | '';
  riskLevel: CreditRiskLevel | '';
  onHold: boolean | null;
  overLimit: boolean | null;
}

interface CreditState {
  filters: CreditFilters;
  selectedCustomerId: string | null;
  selectedApplicationId: string | null;
  isLimitDialogOpen: boolean;
  isHoldDialogOpen: boolean;
  isApplicationDialogOpen: boolean;
  
  setFilter: <K extends keyof CreditFilters>(key: K, value: CreditFilters[K]) => void;
  resetFilters: () => void;
  setSelectedCustomer: (id: string | null) => void;
  setSelectedApplication: (id: string | null) => void;
  setLimitDialogOpen: (open: boolean) => void;
  setHoldDialogOpen: (open: boolean) => void;
  setApplicationDialogOpen: (open: boolean) => void;
}

const defaultFilters: CreditFilters = {
  search: '',
  status: '',
  riskLevel: '',
  onHold: null,
  overLimit: null,
};

export const useCreditStore = createStore<CreditState>('credit-store', (set, get) => ({
  filters: defaultFilters,
  selectedCustomerId: null,
  selectedApplicationId: null,
  isLimitDialogOpen: false,
  isHoldDialogOpen: false,
  isApplicationDialogOpen: false,
  
  setFilter: (key, value) =>
    set({ filters: { ...get().filters, [key]: value } }),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setSelectedCustomer: (id) => set({ selectedCustomerId: id }),
  
  setSelectedApplication: (id) => set({ selectedApplicationId: id }),
  
  setLimitDialogOpen: (open) => set({ isLimitDialogOpen: open }),
  
  setHoldDialogOpen: (open) => set({ isHoldDialogOpen: open }),
  
  setApplicationDialogOpen: (open) => set({ isApplicationDialogOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/credit.ts`

```typescript
import { z } from 'zod';

export const creditLimitSchema = z.object({
  newLimit: z.number().positive('Limit must be positive'),
  reason: z.string().min(1, 'Reason is required'),
});

export const paymentTermsSchema = z.object({
  paymentTerms: z.string().min(1, 'Terms are required'),
  paymentTermsDays: z.number().int().positive('Days must be positive'),
});

export const creditHoldSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  reason: z.enum(['PAST_DUE', 'OVER_LIMIT', 'RETURNED_PAYMENT', 'FRAUD_SUSPECTED', 'MANUAL_REVIEW', 'OTHER']),
  notes: z.string().optional(),
});

export const releaseHoldSchema = z.object({
  notes: z.string().optional(),
});

const tradeReferenceSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  phone: z.string().min(10, 'Phone is required'),
  email: z.string().email('Invalid email'),
  creditLimit: z.number().positive().optional(),
});

export const creditApplicationSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  requestedLimit: z.number().positive('Limit must be positive'),
  requestedTerms: z.string().min(1, 'Terms are required'),
  businessInfo: z.object({
    yearsInBusiness: z.number().int().min(0),
    annualRevenue: z.number().positive(),
    employeeCount: z.number().int().positive(),
    industry: z.string().min(1, 'Industry is required'),
  }),
  tradeReferences: z.array(tradeReferenceSchema).min(2, 'At least 2 trade references required'),
  bankReference: z.object({
    bankName: z.string().min(1, 'Bank name is required'),
    accountType: z.string().min(1, 'Account type is required'),
    accountNumber: z.string().min(1, 'Account number is required'),
    routingNumber: z.string().min(9, 'Routing number is required'),
  }).optional(),
});

export const approveApplicationSchema = z.object({
  approvedLimit: z.number().positive('Limit must be positive'),
  approvedTerms: z.string().min(1, 'Terms are required'),
  notes: z.string().optional(),
});

export const denyApplicationSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
});

export type CreditLimitData = z.infer<typeof creditLimitSchema>;
export type PaymentTermsData = z.infer<typeof paymentTermsSchema>;
export type CreditHoldData = z.infer<typeof creditHoldSchema>;
export type ReleaseHoldData = z.infer<typeof releaseHoldSchema>;
export type CreditApplicationData = z.infer<typeof creditApplicationSchema>;
export type ApproveApplicationData = z.infer<typeof approveApplicationSchema>;
export type DenyApplicationData = z.infer<typeof denyApplicationSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/credit/credit-dashboard-stats.tsx`
- [ ] `components/credit/credit-risk-chart.tsx`
- [ ] `components/credit/customer-credit-table.tsx`
- [ ] `components/credit/customer-credit-card.tsx`
- [ ] `components/credit/credit-profile-detail.tsx`
- [ ] `components/credit/credit-score-badge.tsx`
- [ ] `components/credit/credit-limit-form.tsx`
- [ ] `components/credit/credit-application-form.tsx`
- [ ] `components/credit/application-review.tsx`
- [ ] `components/credit/credit-history-timeline.tsx`
- [ ] `components/credit/payment-history-table.tsx`
- [ ] `components/credit/credit-hold-card.tsx`
- [ ] `components/credit/credit-hold-form.tsx`
- [ ] `components/credit/aging-analysis.tsx`
- [ ] `components/credit/credit-alerts.tsx`
- [ ] `components/credit/credit-filters.tsx`
- [ ] `components/credit/credit-notes.tsx`

### Pages
- [ ] `app/(dashboard)/credit/page.tsx`
- [ ] `app/(dashboard)/credit/customers/page.tsx`
- [ ] `app/(dashboard)/credit/customers/[id]/page.tsx`
- [ ] `app/(dashboard)/credit/applications/page.tsx`
- [ ] `app/(dashboard)/credit/applications/[id]/page.tsx`
- [ ] `app/(dashboard)/credit/holds/page.tsx`
- [ ] `app/(dashboard)/credit/reports/page.tsx`

### Hooks & Stores
- [ ] `lib/types/credit.ts`
- [ ] `lib/validations/credit.ts`
- [ ] `lib/hooks/credit/use-credit.ts`
- [ ] `lib/stores/credit-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [17-factoring-ui.md](./17-factoring-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [API Review](../../api-review-docs/16-credit-review.html)

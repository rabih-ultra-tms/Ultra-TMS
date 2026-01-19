# 14 - Contracts UI Implementation

> **Service:** Contracts (Customer & Carrier Contracts)  
> **Priority:** P2 - Medium  
> **Pages:** 7  
> **API Endpoints:** 22  
> **Dependencies:** Foundation ✅, Auth API ✅, Contracts API ✅  
> **Doc Reference:** [21-service-contracts.md](../../02-services/21-service-contracts.md)

---

## 📋 Overview

The Contracts UI provides interfaces for managing customer and carrier contracts, rate agreements, lane pricing, and contract renewals. This includes contract creation, approval workflows, and rate management.

### Key Screens
- Contracts dashboard
- Customer contracts list and detail
- Carrier contracts list and detail
- Create/edit contract
- Lane rates management
- Contract approval workflow
- Renewal management

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Contracts API is deployed

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── contracts/
│   ├── page.tsx                    # Contracts dashboard
│   ├── customers/
│   │   ├── page.tsx                # Customer contracts
│   │   ├── new/
│   │   │   └── page.tsx            # New contract
│   │   └── [id]/
│   │       ├── page.tsx            # Contract detail
│   │       └── edit/
│   │           └── page.tsx        # Edit contract
│   ├── carriers/
│   │   ├── page.tsx                # Carrier contracts
│   │   ├── new/
│   │   │   └── page.tsx            # New contract
│   │   └── [id]/
│   │       ├── page.tsx            # Contract detail
│   │       └── edit/
│   │           └── page.tsx        # Edit contract
│   ├── rates/
│   │   └── page.tsx                # Lane rates
│   └── approvals/
│       └── page.tsx                # Pending approvals
```

---

## 🎨 Components to Create

```
components/contracts/
├── contracts-dashboard-stats.tsx   # Dashboard metrics
├── customer-contracts-table.tsx    # Customer contracts list
├── carrier-contracts-table.tsx     # Carrier contracts list
├── contract-card.tsx               # Contract summary
├── contract-form.tsx               # Create/edit form
├── contract-detail.tsx             # Full contract view
├── contract-status-badge.tsx       # Status indicator
├── contract-timeline.tsx           # Approval history
├── lane-rates-table.tsx            # Lane pricing
├── lane-rate-form.tsx              # Add/edit lane rate
├── rate-escalation-card.tsx        # Rate escalation rules
├── fuel-surcharge-table.tsx        # FSC schedule
├── accessorial-rates-table.tsx     # Accessorial pricing
├── approval-queue.tsx              # Pending approvals
├── approval-actions.tsx            # Approve/reject
├── contract-renewal-card.tsx       # Renewal status
├── contract-compare.tsx            # Compare versions
├── contract-filters.tsx            # Filter controls
└── expiring-contracts-alert.tsx    # Expiration warnings
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/contracts.ts`

```typescript
export type ContractType = 'CUSTOMER' | 'CARRIER';

export type ContractStatus = 
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'TERMINATED';

export interface Contract {
  id: string;
  contractNumber: string;
  type: ContractType;
  status: ContractStatus;
  
  // Party
  partyId: string;
  partyName: string;
  partyType: 'CUSTOMER' | 'CARRIER';
  
  // Terms
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  renewalTermDays?: number;
  terminationNoticeDays: number;
  
  // Rates
  rateType: 'CONTRACTED' | 'SPOT' | 'HYBRID';
  laneRates: LaneRate[];
  accessorialRates: AccessorialRate[];
  fuelSurcharge?: FuelSurchargeSchedule;
  
  // Payment
  paymentTerms: string;
  creditLimit?: number;
  
  // Documents
  documentUrl?: string;
  amendments: ContractAmendment[];
  
  // Approval
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdById: string;
  version: number;
}

export interface LaneRate {
  id: string;
  contractId: string;
  
  // Lane
  originCity: string;
  originState: string;
  originZip?: string;
  originRadius?: number;
  destinationCity: string;
  destinationState: string;
  destinationZip?: string;
  destinationRadius?: number;
  
  // Rate
  rateType: 'FLAT' | 'PER_MILE' | 'MIN_PLUS_MILE';
  flatRate?: number;
  ratePerMile?: number;
  minimumCharge?: number;
  
  // Equipment
  equipmentType: string;
  
  // Volume
  minVolume?: number;
  maxVolume?: number;
  volumeDiscount?: number;
  
  // Validity
  effectiveDate: string;
  expirationDate?: string;
  
  isActive: boolean;
}

export interface AccessorialRate {
  id: string;
  contractId: string;
  
  code: string;
  name: string;
  description?: string;
  
  rateType: 'FLAT' | 'PER_HOUR' | 'PERCENTAGE';
  rate: number;
  minimumCharge?: number;
  
  isActive: boolean;
}

export interface FuelSurchargeSchedule {
  id: string;
  contractId: string;
  
  type: 'DOE_BASED' | 'FIXED' | 'CUSTOM';
  baseFuelPrice: number;
  
  tiers: FuelSurchargeTier[];
  
  effectiveDate: string;
}

export interface FuelSurchargeTier {
  minPrice: number;
  maxPrice: number;
  surchargePercent: number;
}

export interface ContractAmendment {
  id: string;
  contractId: string;
  
  amendmentNumber: number;
  description: string;
  changes: string;
  
  effectiveDate: string;
  approvedById?: string;
  approvedAt?: string;
  
  documentUrl?: string;
  
  createdAt: string;
}

export interface ContractApproval {
  id: string;
  contractId: string;
  contractNumber: string;
  contractType: ContractType;
  partyName: string;
  
  requestedById: string;
  requestedByName: string;
  requestedAt: string;
  
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  
  changes?: string;
}

export interface ContractDashboardData {
  activeCustomerContracts: number;
  activeCarrierContracts: number;
  pendingApprovals: number;
  expiringThisMonth: number;
  renewalsPending: number;
  totalContractValue: number;
  expiringContracts: Contract[];
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/contracts/use-contracts.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  Contract,
  LaneRate,
  ContractApproval,
  ContractDashboardData,
} from '@/lib/types/contracts';
import { toast } from 'sonner';

export const contractKeys = {
  all: ['contracts'] as const,
  dashboard: () => [...contractKeys.all, 'dashboard'] as const,
  
  customer: () => [...contractKeys.all, 'customer'] as const,
  customerList: (params?: Record<string, unknown>) => [...contractKeys.customer(), 'list', params] as const,
  customerDetail: (id: string) => [...contractKeys.customer(), 'detail', id] as const,
  
  carrier: () => [...contractKeys.all, 'carrier'] as const,
  carrierList: (params?: Record<string, unknown>) => [...contractKeys.carrier(), 'list', params] as const,
  carrierDetail: (id: string) => [...contractKeys.carrier(), 'detail', id] as const,
  
  laneRates: (contractId: string) => [...contractKeys.all, 'lane-rates', contractId] as const,
  
  approvals: () => [...contractKeys.all, 'approvals'] as const,
};

// Dashboard
export function useContractsDashboard() {
  return useQuery({
    queryKey: contractKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: ContractDashboardData }>('/contracts/dashboard'),
  });
}

// Customer Contracts
export function useCustomerContracts(params = {}) {
  return useQuery({
    queryKey: contractKeys.customerList(params),
    queryFn: () => apiClient.get<PaginatedResponse<Contract>>('/contracts/customer', params),
  });
}

export function useCustomerContract(id: string) {
  return useQuery({
    queryKey: contractKeys.customerDetail(id),
    queryFn: () => apiClient.get<{ data: Contract }>(`/contracts/customer/${id}`),
    enabled: !!id,
  });
}

export function useCreateCustomerContract() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Contract>) =>
      apiClient.post<{ data: Contract }>('/contracts/customer', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.customer() });
      queryClient.invalidateQueries({ queryKey: contractKeys.dashboard() });
      toast.success('Contract created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create contract');
    },
  });
}

export function useUpdateCustomerContract() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contract> }) =>
      apiClient.patch<{ data: Contract }>(`/contracts/customer/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.customerDetail(id) });
      queryClient.invalidateQueries({ queryKey: contractKeys.customer() });
      toast.success('Contract updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update contract');
    },
  });
}

// Carrier Contracts
export function useCarrierContracts(params = {}) {
  return useQuery({
    queryKey: contractKeys.carrierList(params),
    queryFn: () => apiClient.get<PaginatedResponse<Contract>>('/contracts/carrier', params),
  });
}

export function useCarrierContract(id: string) {
  return useQuery({
    queryKey: contractKeys.carrierDetail(id),
    queryFn: () => apiClient.get<{ data: Contract }>(`/contracts/carrier/${id}`),
    enabled: !!id,
  });
}

export function useCreateCarrierContract() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Contract>) =>
      apiClient.post<{ data: Contract }>('/contracts/carrier', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.carrier() });
      queryClient.invalidateQueries({ queryKey: contractKeys.dashboard() });
      toast.success('Contract created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create contract');
    },
  });
}

// Lane Rates
export function useLaneRates(contractId: string) {
  return useQuery({
    queryKey: contractKeys.laneRates(contractId),
    queryFn: () => apiClient.get<{ data: LaneRate[] }>(`/contracts/${contractId}/lanes`),
    enabled: !!contractId,
  });
}

export function useAddLaneRate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contractId, data }: { contractId: string; data: Partial<LaneRate> }) =>
      apiClient.post<{ data: LaneRate }>(`/contracts/${contractId}/lanes`, data),
    onSuccess: (_, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.laneRates(contractId) });
      toast.success('Lane rate added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add lane rate');
    },
  });
}

export function useUpdateLaneRate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contractId, laneId, data }: { contractId: string; laneId: string; data: Partial<LaneRate> }) =>
      apiClient.patch<{ data: LaneRate }>(`/contracts/${contractId}/lanes/${laneId}`, data),
    onSuccess: (_, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.laneRates(contractId) });
      toast.success('Lane rate updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update lane rate');
    },
  });
}

// Approvals
export function usePendingApprovals() {
  return useQuery({
    queryKey: contractKeys.approvals(),
    queryFn: () => apiClient.get<{ data: ContractApproval[] }>('/contracts/approvals'),
  });
}

export function useApproveContract() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contractId, notes }: { contractId: string; notes?: string }) =>
      apiClient.post(`/contracts/${contractId}/approve`, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
      toast.success('Contract approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve contract');
    },
  });
}

export function useRejectContract() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contractId, reason }: { contractId: string; reason: string }) =>
      apiClient.post(`/contracts/${contractId}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
      toast.success('Contract rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject contract');
    },
  });
}

// Submit for Approval
export function useSubmitForApproval() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contractId: string) =>
      apiClient.post(`/contracts/${contractId}/submit`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
      toast.success('Submitted for approval');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit');
    },
  });
}

// Renewal
export function useRenewContract() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contractId, newEndDate }: { contractId: string; newEndDate: string }) =>
      apiClient.post<{ data: Contract }>(`/contracts/${contractId}/renew`, { newEndDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
      toast.success('Contract renewed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to renew contract');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/contracts-store.ts`

```typescript
import { createStore } from './create-store';
import { ContractType, ContractStatus } from '@/lib/types/contracts';

interface ContractFilters {
  search: string;
  type: ContractType | '';
  status: ContractStatus | '';
  partyId: string;
  expiringWithin: number | null;
}

interface ContractsState {
  filters: ContractFilters;
  selectedContractId: string | null;
  isLaneRateDialogOpen: boolean;
  isApprovalDialogOpen: boolean;
  
  setFilter: <K extends keyof ContractFilters>(key: K, value: ContractFilters[K]) => void;
  resetFilters: () => void;
  setSelectedContract: (id: string | null) => void;
  setLaneRateDialogOpen: (open: boolean) => void;
  setApprovalDialogOpen: (open: boolean) => void;
}

const defaultFilters: ContractFilters = {
  search: '',
  type: '',
  status: '',
  partyId: '',
  expiringWithin: null,
};

export const useContractsStore = createStore<ContractsState>('contracts-store', (set, get) => ({
  filters: defaultFilters,
  selectedContractId: null,
  isLaneRateDialogOpen: false,
  isApprovalDialogOpen: false,
  
  setFilter: (key, value) =>
    set({ filters: { ...get().filters, [key]: value } }),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setSelectedContract: (id) => set({ selectedContractId: id }),
  
  setLaneRateDialogOpen: (open) => set({ isLaneRateDialogOpen: open }),
  
  setApprovalDialogOpen: (open) => set({ isApprovalDialogOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/contracts.ts`

```typescript
import { z } from 'zod';

export const contractFormSchema = z.object({
  partyId: z.string().min(1, 'Party is required'),
  name: z.string().min(1, 'Contract name is required'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  autoRenew: z.boolean().default(false),
  renewalTermDays: z.number().int().positive().optional(),
  terminationNoticeDays: z.number().int().positive().default(30),
  rateType: z.enum(['CONTRACTED', 'SPOT', 'HYBRID']),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  creditLimit: z.number().positive().optional(),
});

export const laneRateFormSchema = z.object({
  originCity: z.string().min(1, 'Origin city is required'),
  originState: z.string().min(2, 'Origin state is required'),
  originZip: z.string().optional(),
  originRadius: z.number().positive().optional(),
  destinationCity: z.string().min(1, 'Destination city is required'),
  destinationState: z.string().min(2, 'Destination state is required'),
  destinationZip: z.string().optional(),
  destinationRadius: z.number().positive().optional(),
  rateType: z.enum(['FLAT', 'PER_MILE', 'MIN_PLUS_MILE']),
  flatRate: z.number().positive().optional(),
  ratePerMile: z.number().positive().optional(),
  minimumCharge: z.number().positive().optional(),
  equipmentType: z.string().min(1, 'Equipment type is required'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  expirationDate: z.string().optional(),
});

export const accessorialRateSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  rateType: z.enum(['FLAT', 'PER_HOUR', 'PERCENTAGE']),
  rate: z.number().positive('Rate must be positive'),
  minimumCharge: z.number().positive().optional(),
});

export const approvalActionSchema = z.object({
  notes: z.string().optional(),
});

export const rejectionSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
});

export type ContractFormData = z.infer<typeof contractFormSchema>;
export type LaneRateFormData = z.infer<typeof laneRateFormSchema>;
export type AccessorialRateData = z.infer<typeof accessorialRateSchema>;
export type ApprovalActionData = z.infer<typeof approvalActionSchema>;
export type RejectionData = z.infer<typeof rejectionSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/contracts/contracts-dashboard-stats.tsx`
- [ ] `components/contracts/customer-contracts-table.tsx`
- [ ] `components/contracts/carrier-contracts-table.tsx`
- [ ] `components/contracts/contract-card.tsx`
- [ ] `components/contracts/contract-form.tsx`
- [ ] `components/contracts/contract-detail.tsx`
- [ ] `components/contracts/contract-status-badge.tsx`
- [ ] `components/contracts/contract-timeline.tsx`
- [ ] `components/contracts/lane-rates-table.tsx`
- [ ] `components/contracts/lane-rate-form.tsx`
- [ ] `components/contracts/rate-escalation-card.tsx`
- [ ] `components/contracts/fuel-surcharge-table.tsx`
- [ ] `components/contracts/accessorial-rates-table.tsx`
- [ ] `components/contracts/approval-queue.tsx`
- [ ] `components/contracts/approval-actions.tsx`
- [ ] `components/contracts/contract-renewal-card.tsx`
- [ ] `components/contracts/contract-compare.tsx`
- [ ] `components/contracts/contract-filters.tsx`
- [ ] `components/contracts/expiring-contracts-alert.tsx`

### Pages
- [ ] `app/(dashboard)/contracts/page.tsx`
- [ ] `app/(dashboard)/contracts/customers/page.tsx`
- [ ] `app/(dashboard)/contracts/customers/new/page.tsx`
- [ ] `app/(dashboard)/contracts/customers/[id]/page.tsx`
- [ ] `app/(dashboard)/contracts/customers/[id]/edit/page.tsx`
- [ ] `app/(dashboard)/contracts/carriers/page.tsx`
- [ ] `app/(dashboard)/contracts/carriers/new/page.tsx`
- [ ] `app/(dashboard)/contracts/carriers/[id]/page.tsx`
- [ ] `app/(dashboard)/contracts/carriers/[id]/edit/page.tsx`
- [ ] `app/(dashboard)/contracts/rates/page.tsx`
- [ ] `app/(dashboard)/contracts/approvals/page.tsx`

### Hooks & Stores
- [ ] `lib/types/contracts.ts`
- [ ] `lib/validations/contracts.ts`
- [ ] `lib/hooks/contracts/use-contracts.ts`
- [ ] `lib/stores/contracts-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [15-agents-ui.md](./15-agents-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/21-service-contracts.md)
- [API Review](../../api-review-docs/14-contracts-review.html)

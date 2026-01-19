# 09 - Claims UI Implementation

> **Service:** Claims (Cargo Claims & OS&D Management)  
> **Priority:** P2 - Medium  
> **Pages:** 7  
> **API Endpoints:** 22  
> **Dependencies:** Foundation ✅, Auth API ✅, TMS Core API ✅, Carrier API ✅, Claims API ✅  
> **Doc Reference:** [16-service-claims.md](../../02-services/16-service-claims.md)

---

## 📋 Overview

The Claims UI provides interfaces for managing cargo claims, overages, shortages, and damages (OS&D). This includes filing claims, tracking claim status, managing investigations, and processing settlements.

### Key Screens
- Claims dashboard
- Claims list
- File new claim
- Claim detail/investigation
- OS&D reports
- Claim settlement

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Claims API is deployed
- [ ] Documents API is accessible (for attachments)

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── claims/
│   ├── page.tsx                    # Claims dashboard
│   ├── new/
│   │   └── page.tsx                # File new claim
│   ├── list/
│   │   └── page.tsx                # All claims list
│   ├── [id]/
│   │   ├── page.tsx                # Claim detail
│   │   └── edit/
│   │       └── page.tsx            # Edit claim
│   ├── osd/
│   │   └── page.tsx                # OS&D reports
│   └── reports/
│       └── page.tsx                # Claim analytics
```

---

## 🎨 Components to Create

```
components/claims/
├── claims-dashboard-stats.tsx      # Dashboard metrics
├── claims-table.tsx                # Claims list
├── claims-columns.tsx              # Column definitions
├── claim-form.tsx                  # File/edit claim
├── claim-detail-card.tsx           # Claim overview
├── claim-status-badge.tsx          # Status indicator
├── claim-timeline.tsx              # Status history
├── claim-attachments.tsx           # Documents
├── claim-investigation.tsx         # Investigation notes
├── claim-settlement-form.tsx       # Settlement processing
├── claim-party-card.tsx            # Involved parties
├── osd-report-form.tsx             # OS&D report
├── osd-table.tsx                   # OS&D list
├── claim-filters.tsx               # Filter controls
└── claim-notes.tsx                 # Notes/comments
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/claims.ts`

```typescript
export type ClaimType = 
  | 'DAMAGE'
  | 'SHORTAGE'
  | 'OVERAGE'
  | 'LOSS'
  | 'DELAY'
  | 'CONTAMINATION'
  | 'TEMPERATURE'
  | 'OTHER';

export type ClaimStatus = 
  | 'DRAFT'
  | 'FILED'
  | 'UNDER_INVESTIGATION'
  | 'PENDING_CARRIER'
  | 'PENDING_CUSTOMER'
  | 'APPROVED'
  | 'DENIED'
  | 'SETTLED'
  | 'CLOSED';

export type ClaimPartyType = 
  | 'CUSTOMER'
  | 'CARRIER'
  | 'SHIPPER'
  | 'CONSIGNEE'
  | 'BROKER';

export interface Claim {
  id: string;
  claimNumber: string;
  type: ClaimType;
  status: ClaimStatus;
  
  // Reference
  loadId: string;
  loadNumber: string;
  orderId: string;
  orderNumber: string;
  
  // Carrier
  carrierId: string;
  carrierName: string;
  
  // Customer
  customerId: string;
  customerName: string;
  
  // Description
  description: string;
  incidentDate: string;
  reportedDate: string;
  location?: string;
  
  // Amounts
  claimedAmount: number;
  approvedAmount?: number;
  settledAmount?: number;
  
  // Investigation
  investigationNotes?: string;
  rootCause?: string;
  
  // Parties
  parties: ClaimParty[];
  
  // Documents
  documentCount: number;
  
  // Timeline
  filedAt?: string;
  resolvedAt?: string;
  
  // Assignment
  assignedToId?: string;
  assignedToName?: string;
  
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

export interface ClaimParty {
  id: string;
  type: ClaimPartyType;
  name: string;
  email?: string;
  phone?: string;
  contactName?: string;
  liabilityPercent?: number;
  notes?: string;
}

export interface ClaimDocument {
  id: string;
  claimId: string;
  name: string;
  type: string;
  description?: string;
  url: string;
  uploadedAt: string;
  uploadedById: string;
}

export interface ClaimNote {
  id: string;
  claimId: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  createdById: string;
  createdByName: string;
}

export interface ClaimStatusHistory {
  id: string;
  claimId: string;
  fromStatus: ClaimStatus;
  toStatus: ClaimStatus;
  notes?: string;
  changedAt: string;
  changedById: string;
  changedByName: string;
}

export interface OSDReport {
  id: string;
  reportNumber: string;
  type: 'OVERAGE' | 'SHORTAGE' | 'DAMAGE';
  
  // Reference
  loadId: string;
  loadNumber: string;
  
  // Location
  facilityName: string;
  facilityLocation: string;
  reportedAt: string;
  
  // Details
  description: string;
  expectedQuantity?: number;
  actualQuantity?: number;
  variance?: number;
  
  // Resolution
  hasClaimFiled: boolean;
  claimId?: string;
  resolution?: string;
  resolvedAt?: string;
  
  createdAt: string;
}

export interface ClaimDashboardData {
  openClaims: number;
  pendingInvestigation: number;
  pendingSettlement: number;
  totalClaimedAmount: number;
  avgResolutionDays: number;
  claimsByType: Array<{ type: ClaimType; count: number; amount: number }>;
  claimsByStatus: Array<{ status: ClaimStatus; count: number }>;
}

export interface ClaimListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClaimStatus;
  type?: ClaimType;
  carrierId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  assignedToId?: string;
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/claims/use-claims.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  Claim,
  ClaimDocument,
  ClaimNote,
  ClaimStatusHistory,
  OSDReport,
  ClaimDashboardData,
  ClaimListParams,
} from '@/lib/types/claims';
import { toast } from 'sonner';

export const claimKeys = {
  all: ['claims'] as const,
  dashboard: () => [...claimKeys.all, 'dashboard'] as const,
  
  list: (params: ClaimListParams) => [...claimKeys.all, 'list', params] as const,
  detail: (id: string) => [...claimKeys.all, 'detail', id] as const,
  
  documents: (claimId: string) => [...claimKeys.all, 'documents', claimId] as const,
  notes: (claimId: string) => [...claimKeys.all, 'notes', claimId] as const,
  history: (claimId: string) => [...claimKeys.all, 'history', claimId] as const,
  
  osd: () => [...claimKeys.all, 'osd'] as const,
  osdList: (params?: Record<string, unknown>) => [...claimKeys.osd(), 'list', params] as const,
};

// Dashboard
export function useClaimsDashboard() {
  return useQuery({
    queryKey: claimKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: ClaimDashboardData }>('/claims/dashboard'),
  });
}

// Claims List
export function useClaims(params: ClaimListParams = {}) {
  return useQuery({
    queryKey: claimKeys.list(params),
    queryFn: () => apiClient.get<PaginatedResponse<Claim>>('/claims', params),
  });
}

export function useClaim(id: string) {
  return useQuery({
    queryKey: claimKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Claim }>(`/claims/${id}`),
    enabled: !!id,
  });
}

export function useCreateClaim() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Claim>) =>
      apiClient.post<{ data: Claim }>('/claims', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimKeys.all });
      toast.success('Claim filed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to file claim');
    },
  });
}

export function useUpdateClaim() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Claim> }) =>
      apiClient.patch<{ data: Claim }>(`/claims/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: claimKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: claimKeys.all });
      toast.success('Claim updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update claim');
    },
  });
}

// Status Changes
export function useUpdateClaimStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      apiClient.post(`/claims/${id}/status`, { status, notes }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: claimKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: claimKeys.history(id) });
      queryClient.invalidateQueries({ queryKey: claimKeys.dashboard() });
      toast.success('Status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });
}

// Settlement
export function useSettleClaim() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, settledAmount, notes }: { id: string; settledAmount: number; notes?: string }) =>
      apiClient.post(`/claims/${id}/settle`, { settledAmount, notes }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: claimKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: claimKeys.dashboard() });
      toast.success('Claim settled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to settle claim');
    },
  });
}

// Documents
export function useClaimDocuments(claimId: string) {
  return useQuery({
    queryKey: claimKeys.documents(claimId),
    queryFn: () => apiClient.get<{ data: ClaimDocument[] }>(`/claims/${claimId}/documents`),
    enabled: !!claimId,
  });
}

export function useUploadClaimDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ claimId, formData }: { claimId: string; formData: FormData }) =>
      apiClient.upload<{ data: ClaimDocument }>(`/claims/${claimId}/documents`, formData),
    onSuccess: (_, { claimId }) => {
      queryClient.invalidateQueries({ queryKey: claimKeys.documents(claimId) });
      queryClient.invalidateQueries({ queryKey: claimKeys.detail(claimId) });
      toast.success('Document uploaded');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload document');
    },
  });
}

// Notes
export function useClaimNotes(claimId: string) {
  return useQuery({
    queryKey: claimKeys.notes(claimId),
    queryFn: () => apiClient.get<{ data: ClaimNote[] }>(`/claims/${claimId}/notes`),
    enabled: !!claimId,
  });
}

export function useAddClaimNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ claimId, content, isInternal }: { claimId: string; content: string; isInternal: boolean }) =>
      apiClient.post(`/claims/${claimId}/notes`, { content, isInternal }),
    onSuccess: (_, { claimId }) => {
      queryClient.invalidateQueries({ queryKey: claimKeys.notes(claimId) });
      toast.success('Note added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add note');
    },
  });
}

// History
export function useClaimHistory(claimId: string) {
  return useQuery({
    queryKey: claimKeys.history(claimId),
    queryFn: () => apiClient.get<{ data: ClaimStatusHistory[] }>(`/claims/${claimId}/history`),
    enabled: !!claimId,
  });
}

// OS&D Reports
export function useOSDReports(params = {}) {
  return useQuery({
    queryKey: claimKeys.osdList(params),
    queryFn: () => apiClient.get<PaginatedResponse<OSDReport>>('/claims/osd', params),
  });
}

export function useCreateOSDReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<OSDReport>) =>
      apiClient.post<{ data: OSDReport }>('/claims/osd', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimKeys.osd() });
      toast.success('OS&D report created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create report');
    },
  });
}

export function useConvertOSDToClaim() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (osdId: string) =>
      apiClient.post<{ data: Claim }>(`/claims/osd/${osdId}/convert-to-claim`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimKeys.osd() });
      queryClient.invalidateQueries({ queryKey: claimKeys.all });
      toast.success('Claim created from OS&D report');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to convert to claim');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/claims-store.ts`

```typescript
import { createStore } from './create-store';
import { ClaimStatus, ClaimType } from '@/lib/types/claims';

interface ClaimFilters {
  search: string;
  status: ClaimStatus | '';
  type: ClaimType | '';
  carrierId: string;
  customerId: string;
  dateRange: { from?: Date; to?: Date };
  assignedToId: string;
}

interface ClaimsState {
  filters: ClaimFilters;
  selectedClaimId: string | null;
  isSettlementDialogOpen: boolean;
  isNoteDialogOpen: boolean;
  isUploadDialogOpen: boolean;
  
  setFilter: <K extends keyof ClaimFilters>(key: K, value: ClaimFilters[K]) => void;
  resetFilters: () => void;
  setSelectedClaim: (id: string | null) => void;
  setSettlementDialogOpen: (open: boolean) => void;
  setNoteDialogOpen: (open: boolean) => void;
  setUploadDialogOpen: (open: boolean) => void;
}

const defaultFilters: ClaimFilters = {
  search: '',
  status: '',
  type: '',
  carrierId: '',
  customerId: '',
  dateRange: {},
  assignedToId: '',
};

export const useClaimsStore = createStore<ClaimsState>('claims-store', (set, get) => ({
  filters: defaultFilters,
  selectedClaimId: null,
  isSettlementDialogOpen: false,
  isNoteDialogOpen: false,
  isUploadDialogOpen: false,
  
  setFilter: (key, value) =>
    set({ filters: { ...get().filters, [key]: value } }),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setSelectedClaim: (id) => set({ selectedClaimId: id }),
  
  setSettlementDialogOpen: (open) => set({ isSettlementDialogOpen: open }),
  
  setNoteDialogOpen: (open) => set({ isNoteDialogOpen: open }),
  
  setUploadDialogOpen: (open) => set({ isUploadDialogOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/claims.ts`

```typescript
import { z } from 'zod';

const claimPartySchema = z.object({
  type: z.enum(['CUSTOMER', 'CARRIER', 'SHIPPER', 'CONSIGNEE', 'BROKER']),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  contactName: z.string().optional(),
  liabilityPercent: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export const claimFormSchema = z.object({
  type: z.enum(['DAMAGE', 'SHORTAGE', 'OVERAGE', 'LOSS', 'DELAY', 'CONTAMINATION', 'TEMPERATURE', 'OTHER']),
  loadId: z.string().min(1, 'Load is required'),
  carrierId: z.string().min(1, 'Carrier is required'),
  customerId: z.string().min(1, 'Customer is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  incidentDate: z.string().min(1, 'Incident date is required'),
  location: z.string().optional(),
  claimedAmount: z.number().positive('Claimed amount must be positive'),
  parties: z.array(claimPartySchema).optional(),
});

export const claimSettlementSchema = z.object({
  settledAmount: z.number().min(0, 'Amount must be non-negative'),
  notes: z.string().optional(),
});

export const claimNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  isInternal: z.boolean().default(true),
});

export const claimStatusSchema = z.object({
  status: z.enum([
    'DRAFT',
    'FILED',
    'UNDER_INVESTIGATION',
    'PENDING_CARRIER',
    'PENDING_CUSTOMER',
    'APPROVED',
    'DENIED',
    'SETTLED',
    'CLOSED',
  ]),
  notes: z.string().optional(),
});

export const osdReportSchema = z.object({
  type: z.enum(['OVERAGE', 'SHORTAGE', 'DAMAGE']),
  loadId: z.string().min(1, 'Load is required'),
  facilityName: z.string().min(1, 'Facility name is required'),
  facilityLocation: z.string().min(1, 'Location is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  expectedQuantity: z.number().int().positive().optional(),
  actualQuantity: z.number().int().min(0).optional(),
});

export type ClaimFormData = z.infer<typeof claimFormSchema>;
export type ClaimSettlementData = z.infer<typeof claimSettlementSchema>;
export type ClaimNoteData = z.infer<typeof claimNoteSchema>;
export type ClaimStatusData = z.infer<typeof claimStatusSchema>;
export type OSDReportData = z.infer<typeof osdReportSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/claims/claims-dashboard-stats.tsx`
- [ ] `components/claims/claims-table.tsx`
- [ ] `components/claims/claims-columns.tsx`
- [ ] `components/claims/claim-form.tsx`
- [ ] `components/claims/claim-detail-card.tsx`
- [ ] `components/claims/claim-status-badge.tsx`
- [ ] `components/claims/claim-timeline.tsx`
- [ ] `components/claims/claim-attachments.tsx`
- [ ] `components/claims/claim-investigation.tsx`
- [ ] `components/claims/claim-settlement-form.tsx`
- [ ] `components/claims/claim-party-card.tsx`
- [ ] `components/claims/osd-report-form.tsx`
- [ ] `components/claims/osd-table.tsx`
- [ ] `components/claims/claim-filters.tsx`
- [ ] `components/claims/claim-notes.tsx`

### Pages
- [ ] `app/(dashboard)/claims/page.tsx`
- [ ] `app/(dashboard)/claims/new/page.tsx`
- [ ] `app/(dashboard)/claims/list/page.tsx`
- [ ] `app/(dashboard)/claims/[id]/page.tsx`
- [ ] `app/(dashboard)/claims/[id]/edit/page.tsx`
- [ ] `app/(dashboard)/claims/osd/page.tsx`
- [ ] `app/(dashboard)/claims/reports/page.tsx`

### Hooks & Stores
- [ ] `lib/types/claims.ts`
- [ ] `lib/validations/claims.ts`
- [ ] `lib/hooks/claims/use-claims.ts`
- [ ] `lib/stores/claims-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [10-documents-ui.md](./10-documents-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/16-service-claims.md)
- [API Review](../../api-review-docs/09-claims-review.html)

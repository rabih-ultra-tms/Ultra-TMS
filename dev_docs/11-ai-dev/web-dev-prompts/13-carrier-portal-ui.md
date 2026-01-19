# 13 - Carrier Portal UI Implementation

> **Service:** Carrier Portal (Carrier Self-Service)  
> **Priority:** P2 - Medium  
> **Pages:** 10  
> **API Endpoints:** 32  
> **Dependencies:** Foundation ✅, Auth API ✅, Carrier Portal API ✅  
> **Doc Reference:** [20-service-carrier-portal.md](../../02-services/20-service-carrier-portal.md)

---

## 📋 Overview

The Carrier Portal UI provides a self-service interface for carriers to view available loads, submit bids, manage assignments, upload PODs, and track payments. This is a separate portal experience within the main web app.

### Key Screens
- Carrier dashboard
- Available loads / load board
- My assignments
- Bid management
- Document uploads (POD, BOL)
- Payments/settlements
- Compliance status
- Account settings

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete with carrier role support
- [ ] Carrier Portal API is deployed

---

## 🗂️ Route Structure

```
app/portal/
├── carrier/
│   ├── layout.tsx                  # Portal layout
│   ├── page.tsx                    # Dashboard
│   ├── loads/
│   │   ├── page.tsx                # Available loads
│   │   └── [id]/
│   │       └── page.tsx            # Load detail/bid
│   ├── assignments/
│   │   ├── page.tsx                # My assignments
│   │   └── [id]/
│   │       └── page.tsx            # Assignment detail
│   ├── bids/
│   │   └── page.tsx                # My bids
│   ├── documents/
│   │   └── page.tsx                # Document uploads
│   ├── payments/
│   │   ├── page.tsx                # Payment history
│   │   └── [id]/
│   │       └── page.tsx            # Settlement detail
│   ├── compliance/
│   │   └── page.tsx                # Compliance status
│   └── settings/
│       └── page.tsx                # Account settings
```

---

## 🎨 Components to Create

```
components/portal/carrier/
├── carrier-portal-layout.tsx       # Portal shell
├── carrier-sidebar.tsx             # Navigation
├── carrier-header.tsx              # Header with logo
├── dashboard-stats.tsx             # Overview cards
├── available-loads-widget.tsx      # Quick load view
├── upcoming-assignments.tsx        # Scheduled loads
├── earnings-summary.tsx            # Payment overview
├── load-board-list.tsx             # Available loads table
├── load-board-card.tsx             # Load card for grid
├── load-board-filters.tsx          # Search/filter
├── load-detail.tsx                 # Full load view
├── bid-form.tsx                    # Submit bid
├── bid-status-badge.tsx            # Bid status
├── my-bids-list.tsx                # Submitted bids
├── assignment-list.tsx             # Assignments table
├── assignment-card.tsx             # Assignment summary
├── assignment-detail.tsx           # Full assignment view
├── status-update-form.tsx          # Update load status
├── pod-upload-form.tsx             # Upload POD
├── document-upload-widget.tsx      # Quick upload
├── payment-history-table.tsx       # Payments list
├── settlement-detail.tsx           # Settlement breakdown
├── compliance-status-card.tsx      # Compliance overview
├── compliance-document-list.tsx    # Required docs
├── expiration-alerts.tsx           # Expiring documents
└── carrier-settings-form.tsx       # Profile settings
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/carrier-portal.ts`

```typescript
export type CarrierAssignmentStatus = 
  | 'PENDING_ACCEPTANCE'
  | 'ACCEPTED'
  | 'DISPATCHED'
  | 'EN_ROUTE_PICKUP'
  | 'AT_PICKUP'
  | 'LOADED'
  | 'IN_TRANSIT'
  | 'AT_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED';

export type CarrierBidStatus = 
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COUNTERED'
  | 'WITHDRAWN'
  | 'EXPIRED';

export interface CarrierDashboardData {
  activeLoads: number;
  pendingBids: number;
  completedThisMonth: number;
  pendingPayments: number;
  pendingPaymentsAmount: number;
  onTimeRate: number;
  complianceStatus: 'COMPLIANT' | 'ACTION_REQUIRED' | 'EXPIRED';
  expiringDocuments: number;
  availableLoadsNearby: number;
  upcomingAssignments: CarrierAssignment[];
  recentPayments: CarrierPayment[];
}

export interface AvailableLoad {
  id: string;
  postingId: string;
  referenceNumber: string;
  
  // Route
  origin: LoadLocation;
  destination: LoadLocation;
  miles: number;
  
  // Timing
  pickupDate: string;
  pickupWindow: { start: string; end: string };
  deliveryDate: string;
  deliveryWindow: { start: string; end: string };
  
  // Freight
  commodity: string;
  weight: number;
  pieces?: number;
  equipmentType: string;
  
  // Rate
  rateType: 'FLAT' | 'PER_MILE' | 'BID';
  rate?: number;
  ratePerMile?: number;
  
  // Requirements
  specialRequirements?: string[];
  
  // Broker
  brokerName: string;
  brokerRating?: number;
  
  // Bidding
  acceptingBids: boolean;
  myBid?: CarrierBid;
  
  postedAt: string;
  expiresAt: string;
}

export interface LoadLocation {
  city: string;
  state: string;
  zipCode?: string;
  facilityName?: string;
}

export interface CarrierBid {
  id: string;
  loadId: string;
  status: CarrierBidStatus;
  
  amount: number;
  ratePerMile: number;
  transitDays: number;
  notes?: string;
  
  // Counter
  counterAmount?: number;
  counterNotes?: string;
  
  submittedAt: string;
  expiresAt?: string;
  respondedAt?: string;
}

export interface CarrierAssignment {
  id: string;
  loadId: string;
  referenceNumber: string;
  status: CarrierAssignmentStatus;
  
  // Route
  origin: AssignmentLocation;
  destination: AssignmentLocation;
  stops?: AssignmentLocation[];
  miles: number;
  
  // Timing
  pickupDate: string;
  pickupWindow: { start: string; end: string };
  deliveryDate: string;
  deliveryWindow: { start: string; end: string };
  
  // Freight
  commodity: string;
  weight: number;
  equipmentType: string;
  
  // Rate
  rate: number;
  fuelSurcharge?: number;
  accessorials?: number;
  totalRate: number;
  
  // Instructions
  pickupInstructions?: string;
  deliveryInstructions?: string;
  specialInstructions?: string;
  
  // Documents
  rateConUrl?: string;
  bolUrl?: string;
  podRequired: boolean;
  podUploaded: boolean;
  
  // Driver
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  
  // Contact
  dispatchContact: string;
  dispatchPhone: string;
  dispatchEmail: string;
  
  acceptedAt: string;
  completedAt?: string;
}

export interface AssignmentLocation {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contact?: string;
  phone?: string;
  appointmentDate: string;
  appointmentTime?: string;
  notes?: string;
  
  // Status
  arrivedAt?: string;
  departedAt?: string;
}

export interface CarrierPayment {
  id: string;
  settlementNumber: string;
  
  // Period
  periodStart: string;
  periodEnd: string;
  
  // Amounts
  loadCount: number;
  grossAmount: number;
  fuelSurcharge: number;
  accessorials: number;
  deductions: number;
  netAmount: number;
  
  // Status
  status: 'PENDING' | 'PROCESSING' | 'PAID';
  
  paymentMethod?: string;
  paymentDate?: string;
  
  // Detail
  loads: {
    loadId: string;
    referenceNumber: string;
    amount: number;
  }[];
}

export interface CarrierComplianceStatus {
  overallStatus: 'COMPLIANT' | 'ACTION_REQUIRED' | 'EXPIRED';
  
  documents: ComplianceDocument[];
  
  safetyRating?: string;
  insuranceStatus: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  authorityStatus: 'ACTIVE' | 'PENDING' | 'REVOKED';
}

export interface ComplianceDocument {
  id: string;
  type: string;
  name: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'MISSING';
  expirationDate?: string;
  daysUntilExpiry?: number;
  documentUrl?: string;
  uploadedAt?: string;
  notes?: string;
}

export interface CarrierProfile {
  id: string;
  companyName: string;
  mcNumber: string;
  dotNumber: string;
  
  primaryContact: string;
  email: string;
  phone: string;
  
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Capabilities
  equipmentTypes: string[];
  serviceAreas: string[];
  
  // Payment
  paymentPreference: 'ACH' | 'CHECK' | 'QUICK_PAY';
  quickPayEnabled: boolean;
  
  // Notifications
  notificationPreferences: {
    newLoads: boolean;
    bidUpdates: boolean;
    paymentAlerts: boolean;
    complianceAlerts: boolean;
  };
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/carrier-portal/use-carrier-portal.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  CarrierDashboardData,
  AvailableLoad,
  CarrierBid,
  CarrierAssignment,
  CarrierPayment,
  CarrierComplianceStatus,
  CarrierProfile,
} from '@/lib/types/carrier-portal';
import { toast } from 'sonner';

export const carrierPortalKeys = {
  all: ['carrier-portal'] as const,
  dashboard: () => [...carrierPortalKeys.all, 'dashboard'] as const,
  
  loads: () => [...carrierPortalKeys.all, 'loads'] as const,
  loadsList: (params?: Record<string, unknown>) => [...carrierPortalKeys.loads(), 'list', params] as const,
  loadDetail: (id: string) => [...carrierPortalKeys.loads(), 'detail', id] as const,
  
  bids: () => [...carrierPortalKeys.all, 'bids'] as const,
  bidsList: (params?: Record<string, unknown>) => [...carrierPortalKeys.bids(), 'list', params] as const,
  
  assignments: () => [...carrierPortalKeys.all, 'assignments'] as const,
  assignmentsList: (params?: Record<string, unknown>) => [...carrierPortalKeys.assignments(), 'list', params] as const,
  assignmentDetail: (id: string) => [...carrierPortalKeys.assignments(), 'detail', id] as const,
  
  payments: () => [...carrierPortalKeys.all, 'payments'] as const,
  paymentsList: (params?: Record<string, unknown>) => [...carrierPortalKeys.payments(), 'list', params] as const,
  paymentDetail: (id: string) => [...carrierPortalKeys.payments(), 'detail', id] as const,
  
  compliance: () => [...carrierPortalKeys.all, 'compliance'] as const,
  
  profile: () => [...carrierPortalKeys.all, 'profile'] as const,
};

// Dashboard
export function useCarrierDashboard() {
  return useQuery({
    queryKey: carrierPortalKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: CarrierDashboardData }>('/portal/carrier/dashboard'),
  });
}

// Available Loads
export function useAvailableLoads(params = {}) {
  return useQuery({
    queryKey: carrierPortalKeys.loadsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<AvailableLoad>>('/portal/carrier/loads', params),
  });
}

export function useAvailableLoad(id: string) {
  return useQuery({
    queryKey: carrierPortalKeys.loadDetail(id),
    queryFn: () => apiClient.get<{ data: AvailableLoad }>(`/portal/carrier/loads/${id}`),
    enabled: !!id,
  });
}

// Bids
export function useMyBids(params = {}) {
  return useQuery({
    queryKey: carrierPortalKeys.bidsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<CarrierBid>>('/portal/carrier/bids', params),
  });
}

export function useSubmitBid() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ loadId, data }: { loadId: string; data: Partial<CarrierBid> }) =>
      apiClient.post<{ data: CarrierBid }>(`/portal/carrier/loads/${loadId}/bid`, data),
    onSuccess: (_, { loadId }) => {
      queryClient.invalidateQueries({ queryKey: carrierPortalKeys.loadDetail(loadId) });
      queryClient.invalidateQueries({ queryKey: carrierPortalKeys.bids() });
      toast.success('Bid submitted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit bid');
    },
  });
}

export function useWithdrawBid() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bidId: string) =>
      apiClient.post(`/portal/carrier/bids/${bidId}/withdraw`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carrierPortalKeys.bids() });
      toast.success('Bid withdrawn');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to withdraw bid');
    },
  });
}

export function useAcceptCounter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bidId: string) =>
      apiClient.post(`/portal/carrier/bids/${bidId}/accept-counter`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carrierPortalKeys.bids() });
      queryClient.invalidateQueries({ queryKey: carrierPortalKeys.assignments() });
      toast.success('Counter accepted - Load assigned');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to accept counter');
    },
  });
}

// Assignments
export function useMyAssignments(params = {}) {
  return useQuery({
    queryKey: carrierPortalKeys.assignmentsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<CarrierAssignment>>('/portal/carrier/assignments', params),
  });
}

export function useAssignment(id: string) {
  return useQuery({
    queryKey: carrierPortalKeys.assignmentDetail(id),
    queryFn: () => apiClient.get<{ data: CarrierAssignment }>(`/portal/carrier/assignments/${id}`),
    enabled: !!id,
  });
}

export function useAcceptAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/portal/carrier/assignments/${id}/accept`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: carrierPortalKeys.assignmentDetail(id) });
      queryClient.invalidateQueries({ queryKey: carrierPortalKeys.assignments() });
      toast.success('Assignment accepted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to accept assignment');
    },
  });
}

export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, location, notes }: { 
      id: string; 
      status: string; 
      location?: { city: string; state: string };
      notes?: string;
    }) =>
      apiClient.post(`/portal/carrier/assignments/${id}/status`, { status, location, notes }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: carrierPortalKeys.assignmentDetail(id) });
      queryClient.invalidateQueries({ queryKey: carrierPortalKeys.assignments() });
      toast.success('Status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });
}

export function useUploadPOD() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, formData }: { assignmentId: string; formData: FormData }) =>
      apiClient.upload(`/portal/carrier/assignments/${assignmentId}/pod`, formData),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: carrierPortalKeys.assignmentDetail(assignmentId) });
      toast.success('POD uploaded');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload POD');
    },
  });
}

// Payments
export function useCarrierPayments(params = {}) {
  return useQuery({
    queryKey: carrierPortalKeys.paymentsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<CarrierPayment>>('/portal/carrier/payments', params),
  });
}

export function useCarrierPayment(id: string) {
  return useQuery({
    queryKey: carrierPortalKeys.paymentDetail(id),
    queryFn: () => apiClient.get<{ data: CarrierPayment }>(`/portal/carrier/payments/${id}`),
    enabled: !!id,
  });
}

// Compliance
export function useCarrierCompliance() {
  return useQuery({
    queryKey: carrierPortalKeys.compliance(),
    queryFn: () => apiClient.get<{ data: CarrierComplianceStatus }>('/portal/carrier/compliance'),
  });
}

export function useUploadComplianceDoc() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ docType, formData }: { docType: string; formData: FormData }) =>
      apiClient.upload(`/portal/carrier/compliance/${docType}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carrierPortalKeys.compliance() });
      toast.success('Document uploaded');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload document');
    },
  });
}

// Profile
export function useCarrierProfile() {
  return useQuery({
    queryKey: carrierPortalKeys.profile(),
    queryFn: () => apiClient.get<{ data: CarrierProfile }>('/portal/carrier/profile'),
  });
}

export function useUpdateCarrierProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<CarrierProfile>) =>
      apiClient.patch<{ data: CarrierProfile }>('/portal/carrier/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carrierPortalKeys.profile() });
      toast.success('Profile updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/carrier-portal-store.ts`

```typescript
import { createStore } from './create-store';
import { CarrierAssignmentStatus } from '@/lib/types/carrier-portal';

interface LoadSearchParams {
  originCity?: string;
  originState?: string;
  originRadius?: number;
  destinationCity?: string;
  destinationState?: string;
  destinationRadius?: number;
  equipmentType?: string;
  pickupDateStart?: string;
  pickupDateEnd?: string;
  minRate?: number;
}

interface CarrierPortalState {
  loadSearchParams: LoadSearchParams;
  assignmentStatusFilter: CarrierAssignmentStatus | '';
  selectedLoadId: string | null;
  selectedAssignmentId: string | null;
  isBidFormOpen: boolean;
  isStatusUpdateOpen: boolean;
  isPodUploadOpen: boolean;
  
  setLoadSearchParam: <K extends keyof LoadSearchParams>(key: K, value: LoadSearchParams[K]) => void;
  resetLoadSearch: () => void;
  setAssignmentStatusFilter: (status: CarrierAssignmentStatus | '') => void;
  setSelectedLoad: (id: string | null) => void;
  setSelectedAssignment: (id: string | null) => void;
  setBidFormOpen: (open: boolean) => void;
  setStatusUpdateOpen: (open: boolean) => void;
  setPodUploadOpen: (open: boolean) => void;
}

export const useCarrierPortalStore = createStore<CarrierPortalState>('carrier-portal-store', (set, get) => ({
  loadSearchParams: {},
  assignmentStatusFilter: '',
  selectedLoadId: null,
  selectedAssignmentId: null,
  isBidFormOpen: false,
  isStatusUpdateOpen: false,
  isPodUploadOpen: false,
  
  setLoadSearchParam: (key, value) =>
    set({ loadSearchParams: { ...get().loadSearchParams, [key]: value } }),
  
  resetLoadSearch: () => set({ loadSearchParams: {} }),
  
  setAssignmentStatusFilter: (status) => set({ assignmentStatusFilter: status }),
  
  setSelectedLoad: (id) => set({ selectedLoadId: id }),
  
  setSelectedAssignment: (id) => set({ selectedAssignmentId: id }),
  
  setBidFormOpen: (open) => set({ isBidFormOpen: open }),
  
  setStatusUpdateOpen: (open) => set({ isStatusUpdateOpen: open }),
  
  setPodUploadOpen: (open) => set({ isPodUploadOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/carrier-portal.ts`

```typescript
import { z } from 'zod';

export const bidFormSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  transitDays: z.number().int().positive('Transit days required'),
  notes: z.string().optional(),
});

export const statusUpdateSchema = z.object({
  status: z.string().min(1, 'Status is required'),
  location: z.object({
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
  }).optional(),
  notes: z.string().optional(),
});

export const carrierProfileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  primaryContact: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone is required'),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(5, 'ZIP code is required'),
  }),
  equipmentTypes: z.array(z.string()).min(1, 'At least one equipment type'),
  serviceAreas: z.array(z.string()).optional(),
  paymentPreference: z.enum(['ACH', 'CHECK', 'QUICK_PAY']),
  notificationPreferences: z.object({
    newLoads: z.boolean(),
    bidUpdates: z.boolean(),
    paymentAlerts: z.boolean(),
    complianceAlerts: z.boolean(),
  }),
});

export type BidFormData = z.infer<typeof bidFormSchema>;
export type StatusUpdateData = z.infer<typeof statusUpdateSchema>;
export type CarrierProfileData = z.infer<typeof carrierProfileSchema>;
```

---

## ✅ Completion Checklist

### Layout & Navigation
- [ ] `app/portal/carrier/layout.tsx`
- [ ] `components/portal/carrier/carrier-portal-layout.tsx`
- [ ] `components/portal/carrier/carrier-sidebar.tsx`
- [ ] `components/portal/carrier/carrier-header.tsx`

### Dashboard Components
- [ ] `components/portal/carrier/dashboard-stats.tsx`
- [ ] `components/portal/carrier/available-loads-widget.tsx`
- [ ] `components/portal/carrier/upcoming-assignments.tsx`
- [ ] `components/portal/carrier/earnings-summary.tsx`

### Load Board Components
- [ ] `components/portal/carrier/load-board-list.tsx`
- [ ] `components/portal/carrier/load-board-card.tsx`
- [ ] `components/portal/carrier/load-board-filters.tsx`
- [ ] `components/portal/carrier/load-detail.tsx`
- [ ] `components/portal/carrier/bid-form.tsx`
- [ ] `components/portal/carrier/bid-status-badge.tsx`
- [ ] `components/portal/carrier/my-bids-list.tsx`

### Assignment Components
- [ ] `components/portal/carrier/assignment-list.tsx`
- [ ] `components/portal/carrier/assignment-card.tsx`
- [ ] `components/portal/carrier/assignment-detail.tsx`
- [ ] `components/portal/carrier/status-update-form.tsx`
- [ ] `components/portal/carrier/pod-upload-form.tsx`
- [ ] `components/portal/carrier/document-upload-widget.tsx`

### Payment Components
- [ ] `components/portal/carrier/payment-history-table.tsx`
- [ ] `components/portal/carrier/settlement-detail.tsx`

### Compliance Components
- [ ] `components/portal/carrier/compliance-status-card.tsx`
- [ ] `components/portal/carrier/compliance-document-list.tsx`
- [ ] `components/portal/carrier/expiration-alerts.tsx`

### Settings
- [ ] `components/portal/carrier/carrier-settings-form.tsx`

### Pages
- [ ] `app/portal/carrier/page.tsx`
- [ ] `app/portal/carrier/loads/page.tsx`
- [ ] `app/portal/carrier/loads/[id]/page.tsx`
- [ ] `app/portal/carrier/assignments/page.tsx`
- [ ] `app/portal/carrier/assignments/[id]/page.tsx`
- [ ] `app/portal/carrier/bids/page.tsx`
- [ ] `app/portal/carrier/documents/page.tsx`
- [ ] `app/portal/carrier/payments/page.tsx`
- [ ] `app/portal/carrier/payments/[id]/page.tsx`
- [ ] `app/portal/carrier/compliance/page.tsx`
- [ ] `app/portal/carrier/settings/page.tsx`

### Hooks & Stores
- [ ] `lib/types/carrier-portal.ts`
- [ ] `lib/validations/carrier-portal.ts`
- [ ] `lib/hooks/carrier-portal/use-carrier-portal.ts`
- [ ] `lib/stores/carrier-portal-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [14-contracts-ui.md](./14-contracts-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/20-service-carrier-portal.md)
- [API Review](../../api-review-docs/13-carrier-portal-review.html)

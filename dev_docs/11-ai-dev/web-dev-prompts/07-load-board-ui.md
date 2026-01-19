# 07 - Load Board UI Implementation

> **Service:** Load Board (Internal Load Posting & Carrier Matching)  
> **Priority:** P1 - High  
> **Pages:** 6  
> **API Endpoints:** 25  
> **Dependencies:** Foundation ✅, Auth API ✅, TMS Core API ✅, Carrier API ✅, Load Board API ✅  
> **Doc Reference:** [14-service-load-board.md](../../02-services/14-service-load-board.md)

---

## 📋 Overview

The Load Board UI provides interfaces for posting loads to internal and external boards, managing carrier bids, and matching loads with carriers. This includes load posting, bid management, carrier search, and load matching automation.

### Key Screens
- Load board dashboard
- Available loads list
- Post new load
- Load posting detail
- Carrier bids management
- Load matching/assignment

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Load Board API is deployed
- [ ] TMS Core API is accessible
- [ ] Carrier API is accessible

---

## 📦 Additional shadcn Components

```bash
cd apps/web
# Components already installed
```

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── load-board/
│   ├── page.tsx                    # Load board main view
│   ├── post/
│   │   └── page.tsx                # Post new load
│   ├── postings/
│   │   ├── page.tsx                # My postings
│   │   └── [id]/
│   │       └── page.tsx            # Posting detail/bids
│   ├── search/
│   │   └── page.tsx                # Search available loads
│   └── settings/
│       └── page.tsx                # Board settings
```

---

## 🎨 Components to Create

```
components/load-board/
├── load-board-grid.tsx             # Main load board view
├── load-posting-card.tsx           # Individual load card
├── load-posting-form.tsx           # Post load form
├── load-posting-detail.tsx         # Posting details
├── carrier-bids-table.tsx          # Bids on a load
├── bid-card.tsx                    # Individual bid
├── bid-actions.tsx                 # Accept/reject bid
├── carrier-match-card.tsx          # Suggested carrier
├── load-search-form.tsx            # Search filters
├── load-map-view.tsx               # Map visualization
├── rate-estimate-card.tsx          # Rate estimation
├── posting-status-badge.tsx        # Status indicator
├── quick-post-form.tsx             # Quick post modal
└── load-board-filters.tsx          # Filter controls
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/load-board.ts`

```typescript
export type PostingStatus = 
  | 'DRAFT'
  | 'ACTIVE'
  | 'PENDING_BIDS'
  | 'BID_ACCEPTED'
  | 'COVERED'
  | 'EXPIRED'
  | 'CANCELLED';

export type BidStatus = 
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COUNTERED'
  | 'WITHDRAWN'
  | 'EXPIRED';

export interface LoadPosting {
  id: string;
  postingNumber: string;
  status: PostingStatus;
  
  // Load reference
  loadId?: string;
  loadNumber?: string;
  
  // Route
  origin: PostingLocation;
  destination: PostingLocation;
  stops?: PostingLocation[];
  miles: number;
  
  // Timing
  pickupDate: string;
  pickupWindow: { start: string; end: string };
  deliveryDate: string;
  deliveryWindow: { start: string; end: string };
  
  // Freight
  equipmentType: string;
  weight: number;
  commodity: string;
  specialRequirements?: string[];
  
  // Rate
  targetRate?: number;
  ratePerMile?: number;
  acceptBids: boolean;
  
  // Posting
  postedAt: string;
  expiresAt: string;
  postedToExternal: boolean;
  externalBoards?: string[];
  
  // Bids
  bidCount: number;
  lowestBid?: number;
  
  // Assignment
  assignedCarrierId?: string;
  assignedCarrierName?: string;
  
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostingLocation {
  city: string;
  state: string;
  zipCode?: string;
  facilityName?: string;
}

export interface CarrierBid {
  id: string;
  postingId: string;
  status: BidStatus;
  
  // Carrier
  carrierId: string;
  carrierName: string;
  carrierMC: string;
  
  // Bid
  amount: number;
  ratePerMile: number;
  transitDays: number;
  
  // Equipment
  equipmentType: string;
  driverId?: string;
  driverName?: string;
  
  // Notes
  notes?: string;
  
  // Counter (if applicable)
  counterAmount?: number;
  counterNotes?: string;
  
  // Carrier metrics
  carrierScore?: number;
  onTimePercent?: number;
  
  submittedAt: string;
  expiresAt?: string;
}

export interface CarrierMatch {
  carrierId: string;
  carrierName: string;
  carrierMC: string;
  
  // Match quality
  matchScore: number;
  matchReasons: string[];
  
  // Metrics
  scorecard: {
    overall: number;
    onTime: number;
    communication: number;
    claims: number;
  };
  
  // Capacity
  availableTrucks: number;
  preferredLanes: boolean;
  
  // Rate
  historicalRate?: number;
  estimatedRate?: number;
  
  // Contact
  dispatchPhone?: string;
  dispatchEmail?: string;
}

export interface LoadBoardSearchParams {
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
  maxWeight?: number;
}

export interface LoadBoardDashboardData {
  activePostings: number;
  pendingBids: number;
  coveredToday: number;
  avgTimeTocover: number; // hours
  avgRatePerMile: number;
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/load-board/use-load-board.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  LoadPosting,
  CarrierBid,
  CarrierMatch,
  LoadBoardSearchParams,
  LoadBoardDashboardData,
} from '@/lib/types/load-board';
import { toast } from 'sonner';

export const loadBoardKeys = {
  all: ['load-board'] as const,
  dashboard: () => [...loadBoardKeys.all, 'dashboard'] as const,
  
  postings: () => [...loadBoardKeys.all, 'postings'] as const,
  postingsList: (params?: Record<string, unknown>) => [...loadBoardKeys.postings(), 'list', params] as const,
  postingDetail: (id: string) => [...loadBoardKeys.postings(), 'detail', id] as const,
  
  available: () => [...loadBoardKeys.all, 'available'] as const,
  availableList: (params: LoadBoardSearchParams) => [...loadBoardKeys.available(), 'list', params] as const,
  
  bids: (postingId: string) => [...loadBoardKeys.all, 'bids', postingId] as const,
  
  matches: (postingId: string) => [...loadBoardKeys.all, 'matches', postingId] as const,
};

// Dashboard
export function useLoadBoardDashboard() {
  return useQuery({
    queryKey: loadBoardKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: LoadBoardDashboardData }>('/load-board/dashboard'),
  });
}

// My Postings
export function useMyPostings(params = {}) {
  return useQuery({
    queryKey: loadBoardKeys.postingsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<LoadPosting>>('/load-board/postings', params),
  });
}

export function usePosting(id: string) {
  return useQuery({
    queryKey: loadBoardKeys.postingDetail(id),
    queryFn: () => apiClient.get<{ data: LoadPosting }>(`/load-board/postings/${id}`),
    enabled: !!id,
  });
}

// Available Loads (search)
export function useAvailableLoads(params: LoadBoardSearchParams) {
  return useQuery({
    queryKey: loadBoardKeys.availableList(params),
    queryFn: () => apiClient.get<PaginatedResponse<LoadPosting>>('/load-board/available', params),
  });
}

// Create Posting
export function useCreatePosting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<LoadPosting>) =>
      apiClient.post<{ data: LoadPosting }>('/load-board/postings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loadBoardKeys.postings() });
      queryClient.invalidateQueries({ queryKey: loadBoardKeys.dashboard() });
      toast.success('Load posted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to post load');
    },
  });
}

export function useUpdatePosting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LoadPosting> }) =>
      apiClient.patch<{ data: LoadPosting }>(`/load-board/postings/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: loadBoardKeys.postingDetail(id) });
      queryClient.invalidateQueries({ queryKey: loadBoardKeys.postings() });
      toast.success('Posting updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update posting');
    },
  });
}

export function useCancelPosting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiClient.post(`/load-board/postings/${id}/cancel`, { reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: loadBoardKeys.postingDetail(id) });
      queryClient.invalidateQueries({ queryKey: loadBoardKeys.postings() });
      toast.success('Posting cancelled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel posting');
    },
  });
}

// Bids
export function usePostingBids(postingId: string) {
  return useQuery({
    queryKey: loadBoardKeys.bids(postingId),
    queryFn: () => apiClient.get<{ data: CarrierBid[] }>(`/load-board/postings/${postingId}/bids`),
    enabled: !!postingId,
  });
}

export function useAcceptBid() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postingId, bidId }: { postingId: string; bidId: string }) =>
      apiClient.post(`/load-board/postings/${postingId}/bids/${bidId}/accept`),
    onSuccess: (_, { postingId }) => {
      queryClient.invalidateQueries({ queryKey: loadBoardKeys.postingDetail(postingId) });
      queryClient.invalidateQueries({ queryKey: loadBoardKeys.bids(postingId) });
      queryClient.invalidateQueries({ queryKey: loadBoardKeys.postings() });
      toast.success('Bid accepted - Load covered');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to accept bid');
    },
  });
}

export function useRejectBid() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postingId, bidId, reason }: { postingId: string; bidId: string; reason?: string }) =>
      apiClient.post(`/load-board/postings/${postingId}/bids/${bidId}/reject`, { reason }),
    onSuccess: (_, { postingId }) => {
      queryClient.invalidateQueries({ queryKey: loadBoardKeys.bids(postingId) });
      toast.success('Bid rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject bid');
    },
  });
}

export function useCounterBid() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postingId, bidId, amount, notes }: { 
      postingId: string; 
      bidId: string; 
      amount: number;
      notes?: string;
    }) =>
      apiClient.post(`/load-board/postings/${postingId}/bids/${bidId}/counter`, { amount, notes }),
    onSuccess: (_, { postingId }) => {
      queryClient.invalidateQueries({ queryKey: loadBoardKeys.bids(postingId) });
      toast.success('Counter offer sent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send counter');
    },
  });
}

// Carrier Matches
export function useCarrierMatches(postingId: string) {
  return useQuery({
    queryKey: loadBoardKeys.matches(postingId),
    queryFn: () => apiClient.get<{ data: CarrierMatch[] }>(`/load-board/postings/${postingId}/matches`),
    enabled: !!postingId,
  });
}

export function useTenderToCarrier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postingId, carrierId, rate }: { postingId: string; carrierId: string; rate: number }) =>
      apiClient.post(`/load-board/postings/${postingId}/tender`, { carrierId, rate }),
    onSuccess: (_, { postingId }) => {
      queryClient.invalidateQueries({ queryKey: loadBoardKeys.postingDetail(postingId) });
      toast.success('Load tendered to carrier');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to tender load');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/load-board-store.ts`

```typescript
import { createStore } from './create-store';
import { PostingStatus, LoadBoardSearchParams } from '@/lib/types/load-board';

interface LoadBoardState {
  searchParams: LoadBoardSearchParams;
  postingStatus: PostingStatus | '';
  selectedPostingId: string | null;
  viewMode: 'grid' | 'list' | 'map';
  isBidDialogOpen: boolean;
  isQuickPostOpen: boolean;
  
  setSearchParam: <K extends keyof LoadBoardSearchParams>(key: K, value: LoadBoardSearchParams[K]) => void;
  resetSearch: () => void;
  setPostingStatus: (status: PostingStatus | '') => void;
  setSelectedPosting: (id: string | null) => void;
  setViewMode: (mode: 'grid' | 'list' | 'map') => void;
  setBidDialogOpen: (open: boolean) => void;
  setQuickPostOpen: (open: boolean) => void;
}

const defaultSearchParams: LoadBoardSearchParams = {};

export const useLoadBoardStore = createStore<LoadBoardState>('load-board-store', (set, get) => ({
  searchParams: defaultSearchParams,
  postingStatus: '',
  selectedPostingId: null,
  viewMode: 'grid',
  isBidDialogOpen: false,
  isQuickPostOpen: false,
  
  setSearchParam: (key, value) =>
    set({ searchParams: { ...get().searchParams, [key]: value } }),
  
  resetSearch: () => set({ searchParams: defaultSearchParams }),
  
  setPostingStatus: (status) => set({ postingStatus: status }),
  
  setSelectedPosting: (id) => set({ selectedPostingId: id }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setBidDialogOpen: (open) => set({ isBidDialogOpen: open }),
  
  setQuickPostOpen: (open) => set({ isQuickPostOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/load-board.ts`

```typescript
import { z } from 'zod';

const locationSchema = z.object({
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().optional(),
  facilityName: z.string().optional(),
});

export const postingFormSchema = z.object({
  loadId: z.string().optional(),
  origin: locationSchema,
  destination: locationSchema,
  pickupDate: z.string().min(1, 'Pickup date is required'),
  pickupWindow: z.object({
    start: z.string(),
    end: z.string(),
  }),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  deliveryWindow: z.object({
    start: z.string(),
    end: z.string(),
  }),
  equipmentType: z.string().min(1, 'Equipment type is required'),
  weight: z.number().positive('Weight must be positive'),
  commodity: z.string().min(1, 'Commodity is required'),
  specialRequirements: z.array(z.string()).optional(),
  targetRate: z.number().positive().optional(),
  acceptBids: z.boolean().default(true),
  expiresAt: z.string().min(1, 'Expiration is required'),
  postedToExternal: z.boolean().default(false),
  externalBoards: z.array(z.string()).optional(),
});

export const bidActionSchema = z.object({
  reason: z.string().optional(),
});

export const counterBidSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().optional(),
});

export const tenderSchema = z.object({
  carrierId: z.string().min(1, 'Carrier is required'),
  rate: z.number().positive('Rate must be positive'),
});

export type PostingFormData = z.infer<typeof postingFormSchema>;
export type BidActionFormData = z.infer<typeof bidActionSchema>;
export type CounterBidFormData = z.infer<typeof counterBidSchema>;
export type TenderFormData = z.infer<typeof tenderSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/load-board/load-board-grid.tsx`
- [ ] `components/load-board/load-posting-card.tsx`
- [ ] `components/load-board/load-posting-form.tsx`
- [ ] `components/load-board/load-posting-detail.tsx`
- [ ] `components/load-board/carrier-bids-table.tsx`
- [ ] `components/load-board/bid-card.tsx`
- [ ] `components/load-board/bid-actions.tsx`
- [ ] `components/load-board/carrier-match-card.tsx`
- [ ] `components/load-board/load-search-form.tsx`
- [ ] `components/load-board/load-map-view.tsx`
- [ ] `components/load-board/rate-estimate-card.tsx`
- [ ] `components/load-board/posting-status-badge.tsx`
- [ ] `components/load-board/quick-post-form.tsx`
- [ ] `components/load-board/load-board-filters.tsx`

### Pages
- [ ] `app/(dashboard)/load-board/page.tsx`
- [ ] `app/(dashboard)/load-board/post/page.tsx`
- [ ] `app/(dashboard)/load-board/postings/page.tsx`
- [ ] `app/(dashboard)/load-board/postings/[id]/page.tsx`
- [ ] `app/(dashboard)/load-board/search/page.tsx`
- [ ] `app/(dashboard)/load-board/settings/page.tsx`

### Hooks & Stores
- [ ] `lib/types/load-board.ts`
- [ ] `lib/validations/load-board.ts`
- [ ] `lib/hooks/load-board/use-load-board.ts`
- [ ] `lib/stores/load-board-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [08-commission-ui.md](./08-commission-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/14-service-load-board.md)
- [API Review](../../api-review-docs/07-load-board-review.html)

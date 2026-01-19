# 04 - TMS Core UI Implementation

> **Service:** Transportation Management System Core  
> **Priority:** P0 - Critical  
> **Pages:** 12  
> **API Endpoints:** 65  
> **Dependencies:** Foundation ✅, Auth ✅, CRM ✅, Sales ✅, TMS Core API ✅  
> **API Review:** [04-tms-core-review.html](../../api-review-docs/04-tms-core-review.html)

---

## 📋 Overview

The TMS Core UI is the heart of the application, providing order management, load planning, dispatch operations, stop management, and real-time tracking.

### Key Screens
- Orders list with multi-status filters
- Order detail with timeline
- Load planning board
- Load detail with stops
- Dispatch board
- Tracking map view
- Stop management
- Rate confirmation

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] CRM prompt (02) is complete
- [ ] Sales prompt (03) is complete
- [ ] TMS Core API is deployed and accessible

---

## 📦 Additional shadcn Components

```bash
cd apps/web
npx shadcn@latest add collapsible resizable toggle-group
```

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── orders/
│   ├── page.tsx                    # Orders list
│   ├── new/
│   │   └── page.tsx                # Create order
│   └── [id]/
│       ├── page.tsx                # Order detail
│       ├── edit/
│       │   └── page.tsx            # Edit order
│       └── tracking/
│           └── page.tsx            # Order tracking
├── loads/
│   ├── page.tsx                    # Loads list
│   ├── new/
│   │   └── page.tsx                # Create load
│   ├── planning/
│   │   └── page.tsx                # Load planning board
│   └── [id]/
│       ├── page.tsx                # Load detail
│       ├── edit/
│       │   └── page.tsx            # Edit load
│       └── tracking/
│           └── page.tsx            # Load tracking map
├── dispatch/
│   ├── page.tsx                    # Dispatch board
│   └── map/
│       └── page.tsx                # Full-screen map
├── stops/
│   ├── page.tsx                    # Stops list
│   └── [id]/
│       └── page.tsx                # Stop detail
└── tracking/
    └── page.tsx                    # Live tracking dashboard
```

---

## 🎨 Components to Create

```
components/tms/
├── orders/
│   ├── orders-table.tsx            # Orders list table
│   ├── orders-columns.tsx          # Column definitions
│   ├── order-form.tsx              # Create/edit order
│   ├── order-detail-card.tsx       # Order overview
│   ├── order-status-badge.tsx      # Status indicator
│   ├── order-timeline.tsx          # Order history
│   ├── order-stops.tsx             # Stops section
│   ├── order-documents.tsx         # Attached docs
│   ├── order-filters.tsx           # Filter controls
│   └── order-actions.tsx           # Action buttons
├── loads/
│   ├── loads-table.tsx             # Loads list
│   ├── loads-columns.tsx           # Column definitions
│   ├── load-form.tsx               # Create/edit load
│   ├── load-detail-card.tsx        # Load overview
│   ├── load-status-badge.tsx       # Status indicator
│   ├── load-stops-list.tsx         # Stops on load
│   ├── load-carrier-section.tsx    # Carrier assignment
│   ├── load-rate-section.tsx       # Rate details
│   ├── load-documents.tsx          # BOL, POD, etc.
│   ├── load-tracking-map.tsx       # Map component
│   └── load-filters.tsx            # Filter controls
├── dispatch/
│   ├── dispatch-board.tsx          # Main dispatch view
│   ├── dispatch-lane.tsx           # Status lane
│   ├── dispatch-card.tsx           # Load card
│   ├── dispatch-filters.tsx        # Filter controls
│   └── dispatch-actions.tsx        # Bulk actions
├── stops/
│   ├── stops-table.tsx             # Stops list
│   ├── stop-form.tsx               # Create/edit stop
│   ├── stop-card.tsx               # Stop summary
│   ├── stop-status-badge.tsx       # Status indicator
│   ├── stop-check-calls.tsx        # Check call log
│   └── stop-arrival-dialog.tsx     # Arrival confirmation
├── tracking/
│   ├── tracking-map.tsx            # Live map
│   ├── tracking-sidebar.tsx        # Load list sidebar
│   ├── tracking-card.tsx           # Load summary card
│   └── location-marker.tsx         # Map marker
└── shared/
    ├── address-autocomplete.tsx    # Address input
    ├── equipment-select.tsx        # Equipment picker
    ├── commodity-input.tsx         # Commodity fields
    └── rate-breakdown.tsx          # Rate display
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/tms.ts`

```typescript
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'ON_HOLD';
export type LoadStatus = 'PLANNING' | 'TENDERED' | 'ACCEPTED' | 'DISPATCHED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
export type StopType = 'PICKUP' | 'DELIVERY' | 'STOP';
export type StopStatus = 'PENDING' | 'EN_ROUTE' | 'ARRIVED' | 'LOADING' | 'COMPLETED' | 'CANCELLED';
export type EquipmentType = 'DRY_VAN' | 'REEFER' | 'FLATBED' | 'STEP_DECK' | 'TANKER' | 'INTERMODAL' | 'OTHER';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  
  // Customer
  customerId: string;
  customerName: string;
  customerReference?: string;
  
  // Origin/Destination summary
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  
  // Dates
  pickupDate: string;
  deliveryDate: string;
  
  // Cargo
  commodity: string;
  weight: number;
  pieces?: number;
  pallets?: number;
  equipmentType: EquipmentType;
  
  // Pricing
  customerRate: number;
  accessorialCharges: number;
  totalAmount: number;
  
  // Related
  stops: Stop[];
  loadIds: string[];
  
  // Special instructions
  specialInstructions?: string;
  internalNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Load {
  id: string;
  loadNumber: string;
  status: LoadStatus;
  
  // Order relationship
  orderId?: string;
  orderNumber?: string;
  
  // Carrier
  carrierId?: string;
  carrierName?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  
  // Equipment
  equipmentType: EquipmentType;
  trailerNumber?: string;
  
  // Route
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  miles: number;
  
  // Dates
  pickupDate: string;
  deliveryDate: string;
  
  // Stops
  stops: Stop[];
  
  // Rates
  carrierRate: number;
  customerRate: number;
  margin: number;
  marginPercent: number;
  
  // Tracking
  lastLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
    city?: string;
    state?: string;
  };
  eta?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Stop {
  id: string;
  loadId: string;
  type: StopType;
  status: StopStatus;
  sequence: number;
  
  // Location
  facilityName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Contact
  contactName?: string;
  contactPhone?: string;
  
  // Schedule
  appointmentDate: string;
  appointmentTimeFrom?: string;
  appointmentTimeTo?: string;
  
  // Actuals
  arrivedAt?: string;
  departedAt?: string;
  
  // Cargo
  weight?: number;
  pieces?: number;
  pallets?: number;
  commodity?: string;
  
  // Notes
  instructions?: string;
  notes?: string;
  
  // Check calls
  checkCalls: CheckCall[];
  
  createdAt: string;
  updatedAt: string;
}

export interface CheckCall {
  id: string;
  stopId: string;
  
  type: 'CHECK_CALL' | 'ARRIVAL' | 'DEPARTURE' | 'DELAY' | 'ISSUE';
  notes: string;
  
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
  };
  
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface LoadListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LoadStatus;
  carrierId?: string;
  dateFrom?: string;
  dateTo?: string;
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/tms/use-orders.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import { Order, OrderListParams } from '@/lib/types/tms';
import { toast } from 'sonner';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderListParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  timeline: (id: string) => [...orderKeys.detail(id), 'timeline'] as const,
};

export function useOrders(params: OrderListParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => apiClient.get<PaginatedResponse<Order>>('/tms/orders', params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Order }>(`/tms/orders/${id}`),
    enabled: !!id,
  });
}

export function useOrderTimeline(id: string) {
  return useQuery({
    queryKey: orderKeys.timeline(id),
    queryFn: () => apiClient.get(`/tms/orders/${id}/timeline`),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Order>) =>
      apiClient.post<{ data: Order }>('/tms/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Order created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create order');
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Order> }) =>
      apiClient.patch<{ data: Order }>(`/tms/orders/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Order updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order');
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      apiClient.patch(`/tms/orders/${id}/status`, { status, reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });
}
```

### File: `lib/hooks/tms/use-loads.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import { Load, LoadListParams } from '@/lib/types/tms';
import { toast } from 'sonner';

export const loadKeys = {
  all: ['loads'] as const,
  lists: () => [...loadKeys.all, 'list'] as const,
  list: (params: LoadListParams) => [...loadKeys.lists(), params] as const,
  details: () => [...loadKeys.all, 'detail'] as const,
  detail: (id: string) => [...loadKeys.details(), id] as const,
  tracking: (id: string) => [...loadKeys.detail(id), 'tracking'] as const,
  dispatchBoard: () => [...loadKeys.all, 'dispatch-board'] as const,
};

export function useLoads(params: LoadListParams = {}) {
  return useQuery({
    queryKey: loadKeys.list(params),
    queryFn: () => apiClient.get<PaginatedResponse<Load>>('/tms/loads', params),
  });
}

export function useLoad(id: string) {
  return useQuery({
    queryKey: loadKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Load }>(`/tms/loads/${id}`),
    enabled: !!id,
  });
}

export function useLoadTracking(id: string) {
  return useQuery({
    queryKey: loadKeys.tracking(id),
    queryFn: () => apiClient.get(`/tms/loads/${id}/tracking`),
    enabled: !!id,
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useDispatchBoard(params = {}) {
  return useQuery({
    queryKey: loadKeys.dispatchBoard(),
    queryFn: () => apiClient.get('/tms/loads/dispatch-board', params),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useCreateLoad() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Load>) =>
      apiClient.post<{ data: Load }>('/tms/loads', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loadKeys.lists() });
      toast.success('Load created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create load');
    },
  });
}

export function useUpdateLoad() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Load> }) =>
      apiClient.patch<{ data: Load }>(`/tms/loads/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: loadKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: loadKeys.lists() });
      toast.success('Load updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update load');
    },
  });
}

export function useAssignCarrier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ loadId, carrierId, rate }: { loadId: string; carrierId: string; rate: number }) =>
      apiClient.post(`/tms/loads/${loadId}/assign-carrier`, { carrierId, rate }),
    onSuccess: (_, { loadId }) => {
      queryClient.invalidateQueries({ queryKey: loadKeys.detail(loadId) });
      queryClient.invalidateQueries({ queryKey: loadKeys.lists() });
      toast.success('Carrier assigned');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign carrier');
    },
  });
}

export function useDispatchLoad() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ loadId, driverId, driverPhone }: { loadId: string; driverId?: string; driverPhone?: string }) =>
      apiClient.post(`/tms/loads/${loadId}/dispatch`, { driverId, driverPhone }),
    onSuccess: (_, { loadId }) => {
      queryClient.invalidateQueries({ queryKey: loadKeys.detail(loadId) });
      queryClient.invalidateQueries({ queryKey: loadKeys.dispatchBoard() });
      toast.success('Load dispatched');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to dispatch load');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/tms-store.ts`

```typescript
import { createStore } from './create-store';
import { OrderStatus, LoadStatus, EquipmentType } from '@/lib/types/tms';

interface OrderFilters {
  search: string;
  status: OrderStatus | '';
  customerId: string;
  dateRange: [string | null, string | null];
}

interface LoadFilters {
  search: string;
  status: LoadStatus | '';
  carrierId: string;
  equipmentType: EquipmentType | '';
  dateRange: [string | null, string | null];
}

interface TMSState {
  // Order filters
  orderFilters: OrderFilters;
  setOrderFilter: <K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) => void;
  resetOrderFilters: () => void;
  
  // Load filters
  loadFilters: LoadFilters;
  setLoadFilter: <K extends keyof LoadFilters>(key: K, value: LoadFilters[K]) => void;
  resetLoadFilters: () => void;
  
  // Dispatch board
  dispatchBoardView: 'kanban' | 'timeline' | 'map';
  setDispatchBoardView: (view: 'kanban' | 'timeline' | 'map') => void;
  
  // Selected items
  selectedOrderId: string | null;
  setSelectedOrder: (id: string | null) => void;
  selectedLoadId: string | null;
  setSelectedLoad: (id: string | null) => void;
  
  // Map state
  mapCenter: [number, number];
  mapZoom: number;
  setMapView: (center: [number, number], zoom: number) => void;
}

const defaultOrderFilters: OrderFilters = {
  search: '',
  status: '',
  customerId: '',
  dateRange: [null, null],
};

const defaultLoadFilters: LoadFilters = {
  search: '',
  status: '',
  carrierId: '',
  equipmentType: '',
  dateRange: [null, null],
};

export const useTMSStore = createStore<TMSState>('tms-store', (set, get) => ({
  orderFilters: defaultOrderFilters,
  setOrderFilter: (key, value) =>
    set({ orderFilters: { ...get().orderFilters, [key]: value } }),
  resetOrderFilters: () => set({ orderFilters: defaultOrderFilters }),
  
  loadFilters: defaultLoadFilters,
  setLoadFilter: (key, value) =>
    set({ loadFilters: { ...get().loadFilters, [key]: value } }),
  resetLoadFilters: () => set({ loadFilters: defaultLoadFilters }),
  
  dispatchBoardView: 'kanban',
  setDispatchBoardView: (view) => set({ dispatchBoardView: view }),
  
  selectedOrderId: null,
  setSelectedOrder: (id) => set({ selectedOrderId: id }),
  selectedLoadId: null,
  setSelectedLoad: (id) => set({ selectedLoadId: id }),
  
  mapCenter: [39.8283, -98.5795], // Center of US
  mapZoom: 4,
  setMapView: (center, zoom) => set({ mapCenter: center, mapZoom: zoom }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/tms.ts`

```typescript
import { z } from 'zod';

export const stopFormSchema = z.object({
  type: z.enum(['PICKUP', 'DELIVERY', 'STOP']),
  facilityName: z.string().min(1, 'Facility name required'),
  address: z.string().min(1, 'Address required'),
  city: z.string().min(1, 'City required'),
  state: z.string().min(1, 'State required'),
  zipCode: z.string().min(5, 'Valid ZIP required'),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  appointmentDate: z.string().min(1, 'Appointment date required'),
  appointmentTimeFrom: z.string().optional(),
  appointmentTimeTo: z.string().optional(),
  weight: z.number().optional(),
  pieces: z.number().optional(),
  pallets: z.number().optional(),
  commodity: z.string().optional(),
  instructions: z.string().optional(),
});

export const orderFormSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  customerReference: z.string().optional(),
  commodity: z.string().min(1, 'Commodity required'),
  weight: z.number().min(1, 'Weight required'),
  pieces: z.number().optional(),
  pallets: z.number().optional(),
  equipmentType: z.enum(['DRY_VAN', 'REEFER', 'FLATBED', 'STEP_DECK', 'TANKER', 'INTERMODAL', 'OTHER']),
  pickupDate: z.string().min(1, 'Pickup date required'),
  deliveryDate: z.string().min(1, 'Delivery date required'),
  customerRate: z.number().min(0, 'Rate must be positive'),
  stops: z.array(stopFormSchema).min(2, 'At least pickup and delivery required'),
  specialInstructions: z.string().optional(),
  internalNotes: z.string().optional(),
});

export const loadFormSchema = z.object({
  orderId: z.string().optional(),
  carrierId: z.string().optional(),
  equipmentType: z.enum(['DRY_VAN', 'REEFER', 'FLATBED', 'STEP_DECK', 'TANKER', 'INTERMODAL', 'OTHER']),
  trailerNumber: z.string().optional(),
  pickupDate: z.string().min(1, 'Pickup date required'),
  deliveryDate: z.string().min(1, 'Delivery date required'),
  carrierRate: z.number().min(0, 'Rate must be positive'),
  stops: z.array(stopFormSchema).min(2, 'At least pickup and delivery required'),
});

export const checkCallSchema = z.object({
  type: z.enum(['CHECK_CALL', 'ARRIVAL', 'DEPARTURE', 'DELAY', 'ISSUE']),
  notes: z.string().min(1, 'Notes required'),
});

export type StopFormData = z.infer<typeof stopFormSchema>;
export type OrderFormData = z.infer<typeof orderFormSchema>;
export type LoadFormData = z.infer<typeof loadFormSchema>;
export type CheckCallFormData = z.infer<typeof checkCallSchema>;
```

---

## 📄 Page Implementation

### File: `app/(dashboard)/orders/page.tsx`

```typescript
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '@/components/shared';
import { OrdersTable } from '@/components/tms/orders/orders-table';
import { OrderFilters } from '@/components/tms/orders/order-filters';
import { useOrders } from '@/lib/hooks/tms/use-orders';
import { useTMSStore } from '@/lib/stores/tms-store';
import { useDebounce } from '@/lib/hooks';

export default function OrdersPage() {
  const router = useRouter();
  const { orderFilters } = useTMSStore();
  const debouncedSearch = useDebounce(orderFilters.search, 300);
  const [page, setPage] = React.useState(1);

  const { data, isLoading, error, refetch } = useOrders({
    page,
    limit: 20,
    search: debouncedSearch,
    status: orderFilters.status || undefined,
    customerId: orderFilters.customerId || undefined,
  });

  const handleCreate = () => router.push('/orders/new');
  const handleView = (id: string) => router.push(`/orders/${id}`);

  const orders = data?.data || [];
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const inTransitCount = orders.filter(o => o.status === 'IN_TRANSIT').length;
  const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage customer orders and shipments"
        actions={
          <>
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pagination?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inTransitCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deliveredCount}</div>
          </CardContent>
        </Card>
      </div>

      <OrderFilters />

      {isLoading && !data ? (
        <LoadingState message="Loading orders..." />
      ) : error ? (
        <ErrorState
          title="Failed to load orders"
          message={error.message}
          onRetry={() => refetch()}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Create your first order to get started."
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          }
        />
      ) : (
        <OrdersTable
          orders={orders}
          pagination={data?.pagination}
          onPageChange={setPage}
          onView={handleView}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
```

---

## ✅ Completion Checklist

### Order Components
- [ ] `components/tms/orders/orders-table.tsx`
- [ ] `components/tms/orders/order-form.tsx`
- [ ] `components/tms/orders/order-detail-card.tsx`
- [ ] `components/tms/orders/order-status-badge.tsx`
- [ ] `components/tms/orders/order-timeline.tsx`
- [ ] `components/tms/orders/order-stops.tsx`
- [ ] `components/tms/orders/order-filters.tsx`

### Load Components
- [ ] `components/tms/loads/loads-table.tsx`
- [ ] `components/tms/loads/load-form.tsx`
- [ ] `components/tms/loads/load-detail-card.tsx`
- [ ] `components/tms/loads/load-status-badge.tsx`
- [ ] `components/tms/loads/load-stops-list.tsx`
- [ ] `components/tms/loads/load-carrier-section.tsx`
- [ ] `components/tms/loads/load-tracking-map.tsx`

### Dispatch Components
- [ ] `components/tms/dispatch/dispatch-board.tsx`
- [ ] `components/tms/dispatch/dispatch-lane.tsx`
- [ ] `components/tms/dispatch/dispatch-card.tsx`

### Stop Components
- [ ] `components/tms/stops/stops-table.tsx`
- [ ] `components/tms/stops/stop-form.tsx`
- [ ] `components/tms/stops/stop-card.tsx`
- [ ] `components/tms/stops/stop-check-calls.tsx`

### Tracking Components
- [ ] `components/tms/tracking/tracking-map.tsx`
- [ ] `components/tms/tracking/tracking-sidebar.tsx`

### Pages
- [ ] `app/(dashboard)/orders/page.tsx`
- [ ] `app/(dashboard)/orders/new/page.tsx`
- [ ] `app/(dashboard)/orders/[id]/page.tsx`
- [ ] `app/(dashboard)/orders/[id]/edit/page.tsx`
- [ ] `app/(dashboard)/loads/page.tsx`
- [ ] `app/(dashboard)/loads/new/page.tsx`
- [ ] `app/(dashboard)/loads/planning/page.tsx`
- [ ] `app/(dashboard)/loads/[id]/page.tsx`
- [ ] `app/(dashboard)/dispatch/page.tsx`
- [ ] `app/(dashboard)/stops/page.tsx`
- [ ] `app/(dashboard)/tracking/page.tsx`

### Hooks & Stores
- [ ] `lib/types/tms.ts`
- [ ] `lib/validations/tms.ts`
- [ ] `lib/hooks/tms/use-orders.ts`
- [ ] `lib/hooks/tms/use-loads.ts`
- [ ] `lib/hooks/tms/use-stops.ts`
- [ ] `lib/stores/tms-store.ts`

### Tests
- [ ] `components/tms/orders/orders-table.test.tsx`
- [ ] `components/tms/loads/loads-table.test.tsx`
- [ ] `components/tms/dispatch/dispatch-board.test.tsx`
- [ ] `test/mocks/handlers/tms.ts`
- [ ] All tests passing: `pnpm test`

### Verification
- [ ] TypeScript compiles: `pnpm check-types`
- [ ] Lint passes: `pnpm lint`
- [ ] Manual testing complete

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [05-carrier-ui.md](./05-carrier-ui.md)
2. Update [00-index.md](./00-index.md) status

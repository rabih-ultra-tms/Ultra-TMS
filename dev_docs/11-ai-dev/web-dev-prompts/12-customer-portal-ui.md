# 12 - Customer Portal UI Implementation

> **Service:** Customer Portal (Customer Self-Service)  
> **Priority:** P2 - Medium  
> **Pages:** 10  
> **API Endpoints:** 30  
> **Dependencies:** Foundation ✅, Auth API ✅, Customer Portal API ✅  
> **Doc Reference:** [19-service-customer-portal.md](../../02-services/19-service-customer-portal.md)

---

## 📋 Overview

The Customer Portal UI provides a self-service interface for customers to manage their shipments, view quotes, track loads, access documents, and manage their account. This is a separate portal experience within the main web app.

### Key Screens
- Customer dashboard
- Shipment list and tracking
- Quote requests
- Document center
- Invoice and payment history
- Account settings
- Contact/support

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete with customer role support
- [ ] Customer Portal API is deployed

---

## 🗂️ Route Structure

```
app/portal/
├── customer/
│   ├── layout.tsx                  # Portal layout
│   ├── page.tsx                    # Dashboard
│   ├── shipments/
│   │   ├── page.tsx                # Shipments list
│   │   ├── new/
│   │   │   └── page.tsx            # Request shipment
│   │   └── [id]/
│   │       └── page.tsx            # Shipment detail/tracking
│   ├── quotes/
│   │   ├── page.tsx                # Quotes list
│   │   ├── new/
│   │   │   └── page.tsx            # Request quote
│   │   └── [id]/
│   │       └── page.tsx            # Quote detail
│   ├── documents/
│   │   └── page.tsx                # Document center
│   ├── invoices/
│   │   ├── page.tsx                # Invoices list
│   │   └── [id]/
│   │       └── page.tsx            # Invoice detail
│   ├── support/
│   │   ├── page.tsx                # Support tickets
│   │   └── new/
│   │       └── page.tsx            # Create ticket
│   └── settings/
│       └── page.tsx                # Account settings
```

---

## 🎨 Components to Create

```
components/portal/customer/
├── customer-portal-layout.tsx      # Portal shell
├── customer-sidebar.tsx            # Navigation
├── customer-header.tsx             # Header with logo
├── dashboard-stats.tsx             # Overview cards
├── active-shipments-card.tsx       # In-transit shipments
├── recent-activity.tsx             # Activity feed
├── shipment-list.tsx               # Shipments table
├── shipment-card.tsx               # Shipment summary
├── shipment-detail.tsx             # Full shipment view
├── shipment-tracking-map.tsx       # Live tracking
├── tracking-timeline.tsx           # Status history
├── quote-request-form.tsx          # Quote wizard
├── quote-list.tsx                  # Quotes table
├── quote-card.tsx                  # Quote summary
├── quote-detail.tsx                # Full quote view
├── document-list.tsx               # Documents table
├── invoice-list.tsx                # Invoices table
├── invoice-detail.tsx              # Invoice view
├── pay-invoice-form.tsx            # Payment form
├── support-ticket-list.tsx         # Tickets table
├── support-ticket-form.tsx         # Create ticket
├── account-settings-form.tsx       # Profile/settings
└── notification-preferences.tsx    # Alerts settings
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/customer-portal.ts`

```typescript
export type PortalShipmentStatus = 
  | 'QUOTE_REQUESTED'
  | 'QUOTE_RECEIVED'
  | 'BOOKED'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'AT_DELIVERY'
  | 'DELIVERED'
  | 'INVOICED'
  | 'COMPLETED';

export interface CustomerDashboardData {
  activeShipments: number;
  shipmentsThisMonth: number;
  pendingQuotes: number;
  openInvoices: number;
  openInvoicesAmount: number;
  onTimeDeliveryRate: number;
  recentShipments: PortalShipment[];
  activeAlerts: PortalAlert[];
}

export interface PortalShipment {
  id: string;
  referenceNumber: string;
  customerPO?: string;
  status: PortalShipmentStatus;
  
  // Route
  origin: PortalLocation;
  destination: PortalLocation;
  stops?: PortalLocation[];
  
  // Timing
  pickupDate: string;
  deliveryDate: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  
  // Freight
  commodity: string;
  weight: number;
  pieces?: number;
  equipmentType: string;
  
  // Tracking
  currentLocation?: {
    city: string;
    state: string;
    timestamp: string;
  };
  trackingEvents: TrackingEvent[];
  
  // Documents
  documentCount: number;
  hasPOD: boolean;
  hasBOL: boolean;
  
  // Invoice
  invoiceId?: string;
  invoiceAmount?: number;
  
  createdAt: string;
}

export interface PortalLocation {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  date?: string;
  time?: string;
  contact?: string;
  phone?: string;
  notes?: string;
}

export interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location: string;
  timestamp: string;
}

export interface PortalQuote {
  id: string;
  quoteNumber: string;
  status: 'PENDING' | 'QUOTED' | 'ACCEPTED' | 'EXPIRED' | 'DECLINED';
  
  // Route
  origin: PortalLocation;
  destination: PortalLocation;
  
  // Details
  commodity: string;
  weight: number;
  pieces?: number;
  equipmentType: string;
  pickupDate: string;
  specialRequirements?: string;
  
  // Quote
  quotedAmount?: number;
  validUntil?: string;
  
  createdAt: string;
}

export interface PortalInvoice {
  id: string;
  invoiceNumber: string;
  status: 'PENDING' | 'SENT' | 'VIEWED' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  
  shipmentId: string;
  shipmentReference: string;
  
  issueDate: string;
  dueDate: string;
  
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  
  documentUrl?: string;
}

export interface PortalAlert {
  id: string;
  type: 'INFO' | 'WARNING' | 'ACTION_REQUIRED';
  title: string;
  message: string;
  actionUrl?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  
  shipmentId?: string;
  category: string;
  description: string;
  
  messages: TicketMessage[];
  
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface TicketMessage {
  id: string;
  content: string;
  isFromCustomer: boolean;
  senderName: string;
  createdAt: string;
  attachments?: { name: string; url: string }[];
}

export interface CustomerAccount {
  id: string;
  companyName: string;
  primaryContact: string;
  email: string;
  phone: string;
  
  billingAddress: PortalLocation;
  
  users: CustomerUser[];
  
  preferences: CustomerPreferences;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
  isActive: boolean;
}

export interface CustomerPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  trackingAlerts: boolean;
  invoiceAlerts: boolean;
  defaultEquipmentType?: string;
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/customer-portal/use-customer-portal.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  CustomerDashboardData,
  PortalShipment,
  PortalQuote,
  PortalInvoice,
  SupportTicket,
  CustomerAccount,
} from '@/lib/types/customer-portal';
import { toast } from 'sonner';

export const customerPortalKeys = {
  all: ['customer-portal'] as const,
  dashboard: () => [...customerPortalKeys.all, 'dashboard'] as const,
  
  shipments: () => [...customerPortalKeys.all, 'shipments'] as const,
  shipmentsList: (params?: Record<string, unknown>) => [...customerPortalKeys.shipments(), 'list', params] as const,
  shipmentDetail: (id: string) => [...customerPortalKeys.shipments(), 'detail', id] as const,
  shipmentTracking: (id: string) => [...customerPortalKeys.shipments(), 'tracking', id] as const,
  
  quotes: () => [...customerPortalKeys.all, 'quotes'] as const,
  quotesList: (params?: Record<string, unknown>) => [...customerPortalKeys.quotes(), 'list', params] as const,
  quoteDetail: (id: string) => [...customerPortalKeys.quotes(), 'detail', id] as const,
  
  invoices: () => [...customerPortalKeys.all, 'invoices'] as const,
  invoicesList: (params?: Record<string, unknown>) => [...customerPortalKeys.invoices(), 'list', params] as const,
  invoiceDetail: (id: string) => [...customerPortalKeys.invoices(), 'detail', id] as const,
  
  documents: (params?: Record<string, unknown>) => [...customerPortalKeys.all, 'documents', params] as const,
  
  tickets: () => [...customerPortalKeys.all, 'tickets'] as const,
  ticketsList: (params?: Record<string, unknown>) => [...customerPortalKeys.tickets(), 'list', params] as const,
  ticketDetail: (id: string) => [...customerPortalKeys.tickets(), 'detail', id] as const,
  
  account: () => [...customerPortalKeys.all, 'account'] as const,
};

// Dashboard
export function useCustomerDashboard() {
  return useQuery({
    queryKey: customerPortalKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: CustomerDashboardData }>('/portal/customer/dashboard'),
  });
}

// Shipments
export function usePortalShipments(params = {}) {
  return useQuery({
    queryKey: customerPortalKeys.shipmentsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<PortalShipment>>('/portal/customer/shipments', params),
  });
}

export function usePortalShipment(id: string) {
  return useQuery({
    queryKey: customerPortalKeys.shipmentDetail(id),
    queryFn: () => apiClient.get<{ data: PortalShipment }>(`/portal/customer/shipments/${id}`),
    enabled: !!id,
  });
}

export function useShipmentTracking(id: string) {
  return useQuery({
    queryKey: customerPortalKeys.shipmentTracking(id),
    queryFn: () => apiClient.get<{ data: PortalShipment }>(`/portal/customer/shipments/${id}/tracking`),
    enabled: !!id,
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useRequestShipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<PortalShipment>) =>
      apiClient.post<{ data: PortalShipment }>('/portal/customer/shipments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerPortalKeys.shipments() });
      toast.success('Shipment request submitted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit request');
    },
  });
}

// Quotes
export function usePortalQuotes(params = {}) {
  return useQuery({
    queryKey: customerPortalKeys.quotesList(params),
    queryFn: () => apiClient.get<PaginatedResponse<PortalQuote>>('/portal/customer/quotes', params),
  });
}

export function usePortalQuote(id: string) {
  return useQuery({
    queryKey: customerPortalKeys.quoteDetail(id),
    queryFn: () => apiClient.get<{ data: PortalQuote }>(`/portal/customer/quotes/${id}`),
    enabled: !!id,
  });
}

export function useRequestQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<PortalQuote>) =>
      apiClient.post<{ data: PortalQuote }>('/portal/customer/quotes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerPortalKeys.quotes() });
      toast.success('Quote request submitted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit quote request');
    },
  });
}

export function useAcceptQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/portal/customer/quotes/${id}/accept`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: customerPortalKeys.quoteDetail(id) });
      queryClient.invalidateQueries({ queryKey: customerPortalKeys.quotes() });
      toast.success('Quote accepted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to accept quote');
    },
  });
}

// Invoices
export function usePortalInvoices(params = {}) {
  return useQuery({
    queryKey: customerPortalKeys.invoicesList(params),
    queryFn: () => apiClient.get<PaginatedResponse<PortalInvoice>>('/portal/customer/invoices', params),
  });
}

export function usePortalInvoice(id: string) {
  return useQuery({
    queryKey: customerPortalKeys.invoiceDetail(id),
    queryFn: () => apiClient.get<{ data: PortalInvoice }>(`/portal/customer/invoices/${id}`),
    enabled: !!id,
  });
}

// Documents
export function usePortalDocuments(params = {}) {
  return useQuery({
    queryKey: customerPortalKeys.documents(params),
    queryFn: () => apiClient.get<PaginatedResponse<any>>('/portal/customer/documents', params),
  });
}

// Support Tickets
export function usePortalTickets(params = {}) {
  return useQuery({
    queryKey: customerPortalKeys.ticketsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<SupportTicket>>('/portal/customer/tickets', params),
  });
}

export function usePortalTicket(id: string) {
  return useQuery({
    queryKey: customerPortalKeys.ticketDetail(id),
    queryFn: () => apiClient.get<{ data: SupportTicket }>(`/portal/customer/tickets/${id}`),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<SupportTicket>) =>
      apiClient.post<{ data: SupportTicket }>('/portal/customer/tickets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerPortalKeys.tickets() });
      toast.success('Ticket created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create ticket');
    },
  });
}

export function useReplyToTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ticketId, content }: { ticketId: string; content: string }) =>
      apiClient.post(`/portal/customer/tickets/${ticketId}/reply`, { content }),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: customerPortalKeys.ticketDetail(ticketId) });
      toast.success('Reply sent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send reply');
    },
  });
}

// Account
export function useCustomerAccount() {
  return useQuery({
    queryKey: customerPortalKeys.account(),
    queryFn: () => apiClient.get<{ data: CustomerAccount }>('/portal/customer/account'),
  });
}

export function useUpdateCustomerAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<CustomerAccount>) =>
      apiClient.patch<{ data: CustomerAccount }>('/portal/customer/account', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerPortalKeys.account() });
      toast.success('Account updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update account');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/customer-portal-store.ts`

```typescript
import { createStore } from './create-store';
import { PortalShipmentStatus } from '@/lib/types/customer-portal';

interface CustomerPortalState {
  shipmentStatusFilter: PortalShipmentStatus | '';
  searchQuery: string;
  selectedShipmentId: string | null;
  isQuoteRequestOpen: boolean;
  isTicketFormOpen: boolean;
  
  setShipmentStatusFilter: (status: PortalShipmentStatus | '') => void;
  setSearchQuery: (query: string) => void;
  setSelectedShipment: (id: string | null) => void;
  setQuoteRequestOpen: (open: boolean) => void;
  setTicketFormOpen: (open: boolean) => void;
}

export const useCustomerPortalStore = createStore<CustomerPortalState>('customer-portal-store', (set) => ({
  shipmentStatusFilter: '',
  searchQuery: '',
  selectedShipmentId: null,
  isQuoteRequestOpen: false,
  isTicketFormOpen: false,
  
  setShipmentStatusFilter: (status) => set({ shipmentStatusFilter: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedShipment: (id) => set({ selectedShipmentId: id }),
  setQuoteRequestOpen: (open) => set({ isQuoteRequestOpen: open }),
  setTicketFormOpen: (open) => set({ isTicketFormOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/customer-portal.ts`

```typescript
import { z } from 'zod';

const portalLocationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  date: z.string().optional(),
  time: z.string().optional(),
  contact: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const quoteRequestSchema = z.object({
  origin: portalLocationSchema,
  destination: portalLocationSchema,
  commodity: z.string().min(1, 'Commodity is required'),
  weight: z.number().positive('Weight must be positive'),
  pieces: z.number().int().positive().optional(),
  equipmentType: z.string().min(1, 'Equipment type is required'),
  pickupDate: z.string().min(1, 'Pickup date is required'),
  specialRequirements: z.string().optional(),
});

export const shipmentRequestSchema = quoteRequestSchema.extend({
  customerPO: z.string().optional(),
});

export const supportTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  shipmentId: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export const ticketReplySchema = z.object({
  content: z.string().min(1, 'Reply content is required'),
});

export const accountPreferencesSchema = z.object({
  primaryContact: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone is required'),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  trackingAlerts: z.boolean(),
  invoiceAlerts: z.boolean(),
});

export type QuoteRequestData = z.infer<typeof quoteRequestSchema>;
export type ShipmentRequestData = z.infer<typeof shipmentRequestSchema>;
export type SupportTicketData = z.infer<typeof supportTicketSchema>;
export type TicketReplyData = z.infer<typeof ticketReplySchema>;
export type AccountPreferencesData = z.infer<typeof accountPreferencesSchema>;
```

---

## ✅ Completion Checklist

### Layout & Navigation
- [ ] `app/portal/customer/layout.tsx`
- [ ] `components/portal/customer/customer-portal-layout.tsx`
- [ ] `components/portal/customer/customer-sidebar.tsx`
- [ ] `components/portal/customer/customer-header.tsx`

### Dashboard Components
- [ ] `components/portal/customer/dashboard-stats.tsx`
- [ ] `components/portal/customer/active-shipments-card.tsx`
- [ ] `components/portal/customer/recent-activity.tsx`

### Shipment Components
- [ ] `components/portal/customer/shipment-list.tsx`
- [ ] `components/portal/customer/shipment-card.tsx`
- [ ] `components/portal/customer/shipment-detail.tsx`
- [ ] `components/portal/customer/shipment-tracking-map.tsx`
- [ ] `components/portal/customer/tracking-timeline.tsx`

### Quote Components
- [ ] `components/portal/customer/quote-request-form.tsx`
- [ ] `components/portal/customer/quote-list.tsx`
- [ ] `components/portal/customer/quote-card.tsx`
- [ ] `components/portal/customer/quote-detail.tsx`

### Other Components
- [ ] `components/portal/customer/document-list.tsx`
- [ ] `components/portal/customer/invoice-list.tsx`
- [ ] `components/portal/customer/invoice-detail.tsx`
- [ ] `components/portal/customer/pay-invoice-form.tsx`
- [ ] `components/portal/customer/support-ticket-list.tsx`
- [ ] `components/portal/customer/support-ticket-form.tsx`
- [ ] `components/portal/customer/account-settings-form.tsx`
- [ ] `components/portal/customer/notification-preferences.tsx`

### Pages
- [ ] `app/portal/customer/page.tsx`
- [ ] `app/portal/customer/shipments/page.tsx`
- [ ] `app/portal/customer/shipments/new/page.tsx`
- [ ] `app/portal/customer/shipments/[id]/page.tsx`
- [ ] `app/portal/customer/quotes/page.tsx`
- [ ] `app/portal/customer/quotes/new/page.tsx`
- [ ] `app/portal/customer/quotes/[id]/page.tsx`
- [ ] `app/portal/customer/documents/page.tsx`
- [ ] `app/portal/customer/invoices/page.tsx`
- [ ] `app/portal/customer/invoices/[id]/page.tsx`
- [ ] `app/portal/customer/support/page.tsx`
- [ ] `app/portal/customer/support/new/page.tsx`
- [ ] `app/portal/customer/settings/page.tsx`

### Hooks & Stores
- [ ] `lib/types/customer-portal.ts`
- [ ] `lib/validations/customer-portal.ts`
- [ ] `lib/hooks/customer-portal/use-customer-portal.ts`
- [ ] `lib/stores/customer-portal-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [13-carrier-portal-ui.md](./13-carrier-portal-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/19-service-customer-portal.md)
- [API Review](../../api-review-docs/12-customer-portal-review.html)

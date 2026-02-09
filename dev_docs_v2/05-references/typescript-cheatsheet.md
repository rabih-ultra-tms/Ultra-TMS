# TypeScript Cheat Sheet

> Key entity interfaces for frontend development. Reference only — actual type files live in `apps/web/types/`.
> Data sourced from `dev_docs/11-ai-dev/91-data-dictionary.md` and existing codebase types.

---

## API Response Wrappers

```typescript
// From apps/web/lib/api/client.ts
interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
```

---

## Core Entities

> **Note:** Order, Load, Invoice, and Quote type files do **not yet exist** in `apps/web/types/`.
> These interfaces are sourced from the data dictionary and should be created as type files
> when building TMS Core (Phase 3+), Sales, and Accounting screens.
> The **Carrier** type below has been updated to match the actual codebase.

### Order

> TO BE CREATED in `apps/web/types/orders.ts` (Phase 3: TMS-001)

```typescript
interface Order {
  id: string;                    // cuid
  orderNumber: string;           // Auto: ORD-{YYYYMM}-{NNNNN}
  status: OrderStatus;
  customerId: string;
  customerName: string;          // Denormalized
  origin: Address;
  destination: Address;
  stops: Stop[];
  equipmentType: EquipmentType;
  customerRate: number;          // Decimal ($)
  carrierCost: number;           // Decimal ($)
  margin: number;                // Computed: customerRate - carrierCost
  marginPercent: number;         // Computed: (margin / customerRate) × 100
  pickupDate: string;            // ISO datetime
  deliveryDate: string;          // ISO datetime
  notes: string | null;
  tenantId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

type OrderStatus =
  | 'PENDING' | 'QUOTED' | 'BOOKED' | 'DISPATCHED'
  | 'IN_TRANSIT' | 'DELIVERED' | 'INVOICED' | 'COMPLETED'
  | 'CANCELLED';
```

### Load

> TO BE CREATED in `apps/web/types/loads.ts` (Phase 3: TMS-003)

```typescript
interface Load {
  id: string;
  loadNumber: string;            // Auto: LD-{YYYYMM}-{NNNNN}
  status: LoadStatus;
  orderId: string;
  carrierId: string | null;
  carrierName: string | null;
  equipmentType: EquipmentType;
  origin: Address;
  destination: Address;
  stops: Stop[];
  customerRate: number;
  carrierRate: number;
  weight: number;                // lbs (1–80,000)
  commodity: string | null;
  pickupDate: string;
  deliveryDate: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

type LoadStatus =
  | 'PLANNING' | 'PENDING' | 'TENDERED' | 'ACCEPTED'
  | 'DISPATCHED' | 'AT_PICKUP' | 'PICKED_UP' | 'IN_TRANSIT'
  | 'AT_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
```

### Carrier

> **Note:** The actual codebase type is `OperationsCarrier` in `apps/web/types/carriers.ts`.
> Uses flat address fields (not nested `Address` object). See actual file for full definition.

```typescript
// From apps/web/types/carriers.ts (actual codebase type)
interface OperationsCarrier {
  id: string;
  tenantId: string;
  carrierType: 'COMPANY' | 'OWNER_OPERATOR';
  companyName: string;
  mcNumber?: string;             // Optional (6 digits)
  dotNumber?: string;            // Optional (5-8 digits)
  einTaxId?: string;
  address: string;               // Flat fields, not nested Address
  city: string;
  state: string;
  zip: string;
  phone: string;
  phoneSecondary?: string;
  email: string;
  website?: string;
  billingEmail: string;
  paymentTermsDays: number;      // Net days (default 30)
  preferredPaymentMethod: 'CHECK' | 'ACH' | 'WIRE' | 'QUICK_PAY';
  factoringCompanyName?: string;
  factoringPhone?: string;
  factoringEmail?: string;
  insuranceCompany?: string;
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: string;
  insuranceCargoLimitCents?: number;
  status: CarrierStatus;
  notes?: string;
  drivers?: OperationsCarrierDriver[];
  trucks?: OperationsCarrierTruck[];
  createdAt: string;
  updatedAt: string;
}

// List variant (omits nested arrays, adds counts)
interface OperationsCarrierListItem extends Omit<OperationsCarrier, 'drivers' | 'trucks'> {
  _count: { drivers: number; trucks: number; };
}

type CarrierStatus = 'ACTIVE' | 'INACTIVE' | 'PREFERRED' | 'ON_HOLD' | 'BLACKLISTED';
```

### Customer

> TO BE CREATED in `apps/web/types/customers.ts` (Phase 3: TMS-005)

```typescript
interface Customer {
  id: string;
  name: string;
  code: string;                  // 2-20 chars, uppercase, unique
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT';
  creditStatus: CreditStatus;
  creditLimit: number | null;
  currentBalance: number | null;
  paymentTerms: number;          // Net days (default 30)
  email: string;
  phone: string;
  billingAddress: Address;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

type CreditStatus = 'PENDING' | 'APPROVED' | 'HOLD' | 'COD' | 'PREPAID' | 'DENIED';
```

### Invoice

> TO BE CREATED in `apps/web/types/invoices.ts` (Phase 6: ACC-002)

```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;         // Auto-generated
  status: InvoiceStatus;
  orderId: string;
  customerId: string;
  customerName: string;
  amount: number;
  amountPaid: number;
  amountDue: number;             // Computed
  invoiceDate: string;
  dueDate: string;               // invoiceDate + paymentTerms
  paymentTerms: string;          // NET15, NET30, etc.
  lineItems: InvoiceLineItem[];
  tenantId: string;
  createdAt: string;
}

type InvoiceStatus =
  | 'DRAFT' | 'PENDING' | 'SENT' | 'VIEWED'
  | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'VOID';
```

### Quote

> TO BE CREATED in `apps/web/types/quotes.ts` (Phase 3: SALES-001)

```typescript
interface Quote {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  customerId: string;
  customerName: string;
  origin: Address;
  destination: Address;
  stops: Stop[];
  equipmentType: EquipmentType;
  customerRate: number;
  estimatedCarrierCost: number;
  margin: number;
  marginPercent: number;
  expiresAt: string;             // Default: 7 days from creation
  version: number;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

type QuoteStatus = 'DRAFT' | 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
```

---

## Shared Types

### Address (Embedded)

```typescript
interface Address {
  street: string;
  street2?: string;
  city: string;
  state: string;                 // 2-letter code
  zip: string;                   // 5 or 9 digits
  lat?: number;
  lng?: number;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
}
```

### Stop (Embedded)

```typescript
interface Stop {
  id: string;
  type: 'PICKUP' | 'DELIVERY' | 'STOP';
  sequence: number;
  address: Address;
  appointmentRequired: boolean;
  scheduledDate: string;
  actualArrival?: string;
  actualDeparture?: string;
  status: 'PENDING' | 'ARRIVED' | 'DEPARTED' | 'COMPLETED';
  notes?: string;
}
```

### Equipment Type Enum

```typescript
type EquipmentType =
  | 'DRY_VAN' | 'REEFER' | 'FLATBED' | 'STEP_DECK'
  | 'LOWBOY' | 'CONESTOGA' | 'POWER_ONLY' | 'SPRINTER'
  | 'HOTSHOT' | 'TANKER' | 'HOPPER' | 'CONTAINER';
```

### Location (GPS Tracking)

```typescript
interface Location {
  lat: number;
  lng: number;
  address?: string;
  speed?: number;
  heading?: number;
  updatedAt: string;
  source?: string;
}
```

---

## Status Labels & Colors Pattern

Follow this pattern for every status type (from existing codebase convention):

```typescript
// Example: Load Status
const LOAD_STATUS_LABELS: Record<LoadStatus, string> = {
  PLANNING: 'Planning',
  PENDING: 'Pending',
  TENDERED: 'Tendered',
  ACCEPTED: 'Accepted',
  DISPATCHED: 'Dispatched',
  AT_PICKUP: 'At Pickup',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  AT_DELIVERY: 'At Delivery',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

// After COMP-001 (design tokens), use token-based colors instead:
const LOAD_STATUS_COLORS: Record<LoadStatus, string> = {
  PLANNING: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  // ... etc using design token classes
};
```

---

## Common Filter/Pagination Pattern

```typescript
interface ListParams {
  page?: number;
  pageSize?: number;            // Default 25
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Per-entity filters extend ListParams:
interface OrderListParams extends ListParams {
  status?: OrderStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}
```

---

## Margin Helper

```typescript
function getMarginColor(marginPercent: number | null): string {
  if (marginPercent === null) return '';
  if (marginPercent < 10) return 'text-red-600 bg-red-50';    // Danger
  if (marginPercent < 15) return 'text-yellow-600 bg-yellow-50'; // Warning (below minimum)
  return 'text-green-600 bg-green-50';                          // Good
}
```

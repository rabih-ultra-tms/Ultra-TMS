# TMS Core Pages & Seed Data - Design Document

**Date:** 2026-02-13
**Author:** Claude Code
**Status:** Approved
**Related Services:** Service 04 (TMS Core), Service 07 (Load Board)

---

## Overview

This design covers the implementation of three critical TMS pages and their supporting seed data:
1. Order Detail Page (`/operations/orders/[id]`)
2. Load Detail Page (`/operations/loads/[id]`)
3. Load Board Page (`/load-board`)

**Approach:** Seed-first, then UI. Build comprehensive seed data to populate the database with realistic Orders, Loads, and Load Board postings, then create pages that wire up to the existing production-ready backend APIs.

**Backend Status:**
- TMS Core (Service 04): A- grade, 65 endpoints, 100% production-ready
- Load Board (Service 07): A grade, 25+ endpoints, 100% production-ready

**Data Volume (per tenant):**
- 10 Orders (reducing from current 20 for lighter dev datasets)
- ~15 Loads (1-2 per Order)
- ~5 Load Board postings (from unassigned loads)

---

## 1. Architecture & Data Flow

### Seed Data Flow

```
Tenants (existing)
  → Companies as Customers (existing)
  → Carriers (existing)
  → Users (existing)
    ↓
Orders (10 per tenant)
  - Customer reference
  - Stops (2-4 per order: pickup → delivery)
  - Rates, commodity, equipment type
    ↓
Loads (1-2 per Order = ~15 total)
  - Inherits order details
  - Assigned carrier (70% of loads)
  - Unassigned (30% - need carriers)
  - Driver info, truck info
  - Status progression: PENDING → ASSIGNED → DISPATCHED → PICKED_UP → IN_TRANSIT → DELIVERED
    ↓
LoadPosts (~5 per tenant, only for unassigned loads)
  - Posting details (rate, expiry)
  - Status: ACTIVE, FILLED, EXPIRED, CANCELLED
```

### Page → API Connections

**Order Detail** (`/operations/orders/[id]`):
- `GET /api/v1/orders/:id` - Main order data
- `GET /api/v1/orders/:id/loads` - Related loads
- `GET /api/v1/orders/:id/timeline` - Activity history
- `GET /api/v1/orders/:id/documents` - Attachments

**Load Detail** (`/operations/loads/[id]`):
- `GET /api/v1/loads/:id` - Main load data
- `GET /api/v1/loads/:id/stops` - Stop list with statuses
- `GET /api/v1/loads/:id/checkcalls` - Check call log
- `GET /api/v1/loads/:id/timeline` - Activity history
- `GET /api/v1/loads/:id/documents` - Documents (BOL, POD, rate con)

**Load Board** (`/load-board`):
- `GET /api/v1/load-board/postings` - List with filters (status, equipment, origin, destination)
- `GET /api/v1/load-board/dashboard` - KPI cards (active postings, total bids, filled today)

---

## 2. Seed Data Structure

### Orders (10 per tenant)

**Enhanced version of existing seed in `apps/api/prisma/seed/tms-core.ts`:**

```typescript
{
  orderNumber: "ORD-2026-001",           // Sequential
  customerReference: "CUST-PO-12345",   // Faker
  poNumber: "PO-ABC-789",                // Faker
  bolNumber: "BOL-XYZ-456",              // Faker (optional)
  customerId: <existing customer>,       // Random from tenant customers
  customerContactId: <contact>,          // From selected customer
  salesRepId: <existing user>,           // Random from tenant users
  quoteId: null,                         // Null for now (quotes not in scope)

  // Status distribution (weighted)
  status: "QUOTED" (10%) | "BOOKED" (30%) | "IN_TRANSIT" (40%) | "DELIVERED" (20%),

  // Financial
  customerRate: 2500.00,                 // Faker range 1500-5000
  accessorialCharges: 150.00,            // 0-500 range
  fuelSurcharge: 125.00,                 // 5-10% of base rate
  totalCharges: 2775.00,                 // Sum of above
  currency: "USD",

  // Freight details
  commodity: "Electronics",              // Faker: Electronics, Furniture, Produce, Steel, etc.
  commodityClass: "100",                 // NMFC class (50, 55, 60, 65, 70, 77.5, 85, 92.5, 100, 110, 125, 150, 175, 200, 250, 300, 400, 500)
  weightLbs: 15000,                      // 1000-45000 range
  pieceCount: 25,                        // 1-50
  palletCount: 10,                       // 1-26
  equipmentType: "DRY_VAN",              // DRY_VAN (50%), REEFER (25%), FLATBED (15%), STEP_DECK (10%)

  // Special handling (10% chance for each)
  isHazmat: false,
  hazmatClass: null,                     // If hazmat: "3", "8", etc.
  temperatureMin: null,                  // If reefer: 34-38°F
  temperatureMax: null,                  // If reefer: 38-42°F
  isHot: false,                          // 10% of loads
  isTeam: false,                         // 15% of loads > 1000 miles
  isExpedited: false,                    // 5% of loads

  // Dates
  orderDate: now(),
  requiredDeliveryDate: now() + 3-7 days,
  actualDeliveryDate: <if DELIVERED>,

  // Notes
  specialInstructions: faker.lorem.sentence(),
  internalNotes: faker.lorem.sentence(),

  // Metadata
  externalId: "SEED-ORDER-001",
  sourceSystem: "FAKER_SEED",
  customFields: {},
  createdById: <user>,
  createdAt: now() - 0-30 days,          // Stagger creation dates
  updatedAt: now(),
}
```

**Stops (2-4 per Order):**
```typescript
{
  orderId: <parent order>,
  stopType: "PICKUP" | "DELIVERY",       // First = PICKUP, Last = DELIVERY
  stopSequence: 1, 2, 3...               // Sequential

  // Location (realistic US city pairs)
  addressLine1: faker.location.streetAddress(),
  addressLine2: null,
  city: "Los Angeles",                   // Major cities: LA, Chicago, Dallas, Atlanta, NYC, etc.
  state: "CA",
  postalCode: "90001",
  country: "USA",

  // Contact
  contactName: faker.person.fullName(),
  contactPhone: faker.phone.number(),
  contactEmail: faker.internet.email(),

  // Schedule
  scheduledArrival: <pickup: order.requiredDeliveryDate - 5 days, delivery: order.requiredDeliveryDate>,
  actualArrival: <if status >= ARRIVED>,
  actualDeparture: <if status >= DEPARTED>,

  // Status
  status: "PENDING" | "ARRIVED" | "DEPARTED" | "CANCELLED",

  // Notes
  notes: faker.lorem.sentence(),
  specialInstructions: faker.lorem.sentence(),

  // Metadata
  externalId: "SEED-STOP-001",
  sourceSystem: "FAKER_SEED",
}
```

### Loads (1-2 per Order = ~15 per tenant)

**New seed file: `apps/api/prisma/seed/loads.ts`**

```typescript
{
  loadNumber: "LD-2026-001",             // Sequential
  orderId: <parent order>,               // Link to order

  // Carrier assignment (70% assigned, 30% unassigned)
  carrierId: <carrier> | null,
  driverName: "John Smith" | null,       // If assigned
  driverPhone: "(555) 123-4567" | null,
  truckNumber: "TRK-101" | null,
  trailerNumber: "TRL-501" | null,

  // Status (progression based)
  status: "PENDING" (30%) | "ASSIGNED" (20%) | "DISPATCHED" (15%) | "PICKED_UP" (10%) | "IN_TRANSIT" (15%) | "DELIVERED" (10%),

  // Rates (slightly less than order rate)
  carrierRate: 2200.00,                  // 85-90% of order.customerRate
  accessorialCosts: 100.00,              // 0-300 range
  fuelAdvance: 250.00,                   // 0-500 range
  totalCost: 2550.00,                    // Sum of above

  // Equipment (inherit from order)
  equipmentType: <from order>,
  equipmentLength: 53,                   // 48, 53 (dry van), 28 (pup), 40 (reefer)
  equipmentWeightLimit: 45000,           // Lbs

  // Tracking (for in-transit loads)
  currentLocationLat: 41.8781,           // Chicago coords (if IN_TRANSIT)
  currentLocationLng: -87.6298,
  currentCity: "Chicago",
  currentState: "IL",
  lastTrackingUpdate: now() - 2 hours,
  eta: now() + 12 hours,

  // Timestamps
  dispatchedAt: <if status >= DISPATCHED>,
  pickedUpAt: <if status >= PICKED_UP>,
  deliveredAt: <if status === DELIVERED>,

  // Documents
  rateConfirmationSent: <if status >= ASSIGNED>,
  rateConfirmationSigned: <if status >= DISPATCHED>,

  // Notes
  dispatchNotes: faker.lorem.sentence(),

  // Metadata
  externalId: "SEED-LOAD-001",
  sourceSystem: "FAKER_SEED",
  customFields: {},
  createdById: <user>,
  createdAt: <order.createdAt>,
  updatedAt: now(),
}
```

**Stops (copied from Order):**
- Copy all stops from parent Order to Load
- Update `loadId` field
- Keep same addresses, schedule, contacts

**Check Calls (1-3 per in-transit load):**
```typescript
{
  loadId: <load>,
  callType: "DRIVER_CHECKIN" | "DISPATCHER_CALL",
  callDateTime: now() - 4 hours,
  currentLocation: "Chicago, IL",
  estimatedArrival: now() + 8 hours,
  notes: "On schedule, no issues",
  calledBy: <user>,
}
```

### Load Board Postings (~5 per tenant)

**New seed file: `apps/api/prisma/seed/load-board.ts`**

```typescript
{
  loadId: <unassigned load>,             // Only loads with carrierId = null
  postingNumber: "POST-2026-001",

  // Status
  status: "ACTIVE" (80%) | "EXPIRED" (15%) | "FILLED" (5%),

  // Rates
  targetRate: 2300.00,                   // Slightly higher than load.carrierRate
  minRate: 2100.00,                      // 90-95% of targetRate
  maxRate: 2500.00,                      // 105-110% of targetRate

  // Timing
  postedAt: now() - 0-48 hours,
  expiresAt: now() + 24-72 hours,        // 24-72 hour window
  filledAt: <if status === FILLED>,

  // Route (extracted from load stops)
  originCity: "Los Angeles",
  originState: "CA",
  originZip: "90001",
  destinationCity: "Chicago",
  destinationState: "IL",
  destinationZip: "60601",
  distance: 2015,                        // Miles (calculated)

  // Schedule
  pickupDate: <from first stop>,
  deliveryDate: <from last stop>,

  // Equipment
  equipmentType: <from load>,
  equipmentLength: 53,

  // Freight
  commodity: <from order>,
  weightLbs: <from order>,

  // Visibility
  isPublic: true,                        // 90% public, 10% private (invited carriers only)
  allowedCarrierIds: [],                 // Empty if public

  // Auto-matching rules
  autoAcceptBids: false,
  autoMatchEnabled: true,
  minCarrierRating: 4.0,

  // Metadata
  externalId: "SEED-POST-001",
  sourceSystem: "FAKER_SEED",
  customFields: {},
  createdById: <user>,
}
```

### Data Realism Strategies

1. **Realistic city pairs:** Use major freight lanes (LA→Chicago, Dallas→NYC, Atlanta→Miami)
2. **Status distribution:** More loads in active states (IN_TRANSIT, DISPATCHED) than completed
3. **Equipment matching:** Reefer for produce/food, flatbed for construction materials, dry van for general freight
4. **Weight/space correlation:** Heavier loads get higher piece counts and pallet counts
5. **Team drivers:** Loads > 1000 miles have 15% chance of requiring team
6. **Tracking updates:** IN_TRANSIT loads get realistic GPS coordinates along route
7. **Timing:** Stagger creation dates over past 30 days for realistic timeline
8. **Financial realism:** Carrier rate is 85-90% of customer rate (positive margin)

---

## 3. Page Implementations

### Order Detail Page

**Route:** `/operations/orders/[id]/page.tsx`

**Layout:** Two-column with tabs (70% content / 30% sidebar)

**Structure:**
```tsx
<div className="container mx-auto p-6">
  {/* Header */}
  <OrderDetailHeader
    order={order}
    onEdit={() => router.push(`/operations/orders/${id}/edit`)}
    onClone={() => handleClone()}
    onCancel={() => handleCancel()}
  />

  <div className="grid grid-cols-3 gap-6 mt-6">
    {/* Main Content - 2 columns */}
    <div className="col-span-2">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stops">Stops</TabsTrigger>
          <TabsTrigger value="loads">Loads</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OrderOverviewTab order={order} />
        </TabsContent>

        <TabsContent value="stops">
          <OrderStopsTab orderId={id} />
        </TabsContent>

        <TabsContent value="loads">
          <OrderLoadsTab orderId={id} />
        </TabsContent>

        <TabsContent value="documents">
          <OrderDocumentsTab orderId={id} />
        </TabsContent>

        <TabsContent value="timeline">
          <OrderTimelineTab orderId={id} />
        </TabsContent>
      </Tabs>
    </div>

    {/* Sidebar - 1 column */}
    <div className="col-span-1 space-y-4">
      <OrderCustomerCard order={order} />
      <FinancialSummaryCard
        revenue={order.totalCharges}
        cost={totalLoadCost}
        margin={order.totalCharges - totalLoadCost}
      />
      <MetadataCard order={order} />
    </div>
  </div>
</div>
```

**Data Fetching:**
```tsx
const { data: order, isLoading, error } = useOrder(id);
const { data: loads } = useOrderLoads(id); // For loads tab
const { data: timeline } = useOrderTimeline(id); // For timeline tab
const { data: documents } = useOrderDocuments(id); // For documents tab
```

**Tab Content Details:**

**Overview Tab:**
- Customer info (name, contact, phone, email)
- Order details (PO#, BOL#, customer reference)
- Freight details (commodity, class, weight, pieces, pallets)
- Equipment requirements (type, length, weight limit)
- Special handling (hazmat, temp control, team, expedited)
- Rates and charges breakdown
- Special instructions and internal notes

**Stops Tab:**
- Visual timeline showing pickup → delivery sequence
- Table with columns: Sequence, Type, Location, Contact, Scheduled, Actual, Status
- Status badges for each stop (Pending, Arrived, Departed)
- Special instructions per stop
- Detention time calculation (if departed - scheduled > 2 hours)

**Loads Tab:**
- Table with columns: Load #, Carrier, Status, Driver, Pickup Date, Delivery Date, Rate, Margin
- Click row to navigate to Load Detail page
- Status badges with colors
- "Create Load" button if order has unassigned capacity
- Summary: X loads, Y in transit, Z delivered

**Documents Tab:**
- List of attached documents (BOL, invoices, PODs, rate confirmations)
- Upload new documents button
- Download/preview functionality
- Document metadata (uploaded by, date, size)

**Timeline Tab:**
- Chronological activity feed
- Event types: Created, Updated, Status Changed, Load Created, Document Uploaded, Note Added
- User attribution (who performed action)
- Timestamps (relative: "2 hours ago" and absolute: "Feb 13, 2026 10:30 AM")

### Load Detail Page

**Route:** `/operations/loads/[id]/page.tsx`

**Layout:** Similar two-column with tabs (70% / 30%)

**Structure:**
```tsx
<div className="container mx-auto p-6">
  {/* Header */}
  <LoadDetailHeader
    load={load}
    onDispatch={() => handleDispatch()}
    onUpdateStatus={() => handleStatusUpdate()}
    onTrack={() => setActiveTab('tracking')}
  />

  <div className="grid grid-cols-3 gap-6 mt-6">
    {/* Main Content */}
    <div className="col-span-2">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stops">Stops</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <LoadOverviewTab load={load} />
        </TabsContent>

        <TabsContent value="stops">
          <LoadStopsTab loadId={id} />
        </TabsContent>

        <TabsContent value="tracking">
          <LoadTrackingTab loadId={id} />
        </TabsContent>

        <TabsContent value="documents">
          <LoadDocumentsTab loadId={id} />
        </TabsContent>

        <TabsContent value="timeline">
          <LoadTimelineTab loadId={id} />
        </TabsContent>
      </Tabs>
    </div>

    {/* Sidebar */}
    <div className="col-span-1 space-y-4">
      <LoadCarrierCard load={load} />
      <LoadDriverCard load={load} />
      <FinancialSummaryCard
        revenue={order.customerRate}
        cost={load.totalCost}
        margin={order.customerRate - load.totalCost}
      />
      <QuickActionsCard loadId={id} />
    </div>
  </div>
</div>
```

**Tab Content Details:**

**Overview Tab:**
- Order link (breadcrumb back to parent order)
- Carrier information (company name, MC#, DOT#, insurance status)
- Driver information (name, phone, CDL#, truck#, trailer#)
- Equipment details (type, length, weight limit)
- Load status with progression indicator
- Rate and cost breakdown
- Dispatch notes

**Stops Tab:**
- Interactive stop list with status badges
- Arrive/Depart action buttons (status updates via API)
- Actual vs. scheduled times with variance indicator
- Detention time tracking (auto-calculated)
- Contact information per stop
- Special instructions per stop
- Appointment requirements
- Notes field per stop

**Tracking Tab:**
- Map view showing current location (if GPS data available)
- Location history timeline
- Check calls log with timestamps
- ETA to next stop and final destination
- Last updated timestamp
- "Request Location" button (triggers check call)
- Geofence alerts (if near stop but not checked in)

**Documents Tab:**
- BOL (Bill of Lading)
- POD (Proof of Delivery) - required for DELIVERED status
- Rate Confirmation - auto-generated PDF
- Photos (damage, freight, etc.)
- Upload functionality
- Download/preview functionality
- Document status (pending, received, verified)

**Timeline Tab:**
- Activity feed (same as Order timeline but load-specific events)
- Events: Created, Carrier Assigned, Dispatched, Picked Up, Status Updates, Check Calls, Documents Uploaded

### Load Board Page

**Route:** `/load-board/page.tsx`

**Layout:** Full-width with filters and toggleable grid/table view

**Structure:**
```tsx
<div className="container mx-auto p-6">
  {/* Header */}
  <div className="flex justify-between items-center mb-6">
    <div>
      <h1 className="text-3xl font-bold">Load Board</h1>
      <p className="text-muted-foreground">Available loads for carrier assignment</p>
    </div>
    <Button onClick={() => router.push('/load-board/post')}>
      <Plus className="mr-2 h-4 w-4" />
      Post New Load
    </Button>
  </div>

  {/* KPI Cards */}
  <LoadBoardKPIs dashboard={dashboardData} />

  {/* Filters */}
  <LoadBoardFilters
    filters={filters}
    onFilterChange={handleFilterChange}
  />

  {/* View Toggle */}
  <LoadBoardViewToggle
    view={view}
    onViewChange={setView}
  />

  {/* Content */}
  {view === 'card' ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {postings.map(posting => (
        <LoadPostingCard
          key={posting.id}
          posting={posting}
          onClick={() => router.push(`/load-board/postings/${posting.id}`)}
        />
      ))}
    </div>
  ) : (
    <LoadPostingTable
      postings={postings}
      onRowClick={(posting) => router.push(`/load-board/postings/${posting.id}`)}
    />
  )}

  {/* Pagination */}
  <Pagination
    page={page}
    pageSize={20}
    total={total}
    onPageChange={handlePageChange}
  />
</div>
```

**KPI Cards (4 cards in a row):**
1. **Active Postings:** Count of status=ACTIVE postings
2. **Total Bids:** Sum of bids across all postings (future: from Bids table)
3. **Filled Today:** Count of postings with status=FILLED and filledAt=today
4. **Avg Time to Fill:** Average hours from postedAt to filledAt (for FILLED postings)

**Filters:**
- Equipment Type: Multi-select (Dry Van, Reefer, Flatbed, Step Deck, etc.)
- Origin: City/State autocomplete
- Destination: City/State autocomplete
- Pickup Date: Date range picker
- Status: Single select (ACTIVE default, EXPIRED, FILLED, ALL)
- Rate Range: Slider (min-max)
- Distance: Slider (0-3000 miles)

**Card View (LoadPostingCard):**
```tsx
<Card className="hover:shadow-lg transition-shadow cursor-pointer">
  <CardHeader>
    <div className="flex justify-between items-start">
      <div>
        <CardTitle>{posting.postingNumber}</CardTitle>
        <CardDescription>
          {posting.originCity}, {posting.originState} → {posting.destinationCity}, {posting.destinationState}
        </CardDescription>
      </div>
      <Badge variant={statusVariant}>{posting.status}</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Truck className="h-4 w-4 text-muted-foreground" />
        <span>{posting.equipmentType} - {posting.equipmentLength}ft</span>
      </div>
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">${posting.targetRate.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>Pickup: {formatDate(posting.pickupDate)}</span>
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span>{posting.distance} miles</span>
      </div>
    </div>
  </CardContent>
  <CardFooter className="text-sm text-muted-foreground">
    Expires in {getTimeRemaining(posting.expiresAt)}
  </CardFooter>
</Card>
```

**Table View (LoadPostingTable):**
Columns:
- Posting # (sortable)
- Route (origin → destination)
- Equipment (type + length)
- Target Rate (sortable, formatted currency)
- Pickup Date (sortable, formatted)
- Distance (sortable, miles)
- Expires In (relative time, color-coded: red < 6 hours, yellow < 24 hours, green > 24 hours)
- Status (badge)

---

## 4. Components & Reusability

### Existing Components (Reuse)

From existing codebase:
- `ListPage` - Used in Orders list, perfect pattern for Load Board
- `Badge` - Status indicators (order, load, posting statuses)
- `Button`, `Card`, `Tabs`, `Table`, `Input`, `Select` - shadcn/ui primitives
- `DataTable` - For tabular data (stops, loads lists)
- Pattern components from `apps/web/components/patterns/`

### New Components to Build

**Order Detail Components:**
```
apps/web/components/tms/orders/
├─ order-detail-header.tsx      - Order number, status badge, action buttons
├─ order-overview-tab.tsx        - Customer, freight, rates display
├─ order-stops-tab.tsx           - Stops table/timeline
├─ order-loads-tab.tsx           - Related loads table
├─ order-documents-tab.tsx       - Document list with upload
├─ order-timeline-tab.tsx        - Activity feed
└─ order-customer-card.tsx       - Sidebar customer info card
```

**Load Detail Components:**
```
apps/web/components/tms/loads/
├─ load-detail-header.tsx        - Load number, status, action buttons
├─ load-overview-tab.tsx         - Carrier, driver, equipment display
├─ load-stops-tab.tsx            - Stops with arrive/depart actions
├─ load-tracking-tab.tsx         - Map view, location history, check calls
├─ load-documents-tab.tsx        - BOL, POD, rate con list
├─ load-timeline-tab.tsx         - Activity feed
├─ load-carrier-card.tsx         - Sidebar carrier info card
├─ load-driver-card.tsx          - Sidebar driver info card
└─ load-quick-actions-card.tsx  - Call, message, download actions
```

**Load Board Components:**
```
apps/web/components/tms/load-board/
├─ load-board-filters.tsx        - Equipment, origin, destination, date filters
├─ load-board-kpis.tsx           - 4 KPI cards row
├─ load-posting-card.tsx         - Card view item with route, rate, equipment
├─ load-posting-table.tsx        - Table view with sortable columns
└─ load-board-view-toggle.tsx   - Switch between card/table view
```

**Shared/Utility Components:**
```
apps/web/components/tms/shared/
├─ status-badge.tsx              - Unified status badge with color mapping
├─ timeline-feed.tsx             - Reusable activity timeline component
├─ stop-timeline.tsx             - Visual stop progression (pickup → delivery)
├─ financial-summary-card.tsx   - Rates, charges, margin display
└─ metadata-card.tsx            - Created by, dates, IDs display
```

### Custom Hooks (Data Fetching)

```
apps/web/lib/hooks/tms/
├─ use-order.ts                  - Fetch single order
├─ use-order-loads.ts            - Fetch order's loads
├─ use-order-timeline.ts         - Fetch order timeline
├─ use-order-documents.ts        - Fetch order documents
├─ use-load.ts                   - Fetch single load
├─ use-load-stops.ts             - Fetch load stops
├─ use-load-tracking.ts          - Fetch load location/check calls
├─ use-load-documents.ts         - Fetch load documents
├─ use-load-timeline.ts          - Fetch load timeline
├─ use-load-board-postings.ts   - Fetch load board postings with filters
└─ use-load-board-dashboard.ts  - Fetch load board KPIs
```

**Hook Pattern (using React Query):**
```tsx
export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/orders/${id}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      return response.json();
    },
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
}
```

### TypeScript Types

Leverage existing types from backend (if exported), or create frontend types:

```typescript
// apps/web/types/orders.ts
export type OrderStatus =
  | 'QUOTED'
  | 'BOOKED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: string;
  customerReference?: string;
  poNumber?: string;
  bolNumber?: string;
  customerId: string;
  status: OrderStatus;
  customerRate: number;
  totalCharges: number;
  commodity?: string;
  equipmentType?: string;
  // ... all fields from Prisma schema
}

// Similar for Load, LoadPost, Stop, etc.
```

---

## 5. Error Handling & Loading States

### Loading States

**Initial Page Load:**
- Full-page skeleton matching page structure
- Skeleton for header, tabs, sidebar cards
- Use `isLoading` from React Query hooks

```tsx
if (isLoading) {
  return <OrderDetailSkeleton />;
}
```

**Tab Switching:**
- Skeleton within tab content area only
- Keep header and sidebar visible
- Smooth transition (no flash of content)

**Data Refetch:**
- Subtle spinner in top-right corner
- Data stays visible during refresh
- Use `isFetching` (not `isLoading`)

**Pagination/Filtering:**
- Loading overlay on table/grid
- Disable filter inputs during fetch
- Keep previous data visible until new data arrives

### Error Handling

**Page-Level Errors:**

```tsx
// 404 - Order/Load not found
if (error?.status === 404) {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Not Found</CardTitle>
          <CardDescription>
            The order you're looking for doesn't exist or has been deleted.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push('/operations/orders')}>
            Back to Orders
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// 500 - Server error
if (error) {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Failed to Load Order</CardTitle>
          <CardDescription>
            {error.message || 'An unexpected error occurred.'}
          </CardDescription>
        </CardHeader>
        <CardFooter className="gap-2">
          <Button onClick={() => refetch()}>Retry</Button>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

**Partial Failures (Tab Errors):**
- Show error state within tab only
- Other tabs continue to work
- Each tab has its own error boundary

```tsx
<TabsContent value="timeline">
  <ErrorBoundary
    fallback={
      <div className="p-4 border border-destructive rounded-lg">
        <p className="text-destructive font-medium">Failed to load timeline</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => refetchTimeline()}
        >
          Retry
        </Button>
      </div>
    }
  >
    <OrderTimelineTab orderId={id} />
  </ErrorBoundary>
</TabsContent>
```

**API Integration Errors:**

| Status Code | Error Message | Action |
|-------------|---------------|--------|
| 400 | "Invalid request. Please check your input." | Show field errors |
| 401 | "Your session has expired. Please log in again." | Redirect to login |
| 403 | "You don't have permission to view this resource." | Show access denied page |
| 404 | "Resource not found." | Show not found state |
| 408 | "Request timed out. Please try again." | Show retry button |
| 500 | "Server error. Our team has been notified." | Show retry + support link |
| 503 | "Service unavailable. Please try again later." | Show maintenance page |

**Network Errors:**
```tsx
if (error.name === 'NetworkError') {
  toast.error('Network error. Please check your connection.');
}
```

### Empty States

**Order with No Loads:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>No Loads</CardTitle>
    <CardDescription>
      This order doesn't have any loads yet.
    </CardDescription>
  </CardHeader>
  <CardContent className="flex justify-center py-8">
    <Button onClick={() => router.push(`/operations/loads/new?orderId=${orderId}`)}>
      <Plus className="mr-2 h-4 w-4" />
      Create Load
    </Button>
  </CardContent>
</Card>
```

**Load with No Documents:**
```tsx
<div className="border-2 border-dashed border-muted rounded-lg p-12 text-center">
  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold mb-2">No Documents</h3>
  <p className="text-muted-foreground mb-4">
    No documents have been uploaded for this load yet.
  </p>
  <Button>
    <Upload className="mr-2 h-4 w-4" />
    Upload Document
  </Button>
</div>
```

**Load Board with No Results:**
```tsx
<Card className="p-12 text-center">
  <Truck className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
  <h3 className="text-xl font-semibold mb-2">No Loads Found</h3>
  <p className="text-muted-foreground mb-4">
    No available loads match your current filters.
  </p>
  <div className="flex gap-2 justify-center">
    <Button variant="outline" onClick={clearFilters}>
      Clear Filters
    </Button>
    <Button onClick={() => router.push('/load-board/post')}>
      Post New Load
    </Button>
  </div>
</Card>
```

### Toast Notifications

Use existing toast system for user feedback:

**Success:**
- "Order updated successfully"
- "Load dispatched to carrier"
- "Status changed to In Transit"

**Error:**
- "Failed to update order. Please try again."
- "Unable to assign carrier. Please check carrier availability."
- "Network error. Please check your connection."

**Warning:**
- "This order has unassigned loads"
- "Load is 2 hours past scheduled pickup time"
- "Rate confirmation not signed"

**Info:**
- "Order timeline updated"
- "New document uploaded"
- "Check call logged"

### Stale Data Handling

**Refetch Strategies:**
```tsx
// Refetch on window focus (for critical real-time pages)
queryClient.setDefaultOptions({
  queries: {
    refetchOnWindowFocus: true, // Load Board only
    staleTime: 30000, // 30 seconds for detail pages
  },
});

// Manual refresh button
<Button
  variant="ghost"
  size="icon"
  onClick={() => refetch()}
  disabled={isFetching}
>
  <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
</Button>

// Show last updated timestamp
<p className="text-xs text-muted-foreground">
  Updated {formatDistanceToNow(data.updatedAt)} ago
</p>
```

---

## 6. Implementation Plan Summary

### Phase 1: Seed Data (Week 1)

1. **Update TMS Core seed** (`apps/api/prisma/seed/tms-core.ts`):
   - Reduce Orders from 20 to 10 per tenant
   - Enhance Order fields (add realistic data for all fields)
   - Improve Stops (realistic city pairs, scheduling)

2. **Create Loads seed** (`apps/api/prisma/seed/loads.ts`):
   - Generate 1-2 Loads per Order (~15 per tenant)
   - 70% assigned to carriers, 30% unassigned
   - Realistic status progression
   - Copy stops from Order to Load
   - Add check calls for in-transit loads

3. **Create Load Board seed** (`apps/api/prisma/seed/load-board.ts`):
   - Generate ~5 LoadPosts per tenant (only from unassigned Loads)
   - 80% ACTIVE, 15% EXPIRED, 5% FILLED
   - Realistic posting windows (24-72 hours)

4. **Update main seed file** (`apps/api/prisma/seed.ts`):
   - Import and call new seedLoads() and seedLoadBoard()
   - Maintain proper dependency order

5. **Test seed data**:
   - Run `pnpm db:seed`
   - Verify relationships (Order → Load → LoadPost)
   - Check data quality in Prisma Studio

### Phase 2: Order Detail Page (Week 2)

1. Create custom hooks (useOrder, useOrderLoads, useOrderTimeline, useOrderDocuments)
2. Build header component
3. Build tab components (Overview, Stops, Loads, Documents, Timeline)
4. Build sidebar components (Customer card, Financial summary, Metadata)
5. Create main page with routing
6. Add loading/error states
7. Test with seed data

### Phase 3: Load Detail Page (Week 2-3)

1. Create custom hooks (useLoad, useLoadStops, useLoadTracking, etc.)
2. Build header component
3. Build tab components (Overview, Stops, Tracking, Documents, Timeline)
4. Build sidebar components (Carrier, Driver, Financial, Quick actions)
5. Create main page with routing
6. Add loading/error states
7. Test with seed data

### Phase 4: Load Board Page (Week 3)

1. Create custom hooks (useLoadBoardPostings, useLoadBoardDashboard)
2. Build KPI cards component
3. Build filters component
4. Build posting card component (card view)
5. Build posting table component (table view)
6. Build view toggle
7. Create main page with routing
8. Add pagination
9. Add loading/error states
10. Test with seed data

### Phase 5: Integration & Testing (Week 4)

1. End-to-end testing of all pages
2. Navigation flow testing (Orders list → Order detail → Load detail)
3. Load Board filtering and search
4. Performance testing with seed data
5. Error scenario testing
6. Mobile responsiveness check
7. Accessibility audit
8. Bug fixes and polish

---

## 7. Success Criteria

**Seed Data:**
- ✅ 10 Orders per tenant with realistic data
- ✅ ~15 Loads per tenant linked to Orders
- ✅ ~5 Load Board postings from unassigned Loads
- ✅ All relationships intact (Order → Load → LoadPost)
- ✅ Realistic status distribution
- ✅ Valid data for all required fields

**Order Detail Page:**
- ✅ Displays all order information correctly
- ✅ Shows related loads in Loads tab
- ✅ Timeline shows order history
- ✅ Sidebar shows customer info and financials
- ✅ Loading/error states work correctly
- ✅ Navigation to/from Orders list works

**Load Detail Page:**
- ✅ Displays all load information correctly
- ✅ Shows carrier and driver info
- ✅ Stops tab displays stop progression
- ✅ Tracking tab shows location (if available)
- ✅ Documents tab shows BOL, POD, rate con
- ✅ Loading/error states work correctly
- ✅ Navigation from Order detail works

**Load Board Page:**
- ✅ Displays available load postings
- ✅ KPI cards show correct metrics
- ✅ Filters work (equipment, origin, destination, date, rate, status)
- ✅ Card view and table view both functional
- ✅ Pagination works correctly
- ✅ Click posting navigates to detail (future enhancement)
- ✅ Loading/error states work correctly

**Overall:**
- ✅ All pages responsive (mobile, tablet, desktop)
- ✅ All pages accessible (WCAG 2.1 AA)
- ✅ No console errors
- ✅ TypeScript strict mode passes
- ✅ Integration with backend APIs verified
- ✅ Performance: Pages load in < 2 seconds
- ✅ Error handling covers common scenarios

---

## 8. Future Enhancements (Post-MVP)

**Order Detail:**
- Edit order inline (modal or inline edit mode)
- Clone order functionality
- Cancel order with reason
- Email order confirmation to customer
- Export order to PDF

**Load Detail:**
- Dispatch load (assign driver, send notifications)
- Update status with validation (can't skip states)
- Real-time GPS tracking on map
- Upload documents (BOL, POD) with camera
- Generate and download rate confirmation PDF
- Send text to driver

**Load Board:**
- Posting detail page with carrier bidding
- Post new load form (create LoadPost)
- Accept/reject carrier bids
- Auto-matching rules configuration
- Real-time updates (WebSocket)
- Saved searches and alerts
- Export postings to CSV

**General:**
- Optimistic updates for status changes
- Bulk actions (select multiple orders/loads)
- Advanced filtering (saved filters, complex queries)
- Keyboard shortcuts
- Dark mode support
- Print stylesheets
- PDF export for all pages

---

## 9. Technical Notes

**Database Considerations:**
- Seed script uses transactions for data consistency
- Soft deletes respected (deletedAt field)
- All foreign keys validated before insert
- Indexes on frequently queried fields (status, dates, IDs)

**Performance Considerations:**
- Use React Query caching to reduce API calls
- Implement pagination for large lists
- Lazy load tab content (only fetch when tab opens)
- Use skeleton loaders instead of spinners
- Debounce filter inputs (300ms)
- Consider virtualization for very long lists

**Security Considerations:**
- All API calls include tenant context
- Validate user permissions on backend
- Sanitize user inputs
- No sensitive data in URLs
- Rate limiting on API endpoints
- CSRF protection enabled

**Accessibility:**
- Semantic HTML throughout
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators visible
- Color contrast WCAG AA compliant
- Screen reader tested

---

## Appendix A: Realistic City Pairs for Seed Data

Common freight lanes (high volume routes):

| Origin | Destination | Distance | Common Freight |
|--------|-------------|----------|----------------|
| Los Angeles, CA | Chicago, IL | 2,015 mi | Electronics, Consumer Goods |
| Chicago, IL | New York, NY | 790 mi | Manufactured Goods, Food |
| Dallas, TX | Atlanta, GA | 780 mi | General Freight, Construction |
| Atlanta, GA | Miami, FL | 660 mi | Produce, Consumer Goods |
| Seattle, WA | Los Angeles, CA | 1,135 mi | Technology, Lumber |
| Phoenix, AZ | Denver, CO | 600 mi | Construction, Manufacturing |
| Houston, TX | New Orleans, LA | 350 mi | Petrochemicals, Food |
| Memphis, TN | Kansas City, MO | 450 mi | Distribution, General Freight |
| Portland, OR | San Francisco, CA | 635 mi | Agriculture, Technology |
| Detroit, MI | Cleveland, OH | 170 mi | Automotive, Manufacturing |

---

## Appendix B: Status Color Mapping

**Order Status Colors:**
- QUOTED: `text-blue-600 bg-blue-50 border-blue-200`
- BOOKED: `text-green-600 bg-green-50 border-green-200`
- IN_TRANSIT: `text-purple-600 bg-purple-50 border-purple-200`
- DELIVERED: `text-gray-600 bg-gray-50 border-gray-200`
- CANCELLED: `text-red-600 bg-red-50 border-red-200`

**Load Status Colors:**
- PENDING: `text-yellow-600 bg-yellow-50 border-yellow-200`
- ASSIGNED: `text-blue-600 bg-blue-50 border-blue-200`
- DISPATCHED: `text-indigo-600 bg-indigo-50 border-indigo-200`
- PICKED_UP: `text-cyan-600 bg-cyan-50 border-cyan-200`
- IN_TRANSIT: `text-purple-600 bg-purple-50 border-purple-200`
- DELIVERED: `text-green-600 bg-green-50 border-green-200`
- CANCELLED: `text-red-600 bg-red-50 border-red-200`

**LoadPost Status Colors:**
- ACTIVE: `text-green-600 bg-green-50 border-green-200`
- FILLED: `text-blue-600 bg-blue-50 border-blue-200`
- EXPIRED: `text-orange-600 bg-orange-50 border-orange-200`
- CANCELLED: `text-red-600 bg-red-50 border-red-200`

---

**End of Design Document**

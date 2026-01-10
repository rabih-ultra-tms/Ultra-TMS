# 01 - TMS Core Service API Implementation

> **Service:** TMS Core (Orders, Loads, Stops, Tracking)  
> **Priority:** P0 - Critical Path  
> **Endpoints:** 45  
> **Dependencies:** Auth ✅, CRM ✅, Sales ✅  
> **Doc Reference:** [11-service-tms-core.md](../../02-services/11-service-tms-core.md)

---

## 📋 Overview

The TMS Core service is the heart of the Ultra-TMS platform, managing the complete lifecycle of freight orders from creation through delivery. This service handles orders, loads, stops, tracking, and status management.

### Key Capabilities
- Order management (create, update, clone, convert from quote)
- Load management (create, assign carrier, dispatch)
- Stop management (pickup, delivery, intermediate)
- Check call tracking and status updates
- Status workflow enforcement
- Integration with Carrier, CRM, and Accounting services

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Prompt 00 (Verify Existing Services) is complete
- [ ] Auth service is working (JWT authentication)
- [ ] CRM service is working (Company/Contact lookup)
- [ ] Sales service is working (Quote conversion)
- [ ] Database models exist in `schema.prisma`
- [ ] Redis is running for caching

---

## 🗄️ Database Models Reference

### Order Model
```prisma
model Order {
  id                String          @id @default(cuid())
  tenantId          String
  orderNumber       String          // Auto-generated: ORD-YYYYMMDD-XXXX
  status            OrderStatus     @default(PENDING)
  customerId        String          // References Company
  customerContactId String?         // References Contact
  billToId          String?         // References Company (if different)
  
  // Dates
  orderDate         DateTime        @default(now())
  requestedPickup   DateTime?
  requestedDelivery DateTime?
  
  // Financial
  totalRevenue      Decimal         @db.Decimal(12, 2)
  totalCost         Decimal?        @db.Decimal(12, 2)
  margin            Decimal?        @db.Decimal(12, 2)
  marginPercent     Decimal?        @db.Decimal(5, 2)
  
  // References
  quoteId           String?         // If converted from quote
  salesRepId        String?         // Assigned sales rep
  
  // Shipping details
  equipmentType     EquipmentType
  commodity         String?
  weight            Decimal?        @db.Decimal(10, 2)
  pieces            Int?
  pallets           Int?
  
  // Special requirements
  hazmat            Boolean         @default(false)
  hazmatClass       String?
  teamRequired      Boolean         @default(false)
  specialInstructions String?       @db.Text
  
  // Migration support
  externalId        String?
  sourceSystem      String?
  customFields      Json?
  
  // Audit
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  deletedAt         DateTime?
  createdById       String
  updatedById       String
  
  // Relations
  tenant            Tenant          @relation(fields: [tenantId], references: [id])
  customer          Company         @relation("OrderCustomer", fields: [customerId], references: [id])
  items             OrderItem[]
  loads             Load[]
  statusHistory     StatusHistory[]
  documents         DocumentLink[]
  
  @@unique([tenantId, orderNumber])
  @@index([tenantId, status])
  @@index([tenantId, customerId])
  @@index([tenantId, orderDate])
}

enum OrderStatus {
  PENDING
  QUOTED
  BOOKED
  DISPATCHED
  IN_TRANSIT
  DELIVERED
  COMPLETED
  CANCELLED
  ON_HOLD
}
```

### Load Model
```prisma
model Load {
  id                String          @id @default(cuid())
  tenantId          String
  loadNumber        String          // Auto-generated: LD-YYYYMMDD-XXXX
  orderId           String
  status            LoadStatus      @default(PENDING)
  
  // Assignment
  carrierId         String?
  driverId          String?
  dispatcherId      String?
  
  // Financial
  carrierRate       Decimal?        @db.Decimal(12, 2)
  fuelSurcharge     Decimal?        @db.Decimal(12, 2)
  accessorials      Decimal?        @db.Decimal(12, 2)
  totalCarrierCost  Decimal?        @db.Decimal(12, 2)
  
  // Equipment
  equipmentType     EquipmentType
  trailerNumber     String?
  tractorNumber     String?
  
  // Scheduling
  scheduledPickup   DateTime?
  scheduledDelivery DateTime?
  actualPickup      DateTime?
  actualDelivery    DateTime?
  
  // Tracking
  currentLat        Decimal?        @db.Decimal(10, 7)
  currentLng        Decimal?        @db.Decimal(10, 7)
  currentLocation   String?
  lastCheckCall     DateTime?
  eta               DateTime?
  
  // Notes
  internalNotes     String?         @db.Text
  carrierNotes      String?         @db.Text
  
  // Migration support
  externalId        String?
  sourceSystem      String?
  customFields      Json?
  
  // Audit
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  deletedAt         DateTime?
  createdById       String
  updatedById       String
  
  // Relations
  tenant            Tenant          @relation(fields: [tenantId], references: [id])
  order             Order           @relation(fields: [orderId], references: [id])
  carrier           Carrier?        @relation(fields: [carrierId], references: [id])
  driver            Driver?         @relation(fields: [driverId], references: [id])
  stops             Stop[]
  checkCalls        CheckCall[]
  statusHistory     StatusHistory[]
  
  @@unique([tenantId, loadNumber])
  @@index([tenantId, status])
  @@index([tenantId, carrierId])
  @@index([tenantId, scheduledPickup])
}

enum LoadStatus {
  PENDING
  TENDERED
  ACCEPTED
  DISPATCHED
  AT_PICKUP
  IN_TRANSIT
  AT_DELIVERY
  DELIVERED
  COMPLETED
  CANCELLED
}
```

### Stop Model
```prisma
model Stop {
  id                String          @id @default(cuid())
  tenantId          String
  loadId            String
  stopNumber        Int             // Sequence: 1, 2, 3...
  stopType          StopType
  
  // Location
  facilityName      String
  address1          String
  address2          String?
  city              String
  state             String
  postalCode        String
  country           String          @default("USA")
  lat               Decimal?        @db.Decimal(10, 7)
  lng               Decimal?        @db.Decimal(10, 7)
  
  // Contact
  contactName       String?
  contactPhone      String?
  contactEmail      String?
  
  // Scheduling
  appointmentType   AppointmentType @default(OPEN)
  appointmentStart  DateTime?
  appointmentEnd    DateTime?
  actualArrival     DateTime?
  actualDeparture   DateTime?
  
  // Cargo
  pieces            Int?
  weight            Decimal?        @db.Decimal(10, 2)
  pallets           Int?
  poNumbers         String[]
  referenceNumbers  String[]
  
  // Special instructions
  instructions      String?         @db.Text
  
  // Status
  status            StopStatus      @default(PENDING)
  
  // Audit
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  createdById       String
  updatedById       String
  
  // Relations
  tenant            Tenant          @relation(fields: [tenantId], references: [id])
  load              Load            @relation(fields: [loadId], references: [id])
  
  @@index([tenantId, loadId])
  @@index([loadId, stopNumber])
}

enum StopType {
  PICKUP
  DELIVERY
  STOP_OFF
  DROP_TRAILER
  HOOK_TRAILER
}

enum StopStatus {
  PENDING
  EN_ROUTE
  ARRIVED
  LOADING
  UNLOADING
  DEPARTED
  COMPLETED
  SKIPPED
}

enum AppointmentType {
  OPEN
  FCFS
  APPOINTMENT
  WILL_CALL
}
```

### CheckCall Model
```prisma
model CheckCall {
  id                String          @id @default(cuid())
  tenantId          String
  loadId            String
  
  // Location
  lat               Decimal         @db.Decimal(10, 7)
  lng               Decimal         @db.Decimal(10, 7)
  city              String?
  state             String?
  locationNotes     String?
  
  // Status
  status            LoadStatus?
  eta               DateTime?
  etaAccuracy       String?         // "HIGH", "MEDIUM", "LOW"
  
  // Source
  source            CheckCallSource
  reportedBy        String?
  
  // Notes
  notes             String?         @db.Text
  
  // Timestamps
  reportedAt        DateTime        @default(now())
  createdAt         DateTime        @default(now())
  
  // Relations
  tenant            Tenant          @relation(fields: [tenantId], references: [id])
  load              Load            @relation(fields: [loadId], references: [id])
  
  @@index([tenantId, loadId])
  @@index([loadId, reportedAt])
}

enum CheckCallSource {
  DRIVER
  DISPATCHER
  EDI
  GPS
  CARRIER_PORTAL
  CUSTOMER_PORTAL
  API
}
```

### StatusHistory Model
```prisma
model StatusHistory {
  id                String          @id @default(cuid())
  tenantId          String
  entityType        String          // "ORDER", "LOAD", "STOP"
  entityId          String
  
  oldStatus         String?
  newStatus         String
  reason            String?
  notes             String?         @db.Text
  
  changedAt         DateTime        @default(now())
  changedById       String
  
  // Relations
  tenant            Tenant          @relation(fields: [tenantId], references: [id])
  changedBy         User            @relation(fields: [changedById], references: [id])
  
  @@index([tenantId, entityType, entityId])
  @@index([entityType, entityId, changedAt])
}
```

---

## 🛠️ API Endpoints

### Orders Resource

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/orders` | List orders with filters |
| GET | `/api/v1/orders/:id` | Get order details |
| POST | `/api/v1/orders` | Create new order |
| PUT | `/api/v1/orders/:id` | Update order |
| DELETE | `/api/v1/orders/:id` | Cancel/delete order |
| POST | `/api/v1/orders/:id/clone` | Clone order |
| POST | `/api/v1/orders/from-quote/:quoteId` | Create from quote |
| PATCH | `/api/v1/orders/:id/status` | Update order status |
| GET | `/api/v1/orders/:id/history` | Get status history |
| GET | `/api/v1/orders/:id/stops` | Get order stops (all loads) |
| GET | `/api/v1/orders/:id/loads` | Get order loads |
| POST | `/api/v1/orders/:id/loads` | Create load for order |
| GET | `/api/v1/orders/:id/documents` | Get order documents |
| GET | `/api/v1/orders/:id/items` | Get order items |
| POST | `/api/v1/orders/:id/items` | Add order item |
| PUT | `/api/v1/orders/:id/items/:itemId` | Update order item |
| DELETE | `/api/v1/orders/:id/items/:itemId` | Remove order item |

### Loads Resource

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/loads` | List loads with filters |
| GET | `/api/v1/loads/:id` | Get load details |
| POST | `/api/v1/loads` | Create new load |
| PUT | `/api/v1/loads/:id` | Update load |
| DELETE | `/api/v1/loads/:id` | Cancel load |
| PATCH | `/api/v1/loads/:id/assign` | Assign carrier |
| PATCH | `/api/v1/loads/:id/dispatch` | Dispatch load |
| PATCH | `/api/v1/loads/:id/status` | Update status |
| GET | `/api/v1/loads/:id/stops` | Get load stops |
| POST | `/api/v1/loads/:id/stops` | Add stop |
| GET | `/api/v1/loads/:id/check-calls` | Get check calls |
| POST | `/api/v1/loads/:id/check-calls` | Add check call |
| GET | `/api/v1/loads/:id/tracking` | Get tracking info |
| GET | `/api/v1/loads/:id/documents` | Get load documents |
| POST | `/api/v1/loads/:id/rate-con` | Generate rate confirmation |
| GET | `/api/v1/loads/dispatch-board` | Dispatch board view |
| GET | `/api/v1/loads/map` | Map tracking view |

### Stops Resource

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/stops/:id` | Get stop details |
| PUT | `/api/v1/stops/:id` | Update stop |
| DELETE | `/api/v1/stops/:id` | Remove stop |
| PATCH | `/api/v1/stops/:id/arrive` | Record arrival |
| PATCH | `/api/v1/stops/:id/depart` | Record departure |
| PATCH | `/api/v1/stops/:id/complete` | Complete stop |
| PUT | `/api/v1/stops/:id/reorder` | Reorder stops |

---

## 📝 DTO Specifications

### CreateOrderDto
```typescript
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsOptional()
  @IsString()
  customerContactId?: string;

  @IsOptional()
  @IsString()
  billToId?: string;

  @IsOptional()
  @IsDateString()
  requestedPickup?: string;

  @IsOptional()
  @IsDateString()
  requestedDelivery?: string;

  @IsNumber()
  @Min(0)
  totalRevenue: number;

  @IsEnum(EquipmentType)
  equipmentType: EquipmentType;

  @IsOptional()
  @IsString()
  commodity?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsInt()
  pieces?: number;

  @IsOptional()
  @IsInt()
  pallets?: number;

  @IsOptional()
  @IsBoolean()
  hazmat?: boolean;

  @IsOptional()
  @IsString()
  hazmatClass?: string;

  @IsOptional()
  @IsBoolean()
  teamRequired?: boolean;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsString()
  salesRepId?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items?: CreateOrderItemDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateStopDto)
  stops?: CreateStopDto[];
}
```

### UpdateOrderDto
```typescript
export class UpdateOrderDto extends PartialType(
  OmitType(CreateOrderDto, ['customerId'] as const)
) {}
```

### CreateLoadDto
```typescript
export class CreateLoadDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsEnum(EquipmentType)
  equipmentType: EquipmentType;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsNumber()
  carrierRate?: number;

  @IsOptional()
  @IsNumber()
  fuelSurcharge?: number;

  @IsOptional()
  @IsNumber()
  accessorials?: number;

  @IsOptional()
  @IsDateString()
  scheduledPickup?: string;

  @IsOptional()
  @IsDateString()
  scheduledDelivery?: string;

  @IsOptional()
  @IsString()
  trailerNumber?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateStopDto)
  stops?: CreateStopDto[];
}
```

### CreateStopDto
```typescript
export class CreateStopDto {
  @IsInt()
  @Min(1)
  stopNumber: number;

  @IsEnum(StopType)
  stopType: StopType;

  @IsString()
  @IsNotEmpty()
  facilityName: string;

  @IsString()
  @IsNotEmpty()
  address1: string;

  @IsOptional()
  @IsString()
  address2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @Length(2, 2)
  state: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsEnum(AppointmentType)
  appointmentType?: AppointmentType;

  @IsOptional()
  @IsDateString()
  appointmentStart?: string;

  @IsOptional()
  @IsDateString()
  appointmentEnd?: string;

  @IsOptional()
  @IsInt()
  pieces?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  poNumbers?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  referenceNumbers?: string[];

  @IsOptional()
  @IsString()
  instructions?: string;
}
```

### CreateCheckCallDto
```typescript
export class CreateCheckCallDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  locationNotes?: string;

  @IsOptional()
  @IsEnum(LoadStatus)
  status?: LoadStatus;

  @IsOptional()
  @IsDateString()
  eta?: string;

  @IsEnum(CheckCallSource)
  source: CheckCallSource;

  @IsOptional()
  @IsString()
  reportedBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

### OrderQueryDto
```typescript
export class OrderQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  salesRepId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(EquipmentType)
  equipmentType?: EquipmentType;

  @IsOptional()
  @IsString()
  originState?: string;

  @IsOptional()
  @IsString()
  destinationState?: string;
}
```

### LoadQueryDto
```typescript
export class LoadQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(LoadStatus)
  status?: LoadStatus;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  dispatcherId?: string;

  @IsOptional()
  @IsDateString()
  scheduledPickupFrom?: string;

  @IsOptional()
  @IsDateString()
  scheduledPickupTo?: string;

  @IsOptional()
  @IsEnum(EquipmentType)
  equipmentType?: EquipmentType;

  @IsOptional()
  @IsBoolean()
  unassigned?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
```

---

## 📋 Business Rules

### Order Status Workflow
```
PENDING → QUOTED → BOOKED → DISPATCHED → IN_TRANSIT → DELIVERED → COMPLETED
    ↓         ↓        ↓          ↓            ↓           ↓
    └─────────┴────────┴──────────┴────────────┴───────────┴──→ CANCELLED

Special Transitions:
- Any status → ON_HOLD (requires reason)
- ON_HOLD → Previous status (resume)
```

### Load Status Workflow
```
PENDING → TENDERED → ACCEPTED → DISPATCHED → AT_PICKUP → IN_TRANSIT → AT_DELIVERY → DELIVERED → COMPLETED
    ↓          ↓          ↓           ↓            ↓            ↓            ↓           ↓
    └──────────┴──────────┴───────────┴────────────┴────────────┴────────────┴───────────┴──→ CANCELLED

Auto-transitions:
- TENDERED → PENDING (if carrier declines)
- AT_PICKUP + depart → IN_TRANSIT
- AT_DELIVERY + depart → DELIVERED
```

### Stop Status Workflow
```
PENDING → EN_ROUTE → ARRIVED → LOADING/UNLOADING → DEPARTED → COMPLETED
                                                        ↓
                                                    SKIPPED
```

### Auto-Number Generation
```typescript
// Order: ORD-YYYYMMDD-XXXX
// Load: LD-YYYYMMDD-XXXX
// Where XXXX is daily sequence starting at 0001
```

### Margin Calculation
```typescript
margin = totalRevenue - totalCost
marginPercent = (margin / totalRevenue) * 100
```

### Check Call Requirements
- Required every 4 hours during IN_TRANSIT status
- Grace period: 30 minutes after requirement
- Alert generated if missed

### Validation Rules
1. Order must have at least one stop (pickup + delivery minimum)
2. Pickup stop must precede delivery stop
3. Carrier cannot be assigned to CANCELLED load
4. Status changes must follow allowed transitions
5. Completed orders cannot be modified (except notes)

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `order.created` | POST /orders | `{ orderId, orderNumber, customerId, tenantId }` |
| `order.updated` | PUT /orders/:id | `{ orderId, changes, tenantId }` |
| `order.status.changed` | PATCH /orders/:id/status | `{ orderId, oldStatus, newStatus, tenantId }` |
| `order.cancelled` | DELETE /orders/:id | `{ orderId, reason, tenantId }` |
| `load.created` | POST /loads | `{ loadId, loadNumber, orderId, tenantId }` |
| `load.assigned` | PATCH /loads/:id/assign | `{ loadId, carrierId, carrierRate, tenantId }` |
| `load.dispatched` | PATCH /loads/:id/dispatch | `{ loadId, carrierId, driverId, tenantId }` |
| `load.status.changed` | PATCH /loads/:id/status | `{ loadId, oldStatus, newStatus, tenantId }` |
| `load.delivered` | When status → DELIVERED | `{ loadId, orderId, actualDelivery, tenantId }` |
| `check-call.received` | POST /loads/:id/check-calls | `{ loadId, location, eta, tenantId }` |
| `stop.arrived` | PATCH /stops/:id/arrive | `{ stopId, loadId, arrivalTime, tenantId }` |
| `stop.departed` | PATCH /stops/:id/depart | `{ stopId, loadId, departureTime, tenantId }` |
| `stop.completed` | PATCH /stops/:id/complete | `{ stopId, loadId, tenantId }` |

---

## 🔌 Service Dependencies

### CRM Service (Required)
```typescript
// Validate customer exists
const customer = await this.crmService.getCompany(tenantId, customerId);
if (!customer) throw new BadRequestException('Customer not found');

// Get customer contacts
const contacts = await this.crmService.getCompanyContacts(tenantId, customerId);
```

### Sales Service (Required for quote conversion)
```typescript
// Convert quote to order
const quote = await this.salesService.getQuote(tenantId, quoteId);
const order = await this.createOrderFromQuote(quote);
await this.salesService.markQuoteConverted(tenantId, quoteId, order.id);
```

### Carrier Service (Required for load assignment)
```typescript
// Validate carrier before assignment
const carrier = await this.carrierService.getCarrier(tenantId, carrierId);
if (carrier.status !== 'ACTIVE') {
  throw new BadRequestException('Carrier is not active');
}

// Check carrier insurance/compliance
const compliance = await this.carrierService.checkCompliance(tenantId, carrierId);
if (!compliance.isCompliant) {
  throw new BadRequestException(`Carrier compliance issue: ${compliance.issues.join(', ')}`);
}
```

### Documents Service (for rate confirmation)
```typescript
// Generate rate confirmation PDF
const rateCon = await this.documentsService.generateFromTemplate(
  tenantId,
  'RATE_CONFIRMATION',
  { load, carrier, stops }
);
```

### Accounting Service (on delivery)
```typescript
// Trigger invoice creation
this.eventEmitter.emit('load.delivered', {
  loadId,
  orderId: load.orderId,
  actualDelivery: new Date(),
  tenantId
});
// Accounting service listens and creates invoice
```

---

## 🧪 Integration Test Requirements

### Order Tests
```typescript
describe('Orders API', () => {
  describe('GET /api/v1/orders', () => {
    it('should return paginated orders');
    it('should filter by status');
    it('should filter by customer');
    it('should filter by date range');
    it('should filter by sales rep');
    it('should search by order number');
    it('should isolate by tenant');
    it('should exclude deleted orders');
  });

  describe('GET /api/v1/orders/:id', () => {
    it('should return order with relations');
    it('should return 404 for non-existent order');
    it('should return 403 for other tenant order');
  });

  describe('POST /api/v1/orders', () => {
    it('should create order with valid data');
    it('should auto-generate order number');
    it('should validate required fields');
    it('should validate customer exists');
    it('should create with stops');
    it('should create with items');
    it('should publish order.created event');
  });

  describe('PUT /api/v1/orders/:id', () => {
    it('should update order');
    it('should not update completed order');
    it('should not update other tenant order');
  });

  describe('POST /api/v1/orders/:id/clone', () => {
    it('should clone order with new number');
    it('should clone stops');
    it('should reset status to PENDING');
  });

  describe('POST /api/v1/orders/from-quote/:quoteId', () => {
    it('should create order from quote');
    it('should copy all quote details');
    it('should mark quote as converted');
    it('should link order to quote');
  });

  describe('PATCH /api/v1/orders/:id/status', () => {
    it('should update status with valid transition');
    it('should reject invalid transition');
    it('should record status history');
    it('should publish status.changed event');
  });
});
```

### Load Tests
```typescript
describe('Loads API', () => {
  describe('GET /api/v1/loads', () => {
    it('should return paginated loads');
    it('should filter by status');
    it('should filter by carrier');
    it('should filter by scheduled pickup date');
    it('should filter unassigned loads');
    it('should isolate by tenant');
  });

  describe('POST /api/v1/loads', () => {
    it('should create load with valid data');
    it('should auto-generate load number');
    it('should validate order exists');
    it('should create with stops');
    it('should calculate total carrier cost');
  });

  describe('PATCH /api/v1/loads/:id/assign', () => {
    it('should assign carrier to load');
    it('should validate carrier exists');
    it('should validate carrier is active');
    it('should check carrier compliance');
    it('should update load status to TENDERED');
    it('should publish load.assigned event');
  });

  describe('PATCH /api/v1/loads/:id/dispatch', () => {
    it('should dispatch load');
    it('should require carrier assignment');
    it('should update status to DISPATCHED');
    it('should publish load.dispatched event');
  });

  describe('POST /api/v1/loads/:id/check-calls', () => {
    it('should add check call');
    it('should validate coordinates');
    it('should update load location');
    it('should update ETA if provided');
    it('should publish check-call.received event');
  });

  describe('GET /api/v1/loads/dispatch-board', () => {
    it('should return grouped loads by status');
    it('should include stop summaries');
    it('should include carrier info');
  });

  describe('GET /api/v1/loads/map', () => {
    it('should return loads with coordinates');
    it('should filter by date range');
    it('should include current location');
  });
});
```

### Stop Tests
```typescript
describe('Stops API', () => {
  describe('PATCH /api/v1/stops/:id/arrive', () => {
    it('should record arrival time');
    it('should update stop status');
    it('should update load status if first stop');
    it('should publish stop.arrived event');
  });

  describe('PATCH /api/v1/stops/:id/depart', () => {
    it('should record departure time');
    it('should update stop status');
    it('should advance load status');
    it('should publish stop.departed event');
  });

  describe('PATCH /api/v1/stops/:id/complete', () => {
    it('should complete stop');
    it('should validate arrival/departure recorded');
    it('should check if last stop');
    it('should update load status if last stop');
  });
});
```

### Tenant Isolation Tests
```typescript
describe('Tenant Isolation', () => {
  it('should not return orders from other tenants');
  it('should not return loads from other tenants');
  it('should not allow updating other tenant resources');
  it('should not allow assigning other tenant carriers');
  it('should include tenantId in all created records');
});
```

### Event Tests
```typescript
describe('Event Publishing', () => {
  it('should publish order.created on order creation');
  it('should publish order.status.changed on status update');
  it('should publish load.assigned on carrier assignment');
  it('should publish load.dispatched on dispatch');
  it('should publish load.delivered when status changes to DELIVERED');
  it('should publish check-call.received on check call');
});
```

---

## 📁 Module Structure

Create the following file structure:

```
apps/api/src/modules/tms/
├── tms.module.ts
├── orders/
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── dto/
│       ├── create-order.dto.ts
│       ├── update-order.dto.ts
│       ├── order-query.dto.ts
│       └── create-order-item.dto.ts
├── loads/
│   ├── loads.controller.ts
│   ├── loads.service.ts
│   └── dto/
│       ├── create-load.dto.ts
│       ├── update-load.dto.ts
│       ├── load-query.dto.ts
│       ├── assign-carrier.dto.ts
│       └── create-check-call.dto.ts
├── stops/
│   ├── stops.controller.ts
│   ├── stops.service.ts
│   └── dto/
│       ├── create-stop.dto.ts
│       └── update-stop.dto.ts
├── events/
│   ├── order-created.event.ts
│   ├── order-status-changed.event.ts
│   ├── load-assigned.event.ts
│   ├── load-dispatched.event.ts
│   ├── load-delivered.event.ts
│   └── check-call-received.event.ts
└── utils/
    ├── number-generator.ts
    └── status-validator.ts
```

---

## ✅ Completion Checklist

Before marking this prompt complete:

- [ ] All 45 endpoints implemented
- [ ] All DTOs with validation
- [ ] All business rules enforced
- [ ] All events publishing correctly
- [ ] All integration tests passing
- [ ] Tenant isolation verified
- [ ] API documentation updated (Swagger)
- [ ] No TypeScript errors
- [ ] No ESLint warnings

---

## 📊 Progress Tracker Update

After completing this service, update `progress-tracker.html`:

### Update Service Row
Find the TMS Core row in the services table and update:

```html
<tr>
    <td>4</td>
    <td>TMS Core</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>45/45</td>
    <td>6/6</td>
    <td>100%</td>
    <td>Orders, Loads, Stops, Tracking</td>
</tr>
```

### Update Dashboard Stats
Update the API Endpoints stat card:
```html
<div class="stat-card">
    <div class="label">API Endpoints</div>
    <div class="value">470</div>  <!-- 425 + 45 -->
    <div class="sub">of ~985 planned (47.7%)</div>
</div>
```

### Add Changelog Entry
```html
<div class="log-entry">
    <div class="log-date">January XX, 2026 - TMS Core API Complete</div>
    <ul class="log-items">
        <li>Implemented 45 TMS Core API endpoints</li>
        <li>Orders: CRUD, clone, convert from quote, status management</li>
        <li>Loads: CRUD, carrier assignment, dispatch, tracking</li>
        <li>Stops: CRUD, arrival/departure/completion recording</li>
        <li>Check calls with GPS coordinates and ETA</li>
        <li>Status workflow enforcement with history</li>
        <li>Full integration test coverage</li>
        <li>Event publishing for all state changes</li>
    </ul>
</div>
```

### Update Index
Update [00-index.md](./00-index.md):
- Change status from ⬜ to ✅
- Add completion date

---

## 🔜 Next Step

After completing this prompt, proceed to:

➡️ **[02-carrier-api.md](./02-carrier-api.md)** - Implement Carrier Service API

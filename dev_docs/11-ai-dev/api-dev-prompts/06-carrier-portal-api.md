# 06 - Carrier Portal API Implementation

> **Service:** Carrier Portal  
> **Priority:** P1 - High  
> **Endpoints:** 45  
> **Dependencies:** Auth/Admin ✅, Carrier ✅ (02), TMS Core ✅ (01), Documents ✅, Communication ✅, Accounting ✅, Load Board ✅  
> **Doc Reference:** [20-service-carrier-portal.md](../../02-services/20-service-carrier-portal.md)

---

## 📋 Overview

Self-service web portal for carriers to view available loads, accept tenders, update shipment status, upload PODs, submit invoices, and track payments. Supports both English and Spanish interfaces.

### Key Capabilities
- Available load browsing with lane preferences
- One-click load acceptance and tender response
- Real-time status updates from drivers
- POD upload via mobile camera or file upload
- Invoice submission and payment tracking
- Document management (insurance, authority, W-9)
- Settlement history and quick pay requests
- Spanish language support throughout

---

## ✅ Pre-Implementation Checklist

- [ ] Carrier service is working (Carrier lookup)
- [ ] TMS Core service is working (Loads)
- [ ] Documents service is working (File uploads)
- [ ] Accounting service is working (Settlements)
- [ ] Load Board service is working (Available loads)
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### CarrierPortalUser Model
```prisma
model CarrierPortalUser {
  id                String            @id @default(cuid())
  tenantId          String
  carrierId         String
  
  email             String
  passwordHash      String
  firstName         String
  lastName          String
  phone             String?
  jobTitle          String?
  
  role              CarrierPortalRole @default(DISPATCHER)
  permissions       Json              @default("[]")
  isPrimaryContact  Boolean           @default(false)
  
  driverId          String?           // Linked driver if applicable
  
  status            PortalUserStatus  @default(PENDING)
  emailVerified     Boolean           @default(false)
  emailVerifiedAt   DateTime?
  
  lastLoginAt       DateTime?
  loginCount        Int               @default(0)
  failedLoginCount  Int               @default(0)
  lockedUntil       DateTime?
  passwordChangedAt DateTime?
  mustChangePassword Boolean          @default(false)
  
  language          String            @default("en")  // en, es
  timezone          String            @default("America/Chicago")
  notificationPreferences Json        @default("{}")
  
  preferredLanes    Json              @default("[]")  // [{originState, destState}]
  preferredEquipment Json             @default("[]")  // [VAN, REEFER, FLATBED]
  
  invitedBy         String?
  invitationToken   String?
  invitationSentAt  DateTime?
  invitationAcceptedAt DateTime?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  deletedAt         DateTime?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  driver            Driver?           @relation(fields: [driverId], references: [id])
  sessions          CarrierPortalSession[]
  savedLoads        CarrierSavedLoad[]
  loadViews         CarrierLoadView[]
  invoices          CarrierInvoiceSubmission[]
  quickPayRequests  QuickPayRequest[]
  activityLog       CarrierPortalActivityLog[]
  
  @@unique([tenantId, email])
  @@index([tenantId, carrierId])
  @@index([tenantId, driverId])
  @@index([tenantId, status])
}

enum CarrierPortalRole {
  OWNER
  ADMIN
  DISPATCHER
  DRIVER
}
```

### CarrierPortalSession Model
```prisma
model CarrierPortalSession {
  id                String            @id @default(cuid())
  tenantId          String
  portalUserId      String
  
  sessionToken      String            @unique
  refreshToken      String?
  
  ipAddress         String?
  userAgent         String?           @db.Text
  deviceType        String?
  browser           String?
  os                String?
  
  isActive          Boolean           @default(true)
  expiresAt         DateTime
  lastActivityAt    DateTime          @default(now())
  
  terminatedAt      DateTime?
  terminationReason String?
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  portalUser        CarrierPortalUser @relation(fields: [portalUserId], references: [id])
  
  @@index([portalUserId])
  @@index([sessionToken])
}
```

### CarrierLoadView Model
```prisma
model CarrierLoadView {
  id                String            @id @default(cuid())
  tenantId          String
  carrierId         String
  portalUserId      String
  loadId            String
  
  viewedAt          DateTime          @default(now())
  viewDurationSeconds Int?
  viewSource        String?           // SEARCH, NOTIFICATION, DIRECT_LINK
  
  action            String?           // VIEWED, SAVED, BID, ACCEPTED, DECLINED
  actionAt          DateTime?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  portalUser        CarrierPortalUser @relation(fields: [portalUserId], references: [id])
  load              Load              @relation(fields: [loadId], references: [id])
  
  @@index([carrierId, loadId])
}
```

### CarrierSavedLoad Model
```prisma
model CarrierSavedLoad {
  id                String            @id @default(cuid())
  tenantId          String
  carrierId         String
  portalUserId      String
  loadId            String
  
  notes             String?           @db.Text
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  portalUser        CarrierPortalUser @relation(fields: [portalUserId], references: [id])
  load              Load              @relation(fields: [loadId], references: [id])
  
  @@unique([carrierId, loadId])
}
```

### CarrierInvoiceSubmission Model
```prisma
model CarrierInvoiceSubmission {
  id                String            @id @default(cuid())
  tenantId          String
  carrierId         String
  portalUserId      String
  
  carrierInvoiceNumber String
  
  loadIds           String[]
  
  totalAmount       Decimal           @db.Decimal(10, 2)
  lineItems         Json              // [{loadId, lineHaul, fuelSurcharge, accessorials, total}]
  
  invoiceDocumentId String?
  supportingDocuments String[]        // Array of document IDs
  
  status            InvoiceSubmissionStatus @default(SUBMITTED)
  
  reviewedBy        String?
  reviewedAt        DateTime?
  varianceAmount    Decimal?          @db.Decimal(10, 2)
  varianceReason    String?           @db.Text
  
  approvedAmount    Decimal?          @db.Decimal(10, 2)
  approvedAt        DateTime?
  approvedBy        String?
  
  settlementId      String?
  
  carrierNotes      String?           @db.Text
  internalNotes     String?           @db.Text
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  portalUser        CarrierPortalUser @relation(fields: [portalUserId], references: [id])
  settlement        Settlement?       @relation(fields: [settlementId], references: [id])
  
  @@index([tenantId, carrierId])
  @@index([tenantId, status])
}

enum InvoiceSubmissionStatus {
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  PAID
}
```

### QuickPayRequest Model
```prisma
model QuickPayRequest {
  id                String            @id @default(cuid())
  tenantId          String
  carrierId         String
  portalUserId      String
  settlementId      String
  
  originalAmount    Decimal           @db.Decimal(10, 2)
  feePercent        Decimal           @db.Decimal(4, 2)
  feeAmount         Decimal           @db.Decimal(10, 2)
  netAmount         Decimal           @db.Decimal(10, 2)
  
  status            QuickPayStatus    @default(REQUESTED)
  
  approvedBy        String?
  approvedAt        DateTime?
  rejectionReason   String?           @db.Text
  
  processedAt       DateTime?
  paymentReference  String?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  portalUser        CarrierPortalUser @relation(fields: [portalUserId], references: [id])
  settlement        Settlement        @relation(fields: [settlementId], references: [id])
  
  @@index([tenantId, carrierId])
  @@index([tenantId, status])
}

enum QuickPayStatus {
  REQUESTED
  APPROVED
  REJECTED
  PROCESSED
}
```

---

## 🛠️ API Endpoints

### Authentication (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/carrier-portal/auth/login` | Portal login |
| POST | `/api/v1/carrier-portal/auth/logout` | Logout |
| POST | `/api/v1/carrier-portal/auth/refresh` | Refresh token |
| POST | `/api/v1/carrier-portal/auth/forgot-password` | Reset request |
| POST | `/api/v1/carrier-portal/auth/reset-password` | Complete reset |
| POST | `/api/v1/carrier-portal/auth/register` | Accept invite |
| GET | `/api/v1/carrier-portal/auth/verify-email/:token` | Verify email |

### Dashboard (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/carrier-portal/dashboard` | Dashboard data |
| GET | `/api/v1/carrier-portal/dashboard/active-loads` | Active loads |
| GET | `/api/v1/carrier-portal/dashboard/payment-summary` | Payment overview |
| GET | `/api/v1/carrier-portal/dashboard/compliance` | Compliance status |
| GET | `/api/v1/carrier-portal/dashboard/alerts` | Important alerts |

### Available Loads (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/carrier-portal/loads/available` | Search loads |
| GET | `/api/v1/carrier-portal/loads/available/:id` | Load details |
| POST | `/api/v1/carrier-portal/loads/available/:id/save` | Save load |
| DELETE | `/api/v1/carrier-portal/loads/saved/:id` | Remove saved |
| GET | `/api/v1/carrier-portal/loads/saved` | List saved |
| POST | `/api/v1/carrier-portal/loads/:id/bid` | Submit bid |
| GET | `/api/v1/carrier-portal/loads/matching` | Matching loads |

### My Loads (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/carrier-portal/loads` | Booked loads |
| GET | `/api/v1/carrier-portal/loads/:id` | Load details |
| POST | `/api/v1/carrier-portal/loads/:id/accept` | Accept tender |
| POST | `/api/v1/carrier-portal/loads/:id/decline` | Decline tender |
| POST | `/api/v1/carrier-portal/loads/:id/status` | Update status |
| POST | `/api/v1/carrier-portal/loads/:id/location` | Update location |
| POST | `/api/v1/carrier-portal/loads/:id/eta` | Update ETA |
| POST | `/api/v1/carrier-portal/loads/:id/message` | Message broker |

### Documents & POD (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/carrier-portal/documents` | List documents |
| POST | `/api/v1/carrier-portal/documents` | Upload document |
| GET | `/api/v1/carrier-portal/documents/:id` | Get document |
| DELETE | `/api/v1/carrier-portal/documents/:id` | Delete document |
| POST | `/api/v1/carrier-portal/loads/:id/pod` | Upload POD |
| POST | `/api/v1/carrier-portal/loads/:id/documents` | Upload load doc |

### Invoices & Payments (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/carrier-portal/invoices` | Submit invoice |
| GET | `/api/v1/carrier-portal/invoices` | List invoices |
| GET | `/api/v1/carrier-portal/invoices/:id` | Invoice details |
| GET | `/api/v1/carrier-portal/settlements` | List settlements |
| GET | `/api/v1/carrier-portal/settlements/:id` | Settlement details |
| GET | `/api/v1/carrier-portal/settlements/:id/pdf` | Download PDF |
| POST | `/api/v1/carrier-portal/quick-pay/:settlementId` | Request quick pay |
| GET | `/api/v1/carrier-portal/payment-history` | Payment history |

### Compliance Documents (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/carrier-portal/compliance` | Compliance status |
| GET | `/api/v1/carrier-portal/compliance/documents` | Required docs |
| POST | `/api/v1/carrier-portal/compliance/documents` | Upload doc |
| GET | `/api/v1/carrier-portal/compliance/documents/:id` | Doc status |
| GET | `/api/v1/carrier-portal/compliance/expiring` | Expiring docs |

### Account Management (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/carrier-portal/profile` | Get profile |
| PUT | `/api/v1/carrier-portal/profile` | Update profile |
| GET | `/api/v1/carrier-portal/carrier` | Get carrier info |
| PUT | `/api/v1/carrier-portal/carrier` | Update carrier |
| GET | `/api/v1/carrier-portal/users` | List portal users |
| POST | `/api/v1/carrier-portal/users` | Invite user |
| PUT | `/api/v1/carrier-portal/users/:id` | Update user |
| DELETE | `/api/v1/carrier-portal/users/:id` | Deactivate user |

---

## 📝 DTO Specifications

### CarrierPortalLoginDto
```typescript
export class CarrierPortalLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  language?: string;  // en, es
}
```

### UpdateLoadStatusDto
```typescript
export class UpdateLoadStatusDto {
  @IsEnum(LoadStatus)
  status: LoadStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  currentCity?: string;

  @IsOptional()
  @IsString()
  currentState?: string;
}
```

### UpdateLocationDto
```typescript
export class UpdateLocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

### SubmitInvoiceDto
```typescript
export class SubmitInvoiceDto {
  @IsString()
  carrierInvoiceNumber: string;

  @IsArray()
  @IsString({ each: true })
  loadIds: string[];

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems: InvoiceLineItemDto[];

  @IsOptional()
  @IsString()
  invoiceDocumentId?: string;

  @IsOptional()
  @IsString()
  carrierNotes?: string;
}

export class InvoiceLineItemDto {
  @IsString()
  loadId: string;

  @IsNumber()
  lineHaul: number;

  @IsNumber()
  fuelSurcharge: number;

  @IsOptional()
  @IsNumber()
  accessorials?: number;

  @IsNumber()
  total: number;
}
```

### RequestQuickPayDto
```typescript
export class RequestQuickPayDto {
  @IsBoolean()
  acceptTerms: boolean;  // Must accept quick pay terms
}
```

### SubmitBidDto
```typescript
export class SubmitBidDto {
  @IsNumber()
  @Min(0)
  bidAmount: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  equipmentId?: string;
}
```

---

## 📋 Business Rules

### Quick Pay
```typescript
const quickPayRules = {
  feePercent: 2.0,           // Standard 2% fee
  minSettlementAmount: 100,  // Minimum $100 settlement
  eligibleStatuses: ['APPROVED'],
  paymentTimeframe: '24 hours'
};
```

### Load Matching
```typescript
const matchingCriteria = {
  preferredLanes: true,      // Match origin/dest states
  preferredEquipment: true,  // Match equipment type
  activeLoadsLimit: 10,      // Max concurrent loads
  eligibleTiers: ['PLATINUM', 'GOLD', 'SILVER', 'BRONZE']
};
```

### Invoice Submission
```typescript
const invoiceRules = {
  requirePOD: true,          // POD required before invoice
  varianceThreshold: 5,      // % variance triggers review
  maxPendingInvoices: 50
};
```

### Compliance Requirements
```typescript
const requiredDocuments = [
  { type: 'AUTHORITY', expiryWarning: 30 },
  { type: 'INSURANCE_AUTO', expiryWarning: 30 },
  { type: 'INSURANCE_CARGO', expiryWarning: 30 },
  { type: 'W9', expiryWarning: null },
  { type: 'DRIVER_LICENSE', expiryWarning: 60 }
];
```

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `carrier-portal.user.registered` | Accept invite | `{ portalUserId, carrierId }` |
| `carrier-portal.user.login` | Login | `{ portalUserId, language }` |
| `carrier-portal.load.viewed` | View load | `{ loadId, carrierId }` |
| `carrier-portal.load.saved` | Save load | `{ loadId, carrierId }` |
| `carrier-portal.load.accepted` | Accept tender | `{ loadId, carrierId }` |
| `carrier-portal.load.declined` | Decline tender | `{ loadId, carrierId }` |
| `carrier-portal.load.status_updated` | Status update | `{ loadId, status }` |
| `carrier-portal.location.updated` | Location update | `{ loadId, lat, lng }` |
| `carrier-portal.pod.uploaded` | POD upload | `{ loadId, documentId }` |
| `carrier-portal.invoice.submitted` | Submit invoice | `{ invoiceId, carrierId }` |
| `carrier-portal.quickpay.requested` | Request quick pay | `{ requestId, amount }` |
| `carrier-portal.quickpay.processed` | Quick pay done | `{ requestId, netAmount }` |
| `carrier-portal.document.uploaded` | Doc upload | `{ documentId, type }` |

---

## 🧪 Integration Test Requirements

```typescript
describe('Carrier Portal API', () => {
  describe('Authentication', () => {
    it('should login with valid credentials');
    it('should support Spanish language preference');
    it('should refresh token');
    it('should logout');
  });

  describe('Available Loads', () => {
    it('should search available loads');
    it('should filter by lane preference');
    it('should save load for later');
    it('should get matching loads');
    it('should submit bid');
  });

  describe('My Loads', () => {
    it('should list carrier booked loads');
    it('should accept tendered load');
    it('should decline tendered load');
    it('should update load status');
    it('should update location');
    it('should update ETA');
  });

  describe('Documents & POD', () => {
    it('should upload POD');
    it('should upload load documents');
    it('should list carrier documents');
    it('should track document status');
  });

  describe('Invoices & Payments', () => {
    it('should submit invoice');
    it('should list settlements');
    it('should request quick pay');
    it('should calculate quick pay fee');
    it('should view payment history');
  });

  describe('Compliance', () => {
    it('should show compliance status');
    it('should list required documents');
    it('should upload compliance docs');
    it('should alert on expiring docs');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/carrier-portal/
├── carrier-portal.module.ts
├── auth/
│   ├── carrier-portal-auth.controller.ts
│   ├── carrier-portal-auth.service.ts
│   ├── carrier-portal-jwt.strategy.ts
│   └── dto/
├── dashboard/
│   ├── carrier-dashboard.controller.ts
│   └── carrier-dashboard.service.ts
├── available-loads/
│   ├── available-loads.controller.ts
│   ├── available-loads.service.ts
│   └── dto/
├── my-loads/
│   ├── my-loads.controller.ts
│   ├── my-loads.service.ts
│   └── dto/
├── documents/
│   ├── carrier-documents.controller.ts
│   ├── carrier-documents.service.ts
│   └── dto/
├── invoices/
│   ├── carrier-invoices.controller.ts
│   ├── carrier-invoices.service.ts
│   └── dto/
├── quick-pay/
│   ├── quick-pay.controller.ts
│   ├── quick-pay.service.ts
│   └── dto/
├── compliance/
│   ├── carrier-compliance.controller.ts
│   ├── carrier-compliance.service.ts
│   └── dto/
├── users/
│   ├── carrier-portal-users.controller.ts
│   ├── carrier-portal-users.service.ts
│   └── dto/
└── guards/
    └── carrier-portal-auth.guard.ts
```

---

## ✅ Completion Checklist

- [ ] All 45 endpoints implemented
- [ ] Portal-specific JWT authentication
- [ ] Spanish language support (i18n)
- [ ] Load search and matching
- [ ] Tender accept/decline workflow
- [ ] Status and location updates
- [ ] POD upload with mobile support
- [ ] Invoice submission workflow
- [ ] Quick pay processing
- [ ] Compliance document tracking
- [ ] All integration tests passing
- [ ] Tenant isolation verified

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>19</td>
    <td>Carrier Portal</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>45/45</td>
    <td>8/8</td>
    <td>100%</td>
    <td>Auth, Loads, Documents, Invoices, Quick Pay, Compliance</td>
</tr>
```

### Add Changelog Entry
```html
<div class="log-entry">
    <div class="log-date">January XX, 2026 - Carrier Portal API Complete</div>
    <ul class="log-items">
        <li>Implemented 45 Carrier Portal API endpoints</li>
        <li>Portal-specific JWT authentication with ES/EN support</li>
        <li>Available load search with lane matching</li>
        <li>Load accept/decline and status updates</li>
        <li>POD upload with mobile camera support</li>
        <li>Invoice submission workflow</li>
        <li>Quick pay with 2% fee processing</li>
        <li>Compliance document tracking</li>
        <li>Full integration test coverage</li>
    </ul>
</div>
```

---

## 🔜 Next Step

➡️ **[07-contracts-api.md](./07-contracts-api.md)** - Implement Contracts Service API

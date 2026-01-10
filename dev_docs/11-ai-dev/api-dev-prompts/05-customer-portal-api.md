# 05 - Customer Portal API Implementation

> **Service:** Customer Portal  
> **Priority:** P1 - High  
> **Endpoints:** 40  
> **Dependencies:** Auth/Admin ✅, CRM ✅, Sales ✅, TMS Core ✅ (01), Documents ✅, Communication ✅, Accounting ✅  
> **Doc Reference:** [19-service-customer-portal.md](../../02-services/19-service-customer-portal.md)

---

## 📋 Overview

Self-service web portal enabling customers to request quotes, track shipments in real-time, access documents, view and pay invoices, and manage their account.

### Key Capabilities
- Quote request submission with instant estimates
- Real-time shipment tracking with map visualization
- Document library access (BOLs, PODs, rate confirmations)
- Invoice viewing and online payment processing
- Multi-user account management with role-based access
- Notification preferences and communication history
- White-label/branding customization per tenant

---

## ✅ Pre-Implementation Checklist

- [ ] Auth/Admin service is working (JWT verification)
- [ ] CRM service is working (Customer lookup)
- [ ] TMS Core service is working (Orders/Loads)
- [ ] Documents service is working (File access)
- [ ] Accounting service is working (Invoices)
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### PortalUser Model
```prisma
model PortalUser {
  id                String            @id @default(cuid())
  tenantId          String
  companyId         String
  
  email             String
  passwordHash      String
  firstName         String
  lastName          String
  phone             String?
  jobTitle          String?
  
  role              PortalRole        @default(USER)
  permissions       Json              @default("[]")
  isPrimaryContact  Boolean           @default(false)
  
  status            PortalUserStatus  @default(PENDING)
  emailVerified     Boolean           @default(false)
  emailVerifiedAt   DateTime?
  
  lastLoginAt       DateTime?
  loginCount        Int               @default(0)
  failedLoginCount  Int               @default(0)
  lockedUntil       DateTime?
  passwordChangedAt DateTime?
  mustChangePassword Boolean          @default(false)
  
  language          String            @default("en")
  timezone          String            @default("America/Chicago")
  notificationPreferences Json        @default("{}")
  
  invitedBy         String?
  invitationToken   String?
  invitationSentAt  DateTime?
  invitationAcceptedAt DateTime?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  deletedAt         DateTime?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  company           Company           @relation(fields: [companyId], references: [id])
  sessions          PortalSession[]
  quoteRequests     QuoteRequest[]
  activityLog       PortalActivityLog[]
  payments          PortalPayment[]
  
  @@unique([tenantId, email])
  @@index([tenantId, companyId])
  @@index([tenantId, status])
}

enum PortalRole {
  ADMIN
  USER
  VIEW_ONLY
}

enum PortalUserStatus {
  PENDING
  ACTIVE
  SUSPENDED
  DEACTIVATED
}
```

### PortalSession Model
```prisma
model PortalSession {
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
  locationCity      String?
  locationCountry   String?
  
  isActive          Boolean           @default(true)
  expiresAt         DateTime
  lastActivityAt    DateTime          @default(now())
  
  terminatedAt      DateTime?
  terminationReason String?
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  portalUser        PortalUser        @relation(fields: [portalUserId], references: [id])
  
  @@index([portalUserId])
  @@index([sessionToken])
}
```

### QuoteRequest Model
```prisma
model QuoteRequest {
  id                String            @id @default(cuid())
  tenantId          String
  companyId         String
  portalUserId      String
  
  requestNumber     String            // AUTO: QR-YYYYMM-XXXX
  
  // Origin
  originCity        String
  originState       String
  originZip         String?
  originCountry     String            @default("USA")
  
  // Destination
  destCity          String
  destState         String
  destZip           String?
  destCountry       String            @default("USA")
  
  // Dates
  pickupDate        DateTime
  deliveryDate      DateTime?
  isFlexibleDates   Boolean           @default(false)
  
  // Shipment Details
  equipmentType     String
  commodity         String?
  weightLbs         Decimal?          @db.Decimal(10, 2)
  pieces            Int?
  pallets           Int?
  dimensions        Json?
  
  // Special Requirements
  isHazmat          Boolean           @default(false)
  hazmatClass       String?
  isHighValue       Boolean           @default(false)
  declaredValue     Decimal?          @db.Decimal(12, 2)
  temperatureMin    Decimal?          @db.Decimal(5, 2)
  temperatureMax    Decimal?          @db.Decimal(5, 2)
  specialInstructions String?         @db.Text
  
  requestedAccessorials Json          @default("[]")
  
  // Status
  status            QuoteRequestStatus @default(SUBMITTED)
  
  // Linked Quote
  quoteId           String?
  quotedAt          DateTime?
  quotedBy          String?
  
  // Response
  customerResponse  String?           // ACCEPTED, DECLINED, REVISION_REQUESTED
  responseAt        DateTime?
  responseNotes     String?           @db.Text
  
  // Estimate
  estimatedRate     Decimal?          @db.Decimal(10, 2)
  estimatedMiles    Int?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  company           Company           @relation(fields: [companyId], references: [id])
  portalUser        PortalUser        @relation(fields: [portalUserId], references: [id])
  quote             Quote?            @relation(fields: [quoteId], references: [id])
  
  @@unique([tenantId, requestNumber])
  @@index([tenantId, companyId])
  @@index([tenantId, status])
}

enum QuoteRequestStatus {
  SUBMITTED
  REVIEWING
  QUOTED
  ACCEPTED
  DECLINED
  EXPIRED
}
```

### PortalPayment Model
```prisma
model PortalPayment {
  id                String            @id @default(cuid())
  tenantId          String
  companyId         String
  portalUserId      String
  
  paymentReference  String            @unique
  
  amount            Decimal           @db.Decimal(12, 2)
  currency          String            @default("USD")
  
  paymentMethod     PaymentMethod
  
  // Card Details
  cardLastFour      String?
  cardBrand         String?
  cardExpMonth      Int?
  cardExpYear       Int?
  
  // ACH Details
  bankName          String?
  accountLastFour   String?
  accountType       String?
  
  // Processor
  processor         String?
  processorTransactionId String?
  processorResponse Json?
  
  status            PaymentStatus     @default(PENDING)
  failureReason     String?           @db.Text
  
  invoicesPaid      Json              // [{invoiceId, amount}]
  
  initiatedAt       DateTime          @default(now())
  completedAt       DateTime?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  company           Company           @relation(fields: [companyId], references: [id])
  portalUser        PortalUser        @relation(fields: [portalUserId], references: [id])
  
  @@index([tenantId, companyId])
  @@index([tenantId, status])
}

enum PaymentMethod {
  CARD
  ACH
  WIRE
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
}
```

### PortalBranding Model
```prisma
model PortalBranding {
  id                String            @id @default(cuid())
  tenantId          String            @unique
  
  logoUrl           String?
  faviconUrl        String?
  
  primaryColor      String            @default("#3B82F6")
  secondaryColor    String            @default("#1E40AF")
  accentColor       String            @default("#10B981")
  
  customDomain      String?
  sslCertificateId  String?
  
  welcomeMessage    String?           @db.Text
  supportEmail      String?
  supportPhone      String?
  
  enabledFeatures   Json              @default("{}")
  customCss         String?           @db.Text
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
}
```

---

## 🛠️ API Endpoints

### Authentication (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/portal/auth/login` | Portal user login |
| POST | `/api/v1/portal/auth/logout` | Logout (invalidate session) |
| POST | `/api/v1/portal/auth/refresh` | Refresh access token |
| POST | `/api/v1/portal/auth/forgot-password` | Request password reset |
| POST | `/api/v1/portal/auth/reset-password` | Complete password reset |
| POST | `/api/v1/portal/auth/register` | Accept invitation |
| GET | `/api/v1/portal/auth/verify-email/:token` | Verify email |
| POST | `/api/v1/portal/auth/change-password` | Change password |

### Dashboard (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/portal/dashboard` | Get dashboard data |
| GET | `/api/v1/portal/dashboard/active-shipments` | Active shipments summary |
| GET | `/api/v1/portal/dashboard/recent-activity` | Recent activity feed |
| GET | `/api/v1/portal/dashboard/alerts` | Important alerts |

### Quote Requests (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/portal/quotes` | List customer's quotes |
| POST | `/api/v1/portal/quotes/request` | Submit quote request |
| GET | `/api/v1/portal/quotes/:id` | Get quote details |
| POST | `/api/v1/portal/quotes/:id/accept` | Accept quote |
| POST | `/api/v1/portal/quotes/:id/decline` | Decline quote |
| POST | `/api/v1/portal/quotes/:id/revision` | Request revision |
| GET | `/api/v1/portal/quotes/:id/pdf` | Download quote PDF |
| POST | `/api/v1/portal/quotes/estimate` | Get instant estimate |

### Shipments (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/portal/shipments` | List customer's shipments |
| GET | `/api/v1/portal/shipments/:id` | Get shipment details |
| GET | `/api/v1/portal/shipments/:id/tracking` | Real-time tracking |
| GET | `/api/v1/portal/shipments/:id/events` | Shipment event history |
| GET | `/api/v1/portal/shipments/:id/documents` | Shipment documents |
| POST | `/api/v1/portal/shipments/:id/contact` | Message broker |

### Invoices & Payments (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/portal/invoices` | List invoices |
| GET | `/api/v1/portal/invoices/:id` | Get invoice details |
| GET | `/api/v1/portal/invoices/:id/pdf` | Download PDF |
| GET | `/api/v1/portal/invoices/aging` | Aging summary |
| POST | `/api/v1/portal/payments` | Make payment |
| GET | `/api/v1/portal/payments` | Payment history |
| GET | `/api/v1/portal/payments/:id` | Payment details |
| GET | `/api/v1/portal/statements/:month` | Monthly statement |

### Account Management (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/portal/profile` | Get current profile |
| PUT | `/api/v1/portal/profile` | Update profile |
| GET | `/api/v1/portal/users` | List company portal users |
| POST | `/api/v1/portal/users` | Invite new user |
| PUT | `/api/v1/portal/users/:id` | Update user |
| DELETE | `/api/v1/portal/users/:id` | Deactivate user |

---

## 📝 DTO Specifications

### PortalLoginDto
```typescript
export class PortalLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

### SubmitQuoteRequestDto
```typescript
export class SubmitQuoteRequestDto {
  @IsString()
  originCity: string;

  @IsString()
  originState: string;

  @IsOptional()
  @IsString()
  originZip?: string;

  @IsString()
  destCity: string;

  @IsString()
  destState: string;

  @IsOptional()
  @IsString()
  destZip?: string;

  @IsDateString()
  pickupDate: string;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @IsBoolean()
  @IsOptional()
  isFlexibleDates?: boolean;

  @IsString()
  equipmentType: string;

  @IsOptional()
  @IsString()
  commodity?: string;

  @IsOptional()
  @IsNumber()
  weightLbs?: number;

  @IsOptional()
  @IsInt()
  pieces?: number;

  @IsOptional()
  @IsInt()
  pallets?: number;

  @IsOptional()
  @IsBoolean()
  isHazmat?: boolean;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsArray()
  requestedAccessorials?: string[];
}
```

### MakePaymentDto
```typescript
export class MakePaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoicePaymentDto)
  invoices: InvoicePaymentDto[];

  @IsOptional()
  @IsString()
  savedPaymentMethodId?: string;

  // For new card payments
  @IsOptional()
  @IsString()
  paymentToken?: string;

  @IsOptional()
  @IsBoolean()
  savePaymentMethod?: boolean;
}

export class InvoicePaymentDto {
  @IsString()
  invoiceId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}
```

### InvitePortalUserDto
```typescript
export class InvitePortalUserDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(PortalRole)
  role: PortalRole;

  @IsOptional()
  @IsArray()
  permissions?: string[];
}
```

---

## 📋 Business Rules

### Portal Authentication
- Separate JWT tokens from main app (portal-specific)
- Session timeout: 2 hours inactive
- Max concurrent sessions: 3 per user
- Failed login lockout: 5 attempts = 15 min lock

### Quote Requests
- Auto-generate request number: QR-YYYYMM-XXXX
- Instant estimate based on lane history
- Quote expires in 7 days
- Revision requests limited to 2 per quote

### Payment Processing
- Support Stripe and Authorize.net
- Partial payments allowed
- Minimum payment: $1.00
- Save payment methods with PCI-compliant tokenization

### Multi-User Access
- Company admin can manage portal users
- Primary contact always has ADMIN role
- Maximum 10 portal users per company (configurable)

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `portal.user.registered` | User accepts invite | `{ portalUserId, companyId }` |
| `portal.user.login` | Successful login | `{ portalUserId, ipAddress }` |
| `portal.quote.requested` | Submit quote request | `{ requestId, companyId }` |
| `portal.quote.accepted` | Accept quote | `{ requestId, quoteId }` |
| `portal.payment.initiated` | Start payment | `{ paymentId, amount }` |
| `portal.payment.completed` | Payment success | `{ paymentId, invoiceIds }` |
| `portal.payment.failed` | Payment failure | `{ paymentId, reason }` |

---

## 🧪 Integration Test Requirements

```typescript
describe('Customer Portal API', () => {
  describe('Authentication', () => {
    it('should login with valid credentials');
    it('should fail login after 5 attempts');
    it('should refresh token');
    it('should logout and invalidate session');
    it('should reset password');
  });

  describe('Quote Requests', () => {
    it('should submit quote request');
    it('should get instant estimate');
    it('should accept quote');
    it('should decline quote');
    it('should request revision');
  });

  describe('Shipment Tracking', () => {
    it('should list customer shipments only');
    it('should get real-time tracking');
    it('should get shipment events');
    it('should access shipment documents');
  });

  describe('Payments', () => {
    it('should list customer invoices');
    it('should make card payment');
    it('should make ACH payment');
    it('should record partial payment');
    it('should save payment method');
  });

  describe('Account Management', () => {
    it('should update profile');
    it('should invite new user');
    it('should update user permissions');
    it('should deactivate user');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/customer-portal/
├── customer-portal.module.ts
├── auth/
│   ├── portal-auth.controller.ts
│   ├── portal-auth.service.ts
│   ├── portal-jwt.strategy.ts
│   └── dto/
├── dashboard/
│   ├── portal-dashboard.controller.ts
│   └── portal-dashboard.service.ts
├── quotes/
│   ├── portal-quotes.controller.ts
│   ├── portal-quotes.service.ts
│   └── dto/
├── shipments/
│   ├── portal-shipments.controller.ts
│   └── portal-shipments.service.ts
├── invoices/
│   ├── portal-invoices.controller.ts
│   └── portal-invoices.service.ts
├── payments/
│   ├── portal-payments.controller.ts
│   ├── portal-payments.service.ts
│   └── dto/
├── users/
│   ├── portal-users.controller.ts
│   ├── portal-users.service.ts
│   └── dto/
└── guards/
    └── portal-auth.guard.ts
```

---

## ✅ Completion Checklist

- [ ] All 40 endpoints implemented
- [ ] Portal-specific JWT authentication
- [ ] Quote request workflow complete
- [ ] Shipment tracking with real-time data
- [ ] Payment processing with Stripe/Authorize.net
- [ ] Multi-user management
- [ ] Activity logging
- [ ] Tenant isolation verified
- [ ] All integration tests passing

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>18</td>
    <td>Customer Portal</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>40/40</td>
    <td>6/6</td>
    <td>100%</td>
    <td>Auth, Quotes, Shipments, Invoices, Payments, Users</td>
</tr>
```

### Add Changelog Entry
```html
<div class="log-entry">
    <div class="log-date">January XX, 2026 - Customer Portal API Complete</div>
    <ul class="log-items">
        <li>Implemented 40 Customer Portal API endpoints</li>
        <li>Portal-specific JWT authentication</li>
        <li>Quote request submission with instant estimates</li>
        <li>Real-time shipment tracking</li>
        <li>Invoice viewing and payment processing</li>
        <li>Multi-user account management</li>
        <li>Full integration test coverage</li>
    </ul>
</div>
```

---

## 🔜 Next Step

➡️ **[06-carrier-portal-api.md](./06-carrier-portal-api.md)** - Implement Carrier Portal API

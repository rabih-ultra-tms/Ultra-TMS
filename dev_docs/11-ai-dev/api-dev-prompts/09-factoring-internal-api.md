# 09 - Factoring Internal Service API Implementation

> **Service:** Factoring & NOA Management  
> **Priority:** P2 - Medium  
> **Endpoints:** 30  
> **Dependencies:** Carrier ✅ (02), Accounting ✅, TMS Core ✅ (01)  
> **Doc Reference:** [23-service-factoring-internal.md](../../02-services/23-service-factoring-internal.md)

---

## 📋 Overview

Manage freight factoring relationships, NOA (Notice of Assignment) processing, and carrier payment routing. Ensures proper payment routing to factoring companies when carriers have assigned their receivables.

### Key Capabilities
- Factoring company database with payment instructions
- NOA receipt, verification, and lifecycle management
- Quick pay program for accelerated carrier payment
- Automatic payment routing to factoring companies
- Load verification request/response workflow

---

## ✅ Pre-Implementation Checklist

- [ ] Carrier service is working (Carrier lookup)
- [ ] Accounting service is working (Settlements, Payments)
- [ ] TMS Core service is working (Load data)
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### FactoringCompany Model
```prisma
model FactoringCompany {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  code              String?           @unique
  dbaName           String?
  
  addressLine1      String?
  addressLine2      String?
  city              String?
  state             String?
  postalCode        String?
  country           String            @default("USA")
  
  primaryContactName String?
  phone             String?
  fax               String?
  email             String?
  
  verificationEmail String?
  verificationPhone String?
  
  paymentMethod     PaymentMethodType @default(ACH)
  paymentInstructions String?         @db.Text
  
  achRouting        String?
  achAccount        String?
  achAccountType    String?
  
  wireRouting       String?
  wireAccount       String?
  wireBankName      String?
  wireBankAddress   String?           @db.Text
  
  checkPayee        String?
  checkAddress      String?           @db.Text
  
  apiEnabled        Boolean           @default(false)
  apiEndpoint       String?
  apiKeyEncrypted   String?
  apiFormat         String?
  
  isActive          Boolean           @default(true)
  
  notes             String?           @db.Text
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  noaRecords        NoaRecord[]
  carrierStatuses   CarrierFactoringStatus[]
  verifications     FactoringVerification[]
  payments          FactoredPayment[]
  
  @@index([tenantId])
  @@index([code])
}
```

### NoaRecord Model
```prisma
model NoaRecord {
  id                String            @id @default(cuid())
  tenantId          String
  carrierId         String
  factoringCompanyId String
  
  noaNumber         String?
  
  receivedDate      DateTime
  effectiveDate     DateTime
  expirationDate    DateTime?
  
  status            NoaStatus         @default(PENDING)
  
  documentId        String?
  
  verifiedBy        String?
  verifiedAt        DateTime?
  verificationMethod String?
  verificationNotes String?           @db.Text
  
  releasedAt        DateTime?
  releasedBy        String?
  releaseReason     String?
  releaseDocumentId String?
  
  notes             String?           @db.Text
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  factoringCompany  FactoringCompany  @relation(fields: [factoringCompanyId], references: [id])
  document          Document?         @relation(fields: [documentId], references: [id])
  releaseDocument   Document?         @relation("NoaReleaseDocument", fields: [releaseDocumentId], references: [id])
  carrierStatuses   CarrierFactoringStatus[]
  
  @@index([tenantId, carrierId])
  @@index([tenantId, status])
}

enum NoaStatus {
  PENDING
  VERIFIED
  ACTIVE
  EXPIRED
  RELEASED
}
```

### CarrierFactoringStatus Model
```prisma
model CarrierFactoringStatus {
  id                String            @id @default(cuid())
  tenantId          String
  carrierId         String            @unique
  
  factoringStatus   FactoringStatusType @default(NONE)
  
  currentFactoringCompanyId String?
  currentNoaId      String?
  
  quickPayEnrolled  Boolean           @default(false)
  quickPayEnrolledAt DateTime?
  quickPayRate      Decimal           @default(0.03) @db.Decimal(5, 4)
  
  paymentPreference PaymentPreference @default(STANDARD)
  
  overrideActive    Boolean           @default(false)
  overrideFactoringCompanyId String?
  overrideReason    String?           @db.Text
  overrideUntil     DateTime?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  factoringCompany  FactoringCompany? @relation(fields: [currentFactoringCompanyId], references: [id])
  currentNoa        NoaRecord?        @relation(fields: [currentNoaId], references: [id])
  
  @@index([tenantId, factoringStatus])
}

enum FactoringStatusType {
  NONE
  FACTORED
  QUICK_PAY_ONLY
}

enum PaymentPreference {
  STANDARD
  QUICK_PAY
  FACTORING
}
```

### FactoringVerification Model
```prisma
model FactoringVerification {
  id                String            @id @default(cuid())
  tenantId          String
  factoringCompanyId String
  carrierId         String
  loadId            String
  
  requestReference  String?
  requestMethod     String?           // EMAIL, FAX, API, PHONE
  requestedAt       DateTime
  requestedBy       String?
  
  invoiceAmount     Decimal?          @db.Decimal(12, 2)
  pickupDate        DateTime?
  deliveryDate      DateTime?
  
  verificationStatus VerificationStatus @default(PENDING)
  verifiedAmount    Decimal?          @db.Decimal(12, 2)
  discrepancyReason String?           @db.Text
  
  respondedAt       DateTime?
  respondedBy       String?
  responseMethod    String?
  responseNotes     String?           @db.Text
  
  slaDeadline       DateTime?
  slaMet            Boolean?
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  factoringCompany  FactoringCompany  @relation(fields: [factoringCompanyId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  load              Load              @relation(fields: [loadId], references: [id])
  
  @@index([tenantId, factoringCompanyId])
  @@index([tenantId, loadId])
  @@index([verificationStatus])
}

enum VerificationStatus {
  PENDING
  VERIFIED
  PARTIAL
  DECLINED
}
```

### FactoredPayment Model
```prisma
model FactoredPayment {
  id                String            @id @default(cuid())
  tenantId          String
  carrierId         String
  loadId            String
  settlementId      String?
  factoringCompanyId String
  noaId             String?
  
  originalAmount    Decimal           @db.Decimal(12, 2)
  paymentAmount     Decimal           @db.Decimal(12, 2)
  
  status            FactoredPaymentStatus @default(PENDING)
  
  scheduledDate     DateTime?
  paidAt            DateTime?
  paymentReference  String?
  paymentMethod     String?
  
  notes             String?           @db.Text
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  load              Load              @relation(fields: [loadId], references: [id])
  settlement        Settlement?       @relation(fields: [settlementId], references: [id])
  factoringCompany  FactoringCompany  @relation(fields: [factoringCompanyId], references: [id])
  noa               NoaRecord?        @relation(fields: [noaId], references: [id])
  
  @@index([tenantId, carrierId])
  @@index([tenantId, status])
}

enum FactoredPaymentStatus {
  PENDING
  SCHEDULED
  PROCESSING
  PAID
  FAILED
}
```

---

## 🛠️ API Endpoints

### Factoring Companies (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/factoring-companies` | List factoring companies |
| POST | `/api/v1/factoring-companies` | Create factoring company |
| GET | `/api/v1/factoring-companies/:id` | Get company details |
| PUT | `/api/v1/factoring-companies/:id` | Update company |
| DELETE | `/api/v1/factoring-companies/:id` | Delete company |
| PATCH | `/api/v1/factoring-companies/:id/status` | Toggle active |

### NOA Records (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/noa-records` | List all NOAs |
| POST | `/api/v1/noa-records` | Create NOA record |
| GET | `/api/v1/noa-records/:id` | Get NOA details |
| PUT | `/api/v1/noa-records/:id` | Update NOA |
| DELETE | `/api/v1/noa-records/:id` | Delete NOA |
| POST | `/api/v1/noa-records/:id/verify` | Verify NOA |
| POST | `/api/v1/noa-records/:id/release` | Release NOA |
| GET | `/api/v1/carriers/:carrierId/noa` | Get carrier NOA |

### Carrier Factoring Status (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/carriers/:carrierId/factoring-status` | Get factoring status |
| PUT | `/api/v1/carriers/:carrierId/factoring-status` | Update status |
| POST | `/api/v1/carriers/:carrierId/quick-pay/enroll` | Enroll quick pay |
| POST | `/api/v1/carriers/:carrierId/quick-pay/unenroll` | Unenroll quick pay |
| POST | `/api/v1/carriers/:carrierId/factoring/override` | Set override |

### Verifications (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/factoring-verifications` | List verifications |
| POST | `/api/v1/factoring-verifications` | Create verification request |
| GET | `/api/v1/factoring-verifications/:id` | Get verification |
| POST | `/api/v1/factoring-verifications/:id/respond` | Respond to verification |
| GET | `/api/v1/loads/:loadId/verification` | Get load verification |
| GET | `/api/v1/factoring-verifications/pending` | List pending verifications |

### Factored Payments (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/factored-payments` | List factored payments |
| GET | `/api/v1/factored-payments/:id` | Get payment details |
| POST | `/api/v1/factored-payments/:id/process` | Process payment |
| GET | `/api/v1/carriers/:carrierId/factored-payments` | Carrier payments |
| GET | `/api/v1/factoring-companies/:id/payments` | Company payments |

---

## 📝 DTO Specifications

### CreateFactoringCompanyDto
```typescript
export class CreateFactoringCompanyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  verificationEmail?: string;

  @IsEnum(PaymentMethodType)
  @IsOptional()
  paymentMethod?: PaymentMethodType;

  @IsOptional()
  @IsString()
  achRouting?: string;

  @IsOptional()
  @IsString()
  achAccount?: string;
}
```

### CreateNoaRecordDto
```typescript
export class CreateNoaRecordDto {
  @IsString()
  carrierId: string;

  @IsString()
  factoringCompanyId: string;

  @IsOptional()
  @IsString()
  noaNumber?: string;

  @IsDateString()
  receivedDate: string;

  @IsDateString()
  effectiveDate: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  documentId?: string;
}
```

### VerifyNoaDto
```typescript
export class VerifyNoaDto {
  @IsString()
  verificationMethod: string;

  @IsOptional()
  @IsString()
  verificationNotes?: string;
}
```

### EnrollQuickPayDto
```typescript
export class EnrollQuickPayDto {
  @IsNumber()
  @Min(0)
  @Max(0.10)
  quickPayRate: number;
}
```

### RespondToVerificationDto
```typescript
export class RespondToVerificationDto {
  @IsEnum(VerificationStatus)
  status: VerificationStatus;

  @IsOptional()
  @IsNumber()
  verifiedAmount?: number;

  @IsOptional()
  @IsString()
  discrepancyReason?: string;

  @IsOptional()
  @IsString()
  responseNotes?: string;
}
```

---

## 📋 Business Rules

### NOA Verification
- NOA must be verified before payments routed to factoring
- Verification methods: PHONE, EMAIL, FAX, API
- NOA expiration auto-changes status to EXPIRED

### Payment Routing
```typescript
const getPaymentDestination = (carrier) => {
  if (carrier.factoringStatus.overrideActive) {
    return carrier.factoringStatus.overrideFactoringCompanyId;
  }
  if (carrier.factoringStatus.factoringStatus === 'FACTORED') {
    return carrier.factoringStatus.currentFactoringCompanyId;
  }
  return carrier.paymentInfo; // Direct to carrier
};
```

### Quick Pay Rules
```typescript
const quickPayRules = {
  defaultRate: 0.03,       // 3% fee
  minRate: 0.01,           // 1% minimum
  maxRate: 0.10,           // 10% maximum
  autoApproveThreshold: 5000,  // Auto-approve under $5K
  paymentTimeframe: '24h'
};
```

### Verification SLA
- Respond within 2 business hours
- Track SLA compliance metrics

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `factoring.company.created` | Create company | `{ companyId }` |
| `noa.received` | Create NOA | `{ noaId, carrierId }` |
| `noa.verified` | Verify NOA | `{ noaId, carrierId }` |
| `noa.released` | Release NOA | `{ noaId, carrierId }` |
| `noa.expired` | NOA expiry | `{ noaId, carrierId }` |
| `carrier.factoring.updated` | Status change | `{ carrierId, status }` |
| `carrier.quickpay.enrolled` | Enroll | `{ carrierId, rate }` |
| `verification.requested` | Request verification | `{ verificationId, loadId }` |
| `verification.responded` | Respond | `{ verificationId, status }` |
| `factored.payment.processed` | Payment processed | `{ paymentId, amount }` |

---

## 🧪 Integration Test Requirements

```typescript
describe('Factoring Service API', () => {
  describe('Factoring Companies', () => {
    it('should create factoring company');
    it('should update payment instructions');
    it('should toggle active status');
  });

  describe('NOA Records', () => {
    it('should create NOA record');
    it('should verify NOA');
    it('should release NOA');
    it('should expire NOA automatically');
  });

  describe('Carrier Factoring Status', () => {
    it('should get carrier factoring status');
    it('should update factoring status');
    it('should enroll in quick pay');
    it('should set payment override');
  });

  describe('Verifications', () => {
    it('should create verification request');
    it('should respond to verification');
    it('should track SLA compliance');
  });

  describe('Payment Routing', () => {
    it('should route to factoring company');
    it('should route to carrier when no NOA');
    it('should respect override');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/factoring/
├── factoring.module.ts
├── companies/
│   ├── factoring-companies.controller.ts
│   ├── factoring-companies.service.ts
│   └── dto/
├── noa/
│   ├── noa-records.controller.ts
│   ├── noa-records.service.ts
│   └── dto/
├── carrier-status/
│   ├── carrier-factoring-status.controller.ts
│   ├── carrier-factoring-status.service.ts
│   └── dto/
├── verifications/
│   ├── factoring-verifications.controller.ts
│   ├── factoring-verifications.service.ts
│   └── dto/
├── payments/
│   ├── factored-payments.controller.ts
│   ├── factored-payments.service.ts
│   └── dto/
└── routing/
    └── payment-routing.service.ts
```

---

## ✅ Completion Checklist

- [ ] All 30 endpoints implemented
- [ ] Factoring company management
- [ ] NOA lifecycle (receive → verify → release)
- [ ] Carrier factoring status tracking
- [ ] Quick pay enrollment
- [ ] Verification workflow
- [ ] Payment routing logic
- [ ] All integration tests passing
- [ ] Tenant isolation verified

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>22</td>
    <td>Factoring Internal</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>30/30</td>
    <td>5/5</td>
    <td>100%</td>
    <td>Companies, NOA, Status, Verifications, Payments</td>
</tr>
```

### Add Changelog Entry
```html
<div class="log-entry">
    <div class="log-date">January XX, 2026 - Factoring Internal API Complete</div>
    <ul class="log-items">
        <li>Implemented 30 Factoring API endpoints</li>
        <li>Factoring company database with payment instructions</li>
        <li>NOA lifecycle management</li>
        <li>Carrier factoring status tracking</li>
        <li>Quick pay enrollment</li>
        <li>Load verification workflow</li>
        <li>Payment routing logic</li>
        <li>Full integration test coverage</li>
    </ul>
</div>
```

---

## 🔜 Next Step

➡️ **[10-edi-api.md](./10-edi-api.md)** - Implement EDI Service API

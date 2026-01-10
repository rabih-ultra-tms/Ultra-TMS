# 04 - Claims Service API Implementation

> **Service:** Claims & OS&D Management  
> **Priority:** P1 - High  
> **Endpoints:** 45  
> **Dependencies:** TMS Core ✅ (01), Carrier ✅ (02), Accounting ✅, Documents ✅, Communication ✅  
> **Doc Reference:** [16-service-claims.md](../../02-services/16-service-claims.md)

---

## 📋 Overview

The Claims Service manages cargo claims, freight claims, overages, shortages, and damages (OS&D). It provides a complete workflow from claim intake through investigation, valuation, and resolution, including carrier accountability tracking and subrogation management.

### Key Capabilities
- Claim filing (damage, shortage, overage, loss, delay)
- Investigation assignment and workflow
- Valuation with depreciation and salvage
- Resolution workflow (approve, deny, settle, withdraw)
- Carrier chargebacks
- Subrogation for third-party recovery
- Carrier claims ratio tracking

---

## ✅ Pre-Implementation Checklist

- [ ] TMS Core service is working (Order/Load reference)
- [ ] Carrier service is working (Carrier lookup)
- [ ] Documents service is working (File uploads)
- [ ] Communication service is working (Notifications)
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### Claim Model
```prisma
model Claim {
  id                String            @id @default(cuid())
  tenantId          String
  
  claimNumber       String            // AUTO: CLM-YYYYMM-XXXX
  externalId        String?
  
  // Relations
  orderId           String?
  loadId            String?
  customerId        String
  carrierId         String?
  
  // Type & Status
  claimType         ClaimType
  status            ClaimStatus       @default(DRAFT)
  
  // Filing
  filedBy           ClaimFiledBy?
  filedByUserId     String?
  filedAt           DateTime?
  
  // Values
  amountClaimed     Decimal           @default(0) @db.Decimal(12, 2)
  amountApproved    Decimal?          @db.Decimal(12, 2)
  amountDenied      Decimal?          @db.Decimal(12, 2)
  amountSettled     Decimal?          @db.Decimal(12, 2)
  amountPaid        Decimal?          @db.Decimal(12, 2)
  
  // Liability
  liabilityType     LiabilityType?
  releasedValueRate Decimal?          @db.Decimal(6, 4)
  declaredValue     Decimal?          @db.Decimal(12, 2)
  maxLiability      Decimal?          @db.Decimal(12, 2)
  
  // Details
  description       String?           @db.Text
  incidentDate      DateTime?
  incidentLocation  String?
  
  // Investigation
  assignedTo        String?
  assignedAt        DateTime?
  investigationDueAt DateTime?
  investigationCompletedAt DateTime?
  rootCause         String?
  rootCauseNotes    String?           @db.Text
  
  // Resolution
  resolutionType    ResolutionType?
  resolutionReason  String?           @db.Text
  resolvedBy        String?
  resolvedAt        DateTime?
  
  // Payment
  paymentMethod     String?
  paymentReference  String?
  paidAt            DateTime?
  
  // Carrier Notification
  carrierNotifiedAt DateTime?
  carrierResponseDueAt DateTime?
  carrierResponse   String?           @db.Text
  carrierResponseAt DateTime?
  
  // Escalation
  escalated         Boolean           @default(false)
  escalatedTo       String?
  escalatedAt       DateTime?
  escalationReason  String?
  
  // Chargeback
  chargebackCreated Boolean           @default(false)
  chargebackId      String?
  chargebackAmount  Decimal?          @db.Decimal(12, 2)
  
  // SLA
  slaDueAt          DateTime?
  slaBreached       Boolean           @default(false)
  
  // Audit
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  createdById       String
  updatedById       String
  
  // Relations
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  order             Order?            @relation(fields: [orderId], references: [id])
  load              Load?             @relation(fields: [loadId], references: [id])
  customer          Company           @relation(fields: [customerId], references: [id])
  carrier           Carrier?          @relation(fields: [carrierId], references: [id])
  
  items             ClaimItem[]
  documents         ClaimDocument[]
  notes             ClaimNote[]
  timeline          ClaimTimeline[]
  subrogation       ClaimSubrogation[]
  
  @@unique([tenantId, claimNumber])
  @@index([tenantId, status])
  @@index([tenantId, customerId])
  @@index([tenantId, carrierId])
}

enum ClaimType {
  CARGO_DAMAGE
  SHORTAGE
  OVERAGE
  TOTAL_LOSS
  CONCEALED_DAMAGE
  DELAY
  CONTAMINATION
  TEMPERATURE
  OTHER
}

enum ClaimStatus {
  DRAFT
  FILED
  ACKNOWLEDGED
  INVESTIGATING
  PENDING_DOCUMENTS
  UNDER_REVIEW
  APPROVED
  DENIED
  SETTLED
  PAID
  CLOSED
  WITHDRAWN
}

enum ClaimFiledBy {
  CUSTOMER
  CARRIER
  INTERNAL
}

enum LiabilityType {
  FULL_VALUE
  RELEASED_VALUE
  DECLARED_VALUE
}

enum ResolutionType {
  APPROVED_FULL
  APPROVED_PARTIAL
  DENIED
  SETTLED
  WITHDRAWN
}
```

### ClaimItem Model
```prisma
model ClaimItem {
  id                String            @id @default(cuid())
  claimId           String
  
  itemNumber        Int
  description       String
  commodity         String?
  
  quantityClaimed   Decimal           @db.Decimal(10, 2)
  quantityApproved  Decimal?          @db.Decimal(10, 2)
  unitOfMeasure     String            @default("EACH")
  weightLbs         Decimal?          @db.Decimal(10, 2)
  
  unitValue         Decimal           @db.Decimal(10, 2)
  totalValueClaimed Decimal           @db.Decimal(12, 2)
  totalValueApproved Decimal?         @db.Decimal(12, 2)
  
  damageType        DamageType?
  damageDescription String?           @db.Text
  damageSeverity    DamageSeverity?
  
  ageMonths         Int?
  depreciationPercent Decimal?        @db.Decimal(5, 2)
  depreciatedValue  Decimal?          @db.Decimal(12, 2)
  
  salvageValue      Decimal?          @db.Decimal(10, 2)
  salvageNotes      String?
  
  itemStatus        ClaimItemStatus   @default(PENDING)
  resolutionNotes   String?           @db.Text
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  claim             Claim             @relation(fields: [claimId], references: [id], onDelete: Cascade)
  
  @@unique([claimId, itemNumber])
}

enum DamageType {
  PHYSICAL_DAMAGE
  WATER_DAMAGE
  TEMPERATURE_DAMAGE
  CONTAMINATION
  MISSING
  SHORTAGE
  CONCEALED
  OTHER
}

enum DamageSeverity {
  MINOR
  MODERATE
  SEVERE
  TOTAL
}

enum ClaimItemStatus {
  PENDING
  APPROVED
  PARTIALLY_APPROVED
  DENIED
}
```

### ClaimDocument Model
```prisma
model ClaimDocument {
  id                String            @id @default(cuid())
  claimId           String
  
  documentType      ClaimDocumentType
  documentId        String?           // Link to Documents service
  fileName          String
  filePath          String
  fileSize          Int?
  mimeType          String?
  
  description       String?
  uploadedBy        String
  uploadedAt        DateTime          @default(now())
  
  ocrProcessed      Boolean           @default(false)
  ocrText           String?           @db.Text
  
  claim             Claim             @relation(fields: [claimId], references: [id], onDelete: Cascade)
  
  @@index([claimId])
}

enum ClaimDocumentType {
  PHOTO
  BOL
  POD
  INVOICE
  PACKING_LIST
  INSPECTION_REPORT
  CARRIER_RESPONSE
  SETTLEMENT_AGREEMENT
  DENIAL_LETTER
  CORRESPONDENCE
  OTHER
}
```

### ClaimNote Model
```prisma
model ClaimNote {
  id                String            @id @default(cuid())
  claimId           String
  
  noteType          ClaimNoteType
  subject           String?
  content           String            @db.Text
  
  direction         String?           // INBOUND, OUTBOUND
  channel           String?           // EMAIL, PHONE, PORTAL, SYSTEM
  contactName       String?
  contactEmail      String?
  contactPhone      String?
  
  isVisibleToCustomer Boolean         @default(false)
  isVisibleToCarrier Boolean          @default(false)
  
  createdBy         String
  createdAt         DateTime          @default(now())
  
  claim             Claim             @relation(fields: [claimId], references: [id], onDelete: Cascade)
  
  @@index([claimId])
}

enum ClaimNoteType {
  INTERNAL
  CUSTOMER_COMMUNICATION
  CARRIER_COMMUNICATION
  INVESTIGATION
  RESOLUTION
  SYSTEM
}
```

### ClaimTimeline Model
```prisma
model ClaimTimeline {
  id                String            @id @default(cuid())
  claimId           String
  
  eventType         String
  eventDescription  String
  
  previousStatus    String?
  newStatus         String?
  
  previousValue     Json?
  newValue          Json?
  
  performedBy       String?
  performedAt       DateTime          @default(now())
  
  claim             Claim             @relation(fields: [claimId], references: [id], onDelete: Cascade)
  
  @@index([claimId])
}
```

### ClaimChargeback Model
```prisma
model ClaimChargeback {
  id                String            @id @default(cuid())
  tenantId          String
  
  chargebackNumber  String            // AUTO: CB-YYYYMM-XXXX
  claimId           String
  carrierId         String
  settlementId      String?
  
  amount            Decimal           @db.Decimal(12, 2)
  description       String?           @db.Text
  
  status            ChargebackStatus  @default(PENDING)
  
  appliedToSettlementId String?
  appliedAt         DateTime?
  appliedBy         String?
  
  disputedAt        DateTime?
  disputeReason     String?           @db.Text
  disputeResolvedAt DateTime?
  disputeResolution String?
  
  createdAt         DateTime          @default(now())
  createdById       String
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  claim             Claim             @relation(fields: [claimId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  
  @@unique([tenantId, chargebackNumber])
  @@index([tenantId, carrierId])
  @@index([tenantId, status])
}

enum ChargebackStatus {
  PENDING
  APPLIED
  DISPUTED
  REVERSED
  WRITTEN_OFF
}
```

### ClaimSubrogation Model
```prisma
model ClaimSubrogation {
  id                String            @id @default(cuid())
  claimId           String
  
  targetCarrierId   String?
  targetName        String?
  targetType        SubrogationTargetType
  
  amountSought      Decimal           @db.Decimal(12, 2)
  amountRecovered   Decimal           @default(0) @db.Decimal(12, 2)
  
  status            SubrogationStatus @default(IDENTIFIED)
  
  demandSentAt      DateTime?
  demandDueAt       DateTime?
  lastContactAt     DateTime?
  recoveryDate      DateTime?
  
  notes             String?           @db.Text
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  claim             Claim             @relation(fields: [claimId], references: [id])
  
  @@index([claimId])
}

enum SubrogationTargetType {
  CARRIER
  VENDOR
  WAREHOUSE
  SHIPPER
  OTHER
}

enum SubrogationStatus {
  IDENTIFIED
  DEMAND_SENT
  NEGOTIATING
  RECOVERED
  PARTIAL_RECOVERY
  UNRECOVERABLE
  WRITTEN_OFF
}
```

---

## 🛠️ API Endpoints

### Claims Management (10 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/claims` | List claims with filtering |
| POST | `/api/v1/claims` | Create new claim |
| GET | `/api/v1/claims/:id` | Get claim details |
| PUT | `/api/v1/claims/:id` | Update claim |
| DELETE | `/api/v1/claims/:id` | Delete draft claim only |
| POST | `/api/v1/claims/:id/file` | File/submit claim |
| POST | `/api/v1/claims/:id/acknowledge` | Acknowledge receipt |
| POST | `/api/v1/claims/:id/assign` | Assign investigator |
| PUT | `/api/v1/claims/:id/status` | Update status |
| POST | `/api/v1/claims/:id/escalate` | Escalate claim |

### Claim Items (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/claims/:id/items` | List claim items |
| POST | `/api/v1/claims/:id/items` | Add item to claim |
| PUT | `/api/v1/claims/:id/items/:itemId` | Update claim item |
| DELETE | `/api/v1/claims/:id/items/:itemId` | Remove claim item |

### Claim Documents (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/claims/:id/documents` | List claim documents |
| POST | `/api/v1/claims/:id/documents` | Upload document |
| DELETE | `/api/v1/claims/:id/documents/:docId` | Remove document |
| GET | `/api/v1/claims/:id/documents/:docId/download` | Download document |

### Claim Notes (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/claims/:id/notes` | List notes |
| POST | `/api/v1/claims/:id/notes` | Add note |
| PUT | `/api/v1/claims/:id/notes/:noteId` | Update note |
| DELETE | `/api/v1/claims/:id/notes/:noteId` | Delete note |

### Resolution (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/claims/:id/approve` | Approve claim |
| POST | `/api/v1/claims/:id/deny` | Deny claim |
| POST | `/api/v1/claims/:id/settle` | Settle claim |
| POST | `/api/v1/claims/:id/withdraw` | Withdraw claim |
| POST | `/api/v1/claims/:id/pay` | Process payment |
| POST | `/api/v1/claims/:id/chargeback` | Create carrier chargeback |

### Carrier Notifications (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/claims/:id/notify-carrier` | Send carrier notification |
| POST | `/api/v1/claims/:id/carrier-response` | Record carrier response |
| GET | `/api/v1/claims/:id/timeline` | Get claim timeline |

### Subrogation (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/claims/:id/subrogation` | Get subrogation details |
| POST | `/api/v1/claims/:id/subrogation` | Create subrogation entry |
| PUT | `/api/v1/claims/:id/subrogation/:subId` | Update subrogation |
| POST | `/api/v1/claims/:id/subrogation/:subId/demand` | Send demand letter |

### Chargebacks (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/chargebacks` | List all chargebacks |
| GET | `/api/v1/chargebacks/:id` | Get chargeback details |
| POST | `/api/v1/chargebacks/:id/apply` | Apply to settlement |
| POST | `/api/v1/chargebacks/:id/dispute` | Carrier disputes |
| POST | `/api/v1/chargebacks/:id/reverse` | Reverse chargeback |

### Reporting (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/claims/summary` | Claims summary statistics |
| GET | `/api/v1/claims/by-carrier` | Claims grouped by carrier |
| GET | `/api/v1/claims/by-customer` | Claims grouped by customer |
| GET | `/api/v1/claims/by-type` | Claims grouped by type |
| GET | `/api/v1/claims/aging` | Claims aging report |
| GET | `/api/v1/carriers/:id/claims-history` | Carrier claims history |
| GET | `/api/v1/carriers/:id/claims-ratio` | Carrier claims ratio |

---

## 📝 DTO Specifications

### CreateClaimDto
```typescript
export class CreateClaimDto {
  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  loadId?: string;

  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsEnum(ClaimType)
  claimType: ClaimType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  incidentDate?: string;

  @IsOptional()
  @IsString()
  incidentLocation?: string;

  @IsOptional()
  @IsEnum(LiabilityType)
  liabilityType?: LiabilityType;

  @IsOptional()
  @IsNumber()
  declaredValue?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClaimItemDto)
  items?: CreateClaimItemDto[];
}
```

### CreateClaimItemDto
```typescript
export class CreateClaimItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  commodity?: string;

  @IsNumber()
  @Min(0)
  quantityClaimed: number;

  @IsOptional()
  @IsString()
  unitOfMeasure?: string;

  @IsOptional()
  @IsNumber()
  weightLbs?: number;

  @IsNumber()
  @Min(0)
  unitValue: number;

  @IsOptional()
  @IsEnum(DamageType)
  damageType?: DamageType;

  @IsOptional()
  @IsString()
  damageDescription?: string;

  @IsOptional()
  @IsEnum(DamageSeverity)
  damageSeverity?: DamageSeverity;
}
```

### FileClaimDto
```typescript
export class FileClaimDto {
  @IsEnum(ClaimFiledBy)
  filedBy: ClaimFiledBy;
}
```

### AssignClaimDto
```typescript
export class AssignClaimDto {
  @IsString()
  @IsNotEmpty()
  assignedTo: string;

  @IsOptional()
  @IsDateString()
  investigationDueAt?: string;
}
```

### ApproveClaimDto
```typescript
export class ApproveClaimDto {
  @IsNumber()
  @Min(0)
  amountApproved: number;

  @IsOptional()
  @IsString()
  resolutionReason?: string;

  @IsOptional()
  @IsArray()
  itemApprovals?: Array<{
    itemId: string;
    quantityApproved: number;
    valueApproved: number;
    status: ClaimItemStatus;
  }>;
}
```

### DenyClaimDto
```typescript
export class DenyClaimDto {
  @IsString()
  @IsNotEmpty()
  resolutionReason: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  denialCodes?: string[];
}
```

### SettleClaimDto
```typescript
export class SettleClaimDto {
  @IsNumber()
  @Min(0)
  amountSettled: number;

  @IsString()
  @IsNotEmpty()
  resolutionReason: string;
}
```

### CreateChargebackDto
```typescript
export class CreateChargebackDto {
  @IsString()
  @IsNotEmpty()
  carrierId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
```

### CreateSubrogationDto
```typescript
export class CreateSubrogationDto {
  @IsOptional()
  @IsString()
  targetCarrierId?: string;

  @IsOptional()
  @IsString()
  targetName?: string;

  @IsEnum(SubrogationTargetType)
  targetType: SubrogationTargetType;

  @IsNumber()
  @Min(0)
  amountSought: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

---

## 📋 Business Rules

### Filing Rules
```typescript
const filingRules = {
  filingDeadline: 9,  // months from delivery (Carmack Amendment)
  requiredFields: ['orderId or loadId', 'claimType', 'at least one item'],
  autoAcknowledgeWithin: 1  // business day
};
```

### Investigation Rules
```typescript
const investigationRules = {
  carrierNotificationDeadline: 24,  // hours
  carrierResponseDue: 30,           // days
  investigationSLA: 30,             // business days
  autoEscalateAfter: 5              // business days no action
};
```

### Valuation Rules
```typescript
const valuationRules = {
  carmackFullValue: true,           // Default full value liability
  releasedValueRate: 0.50,          // $/lb if released value
  maxLiabilityLimit: 'invoice_value'
};
```

### Approval Authority
```typescript
const approvalAuthority = {
  autoApproveThreshold: 500,        // $ with supporting docs
  managerApprovalThreshold: 10000   // $ requires manager
};
```

### Chargeback Rules
```typescript
const chargebackRules = {
  autoGenerateOnApproval: true,
  disputeWindow: 10,                // days
  writeOffApprovalThreshold: 1000   // $ requires manager
};
```

### Carrier Impact
```typescript
const carrierImpact = {
  claimsRatioThreshold: 3,          // % triggers review
  tierImpact: 'prevents_advancement'
};
```

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `claim.created` | Create claim | `{ claimId, claimNumber, customerId }` |
| `claim.filed` | File claim | `{ claimId, filedBy, amountClaimed }` |
| `claim.acknowledged` | Auto-acknowledge | `{ claimId }` |
| `claim.assigned` | Assign investigator | `{ claimId, assignedTo }` |
| `claim.status_changed` | Status update | `{ claimId, previousStatus, newStatus }` |
| `claim.escalated` | Escalate | `{ claimId, escalatedTo, reason }` |
| `claim.document_uploaded` | Upload doc | `{ claimId, documentId }` |
| `claim.investigation_completed` | Complete investigation | `{ claimId }` |
| `claim.approved` | Approve | `{ claimId, amountApproved }` |
| `claim.denied` | Deny | `{ claimId, reason }` |
| `claim.settled` | Settle | `{ claimId, amountSettled }` |
| `claim.paid` | Payment processed | `{ claimId, amountPaid }` |
| `claim.closed` | Close | `{ claimId }` |
| `claim.carrier_notified` | Notify carrier | `{ claimId, carrierId }` |
| `claim.chargeback_created` | Create chargeback | `{ chargebackId, claimId, carrierId }` |
| `claim.chargeback_applied` | Apply chargeback | `{ chargebackId, settlementId }` |
| `claim.sla_breached` | SLA breach | `{ claimId, slaDueAt }` |
| `claim.subrogation_created` | Create subrogation | `{ subrogationId, claimId }` |
| `claim.subrogation_recovered` | Recovery | `{ subrogationId, amountRecovered }` |

---

## 🔔 Events to Subscribe

| Event | Source | Action |
|-------|--------|--------|
| `load.delivered` | TMS Core | Check for claim filing deadline |
| `load.pod_received` | TMS Core | Update related claims |
| `settlement.created` | Accounting | Check for pending chargebacks |
| `payment.received` | Accounting | Update claim payment status |
| `carrier.status_changed` | Carrier | Update claims for suspended carriers |

---

## 🧪 Integration Test Requirements

```typescript
describe('Claims Service API', () => {
  describe('Claim Lifecycle', () => {
    it('should create claim with items');
    it('should file claim and auto-acknowledge');
    it('should calculate total value from items');
    it('should enforce filing deadline');
    it('should prevent delete after filing');
  });

  describe('Investigation Workflow', () => {
    it('should assign investigator');
    it('should track investigation timeline');
    it('should notify carrier within 24 hours');
    it('should auto-escalate if no action');
    it('should complete investigation');
  });

  describe('Documents & Notes', () => {
    it('should upload claim documents');
    it('should add investigation notes');
    it('should track communication log');
    it('should enforce document requirements');
  });

  describe('Resolution', () => {
    it('should approve claim fully');
    it('should approve claim partially');
    it('should deny claim with reason');
    it('should settle claim');
    it('should process payment');
    it('should auto-close after payment');
    it('should enforce approval authority');
  });

  describe('Chargebacks', () => {
    it('should auto-generate chargeback on approval');
    it('should apply chargeback to settlement');
    it('should handle chargeback dispute');
    it('should reverse chargeback');
  });

  describe('Subrogation', () => {
    it('should create subrogation entry');
    it('should send demand letter');
    it('should track recovery');
  });

  describe('Carrier Impact', () => {
    it('should calculate claims ratio');
    it('should update carrier scorecard');
    it('should trigger review at threshold');
  });

  describe('Reporting', () => {
    it('should generate claims summary');
    it('should generate aging report');
    it('should group by carrier/customer/type');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/claims/
├── claims.module.ts
├── claims/
│   ├── claims.controller.ts
│   ├── claims.service.ts
│   └── dto/
│       ├── create-claim.dto.ts
│       ├── update-claim.dto.ts
│       ├── file-claim.dto.ts
│       ├── assign-claim.dto.ts
│       └── query-claims.dto.ts
├── items/
│   ├── claim-items.controller.ts
│   ├── claim-items.service.ts
│   └── dto/
├── documents/
│   ├── claim-documents.controller.ts
│   ├── claim-documents.service.ts
│   └── dto/
├── notes/
│   ├── claim-notes.controller.ts
│   ├── claim-notes.service.ts
│   └── dto/
├── resolution/
│   ├── claim-resolution.controller.ts
│   ├── claim-resolution.service.ts
│   └── dto/
│       ├── approve-claim.dto.ts
│       ├── deny-claim.dto.ts
│       └── settle-claim.dto.ts
├── chargebacks/
│   ├── chargebacks.controller.ts
│   ├── chargebacks.service.ts
│   └── dto/
├── subrogation/
│   ├── subrogation.controller.ts
│   ├── subrogation.service.ts
│   └── dto/
├── reports/
│   ├── claims-reports.controller.ts
│   └── claims-reports.service.ts
└── events/
    ├── claims-events.service.ts
    └── claims-event-handlers.service.ts
```

---

## ✅ Completion Checklist

- [ ] All 45 endpoints implemented
- [ ] Claim workflow (DRAFT → CLOSED) complete
- [ ] Items, documents, notes CRUD working
- [ ] Resolution workflow (approve/deny/settle)
- [ ] Chargeback generation and management
- [ ] Subrogation tracking
- [ ] Carrier claims ratio calculation
- [ ] SLA tracking and breach detection
- [ ] Timeline/audit trail complete
- [ ] All integration tests passing
- [ ] Tenant isolation verified

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>17</td>
    <td>Claims</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>45/45</td>
    <td>9/9</td>
    <td>100%</td>
    <td>Claims, Items, Docs, Resolution, Chargebacks, Subrogation</td>
</tr>
```

### Add Changelog Entry
```html
<div class="log-entry">
    <div class="log-date">January XX, 2026 - Claims API Complete</div>
    <ul class="log-items">
        <li>Implemented 45 Claims API endpoints</li>
        <li>Full claim lifecycle workflow (draft to closed)</li>
        <li>Items, documents, and notes management</li>
        <li>Resolution workflow with approval authority</li>
        <li>Carrier chargeback generation and tracking</li>
        <li>Subrogation for third-party recovery</li>
        <li>Carrier claims ratio calculation</li>
        <li>SLA tracking and breach detection</li>
        <li>Full integration test coverage</li>
    </ul>
</div>
```

---

## 🔜 Next Step

➡️ **[05-customer-portal-api.md](./05-customer-portal-api.md)** - Implement Customer Portal API

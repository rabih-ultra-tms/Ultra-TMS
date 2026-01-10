# 07 - Contracts Service API Implementation

> **Service:** Contracts Management  
> **Priority:** P2 - Medium  
> **Endpoints:** 55  
> **Dependencies:** Auth/Admin ✅, CRM ✅, Carrier ✅ (02), Sales ✅, Documents ✅  
> **Doc Reference:** [21-service-contracts.md](../../02-services/21-service-contracts.md)

---

## 📋 Overview

Manage customer and carrier contracts, rate agreements, volume commitments, SLAs, and the complete contract lifecycle from creation through renewal or termination. Provides contracted pricing that takes precedence over spot rates.

### Key Capabilities
- Contract templates (customer, carrier, agent)
- Rate card management with lane-specific pricing
- Volume commitment tracking with shortfall penalties
- SLA definition and performance monitoring
- E-signature integration (DocuSign)
- Contract versioning and amendment management
- Expiration alerts and auto-renewal options
- Fuel surcharge table management

---

## ✅ Pre-Implementation Checklist

- [ ] CRM service is working (Customer lookup)
- [ ] Carrier service is working (Carrier lookup)
- [ ] Sales service is working (Quotes integration)
- [ ] Documents service is working (Contract PDFs)
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### Contract Model
```prisma
model Contract {
  id                String            @id @default(cuid())
  tenantId          String
  
  contractNumber    String            // AUTO: C-YYYYMM-XXXX
  name              String
  description       String?           @db.Text
  
  contractType      ContractType
  
  partyType         PartyType
  partyId           String            // References companies, carriers, or agents
  
  effectiveDate     DateTime
  expirationDate    DateTime
  signedDate        DateTime?
  
  autoRenew         Boolean           @default(false)
  renewalPeriodMonths Int?
  renewalNoticeDays Int?              @default(30)
  renewalCount      Int               @default(0)
  
  status            ContractStatus    @default(DRAFT)
  
  submittedBy       String?
  submittedAt       DateTime?
  approvedBy        String?
  approvedAt        DateTime?
  
  signedByUs        Boolean           @default(false)
  signedByUsDate    DateTime?
  signedByThem      Boolean           @default(false)
  signedByThemDate  DateTime?
  
  esignProvider     String?           // DOCUSIGN
  esignEnvelopeId   String?
  esignStatus       String?
  
  documentId        String?
  
  paymentTerms      PaymentTerms?
  currency          String            @default("USD")
  
  terminatedBy      String?
  terminatedAt      DateTime?
  terminationReason String?           @db.Text
  
  customFields      Json              @default("{}")
  
  createdById       String
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  deletedAt         DateTime?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  document          Document?         @relation(fields: [documentId], references: [id])
  
  clauses           ContractClause[]
  rateTables        ContractRateTable[]
  slas              ContractSla[]
  volumeCommitments VolumeCommitment[]
  amendments        ContractAmendment[]
  metrics           ContractMetric[]
  
  @@unique([tenantId, contractNumber])
  @@index([tenantId, partyType, partyId])
  @@index([tenantId, status])
  @@index([tenantId, effectiveDate, expirationDate])
}

enum ContractType {
  CUSTOMER_RATE
  CARRIER_RATE
  DEDICATED_CAPACITY
  VOLUME_COMMITMENT
  AGENT_AGREEMENT
}

enum PartyType {
  CUSTOMER
  CARRIER
  AGENT
}

enum ContractStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  SENT_FOR_SIGNATURE
  ACTIVE
  EXPIRED
  TERMINATED
}
```

### ContractTemplate Model
```prisma
model ContractTemplate {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  description       String?           @db.Text
  contractType      ContractType
  
  templateContent   String            @db.Text
  mergeFields       Json              @default("[]")
  
  defaultClauses    Json              @default("[]")
  
  isActive          Boolean           @default(true)
  isDefault         Boolean           @default(false)
  
  version           Int               @default(1)
  
  createdById       String
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId, contractType])
}
```

### ContractRateTable Model
```prisma
model ContractRateTable {
  id                String            @id @default(cuid())
  tenantId          String
  contractId        String
  
  name              String
  description       String?           @db.Text
  
  mode              String?           // LTL, TL, PARTIAL
  equipmentType     String?           // VAN, REEFER, FLATBED, ALL
  
  effectiveDate     DateTime
  expirationDate    DateTime?
  
  isActive          Boolean           @default(true)
  
  version           Int               @default(1)
  parentId          String?           // Previous version
  
  createdById       String
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  contract          Contract          @relation(fields: [contractId], references: [id])
  parent            ContractRateTable? @relation("RateTableVersions", fields: [parentId], references: [id])
  children          ContractRateTable[] @relation("RateTableVersions")
  
  lanes             ContractRateLane[]
  
  @@index([contractId])
  @@index([effectiveDate, expirationDate])
}
```

### ContractRateLane Model
```prisma
model ContractRateLane {
  id                String            @id @default(cuid())
  tenantId          String
  rateTableId       String
  
  originCity        String?
  originState       String?
  originZip         String?
  originZipStart    String?
  originZipEnd      String?
  originRegion      String?           // WEST, MIDWEST, SOUTH, NORTHEAST
  
  destCity          String?
  destState         String?
  destZip           String?
  destZipStart      String?
  destZipEnd        String?
  destRegion        String?
  
  minWeightLbs      Int?
  maxWeightLbs      Int?
  
  rateType          RateType
  rateAmount        Decimal           @db.Decimal(10, 4)
  currency          String            @default("USD")
  
  fuelIncluded      Boolean           @default(false)
  fuelTableId       String?
  
  minCharge         Decimal?          @db.Decimal(10, 2)
  
  transitDays       Int?
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  rateTable         ContractRateTable @relation(fields: [rateTableId], references: [id], onDelete: Cascade)
  fuelTable         FuelSurchargeTable? @relation(fields: [fuelTableId], references: [id])
  
  @@index([rateTableId])
  @@index([originState, originCity])
  @@index([destState, destCity])
}

enum RateType {
  FLAT
  PER_MILE
  PER_CWT
  PER_PALLET
}
```

### FuelSurchargeTable Model
```prisma
model FuelSurchargeTable {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  description       String?           @db.Text
  
  fuelIndex         String            @default("DOE_NATIONAL")
  
  effectiveDate     DateTime
  
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  tiers             FuelSurchargeTier[]
  lanes             ContractRateLane[]
  
  @@index([tenantId])
}

model FuelSurchargeTier {
  id                String            @id @default(cuid())
  fuelTableId       String
  
  fuelPriceMin      Decimal           @db.Decimal(6, 3)
  fuelPriceMax      Decimal           @db.Decimal(6, 3)
  
  surchargeType     SurchargeType
  surchargeAmount   Decimal           @db.Decimal(10, 4)
  
  createdAt         DateTime          @default(now())
  
  fuelTable         FuelSurchargeTable @relation(fields: [fuelTableId], references: [id], onDelete: Cascade)
  
  @@index([fuelTableId])
}

enum SurchargeType {
  PERCENT
  PER_MILE
  FLAT
}
```

### ContractSla Model
```prisma
model ContractSla {
  id                String            @id @default(cuid())
  tenantId          String
  contractId        String
  
  slaType           SlaType
  name              String
  description       String?           @db.Text
  
  metric            String            // PERCENT, COUNT, HOURS, DAYS
  targetValue       Decimal           @db.Decimal(10, 2)
  comparison        String            // GTE, LTE, EQ
  
  measurementPeriod MeasurementPeriod
  
  penaltyType       String?           // PERCENT_REBATE, FLAT_FEE, CREDIT
  penaltyRate       Decimal?          @db.Decimal(10, 4)
  maxPenalty        Decimal?          @db.Decimal(10, 2)
  
  bonusType         String?
  bonusRate         Decimal?          @db.Decimal(10, 4)
  maxBonus          Decimal?          @db.Decimal(10, 2)
  
  warningThreshold  Decimal?          @db.Decimal(10, 2)
  
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  contract          Contract          @relation(fields: [contractId], references: [id])
  metrics           ContractMetric[]
  
  @@index([contractId])
  @@index([slaType])
}

enum SlaType {
  ON_TIME_PICKUP
  ON_TIME_DELIVERY
  CLAIMS_RATIO
  TENDER_ACCEPTANCE
  TRACKING_COMPLIANCE
  INVOICE_ACCURACY
}

enum MeasurementPeriod {
  WEEKLY
  MONTHLY
  QUARTERLY
}
```

### VolumeCommitment Model
```prisma
model VolumeCommitment {
  id                String            @id @default(cuid())
  tenantId          String
  contractId        String
  
  commitmentType    VolumeCommitmentType
  periodType        VolumePeriodType
  
  minVolume         Decimal           @db.Decimal(12, 2)
  maxVolume         Decimal?          @db.Decimal(12, 2)
  
  shortfallPenaltyType String?
  shortfallPenaltyRate Decimal?       @db.Decimal(10, 4)
  
  excessDiscountType String?
  excessDiscountRate Decimal?         @db.Decimal(10, 4)
  
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  contract          Contract          @relation(fields: [contractId], references: [id])
  metrics           ContractMetric[]
  
  @@index([contractId])
}

enum VolumeCommitmentType {
  SHIPMENTS
  REVENUE
  LOADS
  WEIGHT
}

enum VolumePeriodType {
  MONTHLY
  QUARTERLY
  ANNUAL
}
```

### ContractAmendment Model
```prisma
model ContractAmendment {
  id                String            @id @default(cuid())
  tenantId          String
  contractId        String
  
  amendmentNumber   Int
  title             String
  description       String?           @db.Text
  
  changes           Json              // [{field, oldValue, newValue}]
  
  effectiveDate     DateTime
  
  status            AmendmentStatus   @default(DRAFT)
  
  approvedBy        String?
  approvedAt        DateTime?
  
  esignEnvelopeId   String?
  signedAt          DateTime?
  
  documentId        String?
  
  createdById       String
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  contract          Contract          @relation(fields: [contractId], references: [id])
  document          Document?         @relation(fields: [documentId], references: [id])
  
  @@index([contractId])
  @@index([status])
}

enum AmendmentStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  ACTIVE
  REJECTED
}
```

---

## 🛠️ API Endpoints

### Contracts (13 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/contracts` | List contracts |
| POST | `/api/v1/contracts` | Create contract |
| GET | `/api/v1/contracts/:id` | Get contract details |
| PUT | `/api/v1/contracts/:id` | Update contract |
| DELETE | `/api/v1/contracts/:id` | Delete draft |
| POST | `/api/v1/contracts/:id/submit` | Submit for approval |
| POST | `/api/v1/contracts/:id/approve` | Approve contract |
| POST | `/api/v1/contracts/:id/reject` | Reject contract |
| POST | `/api/v1/contracts/:id/send-for-signature` | Send for e-sign |
| POST | `/api/v1/contracts/:id/activate` | Activate contract |
| POST | `/api/v1/contracts/:id/terminate` | Terminate contract |
| POST | `/api/v1/contracts/:id/renew` | Renew contract |
| GET | `/api/v1/contracts/:id/history` | Get history |

### Contract Templates (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/contract-templates` | List templates |
| POST | `/api/v1/contract-templates` | Create template |
| GET | `/api/v1/contract-templates/:id` | Get template |
| PUT | `/api/v1/contract-templates/:id` | Update template |
| DELETE | `/api/v1/contract-templates/:id` | Delete template |
| POST | `/api/v1/contract-templates/:id/clone` | Clone template |

### Rate Tables (11 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/contracts/:id/rate-tables` | List rate tables |
| POST | `/api/v1/contracts/:id/rate-tables` | Add rate table |
| GET | `/api/v1/rate-tables/:id` | Get rate table |
| PUT | `/api/v1/rate-tables/:id` | Update rate table |
| DELETE | `/api/v1/rate-tables/:id` | Delete rate table |
| GET | `/api/v1/rate-tables/:id/lanes` | Get lanes |
| POST | `/api/v1/rate-tables/:id/lanes` | Add lane |
| PUT | `/api/v1/rate-tables/:id/lanes/:laneId` | Update lane |
| DELETE | `/api/v1/rate-tables/:id/lanes/:laneId` | Delete lane |
| POST | `/api/v1/rate-tables/:id/import` | Import CSV |
| GET | `/api/v1/rate-tables/:id/export` | Export CSV |

### Fuel Surcharge (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/fuel-tables` | List fuel tables |
| POST | `/api/v1/fuel-tables` | Create fuel table |
| GET | `/api/v1/fuel-tables/:id` | Get fuel table |
| PUT | `/api/v1/fuel-tables/:id` | Update fuel table |
| DELETE | `/api/v1/fuel-tables/:id` | Delete fuel table |
| GET | `/api/v1/fuel-tables/:id/tiers` | Get tiers |
| POST | `/api/v1/fuel-tables/:id/tiers` | Add tier |
| GET | `/api/v1/fuel-surcharge/calculate` | Calculate surcharge |

### SLAs (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/contracts/:id/slas` | List SLAs |
| POST | `/api/v1/contracts/:id/slas` | Add SLA |
| PUT | `/api/v1/slas/:id` | Update SLA |
| DELETE | `/api/v1/slas/:id` | Delete SLA |
| GET | `/api/v1/slas/:id/performance` | Get performance |
| GET | `/api/v1/contracts/:id/sla-summary` | SLA summary |

### Volume Commitments (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/contracts/:id/volume-commitments` | List commitments |
| POST | `/api/v1/contracts/:id/volume-commitments` | Add commitment |
| PUT | `/api/v1/volume-commitments/:id` | Update commitment |
| DELETE | `/api/v1/volume-commitments/:id` | Delete commitment |
| GET | `/api/v1/volume-commitments/:id/performance` | Performance |

### Amendments (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/contracts/:id/amendments` | List amendments |
| POST | `/api/v1/contracts/:id/amendments` | Create amendment |
| GET | `/api/v1/amendments/:id` | Get amendment |
| PUT | `/api/v1/amendments/:id` | Update amendment |
| POST | `/api/v1/amendments/:id/approve` | Approve amendment |
| POST | `/api/v1/amendments/:id/apply` | Apply amendment |

---

## 📝 DTO Specifications

### CreateContractDto
```typescript
export class CreateContractDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ContractType)
  contractType: ContractType;

  @IsEnum(PartyType)
  partyType: PartyType;

  @IsString()
  partyId: string;

  @IsDateString()
  effectiveDate: string;

  @IsDateString()
  expirationDate: string;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsInt()
  renewalPeriodMonths?: number;

  @IsOptional()
  @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms;

  @IsOptional()
  @IsString()
  templateId?: string;
}
```

### CreateRateLaneDto
```typescript
export class CreateRateLaneDto {
  @IsOptional()
  @IsString()
  originCity?: string;

  @IsOptional()
  @IsString()
  originState?: string;

  @IsOptional()
  @IsString()
  originZip?: string;

  @IsOptional()
  @IsString()
  destCity?: string;

  @IsOptional()
  @IsString()
  destState?: string;

  @IsOptional()
  @IsString()
  destZip?: string;

  @IsEnum(RateType)
  rateType: RateType;

  @IsNumber()
  @Min(0)
  rateAmount: number;

  @IsOptional()
  @IsBoolean()
  fuelIncluded?: boolean;

  @IsOptional()
  @IsString()
  fuelTableId?: string;

  @IsOptional()
  @IsNumber()
  minCharge?: number;

  @IsOptional()
  @IsInt()
  transitDays?: number;
}
```

### CreateContractSlaDto
```typescript
export class CreateContractSlaDto {
  @IsEnum(SlaType)
  slaType: SlaType;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  metric: string;

  @IsNumber()
  targetValue: number;

  @IsString()
  comparison: string;  // GTE, LTE, EQ

  @IsEnum(MeasurementPeriod)
  measurementPeriod: MeasurementPeriod;

  @IsOptional()
  @IsString()
  penaltyType?: string;

  @IsOptional()
  @IsNumber()
  penaltyRate?: number;

  @IsOptional()
  @IsNumber()
  maxPenalty?: number;

  @IsOptional()
  @IsNumber()
  warningThreshold?: number;
}
```

### CalculateFuelSurchargeDto
```typescript
export class CalculateFuelSurchargeDto {
  @IsString()
  fuelTableId: string;

  @IsNumber()
  currentFuelPrice: number;

  @IsNumber()
  @Min(0)
  lineHaulAmount: number;

  @IsOptional()
  @IsNumber()
  miles?: number;
}
```

---

## 📋 Business Rules

### Contract Status Workflow
```
DRAFT → PENDING_APPROVAL → APPROVED → SENT_FOR_SIGNATURE → ACTIVE → EXPIRED/TERMINATED
```

### Rate Lookup Priority
```typescript
const rateLookupPriority = [
  'EXACT_CITY_MATCH',
  'ZIP_RANGE_MATCH',
  'STATE_MATCH',
  'REGION_MATCH',
  'DEFAULT_RATE'
];
```

### SLA Performance Calculation
```typescript
// On-Time Delivery %
onTimeDelivery = (deliveredOnTime / totalDeliveries) * 100

// Claims Ratio %
claimsRatio = (totalClaims / totalLoads) * 100

// Tender Acceptance %
tenderAcceptance = (acceptedTenders / totalTenders) * 100
```

### Auto-Renewal Rules
```typescript
const autoRenewalRules = {
  notificationDays: 30,     // Notify before expiration
  renewalPeriod: 12,        // Default 12 months
  requireApproval: false    // Auto-approve renewal
};
```

### Volume Shortfall Calculation
```typescript
shortfall = minVolume - actualVolume
penaltyAmount = shortfall * shortfallPenaltyRate
```

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `contract.created` | Create contract | `{ contractId, partyId }` |
| `contract.submitted` | Submit for approval | `{ contractId }` |
| `contract.approved` | Approve | `{ contractId, approvedBy }` |
| `contract.activated` | Activate | `{ contractId, effectiveDate }` |
| `contract.expiring` | 30 days before expiry | `{ contractId, expirationDate }` |
| `contract.expired` | Expiration | `{ contractId }` |
| `contract.terminated` | Terminate | `{ contractId, reason }` |
| `contract.renewed` | Renew | `{ contractId, newExpirationDate }` |
| `contract.esign.sent` | Send for signature | `{ contractId, envelopeId }` |
| `contract.esign.completed` | Signature complete | `{ contractId }` |
| `sla.warning` | Below threshold | `{ slaId, contractId, actualValue }` |
| `sla.violation` | SLA breached | `{ slaId, contractId, penaltyAmount }` |
| `volume.shortfall` | Below commitment | `{ commitmentId, shortfall }` |
| `amendment.created` | Create amendment | `{ amendmentId, contractId }` |
| `amendment.approved` | Approve amendment | `{ amendmentId }` |

---

## 🧪 Integration Test Requirements

```typescript
describe('Contracts Service API', () => {
  describe('Contract Lifecycle', () => {
    it('should create contract from template');
    it('should submit for approval');
    it('should approve contract');
    it('should send for e-signature');
    it('should activate on signature');
    it('should terminate contract');
    it('should auto-renew contract');
  });

  describe('Rate Tables', () => {
    it('should create rate table');
    it('should add lane rates');
    it('should import lanes from CSV');
    it('should export lanes to CSV');
    it('should lookup rate by lane');
    it('should apply fuel surcharge');
  });

  describe('Fuel Surcharge', () => {
    it('should create fuel table');
    it('should add surcharge tiers');
    it('should calculate surcharge');
  });

  describe('SLAs', () => {
    it('should define SLA targets');
    it('should calculate performance');
    it('should trigger warning at threshold');
    it('should calculate penalty on violation');
  });

  describe('Volume Commitments', () => {
    it('should track volume against commitment');
    it('should calculate shortfall penalty');
    it('should calculate excess discount');
  });

  describe('Amendments', () => {
    it('should create amendment');
    it('should track changes');
    it('should apply amendment to contract');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/contracts/
├── contracts.module.ts
├── contracts/
│   ├── contracts.controller.ts
│   ├── contracts.service.ts
│   └── dto/
├── templates/
│   ├── contract-templates.controller.ts
│   ├── contract-templates.service.ts
│   └── dto/
├── rate-tables/
│   ├── rate-tables.controller.ts
│   ├── rate-tables.service.ts
│   ├── rate-lanes.controller.ts
│   ├── rate-lanes.service.ts
│   └── dto/
├── fuel-surcharge/
│   ├── fuel-surcharge.controller.ts
│   ├── fuel-surcharge.service.ts
│   └── dto/
├── slas/
│   ├── slas.controller.ts
│   ├── slas.service.ts
│   └── dto/
├── volume-commitments/
│   ├── volume-commitments.controller.ts
│   ├── volume-commitments.service.ts
│   └── dto/
├── amendments/
│   ├── amendments.controller.ts
│   ├── amendments.service.ts
│   └── dto/
└── integrations/
    └── docusign.service.ts
```

---

## ✅ Completion Checklist

- [ ] All 55 endpoints implemented
- [ ] Contract lifecycle complete
- [ ] Templates with merge fields
- [ ] Rate tables with lane lookup
- [ ] Fuel surcharge calculation
- [ ] SLA tracking and performance
- [ ] Volume commitment tracking
- [ ] Amendment workflow
- [ ] DocuSign integration (stub)
- [ ] CSV import/export
- [ ] All integration tests passing
- [ ] Tenant isolation verified

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>20</td>
    <td>Contracts</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>55/55</td>
    <td>7/7</td>
    <td>100%</td>
    <td>Contracts, Templates, Rates, Fuel, SLAs, Volumes, Amendments</td>
</tr>
```

### Add Changelog Entry
```html
<div class="log-entry">
    <div class="log-date">January XX, 2026 - Contracts API Complete</div>
    <ul class="log-items">
        <li>Implemented 55 Contracts API endpoints</li>
        <li>Full contract lifecycle with e-signature integration</li>
        <li>Rate table management with lane-specific pricing</li>
        <li>Fuel surcharge table and calculation</li>
        <li>SLA definition and performance monitoring</li>
        <li>Volume commitment tracking with penalties</li>
        <li>Amendment workflow</li>
        <li>Full integration test coverage</li>
    </ul>
</div>
```

---

## 🔜 Next Step

➡️ **[08-agent-api.md](./08-agent-api.md)** - Implement Agent Service API

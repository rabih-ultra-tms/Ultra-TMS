# 02 - Carrier Service API Implementation

> **Service:** Carrier Management  
> **Priority:** P0 - Critical Path  
> **Endpoints:** 40  
> **Dependencies:** Auth ✅, TMS Core (01)  
> **Doc Reference:** [12-service-carrier.md](../../02-services/12-service-carrier.md)

---

## 📋 Overview

The Carrier Service manages all carrier-related operations including carrier profiles, contacts, drivers, insurance certificates, documents, and compliance verification. This service integrates with FMCSA SAFER for carrier verification.

### Key Capabilities
- Carrier onboarding and profile management
- Carrier contact management
- Driver management
- Insurance certificate tracking with expiration alerts
- Document management with compliance tracking
- FMCSA SAFER integration for verification
- Carrier performance scoring and tier management

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Prompt 01 (TMS Core) is complete
- [ ] Auth service is working
- [ ] Database models exist in `schema.prisma`
- [ ] FMCSA API credentials are configured (or mock available)

---

## 🗄️ Database Models Reference

### Carrier Model
```prisma
model Carrier {
  id                String          @id @default(cuid())
  tenantId          String
  
  // Identification
  mcNumber          String?
  dotNumber         String
  name              String
  legalName         String?
  dbaName           String?
  
  // Status
  status            CarrierStatus   @default(PENDING)
  tier              CarrierTier     @default(UNQUALIFIED)
  qualificationDate DateTime?
  
  // Contact Info
  address1          String
  address2          String?
  city              String
  state             String
  postalCode        String
  country           String          @default("USA")
  phone             String
  fax               String?
  email             String
  website           String?
  
  // Tax/Payment
  taxId             String?
  paymentTerms      PaymentTerms    @default(NET_30)
  paymentMethod     PaymentMethod   @default(CHECK)
  remitAddress1     String?
  remitAddress2     String?
  remitCity         String?
  remitState        String?
  remitPostalCode   String?
  
  // Equipment
  equipmentTypes    EquipmentType[]
  tractorCount      Int?
  trailerCount      Int?
  driverCount       Int?
  
  // Operating Authority
  operatingStatus   String?         // FMCSA status
  authorityStatus   String?
  commonAuthority   Boolean?
  contractAuthority Boolean?
  brokerAuthority   Boolean?
  
  // Safety
  safetyRating      String?
  safetyRatingDate  DateTime?
  outOfServiceDate  DateTime?
  
  // Preferences
  preferredLanes    Json?           // Array of lane objects
  blacklistedLanes  Json?
  
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
  contacts          CarrierContact[]
  drivers           Driver[]
  insuranceCerts    InsuranceCertificate[]
  documents         CarrierDocument[]
  performanceHistory CarrierPerformanceHistory[]
  loads             Load[]
  
  @@unique([tenantId, dotNumber])
  @@unique([tenantId, mcNumber])
  @@index([tenantId, status])
  @@index([tenantId, tier])
}

enum CarrierStatus {
  PENDING
  APPROVED
  ACTIVE
  INACTIVE
  SUSPENDED
  BLACKLISTED
}

enum CarrierTier {
  PLATINUM    // 100+ loads, 95%+ on-time, <1% claims
  GOLD        // 50+ loads, 90%+ on-time, <2% claims
  SILVER      // 25+ loads, 85%+ on-time, <3% claims
  BRONZE      // 10+ loads, active
  UNQUALIFIED // New or insufficient history
}

enum PaymentTerms {
  QUICK_PAY
  NET_15
  NET_21
  NET_30
  NET_45
}

enum PaymentMethod {
  CHECK
  ACH
  WIRE
  FUEL_CARD
  COMCHEK
  TCHECKS
}
```

### CarrierContact Model
```prisma
model CarrierContact {
  id                String          @id @default(cuid())
  tenantId          String
  carrierId         String
  
  firstName         String
  lastName          String
  title             String?
  role              CarrierContactRole
  
  phone             String?
  phoneExt          String?
  mobilePhone       String?
  email             String?
  fax               String?
  
  isPrimary         Boolean         @default(false)
  isDispatch        Boolean         @default(false)
  isAccounting      Boolean         @default(false)
  
  notes             String?         @db.Text
  
  // Audit
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  deletedAt         DateTime?
  createdById       String
  updatedById       String
  
  // Relations
  tenant            Tenant          @relation(fields: [tenantId], references: [id])
  carrier           Carrier         @relation(fields: [carrierId], references: [id])
  
  @@index([tenantId, carrierId])
}

enum CarrierContactRole {
  OWNER
  DISPATCH
  DRIVER
  ACCOUNTING
  SAFETY
  OPERATIONS
  OTHER
}
```

### Driver Model
```prisma
model Driver {
  id                String          @id @default(cuid())
  tenantId          String
  carrierId         String
  
  firstName         String
  lastName          String
  
  // License
  licenseNumber     String
  licenseState      String
  cdlClass          CdlClass
  endorsements      String[]        // H (Hazmat), T (Tanker), N (Tank), P (Passenger), etc.
  restrictions      String[]
  licenseExpiration DateTime?
  
  // Contact
  phone             String?
  email             String?
  
  // Status
  status            DriverStatus    @default(ACTIVE)
  
  // Medical
  medicalCardExpiration DateTime?
  
  // Employment
  hireDate          DateTime?
  terminationDate   DateTime?
  
  // Notes
  notes             String?         @db.Text
  
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
  carrier           Carrier         @relation(fields: [carrierId], references: [id])
  loads             Load[]
  
  @@index([tenantId, carrierId])
  @@index([tenantId, status])
}

enum CdlClass {
  A
  B
  C
}

enum DriverStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  TERMINATED
}
```

### InsuranceCertificate Model
```prisma
model InsuranceCertificate {
  id                String          @id @default(cuid())
  tenantId          String
  carrierId         String
  
  type              InsuranceType
  insuranceCompany  String
  policyNumber      String
  
  coverageAmount    Decimal         @db.Decimal(12, 2)
  deductible        Decimal?        @db.Decimal(10, 2)
  
  effectiveDate     DateTime
  expirationDate    DateTime
  
  certificateHolder String?
  additionalInsured Boolean         @default(false)
  
  // Document
  documentUrl       String?
  
  // Status
  isVerified        Boolean         @default(false)
  verifiedBy        String?
  verifiedAt        DateTime?
  
  // Alerts
  expirationAlertSent Boolean       @default(false)
  
  // Audit
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  createdById       String
  updatedById       String
  
  // Relations
  tenant            Tenant          @relation(fields: [tenantId], references: [id])
  carrier           Carrier         @relation(fields: [carrierId], references: [id])
  
  @@index([tenantId, carrierId])
  @@index([tenantId, expirationDate])
}

enum InsuranceType {
  AUTO_LIABILITY
  CARGO
  GENERAL_LIABILITY
  WORKERS_COMP
  UMBRELLA
  PHYSICAL_DAMAGE
}
```

### CarrierDocument Model
```prisma
model CarrierDocument {
  id                String          @id @default(cuid())
  tenantId          String
  carrierId         String
  
  documentType      CarrierDocType
  name              String
  fileUrl           String
  mimeType          String?
  fileSize          Int?
  
  expirationDate    DateTime?
  
  // Status
  status            DocumentStatus  @default(PENDING)
  reviewedBy        String?
  reviewedAt        DateTime?
  rejectionReason   String?
  
  // Audit
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  createdById       String
  updatedById       String
  
  // Relations
  tenant            Tenant          @relation(fields: [tenantId], references: [id])
  carrier           Carrier         @relation(fields: [carrierId], references: [id])
  
  @@index([tenantId, carrierId])
  @@index([tenantId, documentType])
}

enum CarrierDocType {
  W9
  CARRIER_AGREEMENT
  AUTHORITY_LETTER
  INSURANCE_COI
  SAFETY_RATING
  OPERATING_AUTHORITY
  CARRIER_PACKET
  OTHER
}

enum DocumentStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
}
```

### CarrierPerformanceHistory Model
```prisma
model CarrierPerformanceHistory {
  id                String          @id @default(cuid())
  tenantId          String
  carrierId         String
  
  periodStart       DateTime
  periodEnd         DateTime
  
  // Metrics
  totalLoads        Int             @default(0)
  onTimePickups     Int             @default(0)
  onTimeDeliveries  Int             @default(0)
  latePickups       Int             @default(0)
  lateDeliveries    Int             @default(0)
  
  claimsCount       Int             @default(0)
  claimsAmount      Decimal         @default(0) @db.Decimal(12, 2)
  
  fallOffCount      Int             @default(0)
  serviceFailures   Int             @default(0)
  
  // Calculated
  onTimePickupRate  Decimal?        @db.Decimal(5, 2)
  onTimeDeliveryRate Decimal?       @db.Decimal(5, 2)
  claimsRatio       Decimal?        @db.Decimal(5, 4)
  overallScore      Decimal?        @db.Decimal(5, 2)
  
  // Audit
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  // Relations
  tenant            Tenant          @relation(fields: [tenantId], references: [id])
  carrier           Carrier         @relation(fields: [carrierId], references: [id])
  
  @@index([tenantId, carrierId])
  @@index([carrierId, periodEnd])
}
```

### FmcsaComplianceLog Model
```prisma
model FmcsaComplianceLog {
  id                String          @id @default(cuid())
  tenantId          String
  carrierId         String
  
  checkType         String          // INITIAL, RENEWAL, PERIODIC, MANUAL
  checkDate         DateTime        @default(now())
  
  // FMCSA Data
  dotNumber         String
  mcNumber          String?
  legalName         String
  dbaName           String?
  operatingStatus   String
  entityType        String?
  
  // Safety Data
  safetyRating      String?
  safetyRatingDate  DateTime?
  unsafeDrivingScore Decimal?       @db.Decimal(5, 2)
  hosComplianceScore Decimal?       @db.Decimal(5, 2)
  vehicleMaintenanceScore Decimal?  @db.Decimal(5, 2)
  controlledSubstancesScore Decimal? @db.Decimal(5, 2)
  driverFitnessScore Decimal?       @db.Decimal(5, 2)
  hazmatScore       Decimal?        @db.Decimal(5, 2)
  crashIndicatorScore Decimal?      @db.Decimal(5, 2)
  
  // Insurance
  bipdRequired      Decimal?        @db.Decimal(12, 2)
  bipdOnFile        Decimal?        @db.Decimal(12, 2)
  cargoRequired     Decimal?        @db.Decimal(12, 2)
  cargoOnFile       Decimal?        @db.Decimal(12, 2)
  bondRequired      Decimal?        @db.Decimal(12, 2)
  bondOnFile        Decimal?        @db.Decimal(12, 2)
  
  // Result
  isCompliant       Boolean
  complianceIssues  Json?           // Array of issues
  
  // Raw Response
  rawResponse       Json?
  
  // Audit
  createdAt         DateTime        @default(now())
  checkedById       String?
  
  // Relations
  tenant            Tenant          @relation(fields: [tenantId], references: [id])
  carrier           Carrier         @relation(fields: [carrierId], references: [id])
  
  @@index([tenantId, carrierId])
  @@index([carrierId, checkDate])
}
```

---

## 🛠️ API Endpoints

### Carriers Resource

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/carriers` | List carriers with filters |
| GET | `/api/v1/carriers/:id` | Get carrier details |
| POST | `/api/v1/carriers` | Create carrier |
| PUT | `/api/v1/carriers/:id` | Update carrier |
| DELETE | `/api/v1/carriers/:id` | Deactivate carrier |
| PATCH | `/api/v1/carriers/:id/status` | Update status |
| PATCH | `/api/v1/carriers/:id/tier` | Update tier |
| POST | `/api/v1/carriers/:id/approve` | Approve carrier |
| POST | `/api/v1/carriers/:id/suspend` | Suspend carrier |
| POST | `/api/v1/carriers/:id/blacklist` | Blacklist carrier |
| GET | `/api/v1/carriers/:id/contacts` | Get contacts |
| POST | `/api/v1/carriers/:id/contacts` | Add contact |
| PUT | `/api/v1/carriers/:id/contacts/:contactId` | Update contact |
| DELETE | `/api/v1/carriers/:id/contacts/:contactId` | Remove contact |
| GET | `/api/v1/carriers/:id/drivers` | Get drivers |
| POST | `/api/v1/carriers/:id/drivers` | Add driver |
| GET | `/api/v1/carriers/:id/insurance` | Get insurance certs |
| POST | `/api/v1/carriers/:id/insurance` | Add insurance |
| PUT | `/api/v1/carriers/:id/insurance/:insuranceId` | Update insurance |
| DELETE | `/api/v1/carriers/:id/insurance/:insuranceId` | Remove insurance |
| GET | `/api/v1/carriers/:id/documents` | Get documents |
| POST | `/api/v1/carriers/:id/documents` | Upload document |
| PUT | `/api/v1/carriers/:id/documents/:docId` | Update document |
| DELETE | `/api/v1/carriers/:id/documents/:docId` | Remove document |
| POST | `/api/v1/carriers/:id/documents/:docId/approve` | Approve document |
| POST | `/api/v1/carriers/:id/documents/:docId/reject` | Reject document |
| GET | `/api/v1/carriers/:id/performance` | Get performance metrics |
| GET | `/api/v1/carriers/:id/loads` | Get carrier loads |
| GET | `/api/v1/carriers/:id/compliance` | Get compliance status |
| POST | `/api/v1/carriers/:id/fmcsa-check` | Run FMCSA check |
| GET | `/api/v1/carriers/:id/scorecard` | Get carrier scorecard |

### Drivers Resource

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/drivers` | List all drivers |
| GET | `/api/v1/drivers/:id` | Get driver details |
| PUT | `/api/v1/drivers/:id` | Update driver |
| DELETE | `/api/v1/drivers/:id` | Deactivate driver |
| PATCH | `/api/v1/drivers/:id/status` | Update driver status |
| GET | `/api/v1/drivers/:id/loads` | Get driver loads |

### FMCSA Lookup Resource

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/carriers/fmcsa/lookup/mc/:mcNumber` | Lookup by MC# |
| GET | `/api/v1/carriers/fmcsa/lookup/dot/:dotNumber` | Lookup by DOT# |
| POST | `/api/v1/carriers/onboard` | Start onboarding from FMCSA |

---

## 📝 DTO Specifications

### CreateCarrierDto
```typescript
export class CreateCarrierDto {
  @IsString()
  @IsNotEmpty()
  dotNumber: string;

  @IsOptional()
  @IsString()
  mcNumber?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  legalName?: string;

  @IsOptional()
  @IsString()
  dbaName?: string;

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

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  fax?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsArray()
  @IsEnum(EquipmentType, { each: true })
  equipmentTypes?: EquipmentType[];

  @IsOptional()
  @IsInt()
  tractorCount?: number;

  @IsOptional()
  @IsInt()
  trailerCount?: number;

  @IsOptional()
  @IsInt()
  driverCount?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateCarrierContactDto)
  contacts?: CreateCarrierContactDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateInsuranceCertificateDto)
  insurance?: CreateInsuranceCertificateDto[];
}
```

### CreateCarrierContactDto
```typescript
export class CreateCarrierContactDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsEnum(CarrierContactRole)
  role: CarrierContactRole;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  phoneExt?: string;

  @IsOptional()
  @IsString()
  mobilePhone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  fax?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isDispatch?: boolean;

  @IsOptional()
  @IsBoolean()
  isAccounting?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

### CreateDriverDto
```typescript
export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @IsString()
  @Length(2, 2)
  licenseState: string;

  @IsEnum(CdlClass)
  cdlClass: CdlClass;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  endorsements?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictions?: string[];

  @IsOptional()
  @IsDateString()
  licenseExpiration?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsDateString()
  medicalCardExpiration?: string;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

### CreateInsuranceCertificateDto
```typescript
export class CreateInsuranceCertificateDto {
  @IsEnum(InsuranceType)
  type: InsuranceType;

  @IsString()
  @IsNotEmpty()
  insuranceCompany: string;

  @IsString()
  @IsNotEmpty()
  policyNumber: string;

  @IsNumber()
  @Min(0)
  coverageAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deductible?: number;

  @IsDateString()
  effectiveDate: string;

  @IsDateString()
  expirationDate: string;

  @IsOptional()
  @IsString()
  certificateHolder?: string;

  @IsOptional()
  @IsBoolean()
  additionalInsured?: boolean;

  @IsOptional()
  @IsUrl()
  documentUrl?: string;
}
```

### CarrierQueryDto
```typescript
export class CarrierQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(CarrierStatus)
  status?: CarrierStatus;

  @IsOptional()
  @IsEnum(CarrierTier)
  tier?: CarrierTier;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  mcNumber?: string;

  @IsOptional()
  @IsString()
  dotNumber?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(EquipmentType, { each: true })
  equipmentTypes?: EquipmentType[];

  @IsOptional()
  @IsBoolean()
  hasExpiredInsurance?: boolean;

  @IsOptional()
  @IsBoolean()
  hasExpiredDocuments?: boolean;
}
```

### FmcsaLookupResultDto
```typescript
export class FmcsaLookupResultDto {
  dotNumber: string;
  mcNumber?: string;
  legalName: string;
  dbaName?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  phone?: string;
  operatingStatus: string;
  entityType: string;
  carrierOperation: string[];
  safetyRating?: string;
  safetyRatingDate?: string;
  insurance: {
    bipdRequired: number;
    bipdOnFile: number;
    cargoRequired: number;
    cargoOnFile: number;
    bondRequired: number;
    bondOnFile: number;
  };
  isAuthorized: boolean;
  complianceIssues: string[];
}
```

---

## 📋 Business Rules

### Carrier Status Workflow
```
PENDING → APPROVED → ACTIVE → INACTIVE
    ↓         ↓         ↓
    └─────────┴─────────┴──→ SUSPENDED → BLACKLISTED
```

### Carrier Tier Criteria
```typescript
const tierCriteria = {
  PLATINUM: {
    minLoads: 100,
    minOnTimeRate: 0.95,
    maxClaimsRatio: 0.01,
    minMonths: 12
  },
  GOLD: {
    minLoads: 50,
    minOnTimeRate: 0.90,
    maxClaimsRatio: 0.02,
    minMonths: 6
  },
  SILVER: {
    minLoads: 25,
    minOnTimeRate: 0.85,
    maxClaimsRatio: 0.03,
    minMonths: 3
  },
  BRONZE: {
    minLoads: 10,
    minOnTimeRate: 0,
    maxClaimsRatio: 1,
    minMonths: 0
  },
  UNQUALIFIED: {
    minLoads: 0,
    minOnTimeRate: 0,
    maxClaimsRatio: 1,
    minMonths: 0
  }
};
```

### Insurance Minimums
```typescript
const insuranceMinimums = {
  AUTO_LIABILITY: 1000000,    // $1,000,000
  CARGO: 100000,              // $100,000
  GENERAL_LIABILITY: 500000,  // $500,000 (optional)
  WORKERS_COMP: 'Statutory'   // Required if >0 employees
};
```

### Compliance Rules
1. **Must have active Auto Liability** ≥ $1,000,000
2. **Must have active Cargo insurance** ≥ $100,000
3. **FMCSA Operating Status** must be "AUTHORIZED"
4. **No Out-of-Service** orders
5. **Documents**: W9, Carrier Agreement required for approval

### Document Expiration Alerts
- **30 days before**: Warning alert
- **14 days before**: Urgent alert
- **Expired**: Critical alert, carrier flagged

### FMCSA Check Frequency
- Initial onboarding: Required
- Periodic: Every 30 days for active carriers
- On load assignment: If last check > 24 hours

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `carrier.created` | POST /carriers | `{ carrierId, dotNumber, name, tenantId }` |
| `carrier.updated` | PUT /carriers/:id | `{ carrierId, changes, tenantId }` |
| `carrier.approved` | POST /carriers/:id/approve | `{ carrierId, approvedBy, tenantId }` |
| `carrier.suspended` | POST /carriers/:id/suspend | `{ carrierId, reason, tenantId }` |
| `carrier.blacklisted` | POST /carriers/:id/blacklist | `{ carrierId, reason, tenantId }` |
| `carrier.tier.changed` | PATCH /carriers/:id/tier | `{ carrierId, oldTier, newTier, tenantId }` |
| `carrier.insurance.expiring` | Scheduled check | `{ carrierId, insuranceId, expirationDate, tenantId }` |
| `carrier.insurance.expired` | Scheduled check | `{ carrierId, insuranceId, tenantId }` |
| `carrier.document.expiring` | Scheduled check | `{ carrierId, documentId, expirationDate, tenantId }` |
| `carrier.document.expired` | Scheduled check | `{ carrierId, documentId, tenantId }` |
| `carrier.fmcsa.checked` | POST /carriers/:id/fmcsa-check | `{ carrierId, isCompliant, issues, tenantId }` |
| `carrier.compliance.issue` | FMCSA check failure | `{ carrierId, issues, tenantId }` |
| `driver.created` | POST /carriers/:id/drivers | `{ driverId, carrierId, tenantId }` |
| `driver.status.changed` | PATCH /drivers/:id/status | `{ driverId, oldStatus, newStatus, tenantId }` |

---

## 🔌 External Integrations

### FMCSA SAFER Web Services

The FMCSA SAFER system provides carrier verification data.

#### Lookup by DOT Number
```typescript
interface FmcsaService {
  async lookupByDot(dotNumber: string): Promise<FmcsaCarrierData>;
  async lookupByMc(mcNumber: string): Promise<FmcsaCarrierData>;
  async getCarrierSafetyData(dotNumber: string): Promise<FmcsaSafetyData>;
}

// Implementation notes:
// - Base URL: https://mobile.fmcsa.dot.gov/qc/services/carriers
// - API Key required (environment variable: FMCSA_API_KEY)
// - Rate limited: 100 requests/minute
// - Cache responses for 24 hours
```

#### Mock Service for Development
```typescript
@Injectable()
export class FmcsaServiceMock implements FmcsaService {
  async lookupByDot(dotNumber: string): Promise<FmcsaCarrierData> {
    // Return mock data for development/testing
    return {
      dotNumber,
      mcNumber: 'MC' + dotNumber.substring(0, 6),
      legalName: 'Test Carrier ' + dotNumber,
      operatingStatus: 'AUTHORIZED',
      safetyRating: 'SATISFACTORY',
      // ... etc
    };
  }
}
```

---

## 🧪 Integration Test Requirements

### Carrier Tests
```typescript
describe('Carriers API', () => {
  describe('GET /api/v1/carriers', () => {
    it('should return paginated carriers');
    it('should filter by status');
    it('should filter by tier');
    it('should search by name/MC/DOT');
    it('should filter by equipment types');
    it('should filter by state');
    it('should filter carriers with expired insurance');
    it('should isolate by tenant');
  });

  describe('POST /api/v1/carriers', () => {
    it('should create carrier with valid data');
    it('should validate DOT number uniqueness');
    it('should validate MC number uniqueness');
    it('should validate required fields');
    it('should create with contacts');
    it('should create with insurance');
    it('should publish carrier.created event');
  });

  describe('PUT /api/v1/carriers/:id', () => {
    it('should update carrier');
    it('should not update blacklisted carrier');
    it('should not update other tenant carrier');
  });

  describe('POST /api/v1/carriers/:id/approve', () => {
    it('should approve pending carrier');
    it('should require W9 document');
    it('should require carrier agreement');
    it('should require valid insurance');
    it('should run FMCSA check');
    it('should publish carrier.approved event');
  });

  describe('POST /api/v1/carriers/:id/suspend', () => {
    it('should suspend active carrier');
    it('should require reason');
    it('should publish carrier.suspended event');
    it('should cancel pending load assignments');
  });

  describe('POST /api/v1/carriers/:id/fmcsa-check', () => {
    it('should fetch FMCSA data');
    it('should update carrier with FMCSA data');
    it('should identify compliance issues');
    it('should log check result');
    it('should publish compliance event if issues');
  });
});
```

### Contact Tests
```typescript
describe('Carrier Contacts API', () => {
  describe('POST /api/v1/carriers/:id/contacts', () => {
    it('should add contact to carrier');
    it('should validate required fields');
    it('should only allow one primary contact');
  });

  describe('PUT /api/v1/carriers/:id/contacts/:contactId', () => {
    it('should update contact');
    it('should validate carrier ownership');
  });

  describe('DELETE /api/v1/carriers/:id/contacts/:contactId', () => {
    it('should soft delete contact');
    it('should not delete primary contact if only one');
  });
});
```

### Driver Tests
```typescript
describe('Drivers API', () => {
  describe('POST /api/v1/carriers/:id/drivers', () => {
    it('should add driver to carrier');
    it('should validate license number');
    it('should validate CDL class');
  });

  describe('GET /api/v1/drivers', () => {
    it('should list all tenant drivers');
    it('should filter by carrier');
    it('should filter by status');
  });

  describe('PATCH /api/v1/drivers/:id/status', () => {
    it('should update driver status');
    it('should publish driver.status.changed event');
  });
});
```

### Insurance Tests
```typescript
describe('Carrier Insurance API', () => {
  describe('POST /api/v1/carriers/:id/insurance', () => {
    it('should add insurance certificate');
    it('should validate coverage amount');
    it('should validate dates');
  });

  describe('PUT /api/v1/carriers/:id/insurance/:insuranceId', () => {
    it('should update insurance');
    it('should recalculate compliance status');
  });

  describe('Expiration Handling', () => {
    it('should flag carriers with expiring insurance');
    it('should flag carriers with expired insurance');
    it('should publish insurance.expiring event');
  });
});
```

### Compliance Tests
```typescript
describe('Carrier Compliance', () => {
  it('should check insurance minimums');
  it('should verify FMCSA authorization');
  it('should check for out-of-service orders');
  it('should require W9 for approval');
  it('should require carrier agreement for approval');
  it('should block load assignment for non-compliant carriers');
});
```

### Tenant Isolation Tests
```typescript
describe('Tenant Isolation', () => {
  it('should not return carriers from other tenants');
  it('should not allow updating other tenant carriers');
  it('should not allow accessing other tenant documents');
  it('should include tenantId in all queries');
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/carrier/
├── carrier.module.ts
├── carriers/
│   ├── carriers.controller.ts
│   ├── carriers.service.ts
│   └── dto/
│       ├── create-carrier.dto.ts
│       ├── update-carrier.dto.ts
│       └── carrier-query.dto.ts
├── contacts/
│   ├── carrier-contacts.controller.ts
│   ├── carrier-contacts.service.ts
│   └── dto/
│       ├── create-carrier-contact.dto.ts
│       └── update-carrier-contact.dto.ts
├── drivers/
│   ├── drivers.controller.ts
│   ├── drivers.service.ts
│   └── dto/
│       ├── create-driver.dto.ts
│       └── update-driver.dto.ts
├── insurance/
│   ├── insurance.controller.ts
│   ├── insurance.service.ts
│   └── dto/
│       ├── create-insurance.dto.ts
│       └── update-insurance.dto.ts
├── documents/
│   ├── carrier-documents.controller.ts
│   └── carrier-documents.service.ts
├── fmcsa/
│   ├── fmcsa.service.ts
│   ├── fmcsa.mock.service.ts
│   └── fmcsa.types.ts
├── compliance/
│   ├── compliance.service.ts
│   └── compliance.types.ts
├── performance/
│   ├── performance.service.ts
│   └── performance.types.ts
└── events/
    ├── carrier-created.event.ts
    ├── carrier-approved.event.ts
    ├── carrier-tier-changed.event.ts
    └── insurance-expiring.event.ts
```

---

## ✅ Completion Checklist

Before marking this prompt complete:

- [ ] All 40 endpoints implemented
- [ ] All DTOs with validation
- [ ] All business rules enforced
- [ ] FMCSA integration (or mock) working
- [ ] Insurance expiration tracking
- [ ] Document compliance tracking
- [ ] Tier calculation logic
- [ ] All events publishing correctly
- [ ] All integration tests passing
- [ ] Tenant isolation verified
- [ ] API documentation updated (Swagger)

---

## 📊 Progress Tracker Update

After completing this service, update `progress-tracker.html`:

### Update Service Row
```html
<tr>
    <td>5</td>
    <td>Carrier</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>40/40</td>
    <td>7/7</td>
    <td>100%</td>
    <td>Carriers, Contacts, Drivers, Insurance, FMCSA</td>
</tr>
```

### Update Dashboard Stats
```html
<div class="stat-card">
    <div class="label">API Endpoints</div>
    <div class="value">510</div>  <!-- 470 + 40 -->
    <div class="sub">of ~985 planned (51.8%)</div>
</div>
```

### Add Changelog Entry
```html
<div class="log-entry">
    <div class="log-date">January XX, 2026 - Carrier API Complete</div>
    <ul class="log-items">
        <li>Implemented 40 Carrier API endpoints</li>
        <li>Carrier CRUD with status and tier management</li>
        <li>Contact management with role assignment</li>
        <li>Driver management with CDL tracking</li>
        <li>Insurance certificate tracking with expiration alerts</li>
        <li>Document management with approval workflow</li>
        <li>FMCSA SAFER integration for carrier verification</li>
        <li>Compliance checking and scorecard</li>
        <li>Full integration test coverage</li>
    </ul>
</div>
```

---

## 🔜 Next Step

After completing this prompt, proceed to:

➡️ **[03-credit-api.md](./03-credit-api.md)** - Implement Credit Service API

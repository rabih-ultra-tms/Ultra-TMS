# 11 - Safety Service API Implementation

> **Service:** Safety & Compliance  
> **Priority:** P1 - High  
> **Endpoints:** 40  
> **Dependencies:** TMS Core ✅ (01), Carrier ✅ (02), Documents ✅  
> **Doc Reference:** [36-service-safety.md](../../02-services/36-service-safety.md)

---

## 📋 Overview

FMCSA integration and safety management service for carrier compliance verification, CSA score monitoring, driver qualification file (DQF) management, insurance tracking, and safety incident management. Ensures all carriers meet federal safety standards and maintains compliance documentation.

### Key Capabilities
- FMCSA SAFER integration for carrier verification
- CSA score monitoring across 7 BASICs
- Driver qualification file (DQF) management
- Insurance tracking and verification
- Safety incident and violation tracking
- Internal carrier safety scoring
- Carrier watchlist management
- Compliance alerts and notifications

---

## ✅ Pre-Implementation Checklist

- [ ] Carrier service is working (carrier lookup)
- [ ] Documents service is working (for DQF documents)
- [ ] FMCSA API credentials configured
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### FmcsaCarrierRecord Model
```prisma
model FmcsaCarrierRecord {
  id                String            @id @default(cuid())
  tenantId          String
  carrierId         String
  
  // FMCSA Identifiers
  dotNumber         String
  mcNumber          String?
  mxNumber          String?
  ffNumber          String?
  
  // Company Information
  legalName         String
  dbaName           String?
  physicalAddress   Json?
  mailingAddress    Json?
  phone             String?
  
  // Operating Authority
  commonAuthorityStatus   String?      // ACTIVE, INACTIVE, NOT_AUTH
  contractAuthorityStatus String?
  brokerAuthorityStatus   String?
  
  // MCS-150 Data
  mcs150Date        DateTime?
  mcs150Mileage     Int?
  mcs150MileageYear Int?
  
  // Fleet Information
  powerUnits        Int?
  drivers           Int?
  
  // Operation Classification
  carrierOperation         String[]
  operationClassification  String[]
  cargoCarried            String[]
  
  // Safety Rating
  safetyRating      String?           // SATISFACTORY, CONDITIONAL, UNSATISFACTORY
  safetyRatingDate  DateTime?
  safetyReviewDate  DateTime?
  safetyReviewType  String?
  
  // OOS Information
  oosDate           DateTime?
  oosReason         String?           @db.Text
  
  // Fetch Metadata
  lastFetchedAt     DateTime
  nextRefreshAt     DateTime?
  fetchSource       String            @default("SAFER")
  rawResponse       Json?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  csaScores         CsaScore[]
  
  @@unique([tenantId, dotNumber])
  @@index([carrierId])
}
```

### CsaScore Model
```prisma
model CsaScore {
  id                String            @id @default(cuid())
  tenantId          String
  carrierId         String
  fmcsaRecordId     String?
  
  scoreDate         DateTime
  
  // BASIC Scores (0-100, higher is worse)
  unsafeDrivingScore         Decimal?  @db.Decimal(5,2)
  unsafeDrivingPercentile    Int?
  unsafeDrivingAlert         Boolean   @default(false)
  
  hoursOfServiceScore        Decimal?  @db.Decimal(5,2)
  hoursOfServicePercentile   Int?
  hoursOfServiceAlert        Boolean   @default(false)
  
  driverFitnessScore         Decimal?  @db.Decimal(5,2)
  driverFitnessPercentile    Int?
  driverFitnessAlert         Boolean   @default(false)
  
  controlledSubstancesScore  Decimal?  @db.Decimal(5,2)
  controlledSubstancesPercentile Int?
  controlledSubstancesAlert  Boolean   @default(false)
  
  vehicleMaintenanceScore    Decimal?  @db.Decimal(5,2)
  vehicleMaintenancePercentile Int?
  vehicleMaintenanceAlert    Boolean   @default(false)
  
  hazmatComplianceScore      Decimal?  @db.Decimal(5,2)
  hazmatCompliancePercentile Int?
  hazmatComplianceAlert      Boolean   @default(false)
  
  crashIndicatorScore        Decimal?  @db.Decimal(5,2)
  crashIndicatorPercentile   Int?
  
  // Summary
  totalInspections  Int?
  totalViolations   Int?
  totalCrashes      Int?
  oosRate           Decimal?          @db.Decimal(5,2)
  
  fetchedAt         DateTime
  source            String            @default("SMS")
  rawResponse       Json?
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  fmcsaRecord       FmcsaCarrierRecord? @relation(fields: [fmcsaRecordId], references: [id])
  
  @@unique([tenantId, carrierId, scoreDate])
  @@index([carrierId])
}
```

### CarrierInsurance Model
```prisma
model CarrierInsurance {
  id                String            @id @default(cuid())
  tenantId          String
  carrierId         String
  
  insuranceType     InsuranceType
  policyNumber      String?
  insuranceCompany  String
  insuranceCompanyNaic String?
  
  coverageAmount    Decimal           @db.Decimal(15,2)
  deductible        Decimal?          @db.Decimal(15,2)
  
  effectiveDate     DateTime
  expirationDate    DateTime
  
  certificateNumber String?
  certificateHolder String?
  additionalInsured Boolean           @default(false)
  
  // Verification
  verificationStatus VerificationStatus @default(PENDING)
  verifiedAt        DateTime?
  verifiedBy        String?
  verificationMethod String?
  verificationNotes String?           @db.Text
  
  // FMCSA Filing
  fmcsaRequired     Boolean           @default(true)
  fmcsaFilingStatus String?
  fmcsaEffectiveDate DateTime?
  fmcsaCancellationDate DateTime?
  
  documentId        String?
  
  expirationAlertSent Boolean         @default(false)
  expirationAlertDate DateTime?
  
  status            String            @default("ACTIVE")
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  createdBy         String?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  
  @@index([carrierId])
  @@index([expirationDate])
}

enum InsuranceType {
  AUTO_LIABILITY
  CARGO
  GENERAL_LIABILITY
  WORKERS_COMP
}

enum VerificationStatus {
  PENDING
  VERIFIED
  EXPIRED
  INVALID
}
```

### DriverQualificationFile Model
```prisma
model DriverQualificationFile {
  id                String            @id @default(cuid())
  tenantId          String
  carrierId         String
  driverId          String?
  
  // Driver Information
  driverFirstName   String
  driverLastName    String
  driverLicenseNumber String
  driverLicenseState String
  driverLicenseClass String?
  driverLicenseExpiration DateTime?
  
  endorsements      String[]
  restrictions      String[]
  
  // Employment
  hireDate          DateTime?
  terminationDate   DateTime?
  employmentStatus  String            @default("ACTIVE")
  
  // Medical Certificate
  medicalCardNumber String?
  medicalCardExpiration DateTime?
  medicalExaminerName String?
  medicalExaminerRegistryNumber String?
  
  // Drug & Alcohol
  lastDrugTestDate  DateTime?
  drugTestResult    String?
  drugTestType      String?
  clearinghouseQueryDate DateTime?
  clearinghouseStatus String?
  
  // MVR
  lastMvrDate       DateTime?
  mvrStatus         String?
  mvrViolations     Int               @default(0)
  
  // Training
  safetyTrainingDate DateTime?
  hazmatTrainingDate DateTime?
  
  // Compliance
  complianceStatus  ComplianceStatus  @default(INCOMPLETE)
  missingDocuments  String[]
  nextReviewDate    DateTime?
  
  documents         Json              @default("[]")
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  createdBy         String?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  incidents         SafetyIncident[]
  
  @@index([carrierId])
  @@index([complianceStatus])
}

enum ComplianceStatus {
  COMPLETE
  INCOMPLETE
  EXPIRED
}
```

### SafetyIncident Model
```prisma
model SafetyIncident {
  id                String            @id @default(cuid())
  tenantId          String
  carrierId         String
  loadId            String?
  driverId          String?
  dqfId             String?
  
  incidentType      IncidentType
  incidentSubtype   String?
  severity          IncidentSeverity
  
  incidentNumber    String?
  incidentDate      DateTime
  incidentTime      DateTime?
  incidentLocation  String?
  incidentState     String?
  incidentDescription String?         @db.Text
  
  // Accident Fields
  dotRecordable     Boolean?
  fatalities        Int               @default(0)
  injuries          Int               @default(0)
  towAway           Boolean?
  hazmatRelease     Boolean?
  
  // Inspection Fields
  inspectionLevel   Int?
  roadsideInspectionNumber String?
  inspectionResult  String?
  violationsCount   Int               @default(0)
  driverOos         Boolean?
  vehicleOos        Boolean?
  
  // Investigation
  investigationStatus InvestigationStatus @default(OPEN)
  investigatorId    String?
  investigationNotes String?          @db.Text
  rootCause         String?
  correctiveAction  String?           @db.Text
  closedAt          DateTime?
  closedBy          String?
  
  // Financial
  estimatedCost     Decimal?          @db.Decimal(15,2)
  insuranceClaimNumber String?
  
  documents         Json              @default("[]")
  
  source            String            @default("MANUAL")
  fmcsaReportNumber String?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  createdBy         String?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  load              Load?             @relation(fields: [loadId], references: [id])
  dqf               DriverQualificationFile? @relation(fields: [dqfId], references: [id])
  violations        IncidentViolation[]
  
  @@index([carrierId])
  @@index([incidentDate])
  @@index([investigationStatus])
}

enum IncidentType {
  ACCIDENT
  VIOLATION
  INSPECTION
  CARGO_DAMAGE
}

enum IncidentSeverity {
  MINOR
  MODERATE
  SEVERE
  FATAL
}

enum InvestigationStatus {
  OPEN
  IN_PROGRESS
  CLOSED
}
```

### CarrierSafetyScore Model
```prisma
model CarrierSafetyScore {
  id                String            @id @default(cuid())
  tenantId          String
  carrierId         String
  
  scoreDate         DateTime
  
  // Component Scores (0-100, higher is better)
  authorityScore    Int?
  insuranceScore    Int?
  csaScore          Int?
  incidentScore     Int?
  complianceScore   Int?
  performanceScore  Int?
  
  overallScore      Int
  riskLevel         RiskLevel
  
  scoringFactors    Json?
  thresholdsVersion String?
  
  autoApprove       Boolean           @default(false)
  requiresReview    Boolean           @default(false)
  recommendations   String[]
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  
  @@unique([tenantId, carrierId, scoreDate])
  @@index([carrierId])
  @@index([riskLevel])
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

### CarrierWatchlist Model
```prisma
model CarrierWatchlist {
  id                String            @id @default(cuid())
  tenantId          String
  carrierId         String
  
  reasonType        WatchlistReason
  reasonDetails     String            @db.Text
  
  riskLevel         RiskLevel
  status            WatchlistStatus   @default(ACTIVE)
  
  actionRequired    String?           @db.Text
  restrictedFromBooking Boolean       @default(false)
  requiresApproval  Boolean           @default(true)
  approvalLevel     String?
  
  resolvedAt        DateTime?
  resolvedBy        String?
  resolutionNotes   String?           @db.Text
  
  expiresAt         DateTime?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  createdBy         String?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  
  @@index([carrierId])
  @@index([status])
}

enum WatchlistReason {
  CSA_ALERT
  INSURANCE_LAPSE
  AUTHORITY_ISSUE
  INCIDENT
  MANUAL
}

enum WatchlistStatus {
  ACTIVE
  RESOLVED
  EXPIRED
}
```

### ComplianceAlert Model
```prisma
model ComplianceAlert {
  id                String            @id @default(cuid())
  tenantId          String
  carrierId         String
  
  alertType         AlertType
  alertSubtype      String?
  
  relatedEntityType String?
  relatedEntityId   String?
  
  alertTitle        String
  alertMessage      String            @db.Text
  
  severity          AlertSeverity
  
  triggerDate       DateTime?
  daysUntilTrigger  Int?
  
  status            AlertStatus       @default(ACTIVE)
  
  acknowledgedAt    DateTime?
  acknowledgedBy    String?
  
  resolvedAt        DateTime?
  resolvedBy        String?
  resolutionNotes   String?           @db.Text
  
  notificationSent  Boolean           @default(false)
  notificationSentAt DateTime?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  carrier           Carrier           @relation(fields: [carrierId], references: [id])
  
  @@index([carrierId])
  @@index([status])
  @@index([triggerDate])
}

enum AlertType {
  INSURANCE_EXPIRING
  AUTHORITY_CHANGE
  CSA_ALERT
  DQF_EXPIRED
}

enum AlertSeverity {
  INFO
  WARNING
  CRITICAL
}

enum AlertStatus {
  ACTIVE
  ACKNOWLEDGED
  RESOLVED
  DISMISSED
}
```

---

## 🛠️ API Endpoints

### FMCSA Lookup (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/safety/fmcsa/lookup` | Lookup carrier by DOT/MC |
| POST | `/api/v1/safety/fmcsa/verify/:carrierId` | Verify carrier authority |
| POST | `/api/v1/safety/fmcsa/refresh/:carrierId` | Refresh FMCSA data |
| GET | `/api/v1/safety/fmcsa/records/:carrierId` | Get FMCSA record |

### CSA Scores (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/safety/csa/:carrierId` | Get current CSA scores |
| GET | `/api/v1/safety/csa/:carrierId/history` | Get score history |
| POST | `/api/v1/safety/csa/:carrierId/refresh` | Refresh CSA scores |

### Insurance (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/safety/insurance` | List insurance records |
| POST | `/api/v1/safety/insurance` | Add insurance record |
| GET | `/api/v1/safety/insurance/:id` | Get insurance details |
| PUT | `/api/v1/safety/insurance/:id` | Update insurance |
| DELETE | `/api/v1/safety/insurance/:id` | Delete insurance |
| POST | `/api/v1/safety/insurance/:id/verify` | Verify insurance |
| GET | `/api/v1/safety/insurance/expiring` | Get expiring insurance |

### Driver Qualification Files (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/safety/dqf` | List DQF records |
| POST | `/api/v1/safety/dqf` | Create DQF record |
| GET | `/api/v1/safety/dqf/:id` | Get DQF details |
| PUT | `/api/v1/safety/dqf/:id` | Update DQF |
| DELETE | `/api/v1/safety/dqf/:id` | Delete DQF |
| GET | `/api/v1/safety/dqf/:id/compliance` | Check compliance |
| POST | `/api/v1/safety/dqf/:id/documents` | Add DQF document |

### Incidents (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/safety/incidents` | List incidents |
| POST | `/api/v1/safety/incidents` | Report incident |
| GET | `/api/v1/safety/incidents/:id` | Get incident |
| PUT | `/api/v1/safety/incidents/:id` | Update incident |
| POST | `/api/v1/safety/incidents/:id/close` | Close investigation |
| GET | `/api/v1/safety/incidents/:id/violations` | Get violations |

### Safety Scores (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/safety/scores/:carrierId` | Get safety score |
| GET | `/api/v1/safety/scores/:carrierId/history` | Score history |
| POST | `/api/v1/safety/scores/calculate` | Recalculate scores |

### Watchlist (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/safety/watchlist` | List watchlist |
| POST | `/api/v1/safety/watchlist` | Add to watchlist |
| PUT | `/api/v1/safety/watchlist/:id` | Update entry |
| POST | `/api/v1/safety/watchlist/:id/resolve` | Resolve entry |

### Alerts (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/safety/alerts` | List alerts |
| GET | `/api/v1/safety/alerts/:id` | Get alert |
| POST | `/api/v1/safety/alerts/:id/acknowledge` | Acknowledge |
| POST | `/api/v1/safety/alerts/:id/dismiss` | Dismiss |
| POST | `/api/v1/safety/alerts/:id/resolve` | Resolve |

### Reports (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/safety/reports/compliance` | Compliance summary |
| GET | `/api/v1/safety/reports/incidents` | Incident report |
| GET | `/api/v1/safety/reports/expiring` | Expiring docs |

---

## 📝 DTO Specifications

### FmcsaLookupDto
```typescript
export class FmcsaLookupDto {
  @IsOptional()
  @IsString()
  dotNumber?: string;

  @IsOptional()
  @IsString()
  mcNumber?: string;

  @ValidateIf(o => !o.dotNumber && !o.mcNumber)
  @IsNotEmpty({ message: 'Either DOT or MC number is required' })
  placeholder?: never;
}
```

### CreateInsuranceDto
```typescript
export class CreateInsuranceDto {
  @IsString()
  carrierId: string;

  @IsEnum(InsuranceType)
  insuranceType: InsuranceType;

  @IsString()
  insuranceCompany: string;

  @IsOptional()
  @IsString()
  policyNumber?: string;

  @IsNumber()
  @Min(0)
  coverageAmount: number;

  @IsDate()
  @Type(() => Date)
  effectiveDate: Date;

  @IsDate()
  @Type(() => Date)
  expirationDate: Date;

  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @IsOptional()
  @IsBoolean()
  additionalInsured?: boolean;
}
```

### CreateDqfDto
```typescript
export class CreateDqfDto {
  @IsString()
  carrierId: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsString()
  driverFirstName: string;

  @IsString()
  driverLastName: string;

  @IsString()
  driverLicenseNumber: string;

  @IsString()
  @Length(2, 2)
  driverLicenseState: string;

  @IsOptional()
  @IsString()
  driverLicenseClass?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  driverLicenseExpiration?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  endorsements?: string[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  hireDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  medicalCardExpiration?: Date;
}
```

### CreateIncidentDto
```typescript
export class CreateIncidentDto {
  @IsString()
  carrierId: string;

  @IsOptional()
  @IsString()
  loadId?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsEnum(IncidentType)
  incidentType: IncidentType;

  @IsOptional()
  @IsString()
  incidentSubtype?: string;

  @IsEnum(IncidentSeverity)
  severity: IncidentSeverity;

  @IsDate()
  @Type(() => Date)
  incidentDate: Date;

  @IsOptional()
  @IsString()
  incidentLocation?: string;

  @IsOptional()
  @IsString()
  incidentDescription?: string;

  // Accident-specific
  @IsOptional()
  @IsBoolean()
  dotRecordable?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  fatalities?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  injuries?: number;
}
```

### AddToWatchlistDto
```typescript
export class AddToWatchlistDto {
  @IsString()
  carrierId: string;

  @IsEnum(WatchlistReason)
  reasonType: WatchlistReason;

  @IsString()
  reasonDetails: string;

  @IsEnum(RiskLevel)
  riskLevel: RiskLevel;

  @IsOptional()
  @IsString()
  actionRequired?: string;

  @IsOptional()
  @IsBoolean()
  restrictedFromBooking?: boolean;

  @IsOptional()
  @IsString()
  approvalLevel?: string;
}
```

---

## 📋 Business Rules

### CSA Alert Thresholds
```typescript
const csaAlertThresholds = {
  unsafeDriving: 65,
  hoursOfService: 65,
  driverFitness: 80,
  controlledSubstances: 80,
  vehicleMaintenance: 80,
  hazmatCompliance: 80,
  crashIndicator: 65
};

// Action rules
const alertActions = {
  1: 'ALERT',       // 1 BASIC in alert
  2: 'WATCHLIST',   // 2+ BASICs in alert
  3: 'BLOCK'        // 3+ BASICs in alert
};
```

### Insurance Requirements
```typescript
const minimumCoverage = {
  AUTO_LIABILITY: 1000000,  // $1M
  CARGO: 100000,            // $100K (configurable per customer)
  GENERAL_LIABILITY: 1000000,
  WORKERS_COMP: 500000
};
```

### Safety Score Calculation
```typescript
function calculateSafetyScore(carrier: Carrier): number {
  const weights = {
    authority: 0.20,
    insurance: 0.20,
    csa: 0.25,
    incidents: 0.20,
    compliance: 0.10,
    performance: 0.05
  };
  
  return Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (carrier.scores[key] * weight);
  }, 0);
}
```

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `safety.carrier.verified` | FMCSA verify | `{ carrierId, status }` |
| `safety.authority.changed` | Authority change | `{ carrierId, old, new }` |
| `safety.csa.updated` | CSA refresh | `{ carrierId, scores }` |
| `safety.csa.alert` | Threshold crossed | `{ carrierId, basic, score }` |
| `safety.insurance.expiring` | 30 days out | `{ carrierId, days }` |
| `safety.insurance.expired` | Expiration | `{ carrierId, insuranceId }` |
| `safety.dqf.compliance_changed` | Status change | `{ dqfId, status }` |
| `safety.incident.reported` | New incident | `{ incidentId, type }` |
| `safety.score.updated` | Score calc | `{ carrierId, score }` |
| `safety.watchlist.added` | Added | `{ carrierId, reason }` |
| `safety.alert.created` | New alert | `{ alertId, type }` |

---

## 🔔 Events to Subscribe

| Event | Source | Action |
|-------|--------|--------|
| `carrier.created` | Carrier | Initiate FMCSA verification |
| `carrier.activated` | Carrier | Verify insurance current |
| `load.carrier_assigned` | TMS Core | Verify compliance |
| `scheduler.daily` | Scheduler | Check expiring items |
| `scheduler.weekly` | Scheduler | Refresh CSA scores |

---

## 🧪 Integration Test Requirements

```typescript
describe('Safety Service API', () => {
  describe('FMCSA Lookup', () => {
    it('should lookup carrier by DOT number');
    it('should lookup carrier by MC number');
    it('should verify carrier authority');
    it('should refresh FMCSA data');
  });

  describe('CSA Scores', () => {
    it('should retrieve current CSA scores');
    it('should detect alert thresholds');
    it('should track score history');
  });

  describe('Insurance', () => {
    it('should create insurance record');
    it('should verify insurance');
    it('should detect expiring insurance');
    it('should enforce minimum coverage');
  });

  describe('DQF', () => {
    it('should create driver qualification file');
    it('should check compliance status');
    it('should track missing documents');
  });

  describe('Incidents', () => {
    it('should report safety incident');
    it('should close investigation');
    it('should track violations');
  });

  describe('Watchlist', () => {
    it('should add carrier to watchlist');
    it('should restrict from booking');
    it('should resolve watchlist entry');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/safety/
├── safety.module.ts
├── fmcsa/
│   ├── fmcsa.controller.ts
│   ├── fmcsa.service.ts
│   ├── fmcsa-api.client.ts
│   └── dto/
├── csa/
│   ├── csa.controller.ts
│   ├── csa.service.ts
│   └── dto/
├── insurance/
│   ├── insurance.controller.ts
│   ├── insurance.service.ts
│   └── dto/
├── dqf/
│   ├── dqf.controller.ts
│   ├── dqf.service.ts
│   └── dto/
├── incidents/
│   ├── incidents.controller.ts
│   ├── incidents.service.ts
│   └── dto/
├── scores/
│   ├── safety-scores.controller.ts
│   ├── safety-scores.service.ts
│   └── scoring.engine.ts
├── watchlist/
│   ├── watchlist.controller.ts
│   └── watchlist.service.ts
├── alerts/
│   ├── alerts.controller.ts
│   └── alerts.service.ts
└── reports/
    └── safety-reports.controller.ts
```

---

## ✅ Completion Checklist

- [ ] All 40 endpoints implemented
- [ ] FMCSA API integration working
- [ ] CSA score retrieval and alerting
- [ ] Insurance management complete
- [ ] DQF tracking with compliance
- [ ] Incident reporting and investigation
- [ ] Safety scoring algorithm
- [ ] Watchlist management
- [ ] Alert system working
- [ ] All integration tests passing
- [ ] Tenant isolation verified

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>24</td>
    <td>Safety</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>40/40</td>
    <td>8/8</td>
    <td>100%</td>
    <td>FMCSA, CSA, Insurance, DQF, Incidents, Scores, Watchlist, Alerts</td>
</tr>
```

---

## 🔜 Next Step

➡️ **[12-load-board-external-api.md](./12-load-board-external-api.md)** - Implement Load Board External API

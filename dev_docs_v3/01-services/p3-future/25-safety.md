# Service Hub: Safety (25)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Safety service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/25-safety/` (11 files)
> **v2 hub (historical):** N/A — new in v3

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Confidence** | High — controllers verified, Prisma models confirmed 2026-03-07 |
| **Last Verified** | 2026-03-07 |
| **Backend** | Built — 9 controllers, 43 endpoints in `apps/api/src/modules/safety/` |
| **Frontend** | Not Built — no pages, no components, no hooks |
| **Tests** | Partial — spec files exist for each sub-module service (7 spec files), 0 frontend |
| **Priority** | P3 Future — FMCSA safety compliance, CSA scores, driver qualification |
| **Active Blockers** | Full frontend build required; no UI exists |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Safety service definition in dev_docs |
| Design Specs | Done | 11 files in `dev_docs/12-Rabih-design-Process/25-safety/` |
| Backend — Alerts | Built | `safety/alerts/` — create, list, get, acknowledge, dismiss, resolve |
| Backend — CSA | Built | `safety/csa/` — get current scores, history, refresh from FMCSA |
| Backend — DQF | Built | `safety/dqf/` — CRUD + compliance check + document attachment |
| Backend — FMCSA | Built | `safety/fmcsa/` — lookup, verify, refresh, get record |
| Backend — Incidents | Built | `safety/incidents/` — CRUD + close + violations |
| Backend — Insurance | Built | `safety/insurance/` — CRUD + expiring list + verify |
| Backend — Reports | Built | `safety/reports/` — compliance, incidents, expiring reports |
| Backend — Scores | Built | `safety/scores/` — get score, history, calculate (scoring engine) |
| Backend — Watchlist | Built | `safety/watchlist/` — CRUD + resolve |
| Prisma Models | Production | SafetyAlert, SafetyIncident, SafetyInspection, SafetyAuditTrail, CsaScore, DriverQualificationFile, FmcsaCarrierRecord |
| Frontend Pages | Not Built | 0 pages — all 11 design specs unimplemented |
| React Hooks | Not Built | 0 hooks |
| Components | Not Built | 0 components |
| Tests | Partial | 7 backend spec files; 0 frontend tests |
| Security | Good | All endpoints: JwtAuthGuard + tenantId; RolesGuard on DQF, Incidents, Reports, Scores |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Safety Dashboard | `/safety` | Not Built | — | KPIs, alerts summary, score overview (spec: `01-safety-dashboard.md`) |
| Incidents List | `/safety/incidents` | Not Built | — | Filterable list with status, severity, type (spec: `02-incidents-list.md`) |
| Incident Detail | `/safety/incidents/[id]` | Not Built | — | Full incident record, violations, investigation notes (spec: `03-incident-detail.md`) |
| Incident Report Form | `/safety/incidents/new` | Not Built | — | Multi-step incident creation wizard (spec: `04-incident-report.md`) |
| Safety Inspections | `/safety/inspections` | Not Built | — | DOT inspection records, violation history (spec: `05-safety-inspections.md`) |
| Inspection Form | `/safety/inspections/new` | Not Built | — | Log new inspection result (spec: `06-inspection-form.md`) |
| Driver Safety Scores | `/safety/scores/drivers` | Not Built | — | Per-driver composite scores (spec: `07-driver-safety-scores.md`) |
| CSA Scores | `/safety/csa` | Not Built | — | Carrier CSA BASICs dashboard (spec: `08-csa-scores.md`) |
| Safety Training | `/safety/training` | Not Built | — | Training records and compliance tracking (spec: `09-safety-training.md`) |
| Safety Reports | `/safety/reports` | Not Built | — | Compliance, incident, expiring reports (spec: `10-safety-reports.md`) |
| Safety Alerts | `/safety/alerts` | Not Built | — | Alert feed with acknowledge/dismiss/resolve actions |

---

## 4. API Endpoints

### Alerts Controller (`safety/alerts`) — 6 endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/safety/alerts` | AlertsController | Built | List alerts (filter by isActive) |
| GET | `/api/v1/safety/alerts/:id` | AlertsController | Built | Get alert detail |
| POST | `/api/v1/safety/alerts` | AlertsController | Built | Create alert |
| POST | `/api/v1/safety/alerts/:id/acknowledge` | AlertsController | Built | Acknowledge alert |
| POST | `/api/v1/safety/alerts/:id/dismiss` | AlertsController | Built | Dismiss alert |
| POST | `/api/v1/safety/alerts/:id/resolve` | AlertsController | Built | Resolve with notes |

### CSA Controller (`safety/csa`) — 3 endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/safety/csa/:carrierId` | CsaController | Built | Get current CSA scores |
| GET | `/api/v1/safety/csa/:carrierId/history` | CsaController | Built | CSA score history |
| POST | `/api/v1/safety/csa/:carrierId/refresh` | CsaController | Built | Refresh from FMCSA (ADMIN only) |

### DQF Controller (`safety/dqf`) — 7 endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/safety/dqf` | DqfController | Built | List DQF records |
| POST | `/api/v1/safety/dqf` | DqfController | Built | Create DQF record |
| GET | `/api/v1/safety/dqf/:id` | DqfController | Built | Get DQF detail |
| PUT | `/api/v1/safety/dqf/:id` | DqfController | Built | Update DQF record |
| DELETE | `/api/v1/safety/dqf/:id` | DqfController | Built | Delete DQF record |
| GET | `/api/v1/safety/dqf/:id/compliance` | DqfController | Built | Check DQF compliance status |
| POST | `/api/v1/safety/dqf/:id/documents` | DqfController | Built | Add document to DQF |

### FMCSA Controller (`safety/fmcsa`) — 4 endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/safety/fmcsa/lookup` | FmcsaController | Built | Lookup by MC#/DOT# (query params) |
| POST | `/api/v1/safety/fmcsa/verify/:carrierId` | FmcsaController | Built | Verify FMCSA compliance (ADMIN only) |
| POST | `/api/v1/safety/fmcsa/refresh/:carrierId` | FmcsaController | Built | Refresh FMCSA data (ADMIN only) |
| GET | `/api/v1/safety/fmcsa/records/:carrierId` | FmcsaController | Built | Get stored FMCSA record |

### Incidents Controller (`safety/incidents`) — 6 endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/safety/incidents` | IncidentsController | Built | List incidents (query filters) |
| POST | `/api/v1/safety/incidents` | IncidentsController | Built | Create incident |
| GET | `/api/v1/safety/incidents/:id` | IncidentsController | Built | Get incident detail |
| PUT | `/api/v1/safety/incidents/:id` | IncidentsController | Built | Update incident (ADMIN/SAFETY_MANAGER) |
| POST | `/api/v1/safety/incidents/:id/close` | IncidentsController | Built | Close incident with resolution |
| GET | `/api/v1/safety/incidents/:id/violations` | IncidentsController | Built | Get incident violations |

### Insurance Controller (`safety/insurance`) — 7 endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/safety/insurance` | InsuranceController | Built | List certificates (query filters) |
| POST | `/api/v1/safety/insurance` | InsuranceController | Built | Create certificate |
| GET | `/api/v1/safety/insurance/expiring` | InsuranceController | Built | Expiring certs (default 30 days) |
| GET | `/api/v1/safety/insurance/:id` | InsuranceController | Built | Get certificate detail |
| PUT | `/api/v1/safety/insurance/:id` | InsuranceController | Built | Update certificate |
| DELETE | `/api/v1/safety/insurance/:id` | InsuranceController | Built | Delete certificate (MANAGER/ADMIN) |
| POST | `/api/v1/safety/insurance/:id/verify` | InsuranceController | Built | Verify certificate |

### Reports Controller (`safety/reports`) — 3 endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/safety/reports/compliance` | SafetyReportsController | Built | Full compliance report |
| GET | `/api/v1/safety/reports/incidents` | SafetyReportsController | Built | Incident summary report |
| GET | `/api/v1/safety/reports/expiring` | SafetyReportsController | Built | Expiring compliance report |

### Scores Controller (`safety/scores`) — 3 endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/safety/scores/:carrierId` | SafetyScoresController | Built | Get composite safety score |
| GET | `/api/v1/safety/scores/:carrierId/history` | SafetyScoresController | Built | Score trend history |
| POST | `/api/v1/safety/scores/calculate` | SafetyScoresController | Built | Recalculate scores (ADMIN/SAFETY_MANAGER) |

### Watchlist Controller (`safety/watchlist`) — 4 endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/safety/watchlist` | WatchlistController | Built | List watchlist entries |
| POST | `/api/v1/safety/watchlist` | WatchlistController | Built | Add to watchlist (ADMIN only) |
| PUT | `/api/v1/safety/watchlist/:id` | WatchlistController | Built | Update watchlist entry |
| POST | `/api/v1/safety/watchlist/:id/resolve` | WatchlistController | Built | Resolve watchlist entry (ADMIN only) |

---

## 5. Components

No frontend components exist. Planned components (based on design specs):

| Component | Planned Path | Status |
|-----------|-------------|--------|
| SafetyDashboardKPIs | `components/safety/safety-dashboard-kpis.tsx` | Not Built |
| SafetyAlertsFeed | `components/safety/safety-alerts-feed.tsx` | Not Built |
| CsaScoresChart | `components/safety/csa-scores-chart.tsx` | Not Built |
| CsaBasicCard | `components/safety/csa-basic-card.tsx` | Not Built |
| IncidentForm | `components/safety/incident-form.tsx` | Not Built |
| IncidentTimeline | `components/safety/incident-timeline.tsx` | Not Built |
| InspectionTable | `components/safety/inspection-table.tsx` | Not Built |
| DqfChecklist | `components/safety/dqf-checklist.tsx` | Not Built |
| DqfComplianceBadge | `components/safety/dqf-compliance-badge.tsx` | Not Built |
| InsuranceExpiryTracker | `components/safety/insurance-expiry-tracker.tsx` | Not Built |
| SafetyScoreGauge | `components/safety/safety-score-gauge.tsx` | Not Built |
| WatchlistTable | `components/safety/watchlist-table.tsx` | Not Built |
| SafetyReportViewer | `components/safety/safety-report-viewer.tsx` | Not Built |

---

## 6. Hooks

No hooks exist. Planned hooks (based on API endpoints):

| Hook | Endpoints Used | Status |
|------|---------------|--------|
| `useSafetyAlerts` | GET `/safety/alerts` | Not Built |
| `useSafetyAlert` | GET `/safety/alerts/:id` | Not Built |
| `useCreateAlert` | POST `/safety/alerts` | Not Built |
| `useAcknowledgeAlert` | POST `/safety/alerts/:id/acknowledge` | Not Built |
| `useResolveAlert` | POST `/safety/alerts/:id/resolve` | Not Built |
| `useCsaScores` | GET `/safety/csa/:carrierId` | Not Built |
| `useCsaHistory` | GET `/safety/csa/:carrierId/history` | Not Built |
| `useRefreshCsa` | POST `/safety/csa/:carrierId/refresh` | Not Built |
| `useDqfRecords` | GET `/safety/dqf` | Not Built |
| `useDqfRecord` | GET `/safety/dqf/:id` | Not Built |
| `useDqfCompliance` | GET `/safety/dqf/:id/compliance` | Not Built |
| `useFmcsaLookup` | GET `/safety/fmcsa/lookup` | Not Built |
| `useFmcsaRecord` | GET `/safety/fmcsa/records/:carrierId` | Not Built |
| `useSafetyIncidents` | GET `/safety/incidents` | Not Built |
| `useSafetyIncident` | GET `/safety/incidents/:id` | Not Built |
| `useInsuranceCerts` | GET `/safety/insurance` | Not Built |
| `useExpiringInsurance` | GET `/safety/insurance/expiring` | Not Built |
| `useSafetyReports` | GET `/safety/reports/*` | Not Built |
| `useSafetyScore` | GET `/safety/scores/:carrierId` | Not Built |
| `useSafetyWatchlist` | GET `/safety/watchlist` | Not Built |

---

## 7. Business Rules

1. **CSA Score Monitoring:** The system tracks all 7 FMCSA CSA BASICs per carrier: Unsafe Driving, HOS Compliance, Driver Fitness, Controlled Substances, Vehicle Maintenance, HazMat Compliance, and Crash Indicator. Each BASIC has a percentile score (0-100), a threshold, and an `isAboveThreshold` flag. Scores exceeding the FMCSA intervention threshold trigger an automatic `SafetyAlert` of type `CSA_THRESHOLD_EXCEEDED`. CSA data is refreshable per carrier (ADMIN only) and historical scores are retained for trend analysis.

2. **FMCSA Integration:** The `FmcsaCarrierRecord` model stores a full snapshot of SAFER Web data per carrier (1:1 via `carrierId`). Data includes operating status, authority types (common, contract, broker), DOT/MC numbers, physical/mailing address, power unit count, and driver count. The `fmcsa-api.client.ts` handles external API calls to SAFER Web. Records are cached via `lastSyncedAt` — stale data triggers a refresh. Verification checks operating status against `SaferDataStatus` and flags out-of-service carriers.

3. **Driver Qualification Files (DQF):** Every driver must maintain a compliant DQF containing 8 document types: APPLICATION, MVR (motor vehicle record), PSP (pre-employment screening), MEDICAL_CARD, DRUG_TEST, ROAD_TEST, CLEARINGHOUSE query, and EMPLOYMENT_VERIFICATION. Each document tracks issue date, expiration date, verification status, and Clearinghouse status. The compliance endpoint checks all required documents are present, non-expired, and verified. Expired documents automatically flag the DQF as non-compliant.

4. **Safety Incidents:** Incidents are classified into 5 types: ACCIDENT, CITATION, INSPECTION_VIOLATION, DOT_AUDIT_FINDING, and INSURANCE_CLAIM. Each incident records severity, injuries/fatalities count, out-of-service status, citation numbers, violation codes (JSON), fine amounts, CSA points impact, and investigation notes. Incidents can be linked to a carrier, driver, and/or load. Closing an incident requires a resolution body. Violations on an incident are queryable separately for compliance reporting.

5. **Insurance Tracking:** The safety insurance sub-module provides a centralized view of all carrier insurance certificates across the tenant. Certificates track type, provider, policy number, coverage amount, and expiration. The `GET /safety/insurance/expiring` endpoint returns certificates expiring within N days (default 30). Expiring insurance triggers a `SafetyAlert` of type `INSURANCE_EXPIRING`. Certificates must be verified (via `POST /verify`) before being considered compliant. Deletion is restricted to MANAGER/ADMIN roles.

6. **Watchlist Management:** Carriers or drivers with repeated safety violations, declining CSA scores, or compliance concerns are added to the safety watchlist (ADMIN only). Watchlist entries track the reason, status, and can be updated with notes. Resolution requires ADMIN role and a `ResolveWatchlistDto` with resolution details. Active watchlist entries surface on the Safety Dashboard and may block load assignment depending on severity.

7. **DOT Compliance & Reporting:** Three built-in report endpoints provide aggregate compliance views: (a) `compliance` — overall safety compliance status across all carriers, (b) `incidents` — incident summary with counts by type and severity, (c) `expiring` — upcoming expirations for insurance, DQF documents, and authority. Reports are restricted to ADMIN, SAFETY_MANAGER, and OPERATIONS_MANAGER roles. The `SafetyAuditTrail` model logs all safety-related events (score changes, alert actions, compliance updates) for DOT audit readiness.

8. **Safety Scoring Engine:** A dedicated `scoring.engine.ts` calculates composite safety scores per carrier. Scores combine CSA data, incident history, insurance status, and DQF compliance into a single weighted metric. Score history is retained for trend analysis. Recalculation can be triggered manually via `POST /safety/scores/calculate` (ADMIN/SAFETY_MANAGER). Scores feed into carrier performance evaluation and the carrier watchlist system.

9. **Safety Alerts Lifecycle:** Alerts follow a 4-state lifecycle: ACTIVE (new) -> ACKNOWLEDGED (seen by user) -> RESOLVED (action taken, with notes) or DISMISSED (false positive). Five alert types exist: INSURANCE_EXPIRING, AUTHORITY_EXPIRING, CSA_THRESHOLD_EXCEEDED, OUT_OF_SERVICE, VIOLATION_PATTERN. Alerts can be linked to a carrier and/or a related entity (via `relatedEntityType` + `relatedEntityId`). All state transitions are audited.

---

## 8. Data Model

### SafetyAlert
```
SafetyAlert {
  id                String          @id @default(uuid())
  tenantId          String
  carrierId         String?         (FK -> Carrier)
  alertType         SafetyAlertType (INSURANCE_EXPIRING, AUTHORITY_EXPIRING, CSA_THRESHOLD_EXCEEDED, OUT_OF_SERVICE, VIOLATION_PATTERN)
  alertMessage      String
  severity          String          (VarChar 50)
  relatedEntityType String?         (VarChar 50)
  relatedEntityId   String?
  isActive          Boolean         (default: true)
  acknowledgedAt    DateTime?
  acknowledgedById  String?
  resolvedAt        DateTime?
  resolvedById      String?
  resolutionNotes   String?
  externalId        String?
  sourceSystem      String?
  customFields      Json            (default: "{}")
  createdAt         DateTime
  updatedAt         DateTime
  deletedAt         DateTime?
  createdById       String?
  updatedById       String?
}
```

### SafetyIncident
```
SafetyIncident {
  id                 String             @id @default(uuid())
  tenantId           String
  carrierId          String?            (FK -> Carrier)
  driverId           String?            (FK -> Driver)
  loadId             String?            (FK -> Load)
  incidentType       SafetyIncidentType (ACCIDENT, CITATION, INSPECTION_VIOLATION, DOT_AUDIT_FINDING, INSURANCE_CLAIM)
  incidentDate       DateTime
  location           String?
  description        String
  severity           String?
  injuriesCount      Int                (default: 0)
  fatalitiesCount    Int                (default: 0)
  wasOutOfService    Boolean            (default: false)
  oosReason          String?
  citationNumber     String?
  violationCodes     Json?
  fineAmount         Decimal?
  investigationNotes String?
  reportUrl          String?
  csaPoints          Decimal?
  externalId         String?
  sourceSystem       String?
  customFields       Json               (default: "{}")
  createdAt          DateTime
  updatedAt          DateTime
  deletedAt          DateTime?
}
```

### SafetyInspection
```
SafetyInspection {
  id                 String    @id @default(uuid())
  tenantId           String
  carrierId          String?   (FK -> Carrier)
  driverId           String?   (FK -> Driver)
  inspectionNumber   String
  inspectionDate     DateTime
  inspectionLevel    Int?      (1-5, DOT inspection level)
  inspectionState    String?   (2-char state code)
  inspectionLocation String?
  totalViolations    Int       (default: 0)
  oosViolations      Int       (default: 0)
  wasOutOfService    Boolean   (default: false)
  violations         Json?     (structured violation data)
  basicsAffected     Json?     (which CSA BASICs were impacted)
  reportNumber       String?
  reportUrl          String?
  externalId         String?
  sourceSystem       String?
  customFields       Json      (default: "{}")
  createdAt          DateTime
  updatedAt          DateTime
  deletedAt          DateTime?
}
```

### SafetyAuditTrail
```
SafetyAuditTrail {
  id               String    @id @default(uuid())
  tenantId         String
  carrierId        String?   (FK -> Carrier)
  eventType        String    (VarChar 100 — e.g., SCORE_CHANGE, ALERT_RESOLVED, COMPLIANCE_UPDATE)
  eventDescription String
  eventData        Json?
  performedById    String?
  externalId       String?
  sourceSystem     String?
  customFields     Json      (default: "{}")
  createdAt        DateTime
  updatedAt        DateTime
  deletedAt        DateTime?
}
```

### CsaScore
```
CsaScore {
  id                 String       @id @default(uuid())
  tenantId           String
  carrierId          String       (FK -> Carrier)
  fmcsaRecordId      String?      (FK -> FmcsaCarrierRecord)
  basicType          CSABasicType (UNSAFE_DRIVING, HOS_COMPLIANCE, DRIVER_FITNESS, CONTROLLED_SUBSTANCES, VEHICLE_MAINTENANCE, HAZMAT_COMPLIANCE, CRASH_INDICATOR)
  score              Decimal?     (5,2)
  percentile         Int?
  threshold          Int?
  isAboveThreshold   Boolean      (default: false)
  isAlert            Boolean      (default: false)
  inspectionCount    Int          (default: 0)
  violationCount     Int          (default: 0)
  oosViolationCount  Int          (default: 0)
  measurementPeriod  String?      (e.g., "24 months")
  asOfDate           DateTime
  externalId         String?
  sourceSystem       String?
  customFields       Json         (default: "{}")
  createdAt          DateTime
  updatedAt          DateTime
  deletedAt          DateTime?
}
```

### DriverQualificationFile
```
DriverQualificationFile {
  id                  String          @id @default(uuid())
  tenantId            String
  driverId            String          (FK -> Driver)
  documentType        DQFDocumentType (APPLICATION, MVR, PSP, MEDICAL_CARD, DRUG_TEST, ROAD_TEST, CLEARINGHOUSE, EMPLOYMENT_VERIFICATION)
  documentNumber      String?
  documentUrl         String?
  issueDate           DateTime?
  expirationDate      DateTime?
  isExpired           Boolean         (default: false)
  isVerified          Boolean         (default: false)
  verifiedAt          DateTime?
  verifiedById        String?
  clearinghouseStatus String?
  lastQueryDate       DateTime?
  externalId          String?
  sourceSystem        String?
  customFields        Json            (default: "{}")
  createdAt           DateTime
  updatedAt           DateTime
  deletedAt           DateTime?
}
```

### FmcsaCarrierRecord
```
FmcsaCarrierRecord {
  id                String           @id @default(uuid())
  tenantId          String
  carrierId         String           @unique (FK -> Carrier)
  dotNumber         String?
  mcNumber          String?
  legalName         String?
  dbaName           String?
  operatingStatus   SaferDataStatus?
  outOfServiceDate  DateTime?
  commonAuthority   Boolean          (default: false)
  contractAuthority Boolean          (default: false)
  brokerAuthority   Boolean          (default: false)
  physicalAddress   String?
  physicalCity      String?
  physicalState     String?
  physicalZip       String?
  mailingAddress    String?
  mailingCity       String?
  mailingState      String?
  mailingZip        String?
  phone             String?
  powerUnitCount    Int?
  driverCount       Int?
  saferDataJson     Json?            (raw SAFER Web response)
  lastSyncedAt      DateTime?
  externalId        String?
  sourceSystem      String?
  customFields      Json             (default: "{}")
  createdAt         DateTime
  updatedAt         DateTime
  deletedAt         DateTime?
}
```

### Related Enums
```
CSABasicType: UNSAFE_DRIVING, HOS_COMPLIANCE, DRIVER_FITNESS, CONTROLLED_SUBSTANCES, VEHICLE_MAINTENANCE, HAZMAT_COMPLIANCE, CRASH_INDICATOR
SafetyAlertType: INSURANCE_EXPIRING, AUTHORITY_EXPIRING, CSA_THRESHOLD_EXCEEDED, OUT_OF_SERVICE, VIOLATION_PATTERN
SafetyIncidentType: ACCIDENT, CITATION, INSPECTION_VIOLATION, DOT_AUDIT_FINDING, INSURANCE_CLAIM
DQFDocumentType: APPLICATION, MVR, PSP, MEDICAL_CARD, DRUG_TEST, ROAD_TEST, CLEARINGHOUSE, EMPLOYMENT_VERIFICATION
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| Alert `alertType` | IsEnum(SafetyAlertType) | "Invalid alert type" |
| Alert `severity` | Required, max 50 chars | "Severity is required" |
| Alert resolve `resolutionNotes` | Required when resolving | "Resolution notes are required" |
| CSA `carrierId` | Must exist in Carrier table | "Carrier not found" |
| DQF `driverId` | Required, must exist in Driver table | "Driver not found" |
| DQF `documentType` | IsEnum(DQFDocumentType) | "Invalid document type" |
| DQF `expirationDate` | Must be future date when creating | "Expiration date must be in the future" |
| FMCSA lookup | At least one of mcNumber or dotNumber required | "MC or DOT number is required" |
| Incident `incidentType` | IsEnum(SafetyIncidentType) | "Invalid incident type" |
| Incident `incidentDate` | Required, must not be future | "Incident date cannot be in the future" |
| Incident `description` | Required, non-empty | "Description is required" |
| Incident close | Requires close reason/notes | "Close reason is required" |
| Insurance `coverageAmount` | Required, positive decimal | "Coverage amount must be positive" |
| Insurance `expiresAt` | Required, must be future date | "Expiry date must be in the future" |
| Watchlist create | ADMIN role required | "Insufficient permissions" |
| Watchlist resolve | ADMIN role required, resolution body required | "Resolution details are required" |

---

## 10. Status States

### Safety Alert Lifecycle
```
ACTIVE → ACKNOWLEDGED (user views/clicks acknowledge)
ACTIVE → DISMISSED (false positive, user dismisses)
ACTIVE → RESOLVED (action taken, with resolution notes)
ACKNOWLEDGED → RESOLVED (action taken after acknowledgment)
ACKNOWLEDGED → DISMISSED (determined to be false positive)
```

### Safety Incident Lifecycle
```
OPEN → IN_INVESTIGATION (assigned for review)
IN_INVESTIGATION → CLOSED (resolution documented via close endpoint)
OPEN → CLOSED (direct close for minor incidents)
```

### DQF Document Status
```
PENDING → VERIFIED (verified by admin/safety manager)
VERIFIED → EXPIRED (expiration date passed)
EXPIRED → VERIFIED (renewed document uploaded + verified)
```

### Insurance Certificate Status
```
ACTIVE → EXPIRING_SOON (within 30 days of expiry)
EXPIRING_SOON → EXPIRED (expiry date reached)
EXPIRED → ACTIVE (renewed certificate + verified)
UNVERIFIED → VERIFIED (via POST /verify endpoint)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| No frontend pages exist | P3 | — | Deferred to P3 build |
| No frontend hooks or components | P3 | — | Deferred to P3 build |
| No integration tests for FMCSA external API calls | P2 | `fmcsa-api.client.ts` | Open |
| Scoring engine formula/weights undocumented | P2 | `scoring.engine.ts` | Open |
| Safety module not registered in app.module imports (verify) | P1 | `safety.module.ts` | Needs verification |
| Watchlist does not have a GET /:id endpoint | P2 | `watchlist.controller.ts` | Open — no single-item fetch |
| Alerts controller missing RolesGuard (uses only JwtAuthGuard) | P2 | `alerts.controller.ts` | Open |
| Insurance controller missing RolesGuard on class level | P2 | `insurance.controller.ts` | Open |
| Backend spec files exist but test suite coverage unknown | P2 | `*.service.spec.ts` | Needs audit |

---

## 12. Tasks

### P3 Build (Future)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| SAFE-001 | Build Safety Dashboard page (KPIs, alerts, scores overview) | L (8h) | Not Started |
| SAFE-002 | Build Incidents List + Detail pages | L (8h) | Not Started |
| SAFE-003 | Build Incident Report Form (multi-step wizard) | M (5h) | Not Started |
| SAFE-004 | Build CSA Scores Dashboard (7 BASICs visualization) | M (5h) | Not Started |
| SAFE-005 | Build Safety Inspections list + form | M (5h) | Not Started |
| SAFE-006 | Build DQF Compliance Checklist UI | M (4h) | Not Started |
| SAFE-007 | Build Insurance Expiry Tracker UI | M (4h) | Not Started |
| SAFE-008 | Build Safety Watchlist management UI | S (3h) | Not Started |
| SAFE-009 | Build Safety Reports viewer (3 report types) | M (4h) | Not Started |
| SAFE-010 | Build Safety Alerts feed with acknowledge/dismiss/resolve | M (4h) | Not Started |
| SAFE-011 | Create all React hooks for safety endpoints (~20 hooks) | M (4h) | Not Started |
| SAFE-012 | Write frontend tests for safety pages | L (8h) | Not Started |
| SAFE-013 | Audit and run existing backend spec files | S (2h) | Not Started |
| SAFE-014 | Document scoring engine weights and formula | S (1h) | Not Started |
| SAFE-015 | Add RolesGuard to Alerts and Insurance controllers | S (1h) | Not Started |
| SAFE-016 | Add GET /:id endpoint to Watchlist controller | S (1h) | Not Started |

### Total Estimated Effort: ~62 hours

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Service Overview | Full overview | `dev_docs/12-Rabih-design-Process/25-safety/00-service-overview.md` |
| Safety Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/25-safety/01-safety-dashboard.md` |
| Incidents List | Full 15-section | `dev_docs/12-Rabih-design-Process/25-safety/02-incidents-list.md` |
| Incident Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/25-safety/03-incident-detail.md` |
| Incident Report | Full 15-section | `dev_docs/12-Rabih-design-Process/25-safety/04-incident-report.md` |
| Safety Inspections | Full 15-section | `dev_docs/12-Rabih-design-Process/25-safety/05-safety-inspections.md` |
| Inspection Form | Full 15-section | `dev_docs/12-Rabih-design-Process/25-safety/06-inspection-form.md` |
| Driver Safety Scores | Full 15-section | `dev_docs/12-Rabih-design-Process/25-safety/07-driver-safety-scores.md` |
| CSA Scores | Full 15-section | `dev_docs/12-Rabih-design-Process/25-safety/08-csa-scores.md` |
| Safety Training | Full 15-section | `dev_docs/12-Rabih-design-Process/25-safety/09-safety-training.md` |
| Safety Reports | Full 15-section | `dev_docs/12-Rabib-design-Process/25-safety/10-safety-reports.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Full safety module with UI | Backend only — 9 controllers, 43 endpoints, 0 frontend | Backend ahead, frontend not started |
| CSA scores basic | Full 7-BASIC model with history, thresholds, refresh | Exceeds plan |
| FMCSA lookup only | Full FMCSA record model + verify + refresh + API client | Exceeds plan |
| DQF basic tracking | 8 document types, compliance check, document attachments | Exceeds plan |
| Incidents simple list | Full lifecycle: create, update, close, violations query | Exceeds plan |
| Insurance in carrier module | Separate safety/insurance controller with expiry tracking | Separate from carrier insurance |
| Safety reports — future | 3 report endpoints built (compliance, incidents, expiring) | Ahead of plan |
| Watchlist — future | Full CRUD + resolve built | Ahead of plan |
| Safety scoring — future | Scoring engine with calculate/history built | Ahead of plan |
| 11 design specs | 11 specs exist, 0 implemented in frontend | Frontend fully deferred |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles, tenantId — all endpoints guarded)
- Carrier Management (carrierId FK on most safety models; carrier status impacts safety)
- Driver Management (driverId FK on incidents, inspections, DQF)
- TMS Core / Loads (loadId FK on incidents — incidents can be tied to a load)
- FMCSA/SAFER Web API (external API for CSA scores and carrier verification)
- Storage service (DQF document URLs, incident report URLs, insurance certificate documents)

**Depended on by:**
- Carrier Management (CSA scores display, FMCSA lookup, insurance expiry — already partly duplicated in carrier module)
- Dispatch (safety score checks before carrier assignment; watchlist blocks)
- Compliance (aggregate compliance reporting draws from safety data)
- Claims (incident data feeds into claims investigations)
- Notifications (safety alerts should trigger notification system — not yet wired)

**Cross-module notes:**
- The carrier module has its own FMCSA lookup at `POST /carriers/fmcsa/lookup` and CSA display component (`CsaScoresDisplay`). The safety module provides a more comprehensive safety-focused version. These should be consolidated in Phase 3 to avoid dual maintenance.
- The carrier module has its own `CarrierInsurance` model. The safety `insurance` sub-module provides a cross-carrier insurance tracking view. They share underlying data but serve different use cases (carrier onboarding vs. fleet-wide compliance).

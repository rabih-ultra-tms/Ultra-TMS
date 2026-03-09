# Service Hub: Factoring Internal (18)

> **Priority:** P2 Extended | **Status:** Backend Production, Frontend Not Built
> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-18 tribunal)
> **Original definition:** `dev_docs/02-services/` (Factoring service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/17-factoring/` (7 files)
> **Backend module:** `apps/api/src/modules/factoring/` (5 controllers, 6 services, 7 sub-modules, 35 files, 2,605 LOC)
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-18-factoring-internal.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B (7.5/10) |
| **Confidence** | High — code-verified via PST-18 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Production — 5 controllers, 6 services, 30 endpoints, 10 EventEmitter events, PaymentRoutingService with 4-tier priority chain |
| **Frontend** | Not Built — no pages, no components, no hooks |
| **Tests** | 49 tests / 6 spec files / 656 LOC |
| **Note** | Internal factoring: 3PL manages factoring relationships for carriers; payment routing to factoring companies via NOA. Best endpoint documentation of all audited services (~100% path + count accuracy). |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Factoring service in dev_docs |
| Design Specs | Done | 7 files in `dev_docs/12-Rabih-design-Process/17-factoring/` |
| Backend — Factoring Companies | Production | `companies/factoring-companies.controller.ts` — 6 endpoints (CRUD + status toggle). RolesGuard: YES |
| Backend — Carrier Status | Production | `carrier-status/carrier-factoring-status.controller.ts` — 6 endpoints. RolesGuard: NO (decorative @Roles) |
| Backend — NOA Records | Production | `noa/noa-records.controller.ts` — 7 endpoints (CRUD + verify + release). RolesGuard: NO (decorative @Roles) |
| Backend — Verifications | Production | `verifications/factoring-verifications.controller.ts` — 6 endpoints. RolesGuard: YES |
| Backend — Factored Payments | Production | `payments/factored-payments.controller.ts` — 5 endpoints. RolesGuard: NO (decorative @Roles) |
| Backend — Payment Routing | Production | `routing/payment-routing.service.ts` — internal service only, no controller (by design) |
| Prisma Models | Done | FactoringCompany, CarrierFactoringStatus, NOARecord, FactoredPayment, FactoringVerification |
| Frontend Pages | Not Built | 0 pages |
| React Hooks | Not Built | 0 hooks |
| Components | Not Built | 0 components |
| Tests | 49 tests | 6 spec files, 656 LOC — covers all 6 services |
| Security | Partial | JwtAuthGuard on all 5 controllers; RolesGuard on 2/5 only (3/5 have decorative @Roles) |
| DTO Validation | Done | 16 DTO files across sub-modules (carrier-status 3, companies 3, noa 5, payments 2, verifications 3) + root enums.ts |
| Events | Production | 10 EventEmitter events (entirely event-driven module) |
| Module Exports | Production | All 6 services exported for cross-module consumption |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Factoring Dashboard | `/factoring` | Not Built | -- | KPIs: active NOAs, pending verifications, routed payments |
| Factoring Companies | `/factoring/companies` | Not Built | -- | CRUD for RTS, Triumph, etc. with API config |
| Factoring Setup | `/factoring/setup` | Not Built | -- | Carrier-level factoring enrollment and NOA management |
| Funding Requests | `/factoring/funding-requests` | Not Built | -- | Carrier requests for factored payment |
| Payment Schedule | `/factoring/payment-schedule` | Not Built | -- | Scheduled payments to factoring companies |
| Factoring Reports | `/factoring/reports` | Not Built | -- | Volume, fees, turnaround time analytics |

---

## 4. API Endpoints

### Carrier Factoring Status — `@Controller('carriers')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/carriers/:carrierId/factoring-status` | Production | Get carrier's factoring status |
| PUT | `/api/v1/carriers/:carrierId/factoring-status` | Production | Update factoring status |
| POST | `/api/v1/carriers/:carrierId/quick-pay/enroll` | Production | Enroll carrier in quick-pay |
| POST | `/api/v1/carriers/:carrierId/quick-pay/unenroll` | Production | Unenroll carrier from quick-pay |
| POST | `/api/v1/carriers/:carrierId/factoring/override` | Production | Manual factoring override |
| GET | `/api/v1/carriers/:carrierId/noa` | Production | Get carrier's NOA records |

### Factoring Companies — `@Controller('factoring-companies')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/factoring-companies` | Production | List all factoring companies |
| POST | `/api/v1/factoring-companies` | Production | Create factoring company |
| GET | `/api/v1/factoring-companies/:id` | Production | Get factoring company detail |
| PUT | `/api/v1/factoring-companies/:id` | Production | Update factoring company |
| DELETE | `/api/v1/factoring-companies/:id` | Production | Delete factoring company |
| PATCH | `/api/v1/factoring-companies/:id/status` | Production | Toggle company status (ACTIVE/INACTIVE) |

### NOA Records — `@Controller('noa-records')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/noa-records` | Production | List all NOA records |
| POST | `/api/v1/noa-records` | Production | Create NOA record |
| GET | `/api/v1/noa-records/:id` | Production | Get NOA detail |
| PUT | `/api/v1/noa-records/:id` | Production | Update NOA record |
| DELETE | `/api/v1/noa-records/:id` | Production | Delete NOA record |
| POST | `/api/v1/noa-records/:id/verify` | Production | Mark NOA as verified |
| POST | `/api/v1/noa-records/:id/release` | Production | Release NOA (end factoring relationship) |

### Factoring Verifications — `@Controller('factoring-verifications')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/factoring-verifications` | Production | List all verifications |
| GET | `/api/v1/factoring-verifications/pending` | Production | Pending verification queue |
| POST | `/api/v1/factoring-verifications` | Production | Create verification request |
| GET | `/api/v1/factoring-verifications/:id` | Production | Verification detail |
| POST | `/api/v1/factoring-verifications/:id/respond` | Production | Respond to verification (confirm/deny) |
| GET | `/api/v1/factoring-verifications/loads/:loadId/verification` | Production | Check verification status for a load |

### Factored Payments — `@Controller()` (root-level routes)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/factored-payments` | Production | List all factored payments |
| GET | `/api/v1/factored-payments/:id` | Production | Factored payment detail |
| POST | `/api/v1/factored-payments/:id/process` | Production | Process/execute a factored payment |
| GET | `/api/v1/carriers/:carrierId/factored-payments` | Production | Factored payments for a carrier |
| GET | `/api/v1/factoring-companies/:id/payments` | Production | Payments sent to a factoring company |

---

## 5. Components

No components built. Planned components for future implementation:

| Component | Purpose | Status |
|-----------|---------|--------|
| FactoringDashboardKPIs | Summary cards: active NOAs, pending verifications, payment volume | Not Built |
| FactoringCompanyForm | Create/edit factoring company with API config fields | Not Built |
| FactoringCompanyList | Searchable table of factoring companies | Not Built |
| NOARecordsList | List NOAs with status badges and actions | Not Built |
| NOAVerificationDialog | Confirm/release NOA with reason field | Not Built |
| CarrierFactoringStatusCard | Show carrier's factoring enrollment on carrier detail | Not Built |
| PaymentRoutingIndicator | Badge showing payment destination (carrier vs factoring co.) | Not Built |
| FactoredPaymentsList | Payments routed to factoring companies with filters | Not Built |
| VerificationQueue | Pending verifications with SLA countdown | Not Built |

---

## 6. Hooks

No hooks built. Required hooks for future implementation:

| Hook | Endpoints Used | Notes |
|------|---------------|-------|
| `useFactoringCompanies` | GET `/factoring-companies` | Paginated list |
| `useFactoringCompany` | GET `/factoring-companies/:id` | Single detail |
| `useCreateFactoringCompany` | POST `/factoring-companies` | Mutation |
| `useUpdateFactoringCompany` | PUT `/factoring-companies/:id` | Mutation |
| `useNOARecords` | GET `/noa-records` | Paginated list |
| `useCarrierFactoringStatus` | GET `/carriers/:id/factoring-status` | Carrier factoring info |
| `useFactoringVerifications` | GET `/factoring-verifications` | List + pending queue |
| `useFactoredPayments` | GET `/factored-payments` | Paginated list |
| `useProcessFactoredPayment` | POST `/factored-payments/:id/process` | Mutation |

---

## 7. Business Rules

1. **Internal Factoring Model:** The 3PL (broker) manages factoring relationships on behalf of carriers. This is NOT a self-service factoring product -- the broker's accounting team enrolls carriers and manages NOA records. External factoring companies (e.g., RTS Financial, Triumph Pay) are registered in the system.

2. **Notice of Assignment (NOA):** A legal document from a factoring company that redirects carrier payment from the broker to the factoring company. When an NOA is active for a carrier, ALL payments for that carrier's loads must be routed to the factoring company instead of directly to the carrier. NOA lifecycle: PENDING -> VERIFIED -> ACTIVE -> EXPIRED or RELEASED.

3. **Factoring Companies:** External entities (RTS, Triumph, OTR Solutions, etc.) registered with API integration details. Each company has a `verificationMethod` (PHONE_CALL, EMAIL, FAX, ONLINE_PORTAL, MAIL) and a `verificationSLAHours` (default 24h) defining how quickly they must respond to verification requests.

4. **Carrier Factoring Status:** Each carrier has a factoring status: NONE (no factoring), FACTORED (active NOA with a factoring company), or QUICK_PAY_ONLY (broker's own quick-pay program, no external factoring company). Only one factoring company per carrier at a time (enforced by `carrierId @unique` on CarrierFactoringStatus).

5. **Payment Routing (4-Tier Priority Chain):** The `PaymentRoutingService.determineDestination()` method uses a priority chain:
   1. **Override** (highest) — temporary factoring company override with expiry date
   2. **FACTORED + active NOA** — route to factoring company
   3. **QUICK_PAY_ONLY** — route with quick-pay fee applied
   4. **Default** — route to carrier directly

6. **Verification Before Payment:** Before routing any payment to a factoring company, the system must verify the NOA is still active. Verification can be done via phone call, email, fax, online portal, or mail (per company's `verificationMethod`). If verification is not completed within `verificationSLAHours`, the payment is held and flagged for manual review.

7. **Quick-Pay Program:** An alternative to external factoring. The broker pays the carrier faster (e.g., 2-5 days instead of NET30) in exchange for a fee (`quickPayFeePercent`, typically 2-5%). No external factoring company is involved -- the broker funds it internally.

8. **NOA Release:** When a carrier's relationship with a factoring company ends, the NOA must be explicitly released (with reason and release date). After release, payments revert to the carrier's direct bank account. Released NOAs are kept for audit history.

9. **Lazy NOA Auto-Expiration:** No cron job exists for proactive NOA expiration, but lazy auto-expiration IS implemented via `autoExpireIfNeeded()` in NoaRecordsService. On every read (findAll, findOne, getCarrierNoa), expired NOAs are automatically updated to EXPIRED status and emit `noa.expired` event. NOAs expire when accessed but not proactively — batch reporting may not trigger expiration unless it reads each NOA individually.

10. **Payment Status in customFields:** `FactoredPaymentStatus` (PENDING/SCHEDULED/PROCESSING/PAID/FAILED) is stored in `customFields.status` JSON path, not as a dedicated Prisma column. No DB-level enum validation, no index on status, JSON path queries are slower. Architecturally fragile but functional.

---

## 8. Data Model

### FactoringCompany
```
FactoringCompany {
  id                     String (UUID)
  tenantId               String
  companyCode            String (unique, VarChar 50)
  name                   String (VarChar 255)
  email                  String? (VarChar 255)
  phone                  String? (VarChar 20)
  fax                    String? (VarChar 20)
  address                String?
  verificationMethod     String (VarChar 50)         -- PHONE_CALL, EMAIL, FAX, ONLINE_PORTAL, MAIL
  apiEndpoint            String? (VarChar 500)
  apiKey                 String? (VarChar 255)        -- P0 SECURITY: returned in plaintext on GET
  verificationSLAHours   Int (default 24)
  status                 String (default "ACTIVE", VarChar 50)
  externalId             String? (VarChar 255)
  sourceSystem           String? (VarChar 100)
  customFields           Json (default "{}")
  createdById            String?
  updatedById            String?
  createdAt              DateTime
  updatedAt              DateTime
  deletedAt              DateTime?
  -- Relations
  CarrierFactoringStatus CarrierFactoringStatus[]
  FactoredPayment        FactoredPayment[]
  NOARecord              NOARecord[]
}
```

### CarrierFactoringStatus
```
CarrierFactoringStatus {
  id                 String (UUID)
  tenantId           String
  carrierId          String (unique)                 -- one status per carrier
  factoringStatus    FactoringStatus (default NONE)  -- NONE | FACTORED | QUICK_PAY_ONLY
  factoringCompanyId String?
  activeNoaId        String?
  quickPayEnabled    Boolean (default false)
  quickPayFeePercent Decimal? (5,2)
  notes              String?
  externalId         String? (VarChar 255)
  sourceSystem       String? (VarChar 100)
  customFields       Json (default "{}")
  createdById        String?
  updatedById        String?
  createdAt          DateTime
  updatedAt          DateTime
  deletedAt          DateTime?
  -- Relations
  carrier            Carrier (FK carrierId)
  factoringCompany   FactoringCompany? (FK factoringCompanyId)
  tenant             Tenant (FK tenantId)
}
```

### NOARecord
```
NOARecord {
  id                    String (UUID)
  tenantId              String
  carrierId             String
  factoringCompanyId    String
  noaNumber             String (unique, VarChar 50)
  noaDocument           String? (VarChar 500)          -- document URL/path
  receivedDate          Date
  effectiveDate         Date
  expirationDate        Date?
  verifiedBy            String?
  verifiedAt            DateTime?
  verifiedMethod        String? (VarChar 50)
  status                NOAStatus (default PENDING)    -- PENDING | VERIFIED | ACTIVE | EXPIRED | RELEASED
  releasedBy            String?
  releasedAt            DateTime?
  releaseReason         String?
  externalId            String? (VarChar 255)
  sourceSystem          String? (VarChar 100)
  customFields          Json (default "{}")
  createdById           String?
  updatedById           String?
  createdAt             DateTime
  updatedAt             DateTime
  deletedAt             DateTime?
  -- Relations
  carrier               Carrier (FK carrierId)
  factoringCompany      FactoringCompany (FK factoringCompanyId)
  FactoringVerification FactoringVerification[]
}
```

### FactoredPayment
```
FactoredPayment {
  id                 String (UUID)
  tenantId           String
  settlementId       String
  factoringCompanyId String
  paymentAmount      Decimal (12,2)
  paymentDate        Date
  paymentMethod      PaymentMethod                   -- ACH | CHECK | WIRE | CREDIT_CARD
  verificationCode   String? (VarChar 100)
  notes              String?
  externalId         String? (VarChar 255)
  sourceSystem       String? (VarChar 100)
  customFields       Json (default "{}")              -- NOTE: FactoredPaymentStatus stored here as customFields.status
  createdById        String?
  updatedById        String?
  createdAt          DateTime
  updatedAt          DateTime
  deletedAt          DateTime?
  -- Relations
  factoringCompany   FactoringCompany (FK)
  settlement         Settlement (FK)
}
```

### FactoringVerification
```
FactoringVerification {
  id                     String (UUID)
  tenantId               String
  noaRecordId            String
  verificationDate       Date
  verificationMethod     VerificationMethod
  contactedPerson        String? (VarChar 255)
  verificationStatus     VerificationStatus
  verificationDocumentId String?
  notes                  String?
  nextVerificationDate   Date?
  externalId             String? (VarChar 255)
  sourceSystem           String? (VarChar 100)
  customFields           Json (default "{}")
  createdById            String?
  updatedById            String?
  createdAt              DateTime
  updatedAt              DateTime
  deletedAt              DateTime?
  -- Relations
  noaRecord              NOARecord (FK)
  document               Document? (FK verificationDocumentId)
}
```

### Enums (7 total — hub previously documented 4)

| Enum | Values | Notes |
|------|--------|-------|
| FactoringStatus | NONE, FACTORED, QUICK_PAY_ONLY | On CarrierFactoringStatus |
| NoaStatus | PENDING, VERIFIED, ACTIVE, EXPIRED, RELEASED | On NOARecord (casing: NoaStatus not NOAStatus) |
| FactoringCompanyStatus | ACTIVE, INACTIVE | On FactoringCompany |
| VerificationMethod | PHONE_CALL, EMAIL, FAX, ONLINE_PORTAL, MAIL | On FactoringVerification — NOT PHONE/API as previously documented |
| VerificationStatus | PENDING, VERIFIED, PARTIAL, DECLINED | On FactoringVerification — previously undocumented |
| FactoredPaymentStatus | PENDING, SCHEDULED, PROCESSING, PAID, FAILED | Stored in customFields.status JSON — previously undocumented |
| PaymentMethodType | ACH, CHECK, WIRE, CREDIT_CARD | On FactoredPayment — previously undocumented |

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `companyCode` | Required, unique, max 50 chars | "Company code is required" / "Company code already exists" |
| `name` | Required, max 255 chars | "Company name is required" |
| `verificationMethod` | Required, max 50 chars, one of PHONE_CALL/EMAIL/FAX/ONLINE_PORTAL/MAIL | "Invalid verification method" |
| `verificationSLAHours` | Positive integer, default 24 | "SLA hours must be a positive number" |
| `noaNumber` | Required, unique, max 50 chars | "NOA number is required" / "NOA number already exists" |
| `effectiveDate` | Required, must be <= expirationDate if set | "Effective date must be before expiration date" |
| `carrierId` on CarrierFactoringStatus | Required, unique (one status per carrier) | "Carrier already has a factoring status record" |
| `factoringCompanyId` | Required when `factoringStatus = FACTORED` | "Factoring company is required for FACTORED status" |
| `quickPayFeePercent` | Decimal 0-100, required when `quickPayEnabled = true` | "Quick-pay fee percentage is required" |
| `paymentAmount` | Positive Decimal, max 12 digits | "Payment amount must be positive" |
| `apiKey` on FactoringCompany | **P0 BUG: currently returned in plaintext on GET** — must be masked/excluded | Security: add @Exclude() or select clause |

### DTO Files (16 files across sub-modules)

| Sub-module | DTO Files | Count |
|-----------|-----------|-------|
| carrier-status/dto/ | enroll-quick-pay, override-factoring, update-carrier-factoring-status | 3 |
| companies/dto/ | create-factoring-company, update-factoring-company, factoring-company-query | 3 |
| noa/dto/ | create-noa-record, update-noa-record, verify-noa, release-noa, noa-query | 5 |
| payments/dto/ | payment-query, process-payment | 2 |
| verifications/dto/ | create-verification, respond-verification, verification-query | 3 |
| dto/ | enums | 1 |
| **Total** | | **17** |

---

## 10. Status States

### NOA Status Machine
```
PENDING   -> VERIFIED   (verification completed by staff or API)
VERIFIED  -> ACTIVE     (NOA accepted and payment routing enabled)
ACTIVE    -> EXPIRED    (lazy: autoExpireIfNeeded() on read when expirationDate passed)
ACTIVE    -> RELEASED   (manual: carrier/company ended relationship)
EXPIRED   -> ACTIVE     (renewed: new dates set, re-verified)
RELEASED  -> (terminal)  (kept for audit, cannot be reactivated)
```

### Carrier Factoring Status
```
NONE           -> FACTORED       (NOA received and verified from factoring company)
NONE           -> QUICK_PAY_ONLY (enrolled in broker's quick-pay program)
FACTORED       -> NONE           (NOA released, factoring relationship ended)
FACTORED       -> QUICK_PAY_ONLY (switched from external factoring to quick-pay)
QUICK_PAY_ONLY -> NONE           (unenrolled from quick-pay)
QUICK_PAY_ONLY -> FACTORED       (enrolled with external factoring company)
```

### Factoring Company Status
```
ACTIVE   -> INACTIVE  (company no longer in use)
INACTIVE -> ACTIVE    (company reactivated)
```

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| **apiKey returned in plaintext on FactoringCompany GET** | **P0 SECURITY** | **Open** | `findAll()` and `findOne()` return full Prisma object including apiKey. No field exclusion, no serialization interceptor, no @Exclude(). Any ACCOUNTING role user can read all factoring company API keys. Must add @Exclude() or select clause. |
| **3/5 controllers missing RolesGuard** | P1 SECURITY | **Open** | CarrierFactoringStatus, NoaRecords, FactoredPayments have @Roles decorators but NO RolesGuard in @UseGuards — roles are decorative. Only FactoringCompanies + FactoringVerifications have RolesGuard. |
| **companyCode uniqueness check is cross-tenant** | P1 BUG | **Open** | `FactoringCompaniesService.create()` line 18-19 and `update()` line 95-97: `findFirst({ where: { companyCode, deletedAt: null } })` missing `tenantId` — a code used in Tenant A blocks Tenant B from using the same code. |
| **getOrCreateStatus() missing deletedAt filter** | P2 BUG | **Open** | `CarrierFactoringStatusService.getOrCreateStatus()` queries without `deletedAt: null`. A soft-deleted status record would still be returned and used for payment routing. |
| **FactoredPaymentStatus in customFields JSON** | P2 | Open | Status stored in `customFields.status` JSON path instead of proper Prisma column. No DB-level enum validation, no index, slower JSON queries. |
| No frontend exists — entire UI not built | P2 | Open | 0 pages, 0 components, 0 hooks |
| No proactive NOA expiration job | P2 | Open | Lazy expiration exists via `autoExpireIfNeeded()` but no cron job for batch expiration. Batch reporting may miss expired NOAs. |
| PaymentRoutingService has no controller — not exposed via API | Info | By design | Internal service for cross-module consumption. Correctly exported from module. |

**Resolved Issues (closed during PST-18 tribunal):**
- ~~No tests for any factoring backend logic~~ — FALSE: 49 tests / 6 spec files / 656 LOC exist
- ~~DTO validation coverage unknown (only `enums.ts` in `dto/` dir)~~ — FALSE: 16 DTO files exist across sub-modules (hub only checked root `dto/` directory)
- ~~Guard coverage not verified~~ — VERIFIED: JwtAuthGuard on all 5; RolesGuard on 2/5 only
- ~~No scheduled job for auto-expiring NOAs~~ — PARTIALLY FALSE: lazy auto-expiration exists via `autoExpireIfNeeded()`, just no proactive cron job

---

## 12. Tasks

### Completed (verified by PST-18 tribunal)
| Task ID | Title | Status |
|---------|-------|--------|
| FACT-009 | Verify JwtAuthGuard + tenantId on all 5 controllers | **Done** — JwtAuthGuard confirmed on all 5; RolesGuard only on 2/5 |
| FACT-011 | Add DTO validation classes for all endpoints | **Done** — 16 DTO files exist across sub-modules |
| FACT-012 | Write backend tests for factoring services | **Done** — 49 tests / 6 spec files / 656 LOC |

### Open (from tribunal findings)

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| FACT-010 | Mask `apiKey` in FactoringCompany GET responses (add @Exclude() or select clause) | S (1h) | **P0** |
| FACT-015 | Add RolesGuard to CarrierFactoringStatus, NoaRecords, FactoredPayments controllers | S (1h) | P1 |
| FACT-016 | Add tenantId to companyCode uniqueness check (create + update) | S (30min) | P1 |
| FACT-017 | Add deletedAt:null to getOrCreateStatus() query | XS (15min) | P2 |
| FACT-018 | Move FactoredPaymentStatus from customFields to proper Prisma column | M (3h) | P2 |
| FACT-013 | Build NOA expiration cron job (supplement lazy expiration) | S (2h) | P2 |
| FACT-001 | Build Factoring Dashboard page | M (4h) | P2 |
| FACT-002 | Build Factoring Companies CRUD pages | M (4h) | P2 |
| FACT-003 | Build NOA Records management pages | M (4h) | P2 |
| FACT-004 | Build Carrier Factoring Setup page (enrollment flow) | M (4h) | P2 |
| FACT-005 | Build Funding Requests page | M (4h) | P2 |
| FACT-006 | Build Payment Schedule page | M (4h) | P2 |
| FACT-007 | Build Factoring Reports page | M (4h) | P2 |
| FACT-008 | Create React hooks for all factoring endpoints (~9 hooks) | M (3h) | P2 |
| FACT-014 | Integrate PaymentRoutingService with Settlement workflow | L (6h) | P2 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Service Overview | Overview | `dev_docs/12-Rabih-design-Process/17-factoring/00-service-overview.md` |
| Factoring Dashboard | Full spec | `dev_docs/12-Rabih-design-Process/17-factoring/01-factoring-dashboard.md` |
| Factoring Companies | Full spec | `dev_docs/12-Rabih-design-Process/17-factoring/02-factoring-companies.md` |
| Factoring Setup | Full spec | `dev_docs/12-Rabih-design-Process/17-factoring/03-factoring-setup.md` |
| Funding Requests | Full spec | `dev_docs/12-Rabih-design-Process/17-factoring/04-funding-requests.md` |
| Payment Schedule | Full spec | `dev_docs/12-Rabih-design-Process/17-factoring/05-payment-schedule.md` |
| Factoring Reports | Full spec | `dev_docs/12-Rabih-design-Process/17-factoring/06-factoring-reports.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Factoring as internal advance program | External factoring company integration (NOA-based) | Different model -- richer |
| Simple request/approve workflow | 5 controllers, 6 services covering companies, NOA, verification, routing | Backend far more complex than expected |
| FactoringRequest + FactoringAdvance models | FactoringCompany, CarrierFactoringStatus, NOARecord, FactoredPayment, FactoringVerification | 5 models vs 2 planned |
| Frontend pages for requests/advances | 0 frontend pages built | Behind plan |
| Tests for factoring logic | 49 tests / 6 spec files / 656 LOC | Exceeds plan |
| Quick-pay as separate feature | Quick-pay integrated into CarrierFactoringStatus as `QUICK_PAY_ONLY` enum | Consolidated |
| Payment routing TBD | PaymentRoutingService exists with 4-tier priority chain (override -> factored -> quickpay -> default) | Sophisticated, production-quality |
| No event architecture | 10 EventEmitter events, fully event-driven | Exceeds plan |
| DTO validation TBD | 16 DTO files across 5 sub-modules | Exceeds plan |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, tenantId — JwtAuthGuard on all 5 controllers; RolesGuard on 2/5)
- Carrier Management (carrier records, `carrierId` FK on CarrierFactoringStatus and NOARecord)
- Accounting / Settlements (`settlementId` FK on FactoredPayment; PaymentRoutingService must integrate with settlement creation)
- Storage service (NOA document uploads via `noaDocument` field)
- Documents module (FK `verificationDocumentId` on FactoringVerification)

**Depended on by:**
- Accounting (payment routing decisions -- when settling a load, must check carrier's factoring status to determine payee)
- Carrier Detail page (should display carrier's factoring status, active NOA, and factoring company)
- Carrier Portal (carrier may need visibility into factored payment status)
- Analytics (factoring volume, verification turnaround, quick-pay adoption reports)

**Integration points:**
- External factoring company APIs (RTS, Triumph, etc.) via `apiEndpoint` + `apiKey` on FactoringCompany
- Settlement creation workflow must call `PaymentRoutingService` to determine payment destination
- All 6 services exported from FactoringModule for cross-module consumption

---

## 16. EventEmitter Events

| Event | Emitted By | Purpose |
|-------|-----------|---------|
| `factoring.company.created` | FactoringCompaniesService | New factoring company registered |
| `carrier.factoring.updated` | CarrierFactoringStatusService, NoaRecordsService | Carrier factoring status changed |
| `carrier.quickpay.enrolled` | CarrierFactoringStatusService | Carrier enrolled in quick-pay program |
| `noa.received` | NoaRecordsService | New NOA record created |
| `noa.verified` | NoaRecordsService | NOA verification completed |
| `noa.released` | NoaRecordsService | NOA relationship ended (manual release) |
| `noa.expired` | NoaRecordsService | NOA auto-expired on read (lazy expiration) |
| `verification.requested` | FactoringVerificationsService | New verification request initiated |
| `verification.responded` | FactoringVerificationsService | Verification response recorded |
| `factored.payment.processed` | FactoredPaymentsService | Payment processed to factoring company |

---

## 17. Tests

| Spec File | Tests | LOC |
|-----------|-------|-----|
| factoring-companies.service.spec.ts | 11 | 142 |
| carrier-factoring-status.service.spec.ts | 5 | 86 |
| noa-records.service.spec.ts | 21 | 255 |
| factored-payments.service.spec.ts | 4 | 58 |
| factoring-verifications.service.spec.ts | 4 | 61 |
| payment-routing.service.spec.ts | 4 | 54 |
| **Total** | **49** | **656** |

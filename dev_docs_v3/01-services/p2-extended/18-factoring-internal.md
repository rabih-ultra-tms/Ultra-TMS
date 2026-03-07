# Service Hub: Factoring Internal (18)

> **Priority:** P2 Extended | **Status:** Backend Partial, Frontend Not Built
> **Source of Truth** -- dev_docs_v3 | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Factoring service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/17-factoring/` (7 files)
> **Backend module:** `apps/api/src/modules/factoring/` (5 controllers, 6 services, 7 sub-modules)

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Confidence** | Medium -- backend verified via code scan 2026-03-07; frontend confirmed absent |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial -- 5 controllers, 6 services, ~30 endpoints in `apps/api/src/modules/factoring/` |
| **Frontend** | Not Built -- no pages, no components, no hooks |
| **Tests** | None |
| **Note** | Internal factoring: 3PL manages factoring relationships for carriers; payment routing to factoring companies via NOA |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Factoring service in dev_docs |
| Design Specs | Done | 7 files in `dev_docs/12-Rabih-design-Process/17-factoring/` |
| Backend -- Factoring Companies | Partial | `companies/factoring-companies.controller.ts` -- 6 endpoints (CRUD + status toggle) |
| Backend -- Carrier Status | Partial | `carrier-status/carrier-factoring-status.controller.ts` -- 6 endpoints |
| Backend -- NOA Records | Partial | `noa/noa-records.controller.ts` -- 7 endpoints (CRUD + verify + release) |
| Backend -- Verifications | Partial | `verifications/factoring-verifications.controller.ts` -- 6 endpoints |
| Backend -- Factored Payments | Partial | `payments/factored-payments.controller.ts` -- 5 endpoints |
| Backend -- Payment Routing | Partial | `routing/payment-routing.service.ts` -- service only, no controller |
| Prisma Models | Done | FactoringCompany, CarrierFactoringStatus, NOARecord, FactoredPayment, FactoringVerification |
| Frontend Pages | Not Built | 0 pages |
| React Hooks | Not Built | 0 hooks |
| Components | Not Built | 0 components |
| Tests | None | 0 backend, 0 frontend |
| Security | Unknown | Controllers exist but guard coverage not verified |

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

### Carrier Factoring Status -- `@Controller('carriers')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/carriers/:carrierId/factoring-status` | Partial | Get carrier's factoring status |
| PUT | `/api/v1/carriers/:carrierId/factoring-status` | Partial | Update factoring status |
| POST | `/api/v1/carriers/:carrierId/quick-pay/enroll` | Partial | Enroll carrier in quick-pay |
| POST | `/api/v1/carriers/:carrierId/quick-pay/unenroll` | Partial | Unenroll carrier from quick-pay |
| POST | `/api/v1/carriers/:carrierId/factoring/override` | Partial | Manual factoring override |
| GET | `/api/v1/carriers/:carrierId/noa` | Partial | Get carrier's NOA records |

### Factoring Companies -- `@Controller('factoring-companies')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/factoring-companies` | Partial | List all factoring companies |
| POST | `/api/v1/factoring-companies` | Partial | Create factoring company |
| GET | `/api/v1/factoring-companies/:id` | Partial | Get factoring company detail |
| PUT | `/api/v1/factoring-companies/:id` | Partial | Update factoring company |
| DELETE | `/api/v1/factoring-companies/:id` | Partial | Delete factoring company |
| PATCH | `/api/v1/factoring-companies/:id/status` | Partial | Toggle company status (ACTIVE/INACTIVE) |

### NOA Records -- `@Controller('noa-records')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/noa-records` | Partial | List all NOA records |
| POST | `/api/v1/noa-records` | Partial | Create NOA record |
| GET | `/api/v1/noa-records/:id` | Partial | Get NOA detail |
| PUT | `/api/v1/noa-records/:id` | Partial | Update NOA record |
| DELETE | `/api/v1/noa-records/:id` | Partial | Delete NOA record |
| POST | `/api/v1/noa-records/:id/verify` | Partial | Mark NOA as verified |
| POST | `/api/v1/noa-records/:id/release` | Partial | Release NOA (end factoring relationship) |

### Factoring Verifications -- `@Controller('factoring-verifications')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/factoring-verifications` | Partial | List all verifications |
| GET | `/api/v1/factoring-verifications/pending` | Partial | Pending verification queue |
| POST | `/api/v1/factoring-verifications` | Partial | Create verification request |
| GET | `/api/v1/factoring-verifications/:id` | Partial | Verification detail |
| POST | `/api/v1/factoring-verifications/:id/respond` | Partial | Respond to verification (confirm/deny) |
| GET | `/api/v1/factoring-verifications/loads/:loadId/verification` | Partial | Check verification status for a load |

### Factored Payments -- `@Controller()` (root-level routes)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/factored-payments` | Partial | List all factored payments |
| GET | `/api/v1/factored-payments/:id` | Partial | Factored payment detail |
| POST | `/api/v1/factored-payments/:id/process` | Partial | Process/execute a factored payment |
| GET | `/api/v1/carriers/:carrierId/factored-payments` | Partial | Factored payments for a carrier |
| GET | `/api/v1/factoring-companies/:id/payments` | Partial | Payments sent to a factoring company |

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

3. **Factoring Companies:** External entities (RTS, Triumph, OTR Solutions, etc.) registered with API integration details. Each company has a `verificationMethod` (PHONE, EMAIL, API, FAX) and a `verificationSLAHours` (default 24h) defining how quickly they must respond to verification requests.

4. **Carrier Factoring Status:** Each carrier has a factoring status: NONE (no factoring), FACTORED (active NOA with a factoring company), or QUICK_PAY_ONLY (broker's own quick-pay program, no external factoring company). Only one factoring company per carrier at a time (enforced by `carrierId @unique` on CarrierFactoringStatus).

5. **Payment Routing:** When a settlement is created for a carrier with `factoringStatus = FACTORED`, the `PaymentRoutingService` redirects the payment to the factoring company's payment details instead of the carrier's bank account. The carrier receives nothing directly -- the factoring company handles the carrier relationship.

6. **Verification Before Payment:** Before routing any payment to a factoring company, the system must verify the NOA is still active. Verification can be done via phone, email, API, or fax (per company's `verificationMethod`). If verification is not completed within `verificationSLAHours`, the payment is held and flagged for manual review.

7. **Quick-Pay Program:** An alternative to external factoring. The broker pays the carrier faster (e.g., 2-5 days instead of NET30) in exchange for a fee (`quickPayFeePercent`, typically 2-5%). No external factoring company is involved -- the broker funds it internally.

8. **NOA Release:** When a carrier's relationship with a factoring company ends, the NOA must be explicitly released (with reason and release date). After release, payments revert to the carrier's direct bank account. Released NOAs are kept for audit history.

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
  verificationMethod     String (VarChar 50)         -- PHONE, EMAIL, API, FAX
  apiEndpoint            String? (VarChar 500)
  apiKey                 String? (VarChar 255)
  verificationSLAHours   Int (default 24)
  status                 String (default "ACTIVE", VarChar 50)
  externalId             String? (VarChar 255)
  sourceSystem           String? (VarChar 100)
  customFields           Json (default "{}")
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
  createdAt          DateTime
  updatedAt          DateTime
  deletedAt          DateTime?
  -- Relations
  carrier            Carrier (FK carrierId)
  factoringCompany   FactoringCompany? (FK factoringCompanyId)
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
  createdAt             DateTime
  updatedAt             DateTime
  deletedAt             DateTime?
  -- Relations
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
  customFields       Json (default "{}")
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
  createdAt              DateTime
  updatedAt              DateTime
  deletedAt              DateTime?
  -- Relations
  noaRecord              NOARecord (FK)
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `companyCode` | Required, unique, max 50 chars | "Company code is required" / "Company code already exists" |
| `name` | Required, max 255 chars | "Company name is required" |
| `verificationMethod` | Required, max 50 chars, one of PHONE/EMAIL/API/FAX | "Invalid verification method" |
| `verificationSLAHours` | Positive integer, default 24 | "SLA hours must be a positive number" |
| `noaNumber` | Required, unique, max 50 chars | "NOA number is required" / "NOA number already exists" |
| `effectiveDate` | Required, must be <= expirationDate if set | "Effective date must be before expiration date" |
| `carrierId` on CarrierFactoringStatus | Required, unique (one status per carrier) | "Carrier already has a factoring status record" |
| `factoringCompanyId` | Required when `factoringStatus = FACTORED` | "Factoring company is required for FACTORED status" |
| `quickPayFeePercent` | Decimal 0-100, required when `quickPayEnabled = true` | "Quick-pay fee percentage is required" |
| `paymentAmount` | Positive Decimal, max 12 digits | "Payment amount must be positive" |
| `apiKey` on FactoringCompany | Should not be returned in GET responses | Security: mask in API responses |

---

## 10. Status States

### NOA Status Machine
```
PENDING   -> VERIFIED   (verification completed by staff or API)
VERIFIED  -> ACTIVE     (NOA accepted and payment routing enabled)
ACTIVE    -> EXPIRED    (auto: expirationDate reached)
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

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| No frontend exists -- entire UI not built | P2 | -- | Open |
| No tests for any factoring backend logic | P2 | -- | Open |
| `apiKey` field may be returned in plaintext on GET responses | P1 Security | `factoring-companies.controller.ts` | Needs verification |
| `PaymentRoutingService` has no controller -- not exposed via API | P2 | `routing/payment-routing.service.ts` | By design (internal service) |
| Guard coverage not verified on factoring controllers | P1 Security | All controllers | Needs verification |
| No scheduled job for auto-expiring NOAs past `expirationDate` | P2 | -- | Open |
| DTO validation coverage unknown (only `enums.ts` in `dto/` dir) | P2 | `factoring/dto/enums.ts` | Needs verification |

---

## 12. Tasks

### Backlog

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| FACT-001 | Build Factoring Dashboard page | M (4h) | P2 |
| FACT-002 | Build Factoring Companies CRUD pages | M (4h) | P2 |
| FACT-003 | Build NOA Records management pages | M (4h) | P2 |
| FACT-004 | Build Carrier Factoring Setup page (enrollment flow) | M (4h) | P2 |
| FACT-005 | Build Funding Requests page | M (4h) | P2 |
| FACT-006 | Build Payment Schedule page | M (4h) | P2 |
| FACT-007 | Build Factoring Reports page | M (4h) | P2 |
| FACT-008 | Create React hooks for all factoring endpoints (~9 hooks) | M (3h) | P2 |
| FACT-009 | Verify JwtAuthGuard + tenantId on all 5 controllers | S (1h) | P1 |
| FACT-010 | Ensure `apiKey` is masked/excluded in GET responses | S (1h) | P1 |
| FACT-011 | Add DTO validation classes for all endpoints | M (3h) | P2 |
| FACT-012 | Write backend tests for factoring services | L (6h) | P2 |
| FACT-013 | Build NOA expiration scheduled job (auto ACTIVE -> EXPIRED) | S (2h) | P2 |
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
| Tests for factoring logic | 0 tests | Behind plan |
| Quick-pay as separate feature | Quick-pay integrated into CarrierFactoringStatus as `QUICK_PAY_ONLY` enum | Consolidated |
| Payment routing TBD | PaymentRoutingService exists as internal service | Partial -- not integrated with settlement yet |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles, tenantId -- guard coverage needs verification)
- Carrier Management (carrier records, `carrierId` FK on CarrierFactoringStatus and NOARecord)
- Accounting / Settlements (`settlementId` FK on FactoredPayment; PaymentRoutingService must integrate with settlement creation)
- Storage service (NOA document uploads via `noaDocument` field)

**Depended on by:**
- Accounting (payment routing decisions -- when settling a load, must check carrier's factoring status to determine payee)
- Carrier Detail page (should display carrier's factoring status, active NOA, and factoring company)
- Carrier Portal (carrier may need visibility into factored payment status)
- Analytics (factoring volume, verification turnaround, quick-pay adoption reports)

**Integration points:**
- External factoring company APIs (RTS, Triumph, etc.) via `apiEndpoint` + `apiKey` on FactoringCompany
- Settlement creation workflow must call `PaymentRoutingService` to determine payment destination

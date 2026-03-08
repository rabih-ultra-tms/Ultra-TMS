# Service Hub: Claims (10)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Claims service)
> **Design specs:** `dev_docs/12-Rabih-design-Process/09-claims/` (10 spec files)
> **Priority:** P1 Post-MVP

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D+ (3.5/10) |
| **Confidence** | High — backend audit verified 2026-03-07 |
| **Last Verified** | 2026-03-07 |
| **Backend** | Substantial — 7 sub-modules (claims, documents, items, notes, reports, resolution, subrogation) with 7 controllers, 7 services, 20+ DTOs |
| **Frontend** | Not Built — 0 pages |
| **Tests** | Spec files exist (7 `.service.spec.ts`) but likely empty/minimal |
| **Priority** | P1 — build after core TMS screens verified |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Claims definition in dev_docs |
| Design Specs | Done | 10 spec files in `dev_docs/12-Rabih-design-Process/09-claims/` |
| Backend Controller | Built | 7 controllers across 7 sub-modules |
| Backend Service | Built | 7 services with spec files |
| DTOs | Built | 20+ DTOs (6 claims, 1 documents, 2 items, 2 notes, 6 resolution, 3 subrogation) |
| Prisma Models | Built | 8 models: Claim, ClaimAdjustment, ClaimContact, ClaimDocument, ClaimItem, ClaimNote, ClaimTimeline, SubrogationRecord |
| Frontend Pages | Not Built | 0 pages in `app/(dashboard)/claims/` |
| React Hooks | Not Built | |
| Components | Not Built | |
| Tests | Minimal | 7 `.service.spec.ts` files exist, content unknown |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Claims Dashboard | `/claims` | Not Built | — | KPI stats, open/resolved/total value |
| Claims List | `/claims/list` | Not Built | — | Filterable by status, type, carrier |
| Claim Detail | `/claims/[id]` | Not Built | — | Tabs: Overview, Items, Documents, Notes, Timeline, Resolution |
| New Claim | `/claims/new` | Not Built | — | Multi-step: type, incident, items, documentation |
| Claim Investigation | `/claims/[id]/investigation` | Not Built | — | Investigation workflow, root cause |
| Settlement Calculator | `/claims/[id]/settlement` | Not Built | — | Settlement/payment calculator |
| Claims Reports | `/claims/reports` | Not Built | — | Status, types, financials, overdue reports |
| Carrier Claims History | `/claims/carrier/[carrierId]` | Not Built | — | All claims for a carrier |

---

## 4. API Endpoints

### Claims Core (`@Controller('claims')`)

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| POST | `/api/v1/claims` | ClaimsController | Built | Create claim |
| GET | `/api/v1/claims` | ClaimsController | Built | List claims (paginated, filtered) |
| GET | `/api/v1/claims/:id` | ClaimsController | Built | Claim detail |
| PUT | `/api/v1/claims/:id` | ClaimsController | Built | Update claim |
| DELETE | `/api/v1/claims/:id` | ClaimsController | Built | Soft delete |
| POST | `/api/v1/claims/:id/file` | ClaimsController | Built | File a claim (submit) |
| POST | `/api/v1/claims/:id/assign` | ClaimsController | Built | Assign to handler |
| POST | `/api/v1/claims/:id/status` | ClaimsController | Built | Status change |

### Claim Items (`@Controller('claims/:claimId/items')`)

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/claims/:claimId/items` | ClaimItemsController | Built | List items |
| GET | `/api/v1/claims/:claimId/items/:itemId` | ClaimItemsController | Built | Item detail |
| POST | `/api/v1/claims/:claimId/items` | ClaimItemsController | Built | Add item |
| PUT | `/api/v1/claims/:claimId/items/:itemId` | ClaimItemsController | Built | Update item |
| DELETE | `/api/v1/claims/:claimId/items/:itemId` | ClaimItemsController | Built | Delete item |

### Claim Documents (`@Controller('claims/:claimId/documents')`)

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/claims/:claimId/documents` | ClaimDocumentsController | Built | List documents |
| POST | `/api/v1/claims/:claimId/documents` | ClaimDocumentsController | Built | Attach document |
| DELETE | `/api/v1/claims/:claimId/documents/:id` | ClaimDocumentsController | Built | Remove document |

### Claim Notes (`@Controller('claims/:claimId/notes')`)

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/claims/:claimId/notes` | ClaimNotesController | Built | List notes |
| GET | `/api/v1/claims/:claimId/notes/:noteId` | ClaimNotesController | Built | Note detail |
| POST | `/api/v1/claims/:claimId/notes` | ClaimNotesController | Built | Add note |
| PUT | `/api/v1/claims/:claimId/notes/:noteId` | ClaimNotesController | Built | Update note |
| DELETE | `/api/v1/claims/:claimId/notes/:noteId` | ClaimNotesController | Built | Delete note |

### Resolution (`@Controller('claims')`)

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| POST | `/api/v1/claims/:claimId/approve` | ResolutionController | Built | Approve claim |
| POST | `/api/v1/claims/:claimId/deny` | ResolutionController | Built | Deny claim |
| POST | `/api/v1/claims/:claimId/pay` | ResolutionController | Built | Record payment |
| POST | `/api/v1/claims/:claimId/close` | ResolutionController | Built | Close claim |
| PUT | `/api/v1/claims/:claimId/investigation` | ResolutionController | Built | Update investigation |
| GET | `/api/v1/claims/:claimId/adjustments` | ResolutionController | Built | List adjustments |
| POST | `/api/v1/claims/:claimId/adjustments` | ResolutionController | Built | Create adjustment |
| DELETE | `/api/v1/claims/:claimId/adjustments/:adjustmentId` | ResolutionController | Built | Delete adjustment |

### Subrogation (`@Controller('claims/:claimId/subrogation')`)

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/claims/:claimId/subrogation` | SubrogationController | Built | List subrogation records |
| GET | `/api/v1/claims/:claimId/subrogation/:id` | SubrogationController | Built | Subrogation detail |
| POST | `/api/v1/claims/:claimId/subrogation` | SubrogationController | Built | Create subrogation |
| PUT | `/api/v1/claims/:claimId/subrogation/:id` | SubrogationController | Built | Update subrogation |
| POST | `/api/v1/claims/:claimId/subrogation/:id/recover` | SubrogationController | Built | Record recovery |
| DELETE | `/api/v1/claims/:claimId/subrogation/:id` | SubrogationController | Built | Delete subrogation |

### Reports (`@Controller('claims/reports')`)

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/claims/reports/status` | ReportsController | Built | Status breakdown |
| GET | `/api/v1/claims/reports/types` | ReportsController | Built | Types breakdown |
| GET | `/api/v1/claims/reports/financials` | ReportsController | Built | Financial summary |
| GET | `/api/v1/claims/reports/overdue` | ReportsController | Built | Overdue claims |

**Total: 39 endpoints across 7 controllers**

---

## 5. Components

Not Built — 0 components in `components/claims/`

**Planned (from design specs):**

| Component | Purpose |
|-----------|---------|
| ClaimsDashboardStats | KPI cards (open, resolved, total value, avg resolution time) |
| ClaimsTable | Filterable/sortable claims list |
| ClaimDetailTabs | Tab navigation: Overview, Items, Documents, Notes, Timeline |
| ClaimForm | Multi-step claim creation (type, incident, items, docs) |
| ClaimItemsTable | Damaged items table with add/edit/delete |
| ClaimDocumentsList | Associated documents with upload |
| ClaimNotesTimeline | Notes list with add form |
| ClaimTimeline | Event timeline (status changes, assignments) |
| SettlementCalculator | Settlement amount calculator with adjustments |
| ClaimStatusBadge | Status badge with correct colors |

---

## 6. Hooks

Not Built — 0 hooks in `lib/hooks/claims/`

**Planned:**

| Hook | Purpose |
|------|---------|
| `useClaims` | CRUD operations for claims (list, create, update, delete) |
| `useClaimDetail` | Single claim with items, documents, notes, timeline |
| `useClaimItems` | CRUD for claim items |
| `useClaimNotes` | CRUD for claim notes |
| `useClaimResolution` | Approve, deny, pay, close, adjustments |
| `useClaimReports` | Reports data (status, types, financials, overdue) |

---

## 7. Business Rules

1. **Claim Types:** CARGO_DAMAGE, CARGO_LOSS, SHORTAGE, LATE_DELIVERY, OVERCHARGE, OTHER. Each type has different documentation requirements and resolution workflows.
2. **Filing Window:** Cargo claims must be filed within 9 months of delivery (FMCSA regulation). System warns at 8 months. Claims filed after 9 months are auto-flagged.
3. **Claim Number:** Auto-generated as `CLM-{YYYYMM}-{4-digit-random}` with uniqueness check. Unique constraint enforced at database level.
4. **Insurance Routing:** Claims above $10,000 are automatically routed to the carrier's insurance provider. Below $10,000, internal resolution is attempted first.
5. **Carrier Impact:** Unresolved claims impact carrier performance score (claims ratio = claims $ / total revenue $, weighted 30% in scoring formula). Multiple open claims trigger compliance review.
6. **Documentation Required:** All claims require: incident description, date/time, load number, estimated value. Cargo claims additionally require: BOL, POD, delivery photos, damage photos.
7. **Subrogation:** Recovery process for claims where a third party is at fault. Subrogation records track recovery attempts, amounts recovered, and outstanding balances.
8. **Disposition:** Determines liability: CARRIER_LIABILITY, SHIPPER_LIABILITY, RECEIVER_LIABILITY, SHARED_LIABILITY, NO_LIABILITY. Set during investigation/resolution.
9. **Adjustments:** Claim amounts can be adjusted post-approval. Each adjustment requires a reason and optional approver. All adjustments are tracked with audit trail.
10. **Claim Lifecycle:** DRAFT → SUBMITTED → UNDER_INVESTIGATION → APPROVED/DENIED → SETTLED/CLOSED. Each transition logged to ClaimTimeline.

---

## 8. Data Model

### Claim
```
Claim {
  id                 String (UUID)
  tenantId           String
  loadId             String? (FK → Load)
  orderId            String? (FK → Order)
  carrierId          String? (FK → Carrier)
  companyId          String? (FK → Company)
  claimNumber        String (unique, auto: CLM-{YYYYMM}-{NNN})
  claimType          ClaimType (CARGO_DAMAGE, CARGO_LOSS, SHORTAGE, LATE_DELIVERY, OVERCHARGE, OTHER)
  status             ClaimStatus (DRAFT, SUBMITTED, UNDER_INVESTIGATION, PENDING_DOCUMENTATION, APPROVED, DENIED, SETTLED, CLOSED)
  disposition        ClaimDisposition? (CARRIER_LIABILITY, SHIPPER_LIABILITY, RECEIVER_LIABILITY, SHARED_LIABILITY, NO_LIABILITY)
  claimedAmount      Decimal(12,2)
  approvedAmount     Decimal(12,2)?
  paidAmount         Decimal(12,2) (default: 0)
  incidentDate       DateTime
  incidentLocation   String?
  description        String
  claimantName       String
  claimantCompany    String?
  claimantEmail      String?
  claimantPhone      String?
  filedDate          DateTime (default: now)
  receivedDate       DateTime?
  dueDate            DateTime?
  closedDate         DateTime?
  assignedToId       String? (FK → User)
  investigationNotes String?
  rootCause          String?
  preventionNotes    String?
  externalId         String?
  sourceSystem       String?
  customFields       Json
  createdAt          DateTime
  updatedAt          DateTime
  deletedAt          DateTime?
}
```

### ClaimItem
```
ClaimItem {
  id           String (UUID)
  tenantId     String
  claimId      String (FK → Claim)
  description  String
  quantity     Int
  unitPrice    Decimal(10,2)
  totalValue   Decimal(12,2)
  damageType   String?
  damageExtent String?
  externalId   String?
  sourceSystem String?
  customFields Json
  createdAt    DateTime
  updatedAt    DateTime
  deletedAt    DateTime?
}
```

### ClaimDocument
```
ClaimDocument {
  id           String (UUID)
  tenantId     String
  claimId      String (FK → Claim)
  documentId   String (FK → Document)
  documentType String
  description  String?
  createdAt    DateTime
}
```

### ClaimNote
```
ClaimNote {
  id         String (UUID)
  tenantId   String
  claimId    String (FK → Claim)
  note       String
  noteType   String?
  isInternal Boolean (default: false)
  createdAt  DateTime
}
```

### ClaimTimeline
```
ClaimTimeline {
  id          String (UUID)
  tenantId    String
  claimId     String (FK → Claim)
  eventType   String
  eventData   Json?
  description String?
  oldValue    String?
  newValue    String?
  createdAt   DateTime
}
```

### ClaimAdjustment
```
ClaimAdjustment {
  id             String (UUID)
  tenantId       String
  claimId        String (FK → Claim)
  adjustmentType String
  amount         Decimal(12,2)
  reason         String
  approvedById   String?
  approvedAt     DateTime?
  createdAt      DateTime
}
```

### ClaimContact (not exposed via API yet)
```
ClaimContact {
  id          String (UUID)
  tenantId    String
  claimId     String (FK → Claim)
  contactType String
  name        String
  company     String?
  email       String?
  phone       String?
  address     String?
  notes       String?
  createdAt   DateTime
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `claimType` | Must be valid ClaimType enum | "Invalid claim type" |
| `claimedAmount` | Must be positive Decimal | "Claimed amount must be positive" |
| `incidentDate` | Cannot be in the future | "Incident date cannot be in the future" |
| `claimantName` | Required, max 255 chars | "Claimant name is required" |
| `filedDate` | Cargo claims: must be within 9 months of delivery | "Filing deadline exceeded" |
| `status` transition | Must follow state machine (no skip states) | "Invalid status transition" |
| `approvedAmount` | Cannot exceed claimedAmount | "Approved amount cannot exceed claimed amount" |
| `items.totalValue` | Must equal quantity × unitPrice | "Item total mismatch" |

---

## 10. Status States

### Claim Status Machine
```
DRAFT → SUBMITTED (file claim)
SUBMITTED → UNDER_INVESTIGATION (assign handler)
UNDER_INVESTIGATION → PENDING_DOCUMENTATION (request more docs)
PENDING_DOCUMENTATION → UNDER_INVESTIGATION (docs received)
UNDER_INVESTIGATION → APPROVED (approve)
UNDER_INVESTIGATION → DENIED (deny)
APPROVED → SETTLED (payment recorded)
APPROVED/DENIED/SETTLED → CLOSED (close)
```

### Disposition (set during resolution)
```
CARRIER_LIABILITY — carrier responsible for damage/loss
SHIPPER_LIABILITY — shipper packed/loaded incorrectly
RECEIVER_LIABILITY — receiver caused damage at unload
SHARED_LIABILITY — multiple parties responsible
NO_LIABILITY — no fault (e.g., act of God)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| No frontend screens built | P1 | — | Not Built (P1 priority) |
| ClaimContact model exists but no controller/API | P2 | `schema.prisma` | Missing controller |
| Claim filing window enforcement needs verification | P1 | `claims.service.ts` | Needs check |
| Service spec files may be empty stubs | P2 | `*.service.spec.ts` | Needs check |
| No integration tests | P1 | — | Open |

---

## 12. Tasks

### Backlog

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CLM-101 | Build Claims Dashboard page | M (4h) | P1 |
| CLM-102 | Build Claims List page | M (4h) | P1 |
| CLM-103 | Build Claim Detail page (6 tabs) | L (8h) | P1 |
| CLM-104 | Build New Claim form (multi-step) | L (8h) | P1 |
| CLM-105 | Build Claims Reports page | M (4h) | P1 |
| CLM-106 | Write claims hooks (6 planned) | M (4h) | P1 |
| CLM-107 | Build ClaimContact controller/API | S (2h) | P2 |
| CLM-108 | Write claims integration tests | M (4h) | P1 |
| CLM-109 | Verify filing window enforcement in service | S (1h) | P1 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Claims Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/09-claims/01-claims-dashboard.md` |
| Claims List | Full 15-section | `dev_docs/12-Rabih-design-Process/09-claims/02-claims-list.md` |
| Claim Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/09-claims/03-claim-detail.md` |
| New Claim | Full 15-section | `dev_docs/12-Rabih-design-Process/09-claims/04-new-claim.md` |
| Claim Investigation | Full 15-section | `dev_docs/12-Rabih-design-Process/09-claims/05-claim-investigation.md` |
| Damage Photos | Full 15-section | `dev_docs/12-Rabih-design-Process/09-claims/06-damage-photos.md` |
| Settlement Calculator | Full 15-section | `dev_docs/12-Rabih-design-Process/09-claims/07-settlement-calculator.md` |
| Claim Resolution | Full 15-section | `dev_docs/12-Rabih-design-Process/09-claims/08-claim-resolution.md` |
| Claims Report | Full 15-section | `dev_docs/12-Rabih-design-Process/09-claims/09-claims-report.md` |
| Carrier Claims History | Full 15-section | `dev_docs/12-Rabih-design-Process/09-claims/10-carrier-claims-history.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|---------------|--------|-------|
| Backend: 7 controllers, 7 services | 7 controllers, 7 services, 20+ DTOs | Matches plan |
| Prisma: Claim + ClaimItem + ClaimDocument | 8 models (+ ClaimNote, ClaimTimeline, ClaimAdjustment, ClaimContact, SubrogationRecord) | Exceeds plan |
| Frontend: 5 screens planned | 0 built | Full gap |
| API: 7 endpoints listed in old hub | 39 actual endpoints across 7 controllers | Old hub severely underestimated |
| Subrogation: not mentioned | Full sub-module with CRUD | Bonus feature |
| Resolution: not mentioned | Full sub-module with approve/deny/pay/close/adjustments | Bonus feature |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles — ADMIN, CLAIMS_HANDLER)
- TMS Core (load/order data for claim reference)
- Carrier Management (carrier data, insurance info, performance scoring)
- Documents (ClaimDocument references Document model)
- Accounting (claim settlements affect payables)

**Depended on by:**
- Accounting (claim settlements create payable entries)
- Carrier Management (claims ratio in carrier performance score)
- Analytics (claims metrics in reporting)
- Safety (incident correlation)

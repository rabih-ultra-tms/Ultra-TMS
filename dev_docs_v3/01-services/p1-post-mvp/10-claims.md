# Service Hub: Claims (10)

> **Priority:** P1 Post-MVP | **Status:** Backend Partial, Frontend Not Built
> **Source of Truth** — dev_docs_v3 | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Claims service)
> **Design specs:** `dev_docs/12-Rabih-design-Process/` (claims folder if exists)

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — 7 controllers, 7 services exist in `apps/api/src/modules/claims/` |
| **Frontend** | Not Built |
| **Tests** | None |
| **Priority** | P1 — after core TMS Core frontend is complete |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Claims definition in dev_docs |
| Backend Controller | Partial | 7 controllers in claims module |
| Backend Service | Partial | 7 services in claims module |
| Prisma Models | Partial | Claim, ClaimItem, ClaimDocument models likely |
| Frontend Pages | Not Built | 0 screens |
| Hooks | Not Built | |
| Components | Not Built | |
| Tests | None | |

---

## 3. Screens

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Claims List | `/claims` | Not Built | All claims: cargo, liability, damage |
| Claim Detail | `/claims/[id]` | Not Built | Tabs: Overview, Documents, Timeline, Settlement |
| New Claim | `/claims/new` | Not Built | Multi-step: type, incident, documentation |
| Claims Dashboard | `/claims/dashboard` | Not Built | KPI: open, resolved, total value |
| Claims Reports | `/claims/reports` | Not Built | Phase 2+ |

---

## 4. API Endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/claims` | Partial | List claims (paginated, filtered by status/type) |
| POST | `/api/v1/claims` | Partial | Create claim |
| GET | `/api/v1/claims/:id` | Partial | Detail |
| PUT | `/api/v1/claims/:id` | Partial | Update |
| PATCH | `/api/v1/claims/:id/status` | Partial | Status change |
| GET | `/api/v1/claims/:id/documents` | Partial | Supporting documents |
| POST | `/api/v1/claims/:id/documents` | Partial | Upload document |

---

## 5. Business Rules

1. **Claim Types:** CARGO (freight damage/loss), LIABILITY (third-party injury/property), DRIVER_INJURY (workers comp), EQUIPMENT (vehicle damage). Each type has different documentation requirements and resolution workflows.
2. **Filing Window:** Cargo claims must be filed within 9 months of delivery (FMCSA regulation). System warns at 8 months. Claims filed after 9 months are auto-flagged as LATE_FILED.
3. **Insurance Routing:** Claims above $10,000 are automatically routed to the carrier's insurance provider via the documented process. Below $10,000, internal resolution is attempted first.
4. **Carrier Impact:** Unresolved claims impact carrier performance score (claims ratio = claims $ / total revenue $, weighted 30% in scoring formula). Multiple open claims trigger a carrier compliance review.
5. **Documentation Required:** All claims require: incident description, date/time, load number, estimated value. Cargo claims additionally require: BOL, POD, delivery photos, damage photos.

---

## 6. Data Model

```
Claim {
  id          String (UUID)
  claimNumber String (auto: CLM-{YYYYMM}-{NNN})
  type        ClaimType (CARGO, LIABILITY, DRIVER_INJURY, EQUIPMENT)
  status      ClaimStatus (OPEN, UNDER_REVIEW, PENDING_DOCS, SETTLED, DENIED, CLOSED)
  loadId      String? (FK → Load)
  carrierId   String? (FK → Carrier)
  incidentDate DateTime
  filedDate   DateTime
  value       Decimal (claimed amount)
  settledAmount Decimal? (actual payout)
  description String
  documents   ClaimDocument[]
  tenantId    String
  createdAt   DateTime
  updatedAt   DateTime
}
```

---

## 7. Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| No frontend screens | P0 | Not Built |
| Claim filing window enforcement needs verification | P1 | Needs check |
| No tests | P0 | Open |

---

## 8. Tasks

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CLM-101 | Build Claims List + Detail pages | L (8h) | P1 |
| CLM-102 | Build New Claim form (multi-step) | L (8h) | P1 |
| CLM-103 | Build Claims Dashboard | M (4h) | P1 |
| CLM-104 | Write claims tests | M (4h) | P1 |

---

## 9. Design Links

| Screen | Path |
|--------|------|
| Claims specs | `dev_docs/12-Rabih-design-Process/` (claims folder) |

---

## 10. Dependencies

**Depends on:** TMS Core (load/carrier data), Carrier Management (insurance), Documents service

**Depended on by:** Accounting (claim settlements), Carrier Management (performance score)

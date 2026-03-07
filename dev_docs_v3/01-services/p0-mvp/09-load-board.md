# Service Hub: Load Board (09)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Load Board service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/08-load-board/` (files)
> **v2 hub (historical):** `dev_docs_v2/03-services/07-load-board.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Confidence** | Low — backend minimal; frontend confirmed not built |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial stub — `apps/api/src/modules/load-board/` exists with basic structure |
| **Frontend** | Not Built |
| **Tests** | None |
| **MVP Status** | Deferred from v2 to P0 edge case — build ONLY after core TMS screens done |
| **External Deps** | DAT TMS, Truckstop.com integration required for external posting |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Load Board definition in dev_docs |
| Design Specs | Done | Design specs in dev_docs/12-Rabih-design-Process/08-load-board/ |
| Backend Controller | Partial stub | Basic controller exists, limited logic |
| Backend Service | Partial stub | CRUD structure, no external API integration |
| Prisma Models | Partial | LoadBoardPosting model exists |
| Frontend Pages | Not Built | 0 screens |
| React Hooks | Not Built | Must be created |
| Components | Not Built | Must be created |
| Tests | None | |
| External APIs | Not Integrated | DAT and Truckstop.com credentials needed |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Load Board List | `/load-board` | Not Built | — | Internal loads available for posting |
| Post Load | `/load-board/post` | Not Built | — | Post to DAT/Truckstop |
| Posted Loads | `/load-board/posted` | Not Built | — | Active external postings |
| Carrier Offers | `/load-board/offers` | Not Built | — | Inbound carrier offers |
| Load Board Settings | `/load-board/settings` | Not Built | — | API credentials config |

---

## 4. API Endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/load-board` | LoadBoardController | Stub | Available loads for posting |
| POST | `/api/v1/load-board/post` | LoadBoardController | Stub | Post to external boards |
| GET | `/api/v1/load-board/postings` | LoadBoardController | Stub | Active postings list |
| DELETE | `/api/v1/load-board/postings/:id` | LoadBoardController | Stub | Remove posting |
| GET | `/api/v1/load-board/offers` | LoadBoardController | Stub | Inbound carrier offers |
| POST | `/api/v1/load-board/offers/:id/accept` | LoadBoardController | Stub | Accept carrier offer |
| POST | `/api/v1/load-board/offers/:id/reject` | LoadBoardController | Stub | Reject carrier offer |

---

## 5. Components

All must be built:

| Component | Planned Path | Priority |
|-----------|-------------|----------|
| LoadBoardTable | `components/load-board/load-board-table.tsx` | P0 |
| PostingForm | `components/load-board/posting-form.tsx` | P0 |
| PostingStatusBadge | `components/load-board/posting-status-badge.tsx` | P0 |
| OfferCard | `components/load-board/offer-card.tsx` | P0 |
| LoadBoardSettings | `components/load-board/load-board-settings.tsx` | P0 |

---

## 6. Hooks

All must be built:

| Hook | Endpoints | Priority |
|------|-----------|----------|
| `useLoadBoard` | GET `/load-board` | P0 |
| `usePostLoad` | POST `/load-board/post` | P0 |
| `usePostings` | GET `/load-board/postings` | P0 |
| `useOffers` | GET `/load-board/offers` | P0 |
| `useAcceptOffer` | POST `/load-board/offers/:id/accept` | P0 |

---

## 7. Business Rules

1. **Posting Eligibility:** Only loads in PENDING or TENDERED status can be posted to external boards. Loads already ACCEPTED or beyond cannot be posted. Once a carrier accepts via Load Board, the load moves to TENDERED status in TMS Core.
2. **External Board Priority:** DAT TMS is the primary integration. Truckstop.com is secondary. Internal load board (available to registered carriers only) is always active regardless of external API status.
3. **Posting Expiry:** External postings auto-expire after 72 hours if no carrier accepts. Dispatcher is notified via dashboard alert. Expired postings can be re-posted with updated rate.
4. **Rate Visibility:** The rate shown on external boards is the carrier rate (cost side), NOT the customer rate (revenue side). The markup/margin is never exposed to carriers.
5. **Carrier Offer Acceptance:** When a carrier submits an offer via external board, it appears in the `offers` queue. Dispatcher reviews and accepts or rejects. Acceptance automatically: creates carrier assignment in TMS Core, moves load to TENDERED status, removes posting from boards.
6. **Duplicate Prevention:** A load can only be posted once per board at a time. Re-posting requires removing the existing posting first. System enforces this at API level.
7. **Compliance Check:** When a carrier offer is accepted from the Load Board, the same compliance validation runs as for direct assignment (insurance valid, authority active, not blacklisted).
8. **Data Sync:** External board status (DAT/Truckstop) is synced every 15 minutes. If external API is unavailable, internal posting remains active. External status shows "SYNC ERROR" with last known status.

---

## 8. Data Model

### LoadBoardPosting
```
LoadBoardPosting {
  id              String (UUID)
  loadId          String (FK → Load)
  status          PostingStatus (ACTIVE, EXPIRED, ACCEPTED, CANCELLED)
  boards          String[] (DAT, TRUCKSTOP, INTERNAL)
  postedRate      Decimal (carrier rate)
  equipmentType   String
  originCity      String
  originState     String
  destCity        String
  destState       String
  pickupDate      DateTime
  deliveryDate    DateTime
  expiresAt       DateTime (default: postedAt + 72h)
  externalIds     Json (DAT posting ID, Truckstop posting ID)
  offers          LoadBoardOffer[]
  tenantId        String
  createdAt       DateTime
  updatedAt       DateTime
}
```

### LoadBoardOffer
```
LoadBoardOffer {
  id          String (UUID)
  postingId   String (FK → LoadBoardPosting)
  carrierId   String? (FK → Carrier, if registered)
  carrierName String (from external board, may not be in system)
  mcNumber    String?
  offerRate   Decimal
  notes       String?
  status      OfferStatus (PENDING, ACCEPTED, REJECTED, WITHDRAWN)
  tenantId    String
  createdAt   DateTime
  updatedAt   DateTime
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `loadId` | Load must be in PENDING or TENDERED status | "Load is not eligible for posting" |
| `postedRate` | Must be positive Decimal, less than customer rate | "Posted rate cannot exceed customer rate" |
| `expiresAt` | Max 72 hours from posting time | "Posting expires in max 72 hours" |
| Duplicate posting | Load cannot have active posting on same board | "Load already posted to [board]" |
| Carrier offer acceptance | Carrier must pass compliance check | "Carrier not eligible — [specific reason]" |

---

## 10. Status States

### Posting Status Machine
```
ACTIVE → EXPIRED (auto at expiresAt)
ACTIVE → ACCEPTED (carrier offer accepted)
ACTIVE → CANCELLED (manual removal)
EXPIRED → ACTIVE (re-post with updated rate)
```

### Offer Status Machine
```
PENDING → ACCEPTED (dispatcher accepts → triggers TMS Core assignment)
PENDING → REJECTED (dispatcher rejects)
PENDING → WITHDRAWN (carrier withdraws)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| No frontend screens built | P0 | `(dashboard)/load-board/` | Open |
| Backend endpoints are stubs | P0 | `apps/api/src/modules/load-board/` | Open |
| DAT TMS API not integrated | P1 | — | Needs credentials |
| Truckstop.com API not integrated | P1 | — | Needs credentials |
| No tests | P0 | — | Must Build |
| External API credentials not in .env.example | P1 | `.env.example` | Open |

---

## 12. Tasks

### Quality Sprint (Active)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| (No active QS task — low priority) | — | — | — |

### Backlog
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| LB-101 | Build Load Board List page | L (6h) | P0 |
| LB-102 | Build Post Load form + external board posting | L (8h) | P0 |
| LB-103 | Build Offers queue (review + accept/reject) | M (4h) | P0 |
| LB-104 | Implement DAT TMS API integration | L (8h) | P1 |
| LB-105 | Implement Truckstop.com API integration | L (8h) | P1 |
| LB-106 | Build Load Board backend endpoints (replace stubs) | L (8h) | P0 |
| LB-107 | Write load board tests | M (4h) | P1 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Load Board | Full 15-section | `dev_docs/12-Rabih-design-Process/08-load-board/01-load-board.md` |
| Post Load | Full 15-section | `dev_docs/12-Rabih-design-Process/08-load-board/02-post-load.md` |
| Carrier Offers | Full 15-section | `dev_docs/12-Rabih-design-Process/08-load-board/03-carrier-offers.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Load Board = deferred to post-MVP (v2) | Moved to P0 edge case | Priority shifted |
| Full DAT/Truckstop integration | Stubs only | Integration gap |
| Internal load board | Partially designed | Not built |
| 5 screens planned | 0 built | 100% gap |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, DISPATCHER role required)
- TMS Core (loads to post, carrier assignment on acceptance)
- Carrier Management (carrier compliance check on offer acceptance)
- DAT TMS API (external posting — requires API key)
- Truckstop.com API (external posting — requires API key)

**Depended on by:**
- TMS Core (carrier assigned via Load Board → load moves to TENDERED)
- Carrier Management (carriers found via Load Board may need registration)

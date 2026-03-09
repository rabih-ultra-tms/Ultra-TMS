# Service Hub: Load Board (09)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-09 tribunal)
> **Original definition:** `dev_docs/02-services/` (Load Board service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/08-load-board/` (files)
> **v2 hub (historical):** `dev_docs_v2/03-services/07-load-board.md`
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/batch-1-p0/PST-09-load-board.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B (8.0/10) |
| **Confidence** | High — code-verified via PST-09 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Built — 62 endpoints across 9 controllers in `apps/api/src/modules/load-board/` |
| **Frontend** | Built — 4 pages (341 LOC), 10 components (1,744 LOC), 3 hook files (14 hooks, 374 LOC) |
| **Tests** | Frontend: 13 test suites (~30+ cases); Backend: 10 spec files, 52+ test cases — **65+ total** |
| **MVP Status** | Internal load board functional. External API integration (DAT/Truckstop) not yet connected. |
| **External Deps** | DAT TMS, Truckstop.com integration required for external posting (models exist, no API calls) |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Load Board definition in dev_docs |
| Design Specs | Done | Design specs in dev_docs/12-Rabih-design-Process/08-load-board/ |
| Backend Controllers | Built | 9 controllers, 62 endpoints (28 new-style with RolesGuard + 34 legacy v1 JWT-only) |
| Backend Services | Built | 8+ service files with full business logic, DTOs, class-validator decorators |
| Prisma Models | Built | 5 models: LoadPosting, LoadBid, LoadTender, LoadBoardAccount, LoadBoardProvider (200+ fields total) |
| Frontend Pages | Built | 4 pages in `app/(dashboard)/load-board/` (341 LOC) |
| React Hooks | Built | 3 hook files: `lib/hooks/load-board/` (2 files, 14 hooks) + `lib/hooks/tms/use-load-board.ts` (legacy, 3 hooks) |
| Components | Built | 10 components in `components/load-board/` (1,744 LOC) |
| Types | Built | Full coverage in `types/load-board.ts` (250 LOC) — LoadPosting, LoadBid, CarrierMatch, etc. |
| Tests | Built | FE: 13 suites; BE: 10 spec files (52+ cases) — 65+ total |
| External APIs | Not Integrated | DAT and Truckstop.com — provider/account models exist, no actual API calls |
| Security | Partial | JWT on all 62 endpoints; RolesGuard on 28/62 (3 new controllers). 6 legacy controllers missing RolesGuard. |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Load Board Dashboard | `/load-board` | Built | 7/10 | 97 LOC, KPI stats, quick actions, recent postings |
| Post Load | `/load-board/post` | Built | 7/10 | 33 LOC, wrapper around PostingForm component |
| Posting Detail | `/load-board/postings/[id]` | Built | 8/10 | 146 LOC, detail + bids list + carrier matches + cancel confirmation |
| Load Search | `/load-board/search` | Built | 7/10 | 64 LOC, filters + results, uses `useSearchPostings` hook |
| Carrier Offers | `/load-board/offers` | Not Built | — | No separate offers page |
| Load Board Settings | `/load-board/settings` | Not Built | — | API credentials config |

---

## 4. API Endpoints

### LoadPostingsController (11 endpoints, RolesGuard: ADMIN, DISPATCHER, SALES_REP, CARRIER_MANAGER, CARRIER)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/load-postings` | Built | List postings with filters |
| POST | `/load-postings` | Built | Create posting |
| GET | `/load-postings/geo-search` | Built | Geo-radius search |
| GET | `/load-postings/lane-search` | Built | Lane-based search |
| GET | `/load-postings/:id` | Built | Posting detail |
| PUT | `/load-postings/:id` | Built | Update posting |
| POST | `/load-postings/:id/expire` | Built | Force expire |
| POST | `/load-postings/:id/refresh` | Built | Refresh/extend posting |
| POST | `/load-postings/:id/track-view` | Built | Track carrier view |
| GET | `/load-postings/:id/metrics` | Built | Posting performance metrics |
| DELETE | `/load-postings/:id` | Built | Soft-delete posting |

### LoadBidsController (10 endpoints, RolesGuard: ADMIN, DISPATCHER, SALES_REP, CARRIER_MANAGER, CARRIER)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/load-bids` | Built | List all bids |
| POST | `/load-bids` | Built | Create bid |
| GET | `/load-bids/by-posting/:postingId` | Built | Bids for a specific posting |
| GET | `/load-bids/by-carrier/:carrierId` | Built | Bids by a specific carrier |
| GET | `/load-bids/:id` | Built | Bid detail |
| PUT | `/load-bids/:id` | Built | Update bid |
| POST | `/load-bids/:id/counter` | Built | Counter-offer |
| POST | `/load-bids/:id/accept` | Built | Accept bid → triggers TMS assignment |
| POST | `/load-bids/:id/reject` | Built | Reject bid |
| POST | `/load-bids/:id/withdraw` | Built | Carrier withdraws bid |

### LoadTendersController (7 endpoints, RolesGuard: ADMIN, DISPATCHER, OPERATIONS_MANAGER, CARRIER_MANAGER)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/load-tenders` | Built | List tenders |
| POST | `/load-tenders` | Built | Create tender (BROADCAST/WATERFALL/SPECIFIC types) |
| GET | `/load-tenders/active-by-carrier/:carrierId` | Built | Active tenders for carrier |
| GET | `/load-tenders/:id` | Built | Tender detail |
| PUT | `/load-tenders/:id` | Built | Update tender |
| POST | `/load-tenders/:id/cancel` | Built | Cancel tender |
| POST | `/load-tenders/:id/respond` | Built | Carrier responds to tender |

### PostingController — Legacy v1 (9 endpoints, JWT only — NO RolesGuard)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/load-board/posts` | Built | List posts |
| POST | `/api/v1/load-board/posts` | Built | Create post |
| GET | `/api/v1/load-board/posts/:id` | Built | Post detail |
| PUT | `/api/v1/load-board/posts/:id` | Built | Update post |
| DELETE | `/api/v1/load-board/posts/:id` | Built | Delete post |
| POST | `/api/v1/load-board/posts/bulk` | Built | Bulk post |
| DELETE | `/api/v1/load-board/posts/bulk` | Built | Bulk remove |
| GET | `/api/v1/load-board/posts/by-load/:loadId` | Built | Posts for a load |
| GET | `/api/v1/load-board/posts/stats` | Built | Posting stats |

### AccountsController (6 endpoints, JWT only — NO RolesGuard — **HIGH RISK**)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/load-board/accounts` | Built | List external board accounts |
| POST | `/load-board/accounts` | Built | Create account (DAT/Truckstop credentials) |
| GET | `/load-board/accounts/:id` | Built | Account detail |
| PUT | `/load-board/accounts/:id` | Built | Update account |
| DELETE | `/load-board/accounts/:id` | Built | Delete account |
| POST | `/load-board/accounts/:id/test-connection` | Built | Test API connection |

### AnalyticsController (3 endpoints, JWT only — NO RolesGuard)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/load-board/analytics/posts` | Built | Post metrics |
| GET | `/load-board/analytics/leads` | Built | Lead metrics |
| GET | `/load-board/analytics/boards` | Built | Board comparison |

### CapacityController (4 endpoints, JWT only — NO RolesGuard)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/load-board/capacity/search` | Built | Capacity search with geo radius |
| GET | `/api/v1/load-board/capacity` | Built | List saved searches |
| GET | `/api/v1/load-board/capacity/:id` | Built | Search detail |
| POST | `/api/v1/load-board/capacity/:id/contact` | Built | Contact carrier from search |

### LeadsController (7 endpoints, JWT only — NO RolesGuard)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/load-board/leads` | Built | List leads |
| POST | `/api/v1/load-board/leads` | Built | Create lead |
| GET | `/api/v1/load-board/leads/:id` | Built | Lead detail |
| PUT | `/api/v1/load-board/leads/:id` | Built | Update lead |
| POST | `/api/v1/load-board/leads/:id/assign` | Built | Assign lead |
| POST | `/api/v1/load-board/leads/:id/qualify` | Built | Qualify lead |
| POST | `/api/v1/load-board/leads/:id/convert` | Built | Convert lead to customer |

### RulesController (5 endpoints, JWT only — NO RolesGuard — **HIGH RISK**)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/load-board/rules` | Built | List automation rules |
| POST | `/load-board/rules` | Built | Create rule |
| GET | `/load-board/rules/:id` | Built | Rule detail |
| PUT | `/load-board/rules/:id` | Built | Update rule |
| DELETE | `/load-board/rules/:id` | Built | Delete rule |

**Architecture note:** Two API generations coexist. New-style controllers (`/load-postings`, `/load-bids`, `/load-tenders`) use the newer Prisma models (LoadPosting, LoadBid, LoadTender) and have full RolesGuard. Legacy v1 controllers (`/api/v1/load-board/*`) use older models (LoadPost) and have JWT-only auth. Frontend hooks target the new controllers. Consolidation needed — see Known Issues.

---

## 5. Components

10 components in `components/load-board/` (1,744 LOC total):

| Component | Path | LOC | Status | Notes |
|-----------|------|-----|--------|-------|
| PostingForm | `components/load-board/posting-form.tsx` | 431 | Built | react-hook-form + Zod, 14 fields, 9 equipment types |
| BidsList | `components/load-board/bids-list.tsx` | 264 | Built | Bid management with accept/reject/counter dialogs |
| LoadSearchFilters | `components/load-board/load-search-filters.tsx` | 230 | Built | Advanced geo/lane filters |
| PostingDetailCard | `components/load-board/posting-detail-card.tsx` | 185 | Built | 8-item details grid |
| LoadSearchResults | `components/load-board/load-search-results.tsx` | 157 | Built | Results with rate display, time-ago |
| LbRecentPostings | `components/load-board/lb-recent-postings.tsx` | 132 | Built | Scrollable card list with status badges |
| CarrierMatchCard | `components/load-board/carrier-match-card.tsx` | 109 | Built | Match score color coding (green/yellow/red) |
| BidCounterDialog | `components/load-board/bid-counter-dialog.tsx` | 100 | Built | Counter-offer modal with validation |
| CarrierMatchesPanel | `components/load-board/carrier-matches-panel.tsx` | 87 | Built | Container sorted by match score |
| LbDashboardStats | `components/load-board/lb-dashboard-stats.tsx` | 49 | Built | 4-column KPI grid |

---

## 6. Hooks

3 hook files (14 exported hooks total):

### Primary: `lib/hooks/load-board/use-loadboard-dashboard.ts`
| Hook | Endpoint | Cache | Envelope | Notes |
|------|----------|-------|----------|-------|
| `useLoadBoardDashboardStats()` | `/load-board/analytics/posts` | 60s | `unwrap<T>()` | 4-field stats |
| `useRecentPostings()` | `/load-postings` | 30s | `unwrap<T>()` | Limit + status filter |

### Primary: `lib/hooks/load-board/use-postings.ts`
| Hook | Endpoint | Cache | Envelope | Notes |
|------|----------|-------|----------|-------|
| `usePostings()` | `/load-postings` | — | `unwrap<T>()` | List with pagination |
| `useSearchPostings()` | `/load-postings` | — | `unwrap<T>()` | Filtered search |
| `usePosting()` | `/load-postings/:id` | — | `unwrap<T>()` | Single posting detail |
| `useBids()` | `/load-bids/by-posting/:id` | — | `unwrap<T>()` | Bids for a posting |
| `useCarrierMatches()` | `/load-postings/:id/metrics` | — | `unwrap<T>()` | Carrier match results |
| `useCreatePosting()` | POST `/load-postings` | — | `unwrap<T>()` | Mutation |
| `useUpdatePosting()` | PUT `/load-postings/:id` | — | `unwrap<T>()` | Mutation |
| `useCancelPosting()` | POST `/load-postings/:id/expire` | — | `unwrap<T>()` | Mutation |
| `useAcceptBid()` | POST `/load-bids/:id/accept` | — | `unwrap<T>()` | Mutation |
| `useRejectBid()` | POST `/load-bids/:id/reject` | — | `unwrap<T>()` | Mutation |
| `useCounterBid()` | POST `/load-bids/:id/counter` | — | `unwrap<T>()` | Mutation |
| `useTenderToCarrier()` | POST `/load-tenders` | — | `unwrap<T>()` | Mutation |

### Legacy: `lib/hooks/tms/use-load-board.ts` (should deprecate)
| Hook | Endpoint | Cache | Envelope | Notes |
|------|----------|-------|----------|-------|
| `useLoadPosts()` | `/load-board/posts` (v1) | — | `unwrap<T>()` | Legacy — different endpoint pattern |
| `useLoadPost()` | `/load-board/posts/:id` (v1) | — | `unwrap<T>()` | Legacy |
| `useLoadBoardStats()` | `/load-board/stats` (v1) | — | `unwrap<T>()` | Legacy |

**Note:** Two hook sets exist with different endpoints. `lib/hooks/load-board/` is the primary set and targets the new controllers. `lib/hooks/tms/use-load-board.ts` is legacy, targets v1 API, and is not used by current pages. Should be deprecated or consolidated.

**Envelope pattern:** Both hook files use a consistent `unwrap<T>()` helper. No anti-patterns found (no double-unwrapping, no raw `response.data.data`).

---

## 7. Business Rules

1. **Posting Eligibility:** Only loads in PENDING or TENDERED status can be posted to external boards. Loads already ACCEPTED or beyond cannot be posted. Once a carrier accepts via Load Board, the load moves to TENDERED status in TMS Core.
2. **External Board Priority:** DAT TMS is the primary integration. Truckstop.com is secondary. Internal load board (available to registered carriers only) is always active regardless of external API status.
3. **Posting Expiry:** External postings auto-expire after 72 hours if no carrier accepts. Dispatcher is notified via dashboard alert. Expired postings can be re-posted with updated rate.
4. **Auto-Refresh:** Postings support `autoRefresh` with configurable `refreshInterval`. `lastRefreshedAt` tracks when posting was last refreshed on external boards.
5. **Rate Visibility:** The rate shown on external boards is the carrier rate (cost side), NOT the customer rate (revenue side). The markup/margin is never exposed to carriers. Rate fields include `rateType`, `rateMin`, `rateMax` for flexible rate structures.
6. **Carrier Offer Acceptance:** When a carrier submits a bid, it enters the bids queue. Dispatcher reviews and accepts, rejects, or counters. Acceptance automatically: creates carrier assignment in TMS Core, moves load to TENDERED status, removes posting from boards.
7. **Counter-Offer Flow:** Bids support counter-offers via `counterAmount`, `counterNotes`, `counterAt` fields. Status moves to COUNTERED. Carrier can accept counter or withdraw.
8. **Duplicate Prevention:** A load can only be posted once per board at a time. Re-posting requires removing the existing posting first. System enforces this at API level.
9. **Compliance Check:** When a carrier bid is accepted from the Load Board, the same compliance validation runs as for direct assignment (insurance valid, authority active, not blacklisted).
10. **Tender Distribution:** Tenders support three distribution modes: BROADCAST (all carriers), WATERFALL (sequential with timeout — `waterfallTimeoutMinutes`, `currentPosition` tracking), and SPECIFIC (named carriers). TenderRecipient sub-relation tracks per-carrier ordering and responses.
11. **Lead Pipeline:** Leads follow a lifecycle: create → assign → qualify → convert to customer. LeadsController provides full CRUD + lifecycle transitions.
12. **Capacity Search:** Geo-radius capacity search using `originLat`/`originLng`/`destLat`/`destLng` (Decimal 10,7). Results include contact capability.
13. **Automation Rules:** RulesController manages auto-posting rules (e.g., auto-post loads matching certain lanes/equipment to specific boards).
14. **Data Sync:** External board status (DAT/Truckstop) is synced every 15 minutes. If external API is unavailable, internal posting remains active. External status shows "SYNC ERROR" with last known status.
15. **View Tracking:** `track-view` endpoint records carrier views on postings. `viewCount` and `inquiryCount` on LoadPosting track engagement.

---

## 8. Data Model

### LoadPosting
```
LoadPosting {
  id                  String (UUID)
  loadId              String (FK → Load)
  tenantId            String
  status              PostingStatus (ACTIVE, EXPIRED, ACCEPTED, CANCELLED)
  postingType         String
  visibility          String
  showRate            Boolean
  rateType            String
  rateMin             Decimal?
  rateMax             Decimal?
  postedRate          Decimal (carrier rate)
  equipmentType       String
  originCity          String
  originState         String
  originZip           String
  originLat           Decimal(10,7)
  originLng           Decimal(10,7)
  destCity            String
  destState           String
  destZip             String
  destLat             Decimal(10,7)
  destLng             Decimal(10,7)
  totalMiles          Decimal?
  weightLbs           Decimal?
  pickupDate          DateTime
  deliveryDate        DateTime
  expiresAt           DateTime (default: postedAt + 72h)
  autoRefresh         Boolean
  refreshInterval     Int?
  lastRefreshedAt     DateTime?
  viewCount           Int (default: 0)
  inquiryCount        Int (default: 0)
  datPostingId        String? (DAT external ref)
  truckstopPostingId  String? (Truckstop external ref)
  externalId          String?
  sourceSystem        String?
  customFields        Json?
  carrierIds          String[]
  createdById         String
  updatedById         String?
  createdAt           DateTime
  updatedAt           DateTime
  deletedAt           DateTime?
  bids                LoadBid[]
}
```

### LoadBid
```
LoadBid {
  id               String (UUID)
  postingId        String (FK → LoadPosting)
  carrierId        String? (FK → Carrier)
  tenantId         String
  bidAmount        Decimal
  rateType         String
  truckNumber      String?
  driverName       String?
  driverPhone      String?
  counterAmount    Decimal?
  counterNotes     String?
  counterAt        DateTime?
  acceptedAt       DateTime?
  rejectedAt       DateTime?
  rejectionReason  String?
  submittedAt      DateTime
  expiresAt        DateTime?
  source           String
  status           BidStatus (PENDING, ACCEPTED, REJECTED, WITHDRAWN, COUNTERED, EXPIRED)
  externalId       String?
  sourceSystem     String?
  customFields     Json?
  createdAt        DateTime
  updatedAt        DateTime
  deletedAt        DateTime?
}
```

### LoadTender
```
LoadTender {
  id                        String (UUID)
  loadId                    String (FK → Load)
  tenantId                  String
  type                      TenderType (BROADCAST, WATERFALL, SPECIFIC)
  status                    TenderStatus
  waterfallTimeoutMinutes   Int?
  currentPosition           Int? (for WATERFALL — tracks which carrier is active)
  expiresAt                 DateTime?
  notes                     String?
  recipients                TenderRecipient[] (carrier recipients with position ordering)
  externalId                String?
  sourceSystem              String?
  customFields              Json?
  createdById               String
  createdAt                 DateTime
  updatedAt                 DateTime
  deletedAt                 DateTime?
}
```

### LoadBoardAccount
```
LoadBoardAccount {
  id              String (UUID)
  tenantId        String
  providerId      String (FK → LoadBoardProvider)
  accountName     String
  credentials     Json (encrypted API credentials)
  isVerified      Boolean
  lastVerifiedAt  DateTime?
  postCount       Int (default: 0)
  maxPosts        Int?
  isActive        Boolean
  externalId      String?
  sourceSystem    String?
  customFields    Json?
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime?
}
```

### LoadBoardProvider
```
LoadBoardProvider {
  id              String (UUID)
  tenantId        String
  name            String (DAT, TRUCKSTOP, etc.)
  type            String
  apiBaseUrl      String?
  apiCredentials  Json? (encrypted)
  autoPostRules   Json?
  rateLimitMax    Int?
  rateLimitWindow Int?
  isActive        Boolean
  externalId      String?
  sourceSystem    String?
  customFields    Json?
  accounts        LoadBoardAccount[]
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime?
}
```

**Additional models referenced (not separate hub-level entities):**

| Model | Purpose | Notes |
|-------|---------|-------|
| TenderRecipient | Carrier recipients for tenders with position ordering | Nested relation on LoadTender |
| LoadPost | Legacy posting model (v1 API) | Used by PostingController, separate from LoadPosting |
| CarrierLoadView | Tracks carrier views on postings | Referenced in LoadPosting relations |

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `loadId` | Load must be in PENDING or TENDERED status | "Load is not eligible for posting" |
| `postedRate` | Must be positive Decimal, less than customer rate | "Posted rate cannot exceed customer rate" |
| `expiresAt` | Max 72 hours from posting time | "Posting expires in max 72 hours" |
| Duplicate posting | Load cannot have active posting on same board | "Load already posted to [board]" |
| Carrier bid acceptance | Carrier must pass compliance check | "Carrier not eligible — [specific reason]" |
| `bidAmount` | Must be positive Decimal | "Bid amount must be positive" |
| `counterAmount` | Must be positive Decimal, different from original bid | "Counter amount required" |
| `waterfallTimeoutMinutes` | Required when tender type is WATERFALL | "Timeout required for waterfall tenders" |
| `credentials` (AccountsController) | Must include required provider fields | "Invalid credentials format" |

---

## 10. Status States

### Posting Status Machine
```
ACTIVE → EXPIRED (auto at expiresAt, or manual via /expire endpoint)
ACTIVE → ACCEPTED (carrier bid accepted)
ACTIVE → CANCELLED (manual removal)
EXPIRED → ACTIVE (re-post with updated rate, or auto-refresh if enabled)
```

### Bid Status Machine
```
PENDING → ACCEPTED (dispatcher accepts → triggers TMS Core assignment)
PENDING → REJECTED (dispatcher rejects, rejectionReason recorded)
PENDING → WITHDRAWN (carrier withdraws)
PENDING → COUNTERED (dispatcher sends counter-offer via counterAmount/counterNotes)
PENDING → EXPIRED (auto at expiresAt)
COUNTERED → ACCEPTED (carrier accepts counter)
COUNTERED → WITHDRAWN (carrier declines counter)
```

### Tender Type Enum
```
BROADCAST — send to all matching carriers simultaneously
WATERFALL — sequential with timeout, currentPosition tracks active carrier
SPECIFIC — send to named carriers only
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| ~~Backend endpoints are stubs (frontend calls may fail)~~ | ~~P0~~ | — | **FALSE** — 62 endpoints across 9 controllers with full service logic, DTOs, validation. 10 backend spec files. PST-09 verified. |
| 6 legacy controllers missing RolesGuard (34/62 endpoints JWT-only) | P0 | AccountsController, RulesController (HIGH), LeadsController, PostingController (MEDIUM), CapacityController, AnalyticsController (LOW) | **Open** — must add RolesGuard before production |
| Dual API generation: LoadPosting vs LoadPost models | P1 | New controllers vs v1 controllers | **Open** — needs architectural decision to consolidate or formally deprecate v1 |
| Legacy hook not deprecated | P1 | `lib/hooks/tms/use-load-board.ts` | **Open** — should remove or redirect to primary hooks |
| DAT TMS API not integrated | P1 | — | **Open** — provider model exists, no integration code |
| Truckstop.com API not integrated | P1 | — | **Open** — same as above |
| External API credentials not in .env.example | P1 | `.env.example` | **Open** |
| Verify `deletedAt: null` filtering in all 9 service files | P1 | `apps/api/src/modules/load-board/` | **Open** — all 5 models have `deletedAt`, need to confirm services filter it |

**Previously listed — now resolved:**
- ~~No tests~~ — FIXED: 65+ tests (13 FE suites + 10 BE spec files)
- ~~No frontend screens built~~ — FIXED: 4 pages exist (audited 2026-03-07)
- ~~No components~~ — FIXED: 10 components in `components/load-board/`
- ~~No hooks~~ — FIXED: 3 hook files, 14 exported hooks

---

## 12. Tasks

### Completed (verified by PST-09 tribunal)
| Task ID | Title | Status |
|---------|-------|--------|
| LB-106 | Build Load Board backend endpoints (replace stubs) | **Done** — 62 endpoints across 9 controllers |
| LB-107 | Write load board tests | **Done** — 65+ tests (13 FE suites + 10 BE spec files) |

### Open (from tribunal findings)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| LB-101 | QA Load Board Dashboard (exists, 7/10) | S (1h) | P1 |
| LB-102 | QA Post Load form (exists, 7/10) | S (1h) | P1 |
| LB-103 | Build Offers queue page (not built) | M (4h) | P1 |
| LB-104 | Implement DAT TMS API integration | L (8h) | P1 |
| LB-105 | Implement Truckstop.com API integration | L (8h) | P1 |
| LB-108 | Add RolesGuard to AccountsController (6 endpoints) — ADMIN only | S (30min) | **P0** |
| LB-109 | Add RolesGuard to RulesController (5 endpoints) — ADMIN, DISPATCHER | S (30min) | **P0** |
| LB-110 | Add RolesGuard to LeadsController (7 endpoints) — ADMIN, DISPATCHER, SALES_REP | S (30min) | P1 |
| LB-111 | Add RolesGuard to PostingController v1 (9 endpoints) — match LoadPostingsController roles | S (30min) | P1 |
| LB-112 | Architectural decision: consolidate dual API (LoadPosting vs LoadPost) or deprecate v1 | M (2h) | P1 |
| LB-113 | Deprecate `lib/hooks/tms/use-load-board.ts` — remove or redirect | S (30min) | P1 |
| LB-114 | Verify `deletedAt: null` filtering in all 9 service files | M (1-2h) | P1 |

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
| Full DAT/Truckstop integration | Provider/account models built, no API calls | Integration gap (models ready) |
| Internal load board | 4 pages, 10 components, 62 backend endpoints | Far exceeds plan |
| 5 screens planned | 4 built, 2 not built (offers, settings) | Minor gap |
| 5 components planned | 10 components built (1,744 LOC) | Exceeds plan |
| 7 endpoints planned | 62 endpoints across 9 controllers | 8.9x more than documented |
| Hub rated 6/10 ("partial stub") | Verified 8.0/10 by PST-09 tribunal | Hub was catastrophically outdated |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT on all endpoints, RolesGuard on new controllers — ADMIN, DISPATCHER, SALES_REP, CARRIER_MANAGER, CARRIER)
- TMS Core (loads to post, carrier assignment on bid acceptance)
- Carrier Management (carrier compliance check on bid acceptance, carrier data for matches/tenders)
- DAT TMS API (external posting — requires API key, not yet integrated)
- Truckstop.com API (external posting — requires API key, not yet integrated)

**Depended on by:**
- TMS Core (carrier assigned via Load Board → load moves to TENDERED)
- Carrier Management (carriers found via Load Board may need registration)
- Dashboard (Load Board KPIs consumed by Dashboard service — `useLoadBoardDashboardStats`)

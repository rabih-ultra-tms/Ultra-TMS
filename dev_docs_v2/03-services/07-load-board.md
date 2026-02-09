# Service 07: Load Board

> **Grade:** A (9.0/10) Backend / 0% Frontend | **Priority:** Build | **Phase:** 3-4
> **Web Prompt:** `dev_docs/11-ai-dev/web-dev-prompts/07-load-board-ui.md`
> **Design Specs:** `dev_docs/12-Rabih-design-Process/07-load-board/` (4 files)

---

## Status Summary

Backend is production-ready with 11 services, 9 controllers, ~2,407 LOC covering Load Postings, Carrier Bids, Tender Management, Capacity Search, Geocoding, and Rules Engine. Frontend is 0% complete -- no screens built yet. Grade reflects excellent backend (A) with comprehensive bid/matching logic. Phase 3-4 placement reflects high priority for internal operations and carrier utilization.

---

## Screens

| Screen | Route | Status | Quality | Task ID | Notes |
|--------|-------|--------|---------|---------|-------|
| Load Board Dashboard | `/load-board` | Not Built | -- | -- | Phase 3 |
| Available Loads | `/load-board/search` | Not Built | -- | -- | Phase 3 |
| Post New Load | `/load-board/post` | Not Built | -- | -- | Phase 3 |
| My Postings | `/load-board/postings` | Not Built | -- | -- | Phase 3 |
| Posting Detail & Bids | `/load-board/postings/[id]` | Not Built | -- | -- | Phase 3 |
| Board Settings | `/load-board/settings` | Not Built | -- | -- | Phase 4 |

---

## Backend API

### Load Postings (10 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/load-board/postings` | GET/POST | Production | List + Create posting |
| `/api/v1/load-board/postings/:id` | GET/PUT/DELETE | Production | Full CRUD |
| `/api/v1/load-board/postings/:id/status` | PATCH | Production | Status transitions |
| `/api/v1/load-board/postings/:id/cancel` | POST | Production | Cancel posting |

### Carrier Bids (7 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/load-board/postings/:id/bids` | GET | Production | List bids on posting |
| `/api/v1/load-board/postings/:id/bids/:bidId/accept` | POST | Production | Accept bid |
| `/api/v1/load-board/postings/:id/bids/:bidId/reject` | POST | Production | Reject bid |
| `/api/v1/load-board/postings/:id/bids/:bidId/counter` | POST | Production | Send counter offer |

### Carrier Matches (4 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/load-board/postings/:id/matches` | GET | Production | Get suggested carriers |
| `/api/v1/load-board/postings/:id/tender` | POST | Production | Tender to specific carrier |

### Search & Dashboard (4 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/load-board/available` | GET | Production | Search available loads |
| `/api/v1/load-board/dashboard` | GET | Production | Dashboard KPIs |
| `/api/v1/load-board/capacity-search` | POST | Production | Find available capacity |
| `/api/v1/load-board/rules` | GET/POST | Production | Rules engine config |

---

## Frontend Components

**Status: 0 components exist. All must be built.**

| Component | Path | Notes |
|-----------|------|-------|
| LoadBoardGrid | `components/load-board/load-board-grid.tsx` | To build |
| LoadPostingCard | `components/load-board/load-posting-card.tsx` | To build |
| LoadPostingForm | `components/load-board/load-posting-form.tsx` | To build |
| LoadPostingDetail | `components/load-board/load-posting-detail.tsx` | To build |
| CarrierBidsTable | `components/load-board/carrier-bids-table.tsx` | To build |
| BidCard | `components/load-board/bid-card.tsx` | To build |
| CarrierMatchCard | `components/load-board/carrier-match-card.tsx` | To build |
| LoadSearchForm | `components/load-board/load-search-form.tsx` | To build |
| LoadMapView | `components/load-board/load-map-view.tsx` | To build |
| PostingStatusBadge | `components/load-board/posting-status-badge.tsx` | To build |

---

## Design Specs

| Screen | Spec File | Content Level |
|--------|-----------|---------------|
| Service Overview | `00-service-overview.md` | Overview |
| Load Board | `01-load-board.md` | Full 15-section |
| Post Load | `02-post-load.md` | Full 15-section |
| Load Matching | `03-load-matching.md` | Full 15-section |
| Board Settings | `04-board-settings.md` | Full 15-section |

---

## Open Bugs

None known. Backend verified production-ready.

---

## Tasks

| Task ID | Title | Phase | Status | Effort |
|---------|-------|-------|--------|--------|
| LB-001 | Build Load Board Dashboard | 3 | NOT STARTED | M (3h) |
| LB-002 | Build Post Load form | 3 | NOT STARTED | M (4h) |
| LB-003 | Build Available Loads search | 3 | NOT STARTED | M (4h) |
| LB-004 | Build Posting Detail & Bids UI | 3 | NOT STARTED | L (6h) |
| LB-005 | Build Carrier Matches panel | 3 | NOT STARTED | M (3h) |

---

## Key Business Rules

### Posting Rules
| Rule | Detail |
|------|--------|
| **Status Flow** | DRAFT → ACTIVE → PENDING_BIDS → BID_ACCEPTED → COVERED / EXPIRED |
| **Expiration** | Default 48h from posting; configurable |
| **Auto-Expire** | System moves ACTIVE → EXPIRED after deadline |
| **Visibility** | Only ACTIVE postings visible in search |
| **Rate Display** | Can show target rate or "contact for rate" |

### Bid Rules
| Rule | Detail |
|------|--------|
| **Status Flow** | PENDING → ACCEPTED / REJECTED / COUNTERED / WITHDRAWN / EXPIRED |
| **Counter** | Broker rejects bid + sends counter amount → carrier sees new offer |
| **Accept** | Accepting bid → posting status = COVERED → creates Load |
| **Withdraw** | Carrier can withdraw PENDING bid before acceptance |
| **Multiple Bids** | Multiple carriers bid on same posting; best bid wins |

### Carrier Matching
| Factor | Weight | Description |
|--------|--------|-------------|
| Geography | 30% | Carrier's preferred lanes + current location |
| Equipment | 25% | Equipment type match |
| Scorecard | 25% | Carrier rating (0-100) |
| History | 20% | Past loads on similar lanes |

**Match Score = Σ(factor × weight) → 0-100 scale**

## Key References

| Document | Path | What It Contains |
|----------|------|------------------|
| Load Board Specs | `dev_docs/12-Rabih-design-Process/07-load-board/` | 6 design spec files |
| Business Rules | `dev_docs/11-ai-dev/92-business-rules-reference.md` | Posting, bid, matching rules |

---

## Dependencies

- **Depends on:** Auth, TMS Core (load reference), Carrier (carrier lookup), Sales (rate estimation)
- **Depended on by:** Operations (dispatch), Carrier Portal (view bids)

---

## What to Build Next (Ordered)

1. **Build Load Board Dashboard** -- KPI cards (active postings, pending bids, covered today, avg time-to-cover). 3h.
2. **Build Post Load Form** -- Origin/destination, equipment type, weight, commodity, pickup/delivery windows, rates. 4h.
3. **Build Available Loads Search** -- Search filters (origin city/radius, destination, equipment, date range). 4h.
4. **Build Posting Detail** -- Full posting data, inline bid list, counter-offer support. 6h.
5. **Build Carrier Matches Panel** -- Suggested carriers with match score, scorecard metrics, tender button. 3h.

### Post-MVP Ideas (not in 16-week sprint)

- **Load Map View** — Google Maps integration showing posted/available loads. Design spec: `06-load-map.md`.

---

## Implementation Notes

- Posting status machine: DRAFT > ACTIVE > PENDING_BIDS > BID_ACCEPTED > COVERED/EXPIRED
- Bid status machine: PENDING > ACCEPTED/REJECTED/COUNTERED/WITHDRAWN/EXPIRED
- Carrier matching: rules-based (geography, equipment, scorecard, lanes), scores 0-100
- Bid countering: reject + counter amount + re-tender
- Map view: cluster markers by status

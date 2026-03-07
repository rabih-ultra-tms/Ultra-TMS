# Load Board Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/07-load-board/` (5 files)
**MVP Tier:** P0
**Frontend routes:** `(dashboard)/load-board/*`
**Backend module:** `apps/api/src/modules/load-board/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-load-board.md` | `/load-board` | `(dashboard)/load-board/page.tsx` | Exists |
| 02 | `02-post-load.md` | `/load-board/post` | `(dashboard)/load-board/post/page.tsx` | Exists |
| 03 | `03-load-matching.md` | `/load-board/search` | `(dashboard)/load-board/search/page.tsx` | Exists |
| 04 | `04-board-settings.md` | — | Not built | P2 — board configuration |

---

## Backend Endpoints

| Screen | Endpoint(s) | Hook |
|--------|-------------|------|
| Load Board | `GET /load-board/postings` | `use-postings.ts` |
| Post Load | `POST /load-board/postings` | `use-postings.ts` |
| Load Matching | `GET /load-board/search` | `use-loadboard-dashboard.ts` |
| Posting Detail | `GET /load-board/postings/:id` | `use-postings.ts` |

Additional route: `/load-board/postings/[id]` exists at `(dashboard)/load-board/postings/[id]/page.tsx`

---

## Implementation Notes

- Load board is internal (not external like DAT/Truckstop) — P0 for carrier matching
- Board settings is P2 — no route exists
- Load matching maps to the search functionality
- External load board integration is a separate P3 service (31-load-board-external)
- Hooks: `use-postings.ts` and `use-loadboard-dashboard.ts` in `lib/hooks/load-board/`

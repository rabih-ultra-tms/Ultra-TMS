# Search Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/21-search/` (5 files)
**MVP Tier:** P2
**Frontend routes:** None — not built yet
**Backend module:** `apps/api/src/modules/search/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-global-search.md` | — | Not built | P2 (command palette integration) |
| 02 | `02-advanced-search.md` | — | Not built | P2 |
| 03 | `03-saved-searches.md` | — | Not built | P2 |
| 04 | `04-search-settings.md` | — | Not built | P2 |

---

## Backend

- `GlobalSearchController` at `search/global/global-search.controller.ts`
- Endpoints: global search, suggestions, recent searches
- Broad role access (not admin-only)
- Elasticsearch 8.13 infrastructure via Docker

---

## Implementation Notes

- Global search (01) maps to command palette in dashboard shell spec
- Elasticsearch is in Docker compose but indexing pipeline (BACK-025) not built
- Search module has backend controller — frontend not wired
- Saved searches and settings are P2 polish features

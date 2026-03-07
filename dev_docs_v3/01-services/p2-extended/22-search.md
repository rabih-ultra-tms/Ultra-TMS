# Service Hub: Search (22)

> **Priority:** P2 Extended | **Status:** Backend Partial, Frontend Not Built
> **Source of Truth** — dev_docs_v3 | Last verified: 2026-03-07

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — 4 controllers in `apps/api/src/modules/search/` |
| **Frontend** | Not Built — no global search UI |
| **Tests** | None |
| **Infrastructure** | Elasticsearch 8.13 running (docker-compose). Kibana at localhost:5601 |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Search service in dev_docs |
| Backend Controller | Partial | 4 controllers in search module |
| Backend Service | Partial | Elasticsearch query builders |
| Prisma Models | N/A | Search reads from Elasticsearch index, not Prisma |
| Elasticsearch | Running | Indices may not be fully configured |
| Frontend Pages | Not Built | |
| Component | Not Built | Global search bar (CommandPalette pattern) |
| Tests | None | |

---

## 3. Screens

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Global Search (command palette) | Triggered by Cmd+K | Not Built | Cross-entity search |
| Search Results | `/search?q=...` | Not Built | Full results page |
| Advanced Search | `/search/advanced` | Not Built | Filtered search per entity |

---

## 4. API Endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/search?q=&type=` | Partial | Global search across entities |
| GET | `/api/v1/search/loads?q=` | Partial | Load-specific search |
| GET | `/api/v1/search/carriers?q=` | Partial | Carrier search |
| GET | `/api/v1/search/customers?q=` | Partial | Customer search |

---

## 5. Business Rules

1. **Global Search Scope:** Searches across: Loads (by load#, origin, dest, carrier), Orders (by order#, customer, status), Carriers (by name, MC#, DOT#), Customers (by name, code, email), Invoices (by invoice#, amount). Results are role-filtered.
2. **Elasticsearch Indexing:** Data is indexed into Elasticsearch on creation/update via NestJS event listeners. Index names: `loads`, `orders`, `carriers`, `customers`, `invoices`.
3. **Result Ranking:** Results ranked by: recency (last updated), relevance (full-text match score), entity type weight (loads > orders > carriers > customers).
4. **Tenant Isolation:** All Elasticsearch queries include a `tenantId` filter. No cross-tenant results are ever returned.
5. **CommandPalette UX:** Global search opens as a modal dialog (Cmd+K). Instant results as you type (debounced 300ms). Recent searches stored in localStorage. Entity icons distinguish result types.

---

## 6. Tasks

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SRCH-101 | Configure Elasticsearch indices (loads, orders, carriers, customers) | M (4h) | P2 |
| SRCH-102 | Build CommandPalette search component | M (5h) | P2 |
| SRCH-103 | Build Search Results page | M (4h) | P2 |
| SRCH-104 | Add indexing event listeners for all entities | M (4h) | P2 |
| SRCH-105 | Write search tests | M (3h) | P2 |

---

## 7. Dependencies

**Depends on:** Elasticsearch (infrastructure), Auth (role-based filtering), All entities (indexing)
**Depended on by:** Any screen with global search UI

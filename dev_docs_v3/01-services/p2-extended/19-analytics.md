# Service Hub: Analytics (19)

> **Priority:** P2 Extended | **Status:** Backend Partial (.bak exists), Frontend Not Built
> **Source of Truth** — dev_docs_v3 | Last verified: 2026-03-07

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — 4 controllers + analytics.bak directory |
| **Frontend** | Not Built |
| **Tests** | None |
| **Infrastructure** | Elasticsearch 8.13 running (docker-compose) |
| **Note** | `.bak` directory indicates abandoned refactor — QS-009 to resolve |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Analytics definition in dev_docs |
| Backend Controller | Partial | `apps/api/src/modules/analytics/` + `.bak` version |
| Backend Service | Partial | 4 services |
| Prisma Models | Partial | Analytics events, aggregated metrics |
| Elasticsearch | Running | Kibana dashboard available at localhost:5601 |
| Frontend Pages | Not Built | |
| Tests | None | |

---

## 3. Screens

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Analytics Dashboard | `/analytics` | Not Built | Executive overview KPIs |
| Revenue Analytics | `/analytics/revenue` | Not Built | Revenue trends, by customer, by lane |
| Operations Analytics | `/analytics/operations` | Not Built | On-time, detention, stop performance |
| Carrier Analytics | `/analytics/carriers` | Not Built | Performance benchmarks |
| Custom Reports | `/analytics/reports` | Not Built | Ad-hoc report builder |

---

## 4. API Endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/analytics/overview` | Partial | Executive KPIs |
| GET | `/api/v1/analytics/revenue` | Partial | Revenue by period/customer/lane |
| GET | `/api/v1/analytics/operations` | Partial | Operations metrics |
| GET | `/api/v1/analytics/carriers` | Partial | Carrier performance |

---

## 5. Business Rules

1. **Data Source:** Analytics aggregates from: Orders, Loads, Invoices, Settlements, CheckCalls, StopEvents. Does NOT modify source data — read-only aggregation.
2. **Elasticsearch Usage:** High-volume event data (load position updates, check calls, activity events) is indexed in Elasticsearch for fast time-series queries. Prisma handles structured data.
3. **Role-Based Analytics:** ADMIN and ACCOUNTING see all metrics. DISPATCHER sees operations only. SALES_REP sees revenue and customer metrics only. No cross-tenant data.
4. **Retention:** Raw analytics events: 2 years. Aggregated reports: unlimited.
5. **`.bak` directory:** `analytics.bak` must be resolved before analytics development begins. Either merge missing changes or delete if superseded.

---

## 6. Tasks

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| ANA-001 | Resolve analytics.bak | S (1h) | P1 — QS-009 |
| ANA-101 | Build Analytics Dashboard | L (8h) | P2 |
| ANA-102 | Build Revenue Analytics | L (8h) | P2 |
| ANA-103 | Build Operations Analytics | L (8h) | P2 |
| ANA-104 | Elasticsearch indexing setup | M (4h) | P2 |

---

## 7. Dependencies

**Depends on:** All P0 services (data sources), Elasticsearch (event storage)
**Depended on by:** Nothing — analytics is a consumer only

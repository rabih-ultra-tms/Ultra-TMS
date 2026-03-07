# Features List — Ultra TMS (All 38 Services)

> **Last Updated:** 2026-03-07
> This is the master list of ALL features across ALL 38 services.
> Source: dev_docs/02-services/ service definitions + codebase scan

---

## How to Read This List

- **MVP:** Must be production-ready for launch
- **P1:** Ship within 90 days of launch
- **P2:** Ship within 6 months of launch
- **Future:** No schedule yet

Status: **BUILT** (working code), **PARTIAL** (code exists, incomplete), **NOT BUILT** (needs to be created)

---

## P0 MVP Services (9 services)

### 01. Auth & Admin

| Feature | Priority | Status |
|---|---|---|
| Email/password login | MVP | BUILT |
| JWT HttpOnly cookie auth | MVP | BUILT |
| Logout + token invalidation | MVP | BUILT |
| Role-Based Access Control (RBAC) | MVP | BUILT |
| User creation by admin | MVP | BUILT |
| User profile view/edit | MVP | PARTIAL (0/10 stub — QS-005) |
| Password change | MVP | PARTIAL |
| Multi-tenant tenant creation | MVP | BUILT |
| Admin user management screen | MVP | PARTIAL |
| Role assignment | MVP | BUILT |
| Audit log (user actions) | P1 | NOT BUILT |

### 02. Dashboard

| Feature | Priority | Status |
|---|---|---|
| KPI cards (loads, revenue, carriers, customers) | MVP | PARTIAL |
| Recent activity feed | MVP | PARTIAL |
| Active loads overview | MVP | PARTIAL |
| Revenue metrics chart | MVP | NOT BUILT |
| Real-time notifications (WebSocket) | MVP | NOT BUILT (QS-001) |
| Quick actions | MVP | PARTIAL |

### 03. CRM / Customers

| Feature | Priority | Status |
|---|---|---|
| Customer list with search/filter | MVP | BUILT |
| Customer detail view | MVP | BUILT |
| Customer create/edit/archive | MVP | BUILT |
| Contact management (per customer) | MVP | BUILT |
| Customer credit limit management | MVP | PARTIAL |
| Customer load history | MVP | PARTIAL |
| Customer notes | MVP | BUILT |
| Customer document storage | P1 | NOT BUILT |

### 04. Sales / Quotes

| Feature | Priority | Status |
|---|---|---|
| Quote list with search/filter | MVP | BUILT |
| Quote create form | MVP | BUILT |
| Quote detail view | MVP | BUILT |
| Quote edit | MVP | BUILT |
| Quote send to customer | MVP | PARTIAL |
| Quote accept/reject | MVP | PARTIAL |
| Load Planner (AI route + cost) | MVP | BUILT (PROTECTED) |
| Quote-to-load conversion | MVP | PARTIAL |
| Rate history | P1 | NOT BUILT |

### 05. TMS Core (Orders / Loads / Dispatch)

| Feature | Priority | Status |
|---|---|---|
| Order list with search/filter | MVP | BUILT |
| Order detail view | MVP | BUILT |
| Load list with search/filter | MVP | BUILT |
| Load detail view | MVP | BUILT |
| Load create/edit | MVP | BUILT |
| Carrier assignment | MVP | BUILT |
| Dispatch board (real-time) | MVP | NOT BUILT (QS-001) |
| Check call form | MVP | PARTIAL (QS-006) |
| Load status updates | MVP | BUILT |
| Tracking map (real-time) | MVP | NOT BUILT (QS-001) |
| Rate confirmation generation | MVP | BUILT |
| Proof of delivery upload | P1 | NOT BUILT |

### 06. Carrier Management

| Feature | Priority | Status |
|---|---|---|
| Carrier list with search/filter | MVP | BUILT |
| Carrier detail view | MVP | BUILT |
| Carrier create/edit | MVP | BUILT |
| Carrier qualification tracking | MVP | PARTIAL |
| Insurance management | MVP | PARTIAL |
| CSA safety scores | MVP | PARTIAL (QS-004 backend gap) |
| Truck types management | MVP | BUILT (PROTECTED) |
| Lane/rate management | MVP | PARTIAL |
| Carrier performance metrics | P1 | NOT BUILT |

### 07. Accounting

| Feature | Priority | Status |
|---|---|---|
| Invoice list with search/filter | MVP | BUILT |
| Invoice detail view | MVP | BUILT |
| Invoice create/send | MVP | BUILT |
| Invoice payment tracking | MVP | PARTIAL |
| Settlement list | MVP | BUILT |
| Settlement processing | MVP | PARTIAL |
| Accounting dashboard/KPIs | MVP | PARTIAL (QS-003 backend gap) |
| Revenue/cost reports | P1 | NOT BUILT |
| Export to CSV/Excel | P1 | NOT BUILT |

### 08. Commission

| Feature | Priority | Status |
|---|---|---|
| Commission agent list | MVP | BUILT |
| Commission calculation | MVP | BUILT |
| Commission reports by period | MVP | PARTIAL |
| Commission payout tracking | P1 | NOT BUILT |

### 09. Load Board

| Feature | Priority | Status |
|---|---|---|
| Load board list view | MVP | PARTIAL |
| Load posting | MVP | PARTIAL |
| Carrier matching | P1 | NOT BUILT |
| External load board integration (DAT) | P2 | NOT BUILT |

---

## P1 Post-MVP Services (6 services)

### 10. Claims

| Feature | Priority | Status |
|---|---|---|
| Claim creation | P1 | PARTIAL (backend exists) |
| Claim tracking/status | P1 | PARTIAL |
| Document attachment | P1 | NOT BUILT |
| Claim resolution workflow | P1 | NOT BUILT |

### 11. Documents

| Feature | Priority | Status |
|---|---|---|
| Document storage (S3) | P1 | PARTIAL (backend exists) |
| Document categorization | P1 | PARTIAL |
| Document expiry tracking | P1 | NOT BUILT |
| E-signature (future) | P2 | NOT BUILT |

### 12. Communication

| Feature | Priority | Status |
|---|---|---|
| In-app messaging | P1 | PARTIAL (backend exists) |
| Email notifications | P1 | PARTIAL |
| SMS notifications (Twilio) | P1 | NOT BUILT |
| Notification preferences | P1 | NOT BUILT |

### 13. Customer Portal

| Feature | Priority | Status |
|---|---|---|
| Customer login (separate JWT) | P1 | PARTIAL (backend exists) |
| Shipment tracking | P1 | NOT BUILT |
| Invoice download | P1 | NOT BUILT |
| Quote request | P1 | NOT BUILT |

### 14. Carrier Portal

| Feature | Priority | Status |
|---|---|---|
| Carrier login (separate JWT) | P1 | PARTIAL (backend exists) |
| Load acceptance/rejection | P1 | NOT BUILT |
| Status updates | P1 | NOT BUILT |
| Document upload (POD) | P1 | NOT BUILT |
| Rate confirmation download | P1 | NOT BUILT |

### 15. Contracts

| Feature | Priority | Status |
|---|---|---|
| Contract creation | P1 | PARTIAL (backend exists) |
| Contract versioning | P1 | NOT BUILT |
| Contract approval workflow | P1 | NOT BUILT |

---

## P2 Extended Services (7 services)

### 16-22. Extended Services

| Service | Key Features | Status |
|---|---|---|
| Agents | Agent management, commission splitting | PARTIAL backend |
| Credit | Customer credit scoring, credit hold management | PARTIAL backend |
| Factoring Internal | Internal factoring workflow | PARTIAL backend |
| Analytics | Advanced dashboards, lane analysis, trend reporting | PARTIAL backend |
| Workflow | Automated workflow triggers, approval chains | PARTIAL backend |
| Integration Hub | ERP integrations, webhook management | PARTIAL backend |
| Search | ES-powered cross-entity search | PARTIAL backend |

---

## P3 Future Services (16 services)

Safety, EDI, ELD, HR, Fleet, Help Desk, Feedback, Rate Intelligence, Scheduler, Config, Cache, Audit, Fuel Cards, Factoring External, Load Board External, Mobile, Cross-Border

All have backend modules (PARTIAL) but no frontend and no schedule.

---

## Feature Coverage Summary

| Priority | Total Features | BUILT | PARTIAL | NOT BUILT |
|---|---|---|---|---|
| P0 MVP | ~65 | ~30 (46%) | ~25 (38%) | ~10 (15%) |
| P1 Post-MVP | ~25 | 0 | ~15 (60%) | ~10 (40%) |
| P2 Extended | ~30 | 0 | ~15 (50%) | ~15 (50%) |
| P3 Future | ~80 | 0 | ~40 (50%) | ~40 (50%) |

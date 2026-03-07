# Service Hub: Integration Hub (21)

> **Priority:** P2 Extended | **Status:** Backend Partial (.bak exists), Frontend Not Built
> **Source of Truth** — dev_docs_v3 | Last verified: 2026-03-07

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — 5 controllers + integration-hub.bak directory |
| **Frontend** | Not Built |
| **Tests** | None |
| **Note** | `.bak` directory — needs resolution per QS-009 |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Integration Hub definition in dev_docs |
| Backend Controller | Partial | `apps/api/src/modules/integration-hub/` + `.bak` |
| Backend Service | Partial | 5 services |
| Prisma Models | Partial | Integration, IntegrationLog, Webhook models |
| Frontend Pages | Not Built | |
| Tests | None | |

---

## 3. Screens

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Integrations List | `/settings/integrations` | Not Built | All configured integrations |
| Integration Detail | `/settings/integrations/[id]` | Not Built | Credentials, status, logs |
| Integration Logs | `/settings/integrations/[id]/logs` | Not Built | Request/response history |
| Webhook Config | `/settings/webhooks` | Not Built | Outbound webhooks |

---

## 4. API Endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/integrations` | Partial | List configured integrations |
| POST | `/api/v1/integrations` | Partial | Add integration |
| GET | `/api/v1/integrations/:id` | Partial | Detail + status |
| PATCH | `/api/v1/integrations/:id` | Partial | Update credentials |
| DELETE | `/api/v1/integrations/:id` | Partial | Disable integration |
| POST | `/api/v1/integrations/:id/test` | Partial | Test connection |

---

## 5. Business Rules

1. **Integration Types:** ELD (electronic logging device), LOAD_BOARD (DAT, Truckstop), ACCOUNTING (QuickBooks, Sage), MAPPING (Google Maps, HERE), ERP (SAP, Oracle TMS), CUSTOM (generic REST webhook).
2. **Credential Security:** API keys and OAuth tokens are encrypted at rest (AES-256). Never returned in API responses — only masked display (e.g., `sk-****1234`).
3. **Health Monitoring:** Each integration is checked every 5 minutes. Status: HEALTHY, DEGRADED, DOWN. Alerts sent to admin when status changes.
4. **Webhook Outbound:** Tenants can configure outbound webhooks to their own systems. Payload format: JSON, signed with HMAC-SHA256. Retry: 3 times with exponential backoff.

---

## 6. Tasks

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| INT-001 | Resolve integration-hub.bak | S (1h) | P1 — QS-009 |
| INT-101 | Build Integrations settings UI | L (8h) | P2 |
| INT-102 | Implement ELD integration (Samsara, Keeptruckin) | XL (16h) | P2 |
| INT-103 | Implement QuickBooks sync | L (12h) | P2 |
| INT-104 | Webhook outbound configuration UI | M (5h) | P2 |

---

## 7. Dependencies

**Depends on:** Auth, All services that need external data
**Depended on by:** All external integrations (ELD, Load Boards, Accounting, ERP)

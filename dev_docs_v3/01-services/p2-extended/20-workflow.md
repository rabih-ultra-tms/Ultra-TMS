# Service Hub: Workflow Engine (20)

> **Priority:** P2 Extended | **Status:** Backend Partial (.bak exists), Frontend Not Built
> **Source of Truth** — dev_docs_v3 | Last verified: 2026-03-07

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — 4 controllers + workflow.bak directory |
| **Frontend** | Not Built |
| **Tests** | None |
| **Note** | `.bak` directory — same pattern as analytics.bak. Needs resolution per QS-009 |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Workflow definition in dev_docs |
| Backend Controller | Partial | `apps/api/src/modules/workflow/` + `.bak` |
| Backend Service | Partial | 4 services |
| Prisma Models | Partial | Workflow, WorkflowStep, WorkflowRun models |
| Frontend Pages | Not Built | |
| Tests | None | |

---

## 3. Screens

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Workflow List | `/workflows` | Not Built | Active workflow definitions |
| Workflow Builder | `/workflows/builder` | Not Built | Visual workflow designer |
| Workflow Runs | `/workflows/runs` | Not Built | Execution history |
| Workflow Detail | `/workflows/[id]` | Not Built | |

---

## 4. API Endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/workflows` | Partial | List workflow definitions |
| POST | `/api/v1/workflows` | Partial | Create workflow |
| GET | `/api/v1/workflows/:id` | Partial | Detail |
| POST | `/api/v1/workflows/:id/trigger` | Partial | Manually trigger workflow |
| GET | `/api/v1/workflows/runs` | Partial | Execution history |

---

## 5. Business Rules

1. **Trigger Types:** LOAD_STATUS_CHANGE, ORDER_STATUS_CHANGE, INVOICE_OVERDUE, CUSTOM_EVENT. Each trigger has conditions (e.g., "load status = DELIVERED AND customer = VIP").
2. **Action Types:** SEND_EMAIL, SEND_SMS, CREATE_TASK, CALL_WEBHOOK, UPDATE_FIELD, NOTIFY_USER. Actions execute in sequence.
3. **Retry Logic:** Failed actions retry 3 times with exponential backoff. After 3 failures, the workflow run is marked FAILED and the admin is notified.
4. **Tenant Isolation:** Workflows are tenant-scoped. A tenant's workflow cannot trigger actions that affect another tenant's data.

---

## 6. Tasks

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| WF-001 | Resolve workflow.bak | S (1h) | P1 — QS-009 |
| WF-101 | Build Workflow Builder UI | XL (16h) | P2 |
| WF-102 | Build Workflow Runs dashboard | M (4h) | P2 |
| WF-103 | Implement core trigger types | L (8h) | P2 |

---

## 7. Dependencies

**Depends on:** Auth, Communication (email/SMS actions), all services that emit events
**Depended on by:** Automation of any process that involves cross-service events

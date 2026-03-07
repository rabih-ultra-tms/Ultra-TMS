# Service Hub: Agents (16)

> **Priority:** P2 Extended | **Status:** Backend Partial, Frontend Not Built
> **Source of Truth** — dev_docs_v3 | Last verified: 2026-03-07

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — 6 controllers in `apps/api/src/modules/agents/` |
| **Frontend** | Not Built |
| **Tests** | None |
| **Scope** | Freight agents and sub-brokers who bring loads to the brokerage |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Agents service in dev_docs |
| Backend Controller | Partial | 6 controllers in agents module |
| Backend Service | Partial | 6 services |
| Prisma Models | Partial | Agent, AgentCommission models |
| Frontend Pages | Not Built | |
| Tests | None | |

---

## 3. Screens

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Agents List | `/agents` | Not Built | Internal and external agents |
| Agent Detail | `/agents/[id]` | Not Built | Profile, loads, commissions |
| Agent Create | `/agents/new` | Not Built | |
| Agent Commissions | `/agents/[id]/commissions` | Not Built | |

---

## 4. API Endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/agents` | Partial | List agents |
| POST | `/api/v1/agents` | Partial | Create agent |
| GET | `/api/v1/agents/:id` | Partial | Detail |
| PUT | `/api/v1/agents/:id` | Partial | Update |
| GET | `/api/v1/agents/:id/commissions` | Partial | Commission records |
| GET | `/api/v1/agents/stats` | Partial | Agent performance stats |

---

## 5. Business Rules

1. **Agent Types:** INTERNAL (employee sales reps already in Users), EXTERNAL (independent freight agents with their own client relationships). External agents have a login to a restricted portal.
2. **Agent Commission:** Agents receive a split commission from loads they source. Commission structure separate from employee commission plans. Typically 50/50 or 60/40 split on gross margin.
3. **Load Attribution:** Loads sourced by an agent are tagged with `agentId`. This affects commission calculations for both the agent and the internal sales rep.
4. **Data Access:** External agents can only see loads they sourced. Internal agents (sales reps) see all loads per their tenant permissions.

---

## 6. Tasks

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| AGT-101 | Build Agents List + Detail | L (6h) | P2 |
| AGT-102 | Build Agent Commission tracking | M (4h) | P2 |
| AGT-103 | Write agents tests | M (3h) | P2 |

---

## 7. Dependencies

**Depends on:** Auth, Commission (agent commission calculations), TMS Core (load attribution)
**Depended on by:** Commission (agent revenue attribution), Accounting (agent billing)

# Agents Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/15-agents/` (9 files)
**MVP Tier:** P1
**Frontend routes:** None — not built yet
**Backend module:** `apps/api/src/modules/agents/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-agents-dashboard.md` | — | Not built | P1 |
| 02 | `02-agents-list.md` | — | Not built | P1 |
| 03 | `03-agent-detail.md` | — | Not built | P1 |
| 04 | `04-agent-setup.md` | — | Not built | P1 |
| 05 | `05-agent-performance.md` | — | Not built | P2 |
| 06 | `06-commission-setup.md` | — | Not built | P1 (links to commission module) |
| 07 | `07-agent-territories.md` | — | Not built | P2 |
| 08 | `08-agent-reports.md` | — | Not built | P2 |

---

## Backend

- Controller at `agents/agents/agents.controller.ts` (nested directory)
- Implements `ensureAgentSelfAccess()` — queries `prisma.agentPortalUser` directly
- Lifecycle: activate → suspend → terminate

---

## Implementation Notes

- "Agents" here means external sales agents/brokers, not AI agents
- Agent self-access pattern: agents can only view their own data unless admin
- Commission setup (06) integrates with commission module — shared commission plans
- Agent territories (07) is a geographic assignment feature — P2
- Backend has full CRUD + lifecycle management

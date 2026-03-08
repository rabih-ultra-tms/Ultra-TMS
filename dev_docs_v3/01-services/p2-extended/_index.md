# P2: Extended Services

> These 9 services are scheduled for implementation after P1 Post-MVP is complete.
> All have partial or substantial backend implementations. None have frontend screens.
> Each service has a full 15-section hub file in this directory.
> Claims + Contracts demoted from P1 per Tribunal verdict TRIBUNAL-02 (2026-03-07).

---

## Service List

| # | Service | Hub File | Backend | Frontend | Priority |
|---|---------|----------|---------|----------|----------|
| 10 | Claims | [10-claims.md](10-claims.md) | Substantial (7 controllers, 44 endpoints, 8 models) | Not Built | P2 |
| 15 | Contracts | [15-contracts.md](15-contracts.md) | Substantial (8 controllers, 58 endpoints, 11 models) | Not Built | P2 |
| 16 | Agents | [16-agents.md](16-agents.md) | Substantial (6 controllers, 43 endpoints, 9 models, 10 enums) | Not Built | P2 |
| 17 | Credit | [17-credit.md](17-credit.md) | Substantial (5 controllers, 31 endpoints, 5 models, 7 enums) | Not Built | P2 |
| 18 | Factoring Internal | [18-factoring-internal.md](18-factoring-internal.md) | Substantial (5 controllers, 30 endpoints, 5 models) | Not Built | P2 |
| 19 | Analytics | [19-analytics.md](19-analytics.md) | Substantial (6 controllers, 40 endpoints, 10 models) | Not Built | P2 |
| 20 | Workflow | [20-workflow.md](20-workflow.md) | Substantial (5 controllers, 35 endpoints, approval chains) | Not Built | P2 |
| 21 | Integration Hub | [21-integration-hub.md](21-integration-hub.md) | Substantial (7 controllers, 45 endpoints, 7 models) | Not Built | P2 |
| 22 | Search | [22-search.md](22-search.md) | Substantial (4 controllers, 27 endpoints, 7 entity types) | Not Built | P2 |

---

## Notes

- P2 services extend the platform beyond core 3PL operations
- Agents, Credit, and Factoring are revenue-adjacent features
- Analytics, Workflow, and Search are platform infrastructure
- Integration Hub connects to third-party services (ELD, TMS, accounting)
- **Claims** and **Contracts** demoted from P1 — not table-stakes for MVP launch (Tribunal-02)
- P2 work should only begin after P1 services are complete

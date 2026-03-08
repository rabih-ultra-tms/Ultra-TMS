# P1: Post-MVP Services

> These 3 services are scheduled for implementation after the 16-week MVP sprint.
> All have substantial backend implementations. None have frontend screens.
> Each service has a full 15-section hub file in this directory.
> Customer Portal promoted to P0, Claims + Contracts demoted to P2 per Tribunal verdict TRIBUNAL-02 (2026-03-07).

---

## Service List

| # | Service | Hub File | Backend | Frontend | Priority |
|---|---------|----------|---------|----------|----------|
| 11 | Documents | [11-documents.md](11-documents.md) | Substantial (3 controllers, 20 endpoints) | Partial (4 hooks, 4+ components) | P1 |
| 12 | Communication | [12-communication.md](12-communication.md) | Substantial (5 controllers, 30 endpoints) | Partial (3 hooks) | P1 |
| 14 | Carrier Portal | [14-carrier-portal.md](14-carrier-portal.md) | Substantial (7 controllers, 54 endpoints, 5 models) | Not Built | P1 — First P1 to build |

---

## Notes

- All P1 services have rich backend implementations that were built during the initial development phase
- Frontend screens should be built from design specs in `dev_docs/12-Rabih-design-Process/`
- P1 work should only begin after all P0 MVP services pass QA (QS-008 runtime verification)
- **Carrier Portal** is annotated as "First P1 service to build" per Tribunal verdict — carrier self-service reduces operational workload

# P-Infra: Infrastructure Modules

> These 6 modules are **infrastructure helpers**, not business services.
> They have no user-facing screens. They support other services internally.
> Reclassified from P3-Future per Tribunal verdict TRIBUNAL-01 (2026-03-07).
> Do not build frontend pages for these — they are backend-only utilities.

---

## Module List

| # | Module | Hub File | Type | Used By |
|---|--------|----------|------|---------|
| 33 | Super Admin | [33-super-admin.md](33-super-admin.md) | Role in Auth | Auth & Admin (cross-tenant admin role) |
| 34 | Email | [34-email.md](34-email.md) | Service Helper | Communication, Auth (SendGrid integration) |
| 35 | Storage | [35-storage.md](35-storage.md) | Service Helper | Documents, Carrier (S3 file storage) |
| 36 | Redis | [36-redis.md](36-redis.md) | Service Helper | Cache, Queues, WebSocket adapter |
| 37 | Health | [37-health.md](37-health.md) | Production Endpoint | Infrastructure (`GET /api/v1/health`) |
| 38 | Operations | [38-operations.md](38-operations.md) | Sub-Modules | TMS Core (7 sub-modules powering ops pages) |

---

## Why These Were Reclassified

Per TRIBUNAL-01 verdict, these 6 modules were incorrectly classified as "future services":
- They have no user-facing screens and never will
- They are dependencies of real services, not independent services
- Scoring them against the service hub depth rubric produced 1-2/10 scores — correct for infrastructure, misleading when mixed with real services
- Separating them gives a clearer picture: **32 true services + 6 infrastructure modules**

---

## Notes

- **Health (37):** The only fully production module. `GET /api/v1/health` returns 200.
- **Operations (38):** NOT a separate service — backend sub-modules powering TMS Core and Dashboard frontend pages.
- **Email/Storage/Redis (34-36):** Zero controllers. Used internally by other modules via dependency injection.
- **Super Admin (33):** A role within Auth module, not a standalone service.

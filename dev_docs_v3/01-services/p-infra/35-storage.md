# Service Hub: Storage Infrastructure (35)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Priority:** P3 Future (infrastructure — used by Documents service)

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | C (5/10) — infrastructure service, works internally |
| **Last Verified** | 2026-03-07 |
| **Backend** | Built — `apps/api/src/modules/storage/` (1 service, 0 controllers) |
| **Frontend** | N/A — no UI, infrastructure only |
| **Tests** | Has `local-storage.service.spec.ts` |
| **Note** | S3-compatible file storage abstraction. Documents service (11) provides the user-facing API. |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Module | Built | `storage.module.ts` — NestJS module |
| Interface | Built | `storage.interface.ts` — storage provider abstraction |
| Service | Built | `local-storage.service.ts` — local filesystem implementation |
| Tests | Partial | `local-storage.service.spec.ts` exists |
| Controllers | None | No REST endpoints — used internally by Documents service |

---

## 3. Files

| File | Purpose |
|------|---------|
| `apps/api/src/modules/storage/storage.module.ts` | Module definition |
| `apps/api/src/modules/storage/storage.interface.ts` | Provider abstraction (upload, download, delete, getUrl) |
| `apps/api/src/modules/storage/local-storage.service.ts` | Local filesystem implementation |
| `apps/api/src/modules/storage/local-storage.service.spec.ts` | Unit tests |

---

## 4. Business Rules

1. **Provider Abstraction:** Storage interface defines `upload()`, `download()`, `delete()`, `getSignedUrl()`. Implementations can be swapped (local, S3, Azure Blob).
2. **Local Storage:** Current implementation uses local filesystem. Production should use S3-compatible storage.
3. **S3 Configuration:** When using S3: `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` env vars required.
4. **No Direct Access:** This module is injected into the Documents module — it has no REST API of its own.

---

## 5. Dependencies

**Depends on:** AWS S3 (or compatible) — external

**Depended on by:** Documents service (11), Claims (evidence uploads), Carrier Portal (POD uploads)

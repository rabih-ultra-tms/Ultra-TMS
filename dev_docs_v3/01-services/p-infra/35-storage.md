# Service Hub: Storage Infrastructure (35)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-35 tribunal)
> **Priority:** Infrastructure — file storage abstraction used by Documents + Auth/Profile
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-35-storage.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B- (7.0/10) |
| **Confidence** | High — code-verified via PST-35 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Built — `apps/api/src/modules/storage/` (1 service, 0 controllers, `@Global()` module) |
| **Frontend** | N/A — no UI, infrastructure only |
| **Tests** | 9 tests / 1 spec file / 97 LOC — all passing |
| **Priority** | P2 — path sanitization + file validation needed before production |
| **Note** | `@Global()` module — available to all modules without explicit imports. Local filesystem only (no S3 implementation yet). |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Module | Built | `storage.module.ts` — `@Global()` NestJS module, registered in `app.module.ts` (lines 18, 104) |
| Interface | Built | `storage.interface.ts` — `IStorageService` abstraction with factory pattern via `STORAGE_DRIVER` env var |
| Service | Built | `local-storage.service.ts` — local filesystem implementation (172 LOC) |
| Tests | Built | `local-storage.service.spec.ts` — 9 tests / 97 LOC covering all methods + error paths + init |
| Controllers | None | No REST endpoints — infrastructure module consumed internally via `STORAGE_SERVICE` token |

---

## 3. Screens

N/A — infrastructure service with no frontend UI.

---

## 4. API Endpoints

None — Storage is an internal infrastructure module with no REST API. Consumers inject `STORAGE_SERVICE` token directly.

**Exported token:** `STORAGE_SERVICE`

---

## 5. Components

N/A — no frontend components.

---

## 6. Hooks

N/A — no frontend hooks.

---

## 7. Business Rules

1. **Provider Abstraction:** `IStorageService` interface with factory pattern. `STORAGE_DRIVER` env var selects implementation. Currently only `local` is implemented.
2. **Local Storage:** Uses local filesystem via `STORAGE_LOCAL_PATH` and `STORAGE_PUBLIC_URL` (both from ConfigService). Auto-creates upload directory on module init (`OnModuleInit`).
3. **S3 Configuration:** Env vars `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` are defined in config but **aspirational only** — no S3 implementation exists yet.
4. **No Direct Access:** This module is injected into consumer modules — it has no REST API of its own.
5. **Error Handling:** All filesystem operations wrapped in try/catch with logging.

---

## 8. Data Model

No Prisma models. Storage operates on the filesystem directly.

---

## 9. Interface Methods

| Method | Signature | Status | Notes |
|--------|-----------|--------|-------|
| `upload()` | `upload(file: Buffer, filename: string, folder: string)` | Built | Returns public URL string |
| `delete()` | `delete(filepath: string)` | Built | Deletes by relative path |
| `getSignedUrl()` | `getSignedUrl(filepath: string, options?)` | Built | **WARNING:** No HMAC — appends `?expiresAt=TIMESTAMP` with no cryptographic signature (security theater) |
| `getUrl()` | `getUrl(filepath: string)` | Built | Returns public URL for file |
| `exists()` | `exists(filepath: string)` | Built | Checks file access via `fs.access()` |

**Not implemented:**
- `download()` — listed in previous hub but does NOT exist in code (phantom method). Consider adding for file content streaming (P3).

---

## 10. Status States

N/A — no entity state machine. Storage handles raw file I/O.

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| Path traversal vulnerability — `path.join()` does NOT prevent `../` traversal | **P2 BUG** | **Open** | `path.join('./uploads', '../../etc/passwd')` escapes storage dir. Current consumers mitigate by generating filenames server-side, but interface accepts arbitrary strings. Fix: `path.resolve()` + `startsWith()` prefix check. |
| No file type/size validation — `upload()` accepts any Buffer with any filename | **P2 BUG** | **Open** | No MIME type checking, no extension allowlist, no size limit. ProfileController uses unsanitized `file.originalname.split('.').pop()`. |
| Signed URL security theater — no cryptographic signature | P3 | Open | `getSignedUrl()` appends timestamp with no HMAC. Any user can modify expiry. Provides zero access control. |
| No tenant isolation in storage paths | P3 | Open | Files stored in flat `{folder}/{filename}` paths. Two tenants uploading `docs/invoice.pdf` would collide. Only ProfileController avoids this via `{userId}-{timestamp}.{ext}`. |
| No S3 implementation | P3 | Open | Only local filesystem driver exists. Production requires S3-compatible storage. |
| No `download()` method | P3 | Open | Interface has no method to stream file contents back to caller. |

---

## 12. Tasks

### Completed (verified by PST-35 tribunal)
| Task ID | Title | Status |
|---------|-------|--------|
| — | Basic storage abstraction with interface + local driver | **Done** |
| — | Unit tests for all methods + error paths + init | **Done** |
| — | `@Global()` module registration | **Done** |

### Open (from tribunal findings)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| STOR-001 | Add path sanitization — `path.resolve()` + `startsWith()` prefix check on ALL filesystem ops | XS (30min) | P2 |
| STOR-002 | Add file type validation (extension allowlist) and size limits to `upload()` | XS (30min) | P2 |
| STOR-003 | Implement HMAC-based signed URLs or remove `getSignedUrl()` | S (1h) | P3 |
| STOR-004 | Add tenant ID to folder paths (`{tenantId}/{folder}/{filename}`) | XS (30min) | P3 |
| STOR-005 | Build `S3StorageService` for production (AWS SDK v3) | M (2-3h) | P3 |
| STOR-006 | Add `download()` method for file content streaming | XS (30min) | P3 |

---

## 13. Design Links

N/A — infrastructure service with no design specs.

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Hub listed `download()` as interface method | `download()` does not exist | Phantom method — hub inaccurate |
| Hub listed Claims + Carrier Portal as consumers | Neither consumes Storage | 2 phantom consumers |
| Hub omitted Auth/Profile as consumer | ProfileController injects `STORAGE_SERVICE` for avatar upload | 1 real consumer undocumented |
| Hub omitted `exists()` + `getUrl()` methods | Both exist and work | 2 methods undocumented |
| Hub omitted `@Global()` decorator | Critical architectural fact | Module-level design omitted |
| Hub rated 5.0/10 | Verified 7.0/10 by PST-35 tribunal | Clean abstraction + good tests underrated |
| S3 env vars listed as active config | No S3 code exists — aspirational only | Hub overstated capability |

---

## 15. Dependencies

**Depends on:**
- Node.js `fs` module (filesystem operations)
- ConfigService (`STORAGE_LOCAL_PATH`, `STORAGE_PUBLIC_URL`, `STORAGE_DRIVER`)

**Depended on by:**
- Documents service (11) — `DocumentsService` injects `STORAGE_SERVICE`
- Auth/Profile (01) — `ProfileController` injects `STORAGE_SERVICE` for avatar upload

**NOT consumers (previously listed incorrectly):**
- ~~Claims (10)~~ — no `STORAGE_SERVICE` reference in Claims module
- ~~Carrier Portal (14)~~ — no `STORAGE_SERVICE` reference in Carrier Portal module

---

## 16. Files

| File | Purpose | LOC |
|------|---------|-----|
| `apps/api/src/modules/storage/storage.module.ts` | `@Global()` module definition, factory provider | — |
| `apps/api/src/modules/storage/storage.interface.ts` | `IStorageService` interface (upload, delete, getSignedUrl, getUrl, exists) | — |
| `apps/api/src/modules/storage/local-storage.service.ts` | Local filesystem implementation with OnModuleInit | 172 |
| `apps/api/src/modules/storage/local-storage.service.spec.ts` | Unit tests — 9 tests covering all methods + error paths + init | 97 |

**Total: 4 files, 269 LOC (172 source + 97 spec)**

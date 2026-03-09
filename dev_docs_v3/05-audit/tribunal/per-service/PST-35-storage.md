# PST-35 Storage — Per-Service Tribunal Audit

> **Date:** 2026-03-09 | **Auditor:** Claude Opus 4.6 | **Verdict:** MODIFY | **Score:** 7.0/10 (was 5.0)

---

## Hub Accuracy Summary

| Section | Hub Accuracy | Notes |
|---------|-------------|-------|
| File listing | **100%** | All 4 files correct |
| Implementation status | **95%** | Correct, underspecifies test count (9 tests, not just "has spec") |
| Interface methods | **60%** | `download()` phantom, `exists()` + `getUrl()` undocumented |
| Business rules | **70%** | S3 env vars aspirational (no S3 code exists) |
| Dependencies (consumers) | **33%** | 2 phantom (Claims, Carrier Portal), 1 missing (Auth/Profile) |
| @Global() annotation | **0%** | Critical architectural fact omitted |
| Data model | **100%** | Correctly omits Prisma models (none exist) |
| **Overall Hub Accuracy** | **~70%** | Best infra hub accuracy |

---

## Code Inventory

| Metric | Value |
|--------|-------|
| **Files** | 4 (module, interface, service, spec) |
| **Total LOC** | 269 (172 source + 97 spec) |
| **Controllers** | 0 |
| **Endpoints** | 0 |
| **Prisma Models** | 0 |
| **Tests** | 9 tests / 1 spec file / 97 LOC |
| **Module Type** | `@Global()` — available to all modules without imports |
| **Registered** | app.module.ts lines 18, 104 |
| **Exports** | `STORAGE_SERVICE` token |

---

## Interface: Hub vs Reality

| Method | Hub Claims | Actually Exists | Notes |
|--------|-----------|-----------------|-------|
| `upload(file, filename, folder)` | YES | YES | Returns public URL string |
| `download()` | YES | **NO** | PHANTOM — no download method |
| `delete(filepath)` | YES | YES | Deletes by relative path |
| `getSignedUrl(filepath, options)` | YES | YES | But FAKE — no HMAC, just timestamp param |
| `getUrl(filepath)` | NO | YES | MISSING from hub — returns public URL |
| `exists(filepath)` | NO | YES | MISSING from hub — checks file access |

**Interface accuracy: 60%** — 1 phantom method, 2 undocumented methods.

---

## Consumer Analysis

| Consumer | Hub Claims | Reality |
|----------|-----------|---------|
| Documents (service 11) | YES | **YES** — `DocumentsService` injects `STORAGE_SERVICE` |
| Claims (service 10) | YES | **NO** — no STORAGE_SERVICE reference anywhere in Claims module |
| Carrier Portal (service 14) | YES | **NO** — no STORAGE_SERVICE reference anywhere in Carrier Portal |
| Auth/Profile | NOT LISTED | **YES** — `ProfileController` injects `STORAGE_SERVICE` for avatar upload |

**Consumer accuracy: 33%** — 2 phantom consumers, 1 real consumer undocumented.

---

## Security Findings

### P2: Path Traversal Vulnerability
All filesystem operations use `path.join(storagePath, filepath)` with NO sanitization. `path.join('./uploads', '../../etc/passwd')` resolves to `../etc/passwd` — escapes storage directory. Affects `upload()`, `delete()`, `exists()`.

**Current mitigation:** Consumers (Documents, Profile) generate filenames server-side. But the interface accepts arbitrary strings — any future consumer passing user input is vulnerable.

**Fix:** Add `path.resolve()` + `startsWith()` prefix check before ALL filesystem operations.

### P2: No File Type/Size Validation
`upload()` accepts any Buffer with any filename. No MIME type checking, no file extension allowlist, no size limit. ProfileController extracts extension from `file.originalname.split('.').pop()` — unsanitized user input.

### P3: Signed URL Security Theater
`getSignedUrl()` appends `?expiresAt=TIMESTAMP` with no cryptographic signature. Any user can modify the timestamp. Provides zero access control.

### P3: No Tenant Isolation in Storage Paths
Files stored in flat `{folder}/{filename}` paths. Two tenants uploading `docs/invoice.pdf` would collide. Only ProfileController avoids this by using `{userId}-{timestamp}.{ext}`.

---

## Strengths

1. **Clean provider abstraction** — `IStorageService` interface with factory pattern via `STORAGE_DRIVER` env var
2. **@Global() module** — correctly available everywhere without explicit imports
3. **OnModuleInit** — auto-creates upload directory on startup
4. **Good test coverage** — 9/9 tests covering all methods + error paths + init
5. **ConfigService for all paths** — `STORAGE_LOCAL_PATH` and `STORAGE_PUBLIC_URL` configurable
6. **Proper error handling** — try/catch with logging on all operations
7. **Smallest focused module** — does one thing well (file I/O abstraction)

---

## Tribunal Verdicts (5 Rounds)

### Round 1: Health Score
Hub 5.0 → **7.0**. Clean abstraction, good tests, well-consumed. But local-only, no S3, security gaps prevent higher.

### Round 2: Interface Documentation
**60% accurate**. Phantom `download()`. Missing `exists()` + `getUrl()`. 4 errors on 5-method interface.

### Round 3: Consumer Documentation
**33% accurate**. Claims and Carrier Portal are phantom consumers. Auth/Profile is real but undocumented.

### Round 4: Security
Path traversal is **real P2**. `path.join()` does NOT prevent `../` traversal. Current consumers mitigate by generating filenames server-side, but interface is inherently unsafe.

### Round 5: Production Readiness
Correct architecture (factory pattern, interface abstraction), but needs S3 implementation, path sanitization, tenant-aware paths, real signed URLs, and file validation for production.

---

## Action Items

| # | Priority | Action | Effort |
|---|----------|--------|--------|
| 1 | **P2** | Add path sanitization — `path.resolve()` + `startsWith()` prefix check on ALL filesystem ops | 30min |
| 2 | **P2** | Add file type validation (extension allowlist) and size limits to `upload()` | 30min |
| 3 | **P3** | Implement HMAC-based signed URLs or remove `getSignedUrl()` | 1h |
| 4 | **P3** | Add tenant ID to folder paths (`{tenantId}/{folder}/{filename}`) | 30min |
| 5 | **P3** | Build `S3StorageService` for production (AWS SDK v3) | 2-3h |
| 6 | **P3** | Add `download()` method for file content streaming | 30min |
| 7 | **DOC** | Fix interface methods — remove `download()`, add `exists()` + `getUrl()` | 10min |
| 8 | **DOC** | Fix consumer list — remove Claims/Carrier Portal, add Auth/Profile | 10min |
| 9 | **DOC** | Document `@Global()` decorator | 5min |
| 10 | **DOC** | Note S3 env vars are aspirational, not currently used | 5min |

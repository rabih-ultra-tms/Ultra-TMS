# Storage Module API Spec

**Module:** `apps/api/src/modules/storage/`
**Base path:** N/A (infrastructure module -- no controllers)
**Controllers:** None
**Auth:** N/A
**Scope:** P0 (infrastructure)

---

## Overview

The Storage module is an **infrastructure-only module** with no HTTP endpoints. It provides a file storage abstraction layer used by other modules (documents, carrier uploads, etc.).

---

## Interface: IStorageService

**File:** `storage.interface.ts`

| Method | Signature | Description |
|--------|-----------|-------------|
| upload | `(file: Buffer, filename: string, folder?: string) => Promise<string>` | Upload file, returns public URL |
| delete | `(filepath: string) => Promise<void>` | Delete a file by relative path |
| getUrl | `(filepath: string) => string` | Get public URL for a file |
| getSignedUrl | `(filepath: string, options?: { expiresIn?: number }) => Promise<string>` | Get time-limited signed URL |
| exists | `(filepath: string) => Promise<boolean>` | Check if a file exists |

---

## Implementation: LocalStorageService

**File:** `local-storage.service.ts`
**Lines:** 100

Local filesystem storage provider. Stores files in a configurable directory.

### Configuration

| Env Variable | Default | Description |
|-------------|---------|-------------|
| `STORAGE_LOCAL_PATH` | `./uploads` | Local directory for file storage |
| `STORAGE_PUBLIC_URL` | `http://localhost:3001/uploads` | Base URL for accessing files |
| `STORAGE_DRIVER` | `local` | Storage driver selection |

### Behavior

- Creates storage directory on module init (`onModuleInit`)
- Uploads create subdirectories as needed (recursive mkdir)
- Signed URLs use a simple `?expiresAt=` query parameter (no cryptographic signing)
- File existence checked via `fs.access()`
- All operations log via NestJS Logger

### Limitations

- **No S3 support yet** -- factory in `storage.module.ts` has a placeholder `case 's3'` comment
- **No real signed URLs** -- the `expiresAt` parameter is not validated server-side
- **No cleanup** -- deleted file URLs are not invalidated
- **Test file exists** (`local-storage.service.spec.ts`) -- unit tests for the service

---

## Module Configuration

**File:** `storage.module.ts`
**Lines:** 33

- `@Global()` module -- available to all other modules without explicit import
- Uses factory provider with `STORAGE_SERVICE` injection token
- Factory reads `STORAGE_DRIVER` from ConfigService to select implementation
- Currently only `local` driver is implemented

### Injection Pattern

```typescript
// In any service that needs storage:
constructor(
  @Inject(STORAGE_SERVICE)
  private readonly storage: IStorageService,
) {}

// Usage:
const url = await this.storage.upload(fileBuffer, 'document.pdf', 'loads/123');
```

---

## Used By

- Documents module (load documents, carrier documents, order documents)
- Carrier module (insurance certificates, permits)
- Communication module (email attachments)

---

## Future Considerations

- Add `S3StorageService` implementation for production deployments
- Add real signed URL generation with HMAC
- Add file size tracking and quota management
- Add virus scanning integration

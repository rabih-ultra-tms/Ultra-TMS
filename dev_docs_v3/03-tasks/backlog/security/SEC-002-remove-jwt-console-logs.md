# SEC-002: Remove JWT Console.log Statements

**Priority:** P0
**Files:** `apps/web/app/(dashboard)/admin/layout.tsx` (originally reported)

## Current State
The originally reported issue in `apps/web/app/(dashboard)/admin/layout.tsx` appears to have been FIXED -- grep finds zero `console.log` statements in admin `.tsx`/`.ts` files. This was likely addressed during the Sonnet 4.5 audit (57 bugs fixed).

However, there is still one `console.error` in the API client for token refresh failures:
```typescript
// apps/web/lib/api/client.ts line 156
console.error("[api-client] Token refresh failed:", error);
```

And two `console.warn` statements for parse errors:
```typescript
// apps/web/lib/api/client.ts line 347
console.warn("[api-client] Failed to parse error response as JSON:", parseError);
// apps/web/lib/api/client.ts line 432
console.warn("[api-client] Failed to parse upload error response as JSON:", parseError);
```

## Requirements
- Verify no JWT/token values are logged anywhere in the frontend codebase
- Replace `console.error` for token refresh with a user-facing error (redirect to login)
- Console.warn for parse errors is acceptable (development only) but should be behind a debug flag
- Audit all `console.log` statements in `apps/web/` source files for any sensitive data leaks

## Acceptance Criteria
- [ ] No JWT tokens or auth credentials logged to console
- [ ] Token refresh failures handled gracefully (redirect, not console.error)
- [ ] Production builds have no sensitive console output
- [ ] Debug logging behind environment flag

## Dependencies
- API client refactoring
- Error boundary / error handling strategy

## Estimated Effort
S

# SEC-001: Replace localStorage Tokens with HttpOnly Cookies

**Priority:** P0
**Files:** `apps/web/lib/api/client.ts`

## Current State
The API client has been partially fixed. The file header comment states "NO localStorage usage (XSS-safe)" and grep confirms no `localStorage` calls remain in the API client directory. However, the current implementation uses `document.cookie` to store JWT tokens as non-HttpOnly cookies (via `writeCookie` function at line 38-41). This means JavaScript can still read the tokens, which is better than localStorage but not as secure as true HttpOnly cookies.

The `writeCookie` function sets: `document.cookie = '{name}={value}; Path=/; Max-Age={maxAge}; SameSite=Lax'` -- notably missing `HttpOnly` and `Secure` flags (HttpOnly cannot be set from JavaScript, only from server).

## Vulnerable Code
```typescript
// apps/web/lib/api/client.ts lines 38-41
function writeCookie(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}
```

## Requirements
- Backend should set HttpOnly, Secure, SameSite=Strict cookies on login response
- Frontend should NOT store tokens at all -- rely on backend `Set-Cookie` headers
- Remove `writeCookie`, `readCookie`, `getClientAccessToken`, `getClientRefreshToken` from client.ts
- Use `credentials: 'include'` on all fetch calls (already done)
- Backend needs to handle token refresh via HttpOnly cookie reading
- Auth middleware on backend should extract token from cookie header

## Acceptance Criteria
- [ ] Tokens stored as HttpOnly cookies set by backend
- [ ] No token accessible via `document.cookie` or `localStorage`
- [ ] Token refresh works via HttpOnly cookie
- [ ] Login/logout flow functions correctly
- [ ] SSR cookie forwarding still works

## Dependencies
- Backend auth module must set HttpOnly cookies
- Next.js middleware for SSR cookie forwarding

## Estimated Effort
L

# TEST-006: Integration Tests for Auth Flow

**Priority:** P0
**Service:** Auth
**Scope:** Integration tests for login, register, and token refresh flows

## Current State
No integration tests exist for the auth flow. The auth system includes:
- Login with optional MFA redirect
- Registration with email verification redirect
- Token storage via `setAuthTokens` / `clearAuthTokens` in `apps/web/lib/api/client.ts`
- Token refresh mechanism
- Logout with cache clearing

Known P0 bug: tokens stored in localStorage (XSS risk) -- tests should verify current behavior and be updated when the fix lands.

## Requirements
- Test full login flow: form submit -> API call -> token storage -> redirect to dashboard
- Test login with MFA: form submit -> API returns `requiresMfa: true` -> redirect to /mfa
- Test registration flow: form submit -> API call -> redirect to /login?registered=true
- Test token refresh: expired token -> automatic refresh -> retry original request
- Test logout: clear tokens, clear cache, redirect to login
- Test protected route redirect: unauthenticated user -> redirect to /login

## Acceptance Criteria
- [ ] Login success flow tested end-to-end (mock API, real components)
- [ ] Login MFA flow tested
- [ ] Registration flow tested
- [ ] Token refresh interceptor tested
- [ ] Logout flow tested (tokens cleared, cache cleared, redirect)
- [ ] Protected route guard tested
- [ ] Tests use MSW or similar for API mocking (not direct mock of apiClient)
- [ ] Tests pass in CI

## Dependencies
- MSW (Mock Service Worker) may need to be added if not already configured
- TEST-001 unit tests should be done first

## Estimated Effort
L

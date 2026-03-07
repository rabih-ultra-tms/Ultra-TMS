# Login

**Route:** `/login`
**File:** `apps/web/app/(auth)/login/page.tsx`
**LOC:** 315
**Status:** PROTECTED

## Data Flow
- **Hooks:** None (direct `fetch()` call, no React Query)
- **API calls:** `POST /api/v1/auth/login` with `{ email, password, tenantId: AUTH_CONFIG.defaultTenantId }`
- **Envelope:** Response unwrapped as `result.data.accessToken` -- correct double-unwrap since `fetch` returns raw JSON (not Axios). Tokens passed to `setAuthTokens()` from `@/lib/api/client`.

## UI Components
- **Pattern:** FormPage (single-purpose auth card)
- **Key components:** Card, Form (react-hook-form + zod), Input, Button, Checkbox, Alert
- **Interactive elements:** Email input, password input (with Eye/EyeOff toggle), "Remember this session" checkbox (no backend effect), "Forgot Password?" link, submit button. All handlers wired.

## State Management
- **URL params:** `?registered`, `?reset`, `?returnUrl` read via `useSearchParams` (inside Suspense boundary)
- **React Query keys:** None -- uses local `useState` for `isLoading`, `error`, `showPassword`, `rememberMe`

## Quality Assessment
- **Score:** 8/10
- **Bugs:**
  - `setAuthTokens` stores tokens in localStorage (P0-001 XSS risk)
  - `rememberMe` state is captured but never sent to backend or used to adjust token expiry
  - If `accessToken` is missing from response but response is 200, redirect still fires without auth
- **Anti-patterns:** None significant -- uses direct fetch (correct for auth pages), avoids apiClient
- **Missing:** No rate limiting on form. No CSRF token. Loading state present. Error state present. Empty state N/A.

# Super Admin Login

**Route:** `/superadmin/login`
**File:** `apps/web/app/(auth)/superadmin/login/page.tsx`
**LOC:** 289
**Status:** Complete

## Data Flow
- **Hooks:** None (direct `fetch()` call)
- **API calls:** `POST /api/v1/auth/login` with `{ email, password }` -- notably omits `tenantId` (unlike regular login which sends `AUTH_CONFIG.defaultTenantId`)
- **Envelope:** Response unwrapped as `result.data.accessToken` -- same pattern as regular login. Tokens passed to `setAuthTokens()`.

## UI Components
- **Pattern:** FormPage (auth card, near-identical to regular login)
- **Key components:** Card, Form (RHF + zod), Input (with icon prefixes), Button, Checkbox, Alert
- **Interactive elements:** Email input, password input (with Eye/EyeOff toggle), "Remember this session" checkbox (no backend effect), "Forgot Password?" link, submit button. All wired.

## State Management
- **URL params:** `?registered`, `?reset`, `?returnUrl` read via `useSearchParams` (inside Suspense boundary)
- **React Query keys:** None -- local `useState` for `isLoading`, `error`, `showPassword`, `rememberMe`

## Quality Assessment
- **Score:** 7/10
- **Bugs:**
  - Same `setAuthTokens` localStorage issue as regular login (P0-001 XSS risk)
  - `rememberMe` state captured but never used
  - `returnUrl` not validated against allowlist -- open redirect vulnerability
  - No role validation after login -- a regular user could authenticate here and get redirected
- **Anti-patterns:**
  - 95% code duplication with regular login page -- should be a shared component with config props
  - No Truck icon branding (regular login has it) -- inconsistent
- **Missing:** Loading state present. Error state present. No visual indicator this is a super admin portal beyond title text.

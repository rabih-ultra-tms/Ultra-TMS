# MFA Verification

**Route:** `/mfa?token={mfaToken}`
**File:** `apps/web/app/(auth)/mfa/page.tsx`
**LOC:** 206
**Status:** Complete

## Data Flow
- **Hooks:** None (direct `fetch()` call)
- **API calls:** `POST /api/v1/auth/mfa/verify` with `{ code, mfaToken }`
- **Envelope:** Not unwrapped -- success triggers `window.location.href = "/dashboard"` without reading response body tokens. Bug: tokens from MFA verify response are never stored via `setAuthTokens`.

## UI Components
- **Pattern:** FormPage (single-field TOTP auth card)
- **Key components:** Card, Form (RHF + zod), Input (styled center-aligned 2xl tracking-widest), Button, Alert
- **Interactive elements:** 6-digit code input (inputMode=numeric, maxLength=6), "Verify Code" submit button, "Contact support" link (goes to /forgot-password), "Back to Login" ghost button. All wired.

## State Management
- **URL params:** `?token` read via `useSearchParams` (inside Suspense boundary). Value stored as RHF hidden field `mfaToken`.
- **React Query keys:** None -- local `useState` for `isLoading`, `error`

## Quality Assessment
- **Score:** 6/10
- **Bugs:**
  - Tokens from MFA verify response are never stored -- `setAuthTokens` is not called. Redirect to /dashboard will fail auth unless backend sets HttpOnly cookie.
  - `useEffect` sets error when `!mfaToken` but doesn't prevent form rendering or provide early return
- **Anti-patterns:**
  - "Contact support" link goes to /forgot-password -- misleading UX
  - No resend/retry mechanism if mfaToken expires
- **Missing:** Loading state present. Error state present. No timeout warning for expiring tokens.

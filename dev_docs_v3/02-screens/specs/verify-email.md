# Verify Email

**Route:** `/verify-email?token={token}`
**File:** `apps/web/app/(auth)/verify-email/page.tsx`
**LOC:** 163
**Status:** Complete

## Data Flow
- **Hooks:** None (direct `fetch()` call inside `useEffect`)
- **API calls:** `POST /api/v1/auth/verify-email` with `{ token }` -- fires automatically on mount
- **Envelope:** Only checks `response.ok`. No data extraction from response body.

## UI Components
- **Pattern:** Custom (auto-action page, no user input required)
- **Key components:** Card (3 variants: verifying spinner, success checkmark, error xcircle), Button, Alert
- **Interactive elements:** "Go to Login" button (success state), "Back to Login" button (error state), "Contact support" link (error state, goes to /forgot-password). All wired.

## State Management
- **URL params:** `?token` read via `useSearchParams` (inside Suspense boundary)
- **React Query keys:** None -- local `useState` for `isVerifying`, `success`, `error`

## Quality Assessment
- **Score:** 6/10
- **Bugs:**
  - `setTimeout` for auto-redirect (3000ms) is never cleared on unmount -- memory leak in React strict mode (double-mount fires two redirects)
  - `useEffect` dependency array `[token]` but token is from `useSearchParams` which could change reference
- **Anti-patterns:**
  - "Contact support" link goes to /forgot-password -- misleading
  - No `aria-live` region for screen readers during state transitions
- **Missing:** Loading state present (spinner card). Error state present. Success state present with auto-redirect. No manual retry button on error.

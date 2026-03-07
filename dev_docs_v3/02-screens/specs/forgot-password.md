# Forgot Password

**Route:** `/forgot-password`
**File:** `apps/web/app/(auth)/forgot-password/page.tsx`
**LOC:** 171
**Status:** Complete

## Data Flow
- **Hooks:** None (direct `fetch()` call)
- **API calls:** `POST /api/v1/auth/forgot-password` with `{ email }`
- **Envelope:** Only checks `response.ok`. Anti-enumeration: success state shown regardless of email existence.

## UI Components
- **Pattern:** FormPage (single-field auth card with success state swap)
- **Key components:** Card, Form (RHF + zod), Input, Button, Alert
- **Interactive elements:** Email input, "Send reset link" submit button, "Back to Login" ghost button in footer, "Back to Login" outline button in success state. All wired.

## State Management
- **URL params:** None
- **React Query keys:** None -- local `useState` for `isLoading`, `error`, `success`

## Quality Assessment
- **Score:** 7/10
- **Bugs:** None
- **Anti-patterns:** No rate limiting on form submission (can spam reset emails)
- **Missing:** Loading state present. Error state present. Success state present. No re-send button on success state.

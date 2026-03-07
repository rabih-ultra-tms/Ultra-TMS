# Reset Password

**Route:** `/reset-password?token={token}`
**File:** `apps/web/app/(auth)/reset-password/page.tsx`
**LOC:** 42
**Status:** Complete

## Data Flow
- **Hooks:** None in page.tsx -- delegates to `ResetPasswordForm` component
- **API calls:** `POST /api/v1/auth/reset-password` (inside `components/auth/reset-password-form.tsx`)
- **Envelope:** Unknown from page.tsx alone -- must read `ResetPasswordForm` for details

## UI Components
- **Pattern:** FormPage (thin wrapper -- delegates to `AuthLayout` + `ResetPasswordForm`)
- **Key components:** `AuthLayout` (`components/auth/auth-layout`), `ResetPasswordForm` (`components/auth/reset-password-form`), Alert
- **Interactive elements:** "Back to sign in" link shown when token is missing. Form elements inside `ResetPasswordForm`.

## State Management
- **URL params:** `?token` read via `useSearchParams` (inside Suspense boundary)
- **React Query keys:** None in page.tsx

## Quality Assessment
- **Score:** 6/10
- **Bugs:** None in page.tsx
- **Anti-patterns:** Page is only 42 lines -- all logic delegated to child components, making this spec incomplete without reading `reset-password-form.tsx`
- **Missing:** Loading/error/success states handled inside `ResetPasswordForm`, not visible here. Token-missing error state handled inline.

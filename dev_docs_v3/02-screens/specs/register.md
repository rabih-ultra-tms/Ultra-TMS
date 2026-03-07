# Register

**Route:** `/register`
**File:** `apps/web/app/(auth)/register/page.tsx`
**LOC:** 265
**Status:** Complete

## Data Flow
- **Hooks:** None (direct `fetch()` call)
- **API calls:** `POST /api/v1/auth/register` with `{ firstName, lastName, email, password, confirmPassword, companyName }`
- **Envelope:** Response not unwrapped -- only checks `response.ok` for success. No token handling.

## UI Components
- **Pattern:** FormPage (auth card with success state swap)
- **Key components:** Card, Form (RHF + zod), Input (6 fields in grid layout), Button, Alert
- **Interactive elements:** firstName, lastName (2-col grid), companyName, email, password, confirmPassword inputs. Submit button. "Sign in" link in footer. "Go to Login" button on success state. All handlers wired.

## State Management
- **URL params:** None
- **React Query keys:** None -- local `useState` for `isLoading`, `error`, `success`

## Quality Assessment
- **Score:** 7/10
- **Bugs:** None critical
- **Anti-patterns:**
  - No password strength indicator despite min-8 validation
  - No password visibility toggle (login has one, register doesn't)
- **Missing:** Loading state present. Error state present. Success state present (replaces entire card). No email format preview. Login page says "Self-registration is disabled" -- potential mismatch if this page is accessible.

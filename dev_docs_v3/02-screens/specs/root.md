# Root Redirect

**Route:** `/`
**File:** `apps/web/app/page.tsx`
**LOC:** 5
**Status:** Complete

## Data Flow

- **Hooks:** None
- **API calls:** None
- **Envelope:** N/A

## UI Components

- **Pattern:** Server component redirect
- **Key components:** `redirect` from `next/navigation`
- **Interactive elements:** None -- immediate redirect to `/login`

## State Management

- **URL params:** None
- **React Query keys:** None
- **Local state:** None

## Quality Assessment

- **Score:** 8/10
- **Bugs:** None
- **Anti-patterns:** None
- **Missing:** Server component (good -- no client bundle). Redirects to `/login` which handles auth-check and forwards to dashboard if already authenticated. Minimal and correct.

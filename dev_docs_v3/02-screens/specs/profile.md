# Profile

**Route:** `/profile`
**File:** `apps/web/app/(dashboard)/profile/page.tsx`
**LOC:** 17
**Status:** Partial

## Data Flow

- **Hooks:** None in page.tsx -- delegated to sub-components
- **API calls:** Delegated to ProfileForm and AvatarUpload
- **Envelope:** Unknown from page.tsx

## UI Components

- **Pattern:** Custom (settings shell with 2-column grid)
- **Key components:** PageHeader, ProfileForm (`components/profile/profile-form`), AvatarUpload (`components/profile/avatar-upload`)
- **Interactive elements:** All inside sub-components.

## State Management

- **URL params:** None
- **React Query keys:** None in page.tsx

## Quality Assessment

- **Score:** 5/10
- **Bugs:** None in page.tsx
- **Anti-patterns:** 17-line shell -- all logic in sub-components, quality cannot be assessed from page alone
- **Missing:** No page-level loading/error states.

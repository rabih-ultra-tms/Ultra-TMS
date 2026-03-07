# Profile Security

**Route:** `/profile/security`
**File:** `apps/web/app/(dashboard)/profile/security/page.tsx`
**LOC:** 19
**Status:** Partial

## Data Flow

- **Hooks:** None in page.tsx -- delegated to sub-components
- **API calls:** Delegated to PasswordChangeForm, MFASettings, ActiveSessions
- **Envelope:** Unknown from page.tsx

## UI Components

- **Pattern:** Custom (security settings shell with 2-column grid + full-width section)
- **Key components:** PageHeader, PasswordChangeForm (`components/profile/password-change-form`), MFASettings (`components/profile/mfa-settings`), ActiveSessions (`components/profile/active-sessions`)
- **Interactive elements:** All inside sub-components.

## State Management

- **URL params:** None
- **React Query keys:** None in page.tsx

## Quality Assessment

- **Score:** 5/10
- **Bugs:** None in page.tsx
- **Anti-patterns:** 19-line shell -- all logic in sub-components
- **Missing:** No page-level loading/error states. 3 sub-components each manage their own state independently.

# Admin Settings

**Route:** `/admin/settings`
**File:** `apps/web/app/(dashboard)/admin/settings/page.tsx`
**LOC:** 19
**Status:** Partial

## Data Flow

- **Hooks:** None in page.tsx -- all data fetching delegated to sub-components
- **API calls:** Delegated to GeneralSettingsForm, SecuritySettingsForm, NotificationSettings
- **Envelope:** Unknown from page.tsx -- must read sub-components

## UI Components

- **Pattern:** Custom (settings shell with 3-column grid)
- **Key components:** PageHeader, GeneralSettingsForm (`components/admin/settings/general-settings-form`), SecuritySettingsForm (`components/admin/settings/security-settings-form`), NotificationSettings (`components/admin/settings/notification-settings`)
- **Interactive elements:** All inside sub-components. Page itself has zero interactive elements.

## State Management

- **URL params:** None
- **React Query keys:** None in page.tsx -- sub-components manage their own

## Quality Assessment

- **Score:** 5/10
- **Bugs:** None in page.tsx
- **Anti-patterns:** Page is 19 lines and delegates everything -- impossible to assess quality without reading 3 sub-components. No page-level loading or error handling.
- **Missing:** No page-level loading state. No page-level error state. 3-column grid (`lg:grid-cols-3`) may be cramped. No permission check.

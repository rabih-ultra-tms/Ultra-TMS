# Load Board Post Load

**Route:** `/load-board/post`
**File:** `apps/web/app/(dashboard)/load-board/post/page.tsx`
**LOC:** 33
**Status:** Complete

## Data Flow

- **Hooks:** None in page.tsx -- delegated to PostingForm
- **API calls:** Delegated to PostingForm component
- **Envelope:** Unknown from page.tsx

## UI Components

- **Pattern:** FormPage (header + PostingForm)
- **Key components:** PostingForm (`components/load-board/posting-form`), Button, Link
- **Interactive elements:** Back link to `/load-board`, all form interactions inside PostingForm.

## State Management

- **URL params:** None
- **React Query keys:** None in page.tsx

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None in page.tsx
- **Anti-patterns:** None -- clean page wrapper with proper back navigation
- **Missing:** No Suspense boundary. Quality depends on PostingForm component. Back link properly uses `<Link>` (good). Page header with description (good).

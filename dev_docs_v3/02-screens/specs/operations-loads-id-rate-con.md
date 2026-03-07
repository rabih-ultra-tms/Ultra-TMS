# Operations Rate Confirmation

**Route:** `/operations/loads/[id]/rate-con`
**File:** `apps/web/app/(dashboard)/operations/loads/[id]/rate-con/page.tsx`
**LOC:** 232
**Status:** Complete

## Data Flow

- **Hooks:** `useLoad(loadId)` (`lib/hooks/tms/use-loads`), `useRateConfirmation(loadId)` (`lib/hooks/tms/use-rate-confirmation`)
- **API calls:** `GET /api/v1/tms/loads/{id}`, `POST /api/v1/tms/loads/{id}/rate-confirmation/generate`, `POST /api/v1/tms/loads/{id}/rate-confirmation/email`
- **Envelope:** `load` returned directly from hook

## UI Components

- **Pattern:** Custom (4-column grid: options sidebar + PDF preview)
- **Key components:** Card (x2: PDF Options + Load Summary), Checkbox, Label, Textarea, RateConPreview (`components/tms/documents/rate-con-preview`), DocumentActions (`components/tms/documents/document-actions`), DetailPageSkeleton, ErrorState
- **Interactive elements:** "Include accessorials" checkbox, "Include terms" checkbox, custom message textarea, "Generate" button, "Download" button, "Email to Carrier" button, "Back to Load" button. All wired.

## State Management

- **URL params:** `[id]` from route params
- **React Query keys:** Via `useLoad(loadId)` and `useRateConfirmation(loadId)`
- **Local state:** `includeAccessorials`, `includeTerms`, `customMessage`

## Quality Assessment

- **Score:** 8/10
- **Bugs:** None
- **Anti-patterns:** `bg-white` hardcoded in header -- won't work in dark mode
- **Missing:** Loading state present (DetailPageSkeleton). Error state present (ErrorState). Not-found shows plain text "Load not found" (should use EmptyState). Blob URL cleanup on unmount via `useEffect`.

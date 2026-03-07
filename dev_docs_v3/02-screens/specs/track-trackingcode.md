# Public Shipment Tracking

**Route:** `/track/[trackingCode]`
**File:** `apps/web/app/track/[trackingCode]/page.tsx`
**LOC:** 125
**Status:** Complete

## Data Flow

- **Hooks:** `usePublicTracking` (`lib/hooks/tracking/use-public-tracking`)
- **API calls:** `GET /api/v1/tracking/public/{trackingCode}` (no auth required)
- **Envelope:** `data?.data` via hook -- correct

## UI Components

- **Pattern:** Custom (public page -- no dashboard layout, no sidebar, no auth)
- **Key components:** Custom header with logo, custom footer, inline NotFoundState component, Badge, Skeleton
- **Interactive elements:** None (read-only tracking display). Back-to-home link in header.

## State Management

- **URL params:** `trackingCode` from route params (React 19 `use(params)` with `Promise<{ trackingCode: string }>`)
- **React Query keys:** Via `usePublicTracking(trackingCode)`
- **Local state:** None

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None
- **Anti-patterns:**
  - Inline `NotFoundState` component defined in page file (~20 LOC)
- **Missing:** Public page without auth (correct for tracking). Custom header/footer instead of dashboard layout (correct). Loading via Skeleton (good). Error differentiation: `TrackingNotFoundError` vs generic error (good). React 19 `use(params)` (good). Clean, focused public page. Could extract NotFoundState to shared component. No SEO metadata (minor -- tracking pages typically not indexed).

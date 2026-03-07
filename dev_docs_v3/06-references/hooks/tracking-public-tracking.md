# usePublicTracking (tracking)

**File:** `apps/web/lib/hooks/tracking/use-public-tracking.ts`
**LOC:** 90

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `usePublicTracking` | `(trackingCode: string) => UseQueryResult<PublicTrackingData>` |
| `usePublicTrackingHistory` | `(trackingCode: string) => UseQueryResult<TrackingPoint[]>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| usePublicTracking | GET | /public/tracking/:code | PublicTrackingData |
| usePublicTrackingHistory | GET | /public/tracking/:code/history | TrackingPoint[] |

## Envelope Handling

**ANTI-PATTERN:** Uses raw `fetch()` instead of `apiClient` because public endpoints don't require authentication. Creates custom `PublicTrackingError` class for error handling.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["public-tracking", trackingCode]` | default | `!!trackingCode` |
| `["public-tracking", trackingCode, "history"]` | default | `!!trackingCode` |

## Mutations

None -- read-only public tracking.

## Quality Assessment

- **Score:** 5/10
- **Anti-patterns:**
  - **ANTI-PATTERN:** Uses raw `fetch()` instead of `apiClient` -- public endpoints could still use apiClient without auth headers
  - Custom `PublicTrackingError` class defined inline -- should be in a shared errors module
  - No `refetchInterval` for live tracking updates on public page
  - No retry configuration for flaky network conditions on public-facing page
- **Dependencies:** Raw `fetch`, custom `PublicTrackingError` class

# Tracking Components

**Path:** `apps/web/components/tracking/`

## Files

| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| PublicTrackingView | `public-tracking-view.tsx` | 300 | Public-facing tracking page (no auth required) with map and status |
| TrackingMapMini | `tracking-map-mini.tsx` | 119 | Compact map widget for embedding in load detail pages |
| TrackingStatusTimeline | `tracking-status-timeline.tsx` | 186 | Vertical timeline showing tracking status history |

**Total:** 3 files, ~605 LOC

## Notes

Additional tracking components live in `apps/web/components/tms/tracking/`:
- `TrackingMap` (761 LOC) - Full-screen Google Maps with real-time markers
- `TrackingPinPopup` (120 LOC) - Marker info popup
- `TrackingSidebar` (258 LOC) - Side panel with load list and filters

## Usage Patterns

- `PublicTrackingView` - Used at `/tracking/[token]` (public, no auth)
- `TrackingMapMini` - Embedded in load detail pages
- `TrackingStatusTimeline` - Used in load detail and public tracking views

## Dependencies

- `@react-google-maps/api` (Google Maps)
- `@/lib/google-maps` (API key, libraries config)
- `@/lib/hooks/tms/use-tracking` (WebSocket + polling for real-time positions)
- `@/components/ui/` (Badge, Card, Skeleton)

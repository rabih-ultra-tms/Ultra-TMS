# BLD-024: Load Board Post

**Priority:** P0
**Service:** Load Board
**Route:** `/load-board/post`
**Page file:** `apps/web/app/(dashboard)/load-board/post/page.tsx`

## Current State
Minimal page wrapper (33 LOC). Header with back button linking to `/load-board` and title/description. Renders `PostingForm` component for creating load board postings. All form logic lives in the `PostingForm` component.

## Requirements
- Verify `PostingForm` component handles all posting fields (origin, destination, equipment, rate, dates)
- Posting should optionally link to an existing load
- Equipment type selection
- Rate range specification (min/max or flat)
- Expiry date/time for posting visibility
- Contact information for carriers

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Posting submission creates load board entry
- [ ] Navigation back to dashboard after success

## Dependencies
- Backend: `POST /load-board/postings` (posting subdirectory exists in load-board module)
- Hook: Load board posting hooks
- Components: `PostingForm`

## Estimated Effort
M

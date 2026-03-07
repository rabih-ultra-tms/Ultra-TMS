# P1S-017: Change History Diff Viewer

**Priority:** P1
**Service:** Audit
**Scope:** Visual diff viewer for entity change history

## Current State
No change history or diff viewer exists.

## Requirements
- Show before/after for each field change
- Color-coded diff (green for additions, red for removals)
- Timeline of all changes to an entity
- Accessible from any entity detail page
- User who made the change and timestamp

## Acceptance Criteria
- [ ] Diff viewer shows field-level changes
- [ ] Color-coded additions/removals
- [ ] Timeline view of all changes
- [ ] Accessible from entity detail pages
- [ ] User and timestamp displayed
- [ ] Handles complex fields (arrays, nested objects)

## Dependencies
- P1S-016 (Audit log viewer)
- Backend stores before/after snapshots

## Estimated Effort
M

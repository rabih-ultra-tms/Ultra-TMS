# ACC-002: Keyboard Navigation for DataTable

**Priority:** P1
**Service:** Frontend Accessibility
**Scope:** Full keyboard navigation support for data tables

## Current State
Tables use standard HTML table elements but keyboard navigation beyond Tab is not implemented. Users cannot navigate between cells or rows with arrow keys.

## Requirements
- Arrow key navigation between rows
- Enter/Space to select row or trigger action
- Tab to move between interactive elements within a row
- Escape to deselect
- Home/End to jump to first/last row
- Screen reader announcements for row position

## Acceptance Criteria
- [ ] Arrow keys navigate between rows
- [ ] Enter opens row detail
- [ ] Space toggles row selection
- [ ] Tab navigates to action buttons within row
- [ ] Escape deselects current row
- [ ] Screen reader announces current row position (e.g., "Row 3 of 25")

## Dependencies
- None

## Estimated Effort
M

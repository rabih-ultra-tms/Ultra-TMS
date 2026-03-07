# ACC-001: ARIA Labels for All Interactive Elements

**Priority:** P1
**Service:** Frontend Accessibility
**Scope:** Add ARIA labels to all buttons, links, and interactive elements

## Current State
Some elements have aria-labels (e.g., checkbox `aria-label="Select all"` in list pages) but coverage is incomplete. Icon-only buttons often lack accessible labels.

## Requirements
- Audit all interactive elements for ARIA labels
- Add `aria-label` to icon-only buttons (e.g., MoreHorizontal menu trigger)
- Add `aria-label` to inputs without visible labels
- Add `aria-describedby` for fields with help text
- Ensure all links have descriptive text (not "click here")

## Acceptance Criteria
- [ ] All icon-only buttons have aria-labels
- [ ] All form inputs have labels (visible or aria-label)
- [ ] All links have descriptive text
- [ ] axe-core audit returns 0 ARIA violations
- [ ] Screen reader testing confirms accessibility

## Dependencies
- None

## Estimated Effort
M

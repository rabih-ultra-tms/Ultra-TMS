# ACC-004: Screen Reader Support for Status Badges

**Priority:** P1
**Service:** Frontend Accessibility
**Scope:** Make status badges accessible to screen readers

## Current State
Status badges use color to convey meaning (e.g., green for Active, red for Suspended). Screen readers cannot perceive color differences. Some badges use className-based color without text alternatives.

## Requirements
- Add `aria-label` or visually hidden text for status meaning
- Ensure color is not the only indicator (include text label)
- Status changes announced via `aria-live` regions
- Consistent status text across the application

## Acceptance Criteria
- [ ] All status badges have accessible text
- [ ] Screen reader announces status correctly
- [ ] Color is supplementary, not sole indicator
- [ ] Status changes announced dynamically
- [ ] Tested with VoiceOver/NVDA

## Dependencies
- UX-017 (Status color enforcement) should be done together

## Estimated Effort
S

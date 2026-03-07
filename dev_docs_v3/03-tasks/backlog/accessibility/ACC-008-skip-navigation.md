# ACC-008: Skip Navigation Links

**Priority:** P2
**Service:** Frontend Accessibility
**Scope:** Add skip navigation links for keyboard users

## Current State
No skip navigation links exist. Keyboard users must tab through the entire sidebar to reach the main content area.

## Requirements
- "Skip to main content" link as first focusable element
- "Skip to navigation" link for returning to sidebar
- Visually hidden until focused
- Main content area has `id="main-content"` landmark
- Works with screen readers

## Acceptance Criteria
- [ ] "Skip to main content" link appears on Tab press
- [ ] Link navigates focus to main content
- [ ] Visually hidden when not focused
- [ ] Main content landmark properly identified
- [ ] Works on all pages

## Dependencies
- None

## Estimated Effort
S

# UX-014: Dark Mode Toggle

**Priority:** P3
**Service:** Frontend UX
**Scope:** Add dark mode support to the application

## Current State
The application uses a light theme only. Tailwind 4 supports dark mode via the `dark:` variant. shadcn/ui components have dark mode support built in.

## Requirements
- Toggle switch in sidebar or settings
- System preference detection (prefers-color-scheme)
- Persist preference
- All components render correctly in dark mode
- Custom charts/graphs adapt to dark mode

## Acceptance Criteria
- [ ] Dark mode toggle accessible from UI
- [ ] System preference detection works
- [ ] Preference persisted
- [ ] All pages render correctly in dark mode
- [ ] No contrast issues in dark mode
- [ ] Status colors remain distinguishable

## Dependencies
- Design system token updates for dark mode variants

## Estimated Effort
L

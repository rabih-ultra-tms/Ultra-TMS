# ACC-010: Reduced Motion Support

**Priority:** P2
**Service:** Frontend Accessibility
**Scope:** Respect user's reduced motion preferences

## Current State
No reduced motion support implemented. CSS transitions and animations play regardless of user preference.

## Requirements
- Detect `prefers-reduced-motion` media query
- Disable or simplify animations when enabled
- Keep essential motion (loading spinners can remain but simplified)
- Remove decorative animations (hover effects, page transitions)
- Apply to all transition-based components (sidebar collapse, dialogs)

## Acceptance Criteria
- [ ] `prefers-reduced-motion` detected and respected
- [ ] Decorative animations disabled
- [ ] Essential loading indicators simplified
- [ ] Dialog open/close transitions simplified
- [ ] Sidebar collapse instant (no animation)
- [ ] Tested with OS reduced motion setting

## Dependencies
- None

## Estimated Effort
S

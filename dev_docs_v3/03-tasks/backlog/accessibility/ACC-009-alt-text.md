# ACC-009: Alt Text for All Images and Icons

**Priority:** P2
**Service:** Frontend Accessibility
**Scope:** Add descriptive alt text to all images and decorative icon handling

## Current State
Lucide React icons are used throughout the app. Images may lack alt text. Decorative icons should be hidden from screen readers while meaningful icons need labels.

## Requirements
- All `<img>` elements have descriptive `alt` text
- Decorative images have `alt=""`
- Decorative icons have `aria-hidden="true"`
- Meaningful icons (used without text) have `aria-label`
- Company logos have alt text
- Avatar images have alt text with user name

## Acceptance Criteria
- [ ] All images have appropriate alt text
- [ ] Decorative elements hidden from screen readers
- [ ] Meaningful icons labeled
- [ ] axe-core reports 0 image/alt violations
- [ ] Tested with screen reader

## Dependencies
- None

## Estimated Effort
S

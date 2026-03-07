# UX-005: Loading Skeleton Screens for All List Pages

**Priority:** P1
**Service:** Frontend UX
**Scope:** Replace "Loading..." text with skeleton screens on all list pages

## Current State
Most list pages show plain text like "Loading loads..." or "Loading..." during data fetch. No skeleton UI components are used for loading states.

## Requirements
- Create reusable skeleton components for table rows, cards, and stats
- Replace all "Loading..." text in list pages with skeleton screens
- Match the layout of the loaded content (same column widths, card sizes)
- Use shadcn/ui Skeleton component as base

## Acceptance Criteria
- [ ] Skeleton components created for table, card, and stats layouts
- [ ] All list pages use skeleton loading instead of text
- [ ] Skeleton layout matches loaded content structure
- [ ] No layout shift when data loads (CLS = 0)

## Dependencies
- None

## Estimated Effort
M

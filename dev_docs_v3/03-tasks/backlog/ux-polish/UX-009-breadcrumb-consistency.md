# UX-009: Breadcrumb Navigation Consistency

**Priority:** P1
**Service:** Frontend UX
**Scope:** Consistent breadcrumb navigation across all pages

## Current State
Breadcrumbs may exist on some detail pages but are not consistent across the application. Users navigating deep (e.g., Carriers > Carrier Detail > Edit) have no visual path indicator.

## Requirements
- Create a reusable Breadcrumb component
- Auto-generate breadcrumbs from route structure
- Apply to all detail and edit pages
- Clickable breadcrumb links for navigation
- Current page shown as non-clickable text

## Acceptance Criteria
- [ ] Breadcrumb component created
- [ ] Applied to all detail pages
- [ ] Applied to all edit pages
- [ ] Breadcrumb links are clickable and navigate correctly
- [ ] Current page is not clickable
- [ ] Mobile-friendly (truncate or collapse on small screens)

## Dependencies
- None

## Estimated Effort
M

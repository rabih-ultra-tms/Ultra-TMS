# PERF-008: Lazy Loading for Below-Fold Components

**Priority:** P2
**Service:** Frontend Infrastructure
**Scope:** Implement lazy loading for components not visible on initial page load

## Current State
Components are imported statically. Heavy components (charts, maps, editors) load immediately even if below the fold or in hidden tabs.

## Requirements
- Use React.lazy() and Suspense for heavy components
- Implement Intersection Observer for scroll-triggered loading
- Lazy load tab content (only load active tab)
- Loading placeholders during lazy load
- Prefetch on hover for likely interactions

## Acceptance Criteria
- [ ] Chart components lazy loaded
- [ ] Map components lazy loaded
- [ ] Tab content loads on tab activation
- [ ] Loading placeholders shown during lazy load
- [ ] No flash of empty content
- [ ] Initial page load time improvement measured

## Dependencies
- PERF-004 (Bundle size analysis) should be done first to identify targets

## Estimated Effort
M

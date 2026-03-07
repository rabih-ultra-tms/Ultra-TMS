# PERF-004: Bundle Size Analysis and Code Splitting

**Priority:** P1
**Service:** Frontend Infrastructure
**Scope:** Analyze and optimize frontend bundle size

## Current State
No bundle analysis has been performed. The app includes 304 components and 51 hooks. Next.js App Router provides some automatic code splitting per route, but shared dependencies may inflate the initial bundle.

## Requirements
- Run bundle analyzer to identify largest modules
- Implement dynamic imports for heavy components (charts, editors, maps)
- Ensure route-based code splitting is working correctly
- Identify and remove unused dependencies
- Target: initial JS bundle under 200KB gzipped

## Acceptance Criteria
- [ ] Bundle analysis report generated
- [ ] Top 10 largest modules identified
- [ ] Dynamic imports for heavy components
- [ ] Unused dependencies removed
- [ ] Initial bundle size measured and documented
- [ ] Before/after comparison

## Dependencies
- None

## Estimated Effort
M

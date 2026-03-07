# PERF-009: Core Web Vitals Optimization (LCP, CLS, INP)

**Priority:** P2
**Service:** Frontend Infrastructure
**Scope:** Optimize Core Web Vitals metrics

## Current State
No Core Web Vitals measurement or optimization has been done. Potential issues: layout shift from loading states, large content paint from heavy components, slow interaction from unoptimized event handlers.

## Requirements
- Measure current CWV scores (Lighthouse, CrUX)
- LCP optimization: optimize critical rendering path, preload key resources
- CLS optimization: skeleton screens with fixed dimensions, image dimensions
- INP optimization: debounce/throttle event handlers, optimize re-renders
- Target: all CWV metrics in "Good" range

## Acceptance Criteria
- [ ] Baseline CWV scores measured
- [ ] LCP under 2.5 seconds
- [ ] CLS under 0.1
- [ ] INP under 200ms
- [ ] Lighthouse score above 90 for Performance
- [ ] Monitoring set up for ongoing tracking

## Dependencies
- PERF-004, PERF-005, PERF-008 (bundle, images, lazy loading)

## Estimated Effort
L

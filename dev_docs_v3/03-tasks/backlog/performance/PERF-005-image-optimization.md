# PERF-005: Image Optimization (next/image Usage)

**Priority:** P2
**Service:** Frontend Infrastructure
**Scope:** Optimize image loading using Next.js Image component

## Current State
Image usage may not consistently use `next/image` component. No image optimization strategy in place.

## Requirements
- Audit all `<img>` tags and replace with `next/image`
- Configure image optimization in `next.config.js`
- Set appropriate sizes and quality settings
- Implement lazy loading for below-fold images
- Use WebP/AVIF formats where supported
- Add blur placeholder for large images

## Acceptance Criteria
- [ ] All images use `next/image` component
- [ ] Image optimization configured
- [ ] Lazy loading for below-fold images
- [ ] Modern format support (WebP/AVIF)
- [ ] Blur placeholder for hero images
- [ ] LCP improvement measured

## Dependencies
- None

## Estimated Effort
S

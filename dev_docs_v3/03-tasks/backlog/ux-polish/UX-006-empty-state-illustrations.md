# UX-006: Empty State Illustrations for All List Pages

**Priority:** P1
**Service:** Frontend UX
**Scope:** Add meaningful empty state UI with illustrations to all list pages

## Current State
Some pages have basic empty states (e.g., load-history shows a FileText icon with "No loads found" and a CTA button). Others show nothing or minimal text. No consistent pattern exists.

## Requirements
- Create a reusable EmptyState component
- Include relevant icon/illustration, message, description, and CTA button
- Apply to all list pages (carriers, loads, orders, invoices, quotes, etc.)
- Support filtered empty state ("No results match your filters" with "Clear filters" CTA)

## Acceptance Criteria
- [ ] Reusable EmptyState component created
- [ ] Applied to all list pages
- [ ] Filtered vs unfiltered empty states differentiated
- [ ] CTA buttons lead to create/add actions
- [ ] Consistent styling per design system

## Dependencies
- None

## Estimated Effort
M

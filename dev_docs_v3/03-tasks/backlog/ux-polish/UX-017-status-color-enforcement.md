# UX-017: Status Color System Enforcement Per Design Spec

**Priority:** P0
**Service:** Frontend UX
**Scope:** Enforce consistent status colors from design spec across all pages

## Current State
Status colors are defined in type files (e.g., `LOAD_STATUS_COLORS` in `types/load-history.ts`) and used via Badge className. The design spec at `dev_docs/12-Rabih-design-Process/00-global/03-status-color-system.md` defines the canonical color system. Some pages may use inconsistent colors.

## Requirements
- Audit all status badge colors against the design spec
- Create a single `STATUS_COLORS` map used across all pages
- Enforce via a shared component (StatusBadge) that takes status as prop
- Cover all status types: load, order, invoice, carrier, quote, etc.

## Acceptance Criteria
- [ ] Single StatusBadge component used everywhere
- [ ] Colors match design spec exactly
- [ ] No hardcoded color classes on status badges
- [ ] All entity types covered (load, order, invoice, carrier, quote, settlement)
- [ ] Visual consistency verified across all pages

## Dependencies
- Design spec: `dev_docs/12-Rabih-design-Process/00-global/03-status-color-system.md`

## Estimated Effort
M

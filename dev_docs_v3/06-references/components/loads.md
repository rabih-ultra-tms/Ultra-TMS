# Loads Components

**Path:** `apps/web/components/loads/`

## Files

| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| LoadFinancialsSection | `load-financials-section.tsx` | 145 | Financial breakdown section (customer rate, carrier rate, margin, accessorials) |
| LoadOverviewSection | `load-overview-section.tsx` | 222 | Load overview display with route, equipment, dates, status |

**Total:** 2 files, ~367 LOC

## Notes

This is a small directory with only overview-level components. The bulk of load-related components live in `apps/web/components/tms/loads/` (the TMS design system implementation), which contains the LoadForm, LoadStatusBadge, LoadDetailHeader, LoadsDataTable, and many more (26 components, ~4,000+ LOC).

## Usage Patterns

- `LoadOverviewSection` - Used in load detail pages for the overview tab
- `LoadFinancialsSection` - Used in load detail pages for the financial breakdown

## Dependencies

- `@/components/ui/` (Card, Badge)
- `@/types/loads` (Load type definitions)
- These are display-only components (no form logic)

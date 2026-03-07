# Sales Components

**Path:** `apps/web/components/sales/`

## Files

| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| QuoteActionsBar | `quote-actions-bar.tsx` | 306 | Action toolbar for quote detail (Send, Convert, Clone, Archive, etc.) |
| QuoteDetailOverview | `quote-detail-overview.tsx` | 513 | Full quote detail view with customer, route, rate breakdown |
| QuoteFormV2 | `quote-form-v2.tsx` | 729 | Full quote create/edit form (v2 rewrite) |
| QuoteRateSection | `quote-rate-section.tsx` | 532 | Rate calculation section with line haul, accessorials, fuel surcharge |
| QuoteStatusBadge | `quote-status-badge.tsx` | 27 | Status badge for quote states (Draft, Sent, Accepted, Declined, Expired) |
| QuoteStopsBuilder | `quote-stops-builder.tsx` | 328 | Multi-stop builder with pickup/delivery points and scheduling |
| QuoteTimelineSection | `quote-timeline-section.tsx` | 219 | Timeline of quote events (created, sent, viewed, countered, accepted) |
| QuoteVersionsSection | `quote-versions-section.tsx` | 108 | Version history section showing quote revisions |

**Total:** 8 files, ~2,762 LOC

## Usage Patterns

Used in `(dashboard)/sales/` route group:
- `/sales/quotes` - Quotes list page
- `/sales/quotes/new` - `QuoteFormV2` + `QuoteStopsBuilder` + `QuoteRateSection`
- `/sales/quotes/[id]` - `QuoteDetailOverview` + `QuoteActionsBar` + `QuoteTimelineSection` + `QuoteVersionsSection`
- `/sales/quotes/[id]/edit` - `QuoteFormV2` (edit mode)

## Dependencies

- `@/components/ui/` (shadcn primitives)
- `@/components/ui/address-autocomplete` (stop addresses)
- `@/lib/hooks/sales/` (useQuotes, useQuote, useCreateQuote, etc.)
- `@/lib/validations/quotes` (Zod schema)
- React Hook Form + Zod
- `QuoteFormV2` at 729 LOC is the most complex form component in the sales module
- `QuoteActionsBar` handles state machine transitions (Draft -> Sent -> Accepted/Declined)

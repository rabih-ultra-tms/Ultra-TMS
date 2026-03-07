# Carriers Components

**Path:** `apps/web/components/carriers/`

## Files

| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| CarrierContactsTab | `carrier-contacts-tab.tsx` | 138 | Tab displaying carrier contacts with add/edit/delete |
| CarrierDocumentsManager | `carrier-documents-manager.tsx` | 377 | Full document management with upload, view, delete for carriers |
| CarrierDocumentsSection | `carrier-documents-section.tsx` | 78 | Simplified document section (older version, thin wrapper) |
| CarrierDriversManager | `carrier-drivers-manager.tsx` | 409 | Driver CRUD management for a carrier (add, edit, CDL, expiry) |
| CarrierDriversSection | `carrier-drivers-section.tsx` | 177 | Simplified driver section |
| CarrierForm | `carrier-form.tsx` | 640 | Full carrier create/edit form with FMCSA lookup integration |
| CarrierInsuranceSection | `carrier-insurance-section.tsx` | 181 | Insurance details display with expiry tracking |
| CarrierLoadsTab | `carrier-loads-tab.tsx` | 148 | Tab showing loads assigned to a carrier |
| CarrierOverviewCard | `carrier-overview-card.tsx` | 169 | Overview card with company info, contact, payment methods |
| CarrierTrucksManager | `carrier-trucks-manager.tsx` | 520 | Truck fleet CRUD management for a carrier |
| CsaScoresDisplay | `csa-scores-display.tsx` | 171 | CSA safety scores visualization with colored gauges |
| FmcsaLookup | `fmcsa-lookup.tsx` | 243 | FMCSA carrier lookup by MC/DOT number with auto-fill |
| PerformanceMetricCard | `performance-metric-card.tsx` | 70 | Individual performance metric card (OTP, damage rate, etc.) |
| ScoreGauge | `score-gauge.tsx` | 111 | Circular gauge visualization for carrier scores |
| ScorecardLoadHistory | `scorecard-load-history.tsx` | 100 | Load history table within the carrier scorecard |
| TierProgressionBar | `tier-progression-bar.tsx` | 87 | Progress bar showing carrier tier advancement |
| TierBadge | `tier-badge.tsx` | 50 | Colored badge displaying carrier tier (Bronze/Silver/Gold/Platinum) |

**Total:** 17 files, ~3,669 LOC

## Usage Patterns

Used in `(dashboard)/carriers/` route group:
- `/carriers` - List page with carrier table
- `/carriers/new` - `CarrierForm` with `FmcsaLookup`
- `/carriers/[id]` - Tab-based detail page:
  - Overview: `CarrierOverviewCard` + `CsaScoresDisplay` + `TierBadge`
  - Documents: `CarrierDocumentsManager`
  - Drivers: `CarrierDriversManager`
  - Trucks: `CarrierTrucksManager`
  - Insurance: `CarrierInsuranceSection`
  - Contacts: `CarrierContactsTab`
  - Loads: `CarrierLoadsTab`
- `/carriers/[id]/scorecard` - `ScoreGauge` + `PerformanceMetricCard` + `TierProgressionBar` + `ScorecardLoadHistory`
- `/carriers/[id]/edit` - `CarrierForm` (edit mode)

## Dependencies

- `@/components/ui/` (shadcn primitives)
- `@/components/patterns/form-page` (CarrierForm uses FormPage pattern)
- `@/lib/validations/carriers` (Zod schema)
- `@/lib/hooks/carriers/` (useCarrier, useCarriers, useCarrierScorecard)
- `@/types/carriers` (OperationsCarrier, EQUIPMENT_TYPES)
- `@/components/ui/address-autocomplete` (Google Places integration)
- React Hook Form + Zod for forms

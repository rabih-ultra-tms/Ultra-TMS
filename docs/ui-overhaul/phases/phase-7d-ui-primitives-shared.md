# Phase 7D: UI Primitives & Shared Components Migration

**Priority:** LOW — These are mostly shadcn defaults with minor shadow hardcoding.

---

## UI Primitives — Shadow Classes (15 patterns)

These are shadcn/ui components with hardcoded `shadow-*` classes. Most are fine as-is since Tailwind's shadow utilities now use our CSS custom property values. Only update if shadows look wrong.

- [ ] `components/ui/dropdown-menu.tsx` (2 shadows)
- [ ] `components/ui/command.tsx` (2 shadows)
- [ ] `components/ui/alert-dialog.tsx` (2 shadows)
- [ ] `components/ui/tooltip.tsx` (1 shadow)
- [ ] `components/ui/sheet.tsx` (1 shadow)
- [ ] `components/ui/select.tsx` (1 shadow)
- [ ] `components/ui/dialog.tsx` (1 shadow)
- [ ] `components/ui/switch.tsx` (1 shadow)
- [ ] `components/ui/popover.tsx` (1 shadow)
- [ ] `components/ui/searchable-select.tsx` (1 shadow, 4 HTML)
- [ ] `components/ui/address-autocomplete.tsx` (1 shadow)

## Shared Components (8 patterns)

- [ ] `components/shared/confirm-dialog.tsx` (1 color)
- [ ] `components/loads/load-financials-section.tsx` (3 colors)

## CRM Components (8 patterns)

- [ ] `components/crm/customers/customer-form.tsx` (3 HTML)
- [ ] `components/crm/leads/leads-pipeline.tsx` (1 shadow)
- [ ] `components/crm/leads/lead-card.tsx` (1 shadow)

## Tracking (Public) (5 patterns)

- [ ] `components/tracking/tracking-map-mini.tsx` (2 colors, 1 shadow)
- [ ] `components/tracking/tracking-status-timeline.tsx` (1 color)

## Lib/Utils (8 patterns)

- [ ] `lib/design-tokens/status.ts` (4 colors — contains hardcoded badge class mappings)
- [ ] `lib/utils/format.ts` (4 colors)

---

## Build Verify
```bash
cd apps/web && npx next build
```

## Commit
```
style: migrate UI primitives and shared components to semantic tokens
```

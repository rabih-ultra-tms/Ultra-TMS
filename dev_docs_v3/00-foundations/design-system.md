# Design System — Ultra TMS (Rabih V1)

> **Status:** APPROVED by stakeholder (2026-02-12)
> **Design:** Rabih V1 — navy accent, Inter font, warm borders, dot-label badges
> **DO NOT change** this design without explicit stakeholder approval

---

## Design Philosophy

Ultra TMS uses the "Linear.app aesthetic" — a modern SaaS look with:
- Dark slate sidebar + white content area
- Clean typography (Inter font)
- Subtle warm borders (not harsh gray)
- Status conveyed through dot-label color badges
- Minimal animation (purposeful, not decorative)

---

## 3-Layer Token Architecture

Tokens are defined in `apps/web/app/globals.css`. Three layers:

### Layer 1 — Brand Tokens (change these to rebrand)
```css
--brand-hue: 222;           /* Navy blue */
--brand-saturation: 47%;
--brand-lightness: 11%;
```

### Layer 2 — Semantic Tokens
```css
--color-primary: hsl(var(--brand-hue), var(--brand-saturation), var(--brand-lightness));
--color-primary-hover: hsl(var(--brand-hue), 50%, 20%);
--color-sidebar-bg: hsl(222, 47%, 11%);
--color-sidebar-text: hsl(213, 31%, 91%);
--color-content-bg: hsl(0, 0%, 100%);
--color-border: hsl(220, 13%, 91%);     /* Warm border */
--color-muted: hsl(220, 9%, 46%);
```

### Layer 3 — Tailwind Mapping
CSS variables are mapped to Tailwind classes via `tailwind.config.ts`. Use these classes, never raw hex/rgb.

**RULE: Never use hardcoded colors. Always use CSS variables.**
```tsx
// WRONG
<div className="bg-[#1a2744]">
// RIGHT
<div className="bg-sidebar">
```

---

## Status Color System

From `dev_docs/12-Rabih-design-Process/00-global/03-status-color-system.md`:

| Status | Color | Dot Class | Use Case |
|---|---|---|---|
| Active / Success | Green | `dot-green` | Active carriers, delivered loads, paid invoices |
| Pending / In Transit | Blue | `dot-blue` | In-transit loads, pending quotes |
| Warning / Review | Yellow/Amber | `dot-amber` | Requires review, expiring documents |
| Inactive / Cancelled | Gray | `dot-gray` | Inactive carriers, cancelled orders |
| Critical / Overdue | Red | `dot-red` | Overdue payments, critical safety issues |
| Draft | Purple | `dot-purple` | Draft loads, unpublished rates |

---

## Component Library (31 TMS Components)

Located in `apps/web/components/tms/` — approved, do not rebuild.

### Shared Components (used across all services)
| Component | Path | Purpose |
|---|---|---|
| DataTable | `tms/shared/DataTable.tsx` | Server-side paginated data tables |
| PageHeader | `tms/shared/PageHeader.tsx` | Page title + action buttons |
| StatusBadge | `tms/shared/StatusBadge.tsx` | Dot-label status indicators |
| KPICard | `tms/shared/KPICard.tsx` | Metric cards for dashboards |
| FilterBar | `tms/shared/FilterBar.tsx` | Search + filter controls |
| EmptyState | `tms/shared/EmptyState.tsx` | Empty data placeholder |
| ErrorState | `tms/shared/ErrorState.tsx` | Error with retry button |
| LoadingSkeleton | `tms/shared/LoadingSkeleton.tsx` | Content loading skeleton |
| ConfirmDialog | `tms/shared/ConfirmDialog.tsx` | Confirmation modal (replaces window.confirm) |
| FormField | `tms/shared/FormField.tsx` | RHF-integrated form field wrapper |

### Domain Components (service-specific)
| Component | Path | Service |
|---|---|---|
| LoadCard | `tms/loads/LoadCard.tsx` | TMS Core |
| CarrierCard | `tms/carriers/CarrierCard.tsx` | Carriers |
| QuoteCard | `tms/sales/QuoteCard.tsx` | Sales |
| CustomerCard | `tms/crm/CustomerCard.tsx` | CRM |
| InvoiceCard | `tms/accounting/InvoiceCard.tsx` | Accounting |
| DispatchBoard | `tms/dispatch/DispatchBoard.tsx` | TMS Core |
| TrackingMap | `tms/tracking/TrackingMap.tsx` | TMS Core |

**Note:** Exact file paths may vary — verify with Glob before using.

---

## Storybook

**26 stories** in `apps/web/stories/`

Run with: `pnpm storybook` (port 6006)

All approved components have stories. When building new components, add a story.

---

## Typography

| Use | Font | Weight | Size |
|---|---|---|---|
| Body | Inter | 400 | 14px |
| Label | Inter | 500 | 12px |
| Heading H1 | Inter | 700 | 24px |
| Heading H2 | Inter | 600 | 20px |
| Heading H3 | Inter | 600 | 16px |
| Code | JetBrains Mono | 400 | 13px |

---

## Spacing & Layout

- **Grid:** 12-column responsive grid
- **Content max-width:** 1280px (with auto margins)
- **Sidebar width:** 240px (collapsed: 64px)
- **Page padding:** 24px (desktop), 16px (mobile)
- **Card padding:** 16px
- **Border radius:** 8px (cards), 6px (inputs), 4px (badges)

---

## shadcn/ui Integration

Primary component library. Located in `apps/web/components/ui/`.

Key components installed:
- Button, Input, Select, Textarea, Checkbox, Switch
- Dialog, Sheet, Popover, Tooltip, DropdownMenu
- Table, Card, Badge, Separator
- Form (RHF integration)
- Toast (Sonner)

**Never install new shadcn components without checking if one already exists.**

---

## Build History

| Session | Date | What Changed |
|---|---|---|
| 1 | 2026-02-09 | Initial design tokens + 8 base components |
| 2 | 2026-02-10 | StatusBadge + KPICard + FilterBar |
| 3 | 2026-02-10 | DataTable + pagination |
| 4 | 2026-02-11 | Domain components (LoadCard, CarrierCard) |
| 5 | 2026-02-11 | Forms (FormField + RHF patterns) |
| 6 | 2026-02-12 | Final iteration + Storybook setup |
| 7 | 2026-02-12 | APPROVED by Rabih (stakeholder) |

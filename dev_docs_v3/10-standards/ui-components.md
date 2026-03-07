# UI Component Standards

> Source: `dev_docs/08-standards/69-ui-component-standards.md`
> Stack: shadcn/ui (Radix UI + Tailwind 4), Lucide React icons

## Design System

- **Style:** Modern SaaS (Linear.app aesthetic)
- **Sidebar:** Dark slate-900
- **Content area:** White background
- **Primary color:** Blue-600
- **Font:** Inter
- **Icons:** Lucide React

## Token Architecture

3-layer system defined in `apps/web/app/globals.css`:
1. **Brand tokens:** `--color-brand-*` (raw values)
2. **Semantic tokens:** `--color-primary`, `--color-danger`, etc.
3. **Tailwind integration:** Used in `tailwind.config.ts`

## Component Library

- **Base:** `apps/web/components/ui/` — shadcn/ui primitives
- **TMS:** `apps/web/components/tms/` — 31 approved components (DO NOT MODIFY)
- **Stories:** `apps/web/stories/` — 26 Storybook files

## Status Colors

See `dev_docs/12-Rabih-design-Process/00-global/03-status-color-system.md`

| Status | Color | Usage |
|--------|-------|-------|
| Active/Success | Green | ACTIVE, DELIVERED, PAID |
| Warning | Amber | PENDING, IN_PROGRESS |
| Error/Danger | Red | CANCELLED, REJECTED, OVERDUE |
| Info | Blue | NEW, DRAFT |
| Neutral | Gray | INACTIVE, ARCHIVED |

## Component Usage Rules

1. **Always use shadcn/ui** — never install additional UI libraries
2. **Use dot-label badges** for status indicators (approved pattern)
3. **DataTable** for all list views — includes sorting, filtering, pagination
4. **Dialog** for modals — never use native `alert()` or `confirm()`
5. **Toast** for success/error feedback — via `sonner`
6. **Form fields** wrapped in `<FormField>` from React Hook Form
7. **Icons** from Lucide only — consistent 20px size

## Spacing & Layout

- Page padding: `p-6`
- Card padding: `p-4` or `p-6`
- Section gap: `space-y-6`
- Form field gap: `space-y-4`
- Button gap: `gap-2`
- 12-column grid for dashboard widgets

## Responsive Design

- Mobile-first approach
- Breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
- Sidebar collapses on mobile
- DataTable scrolls horizontally on small screens

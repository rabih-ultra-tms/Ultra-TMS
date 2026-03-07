# PageHeader

There are **two PageHeader components** in the codebase serving different purposes.

---

## 1. PageHeader (UI layer)

**File:** `apps/web/components/ui/PageHeader.tsx`
**Lines:** 42
**Exports:** `PageHeader` (named + default)

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | `string` | Yes | - | Page title (renders as `<h1>`) |
| subtitle | `string` | No | - | Subtitle text below title |
| description | `string` | No | - | Alias for subtitle |
| actions | `ReactNode` | No | - | Right-side action buttons |
| children | `ReactNode` | No | - | Fallback for actions |
| className | `string` | No | - | Additional CSS classes |

### Usage

Used on CRM, admin, and general dashboard pages. Renders a responsive flex layout with title on the left and actions on the right, separated by a bottom border.

### Used By

36 pages including: leads, contacts, companies, admin/users, admin/roles, admin/settings, profile, activities, audit-logs, quotes, and more.

---

## 2. PageHeader (TMS layout layer)

**File:** `apps/web/components/tms/layout/page-header.tsx`
**Lines:** 69
**Exports:** `PageHeader`, `PageHeaderProps`

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | `ReactNode` | No | - | Page title (14px/600 weight) |
| center | `ReactNode` | No | - | Center slot, typically search input (max-w 320px) |
| actions | `ReactNode` | No | - | Right-side actions (buttons, notifications) |
| className | `string` | No | - | Additional CSS classes |

### Usage

Used in dispatch v5 design pages. Fixed 48px height header bar with three-slot layout (left title, center search, right actions). Uses design token CSS variables (`bg-surface`, `text-text-primary`).

### Used By

- Dispatch board
- Operations loads page
- TMS list pages using the v5 design

---

## Key Differences

| Feature | UI PageHeader | TMS PageHeader |
|---------|---------------|----------------|
| Height | Auto (with padding) | Fixed 48px |
| Title type | `string` only | `ReactNode` |
| Layout | Two slots (left/right) | Three slots (left/center/right) |
| Border | Bottom border with pb-4 | Bottom border, bg-surface |
| Design system | Standard Tailwind | v5 design tokens |
| Import path | `@/components/ui/PageHeader` | `@/components/tms/layout/page-header` |

## Quality Assessment

**UI PageHeader: 7/10** -- Simple, clean, well-typed. Missing responsive description handling.

**TMS PageHeader: 8/10** -- Well-documented v5 spec compliance, proper semantic `<header>` element, transitions for theme changes.

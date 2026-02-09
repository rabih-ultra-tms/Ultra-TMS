# Design Toolkit Guide

> **What is this?** How to make component and design decisions, with or without MCP design servers.
> Claude Code users have MCP access to shadcn, magicui, superdesign, and gemini servers.
> Everyone else: use this guide for manual equivalents.

---

## Component Decision Tree

Need a UI element? Follow this tree:

### Data Display

| Need | Component | Install | Pattern Reference |
|------|-----------|---------|-------------------|
| Data table with sorting/filtering | shadcn `Table` + TanStack Table | Already installed | `apps/web/app/(dashboard)/truck-types/page.tsx` |
| Status indicator | shadcn `Badge` with semantic colors | Already installed | `dev_docs_v2/00-foundations/design-system.md` |
| KPI/metric card | Custom `KPICard` | Build in COMP-003 | Design: `dev_docs/12-Rabih-design-Process/01.1-dashboard-shell/01-main-dashboard.md` |
| Charts/graphs | Recharts | Already in package.json | https://recharts.org/en-US/api |
| Skeleton loading | shadcn `Skeleton` | Already installed | Compose to match page layout |

### Forms

| Need | Component | Install | Pattern Reference |
|------|-----------|---------|-------------------|
| Text input | shadcn `Input` + `Form` | Already installed | Use with React Hook Form + Zod |
| Select dropdown | shadcn `Select` | Already installed | — |
| Date picker | Custom `DateRangePicker` | Build in COMP-009 | shadcn `Popover` + `Calendar` |
| Multi-step form | Custom wizard | — | Study Load Planner pattern |
| Form validation | Zod schema + `zodResolver` | Already installed | — |

### Navigation & Layout

| Need | Component | Install | Pattern Reference |
|------|-----------|---------|-------------------|
| Modal dialog | shadcn `Dialog` | Already installed | — |
| Side panel | shadcn `Sheet` | Already installed | — |
| Tabs | shadcn `Tabs` | Already installed | — |
| Dropdown menu | shadcn `DropdownMenu` | Already installed | Row actions pattern |
| Confirmation | shadcn `AlertDialog` | Already installed | Wrap as ConfirmDialog (COMP-006) |

### Feedback

| Need | Component | Install | Pattern Reference |
|------|-----------|---------|-------------------|
| Toast notification | shadcn `Toast` | Already installed | Use for success/error after mutations |
| Tooltip | shadcn `Tooltip` | Already installed | — |
| Error state | Custom `ErrorState` | Build per page | Include retry button |
| Empty state | Custom `EmptyState` | Build per page | Include icon + CTA |

---

## What's Already Installed

In `apps/web/components/ui/`:

```
button, card, dialog, dropdown-menu, input, label, select,
separator, sheet, skeleton, table, tabs, textarea, toast,
tooltip, badge, avatar, checkbox, command, form, popover,
scroll-area, switch, alert-dialog, collapsible
```

## What Needs Installing (COMP-008)

```bash
npx shadcn@latest add radio-group accordion breadcrumb resizable toggle toggle-group chart drawer input-otp
```

---

## Manual Component Lookup (Without MCP)

If you don't have MCP servers, use these URLs:

| Resource | URL |
|----------|-----|
| shadcn/ui components | https://ui.shadcn.com/docs/components |
| shadcn/ui themes | https://ui.shadcn.com/themes |
| magicui components | https://magicui.design/docs |
| Tailwind CSS docs | https://tailwindcss.com/docs |
| Lucide icons | https://lucide.dev/icons |
| Recharts API | https://recharts.org/en-US/api |
| TanStack Table | https://tanstack.com/table/latest/docs |
| React Hook Form | https://react-hook-form.com/get-started |
| Zod docs | https://zod.dev |

---

## Design System Quick Reference

**Style:** Modern SaaS (Linear.app aesthetic)

| Element | Value |
|---------|-------|
| Sidebar | `bg-slate-900`, white text |
| Content background | `bg-white` or `bg-gray-50` |
| Primary action | `bg-blue-600` / `hover:bg-blue-700` |
| Page title | `text-2xl font-semibold` |
| Body text | `text-sm` |
| Caption | `text-xs text-muted-foreground` |
| Page padding | `p-6` |
| Card padding | `p-4` or `p-6` |
| Section gap | `space-y-6` |

### Status Color Families

| Role | Background | Text | Use For |
|------|------------|------|---------|
| Success | `bg-emerald-50` | `text-emerald-700` | Completed, Delivered, Active |
| Warning | `bg-amber-50` | `text-amber-700` | Expiring, At Pickup, On Hold |
| Danger | `bg-red-50` | `text-red-700` | Cancelled, Rejected, Overdue |
| Info | `bg-blue-50` | `text-blue-700` | Booked, Accepted |
| Neutral | `bg-gray-100` | `text-gray-700` | Pending, Draft, Inactive |
| In-Progress | `bg-indigo-50` | `text-indigo-700` | Dispatched, Processing |
| Queued | `bg-violet-50` | `text-violet-700` | Quoted, Under Review |
| Special | `bg-cyan-50` | `text-cyan-700` | In Transit, Picked Up |

Full reference: `dev_docs_v2/00-foundations/design-system.md`

---

## Gold Standard Pages (Study These)

Before building a new page, study these working examples:

### Truck Types — Best List Page
**Path:** `apps/web/app/(dashboard)/truck-types/page.tsx`
**Quality:** 8/10
**Patterns:** Clean CRUD, inline editing, proper data table, status badges

### Load Planner — Best Complex Form
**Path:** `apps/web/app/(dashboard)/load-planner/[id]/edit/page.tsx`
**Quality:** Production-ready (1,825 LOC)
**Patterns:** Multi-step form, Google Maps integration, AI cargo extraction, real API calls

### Login — Best Auth Flow
**Path:** `apps/web/app/(auth)/login/page.tsx`
**Quality:** 8/10
**Patterns:** Form validation, error handling, clean layout

---

## Design Inspiration (Without superdesign MCP)

If you don't have the superdesign MCP server for AI-generated design suggestions:

1. **Design specs are your primary source:** `dev_docs/12-Rabih-design-Process/` has 89 screens with ASCII wireframes, component inventories, and layout descriptions
2. **Reference aesthetic:** Linear.app — clean, minimal, functional
3. **External inspiration:**
   - Dribbble: search "TMS dashboard", "logistics software UI"
   - Behance: search "fleet management dashboard"
   - SaaS screenshots: Linear, Notion, Vercel dashboard

---

## Anti-Patterns (Never Do These)

| Wrong | Right |
|-------|-------|
| `window.confirm("Delete?")` | `<ConfirmDialog>` or shadcn `AlertDialog` |
| `"Loading..."` bare text | `<Skeleton>` matching content shape |
| `bg-[#10B981]` hardcoded hex | `bg-emerald-50 text-emerald-700` |
| `style={{ color: 'red' }}` | Tailwind classes |
| 800+ line page file | Extract: Table, Stats, Filters, Actions components |
| `onClick={() => {}}` empty | Wire to real handler or remove the button |
| `href="#"` placeholder | Wire to real route or remove the link |

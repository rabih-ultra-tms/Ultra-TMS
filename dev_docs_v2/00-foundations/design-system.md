# Design System Reference

> Full status color reference: `dev_docs/12-Rabih-design-Process/00-global/03-status-color-system.md`
> Design quality diagnosis: `dev_docs/Claude-review-v1/03-design-strategy/01-current-state-diagnosis.md`

---

## Design Style

Modern SaaS (Linear.app aesthetic):

- **Sidebar**: `bg-slate-900` (dark), white text
- **Content area**: `bg-white` (or `bg-gray-50` for page backgrounds)
- **Primary action color**: `bg-blue-600` / `hover:bg-blue-700`
- **Icons**: Lucide React
- **Components**: shadcn/ui (Radix UI + Tailwind 4)

---

## Status Color Families

Use these 8 semantic color families for ALL status displays. Never hardcode hex values.

| Role | Tailwind BG | Tailwind Text | Use For |
|------|-------------|---------------|---------|
| Success | `bg-emerald-50` | `text-emerald-700` | Completed, Delivered, Active, Approved |
| Warning | `bg-amber-50` | `text-amber-700` | Expiring, At Pickup, On Hold |
| Danger | `bg-red-50` | `text-red-700` | Cancelled, Rejected, Blocked, Overdue |
| Info | `bg-blue-50` | `text-blue-700` | Booked, Accepted, Active (default) |
| Neutral | `bg-gray-100` | `text-gray-700` | Pending, Inactive, Draft |
| In-Progress | `bg-indigo-50` | `text-indigo-700` | Dispatched, Processing |
| Queued | `bg-violet-50` | `text-violet-700` | Quoted, Tendered, Under Review |
| Special | `bg-cyan-50` | `text-cyan-700` | In Transit, Picked Up |

### Usage Pattern (until StatusBadge component exists)

```tsx
// CORRECT — semantic classes
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
  Active
</span>

// WRONG — hardcoded hex
<span className="bg-[#10B981] text-white">Active</span>

// WRONG — arbitrary values
<span style={{ backgroundColor: '#D1FAE5' }}>Active</span>
```

### After COMP-001 (Design Tokens) is done

```tsx
import { STATUS_COLORS } from '@/lib/design-tokens'

// Use the centralized mapping
<StatusBadge status={carrier.status} colorMap={STATUS_COLORS.carrier} />
```

---

## Typography Scale

| Element | Class | Size |
|---------|-------|------|
| Page title | `text-2xl font-semibold` | 24px |
| Section title | `text-lg font-semibold` | 18px |
| Card title | `text-base font-medium` | 16px |
| Body text | `text-sm` | 14px |
| Caption/label | `text-xs text-muted-foreground` | 12px |
| Stat number | `text-3xl font-bold` | 30px |

---

## Spacing

| Context | Class | Value |
|---------|-------|-------|
| Page padding | `p-6` | 24px |
| Section gap | `space-y-6` | 24px |
| Card grid gap | `gap-4` | 16px |
| Card internal padding | `p-4` or `p-6` | 16-24px |
| Form field gap | `space-y-4` | 16px |
| Inline element gap | `gap-2` | 8px |

---

## Anti-Patterns (Never Do These)

| Anti-Pattern | What to Do Instead |
|---|---|
| `window.confirm("Delete?")` | Use `<ConfirmDialog>` component (COMP-006) |
| `"Loading..."` bare text | Use `<Skeleton>` or shimmer matching content shape |
| `bg-[#10B981]` hardcoded hex | Use semantic Tailwind classes (`bg-emerald-50`) |
| `as any` type cast | Define proper TypeScript types |
| `console.log(token)` | Remove before commit |
| `localStorage.setItem("token")` | Use HTTP-only cookies (already configured) |
| 800+ line page file | Extract components: Table, Stats, Filters, Actions |
| Inline `style={{}}` | Use Tailwind classes |
| `onClick={() => {}}` empty handler | Wire to real action or remove the button |
| `href="#"` placeholder link | Wire to real route or remove the link |

---

## Key Components (shadcn/ui)

Already installed in `apps/web/components/ui/`:

```
button, card, dialog, dropdown-menu, input, label, select,
separator, sheet, skeleton, table, tabs, textarea, toast,
tooltip, badge, avatar, checkbox, command, form, popover,
scroll-area, switch, alert-dialog, collapsible
```

Still need to install (COMP-008 task):

```bash
npx shadcn@latest add radio-group accordion breadcrumb resizable toggle toggle-group chart drawer input-otp
```

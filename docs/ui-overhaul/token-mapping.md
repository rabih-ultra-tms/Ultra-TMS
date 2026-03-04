# Token Migration Reference — Command Center

Use this table to systematically replace hardcoded Tailwind classes with semantic token classes.

---

## Text Colors

| Old (Hardcoded) | New (Semantic) | Context |
|-----------------|----------------|---------|
| `text-gray-900`, `text-slate-900` | `text-foreground` | Primary body text |
| `text-gray-800`, `text-slate-800` | `text-foreground` | Primary body text |
| `text-gray-700`, `text-slate-700` | `text-text-primary` | Strong text |
| `text-gray-600`, `text-slate-600` | `text-text-secondary` | Secondary text |
| `text-gray-500`, `text-slate-500` | `text-text-secondary` | Secondary/label text |
| `text-gray-400`, `text-slate-400` | `text-text-muted` | Placeholder/muted text |
| `text-gray-300`, `text-slate-300` | `text-text-muted` | Disabled/very muted text |
| `text-white` | `text-primary-foreground` | Text on primary bg |
| `text-white` | `text-sidebar-foreground` | Text on sidebar bg |
| `text-black` | `text-foreground` | Primary text |
| `text-blue-600`, `text-blue-700` | `text-primary` | Brand-colored text, links |
| `text-blue-500` | `text-primary` | Links, interactive |
| `text-indigo-600` | `text-primary` | Brand accent text |

## Background Colors

| Old (Hardcoded) | New (Semantic) | Context |
|-----------------|----------------|---------|
| `bg-white` | `bg-card` | Card/surface backgrounds |
| `bg-white` | `bg-background` | Only for page-level (use bg-card for sections) |
| `bg-gray-50`, `bg-slate-50` | `bg-muted` | Subtle background, filter bars |
| `bg-gray-100`, `bg-slate-100` | `bg-muted` | Hover states, disabled |
| `bg-gray-200`, `bg-slate-200` | `bg-secondary` | Stronger muted background |
| `bg-gray-900`, `bg-slate-900` | `bg-sidebar` | Dark backgrounds |
| `bg-blue-600`, `bg-blue-700` | `bg-primary` | Primary action backgrounds |
| `bg-blue-500` | `bg-primary` | Primary backgrounds |
| `bg-blue-50` | `bg-primary-light` | Light primary tint |
| `bg-indigo-600` | `bg-primary` | Brand buttons |
| `bg-indigo-50` | `bg-primary-light` | Light brand tint |

## Border Colors

| Old (Hardcoded) | New (Semantic) | Context |
|-----------------|----------------|---------|
| `border-gray-200`, `border-slate-200` | `border-border` | Standard borders |
| `border-gray-300`, `border-slate-300` | `border-border-soft` | Emphasized borders |
| `border-gray-100`, `border-slate-100` | `border-border` | Light borders |
| `border-blue-500`, `border-blue-600` | `border-primary` | Active/focused borders |
| `border-blue-200` | `border-primary-border` | Light primary borders |

## Ring/Focus Colors

| Old (Hardcoded) | New (Semantic) | Context |
|-----------------|----------------|---------|
| `ring-blue-500`, `ring-blue-600` | `ring-ring` | Focus rings |
| `ring-gray-300` | `ring-border` | Subtle focus rings |
| `focus:ring-blue-500` | `focus:ring-ring` | Focus states |

## Hover States

| Old (Hardcoded) | New (Semantic) | Context |
|-----------------|----------------|---------|
| `hover:bg-gray-50`, `hover:bg-slate-50` | `hover:bg-surface-hover` | Row/item hover |
| `hover:bg-gray-100` | `hover:bg-muted` | Stronger hover |
| `hover:text-gray-900` | `hover:text-foreground` | Hover text |
| `hover:bg-blue-700` | `hover:bg-primary-hover` | Button hover |

## DO NOT CHANGE — Intentional Semantic Colors

These are **status/intent colors** that should remain hardcoded OR be mapped to status tokens:

| Hardcoded Class | Correct Semantic | Why |
|-----------------|-----------------|-----|
| `text-red-600`, `bg-red-50` | `text-danger` / `bg-danger-bg` | Error/destructive states |
| `text-green-600`, `bg-green-50` | `text-success` / `bg-success-bg` | Success states |
| `text-yellow-600`, `bg-yellow-50` | `text-warning` / `bg-warning-bg` | Warning states |
| `text-blue-600`, `bg-blue-50` (status context) | `text-info` / `bg-info-bg` | Info states |
| `bg-red-500` (dot) | `bg-destructive` | Notification dots |
| `bg-green-500` (dot) | `bg-success` | Online status dots |
| `bg-yellow-500` (dot) | `bg-warning` | Reconnecting dots |
| `bg-orange-500` (border) | Keep — stale check-call indicator | Dispatch board specific |
| `bg-amber-50`, `text-amber-900` | `bg-warning-bg text-warning` | KPI warning state |
| `bg-lime-50`, `text-lime-900` | `bg-success-bg text-success` | KPI success state |

## Context-Sensitive Rules

### Dark Mode Pairs
When you see conditional dark mode like `bg-white dark:bg-gray-800`:
- Replace with `bg-card` (auto-handles dark mode via CSS custom properties)

When you see `text-gray-900 dark:text-gray-100`:
- Replace with `text-foreground` (auto-handles dark mode)

### Loading Skeletons
- `bg-gray-200 animate-pulse` → `bg-muted animate-pulse` (keep animate-pulse)

### Disabled States
- `text-gray-400 cursor-not-allowed` → `text-muted-foreground cursor-not-allowed`
- `bg-gray-100 opacity-50` → `bg-muted opacity-50`

---

## Quick Regex Patterns for Find-Replace

```bash
# Text grays → semantic (careful: review each match)
text-gray-[3-4]\d{2} → text-text-muted
text-gray-[5-6]\d{2} → text-text-secondary
text-gray-[7-9]\d{2} → text-foreground
text-slate-[3-4]\d{2} → text-text-muted
text-slate-[5-6]\d{2} → text-text-secondary
text-slate-[7-9]\d{2} → text-foreground

# Background grays → semantic
bg-gray-50 → bg-muted
bg-gray-100 → bg-muted
bg-gray-200 → bg-secondary
bg-white → bg-card (in cards) or bg-background (page-level)
bg-slate-50 → bg-muted
bg-slate-100 → bg-muted

# Border grays → semantic
border-gray-200 → border-border
border-gray-300 → border-border-soft
border-slate-200 → border-border
border-slate-300 → border-border-soft

# Blues → primary (for non-status usage)
bg-blue-600 → bg-primary
bg-blue-700 → bg-primary-hover
text-blue-600 → text-primary
hover:bg-blue-700 → hover:bg-primary-hover
```

---

## Process for Each File

1. Open the file
2. Search for hardcoded color classes (use patterns above)
3. For each match, determine context:
   - **Structural/layout color?** → Replace with semantic token
   - **Status/intent color?** → Replace with status/intent token OR leave if it's in the dispatch board
   - **Dark mode pair?** → Replace with single semantic class
4. Build verify after each file: `npx next build`
5. Visual spot-check if dev server is running

---

*Last updated: 2026-02-17*

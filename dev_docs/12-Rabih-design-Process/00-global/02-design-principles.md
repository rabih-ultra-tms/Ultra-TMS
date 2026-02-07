# Ultra TMS - Design Principles & Style Guide

> Modern SaaS aesthetic inspired by Linear.app, Vercel, and modern logistics platforms like Rose Rocket.

---

## 1. Design Philosophy

- **Modern SaaS with logistics density:** Clean and minimal like Linear, but able to handle data-dense views when needed (like McLeod PowerBroker). Not every screen needs whitespace - dispatch boards and load lists need density.
- **"Information at a glance" principle:** A dispatcher should never need more than 2 clicks to find critical load information.
- **Progressive disclosure:** Show the essential, hide the rest behind tabs/expandable sections/drawers.
- **Consistency over creativity:** Same patterns everywhere. A list page always looks the same. A detail page always has the same structure.

---

## 2. Color System

### Primary Palette

| Token         | Value              | Usage                          |
| ------------- | ------------------ | ------------------------------ |
| **Primary**   | Blue-600 `#2563EB` | Actions, links, focus states   |
| **Secondary** | Slate palette      | Backgrounds, borders, text     |
| **Accent**    | Indigo-500 `#6366F1` | Active states, selection     |

### Background Hierarchy

| Surface          | Light Mode            | Dark Mode              |
| ---------------- | --------------------- | ---------------------- |
| Page background  | White `#FFFFFF`       | Slate-950 `#020617`    |
| Card background  | White `#FFFFFF`       | Slate-900              |
| Sidebar          | Slate-900 `#0F172A`  | Slate-900 `#0F172A` (always dark) |
| Header           | White + bottom border | Slate-900              |

### Semantic Colors

Refer to `status-color-system.md` for all status-based colors (load statuses, alert levels, entity states, etc.).

### Dark Mode

Full support via CSS variables (already set up with Tailwind). See [Section 10](#10-dark-mode) for detailed dark mode rules.

---

## 3. Typography

### Font Stack

- **Primary:** Inter
- **System fallback:** -apple-system, BlinkMacSystemFont, Segoe UI
- **Monospace (IDs, codes):** JetBrains Mono or system monospace

### Type Scale

| Role            | Size               | Tailwind         | Weight          |
| --------------- | ------------------ | ---------------- | --------------- |
| Page title      | 24px / 1.5rem      | `text-2xl`       | `font-semibold` |
| Section title   | 18px / 1.125rem    | `text-lg`        | `font-semibold` |
| Card title      | 16px / 1rem        | `text-base`      | `font-medium`   |
| Body (base)     | 14px / 0.875rem    | `text-sm`        | `font-normal`   |
| Small / caption | 12px / 0.75rem     | `text-xs`        | `font-normal`   |

> **Note:** 14px is the base size. Logistics apps need smaller text to fit more information on screen.

### Text Colors

| Role        | Light Mode  | Dark Mode   |
| ----------- | ----------- | ----------- |
| Primary     | Slate-900   | Slate-100   |
| Secondary   | Slate-500   | Slate-400   |
| Placeholder | Slate-400   | Slate-500   |

---

## 4. Spacing System

### Base Grid: 4px

| Token | Value |
| ----- | ----- |
| 1     | 4px   |
| 2     | 8px   |
| 3     | 12px  |
| 4     | 16px  |
| 5     | 20px  |
| 6     | 24px  |
| 8     | 32px  |
| 10    | 40px  |
| 12    | 48px  |
| 16    | 64px  |

### Common Spacing Patterns

| Context                   | Value                              |
| ------------------------- | ---------------------------------- |
| Page padding (desktop)    | 24px                               |
| Page padding (mobile)     | 16px                               |
| Card padding (large)      | 24px                               |
| Card padding (compact)    | 16px                               |
| Card padding (list items) | 12px                               |
| Gap between cards (related) | 16px                             |
| Gap between sections      | 24px                               |
| Table row height (comfortable) | 44px                          |
| Table row height (compact)     | 36px                          |
| Form field spacing        | 16px between fields                |
| Form group spacing        | 24px between groups                |

---

## 5. Layout Patterns

### List Page Pattern

```
+--------------------------------------------------+
| PageHeader                                        |
|   Title + Description + [Action Buttons]          |
+--------------------------------------------------+
| Stats Cards Row (4 KPI cards, optional)           |
+--------------------------------------------------+
| Filter Bar                                        |
|   [Search] [Status Chips] [More Filters v]        |
+--------------------------------------------------+
| Data Table                                        |
|   Header row (sticky)                             |
|   Row 1                                           |
|   Row 2                                           |
|   ...                                             |
+--------------------------------------------------+
| Pagination                                        |
+--------------------------------------------------+
| Bulk Action Bar (appears on row selection)        |
+--------------------------------------------------+
```

### Detail Page Pattern

```
+--------------------------------------------------+
| Breadcrumb Navigation                             |
+--------------------------------------------------+
| Header Section                                    |
|   Entity Name   [Status Badge]   [Actions v]      |
+--------------------------------------------------+
| Info Cards Row (key metrics)                      |
+--------------------------------------------------+
| Tabbed Content Area                               |
|   [Overview] [Details] [History] [Documents] [Notes]
|   +-----------------------------------------+    |
|   | Tab Content                              |    |
|   +-----------------------------------------+    |
+--------------------------------------------------+
| Right Sidebar (optional)                          |
|   Quick info / related entities                   |
+--------------------------------------------------+
```

### Form Page Pattern

```
+--------------------------------------------------+
| Breadcrumb                                        |
+--------------------------------------------------+
| Page Title                                        |
+--------------------------------------------------+
| Form Section 1 (card or separator grouping)       |
|   Field 1                                         |
|   Field 2                                         |
+--------------------------------------------------+
| Form Section 2                                    |
|   Field 3                                         |
|   Field 4                                         |
+--------------------------------------------------+
| Sticky Footer                                     |
|   [Cancel]                          [Save]        |
+--------------------------------------------------+
```

### Dashboard Pattern

```
+--------------------------------------------------+
| Page Title              [Date Range Selector]     |
+--------------------------------------------------+
| KPI Cards Row (4-6 cards)                         |
+--------------------------------------------------+
| Charts Row (2-3 charts)                           |
+--------------------------------------------------+
| Recent Activity / Alerts Section                  |
+--------------------------------------------------+
```

### Board Pattern (Kanban / Dispatch)

```
+--------------------------------------------------+
| Toolbar                                           |
|   [Filters] [View Toggles] [Search]              |
+--------------------------------------------------+
| Horizontal Scrollable Lanes                       |
| +--------+ +--------+ +--------+ +--------+      |
| | Lane 1 | | Lane 2 | | Lane 3 | | Lane 4 |     |
| | Header | | Header | | Header | | Header |      |
| | (cnt)  | | (cnt)  | | (cnt)  | | (cnt)  |      |
| |--------| |--------| |--------| |--------|      |
| | Card   | | Card   | | Card   | | Card   |      |
| | Card   | | Card   | |        | | Card   |      |
| | Card   | |        | |        | |        |      |
| +--------+ +--------+ +--------+ +--------+      |
+--------------------------------------------------+
```

- Cards are draggable within and between lanes
- Lane headers display item counts

---

## 6. Component Styling Rules

### Buttons

| Variant     | Style                                          |
| ----------- | ---------------------------------------------- |
| Primary     | Blue-600 filled, white text                    |
| Secondary   | Outlined, slate border, dark text              |
| Destructive | Red-600 filled, white text                     |
| Ghost       | No border, no background, hover background     |

- Border radius: `rounded-md` (6px) -- not fully rounded
- Height: 36px default, 32px compact

### Cards

- Border radius: `rounded-lg` (8px)
- Border: Subtle, `slate-200` (light) / `slate-700` (dark)
- Shadow: None by default; hover shadow on interactive cards
- Padding: See spacing system above

### Inputs

- Border radius: `rounded-md` (6px)
- Height: 36px
- Border: `slate-300` default
- Focus: Ring `blue-500`, 2px

### Tables

- Alternating row backgrounds (optional)
- Hover highlight on rows
- Sticky header row
- Row height: 44px comfortable, 36px compact

### Badges / Status Pills

- Border radius: `rounded-full` (pill shape)
- Font size: `text-xs` (12px)
- Colors per status system (see `status-color-system.md`)

### Modals

- Centered on screen
- Border radius: `rounded-xl` (12px)
- Backdrop: Semi-transparent with blur
- Max width: 480px (small), 640px (medium), 800px (large)

### Drawers / Sheets

- Slide in from right side
- Max width: 480px
- Full height of viewport
- Backdrop overlay

### Tabs

- Style: Underline (not boxed)
- Active tab: Bold text, blue underline
- Inactive: Normal weight, no underline

---

## 7. Icons

### Library

**Lucide React** -- consistent, clean, well-maintained.

### Sizing

| Context              | Size |
| -------------------- | ---- |
| In buttons / badges  | 16px |
| In navigation        | 20px |
| Standalone           | 24px |

### Color

- Inherit from parent text color by default
- Use semantic color for status indicators (green for success, red for error, etc.)

---

## 8. Motion & Animation

| Element            | Duration | Easing          | Details                        |
| ------------------ | -------- | --------------- | ------------------------------ |
| Hover / focus      | 150ms    | ease-in-out     | Color, background, border      |
| Expand / collapse  | 200ms    | ease-in-out     | Accordions, dropdowns          |
| Page transitions   | None     | --              | Instant navigation             |
| Skeleton loading   | --       | pulse           | Matches content shape          |
| Toast              | 200ms    | slide-in        | From top-right, auto-dismiss 5s |
| Modals             | 150ms    | fade + scale    | Scale from 95% to 100%        |
| Drag and drop      | 100ms    | snap            | Ghost card at 50% opacity     |

---

## 9. Responsive Breakpoints

| Breakpoint | Range           | Tailwind |
| ---------- | --------------- | -------- |
| Mobile     | < 640px         | `sm`     |
| Tablet     | 640 - 1024px    | `md`     |
| Desktop    | 1024 - 1440px   | `lg`     |
| Wide       | > 1440px        | `xl`, `2xl` |

### Sidebar Behavior

| Breakpoint | Behavior                     |
| ---------- | ---------------------------- |
| Desktop    | Fixed, always visible        |
| Tablet     | Overlay, toggle to show/hide |
| Mobile     | Hidden, hamburger to open    |

### Table Behavior

- Mobile: Horizontal scroll, hide non-essential columns
- Tablet+: Full table layout

---

## 10. Dark Mode

- **Full support required** for all screens.
- **Sidebar is always dark** -- it serves as a consistent visual anchor across both modes.
- **Use CSS variables** for all color values (already set up with Tailwind `dark:` variants).
- **Charts and maps** need dark mode variants (dark backgrounds, lighter gridlines, adjusted color palettes).
- **Status colors remain the same** in dark mode -- they are already designed as semantic colors with sufficient contrast in both modes.

---

## 11. Accessibility Requirements

### Compliance Target

**WCAG 2.1 AA** minimum.

### Color Contrast

- Normal text: **4.5:1** ratio minimum
- Large text (18px+ or 14px bold): **3:1** ratio minimum

### Keyboard Navigation

- All interactive elements must be keyboard-navigable
- Tab order must be logical and sequential
- Focus indicators: Visible and consistent -- **2px blue ring**

### Screen Readers

- All icons must have `aria-label` or be marked `aria-hidden` with adjacent text
- Status badges need `aria-label` describing the status
- Data tables need proper `<th>` scope attributes

### Additional

- **Skip navigation** links at top of page
- **Reduced motion** support: Respect `@media (prefers-reduced-motion: reduce)` -- disable all non-essential animations

---

## 12. Design Tokens (for Stitch Prompts)

When writing Stitch prompts for AI-assisted development, always reference these tokens to maintain visual consistency:

```
- "Modern SaaS style similar to Linear.app"
- "Dark slate sidebar (#0F172A), white content area"
- "Blue-600 primary buttons, slate-200 borders"
- "Inter font, 14px base text, 24px page titles"
- "Subtle rounded corners (8px cards, 6px buttons)"
- "Minimal shadows, clean borders"
- "Status badges as colored pills"
```

### Example Stitch Prompt Fragment

> Build a [component] using our design system: Modern SaaS style similar to Linear.app. Use Inter font at 14px base, Blue-600 (#2563EB) for primary actions, Slate-900 sidebar, white content area with Slate-200 borders. Cards use 8px rounded corners with subtle borders, no shadows. Status badges are pill-shaped with semantic colors. Support dark mode via Tailwind dark: variants.

---

*This document serves as the single source of truth for all visual design decisions in Ultra TMS. All new components, pages, and features must adhere to these principles.*

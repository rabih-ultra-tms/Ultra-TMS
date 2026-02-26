# R4 Design Playground — Complete Specification

## What This Is
An interactive design playground (`dispatch_r4_playground.html`) with **21 live toggles** so the user can mix-and-match visual settings in real time to find the perfect combination. NOT another static variant.

---

## User's Locked Picks (from 19-item feedback round)

These values are set as defaults and no longer need toggling:

| Setting | Locked Value | Data Attribute |
|---------|-------------|---------------|
| Sidebar Width | Standard (64px) | `data-sidebar-w="standard"` |
| Row Hover | Accent Bar | `data-hover="accent-bar"` |
| Load # Style | Bold Dark | `data-load-style="bold"` |
| Sidebar Color | Cool Gray | `data-sidebar-color="cool-gray"` |
| Page Background | Off-White | `data-canvas="off-white"` |
| Border Intensity | Standard | `data-border-int="standard"` |
| Column Lines | Clear | `data-cols="clear"` |
| Zebra Striping | Off | `data-zebra="off"` |
| Table Radius | Sharp | `data-table-radius="sharp"` |

---

## Active Toggles (21 total)

### Section: CORE
| # | Toggle | Options | Data Attribute |
|---|--------|---------|---------------|
| 1 | **Accent Color** | Indigo, Rich Blue, Teal, Deep Navy | `data-accent` |
| 2 | **Header Style** | Sidebar Gray, Light Gray, White, Slate, Dark, Accent | `data-header` |
| 3 | **Font Family** | DM Sans, Inter, Outfit, Manrope | `data-font` |
| 4 | **View Mode** | Flat List, Grouped by Status | `data-view` |
| 5 | **Dark Mode** | Light / Dark | `data-theme` |

### Section: COLORS & SURFACES
| # | Toggle | Options | Data Attribute |
|---|--------|---------|---------------|
| 6 | **Sidebar Color** | Light Gray, Warm, Cool, White, Off-White | `data-sidebar-color` |
| 7 | **Page Background** | White, Off-White, Warm Beige, Cool Slate, Blue Gray | `data-canvas` |
| 8 | **Table Surface** | White, Light Gray, Cream, Match Page | `data-table-surface` |
| 9 | **Border Intensity** | Ghost, Standard, Strong | `data-border-int` |

### Section: TABLE
| # | Toggle | Options | Data Attribute |
|---|--------|---------|---------------|
| 10 | **Column Lines** | Subtle, Clear, Full Grid | `data-cols` |
| 11 | **Row Density** | Compact (36px), Default (42px), Spacious (48px) | `data-density` |
| 12 | **Zebra Striping** | On / Off | `data-zebra` |
| 13 | **Table Header** | White, Gray, Accent Tint, Accent Line, Dark, Bordered, Floating | `data-th-style` |
| 14 | **Table Radius** | Sharp, Subtle (6px), Rounded (14px) | `data-table-radius` |
| 15 | **Group Headers** | Accent Bar, Filled, Bold | `data-gh` |

### Section: COMPONENTS
| # | Toggle | Options | Data Attribute |
|---|--------|---------|---------------|
| 16 | **Status Badge** | Tinted Pill, Dot+Text, Solid, Outline, Square, Square Solid, Minimal, Underline | `data-badge` |
| 17 | **Load # Style** | Accent Link, Bold Dark, Monospace | `data-load-style` |
| 18 | **Row Hover** | Background, Accent Bar, Lift Shadow | `data-hover` |
| 19 | **Row Tinting** | Off, Subtle (4% status color), Left Border, Wash (8%), Bottom Border | `data-row-tint` |

### Section: LAYOUT
| # | Toggle | Options | Data Attribute |
|---|--------|---------|---------------|
| 20 | **Sidebar Width** | Narrow (52), Standard (64), Wide (200) | `data-sidebar-w` |
| 21 | **Stats Bar** | Minimal, Badge Chips, Hidden | `data-stats` |

### Removed Toggles (from R4 v1)
- ~~Drawer Tabs~~ — now uses V5 Refined underline tabs (no switching)
- ~~Filter Bar Style~~ — filters merged into toolbar (single line)

---

## Structural Changes (from 19-item feedback)

### Toolbar + Filters merged
**Before:** Separate toolbar (New Load, density, group) + filter bar + stats bar
**After:** Single line: `[+ New Load] | [status] [date] [customer] [carrier] [equipment] [reset] ... [Group]`
- Density buttons removed from toolbar (still available in settings panel)
- Filters always visible inline

### Duplicate notification removed
Header had notification icon AND sidebar had one. Header icon removed.

### Drawer replaced with V5 Refined design
- Underline tabs with notification badges (amber dot for unassigned carrier, red dot for missing docs)
- Quick Actions bar (Call, Email, Message, Edit, Track)
- Route Card with dots + connector line + miles/drive time/RPM
- Info cells as bordered cards
- Timeline with animated pulse dot for current step
- Margin box with color-coded background
- Document progress bar with percentage

### Stats bar redesigned
- **Minimal:** 24px, reduced opacity, simple text
- **Badge Chips:** Colored status chips with borders
- **Hidden:** Display none

### Fonts updated
- Kept: DM Sans, Inter
- Replaced IBM Plex Sans → **Outfit**
- Replaced Plus Jakarta Sans → **Manrope**

### Header darker options added
- **Slate:** #334155 with light text
- **Dark:** #1F2937 with light text
- **Accent:** Uses accent color with white text

### Badge styles expanded (4 → 8)
- Original: Tinted Pill, Dot+Text, Solid, Outline
- Added: Square, Square Solid, Minimal, Underline

### Table header styles expanded (4 → 7)
- Original: White, Gray, Accent Tint, Accent Line
- Added: Dark (dark bg, white text), Bordered (thick borders), Floating (shadow)

### Row Tinting (brand new toggle)
- Off, Subtle (4% opacity bg), Left Border (3px status-colored), Wash (8% opacity), Bottom Border

---

## Previous Feedback History

### R3 Feedback (what was wrong)
1. Font feels weak — Inter is too neutral for 8-hour daily use
2. Can't differentiate sections — status groups blend together
3. Drawer and tabs look cheap — all aspects need premium rethink
4. At-risk red background too alarming — just use left border
5. Filters missing — filter bar was absent, essential for UX
6. Load # should be first column — was after status in R3
7. Default should be flat list sorted by load # — not grouped by status
8. Status filter should be dropdown — not inline pills

### Previous Rounds Summary

#### Round 1 (6 variants, all rejected or partially liked)
- A1 Warmer Tones: REJECTED
- A2 Cool Steel: Dark sidebar LIKED, wanted dark header too
- A3 Deepened Grid: Direction liked, needed stronger grid + status colors
- B1-B3: ALL REJECTED — "just small edits and colors, not new designs"

#### Round 2 (6 variants, ALL rejected)
- A1-A3 Dark Chrome variants: "dark sidebar + header looks ugly"
- B1 Full Dark Mode: Not professional
- B2 Card Rows: Not wowed, poor visual hierarchy
- B3 Enterprise Pro: Not professional enough
- User feedback: "Honestly they were all disappointing"

#### Round 3 Premium (1 variant, feedback received)
- Built from scratch using `frontend-design` skill
- Indigo accent, medium gray sidebar, Inter font
- User gave detailed feedback → led to R4

#### Round 4 Playground (interactive, 2 feedback rounds)
- v1: 23 toggles, interactive settings panel
- v2: Reduced to 21 toggles, locked picks set, V5 drawer, merged toolbar

---

## File Locations
- **R4 Playground**: `superdesign/design_iterations/dispatch_r4_playground.html`
- **V5 Refined (drawer reference)**: `superdesign/design_iterations/dispatch_v5_final.html`
- **R3 Premium**: `superdesign/design_iterations/dispatch_r3_premium.html`
- **Gallery**: `superdesign/gallery.html`
- **This spec**: `superdesign/r4_design_spec.md`
- **Design memory**: `memory/design-system.md`

---

## After User Picks a Combination
Once the user finds their preferred toggle combination:
1. Record the exact settings (accent, font, header, columns, density, etc.)
2. Generate 2-3 refinement variants with that combination locked in
3. After final approval: update `globals.css` brand tokens + update 31 TMS components
4. Verify all 26 Storybook stories render correctly

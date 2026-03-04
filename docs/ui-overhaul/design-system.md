# Ultra TMS Design System — "Command Center" Direction

**Approved:** 2026-02-17
**Direction:** A — Command Center (Samsara/project44 inspired)
**Constraint:** Dispatch board design preserved as-is

---

## Design Principles

1. **Operational Intensity** — Every screen should feel like a mission control interface. Dense, purposeful, zero wasted space.
2. **Cool Precision** — Cool blue-gray palette. No warm beige. Crisp borders, not soft ones.
3. **Information Hierarchy via Density** — Important data is bold/colored. Secondary data fades. No decorative elements.
4. **Consistent Status Language** — The 6 status colors from the dispatch board carry through to every page.
5. **Dark Chrome, Light Canvas** — Dark navy sidebar frames light content area. Content uses subtle gray background with white cards.

---

## What Changes (Rabih V1 → Command Center)

| Aspect | Rabih V1 (Old) | Command Center (New) | Why |
|--------|----------------|---------------------|-----|
| **Brand hue** | 222 (sapphire) | 250 (electric indigo) | More energy, closer to dispatch board's blue |
| **Brand chroma** | 0.18 | 0.22 | Richer, more saturated primary |
| **Content BG** | Near-white warm | Cool gray `0.965 / 260°` | Gives depth, cards pop against it |
| **Borders** | Warm beige (hue 35) | Cool slate (hue 260) | Matches cool palette, more professional |
| **Shadows** | Single layer | Double layer (diffused + crisp) | Subtle depth, more premium |
| **Sidebar** | `bg-background` (white) in actual code | Dark navy (use existing tokens!) | Matches dispatch board's dark UI elements |
| **Card elevation** | Flat with border | Subtle shadow + border | More depth separation |
| **Table headers** | No distinct bg | Subtle cool gray | Scanability |
| **Radius** | 0.375rem (6px) | 0.375rem (6px) | Keep — matches dispatch board |

## What Stays

- Inter font (matches dispatch board)
- Geist Mono for data
- 6 status colors (transit, unassigned, tendered, dispatched, delivered, at-risk)
- 4 intent colors (success, warning, danger, info)
- Status badge patterns
- Chart colors
- Transition speeds
- Dispatch board: ALL components untouched

---

## Complete Token Specification

### Layer 1: Brand Tokens

```css
--brand-hue: 250;           /* Electric indigo (was 222 sapphire) */
--brand-chroma: 0.22;       /* Richer saturation (was 0.18) */
--brand-l-light: 0.48;      /* Slightly brighter (was 0.45) */
--brand-l-dark: 0.65;       /* Slightly brighter (was 0.62) */
```

### Layer 2: Semantic Tokens — Light Mode

#### Core
```css
--background: oklch(0.965 0.005 260);     /* Cool gray canvas (was warm 0.985/264) */
--foreground: oklch(0.18 0.02 260);       /* Darker text (was 0.23/264) */
--card: oklch(1 0 0);                     /* White cards (unchanged) */
--card-foreground: oklch(0.18 0.02 260);  /* Match foreground */
--popover: oklch(1 0 0);                  /* White (unchanged) */
--popover-foreground: oklch(0.18 0.02 260);
```

#### Primary
```css
--primary: oklch(var(--brand-l-light) var(--brand-chroma) var(--brand-hue));
--primary-foreground: oklch(1 0 0);
--primary-hover: oklch(calc(var(--brand-l-light) - 0.05) calc(var(--brand-chroma) + 0.02) var(--brand-hue));
--primary-light: oklch(0.95 0.04 var(--brand-hue));
--primary-border: oklch(0.80 0.12 var(--brand-hue));
```

#### Secondary & Muted
```css
--secondary: oklch(0.955 0.005 260);      /* Cool (was 0.96/264) */
--secondary-foreground: oklch(0.32 0.02 260);
--muted: oklch(0.94 0.005 260);           /* Slightly darker for more contrast */
--muted-foreground: oklch(0.50 0.015 260); /* Slightly darker (was 0.55) */
```

#### Accent & Destructive
```css
--accent: oklch(0.55 0.18 240);           /* Shifted toward indigo (was 220) */
--accent-foreground: oklch(1 0 0);
--destructive: oklch(0.55 0.24 25);       /* Slightly more vivid */
--destructive-foreground: oklch(1 0 0);
```

#### Extended Surfaces
```css
--surface: oklch(1 0 0);                  /* White */
--surface-hover: oklch(0.97 0.004 260);   /* Cool hover */
--surface-selected: oklch(0.94 0.02 var(--brand-hue));
--surface-filter: oklch(0.955 0.004 260);
```

#### Extended Text
```css
--text-primary: oklch(0.18 0.015 260);    /* Darker (was 0.23) */
--text-secondary: oklch(0.45 0.01 260);   /* Slightly darker (was 0.48) */
--text-muted: oklch(0.62 0.008 260);      /* Slightly darker (was 0.68) */
```

#### Borders — THE BIG CHANGE
```css
--border: oklch(0.90 0.008 260);          /* Cool slate (was warm hue 35) */
--border-soft: oklch(0.86 0.01 260);      /* Darker soft border */
--input: oklch(0.90 0.008 260);           /* Match border */
--ring: var(--primary);
```

#### Shadows — UPGRADED
```css
--shadow-sm: 0 1px 2px oklch(0 0 0 / 4%), 0 1px 3px oklch(0 0 0 / 6%);
--shadow-md: 0 2px 4px oklch(0 0 0 / 4%), 0 4px 8px -1px oklch(0 0 0 / 8%);
--shadow-lg: 0 4px 8px oklch(0 0 0 / 4%), 0 12px 20px -4px oklch(0 0 0 / 12%);
--shadow-drawer: -2px 0 12px oklch(0 0 0 / 8%), -8px 0 24px oklch(0 0 0 / 12%);
```

#### Sidebar — REFINED
```css
--sidebar: oklch(0.15 0.035 255);         /* Deeper, more saturated navy */
--sidebar-foreground: oklch(0.92 0.005 260); /* Slightly off-white (softer) */
--sidebar-primary: var(--primary);
--sidebar-primary-foreground: oklch(1 0 0);
--sidebar-accent: oklch(0.22 0.04 255);   /* Brighter accent zone */
--sidebar-accent-foreground: oklch(0.95 0.005 260);
--sidebar-border: oklch(0.22 0.03 255);   /* Visible but subtle */
--sidebar-ring: var(--primary);
```

### Layer 2: Semantic Tokens — Dark Mode

```css
--background: oklch(0.13 0.012 260);
--foreground: oklch(0.96 0.005 260);
--card: oklch(0.17 0.015 260);
--card-foreground: oklch(0.96 0.005 260);
--popover: oklch(0.15 0.015 260);
--popover-foreground: oklch(0.96 0.005 260);

--primary: oklch(var(--brand-l-dark) var(--brand-chroma) var(--brand-hue));
--primary-foreground: oklch(0.13 0.01 260);
--primary-hover: oklch(calc(var(--brand-l-dark) - 0.05) calc(var(--brand-chroma) + 0.02) var(--brand-hue));
--primary-light: oklch(0.22 0.07 var(--brand-hue));
--primary-border: oklch(0.33 0.12 var(--brand-hue));

--secondary: oklch(0.22 0.015 260);
--secondary-foreground: oklch(0.96 0.005 260);
--muted: oklch(0.22 0.015 260);
--muted-foreground: oklch(0.60 0.012 260);

--accent: oklch(0.62 0.16 240);
--accent-foreground: oklch(0.96 0.005 260);
--destructive: oklch(0.62 0.24 25);
--destructive-foreground: oklch(1 0 0);

--surface: oklch(0.17 0.015 260);
--surface-hover: oklch(0.21 0.018 260);
--surface-selected: oklch(0.24 0.035 var(--brand-hue));
--surface-filter: oklch(0.14 0.01 260);

--text-primary: oklch(0.94 0.005 260);
--text-secondary: oklch(0.65 0.01 260);
--text-muted: oklch(0.48 0.008 260);

--border: oklch(1 0 0 / 10%);
--border-soft: oklch(1 0 0 / 14%);
--input: oklch(1 0 0 / 10%);
--ring: var(--primary);

--shadow-sm: 0 1px 2px oklch(0 0 0 / 20%), 0 1px 3px oklch(0 0 0 / 30%);
--shadow-md: 0 2px 4px oklch(0 0 0 / 25%), 0 4px 8px -1px oklch(0 0 0 / 35%);
--shadow-lg: 0 4px 8px oklch(0 0 0 / 25%), 0 12px 20px -4px oklch(0 0 0 / 45%);
--shadow-drawer: -2px 0 12px oklch(0 0 0 / 20%), -8px 0 24px oklch(0 0 0 / 30%);

--sidebar: oklch(0.11 0.015 255);
--sidebar-foreground: oklch(0.92 0.005 260);
--sidebar-primary: var(--primary);
--sidebar-primary-foreground: oklch(0.96 0.005 260);
--sidebar-accent: oklch(0.20 0.02 255);
--sidebar-accent-foreground: oklch(0.92 0.005 260);
--sidebar-border: oklch(1 0 0 / 8%);
--sidebar-ring: var(--primary);
```

### Status & Intent Colors
**No changes.** The 6 status colors and 4 intent colors remain identical in both light and dark mode. They were already well-designed and match the dispatch board.

### Chart Colors
**No changes.** Chart colors remain as-is.

### Transitions
**No changes.** Keep 150ms/200ms/300ms speeds.

---

## Typography Scale

| Role | Classes | Size | Weight |
|------|---------|------|--------|
| Page title | `text-xl font-semibold` | 20px | 600 |
| Section title | `text-base font-semibold` | 16px | 600 |
| Card title | `text-sm font-medium` | 14px | 500 |
| Body | `text-sm` | 14px | 400 |
| Caption/Label | `text-xs text-text-secondary` | 12px | 400 |
| Data/Numbers | `text-sm font-mono tabular-nums` | 14px | 400 |
| KPI Value | `text-2xl font-bold tabular-nums` | 24px | 700 |
| KPI Label | `text-xs font-medium text-text-muted` | 12px | 500 |

---

## Component Patterns

### Cards
```
bg-card border border-border rounded-md shadow-sm
hover: shadow-md (on interactive cards only)
```

### Tables
```
Header: bg-muted/50 text-text-secondary text-xs font-medium uppercase tracking-wider
Row: border-b border-border hover:bg-surface-hover
Numbers: font-mono tabular-nums text-right
IDs: font-mono text-primary (clickable)
```

### Page Layout
```
Content area: bg-background (cool gray)
Card sections: bg-card border rounded-md shadow-sm p-6
```

### Sidebar
```
bg-sidebar text-sidebar-foreground
Active item: bg-sidebar-accent text-sidebar-accent-foreground with left-2 primary border
Hover: bg-sidebar-accent/50
Group labels: text-xs uppercase tracking-wider text-sidebar-foreground/50
```

---

*This spec is the single source of truth for the Command Center design direction.*

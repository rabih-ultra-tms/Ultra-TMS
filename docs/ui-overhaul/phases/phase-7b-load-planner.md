# Phase 7B: Load Planner Migration (PROTECTED)

**Priority:** MEDIUM — High violation count (523) but PROTECTED component. Migrate carefully.
**Constraint:** ZERO functionality changes. Only color class → semantic token swaps.
**Test:** After EVERY file, run build AND visually verify the load planner page works.

## Pre-work
1. Read `docs/ui-overhaul/token-mapping.md`
2. Start dev server and navigate to `/load-planner/[id]/edit` to have visual reference
3. Take a screenshot BEFORE starting (for comparison)

---

## Checklist (sorted by violation count, descending)

- [ ] `app/(dashboard)/load-planner/[id]/edit/page.tsx` (145 colors, 5 shadows, 15 HTML)
- [ ] `components/load-planner/RouteIntelligence.tsx` (76 colors, 3 HTML)
- [ ] `components/load-planner/ExtractedItemsList.tsx` (58 colors, 2 HTML)
- [ ] `components/load-planner/TruckSelector.tsx` (45 colors, 11 HTML)
- [ ] `components/load-planner/PlanComparisonPanel.tsx` (42 colors)
- [ ] `components/load-planner/LoadPlanVisualizer.tsx` (36 colors)
- [ ] `components/load-planner/RouteComparisonTab.tsx` (30 colors)
- [ ] `components/load-planner/PermitSummaryCard.tsx` (24 colors)
- [ ] `components/load-planner/TrailerDiagram.tsx` (19 colors, 3 HTML)
- [ ] `components/load-planner/UniversalDropzone.tsx` (6 colors)

---

## Special Rules for Load Planner

1. **Visualization colors** (TrailerDiagram, LoadPlanVisualizer) may use specific hex/rgb values for canvas rendering. If colors are used in `style={{ }}` or passed to SVG/canvas APIs, **LEAVE THEM** — they can't be CSS custom properties.

2. **Status indicators** (red/green/yellow for route status, permit status) should map to intent tokens:
   - `text-red-*` / `bg-red-*` → `text-danger` / `bg-danger-bg`
   - `text-green-*` / `bg-green-*` → `text-success` / `bg-success-bg`
   - `text-yellow-*` / `bg-yellow-*` → `text-warning` / `bg-warning-bg`

3. **Structural grays** are the safe ones to change:
   - `text-gray-500` → `text-text-secondary`
   - `bg-gray-50` → `bg-muted`
   - `border-gray-200` → `border-border`

4. After EACH file: build verify + visually check load planner page

---

## Build Verify
```bash
cd apps/web && npx next build
```

## Commit
```
style: migrate load planner components to semantic tokens (no functional changes)
```

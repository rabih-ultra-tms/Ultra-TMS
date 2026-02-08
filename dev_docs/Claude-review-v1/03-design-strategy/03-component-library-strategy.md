# Component Library Strategy

> Which of the 38 "complete" components actually need redesign, which 56 missing components to build, and in what order.

---

## 1. Honest Assessment of "Complete" Components

The design system audit marks 38 components as "Complete." The user has explicitly said they are not happy with the design of what has been built. Here is a component-by-component assessment of which actually meet quality standards.

### Quality Criteria for "Truly Complete"

A component is only truly complete when it meets ALL of these:

| Criterion | Description |
|-----------|-------------|
| **Visually matches spec** | Colors, spacing, typography match `02-design-principles.md` |
| **All variants work** | Every variant and size renders correctly |
| **Interactive states** | Hover, focus, active, disabled all styled |
| **Dark mode** | Works in both light and dark themes |
| **Keyboard accessible** | Tab navigable, focus ring visible |
| **Responsive** | Renders correctly at all breakpoints |
| **Used correctly in pages** | Pages actually import and use it properly |

### Audit of the 38 "Complete" Components

#### Foundation (5 marked complete)

| # | Component | Actually Complete? | Issue | Action |
|---|-----------|-------------------|-------|--------|
| 1 | Button | NEEDS POLISH | Default height h-10 (40px) is too tall; spec says 36px. No `xs` size. | Adjust default to h-9, add `xs` size variant |
| 2 | Badge | NEEDS REBUILD | Missing `success`, `warning`, `info` variants. Pages bypass variants with className. | Add 3 variants, create StatusBadge wrapper |
| 3 | Avatar | OK | Standard shadcn, works correctly | None |
| 4 | Skeleton | OK | Standard shadcn, works correctly | None |
| 5 | ProgressBar | OK | Standard shadcn, works correctly | None |

#### Forms (9 marked complete)

| # | Component | Actually Complete? | Issue | Action |
|---|-----------|-------------------|-------|--------|
| 6 | Input | NEEDS POLISH | Height not standardized at 36px, no icon-left variant built in | Add consistent height, document icon pattern |
| 7 | Textarea | OK | Standard shadcn | None |
| 8 | Select | OK | Standard shadcn, SearchableSelect adds search | None |
| 9 | Combobox | OK | SearchableSelect works well | None |
| 10 | Checkbox | OK | Standard shadcn | None |
| 11 | Switch | OK | Standard shadcn | None |
| 12 | FileUpload | OK | UniversalDropzone is functional | None |
| 13 | PhoneInput | OK | Functional in CRM module | None |
| 14 | FormField | OK | Uses react-hook-form integration | None |

#### Layout (6 marked complete)

| # | Component | Actually Complete? | Issue | Action |
|---|-----------|-------------------|-------|--------|
| 15 | Divider | OK | Separator works | None |
| 16 | Card | NEEDS POLISH | No hover shadow variant for interactive cards. Missing `compact` padding variant. | Add `interactive` and `compact` variants |
| 17 | Tabs | NEEDS POLISH | Currently boxed style; spec says underline style with blue underline. | Update default styling to underline variant |
| 18 | Sidebar | NEEDS POLISH | Functional but navigation items do not use the status/active styling from spec (blue-600 left border) consistently | Verify active state styling matches spec |
| 19 | Header | NEEDS POLISH | PageHeader component exists but pages do not use it. Missing breadcrumb integration. | Integrate breadcrumbs, enforce usage |
| 20 | PageLayout | OK | DashboardShell provides consistent layout | None |

#### Navigation (4 marked complete)

| # | Component | Actually Complete? | Issue | Action |
|---|-----------|-------------------|-------|--------|
| 21 | Navbar | OK | Combined with sidebar, functional | None |
| 22 | Pagination | NEEDS POLISH | Pages build their own pagination inline instead of using the shadcn Pagination component. Inconsistent styling. | Create standardized Pagination wrapper, replace ad-hoc pagination in all pages |
| 23 | Menu | OK | DropdownMenu works | None |
| 24 | DropdownMenu | OK | Standard shadcn, used in action menus | None |

#### Data Display (4 marked complete)

| # | Component | Actually Complete? | Issue | Action |
|---|-----------|-------------------|-------|--------|
| 25 | Table | NEEDS REBUILD | Missing sticky header, missing row height control, headers are not uppercase/xs/muted per spec, no sorting indicators | Enhance Table component with sticky header, standard header styling, sort indicators |
| 26 | Timeline | OK | Activity timeline works in CRM | None |
| 27 | Calendar | OK | Standard shadcn calendar | None |
| 28 | StatusIndicator | NEEDS REBUILD | Each page creates its own status badge map. No centralized StatusBadge component exists. | Build StatusBadge, migrate all pages |
| 29 | Map | OK | RouteMap is functional | None |

#### Feedback (9 marked complete)

| # | Component | Actually Complete? | Issue | Action |
|---|-----------|-------------------|-------|--------|
| 30 | Alert | OK | Standard shadcn | None |
| 31 | Toast | OK | Sonner integration works | None |
| 32 | Modal/Dialog | OK | Standard shadcn dialog | None |
| 33 | Drawer/Sheet | OK | Standard shadcn sheet | None |
| 34 | AlertDialog | OK | Standard shadcn | None |
| 35 | ConfirmDialog | NEEDS ENFORCEMENT | Component exists and works but is NOT USED. Pages use browser `confirm()` instead. | Enforce usage via ESLint rule |
| 36 | Popover | OK | Standard shadcn | None |
| 37 | Tooltip | OK | Standard shadcn | None |
| 38 | EmptyState | NEEDS ENFORCEMENT | Component exists but pages create ad-hoc empty states instead of importing it. | Enforce usage, update to match spec (illustration + CTA) |

#### Overlays (1 marked complete)

| # | Component | Actually Complete? | Issue | Action |
|---|-----------|-------------------|-------|--------|
| 39 | Sheet | OK | Standard shadcn | None |

### Summary

| Verdict | Count | Components |
|---------|-------|------------|
| Actually OK (no changes needed) | 22 | Avatar, Skeleton, ProgressBar, Textarea, Select, Combobox, Checkbox, Switch, FileUpload, PhoneInput, FormField, Divider, PageLayout, Navbar, Menu, DropdownMenu, Timeline, Calendar, Map, Alert, Toast, Modal, Dialog, AlertDialog, Sheet, Popover, Tooltip |
| Needs Polish (minor fixes) | 8 | Button, Input, Card, Tabs, Sidebar, Header, Pagination, Drawer |
| Needs Rebuild (significant work) | 3 | Badge, Table, StatusIndicator |
| Needs Enforcement (code exists, not used) | 2 | ConfirmDialog, EmptyState |

**Honest completion rate: 22/38 = 58% truly complete**

---

## 2. Component Quality Checklist

Every component (new or rebuilt) must pass this checklist before it can be marked "complete."

### Must-Have (all required for completion)

```
[ ] Renders all variants correctly (visual inspection)
[ ] Typed props with TypeScript (no `any`, no implicit types)
[ ] Default variant specified
[ ] Focus ring visible on keyboard navigation
[ ] aria attributes for accessibility (aria-label on icon-only, role where needed)
[ ] Dark mode renders correctly (test with .dark class)
[ ] Mobile responsive (test at 375px and 1024px)
[ ] Forwarded ref (for composition with Radix UI)
[ ] Uses design tokens (colors from CSS variables, not hardcoded)
[ ] Exported from barrel file (components/ui/index.ts or components/shared/index.ts)
```

### Should-Have (expected for shared components)

```
[ ] Storybook story with all variants displayed
[ ] Unit test for variant rendering
[ ] JSDocs on component and props
[ ] Usage example in comments or docs
[ ] Animation/transition uses design system durations (150ms hover, 200ms expand)
```

### Nice-to-Have (for complex components)

```
[ ] Visual regression test via Chromatic or Percy
[ ] Performance test (renders under 16ms for 60fps)
[ ] Error boundary wrapper
```

---

## 3. Component Rebuild Priority

### Immediate Fixes (Before Any New Feature Work)

These should be done in a single "design remediation" sprint:

| Priority | Component | Effort | Impact |
|----------|-----------|--------|--------|
| 1 | Badge (add variants) | 2 hours | Unblocks StatusBadge |
| 2 | StatusBadge (new shared component) | 4 hours | Replaces 8+ inline color maps |
| 3 | Table header styling | 2 hours | Every table page improves |
| 4 | Button height fix (h-10 to h-9) | 1 hour | Matches spec across all pages |
| 5 | Card interactive variant | 1 hour | Stats cards and clickable cards |
| 6 | Pagination standardization | 4 hours | Every list page improves |
| 7 | PageHeader enforcement | 2 hours | All pages get breadcrumbs |
| 8 | ConfirmDialog enforcement | 2 hours | Replaces browser confirm() |

**Total: ~2-3 days of focused work.**

### Pre-Wave-2 Builds (Before TMS Core Development)

These components are needed before any Wave 2 screen can be built properly.

| Priority | Component | Effort | Why |
|----------|-----------|--------|-----|
| 1 | KPICard | 1-2 days | Every dashboard and list page needs stat cards with icons/trends |
| 2 | DataGrid (enhanced Table) | 5-7 days | TMS Core screens need sortable, resizable columns + virtual scrolling |
| 3 | DatePicker | 2-3 days | Every form with dates (loads, orders, quotes) |
| 4 | DateRangePicker | 2-3 days | Every dashboard date filter, report date range |
| 5 | FilterBar | 2-3 days | Standardize the filter pattern across all list pages |
| 6 | Stepper | 2-3 days | Multi-step forms (order entry, load creation) |
| 7 | MultiSelect | 2-3 days | Equipment type filters, lane selection |

---

## 4. The 27 P1 Components for TMS Core Wave 2 -- Build Order

These are the P1 (must-have) components from the design system audit. The build order is organized by dependency chain -- build foundations first, then composites.

### Tier 1: Foundation Components (Build First -- No Dependencies)

| # | Component | Type | Days | Notes |
|---|-----------|------|------|-------|
| 1 | RadioGroup | shadcn install | 0.5 | `npx shadcn add radio-group` |
| 2 | Accordion | shadcn install | 0.5 | `npx shadcn add accordion` |
| 3 | Breadcrumb | shadcn install | 0.5 | `npx shadcn add breadcrumb` |
| 4 | CurrencyInput | Custom | 2 | Masked input with formatting, needs input.tsx |
| 5 | LoadStatusBadge | Custom | 0.5 | Domain badge using StatusBadge + LOAD_STATUS |
| 6 | Stepper | Custom | 3 | Multi-step navigation (no dependency on other custom components) |

### Tier 2: Data Components (Build After Tier 1)

| # | Component | Type | Days | Notes |
|---|-----------|------|------|-------|
| 7 | DatePicker | Composite | 2 | calendar.tsx + popover.tsx + input |
| 8 | DateRangePicker | Composite | 3 | Extends DatePicker with range mode |
| 9 | MultiSelect | Composite | 3 | command.tsx + popover.tsx + badge.tsx for tags |
| 10 | KPICard | Custom | 2 | card.tsx + icon + trend display |
| 11 | Statistic | Custom | 1 | Simpler version of KPICard for inline use |
| 12 | Chart | shadcn install + config | 3 | `npx shadcn add chart` + recharts setup |

### Tier 3: Logistics Domain Components (Build After Tier 2)

| # | Component | Type | Days | Notes |
|---|-----------|------|------|-------|
| 13 | StopList | Custom | 3 | Ordered list with drag-reorder |
| 14 | LoadCard | Custom | 2 | card.tsx + LoadStatusBadge + route display |
| 15 | LoadTimeline | Custom | 3 | Extends activity-timeline pattern |
| 16 | DocumentChecklist | Custom | 2 | Checkbox list with upload triggers |
| 17 | CheckCallLog | Custom | 3 | Timeline + form for new entries |
| 18 | CustomerSelector | Composite | 2 | Extends contact-select with customer preview |
| 19 | EquipmentSelector | Composite | 2 | command.tsx + equipment type icons |
| 20 | LaneSearch | Custom | 3 | Origin-destination search with autocomplete |

### Tier 4: Complex Views (Build After Tier 3)

| # | Component | Type | Days | Notes |
|---|-----------|------|------|-------|
| 21 | DataGrid | Custom | 7 | Virtual scrolling, column resize, sort, filter |
| 22 | LoadMap | Custom | 5 | Extends route-map with multi-stop display |
| 23 | RouteDisplay | Custom | 3 | Route visualization with stops overlay |
| 24 | RateCalculator | Custom | 5 | Form with dynamic accessorial calculation |
| 25 | QuoteBuilder | Custom | 5 | Full quoting workflow (extends RateCalculator) |
| 26 | LoadBoard | Custom | 7 | DataGrid + filters + LoadCard |
| 27 | DispatchBoard | Custom | 7 | DataGrid + Map + assignment UI |

### Build Timeline

```
Week 1-2:   Tier 1 (6 components) + design remediation sprint
Week 3-4:   Tier 2 (6 components)
Week 5-7:   Tier 3 (8 components)
Week 8-12:  Tier 4 (7 components)
```

**Total: ~12 weeks with 1-2 developers**

---

## 5. Build vs Install Decisions

### Install from shadcn Registry (Just Works)

These are standard shadcn/ui components that need zero customization:

```bash
cd apps/web
npx shadcn@latest add radio-group accordion breadcrumb chart toggle toggle-group drawer input-otp resizable
```

| Component | Why Install | Customization Needed |
|-----------|------------|---------------------|
| RadioGroup | Standard form control | None |
| Accordion | Content collapse | None |
| Breadcrumb | Navigation trail | Integrate with PageHeader |
| Chart | Data visualization | Wrap with design tokens for colors |
| Toggle/ToggleGroup | View switchers | None |
| Drawer | Mobile-first panel | None |
| InputOTP | MFA improvement | None |
| Resizable | Panel layouts | None |

### Build Custom (Shadcn Does Not Have)

These do not exist in the shadcn registry and must be built from scratch:

| Component | Why Custom | Build Approach |
|-----------|-----------|---------------|
| KPICard | Domain-specific stat display | Card + icon + trend logic |
| CurrencyInput | Formatted currency entry | Input + Intl.NumberFormat |
| DatePicker | Composite from primitives | Calendar + Popover + Input |
| DateRangePicker | Two-calendar range | Calendar + Popover + date-fns |
| MultiSelect | Multi-value combobox | Command + Popover + Badge array |
| Stepper | Multi-step wizard | Custom with progress indicators |
| DataGrid | Virtual scrolling table | TanStack Table + Virtual |
| FilterBar | Standardized filter strip | Composition of Select, Input, Badge |
| StatusBadge | Centralized status display | Badge + status-colors.ts |

### Evaluate Third-Party Libraries

For some complex components, evaluate third-party alternatives before building custom:

| Component | Library Option | Pros | Cons |
|-----------|---------------|------|------|
| DataGrid | TanStack Table v8 | Headless, React 19 compatible, virtual scrolling | Requires significant styling work |
| Chart | Recharts (via shadcn chart) | Already in shadcn ecosystem | Limited customization |
| Chart | Tremor | Beautiful defaults, TMS-ready | Additional dependency |
| Map | react-map-gl (Mapbox) | Industry standard | API key cost |
| DnD | @dnd-kit | Accessible, performant | Learning curve |
| PDF Viewer | react-pdf | Well-maintained | Bundle size |

**Recommendation:** Use TanStack Table for DataGrid, Recharts via shadcn/chart for charts, and @dnd-kit for drag-and-drop in the Kanban dispatch board.

---

## 6. Component File Structure Standard

Every component follows this co-located structure:

```
components/
  shared/
    status-badge/
      status-badge.tsx          # Component implementation
      status-badge.test.tsx     # Unit tests
      status-badge.stories.tsx  # Storybook story
      index.ts                  # Barrel export
    kpi-card/
      kpi-card.tsx
      kpi-card.test.tsx
      kpi-card.stories.tsx
      types.ts                  # Complex types if needed
      index.ts
```

### Naming Conventions

| Convention | Rule | Example |
|-----------|------|---------|
| File name | kebab-case | `kpi-card.tsx` |
| Component name | PascalCase | `KPICard` |
| Props interface | ComponentNameProps | `KPICardProps` |
| Variants | cva with named variants | `kpiCardVariants` |
| Test file | `.test.tsx` suffix | `kpi-card.test.tsx` |
| Story file | `.stories.tsx` suffix | `kpi-card.stories.tsx` |
| Barrel export | `index.ts` | `export { KPICard } from './kpi-card'` |

### Component Template

```tsx
// components/shared/example/example.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const exampleVariants = cva(
  'base-classes-here', // Invariant classes
  {
    variants: {
      variant: {
        default: 'default-variant-classes',
        // ... other variants
      },
      size: {
        default: 'default-size-classes',
        sm: 'small-size-classes',
        lg: 'large-size-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ExampleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof exampleVariants> {
  // Component-specific props
}

const Example = React.forwardRef<HTMLDivElement, ExampleProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(exampleVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Example.displayName = 'Example';

export { Example, exampleVariants };
```

---

## 7. Storybook Recommendation

### Why Storybook

Without Storybook, the only way to verify a component's appearance is to navigate to a page that uses it. This means:
- Visual bugs are only caught when someone manually checks the page
- Components cannot be developed in isolation
- Dark mode, responsive, and variant testing requires navigating through the app
- New developers cannot browse available components

### Setup Recommendation

```bash
cd apps/web
npx storybook@latest init --builder=vite
```

**Configuration priorities:**

1. Configure for Next.js App Router + Tailwind 4
2. Set up dark mode toggle via `@storybook/addon-themes`
3. Set up viewport addon for responsive testing
4. Configure the `.storybook/preview.tsx` to import `globals.css`

### What Gets Stories First

| Priority | Components | Why |
|----------|-----------|-----|
| 1 | Badge, StatusBadge | Most visual impact, most variants |
| 2 | Button, Input, Card | Foundation components used everywhere |
| 3 | KPICard, LoadCard | New domain components need visual verification |
| 4 | Table, DataGrid | Complex components with many states |
| 5 | All shared/ components | ConfirmDialog, ErrorState, EmptyState, etc. |

### Story Template

```tsx
// components/shared/status-badge/status-badge.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './status-badge';
import { CARRIER_STATUS, LOAD_STATUS, ORDER_STATUS } from '@/lib/constants/status-colors';

const meta: Meta<typeof StatusBadge> = {
  title: 'Shared/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const CarrierStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {Object.keys(CARRIER_STATUS).map((status) => (
        <StatusBadge key={status} entity={CARRIER_STATUS} status={status} />
      ))}
    </div>
  ),
};

export const LoadStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {Object.keys(LOAD_STATUS).map((status) => (
        <StatusBadge key={status} entity={LOAD_STATUS} status={status} />
      ))}
    </div>
  ),
};
```

---

## Summary

### Action Items in Order

1. **Day 1-3:** Design remediation sprint (fix Badge, Button, Table, enforce ConfirmDialog/EmptyState)
2. **Day 4-7:** Create status-colors.ts, StatusBadge, KPICard, migrate all 42 pages
3. **Week 2:** Install shadcn additions (radio-group, accordion, breadcrumb, chart)
4. **Week 2:** Set up Storybook, create stories for all shared components
5. **Week 3-4:** Build Tier 2 components (DatePicker, MultiSelect, Chart)
6. **Week 5-7:** Build Tier 3 logistics components (StopList, LoadCard, LoadTimeline)
7. **Week 8-12:** Build Tier 4 complex views (DataGrid, LoadBoard, DispatchBoard)

### What This Achieves

- 38 "complete" components become 35 actually complete
- 27 P1 components built in dependency order
- Every component has consistent quality (checklist enforced)
- Visual testing via Storybook prevents regression
- New developers can browse and use components confidently

---

*Next document: [04-ai-design-workflow.md](./04-ai-design-workflow.md) -- How to get better design output from AI assistants.*

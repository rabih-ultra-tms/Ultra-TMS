# Quality Gates: 4-Level System

> A component is not done when it works. A component is done when it works, looks right, handles all states, and fits into the system.

---

## Overview

Quality gates prevent unfinished work from being merged. Each gate has specific, measurable criteria -- not subjective opinions. A gate either passes or fails.

```
Gate 1: Component    "Does this individual component meet spec?"
    |
Gate 2: Page         "Do all components on this page work together?"
    |
Gate 3: Module       "Do all pages in this module work together?"
    |
Gate 4: Cross-Module "Is the entire app visually and functionally consistent?"
```

---

## Gate 1: Component Level

**When:** Before a component is marked as "complete" in the design system audit.

### Automated Checks

| Check | Tool | Pass Criteria | Command |
|-------|------|---------------|---------|
| TypeScript compiles | `pnpm check-types` | Zero errors | `pnpm --filter web check-types` |
| No `any` types | TypeScript strict | Zero `any` types in component file | Built into tsconfig strict |
| ESLint passes | ESLint | Zero errors (warnings acceptable) | `pnpm --filter web lint` |
| No hardcoded colors | Custom ESLint rule | Zero color violations | Included in lint |
| Unit tests pass | Jest | All tests green | `pnpm --filter web test -- --testPathPattern=component-name` |

### Visual Checks (Manual)

```
VARIANT RENDERING
[ ] Default variant renders correctly
[ ] All additional variants render correctly (inspect each)
[ ] Default size matches spec (e.g., h-9 for buttons = 36px)
[ ] All size variants render correctly

INTERACTIVE STATES
[ ] Hover state: visible change (color, background, or shadow)
[ ] Focus state: 2px blue focus ring visible via keyboard Tab
[ ] Active/pressed state: visual feedback on click
[ ] Disabled state: opacity-50, pointer-events-none, cursor correct
[ ] Selected state (if applicable): clear visual distinction

DARK MODE
[ ] Light mode: component renders with correct colors
[ ] Dark mode: component renders with correct colors (add .dark class to test)
[ ] No contrast issues in either mode (text readable against background)

RESPONSIVE
[ ] At 375px (mobile): component does not overflow
[ ] At 1024px (tablet): component adapts appropriately
[ ] At 1440px (desktop): component uses available space well

ACCESSIBILITY
[ ] Keyboard navigable (Tab reaches the component)
[ ] Focus ring visible on keyboard navigation
[ ] aria-label present on icon-only elements
[ ] Screen reader announces component correctly (test with VoiceOver or NVDA)
[ ] Color is not the sole indicator of meaning (icon or text accompanies color)
```

### Storybook Verification (When Available)

```
[ ] Story exists with all variants displayed
[ ] Story includes dark mode variant
[ ] Story includes interactive example (controls panel)
[ ] Story renders without console errors
```

### Gate 1 Pass Criteria

ALL automated checks pass AND ALL visual checks pass. A single failing visual check blocks the component.

---

## Gate 2: Page Level

**When:** Before a page is marked as "design-complete" and ready for integration.

### Automated Checks

| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Page builds without errors | `pnpm build` | Zero build errors |
| TypeScript strict mode passes | `pnpm check-types` | Zero type errors on page |
| Lighthouse Performance | Lighthouse CI | Score >= 75 |
| Lighthouse Accessibility | Lighthouse CI | Score >= 90 |
| Lighthouse Best Practices | Lighthouse CI | Score >= 90 |
| No console errors | Browser DevTools | Zero errors on page load |
| No console warnings | Browser DevTools | Zero React warnings |
| axe accessibility scan | @axe-core/react | Zero critical/serious violations |

### Data State Checks (Manual)

Every page has four data states. ALL must be implemented:

```
LOADING STATE
[ ] Shows skeleton/shimmer that matches the content shape
[ ] Skeleton matches the number of columns/rows expected
[ ] Does NOT show "Loading..." text
[ ] Skeleton animates (pulse or shimmer)

ERROR STATE
[ ] Shows <ErrorState> component (not inline red text)
[ ] Error message is user-friendly (not raw error.message)
[ ] "Retry" button is present and works
[ ] Page does not crash on API failure (error boundary works)

EMPTY STATE
[ ] Shows <EmptyState> component with icon, title, description
[ ] Primary CTA button present ("Add your first carrier")
[ ] CTA button is functional (opens create dialog or navigates)
[ ] Empty state is visually distinct from loading state

SUCCESS STATE (populated data)
[ ] Data renders correctly in table/cards
[ ] All columns/fields display data
[ ] Pagination works (previous, next, page numbers)
[ ] Sort works (if sortable columns exist)
[ ] Filter works (data updates on filter change)
```

### Component Integration Checks

```
PAGE STRUCTURE
[ ] Uses <PageHeader> component (not raw h1)
[ ] Breadcrumbs present and accurate
[ ] Page title matches the navigation label
[ ] Action buttons in header are functional

STATUS DISPLAYS
[ ] All status badges use <StatusBadge> component
[ ] Status colors match the canonical status-color-system
[ ] No hardcoded color classes for status display

FORMS (if applicable)
[ ] Form validation works (try submitting empty/invalid)
[ ] Validation messages appear below fields (not in alert boxes)
[ ] Submit button shows loading state during submission
[ ] Cancel button works (navigates back or closes dialog)
[ ] Success shows toast notification
[ ] Error shows toast notification with helpful message

DESTRUCTIVE ACTIONS
[ ] Delete/remove actions use <ConfirmDialog>
[ ] Confirm dialog has descriptive title and message
[ ] Confirm button shows loading state during operation
[ ] Success shows toast notification
[ ] No browser confirm() dialogs
```

### Responsive Check

```
MOBILE (375px)
[ ] Page is usable (no horizontal overflow)
[ ] Table switches to card view (if applicable)
[ ] Navigation is accessible (hamburger menu)
[ ] Touch targets are at least 44x44px
[ ] Forms are single-column

TABLET (768px)
[ ] Layout adjusts appropriately
[ ] Sidebar collapses to overlay
[ ] Stats cards stack in 2-column grid

DESKTOP (1440px)
[ ] Full layout with sidebar
[ ] Tables show all columns
[ ] Comfortable whitespace
```

### Gate 2 Pass Criteria

ALL automated checks pass AND ALL manual checks pass. The page must work at all three breakpoints and in all four data states.

---

## Gate 3: Module Level

**When:** Before a module (e.g., CRM, TMS Core, Carrier Management) is considered feature-complete for a wave.

### Cross-Page Consistency

```
NAVIGATION
[ ] All module pages are accessible from sidebar
[ ] Sidebar highlights the correct active page
[ ] Breadcrumbs are consistent across all pages in the module
[ ] "Back" buttons/links navigate to the correct parent page
[ ] Detail page -> Edit page -> Back to detail page flow works

SHARED PATTERNS
[ ] All list pages follow the List Page Pattern (same structure)
[ ] All detail pages follow the Detail Page Pattern (same structure)
[ ] All form pages follow the Form Page Pattern (same structure)
[ ] Stats cards show consistent data across related pages

DATA FLOW
[ ] Create entity -> appears in list immediately (optimistic or refetch)
[ ] Edit entity -> changes reflected in list and detail views
[ ] Delete entity -> removed from list immediately
[ ] Status change -> badge updates in list and detail views
[ ] Related entities update (e.g., carrier loads count after load assignment)

API INTEGRATION
[ ] All API calls use the correct hooks (useQuery, useMutation)
[ ] Error handling is consistent across all pages
[ ] Loading states are consistent across all pages
[ ] Pagination uses consistent page sizes
[ ] Search/filter parameters are preserved on navigation
```

### Module-Specific Checks

```
ROLE-BASED ACCESS
[ ] Role-restricted features are hidden for unauthorized users
[ ] Admin-only actions are not visible to regular users
[ ] Route protection guards are in place

REAL-TIME UPDATES (if applicable)
[ ] WebSocket connection established on module entry
[ ] Status changes from other users appear in real-time
[ ] No stale data after extended idle time

PRINT/EXPORT (if applicable)
[ ] Export to CSV/Excel works for all list pages
[ ] Print layout renders correctly (no sidebar, no nav)
[ ] PDF export produces clean, readable output
```

### Gate 3 Pass Criteria

ALL pages in the module pass Gate 2 AND ALL cross-page consistency checks pass. The module works as a coherent unit, not as isolated pages.

---

## Gate 4: Cross-Module Level

**When:** Before a release milestone or when integrating a new module with existing ones.

### Visual Consistency Audit

```
STYLING CONSISTENCY
[ ] Sidebar styling is identical across all modules
[ ] Page headers follow the same pattern in every module
[ ] Stats/KPI cards have consistent sizing and styling
[ ] Tables use the same header styling everywhere
[ ] Badge colors are consistent for the same status across modules
[ ] Forms use the same field styling, label positioning, and spacing
[ ] Buttons follow the same variant usage (primary for main action, outline for secondary)

TYPOGRAPHY CONSISTENCY
[ ] Page titles are all text-2xl font-semibold
[ ] Section titles are all text-lg font-semibold
[ ] Body text is all text-sm
[ ] Captions are all text-xs text-muted-foreground
[ ] No pages use non-standard font sizes

SPACING CONSISTENCY
[ ] All pages use p-6 for page padding
[ ] All sections use space-y-6 for vertical spacing
[ ] All card grids use gap-4
[ ] No pages have custom spacing that breaks the rhythm
```

### Shared Component Usage Audit

```
[ ] StatusBadge is used everywhere (no inline badge colors)
[ ] PageHeader is used on every page (no raw h1 elements)
[ ] ConfirmDialog is used for all destructive actions (no browser confirm)
[ ] DataTableSkeleton is used for all table loading states
[ ] ErrorState is used for all error displays
[ ] EmptyState is used for all empty data views
[ ] Toast is used for all mutation feedback
```

### Performance Baseline

| Metric | Target | Tool |
|--------|--------|------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Time to Interactive | < 3.5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Bundle size (main page) | < 200KB gzipped | `next build` output |
| API response time (p95) | < 500ms | Server metrics |

### Cross-Module Navigation

```
[ ] Sidebar links between modules work correctly
[ ] Entity cross-references work (clicking customer name in a load goes to customer detail)
[ ] Search results span multiple modules (if global search exists)
[ ] Notification links navigate to the correct page in the correct module
[ ] Browser back/forward buttons work correctly across modules
```

### Gate 4 Pass Criteria

ALL modules pass Gate 3 AND the visual consistency audit shows zero discrepancies AND performance baselines are met.

---

## Definition of "Design-Complete" for a Screen

A screen is "design-complete" when:

### Functional Completeness

1. All CRUD operations work (create, read, update, delete)
2. All four data states handled (loading, error, empty, success)
3. All form validations implemented (client-side + server-side error display)
4. All mutations provide user feedback (loading state on button, success toast, error toast)
5. All destructive actions have confirmation dialogs
6. Pagination, sorting, and filtering work correctly

### Visual Completeness

1. Layout matches the screen spec wireframe (Section 3)
2. All components from the component inventory are used (Section 4)
3. All interactive states are implemented (Section 5)
4. Status colors match the status-color-system (Section 6)
5. Typography follows the design scale
6. Spacing follows the 4px grid
7. Responsive layouts work at 375px, 768px, and 1440px
8. Dark mode works (if applicable)

### Quality Completeness

1. TypeScript compiles with zero errors
2. ESLint passes with zero errors
3. Lighthouse accessibility score >= 90
4. No console errors or warnings
5. axe accessibility scan passes (zero critical/serious)
6. Performance: page loads in under 3 seconds on 4G connection

### Documentation Completeness

1. Component has JSDoc comments on props
2. Complex logic has inline comments explaining "why"
3. The screen spec file is marked as "implemented" with the implementation date
4. Work log entry exists for the implementation session

---

## Implementing Quality Gates in CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates

on:
  pull_request:
    paths:
      - 'apps/web/**'

jobs:
  gate-1-automated:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter web check-types
      - run: pnpm --filter web lint
      - run: pnpm --filter web test --passWithNoTests
      - run: pnpm --filter web build

  gate-2-lighthouse:
    runs-on: ubuntu-latest
    needs: gate-1-automated
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter web build
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v12
        with:
          configPath: '.lighthouserc.json'
          temporaryPublicStorage: true
```

### Lighthouse CI Configuration

```json
// .lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.75 }],
        "categories:accessibility": ["error", { "minScore": 0.90 }],
        "categories:best-practices": ["warn", { "minScore": 0.90 }]
      }
    },
    "collect": {
      "startServerCommand": "pnpm --filter web start",
      "url": [
        "http://localhost:3000/dashboard",
        "http://localhost:3000/carriers",
        "http://localhost:3000/customers"
      ]
    }
  }
}
```

---

## Quality Gate Quick Reference Card

Print this and keep it visible during development.

```
GATE 1: COMPONENT
  [A] TypeScript compiles
  [A] ESLint passes
  [A] Tests pass
  [M] All variants render
  [M] Hover/focus/disabled states
  [M] Dark mode works
  [M] Responsive (375px, 1440px)
  [M] Keyboard accessible

GATE 2: PAGE
  [A] Builds without errors
  [A] Lighthouse accessibility >= 90
  [M] Loading state: skeleton
  [M] Error state: ErrorState component
  [M] Empty state: EmptyState component
  [M] Success state: data renders
  [M] Forms validate and show errors
  [M] Mutations have toast feedback
  [M] No browser confirm()
  [M] Responsive at 375/768/1440

GATE 3: MODULE
  [M] All pages pass Gate 2
  [M] Navigation between pages works
  [M] CRUD flow works end-to-end
  [M] Data updates reflect across pages
  [M] Consistent patterns across pages

GATE 4: CROSS-MODULE
  [M] Visual audit: consistent styling
  [A] Performance baselines met
  [M] Cross-module navigation works
  [M] Shared components used everywhere

[A] = Automated  [M] = Manual
```

---

*Next document: [06-visual-consistency-playbook.md](./06-visual-consistency-playbook.md) -- The practical copy-paste reference for keeping everything visually consistent.*

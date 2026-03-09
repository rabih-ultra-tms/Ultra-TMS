# Screen Quality Scoring Rubric

> Defines the 1-10 scoring system used in hub file Section 3 (Screens)
> **Created:** 2026-03-09 | **Sources:** quality-gates.md, per-service tribunal scores, PROTECT list calibration

## Score Definitions

### 0: Empty Stub

- Page file exists but renders nothing or a placeholder string
- No API connection, no interactivity, no UI
- Example: Profile page (0/10 per QS-005 -- currently empty stub)

### 1-2: Minimal Stub

- Page renders static text or a basic skeleton
- No API connection, no form submission
- May import layout but no data fetching
- Example: A page.tsx that renders `<h1>Coming Soon</h1>`

### 3-4: Basic Render

- Hardcoded or mock data displayed
- No form submission, no CRUD operations
- Missing loading/error/empty states
- Hardcoded colors (not using design tokens from globals.css)
- May have broken or stub onClick handlers (`() => {}`)
- Example: A list page showing hardcoded array, no API call

### 5-6: Functional

- API connected, real data displayed via React Query hooks
- Basic CRUD operations work (at least create + read)
- At least 1 of 3 states handled (loading OR error OR empty)
- Some interactivity (buttons click, forms submit)
- May have envelope unwrapping issues (`response.data` vs `response.data.data`)
- May have `as any` type assertions
- Example: Load History Detail (5/10), Carrier Create dialog (5/10)

### 7-8: Production-Quality

- All CRUD operations work with real API data
- All 3 states handled (loading skeleton/shimmer, error with retry, empty with CTA)
- Responsive at 375px (mobile), 768px (tablet), 1440px (desktop)
- Design tokens used (no hardcoded hex/rgb colors)
- Proper form validation (React Hook Form + Zod)
- Clean console (no errors, no `console.log`, no warnings)
- Keyboard accessible (Tab reaches all interactive elements, focus ring visible)
- API envelope properly unwrapped (`response.data.data`)
- Pagination handled if endpoint returns pagination object
- Example: Carrier Detail (7/10), TMS Core Orders List (7/10), Accounting pages (7.9/10 avg)

### 9-10: Exceptional

- Everything from 7-8 plus:
- Comprehensive test coverage (unit + integration + optionally E2E)
- Optimistic updates or real-time data via WebSocket/polling
- Animation/transitions for state changes
- Pixel-perfect match to design spec in `dev_docs/12-Rabih-design-Process/`
- Performance optimized (virtualization for long lists, memoization for expensive computations)
- Complex state management done correctly (multi-step forms, drag-drop, conditional rendering)
- Example: Load Planner (9/10 -- 1,825 LOC, AI cargo extraction, Google Maps, full quote lifecycle)
- Example: Edit Order Form (9/10 -- Prisma Decimal conversion, complex form mapping, proper error/loading/not-found states)
- Example: Rate Confirmation (9/10 -- 232 LOC, options panel, PDF preview, blob cleanup on unmount)

## Scoring Dimensions (Weighted)

| Dimension | Weight | Criteria | Scoring Guide |
| --- | --- | --- | --- |
| Functionality | 30% | Do all buttons/forms/actions complete their intended operation? | 10: All work. 7: Most work, 1-2 stub. 4: Half work. 1: None work. |
| Data Integration | 20% | Real API data? Proper envelope unwrapping (`response.data.data`)? Pagination? Cache invalidation? | 10: Full integration + optimistic updates. 7: API works, envelope correct. 4: API connected but envelope wrong. 1: Hardcoded data. |
| UI Quality | 20% | Design tokens? Responsive? No hardcoded colors/sizes? Consistent spacing? Matches design spec? | 10: Pixel-perfect. 7: Design tokens used, responsive. 4: Some hardcoded colors. 1: Unstyled. |
| State Handling | 15% | Loading skeleton? Error boundary with retry? Empty state with icon + CTA? | 10: All 3 states + transitions. 7: All 3 states. 4: 1-2 states. 1: None. |
| Accessibility | 10% | Keyboard navigation? ARIA labels? Focus management? Color contrast? Screen reader compatible? | 10: Full a11y audit pass. 7: Keyboard works, focus visible. 4: Partial keyboard. 1: Mouse-only. |
| Code Quality | 5% | No `any` types? Proper hooks? No `console.log`? Clean TypeScript? No side effects in render? | 10: Zero warnings, clean types. 7: Minor issues (1-2 `as any`). 4: Multiple `any` types. 1: TypeScript errors. |

## How to Score a Screen

1. Open the page in browser (or take screenshot via Playwright -- `QS-008`)
2. Check each dimension against criteria above
3. Score each dimension 1-10
4. Calculate weighted average: `(Func * 0.30) + (Data * 0.20) + (UI * 0.20) + (State * 0.15) + (A11y * 0.10) + (Code * 0.05)`
5. Round to nearest 0.5

**Quick method (for hub file updates):** If you don't have time for full scoring, use the tier definitions above (0, 1-2, 3-4, 5-6, 7-8, 9-10) and pick the one that best matches.

## Calibration Examples

| Screen | Score | Justification |
| --- | --- | --- |
| Load Planner (`/load-planner/[id]/edit`) | 9/10 | 1,825 LOC, AI cargo extraction, Google Maps integration, full quote lifecycle, complex multi-step form, optimistic updates. PROTECTED. |
| Truck Types (`/truck-types`) | 8/10 | Clean CRUD with inline editing, debounced search, design tokens, responsive. Gold standard for CRUD pages. PROTECTED. |
| Commission pages (`/commissions/*`) | 8.5/10 | 11 pages, model quality, proper state handling, best P0 frontend module per PST-08. 14 FE tests. |
| Dashboard (`/dashboard`) | 8.5/10 | KPIs work (hooks call real APIs), responsive, 6 widgets, role-based scope. No tests. |
| Edit Order Form (`/operations/orders/[id]/edit`) | 9/10 | 180 LOC, Prisma Decimal conversion, complex form mapping, proper error/loading/not-found states. |
| Rate Confirmation (`/operations/loads/[id]/rate-con`) | 9/10 | 232 LOC, options panel, custom message, load summary, Generate/Download/Email actions, PDF preview, blob cleanup. |
| Accounting pages (`/accounting/*`) | 7.9/10 avg | 10 pages functional, proper state handling. Invoice Edit page missing. 4 cross-tenant bugs in payments. |
| TMS Core loads (`/operations/loads`) | 8/10 | 147 LOC, KPI stat cards, filter bar, data table, row-click drawer. |
| Orders list (`/operations/orders`) | 7/10 | 165 LOC, stats, pagination, search, status filter. Delete is no-op toast. Bulk actions UI missing. |
| Carrier Detail (`/carriers/[id]`) | 7/10 | 198 LOC, 8 tabs with conditional rendering. CarrierStatusBadge has hardcoded colors. |
| Carrier Create (dialog on list page) | 5/10 | Inline dialog, no separate route. Basic form, limited validation. |
| Load History Detail (`/load-history/[id]`) | 5/10 | Page exists but needs QS-008 runtime verification. Quality uncertain. |
| Profile (`/settings/profile`) | 0/10 | Empty stub, no functionality at all. QS-005 task. |

## When to Update Scores

- After fixing bugs listed in hub Section 11 (quality goes up)
- After QS-008 runtime verification (may go up or down based on actual render)
- After adding tests (Code Quality dimension improves)
- After design token migration (UI Quality dimension improves)
- After adding loading/error/empty states (State Handling dimension improves)

## Related Documents

- Quality gates: `dev_docs_v3/00-foundations/quality-gates.md` (Gate 2: Page/Screen Quality)
- Bug template: `dev_docs_v3/10-standards/bug-reproduction-template.md`
- Design specs: `dev_docs/12-Rabih-design-Process/` (89 screen specs with full UX/UI details)

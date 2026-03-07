# Quality Gates — Ultra TMS

> **Status:** Active (applies to all current and future development)
> **Last Updated:** 2026-03-07
> **Source:** dev_docs_v2/00-foundations/quality-gates.md + Master Kit depth requirements

---

## Definition of "Done"

A task is DONE only when ALL of the following are true:

1. `pnpm check-types` passes with 0 errors
2. `pnpm lint` passes with 0 warnings
3. Tests exist and pass for the changed code
4. The feature works at runtime (Playwright or manual verification)
5. Loading, error, and empty states are implemented
6. No `console.log` statements in the diff
7. No `any` types in the diff
8. Acceptance criteria in the task file are ALL checked off
9. Service hub file is updated if routes/endpoints/components changed
10. STATUS.md is updated (task marked done, metrics updated)

**Never mark a task "done" if tests fail or acceptance criteria aren't met.**

---

## Gate 1: Component Quality

- [ ] TypeScript compiles (`pnpm check-types`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] No `any` types
- [ ] No hardcoded color classes (use CSS tokens from globals.css)
- [ ] All variants render correctly (default, loading, error, empty, disabled)
- [ ] Hover, focus, disabled states work
- [ ] Keyboard accessible (Tab reaches it, focus ring visible)
- [ ] Props interface documented (not `any`)
- [ ] Component has at least 1 test (render + basic interaction)

**Score threshold:** 5/6 criteria = Good | 3/4 = Needs Work | 0/2 = Stub

---

## Gate 2: Page / Screen Quality

- [ ] Builds without errors (`pnpm build`)
- [ ] **Loading state:** skeleton/shimmer (NOT bare "Loading..." text)
- [ ] **Error state:** ErrorState component with retry button
- [ ] **Empty state:** EmptyState component with icon + CTA
- [ ] **Success state:** data renders correctly with real API data
- [ ] All forms validate and show inline errors (RHF + Zod)
- [ ] All mutations show loading on button + toast on success/error
- [ ] All destructive actions use ConfirmDialog (NOT `window.confirm()`)
- [ ] No `console.log` statements
- [ ] Responsive at 375px (mobile), 768px (tablet), 1440px (desktop)
- [ ] API envelope unwrapped correctly (`response.data.data`, not `response.data`)
- [ ] Pagination handled if endpoint returns pagination object
- [ ] Verified with Playwright (navigate to route, screenshot taken)

---

## Gate 3: Service Module Quality

- [ ] All pages in the module pass Gate 2
- [ ] Navigation works (sidebar highlights correct item)
- [ ] CRUD flow works end-to-end (create → list → detail → edit → delete)
- [ ] Status changes propagate (React Query invalidation)
- [ ] Consistent patterns across all pages in the module
- [ ] All endpoints in service hub file have accurate "Production" status
- [ ] Test coverage exists for at least the happy path of each CRUD operation

---

## Gate 4: Cross-Module / Security Quality

- [ ] Visual consistency audit passes (same design tokens everywhere)
- [ ] Shared components used everywhere (StatusBadge, PageHeader, DataTable, etc.)
- [ ] Cross-module navigation works (clicking entity name goes to detail)
- [ ] Performance: FCP < 1.5s, LCP < 2.5s
- [ ] No hardcoded tenantIds
- [ ] `tenantId` filter on every backend query
- [ ] `deletedAt: null` filter on every query
- [ ] Auth guards on all endpoints except `@Public()` routes
- [ ] No JWT or sensitive data in console.log

---

## Testing Requirements

### Frontend Tests (Jest + Testing Library + MSW)

| Type | Required | Command |
|---|---|---|
| Component render | Yes (all components) | `pnpm --filter web test` |
| User interactions | Yes (buttons, forms) | `pnpm --filter web test` |
| API mocking | Yes (MSW for API calls) | `pnpm --filter web test` |
| Coverage target | 60%+ lines | `pnpm --filter web test:coverage` |

### Backend Tests (Jest + Supertest)

| Type | Required | Command |
|---|---|---|
| Service unit tests | Yes (business logic) | `pnpm --filter api test:unit` |
| Controller integration | Yes (CRUD endpoints) | `pnpm --filter api test:e2e` |
| Coverage target | 50%+ lines | `pnpm --filter api test` |

### E2E Tests (Playwright)

| Type | Required | Command |
|---|---|---|
| Route verification | Yes (all 96 routes) | See QS-008 verification protocol |
| Form submission | For all forms | Playwright fill + submit |
| Auth flow | Yes | Login → dashboard → protected route |

**Current state (2026-03-07):** 72 tests passing (45 carrier tests, 27 scattered). Most services have 0 tests. This is a major gap. See [03-tasks/backlog/_index.md](../03-tasks/backlog/_index.md) for testing expansion tasks.

---

## Quick Checklist Before Every Commit

```bash
pnpm check-types    # Must be 0 errors
pnpm lint           # Must be 0 errors
```

Then verify manually:
- Every button has a real `onClick` handler (not `() => {}`)
- Every link has a real `href` (not `#`)
- No `console.log` in the diff
- No `any` types in the diff
- Loading/error/empty states exist on every page with API calls
- API envelope properly unwrapped

---

## Anti-Patterns (from Sonnet audit — do NOT do these)

| Anti-Pattern | Rule |
|---|---|
| `response.data` without `.data` | ALWAYS `response.data.data` — the envelope wraps everything |
| `onClick={() => {}}` stub buttons | Every button must work or be visually disabled |
| Unstable `useEffect` dependencies | Use `useCallback` for function deps, constants outside component |
| Building frontend without checking backend exists | Grep `apps/api/src/modules/` BEFORE writing frontend |
| Hardcoded hex/rgb colors | ONLY CSS variables from `globals.css` |
| Missing loading/error/empty states | EVERY data-fetching component needs all 4 states |
| Ignoring pagination | If endpoint returns `pagination`, display page controls |
| No tests | Write at least 1 test per component |
| Form not verified | Use Playwright to fill + submit every form |
| TypeScript errors ignored | `pnpm check-types` must pass before claiming done |

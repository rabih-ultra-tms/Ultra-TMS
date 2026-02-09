# Quality Gates (Quick Reference)

> Full version: `dev_docs/Claude-review-v1/03-design-strategy/05-quality-gates.md`

---

## Gate 1: Component

- [ ] TypeScript compiles (`pnpm check-types`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] No `any` types
- [ ] No hardcoded color classes (use design tokens)
- [ ] All variants render correctly
- [ ] Hover, focus, disabled states work
- [ ] Keyboard accessible (Tab reaches it, focus ring visible)

## Gate 2: Page

- [ ] Builds without errors (`pnpm build`)
- [ ] **Loading state**: skeleton/shimmer (NOT bare "Loading..." text)
- [ ] **Error state**: ErrorState component with retry button
- [ ] **Empty state**: EmptyState component with icon + CTA
- [ ] **Success state**: data renders correctly
- [ ] All forms validate and show inline errors
- [ ] All mutations show loading on button + toast on success/error
- [ ] All destructive actions use ConfirmDialog (NOT `window.confirm()`)
- [ ] No `console.log` statements
- [ ] Responsive at 375px, 768px, 1440px

## Gate 3: Module

- [ ] All pages pass Gate 2
- [ ] Navigation between pages works (sidebar highlights correctly)
- [ ] CRUD flow works end-to-end (create → appears in list → edit → delete)
- [ ] Status changes reflect across list and detail views
- [ ] Consistent patterns across all pages in the module

## Gate 4: Cross-Module

- [ ] Visual consistency audit passes (same styling everywhere)
- [ ] Shared components used everywhere (StatusBadge, PageHeader, etc.)
- [ ] Cross-module navigation works (clicking entity name goes to detail)
- [ ] Performance: FCP < 1.5s, LCP < 2.5s

---

## Quick Check Before Every Commit

```
pnpm check-types   # Zero errors
pnpm lint           # Zero errors
```

Then verify manually:
- Every button has a real `onClick` handler
- Every link has a real `href`
- No `console.log` in the diff
- No `any` types in the diff
- Loading/error/empty states exist on every page

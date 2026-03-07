# PageHeader

**File:** `apps/web/components/tms/layout/page-header.tsx`
**LOC:** 69

## Props Interface

```typescript
interface PageHeaderProps {
  /** Page title */
  title?: React.ReactNode;
  /** Center slot (typically a search input) */
  center?: React.ReactNode;
  /** Right-side actions (buttons, notifications, user avatar) */
  actions?: React.ReactNode;
  /** Additional class names */
  className?: string;
}
```

## Behavior

48px fixed-height header bar with 3 horizontal slots:
- **Left (title)**: 14px font, 600 weight, `text-text-primary`, no-wrap
- **Center**: flex-1, max-width 320px, centered with auto margins. If not provided, a flex spacer pushes actions right.
- **Right (actions)**: flex row with 4px gap, no shrink

Background: `bg-surface`, bottom border, smooth color transition.

## Used By

- `apps/web/components/patterns/list-page.tsx` (all list pages)
- `apps/web/components/patterns/form-page.tsx` (all form pages)
- `apps/web/components/tms/dispatch/dispatch-board.tsx`
- `apps/web/components/tms/loads/` pages
- `apps/web/components/tms/orders/order-form.tsx`

## Accessibility

Renders as `<header>` element. Title and actions are semantic children.

## Known Issues

None. Simple, well-scoped component.

## Note

There is also an older `PageHeader` at `apps/web/components/ui/PageHeader.tsx` (42 LOC). The TMS version is the canonical implementation per the v5 design system.

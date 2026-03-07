# Breadcrumbs

**File:** `apps/web/components/ui/breadcrumb.tsx`
**LOC:** 115

## Exported Components

```typescript
Breadcrumb          // <nav> wrapper with aria-label="breadcrumb"
BreadcrumbList      // <ol> with flex layout
BreadcrumbItem      // <li> with inline-flex
BreadcrumbLink      // <a> with hover color transition (supports asChild via Radix Slot)
BreadcrumbPage      // <span> for current page (aria-current="page", aria-disabled)
BreadcrumbSeparator // <li> with ChevronRight icon (customizable via children)
BreadcrumbEllipsis  // <span> with MoreHorizontal icon for collapsed breadcrumbs
```

## Behavior

Standard shadcn/ui breadcrumb component built on Radix Slot for polymorphic rendering. Each part is composable.

### Usage

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/operations">Operations</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/operations/loads">Loads</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>LD-2024-001</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

## Used By

- `apps/web/components/layout/app-header.tsx` (global breadcrumb bar)
- Various detail pages

## Accessibility

- `<nav>` with `aria-label="breadcrumb"`
- Separators: `role="presentation"`, `aria-hidden="true"`
- Current page: `aria-current="page"`, `aria-disabled="true"`

## Known Issues

Minor: `BreadcrumbEllipsis` has a typo in displayName (`"BreadcrumbElipssis"` instead of `"BreadcrumbEllipsis"`).

# DashboardShell

**File:** `apps/web/components/layout/dashboard-shell.tsx`
**LOC:** 33

## Props Interface

```typescript
interface DashboardShellProps {
  children: React.ReactNode;
}
```

## Behavior

Root layout wrapper for all `(dashboard)/` routes. Composes the top-level layout:

1. **SocketProvider** -- Wraps everything in WebSocket context for real-time features
2. **AppSidebar** -- Fixed left sidebar (64px collapsed / 256px expanded)
3. **AppHeader** -- Sticky top navigation bar
4. **Main content** -- Flex-1, padded (`p-4 sm:p-6`)

Content column padding-left transitions based on sidebar collapse state:
- Collapsed: `pl-16` (64px)
- Expanded: `pl-64` (256px)

Reads `sidebarCollapsed` from `useUIStore` (Zustand store).

## Used By

- `apps/web/app/(dashboard)/layout.tsx` -- wraps all dashboard pages

## Dependencies

- `@/lib/stores/ui-store` (Zustand `useUIStore`)
- `@/lib/socket/socket-provider` (SocketProvider)
- `./app-header` (AppHeader, 151 LOC)
- `./app-sidebar` (AppSidebar, 141 LOC)

## Accessibility

Uses semantic `<main>` element for content area. Background: `bg-background`.

## Known Issues

None. Simple composition component.

# Layout Components

**Path:** `apps/web/components/layout/`

## Files

| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| AppHeader | `app-header.tsx` | 151 | Top navigation bar with breadcrumbs, search, notifications, user menu |
| AppHeader (test) | `app-header.test.tsx` | 49 | Unit tests for AppHeader |
| AppSidebar | `app-sidebar.tsx` | 141 | Collapsible sidebar navigation with grouped menu items |
| DashboardShell | `dashboard-shell.tsx` | 33 | Root layout wrapper composing Sidebar + Header + main content area |
| SidebarNav | `sidebar-nav.tsx` | 127 | Navigation items renderer with icons, active states, collapse support |
| SidebarNav (test) | `sidebar-nav.test.tsx` | 60 | Unit tests for SidebarNav |
| UserNav | `user-nav.tsx` | 152 | User dropdown menu with profile, settings, logout actions |
| UserNav (test) | `user-nav.test.tsx` | 81 | Unit tests for UserNav |
| index | `index.ts` | 5 | Barrel exports |

**Total:** 9 files (~5 components + 3 tests + 1 index), ~799 LOC

## Usage Patterns

`DashboardShell` is the root layout for all `(dashboard)/` routes:

```
DashboardShell
  +-- SocketProvider (WebSocket context)
  +-- AppSidebar (fixed left, collapsible 64px/256px)
  |     +-- SidebarNav (grouped navigation links)
  +-- AppHeader (sticky top bar)
  |     +-- UserNav (user dropdown, top-right)
  +-- main (page content)
```

- `DashboardShell` reads `sidebarCollapsed` from `useUIStore` (Zustand) to adjust content padding
- `AppSidebar` renders navigation from `@/lib/config/navigation.ts`
- `AppHeader` includes breadcrumbs, global search, notification bell

## Dependencies

- `@/lib/stores/ui-store` (Zustand store for sidebar state)
- `@/lib/socket/socket-provider` (WebSocket context)
- `@/lib/config/navigation.ts` (navigation menu structure)
- `@/components/ui/` (DropdownMenu, Avatar, Button)
- `next/navigation` (usePathname for active link detection)
- Lucide React icons

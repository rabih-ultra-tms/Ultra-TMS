# AppSidebar

**File:** `apps/web/components/layout/app-sidebar.tsx`
**Lines:** 141
**Exports:** `AppSidebar`

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| className | `string` | No | - | Additional CSS classes |

## Architecture

The AppSidebar is the primary navigation component for the entire dashboard. It renders in two modes:

1. **Desktop (md+):** Fixed `<aside>` on the left, collapsible between 64px and 256px width
2. **Mobile (<md):** Slide-out `<Sheet>` panel triggered by hamburger menu

### State Management

- **`useUIStore` (Zustand):** Reads `sidebarOpen` (mobile sheet), `setSidebarOpen`, `sidebarCollapsed` (desktop width)
- **`useCurrentUser` hook:** Fetches current user to determine role-based navigation filtering

### Role-Based Filtering

1. Extracts user roles from `currentUser.roles[].name` and `currentUser.role.name`
2. Normalizes roles to `UPPER_SNAKE_CASE`
3. Filters navigation items based on `requiredRoles` from navigation config
4. **Super Admin** users only see: Overview, User Management, System groups
5. Super Admin users see no bottom nav items

### Navigation Source

Menu items come from `@/lib/config/navigation.ts` which exports `navigationConfig.mainNav` (grouped sections) and `navigationConfig.bottomNav` (bottom items like settings/help).

## Usage Example

```tsx
// Used in DashboardShell (the root dashboard layout)
import { AppSidebar } from "@/components/layout/app-sidebar";

<AppSidebar className="hidden md:flex" />
```

## Used By

- `components/layout/dashboard-shell.tsx` -- Root layout wrapper for all `(dashboard)/` routes

## Dependencies

- `@/lib/stores/ui-store` (Zustand store)
- `@/lib/hooks/use-auth` (`useCurrentUser`)
- `@/lib/config/navigation` (menu structure)
- `@/components/ui/scroll-area` (scrollable nav area)
- `@/components/ui/sheet` (mobile slide-out)
- `@/components/ui/tooltip` (collapsed mode tooltips)
- `@/components/layout/sidebar-nav` (renders nav items)
- `lucide-react` (Truck icon for logo)

## Implementation Notes

- Logo links to `/dashboard` and shows "Ultra TMS" brand text when expanded
- Brand logo uses `bg-primary text-primary-foreground` rounded square with Truck icon
- Desktop sidebar uses `transition-all duration-300 ease-in-out` for smooth collapse animation
- Mobile sheet closes on navigation item click via `onItemClick` callback
- Border and background use semantic tokens: `border-sidebar-border`, `bg-sidebar`, `text-sidebar-foreground`

## Quality Assessment

**Rating: 8/10**
- TypeScript: Clean typing, proper memoization with `useMemo` and `useCallback`
- Accessibility: Good -- uses TooltipProvider for collapsed state
- Role filtering: Robust normalization handles both array and single role formats
- Performance: All computed values properly memoized
- Minor: Could add `aria-label` to the aside element

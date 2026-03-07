# Sidebar Components

Two sidebar implementations exist in the codebase, serving different design generations.

---

## AppSidebar (v5 TMS Design)

**File:** `apps/web/components/tms/layout/app-sidebar.tsx`
**LOC:** 134

### Props Interface

```typescript
interface SidebarNavItem {
  key: string;
  icon: LucideIcon;
  label: string;           // Used for tooltip and aria-label
  active?: boolean;
  notificationDot?: boolean;
  onClick?: () => void;
}

interface AppSidebarProps {
  logoIcon?: LucideIcon;
  navItems: SidebarNavItem[];
  bottomItems?: SidebarNavItem[];
  userAvatar?: React.ReactNode;
  className?: string;
}
```

### Behavior

64px icon-only sidebar for the v5 dispatch design. Fixed left, full viewport height.

- Logo: 36px sapphire square with icon
- Nav items: 40x40px buttons with centered 20px icons
- Active state: `bg-primary-light`, `text-primary`, 3px left indicator bar
- Notification dot: 8px danger circle with sidebar-colored border
- Bottom section: mt-auto for settings/help, plus user avatar slot

### Accessibility

Each nav button has `title` and `aria-label` from the `label` prop.

---

## AppSidebar (Current App)

**File:** `apps/web/components/layout/app-sidebar.tsx`
**LOC:** 141

### Behavior

Collapsible sidebar (64px collapsed / 256px expanded). Reads navigation config from `@/lib/config/navigation.ts`. Uses `useUIStore` for collapse state. Renders grouped navigation links via `SidebarNav` component (127 LOC).

### Used By

`DashboardShell` renders this sidebar in the current app layout.

## Known Issues

The two sidebars coexist. The v5 sidebar is used for new dispatch screens; the current sidebar is used for all other routes. A future migration will unify them.

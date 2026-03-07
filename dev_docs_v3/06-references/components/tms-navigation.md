# TMS Navigation Components

Components for app navigation, page headers, breadcrumbs, tabs, and panels.

---

## AppSidebar (v5)

**File:** `apps/web/components/tms/layout/app-sidebar.tsx`
**LOC:** 134

### Props

```typescript
interface SidebarNavItem {
  key: string;
  icon: LucideIcon;
  label: string;
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

### Design

64px-wide icon-only sidebar (v5 dispatch design). Fixed left, full height.

- **Logo**: 36px sapphire square, 10px radius, centered at top
- **Nav items**: 40x40px, 8px radius, centered icon (20px)
  - Default: `text-text-muted`, transparent background
  - Hover: `bg-background`, `text-text-secondary`
  - Active: `bg-primary-light`, `text-primary` + 3px left indicator bar
- **Notification dot**: 8px danger circle, positioned top-right
- **Bottom section**: `mt-auto`, same styling + user avatar slot

### Accessibility

Each nav item has `title` and `aria-label` from the `label` prop for tooltip and screen reader support.

**Note:** This is the NEW v5 sidebar. The existing `components/layout/app-sidebar.tsx` (141 LOC, collapsible 64px/256px) remains for the current app layout.

---

## PageHeader

**File:** `apps/web/components/tms/layout/page-header.tsx`
**LOC:** 69

### Props

```typescript
interface PageHeaderProps {
  title?: React.ReactNode;
  center?: React.ReactNode;     // Typically SearchInput
  actions?: React.ReactNode;    // Right-side buttons
  className?: string;
}
```

### Design

48px header bar with three slots:
- **Left**: Title (14px/600, `text-text-primary`)
- **Center**: Flex-1, max-width 320px, centered (typically search input)
- **Right**: Action buttons with 4px gap
- Background: `bg-surface`, `border-b border-border`

### Usage

```tsx
<PageHeader
  title="Dispatch Board"
  center={<SearchInput shortcut="Cmd+K" />}
  actions={
    <>
      <Button size="sm">New Load</Button>
      <DensityToggle value={density} onChange={setDensity} />
    </>
  }
/>
```

---

## SlidePanel

**File:** `apps/web/components/tms/panels/slide-panel.tsx`
**LOC:** 179

### Props

```typescript
interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  badge?: React.ReactNode;
  headerActions?: React.ReactNode;
  resizable?: boolean;          // Default true
  defaultWidth?: number;        // Default 420px
  minWidth?: number;            // Default 380px
  maxWidth?: number;            // Default 560px
  children: React.ReactNode;
  className?: string;
}
```

### Behavior

- Full-height slide-in drawer from right edge
- Backdrop: `bg-black/30`, click to close
- Animation: `translateX(100%) -> 0`, cubic-bezier(0.4, 0, 0.2, 1), 300ms
- **Resizable**: drag handle on left edge, resize between minWidth and maxWidth
- **Escape key**: closes the panel
- Header: title (15px/700) + optional badge + action buttons + close button

### Accessibility

- `role="dialog"`, `aria-modal="true"`
- Close button: `aria-label="Close panel"`
- Escape key handler

---

## PanelTabs

**File:** `apps/web/components/tms/panels/panel-tabs.tsx`
**LOC:** 86

Tab strip designed for use inside SlidePanel. Compact styling matching the panel design.

---

## QuickActions

**File:** `apps/web/components/tms/panels/quick-actions.tsx`
**LOC:** 73

Quick action buttons panel for the slide panel footer (e.g., Call Driver, Send Email, Update Status).

---

## DashboardShell (App Layout)

**File:** `apps/web/components/layout/dashboard-shell.tsx`
**LOC:** 33

### Props

```typescript
interface DashboardShellProps {
  children: React.ReactNode;
}
```

Root layout wrapper for all dashboard routes. Composes:
- `SocketProvider` (WebSocket context)
- `AppSidebar` (collapsible, reads `sidebarCollapsed` from Zustand `useUIStore`)
- `AppHeader` (sticky top bar)
- `main` content area with responsive padding (`p-4 sm:p-6`)

Content area adjusts padding-left based on sidebar state: `pl-16` (collapsed) or `pl-64` (expanded).

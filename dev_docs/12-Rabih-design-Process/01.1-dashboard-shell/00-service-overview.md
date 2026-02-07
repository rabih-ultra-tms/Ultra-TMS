# Dashboard Shell Service Overview

> Service: Dashboard Shell (01.1) | Wave: 1 (Enhancement Focus) | Priority: P0
> Total Screens: 5 | Status: 1 Built, 4 Not Started | Focus: Build remaining + Enhance existing
> Tech Stack: Next.js 16 App Router layout, React 19, Tailwind 4, shadcn/ui, Zustand (UI store), WebSocket (live notifications)

---

## Service Summary

The Dashboard Shell is the outermost UI wrapper for the entire Ultra TMS application. Every authenticated page renders inside this shell, which provides the sidebar navigation, header bar, notification system, and command palette. The shell is responsible for persistent layout, role-based navigation, real-time notification delivery, and global search. It is the first thing every user sees after login and the last thing they see before logout. Getting this shell right is critical because it affects the perceived quality of every other screen in the system.

The Main Dashboard screen (the home/landing page after login) is already built and displays role-specific KPI widgets. The remaining four components -- Sidebar Navigation, Header Bar, Notification Center, and Command Palette -- exist in basic form within the Next.js layout but have not been formally designed or polished to production quality.

**Core Capabilities:**
- Persistent sidebar navigation with role-based menu items, favorites, and unread badges
- Header bar with global search trigger, notification bell, user menu, and breadcrumbs
- Role-adaptive main dashboard with KPI cards, charts, quick actions, and activity feeds
- Real-time notification center with categorization, filtering, and bulk actions
- Command palette (Cmd+K) for universal search, quick navigation, and action execution
- Responsive layout: full sidebar on desktop, icon-only on tablet, hamburger drawer on mobile
- Zustand-powered UI state for sidebar collapse, theme preference, and notification counts

---

## Screen Inventory

| # | Screen Name | Route | Type | Status | Enhancement Priority | Design File |
|---|---|---|---|---|---|---|
| 1 | Main Dashboard | `/(dashboard)/dashboard` | Dashboard | **Built** | **P0** -- Role-specific KPIs, first screen after login | `01-main-dashboard.md` |
| 2 | Sidebar Navigation | `/(dashboard)/_layout` | Portal / Layout | Not Started | **P0** -- Persistent nav, role-based menus, daily touchpoint | `02-sidebar-navigation.md` |
| 3 | Header Bar | `/(dashboard)/_layout` | Portal / Layout | Not Started | **P0** -- Search, notifications, user context, breadcrumbs | `03-header-bar.md` |
| 4 | Notification Center | `/(dashboard)/notifications` | List / Drawer | Not Started | **P1** -- Real-time alerts, filtering, actions | `04-notification-center.md` |
| 5 | Command Palette | `/(dashboard)/_command` | Search / Modal | Not Started | **P1** -- Universal search, quick navigation, power users | `05-command-palette.md` |

---

## Dependencies

### Upstream Dependencies (This service depends on)

| Dependency | Service | Purpose |
|---|---|---|
| Authentication / JWT | Service 01 - Auth & Admin | User identity, role, tenant context for rendering role-based navigation |
| RBAC Permissions | Service 01 - Auth & Admin | Permission checks to show/hide sidebar items, actions, and data |
| Tenant Configuration | Service 01 - Auth & Admin | Tenant branding (logo, colors), feature flags |
| WebSocket Server | Infrastructure | Real-time notification delivery, live badge counts |
| API Gateway | Infrastructure | All KPI data endpoints, notification endpoints, search endpoints |

### Downstream Dependencies (Other services depend on this)

| Dependent | Purpose |
|---|---|
| **Every other service** | All 37+ services render their screens inside the Dashboard Shell layout |
| Service 02 - CRM | Sidebar navigation items, notification badges for lead assignments |
| Service 03 - Sales | Dashboard KPI widgets for sales role, quote expiry notifications |
| Service 04 - TMS Core | Dashboard KPI widgets for dispatcher role, load exception notifications |
| Service 05 - Carrier | Notification badges for compliance alerts, carrier onboarding |
| Service 06 - Accounting | Dashboard KPI widgets for accounting role, payment notifications |
| Service 11 - Communication | Notification center integration, message count badges |
| Service 22 - Search | Command palette delegates to global search service |

---

## Persona Mapping

| Persona | Role(s) | Dashboard Variant | Sidebar Sections | Usage Frequency |
|---|---|---|---|---|
| **Maria Rodriguez** (Dispatcher) | `dispatcher` | Operations KPIs: unassigned loads, in-transit, at-risk, today's deliveries | Operations, Carriers, Communication | All day, 50+ interactions |
| **James Wilson** (Sales Agent) | `sales_agent` | Sales KPIs: pipeline value, quotes pending, conversion rate, monthly revenue | CRM, Sales, Communication | All day, 30+ interactions |
| **Sarah Chen** (Operations Manager) | `ops_manager` | Full operational KPIs + team performance, margin trends | Operations, Carriers, Analytics, Admin | All day, 40+ interactions |
| **Carlos Martinez** (Driver/Carrier) | `carrier` | Carrier portal shell (separate layout) | N/A - uses Carrier Portal shell | Limited web use |
| **Emily Foster** (AR Specialist) | `accounting_clerk` | Accounting KPIs: outstanding AR, overdue invoices, pending payments | Accounting, Communication | All day, 20+ interactions |
| **Mike Thompson** (Customer) | `customer` | Customer portal shell (separate layout) | N/A - uses Customer Portal shell | 3-5x daily |
| System Administrator | `admin` | System health: user count, storage, API usage, error rates | All sections + Admin | 10+ interactions daily |
| Super Admin | `super_admin` | Platform-wide: tenant overview, system metrics, global KPIs | All sections + Platform | As needed |
| Sales Manager | `sales_manager` | Sales KPIs + team performance, pipeline by rep | CRM, Sales, Analytics, Commission | 20+ interactions daily |
| Accounting Manager | `accounting_manager` | Full accounting KPIs + approval queues, cash flow | Accounting, Credit, Commission | 15+ interactions daily |
| Carrier Manager | `carrier_manager` | Carrier KPIs: compliance status, onboarding queue, scorecards | Carriers, Safety, Compliance | 15+ interactions daily |

---

## Wave Status

### Wave 1 -- Current Focus

**Built and operational:**
- [x] Main Dashboard page with basic role detection and KPI card rendering
- [x] Basic sidebar navigation (hardcoded menu items, no role filtering)
- [x] Basic header with user avatar and logout
- [x] Next.js App Router layout wrapping all dashboard routes

**In progress / Not started (design needed):**
- [ ] Role-based sidebar menu filtering (show/hide items per role)
- [ ] Collapsible sidebar with icon-only mode and keyboard toggle
- [ ] Favorites / pinned navigation items
- [ ] Notification bell with unread count badge
- [ ] Notification center drawer with categories and actions
- [ ] Command palette (Cmd+K) with universal search
- [ ] Breadcrumb trail in header
- [ ] User menu dropdown with profile, settings, theme toggle, logout
- [ ] Real-time KPI updates via WebSocket on main dashboard
- [ ] Responsive layout (tablet icon-only, mobile hamburger)

### Future Waves

- **Wave 2:** Dashboard customization (drag-and-drop widget reordering, add/remove widgets)
- **Wave 3:** Saved dashboard layouts per user, shared dashboard templates
- **Wave 4:** AI-powered insights widget ("3 loads at risk today -- assign carriers?")
- **Wave 5:** Embeddable dashboard widgets for external portals

---

## Existing Components

Components already in the codebase that relate to the Dashboard Shell:

| Component | Location | Current State |
|---|---|---|
| `DashboardLayout` | `src/app/(dashboard)/layout.tsx` | Basic layout with sidebar + header + main content |
| `Sidebar` | `src/components/layout/sidebar.tsx` | Static menu list, no collapse, no role filtering |
| `Header` | `src/components/layout/header.tsx` | Basic: logo area + user avatar |
| `UserNav` | `src/components/layout/user-nav.tsx` | Avatar dropdown with profile + logout |
| `KPICard` | `src/components/dashboard/kpi-card.tsx` | Stat card with label, value, trend arrow |
| `DashboardGrid` | `src/components/dashboard/dashboard-grid.tsx` | CSS Grid wrapper for KPI cards |

---

## Design Principles for This Service

1. **Speed is everything.** The shell loads on every page. Layout shift must be zero. Sidebar and header must render from cache/static HTML first, then hydrate with dynamic data (notification counts, user info).

2. **Role-awareness is silent.** Users should never see a "you don't have access" message for a sidebar item. Items they cannot access simply do not appear. The navigation feels custom-built for their role.

3. **Consistency breeds trust.** The sidebar, header, and notification system must look and behave identically across all 362+ screens. Any inconsistency (different header height, different sidebar width, different animation timing) erodes trust.

4. **Power users deserve acceleration.** Command palette, keyboard shortcuts, and favorites exist for users who interact with the system 50+ times per day. These features must never slow down casual users but must delight power users.

5. **Notifications inform, never overwhelm.** The notification system must respect user attention. Batch similar events, suppress duplicates, and provide clear "mark all read" paths. The badge count should reflect actionable items, not noise.

---

## Architecture Diagram

```
+----------------------------------------------------------------------+
|  Browser Window                                                       |
|                                                                       |
|  +------------------+  +-------------------------------------------+  |
|  |                  |  |  Header Bar (64px)                        |  |
|  |  Sidebar         |  |  [Hamburger] [Breadcrumbs] [Search] [Bell]|  |
|  |  Navigation      |  |  [User Menu]                             |  |
|  |  (240px /        |  +-------------------------------------------+  |
|  |   64px collapsed)|  |                                           |  |
|  |                  |  |  Main Content Area                        |  |
|  |  [Logo]          |  |  (rendered by child route)                |  |
|  |  [Menu Items]    |  |                                           |  |
|  |  [Favorites]     |  |  On /(dashboard)/dashboard:               |  |
|  |  [Badge Counts]  |  |    [KPI Cards Row]                       |  |
|  |                  |  |    [Charts Row]                           |  |
|  |  [Collapse Btn]  |  |    [Activity Feed + Quick Actions]       |  |
|  |  [User Footer]   |  |                                           |  |
|  +------------------+  +-------------------------------------------+  |
|                                                                       |
|  +-------------------------------+                                    |
|  |  Notification Drawer (overlay)|  <-- slides from right             |
|  |  [Filter tabs]                |                                    |
|  |  [Notification list]          |                                    |
|  |  [Mark all read]              |                                    |
|  +-------------------------------+                                    |
|                                                                       |
|  +-------------------------------+                                    |
|  |  Command Palette (overlay)    |  <-- centered modal                |
|  |  [Search input]               |                                    |
|  |  [Results / Commands list]    |                                    |
|  +-------------------------------+                                    |
+----------------------------------------------------------------------+
```

---

## Zustand UI Store Shape

```typescript
interface DashboardShellStore {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  toggleSidebar: () => void;
  setSidebarMobileOpen: (open: boolean) => void;

  // Favorites
  favoritedNavItems: string[];
  toggleFavorite: (itemId: string) => void;

  // Notifications
  unreadNotificationCount: number;
  notificationDrawerOpen: boolean;
  setUnreadCount: (count: number) => void;
  toggleNotificationDrawer: () => void;

  // Command Palette
  commandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Breadcrumbs
  breadcrumbs: { label: string; href: string }[];
  setBreadcrumbs: (crumbs: { label: string; href: string }[]) => void;
}
```

---

## API Endpoints Summary

| # | Method | Path | Purpose | Used By |
|---|---|---|---|---|
| 1 | GET | `/api/dashboard/kpis` | Role-specific KPI data | Main Dashboard |
| 2 | GET | `/api/dashboard/activity` | Recent activity feed | Main Dashboard |
| 3 | GET | `/api/dashboard/quick-actions` | Available quick actions by role | Main Dashboard |
| 4 | GET | `/api/notifications` | Paginated notification list | Notification Center |
| 5 | GET | `/api/notifications/unread-count` | Badge count for bell icon | Header Bar |
| 6 | PATCH | `/api/notifications/:id/read` | Mark single notification read | Notification Center |
| 7 | PATCH | `/api/notifications/mark-all-read` | Mark all as read | Notification Center |
| 8 | GET | `/api/search` | Global search across all entities | Command Palette |
| 9 | GET | `/api/navigation/favorites` | User's favorited nav items | Sidebar |
| 10 | POST | `/api/navigation/favorites` | Save/remove favorite | Sidebar |
| 11 | GET | `/api/navigation/badges` | Unread/pending counts per nav item | Sidebar |
| 12 | WS | `/ws/notifications` | Real-time notification push | Header + Notification Center |

---

## Design Files in This Folder

| File | Screen | Priority | Status |
|---|---|---|---|
| `00-service-overview.md` | Service overview (this file) | -- | Complete |
| `01-main-dashboard.md` | Main Dashboard (role-specific KPIs) | P0 | Built -- Enhancement Focus |
| `02-sidebar-navigation.md` | Sidebar Navigation (collapsible, role-based) | P0 | Not Started |
| `03-header-bar.md` | Header Bar (search, notifications, user menu) | P0 | Not Started |
| `04-notification-center.md` | Notification Center (drawer, filtering, actions) | P1 | Not Started |
| `05-command-palette.md` | Command Palette (Cmd+K search, quick actions) | P1 | Not Started |

---

*This document was created as part of the Wave 1 design process for Ultra TMS Dashboard Shell service (01.1).*

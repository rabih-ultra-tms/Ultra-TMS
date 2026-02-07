# Sidebar Navigation

> Service: Dashboard Shell (01.1) | Wave: 1 | Priority: P0
> Route: /(dashboard)/_layout (persistent across all dashboard routes) | Status: **Not Started** | Type: Portal / Layout Component
> Primary Personas: Maria (Dispatcher), James (Sales), Sarah (Ops Manager), Emily (AR Specialist)
> Roles with Access: admin, ops_manager, dispatcher, sales_agent, sales_manager, accounting_manager, accounting_clerk, carrier_manager, super_admin

---

## 1. Purpose & Business Context

**What this screen does:**
The sidebar navigation is the persistent vertical menu on the left side of every authenticated page. It provides access to all major sections of Ultra TMS, filtered by the current user's role. The sidebar supports collapsible mode (icon-only at 64px), favorites/pinned items for quick access, unread badge counts on menu items, and a bottom section with user identity and collapse toggle. It is the primary wayfinding mechanism for every internal user.

**Business problem it solves:**
A TMS has 38 services and 362+ screens. Without intelligent navigation, users would be lost in the application. Role-based filtering ensures a dispatcher sees only the 15-20 menu items relevant to their work, not the full 50+ items an admin might access. Favorites let power users who access the same 5 screens repeatedly get there in one click instead of scrolling through nested menus. Badge counts surface urgent items (12 unassigned loads, 3 overdue invoices) without requiring the user to navigate to each section.

**Key business rules:**
- Menu items are rendered based on the intersection of the user's role and their specific permissions (role provides the baseline; custom permission overrides can add or remove items)
- The sidebar state (collapsed/expanded, favorites) persists across sessions via Zustand + localStorage
- Badge counts refresh every 30 seconds via polling (with WebSocket push planned)
- Nested menu sections collapse/expand independently; their state persists across navigation
- The sidebar must render within 100ms from cached state to prevent layout shift
- On mobile (< 768px), the sidebar is hidden by default and triggered via hamburger menu as a slide-over drawer
- Maximum of 10 favorites allowed per user

**Success metric:**
Users can navigate to any section within 2 clicks from the sidebar. Average navigation time from one section to another drops below 3 seconds. 60% of returning users have at least 3 favorites pinned.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Login / authentication | Sidebar renders as part of layout on every authenticated page | User role, permissions, tenant branding |
| Any page | Sidebar is always visible (desktop) or accessible via hamburger (mobile) | Current route (for active state highlighting) |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Dashboard | Click "Dashboard" menu item | None |
| Any service section | Click menu item (e.g., "Loads", "Carriers", "Invoices") | None |
| Any entity list | Click sub-menu item (e.g., "Orders > All Orders") | None |
| User Profile | Click user avatar/name at sidebar bottom | None |

**Primary trigger:**
User visually scans the sidebar to find the section they need, then clicks. Power users use keyboard shortcut G + key (e.g., G then L for Loads) instead of clicking.

**Success criteria (user completes the screen when):**
- User has navigated to their desired section
- N/A -- the sidebar is not a "screen" but a persistent navigation component

---

## 3. Layout Blueprint

### Desktop Layout -- Expanded (240px)

```
+----------------------------------+
|  [Ultra TMS Logo]     [<< btn]   |  <- 64px header area
+----------------------------------+
|                                  |
|  FAVORITES (if any pinned)       |
|  --------------------------------|
|  * Dispatch Board          [3]   |  <- star icon, badge count
|  * Tracking Map                  |
|  --------------------------------|
|                                  |
|  MAIN NAVIGATION                 |
|  --------------------------------|
|  @ Dashboard                     |  <- active: blue-600 left bar
|                                  |
|  v CRM                          |  <- expanded section
|    - Leads                       |
|    - Customers              [5]  |  <- badge: 5 new leads
|    - Contacts                    |
|    - Companies                   |
|                                  |
|  > Sales                         |  <- collapsed section
|                                  |
|  v Operations                    |  <- expanded section
|    - Orders                 [8]  |
|    - Loads                  [12] |  <- 12 unassigned
|    - Dispatch Board         [3]  |
|    - Tracking Map                |
|    - Check Calls                 |
|                                  |
|  > Carriers                      |
|  > Accounting                    |
|  > Reports                       |
|  > Admin                         |
|                                  |
|  --------------------------------|
|  BOTTOM SECTION                  |
|  --------------------------------|
|  [?] Help & Support              |
|  [Gear] Settings                 |
|  --------------------------------|
|  [Avatar] Maria Rodriguez        |
|           Dispatcher             |  <- role label
|  [<< Collapse sidebar]          |
+----------------------------------+
```

### Desktop Layout -- Collapsed (64px, icon-only)

```
+--------+
| [Logo] |  <- Small icon logo
+--------+
|        |
|  [*]   |  <- Favorites (star)
|  [*]   |
|--------|
|  [@]   |  <- Dashboard (active)
|  [CRM] |  <- Section icon, hover reveals flyout
|  [Sal] |
|  [Ops] |
|  [Car] |
|  [Acc] |
|  [Rep] |
|  [Adm] |
|--------|
|  [?]   |
|  [Gear]|
|--------|
|  [Ava] |  <- Avatar only
|  [>>]  |  <- Expand button
+--------+
```

### Mobile Layout (Slide-over Drawer)

```
+----------------------------------------------+
| OVERLAY (semi-transparent black)              |
|  +----------------------------------+        |
|  |  [X Close]  Ultra TMS            |        |
|  +----------------------------------+        |
|  |  (Full expanded sidebar content)  |        |
|  |  Same as desktop expanded layout  |        |
|  |  240px wide, slides from left     |        |
|  |                                   |        |
|  |  [User info at bottom]            |        |
|  +----------------------------------+        |
+----------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Active section highlight, tenant logo, primary nav items | User must always know where they are and see their core sections |
| **Secondary** (visible but compact) | Badge counts, favorites section | Urgent counts draw attention; favorites provide shortcuts |
| **Tertiary** (available on hover/expand) | Sub-menu items, section children | Detail revealed on demand to keep sidebar clean |
| **Hidden** (behind interaction) | Collapsed sidebar flyout menus, tooltip labels on icons | Available in collapsed mode via hover |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Tenant Logo | Tenant.logo | Image (max 140x32px), falls back to "Ultra TMS" text | Sidebar header, top-left |
| 2 | User Avatar | User.avatar | 32px circle image, falls back to initials on colored background | Sidebar footer |
| 3 | User Name | User.firstName + lastName | "Maria Rodriguez" truncated at 20 chars with ellipsis | Sidebar footer, below avatar |
| 4 | User Role | User.role.displayName | "Dispatcher" in 12px gray-400 text | Sidebar footer, below name |
| 5 | Menu Item Labels | NavigationConfig[role] | 14px white text, Inter font | Each menu item row |
| 6 | Menu Item Icons | NavigationConfig[role].icon | 20px Lucide icons, gray-400 default, white active | Left side of each item |
| 7 | Badge Counts | `/api/navigation/badges` | Red circle with white number, max "99+" | Right side of applicable items |
| 8 | Active Indicator | Derived from current route | 3px blue-600 left border bar | Active menu item |
| 9 | Section Chevron | UI state | ChevronDown (expanded) / ChevronRight (collapsed) | Right side of section headers |
| 10 | Favorite Star | User.favorites[] | Filled yellow star (favorited) / outline star (on hover) | Left of favorite items |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Active Menu Item | Match current URL path against menu item routes | Blue-600 left border + white background opacity |
| 2 | Expanded Sections | If any child route is active, parent section auto-expands | Section toggles open |
| 3 | Badge Urgency | Count > 10: yellow badge; Count > 20: red badge | Color-coded badge background |
| 4 | Initials Fallback | First letter of firstName + firstName of lastName | "MR" on blue-600 circle background |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Role-based menu item filtering (only show items the user can access)
- [ ] Active state highlighting based on current route
- [ ] Section collapse/expand with chevron toggle
- [ ] Auto-expand section when navigating to a child route
- [ ] Collapsible sidebar (240px expanded, 64px icon-only mode)
- [ ] Keyboard toggle: Ctrl/Cmd + B to collapse/expand
- [ ] Persistent collapse state across page navigations (Zustand + localStorage)
- [ ] Badge counts on menu items showing unread/pending/actionable counts
- [ ] User identity footer with avatar, name, and role
- [ ] Tenant logo/branding in sidebar header
- [ ] Mobile hamburger menu trigger (< 768px)
- [ ] Mobile slide-over drawer with overlay backdrop

### Advanced Features (Enhancement Recommendations)

- [ ] Favorites/pinned items section at top of sidebar (star icon on hover, max 10)
- [ ] Drag-to-reorder favorites
- [ ] Tooltip labels on hover in collapsed mode (icon-only)
- [ ] Flyout sub-menus on hover in collapsed mode
- [ ] Animated collapse/expand transition (200ms ease-in-out)
- [ ] Right-click context menu on menu items: "Add to Favorites", "Open in New Tab"
- [ ] Search/filter within sidebar menu (type to filter items)
- [ ] Badge count animation (scale up briefly when count changes)
- [ ] "Recently Visited" section (last 5 pages, auto-populated)
- [ ] Keyboard navigation: arrow keys to move between items, Enter to navigate

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| CRM section | sales_agent, sales_manager, admin, ops_manager, super_admin | `crm_view` | Section not rendered |
| Sales section | sales_agent, sales_manager, admin, super_admin | `sales_view` | Section not rendered |
| Operations section | dispatcher, ops_manager, admin, super_admin | `operations_view` | Section not rendered |
| Carriers section | dispatcher, ops_manager, carrier_manager, admin, super_admin | `carrier_view` | Section not rendered |
| Accounting section | accounting_clerk, accounting_manager, admin, super_admin | `accounting_view` | Section not rendered |
| Admin section | admin, super_admin | `admin_access` | Section not rendered |
| Platform section | super_admin | `platform_admin` | Section not rendered |
| Reports section | All internal roles | varies by report type | Section visible; sub-items filtered |

---

## 6. Status & State Machine

### Sidebar State Machine

```
[Expanded] ---(Click collapse / Ctrl+B)---> [Collapsed (Icon-Only)]
     |                                              |
     |  <---(Click expand / Ctrl+B)---              |
     |                                              |
[Mobile Hidden] ---(Click hamburger)---> [Mobile Drawer Open]
     |                                              |
     |  <---(Click overlay / X / Escape)---         |
     |                                              |
[Section Collapsed] ---(Click section header)---> [Section Expanded]
     |                                                    |
     |  <---(Click section header)---                     |
```

### Menu Item States

| State | Visual Treatment | Trigger |
|---|---|---|
| Default | Gray-400 icon, gray-300 text, transparent bg | No interaction |
| Hover | Gray-300 icon, white text, white/5 bg (subtle white overlay) | Mouse hover |
| Active (current page) | White icon, white text, white/10 bg, 3px blue-600 left border | URL matches item route |
| Active Parent | White text, section auto-expanded | URL matches any child route |
| Focused (keyboard) | Same as hover + focus ring | Keyboard arrow navigation |
| Disabled | Gray-600 icon, gray-600 text, cursor-not-allowed | Permission denied but visible (rare) |
| Badge Active | Red/yellow circle with count overlaid on right side | Unread/pending count > 0 |

### Badge Count Colors

| Count Range | Badge Color | Background | Text |
|---|---|---|---|
| 1-9 | Standard | red-500 | white |
| 10-99 | Elevated | red-600 | white |
| 99+ | Maximum | red-700 (show "99+") | white |

---

## 7. Actions & Interactions

### Click Actions

| Element | Action | Navigation |
|---|---|---|
| Logo / brand area | Navigate to dashboard | `/(dashboard)/dashboard` |
| Menu item (leaf) | Navigate to that page | Item's configured route |
| Section header (parent) | Toggle expand/collapse of children | No navigation |
| Badge count on item | Same as clicking the item | Item's route with relevant filter |
| User avatar/name (footer) | Navigate to profile settings | `/(dashboard)/profile` |
| Collapse/Expand button | Toggle sidebar width | N/A (UI state change) |
| Favorite star (on hover) | Toggle favorite status for item | N/A (API call + state update) |
| Hamburger button (mobile) | Open sidebar drawer | N/A (UI state change) |
| Drawer overlay (mobile) | Close sidebar drawer | N/A (UI state change) |

### Hover Interactions

| Element | Hover Behavior |
|---|---|
| Menu item | Background brightens (white/5 overlay), text goes white |
| Menu item (collapsed mode) | Tooltip appears to right showing full label |
| Section header (collapsed mode) | Flyout panel appears to right showing all children |
| Favorite star area | Star icon appears on menu items that are not yet favorited |
| Badge count | Tooltip: "12 unassigned loads" (descriptive text for the count) |
| User footer area | Subtle background change |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + B` | Toggle sidebar collapsed/expanded |
| `G` then `D` | Navigate to Dashboard |
| `G` then `O` | Navigate to Orders |
| `G` then `L` | Navigate to Loads |
| `G` then `C` | Navigate to Carriers |
| `G` then `U` | Navigate to Customers |
| `G` then `T` | Navigate to Tracking Map |
| `G` then `Q` | Navigate to Quotes |
| `G` then `I` | Navigate to Invoices |
| `G` then `R` | Navigate to Reports |
| `G` then `S` | Navigate to Settings |
| `G` then `P` | Navigate to Dispatch Board |
| `G` then `A` | Navigate to Accounting |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| Favorite item | Other position in favorites list | Reorder favorites |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| `badge.updated` | `{ menuItemId, newCount, previousCount }` | Update badge count on specific menu item, briefly scale-animate the badge |
| `navigation.updated` | `{ userId, action, menuItemId }` | Sync favorites across tabs/devices |

### Live Update Behavior

- **Update frequency:** Badge counts poll every 30 seconds; WebSocket push for immediate updates when available
- **Visual indicator:** Badge count briefly scales up (1.2x for 300ms) when the number changes
- **Conflict handling:** Last-write-wins for favorites. Badge counts always show server-authoritative values.

### Polling Fallback

- **When:** WebSocket connection not established or drops
- **Interval:** Every 30 seconds
- **Endpoint:** `GET /api/navigation/badges`
- **Visual indicator:** None (badge updates happen silently)

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Toggle favorite | Immediately add/remove star icon and reorder favorites list | Revert star state, show toast "Failed to update favorites" |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `Sidebar` | `src/components/layout/sidebar.tsx` | Needs complete rewrite to support role filtering, collapse, favorites |
| `Avatar` | `src/components/ui/avatar.tsx` | shadcn avatar with image + fallback initials |
| `Tooltip` | `src/components/ui/tooltip.tsx` | For collapsed mode icon labels |
| `Badge` | `src/components/ui/badge.tsx` | For notification count indicators |
| `Sheet` | `src/components/ui/sheet.tsx` | For mobile drawer implementation |
| `ScrollArea` | `src/components/ui/scroll-area.tsx` | For sidebar content overflow scrolling |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| `Sidebar` | Static menu list, hardcoded items | Role-based filtering, collapse mode, favorites, badges, keyboard nav |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `SidebarNav` | Main sidebar container with collapse logic and layout | Large |
| `SidebarHeader` | Logo area with collapse toggle button | Small |
| `SidebarSection` | Collapsible section with header, icon, chevron, and children | Medium |
| `SidebarItem` | Individual menu item with icon, label, badge, active state, and favorite toggle | Medium |
| `SidebarFavorites` | Favorites section with pinned items and drag reorder | Medium |
| `SidebarFooter` | User identity area with avatar, name, role, and collapse button | Small |
| `SidebarBadge` | Red/yellow count badge with animation on change | Small |
| `SidebarFlyout` | Flyout sub-menu for collapsed mode (appears on hover) | Medium |
| `MobileSidebarDrawer` | Sheet-based mobile sidebar with overlay | Medium |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Sheet | `sheet` | Mobile sidebar drawer |
| Scroll Area | `scroll-area` | Sidebar content overflow |
| Tooltip | `tooltip` | Collapsed mode labels |
| Avatar | `avatar` | User identity in footer |
| Collapsible | `collapsible` | Section expand/collapse animation |
| Separator | `separator` | Visual dividers between sections |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | `/api/navigation/menu` | Role-filtered menu structure | `useNavigationMenu()` |
| 2 | GET | `/api/navigation/badges` | Badge counts for all menu items | `useNavigationBadges()` |
| 3 | GET | `/api/navigation/favorites` | User's pinned favorite items | `useNavigationFavorites()` |
| 4 | POST | `/api/navigation/favorites` | Add item to favorites | `useAddFavorite()` |
| 5 | DELETE | `/api/navigation/favorites/:itemId` | Remove item from favorites | `useRemoveFavorite()` |
| 6 | PATCH | `/api/navigation/favorites/reorder` | Reorder favorites list | `useReorderFavorites()` |

### Request/Response Examples

**GET /api/navigation/menu**
```json
{
  "sections": [
    {
      "id": "operations",
      "label": "Operations",
      "icon": "truck",
      "children": [
        { "id": "orders", "label": "Orders", "route": "/orders", "icon": "clipboard-list", "badgeKey": "orders_pending" },
        { "id": "loads", "label": "Loads", "route": "/loads", "icon": "package", "badgeKey": "loads_unassigned" },
        { "id": "dispatch", "label": "Dispatch Board", "route": "/dispatch", "icon": "layout-grid", "badgeKey": "dispatch_unassigned" },
        { "id": "tracking", "label": "Tracking Map", "route": "/tracking", "icon": "map-pin" }
      ]
    }
  ]
}
```

**GET /api/navigation/badges**
```json
{
  "badges": {
    "orders_pending": 8,
    "loads_unassigned": 12,
    "dispatch_unassigned": 3,
    "invoices_overdue": 5,
    "leads_new": 2
  },
  "updatedAt": "2026-02-06T14:30:00Z"
}
```

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| `badges:{tenantId}:{userId}` | `badge.updated` | `useBadgeUpdates()` -- updates badge count in cache |
| `favorites:{userId}` | `favorites.changed` | `useFavoritesSync()` -- syncs across browser tabs |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/navigation/menu | Show default menu (hardcoded fallback) | Redirect to login | Show minimal menu | Show default menu | Show default menu (cached/hardcoded) |
| GET /api/navigation/badges | Show no badges | Redirect to login | Show no badges | Show no badges | Show no badges (silent fail) |
| POST /api/navigation/favorites | Toast "Invalid item" | Redirect to login | Toast "Cannot save favorites" | Toast "Item not found" | Toast "Failed to save favorite. Try again." |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Sidebar renders immediately from hardcoded structure (no skeleton needed). Badge counts show empty (no number) until loaded, then fade in. User footer shows skeleton avatar circle until user data loads.
- **Progressive loading:** Menu structure renders from cache/hardcoded config. Badges load async. Favorites load async.
- **Duration threshold:** Not applicable -- sidebar should always render instantly from cached/static data.

### Empty States

**No favorites pinned:**
- Favorites section is hidden entirely (no empty state message)
- On hover of any menu item, show a subtle star icon to hint at the favorites feature

**New user (first login):**
- Show all role-appropriate menu items
- Show a one-time tooltip on the favorites section: "Pin your most-used pages here for quick access"

### Error States

**Menu API fails:**
- **Display:** Render hardcoded fallback menu based on user role. No error message shown (graceful degradation).

**Badges API fails:**
- **Display:** Hide all badge counts. Menu items render normally without counts. Silent retry in 30 seconds.

**Favorites API fails:**
- **Display:** Hide favorites section. Show toast on next attempt to add a favorite: "Favorites unavailable. Please try again."

### Permission Denied

- **Full sidebar denied:** Not possible -- all authenticated users have sidebar access
- **Partial denied (some items hidden):** Items the user cannot access are not rendered at all. The sidebar adjusts spacing naturally.

### Offline / Degraded

- **Full offline:** Sidebar renders from localStorage cached state (menu structure, favorites, last known badges). Navigation clicks will fail on target page.
- **Degraded:** Sidebar always works; it is a client-side component. Only badge counts and favorites sync are affected.

---

## 12. Filters, Search & Sort

### Sidebar Search (Future Enhancement)

| # | Filter Label | Type | Options | Default | Notes |
|---|---|---|---|---|---|
| 1 | Menu Search | Text input at top of sidebar | Free text | Empty | Type to filter menu items. Shows matching items across all sections. Planned for Wave 2. |

### Sort Options

- Favorites: user-defined order via drag-and-drop
- Main navigation: fixed order defined by navigation config (Dashboard first, Admin last)
- Within sections: fixed order defined by navigation config

### Saved Filters / Presets

- Not applicable for sidebar navigation

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Sidebar defaults to collapsed mode (64px, icon-only)
- Hover on icon shows tooltip with label
- Hover on section icon shows flyout panel with children
- Can be expanded to full 240px via Ctrl+B or clicking expand button
- When expanded on tablet, content area narrows (sidebar overlays if viewport too narrow)

### Mobile (< 768px)

- Sidebar is hidden entirely from the viewport
- Hamburger icon (Menu) appears in the header bar, left side
- Clicking hamburger opens sidebar as a Sheet/drawer from the left
- Drawer is 280px wide with semi-transparent overlay behind it
- Clicking overlay, pressing X, or pressing Escape closes the drawer
- All sidebar functionality available in the drawer (favorites, sections, badges, user footer)
- After clicking a menu item, the drawer automatically closes and navigates

### Breakpoint Reference

| Breakpoint | Width | Sidebar Behavior |
|---|---|---|
| Desktop XL | 1440px+ | Expanded by default (240px), user can collapse |
| Desktop | 1024px - 1439px | Expanded by default (240px), user can collapse |
| Tablet | 768px - 1023px | Collapsed by default (64px), user can expand |
| Mobile | < 768px | Hidden, triggered via hamburger as drawer overlay |

---

## 14. Stitch Prompt

```
Design a collapsible sidebar navigation for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS." Show BOTH expanded and collapsed states side by side.

EXPANDED SIDEBAR (240px wide):

Top: "Ultra TMS" logo text in white bold 18px on a slate-900 (very dark blue-gray) background. A small "<<" collapse button icon in gray-400 in the top-right corner of the sidebar.

Favorites Section (top, separated by a thin line):
- Star icon + "Dispatch Board" with a red badge showing "3"
- Star icon + "Tracking Map" (no badge)

Main Navigation (scrollable area):
All items have a Lucide icon on the left (20px, gray-400 color) and label text in gray-300 (14px Inter font).

- Dashboard (active state: 3px blue-600 left border, white text, white/10% background, white icon)
- CRM section header (with chevron-down, expanded):
  - Leads (with badge "2")
  - Customers
  - Contacts
  - Companies
- Sales section header (with chevron-right, collapsed)
- Operations section header (with chevron-down, expanded):
  - Orders (badge "8")
  - Loads (badge "12" in red)
  - Dispatch Board (badge "3")
  - Tracking Map
  - Check Calls
- Carriers section header (collapsed)
- Accounting section header (collapsed)
- Reports section header (collapsed)
- Admin section header (collapsed)

Bottom Section (fixed at bottom):
- Thin separator line
- "Help & Support" with question-mark icon
- "Settings" with gear icon
- Separator line
- User avatar (32px circle, showing "MR" initials on blue-600 background)
- "Maria Rodriguez" in 14px white text
- "Dispatcher" in 12px gray-400 text
- "<< Collapse" text button in gray-400

COLLAPSED SIDEBAR (64px wide, shown separately):
- Small Ultra TMS icon/logo mark
- Same sections as icons only (20px icons centered), with tooltips appearing on hover
- Active item (Dashboard) has blue-600 left border and white icon
- Badge counts still visible as small dots on icon corners
- User avatar (24px) at bottom
- ">>" expand button at very bottom

Design Specifications:
- Sidebar background: slate-900 (#0f172a)
- Item hover: white with 5% opacity background (rgba(255,255,255,0.05))
- Active item: white with 10% opacity background + 3px blue-600 left border
- Text: gray-300 (#d1d5db) default, white (#ffffff) on hover and active
- Icons: gray-400 (#9ca3af) default, white on active
- Badge: red-500 background, white text, 18px circle, bold 11px number
- Chevrons: gray-500, 16px
- Transition: 200ms ease-in-out for collapse animation
- Font: Inter, 14px for items, 12px for role label and section headers
- Modern SaaS aesthetic matching Linear.app or Notion sidebar
- Smooth rounded corners on hover states (rounded-md)

Include: Both expanded and collapsed states. Show one section expanded (Operations) and one collapsed (Sales). Show badge counts on 4 items. Show the favorites section with 2 pinned items. Show user identity at the bottom.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- [x] Basic sidebar component rendering a static list of menu items
- [x] Navigation links to major sections
- [x] Sidebar renders on all `/(dashboard)` routes via layout.tsx

**What needs polish / bug fixes:**
- [ ] Menu items are hardcoded -- not filtered by user role
- [ ] No collapse/expand functionality
- [ ] No active state highlighting based on current route
- [ ] No badge counts on menu items
- [ ] No favorites/pinned items
- [ ] No user identity in sidebar footer
- [ ] No mobile drawer implementation
- [ ] No keyboard shortcuts for navigation

**What to add this wave:**
- [ ] Implement role-based menu filtering using permission config
- [ ] Build collapse/expand with Zustand state persistence
- [ ] Add active state highlighting with route matching
- [ ] Implement badge counts with 30-second polling
- [ ] Build favorites section with add/remove/reorder
- [ ] Add user identity footer with avatar, name, role
- [ ] Implement Ctrl/Cmd + B keyboard toggle
- [ ] Build mobile drawer with hamburger trigger
- [ ] Add section collapse/expand with animation
- [ ] Add hover tooltips for collapsed mode
- [ ] Add flyout sub-menus for collapsed mode

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Role-based menu filtering | High | Medium | P0 |
| Active state highlighting | High | Low | P0 |
| Collapse/expand with persistence | High | Medium | P0 |
| Mobile drawer implementation | High | Medium | P0 |
| Badge counts with polling | Medium | Medium | P1 |
| Favorites section | Medium | Medium | P1 |
| User identity footer | Medium | Low | P1 |
| Keyboard navigation (G + key) | Medium | Low | P1 |
| Hover tooltips (collapsed mode) | Low | Low | P1 |
| Flyout sub-menus (collapsed mode) | Medium | Medium | P2 |
| Drag-to-reorder favorites | Low | Medium | P2 |
| Right-click context menu | Low | Medium | P2 |
| Sidebar search/filter | Low | High | P2 (future wave) |

### Future Wave Preview

- **Wave 2:** Sidebar search/filter input, recently visited section, animated badge transitions
- **Wave 3:** Custom menu ordering per user, pinnable sub-items (not just sections), tenant-configurable menu labels
- **Wave 4:** AI-suggested navigation ("Based on your workflow, try Tracking Map next"), contextual sidebar hints
- **Wave 5:** Fully tenant-configurable navigation builder (admin can add/remove/reorder menu items for all users)

---

## Navigation Configuration Reference

### Complete Menu Structure by Role

| Menu Item | admin | ops_manager | dispatcher | sales_agent | sales_manager | accounting_manager | accounting_clerk | carrier_manager | super_admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Dashboard** | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| **CRM** | | | | | | | | | |
| - Leads | Y | -- | -- | Y | Y | -- | -- | -- | Y |
| - Customers | Y | Y | -- | Y | Y | Y | Y | -- | Y |
| - Contacts | Y | Y | -- | Y | Y | Y | Y | -- | Y |
| - Companies | Y | Y | -- | Y | Y | Y | Y | -- | Y |
| **Sales** | | | | | | | | | |
| - Quotes | Y | Y | -- | Y | Y | -- | -- | -- | Y |
| - Rate Lookup | Y | Y | -- | Y | Y | -- | -- | Y | Y |
| - Lane Pricing | Y | Y | -- | Y | Y | -- | -- | -- | Y |
| **Operations** | | | | | | | | | |
| - Orders | Y | Y | Y | -- | -- | -- | -- | -- | Y |
| - Loads | Y | Y | Y | -- | -- | -- | -- | -- | Y |
| - Dispatch Board | Y | Y | Y | -- | -- | -- | -- | -- | Y |
| - Tracking Map | Y | Y | Y | -- | -- | -- | -- | -- | Y |
| - Check Calls | Y | Y | Y | -- | -- | -- | -- | -- | Y |
| **Carriers** | | | | | | | | | |
| - Directory | Y | Y | Y | -- | -- | -- | -- | Y | Y |
| - Onboarding | Y | -- | -- | -- | -- | -- | -- | Y | Y |
| - Compliance | Y | -- | -- | -- | -- | -- | -- | Y | Y |
| - Scorecards | Y | Y | -- | -- | -- | -- | -- | Y | Y |
| **Accounting** | | | | | | | | | |
| - Invoices (AR) | Y | -- | -- | -- | -- | Y | Y | -- | Y |
| - Carrier Pay (AP) | Y | -- | -- | -- | -- | Y | Y | -- | Y |
| - Payments | Y | -- | -- | -- | -- | Y | Y | -- | Y |
| - AR Aging | Y | -- | -- | -- | -- | Y | Y | -- | Y |
| **Reports** | Y | Y | -- | Y | Y | Y | -- | Y | Y |
| **Admin** | | | | | | | | | |
| - Users & Roles | Y | -- | -- | -- | -- | -- | -- | -- | Y |
| - Tenant Settings | Y | -- | -- | -- | -- | -- | -- | -- | Y |
| - Audit Log | Y | -- | -- | -- | -- | -- | -- | -- | Y |
| - Integrations | Y | -- | -- | -- | -- | -- | -- | -- | Y |
| **Platform** | -- | -- | -- | -- | -- | -- | -- | -- | Y |

---

*This document was created as part of the Wave 1 design process for Ultra TMS Dashboard Shell service (01.1).*

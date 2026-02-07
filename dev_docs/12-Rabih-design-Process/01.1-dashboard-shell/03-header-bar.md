# Header Bar

> Service: Dashboard Shell (01.1) | Wave: 1 | Priority: P0
> Route: /(dashboard)/_layout (persistent across all dashboard routes) | Status: **Not Started** | Type: Portal / Layout Component
> Primary Personas: Maria (Dispatcher), James (Sales), Sarah (Ops Manager), Emily (AR Specialist)
> Roles with Access: All authenticated internal roles (admin, ops_manager, dispatcher, sales_agent, sales_manager, accounting_manager, accounting_clerk, carrier_manager, super_admin)

---

## 1. Purpose & Business Context

**What this screen does:**
The header bar is a 64px-tall persistent horizontal bar at the top of every authenticated page. It provides four critical functions: (1) breadcrumb navigation showing the user's current location in the app hierarchy, (2) a global search trigger that opens the Command Palette, (3) a notification bell with unread count badge linking to the Notification Center, and (4) a user menu dropdown with profile access, theme toggle, help, and logout. The header bar is the command center strip that ties together navigation awareness, search, alerts, and user identity.

**Business problem it solves:**
Users working across multiple TMS screens (loads, carriers, invoices, tracking) frequently lose context about where they are in the application. Breadcrumbs solve this by showing the navigation path (Dashboard > Operations > Loads > L-2025-4521). The notification bell provides a persistent reminder of pending actions without requiring the user to navigate to a separate notifications page. The search trigger gives instant access to the Command Palette from any screen, eliminating the need to navigate through the sidebar to find something. The user menu centralizes account actions (profile, settings, logout) in one predictable location.

**Key business rules:**
- The header bar renders on every `/(dashboard)` route -- it is part of the root layout
- Breadcrumbs are auto-generated from the URL path segments with human-readable labels
- The notification badge count reflects truly unread notifications (not dismissed, not read)
- The notification badge shows exact count up to 9, then "9+" for 10 or more
- Search trigger is always accessible via both click and keyboard shortcut (Ctrl/Cmd + K)
- User menu must include logout action that clears JWT and redirects to login
- The header must have zero layout shift on render -- height is fixed at 64px
- On mobile, the header adapts: hamburger menu replaces sidebar, breadcrumbs collapse to current page only

**Success metric:**
Users can identify their current location (breadcrumbs) within 1 second of any page load. Search-to-result time (click search to finding an entity) averages under 5 seconds. Notification awareness: 90% of users check notifications within 15 minutes of receiving a critical alert.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Layout render | Header is part of the persistent layout on every dashboard route | Current route path, user session data |
| Any page navigation | Header updates breadcrumbs and active states on each route change | New route path |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Command Palette | Click search icon or press Ctrl/Cmd + K | None (palette opens as modal overlay) |
| Notification Center | Click bell icon | None (drawer slides from right) |
| Parent page (breadcrumb) | Click any breadcrumb segment | None (navigates to that route) |
| Profile Settings | Click "Profile" in user menu | None |
| Tenant Settings | Click "Settings" in user menu (admin only) | None |
| Login page | Click "Log out" in user menu | Clears session, redirects to /login |

**Primary trigger:**
The header is always visible. Users interact with it when they need to search (Cmd+K), check notifications (bell icon), navigate up the hierarchy (breadcrumbs), or access account actions (user menu). Maria (Dispatcher) checks the notification bell 10+ times per day. James (Sales) uses Cmd+K search 20+ times per day.

**Success criteria (user completes the screen when):**
- N/A -- the header is a persistent UI component, not a destination screen

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+----------------------------------------------------------------------+
| [=] |  Dashboard > Operations > Loads > L-2025-4521                   |
|     |                                                                 |
| ham |  BREADCRUMBS (left-aligned)            ACTIONS (right-aligned)  |
| brg |                                                                 |
|     |                        [Search icon + "Search..." text]  |      |
|     |                        [Bell icon + red "3" badge]       |      |
|     |                        [Avatar "MR" + chevron-down]      |      |
+----------------------------------------------------------------------+
  ^                                                    ^
  |                                                    |
  64px height                                     Right section
  Hamburger only on mobile                        fixed right-aligned
```

### Detailed Layout

```
+----------------------------------------------------------------------+
|                          HEADER BAR (64px)                            |
|                                                                       |
|  +-----+  +------------------------------------------+  +---------+  |
|  | [=]  |  | Home > Operations > Loads > L-2025-4521  |  | Actions |  |
|  | menu |  | (breadcrumb trail, clickable segments)    |  |         |  |
|  +-----+  +------------------------------------------+  |  [Q]    |  |
|   only                                                   |  search |  |
|   on                                                     |         |  |
|   mobile                                                 |  [Bell] |  |
|   <768                                                   |  3 bdg  |  |
|                                                          |         |  |
|                                                          |  [MR v] |  |
|                                                          |  avatar |  |
|                                                          +---------+  |
+----------------------------------------------------------------------+
```

### User Menu Dropdown (on avatar click)

```
+-----------------------------+
|  Maria Rodriguez            |
|  maria@ultrafreight.com     |
|  Dispatcher                 |
+-----------------------------|
|  [User] My Profile          |
|  [Settings] Settings        |
|  [Moon] Dark Mode    [toggle]|
|  [Globe] Language     EN v  |
+-----------------------------|
|  [?] Help & Support         |
|  [Keyboard] Shortcuts  ?    |
+-----------------------------|
|  [LogOut] Log Out           |
+-----------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Breadcrumbs showing current location, notification bell with badge | Users need constant awareness of where they are and if urgent items are pending |
| **Secondary** (visible, less prominent) | Search trigger, user avatar | Available at a glance but not visually dominant |
| **Tertiary** (behind interaction) | User menu dropdown contents, full notification drawer | Revealed on click, not competing for attention |
| **Hidden** (contextual) | Hamburger menu (mobile only), keyboard shortcut hints | Platform-specific or discoverable through exploration |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Breadcrumb Trail | Derived from URL path | "Home > Operations > Loads > L-2025-4521", each segment clickable | Left side, center-aligned vertically |
| 2 | Search Trigger | Static UI | Search icon (magnifying glass) + "Search..." placeholder text | Right section, leftmost action |
| 3 | Notification Badge | `/api/notifications/unread-count` | Red circle with white number (1-9) or "9+" | Overlaid on bell icon, top-right corner |
| 4 | Bell Icon | Static UI | Lucide Bell icon, 20px, gray-500 default | Right section, middle action |
| 5 | User Avatar | User.avatar or User.initials | 32px circle with image or colored initials background | Right section, rightmost |
| 6 | User Name (dropdown) | User.firstName + lastName | "Maria Rodriguez" in 14px semibold | Top of user menu dropdown |
| 7 | User Email (dropdown) | User.email | "maria@ultrafreight.com" in 12px gray-500 | Below name in dropdown |
| 8 | User Role (dropdown) | User.role.displayName | "Dispatcher" in 12px, role badge styling | Below email in dropdown |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Breadcrumb Segments | Split URL path by "/" and map each segment to a human-readable label via route config | Array of {label, href} pairs |
| 2 | Current Page Title | Last segment of breadcrumb trail | Bold text for the final breadcrumb segment |
| 3 | Badge Visibility | Show badge only when unreadCount > 0 | Badge hidden when count is 0 |
| 4 | Badge Text | If count <= 9, show exact number. If count > 9, show "9+" | Formatted string |
| 5 | Initials | First letter of firstName + first letter of lastName | "MR" for Maria Rodriguez |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Fixed 64px header bar on all dashboard routes
- [ ] Auto-generated breadcrumb trail from URL path
- [ ] Clickable breadcrumb segments for navigation
- [ ] Search trigger icon that opens Command Palette on click
- [ ] Ctrl/Cmd + K keyboard shortcut for search (anywhere on page)
- [ ] Notification bell icon with unread count badge
- [ ] Click bell to open Notification Center drawer
- [ ] User avatar with dropdown menu
- [ ] Dropdown: My Profile link
- [ ] Dropdown: Log Out action (clears session, redirects to /login)
- [ ] Mobile: Hamburger menu icon (replaces sidebar) on left side of header

### Advanced Features (Enhancement Recommendations)

- [ ] **Dark mode toggle** in user menu dropdown (persists to localStorage and Zustand)
- [ ] **Language selector** in user menu (EN, ES, FR -- future i18n support)
- [ ] **Keyboard shortcuts help** link in user menu that opens shortcut overlay
- [ ] **Settings link** in user menu (admin roles only) linking to tenant settings
- [ ] **Help & Support** link in user menu linking to help desk / knowledge base
- [ ] **Notification bell animation** -- subtle shake animation when a new notification arrives via WebSocket
- [ ] **Search shortcut hint** -- show "Ctrl+K" text next to the search trigger for discoverability
- [ ] **Breadcrumb entity resolution** -- for routes like `/loads/[id]`, show the actual load number (L-2025-4521) instead of the raw ID
- [ ] **Breadcrumb overflow** -- when breadcrumb trail is too long, collapse middle segments into a "..." dropdown
- [ ] **Status indicator dot** on user avatar showing online/away/busy status (future real-time presence)

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Settings link in user menu | admin, super_admin | `admin_access` | Link not rendered in dropdown |
| Admin-specific breadcrumb paths | admin, super_admin | `admin_access` | Admin routes not reachable, so breadcrumbs never show admin paths |
| Platform link in user menu | super_admin | `platform_admin` | Link not rendered |

---

## 6. Status & State Machine

### Header Component States

```
NOTIFICATION BELL:
  [No Unread] ---(new notification arrives)---> [Badge Visible]
       |                                              |
       |  <---(all marked read)---                    |
       |                                              |
  [Badge Visible] ---(click bell)---> [Drawer Open]
                                           |
                          <---(click outside / X / Escape)---

USER MENU:
  [Closed] ---(click avatar)---> [Dropdown Open]
       |                               |
       |  <---(click outside / Escape / select item)---

SEARCH:
  [Idle] ---(click search or Ctrl+K)---> [Command Palette Open]
       |                                          |
       |  <---(Escape / select result)---         |

BREADCRUMBS:
  [Static] ---(route change)---> [Updated with new path]
```

### Notification Badge States

| State | Visual | Condition |
|---|---|---|
| No unread | Bell icon only, gray-500, no badge | unreadCount === 0 |
| Low count (1-9) | Bell icon + red circle badge with number | unreadCount 1-9 |
| High count (10+) | Bell icon + red circle badge showing "9+" | unreadCount >= 10 |
| New notification | Bell briefly shakes (300ms animation) + badge count updates | WebSocket event received |

---

## 7. Actions & Interactions

### Click Actions

| Element | Action | Result |
|---|---|---|
| Hamburger icon (mobile) | Open sidebar drawer | Sidebar slides in from left with overlay |
| Breadcrumb segment | Navigate to that route | Page navigation to the segment's URL |
| Search icon / "Search..." | Open Command Palette | Modal overlay appears centered on screen |
| Bell icon | Toggle Notification Center drawer | Drawer slides in from right |
| User avatar / chevron | Toggle user menu dropdown | Dropdown appears below avatar, right-aligned |
| "My Profile" (dropdown) | Navigate to profile | `/(dashboard)/profile` |
| "Settings" (dropdown) | Navigate to settings | `/(dashboard)/admin/settings` |
| Dark Mode toggle (dropdown) | Toggle theme | Switch between light/dark, persist to localStorage |
| "Help & Support" (dropdown) | Navigate to help | `/(dashboard)/support` or open external docs |
| "Keyboard Shortcuts" (dropdown) | Open shortcuts overlay | Modal with all keyboard shortcuts |
| "Log Out" (dropdown) | End session | Clear JWT, clear Zustand, redirect to `/login` |

### Hover Interactions

| Element | Hover Behavior |
|---|---|
| Breadcrumb segment | Text color changes to blue-600, underline appears, cursor pointer |
| Search trigger | Background lightens slightly, cursor pointer |
| Bell icon | Background circle appears (gray-100), cursor pointer |
| User avatar | Subtle ring appears around avatar, cursor pointer |
| Dropdown menu items | Background gray-100, cursor pointer |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + K` | Open Command Palette (from anywhere) |
| `Ctrl/Cmd + /` | Open keyboard shortcuts help |
| `Escape` | Close dropdown / drawer / palette (whichever is topmost) |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop in the header bar |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| `notification.new` | `{ id, type, title, severity }` | Increment badge count, trigger bell shake animation, optionally show toast |
| `notification.read` | `{ id }` | Decrement badge count (if notification was previously unread) |
| `notification.bulk_read` | `{ count }` | Set badge count to current - count (or hide badge if 0) |

### Live Update Behavior

- **Update frequency:** WebSocket push for immediate badge updates; polling every 30 seconds as fallback
- **Visual indicator:** Bell icon performs a subtle left-right shake animation (200ms) when a new notification arrives
- **Conflict handling:** Badge count is always server-authoritative. Client-side optimistic decrements on "mark read" but reconciles with server on next poll.

### Polling Fallback

- **When:** WebSocket connection unavailable
- **Interval:** Every 30 seconds
- **Endpoint:** `GET /api/notifications/unread-count`
- **Visual indicator:** None (badge updates silently)

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Open notification drawer | Immediately show drawer (no data wait) | Show "Loading..." state inside drawer |
| Mark notification read | Decrement badge count immediately | Revert count, show error toast |
| Mark all read | Set badge count to 0, hide badge | Revert to previous count, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `Header` | `src/components/layout/header.tsx` | Needs significant rewrite |
| `Avatar` | `src/components/ui/avatar.tsx` | `image, fallback (initials), size` |
| `DropdownMenu` | `src/components/ui/dropdown-menu.tsx` | shadcn dropdown for user menu |
| `Badge` | `src/components/ui/badge.tsx` | For notification count |
| `Button` | `src/components/ui/button.tsx` | Icon buttons for search, bell |
| `Separator` | `src/components/ui/separator.tsx` | Dividers in dropdown menu |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| `Header` | Basic with logo + avatar | Complete rewrite: breadcrumbs, search, bell, user menu |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `HeaderBar` | Main header container with responsive layout | Medium |
| `Breadcrumbs` | Auto-generated breadcrumb trail from route config | Medium |
| `BreadcrumbSegment` | Individual clickable breadcrumb with separator | Small |
| `SearchTrigger` | Icon button + "Search..." text that opens Command Palette | Small |
| `NotificationBell` | Bell icon with animated badge count | Small |
| `UserMenu` | Avatar + chevron that opens dropdown with profile/settings/logout | Medium |
| `UserMenuDropdown` | Dropdown content with user info, links, theme toggle, logout | Medium |
| `ThemeToggle` | Dark/light mode switch within user menu | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Dropdown Menu | `dropdown-menu` | User menu dropdown |
| Avatar | `avatar` | User avatar with initials fallback |
| Badge | `badge` | Notification count |
| Breadcrumb | `breadcrumb` | Navigation trail (shadcn has a breadcrumb component) |
| Separator | `separator` | Dropdown section dividers |
| Switch | `switch` | Dark mode toggle |
| Button | `button` | Icon buttons (search, bell, hamburger) |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | `/api/notifications/unread-count` | Get current unread notification count | `useUnreadCount()` |
| 2 | GET | `/api/user/me` | Get current user profile (name, email, role, avatar) | `useCurrentUser()` |
| 3 | GET | `/api/breadcrumbs/resolve` | Resolve entity IDs in breadcrumbs to display names | `useBreadcrumbResolve(path)` |

### Request/Response Examples

**GET /api/notifications/unread-count**
```json
{
  "count": 3,
  "byCategory": {
    "operations": 2,
    "sales": 0,
    "compliance": 1,
    "system": 0
  }
}
```

**GET /api/breadcrumbs/resolve?path=/loads/abc-123**
```json
{
  "segments": [
    { "label": "Home", "href": "/dashboard" },
    { "label": "Operations", "href": "/loads" },
    { "label": "Loads", "href": "/loads" },
    { "label": "L-2025-4521", "href": "/loads/abc-123" }
  ]
}
```

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| `notifications:{userId}` | `notification.new` | `useNotificationStream()` -- increments badge, triggers bell animation |
| `notifications:{userId}` | `notification.read` | Decrements badge count |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/notifications/unread-count | Hide badge | Redirect to login | Hide badge | Hide badge | Hide badge (silent fail) |
| GET /api/user/me | Show cached data | Redirect to login | Show cached data | Show cached data | Show cached data or initials fallback |
| GET /api/breadcrumbs/resolve | Show raw path segments | N/A | N/A | Show raw path segments | Show raw path segments |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Header renders immediately with fixed structure. User avatar shows skeleton circle (32px gray). Breadcrumbs show skeleton bars. Search and bell icons render immediately (static elements). Badge shows nothing until count loads.
- **Progressive loading:** Header chrome (background, borders, spacing) renders from static CSS instantly. Dynamic data (user name, avatar, badge count, breadcrumbs) fills in asynchronously.
- **Duration threshold:** Not applicable -- header should render structural elements in < 50ms from cache.

### Empty States

**No notifications (badge count = 0):**
- Bell icon renders without any badge overlay
- Bell icon is still clickable (opens empty notification drawer)

**No breadcrumbs (root page):**
- Show only "Dashboard" as a single non-clickable breadcrumb
- Or show "Home" as single breadcrumb

**New user (no avatar):**
- Show initials avatar on colored background (consistent with user's initials hash)

### Error States

**Notification count API fails:**
- **Display:** Hide badge entirely. Bell icon remains clickable. Silent retry in 30 seconds.

**User profile API fails:**
- **Display:** Show initials avatar from cached JWT claims (firstName, lastName from token). User menu dropdown shows cached name/email.

**Breadcrumb resolution fails:**
- **Display:** Show raw URL path segments with title-cased labels (e.g., "/loads/abc-123" becomes "Loads > abc-123" instead of "Loads > L-2025-4521").

### Permission Denied

- Not applicable for the header itself (all authenticated users see the header)
- Admin-only items in user menu dropdown are conditionally rendered based on role

### Offline / Degraded

- **Full offline:** Header renders from cached data (last known user info, last known badge count with "(cached)" label). Search trigger still opens Command Palette but search results may fail. Bell still opens notification drawer with cached notifications.
- **Degraded (WebSocket down):** Badge count updates via polling fallback (30s). No bell shake animation on new notifications.

---

## 12. Filters, Search & Sort

### Search

The header itself does not contain a search field. The search icon/trigger opens the Command Palette (documented in `05-command-palette.md`), which provides full search functionality.

### Breadcrumb Filtering

- Not applicable -- breadcrumbs are path-derived, not filterable

### Sort Options

- Not applicable for the header bar

### Saved Filters / Presets

- Not applicable for the header bar

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Header remains full width at 64px height
- Breadcrumbs: show full trail if it fits; collapse middle segments to "..." dropdown if too long
- Search trigger: show icon only (hide "Search..." text)
- Bell and avatar: same as desktop
- No hamburger icon (sidebar is collapsed to 64px but still visible)

### Mobile (< 768px)

- Header remains full width at 56px height (slightly shorter)
- Left side: Hamburger menu icon (3 horizontal lines) replaces sidebar
- Breadcrumbs: show only current page name (e.g., "L-2025-4521"), no trail
- Tapping current page name shows full breadcrumb trail in a dropdown
- Search trigger: icon only
- Bell: same, with badge
- Avatar: 28px size, dropdown opens as bottom sheet on mobile instead of dropdown

### Breakpoint Reference

| Breakpoint | Width | Header Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout: hamburger hidden, full breadcrumbs, search with text |
| Desktop | 1024px - 1439px | Same as XL |
| Tablet | 768px - 1023px | Breadcrumbs may truncate, search icon-only |
| Mobile | < 768px | Hamburger visible, breadcrumbs = current page only, 56px height |

---

## 14. Stitch Prompt

```
Design a header bar for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width horizontal bar, 64px tall, fixed at the top of the content area (to the right of a 240px dark sidebar). White background (#FFFFFF) with a subtle bottom border (gray-200).

Left Section (breadcrumbs):
- Show a breadcrumb trail: "Home" (gray-400 link) > "Operations" (gray-400 link) > "Loads" (gray-400 link) > "L-2025-4521" (gray-900 bold, current page).
- Breadcrumb separators are "/" or ">" characters in gray-300.
- Each segment except the last is a clickable link (blue-600 on hover).
- First segment "Home" has a small Home icon (16px) before the text.

Right Section (actions, right-aligned with 16px gaps):
1. Search trigger: A rounded-lg button with a magnifying glass icon (gray-400) and "Search..." text in gray-400, and a small "Ctrl+K" keyboard shortcut badge (gray-200 bg, gray-500 text, rounded, 11px font) to the right. The button has a border-gray-200 outline and hover:border-gray-300.

2. Notification bell: A 36px icon button with a Bell icon in gray-500. In the top-right corner of the button, overlapping the icon, show a red notification badge circle (18px diameter, red-500 background) with white "3" text (11px bold). The bell icon should appear interactive.

3. User avatar dropdown: A 32px circle avatar showing initials "MR" on a blue-600 background with white text. Next to the avatar, a small ChevronDown icon (12px, gray-400). On click, this opens a dropdown menu.

User Menu Dropdown (shown below the avatar):
- 240px wide, white background, rounded-lg, shadow-lg, border gray-200.
- Top section: "Maria Rodriguez" (14px semibold), "maria@ultrafreight.com" (12px gray-500), "Dispatcher" role badge (12px, blue-100 bg, blue-700 text, rounded-full).
- Separator line.
- Menu items with icons: "My Profile" (User icon), "Settings" (Settings icon, only for admin), "Dark Mode" (Moon icon) with a toggle switch on the right side.
- Separator line.
- "Help & Support" (HelpCircle icon), "Keyboard Shortcuts" (Keyboard icon) with "?" shortcut hint on the right.
- Separator line.
- "Log Out" (LogOut icon) in red-600 text.

Design Specifications:
- Font: Inter, 14px for breadcrumbs and menu items, 12px for secondary text
- Header background: white (#FFFFFF)
- Bottom border: 1px solid gray-200 (#e5e7eb)
- Breadcrumb links: gray-500 default, gray-900 for current page, blue-600 on hover
- Icon buttons: gray-500 icons, gray-100 hover background, rounded-md
- Notification badge: red-500 background, white text, 11px bold
- Avatar: blue-600 background with white initials, or user photo
- Dropdown: white background, shadow-lg, rounded-lg, gray-200 border
- Dropdown items: 14px, gray-700, hover:bg-gray-50, padding 8px 12px
- Logout text: red-600 color
- Modern SaaS aesthetic similar to Linear.app or Notion header
- Clean, minimal, professional

Include: Breadcrumb trail, search trigger with keyboard shortcut hint, notification bell with badge, user avatar with open dropdown showing all menu items.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- [x] Basic header component renders at top of dashboard layout
- [x] User avatar with basic dropdown (profile + logout only)
- [x] Fixed 64px height

**What needs polish / bug fixes:**
- [ ] No breadcrumbs -- user has no wayfinding context
- [ ] No search trigger -- users must navigate sidebar to find things
- [ ] No notification bell -- users have no persistent alert visibility
- [ ] User menu dropdown is minimal (only profile and logout)
- [ ] No dark mode toggle
- [ ] No keyboard shortcut integration
- [ ] No mobile hamburger menu
- [ ] Header does not adapt for responsive breakpoints

**What to add this wave:**
- [ ] Implement auto-generated breadcrumbs from route config
- [ ] Add breadcrumb entity resolution (show "L-2025-4521" instead of raw ID)
- [ ] Build search trigger button with Ctrl+K shortcut hint
- [ ] Implement notification bell with real-time unread count badge
- [ ] Build full user menu dropdown (profile, settings, theme toggle, help, shortcuts, logout)
- [ ] Add dark mode toggle with localStorage persistence
- [ ] Add mobile hamburger menu trigger
- [ ] Add bell shake animation on new notification via WebSocket
- [ ] Add responsive breadcrumb truncation

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Breadcrumb navigation | High | Medium | P0 |
| Notification bell with badge | High | Medium | P0 |
| Search trigger (Cmd+K) | High | Low | P0 |
| User menu with logout | High | Low | P0 |
| Mobile hamburger trigger | High | Low | P0 |
| Dark mode toggle | Medium | Low | P1 |
| Breadcrumb entity resolution | Medium | Medium | P1 |
| Bell shake animation | Low | Low | P1 |
| Keyboard shortcuts link | Low | Low | P1 |
| Help & Support link | Low | Low | P2 |
| Language selector | Low | Medium | P2 (future i18n) |
| Online/away status indicator | Low | High | P2 (future presence) |

### Future Wave Preview

- **Wave 2:** Breadcrumb entity resolution (show load numbers, customer names instead of IDs), global environment indicator (staging/production badge)
- **Wave 3:** Customizable header layout, pinned action buttons per user, multi-language support
- **Wave 4:** AI search suggestions in search trigger, smart notification grouping in badge tooltip
- **Wave 5:** Presence indicators (online/away/busy), team activity pulse indicator

---

*This document was created as part of the Wave 1 design process for Ultra TMS Dashboard Shell service (01.1).*

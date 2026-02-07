# Notification Center

> Service: Dashboard Shell (01.1) | Wave: 1 | Priority: P1
> Route: /(dashboard)/notifications (also accessible as drawer overlay from any page) | Status: **Not Started** | Type: List / Drawer
> Primary Personas: Maria (Dispatcher), James (Sales), Sarah (Ops Manager), Emily (AR Specialist)
> Roles with Access: All authenticated internal roles

---

## 1. Purpose & Business Context

**What this screen does:**
The Notification Center is a slide-out drawer (from the right side of the screen) and optionally a full-page view that displays all notifications for the current user. Notifications are grouped by time period (Today, Yesterday, This Week, Older), categorized by type (Operations, Sales, Compliance, Accounting, System), and support filtering, bulk actions (mark all read), and click-through to the referenced entity. Each notification shows a type icon, title, description, timestamp, and optional action button.

**Business problem it solves:**
A TMS generates dozens of events per hour per user: load status changes, carrier assignments, quote acceptances, payment receipts, compliance alerts, exception escalations. Without a centralized notification system, users either miss critical events (leading to late deliveries, missed payments) or are overwhelmed by email notifications that pile up in their inbox. The Notification Center provides a single, organized, filterable stream of events with clear read/unread states, so users can quickly scan for what matters and dismiss the noise.

**Key business rules:**
- Notifications are generated server-side based on event rules and user subscription preferences
- Each notification belongs to exactly one category (operations, sales, compliance, accounting, system)
- Notifications have three severity levels: info (blue), warning (yellow), critical (red)
- Critical notifications trigger additional channels (toast, push, email) based on escalation rules
- Notifications are immutable once created -- they can only be marked as read or deleted
- "Mark all as read" marks all currently visible notifications (respecting active filters)
- Notifications older than 90 days are automatically archived and no longer appear in the center
- The drawer mode (triggered from bell icon) shows a condensed view; the full page shows more detail
- Maximum 100 notifications loaded per page; "Load More" for pagination
- Notification preferences (which events trigger notifications) are configured in user settings, not here

**Success metric:**
Average time from notification arrival to user acknowledgment under 10 minutes for critical alerts. 95% of critical notifications are read within 30 minutes. Users report notification fatigue as "low" (satisfaction survey).

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Any page (header) | Click bell icon in header bar | None (drawer opens as overlay) |
| Any page (toast) | Click "View" action on toast notification | `notificationId` (scrolls to that notification) |
| Sidebar navigation | Click "Notifications" if added to sidebar | None (full page view) |
| Command Palette | Type "notifications" | None (navigates to full page) |
| Email notification | Click "View in app" link in email | `notificationId` (deep link) |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Load Detail | Click "Load L-2025-4521 is at risk" notification | `loadId` |
| Quote Detail | Click "Quote Q-891 accepted" notification | `quoteId` |
| Invoice Detail | Click "Invoice INV-2025-0412 overdue" notification | `invoiceId` |
| Carrier Detail | Click "Carrier insurance expiring" notification | `carrierId` |
| Order Detail | Click "New order received" notification | `orderId` |
| Notification Settings | Click "Manage Preferences" link at bottom of drawer | None |
| Previous page | Close drawer (click X, click outside, press Escape) | None |

**Primary trigger:**
Maria (Dispatcher) sees the red badge "3" on the bell icon and clicks to check overnight alerts. She scans the notifications, clicks the critical "Load at risk" notification to jump to the load detail, resolves the issue, then returns and marks the rest as read.

**Success criteria (user completes the screen when):**
- User has reviewed all unread notifications and taken action on critical ones
- User has marked read notifications or cleared the unread badge

---

## 3. Layout Blueprint

### Drawer Mode (Triggered from Header Bell)

```
+----------------------------------------------+-------------------+
|  Main App Content (dimmed overlay)            | NOTIFICATION      |
|                                               | DRAWER (400px)    |
|                                               |                   |
|                                               | Notifications [X] |
|                                               |                   |
|                                               | [All] [Ops] [Sal] |
|                                               | [Acct] [Comp] [Sys]|
|                                               |                   |
|                                               | [Mark all read]   |
|                                               | ================= |
|                                               |                   |
|                                               | TODAY              |
|                                               | ---------------   |
|                                               | ! Load L-4521     |
|                                               |   at risk: ETA    |
|                                               |   slipped 3hrs    |
|                                               |   2 min ago  [>]  |
|                                               | ---------------   |
|                                               | i Quote Q-891     |
|                                               |   accepted by     |
|                                               |   Acme Mfg        |
|                                               |   15 min ago [>]  |
|                                               | ---------------   |
|                                               | $ Payment $4,200  |
|                                               |   received from   |
|                                               |   Global Foods    |
|                                               |   1 hour ago [>]  |
|                                               |                   |
|                                               | YESTERDAY          |
|                                               | ---------------   |
|                                               | i Carrier Swift    |
|                                               |   assigned to     |
|                                               |   load L-4520     |
|                                               |   Yesterday 4PM   |
|                                               | ---------------   |
|                                               | ...more items...  |
|                                               |                   |
|                                               | [Load More]       |
|                                               | ================= |
|                                               | [Manage Prefs]    |
+----------------------------------------------+-------------------+
```

### Full Page Mode (/(dashboard)/notifications)

```
+------------------------------------------------------------------+
|  HEADER BAR                                                       |
|  Dashboard > Notifications                                        |
+------------------------------------------------------------------+
|          |                                                        |
|  SIDEBAR |  PAGE HEADER                                           |
|          |  "Notifications"            [Mark All Read] [Settings] |
|          |                                                        |
|          |  FILTER TABS                                           |
|          |  [All (47)] [Operations (12)] [Sales (8)]              |
|          |  [Accounting (15)] [Compliance (5)] [System (7)]       |
|          |                                                        |
|          |  SEVERITY FILTER (optional)                            |
|          |  [All] [Critical] [Warning] [Info]                     |
|          |                                                        |
|          |  TODAY                                                 |
|          |  +----------------------------------------------+      |
|          |  | !  Load L-2025-4521 at risk                  |      |
|          |  |    ETA slipped by 3 hours. Driver reports...  |      |
|          |  |    2 min ago                    [View Load]  |      |
|          |  +----------------------------------------------+      |
|          |  +----------------------------------------------+      |
|          |  | i  Quote Q-891 accepted by Acme Mfg          |      |
|          |  |    Customer accepted $2,450 rate for CHI>DAL  |      |
|          |  |    15 min ago                   [View Quote] |      |
|          |  +----------------------------------------------+      |
|          |  +----------------------------------------------+      |
|          |  | $  Payment of $4,200 received from Global... |      |
|          |  |    Applied to Invoice INV-2025-0412           |      |
|          |  |    1 hour ago                [View Invoice]  |      |
|          |  +----------------------------------------------+      |
|          |                                                        |
|          |  YESTERDAY                                             |
|          |  +----------------------------------------------+      |
|          |  | i  Carrier Swift Transport assigned to L-4520|      |
|          |  |    Rate confirmed at $1,875.50                |      |
|          |  |    Yesterday at 4:32 PM      [View Load]    |      |
|          |  +----------------------------------------------+      |
|          |                                                        |
|          |  [Load More Notifications]                             |
+------------------------------------------------------------------+
```

### Individual Notification Item

```
+------------------------------------------------------------+
| [Icon]  TITLE TEXT (14px semibold)              [timestamp] |
|         Description text (13px gray-500,                    |
|         max 2 lines with ellipsis)                          |
|                                          [Action Button]    |
+------------------------------------------------------------+
  ^         ^                                    ^
  |         |                                    |
  Type      Unread items have                    Optional CTA
  icon      left blue-600 border                 "View Load"
  colored   + bolder text                        "View Quote"
  by                                             etc.
  severity
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Notification title, severity icon, unread indicator | Users scan titles and severity to decide which notifications matter |
| **Secondary** (visible, less prominent) | Description text, timestamp, category filter tabs | Context for each notification; filter to reduce noise |
| **Tertiary** (available on interaction) | Action button ("View Load"), mark as read | Available for those who want to take action |
| **Hidden** (behind scroll/pagination) | Older notifications, "Load More" | Historical notifications accessible but not competing for attention |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location |
|---|---|---|---|---|
| 1 | Type Icon | Notification.category | Colored icon: truck (ops), dollar (accounting), shield (compliance), trending-up (sales), bell (system) | Left side of each item |
| 2 | Title | Notification.title | 14px semibold, gray-900 (unread) or gray-600 (read) | Top of notification item |
| 3 | Description | Notification.body | 13px gray-500, max 2 lines, overflow ellipsis | Below title |
| 4 | Timestamp | Notification.createdAt | Relative: "2 min ago", "1 hour ago", "Yesterday 4:32 PM" | Top-right corner of item |
| 5 | Severity Indicator | Notification.severity | Left border: red-500 (critical), yellow-500 (warning), blue-500 (info) | Left edge of notification item |
| 6 | Unread Dot | Notification.readAt === null | 8px blue-600 filled circle | Left side, before icon |
| 7 | Action Button | Notification.actionUrl | "View Load", "View Quote", etc. -- secondary button, small | Bottom-right of item |
| 8 | Category Tab Count | Aggregated count per category | Number in parentheses: "Operations (12)" | Filter tab labels |
| 9 | Time Group Header | Derived from createdAt | "Today", "Yesterday", "This Week", "Older" | Section divider text |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Relative Timestamp | createdAt vs. now(): < 1 min = "Just now", < 60 min = "X min ago", < 24h = "X hours ago", yesterday = "Yesterday at H:MM AM/PM", older = "Feb 4 at 2:30 PM" | Text string |
| 2 | Time Group | Group notifications by date: today, yesterday, this week (Sun-Sat), older | Section header string |
| 3 | Action Label | Derived from notification entity type: load -> "View Load", quote -> "View Quote", invoice -> "View Invoice" | Button label |
| 4 | Category Counts | Count of unread notifications per category | Integer for tab badge |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Drawer mode: slide-out from right (400px) triggered by header bell click
- [ ] Full page mode: dedicated page at `/(dashboard)/notifications`
- [ ] Notification list sorted by createdAt descending (newest first)
- [ ] Time-based grouping: Today, Yesterday, This Week, Older
- [ ] Category filter tabs: All, Operations, Sales, Accounting, Compliance, System
- [ ] Unread/read visual distinction (blue dot + bold title for unread, muted for read)
- [ ] Severity indicator (colored left border: red/yellow/blue)
- [ ] Click notification to navigate to referenced entity
- [ ] Mark individual notification as read (click, or dedicated button)
- [ ] Mark all as read button (marks all visible/filtered notifications)
- [ ] Pagination: "Load More" at bottom of list (100 items per page)
- [ ] Close drawer: X button, click overlay, Escape key
- [ ] Auto-mark as read when notification is clicked (navigates to entity)

### Advanced Features (Enhancement Recommendations)

- [ ] **Severity filter** -- Filter by Critical, Warning, Info severity levels
- [ ] **Swipe to dismiss** (mobile) -- Swipe left on notification to mark as read or delete
- [ ] **Notification actions inline** -- e.g., "Assign Carrier" button directly on a load-at-risk notification
- [ ] **Notification grouping** -- Batch similar notifications: "5 loads delivered in the last hour" instead of 5 individual notifications
- [ ] **Sound alerts** for critical notifications (configurable in user preferences)
- [ ] **Do Not Disturb mode** -- Suppress all non-critical notifications for a time period
- [ ] **Notification search** -- Search within notifications by keyword
- [ ] **Pin important notifications** -- Pin a notification to keep it at the top
- [ ] **Snooze notification** -- Snooze and resurface a notification in 1 hour, 4 hours, or tomorrow
- [ ] **Read receipt tracking** -- Record when and from which device a notification was read
- [ ] **Bulk select and mark read** -- Select multiple notifications and mark read together

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Operations notifications | dispatcher, ops_manager, admin | `operations_view` | Category tab hidden, notifications filtered out |
| Sales notifications | sales_agent, sales_manager, admin | `sales_view` | Category tab hidden |
| Accounting notifications | accounting_clerk, accounting_manager, admin | `accounting_view` | Category tab hidden |
| Compliance notifications | carrier_manager, ops_manager, admin | `carrier_view` | Category tab hidden |
| System notifications | admin, super_admin | `system_admin` | Category tab hidden |
| "Manage Preferences" link | All roles | `notification_prefs` | Link visible for all authenticated users |

---

## 6. Status & State Machine

### Notification States

```
[Created] ---(delivered to user's feed)---> [Unread]
                                                |
                  +-----------------------------+
                  |                             |
    (click notification)              (mark as read button)
                  |                             |
                  v                             v
              [Read] <--------------------------+
                  |
        (90 days elapse)
                  |
                  v
            [Archived / Removed from feed]
```

### Drawer States

```
[Closed] ---(click bell icon)---> [Open / Loading]
                                        |
                                  (data loads)
                                        |
                                        v
                                  [Open / Loaded]
                                        |
                          +-------------+-------------+
                          |             |             |
                    (click X)    (click overlay) (press Escape)
                          |             |             |
                          v             v             v
                        [Closed] <--------------------+
```

### Notification Item Visual States

| State | Left Border | Title Font | Background | Unread Dot |
|---|---|---|---|---|
| Unread + Critical | 3px red-500 | Semibold, gray-900 | white | Blue-600 dot visible |
| Unread + Warning | 3px yellow-500 | Semibold, gray-900 | white | Blue-600 dot visible |
| Unread + Info | 3px blue-500 | Semibold, gray-900 | white | Blue-600 dot visible |
| Read + Critical | 3px red-200 | Normal, gray-500 | gray-50 | No dot |
| Read + Warning | 3px yellow-200 | Normal, gray-500 | gray-50 | No dot |
| Read + Info | 3px blue-200 | Normal, gray-500 | gray-50 | No dot |
| Hover (any) | Same | Same | blue-50 (hover highlight) | Same |

---

## 7. Actions & Interactions

### Primary Actions

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Mark All Read | CheckCheck | Secondary / Outline | Marks all notifications in current filter as read | No |
| Manage Preferences | Settings | Ghost / Link | Navigates to notification settings page | No |

### Per-Notification Actions

| Action | Trigger | Result |
|---|---|---|
| Click notification body | Click anywhere on the notification row | Navigate to referenced entity (load, quote, invoice, etc.) + mark as read |
| Click action button | Click "View Load" / "View Quote" etc. | Navigate to entity + mark as read |
| Mark as read | Hover reveals small "check" icon button | Marks single notification as read, removes unread dot |
| Delete / Dismiss | Hover reveals small "X" icon button | Removes notification from list (soft delete) |
| Swipe left (mobile) | Swipe gesture on notification row | Reveals "Mark Read" and "Delete" action buttons |

### Filter Actions

| Element | Action | Result |
|---|---|---|
| Category tab (e.g., "Operations") | Click tab | Filter list to show only that category's notifications |
| "All" tab | Click tab | Remove category filter, show all notifications |
| Severity filter (if implemented) | Click severity level | Filter by critical/warning/info severity |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Escape` | Close notification drawer |
| `Arrow Up/Down` | Navigate between notifications in the list |
| `Enter` | Click/open the focused notification |
| `M` | Mark focused notification as read |
| `Shift + M` | Mark all as read |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop in notification center |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| `notification.new` | `{ id, type, category, severity, title, body, actionUrl, createdAt }` | Prepend new notification to top of list, increment category count, show unread dot. If drawer is closed, increment bell badge. If drawer is open, animate the new notification sliding in from top. |
| `notification.read` | `{ id }` | Update specific notification to read state, decrement category unread count |
| `notification.bulk_read` | `{ ids: [], count }` | Update all specified notifications to read state, update counts |

### Live Update Behavior

- **Update frequency:** WebSocket push for all notification events (immediate)
- **Visual indicator:** New notifications slide into the top of the list with a subtle fade-in animation (300ms). If the drawer is open, a brief blue highlight flashes on the new item.
- **Conflict handling:** Server is authoritative. If user marks as read in one tab, the other tab updates via WebSocket sync.

### Polling Fallback

- **When:** WebSocket connection unavailable
- **Interval:** Every 15 seconds for the notification list (when drawer is open), every 30 seconds for badge count only (when drawer is closed)
- **Endpoint:** `GET /api/notifications?since={lastReceivedAt}&limit=20`
- **Visual indicator:** None (silent background polling)

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Mark as read | Immediately change visual to read state, decrement badge count | Revert to unread state, revert badge count, show toast "Failed to mark as read" |
| Mark all read | Immediately set all visible to read state, set badge to 0 | Revert all to previous state, show toast "Failed to mark all as read" |
| Delete notification | Immediately remove from list with slide-out animation | Re-insert at previous position, show toast "Failed to delete notification" |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `Sheet` | `src/components/ui/sheet.tsx` | shadcn Sheet for drawer implementation (side="right") |
| `ScrollArea` | `src/components/ui/scroll-area.tsx` | Scrollable notification list |
| `Badge` | `src/components/ui/badge.tsx` | Category count badges on tabs |
| `Button` | `src/components/ui/button.tsx` | Action buttons, mark read, CTA |
| `Tabs` | `src/components/ui/tabs.tsx` | Category filter tabs |
| `Separator` | `src/components/ui/separator.tsx` | Dividers between time groups |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| None existing | N/A | All notification center components are new |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `NotificationCenter` | Container component managing drawer and full-page modes | Large |
| `NotificationDrawer` | Sheet-based right drawer with notification list and filters | Medium |
| `NotificationList` | Scrollable, grouped, paginated list of notification items | Medium |
| `NotificationItem` | Individual notification row with icon, title, desc, time, actions | Medium |
| `NotificationCategoryTabs` | Tabbed filter for notification categories with counts | Small |
| `NotificationTimeGroup` | Time group header ("Today", "Yesterday", etc.) | Small |
| `NotificationEmptyState` | Empty illustration when no notifications match filters | Small |
| `NotificationSkeleton` | Loading skeleton matching notification item dimensions | Small |
| `MarkAllReadButton` | Button with confirmation behavior for marking all read | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Sheet | `sheet` | Drawer container (side="right", 400px width) |
| Scroll Area | `scroll-area` | Scrollable notification list with custom scrollbar |
| Tabs | `tabs` | Category filter tabs |
| Badge | `badge` | Category count indicators |
| Button | `button` | Mark read, action buttons, load more |
| Separator | `separator` | Time group dividers |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | `/api/notifications` | Fetch paginated notification list with filters | `useNotifications(filters)` |
| 2 | GET | `/api/notifications/unread-count` | Get total unread count and per-category counts | `useUnreadCount()` |
| 3 | PATCH | `/api/notifications/:id/read` | Mark a single notification as read | `useMarkRead()` |
| 4 | PATCH | `/api/notifications/mark-all-read` | Mark all notifications (in current filter) as read | `useMarkAllRead()` |
| 5 | DELETE | `/api/notifications/:id` | Soft-delete a notification | `useDeleteNotification()` |
| 6 | GET | `/api/notifications/preferences` | Get user's notification preferences | `useNotificationPreferences()` |

### Request/Response Examples

**GET /api/notifications?category=operations&status=unread&limit=20&offset=0**
```json
{
  "notifications": [
    {
      "id": "ntf-001",
      "category": "operations",
      "severity": "critical",
      "title": "Load L-2025-4521 at risk",
      "body": "ETA slipped by 3 hours. Driver reports heavy traffic on I-80. Original ETA was 2:00 PM, revised to 5:00 PM.",
      "entityType": "load",
      "entityId": "load-abc-123",
      "actionUrl": "/loads/load-abc-123",
      "actionLabel": "View Load",
      "readAt": null,
      "createdAt": "2026-02-06T14:28:00Z"
    },
    {
      "id": "ntf-002",
      "category": "operations",
      "severity": "info",
      "title": "Carrier Swift Transport assigned to L-4520",
      "body": "Rate confirmed at $1,875.50. Pickup scheduled for tomorrow 8:00 AM.",
      "entityType": "load",
      "entityId": "load-def-456",
      "actionUrl": "/loads/load-def-456",
      "actionLabel": "View Load",
      "readAt": null,
      "createdAt": "2026-02-06T14:15:00Z"
    }
  ],
  "total": 47,
  "unreadCount": 12,
  "hasMore": true
}
```

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| `notifications:{userId}` | `notification.new` | `useNotificationStream()` -- prepends to list, updates counts |
| `notifications:{userId}` | `notification.read` | Updates read state in cache |
| `notifications:{userId}` | `notification.deleted` | Removes from list cache |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/notifications | Show error state in list | Redirect to login | Show empty list | Show empty list | Show "Unable to load notifications" with retry |
| PATCH /api/notifications/:id/read | Toast "Invalid request" | Redirect to login | Toast "Permission denied" | Toast "Notification not found" | Toast "Failed to mark as read" + rollback |
| PATCH /api/notifications/mark-all-read | Toast "Invalid request" | Redirect to login | Toast "Permission denied" | N/A | Toast "Failed to mark all as read" + rollback |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show 6 notification item skeletons: each is a row with a circle skeleton (icon), two bar skeletons (title + description), and a small bar skeleton (timestamp). Skeleton items match exact notification item dimensions.
- **Progressive loading:** Category tabs render immediately with "..." for counts. Notification list shows skeleton. Counts and items populate as API responds.
- **Duration threshold:** If loading exceeds 3 seconds, show "Loading notifications..." text in the center of the drawer.

### Empty States

**No notifications at all (new user):**
- **Illustration:** Bell icon with sparkles
- **Headline:** "No notifications yet"
- **Description:** "You'll see alerts about loads, quotes, payments, and system events here."
- **CTA:** None (informational only)

**No notifications matching filter:**
- **Illustration:** Filter icon
- **Headline:** "No notifications in this category"
- **Description:** "Try selecting a different category or check back later."
- **CTA:** "Show All Notifications" button (clears filter)

**All notifications read:**
- Show the list normally (read items are visible with muted styling)
- Bell badge in header disappears (count = 0)

### Error States

**Full drawer error (API fails):**
- **Display:** Error icon + "Unable to load notifications" + "Please try again." + Retry button centered in the drawer area.

**Partial error (mark read fails):**
- **Display:** Toast: "Failed to mark notification as read. Please try again." Notification reverts to unread state.

### Permission Denied

- Not applicable at the page level (all users can view notifications)
- Category-level: if user does not have permission for a category (e.g., accounting), those notifications are never generated for them, so the category tab is hidden

### Offline / Degraded

- **Full offline:** Show cached notifications from last successful fetch. "Mark as read" actions are queued and synced when connection restores. Banner: "You're offline. Showing cached notifications."
- **Degraded (WebSocket down):** New notifications arrive via polling fallback (15-second interval when drawer is open).

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Category | Tab selector | All, Operations, Sales, Accounting, Compliance, System | All | `?category=operations` |
| 2 | Read Status | Toggle/select | All, Unread Only, Read Only | All | `?status=unread` |
| 3 | Severity | Toggle/select (future) | All, Critical, Warning, Info | All | `?severity=critical` |

### Search Behavior

- **Search field:** Not included in MVP. Future enhancement: text search across notification titles and descriptions.
- **When implemented:** Debounced 300ms, minimum 2 characters, highlights matching text.

### Sort Options

- Fixed: always sorted by `createdAt` descending (newest first)
- No user-controllable sort (notifications are inherently time-ordered)

### Saved Filters / Presets

- Not applicable for notifications in MVP
- Future: user could save a "Critical Operations Only" filter preset

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Drawer width reduces to 360px
- Notification items: same layout but description may truncate sooner
- Category tabs: may wrap to 2 rows if too many categories
- Touch targets: ensure 44px minimum height for notification items

### Mobile (< 768px)

- Notification center opens as a **full-screen overlay** (not a partial drawer)
- Slides up from bottom or in from right (full viewport width)
- Close button prominent in top-left corner
- Category tabs: horizontal scroll if too many
- Notification items: larger touch targets (56px minimum height)
- Swipe left on item to reveal mark-read / delete actions
- Pull-to-refresh at top of list
- Action buttons ("View Load") are larger (full width at bottom of notification item)

### Breakpoint Reference

| Breakpoint | Width | Notification Center Behavior |
|---|---|---|
| Desktop XL | 1440px+ | 400px right-side drawer |
| Desktop | 1024px - 1439px | 400px right-side drawer |
| Tablet | 768px - 1023px | 360px right-side drawer |
| Mobile | < 768px | Full-screen overlay |

---

## 14. Stitch Prompt

```
Design a notification center drawer for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Show the main application in the background (slightly dimmed with a semi-transparent dark overlay). On the right side, a 400px-wide white drawer slides in from the right edge. The drawer has a white background, shadow-xl, and is the full height of the viewport.

Drawer Header (64px):
- "Notifications" title in 18px semibold gray-900 text on the left
- "X" close button icon (gray-400, 20px) on the far right
- Below the title, a row of filter tabs (scrollable if needed): "All (47)" (active tab, blue-600 text with blue-600 bottom border), "Operations (12)", "Sales (8)", "Accounting (15)", "Compliance (5)", "System (7)". Inactive tabs are gray-500 text.
- Below the tabs, a "Mark all as read" text button in blue-600, right-aligned.

Notification List (scrollable area):

Group header: "TODAY" in 11px uppercase bold gray-400 tracking-wide, with a gray-200 line extending to the right.

Notification 1 (UNREAD, CRITICAL):
- Left: 3px red-500 left border. Small blue-600 unread dot (8px). Red alert-triangle icon (20px).
- Content: Title "Load L-2025-4521 at risk" in 14px semibold gray-900. Description "ETA slipped by 3 hours. Driver reports heavy traffic on I-80." in 13px gray-500, 2 lines max.
- Right side: "2 min ago" in 12px gray-400. Below timestamp: "View Load" small blue-600 text button.
- Background: white, hover:bg-blue-50.

Notification 2 (UNREAD, INFO):
- Left: 3px blue-500 left border. Blue-600 unread dot. Blue check-circle icon (20px).
- Title: "Quote Q-891 accepted by Acme Manufacturing" in 14px semibold gray-900.
- Description: "Customer accepted $2,450 rate for Chicago to Dallas lane." in 13px gray-500.
- "15 min ago". "View Quote" button.

Notification 3 (UNREAD, INFO):
- Left: 3px blue-500 left border. Unread dot. Green dollar-sign icon.
- Title: "Payment of $4,200 received" in semibold.
- Description: "Applied to Invoice INV-2025-0412 from Global Foods Inc."
- "1 hour ago". "View Invoice" button.

Group header: "YESTERDAY"

Notification 4 (READ):
- Left: 3px blue-200 left border. No unread dot. Gray truck icon.
- Title: "Carrier Swift Transport assigned to L-4520" in 14px normal gray-500 (muted).
- Description: "Rate confirmed at $1,875.50. Pickup tomorrow at 8:00 AM." in 13px gray-400.
- "Yesterday at 4:32 PM". "View Load" in gray-400 text.
- Background: gray-50 (subtle gray tint for read items).

Notification 5 (READ):
- Same read styling. Yellow shield icon.
- Title: "Carrier insurance expiring in 14 days"
- Description: "ABC Logistics insurance expires Feb 20, 2026. Send renewal reminder."
- "Yesterday at 2:15 PM". "View Carrier" button.

Bottom of drawer:
- "Load More" ghost button centered.
- Thin separator line.
- "Manage notification preferences" link in gray-500 with settings icon.

Design Specifications:
- Drawer width: 400px, white background, shadow-xl on left edge
- Overlay: semi-transparent black (rgba(0,0,0,0.3)) on main content
- Font: Inter, 14px titles, 13px descriptions, 12px timestamps, 11px group headers
- Unread items: white background, semibold title, blue-600 unread dot
- Read items: gray-50 background, normal weight, muted gray-500 text
- Severity borders: red-500 (critical), yellow-500 (warning), blue-500 (info)
- Tabs: gray-500 default, blue-600 active with bottom border
- Hover on notification item: bg-blue-50 transition
- Action buttons: small, text-only, blue-600 color
- Spacing: 12px padding per notification, 8px gap between items
- Scrollbar: custom thin scrollbar (6px, gray-300, rounded)
- Modern SaaS aesthetic similar to Linear.app notification panel

Include: Overlay background, drawer with header, filter tabs, 5 notification items (3 unread including 1 critical, 2 read), time group headers, and footer with preferences link.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- [x] Bell icon exists in header (basic, no functionality)
- [x] Toast notification system (Sonner) for in-app toasts

**What needs polish / bug fixes:**
- [ ] Bell icon has no click handler (does not open any drawer)
- [ ] No notification data model or API endpoints
- [ ] No notification list or drawer component
- [ ] No unread count badge on bell
- [ ] No WebSocket notification delivery
- [ ] No category filtering
- [ ] No mark-as-read functionality

**What to add this wave:**
- [ ] Build notification center drawer (Sheet component, 400px, slides from right)
- [ ] Implement notification list with time-based grouping
- [ ] Build notification item component with severity indicators
- [ ] Implement category filter tabs with counts
- [ ] Connect bell icon to drawer toggle
- [ ] Implement unread count badge on bell
- [ ] Build mark-as-read (individual and bulk) functionality
- [ ] Connect to WebSocket for real-time notification delivery
- [ ] Build full-page notification view at `/(dashboard)/notifications`
- [ ] Implement notification click-through to entity detail pages
- [ ] Add notification API endpoints (list, count, mark-read)

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Notification drawer with list | High | High | P0 |
| Unread badge on bell icon | High | Low | P0 |
| Mark as read (individual + all) | High | Medium | P0 |
| Category filter tabs | Medium | Medium | P0 |
| Click-through to entity | High | Low | P0 |
| WebSocket real-time delivery | High | High | P1 |
| Full page view | Medium | Medium | P1 |
| Time-based grouping | Medium | Low | P1 |
| Severity-based filtering | Medium | Low | P1 |
| Notification empty states | Low | Low | P1 |
| Swipe-to-dismiss (mobile) | Low | Medium | P2 |
| Notification grouping (batch similar) | Medium | High | P2 |
| Snooze notifications | Low | Medium | P2 |
| Sound alerts for critical | Low | Low | P2 |

### Future Wave Preview

- **Wave 2:** Notification grouping (batch similar events), inline actions (assign carrier directly from notification), sound alerts
- **Wave 3:** Notification search, snooze/remind-later, custom notification rules per user
- **Wave 4:** AI-powered notification prioritization, smart batching, predictive alerts ("This load will likely be late based on traffic patterns")
- **Wave 5:** Cross-device sync with mobile push notifications, notification analytics (what gets clicked vs. ignored)

---

*This document was created as part of the Wave 1 design process for Ultra TMS Dashboard Shell service (01.1).*

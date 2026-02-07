# User Detail

> Service: Auth & Admin | Wave: 1 (Enhancement Focus) | Priority: P0
> Route: /(dashboard)/admin/users/[id] | Status: Built
> Primary Personas: Admin
> Roles with Access: Super Admin, Admin

---

## 1. Purpose & Business Context

**What this screen does:**
Displays the complete profile, roles, permissions, activity history, and session information for a single user. Serves as the central hub for all administrative actions on a specific user account.

**Business problem it solves:**
When investigating security incidents, troubleshooting access issues, or managing user lifecycle events, admins need a single comprehensive view of everything about a user -- their permissions, recent activity, active sessions, and account history. Without this, admins must query multiple systems or tables to piece together a user's access footprint.

**Key business rules:**
- Only Super Admin and Admin roles can access user detail pages
- Admins cannot view Super Admin user details unless they themselves are Super Admin
- Sensitive fields (last IP, session tokens) are only visible to Super Admin
- Password history shows dates only, never actual password values
- Impersonation from this screen logs the action with full audit trail
- Changes to user roles take effect immediately (no cache delay)
- Deactivating a user from this screen terminates all active sessions

**Success metric:**
Admin can fully investigate a user's access footprint (roles, permissions, sessions, recent activity) within 30 seconds without navigating away from this page.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| User Management list | Click user row or name link | userId |
| Audit Log | Click user name in log entry | userId |
| Security alerts | Click user link in alert notification | userId |
| Direct URL | Bookmark / shared link | userId in route param |
| Role Management | Click user count link on a role | userId with role context |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| User Management list | Click "Back to Users" breadcrumb | Previous filter state |
| Edit User Modal | Click "Edit" button in header | userId, current user data |
| Role Editor | Click role name link in roles section | roleId |
| Audit Log | Click "View Full Audit Log" link | ?userId= filter |
| Session Detail | Click active session row (future) | sessionId |

**Primary trigger:**
Admin clicks a user row in the User Management table to view their complete profile and manage their account.

**Success criteria (user completes the screen when):**
- Admin has reviewed the user's current access level and permissions
- Admin has investigated recent activity or security concerns
- Admin has taken an administrative action (edit, suspend, reset password, revoke session)

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Admin > Users > John Doe                             |
|  [Edit] [Reset Password] [Suspend] [More ▼]         |
+------------------------------------------------------------------+
|                                                                    |
|  +--LEFT SIDEBAR (320px)--+  +--MAIN CONTENT AREA--------------+ |
|  |                         |  |                                   | |
|  |  [Avatar - 80px]       |  |  [Tabs: Overview | Activity |     | |
|  |  John Doe               |  |   Permissions | Sessions | Stats] | |
|  |  john@ultra.com         |  |                                   | |
|  |  Admin                  |  |  TAB CONTENT:                     | |
|  |  Active (green badge)   |  |                                   | |
|  |                         |  |  Overview Tab:                    | |
|  |  --- Quick Info ---     |  |  - Activity Timeline              | |
|  |  Created: Jan 5, 2026   |  |  - Recent Actions list            | |
|  |  Last Login: 2 min ago  |  |                                   | |
|  |  Login Count: 342       |  |  Permissions Tab:                 | |
|  |  Last IP: 192.168.1.x   |  |  - Effective permissions matrix   | |
|  |                         |  |                                   | |
|  |  --- Roles ---          |  |  Sessions Tab:                    | |
|  |  [Admin badge]          |  |  - Active sessions table          | |
|  |  [+ Add Role]           |  |                                   | |
|  |                         |  |  Stats Tab:                       | |
|  |  --- Security ---       |  |  - User operational statistics    | |
|  |  MFA: Enabled           |  |                                   | |
|  |  Password Changed:      |  +-----------------------------------+ |
|  |  45 days ago            |  |                                   |
|  |  [Force Reset]          |  |                                   |
|  +-------------------------+                                       |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (sidebar, always visible) | Name, email, avatar, role badges, status, last login | Admin needs instant identification and current state |
| **Secondary** (Overview tab) | Activity timeline, recent actions, login history | Most common investigation task is checking recent activity |
| **Tertiary** (Permissions tab) | Effective permissions matrix from all assigned roles | Needed for access troubleshooting and audit |
| **Hidden** (Sessions and Stats tabs) | Active sessions, operational statistics, notification preferences | Deep investigation data, less frequently accessed |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Avatar | User.avatar | 80px circular image or initials with colored background | Sidebar top |
| 2 | Full Name | User.firstName + lastName | Large semibold text (18px) | Sidebar below avatar |
| 3 | Email | User.email | Gray-500 text, clickable mailto link | Sidebar below name |
| 4 | Role(s) | User.roles[] | Colored badge(s) with role name | Sidebar "Roles" section |
| 5 | Status | User.status | StatusBadge with dot indicator | Sidebar below email |
| 6 | Created Date | User.createdAt | "Jan 5, 2026" format | Sidebar Quick Info |
| 7 | Last Login | User.lastLoginAt | Relative time + absolute on hover tooltip | Sidebar Quick Info |
| 8 | Login Count | User.loginCount | Integer with comma formatting | Sidebar Quick Info |
| 9 | Last IP Address | User.lastIpAddress | IP address (Super Admin only) | Sidebar Quick Info |
| 10 | MFA Status | User.mfaEnabled | "Enabled" (green) or "Disabled" (amber warning) | Sidebar Security |
| 11 | Password Last Changed | User.passwordChangedAt | Relative time ("45 days ago") | Sidebar Security |
| 12 | Phone | User.phone | Formatted phone number | Sidebar Quick Info |
| 13 | Department | User.department | Text | Sidebar Quick Info |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Online Status | lastLoginAt within 5 min AND no logout event | Green dot + "Online" or gray dot + "Offline" |
| 2 | Account Age | now() - createdAt | "X months" or "X years" |
| 3 | Password Age | now() - passwordChangedAt | Days count; amber if > 60 days, red if > 90 days |
| 4 | Active Sessions Count | COUNT(sessions) WHERE status = active | Integer shown on Sessions tab badge |
| 5 | Loads Created (stat) | COUNT(loads) WHERE createdBy = userId | Integer on Stats tab |
| 6 | Orders Managed (stat) | COUNT(orders) WHERE assignedTo = userId | Integer on Stats tab |

---

## 5. Features

### Core Features (Built -- Currently Live)

- [x] User information card (sidebar) with name, email, role, status
- [x] Roles section showing assigned roles with badges
- [x] Edit user action (opens edit modal)
- [x] Status change actions (activate, suspend, deactivate)
- [x] Breadcrumb navigation back to user list
- [x] Basic user detail display

### Enhancement Features (Wave 1 Additions)

- [ ] **Activity timeline** -- Chronological feed showing login history, actions taken (created load, edited customer, changed settings), pages visited with timestamps and IP addresses
- [ ] **Effective permissions view** -- Aggregated matrix showing all permissions from all assigned roles; expandable per module (CRM, Operations, Accounting, etc.); inherited vs. directly assigned indicator
- [ ] **Session management** -- Table of active sessions showing device, browser, IP, location (city), login time, last activity; "Revoke" button per session; "Revoke All" bulk action
- [ ] **Password history section** -- Last password change date, password age indicator (green/amber/red), "Force Reset" button that sends reset email and invalidates current password
- [ ] **User operational stats** -- Loads created count, orders managed count, quotes sent count, login frequency chart (last 90 days), most used screens, average session duration
- [ ] **Notification preferences** -- Per-category toggles (email, SMS, push) for: order updates, load status changes, billing alerts, system announcements; saved per-user
- [ ] **Custom field assignments** -- Display and edit any tenant-defined custom fields assigned to user profiles (e.g., employee ID, department, office location)
- [ ] **Delegate permissions** -- Temporarily grant extra permissions to a user with an expiration date; shows active delegations with countdown timer; auto-revokes on expiry

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View user detail | admin, super_admin | user_view | Redirect to user list with "Access Denied" toast |
| Edit user | admin, super_admin | user_edit | Edit button hidden |
| View last IP address | super_admin | security_view | IP field hidden from sidebar |
| Manage sessions | admin, super_admin | session_manage | Sessions tab hidden |
| Force password reset | admin, super_admin | user_edit | Force Reset button hidden |
| Impersonate | super_admin | user_impersonate | Impersonate option hidden from More menu |
| Delegate permissions | admin, super_admin | permission_delegate | Delegate section hidden |
| View activity timeline | admin, super_admin | audit_view | Activity tab shows limited data |

---

## 6. Status & State Machine

### Status Transitions

```
[Pending Invite] ---(Accept Invite)--> [Active]
                                           |
                                           v
                  [Active] <---(Reactivate)--- [Inactive]
                     |                            ^
                     v                            |
                  [Suspended] ---(Deactivate)--> [Inactive]
                     ^
                     |
                  [Active] ---(Suspend)---> [Suspended]
```

### Actions Available Per Status (from this screen)

| Status | Header Actions | More Menu Actions |
|---|---|---|
| Pending Invite | Resend Invite, Cancel Invite | Edit |
| Active | Edit, Reset Password, Suspend | Deactivate, Impersonate, View Audit Log |
| Suspended | Edit, Reactivate | Deactivate, View Audit Log |
| Inactive | Reactivate | View Audit Log |

### Status Badge Colors

| Status | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| Pending Invite | yellow-100 | yellow-800 | yellow-300 | `bg-yellow-100 text-yellow-800 border-yellow-300` |
| Active | green-100 | green-800 | green-300 | `bg-green-100 text-green-800 border-green-300` |
| Suspended | orange-100 | orange-800 | orange-300 | `bg-orange-100 text-orange-800 border-orange-300` |
| Inactive | gray-100 | gray-600 | gray-300 | `bg-gray-100 text-gray-600 border-gray-300` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Header Area)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Edit | Pencil | Secondary / Outline | Opens edit user modal | No |
| Reset Password | Key | Secondary / Outline | Sends password reset email | Yes -- "Send password reset to [email]?" |
| Suspend | Pause | Destructive / Red Outline | Changes status to Suspended | Yes -- "Suspend [name]? They will be logged out." |

### More Menu Actions

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Impersonate | Users | Start impersonation session | Super Admin only; user is Active |
| Deactivate | X-Circle | Opens deactivation dialog with reason | Status is Active or Suspended |
| Reactivate | Play | Changes status to Active | Status is Suspended or Inactive |
| Revoke All Sessions | Shield-Off | Terminates all active sessions | User has active sessions |
| View Full Audit Log | Clock | Navigate to audit log filtered by user | Always available |
| Delete User | Trash | Permanently delete user (soft delete) | Super Admin only; no associated data |

### Tab Interactions

| Tab | Click Action | Badge |
|---|---|---|
| Overview | Show activity timeline and recent actions | None |
| Activity | Show detailed activity log with filters | None |
| Permissions | Show effective permissions matrix | None |
| Sessions | Show active sessions table | Count badge (e.g., "3") if sessions active |
| Stats | Show operational statistics and charts | None |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + E | Open edit modal |
| Ctrl/Cmd + [ | Navigate back to user list |
| Escape | Close modal |
| 1-5 | Switch tabs (1=Overview, 2=Activity, etc.) |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop on this screen |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| user.updated | { userId, changedFields } | Refresh sidebar data; show toast if changed by another admin |
| user.status.changed | { userId, oldStatus, newStatus } | Update status badge; show toast notification |
| user.login | { userId, sessionInfo } | Update "Last Login" in sidebar; add entry to activity timeline; increment session count |
| user.logout | { userId, sessionId } | Update online indicator; decrement session count |
| user.session.revoked | { userId, sessionId } | Remove session from active sessions table |

### Live Update Behavior

- **Update frequency:** WebSocket push for all user-specific events
- **Visual indicator:** Flash updated sections with subtle blue highlight
- **Conflict handling:** If admin is editing while another admin changes the user, show banner: "This user was updated by [name]. Refresh to see changes."

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 30 seconds for activity timeline; every 60 seconds for session list
- **Endpoint:** GET /api/v1/users/:id?updatedSince={timestamp}
- **Visual indicator:** "Live updates paused" indicator in header area

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Change status | Immediately update badge | Revert badge, show error toast |
| Revoke session | Immediately remove from table | Re-add row, show error toast |
| Add role | Immediately show new badge | Remove badge, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| user-detail-card | src/components/admin/user-detail-card.tsx | user: User object |
| user-roles-section | src/components/admin/user-roles-section.tsx | roles: Role[], userId: string |
| user-status-badge | src/components/admin/user-status-badge.tsx | status: string, size: 'sm' or 'md' |
| user-form | src/components/admin/user-form.tsx | mode: 'edit', userData |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| StatusBadge | src/components/ui/status-badge.tsx | status, size |
| Timeline | src/components/ui/timeline.tsx | entries: TimelineEntry[] |
| Tabs | shadcn tabs component | tabs config |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| user-detail-card | Shows name, email, role, status | Add avatar (80px), online indicator, quick info section (created, last login, login count, IP), security section (MFA status, password age) |
| user-roles-section | Lists assigned roles as badges | Add "effective permissions" expandable view per role, add/remove role capability, role link to role editor |
| Timeline (generic) | Basic timeline with text entries | Add support for different entry types (login, action, page visit) with distinct icons, IP/device info, expandable detail |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| ActivityTimeline | Extended timeline showing login events, user actions, page visits with icons, timestamps, IP, device info, and expandable details | Medium -- multiple entry types with different layouts |
| EffectivePermissionsMatrix | Grid showing all permissions grouped by module, with checkmarks showing which role grants each permission; expandable sections per module | Medium -- matrix layout with role attribution |
| SessionTable | Table of active sessions with device icon, browser, IP, location (city via GeoIP), login time, last activity, and "Revoke" button | Medium -- table with action buttons |
| PasswordHistoryCard | Card showing password last changed date, age indicator bar (green/amber/red), force reset button | Small -- card with indicator |
| UserStatsPanel | Grid of stat cards (loads created, orders managed, quotes sent) plus login frequency chart (90-day area chart) and most-used screens bar chart | Medium -- stat cards + charts |
| NotificationPreferences | Category-based toggle grid: rows = event types (order updates, load status, billing), columns = channels (email, SMS, push); save button | Medium -- toggle grid form |
| DelegatePermissionForm | Form to select extra permissions, set expiration date, add reason; shows active delegations as list with countdown timers | Medium -- form with timer display |
| UserAvatarLarge | 80px circular avatar with image support, initials fallback, online indicator overlay, upload capability on hover | Small -- avatar with overlay |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Tabs | tabs | Main content area tab navigation |
| Avatar | avatar | Large user avatar in sidebar |
| Separator | separator | Dividers between sidebar sections |
| Alert Dialog | alert-dialog | Confirmation for suspend, deactivate, revoke |
| Tooltip | tooltip | IP address hover, relative time hover |
| Switch | switch | Notification preference toggles |
| Calendar | calendar | Delegation expiration date picker |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/users/:id | Fetch complete user profile | useUser(id) |
| 2 | PATCH | /api/v1/users/:id | Update user details | useUpdateUser() |
| 3 | PATCH | /api/v1/users/:id/status | Change user status | useUpdateUserStatus() |
| 4 | PATCH | /api/v1/users/:id/role | Add or remove role | useUpdateUserRole() |
| 5 | POST | /api/v1/users/:id/reset-password | Send password reset email | useResetUserPassword() |
| 6 | GET | /api/v1/users/:id/activity | Fetch activity timeline with pagination | useUserActivity(id, page) |
| 7 | GET | /api/v1/users/:id/permissions | Fetch effective permissions (aggregated from roles) | useUserPermissions(id) |
| 8 | GET | /api/v1/users/:id/sessions | Fetch active sessions list | useUserSessions(id) |
| 9 | DELETE | /api/v1/users/:id/sessions/:sessionId | Revoke a specific session | useRevokeSession() |
| 10 | DELETE | /api/v1/users/:id/sessions | Revoke all sessions | useRevokeAllSessions() |
| 11 | GET | /api/v1/users/:id/stats | Fetch operational statistics | useUserStats(id) |
| 12 | GET | /api/v1/users/:id/notification-preferences | Fetch notification preferences | useNotificationPrefs(id) |
| 13 | PUT | /api/v1/users/:id/notification-preferences | Update notification preferences | useUpdateNotificationPrefs() |
| 14 | POST | /api/v1/users/:id/delegate | Grant temporary extra permissions | useDelegatePermissions() |
| 15 | DELETE | /api/v1/users/:id/delegate/:delegationId | Revoke a delegation | useRevokeDelegation() |
| 16 | POST | /api/v1/users/:id/impersonate | Start impersonation session | useImpersonate() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| user:{userId} | user.updated | useUserDetailUpdates(id) -- refreshes user data |
| user:{userId} | user.login | useUserDetailUpdates(id) -- adds to activity timeline |
| user:{userId} | user.session.created | useSessionUpdates(id) -- adds session row |
| user:{userId} | user.session.revoked | useSessionUpdates(id) -- removes session row |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/v1/users/:id | N/A | Redirect to login | "Access Denied" page | "User not found" page with link back to list | Error state with retry |
| PATCH /api/v1/users/:id/status | Validation toast | Redirect to login | "Permission Denied" toast | "User not found" toast | Error toast with retry |
| DELETE /api/v1/users/:id/sessions/:sessionId | N/A | Redirect to login | "Permission Denied" toast | "Session not found" toast | Error toast with retry |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Sidebar shows avatar circle skeleton (80px), 3 text line skeletons, 2 badge skeletons. Main content area shows tab skeleton and 6 timeline entry skeletons.
- **Progressive loading:** Sidebar loads first (user basic info), then tab content loads based on active tab.
- **Duration threshold:** If loading exceeds 5s, show "Loading user profile..." message.

### Empty States

**Activity timeline empty (new user with no activity):**
- **Headline:** "No activity yet"
- **Description:** "Activity will appear here once this user starts using the system."

**Sessions empty (no active sessions):**
- **Headline:** "No active sessions"
- **Description:** "This user is not currently logged in on any device."

**Stats empty (new user with no operational data):**
- **Headline:** "No operational data yet"
- **Description:** "Statistics will populate as this user creates loads, manages orders, and performs other actions."

### Error States

**Full page error (user fetch fails):**
- **Display:** Error icon + "Unable to load user profile" + Retry button + "Back to Users" link

**Tab content error (activity or sessions fail):**
- **Display:** Inline error within tab: "Could not load [tab content]. Try again." with retry link

**Action error (status change fails):**
- **Display:** Toast: "Failed to [action]. [Specific error message]." Auto-dismiss after 8s.

### Permission Denied

- **Full page denied:** "You don't have permission to view this user" with link back to user list
- **Partial denied:** Hide restricted tabs and actions; show accessible data only

### Offline / Degraded

- **Full offline:** "You're offline. Showing cached user data from [timestamp]. Some actions are unavailable."
- **Degraded:** Session management and activity timeline may show stale data; indicator shown

---

## 12. Filters, Search & Sort

### Activity Timeline Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Activity Type | Multi-select | Login, Logout, Create, Update, Delete, View, Export | All | ?activityType= |
| 2 | Date Range | Date range picker | Today, Last 7 Days, Last 30 Days, Custom | Last 30 Days | ?from=&to= |
| 3 | Module | Multi-select | Auth, CRM, Operations, Accounting, Admin, Carrier | All | ?module= |

### Sessions Table Sort

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Login Time | Descending (most recent first) | Date |
| Last Activity | Descending (most recent first) | Date |
| Device | Ascending (A-Z) | Alphabetical |

### Permissions Matrix Behavior

- **Search:** Type-ahead search to find a specific permission by name within the matrix
- **Expand/Collapse:** Click module header to expand and show individual permissions
- **Filter by role:** Toggle role columns on/off to compare permission sources

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Sidebar collapses to top section (horizontal layout: avatar left, info right) instead of left panel
- Main content takes full width below the user info section
- Tabs remain horizontal; tab content fills full width
- Action buttons move to a single "Actions" dropdown in header

### Mobile (< 768px)

- User info section stacks vertically: avatar centered, name/email centered below, badges below that
- Tabs switch to full-width horizontal scroll or dropdown selector
- Activity timeline shows condensed entries (hide IP, device details behind expand)
- Sessions table switches to card view (one card per session)
- Action buttons consolidated into floating action button (FAB) or bottom sheet
- Stats tab shows stat cards stacked 1 per row

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full sidebar + content layout as designed |
| Desktop | 1024px - 1439px | Sidebar slightly narrower (280px) |
| Tablet | 768px - 1023px | Sidebar becomes top section |
| Mobile | < 768px | Fully stacked layout |

---

## 14. Stitch Prompt

```
Design a User Detail / Profile admin screen for a modern SaaS TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with a dark slate-900 sidebar (240px) on the left (navigation), white content area on the right. The content area is split into two columns: a left info sidebar (320px, white background with gray-50 border-right) and a main content area (remaining width).

Left Info Sidebar (320px):
- At the top, show an 80px circular avatar with initials "JD" on a blue-500 background with white text, and a small green online indicator dot (12px) overlapping the bottom-right of the avatar
- Below avatar: "John Doe" in 18px semibold, "john@ultralogistics.com" in 14px gray-500 as a clickable link, and an "Active" green status badge
- Divider line
- "Quick Info" section with label-value pairs stacked vertically: Created: "Jan 5, 2026", Last Login: "2 minutes ago" (with green text), Login Count: "342", Department: "Operations", Phone: "+1 (555) 123-4567"
- Divider line
- "Roles" section header with a small "+ Add Role" blue text button. Below, show two role badges: "Admin" (blue badge) and "Operations Manager" (green badge), each as clickable links
- Divider line
- "Security" section: MFA: "Enabled" with a green shield icon, Password Changed: "45 days ago" in amber text (indicating it is aging), and a small "Force Reset" red outline button

Top of Main Content Area:
- Breadcrumb: "Admin > Users > John Doe"
- Action buttons on the right: "Edit" (secondary outline with pencil icon), "Reset Password" (secondary outline with key icon), "Suspend" (red outline with pause icon), and a three-dot "More" dropdown menu

Main Content Area (tabbed):
- Show 5 tabs: "Overview", "Activity", "Permissions", "Sessions (3)" where 3 is a small blue count badge, and "Stats"
- The "Overview" tab is active and shows:
  - An activity timeline with 6 entries, each showing: a colored icon (green for login, blue for action, gray for view), timestamp ("Today, 10:32 AM"), description ("Logged in from Chrome on Windows, IP: 192.168.1.45"), and a subtle gray line connecting entries vertically
  - Timeline entries: login event, "Created Load LOAD-20260206-0018", "Updated customer Acme Manufacturing credit limit", "Viewed Dispatch Board", "Logged in from Mobile Safari on iPhone", "Exported carrier compliance report"

Design Specifications:
- Font: Inter or system sans-serif, 14px base size
- Left info sidebar: white background, border-r border-gray-200, padding 24px
- Content background: gray-50 for page, white for tab content cards
- Primary color: blue-600 for links and primary actions
- Timeline icons: 24px circles with colored backgrounds (green-100 for login, blue-100 for actions, gray-100 for views)
- Timeline connector: 2px gray-200 vertical line between entries
- Tab underline: blue-600 active indicator, 2px bottom border
- Role badges: rounded-full pills with distinct colors per role
- Security indicators: green shield icon for MFA enabled, amber text for aging password
- Online indicator: 12px green circle with subtle pulse animation, positioned at avatar bottom-right
- Modern SaaS aesthetic similar to Clerk.com user management or Auth0 dashboard
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1 -- Enhancement Focus)

**What's built and working:**
- [x] User information card with name, email, role display
- [x] Roles section showing assigned role badges
- [x] Basic user detail page layout
- [x] Edit user action (opens modal)
- [x] Status change actions (activate, suspend, deactivate)
- [x] Breadcrumb navigation back to user list

**What needs polish / bug fixes:**
- [ ] Avatar section shows placeholder only -- needs initials fallback with colored background
- [ ] No clear visual distinction between sidebar sections (add separators)
- [ ] Status badge styling inconsistent with list page
- [ ] Page does not refresh when user data changes externally

**What to add this wave:**
- [ ] Activity timeline with login history, actions taken, and pages visited, with filterable entries by type and date
- [ ] Effective permissions view: aggregated matrix from all roles, expandable by module, showing which role grants each permission
- [ ] Session management: active sessions table with device/browser/IP/location, individual and bulk revoke capabilities
- [ ] Password history section: last changed date, age indicator (green/amber/red), force reset with email notification
- [ ] User operational stats: loads created, orders managed, quotes sent, login frequency chart (90 days), most-used screens
- [ ] Notification preferences: per-category toggles (email, SMS, push) for order updates, load status, billing alerts, system announcements
- [ ] Custom field assignments: display and edit tenant-defined custom fields (employee ID, department, office)
- [ ] Delegate permissions: temporarily grant extra permissions with expiration date, countdown timer, auto-revoke

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Activity timeline | High | Medium | P0 |
| Effective permissions view | High | Medium | P0 |
| Session management | High | Medium | P0 |
| Password history / force reset | Medium | Low | P1 |
| User operational stats | Medium | Medium | P1 |
| Notification preferences | Medium | Medium | P1 |
| Custom field assignments | Low | Medium | P2 |
| Delegate permissions | Medium | High | P2 |

### Future Wave Preview

- **Wave 2:** API key management per user (for integrations), login anomaly detection (flag unusual login locations or times), user comparison view (side-by-side two users' permissions)
- **Wave 3:** AI-powered permission recommendations ("users in similar roles typically have these additional permissions"), automated access reviews with manager approval workflows

---

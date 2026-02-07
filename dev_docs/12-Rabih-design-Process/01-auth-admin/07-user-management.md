# User Management

> Service: Auth & Admin | Wave: 1 (Enhancement Focus) | Priority: P0
> Route: /(dashboard)/admin/users | Status: Built
> Primary Personas: Admin
> Roles with Access: Super Admin, Admin

---

## 1. Purpose & Business Context

**What this screen does:**
Displays a paginated, filterable table of all users within the tenant, allowing admins to create, edit, deactivate, and manage user accounts and role assignments.

**Business problem it solves:**
Without centralized user management, organizations cannot control who has access to the TMS, what they can see, or what actions they can perform. This screen is the single point of control for the entire user lifecycle -- from invitation through deactivation -- ensuring security, compliance, and operational efficiency.

**Key business rules:**
- Only Super Admin and Admin roles can access this screen
- Admins cannot elevate a user's role above their own role level
- Admins cannot deactivate their own account
- System-created users (e.g., platform service accounts) cannot be deleted
- Email addresses must be unique within the tenant
- A user must be assigned at least one role
- Deactivated users retain their data but cannot log in

**Success metric:**
Admin can onboard a new user (create account, assign role, send invite) in under 60 seconds. User audit trail is 100% complete for compliance.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Admin sidebar navigation | Click "Users" menu item | None |
| Dashboard | Click user-related alert or notification | Optional filter params |
| User Detail page | Click "Back to Users" breadcrumb | Previous filter state |
| Audit Log | Click user name link in log entry | ?userId= filter |
| Direct URL | Bookmark / shared link | Query params for filters |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| User Detail | Click user row or user name link | userId |
| Create User Modal | Click "+ Add User" button | None |
| Edit User Modal | Click edit icon on row or row action dropdown | userId, prefilled data |
| Role Management | Click role badge/link in table | roleId |
| Audit Log | Click "View Activity" in row actions | ?userId= filter |

**Primary trigger:**
Admin navigates to the Admin section from sidebar and clicks "Users" to review, manage, or onboard team members.

**Success criteria (user completes the screen when):**
- Admin has located the user they were looking for using search or filters
- Admin has successfully created, edited, or deactivated a user
- Admin has reviewed user list for compliance or audit purposes

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Admin > Users       [+ Add User] [Bulk Invite] [Export] |
+------------------------------------------------------------------+
|  Stats Bar: [Total Users: 47] [Active: 42] [Inactive: 5] [Online: 12] |
+------------------------------------------------------------------+
|  Filters: [Search...] [Role ▼] [Status ▼] [Last Login ▼] [Clear] |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  | [ ] | Avatar | Name/Email   | Role     | Status | Last Active |  |
|  |-----|--------|--------------|----------|--------|-------------|  |
|  | [ ] | JD     | John Doe...  | Admin    | Active | 2 min ago   |  |
|  | [ ] | SM     | Sarah M...   | Sales    | Active | 1 hr ago    |  |
|  | [ ] | OA     | Omar A...    | Dispatch | Active | Online      |  |
|  | [ ] | FK     | Fatima K...  | Acctg    | Inactive| 30 days ago|  |
|  |     |        |              |          |        |             |  |
|  +------------------------------------------------------------+  |
|  Showing 1-25 of 47 users       < 1  2 >     [25 per page ▼]    |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | User name, email, role badge, status badge | Admin needs at-a-glance identification and status |
| **Secondary** (visible in table) | Last active time, avatar/initials, creation date | Helps identify stale accounts and activity level |
| **Tertiary** (on hover or expand) | Phone number, department, login count, IP address | Useful for investigation but not daily management |
| **Hidden** (behind click -- detail page) | Full activity history, session list, permission details | Deep investigation data only needed per-user |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Checkbox | N/A (selection state) | Checkbox for bulk actions | Table column 1 |
| 2 | Avatar | User.avatar / User.firstName + lastName | Circular avatar image or initials with colored background | Table column 2 |
| 3 | Name | User.firstName + User.lastName | Full name, clickable link to detail | Table column 3 |
| 4 | Email | User.email | Email address, gray-500 text below name | Table column 3 (subtext) |
| 5 | Role | User.roles[] | Badge(s) with role name, color-coded | Table column 4 |
| 6 | Status | User.status | StatusBadge: Active (green), Inactive (gray), Suspended (red), Pending (yellow) | Table column 5 |
| 7 | Last Active | User.lastLoginAt | Relative time ("2 min ago", "3 days ago"), with online dot indicator | Table column 6 |
| 8 | Created | User.createdAt | Date format: "Jan 15, 2026" | Table column 7 |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Online Status | lastLoginAt within 5 min AND no logout event | Green dot = online, yellow dot = away (5-30 min), gray dot = offline |
| 2 | Days Since Last Login | now() - lastLoginAt | Number of days; red text if > 30 days (stale account indicator) |
| 3 | Total Users (stat card) | COUNT(users) WHERE tenantId = current | Integer displayed in stat card |
| 4 | Active Users (stat card) | COUNT(users) WHERE status = 'active' | Integer displayed in stat card |

---

## 5. Features

### Core Features (Built -- Currently Live)

- [x] View paginated list of users with sorting by name, email, role, status, last login
- [x] Search users by name or email (debounced, 300ms)
- [x] Filter by role (multi-select dropdown)
- [x] Filter by status (Active, Inactive, Suspended, Pending)
- [x] Create new user via modal form (name, email, role assignment)
- [x] Edit user via modal form (update name, email, role, status)
- [x] Status badges with color coding (Active/green, Inactive/gray)
- [x] Role badges displayed per user row
- [x] Click-through to User Detail page
- [x] Pagination with configurable page size

### Enhancement Features (Wave 1 Additions)

- [ ] **Bulk invite users via CSV upload** -- Upload CSV with name, email, role columns; preview import before executing; send invite emails
- [ ] **User activity sparkline** -- Mini bar chart in each row showing login frequency over last 30 days (tiny, inline, no labels)
- [ ] **Last active indicator** -- Online/Away/Offline colored dot next to user name based on session activity
- [ ] **Quick role change from table** -- Inline dropdown on role badge click to change role without opening edit modal
- [ ] **User deactivation with reason** -- Deactivate action requires reason selection (Left company, Security concern, Temporary leave, Other) logged to audit
- [ ] **Delegated admin** -- Allow users with delegated permissions to manage only their team members
- [ ] **Export user list** -- Export filtered user list to CSV with all visible columns plus role details
- [ ] **Advanced filters** -- Filter by last login date range, creation date range; combine with role and status
- [ ] **User avatar in table row** -- Display profile photo or generated initials avatar with colored background
- [ ] **Impersonation button** -- Admin-only action to log in as the selected user (with full audit trail); shows warning dialog

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View user list | admin, super_admin | user_view | Redirect to dashboard with "Access Denied" |
| Create user | admin, super_admin | user_create | "+ Add User" button hidden |
| Edit user | admin, super_admin | user_edit | Edit actions hidden from row |
| Deactivate user | admin, super_admin | user_delete | Deactivate action hidden |
| Impersonate user | super_admin | user_impersonate | Impersonate button not rendered |
| Bulk invite | admin, super_admin | user_create | "Bulk Invite" button hidden |
| Export users | admin, super_admin | export_data | "Export" button hidden |

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

### Actions Available Per Status

| Status | Available Actions (Buttons) | Restricted Actions |
|---|---|---|
| Pending Invite | Resend Invite, Cancel Invite, Edit | Deactivate, Suspend, Impersonate |
| Active | Edit, Suspend, Deactivate, Impersonate, Reset Password | Delete (never allowed) |
| Suspended | Edit, Reactivate, Deactivate | Impersonate, Reset Password |
| Inactive | Reactivate, View History | Edit, Suspend, Impersonate |

### Status Badge Colors

| Status | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| Pending Invite | yellow-100 | yellow-800 | yellow-300 | `bg-yellow-100 text-yellow-800 border-yellow-300` |
| Active | green-100 | green-800 | green-300 | `bg-green-100 text-green-800 border-green-300` |
| Suspended | orange-100 | orange-800 | orange-300 | `bg-orange-100 text-orange-800 border-orange-300` |
| Inactive | gray-100 | gray-600 | gray-300 | `bg-gray-100 text-gray-600 border-gray-300` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + Add User | Plus | Primary / Blue | Opens create user modal with name, email, role fields | No |
| Bulk Invite | Upload | Secondary / Outline | Opens CSV upload dialog for bulk user creation | Yes -- preview step before executing |
| Export | Download | Secondary / Outline | Downloads CSV of current filtered user list | No |

### Row Actions (Dropdown / "More" Menu per Row)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| View Profile | Eye | Navigate to /admin/users/[id] | Always available |
| Edit User | Pencil | Opens edit user modal | Status is not Inactive |
| Change Role | Shield | Opens inline role dropdown | Status is Active |
| Reset Password | Key | Sends password reset email | Status is Active |
| Suspend | Pause | Changes status to Suspended | Status is Active |
| Reactivate | Play | Changes status to Active | Status is Suspended or Inactive |
| Deactivate | X-Circle | Opens deactivation dialog with reason | Status is Active or Suspended |
| Impersonate | Users | Logs in as user with audit trail | Super Admin only; user is Active |
| View Activity | Clock | Navigate to audit log filtered by user | Always available |

### Bulk Actions (When Multiple Rows Selected)

| Action Label | Action | Confirmation |
|---|---|---|
| Change Role | Opens role selection for all selected users | Yes -- "Change role for N users to [role]?" |
| Deactivate | Opens deactivation dialog for all selected | Yes -- "Deactivate N users? This will revoke their access." |
| Resend Invite | Resends invite email to selected pending users | Yes -- "Resend invite to N users?" |
| Export Selected | Downloads CSV of selected rows only | No |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + K | Open search / focus search input |
| Ctrl/Cmd + N | Open create user modal |
| Escape | Close modal / deselect all |
| Arrow Up/Down | Navigate table rows |
| Enter | Open selected row detail |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop on this screen |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| user.status.changed | { userId, oldStatus, newStatus, changedBy } | Update status badge in table row; show toast if changed by another admin |
| user.created | { userId, name, email, role } | Add new row to table if within current filter; update stat cards |
| user.login | { userId, timestamp } | Update "Last Active" column and online indicator dot |
| user.logout | { userId, timestamp } | Update online indicator to offline |

### Live Update Behavior

- **Update frequency:** WebSocket push for status changes and login/logout events; stat card refresh every 60s
- **Visual indicator:** Flash changed row with subtle blue highlight that fades over 2 seconds
- **Conflict handling:** If admin is editing a user that another admin changes simultaneously, show banner: "This user was updated by [name]. Refresh to see changes."

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 60 seconds
- **Endpoint:** GET /api/v1/users?updatedSince={lastPollTimestamp}
- **Visual indicator:** Show "Live updates paused -- reconnecting..." subtle banner

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Change status | Immediately update badge in table | Revert badge, show error toast |
| Change role | Immediately update role badge | Revert badge, show error toast |
| Create user | Add row to top of table with loading indicator | Remove row, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| users-table | src/components/admin/users-table.tsx | columns, data, pagination, sorting, selection |
| user-form | src/components/admin/user-form.tsx | mode: 'create' or 'edit', userData, roles |
| user-status-badge | src/components/admin/user-status-badge.tsx | status: string, size: 'sm' or 'md' |
| user-filters | src/components/admin/user-filters.tsx | roles[], statuses[], onFilterChange |
| DataTable | src/components/ui/data-table.tsx | columns, data, pagination, sorting |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| FilterBar | src/components/ui/filter-bar.tsx | filters: FilterConfig[] |
| StatusBadge | src/components/ui/status-badge.tsx | status: string, size: 'sm' or 'md' |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| users-table | Basic columns with name, email, role, status | Add avatar column, activity sparkline column, online indicator dot, inline role dropdown, bulk selection checkboxes |
| user-filters | Role dropdown and status dropdown | Add last login date range picker, creation date range, combined search across name+email+role |
| user-form | Create/edit modal with basic fields | Add CSV bulk upload mode, deactivation reason field, avatar upload |
| user-status-badge | Displays Active/Inactive text badge | Add online/away/offline dot indicator overlay |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| UserActivitySparkline | Tiny inline bar chart (30 bars for 30 days) showing login frequency per day | Small -- SVG bars, no labels, tooltip on hover |
| OnlineIndicator | Green/yellow/gray dot showing real-time presence based on session activity | Small -- 8px circle with color and optional pulse animation |
| BulkInviteModal | CSV upload dialog with file drop zone, column mapping preview, validation errors, confirm step | Medium -- file parsing, preview table, validation |
| DeactivationDialog | Confirmation dialog with reason selector (dropdown), optional notes field, impact summary | Small -- dialog with form fields |
| InlineRoleDropdown | Dropdown that appears on role badge click, showing available roles with current selection | Small -- popover with radio list |
| ImpersonationDialog | Warning dialog explaining impersonation with audit notice, confirmation required | Small -- alert dialog with warning styling |
| UserAvatarCell | Table cell showing circular avatar with initials fallback, colored background based on user name hash | Small -- avatar component with fallback |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Avatar | avatar | User avatar display in table rows |
| Popover | popover | Inline role change dropdown |
| Alert Dialog | alert-dialog | Deactivation confirmation, impersonation warning |
| Date Range Picker | calendar + popover | Last login date range filter |
| Dropdown Menu | dropdown-menu | Row actions menu |
| Tooltip | tooltip | Sparkline hover details, truncated text |
| Badge | badge | Role badges, status badges |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/users | Fetch paginated user list with filters | useUsers(filters) |
| 2 | GET | /api/v1/users/:id | Fetch single user detail | useUser(id) |
| 3 | POST | /api/v1/users | Create a new user | useCreateUser() |
| 4 | PATCH | /api/v1/users/:id | Update user details | useUpdateUser() |
| 5 | PATCH | /api/v1/users/:id/status | Change user status (activate, suspend, deactivate) | useUpdateUserStatus() |
| 6 | PATCH | /api/v1/users/:id/role | Change user role assignment | useUpdateUserRole() |
| 7 | POST | /api/v1/users/:id/reset-password | Trigger password reset email | useResetUserPassword() |
| 8 | POST | /api/v1/users/bulk-invite | Bulk create users from CSV data | useBulkInvite() |
| 9 | POST | /api/v1/users/export | Export filtered user list to CSV | useExportUsers() |
| 10 | POST | /api/v1/users/:id/impersonate | Start impersonation session | useImpersonate() |
| 11 | GET | /api/v1/users/stats | Get user count statistics | useUserStats() |
| 12 | GET | /api/v1/users/:id/activity-sparkline | Get login frequency data (30 days) | useUserSparkline(id) |
| 13 | GET | /api/v1/roles | Fetch available roles for filters and assignment | useRoles() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| admin:{tenantId} | user.created | useUserListUpdates() -- invalidates user list query |
| admin:{tenantId} | user.status.changed | useUserListUpdates() -- updates specific row |
| admin:{tenantId} | user.login | usePresenceUpdates() -- updates online indicator |
| admin:{tenantId} | user.logout | usePresenceUpdates() -- updates online indicator |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| GET /api/v1/users | Show filter error toast | Redirect to login | Show "Access Denied" page | N/A | N/A | Show error state with retry |
| POST /api/v1/users | Show validation errors inline | Redirect to login | Show "Permission Denied" toast | N/A | "Email already exists" toast | Show error toast with retry |
| PATCH /api/v1/users/:id/status | Show validation toast | Redirect to login | "Cannot modify this user" toast | "User not found" toast | N/A | Show error toast with retry |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show table with 8 skeleton rows matching column widths (avatar circle, text bars for name/email, badge placeholder for role/status, text bar for date). Stat cards show skeleton numbers.
- **Progressive loading:** Page header and filters render immediately; skeleton only for data table area and stat cards.
- **Duration threshold:** If loading exceeds 5s, show "This is taking longer than usual..." message below skeleton.

### Empty States

**First-time empty (no users besides current admin):**
- **Illustration:** Team/people illustration
- **Headline:** "Your team starts here"
- **Description:** "Invite your team members to start collaborating in Ultra TMS."
- **CTA Button:** "Invite Your First Team Member" -- primary blue button

**Filtered empty (users exist but filters exclude all):**
- **Headline:** "No users match your filters"
- **Description:** "Try adjusting your search terms or filter criteria."
- **CTA Button:** "Clear All Filters" -- secondary outline button

### Error States

**Full page error (API completely fails):**
- **Display:** Error icon + "Unable to load users" + "Please try again or contact support." + Retry button

**Action error (create/edit/status change fails):**
- **Display:** Toast notification: red background, error icon, specific message (e.g., "Email already in use"), dismiss button. Auto-dismiss after 8 seconds.

### Permission Denied

- **Full page denied:** Show "You don't have permission to manage users" with link back to dashboard
- **Partial denied:** Hide action buttons for unauthorized actions; table remains viewable if user has view permission

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. Showing cached user data from [timestamp]."
- **Degraded:** Show "Live presence updates paused" indicator; user list still loads on refresh.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Search | Text input | Searches across name, email | None | ?search= |
| 2 | Role | Multi-select dropdown | All 9 internal roles from roles table | All | ?role= |
| 3 | Status | Multi-select dropdown | Active, Inactive, Suspended, Pending Invite | All Active | ?status= |
| 4 | Last Login | Date range picker | Preset: Today, Last 7 Days, Last 30 Days, Custom | All | ?lastLoginFrom=&lastLoginTo= |
| 5 | Created | Date range picker | Preset: This Month, Last 3 Months, This Year, Custom | All | ?createdFrom=&createdTo= |

### Search Behavior

- **Search field:** Single search input at left of filter bar
- **Searches across:** User first name, last name, email address
- **Behavior:** Debounced 300ms, minimum 2 characters, highlights matching text in results
- **URL param:** ?search=

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Name | Ascending (A-Z) | Alphabetical |
| Email | Ascending (A-Z) | Alphabetical |
| Role | Ascending (A-Z) | Alphabetical |
| Status | Custom (Active first) | Custom enum order |
| Last Active | Descending (most recent) | Date |
| Created | Descending (newest first) | Date |

**Default sort:** Name ascending (A-Z)

### Saved Filters / Presets

- **System presets:** "All Active Users", "Recently Inactive (30+ days)", "Pending Invites", "Admins Only"
- **User-created presets:** Admins can save current filter combination with custom name
- **URL sync:** All filter state reflected in URL query params for shareable links

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Stat cards stack 2 per row instead of 4
- Table hides "Created" column; "Last Active" column shows abbreviated format
- Filter bar collapses to "Filters" button opening slide-over panel
- Action buttons: keep "+ Add User" visible, move "Bulk Invite" and "Export" to overflow menu

### Mobile (< 768px)

- Stat cards stack vertically (1 per row) or show as horizontal scroll
- Data table switches to card-based list view (one card per user)
- Each card shows: avatar + name + email, role badge, status badge, last active
- Tap card to navigate to user detail
- Filters: full-screen filter modal triggered by filter icon
- Sticky bottom bar with "+ Add User" button
- Swipe left on card for quick actions (edit, deactivate)

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout as designed in Section 3 |
| Desktop | 1024px - 1439px | Table may truncate email column |
| Tablet | 768px - 1023px | See tablet notes above |
| Mobile | < 768px | See mobile notes above |

---

## 14. Stitch Prompt

```
Design a User Management list screen for a modern SaaS TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with a dark slate-900 sidebar (240px) on the left, white content area on the right. Top of content area has a page header with breadcrumb "Admin > Users", the title "User Management", and three action buttons on the right: a primary blue "+ Add User" button, a secondary outline "Bulk Invite" button with an upload icon, and a secondary outline "Export" button with a download icon.

Stats Bar: Below the header, show a row of 4 compact stat cards in a single horizontal line: "Total Users: 47" with a users icon, "Active: 42" with a green dot, "Inactive: 5" with a gray dot, "Online Now: 12" with a pulsing green dot. Each card has a white background, rounded-lg border, and subtle shadow.

Filter Bar: Below the stats, show a filter bar with: a search input with magnifying glass icon ("Search users..."), a "Role" multi-select dropdown, a "Status" dropdown, a "Last Login" date range picker, and a "Clear Filters" text button on the right.

Data Table: Below the filter bar, show a data table with these columns: checkbox (for bulk selection), Avatar (circular, 32px, showing initials with colored backgrounds), Name & Email (name as semibold primary text with email as gray-500 smaller text below, plus a small colored online/offline dot indicator next to the name), Role (colored badge -- blue for Admin, green for Dispatcher, purple for Accounting, teal for Sales), Status (badge -- green for Active, gray for Inactive, yellow for Pending), Last Active (relative time with a tiny 30-day activity sparkline bar chart next to it, 60px wide, gray bars), and a three-dot more menu icon at the end of each row.

Show 8 rows of realistic data:
- JD avatar (blue) | John Doe / john@ultralogistics.com | green online dot | Admin badge | Active | "2 min ago" + sparkline
- SM avatar (purple) | Sarah Mitchell / sarah@ultralogistics.com | green online dot | Sales Agent badge | Active | "15 min ago" + sparkline
- OA avatar (teal) | Omar Ali / omar@ultralogistics.com | yellow away dot | Dispatcher badge | Active | "45 min ago" + sparkline
- FK avatar (pink) | Fatima Khan / fatima@ultralogistics.com | gray offline dot | Accounting badge | Active | "3 hours ago" + sparkline
- RJ avatar (green) | Rachel Johnson / rachel@ultralogistics.com | gray offline dot | Carrier Relations badge | Active | "1 day ago" + sparkline
- MB avatar (orange) | Mike Brown / mike@ultralogistics.com | gray offline dot | Support badge | Inactive | "32 days ago" + sparkline (very low bars)
- AL avatar (red) | Amy Lee / amy@ultralogistics.com | N/A | Sales Agent badge | Pending (yellow) | "Never" + flat sparkline
- TW avatar (blue) | Tom Wilson / tom@ultralogistics.com | gray offline dot | Read Only badge | Active | "5 days ago" + sparkline

Bottom: Show pagination "Showing 1-8 of 47 users" with page navigation arrows and a "25 per page" dropdown.

Design Specifications:
- Font: Inter or system sans-serif, 14px base size
- Sidebar: slate-900 background, white text, blue-600 active indicator on "Users" menu item under "Admin" section
- Content background: gray-50 for page, white for table and cards
- Primary color: blue-600 for buttons and links
- Table rows: subtle hover state with gray-50 background, border-b border-gray-100 between rows
- Stat cards: white background, rounded-lg, border border-gray-200
- Avatar circles: 32px, various background colors with white initials text
- Role badges: small rounded-full pills with colored backgrounds matching role type
- Status badges: small rounded-full pills (green/gray/yellow/red)
- Online dots: 8px circles -- green with subtle pulse animation, yellow solid, gray solid
- Sparkline bars: 60px wide, 16px tall, gray-300 bars with varying heights
- Modern SaaS aesthetic similar to Linear.app or Clerk dashboard
- Include: checkbox column for bulk selection, hover state showing row background change, three-dot menu icon on each row
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1 -- Enhancement Focus)

**What's built and working:**
- [x] Paginated user list table with sorting
- [x] Search by name and email
- [x] Filter by role (dropdown)
- [x] Filter by status (Active/Inactive)
- [x] Create user modal (name, email, role)
- [x] Edit user modal (update fields)
- [x] Status badges (Active green, Inactive gray)
- [x] Role badges per user row
- [x] Click-through to User Detail page
- [x] Pagination with page size selector

**What needs polish / bug fixes:**
- [ ] Loading skeleton does not match actual table column widths
- [ ] Filter state is lost on browser back navigation -- persist in URL params
- [ ] Mobile card view is missing role information
- [ ] Search does not highlight matched text in results

**What to add this wave:**
- [ ] Bulk invite users via CSV upload with preview and validation
- [ ] User activity sparkline (30-day login frequency mini chart per row)
- [ ] Online/away/offline presence indicator dot next to user name
- [ ] Quick inline role change from table (click role badge to open dropdown)
- [ ] User deactivation with required reason (logged to audit trail)
- [ ] Delegated admin capability (manage only own team members)
- [ ] Export user list to CSV with all visible columns and role details
- [ ] Advanced date range filters for last login and creation date
- [ ] User avatar display in table rows (photo or initials with color)
- [ ] Impersonation button for Super Admin with audit trail and warning dialog

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Bulk invite via CSV | High | Medium | P0 |
| Online presence indicator | Medium | Low | P0 |
| User avatar in table | Medium | Low | P0 |
| Quick inline role change | High | Low | P1 |
| Export user list to CSV | Medium | Low | P1 |
| Deactivation with reason | Medium | Low | P1 |
| Activity sparkline | Medium | Medium | P1 |
| Advanced date range filters | Medium | Low | P1 |
| Impersonation button | High | Medium | P2 |
| Delegated admin | High | High | P2 |

### Future Wave Preview

- **Wave 2:** Add team management views (group users by department/team), user onboarding wizard with step-by-step setup, notification preferences bulk configuration
- **Wave 3:** SSO/SAML integration status indicators per user, directory sync status (Azure AD, Google Workspace), automated user provisioning from HR system

---

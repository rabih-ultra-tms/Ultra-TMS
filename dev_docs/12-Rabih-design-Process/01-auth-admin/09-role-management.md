# Role Management

> Service: Auth & Admin | Wave: 1 (Enhancement Focus) | Priority: P0
> Route: /(dashboard)/admin/roles | Status: Built
> Primary Personas: Admin
> Roles with Access: Super Admin, Admin

---

## 1. Purpose & Business Context

**What this screen does:**
Displays a list of all roles defined within the tenant, showing each role's name, description, number of assigned users, system/custom flag, and creation date. Allows admins to create new custom roles, clone existing roles, and navigate to the role editor for permission configuration.

**Business problem it solves:**
Freight brokerages have diverse teams -- dispatchers, sales agents, accounting staff, carrier relations, support -- each needing different access levels. Without granular role management, organizations either give too much access (security risk) or too little (productivity bottleneck). This screen provides the central point for designing and maintaining the access control structure.

**Key business rules:**
- 7 system-default roles cannot be deleted (Super Admin, Admin, Ops Manager, Dispatcher, Sales Agent, Accounting, Carrier Relations, Support, Read Only)
- System roles can have their permissions modified but not be renamed or deleted
- Custom roles must have a unique name within the tenant
- A role cannot be deleted if it has users assigned to it (must reassign first)
- At least one Admin role must exist at all times
- Role changes take effect immediately for all assigned users

**Success metric:**
Admin can create a new custom role with appropriate permissions and assign it to users within 3 minutes. Role audit trail is complete for compliance.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Admin sidebar navigation | Click "Roles" menu item | None |
| User Detail page | Click role badge link | roleId (scrolls to/highlights that role) |
| User Management | Click role filter badge | ?role= filter param |
| Direct URL | Bookmark / shared link | Query params |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Role Editor | Click role row or "Edit Permissions" | roleId |
| Create Role | Click "+ New Role" button | None (new form) |
| User Management | Click user count link on a role | ?role= filter |
| Role Comparison | Click "Compare" after selecting 2 roles | roleId1, roleId2 |

**Primary trigger:**
Admin navigates to the Admin section and clicks "Roles" to review existing roles, check user assignments, or create/modify roles for organizational needs.

**Success criteria (user completes the screen when):**
- Admin has reviewed the role structure and user assignments
- Admin has created, cloned, or modified a role's basic info
- Admin has navigated to the role editor for permission changes

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Admin > Roles           [+ New Role] [Compare Roles] |
+------------------------------------------------------------------+
|  Stats: [Total: 11] [System: 7] [Custom: 4] [Users Assigned: 47] |
+------------------------------------------------------------------+
|  Filters: [Search roles...]  [Type: All/System/Custom ▼]         |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  | SYSTEM ROLES                                                 |  |
|  |-------------------------------------------------------------|  |
|  | Icon | Role Name       | Description       | Users | Actions|  |
|  |------|-----------------|-------------------|-------|--------|  |
|  | S    | Super Admin     | Platform-level... | 2     | View   |  |
|  | A    | Admin           | Full tenant...    | 3     | Edit   |  |
|  | O    | Ops Manager     | Operations...     | 4     | Edit   |  |
|  | D    | Dispatcher      | Dispatch focus... | 12    | Edit   |  |
|  | $    | Sales Agent     | CRM and quoting...| 8     | Edit   |  |
|  | F    | Accounting      | Financial...      | 5     | Edit   |  |
|  | C    | Carrier Rel.    | Carrier mgmt...   | 6     | Edit   |  |
|  | ?    | Support         | Limited ops...    | 4     | Edit   |  |
|  | R    | Read Only       | View only...      | 3     | Edit   |  |
|  |-------------------------------------------------------------|  |
|  | CUSTOM ROLES                                                 |  |
|  |-------------------------------------------------------------|  |
|  | +  | Senior Dispatch  | Advanced dispatch..| 2     | Edit   |  |
|  | +  | Regional Manager | Multi-office...   | 1     | Edit   |  |
|  +------------------------------------------------------------+  |
|  Showing 11 roles total                                          |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Role name, user count, system/custom indicator | Admin needs to quickly identify roles and their usage |
| **Secondary** (visible in table) | Description, creation date, last modified | Context for role purpose and recency |
| **Tertiary** (on hover or expand) | Permission count summary, top 3 modules with access | Quick permission overview without opening editor |
| **Hidden** (behind click -- role editor) | Full permission matrix, changelog, user list | Detailed configuration data |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Role Icon | Role.type (system/custom) | Colored icon or letter avatar representing role category | Table column 1 |
| 2 | Role Name | Role.name | Semibold text, clickable link to role editor | Table column 2 |
| 3 | Description | Role.description | Gray-500 text, truncated to 80 chars with tooltip for full text | Table column 3 |
| 4 | Users | COUNT(User.roles contains roleId) | Integer with user icon; clickable link to user list filtered by role | Table column 4 |
| 5 | Type | Role.isSystem | Badge: "System" (blue) or "Custom" (purple) | Table column 5 |
| 6 | Permissions | COUNT(Role.permissions) | "X permissions" text with mini progress bar showing coverage | Table column 6 |
| 7 | Last Modified | Role.updatedAt | Relative time ("3 days ago") | Table column 7 |
| 8 | Actions | N/A | Edit, Clone, Delete (dropdown) | Table column 8 |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Permission Coverage | COUNT(role.permissions) / COUNT(all_permissions) * 100 | Mini progress bar + percentage |
| 2 | Most Active Role | Role with highest user count | Highlighted row or badge |
| 3 | Unused Roles | Roles with 0 users assigned | Amber text or warning indicator |
| 4 | Total Users Assigned | SUM of user counts across all roles | Stat card number |

---

## 5. Features

### Core Features (Built -- Currently Live)

- [x] Roles table with name, description, user count, system/custom flag
- [x] Create new custom role (name and description)
- [x] Navigate to role editor for permission configuration
- [x] System role indicator (cannot delete system roles)
- [x] Basic search by role name
- [x] Sort by name, user count

### Enhancement Features (Wave 1 Additions)

- [ ] **Role comparison** -- Select 2 roles via checkbox, click "Compare" to open side-by-side permission diff view; green = role A only, red = role B only, gray = both have
- [ ] **Role usage analytics** -- Mini bar chart or sparkline showing which roles have the most users; identify over/under-utilized roles
- [ ] **Clone role with modifications** -- "Clone" action creates a copy with "Copy of [name]" default name; opens role editor with all permissions pre-filled for modification
- [ ] **Role hierarchy visualization** -- Toggle to tree/graph view showing parent-child role relationships and permission inheritance paths
- [ ] **Permission search** -- Search input that highlights which roles contain a specific permission (e.g., search "invoice" to see which roles can access invoicing)
- [ ] **Archived roles section** -- Collapsible section at bottom showing deactivated/archived roles with restore capability
- [ ] **Role templates** -- Pre-built templates for common logistics roles (e.g., "Freight Broker Dispatcher", "Warehouse Manager", "Regional Sales Director") that can be installed as custom roles

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View role list | admin, super_admin | role_view | Redirect to dashboard with "Access Denied" |
| Create role | admin, super_admin | role_create | "+ New Role" button hidden |
| Edit role permissions | admin, super_admin | role_edit | Edit action hidden; row click goes to read-only view |
| Delete custom role | admin, super_admin | role_delete | Delete action hidden from dropdown |
| Clone role | admin, super_admin | role_create | Clone action hidden from dropdown |
| Compare roles | admin, super_admin | role_view | Compare button hidden |

---

## 6. Status & State Machine

### Role States

```
[Active] ---(Archive)--> [Archived]
    ^                        |
    |                        v
    +---(Restore)------[Archived]

[Active] ---(Delete)--> [Deleted] (soft delete, only custom roles with 0 users)
```

### Actions Available Per State

| State | Available Actions | Restricted Actions |
|---|---|---|
| Active (System) | Edit Permissions, Clone, View Users | Delete, Rename, Archive |
| Active (Custom) | Edit Permissions, Rename, Clone, Archive, Delete (if 0 users) | Delete (if users assigned) |
| Archived | Restore, View (read-only), Delete (if 0 users) | Edit, Clone, Assign Users |

### Type Badge Colors

| Type | Background | Text | Tailwind Classes |
|---|---|---|---|
| System | blue-100 | blue-800 | `bg-blue-100 text-blue-800` |
| Custom | purple-100 | purple-800 | `bg-purple-100 text-purple-800` |
| Archived | gray-100 | gray-500 | `bg-gray-100 text-gray-500` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + New Role | Plus | Primary / Blue | Opens create role form (name, description, optional clone source) | No |
| Compare Roles | GitCompare | Secondary / Outline | Opens comparison view (requires 2 selected roles) | No |

### Row Actions (Dropdown per Row)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Edit Permissions | Shield | Navigate to /admin/roles/[id] | Always available |
| Clone Role | Copy | Creates copy and opens role editor | Always available |
| View Users | Users | Navigate to /admin/users?role=[id] | Always available |
| Archive Role | Archive | Moves role to archived state | Custom roles only |
| Delete Role | Trash | Deletes role permanently | Custom roles with 0 users only |

### Table Row Click

| Area | Action |
|---|---|
| Role name link | Navigate to role editor |
| User count link | Navigate to user list filtered by this role |
| Anywhere else on row | Navigate to role editor |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + N | Open create role form |
| Ctrl/Cmd + K | Focus search input |
| Escape | Close modal / deselect |
| Enter | Open selected role editor |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop (future: reorder role hierarchy) |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| role.created | { roleId, name, description } | Add new row to table; update stat cards |
| role.updated | { roleId, changedFields } | Update row data; flash highlight |
| role.deleted | { roleId } | Remove row from table; update stat cards |
| role.users.changed | { roleId, newCount } | Update user count in affected role row |

### Live Update Behavior

- **Update frequency:** WebSocket push for role changes; stat card refresh every 120s
- **Visual indicator:** Flash changed row with subtle blue highlight
- **Conflict handling:** If admin has role editor open for a role that another admin modifies, show conflict banner

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 120 seconds
- **Endpoint:** GET /api/v1/roles?updatedSince={timestamp}
- **Visual indicator:** "Live updates paused" subtle indicator

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Delete role | Immediately remove row with fade animation | Re-add row, show error toast |
| Clone role | Add new row at top with loading indicator | Remove row, show error toast |
| Archive role | Move row to archived section | Move back, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| roles-table | src/components/admin/roles-table.tsx | roles, columns, onSort, actions |
| role-form | src/components/admin/role-form.tsx | mode: 'create' or 'edit', roleData |
| DataTable | src/components/ui/data-table.tsx | columns, data, pagination, sorting |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| StatusBadge | src/components/ui/status-badge.tsx | status, size |
| Badge | shadcn badge | variant, children |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| roles-table | Basic columns: name, description, user count, system flag | Add permission count column with mini progress bar, last modified column, role icon/avatar, row selection checkboxes for comparison |
| role-form | Simple name + description form | Add clone source dropdown, template selection, description character counter |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| RoleComparisonView | Side-by-side diff of two roles' permissions; green/red/gray color coding per permission; grouped by module | High -- complex layout with diff logic |
| RoleHierarchyTree | Tree or directed graph visualization showing role relationships and permission inheritance | Medium -- tree layout using D3 or similar |
| PermissionSearchHighlighter | Search input that filters and highlights roles containing a specific permission name | Small -- filter + highlight logic |
| RoleUsageChart | Mini horizontal bar chart showing user count per role, sorted descending | Small -- simple chart |
| RoleTemplateSelector | Card grid showing pre-built role templates with name, description, permission summary, and "Install" button | Medium -- card grid with preview |
| ArchivedRolesSection | Collapsible section showing archived roles with restore/delete actions | Small -- collapsible list |
| PermissionCoverageBar | Mini progress bar showing what percentage of total permissions a role has | Small -- progress bar component |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Checkbox | checkbox | Row selection for comparison |
| Collapsible | collapsible | Archived roles section |
| Dialog | dialog | Create role, clone role |
| Alert Dialog | alert-dialog | Delete confirmation |
| Progress | progress | Permission coverage bar |
| Tooltip | tooltip | Truncated description, permission details |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/roles | Fetch all roles with user counts | useRoles() |
| 2 | GET | /api/v1/roles/:id | Fetch single role with permissions | useRole(id) |
| 3 | POST | /api/v1/roles | Create new custom role | useCreateRole() |
| 4 | PATCH | /api/v1/roles/:id | Update role name/description | useUpdateRole() |
| 5 | DELETE | /api/v1/roles/:id | Delete custom role (0 users only) | useDeleteRole() |
| 6 | POST | /api/v1/roles/:id/clone | Clone role with new name | useCloneRole() |
| 7 | PATCH | /api/v1/roles/:id/archive | Archive a custom role | useArchiveRole() |
| 8 | PATCH | /api/v1/roles/:id/restore | Restore an archived role | useRestoreRole() |
| 9 | GET | /api/v1/roles/compare?ids=id1,id2 | Get permission diff between two roles | useCompareRoles(id1, id2) |
| 10 | GET | /api/v1/roles/templates | Fetch available role templates | useRoleTemplates() |
| 11 | POST | /api/v1/roles/from-template/:templateId | Create role from template | useCreateFromTemplate() |
| 12 | GET | /api/v1/permissions | Fetch all available permissions (for coverage calculation) | usePermissions() |
| 13 | GET | /api/v1/roles/search-permissions?q=term | Search roles by permission name | useSearchPermissions(term) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| admin:{tenantId} | role.created | useRoleListUpdates() -- adds row |
| admin:{tenantId} | role.updated | useRoleListUpdates() -- updates row |
| admin:{tenantId} | role.deleted | useRoleListUpdates() -- removes row |
| admin:{tenantId} | role.users.changed | useRoleListUpdates() -- updates user count |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| GET /api/v1/roles | N/A | Redirect to login | "Access Denied" page | N/A | N/A | Error state with retry |
| POST /api/v1/roles | "Role name already exists" toast | Redirect to login | "Permission Denied" toast | N/A | "Duplicate name" toast | Error toast |
| DELETE /api/v1/roles/:id | N/A | Redirect to login | "Cannot delete system role" toast | "Role not found" toast | "Role has users assigned" toast | Error toast |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show 9 skeleton rows (7 system + 2 custom) with text bars matching column widths. Stat cards show skeleton numbers.
- **Progressive loading:** Header and filters render immediately; skeleton for table and stats.
- **Duration threshold:** If loading exceeds 5s, show "Loading roles..." message.

### Empty States

**No custom roles (only system defaults exist):**
- **Section message:** "No custom roles created yet"
- **Description:** "Create a custom role to define specialized access for your team."
- **CTA:** "Create Custom Role" button

**Search/filter returns no results:**
- **Headline:** "No roles match your search"
- **Description:** "Try adjusting your search term."
- **CTA:** "Clear Search" button

### Error States

**Full page error:**
- **Display:** Error icon + "Unable to load roles" + Retry button

**Action error (delete fails because users assigned):**
- **Display:** Toast: "Cannot delete [role name]: X users are still assigned. Reassign them first." with link to user list filtered by role.

### Permission Denied

- **Full page denied:** "You don't have permission to manage roles" with link to dashboard
- **Partial denied:** Hide create/edit/delete actions; show read-only list

### Offline / Degraded

- **Full offline:** "You're offline. Showing cached role data."
- **Degraded:** Role list loads from cache; create/edit actions disabled with tooltip

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Search | Text input | Searches across role name, description | None | ?search= |
| 2 | Type | Dropdown | All, System, Custom | All | ?type= |
| 3 | Status | Dropdown | Active, Archived | Active | ?status= |

### Search Behavior

- **Search field:** Single search input at left of filter bar
- **Searches across:** Role name, role description, permission names (enhancement: permission search)
- **Behavior:** Debounced 300ms, minimum 2 characters
- **URL param:** ?search=

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Name | Ascending (A-Z) | Alphabetical |
| Users | Descending (most users first) | Numeric |
| Permissions | Descending (most permissions first) | Numeric |
| Last Modified | Descending (most recent) | Date |

**Default sort:** System roles first (grouped), then custom roles alphabetically

### Saved Filters / Presets

- **System presets:** "All Roles", "System Only", "Custom Only", "Unused Roles (0 users)"
- **URL sync:** Filter state reflected in URL params

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Stat cards: 2 per row instead of 4
- Table hides "Last Modified" and "Permissions" columns
- Description column truncates more aggressively (60 chars)
- Compare button moves to overflow menu

### Mobile (< 768px)

- Table switches to card list view: each role is a card with name, description (2 lines), user count badge, type badge
- Tap card to navigate to role editor
- Stats bar becomes horizontal scroll
- Create button becomes floating action button (FAB) at bottom right
- Filters become full-screen modal

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout as designed |
| Desktop | 1024px - 1439px | Table slightly compressed |
| Tablet | 768px - 1023px | See tablet notes |
| Mobile | < 768px | See mobile notes |

---

## 14. Stitch Prompt

```
Design a Role Management list screen for a modern SaaS TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with a dark slate-900 sidebar (240px) on the left, white content area on the right. Top of content area has a page header with breadcrumb "Admin > Roles", the title "Role Management", and two buttons on the right: a primary blue "+ New Role" button with a plus icon, and a secondary outline "Compare Roles" button with a git-compare icon.

Stats Bar: Below the header, show 4 compact stat cards in a row: "Total Roles: 11" with a shield icon, "System: 7" with a lock icon and blue badge, "Custom: 4" with a star icon and purple badge, "Users Assigned: 47" with a users icon. White cards with rounded-lg borders and subtle shadow.

Filter Bar: Below stats, show a search input ("Search roles...") and a "Type" dropdown filter (All / System / Custom).

Data Table: Grouped into two sections with section headers.

SYSTEM ROLES section (gray-50 background header row with "System Roles" label and lock icon):
Show 9 rows with these columns: a colored role icon (32px circle with letter), Role Name (semibold, clickable link), Description (gray-500 text, truncated), Users (integer with small user icon, clickable blue link), Type (blue "System" badge), Permissions (number + small progress bar showing coverage percentage), Last Modified (relative time), and a three-dot actions menu.

Rows:
- Blue circle "SA" | Super Admin | "Platform-level access across all tenants" | 2 users | System | 128 perms (100% bar) | "Never modified"
- Blue circle "A" | Admin | "Full tenant-level access" | 3 users | System | 124 perms (97% bar) | "5 days ago"
- Green circle "OM" | Operations Manager | "Operations oversight and team management" | 4 users | System | 86 perms (67% bar) | "2 weeks ago"
- Green circle "D" | Dispatcher | "Dispatch focus with carrier coordination" | 12 users | System | 62 perms (48% bar) | "1 week ago"
- Teal circle "S" | Sales Agent | "CRM, quoting, and customer management" | 8 users | System | 54 perms (42% bar) | "3 days ago"
- Purple circle "AC" | Accounting | "Financial operations and reporting" | 5 users | System | 48 perms (38% bar) | "10 days ago"
- Orange circle "CR" | Carrier Relations | "Carrier management and compliance" | 6 users | System | 44 perms (34% bar) | "1 month ago"
- Gray circle "SP" | Support | "Limited operations with view-heavy access" | 4 users | System | 38 perms (30% bar) | "2 months ago"
- Gray circle "RO" | Read Only | "View-only access across tenant" | 3 users | System | 22 perms (17% bar) | "Never modified"

CUSTOM ROLES section (purple-50 background header row with "Custom Roles" label and star icon):
Show 2 rows:
- Purple circle "SD" | Senior Dispatcher | "Advanced dispatch with rate approval" | 2 users | Custom (purple badge) | 72 perms (56% bar) | "Yesterday"
- Purple circle "RM" | Regional Manager | "Multi-office operational oversight" | 1 user | Custom (purple badge) | 92 perms (72% bar) | "3 days ago"

Design Specifications:
- Font: Inter or system sans-serif, 14px base
- Role icon circles: 32px with distinct colors per role category (blue for admin-level, green for operations, teal for sales, purple for finance, orange for carrier, gray for limited access)
- Permission progress bars: 80px wide, 6px tall, rounded, blue-500 fill on gray-200 background
- User count: blue-600 text, clickable, with small user icon
- Type badges: "System" in blue-100/blue-800, "Custom" in purple-100/purple-800
- Section headers: slightly darker background (gray-50 for system, purple-50 for custom) with bold label
- Table rows: white background, hover gray-50, border-b border-gray-100
- Modern SaaS aesthetic similar to Auth0 roles page or Clerk dashboard
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1 -- Enhancement Focus)

**What's built and working:**
- [x] Roles table with name, description, user count, system/custom flag
- [x] Create new custom role with name and description
- [x] Navigate to role editor (permission matrix) for any role
- [x] System role indicator preventing deletion
- [x] Basic search by role name
- [x] Sort by name and user count
- [x] 7 default system roles pre-configured

**What needs polish / bug fixes:**
- [ ] No visual distinction between system and custom role sections in the table
- [ ] User count is not a clickable link to the filtered user list
- [ ] Description truncation does not show full text on hover
- [ ] No indication of permission count or coverage per role

**What to add this wave:**
- [ ] Role comparison: select 2 roles and show side-by-side permission diff (green/red/gray coding)
- [ ] Role usage analytics: mini bar chart or indicators showing which roles are most/least used
- [ ] Clone role with modifications: one-click copy that opens editor with all permissions pre-filled
- [ ] Role hierarchy visualization: tree/graph view showing parent-child relationships and inheritance
- [ ] Permission search: search input that highlights which roles contain a specific permission
- [ ] Archived roles section: collapsible section for deactivated roles with restore capability
- [ ] Role templates: pre-built templates for common logistics roles with one-click install

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Clone role with modifications | High | Low | P0 |
| Role comparison (side-by-side diff) | High | Medium | P0 |
| Permission search across roles | Medium | Low | P1 |
| Permission coverage indicator per role | Medium | Low | P1 |
| Role usage analytics | Medium | Low | P1 |
| Archived roles section | Low | Low | P1 |
| Role hierarchy visualization | Medium | High | P2 |
| Role templates for logistics | Medium | Medium | P2 |

### Future Wave Preview

- **Wave 2:** Role expiration (temporary roles with auto-revoke), role assignment workflows (request/approve), role change impact analysis ("changing this role affects 12 users -- preview what they lose/gain")
- **Wave 3:** AI-suggested role optimization (identify redundant roles, suggest consolidation), cross-tenant role templates (Super Admin can push role templates to tenants)

---

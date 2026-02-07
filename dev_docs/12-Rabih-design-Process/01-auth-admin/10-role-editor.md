# Role Editor

> Service: Auth & Admin | Wave: 1 (Enhancement Focus) | Priority: P0
> Route: /(dashboard)/admin/roles/[id] | Status: Built
> Primary Personas: Admin
> Roles with Access: Super Admin, Admin

---

## 1. Purpose & Business Context

**What this screen does:**
Provides a comprehensive editor for configuring a role's name, description, and permission matrix. The permission matrix is organized by module (CRM, Operations, Accounting, Carrier, Admin) with CRUD-style checkboxes per resource within each module. This is where the actual access control policy is defined.

**Business problem it solves:**
Freight brokerages need precise control over who can do what. A dispatcher should not approve invoices. An accounting clerk should not reassign carriers. This screen allows admins to define exactly which actions each role can perform, organized by functional module, preventing both security breaches and operational errors.

**Key business rules:**
- System role names and descriptions cannot be changed (only permissions can be modified)
- Removing a permission takes effect immediately for all users with this role
- The Admin role must always retain user_manage and role_manage permissions (cannot lock yourself out)
- Permission dependencies exist: "Edit" requires "View"; "Delete" requires "Edit"; "Approve" requires "View"
- Changes to permissions are logged in the audit trail with before/after diff
- A role must have at least one permission assigned
- Super Admin role permissions cannot be modified (full access always)

**Success metric:**
Admin can configure a complete role with 50+ permissions across all modules within 5 minutes. Permission changes propagate to affected users within 1 second.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Role Management list | Click role row or "Edit Permissions" | roleId |
| Role Management list | Click "Clone" action | sourceRoleId (pre-fills permissions) |
| Create Role form | After creating role name/description | New roleId |
| User Detail page | Click role badge link then "Edit Permissions" | roleId |
| Direct URL | Bookmark / shared link | roleId in route param |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Role Management list | Click "Back to Roles" breadcrumb or save + close | Updated role data |
| User Management | Click user count link | ?role= filter |
| Role Comparison | Click "Compare with..." button | roleId + second roleId |

**Primary trigger:**
Admin navigates to a role from the Role Management list to configure or review its permissions.

**Success criteria (user completes the screen when):**
- Admin has reviewed or modified the permission matrix for the role
- Admin has saved changes and confirmed they took effect
- Admin has verified the role grants appropriate access via the preview feature

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Admin > Roles > Dispatcher                           |
|  [Save Changes] [Compare With...] [Preview Access]    |
+------------------------------------------------------------------+
|                                                                    |
|  +--ROLE INFO (top section)------------------------------------+  |
|  | Name: [Dispatcher        ]  Description: [Dispatch focus... ]  |
|  | Type: System (blue badge)   Users: 12 (link)   Modified: 3d   |
|  +-------------------------------------------------------------+  |
|                                                                    |
|  [Permission Search: Search permissions...]                       |
|                                                                    |
|  +--PERMISSION MATRIX------------------------------------------+  |
|  |                                                               |  |
|  | [-] CRM (blue)                    View  Create  Edit  Delete  |  |
|  |     Leads                          [x]   [x]    [x]   [ ]    |  |
|  |     Customers                      [x]   [ ]    [ ]   [ ]    |  |
|  |     Contacts                       [x]   [ ]    [ ]   [ ]    |  |
|  |     [Select All CRM: View All | Edit All | Full Access]      |  |
|  |                                                               |  |
|  | [-] Operations (green)            View  Create  Edit  Delete  |  |
|  |     Orders                         [x]   [x]    [x]   [ ]    |  |
|  |     Loads                          [x]   [x]    [x]   [x]    |  |
|  |     Dispatch Board                 [x]   ---    [x]   ---    |  |
|  |     Tracking Map                   [x]   ---    ---   ---    |  |
|  |     Stops                          [x]   [x]    [x]   [x]    |  |
|  |     Check Calls                    [x]   [x]    [x]   [ ]    |  |
|  |     [Select All Operations: View All | Edit All | Full Access]|  |
|  |                                                               |  |
|  | [+] Accounting (purple) -- collapsed                          |  |
|  | [+] Carrier (orange) -- collapsed                             |  |
|  | [+] Admin (red) -- collapsed                                  |  |
|  | [+] Reports (teal) -- collapsed                               |  |
|  | [+] Communication (indigo) -- collapsed                       |  |
|  +-------------------------------------------------------------+  |
|                                                                    |
|  +--CHANGELOG (collapsible)------------------------------------+  |
|  | Recent Changes:                                               |  |
|  | - Feb 5: Added "Check Calls Edit" by John D.                 |  |
|  | - Jan 28: Removed "Invoice Delete" by Admin                  |  |
|  +-------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (top section, always visible) | Role name, type badge, user count, permission matrix | The matrix IS the primary content of this screen |
| **Secondary** (within matrix) | Module headers with color coding, select-all shortcuts | Helps navigate large permission set quickly |
| **Tertiary** (below matrix) | Changelog, modified date, last modified by | Audit trail for compliance |
| **Hidden** (behind button) | Access preview, role comparison, field-level permissions | Advanced features for deeper analysis |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Role Name | Role.name | Text input (editable for custom, read-only for system) | Top section |
| 2 | Description | Role.description | Textarea (editable for custom, read-only for system) | Top section |
| 3 | Type | Role.isSystem | "System" (blue badge) or "Custom" (purple badge) | Top section |
| 4 | User Count | COUNT(users with this role) | Integer, clickable link to user list | Top section |
| 5 | Last Modified | Role.updatedAt | "Modified 3 days ago by John Doe" | Top section |
| 6 | Module Name | PermissionModule.name | Collapsible section header with color indicator | Matrix section headers |
| 7 | Resource Name | Permission.resource | Row label within module section | Matrix row labels |
| 8 | Permission Checkbox | Role.permissions[].action | Checkbox: checked/unchecked per CRUD action | Matrix cells |
| 9 | Permission Count | COUNT(Role.permissions) | "X of Y permissions enabled" | Below matrix |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Unsaved Changes | Compare current state to last saved | Yellow "Unsaved changes" indicator in header |
| 2 | Module Permission Count | COUNT(checked) within module / COUNT(total) in module | "8/12" next to module header |
| 3 | Total Coverage | COUNT(all checked) / COUNT(all permissions) * 100 | Percentage in footer |
| 4 | Dependency Warning | If Edit checked but View unchecked | Amber warning icon on cell |

---

## 5. Features

### Core Features (Built -- Currently Live)

- [x] Role name and description form fields
- [x] Permissions matrix with module groupings
- [x] CRUD checkboxes per resource (View, Create, Edit, Delete)
- [x] Save permissions
- [x] System role indicator (name/description read-only)
- [x] Navigate back to role list

### Enhancement Features (Wave 1 Additions)

- [ ] **Visual permissions matrix with color-coded modules** -- Each module section has a distinct left-border color (CRM=blue, Operations=green, Accounting=purple, Carrier=orange, Admin=red, Reports=teal) and collapsible accordion behavior
- [ ] **"Select all" per module** -- Quick action buttons per module section: "View All", "Edit All", "Full Access", "Clear All" to bulk-toggle permissions within a module
- [ ] **Permission dependencies** -- Automatically enable "View" when "Edit" is checked; auto-enable "Edit" when "Delete" is checked; show dependency tooltip on hover
- [ ] **Access preview** -- "Preview Access" button opens simulated sidebar navigation showing exactly what menus and screens a user with this role would see; read-only simulation
- [ ] **Permission changelog** -- Collapsible section showing what permissions were added/removed, when, and by whom; diff view with green (added) and red (removed) highlighting
- [ ] **Permission search within matrix** -- Type-ahead search that filters the matrix to show only resources matching the search term; highlight matched text
- [ ] **Color-coded module sections** -- Distinct visual identity per module: CRM=blue-500 left border, Operations=green-500, Accounting=purple-500, Carrier=orange-500, Admin=red-500, Reports=teal-500
- [ ] **Compare with another role** -- Side-by-side diff view showing current role vs selected comparison role; green = current role only, red = comparison only, gray = both
- [ ] **Field-level permissions** -- Expandable sub-section per resource showing which specific fields are visible/editable (e.g., Customer: can view name but not credit limit)

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View role permissions | admin, super_admin | role_view | Read-only matrix (all checkboxes disabled) |
| Edit permissions | admin, super_admin | role_edit | Checkboxes enabled, save button visible |
| Edit role name/description | admin, super_admin | role_edit | Fields editable (custom roles only) |
| Delete role | admin, super_admin | role_delete | Delete button hidden |
| View changelog | admin, super_admin | audit_view | Changelog section hidden |
| Preview access | admin, super_admin | role_view | Preview button available |

---

## 6. Status & State Machine

### Editor States

```
[Viewing] ---(Click checkbox)--> [Editing (Unsaved Changes)]
                                        |
                            +-----------+-----------+
                            |                       |
                            v                       v
                    [Saving...]              [Discard Changes]
                        |                       |
                        v                       v
                    [Saved] ------>        [Viewing]
                        |
                        v
                    [Viewing]
```

### Save State Indicators

| State | Visual Indicator |
|---|---|
| No changes | Save button disabled (gray) |
| Unsaved changes | Save button enabled (blue); yellow "Unsaved changes" badge in header |
| Saving | Save button shows spinner; "Saving..." text |
| Saved | Brief green checkmark flash; "Changes saved" toast; button returns to disabled |
| Save failed | Red error toast; save button remains enabled for retry |

### Permission State Colors (Checkbox Matrix)

| State | Checkbox Style | Meaning |
|---|---|---|
| Enabled | Blue checked checkbox | Permission granted |
| Disabled | Unchecked checkbox | Permission not granted |
| Auto-enabled (dependency) | Blue checked with chain-link icon | Automatically enabled by dependency |
| Not applicable | Gray dash (---) | This action does not exist for this resource |
| Locked (system) | Blue checked, non-interactive | Cannot be removed from this system role |

---

## 7. Actions & Interactions

### Primary Action Buttons (Header Area)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Save Changes | Check | Primary / Blue (disabled if no changes) | Saves all permission changes | No (immediate save) |
| Compare With... | GitCompare | Secondary / Outline | Opens role selector, then shows diff | No |
| Preview Access | Eye | Secondary / Outline | Opens simulated navigation preview | No |

### Matrix Interactions

| Interaction | Behavior |
|---|---|
| Click checkbox | Toggle permission on/off; if enabling Edit, auto-enable View; if enabling Delete, auto-enable Edit+View |
| Click "View All" module shortcut | Check all View permissions in that module |
| Click "Edit All" module shortcut | Check all View + Edit permissions in that module |
| Click "Full Access" module shortcut | Check all View + Create + Edit + Delete in that module |
| Click "Clear All" module shortcut | Uncheck all permissions in that module (confirmation required) |
| Click module header | Expand/collapse module section |
| Search permissions | Filter matrix to show only matching resources |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + S | Save changes |
| Ctrl/Cmd + Z | Undo last permission change |
| Ctrl/Cmd + F | Focus permission search |
| Escape | Close preview/comparison modal |
| Space | Toggle focused checkbox |
| Tab | Move to next checkbox in row |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop on this screen |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| role.permissions.changed | { roleId, changedBy, changes[] } | If another admin edits the same role, show conflict banner with option to refresh or merge |
| role.deleted | { roleId } | Show "This role has been deleted" banner with link back to role list |
| role.users.changed | { roleId, newCount } | Update user count in top section |

### Live Update Behavior

- **Update frequency:** WebSocket push for role-specific events
- **Visual indicator:** Conflict banner if concurrent edit detected
- **Conflict handling:** "This role was modified by [name] at [time]. Your unsaved changes may conflict. [Refresh] [Keep My Changes]"

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 60 seconds (check for concurrent modifications)
- **Endpoint:** GET /api/v1/roles/:id/modified-since?since={timestamp}
- **Visual indicator:** "Live conflict detection paused" subtle indicator

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Toggle permission | Immediately update checkbox state | Revert checkbox, show error toast |
| Save all changes | Show "Saving..." then "Saved" | Show error toast, keep unsaved state |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| role-form | src/components/admin/role-form.tsx | mode: 'edit', roleData |
| role-permissions-editor | src/components/admin/role-permissions-editor.tsx | roleId, permissions, onChange |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| Badge | shadcn badge | variant, children |
| Checkbox | shadcn checkbox | checked, onChange, disabled |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| role-permissions-editor | Flat permissions matrix with module groupings and CRUD checkboxes | Add color-coded module headers, collapsible sections, select-all shortcuts per module, permission dependencies auto-toggle, search filter, field-level expansion |
| role-form | Name and description fields | Add type badge display, user count link, last modified display, unsaved changes indicator |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| PermissionMatrixModule | Collapsible module section with color-coded left border, header showing name + count + select-all shortcuts, and checkbox grid for resources | Medium -- accordion with complex header |
| PermissionDependencyHandler | Logic component that manages auto-enabling/disabling based on permission dependencies (View<-Edit<-Delete chain) | Small -- state logic |
| AccessPreviewModal | Full-screen or large modal showing simulated sidebar navigation and screen access for the current role; read-only | Medium -- sidebar recreation with conditional rendering |
| PermissionChangelogSection | Collapsible section showing permission change history with green (added) / red (removed) diff entries, dates, and user names | Medium -- timeline with diff coloring |
| RoleComparisonDrawer | Side panel or modal showing two roles' permissions side-by-side with diff highlighting | High -- dual-column matrix with diff logic |
| PermissionSearchFilter | Search input that filters the entire permission matrix to show only matching resources; highlight matched text | Small -- filter with highlight |
| ModuleSelectAllBar | Row of quick-action buttons per module: "View All", "Edit All", "Full Access", "Clear All" | Small -- button group |
| UnsavedChangesIndicator | Yellow badge/banner showing "X unsaved changes" with undo and discard options | Small -- indicator component |
| FieldLevelPermissions | Expandable sub-table under each resource showing individual field visibility/edit toggles | High -- nested table within matrix |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Accordion | accordion | Collapsible module sections |
| Checkbox | checkbox | Permission toggle per cell |
| Command | command | Permission search |
| Sheet | sheet | Comparison drawer |
| Alert Dialog | alert-dialog | "Clear All" confirmation, discard changes confirmation |
| Tooltip | tooltip | Permission descriptions, dependency explanations |
| Separator | separator | Between module sections |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/roles/:id | Fetch role with all permissions | useRole(id) |
| 2 | PATCH | /api/v1/roles/:id | Update role name/description | useUpdateRole() |
| 3 | PUT | /api/v1/roles/:id/permissions | Save complete permission set (replace all) | useSavePermissions() |
| 4 | GET | /api/v1/permissions | Fetch all available permissions grouped by module | useAllPermissions() |
| 5 | GET | /api/v1/permissions/dependencies | Fetch permission dependency map | usePermissionDependencies() |
| 6 | GET | /api/v1/roles/:id/changelog | Fetch permission change history | useRoleChangelog(id) |
| 7 | GET | /api/v1/roles/compare?ids=id1,id2 | Get diff between two roles | useCompareRoles(id1, id2) |
| 8 | GET | /api/v1/roles/:id/preview | Get simulated navigation/access for role | useRolePreview(id) |
| 9 | GET | /api/v1/permissions/fields/:resource | Fetch field-level permissions for a resource | useFieldPermissions(resource) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| role:{roleId} | role.permissions.changed | useRoleEditorUpdates(id) -- shows conflict banner |
| role:{roleId} | role.deleted | useRoleEditorUpdates(id) -- shows deleted banner |
| admin:{tenantId} | role.users.changed | useRoleEditorUpdates(id) -- updates user count |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| GET /api/v1/roles/:id | N/A | Redirect to login | "Access Denied" page | "Role not found" page | N/A | Error state with retry |
| PUT /api/v1/roles/:id/permissions | "Invalid permission configuration" toast | Redirect to login | "Permission Denied" toast | "Role not found" toast | "Concurrent modification" conflict dialog | Error toast with retry |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Top section shows text input skeletons. Matrix area shows 6 module header skeletons with 4 checkbox row skeletons each.
- **Progressive loading:** Role info loads first, then permission matrix, then changelog.
- **Duration threshold:** If matrix loading exceeds 3s, show "Loading permission matrix..." message.

### Empty States

**New role (no permissions assigned yet):**
- **Message:** All checkboxes unchecked. Show info banner: "This role has no permissions. Users with this role cannot access any features. Start by selecting permissions below."

**Changelog empty (new role, no history):**
- **Message:** "No changes recorded yet. Permission changes will appear here."

### Error States

**Full page error (role fetch fails):**
- **Display:** Error icon + "Unable to load role" + Retry button + "Back to Roles" link

**Save error:**
- **Display:** Red toast: "Failed to save permissions. [Error detail]." Save button remains enabled for retry. Unsaved changes preserved.

**Concurrent modification conflict:**
- **Display:** Amber banner: "This role was modified by [name] at [time]. [View Their Changes] [Keep My Changes] [Merge]"

### Permission Denied

- **Full page denied (no role_view):** Redirect to role list with "Access Denied" toast
- **Read-only (has role_view but not role_edit):** All checkboxes disabled; no save button; info banner "You have read-only access to this role's permissions"

### Offline / Degraded

- **Full offline:** "You're offline. Permission changes cannot be saved. Reconnect to save." Save button disabled.
- **Degraded:** Role data loads from cache; save is queued until connection restores.

---

## 12. Filters, Search & Sort

### Permission Search

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Permission Search | Text input | Searches across resource names and permission names | None | N/A (local filter) |

### Search Behavior

- **Search field:** Single search input above the permission matrix
- **Searches across:** Module names, resource names, permission action names
- **Behavior:** Instant filter (no debounce needed for local data); collapses non-matching modules; highlights matched text in yellow
- **Clear:** "X" button to clear search and restore full matrix view

### Module Sort Order

| Module | Display Order | Color |
|---|---|---|
| CRM | 1 | Blue-500 |
| Operations | 2 | Green-500 |
| Accounting | 3 | Purple-500 |
| Carrier | 4 | Orange-500 |
| Admin | 5 | Red-500 |
| Reports | 6 | Teal-500 |
| Communication | 7 | Indigo-500 |
| Documents | 8 | Amber-500 |

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Permission matrix uses horizontal scroll if columns exceed viewport
- Module sections remain collapsible; start collapsed by default to save space
- Action buttons move to a single "Actions" dropdown
- Role info section becomes more compact (single row)

### Mobile (< 768px)

- Permission matrix is challenging on mobile -- use card-based layout per resource instead of grid
- Each resource card shows: resource name, then 4 toggle switches (View, Create, Edit, Delete) stacked vertically
- Module headers become full-width accordion triggers
- Search becomes full-width input at top
- Save button becomes sticky bottom bar
- Role info stacks vertically

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full matrix layout as designed |
| Desktop | 1024px - 1439px | Matrix fits but slightly compressed |
| Tablet | 768px - 1023px | Horizontal scroll on matrix |
| Mobile | < 768px | Card-based permission layout |

---

## 14. Stitch Prompt

```
Design a Role Permissions Editor screen for a modern SaaS TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with a dark slate-900 sidebar (240px) on the left, white content area on the right. Top has a page header with breadcrumb "Admin > Roles > Dispatcher", the title "Dispatcher", and three buttons: a primary blue "Save Changes" button (disabled state, gray), a secondary "Compare With..." button with git-compare icon, and a secondary "Preview Access" button with eye icon.

Role Info Section: Below header, a white card with rounded-lg border containing: Role name input field showing "Dispatcher" (read-only for system roles, with lock icon), description textarea showing "Dispatch focus -- load assignment, carrier coordination, tracking", a blue "System" badge, "12 users" as a blue clickable link, and "Modified 3 days ago by John Doe" in gray-500 text. All in a single horizontal row.

Permission Search: Below role info, a search input with magnifying glass icon ("Search permissions...") spanning full width.

Permission Matrix: The main content area showing an expandable accordion-style permission matrix. Each module is a collapsible section with a distinct left border color (4px wide).

CRM Module (blue-500 left border, expanded):
- Header row: Blue folder icon, "CRM" in semibold, "(8/12 permissions)" in gray-400, and quick-action pills on the right: "View All" (outline blue), "Edit All" (outline blue), "Full Access" (outline blue), "Clear All" (outline red). Expand/collapse chevron on far left.
- Column headers: Resource, View, Create, Edit, Delete (right-aligned checkboxes)
- Rows with checkboxes:
  - Leads: [checked] [checked] [unchecked] [unchecked]
  - Customers: [checked] [unchecked] [unchecked] [unchecked]
  - Contacts: [checked] [unchecked] [unchecked] [unchecked]
  - Opportunities: [unchecked] [unchecked] [unchecked] [unchecked]

Operations Module (green-500 left border, expanded):
- Header: Green cog icon, "Operations" in semibold, "(18/24 permissions)", same quick-action pills
- Rows:
  - Orders: [checked] [checked] [checked] [unchecked]
  - Loads: [checked] [checked] [checked] [checked]
  - Dispatch Board: [checked] [---] [checked] [---] (dashes for N/A actions)
  - Tracking Map: [checked] [---] [---] [---]
  - Stops: [checked] [checked] [checked] [checked]
  - Check Calls: [checked] [checked] [checked] [unchecked]

Accounting Module (purple-500 left border, collapsed):
- Header: Purple calculator icon, "Accounting" in semibold, "(0/16 permissions)" in red-400 text, chevron pointing right (collapsed)

Carrier Module (orange-500 left border, collapsed):
- Header: Orange truck icon, "Carrier" in semibold, "(4/12 permissions)", chevron right

Admin Module (red-500 left border, collapsed):
- Header: Red shield icon, "Admin" in semibold, "(2/8 permissions)", chevron right

Reports Module (teal-500 left border, collapsed):
- Header: Teal chart icon, "Reports" in semibold, "(3/6 permissions)", chevron right

Below the matrix, show a collapsible "Permission Changelog" section with 3 recent entries:
- "Feb 5, 2026 -- John Doe added Check Calls Edit" (green + icon)
- "Jan 28, 2026 -- Admin removed Invoice Delete" (red - icon)
- "Jan 15, 2026 -- Admin added Tracking Map View" (green + icon)

Footer: "48 of 128 permissions enabled (38%)" with a thin progress bar.

Design Specifications:
- Font: Inter or system sans-serif, 14px base
- Module left borders: 4px solid with module-specific color
- Module headers: gray-50 background when expanded, white when collapsed
- Checkbox style: rounded-sm border-2, blue-600 when checked, gray-300 border when unchecked
- N/A cells: show em-dash (---) in gray-300
- Quick-action pills: small rounded-full outline buttons, 12px font
- Changelog entries: small text, green-600 for additions, red-600 for removals
- Progress bar: thin (4px), blue-500 fill on gray-200 background, full width
- Accordion chevrons: rotate 90 degrees on expand
- Modern SaaS aesthetic similar to Auth0 RBAC editor or Clerk permissions page
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1 -- Enhancement Focus)

**What's built and working:**
- [x] Role name and description form fields (editable for custom, read-only for system)
- [x] Permissions matrix organized by module groupings
- [x] CRUD checkboxes (View, Create, Edit, Delete) per resource
- [x] Save permissions action
- [x] System role indicator
- [x] Navigation back to role list

**What needs polish / bug fixes:**
- [ ] Module sections are not collapsible -- all expanded at once makes the page very long
- [ ] No visual color distinction between modules (all same gray styling)
- [ ] No "select all" shortcuts per module -- tedious for bulk permission assignment
- [ ] Unsaved changes are lost without warning if navigating away
- [ ] No indication of which permissions were recently changed

**What to add this wave:**
- [ ] Visual permissions matrix with color-coded module sections (CRM=blue, Operations=green, Accounting=purple, Carrier=orange, Admin=red, Reports=teal) and collapsible accordion behavior
- [ ] "Select all" shortcuts per module: "View All", "Edit All", "Full Access", "Clear All" buttons in each module header
- [ ] Permission dependencies: auto-enable View when Edit is checked; auto-enable Edit when Delete is checked; tooltip explaining dependency chain
- [ ] Access preview: simulated navigation sidebar showing exactly what screens and menus a user with this role would see
- [ ] Permission changelog: collapsible section showing added/removed permissions with dates, diff coloring (green/red), and admin name
- [ ] Permission search within matrix: type-ahead filter that shows only matching resources and highlights the match
- [ ] Compare with another role: side-by-side diff view showing permission differences between current and selected role
- [ ] Field-level permissions: expandable sub-rows per resource showing individual field visibility/edit controls
- [ ] Unsaved changes indicator with browser navigation guard ("You have unsaved changes. Discard?")

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Collapsible color-coded modules | High | Low | P0 |
| "Select all" per module | High | Low | P0 |
| Permission dependencies (auto-toggle) | High | Medium | P0 |
| Permission search within matrix | Medium | Low | P0 |
| Unsaved changes guard | Medium | Low | P0 |
| Access preview simulation | High | High | P1 |
| Permission changelog | Medium | Medium | P1 |
| Compare with another role | Medium | Medium | P1 |
| Color-coded module headers | Medium | Low | P1 |
| Field-level permissions | High | High | P2 |

### Future Wave Preview

- **Wave 2:** Conditional permissions (permission active only when condition met, e.g., "can edit orders only when status=Draft"), permission templates per module, bulk role update (apply permission changes across multiple roles)
- **Wave 3:** AI-assisted permission suggestions ("based on usage patterns, this role rarely uses Invoice Delete -- consider removing"), permission anomaly detection (flag roles with unusual permission combinations)

---

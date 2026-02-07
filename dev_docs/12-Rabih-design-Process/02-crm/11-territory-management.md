# Territory Management

> Service: CRM (Service 02) | Wave: 2 (Net-New) | Priority: P1
> Route: /(dashboard)/crm/territories | Status: Not Built
> Primary Personas: Sarah Chen (Ops Manager / Admin)
> Roles with Access: Sales Agent (view own territory), Sales Manager (view all), Ops Manager (full CRUD), Admin (full CRUD)

---

## 1. Purpose & Business Context

**What this screen does:**
Provides a configuration interface for defining, visualizing, and managing sales territories. Territories are geographic regions, customer segments, or industry verticals assigned to specific sales representatives. This screen enables territory creation, assignment of reps and accounts, map-based visualization of territory coverage, and performance metrics per territory.

**Business problem it solves:**
Without territory management, lead and account assignment is ad-hoc, leading to coverage gaps (no rep covering a region), overlap conflicts (multiple reps calling the same customer), and unbalanced workloads. This screen enables systematic territory definition, fair assignment, and visibility into territory performance, ensuring every market segment has dedicated coverage and reps have balanced portfolios.

**Key business rules:**
- Only Ops Managers and Admins can create, edit, or delete territories
- Sales Managers can view all territories but cannot modify them
- Sales Agents can view only their assigned territory details
- Each territory must have at least one assigned sales rep
- A company/account can belong to only one territory (no overlap)
- Territories are defined by one or more of: geographic region (state/zip), customer segment (Enterprise/Mid-Market/SMB), industry vertical
- Territory reassignment triggers automatic reassignment of all accounts in that territory to the new rep
- Territory quotas are set annually and tracked against actual revenue
- Lead routing rules can be linked to territory definitions for automatic assignment
- Territory changes are audited with timestamp and user

**Success metric:**
100% of active accounts are assigned to a territory. No territory has more than 2x the average account load. Territory-based lead routing reduces manual assignment by 80%. Win rate disparity between territories stays within 15%.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| CRM sidebar navigation | Click "Territories" menu item | None |
| CRM Dashboard | Click territory metrics widget | Optional territoryId |
| Admin Settings | Click "Territory Management" link | None |
| Company Detail | Click territory name badge on company header | territoryId |
| Direct URL | Bookmark / shared link | Query params |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Company Detail | Click company name in territory accounts list | companyId |
| Contact Detail | Click contact name in territory view | contactId |
| Opportunity Detail | Click opportunity in territory metrics | opportunityId |
| User Profile | Click assigned rep name | userId |
| Create Territory Modal | Click "+ New Territory" button | None |
| Edit Territory Modal | Click "Edit" on a territory | territoryId, prefilled data |

**Primary trigger:**
Sarah Chen (Ops Manager) opens Territory Management to review coverage across all territories, check if any territories are understaffed or overloaded, assign a new sales rep to a territory, and verify that all accounts have territory assignments.

**Success criteria (user completes the screen when):**
- User has reviewed all territory definitions and assignments
- User has verified no coverage gaps exist (unassigned accounts)
- User has balanced rep workload across territories
- User has created or modified territories to match current business needs
- User has reviewed territory performance metrics

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: CRM > Territories                                    |
|  Page Title: "Territory Management"        [+ New Territory]      |
+------------------------------------------------------------------+
|  Stats Overview:                                                   |
|  [Territories: 6] [Reps Assigned: 8] [Accounts Covered: 156]      |
|  [Unassigned Accounts: 12] [Avg Revenue/Territory: $340K]          |
+------------------------------------------------------------------+
|  View Toggle: [*Map View*] [List View]                            |
+------------------------------------------------------------------+

MAP VIEW (default):
+------------------------------------------------------------------+
|  +--------------------------------------------+ +--------------+  |
|  |                                            | | Territory    |  |
|  |           Interactive Map                   | | Sidebar      |  |
|  |                                            | |              |  |
|  |    +--------+                              | | Northeast    |  |
|  |    |  NE    |   +--------+                 | | James W.     |  |
|  |    | (blue) |   | Midwest|                 | | 42 accounts  |  |
|  |    |        |   | (green)|                 | | $1.2M rev    |  |
|  |    +--------+   |        |                 | | ------------ |  |
|  |                  +--------+                | | Southeast    |  |
|  |    +--------+                              | | Sarah C.     |  |
|  |    |  SE    |   +----------+               | | 38 accounts  |  |
|  |    |(orange)|   | Central  |               | | $980K rev    |  |
|  |    |        |   | (purple) |               | | ------------ |  |
|  |    +--------+   +----------+               | | Midwest      |  |
|  |                                            | | Tom L.       |  |
|  |    +---------+  +----------+               | | 31 accounts  |  |
|  |    | South   |  |  West    |               | | $850K rev    |  |
|  |    | (amber) |  | (cyan)   |               | | ------------ |  |
|  |    +---------+  +----------+               | | [+ 3 more]   |  |
|  +--------------------------------------------+ +--------------+  |
+------------------------------------------------------------------+

LIST VIEW (toggle):
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  | Territory   | Type      | Rep(s)    | Accounts | Revenue   |  |
|  |             |           |           |          | (LTM)     |  |
|  |-------------|-----------|-----------|----------|-----------|  |
|  | Northeast   | Geographic| James W.  | 42       | $1.2M     |  |
|  |             | NY,NJ,CT  | +Lisa P.  |          |           |  |
|  | Southeast   | Geographic| Sarah C.  | 38       | $980K     |  |
|  |             | FL,GA,SC  |           |          |           |  |
|  | Midwest     | Geographic| Tom L.    | 31       | $850K     |  |
|  |             | IL,IN,OH  |           |          |           |  |
|  | Central     | Geographic| Omar H.   | 25       | $620K     |  |
|  |             | TX,OK,AR  |           |          |           |  |
|  | West Coast  | Geographic| Amy C.    | 20       | $540K     |  |
|  |             | CA,WA,OR  |           |          |           |  |
|  | Enterprise  | Segment   | Mike B.   | 12       | $1.8M     |  |
|  |             | Rev>$100K |           |          |           |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+

TERRITORY DETAIL (click territory row or map region):
+------------------------------------------------------------------+
|  Territory: Northeast                               [Edit] [Del]  |
|  Type: Geographic | States: NY, NJ, CT, MA, PA                   |
|  Rep(s): James Wilson (Primary), Lisa Park (Support)              |
|  Created: Nov 1, 2025 | Last Modified: Jan 10, 2026              |
+------------------------------------------------------------------+
|  Metrics:                                                         |
|  [Accounts: 42] [Open Opps: 8 | $620K] [Won LTM: $1.2M]         |
|  [Leads: 15] [Win Rate: 68%] [Avg Deal: $85K]                    |
+------------------------------------------------------------------+
|  Tabs: [Accounts] [Opportunities] [Leads] [Assignment Rules]      |
+------------------------------------------------------------------+
|  Accounts Tab:                                                    |
|  | Company        | Segment    | Revenue LTM | Rep      | Tier   |
|  |----------------|------------|-------------|----------|--------|
|  | Acme Logistics | Enterprise | $320K       | James W. | Plat   |
|  | Beta Freight   | Mid-Market | $180K       | James W. | Gold   |
|  | Gamma Trans    | SMB        | $45K        | Lisa P.  | Silver |
|  | ...            |            |             |          |        |
+------------------------------------------------------------------+
|  Assignment Rules:                                                |
|  Rule 1: New leads from states NY,NJ,CT -> Assign to James Wilson |
|  Rule 2: New leads with est_revenue > $50K -> Assign to James W.  |
|  Rule 3: Fallback -> Round-robin between James W. and Lisa P.     |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Territory name, assigned rep(s), account count, revenue | Quick assessment of coverage and performance |
| **Secondary** (stats bar / list view) | Territory type, geographic scope, open opportunities, leads | Definition and pipeline context |
| **Tertiary** (territory detail, click) | Account list, opportunity breakdown, assignment rules, win rate | Deep management data per territory |
| **Hidden** (modal/edit) | Territory creation form, rule configuration, quota settings | Administrative configuration |

---

## 4. Data Fields & Display

### Visible Fields (List View)

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Territory Name | Territory.name | Semibold text, clickable to detail | List column 1 |
| 2 | Territory Type | Territory.type | Badge: GEOGRAPHIC / SEGMENT / INDUSTRY / CUSTOM | List column 2 |
| 3 | Definition | Territory.definition (states, segments, etc.) | Comma-separated values below type | List column 2 subtext |
| 4 | Assigned Rep(s) | Territory.assigned_reps (join User.name) | Avatar stack + names | List column 3 |
| 5 | Primary Rep | Territory.primary_rep_id (join User.name) | First name with "(Primary)" label | List column 3 |
| 6 | Account Count | COUNT(Company) WHERE territory_id | Integer | List column 4 |
| 7 | Revenue LTM | SUM(won opportunity amount) last 12 months in territory | Currency $X.XM | List column 5 |
| 8 | Open Opportunities | COUNT(Opportunity) WHERE company.territory_id AND stage NOT CLOSED | Integer | List column 6 |
| 9 | Status | Territory.status | Badge: ACTIVE / INACTIVE | List column 7 |

### Territory Detail Fields

| # | Field Label | Source | Format | Location |
|---|---|---|---|---|
| 1 | States/Regions | Territory.states (array) | Comma-separated state codes | Detail header |
| 2 | Zip Codes | Territory.zip_codes (array) | Range display "10001-10299" | Detail header |
| 3 | Segment Filter | Territory.segment_filter | Badge: ENTERPRISE / MID_MARKET / SMB | Detail header |
| 4 | Industry Filter | Territory.industry_filter | Text label | Detail header |
| 5 | Quota (Annual) | Territory.annual_quota | Currency $X.XM | Metrics section |
| 6 | Quota Attainment | actual_revenue / annual_quota * 100 | Percentage with progress bar | Metrics section |
| 7 | Active Leads | COUNT(Lead) WHERE territory assignment rules match | Integer | Metrics section |
| 8 | Win Rate | CLOSED_WON / (CLOSED_WON + CLOSED_LOST) in territory | Percentage | Metrics section |
| 9 | Avg Deal Size | SUM(CLOSED_WON amount) / COUNT(CLOSED_WON) | Currency | Metrics section |
| 10 | Rep Capacity | Configurable max accounts per rep | "42 / 50 accounts" with progress | Detail sidebar |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Total Territories | COUNT(Territory) WHERE status = ACTIVE | Integer in stats bar |
| 2 | Assigned Reps | COUNT(DISTINCT assigned_reps) across all territories | Integer in stats bar |
| 3 | Covered Accounts | COUNT(Company) WHERE territory_id IS NOT NULL | Integer in stats bar |
| 4 | Unassigned Accounts | COUNT(Company) WHERE territory_id IS NULL AND status = ACTIVE | Integer (red if > 0) |
| 5 | Avg Revenue/Territory | SUM(territory revenue) / COUNT(territories) | Currency in stats bar |
| 6 | Coverage Gap | Regions/segments with no territory defined | List of unmatched criteria |
| 7 | Workload Balance | MAX(accounts) / MIN(accounts) across territories | Ratio "X:1" -- amber if > 2:1 |

---

## 5. Features

### Core Features (Net-New -- To Be Built)

- [ ] **Territory list view** -- Table of all territories with name, type, reps, accounts, revenue
- [ ] **Map view** -- Interactive US map with color-coded territory regions
- [ ] **Create territory** -- Form defining name, type (geographic/segment/industry/custom), criteria, assigned reps
- [ ] **Edit territory** -- Modify territory definition, assignments, quotas
- [ ] **Delete territory** -- Deactivate or delete (reassign accounts first)
- [ ] **Territory detail panel** -- Expandable/slide-over with accounts, opportunities, leads, rules
- [ ] **Stats overview bar** -- Territory count, rep count, coverage metrics, unassigned accounts
- [ ] **View toggle** -- Switch between Map and List views

### Advanced Features

- [ ] **Map-based territory visualization** -- Interactive map with colored regions, click to select territory, hover for summary
- [ ] **Drag accounts between territories** -- Reassign accounts by dragging from one territory to another
- [ ] **Assignment rules** -- Configure automatic lead/account routing rules per territory (state, revenue, segment)
- [ ] **Round-robin assignment** -- Auto-distribute leads among territory reps in round-robin fashion
- [ ] **Quota management** -- Set and track annual quotas per territory with attainment progress bars
- [ ] **Rep capacity tracking** -- Max accounts per rep with capacity indicators
- [ ] **Workload balancing** -- Visual comparison of account count and revenue across territories
- [ ] **Unassigned accounts list** -- View all accounts not in any territory with batch assignment
- [ ] **Coverage gap analysis** -- Identify regions or segments with no territory coverage
- [ ] **Territory comparison** -- Side-by-side metrics comparison between territories
- [ ] **Territory hierarchy** -- Parent/child territory relationships (e.g., US > Northeast > New York)
- [ ] **Bulk account reassignment** -- Move multiple accounts between territories
- [ ] **Territory change audit log** -- Track all territory definition and assignment changes
- [ ] **Map filter overlay** -- Toggle to show leads, opportunities, or accounts on map

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View territory list | All CRM users | territory_view | Only own territory visible (agents) |
| View all territories | sales_manager, ops_manager, admin | territory_view_all | Limited to own territory |
| Create territory | ops_manager, admin | territory_create | "+ New Territory" hidden |
| Edit territory | ops_manager, admin | territory_edit | "Edit" button hidden |
| Delete territory | admin | territory_delete | "Delete" hidden |
| Assign reps | ops_manager, admin | territory_assign | Rep assignment read-only |
| Set quotas | ops_manager, admin | territory_edit | Quota fields read-only |
| Configure rules | ops_manager, admin | territory_edit | Rules tab read-only |
| View map | All CRM users | territory_view | Map available in read-only mode |
| Bulk reassign | ops_manager, admin | territory_assign | Bulk actions hidden |

---

## 6. Status & State Machine

### Territory Status Transitions

```
[ACTIVE] --> [INACTIVE]  (deactivate -- accounts remain, no new assignments)
[INACTIVE] --> [ACTIVE]  (reactivate -- resume assignments)
[ACTIVE] --> [DELETED]   (soft delete -- only if no accounts assigned)
[INACTIVE] --> [DELETED] (soft delete -- only if no accounts assigned)
```

### Actions Available Per Status

| Status | Available Actions | Restricted Actions |
|---|---|---|
| ACTIVE | Edit, Deactivate, Assign Reps, Set Quotas, Configure Rules, Add Accounts | Delete (must deactivate first and remove accounts) |
| INACTIVE | Edit, Reactivate, Delete (if no accounts), Remove Accounts | Add Accounts, Configure Rules, Assign new leads |
| DELETED | View History only | All actions |

### Status Badge Colors

| Status | Background | Text | Tailwind Classes |
|---|---|---|---|
| ACTIVE | green-100 | green-800 | `bg-green-100 text-green-800` |
| INACTIVE | gray-100 | gray-600 | `bg-gray-100 text-gray-600` |

### Territory Type Badge Colors

| Type | Background | Text | Tailwind Classes |
|---|---|---|---|
| GEOGRAPHIC | blue-100 | blue-800 | `bg-blue-100 text-blue-800` |
| SEGMENT | purple-100 | purple-800 | `bg-purple-100 text-purple-800` |
| INDUSTRY | orange-100 | orange-800 | `bg-orange-100 text-orange-800` |
| CUSTOM | slate-100 | slate-800 | `bg-slate-100 text-slate-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + New Territory | Plus | Primary / Blue | Opens create territory modal/form | No |

### View Toggle

| Button | Icon | Action |
|---|---|---|
| Map View | Map | Switches to interactive map visualization |
| List View | List | Switches to table/list view |

### Territory Row Actions (List View)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| View Details | Eye | Opens territory detail panel | Always |
| Edit Territory | Pencil | Opens edit territory modal | ACTIVE or INACTIVE |
| Assign Reps | UserPlus | Opens rep assignment dialog | ACTIVE |
| Set Quota | Target | Opens quota edit field | ACTIVE |
| Deactivate | Pause | Deactivate territory | ACTIVE |
| Reactivate | Play | Reactivate territory | INACTIVE |
| Delete | Trash | Soft delete with confirmation | No accounts assigned |

### Map Interactions

| Interaction | Trigger | Result |
|---|---|---|
| Click region | Click on a colored map region | Opens territory detail panel for that territory |
| Hover region | Mouse enter on map region | Tooltip showing territory name, rep, account count, revenue |
| Click uncolored area | Click on area not in any territory | Shows "Uncovered region" info with option to create territory |
| Zoom in/out | Scroll wheel or zoom controls | Zoom map level |
| Pan | Click and drag on map | Move map viewport |
| Toggle overlay | Click overlay buttons | Show leads, accounts, or opportunities as pins on map |

### Territory Detail Panel Actions

| Tab | Action | Trigger | Result |
|---|---|---|---|
| Accounts | View company | Click company row | Navigate to /crm/companies/{id} |
| Accounts | Remove from territory | Click remove icon | Moves account to unassigned |
| Accounts | Add accounts | Click "+ Add Accounts" | Opens account search/select dialog |
| Opportunities | View opportunity | Click opportunity row | Navigate to /crm/opportunities/{id} |
| Leads | View lead | Click lead row | Navigate to /crm/leads/{id} |
| Assignment Rules | Add rule | Click "+ Add Rule" | Opens rule configuration form |
| Assignment Rules | Edit rule | Click rule | Opens rule editor |
| Assignment Rules | Delete rule | Click delete icon | Removes rule with confirmation |
| Assignment Rules | Reorder rules | Drag to reorder | Changes rule priority order |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + N | Open create territory modal |
| Ctrl/Cmd + E | Edit selected territory |
| V then M | Switch to map view |
| V then L | Switch to list view |
| Escape | Close detail panel / modal |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| Account row (in detail) | Different territory (in split view) | Reassign account to target territory |
| Assignment rule | Other rule position | Reorder rule priority |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| territory.created | { territoryId, name, type } | Add to list; update stats; add region to map |
| territory.updated | { territoryId, changes } | Update list row and map region; flash highlight |
| territory.deleted | { territoryId } | Remove from list and map; update stats |
| territory.rep.assigned | { territoryId, repId } | Update rep display in list and detail |
| territory.account.added | { territoryId, companyId } | Update account count; update map if relevant |
| territory.account.removed | { territoryId, companyId } | Update account count; move to unassigned |
| company.created | { companyId, state, segment } | Check assignment rules; update "Unassigned" count if no match |

### Live Update Behavior

- **Update frequency:** WebSocket push for territory changes; stats re-poll every 120 seconds
- **Visual indicator:** Changed list rows flash with blue highlight; map regions pulse briefly
- **Conflict handling:** If another admin edits a territory being viewed, show banner: "Territory updated by [name]. Refresh to see changes."

### Polling Fallback

- **When:** WebSocket drops
- **Interval:** Every 120 seconds
- **Endpoint:** GET /api/v1/crm/territories?updatedSince={timestamp}
- **Visual indicator:** "Live updates paused" banner

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Create territory | Immediately add to list | Remove, show error toast |
| Edit territory | Immediately show updated values | Revert, show error toast |
| Assign rep | Immediately update rep display | Revert, show error toast |
| Delete territory | Immediately remove from list | Re-insert, show error toast |
| Add account | Immediately update count | Revert count, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| StatusBadge | src/components/ui/status-badge.tsx | status, size |
| DataTable | src/components/ui/data-table.tsx | columns, data, pagination |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| FilterBar | src/components/ui/filter-bar.tsx | filters |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| DataTable | Standard table component | Add inline editing for quota fields, drag-to-reorder for rules |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| TerritoryMap | Interactive US map with colored regions, hover tooltips, click-to-select | Large -- map library integration (Mapbox/Leaflet), SVG region rendering, data overlays |
| TerritoryListView | Table with territory name, type, reps, accounts, revenue, status | Medium -- table with avatar stacks and metric displays |
| TerritoryDetailPanel | Slide-over panel with tabs: Accounts, Opportunities, Leads, Assignment Rules | Large -- multi-tab panel with embedded tables |
| TerritoryForm | Create/edit form: name, type, geographic criteria, segment filter, industry filter, assigned reps, quota | Large -- multi-section form with dynamic criteria based on type |
| TerritoryStatsBar | Stats row: territory count, rep count, coverage, unassigned, avg revenue | Small -- stat card row |
| AssignmentRuleEditor | Form for creating/editing lead routing rules per territory | Medium -- conditional logic builder |
| RepAssignmentDialog | Dialog for assigning/unassigning reps to territory with capacity display | Small -- user select with capacity info |
| QuotaProgressBar | Progress bar showing quota attainment with amount labels | Small -- progress bar with labels |
| CoverageGapIndicator | Warning display for unassigned accounts or uncovered regions | Small -- alert with count and link |
| WorkloadBalanceChart | Bar chart comparing account count and revenue across territories | Medium -- chart component |
| TerritoryComparisonModal | Side-by-side comparison of 2-3 territories on key metrics | Medium -- comparison table |
| AccountAssignmentDialog | Search and select accounts to add to a territory | Medium -- searchable list with filters |
| MapOverlayToggle | Button group to toggle map data layers (accounts, leads, opportunities) | Small -- toggle group |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Toggle Group | toggle-group | Map/List view toggle, map overlays |
| Dialog | dialog | Create/edit territory, rep assignment, account assignment |
| Sheet | sheet | Territory detail side panel |
| Badge | badge | Territory type, status badges |
| Progress | progress | Quota attainment, rep capacity bars |
| Avatar | avatar | Rep avatars |
| Table | table | Accounts, opportunities, leads tables in detail panel |
| Tooltip | tooltip | Map region hover, capacity info |
| Select | select | Type, state, segment dropdowns |
| Command | command | Account and rep search |
| Tabs | tabs | Territory detail tabs |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/crm/territories | Fetch all territories with summary stats | useTerritories() |
| 2 | GET | /api/v1/crm/territories/:id | Fetch territory detail with accounts, rules | useTerritory(id) |
| 3 | POST | /api/v1/crm/territories | Create a new territory | useCreateTerritory() |
| 4 | PATCH | /api/v1/crm/territories/:id | Update territory details | useUpdateTerritory() |
| 5 | PATCH | /api/v1/crm/territories/:id/status | Activate/deactivate territory | useUpdateTerritoryStatus() |
| 6 | DELETE | /api/v1/crm/territories/:id | Soft delete territory | useDeleteTerritory() |
| 7 | POST | /api/v1/crm/territories/:id/assign-rep | Assign rep to territory | useAssignTerritoryRep() |
| 8 | DELETE | /api/v1/crm/territories/:id/reps/:userId | Remove rep from territory | useRemoveTerritoryRep() |
| 9 | POST | /api/v1/crm/territories/:id/accounts | Add accounts to territory | useAddTerritoryAccounts() |
| 10 | DELETE | /api/v1/crm/territories/:id/accounts/:companyId | Remove account from territory | useRemoveTerritoryAccount() |
| 11 | GET | /api/v1/crm/territories/:id/accounts | Fetch accounts in territory | useTerritoryAccounts(id) |
| 12 | GET | /api/v1/crm/territories/:id/opportunities | Fetch opportunities in territory | useTerritoryOpportunities(id) |
| 13 | GET | /api/v1/crm/territories/:id/leads | Fetch leads matching territory rules | useTerritoryLeads(id) |
| 14 | GET | /api/v1/crm/territories/:id/rules | Fetch assignment rules | useTerritoryRules(id) |
| 15 | POST | /api/v1/crm/territories/:id/rules | Create assignment rule | useCreateTerritoryRule() |
| 16 | PATCH | /api/v1/crm/territories/:id/rules/:ruleId | Update assignment rule | useUpdateTerritoryRule() |
| 17 | DELETE | /api/v1/crm/territories/:id/rules/:ruleId | Delete assignment rule | useDeleteTerritoryRule() |
| 18 | GET | /api/v1/crm/territories/stats | Get overall territory stats | useTerritoryStats() |
| 19 | GET | /api/v1/crm/territories/unassigned-accounts | Get accounts not in any territory | useUnassignedAccounts() |
| 20 | GET | /api/v1/crm/territories/map-data | Get GeoJSON data for map rendering | useTerritoryMapData() |
| 21 | PATCH | /api/v1/crm/territories/:id/quota | Update territory quota | useUpdateTerritoryQuota() |
| 22 | GET | /api/v1/users?role=sales_agent | Fetch assignable reps | useSalesReps() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| crm:{tenantId}:territories | territory.created | useTerritoryListUpdates() -- adds to list |
| crm:{tenantId}:territories | territory.updated | useTerritoryListUpdates() -- updates row/map |
| crm:{tenantId}:territories | territory.deleted | useTerritoryListUpdates() -- removes |
| crm:{tenantId}:territories | territory.rep.assigned | useTerritoryListUpdates() -- updates rep display |
| crm:{tenantId}:territories | territory.account.added | useTerritoryListUpdates() -- updates counts |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| GET /api/v1/crm/territories | N/A | Redirect to login | "Access Denied" page | N/A | N/A | Error state with retry |
| POST /api/v1/crm/territories | Validation errors inline | Redirect to login | "Admin required" toast | N/A | "Name exists" toast | Error toast |
| PATCH .../status | "Invalid transition" toast | Redirect to login | "Admin required" | "Not found" | N/A | Error toast |
| DELETE /api/v1/crm/territories/:id | "Accounts still assigned" toast | Redirect to login | "Admin required" | "Not found" | N/A | Error toast |
| POST .../assign-rep | "Rep already assigned" toast | Redirect to login | "Admin required" | "Not found" | "Max reps reached" | Error toast |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Stats bar with 5 skeleton cards. Map view shows gray US outline with loading shimmer. List view shows 6 skeleton table rows.
- **Progressive loading:** Stats and list/map frame render immediately; territory data and map regions fill in afterward.
- **Duration threshold:** 5s for "Loading territories..." message. Map tiles may take longer -- show progress indicator.

### Empty States

**First-time empty (no territories created):**
- **Illustration:** Map/globe illustration
- **Headline:** "No territories defined"
- **Description:** "Create your first sales territory to organize account assignments and lead routing."
- **CTA:** "Create First Territory" (primary)

**No accounts in territory:**
- **Display:** "No accounts assigned to this territory yet."
- **CTA:** "+ Add Accounts" button

**No assignment rules:**
- **Display:** "No assignment rules configured. Leads will not be auto-routed to this territory."
- **CTA:** "+ Add Rule" button

### Error States

**Full page error:** Error icon + "Unable to load territories" + Retry
**Map load error:** Map area shows "Map could not be loaded" with list view fallback link
**Detail panel error:** Panel shows error with retry for specific territory

### Permission Denied

- **Full page denied (sales agent):** Limited view showing only their assigned territory with basic info
- **Partial denied:** Edit/Create/Delete actions hidden; list and map are read-only

### Offline / Degraded

- **Full offline:** Banner with cached data timestamp; map may not render (requires network for tiles)
- **Degraded:** "Live updates paused" indicator

### Edge Cases

- **Overlapping geographic criteria:** System prevents creating a territory with states already assigned to another territory -- shows conflict warning
- **Rep in multiple territories:** Allowed; system shows primary vs. support designation per territory
- **Account in no territory:** Shows in "Unassigned Accounts" list with red indicator in stats bar
- **Territory with no rep:** Warning indicator; territory exists but no one is assigned to work it
- **Quota exceeded:** Progress bar turns green with "Exceeded" label when attainment > 100%

---

## 12. Filters, Search & Sort

### Filters (List View)

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Search | Text input | Searches territory name, rep name | None | ?search= |
| 2 | Territory Type | Multi-select | GEOGRAPHIC, SEGMENT, INDUSTRY, CUSTOM | All | ?type= |
| 3 | Status | Select | ACTIVE, INACTIVE | ACTIVE | ?status= |
| 4 | Assigned Rep | Searchable select | All sales reps | All | ?repId= |
| 5 | Region | Multi-select | US regions or states | All | ?region= |

### Search Behavior

- **Search field:** Single input in filter bar
- **Searches across:** Territory name, assigned rep names, state codes
- **Behavior:** Debounced 300ms, minimum 2 characters
- **URL param:** ?search=

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Territory Name | Ascending (A-Z) | Alphabetical |
| Account Count | Descending (most first) | Numeric |
| Revenue LTM | Descending (highest first) | Numeric |
| Open Opportunities | Descending | Numeric |
| Status | ACTIVE first | Custom enum |

**Default sort:** Territory Name ascending

### Saved Filters / Presets

- **System presets:** "Active Territories", "Understaffed (no rep)", "High Revenue", "Coverage Gaps"
- **URL sync:** All filters reflected in URL

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Map view: same layout, slightly smaller map; sidebar scrollable
- List view: hide Revenue, Open Opportunities columns; keep Name, Type, Reps, Accounts, Status
- Territory detail panel: full-width slide-over instead of side panel
- Stats bar: 3 per row (2 rows)

### Mobile (< 768px)

- Default to List view (map impractical on small screens)
- Map view: simplified with zoom/pan; territory sidebar becomes bottom sheet
- List view: card-based layout (one card per territory)
- Each card: territory name, type badge, rep avatar + name, account count, revenue
- Territory detail: full-screen view with tabs
- Create/edit: full-screen form
- Stats: horizontal scroll strip
- No drag-and-drop for account reassignment; use explicit "Move" action

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout as designed in Section 3 |
| Desktop | 1024px - 1439px | Same layout, narrower map |
| Tablet | 768px - 1023px | See tablet notes above |
| Mobile | < 768px | See mobile notes above |

---

## 14. Stitch Prompt

```
Design a Territory Management screen for a modern SaaS TMS (Transportation Management System) called "Ultra TMS." This is a sales territory configuration screen for admin users.

Layout: Full-width page with dark slate-900 sidebar (240px) on the left with "CRM" > "Territories" highlighted with blue-600 indicator. White/gray-50 content area. Top has breadcrumb "CRM > Territories", title "Territory Management", and primary blue "+ New Territory" button with plus icon.

Stats Bar: 5 compact stat cards: "Territories: 6" (slate), "Reps Assigned: 8" (blue), "Accounts Covered: 156" (green), "Unassigned: 12" (red with warning icon), "Avg Revenue: $340K" (slate). White cards with rounded-lg borders.

View Toggle: Below stats, toggle group: "Map View" (active, blue-600) and "List View".

Map View: A large white card (rounded-lg, shadow-sm) containing an interactive US map taking 70% width. The map shows 6 colored regions:
- Northeast (NY, NJ, CT, MA, PA) in blue-200 with blue-600 border on hover
- Southeast (FL, GA, SC, NC) in orange-200
- Midwest (IL, IN, OH, MI, WI) in green-200
- Central (TX, OK, AR, LA) in purple-200
- West Coast (CA, WA, OR) in cyan-200
- South (TN, KY, AL, MS) in amber-200

Each region has a small label inside showing territory name. Uncolored states (e.g., MT, WY, ND) appear in gray-100.

Right sidebar (30% width): Scrollable list of territory cards. Each card: territory name in semibold, type badge (blue "GEOGRAPHIC"), assigned rep avatar (24px) + name, account count "42 accounts", revenue "$1.2M LTM". Active territory card has blue-600 left border. Show 4 territory cards with "View All" link at bottom.

Below the map, show a hovered state tooltip: "Northeast Territory | Rep: James Wilson | 42 accounts | $1.2M revenue | 8 open opportunities" as a floating card.

Include a small inset showing the List View alternative: table with columns Territory, Type, Rep(s), Accounts, Revenue (LTM), Open Opps, Status.

Below list view, show an expanded Territory Detail section: "Northeast" territory with tabs "Accounts (42)", "Opportunities (8)", "Leads (15)", "Assignment Rules (3)". Show Accounts tab with a table of companies: Acme Logistics (Enterprise, $320K, Platinum), Beta Freight (Mid-Market, $180K, Gold), etc.

Design Specifications:
- Font: Inter or system sans-serif, 14px base
- Sidebar: slate-900, white text, blue-600 active
- Content: gray-50 page, white cards/map container
- Primary: blue-600 for buttons, active states
- Map regions: pastel fills (blue-200, green-200, etc.) with darker borders on hover
- Territory cards: white, rounded-lg, shadow-sm, active has blue-600 left border (4px)
- Stats cards: white, rounded-lg, border-gray-200
- Unassigned count: red-600 text with alert-triangle icon
- Territory detail panel: white, rounded-lg, border-gray-200, tabbed interface
- Quota progress bar: thin (6px), green < 80%, amber 80-100%, green > 100%
- Modern SaaS aesthetic similar to Salesforce Territory Management or HubSpot territory features
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2 -- Net-New Build)

**What needs to be built from scratch:**
- [ ] Territory list view with CRUD operations
- [ ] Interactive map view with colored territory regions
- [ ] Territory creation form with type-based criteria
- [ ] Rep assignment to territories
- [ ] Account-to-territory assignment
- [ ] Stats overview bar
- [ ] Territory detail panel with tabs
- [ ] View toggle between map and list

**Post-MVP enhancements (within Wave 2):**
- [ ] Assignment rules for automatic lead routing
- [ ] Round-robin lead distribution within territory
- [ ] Quota management with attainment tracking
- [ ] Rep capacity indicators
- [ ] Unassigned accounts management
- [ ] Coverage gap analysis
- [ ] Workload balancing visualization
- [ ] Map overlay toggles (accounts, leads, opportunities as pins)
- [ ] Territory comparison modal
- [ ] Bulk account reassignment
- [ ] Territory audit log

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Territory list view with CRUD | Critical | Medium | P0 |
| Rep assignment | Critical | Low | P0 |
| Account-to-territory assignment | Critical | Medium | P0 |
| Stats overview bar | High | Low | P0 |
| Territory detail panel | High | Medium | P0 |
| Interactive map view | High | High | P0 |
| Territory creation form | Critical | Medium | P0 |
| Assignment rules | High | High | P1 |
| Round-robin distribution | Medium | Medium | P1 |
| Quota management | Medium | Medium | P1 |
| Unassigned accounts list | High | Low | P1 |
| Coverage gap analysis | Medium | Medium | P1 |
| Rep capacity tracking | Medium | Low | P1 |
| Map overlays | Low | Medium | P2 |
| Workload balance chart | Low | Medium | P2 |
| Territory comparison | Low | Medium | P2 |
| Territory hierarchy | Low | High | P2 |
| Audit log | Low | Medium | P2 |

### Future Wave Preview

- **Wave 3:** AI-powered territory optimization (recommend territory boundaries based on account density and rep capacity), predictive territory performance scoring, automated territory rebalancing proposals, heat map visualization of revenue density
- **Wave 4:** Dynamic territories that auto-adjust based on account growth, multi-dimensional territory definitions (geography + industry + size), territory-based commission plans, cross-territory collaboration rules, territory inheritance for new hires

---

# Opportunities List

> Service: CRM (Service 02) | Wave: 2 (Net-New) | Priority: P0
> Route: /(dashboard)/crm/opportunities | Status: Not Built
> Primary Personas: James Wilson (Sales Agent), Sarah Chen (Ops Manager)
> Roles with Access: Sales Agent (own opportunities), Sales Manager (all), Ops Manager (all), Admin (all)

---

## 1. Purpose & Business Context

**What this screen does:**
Displays all sales opportunities in a filterable, sortable table view with an optional kanban pipeline view. Opportunities represent active deals progressing through stages from Prospecting to Closed Won or Closed Lost. Sales agents use this screen to manage their pipeline, track deal progression, and prioritize closing activities.

**Business problem it solves:**
Without a unified pipeline view, sales teams cannot assess their deal pipeline health, identify stalled opportunities, or forecast revenue. This screen enables visual pipeline management via kanban drag-and-drop, weighted pipeline calculations, and quick filtering so sales managers can identify bottlenecks and sales agents can prioritize their highest-value deals.

**Key business rules:**
- Sales agents see only their own opportunities unless they have `crm_view_all` permission
- Opportunities must be associated with a Company and optionally a Contact
- Stage progression follows a defined order: PROSPECTING > QUALIFICATION > PROPOSAL > NEGOTIATION > CLOSED_WON / CLOSED_LOST
- Probability auto-adjusts with stage changes (configurable defaults per stage)
- Opportunities in CLOSED_WON must have an amount > $0
- Expected close date cannot be in the past for active opportunities (warning shown, not hard block)
- Moving to CLOSED_LOST requires a loss reason (competitor, pricing, timing, no decision, other)
- Weighted pipeline value = SUM(amount * probability / 100) across active opportunities
- HubSpot-synced opportunities map to HubSpot Deals bi-directionally

**Success metric:**
Sales team achieves 85%+ pipeline accuracy (weighted forecast vs. actual). Average deal cycle time from PROSPECTING to CLOSED_WON drops below 45 days. Pipeline visibility eliminates "surprise" lost deals.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| CRM sidebar navigation | Click "Opportunities" menu item | None |
| CRM Dashboard | Click pipeline chart or "View All Opportunities" | Optional stage filter |
| Company Detail | Click "View All Opportunities" in Opportunities tab | ?companyId={id} filter |
| Lead Detail | After lead conversion, redirect to pipeline | ?highlight={opportunityId} |
| Notification bell | Click deal-related notification | ?highlight={opportunityId} |
| Direct URL | Bookmark / shared link | Query params for filters |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Opportunity Detail | Click opportunity row or name link | opportunityId |
| Company Detail | Click company name in table | companyId |
| Contact Detail | Click contact name in table | contactId |
| Create Opportunity Modal | Click "+ New Opportunity" button | None (or pre-filled companyId) |

**Primary trigger:**
James Wilson (Sales Agent) clicks "Opportunities" in the CRM sidebar to review his active deals, check which opportunities are close to their expected close date, and decide which deals to prioritize this week.

**Success criteria (user completes the screen when):**
- User has reviewed the full pipeline and understands pipeline health
- User has identified opportunities that need attention (stalled, close date approaching)
- User has updated stages via kanban drag-and-drop for deals that progressed
- User has navigated to specific opportunities for deeper action

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: CRM > Opportunities     [+ New Opportunity]          |
|  Page Title: "Opportunities"         [Table View | Kanban View]   |
+------------------------------------------------------------------+
|  Pipeline Summary Bar:                                             |
|  [Total: 47 | $2.4M]  [Prospecting: 12 | $380K]                  |
|  [Qualification: 10 | $520K]  [Proposal: 9 | $610K]              |
|  [Negotiation: 8 | $540K]  [Won: 5 | $285K]  [Lost: 3]          |
|  Weighted Pipeline: $1.28M                                         |
+------------------------------------------------------------------+
|  Quick Filters: [My Opportunities] [Closing This Month]            |
|                 [High Value (>$50K)] [Stalled (>14d no update)]    |
|  Filters: [Search...] [Stage v] [Company v] [Owner v] [Date v]   |
+------------------------------------------------------------------+

KANBAN VIEW (default):
+------------------------------------------------------------------+
| +----------+ +----------+ +----------+ +----------+ +----------+ |
| |PROSPECTING| |QUALIFIC. | | PROPOSAL | |NEGOTIAT. | | CLOSED   | |
| |  12 opps  | |  10 opps | |  9 opps  | |  8 opps  | |          | |
| |  $380K    | |  $520K   | |  $610K   | |  $540K   | | WON: 5   | |
| |----------| |----------| |----------| |----------| | $285K    | |
| | Acme Q1  | | Beta     | | Gamma    | | Delta    | |----------| |
| | Contract | | FTL Exp  | | Reefer   | | Cross-Dk | | Echo     | |
| | $120K    | | $85K     | | $95K     | | $150K    | | LTL Deal | |
| | James W. | | James W. | | Sarah C. | | James W. | | $60K     | |
| | 30 Jan   | | 15 Feb   | | 28 Feb   | | 10 Feb   | |          | |
| |          | |          | |          | |          | | LOST: 3  | |
| | Foxtrot  | | Golf     | | Hotel    | | India    | |----------| |
| | Lanes    | | Intermod | | FTL      | | Reefer   | | Juliet   | |
| | $45K     | | $70K     | | $55K     | | $80K     | | LTL      | |
| | Sarah C. | | James W. | | James W. | | Sarah C. | | $35K     | |
| | 5 Feb    | | 20 Feb   | | 15 Mar   | | 1 Mar    | |          | |
| +----------+ +----------+ +----------+ +----------+ +----------+ |
+------------------------------------------------------------------+

TABLE VIEW (toggle):
+------------------------------------------------------------------+
| [ ] | Name         | Company     | Contact    | Stage    | Amount |
|     |              |             |            |          |        |
|-----|--------------|-------------|------------|----------|--------|
| [ ] | Acme Q1 Cont | Acme Logist | John Smith | NEGOTIAT | $120K  |
| [ ] | Beta FTL Exp | Beta Freigh | Omar Ali   | QUALIFIC | $85K   |
| [ ] | Gamma Reefer | Gamma Trans | Sarah Kim  | PROPOSAL | $95K   |
| [ ] | Delta Cross  | Delta Corp  | Amy Chen   | NEGOTIAT | $150K  |
| [ ] | Echo LTL     | Echo Carri  | Tom Lee    | WON      | $60K   |
+------------------------------------------------------------------+
| Continued columns: | Prob | Expected Close | Owner    | Updated  |
|                     | 75%  | Jan 30, 2026   | James W. | 2h ago   |
|                     | 40%  | Feb 15, 2026   | James W. | 1d ago   |
|                     | 50%  | Feb 28, 2026   | Sarah C. | 3d ago   |
|                     | 75%  | Feb 10, 2026   | James W. | 5h ago   |
|                     | 100% | Jan 20, 2026   | James W. | 1w ago   |
+------------------------------------------------------------------+
|  Showing 1-25 of 47 opportunities   < 1 2 > [25 per page v]      |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Opportunity name, company, stage badge, amount | Sales agents scan by deal name and value to prioritize |
| **Secondary** (visible in table / kanban card) | Contact, probability, expected close date, owner | Context needed for action decisions |
| **Tertiary** (stats bar, on hover) | Weighted pipeline value, days in stage, last activity | Pipeline health metrics and staleness indicators |
| **Hidden** (behind click) | Full deal history, quotes, activities, documents | Deep deal management on detail page |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Checkbox | N/A (selection state) | Checkbox for bulk actions | Table column 1 |
| 2 | Opportunity Name | Opportunity.name | Semibold text, clickable link to detail | Table column 2 / Kanban card title |
| 3 | Company | Opportunity.company_id (join Company.name) | Clickable link to Company Detail | Table column 3 / Kanban card |
| 4 | Contact | Opportunity.contact_id (join Contact name) | Clickable link to Contact Detail | Table column 4 |
| 5 | Stage | Opportunity.stage | Colored badge | Table column 5 / Kanban column |
| 6 | Amount | Opportunity.amount | Currency $XXX,XXX | Table column 6 / Kanban card |
| 7 | Probability | Opportunity.probability | Percentage XX% | Table column 7 / Kanban card |
| 8 | Expected Close | Opportunity.expected_close_date | Date "Jan 30, 2026" | Table column 8 / Kanban card |
| 9 | Owner | Opportunity.assigned_to (join User.name) | Avatar + name | Table column 9 / Kanban card |
| 10 | Last Updated | Opportunity.updated_at | Relative time "2h ago" | Table column 10 |
| 11 | HubSpot | Opportunity.hubspot_deal_id (presence) | Small HS icon if synced | Table column 11 |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Weighted Value | Opportunity.amount * Opportunity.probability / 100 | Currency $XX,XXX |
| 2 | Total Pipeline | SUM(amount) WHERE stage NOT IN (CLOSED_WON, CLOSED_LOST) | Currency in stats bar |
| 3 | Weighted Pipeline | SUM(amount * probability / 100) WHERE stage NOT IN (CLOSED_WON, CLOSED_LOST) | Currency in stats bar |
| 4 | Stage Counts | COUNT(Opportunity) GROUP BY stage | Integer per stage in stats bar |
| 5 | Stage Totals | SUM(amount) GROUP BY stage | Currency per stage in stats bar |
| 6 | Days in Stage | now() - last stage change timestamp | "X days" -- amber if > 14, red if > 30 |
| 7 | Days to Close | Opportunity.expected_close_date - now() | "X days" -- red if < 0 (overdue) |
| 8 | Close Date Indicator | Compare expected_close_date to now() | Green if > 14d, amber if 7-14d, red if < 7d or overdue |

---

## 5. Features

### Core Features (Net-New -- To Be Built)

- [ ] **Kanban pipeline view** -- Drag-and-drop cards between stage columns with smooth animations
- [ ] **Table/list view** -- Paginated, sortable table with all opportunity fields
- [ ] **View toggle** -- Switch between Kanban and Table views with persistent preference
- [ ] **Pipeline summary bar** -- Stage counts, amounts, and weighted pipeline value
- [ ] **Create opportunity** -- Modal form to create a new opportunity with company, contact, stage, amount
- [ ] **Search** -- Search by opportunity name, company name
- [ ] **Filter by stage** -- Multi-select stage filter
- [ ] **Filter by owner** -- Searchable dropdown of sales reps
- [ ] **Filter by company** -- Searchable company dropdown
- [ ] **Pagination** -- Configurable page size (25, 50, 100) for table view

### Advanced Features

- [ ] **Quick filters** -- Pre-built filter shortcuts: My Opportunities, Closing This Month, High Value (>$50K), Stalled (>14d no stage change)
- [ ] **Kanban card enhancements** -- Show amount, probability, owner avatar, expected close, days-in-stage indicator
- [ ] **Drag to CLOSED_LOST** -- Opens loss reason dialog when dragging to Closed Lost column
- [ ] **Drag to CLOSED_WON** -- Opens win confirmation with final amount verification
- [ ] **Bulk stage update** -- Select multiple and move to a stage
- [ ] **Bulk reassignment** -- Select multiple and assign to a different rep
- [ ] **Pipeline value chart** -- Mini bar chart above kanban showing value distribution by stage
- [ ] **Stalled deal indicator** -- Warning icon on deals with no activity in 14+ days
- [ ] **Close date warning** -- Red highlight on deals past their expected close date
- [ ] **Saved filter presets** -- Save named filter combinations for quick access
- [ ] **Export opportunities** -- Export current filtered view to CSV
- [ ] **Win/loss ratio** -- Stats showing win rate in pipeline summary
- [ ] **HubSpot sync indicator** -- Badge on synced opportunities
- [ ] **Column visibility toggle** -- Show/hide table columns

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View all opportunities | sales_manager, ops_manager, admin | crm_view_all | Only own opportunities visible |
| Create opportunity | sales_agent, sales_manager, admin | opportunity_create | "+ New Opportunity" hidden |
| Edit opportunity | sales_agent (own), manager, admin | opportunity_edit | Edit actions hidden |
| Delete opportunity | admin | opportunity_delete | Delete action hidden |
| Change stage | sales_agent (own), manager, admin | opportunity_edit | Kanban drag disabled; stage buttons hidden |
| Bulk operations | sales_manager, admin | opportunity_bulk_edit | Bulk actions hidden |
| Reassign | sales_manager, admin | opportunity_assign | Assignment dropdown disabled |
| Export | sales_agent, manager, admin | export_data | "Export" button hidden |

---

## 6. Status & State Machine

### Stage Transitions

```
                    OPPORTUNITY PIPELINE
+-------------+   +---------------+   +----------+   +-------------+
| PROSPECTING |-->| QUALIFICATION |-->| PROPOSAL |-->| NEGOTIATION |
+------+------+   +-------+-------+   +-----+----+   +------+------+
       |                  |                  |               |
       |    (can skip forward or go back     |               |
       |     to any earlier stage)           |               |
       |                                     |               |
       +------> any earlier stage <----------+               |
                                                     +-------+-------+
                                                     |               |
                                              +------v------+ +-----v-------+
                                              | CLOSED_WON  | | CLOSED_LOST |
                                              +-------------+ +-------------+
                                              (from any stage) (from any stage)

Re-open: CLOSED_LOST --> PROSPECTING (manager/admin only)
```

### Stage Default Probabilities

| Stage | Default Probability | Color |
|---|---|---|
| PROSPECTING | 10% | blue-600 |
| QUALIFICATION | 25% | cyan-600 |
| PROPOSAL | 50% | yellow-600 |
| NEGOTIATION | 75% | orange-600 |
| CLOSED_WON | 100% | green-600 |
| CLOSED_LOST | 0% | red-600 |

### Actions Available Per Stage

| Stage | Available Actions | Restricted Actions |
|---|---|---|
| PROSPECTING | Edit, Move to Qualification, Close Won, Close Lost, Assign, Delete | N/A |
| QUALIFICATION | Edit, Move to Proposal, Move back to Prospecting, Close Won, Close Lost, Assign | N/A |
| PROPOSAL | Edit, Move to Negotiation, Move back, Close Won, Close Lost, Create Quote, Assign | N/A |
| NEGOTIATION | Edit, Move to Closed Won, Close Lost, Move back, Create Quote, Assign | N/A |
| CLOSED_WON | View Only, Add Note | Edit, stage changes, Delete |
| CLOSED_LOST | Re-open (manager/admin), View Only, Add Note | Edit, Delete |

### Stage Badge Colors

| Stage | Background | Text | Tailwind Classes |
|---|---|---|---|
| PROSPECTING | blue-100 | blue-800 | `bg-blue-100 text-blue-800` |
| QUALIFICATION | cyan-100 | cyan-800 | `bg-cyan-100 text-cyan-800` |
| PROPOSAL | yellow-100 | yellow-800 | `bg-yellow-100 text-yellow-800` |
| NEGOTIATION | orange-100 | orange-800 | `bg-orange-100 text-orange-800` |
| CLOSED_WON | green-100 | green-800 | `bg-green-100 text-green-800` |
| CLOSED_LOST | red-100 | red-800 | `bg-red-100 text-red-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + New Opportunity | Plus | Primary / Blue | Opens create opportunity modal | No |
| Export | Download | Secondary / Outline | Downloads CSV of current filtered view | No |

### View Toggle

| Button | Icon | Action |
|---|---|---|
| Table View | List | Switches to table/list view |
| Kanban View | Columns | Switches to kanban pipeline view (default) |

### Row Actions (Table View -- Dropdown Menu per Row)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| View Details | Eye | Navigate to /crm/opportunities/{id} | Always |
| Edit Opportunity | Pencil | Opens edit opportunity modal | Not CLOSED_WON or CLOSED_LOST |
| Move to Next Stage | ArrowRight | Advances to next pipeline stage | Not in a CLOSED stage |
| Close Won | Trophy | Opens close-won dialog (confirm final amount) | Active stage |
| Close Lost | XCircle | Opens loss reason dialog | Active stage |
| Assign To | UserPlus | Opens rep assignment dropdown | Active stage |
| Create Quote | FileText | Navigate to quote creation with opportunity prefilled | Stage is PROPOSAL or NEGOTIATION |
| Delete | Trash | Soft delete with confirmation | Admin only; not CLOSED_WON |

### Bulk Actions (When Multiple Rows Selected)

| Action Label | Action | Confirmation |
|---|---|---|
| Update Stage | Opens stage change dropdown | Yes -- "Move N opportunities to [stage]?" |
| Assign To | Opens rep selection | Yes -- "Assign N opportunities to [rep]?" |
| Export Selected | Downloads CSV of selected | No |
| Delete | Soft delete selected | Yes -- "Delete N opportunities?" |

### Kanban Interactions

| Interaction | Trigger | Result |
|---|---|---|
| Drag card to new column | Drag-and-drop | Changes opportunity stage; updates probability to stage default |
| Drag to CLOSED_WON | Drop on Won column | Opens win confirmation dialog: verify final amount, won date |
| Drag to CLOSED_LOST | Drop on Lost column | Opens loss reason dialog: select reason, add notes |
| Click card | Click anywhere on card | Navigate to /crm/opportunities/{id} |
| Hover card | Mouse enter | Shows subtle shadow elevation; displays days-in-stage tooltip |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + K | Open global search |
| Ctrl/Cmd + N | Open create opportunity modal |
| V then T | Switch to table view |
| V then K | Switch to kanban view |
| Escape | Close modal / deselect all |
| Arrow Up/Down | Navigate table rows (table view) |
| Enter | Open selected row detail |

### Drag & Drop (Kanban View)

| Draggable Element | Drop Target | Action |
|---|---|---|
| Opportunity card | Stage column (PROSPECTING through NEGOTIATION) | Changes stage, updates probability |
| Opportunity card | CLOSED_WON column | Opens win confirmation dialog |
| Opportunity card | CLOSED_LOST column | Opens loss reason dialog |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| opportunity.created | { oppId, name, company, stage, amount, assignedTo } | Add row to table / card to kanban; update stats bar |
| opportunity.stage.changed | { oppId, oldStage, newStage, changedBy } | Update stage badge in table; move card in kanban with animation; update stats |
| opportunity.updated | { oppId, changes, updatedBy } | Update affected row/card; flash highlight |
| opportunity.assigned | { oppId, newAssignee } | Update owner column/card; toast if assigned to current user |
| opportunity.closed.won | { oppId, finalAmount } | Move to Won section; show success toast; update stats |
| opportunity.closed.lost | { oppId, lossReason } | Move to Lost section; update stats |
| opportunity.deleted | { oppId } | Remove row/card; update stats |

### Live Update Behavior

- **Update frequency:** WebSocket push for all opportunity changes; stats bar re-polls every 60 seconds
- **Visual indicator:** Changed rows/cards flash with blue highlight fading over 2 seconds; kanban card movement animated with 300ms transition
- **Conflict handling:** If user is dragging a card that another user changes, show banner: "This opportunity was updated by [name]. Refresh to see changes."

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 30 seconds
- **Endpoint:** GET /api/v1/crm/opportunities?updatedSince={timestamp}
- **Visual indicator:** Show "Live updates paused -- reconnecting..." banner

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Change stage (drag) | Immediately move card to new column with animation | Animate card back to original column; show error toast |
| Assign opportunity | Immediately update owner display | Revert to previous owner; show error toast |
| Delete opportunity | Fade out row/card | Re-insert row/card; show error toast |
| Create opportunity | Add to appropriate column/position with loading indicator | Remove; show error toast with form data preserved |
| Close Won/Lost | Immediately move to closed section | Animate back; show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| pipeline-chart | src/components/crm/pipeline-chart.tsx | opportunities, groupBy: 'stage' |
| StatusBadge | src/components/ui/status-badge.tsx | status, size |
| DataTable | src/components/ui/data-table.tsx | columns, data, pagination, sorting |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| FilterBar | src/components/ui/filter-bar.tsx | filters: FilterConfig[] |
| hubspot-sync-badge | src/components/crm/hubspot-sync-badge.tsx | syncStatus |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| pipeline-chart | Static funnel visualization | Convert to interactive kanban-compatible pipeline summary bar with click-to-filter |
| FilterBar | Status and source dropdowns | Add stage, company, owner, date range, amount range, quick filter presets |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| OpportunityKanban | Full kanban board with draggable cards, stage columns, column totals | Large -- DnD library integration, column layout, card rendering |
| OpportunityKanbanCard | Kanban card showing name, company, amount, probability, owner, close date, days-in-stage | Medium -- card with multiple data points and drag handle |
| OpportunityKanbanColumn | Single column with header (stage name, count, total), droppable area, card list | Medium -- droppable container with scrolling |
| PipelineSummaryBar | Stats row showing stage counts, amounts, and weighted pipeline total | Small -- stat card row with calculations |
| QuickFilterBar | Row of pre-built filter toggle buttons (My Opps, Closing This Month, etc.) | Small -- toggle button group |
| CloseWonDialog | Confirmation dialog: verify final amount, close date, notes | Small -- dialog with form fields |
| CloseLostDialog | Dialog with loss reason dropdown (competitor, pricing, timing, no decision, other) and notes | Small -- dialog with dropdown and textarea |
| StalledIndicator | Warning icon with tooltip for deals with no update > 14 days | Small -- icon with tooltip |
| CloseDateIndicator | Color-coded indicator for expected close date proximity | Small -- conditional colored text |
| OpportunityForm | Create/edit form: name, company (searchable), contact, stage, amount, probability, close date, notes | Medium -- form with validation and company/contact search |
| ViewToggle | Button group toggling Table and Kanban views with preference persistence | Small -- toggle group |
| WinLossRatio | Mini stat showing won vs. lost percentage | Small -- stat display |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Toggle Group | toggle-group | Table/Kanban view toggle, quick filters |
| Dropdown Menu | dropdown-menu | Row actions, bulk actions |
| Dialog | dialog | Create/edit, close won, close lost dialogs |
| Badge | badge | Stage badges, amount badges |
| Tooltip | tooltip | Stalled indicator, close date, truncated text |
| Select | select | Stage, owner, loss reason dropdowns |
| Command | command | Company and contact search in create form |
| Calendar | calendar | Expected close date picker |
| Progress | progress | Pipeline value bar in summary |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/crm/opportunities | Fetch paginated opportunity list with filters | useOpportunities(filters) |
| 2 | GET | /api/v1/crm/opportunities/:id | Fetch single opportunity detail | useOpportunity(id) |
| 3 | POST | /api/v1/crm/opportunities | Create a new opportunity | useCreateOpportunity() |
| 4 | PATCH | /api/v1/crm/opportunities/:id | Update opportunity details | useUpdateOpportunity() |
| 5 | PATCH | /api/v1/crm/opportunities/:id/stage | Change opportunity stage | useUpdateOpportunityStage() |
| 6 | POST | /api/v1/crm/opportunities/:id/close-won | Mark opportunity as won | useCloseOpportunityWon() |
| 7 | POST | /api/v1/crm/opportunities/:id/close-lost | Mark opportunity as lost with reason | useCloseOpportunityLost() |
| 8 | POST | /api/v1/crm/opportunities/:id/reopen | Re-open a closed-lost opportunity | useReopenOpportunity() |
| 9 | PATCH | /api/v1/crm/opportunities/:id/assign | Assign opportunity to rep | useAssignOpportunity() |
| 10 | DELETE | /api/v1/crm/opportunities/:id | Soft delete opportunity | useDeleteOpportunity() |
| 11 | POST | /api/v1/crm/opportunities/bulk-stage | Bulk stage update | useBulkUpdateOpportunityStage() |
| 12 | POST | /api/v1/crm/opportunities/bulk-assign | Bulk assign to rep | useBulkAssignOpportunities() |
| 13 | GET | /api/v1/crm/opportunities/stats | Pipeline stats (counts, amounts by stage) | useOpportunityStats() |
| 14 | GET | /api/v1/crm/opportunities/pipeline-summary | Weighted pipeline and forecast data | usePipelineSummary() |
| 15 | POST | /api/v1/crm/opportunities/export | Export filtered opportunities to CSV | useExportOpportunities() |
| 16 | GET | /api/v1/crm/companies?search= | Search companies for opportunity association | useCompanySearch(query) |
| 17 | GET | /api/v1/crm/contacts?companyId= | Fetch contacts for selected company | useCompanyContacts(companyId) |
| 18 | GET | /api/v1/users?role=sales_agent | Fetch sales reps for assignment | useSalesReps() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| crm:{tenantId}:opportunities | opportunity.created | useOpportunityListUpdates() -- invalidates list and stats |
| crm:{tenantId}:opportunities | opportunity.stage.changed | useOpportunityListUpdates() -- updates row/card and stats |
| crm:{tenantId}:opportunities | opportunity.assigned | useOpportunityListUpdates() -- updates owner column |
| crm:{tenantId}:opportunities | opportunity.closed | useOpportunityListUpdates() -- moves to closed; updates stats |
| crm:{tenantId}:opportunities | opportunity.deleted | useOpportunityListUpdates() -- removes row/card |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| GET /api/v1/crm/opportunities | Filter error toast | Redirect to login | "Access Denied" page | N/A | N/A | Error state with retry |
| POST /api/v1/crm/opportunities | Validation errors inline | Redirect to login | "Permission Denied" toast | N/A | N/A | Error toast |
| PATCH .../stage | "Invalid stage transition" toast | Redirect to login | "Permission Denied" toast | "Not found" | "Stage already changed" | Error toast |
| POST .../close-won | "Amount must be > $0" toast | Redirect to login | "Permission Denied" | "Not found" | "Already closed" | Error toast |
| POST .../close-lost | "Loss reason required" toast | Redirect to login | "Permission Denied" | "Not found" | "Already closed" | Error toast |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Pipeline summary bar with 6 skeleton stat cards. Kanban: 5 skeleton columns with 3 skeleton cards each. Table: 8 skeleton rows matching column widths.
- **Progressive loading:** Page header, filter bar, and view toggle render immediately. Stats and data area show skeletons.
- **Duration threshold:** If loading exceeds 5s, show "Loading pipeline..." message.

### Empty States

**First-time empty (no opportunities created):**
- **Illustration:** Rocket/growth chart illustration
- **Headline:** "No opportunities yet"
- **Description:** "Start building your pipeline by creating your first opportunity or converting a qualified lead."
- **CTA Buttons:** "Create First Opportunity" (primary) | "Go to Leads" (secondary)

**Filtered empty (opportunities exist but filters exclude all):**
- **Headline:** "No opportunities match your filters"
- **Description:** "Try adjusting your search terms or filter criteria."
- **CTA Button:** "Clear All Filters" -- secondary outline

**Kanban column empty:**
- **Display:** Column header with count "(0)" and $0 amount. Dashed border placeholder: "No opportunities in this stage. Drag deals here or create a new one."

### Error States

**Full page error (API fails):**
- **Display:** Error icon + "Unable to load opportunities" + "Please try again or contact support." + Retry button

**Action error (stage change, create, delete fails):**
- **Display:** Toast notification with specific error message. Auto-dismiss after 8 seconds. Kanban card animates back on drag failure.

### Permission Denied

- **Full page denied:** "You don't have permission to view opportunities" with link to CRM Dashboard
- **Partial denied:** Create/edit/delete actions hidden; kanban drag disabled; read-only table

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached pipeline data from [timestamp]. Changes cannot be saved."
- **Degraded:** "Live updates paused" indicator; data loads on refresh.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Search | Text input | Searches name, company name | None | ?search= |
| 2 | Stage | Multi-select dropdown | PROSPECTING, QUALIFICATION, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST | Active stages (exclude CLOSED) | ?stage= |
| 3 | Owner | Searchable select | All sales reps | Current user (for agents) / All (for managers) | ?owner= |
| 4 | Company | Searchable select | All companies | All | ?companyId= |
| 5 | Expected Close | Date range picker | Presets: This Week, This Month, Next Month, This Quarter, Custom | All | ?closeFrom=&closeTo= |
| 6 | Amount Range | Min/max inputs | $0 - $1M+ | All | ?amountMin=&amountMax= |
| 7 | Created Date | Date range picker | Presets + custom | All | ?createdFrom=&createdTo= |

### Quick Filters (Toggle Buttons)

| # | Quick Filter Label | Logic | URL Param |
|---|---|---|---|
| 1 | My Opportunities | owner = current user | ?owner={currentUserId} |
| 2 | Closing This Month | expected_close_date BETWEEN start_of_month AND end_of_month | ?closeFrom={start}&closeTo={end} |
| 3 | High Value | amount > $50,000 | ?amountMin=50000 |
| 4 | Stalled | no stage change or activity in last 14 days | ?stalled=true |

### Search Behavior

- **Search field:** Single search input at left of filter bar with magnifying glass icon
- **Searches across:** Opportunity name, company name
- **Behavior:** Debounced 300ms, minimum 2 characters, highlights matching text
- **URL param:** ?search=

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Name | Ascending (A-Z) | Alphabetical |
| Company | Ascending (A-Z) | Alphabetical |
| Stage | Custom (PROSPECTING first) | Custom enum order |
| Amount | Descending (highest first) | Numeric |
| Probability | Descending (highest first) | Numeric |
| Expected Close | Ascending (soonest first) | Date |
| Last Updated | Descending (most recent) | Date |

**Default sort:** Expected Close ascending (soonest deals first)

### Saved Filters / Presets

- **System presets:** "My Pipeline" (own active), "Closing This Month", "High Value Deals", "Stalled Deals", "Won This Quarter", "Lost This Quarter"
- **User-created presets:** Save current filter combination with custom name. Stored per-user.
- **URL sync:** All filter state reflected in URL query params.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Pipeline summary bar: 3 stats per row (2 rows) instead of all inline
- Kanban view: show 3 columns at a time with horizontal scroll; CLOSED columns collapse to a single "Closed" column
- Table view: hide Probability, Last Updated columns; keep Name, Company, Stage, Amount, Close Date, Owner
- Filter bar: collapse to "Filters" button opening slide-over panel
- Quick filters: horizontal scroll strip

### Mobile (< 768px)

- Default to table/card view (kanban not practical on small screens)
- Pipeline summary: horizontal swipeable stat cards
- Table switches to card-based list (one card per opportunity)
- Each card: name, company, stage badge, amount, close date, owner avatar
- Tap card to navigate to detail
- Kanban view available but single-column-at-a-time with swipe between stages
- Filters: full-screen modal triggered by filter icon
- Quick filters: horizontal scroll strip
- Sticky bottom: "+ New Opportunity" button
- Pull-to-refresh for data reload

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout as designed in Section 3 |
| Desktop | 1024px - 1439px | Kanban columns slightly narrower |
| Tablet | 768px - 1023px | See tablet notes above |
| Mobile | < 768px | See mobile notes above |

---

## 14. Stitch Prompt

```
Design an Opportunities List screen for a modern SaaS TMS (Transportation Management System) called "Ultra TMS." This screen should show a sales pipeline in both kanban and table views.

Layout: Full-width page with dark slate-900 sidebar (240px) on the left with "CRM" section expanded and "Opportunities" highlighted with blue-600 indicator. White/gray-50 content area on the right. Top has breadcrumb "CRM > Opportunities", title "Opportunities", a toggle button group for "Kanban View" (active, blue-600) and "Table View", and a primary blue "+ New Opportunity" button with plus icon.

Pipeline Summary Bar: Below header, show 7 compact stat cards in a row: "Total: 47 | $2.4M" (slate), "Prospecting: 12 | $380K" (blue dot), "Qualification: 10 | $520K" (cyan dot), "Proposal: 9 | $610K" (yellow dot), "Negotiation: 8 | $540K" (orange dot), "Won: 5 | $285K" (green dot), "Lost: 3" (red dot). Below stat cards: "Weighted Pipeline: $1.28M" in semibold.

Quick Filters: Row of toggle buttons below stats: "My Opportunities" (active, blue outline), "Closing This Month", "High Value (>$50K)", "Stalled (>14d)". Each is a small pill-shaped button.

Filter Bar: Search input "Search opportunities...", "Stage" multi-select, "Company" searchable dropdown, "Owner" dropdown, "Close Date" range picker, "Clear Filters".

Kanban Board (main view): 5 columns side by side with equal width.

Column 1 "PROSPECTING" (blue-600 top border): Header shows "Prospecting" in semibold, "12 opps | $380K" in gray-500. Show 3 cards. Each card: white bg, rounded-lg, shadow-sm, 12px padding. Card shows: opportunity name in 14px semibold, company name in gray-500, amount "$120,000" in green-700 semibold, small probability badge "10%", owner avatar (24px) with name, close date "Jan 30" in gray-500. Bottom right: "15d" in gray-400 (days in stage).

Column 2 "QUALIFICATION" (cyan-600 top border): Same format, 3 cards.

Column 3 "PROPOSAL" (yellow-600 top border): Same format, 2 cards. One card has an amber warning icon indicating stalled (>14 days no update).

Column 4 "NEGOTIATION" (orange-600 top border): Same format, 2 cards. One card has close date in red (overdue).

Column 5 split into "CLOSED WON" (green-600 top border) and "CLOSED LOST" (red-600 top border) stacked vertically. Won section shows 2 small green-tinted cards. Lost section shows 1 small red-tinted card.

Cards should have a subtle drag handle (grip dots) on the left side visible on hover.

Below the kanban, show a small inset of the Table View alternative: columns for checkbox, Name, Company, Contact, Stage (colored badge), Amount, Probability, Expected Close, Owner, Updated.

Design Specifications:
- Font: Inter or system sans-serif, 14px base
- Sidebar: slate-900 background, white text, blue-600 active indicator
- Content background: gray-50 for page, white for cards and table
- Primary color: blue-600 for buttons, active states, links
- Kanban columns: gray-100 background, rounded-lg, 8px gap between columns
- Kanban cards: white, rounded-lg, shadow-sm, hover:shadow-md transition
- Stage colors: blue for Prospecting, cyan for Qualification, yellow for Proposal, orange for Negotiation, green for Won, red for Lost
- Pipeline stat cards: white, rounded-lg, border-gray-200
- Quick filter pills: border, rounded-full, 28px height, active has blue-600 border and blue-50 bg
- Stalled warning: amber-500 alert-triangle icon with tooltip "No activity for 15 days"
- Overdue close date: red-600 text with calendar-alert icon
- Modern SaaS aesthetic similar to Pipedrive pipeline or HubSpot deal board
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2 -- Net-New Build)

**What needs to be built from scratch:**
- [ ] Full kanban pipeline view with drag-and-drop stage management
- [ ] Table/list view with pagination, sorting, filtering
- [ ] Pipeline summary statistics bar
- [ ] Opportunity create/edit forms
- [ ] Stage transition logic with confirmation dialogs
- [ ] Quick filter presets
- [ ] Close Won and Close Lost workflows
- [ ] View toggle between Kanban and Table

**Post-MVP enhancements (within Wave 2):**
- [ ] Stalled deal detection and warning indicators
- [ ] Close date proximity warnings
- [ ] Bulk operations (stage update, reassignment)
- [ ] Export to CSV
- [ ] HubSpot deal sync integration
- [ ] Saved filter presets
- [ ] Win/loss ratio analytics
- [ ] Pipeline value chart above kanban
- [ ] Column visibility toggle for table view

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Kanban pipeline view with DnD | Critical | High | P0 |
| Table view with filters | Critical | Medium | P0 |
| Pipeline summary stats bar | High | Low | P0 |
| Create/edit opportunity form | Critical | Medium | P0 |
| Close Won/Lost workflows | High | Medium | P0 |
| Quick filter presets | High | Low | P0 |
| Stage transition logic | Critical | Medium | P0 |
| Stalled deal indicators | Medium | Low | P1 |
| Close date warnings | Medium | Low | P1 |
| Bulk operations | Medium | Medium | P1 |
| Export to CSV | Medium | Low | P1 |
| HubSpot deal sync | High | High | P1 |
| Saved filter presets | Medium | Medium | P2 |
| Pipeline value chart | Low | Medium | P2 |
| Win/loss analytics | Medium | Medium | P2 |

### Future Wave Preview

- **Wave 3:** Revenue forecasting with AI-predicted close dates, deal scoring based on engagement signals, automated deal progression rules, competitive tracking per opportunity, deal room (shared space with customer for documents and communications)
- **Wave 4:** Sales playbooks per deal stage, automated task creation on stage change, pipeline coverage analysis, multi-currency support, commission tracking per deal

---

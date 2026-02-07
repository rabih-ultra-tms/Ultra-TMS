# Leads List

> Service: CRM (Service 02) | Wave: 1 (Enhancement Focus) | Priority: P0
> Route: /(dashboard)/crm/leads | Status: Built
> Primary Personas: James Wilson (Sales Agent), Sarah Chen (Ops Manager)
> Roles with Access: Sales Agent (own leads), Sales Manager (all), Ops Manager (all), Admin (all)

---

## 1. Purpose & Business Context

**What this screen does:**
Displays all leads in a filterable, sortable table view with an optional kanban pipeline view. Sales agents use this screen to manage their lead pipeline, track lead progression from NEW to CONVERTED, and prioritize follow-ups based on estimated revenue and status.

**Business problem it solves:**
Without a centralized lead list, sales agents cannot efficiently prioritize which prospects to contact first, track which leads have gone cold, or measure their pipeline health. This screen enables rapid lead triage, pipeline visualization, and bulk operations to keep the sales pipeline moving.

**Key business rules:**
- Sales agents see only leads assigned to them unless they have `crm_view_all` permission
- Leads in NEW status for more than 48 hours are flagged as "aging" with a warning indicator
- Lead conversion (to opportunity) requires QUALIFIED status -- cannot convert directly from NEW or CONTACTED
- Estimated revenue must be a positive number when provided
- Lead source must be tracked for attribution reporting
- Duplicate detection runs on email address -- warns if email already exists in leads or contacts
- Converted leads are hidden by default but can be shown via filter

**Success metric:**
Average time from lead creation to first contact drops below 4 hours. Lead conversion rate (QUALIFIED / total) exceeds 25%. No leads remain in NEW status for more than 48 hours.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| CRM Dashboard | Click "View All Leads" or leads KPI card | Optional status filter |
| CRM sidebar navigation | Click "Leads" menu item | None |
| Lead Import Wizard | After successful import completion | ?source=import&date={importDate} |
| Notification bell | Click new-lead notification | ?id={leadId} (highlights row) |
| Direct URL | Bookmark / shared link | Query params for filters |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Lead Detail | Click lead row or lead name link | leadId |
| Create Lead Modal | Click "+ New Lead" button | None |
| Lead Import Wizard | Click "Import Leads" button | None |
| Company Detail | Click company name in table (if linked) | companyId |
| Contact Detail | Click contact name (if converted) | contactId |

**Primary trigger:**
James Wilson (Sales Agent) clicks "Leads" in the CRM sidebar to review his assigned leads, check for new leads, and decide which leads to contact today.

**Success criteria (user completes the screen when):**
- User has reviewed all new leads and prioritized follow-ups
- User has updated lead statuses based on recent interactions
- User has identified and addressed any aging leads (48+ hours in NEW)
- User has found and navigated to a specific lead for detailed review

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: CRM > Leads       [Import] [+ New Lead]             |
|  Page Title: "Leads"           [Table View | Kanban View]        |
+------------------------------------------------------------------+
|  Stats Bar:                                                       |
|  [Total: 127] [New: 34] [Contacted: 42] [Qualified: 28] [Conv: 23]|
+------------------------------------------------------------------+
|  Filters: [Search...] [Status ▼] [Source ▼] [Assigned ▼] [Date ▼]|
+------------------------------------------------------------------+

TABLE VIEW:
|  +------------------------------------------------------------+  |
|  | [ ] | Name          | Company    | Status  | Source | Est.  |  |
|  |     |               |            |         |        | Rev.  |  |
|  |-----|---------------|------------|---------|--------|-------|  |
|  | [ ] | John Smith    | Acme Corp  | NEW     | Web    | $15K  |  |
|  | [ ] | Lisa Park     | Beta LLC   | CONTACT | Ref    | $8K   |  |
|  | [ ] | Omar Hassan   | Gamma Inc  | QUALIF  | Trade  | $22K  |  |
|  | [ ] | Amy Chen      | Delta Co   | NEW ⚠   | Cold   | $5K   |  |
|  |     |               |            | (aging) |        |       |  |
|  +------------------------------------------------------------+  |
|  Showing 1-25 of 127 leads      < 1 2 3 4 5 >  [25 per page ▼] |
+------------------------------------------------------------------+

KANBAN VIEW (toggle):
+------------------------------------------------------------------+
| +------------+ +------------+ +------------+ +------------+       |
| |    NEW     | | CONTACTED  | | QUALIFIED  | | CONVERTED  |       |
| |   (34)     | |   (42)     | |   (28)     | |   (23)     |       |
| |------------| |------------| |------------| |------------|       |
| | John Smith | | Lisa Park  | | Omar Hassan| | Mike Brown |       |
| | Acme Corp  | | Beta LLC   | | Gamma Inc  | | Echo Ltd   |       |
| | $15K ● Web | | $8K ● Ref  | | $22K ●Trade| | $30K ● Web |       |
| |            | |            | |            | |            |       |
| | Amy Chen   | | Sarah Kim  | | Tom Lee    | | Jane Doe   |       |
| | Delta Co   | | Foxtrot    | | Hotel Inc  | | India Co   |       |
| | $5K ● Cold | | $12K ● Web | | $18K ● Ref | | $25K ● Ref |       |
| |            | |            | |            | |            |       |
| | +2 more    | | +5 more    | | +1 more    | | +3 more    |       |
| +------------+ +------------+ +------------+ +------------+       |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Lead name, company name, status badge, estimated revenue | Sales agents scan by name and status to prioritize |
| **Secondary** (visible in table) | Source, email, phone, assigned rep, created date | Context needed for outreach decisions |
| **Tertiary** (on hover/expand) | Estimated monthly volume, last activity date, notes preview | Supporting detail for deeper evaluation |
| **Hidden** (behind click -- detail page) | Full activity history, conversion flow, all contact info, HubSpot data | In-depth lead management on detail page |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Checkbox | N/A (selection state) | Checkbox for bulk actions | Table column 1 |
| 2 | Lead Name | Lead.first_name + Lead.last_name | Full name, semibold, clickable link to detail | Table column 2 |
| 3 | Email | Lead.email | Gray-500 text below name | Table column 2 (subtext) |
| 4 | Company | Lead.company_name | Company name text | Table column 3 |
| 5 | Status | Lead.status | Colored badge (NEW/CONTACTED/QUALIFIED/UNQUALIFIED/CONVERTED) | Table column 4 |
| 6 | Source | Lead.source | Text label (Web, Referral, Trade Show, Cold Call, HubSpot, Import) | Table column 5 |
| 7 | Est. Revenue | Lead.estimated_revenue | Currency $XX,XXX per month | Table column 6 |
| 8 | Est. Volume | Lead.estimated_monthly_volume | Number with "loads/mo" suffix | Table column 7 |
| 9 | Assigned To | Lead.assigned_to (join to User) | Rep name or "Unassigned" | Table column 8 |
| 10 | Created | Lead.created_at | Relative time ("2h ago", "3 days ago") | Table column 9 |
| 11 | Phone | Lead.phone | Formatted phone number | Table column 10 (optional, can be hidden) |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Aging Indicator | Lead.status = NEW AND (now() - Lead.created_at) > 48 hours | Warning icon (amber triangle) next to status badge |
| 2 | Days in Status | now() - last status change timestamp | "X days" -- red if > 7 days in same status |
| 3 | Lead Score | Based on estimated_revenue, source quality, engagement signals | Score 1-100, displayed as colored bar (green > 70, yellow 40-70, red < 40) |
| 4 | Status Counts (stats bar) | COUNT(Lead) GROUP BY status | Integer per status displayed in stat cards |
| 5 | Total Est. Pipeline | SUM(Lead.estimated_revenue) WHERE status IN (NEW, CONTACTED, QUALIFIED) | Currency displayed in stats bar |

---

## 5. Features

### Core Features (Built -- Currently Live)

- [x] Paginated table view of all leads with sorting
- [x] Search by lead name, company name, email
- [x] Filter by status (multi-select)
- [x] Filter by source
- [x] Click-through to Lead Detail page
- [x] Create new lead via modal form
- [x] Status badge color coding
- [x] Kanban pipeline view with drag-and-drop between status columns
- [x] Pagination with configurable page size (25, 50, 100)
- [x] Basic column sorting (name, status, created date)

### Advanced Features (Wave 1 Enhancements)

- [ ] **Aging lead indicators** -- Warning icon for leads in NEW status > 48 hours; red highlight for > 72 hours
- [ ] **Lead scoring column** -- Visual score bar (1-100) based on revenue potential and engagement
- [ ] **Kanban card enhancements** -- Show estimated revenue, source icon, and days-in-status on each card
- [ ] **Bulk status update** -- Select multiple leads and change status in batch
- [ ] **Bulk assignment** -- Select multiple leads and assign to a sales rep
- [ ] **Quick convert action** -- "Convert to Opportunity" button on QUALIFIED leads (inline, no detail page needed)
- [ ] **Saved filter presets** -- Save and name filter combinations for quick access
- [ ] **Column visibility toggle** -- Let users show/hide columns based on preference
- [ ] **Import leads button** -- Direct link to Lead Import Wizard
- [ ] **Duplicate detection on create** -- Warn when creating a lead with an existing email
- [ ] **HubSpot source indicator** -- Badge showing if lead originated from HubSpot sync
- [ ] **Export leads** -- Export current filtered view to CSV

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View all leads | sales_manager, ops_manager, admin | crm_view_all | Only own assigned leads visible |
| Create lead | sales_agent, sales_manager, admin | lead_create | "+ New Lead" button hidden |
| Edit lead | sales_agent (own), sales_manager, admin | lead_edit | Edit actions hidden |
| Delete lead | admin | lead_delete | Delete action hidden from row menu |
| Bulk operations | sales_manager, admin | lead_bulk_edit | Bulk action bar hidden |
| Import leads | sales_manager, admin | lead_import | "Import" button hidden |
| Export leads | sales_agent, sales_manager, admin | export_data | "Export" button hidden |
| Assign leads | sales_manager, admin | lead_assign | Assignment dropdown disabled |

---

## 6. Status & State Machine

### Status Transitions

```
                    +-------+
         +--------->|  NEW  |<---------- (Lead created / imported)
         |          +---+---+
         |              |
         |    (Sales agent contacts lead)
         |              |
         |          +---v-------+
         |          | CONTACTED |
         |          +---+-------+
         |              |
         |     +--------+--------+
         |     |                 |
         |  (Lead qualifies)  (Lead does not qualify)
         |     |                 |
         | +---v--------+  +----v---------+
         | | QUALIFIED  |  | UNQUALIFIED  |
         | +---+--------+  +--------------+
         |     |
         |  (Convert to Opportunity)
         |     |
         | +---v--------+
         | | CONVERTED  | ---> Creates Company + Contact + Opportunity
         | +------------+
         |
         +--- (Re-open from UNQUALIFIED -- rare)
```

### Actions Available Per Status

| Status | Available Actions (Buttons) | Restricted Actions |
|---|---|---|
| NEW | Edit, Contact (move to CONTACTED), Assign, Delete | Convert, Mark Unqualified (must contact first) |
| CONTACTED | Edit, Qualify, Mark Unqualified, Reassign | Convert (must qualify first), Delete |
| QUALIFIED | Edit, Convert to Opportunity, Reassign, Mark Unqualified | Delete |
| UNQUALIFIED | Edit, Re-open (move to NEW), Delete | Convert, Assign |
| CONVERTED | View Only, Link to Company/Contact/Opportunity | Edit, Delete, any status change |

### Status Badge Colors

| Status | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| NEW | blue-100 | blue-800 | blue-300 | `bg-blue-100 text-blue-800 border-blue-300` |
| CONTACTED | yellow-100 | yellow-800 | yellow-300 | `bg-yellow-100 text-yellow-800 border-yellow-300` |
| QUALIFIED | green-100 | green-800 | green-300 | `bg-green-100 text-green-800 border-green-300` |
| UNQUALIFIED | gray-100 | gray-600 | gray-300 | `bg-gray-100 text-gray-600 border-gray-300` |
| CONVERTED | purple-100 | purple-800 | purple-300 | `bg-purple-100 text-purple-800 border-purple-300` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + New Lead | Plus | Primary / Blue | Opens create lead modal | No |
| Import | Upload | Secondary / Outline | Navigates to /crm/leads/import | No |
| Export | Download | Secondary / Outline | Downloads CSV of current filtered view | No |

### View Toggle

| Button | Icon | Action |
|---|---|---|
| Table View | List | Switches to table/list view (default) |
| Kanban View | Columns | Switches to kanban pipeline view |

### Row Actions (Dropdown / "More" Menu per Row)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| View Details | Eye | Navigate to /crm/leads/{id} | Always available |
| Edit Lead | Pencil | Opens edit lead modal | Status is not CONVERTED |
| Contact Lead | Phone | Log call activity + move to CONTACTED | Status is NEW |
| Qualify | CheckCircle | Move status to QUALIFIED | Status is CONTACTED |
| Convert | ArrowRight | Opens conversion wizard (creates company, contact, opportunity) | Status is QUALIFIED |
| Mark Unqualified | XCircle | Move status to UNQUALIFIED with reason | Status is NEW or CONTACTED |
| Assign To | UserPlus | Opens rep assignment dropdown | Status is not CONVERTED |
| Delete | Trash | Soft delete with confirmation | Admin only; status is not CONVERTED |

### Bulk Actions (When Multiple Rows Selected)

| Action Label | Action | Confirmation |
|---|---|---|
| Update Status | Opens status change dropdown for all selected | Yes -- "Update N leads to [status]?" |
| Assign To | Opens rep selection for all selected | Yes -- "Assign N leads to [rep name]?" |
| Export Selected | Downloads CSV of selected rows only | No |
| Delete | Soft delete all selected | Yes -- "Delete N leads? This cannot be undone." |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + K | Open global search |
| Ctrl/Cmd + N | Open create lead modal |
| V then T | Switch to table view |
| V then K | Switch to kanban view |
| Escape | Close modal / deselect all |
| Arrow Up/Down | Navigate table rows |
| Enter | Open selected row detail |

### Drag & Drop (Kanban View Only)

| Draggable Element | Drop Target | Action |
|---|---|---|
| Lead card | Status column (NEW, CONTACTED, QUALIFIED, CONVERTED) | Changes lead status to target column status |
| Lead card | UNQUALIFIED column | Opens "Mark Unqualified" dialog with reason field |
| Lead card | CONVERTED column | Opens conversion wizard (only if currently QUALIFIED) |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| lead.created | { leadId, name, company, status, assignedTo } | Add new row to table (if within filters); update stat counts; add card to kanban NEW column |
| lead.status.changed | { leadId, oldStatus, newStatus, changedBy } | Update status badge in table row; move card in kanban; update stat counts; flash changed row |
| lead.assigned | { leadId, assignedTo, assignedBy } | Update assigned column; show toast if assigned to current user |
| lead.deleted | { leadId, deletedBy } | Remove row from table; remove card from kanban; update stat counts |
| lead.converted | { leadId, companyId, contactId, opportunityId } | Move to CONVERTED; show success toast with links to created entities |

### Live Update Behavior

- **Update frequency:** WebSocket push for all lead changes; stat bar re-polls every 60 seconds
- **Visual indicator:** Changed rows flash with subtle blue highlight fading over 2 seconds; new kanban cards slide in from top with bounce animation
- **Conflict handling:** If user is editing a lead that another user changes, show banner: "This lead was updated by [name]. Refresh to see changes."

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 30 seconds
- **Endpoint:** GET /api/v1/crm/leads?updatedSince={lastPollTimestamp}
- **Visual indicator:** Show "Live updates paused -- reconnecting..." banner

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Change status | Immediately update badge/move kanban card | Revert badge/card position, show error toast |
| Assign lead | Immediately show new rep name | Revert to previous rep, show error toast |
| Delete lead | Immediately remove row/card with fade animation | Re-insert row/card, show error toast |
| Create lead | Add to top of table with loading spinner | Remove row, show error toast with form data preserved |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| leads-table | src/components/crm/leads-table.tsx | columns, data, pagination, sorting, selection |
| lead-form | src/components/crm/lead-form.tsx | mode: 'create' or 'edit', leadData |
| lead-kanban | src/components/crm/lead-kanban.tsx | leads: Lead[], onStatusChange, onCardClick |
| StatusBadge | src/components/ui/status-badge.tsx | status: string, size: 'sm' or 'md' |
| DataTable | src/components/ui/data-table.tsx | columns, data, pagination, sorting |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| FilterBar | src/components/ui/filter-bar.tsx | filters: FilterConfig[] |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| leads-table | Basic columns: name, company, status, source, created | Add lead score column, aging indicator, estimated revenue, assigned rep, bulk selection checkboxes, column visibility toggle |
| lead-kanban | Basic cards with name and company only | Add revenue display, source badge, days-in-status, aging warning, drag animation |
| lead-form | Basic fields: name, email, phone, company, source | Add estimated revenue, monthly volume, duplicate detection warning, source dropdown enhancement |
| FilterBar | Status and source dropdowns | Add assigned rep filter, date range filter, saved presets |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| LeadScoreBar | Horizontal bar (1-100) with color gradient (red-yellow-green) and numeric label | Small -- CSS bar with conditional colors |
| AgingIndicator | Warning badge showing hours/days since creation for NEW leads | Small -- conditional icon with tooltip |
| LeadKanbanCard | Enhanced kanban card with name, company, revenue, source, days, aging | Medium -- card with multiple data points and drag handle |
| LeadConversionWizard | Multi-step dialog: confirm lead data > create company > create contact > create opportunity | Large -- multi-step form with validation |
| ViewToggle | Button group toggling between Table and Kanban views | Small -- toggle button group |
| BulkActionBar | Floating bar appearing when rows selected, showing bulk action buttons | Small -- sticky bar with action buttons |
| LeadStatCards | Row of status count cards with click-to-filter behavior | Small -- clickable stat cards |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Toggle Group | toggle-group | Table/Kanban view toggle |
| Dropdown Menu | dropdown-menu | Row actions, bulk actions |
| Dialog | dialog | Create/edit lead modal, conversion wizard |
| Badge | badge | Status badges, source badges |
| Tooltip | tooltip | Aging indicator details, truncated text |
| Sheet | sheet | Quick-edit panel for lead details |
| Command | command | Quick search within lead list |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/crm/leads | Fetch paginated lead list with filters | useLeads(filters) |
| 2 | GET | /api/v1/crm/leads/:id | Fetch single lead detail | useLead(id) |
| 3 | POST | /api/v1/crm/leads | Create a new lead | useCreateLead() |
| 4 | PATCH | /api/v1/crm/leads/:id | Update lead details | useUpdateLead() |
| 5 | PATCH | /api/v1/crm/leads/:id/status | Change lead status | useUpdateLeadStatus() |
| 6 | PATCH | /api/v1/crm/leads/:id/assign | Assign lead to sales rep | useAssignLead() |
| 7 | POST | /api/v1/crm/leads/:id/convert | Convert lead to company+contact+opportunity | useConvertLead() |
| 8 | DELETE | /api/v1/crm/leads/:id | Soft delete lead | useDeleteLead() |
| 9 | POST | /api/v1/crm/leads/bulk-status | Bulk status update | useBulkUpdateLeadStatus() |
| 10 | POST | /api/v1/crm/leads/bulk-assign | Bulk assign to rep | useBulkAssignLeads() |
| 11 | GET | /api/v1/crm/leads/stats | Get lead count statistics by status | useLeadStats() |
| 12 | POST | /api/v1/crm/leads/export | Export filtered leads to CSV | useExportLeads() |
| 13 | GET | /api/v1/crm/leads/check-duplicate | Check for duplicate email | useCheckDuplicate(email) |
| 14 | GET | /api/v1/users?role=sales_agent | Fetch sales reps for assignment dropdown | useSalesReps() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| crm:{tenantId}:leads | lead.created | useLeadListUpdates() -- invalidates lead list and stats |
| crm:{tenantId}:leads | lead.status.changed | useLeadListUpdates() -- updates specific row/card |
| crm:{tenantId}:leads | lead.assigned | useLeadListUpdates() -- updates assigned column |
| crm:{tenantId}:leads | lead.deleted | useLeadListUpdates() -- removes row/card |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| GET /api/v1/crm/leads | Show filter error toast | Redirect to login | "Access Denied" page | N/A | N/A | Error state with retry |
| POST /api/v1/crm/leads | Show validation errors inline | Redirect to login | "Permission Denied" toast | N/A | "Duplicate email" warning | Error toast with retry |
| PATCH /api/v1/crm/leads/:id/status | "Invalid status transition" toast | Redirect to login | "Permission Denied" toast | "Lead not found" toast | N/A | Error toast with retry |
| POST /api/v1/crm/leads/:id/convert | "Lead must be QUALIFIED" toast | Redirect to login | "Permission Denied" toast | "Lead not found" toast | "Already converted" toast | Error toast with retry |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show stat bar with 5 skeleton cards (gray animated bars). Show 8 skeleton table rows with bars matching column widths. Kanban view shows 4 skeleton columns with 3 skeleton cards each.
- **Progressive loading:** Page header, filter bar, and view toggle render immediately. Stat cards and data area show skeletons.
- **Duration threshold:** If loading exceeds 5s, show "This is taking longer than usual..." message.

### Empty States

**First-time empty (no leads ever created):**
- **Illustration:** Target/bullseye illustration
- **Headline:** "No leads yet"
- **Description:** "Start building your pipeline by creating your first lead or importing leads from a file."
- **CTA Buttons:** "Create First Lead" (primary) | "Import Leads" (secondary)

**Filtered empty (leads exist but filters exclude all):**
- **Headline:** "No leads match your filters"
- **Description:** "Try adjusting your search terms or filter criteria."
- **CTA Button:** "Clear All Filters" -- secondary outline button

**Kanban column empty:**
- **Display:** Column header with count "(0)" and dashed border placeholder: "No leads in this stage. Drag leads here or create a new one."

### Error States

**Full page error (API completely fails):**
- **Display:** Error icon + "Unable to load leads" + "Please try again or contact support." + Retry button

**Action error (status change, create, delete fails):**
- **Display:** Toast notification with specific error message. Auto-dismiss after 8 seconds.

### Permission Denied

- **Full page denied:** "You don't have permission to view leads" with link to CRM Dashboard
- **Partial denied:** Hide create/edit/delete actions; show read-only table

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached lead data from [timestamp]."
- **Degraded:** "Live updates paused" indicator; data still loads on refresh.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Search | Text input | Searches across name, company, email | None | ?search= |
| 2 | Status | Multi-select dropdown | NEW, CONTACTED, QUALIFIED, UNQUALIFIED, CONVERTED | NEW, CONTACTED, QUALIFIED (exclude converted) | ?status= |
| 3 | Source | Multi-select dropdown | Web Form, Referral, Trade Show, Cold Call, HubSpot, Import, Other | All | ?source= |
| 4 | Assigned To | Searchable select | All sales reps (from /api/users?role=sales) | Current user (for agents) / All (for managers) | ?assignedTo= |
| 5 | Created Date | Date range picker | Preset: Today, Last 7 Days, Last 30 Days, Custom | All | ?createdFrom=&createdTo= |
| 6 | Revenue Range | Range slider or min/max inputs | $0 -- $100K+ | All | ?revMin=&revMax= |

### Search Behavior

- **Search field:** Single search input at left of filter bar with magnifying glass icon
- **Searches across:** Lead first name, last name, company name, email address
- **Behavior:** Debounced 300ms, minimum 2 characters, highlights matching text in results
- **URL param:** ?search=

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Lead Name | Ascending (A-Z) | Alphabetical |
| Company | Ascending (A-Z) | Alphabetical |
| Status | Custom (NEW first, then CONTACTED, QUALIFIED) | Custom enum order |
| Source | Ascending (A-Z) | Alphabetical |
| Estimated Revenue | Descending (highest first) | Numeric |
| Created Date | Descending (newest first) | Date |

**Default sort:** Created Date descending (newest leads first)

### Saved Filters / Presets

- **System presets:** "My Leads" (assigned to me), "New Leads" (status=NEW), "Aging Leads" (NEW > 48h), "Hot Leads" (QUALIFIED, revenue > $10K), "All Active" (exclude CONVERTED and UNQUALIFIED)
- **User-created presets:** Users can save current filter combination with custom name. Stored per-user.
- **URL sync:** All filter state reflected in URL query params for shareable links.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Stat cards: show as horizontal scroll strip or 3+2 row layout
- Table view: hide Volume, Phone columns; keep Name, Company, Status, Source, Revenue, Created
- Filter bar: collapse to "Filters" button opening slide-over panel
- Kanban view: show 2 columns at a time with horizontal scroll
- Action buttons: keep "+ New Lead" visible, move Import/Export to overflow menu

### Mobile (< 768px)

- Stat cards: horizontal swipeable strip
- Table view switches to card-based list (one card per lead)
- Each card shows: name, company, status badge, source tag, estimated revenue, created time
- Tap card to navigate to detail
- Kanban view: single column at a time with swipe navigation between status columns
- Filters: full-screen modal triggered by filter icon
- Sticky bottom bar with "+ New Lead" button
- Swipe left on card for quick actions (contact, qualify, assign)
- Pull-to-refresh for data reload

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout as designed in Section 3 |
| Desktop | 1024px - 1439px | Table may hide optional columns |
| Tablet | 768px - 1023px | See tablet notes above |
| Mobile | < 768px | See mobile notes above |

---

## 14. Stitch Prompt

```
Design a Leads List screen for a modern SaaS TMS (Transportation Management System) called "Ultra TMS." The screen should have two views: a data table view (shown as default) and a kanban pipeline view toggle.

Layout: Full-width page with dark slate-900 sidebar (240px) on the left with "CRM" section expanded and "Leads" highlighted with blue-600 indicator. White/gray-50 content area on the right. Top of content area has breadcrumb "CRM > Leads", title "Leads", a toggle button group for "Table View" (active) and "Kanban View", and action buttons: secondary "Import" with upload icon, primary blue "+ New Lead" with plus icon.

Stats Bar: Below header, show 5 compact stat cards in a row: "Total: 127" (slate), "New: 34" (blue dot), "Contacted: 42" (yellow dot), "Qualified: 28" (green dot), "Converted: 23" (purple dot). Each card is clickable with subtle hover effect.

Filter Bar: Below stats, show filters: search input with magnifying glass ("Search leads..."), "Status" multi-select dropdown, "Source" dropdown, "Assigned To" dropdown, "Date" range picker, and "Clear Filters" text button.

Data Table: Below filters, show a table with columns: checkbox, Lead Name (semibold with email in gray below), Company, Status (colored badge -- blue NEW, yellow CONTACTED, green QUALIFIED, gray UNQUALIFIED, purple CONVERTED), Source (text), Est. Revenue ($XX,XXX/mo), Assigned To (avatar + name), Created (relative time), and three-dot actions menu. Show 8 rows of realistic logistics/freight data:
- John Smith / john@acme.com | Acme Logistics | NEW (blue badge) | Web Form | $15,000/mo | James W. | 2 hours ago
- Lisa Park / lisa@beta.com | Beta Freight Co | CONTACTED (yellow) | Referral | $8,500/mo | James W. | 5 hours ago
- Omar Hassan / omar@gamma.com | Gamma Transport | QUALIFIED (green) | Trade Show | $22,000/mo | Sarah C. | 1 day ago
- Amy Chen / amy@delta.com | Delta Shipping | NEW with amber warning icon (aging >48h) | Cold Call | $5,200/mo | Unassigned | 3 days ago
- Tom Lee / tom@echo.com | Echo Carriers | QUALIFIED (green) | Web Form | $18,000/mo | James W. | 2 days ago
- Sarah Kim / sarah@fox.com | Foxtrot Logistics | CONTACTED (yellow) | HubSpot | $12,000/mo | Sarah C. | 4 days ago
- Mike Brown / mike@golf.com | Golf Express | CONVERTED (purple) | Referral | $30,000/mo | James W. | 1 week ago
- Jane Doe / jane@hotel.com | Hotel Freight | UNQUALIFIED (gray) | Cold Call | $3,000/mo | Sarah C. | 2 weeks ago

Bottom: Pagination "Showing 1-25 of 127 leads" with page arrows and "25 per page" dropdown.

Also include a smaller inset showing the Kanban View alternative: 4 columns labeled NEW (34), CONTACTED (42), QUALIFIED (28), CONVERTED (23) with 2-3 cards per column. Each card shows lead name, company, revenue badge, and source indicator. Cards have subtle shadow and rounded corners.

Design Specifications:
- Font: Inter or system sans-serif, 14px base size
- Sidebar: slate-900 background, white text, blue-600 active indicator
- Content background: gray-50 for page, white for table and cards
- Primary color: blue-600 for buttons and links
- Table: white background, border-b border-gray-100 between rows, hover bg-gray-50
- Stat cards: white, rounded-lg, border-gray-200, clickable with cursor-pointer
- Kanban columns: gray-100 background, rounded-lg, cards are white with shadow-sm
- Aging warning: amber-500 triangle icon with tooltip "Lead aging: 3 days without contact"
- Modern SaaS aesthetic similar to HubSpot CRM or Pipedrive
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1 -- Enhancement Focus)

**What's built and working:**
- [x] Paginated table view with lead name, company, status, source columns
- [x] Search by name, company, email
- [x] Filter by status (multi-select)
- [x] Filter by source
- [x] Create lead via modal form
- [x] Kanban pipeline view with drag-and-drop
- [x] Status badge color coding
- [x] Pagination with page size selector
- [x] Column sorting

**What needs polish / bug fixes:**
- [ ] Kanban cards show only name and company -- need more data points
- [ ] Drag-and-drop has no animation feedback -- add visual drop zone highlighting
- [ ] Filter state lost on browser back navigation -- persist in URL params
- [ ] No loading skeleton for kanban view -- cards pop in after delay
- [ ] Mobile view does not support kanban -- needs single-column swipe

**What to add this wave:**
- [ ] Aging lead indicators for NEW leads > 48 hours
- [ ] Lead scoring column with visual score bar
- [ ] Enhanced kanban cards with revenue, source, days-in-status
- [ ] Bulk status update and bulk assignment
- [ ] Quick convert action for QUALIFIED leads
- [ ] Saved filter presets
- [ ] Column visibility toggle
- [ ] Import leads button linking to wizard
- [ ] Duplicate detection on lead creation
- [ ] Export to CSV functionality

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Aging lead indicators | High | Low | P0 |
| Bulk status update | High | Medium | P0 |
| Quick convert action | High | Medium | P0 |
| Enhanced kanban cards | Medium | Low | P0 |
| Lead scoring column | Medium | Medium | P1 |
| Saved filter presets | Medium | Medium | P1 |
| Duplicate detection | Medium | Medium | P1 |
| Column visibility toggle | Low | Low | P1 |
| Export to CSV | Medium | Low | P1 |
| Import leads button | Low | Low | P2 |

### Future Wave Preview

- **Wave 2:** AI-powered lead scoring based on historical conversion data, automated lead assignment rules (round-robin, territory-based), lead nurture sequence integration, HubSpot lead sync
- **Wave 3:** Predictive lead quality scoring, automated follow-up reminders, lead-to-revenue attribution reporting, social media lead enrichment

---

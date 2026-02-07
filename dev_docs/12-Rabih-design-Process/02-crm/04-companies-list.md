# Companies List

> Service: CRM (Service 02) | Wave: 1 (Enhancement Focus) | Priority: P0
> Route: /(dashboard)/crm/companies | Status: Built
> Primary Personas: Sarah Chen (Ops Manager), James Wilson (Sales Agent)
> Roles with Access: All users (read-only for general users), Sales Agent (assigned), Sales Manager (all), Ops Manager (all), Admin (all)

---

## 1. Purpose & Business Context

**What this screen does:**
Displays all companies/accounts in the system with comprehensive filtering, search, and sorting capabilities. Companies represent the organizations Ultra TMS does business with -- customers, prospects, partners, and vendors. This is the primary account management view for operations managers and the account lookup screen for all users.

**Business problem it solves:**
Without a centralized company list, teams cannot quickly find customer information, identify which accounts need attention, or segment customers by type, tier, or industry. This screen enables rapid account lookup, portfolio review, and customer segmentation to support both sales and operations workflows.

**Key business rules:**
- All authenticated users can view the companies list (read-only for non-CRM roles)
- Sales agents see all companies but can only edit companies assigned to them
- Company names must be unique within a tenant (legal_name is the unique constraint)
- Companies with company_type CUSTOMER must have a credit_limit and payment_terms set
- Tier levels (PLATINUM/GOLD/SILVER/BRONZE) affect SLA and pricing visibility
- Companies can have multiple associated contacts, opportunities, and loads
- HubSpot-synced companies show sync status indicator

**Success metric:**
Users can find any company within 10 seconds using search or filters. Account managers can review their entire portfolio and identify at-risk accounts in under 2 minutes.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| CRM sidebar navigation | Click "Companies" menu item | None |
| CRM Dashboard | Click "View All Companies" link | None |
| Lead Detail | Click company name (after conversion) | Optional companyId highlight |
| Contact Detail | Click associated company link | companyId |
| Load Detail | Click customer company link | companyId |
| Global search | Select company from results | companyId (redirect to detail) |
| Direct URL | Bookmark / shared link | Query params for filters |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Company Detail | Click company row or name link | companyId |
| Create Company Modal | Click "+ New Company" button | None |
| Contact Detail | Click contact count/link in row | companyId filter |
| Opportunities List | Click opportunity count/link | companyId filter |

**Primary trigger:**
Sarah Chen (Ops Manager) navigates to Companies to review all customer accounts, check credit limits, and identify which accounts need operational attention. James Wilson (Sales Agent) uses it to look up a company before a call.

**Success criteria (user completes the screen when):**
- User has found the company they were looking for
- User has reviewed their account portfolio for any issues
- User has navigated to a specific company for detailed review
- User has created a new company record if needed

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: CRM > Companies            [Export] [+ New Company]  |
|  Page Title: "Companies"                                          |
+------------------------------------------------------------------+
|  Stats Bar:                                                       |
|  [Total: 234] [Customers: 156] [Prospects: 52] [Partners: 18]    |
|  [Vendors: 8]                                                     |
+------------------------------------------------------------------+
|  Filters: [Search...] [Type ▼] [Status ▼] [Segment ▼] [Tier ▼]  |
|           [Industry ▼] [Assigned Rep ▼] [Clear]                   |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  | [ ] | Company Name    | Type      | Segment | Tier   | Cr. |  |
|  |     | (Legal Name)    |           |         |        | Lim |  |
|  |-----|-----------------|-----------|---------|--------|-----|  |
|  | [ ] | Acme Logistics  | CUSTOMER  | ENT     | PLAT ★ |$500K|  |
|  |     | Acme Corp Inc   |           |         |        |     |  |
|  | [ ] | Beta Freight    | CUSTOMER  | MID     | GOLD   |$200K|  |
|  |     | Beta Freight LLC|           |         |        |     |  |
|  | [ ] | Gamma Transport | PROSPECT  | SMB     | --     | --  |  |
|  |     | Gamma Inc       |           |         |        |     |  |
|  | [ ] | Delta Partners  | PARTNER   | ENT     | SILVER |$150K|  |
|  |     | Delta Corp      |           |         |        |     |  |
|  | [ ] | Echo Carriers   | VENDOR    | MID     | BRONZE | $50K|  |
|  |     | Echo LLC        |           |         |        |     |  |
|  +------------------------------------------------------------+  |
|  Showing 1-25 of 234 companies  < 1 2 3 ... > [25 per page ▼]   |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Company name (display + legal), type badge, status | Users scan by name and type to identify accounts |
| **Secondary** (visible in table) | Segment, tier, credit limit, assigned reps, industry | Key account attributes for filtering and prioritization |
| **Tertiary** (on hover/expand) | Payment terms, contact count, opportunity count, last activity | Supporting detail for account health assessment |
| **Hidden** (behind click -- detail page) | Full contact list, revenue history, activity timeline, load history | Deep account data on detail page |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Checkbox | N/A (selection state) | Checkbox for bulk actions | Table column 1 |
| 2 | Company Name | Company.name | Semibold text, clickable link | Table column 2 |
| 3 | Legal Name | Company.legal_name | Gray-500 smaller text below name | Table column 2 (subtext) |
| 4 | DBA Name | Company.dba_name | Shown in parentheses if different from name | Table column 2 (subtext) |
| 5 | Type | Company.company_type | Colored badge: CUSTOMER/PROSPECT/PARTNER/VENDOR | Table column 3 |
| 6 | Status | Company.status | StatusBadge: Active/Inactive/Suspended | Table column 4 |
| 7 | Segment | Company.segment | Badge: ENTERPRISE/MID_MARKET/SMB | Table column 5 |
| 8 | Tier | Company.tier | Star-rated badge: PLATINUM(4★)/GOLD(3★)/SILVER(2★)/BRONZE(1★) | Table column 6 |
| 9 | Industry | Company.industry | Text label | Table column 7 |
| 10 | Credit Limit | Company.credit_limit | Currency $XXX,XXX or "--" if not set | Table column 8 |
| 11 | Payment Terms | Company.payment_terms | Text (Net 30, Net 60, etc.) | Table column 9 |
| 12 | Sales Rep | Company.assigned_sales_rep_id (join User) | Avatar + name | Table column 10 |
| 13 | Ops Rep | Company.assigned_ops_rep_id (join User) | Avatar + name | Table column 11 |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Contact Count | COUNT(Contact) WHERE company_id = this company | Integer with link to contacts |
| 2 | Opportunity Count | COUNT(Opportunity) WHERE company_id = this company AND stage NOT IN (CLOSED_LOST) | Integer with link to opportunities |
| 3 | Total Revenue (LTM) | SUM(Opportunity.amount) WHERE company_id AND stage = CLOSED_WON AND last 12 months | Currency |
| 4 | Last Activity | MAX(Activity.created_at) WHERE company_id = this company | Relative time "3 days ago" |
| 5 | Account Health | Composite score based on activity recency, opportunity stage, payment history | Green/Yellow/Red indicator |

---

## 5. Features

### Core Features (Built -- Currently Live)

- [x] Paginated table view of all companies with sorting
- [x] Search by company name, legal name, DBA name
- [x] Filter by company type (CUSTOMER/PROSPECT/PARTNER/VENDOR)
- [x] Filter by status (Active/Inactive)
- [x] Click-through to Company Detail page
- [x] Create new company via modal form
- [x] Type and status badge color coding
- [x] Pagination with configurable page size
- [x] Column sorting on all columns

### Advanced Features (Wave 1 Enhancements)

- [ ] **Segment and tier filtering** -- Multi-select dropdowns for ENTERPRISE/MID_MARKET/SMB and PLATINUM/GOLD/SILVER/BRONZE
- [ ] **Industry filter** -- Dropdown with industry categories
- [ ] **Assigned rep filter** -- Filter by sales rep or ops rep assignment
- [ ] **Tier visual indicators** -- Star rating badges with color coding (Platinum=gold, Gold=amber, Silver=gray, Bronze=orange)
- [ ] **Credit limit column** -- Display credit limit with color coding (near-limit = yellow, over-limit = red)
- [ ] **Contact and opportunity count columns** -- Inline counts with click-to-filter links
- [ ] **Account health indicator** -- Green/Yellow/Red dot based on activity recency and opportunity health
- [ ] **Bulk type update** -- Select multiple companies and change type in batch
- [ ] **Export companies** -- Export filtered list to CSV
- [ ] **HubSpot sync indicator** -- Small badge on synced companies
- [ ] **Column visibility toggle** -- Show/hide columns based on user preference
- [ ] **Saved filter presets** -- Save named filter combinations

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View companies list | All authenticated users | company_view | Always visible (read-only) |
| Create company | sales_agent, manager, admin | company_create | "+ New Company" button hidden |
| Edit company | sales_agent (assigned), manager, admin | company_edit | Edit actions hidden |
| Delete company | admin | company_delete | Delete action hidden |
| View credit limit | manager, admin, finance | finance_view | Column shows "--" |
| Bulk operations | manager, admin | company_bulk_edit | Bulk action bar hidden |
| Export | sales_agent, manager, admin | export_data | "Export" button hidden |

---

## 6. Status & State Machine

### Status Transitions

```
[ACTIVE] <----> [INACTIVE]
    |
    v
[SUSPENDED] ---> [INACTIVE]
    ^
    |
[ACTIVE] ---(Suspend)--> [SUSPENDED]
```

### Actions Available Per Status

| Status | Available Actions | Restricted Actions |
|---|---|---|
| ACTIVE | Edit, Suspend, Deactivate, View Detail | Delete (admin only) |
| INACTIVE | Reactivate, View Detail, View History | Edit, Suspend |
| SUSPENDED | Reactivate, Deactivate, View Detail | Edit, New Opportunities |

### Status Badge Colors

| Status | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| ACTIVE | green-100 | green-800 | green-300 | `bg-green-100 text-green-800 border-green-300` |
| INACTIVE | gray-100 | gray-600 | gray-300 | `bg-gray-100 text-gray-600 border-gray-300` |
| SUSPENDED | red-100 | red-800 | red-300 | `bg-red-100 text-red-800 border-red-300` |

### Company Type Badge Colors

| Type | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| CUSTOMER | blue-100 | blue-800 | blue-300 | `bg-blue-100 text-blue-800 border-blue-300` |
| PROSPECT | yellow-100 | yellow-800 | yellow-300 | `bg-yellow-100 text-yellow-800 border-yellow-300` |
| PARTNER | purple-100 | purple-800 | purple-300 | `bg-purple-100 text-purple-800 border-purple-300` |
| VENDOR | teal-100 | teal-800 | teal-300 | `bg-teal-100 text-teal-800 border-teal-300` |

### Tier Badge Colors

| Tier | Background | Text | Icon | Tailwind Classes |
|---|---|---|---|---|
| PLATINUM | amber-100 | amber-900 | 4 stars | `bg-amber-100 text-amber-900` |
| GOLD | yellow-100 | yellow-800 | 3 stars | `bg-yellow-100 text-yellow-800` |
| SILVER | gray-100 | gray-700 | 2 stars | `bg-gray-100 text-gray-700` |
| BRONZE | orange-100 | orange-800 | 1 star | `bg-orange-100 text-orange-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + New Company | Plus | Primary / Blue | Opens create company modal | No |
| Export | Download | Secondary / Outline | Downloads CSV of current filtered view | No |

### Row Actions (Dropdown / "More" Menu per Row)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| View Details | Eye | Navigate to /crm/companies/{id} | Always available |
| Edit Company | Pencil | Opens edit company modal | User has edit permission for this company |
| View Contacts | Users | Navigate to /crm/contacts?companyId={id} | Always available |
| View Opportunities | TrendingUp | Navigate to /crm/opportunities?companyId={id} | CRM access required |
| Suspend | Pause | Changes status to SUSPENDED | Status is ACTIVE; admin/manager only |
| Deactivate | XCircle | Changes status to INACTIVE | Status is ACTIVE or SUSPENDED; admin only |
| Reactivate | Play | Changes status to ACTIVE | Status is INACTIVE or SUSPENDED |
| Delete | Trash | Soft delete with confirmation | Admin only; no active loads |

### Bulk Actions (When Multiple Rows Selected)

| Action Label | Action | Confirmation |
|---|---|---|
| Update Type | Opens type change dropdown | Yes -- "Change N companies to [type]?" |
| Assign Sales Rep | Opens rep selection | Yes -- "Assign N companies to [rep]?" |
| Export Selected | Downloads CSV of selected rows | No |
| Deactivate | Deactivate all selected | Yes -- "Deactivate N companies?" |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + K | Open global search |
| Ctrl/Cmd + N | Open create company modal |
| Escape | Close modal / deselect all |
| Arrow Up/Down | Navigate table rows |
| Enter | Open selected row detail |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop on companies list |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| company.created | { companyId, name, type, createdBy } | Add new row if within current filters; update stat counts |
| company.updated | { companyId, changes, updatedBy } | Update affected row in table; flash highlight |
| company.status.changed | { companyId, oldStatus, newStatus } | Update status badge; update stat counts |
| company.deleted | { companyId, deletedBy } | Remove row from table; update stat counts |

### Live Update Behavior

- **Update frequency:** WebSocket push for company changes; stat bar re-polls every 120 seconds
- **Visual indicator:** Changed rows flash with subtle blue highlight fading over 2 seconds
- **Conflict handling:** If user is editing a company that another user changes, show banner notification

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 60 seconds
- **Endpoint:** GET /api/v1/crm/companies?updatedSince={lastPollTimestamp}
- **Visual indicator:** "Live updates paused -- reconnecting..." banner

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Change status | Immediately update badge | Revert badge, show error toast |
| Change type | Immediately update type badge | Revert badge, show error toast |
| Delete company | Fade out row | Re-insert row, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| companies-table | src/components/crm/companies-table.tsx | columns, data, pagination, sorting, selection |
| company-form | src/components/crm/company-form.tsx | mode: 'create' or 'edit', companyData |
| StatusBadge | src/components/ui/status-badge.tsx | status, size |
| DataTable | src/components/ui/data-table.tsx | columns, data, pagination, sorting |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| FilterBar | src/components/ui/filter-bar.tsx | filters: FilterConfig[] |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| companies-table | Basic columns: name, type, status | Add segment, tier (with stars), credit limit, industry, assigned reps, contact/opp counts, account health indicator, bulk selection |
| company-form | Basic fields: name, legal_name, type, status | Add segment, tier, industry, credit_limit, payment_terms, rep assignment dropdowns, HubSpot ID |
| FilterBar | Type and status dropdowns | Add segment, tier, industry, assigned rep, credit limit range filters |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| TierBadge | Star-rated badge showing tier level with color and star count | Small -- badge with star icons |
| SegmentBadge | Colored badge for ENTERPRISE/MID_MARKET/SMB | Small -- badge component |
| CompanyTypeBadge | Colored badge for CUSTOMER/PROSPECT/PARTNER/VENDOR | Small -- badge component |
| AccountHealthIndicator | Green/Yellow/Red dot based on composite health score | Small -- dot with tooltip |
| CreditLimitDisplay | Formatted credit limit with color coding for near/over limit | Small -- number with conditional styling |
| CompanyStatCards | Row of type-segmented stat cards with click-to-filter | Small -- clickable stat cards |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Dropdown Menu | dropdown-menu | Row actions, bulk actions |
| Dialog | dialog | Create/edit company modal |
| Badge | badge | Type, segment, tier, status badges |
| Select | select | Filter dropdowns |
| Tooltip | tooltip | Account health details, truncated names |
| Command | command | Quick search |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/crm/companies | Fetch paginated company list with filters | useCompanies(filters) |
| 2 | GET | /api/v1/crm/companies/:id | Fetch single company detail | useCompany(id) |
| 3 | POST | /api/v1/crm/companies | Create a new company | useCreateCompany() |
| 4 | PATCH | /api/v1/crm/companies/:id | Update company details | useUpdateCompany() |
| 5 | PATCH | /api/v1/crm/companies/:id/status | Change company status | useUpdateCompanyStatus() |
| 6 | DELETE | /api/v1/crm/companies/:id | Soft delete company | useDeleteCompany() |
| 7 | GET | /api/v1/crm/companies/stats | Get company count stats by type | useCompanyStats() |
| 8 | POST | /api/v1/crm/companies/export | Export filtered companies to CSV | useExportCompanies() |
| 9 | POST | /api/v1/crm/companies/bulk-update | Bulk update company type/assignment | useBulkUpdateCompanies() |
| 10 | GET | /api/v1/users?role=sales_agent | Fetch sales reps for assignment | useSalesReps() |
| 11 | GET | /api/v1/users?role=ops_manager | Fetch ops reps for assignment | useOpsReps() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| crm:{tenantId}:companies | company.created | useCompanyListUpdates() -- invalidates list and stats |
| crm:{tenantId}:companies | company.updated | useCompanyListUpdates() -- updates specific row |
| crm:{tenantId}:companies | company.status.changed | useCompanyListUpdates() -- updates status badge |
| crm:{tenantId}:companies | company.deleted | useCompanyListUpdates() -- removes row |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| GET /api/v1/crm/companies | Filter error toast | Redirect to login | "Access Denied" page | N/A | N/A | Error state with retry |
| POST /api/v1/crm/companies | Validation errors inline | Redirect to login | "Permission Denied" toast | N/A | "Company name exists" toast | Error toast |
| PATCH /api/v1/crm/companies/:id/status | "Invalid transition" toast | Redirect to login | "Permission Denied" toast | "Company not found" | N/A | Error toast |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show stat bar with 5 skeleton cards. Show 8 skeleton table rows with bars matching column widths.
- **Progressive loading:** Header and filters render immediately; stat cards and table show skeletons.
- **Duration threshold:** If loading exceeds 5s, show "This is taking longer than usual..." message.

### Empty States

**First-time empty (no companies):**
- **Illustration:** Building/office illustration
- **Headline:** "No companies yet"
- **Description:** "Add your first company to start managing customer accounts."
- **CTA:** "Add First Company" (primary)

**Filtered empty:**
- **Headline:** "No companies match your filters"
- **Description:** "Try adjusting your search terms or filter criteria."
- **CTA:** "Clear All Filters" (secondary)

### Error States

**Full page error:**
- **Display:** Error icon + "Unable to load companies" + Retry button

**Action error:**
- **Display:** Toast with error message, auto-dismiss 8s

### Permission Denied

- **Full page denied:** N/A (all users can view companies)
- **Partial denied:** Create/Edit/Delete actions hidden for read-only users

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached company data from [timestamp]."
- **Degraded:** "Live updates paused" indicator

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Search | Text input | Searches name, legal_name, dba_name | None | ?search= |
| 2 | Type | Multi-select dropdown | CUSTOMER, PROSPECT, PARTNER, VENDOR | All | ?type= |
| 3 | Status | Multi-select dropdown | ACTIVE, INACTIVE, SUSPENDED | ACTIVE | ?status= |
| 4 | Segment | Multi-select dropdown | ENTERPRISE, MID_MARKET, SMB | All | ?segment= |
| 5 | Tier | Multi-select dropdown | PLATINUM, GOLD, SILVER, BRONZE | All | ?tier= |
| 6 | Industry | Searchable select | All industry values from data | All | ?industry= |
| 7 | Sales Rep | Searchable select | All sales agents | All | ?salesRepId= |
| 8 | Ops Rep | Searchable select | All ops managers | All | ?opsRepId= |

### Search Behavior

- **Search field:** Single search input with magnifying glass icon
- **Searches across:** Company name, legal name, DBA name
- **Behavior:** Debounced 300ms, minimum 2 characters, highlights matching text
- **URL param:** ?search=

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Company Name | Ascending (A-Z) | Alphabetical |
| Type | Custom (CUSTOMER first) | Custom enum order |
| Segment | Custom (ENTERPRISE first) | Custom enum order |
| Tier | Custom (PLATINUM first) | Custom enum order |
| Credit Limit | Descending (highest first) | Numeric |
| Created Date | Descending (newest first) | Date |

**Default sort:** Company Name ascending (A-Z)

### Saved Filters / Presets

- **System presets:** "All Customers", "All Prospects", "Enterprise Accounts", "Platinum Tier", "My Accounts" (assigned to current user)
- **User-created presets:** Users can save filter combinations with custom names
- **URL sync:** All filters reflected in URL for shareable views

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Hide columns: Payment Terms, Ops Rep, Industry (keep Name, Type, Segment, Tier, Credit Limit, Sales Rep)
- Stat cards: horizontal scroll or 3+2 row layout
- Filters collapse to "Filters" button with slide-over panel

### Mobile (< 768px)

- Table switches to card-based list (one card per company)
- Each card: Company name, type badge, segment badge, tier stars, credit limit, sales rep
- Tap card to navigate to detail
- Filters: full-screen modal
- Sticky bottom bar with "+ New Company" button
- Pull-to-refresh

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout as designed |
| Desktop | 1024px - 1439px | May hide Payment Terms column |
| Tablet | 768px - 1023px | See tablet notes |
| Mobile | < 768px | See mobile notes |

---

## 14. Stitch Prompt

```
Design a Companies List screen for a modern SaaS TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with dark slate-900 sidebar (240px) on the left with "CRM" section expanded and "Companies" highlighted with blue-600 indicator. White/gray-50 content area. Top has breadcrumb "CRM > Companies", title "Companies", and buttons: secondary "Export" with download icon, primary blue "+ New Company" with plus icon.

Stats Bar: Below header, 5 stat cards: "Total: 234" (slate), "Customers: 156" (blue dot), "Prospects: 52" (yellow dot), "Partners: 18" (purple dot), "Vendors: 8" (teal dot). White cards, rounded-lg, border-gray-200.

Filter Bar: Below stats: search input ("Search companies..."), "Type" multi-select, "Status" dropdown, "Segment" dropdown, "Tier" dropdown, "Industry" dropdown, "Sales Rep" dropdown, "Clear Filters" text button.

Data Table: Columns: checkbox, Company Name (semibold with legal name in gray-400 below), Type (colored badge -- blue CUSTOMER, yellow PROSPECT, purple PARTNER, teal VENDOR), Status (green ACTIVE, gray INACTIVE), Segment (badge -- ENTERPRISE in slate, MID_MARKET in blue, SMB in green), Tier (star-rated badge -- PLATINUM with 4 gold stars, GOLD with 3 amber stars, SILVER with 2 gray stars, BRONZE with 1 orange star), Credit Limit ($XXX,XXX), Payment Terms (text), Sales Rep (small avatar + name), three-dot menu.

Show 8 rows:
- Acme Logistics / Acme Corp Inc | CUSTOMER (blue) | ACTIVE (green) | ENTERPRISE (slate) | PLATINUM ★★★★ (gold badge) | $500,000 | Net 30 | James W.
- Beta Freight Co / Beta Freight LLC | CUSTOMER (blue) | ACTIVE (green) | MID_MARKET (blue) | GOLD ★★★ (amber badge) | $200,000 | Net 30 | Sarah C.
- Gamma Transport / Gamma Inc | PROSPECT (yellow) | ACTIVE (green) | SMB (green) | -- | -- | -- | James W.
- Delta Partners / Delta Corp | PARTNER (purple) | ACTIVE (green) | ENTERPRISE (slate) | SILVER ★★ (gray badge) | $150,000 | Net 45 | Sarah C.
- Echo Carriers / Echo LLC | VENDOR (teal) | ACTIVE (green) | MID_MARKET (blue) | BRONZE ★ (orange badge) | $50,000 | Net 15 | James W.
- Foxtrot Shipping / Foxtrot Inc | CUSTOMER (blue) | INACTIVE (gray) | ENTERPRISE (slate) | GOLD ★★★ | $300,000 | Net 60 | Unassigned
- Golf Express / Golf Transport LLC | CUSTOMER (blue) | ACTIVE (green) | SMB (green) | SILVER ★★ | $75,000 | Net 30 | Sarah C.
- Hotel Industries / Hotel Corp | PROSPECT (yellow) | ACTIVE (green) | MID_MARKET (blue) | -- | -- | -- | James W.

Bottom: Pagination "Showing 1-25 of 234 companies" with page navigation and "25 per page" dropdown.

Design Specifications:
- Font: Inter or system sans-serif, 14px base size
- Sidebar: slate-900 background, white text, blue-600 active indicator
- Content background: gray-50 for page, white for table and cards
- Primary color: blue-600 for buttons and links
- Type badges: small rounded-full pills with type-specific colors
- Tier badges: rounded-md with star icons, background matches tier color
- Table: white background, border-b border-gray-100, hover bg-gray-50
- Credit limit column: right-aligned numbers, monospace font
- Star ratings: use filled star icons, colored amber for Platinum/Gold, gray for Silver, orange for Bronze
- Modern SaaS aesthetic similar to Salesforce accounts view or HubSpot companies
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1 -- Enhancement Focus)

**What's built and working:**
- [x] Paginated table with company name, legal name, type, status columns
- [x] Search by company name, legal name, DBA name
- [x] Filter by type (CUSTOMER/PROSPECT/PARTNER/VENDOR)
- [x] Filter by status (ACTIVE/INACTIVE)
- [x] Create company via modal form
- [x] Type and status badge color coding
- [x] Click-through to Company Detail
- [x] Pagination and column sorting

**What needs polish / bug fixes:**
- [ ] Missing segment and tier columns -- key account attributes not visible
- [ ] Credit limit column not displayed -- critical for operations
- [ ] No assigned rep columns -- cannot see account ownership
- [ ] Filter state lost on back navigation
- [ ] Search does not highlight matching text

**What to add this wave:**
- [ ] Segment and tier columns with visual badges and star ratings
- [ ] Credit limit column with color coding
- [ ] Sales rep and ops rep columns with avatars
- [ ] Industry filter
- [ ] Segment and tier filters
- [ ] Account health indicator (green/yellow/red)
- [ ] Contact and opportunity count columns
- [ ] Bulk type and assignment updates
- [ ] Column visibility toggle
- [ ] Saved filter presets
- [ ] Export to CSV
- [ ] HubSpot sync indicator on synced companies

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Segment and tier columns | High | Low | P0 |
| Credit limit column | High | Low | P0 |
| Assigned rep columns | High | Low | P0 |
| Segment and tier filters | High | Low | P0 |
| Account health indicator | Medium | Medium | P1 |
| Contact/opportunity counts | Medium | Medium | P1 |
| Bulk operations | Medium | Medium | P1 |
| Export to CSV | Medium | Low | P1 |
| Column visibility toggle | Low | Low | P2 |
| Saved filter presets | Medium | Medium | P2 |
| HubSpot sync indicator | Low | Low | P2 |

### Future Wave Preview

- **Wave 2:** Company hierarchy/parent-child relationships, revenue analytics per company, automated tier assignment based on revenue thresholds, territory-based company assignment
- **Wave 3:** Customer health scoring with ML, churn prediction indicators, competitive intelligence widgets, automated account review scheduling

---

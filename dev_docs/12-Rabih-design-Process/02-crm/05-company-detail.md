# Company Detail

> Service: CRM (Service 02) | Wave: 1 (Enhancement Focus) | Priority: P0
> Route: /(dashboard)/crm/companies/:id | Status: Built
> Primary Personas: Sarah Chen (Ops Manager), James Wilson (Sales Agent)
> Roles with Access: All users (read-only), Sales Agent (assigned -- edit), Sales Manager (all -- edit), Ops Manager (all -- full), Admin (all -- full)

---

## 1. Purpose & Business Context

**What this screen does:**
Provides a comprehensive 360-degree view of a single company/account, organized into tabs covering overview, contacts, opportunities, activities, loads/shipments, billing details, and documents. This is the central hub for understanding everything about a customer relationship.

**Business problem it solves:**
Without a unified company view, team members must navigate between multiple systems to understand a customer's full picture -- their contacts, deals, shipment history, and billing status. This screen consolidates all account intelligence into a single, tabbed interface, enabling faster decision-making and better customer service.

**Key business rules:**
- All authenticated users can view company details (read-only for non-CRM roles)
- Only assigned sales/ops reps or managers/admins can edit company details
- Credit limit changes require manager or admin approval
- Tier changes are logged in the audit trail
- Companies with active loads cannot be deactivated
- HubSpot-synced companies show bi-directional sync status
- Payment terms default to "Net 30" for new CUSTOMER type companies
- Companies with SUSPENDED status cannot have new opportunities or loads created

**Success metric:**
Users can answer any question about a customer account without leaving this screen. Account review meetings take 50% less time because all data is in one place.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Companies List | Click company row or name link | companyId |
| Lead Detail | Click company link (after conversion) | companyId |
| Contact Detail | Click associated company link | companyId |
| Opportunity Detail | Click company name | companyId |
| CRM Dashboard | Click company in any widget | companyId |
| Load Detail | Click customer company link | companyId |
| Global search | Select company from search results | companyId |
| Direct URL | Bookmark / shared link | companyId in route, optional ?tab= |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Companies List | Click "Back to Companies" breadcrumb | Previous filter state |
| Contact Detail | Click contact name in Contacts tab | contactId |
| Opportunity Detail | Click opportunity in Opportunities tab | opportunityId |
| Lead Detail | Click originating lead link | leadId |
| Load Detail | Click load in Loads tab | loadId |
| Edit Company Modal | Click "Edit" button | companyId, prefilled data |

**Primary trigger:**
Sarah Chen (Ops Manager) clicks a company from the list to review the account's full profile before an account review meeting, checking contacts, active opportunities, shipment history, and billing status.

**Success criteria (user completes the screen when):**
- User has a complete understanding of the account's current state
- User has reviewed and updated any stale information
- User has navigated to specific related records (contacts, opportunities, loads) as needed
- User has logged relevant activities or notes

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: CRM > Companies > Acme Logistics                    |
|  [← Back to Companies]            [Edit] [Actions ▼] [HS Sync]   |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  | Company Header Card                                         |  |
|  | ┌────────┐  Acme Logistics            Type: CUSTOMER        |  |
|  | │  ACME  │  DBA: Acme Freight         Segment: ENTERPRISE   |  |
|  | │  LOGO  │  Legal: Acme Corp Inc      Tier: PLATINUM ★★★★   |  |
|  | └────────┘  Industry: Transportation  Status: [ACTIVE]       |  |
|  |             Sales Rep: James Wilson   Ops Rep: Sarah Chen     |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
|  Quick Stats Row:                                                 |
|  [Revenue LTM: $1.2M] [Open Opps: 3] [Contacts: 8] [Loads: 156] |
|  [Credit Used: $45K/$500K] [Last Activity: 2 days ago]           |
+------------------------------------------------------------------+
|  Tabs: [Overview] [Contacts] [Opportunities] [Activities]         |
|        [Loads] [Billing] [Documents]                              |
+------------------------------------------------------------------+

TAB: Overview (default)
|  +---------------------------+ +-------------------------------+  |
|  | Account Details           | | Recent Activity               |  |
|  | Credit Limit: $500,000    | | ● Call w/ John Smith - 2d ago |  |
|  | Payment Terms: Net 30     | | ● Email re: Q1 rates - 4d    |  |
|  | Credit Used: $45,000      | | ● Meeting w/ team - 1 wk ago |  |
|  | Available: $455,000       | | [View All Activities →]       |  |
|  +---------------------------+ +-------------------------------+  |
|  +---------------------------+ +-------------------------------+  |
|  | Key Contacts              | | Open Opportunities            |  |
|  | John Smith (Primary)      | | Acme Q1 Contract - $120K     |  |
|  | Lisa Park (Billing)       | |   NEGOTIATION | 75% | Jan 30 |  |
|  | Omar Ali (Operations)     | | Acme Reefer Lanes - $85K     |  |
|  | [View All Contacts →]     | |   PROPOSAL | 50% | Feb 15    |  |
|  +---------------------------+ +-------------------------------+  |

TAB: Contacts
|  +------------------------------------------------------------+  |
|  | [+ Add Contact]                                             |  |
|  | Name          | Role      | Email          | Phone   | Stat |  |
|  |---------------|-----------|----------------|---------|------|  |
|  | John Smith    | PRIMARY   | john@acme.com  | 555-123 | Act  |  |
|  | Lisa Park     | BILLING   | lisa@acme.com  | 555-456 | Act  |  |
|  | Omar Ali      | OPERATIONS| omar@acme.com  | 555-789 | Act  |  |
|  +------------------------------------------------------------+  |

TAB: Opportunities
|  +------------------------------------------------------------+  |
|  | [+ New Opportunity]                                         |  |
|  | Name         | Stage       | Amount | Prob | Close Date     |  |
|  |--------------|-------------|--------|------|----------------|  |
|  | Q1 Contract  | NEGOTIATION | $120K  | 75%  | Jan 30, 2026   |  |
|  | Reefer Lanes | PROPOSAL    | $85K   | 50%  | Feb 15, 2026   |  |
|  | FTL Expansion| PROSPECTING | $200K  | 25%  | Mar 31, 2026   |  |
|  +------------------------------------------------------------+  |
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, header card) | Company name, type, segment, tier, status, assigned reps | Identity and classification at a glance |
| **Secondary** (quick stats row) | Revenue LTM, open opportunities, contact count, load count, credit usage | Key metrics for account health assessment |
| **Tertiary** (tab content, default overview) | Account details, recent activity, key contacts, open opportunities | Detailed view organized by domain |
| **Hidden** (other tabs, requires click) | Full contacts list, all opportunities, activity history, load history, billing, documents | Deep data organized by category |

---

## 4. Data Fields & Display

### Visible Fields (Header Card)

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Company Name | Company.name | Large semibold text (24px) | Header card |
| 2 | DBA Name | Company.dba_name | "DBA: [name]" in gray-500 (if different) | Header card |
| 3 | Legal Name | Company.legal_name | "Legal: [name]" in gray-500 | Header card |
| 4 | Company Type | Company.company_type | Colored badge: CUSTOMER/PROSPECT/PARTNER/VENDOR | Header card right |
| 5 | Segment | Company.segment | Badge: ENTERPRISE/MID_MARKET/SMB | Header card right |
| 6 | Tier | Company.tier | Star-rated badge: PLATINUM ★★★★ etc. | Header card right |
| 7 | Status | Company.status | StatusBadge: ACTIVE/INACTIVE/SUSPENDED | Header card right |
| 8 | Industry | Company.industry | Text label | Header card |
| 9 | Sales Rep | Company.assigned_sales_rep_id (join) | Avatar + name | Header card |
| 10 | Ops Rep | Company.assigned_ops_rep_id (join) | Avatar + name | Header card |

### Quick Stats Fields

| # | Field Label | Source / Calculation | Format | Location |
|---|---|---|---|---|
| 1 | Revenue LTM | SUM(Opportunity.amount) WHERE CLOSED_WON, last 12 months | Currency $X.XM | Stats row |
| 2 | Open Opportunities | COUNT(Opportunity) WHERE NOT CLOSED | Integer | Stats row |
| 3 | Contacts | COUNT(Contact) WHERE company_id | Integer | Stats row |
| 4 | Total Loads | COUNT(Load) WHERE company_id | Integer | Stats row |
| 5 | Credit Used/Limit | Outstanding AR / Company.credit_limit | "$XXK / $XXXK" with progress bar | Stats row |
| 6 | Last Activity | MAX(Activity.created_at) WHERE company_id | Relative time | Stats row |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Available Credit | Company.credit_limit - outstanding_ar | Currency, green if > 50%, yellow 20-50%, red < 20% |
| 2 | Credit Utilization | (outstanding_ar / credit_limit) * 100 | Percentage with progress bar |
| 3 | Account Age | now() - Company.created_at | "X years, Y months" |
| 4 | Avg Deal Size | SUM(CLOSED_WON amount) / COUNT(CLOSED_WON) | Currency |
| 5 | Win Rate | CLOSED_WON / (CLOSED_WON + CLOSED_LOST) | Percentage |

---

## 5. Features

### Core Features (Built -- Currently Live)

- [x] Company header card with name, type, status
- [x] Tabbed interface (Overview, Contacts, Opportunities, Activities)
- [x] Overview tab with account details and recent activity
- [x] Contacts tab with associated contacts list
- [x] Opportunities tab with linked opportunities
- [x] Activities tab with timeline
- [x] Edit company via modal form
- [x] Breadcrumb navigation back to Companies List

### Advanced Features (Wave 1 Enhancements)

- [ ] **Quick stats row** -- Revenue LTM, open opps, contacts, loads, credit usage, last activity in a compact stat bar
- [ ] **Credit utilization display** -- Progress bar showing credit used vs. limit with color thresholds
- [ ] **Tier and segment badges** -- Visual star ratings and segment badges in header
- [ ] **Loads tab** -- Show shipment history for this company with filters (new tab)
- [ ] **Billing tab** -- Show invoices, payment history, outstanding AR (new tab)
- [ ] **Documents tab** -- Associated documents (contracts, rate sheets, BOLs) (new tab)
- [ ] **HubSpot sync status** -- Sync badge in header with last-synced time and manual sync button
- [ ] **Key contacts widget** -- Overview tab shows top 3 contacts by role (Primary, Billing, Operations)
- [ ] **Open opportunities widget** -- Overview tab shows top active opportunities
- [ ] **Account health score** -- Composite score with breakdown on overview tab
- [ ] **Inline edit for credit limit** -- Quick-edit credit limit without opening full edit modal (manager/admin only)
- [ ] **Company logo upload** -- Upload and display company logo in header card

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View company | All authenticated | company_view | Always visible |
| Edit company | assigned rep, manager, admin | company_edit | "Edit" button hidden |
| Edit credit limit | manager, admin | company_edit_financial | Credit limit shown as read-only |
| Delete company | admin | company_delete | "Delete" in actions hidden |
| View billing tab | manager, admin, finance | finance_view | Tab hidden |
| Add contacts | assigned rep, manager, admin | contact_create | "+ Add Contact" hidden |
| Add opportunities | sales_agent, manager, admin | opportunity_create | "+ New Opportunity" hidden |
| HubSpot sync | admin | integration_manage | Sync button hidden |

---

## 6. Status & State Machine

### Status Transitions (from this screen)

```
Current: ACTIVE
  ├── [Suspend] --> SUSPENDED (requires reason)
  └── [Deactivate] --> INACTIVE (requires confirmation: no active loads)

Current: SUSPENDED
  ├── [Reactivate] --> ACTIVE
  └── [Deactivate] --> INACTIVE

Current: INACTIVE
  └── [Reactivate] --> ACTIVE
```

### Actions Available Per Status

| Status | Available Actions | Restricted Actions |
|---|---|---|
| ACTIVE | Edit, Suspend, Deactivate, Add Contact, Add Opportunity, Log Activity | Delete (admin, no active loads) |
| SUSPENDED | Edit (limited), Reactivate, Deactivate, Log Activity | Add Opportunity, Add Load |
| INACTIVE | Reactivate, View History | Edit, Add Contact, Add Opportunity |

### Status Badge Colors

| Status | Background | Text | Tailwind Classes |
|---|---|---|---|
| ACTIVE | green-100 | green-800 | `bg-green-100 text-green-800` |
| INACTIVE | gray-100 | gray-600 | `bg-gray-100 text-gray-600` |
| SUSPENDED | red-100 | red-800 | `bg-red-100 text-red-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Edit | Pencil | Secondary / Outline | Opens edit company modal | No |
| Actions | ChevronDown | Secondary / Outline | Dropdown: Suspend, Deactivate, Reactivate, Delete | Varies |
| HubSpot Sync | RefreshCw | Ghost / Icon-only | Triggers manual HubSpot sync | No |

### Tab Navigation

| Tab Name | Content | Badge/Count |
|---|---|---|
| Overview | Summary cards and widgets | None |
| Contacts | Associated contacts table | Contact count (8) |
| Opportunities | Linked opportunities table | Open count (3) |
| Activities | Activity timeline | None |
| Loads | Shipment history table | Load count (156) |
| Billing | Invoices and payment history | Outstanding AR badge |
| Documents | Associated files and documents | Doc count |

### In-Tab Actions

| Tab | Action | Trigger | Result |
|---|---|---|---|
| Contacts | + Add Contact | Click button | Opens create contact form (pre-filled companyId) |
| Contacts | Click contact row | Click | Navigate to /crm/contacts/{id} |
| Opportunities | + New Opportunity | Click button | Opens create opportunity form (pre-filled companyId) |
| Opportunities | Click opportunity row | Click | Navigate to /crm/opportunities/{id} |
| Activities | Log Activity | Click form tabs | Creates activity linked to company |
| Loads | Click load row | Click | Navigate to /tms/loads/{id} |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + E | Open edit company modal |
| Ctrl/Cmd + 1-7 | Switch to tab 1 through 7 |
| Escape | Close modal |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop on company detail |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| company.updated | { companyId, changes, updatedBy } | Update header card fields; flash changed fields |
| company.status.changed | { companyId, newStatus } | Update status badge and available actions |
| contact.created | { contactId, companyId } | Update contacts tab count; add to contacts list |
| opportunity.stage.changed | { oppId, newStage } | Update opportunities tab; update quick stats |
| activity.created | { activityId, companyId } | Add to activities timeline; update last activity stat |
| load.created | { loadId, companyId } | Update loads tab count |

### Live Update Behavior

- **Update frequency:** WebSocket push for company-specific events
- **Visual indicator:** Changed fields flash; new items in tabs slide in
- **Conflict handling:** Banner if another user edits simultaneously

### Polling Fallback

- **When:** WebSocket drops
- **Interval:** Every 60 seconds
- **Endpoint:** GET /api/v1/crm/companies/{id}?include=stats&updatedSince={timestamp}
- **Visual indicator:** "Live updates paused" indicator

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Edit company | Immediately show updated values | Revert to previous values |
| Change status | Immediately update badge | Revert badge |
| Add contact | Add to contacts tab immediately | Remove, show error toast |
| Log activity | Add to timeline immediately | Remove, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| company-detail-tabs | src/components/crm/company-detail-tabs.tsx | companyId, activeTab |
| company-form | src/components/crm/company-form.tsx | mode: 'edit', companyData |
| contacts-table | src/components/crm/contacts-table.tsx | companyId filter |
| activity-timeline | src/components/crm/activity-timeline.tsx | companyId filter |
| hubspot-sync-badge | src/components/crm/hubspot-sync-badge.tsx | syncStatus |
| StatusBadge | src/components/ui/status-badge.tsx | status, size |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| company-detail-tabs | 4 tabs (Overview, Contacts, Opportunities, Activities) | Add Loads, Billing, Documents tabs; add badge counts on tab labels |
| company-form | Basic fields | Add industry, segment, tier dropdowns; credit limit with approval workflow; logo upload |
| contacts-table | Basic list in tab | Add role badges, quick-edit role, drag to reorder primary contact |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| CompanyHeaderCard | Full-width card with logo, name, type/segment/tier badges, status, reps | Medium -- complex card layout |
| QuickStatsRow | Row of 6 stat cards showing key metrics with icons | Small -- stat card row |
| CreditUtilizationBar | Progress bar showing credit used vs. limit with color thresholds | Small -- progress bar with labels |
| KeyContactsWidget | Overview widget showing top 3 contacts by role | Small -- contact cards |
| OpenOpportunitiesWidget | Overview widget showing active opportunities with stage/amount | Small -- opportunity list |
| AccountHealthScore | Composite score display with factor breakdown | Medium -- score gauge with breakdown |
| CompanyLogoUpload | Logo upload zone with preview and crop | Medium -- file upload with preview |
| BillingTab | Invoice list, payment history, AR summary | Large -- table with financial data |
| DocumentsTab | File list with upload, categorization, preview | Large -- file management interface |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Tabs | tabs | Main tab navigation |
| Card | card | Header card, stat cards, widget cards |
| Badge | badge | Type, segment, tier, status badges |
| Progress | progress | Credit utilization bar |
| Avatar | avatar | Contact avatars, rep avatars |
| Dialog | dialog | Edit company modal |
| Dropdown Menu | dropdown-menu | Actions menu |
| Table | table | Contact, opportunity, load tables in tabs |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/crm/companies/:id | Fetch company detail with all fields | useCompany(id) |
| 2 | PATCH | /api/v1/crm/companies/:id | Update company details | useUpdateCompany() |
| 3 | PATCH | /api/v1/crm/companies/:id/status | Change company status | useUpdateCompanyStatus() |
| 4 | DELETE | /api/v1/crm/companies/:id | Soft delete company | useDeleteCompany() |
| 5 | GET | /api/v1/crm/companies/:id/contacts | Fetch contacts for this company | useCompanyContacts(companyId) |
| 6 | GET | /api/v1/crm/companies/:id/opportunities | Fetch opportunities for this company | useCompanyOpportunities(companyId) |
| 7 | GET | /api/v1/crm/companies/:id/activities | Fetch activities for this company | useCompanyActivities(companyId) |
| 8 | GET | /api/v1/crm/companies/:id/loads | Fetch loads/shipments for this company | useCompanyLoads(companyId) |
| 9 | GET | /api/v1/crm/companies/:id/billing | Fetch billing/invoice data | useCompanyBilling(companyId) |
| 10 | GET | /api/v1/crm/companies/:id/documents | Fetch associated documents | useCompanyDocuments(companyId) |
| 11 | GET | /api/v1/crm/companies/:id/stats | Fetch quick stats (revenue, counts) | useCompanyStats(companyId) |
| 12 | POST | /api/v1/crm/companies/:id/activities | Log activity on this company | useCreateCompanyActivity() |
| 13 | POST | /api/v1/crm/companies/:id/sync-hubspot | Trigger manual HubSpot sync | useSyncCompanyHubSpot() |
| 14 | POST | /api/v1/crm/companies/:id/logo | Upload company logo | useUploadCompanyLogo() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| crm:company:{companyId} | company.updated | useCompanyDetailUpdates() |
| crm:company:{companyId} | contact.created | useCompanyDetailUpdates() |
| crm:company:{companyId} | opportunity.updated | useCompanyDetailUpdates() |
| crm:company:{companyId} | activity.created | useCompanyDetailUpdates() |
| crm:company:{companyId} | load.created | useCompanyDetailUpdates() |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/v1/crm/companies/:id | N/A | Redirect to login | "Access Denied" page | "Company not found" page | Error state with retry |
| PATCH /api/v1/crm/companies/:id | Validation errors | Redirect to login | "Permission Denied" toast | "Company not found" | Error toast |
| PATCH /api/v1/crm/companies/:id/status | "Invalid transition" or "Active loads exist" | Redirect to login | "Permission Denied" | "Not found" | Error toast |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Header card with logo placeholder, text bars for name/type/segment. Quick stats row with 6 skeleton number cards. Tab content shows skeleton table rows.
- **Progressive loading:** Header card loads first; quick stats and tab content load independently.
- **Duration threshold:** 5s threshold for "Loading..." message.

### Empty States

**Company not found:**
- **Display:** "Company not found. It may have been deleted or you may not have access."
- **CTA:** "Back to Companies" button

**Tab with no data (e.g., no contacts yet):**
- **Contacts tab empty:** "No contacts for this company yet." + "+ Add Contact" button
- **Opportunities tab empty:** "No opportunities for this company yet." + "+ New Opportunity" button
- **Activities tab empty:** "No activities logged yet." + "Log an Activity" CTA
- **Loads tab empty:** "No loads for this company yet."
- **Documents tab empty:** "No documents uploaded yet." + "Upload Document" button

### Error States

**Full page error:** Error icon + "Unable to load company details" + Retry
**Per-tab error:** Individual tab shows error with retry; other tabs function normally

### Permission Denied

- **Full page denied:** N/A (all users can view)
- **Partial denied:** Edit/action buttons hidden; billing tab hidden for non-finance roles

### Offline / Degraded

- **Full offline:** Banner with cached data timestamp
- **Degraded:** "Live updates paused" indicator

---

## 12. Filters, Search & Sort

### Filters (Per Tab)

| Tab | Filter | Type | Options |
|---|---|---|---|
| Contacts | Role Type | Multi-select | PRIMARY, BILLING, SHIPPING, OPERATIONS, EXECUTIVE |
| Contacts | Status | Select | Active, Inactive |
| Opportunities | Stage | Multi-select | PROSPECTING through CLOSED_LOST |
| Activities | Type | Tab filter | All, Calls, Emails, Meetings, Tasks, Notes |
| Activities | Date Range | Date picker | Presets + custom |
| Loads | Status | Multi-select | Load statuses |
| Loads | Date Range | Date picker | Presets + custom |
| Billing | Status | Select | Paid, Outstanding, Overdue |

### Search Behavior

- **Search field:** No global search on detail page; individual tabs may have search within their context
- **Contacts tab search:** Search by contact name or email within this company's contacts
- **Loads tab search:** Search by load number

### Sort Options

| Tab | Default Sort | Sortable Columns |
|---|---|---|
| Contacts | Role type (Primary first) | Name, Role, Status |
| Opportunities | Stage (earliest first) | Name, Stage, Amount, Close Date |
| Activities | Date descending (newest first) | Date only |
| Loads | Date descending | Load #, Date, Status, Origin, Destination |
| Billing | Date descending | Invoice #, Date, Amount, Status |

### Saved Filters / Presets

- **URL sync:** Active tab reflected in URL: /crm/companies/:id?tab=contacts
- **Tab-specific filters:** Persisted in session storage per company

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Header card: stacks logo and details vertically; badges wrap to next line
- Quick stats: 3 per row (2 rows) instead of 6 in one row
- Tabs: scrollable horizontal tab bar if all tabs don't fit
- Tab content tables: hide less critical columns

### Mobile (< 768px)

- Header card: compact layout with essential info (name, type, status, tier)
- Quick stats: horizontal scroll or 2 per row
- Tabs: replaced by dropdown selector or swipeable tab strip
- Tab tables switch to card-based layouts
- Edit via full-screen form instead of modal
- Sticky header with company name and status

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout as designed |
| Desktop | 1024px - 1439px | Same layout, tighter spacing |
| Tablet | 768px - 1023px | See tablet notes |
| Mobile | < 768px | See mobile notes |

---

## 14. Stitch Prompt

```
Design a Company Detail screen for a modern SaaS TMS (Transportation Management System) called "Ultra TMS." This is a 360-degree customer view with multiple tabs.

Layout: Full-width page with dark slate-900 sidebar (240px) on the left with "CRM" > "Companies" highlighted. White/gray-50 content area. Top has breadcrumb "CRM > Companies > Acme Logistics", "Back to Companies" link, and action buttons: secondary "Edit" with pencil icon, secondary "Actions" dropdown, and a small HubSpot sync icon button.

Company Header Card: A large white card (rounded-lg, shadow-sm) spanning full width. Left side shows a company logo placeholder (64px square, rounded, gray-100 background with building icon). Next to it: "Acme Logistics" in 24px semibold, "DBA: Acme Freight" and "Legal: Acme Corp Inc" in gray-500 below. Right side of card shows badges: blue CUSTOMER badge, slate ENTERPRISE badge, gold PLATINUM badge with 4 star icons, green ACTIVE status badge. Below badges: "Industry: Transportation & Logistics", "Sales Rep: James Wilson" with small avatar, "Ops Rep: Sarah Chen" with small avatar.

Quick Stats Row: Below header card, 6 compact stat cards in a row: "Revenue (LTM): $1.2M" with dollar icon, "Open Opps: 3" with trending-up icon, "Contacts: 8" with users icon, "Total Loads: 156" with truck icon, "Credit: $45K / $500K" with a small progress bar (9% used, green), "Last Activity: 2 days ago" with clock icon. White cards with rounded-lg borders.

Tab Bar: Below stats, a horizontal tab bar with 7 tabs: Overview (active, blue-600 underline), Contacts (8), Opportunities (3), Activities, Loads (156), Billing, Documents. Tab labels with count badges in gray circles.

Overview Tab Content (shown): Two-column layout.
Left column: "Account Details" card with fields: Credit Limit $500,000, Payment Terms Net 30, Credit Used $45,000, Available Credit $455,000 (green), Account Age 3 years 7 months, Average Deal Size $95,000, Win Rate 72% (green).
Right column top: "Recent Activity" card with 4 entries showing activity type icons and descriptions with relative timestamps.
Right column bottom: "Key Contacts" card showing 3 contact cards (John Smith - Primary with phone/email, Lisa Park - Billing, Omar Ali - Operations) each with role badge.
Left column bottom: "Open Opportunities" card showing 2 opportunity entries with name, stage badge, amount, probability, close date.

Design Specifications:
- Font: Inter or system sans-serif, 14px base
- Sidebar: slate-900, white text, blue-600 active indicator
- Content background: gray-50 for page, white for cards
- Primary color: blue-600 for active tab, buttons, links
- Header card: white, rounded-lg, shadow-sm, 24px padding
- Stat cards: white, rounded-lg, border-gray-200, compact (48px height)
- Tab bar: border-b border-gray-200, active tab has blue-600 bottom border and blue-600 text
- Company type badges: blue for CUSTOMER, yellow for PROSPECT, purple for PARTNER
- Tier badge: amber/gold background with star icons
- Credit progress bar: thin (4px), green when < 50% used, yellow 50-80%, red > 80%
- Modern SaaS aesthetic similar to Salesforce Lightning record page or HubSpot company detail
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1 -- Enhancement Focus)

**What's built and working:**
- [x] Company header with name, type, status
- [x] 4-tab interface (Overview, Contacts, Opportunities, Activities)
- [x] Overview with basic account details
- [x] Contacts tab with associated contacts table
- [x] Opportunities tab with linked opportunities
- [x] Activities tab with timeline
- [x] Edit company via modal
- [x] Breadcrumb navigation

**What needs polish / bug fixes:**
- [ ] Header card missing segment, tier, industry, assigned reps
- [ ] No quick stats row -- key metrics not visible at a glance
- [ ] Credit limit and payment terms not displayed on overview
- [ ] Tab labels don't show count badges
- [ ] No loading skeletons per tab
- [ ] Mobile layout does not adapt well -- tabs are not scrollable

**What to add this wave:**
- [ ] Quick stats row (revenue, opps, contacts, loads, credit, last activity)
- [ ] Segment, tier, and industry badges in header card
- [ ] Credit utilization progress bar
- [ ] Loads tab with shipment history
- [ ] Billing tab with invoices and payment history
- [ ] Documents tab with file management
- [ ] HubSpot sync status and manual sync button
- [ ] Key contacts and open opportunities overview widgets
- [ ] Account health score
- [ ] Company logo upload
- [ ] Inline credit limit edit

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Quick stats row | High | Medium | P0 |
| Segment/tier/industry badges | High | Low | P0 |
| Credit utilization display | High | Low | P0 |
| Loads tab | High | Medium | P0 |
| Tab count badges | Medium | Low | P0 |
| Billing tab | High | High | P1 |
| Documents tab | Medium | High | P1 |
| HubSpot sync status | Medium | Medium | P1 |
| Overview widgets enhancement | Medium | Medium | P1 |
| Account health score | Medium | High | P2 |
| Company logo upload | Low | Medium | P2 |
| Inline credit limit edit | Low | Low | P2 |

### Future Wave Preview

- **Wave 2:** Company hierarchy (parent/child relationships), revenue forecasting per account, custom fields per company type, automated account review reminders
- **Wave 3:** AI-generated account insights, risk scoring, customer lifetime value prediction, integration with external data enrichment (D&B, ZoomInfo)

---

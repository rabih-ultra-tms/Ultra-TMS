# Contact Detail

> Service: CRM (Service 02) | Wave: 1 (Enhancement Focus) | Priority: P1
> Route: /(dashboard)/crm/contacts/:id | Status: Built
> Primary Personas: James Wilson (Sales Agent), Sarah Chen (Ops Manager)
> Roles with Access: All users (read-only), Sales Agent (assigned companies -- edit), Sales Manager (all -- edit), Ops Manager (all -- full), Admin (all -- full)

---

## 1. Purpose & Business Context

**What this screen does:**
Displays the complete profile of a single contact including personal information, company association, role designation, communication history, activity timeline, and linked opportunities. This is the single source of truth for any individual person within a customer organization.

**Business problem it solves:**
Without a centralized contact profile, team members must search through emails, notes, and spreadsheets to recall previous interactions with a customer contact. Dispatchers, sales agents, and account managers all need a unified view of who the contact is, what role they play, and what conversations have taken place -- ensuring consistent communication and avoiding duplicate outreach.

**Key business rules:**
- All authenticated users can view contact details (read-only for non-CRM roles)
- Only users assigned to the contact's company (or managers/admins) can edit
- A contact's role_type (PRIMARY, BILLING, SHIPPING, OPERATIONS, EXECUTIVE) determines which workflows include them (e.g., BILLING contacts receive invoice emails)
- PRIMARY contacts cannot be deactivated if they are the only PRIMARY contact for their company
- Email addresses must be unique within a tenant across all contacts
- HubSpot-synced contacts show sync status with last-synced timestamp and manual sync button
- Deactivated contacts are read-only except for reactivation and adding notes
- Contacts can belong to only one company at a time; company reassignment requires manager approval

**Success metric:**
Users can view all relevant contact information and their last 5 interactions within 30 seconds. Communication history is complete enough to brief any team member before a call.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Contacts List | Click contact row or name link | contactId |
| Company Detail | Click contact name in Contacts tab or Key Contacts widget | contactId |
| Lead Detail | Click converted contact link (after lead conversion) | contactId |
| Opportunity Detail | Click contact name | contactId |
| CRM Dashboard | Click contact in recent activity widget | contactId |
| Global search | Select contact from search results | contactId |
| Notification bell | Click contact-related notification | contactId |
| Direct URL | Bookmark / shared link | contactId in route |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Contacts List | Click "Back to Contacts" breadcrumb | Previous filter state |
| Company Detail | Click associated company name link | companyId |
| Opportunity Detail | Click linked opportunity | opportunityId |
| Lead Detail | Click originating lead link (if converted from lead) | leadId |
| Edit Contact Modal | Click "Edit" button | contactId, prefilled data |

**Primary trigger:**
James Wilson (Sales Agent) needs to call a shipping contact at Acme Logistics to coordinate a pickup. He clicks the contact's name from the Company Detail page, reviews the last communication, and dials the phone number directly from the profile.

**Success criteria (user completes the screen when):**
- User has reviewed the contact's full profile including role, company, and contact info
- User has reviewed recent communication history for context before reaching out
- User has logged a new activity (call, email, meeting, note) after their interaction
- User has scheduled a follow-up task if needed

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: CRM > Contacts > John Smith                         |
|  [< Back to Contacts]            [Edit] [Actions v] [HS Sync]    |
+------------------------------------------------------------------+
|  +---------------------+  +------------------------------------+ |
|  | Contact Profile Card|  | Tabs: [Overview] [Activities]       | |
|  |                     |  |       [Communications] [Documents]  | |
|  | +--+  John Smith    |  +------------------------------------+ |
|  | |JS|  VP of Sales   |  |                                    | |
|  | +--+  Acme Logistics|  | TAB: Overview (default)            | |
|  |                     |  | +--------------------------------+ | |
|  | Role: [PRIMARY]     |  | | Contact Information             | | |
|  | Dept: Sales         |  | | Email: john@acmelogistics.com   | | |
|  | Status: [ACTIVE]    |  | | Phone: (555) 123-4567          | | |
|  |                     |  | | Mobile: (555) 123-0001         | | |
|  | Quick Actions:      |  | | Preferred: Phone               | | |
|  | [Call] [Email] [Mtg]|  | +--------------------------------+ | |
|  +---------------------+  |                                    | |
|  +---------------------+  | +--------------------------------+ | |
|  | Company Association  |  | | Related Opportunities          | | |
|  |                     |  | | Acme Q1 Contract - $120K       | | |
|  | Acme Logistics      |  | |   NEGOTIATION | 75%             | | |
|  | Type: CUSTOMER      |  | | Acme Reefer Lanes - $85K       | | |
|  | Tier: PLATINUM      |  | |   PROPOSAL | 50%                | | |
|  | [View Company ->]   |  | | [View All Opportunities]        | | |
|  +---------------------+  | +--------------------------------+ | |
|  +---------------------+  |                                    | |
|  | HubSpot Sync        |  | +--------------------------------+ | |
|  | * Synced             |  | | Recent Activity                | | |
|  | Last: 15 min ago    |  | | * Call - Pickup coordination    | | |
|  | HS-8291043          |  | |   Jan 20, 2026 by James W.     | | |
|  | [Sync Now]          |  | | * Email - Sent rate update      | | |
|  +---------------------+  | |   Jan 18, 2026 by James W.     | | |
|  +---------------------+  | | * Meeting - Q1 planning         | | |
|  | Tags / Notes        |  | |   Jan 15, 2026 by Sarah C.     | | |
|  | VIP, Decision Maker |  | | [View All Activities ->]        | | |
|  | Prefers email comm.  |  | +--------------------------------+ | |
|  +---------------------+  +------------------------------------+ |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, profile card) | Contact name, title, company, role badge, status, quick actions | Identity and role at a glance for immediate action |
| **Secondary** (profile card sidebar) | Company association, HubSpot sync status, preferred contact method | Context for reaching out correctly |
| **Tertiary** (tab content, default overview) | Contact details, related opportunities, recent activities | Detailed engagement context for informed conversations |
| **Hidden** (other tabs, requires click) | Full activity timeline, communication log, documents | Deep history for comprehensive review |

---

## 4. Data Fields & Display

### Visible Fields (Profile Card)

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Contact Name | Contact.first_name + Contact.last_name | Large semibold text (20px), with avatar initials | Profile Card header |
| 2 | Title | Contact.title | Gray-500 text below name | Profile Card |
| 3 | Department | Contact.department | Text with department icon | Profile Card |
| 4 | Company Name | Contact.company_id (join Company.name) | Clickable link to Company Detail, blue-600 | Profile Card / Company Card |
| 5 | Role Type | Contact.role_type | Large colored badge: PRIMARY/BILLING/SHIPPING/OPERATIONS/EXECUTIVE | Profile Card |
| 6 | Status | Contact.status | StatusBadge: ACTIVE / INACTIVE | Profile Card |
| 7 | Email | Contact.email | Clickable mailto: link, blue-600 | Overview tab / Profile Card |
| 8 | Phone | Contact.phone | Formatted phone, clickable tel: link | Overview tab / Profile Card |
| 9 | Mobile | Contact.mobile | Formatted phone, clickable tel: link | Overview tab |
| 10 | Company Type | Company.company_type (via join) | Badge in Company Card | Company Association card |
| 11 | Company Tier | Company.tier (via join) | Star-rated badge | Company Association card |
| 12 | HubSpot ID | Contact.hubspot_id | "HS-XXXXXXX" with external link | HubSpot Sync card |
| 13 | Sync Status | Derived from hubspot_sync_log | Badge: Synced / Pending / Error / Not Linked | HubSpot Sync card |
| 14 | Last Synced | hubspot_sync_log.last_synced_at | Relative time "15 min ago" | HubSpot Sync card |
| 15 | Created Date | Contact.created_at | Full date "January 5, 2026 at 10:00 AM" | Overview tab |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Full Name | Contact.first_name + " " + Contact.last_name | Text |
| 2 | Days Since Last Activity | now() - MAX(Activity.created_at) WHERE contact_id | "X days" -- amber if > 30, red if > 60 |
| 3 | Total Activities | COUNT(Activity) WHERE contact_id | Integer "X activities" |
| 4 | Open Opportunities | COUNT(Opportunity) WHERE contact_id AND stage NOT IN (CLOSED_WON, CLOSED_LOST) | Integer |
| 5 | Data Completeness | Percentage of filled fields (email, phone, mobile, title, department) out of 5 | Percentage with visual dots |
| 6 | Communication Preference | Derived from most-used contact method in activities | "Prefers [Phone/Email/Meeting]" |

---

## 5. Features

### Core Features (Built -- Currently Live)

- [x] Contact profile card with name, title, company, role, email, phone
- [x] Activity timeline showing all logged activities in chronological order
- [x] Log new activity (call, email, meeting, task, note) via form
- [x] Edit contact details via modal form
- [x] Company association displayed with link to Company Detail
- [x] Role type badge with color coding
- [x] Status badge (Active/Inactive)
- [x] Breadcrumb navigation back to Contacts List
- [x] Back navigation preserving list filter state

### Advanced Features (Wave 1 Enhancements)

- [ ] **Tabbed interface** -- Overview, Activities, Communications, Documents tabs for organized information
- [ ] **Quick-action buttons** -- Call, Email, Schedule Meeting buttons in profile card that both log the activity and open the communication tool
- [ ] **Company association card** -- Show company type, tier, and segment with link to Company Detail
- [ ] **HubSpot sync card** -- Sync status, last synced time, HubSpot ID with external link, manual Sync Now button
- [ ] **Related opportunities widget** -- Overview tab shows linked opportunities with stage and amount
- [ ] **Communication history tab** -- Separate tab for calls and emails with full conversation log
- [ ] **Documents tab** -- Files shared with or about this contact (proposals, contracts, rate sheets)
- [ ] **Activity filtering** -- Filter activity timeline by type (calls, emails, meetings, tasks, notes)
- [ ] **Follow-up scheduling** -- When logging an activity, option to schedule a follow-up task
- [ ] **Contact tags** -- Custom tags for categorization (VIP, Decision Maker, Technical, etc.)
- [ ] **Preferred contact method** -- Display derived or manually-set preferred communication channel
- [ ] **Inline notes** -- Quick notes section in sidebar for one-liner context
- [ ] **Data completeness indicator** -- Visual progress showing profile fill percentage
- [ ] **Duplicate warning** -- Banner if similar contacts exist in other companies

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View contact detail | All authenticated | contact_view | Always visible (read-only) |
| Edit contact | sales_agent (assigned co.), manager, admin | contact_edit | "Edit" button hidden |
| Delete contact | admin | contact_delete | "Delete" in Actions menu hidden |
| Deactivate contact | sales_agent (assigned), manager, admin | contact_edit | "Deactivate" action hidden |
| Log activity | sales_agent (assigned), manager, admin | activity_create | "Log Activity" form hidden |
| View phone/mobile | sales_agent, manager, admin, ops | contact_view_phone | Phone fields show "---" |
| Sync with HubSpot | admin | integration_manage | "Sync Now" button hidden |
| Upload documents | sales_agent (assigned), manager, admin | document_upload | Upload button hidden |

---

## 6. Status & State Machine

### Status Transitions (from this screen)

```
Current: ACTIVE
  +-- [Deactivate] --> INACTIVE
  |     +-- Blocked if only PRIMARY contact for company
  |     +-- Requires confirmation dialog
  |
  +-- (No other transitions -- contact stays ACTIVE until deactivated)

Current: INACTIVE
  +-- [Reactivate] --> ACTIVE
  |
  +-- (Read-only except for reactivation and adding notes)
```

### Actions Available Per Status

| Status | Available Actions (Buttons) | Restricted Actions |
|---|---|---|
| ACTIVE | Edit, Deactivate, Call, Email, Schedule Meeting, Log Activity, Upload Document | Delete (admin only; not sole PRIMARY) |
| INACTIVE | Reactivate, View History, Add Note | Edit fields, Call, Email, Log Activity, Upload, Delete |

### Status Badge Colors

| Status | Background | Text | Tailwind Classes |
|---|---|---|---|
| ACTIVE | green-100 | green-800 | `bg-green-100 text-green-800` |
| INACTIVE | gray-100 | gray-600 | `bg-gray-100 text-gray-600` |

### Role Type Badge Colors

| Role | Background | Text | Tailwind Classes |
|---|---|---|---|
| PRIMARY | blue-100 | blue-800 | `bg-blue-100 text-blue-800` |
| BILLING | green-100 | green-800 | `bg-green-100 text-green-800` |
| SHIPPING | orange-100 | orange-800 | `bg-orange-100 text-orange-800` |
| OPERATIONS | purple-100 | purple-800 | `bg-purple-100 text-purple-800` |
| EXECUTIVE | amber-100 | amber-800 | `bg-amber-100 text-amber-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Edit | Pencil | Secondary / Outline | Opens edit contact modal with all fields | No |
| Actions | ChevronDown | Secondary / Outline | Dropdown: Deactivate, Reactivate, Change Role, Reassign Company, Delete | Varies |
| HubSpot Sync | RefreshCw | Ghost / Icon-only | Triggers manual HubSpot sync for this contact | No |

### Quick-Action Buttons (In Profile Card)

| Button Label | Icon | Variant | Action |
|---|---|---|---|
| Call | Phone | Outline / Green | Opens phone dialer (tel: link) + creates CALL activity stub ready to log |
| Email | Mail | Outline / Blue | Opens email client (mailto: link) + creates EMAIL activity stub |
| Meeting | Calendar | Outline / Purple | Opens meeting scheduler modal + creates MEETING activity |

### Tab Navigation

| Tab Name | Content | Badge/Count |
|---|---|---|
| Overview | Contact info, related opportunities, recent activity summary | None |
| Activities | Full activity timeline with filtering | Activity count |
| Communications | Call and email log with conversation detail | Comm count |
| Documents | Associated files (proposals, contracts, rate sheets) | Doc count |

### In-Tab Actions

| Tab | Action | Trigger | Result |
|---|---|---|---|
| Overview | Click opportunity | Click row | Navigate to /crm/opportunities/{id} |
| Overview | Click "View Company" | Click link | Navigate to /crm/companies/{companyId} |
| Activities | Log Activity | Click form tabs (Call/Email/Meeting/Task/Note) | Creates activity linked to contact |
| Activities | Filter by type | Click type tabs | Filter timeline to selected type |
| Activities | Expand activity | Click entry | Show full description and details |
| Communications | View full thread | Click communication entry | Expand to show full email/call details |
| Documents | Upload document | Click upload button | File upload with type categorization |
| Documents | Download | Click download icon | Download file |
| Documents | Preview | Click file name | Open preview modal |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + E | Open edit contact modal |
| Ctrl/Cmd + L | Focus log activity form |
| Ctrl/Cmd + 1-4 | Switch to tab 1 through 4 |
| Ctrl/Cmd + Enter | Submit current form |
| Escape | Close modal / cancel edit |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop on contact detail |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| contact.updated | { contactId, changes, updatedBy } | Update displayed fields; show toast if updated by another user |
| contact.status.changed | { contactId, newStatus, changedBy } | Update status badge and available actions |
| contact.activity.created | { contactId, activityId, type, subject, createdBy } | Add activity to timeline with slide-in animation |
| contact.role.changed | { contactId, oldRole, newRole, changedBy } | Update role badge in profile card |
| hubspot.contact.synced | { contactId, syncStatus, lastSyncAt } | Update HubSpot sync card badge and timestamp |
| opportunity.stage.changed | { oppId, contactId, newStage } | Update opportunity in Related Opportunities widget |

### Live Update Behavior

- **Update frequency:** WebSocket push for all contact-specific changes
- **Visual indicator:** Changed fields flash with blue highlight fading over 2 seconds; new activities slide in from top of timeline
- **Conflict handling:** If user is editing while another user makes changes, show banner: "This contact was updated by [name]. Your edits may overwrite their changes. Refresh to see latest."

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 30 seconds
- **Endpoint:** GET /api/v1/crm/contacts/{id}?include=activities&updatedSince={timestamp}
- **Visual indicator:** Show "Live updates paused" indicator in page header

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Edit contact fields | Immediately show updated values in profile card | Revert to previous values, show error toast |
| Change status | Immediately update badge and available actions | Revert badge and actions, show error toast |
| Log activity | Immediately add to timeline with loading indicator | Remove activity entry, show error toast with form data preserved |
| Change role | Immediately update role badge | Revert badge, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| contact-form | src/components/crm/contact-form.tsx | mode: 'edit', contactData |
| activity-timeline | src/components/crm/activity-timeline.tsx | activities, contactId, onActivityCreate |
| StatusBadge | src/components/ui/status-badge.tsx | status, size: 'lg' |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| hubspot-sync-badge | src/components/crm/hubspot-sync-badge.tsx | syncStatus, lastSyncAt |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| activity-timeline | Basic list with type, subject, date | Add expandable descriptions, type filtering tabs, communication-specific view with email thread and call notes |
| contact-form | Basic fields: name, email, phone, company, role | Add mobile field, department dropdown, tags input, preferred contact method, data completeness warning |
| hubspot-sync-badge | Small text indicator | Card layout with sync history, manual sync button, error details, HubSpot ID external link |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| ContactProfileCard | Left sidebar card with avatar, name, title, company, role badge, status, quick actions | Medium -- card with multiple sections and conditional actions |
| CompanyAssociationCard | Card showing linked company with type, tier, and navigation link | Small -- info card with link |
| ContactInfoSection | Overview tab section with email, phone, mobile, preferred method | Small -- formatted field list |
| RelatedOpportunitiesWidget | Overview tab showing linked opportunities with stage/amount | Small -- mini opportunity list |
| RecentActivityWidget | Overview tab showing last 5 activities with links | Small -- compact timeline |
| CommunicationsTab | Full communication log with call recordings, email threads | Large -- threaded communication display |
| DocumentsTab | File list with upload, categorization, preview | Medium -- file management interface |
| ContactTagsInput | Tag input for custom labels (VIP, Decision Maker, etc.) | Small -- tag input with autocomplete |
| ActivityFilterTabs | Tab bar for filtering timeline by activity type | Small -- tab/button group |
| HubSpotSyncCard | Card with sync status, ID, timestamp, sync button | Small -- info card with action |
| DataCompletenessBar | Visual progress bar showing profile fill percentage | Small -- progress bar |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Tabs | tabs | Main tab navigation (Overview, Activities, Communications, Documents) |
| Card | card | Profile card, company card, sync card, overview widgets |
| Dialog | dialog | Edit contact modal |
| Avatar | avatar | Contact initials avatar |
| Badge | badge | Role type, status, company type badges |
| Tooltip | tooltip | Quick action icons, truncated text |
| Separator | separator | Dividers in profile card |
| Textarea | textarea | Activity description input |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/crm/contacts/:id | Fetch contact detail with all fields and company join | useContact(id) |
| 2 | PATCH | /api/v1/crm/contacts/:id | Update contact details | useUpdateContact() |
| 3 | PATCH | /api/v1/crm/contacts/:id/status | Change contact status (activate/deactivate) | useUpdateContactStatus() |
| 4 | PATCH | /api/v1/crm/contacts/:id/role | Change contact role type | useUpdateContactRole() |
| 5 | DELETE | /api/v1/crm/contacts/:id | Soft delete contact | useDeleteContact() |
| 6 | GET | /api/v1/crm/contacts/:id/activities | Fetch activities for this contact (paginated) | useContactActivities(contactId) |
| 7 | POST | /api/v1/crm/contacts/:id/activities | Create a new activity on this contact | useCreateContactActivity() |
| 8 | GET | /api/v1/crm/contacts/:id/communications | Fetch call/email communication log | useContactCommunications(contactId) |
| 9 | GET | /api/v1/crm/contacts/:id/opportunities | Fetch linked opportunities | useContactOpportunities(contactId) |
| 10 | GET | /api/v1/crm/contacts/:id/documents | Fetch associated documents | useContactDocuments(contactId) |
| 11 | POST | /api/v1/crm/contacts/:id/documents | Upload a document for this contact | useUploadContactDocument() |
| 12 | POST | /api/v1/crm/contacts/:id/sync-hubspot | Trigger manual HubSpot sync | useSyncContactHubSpot() |
| 13 | GET | /api/v1/crm/contacts/:id/hubspot-status | Get HubSpot sync status | useContactHubSpotStatus(id) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| crm:contact:{contactId} | contact.updated | useContactDetailUpdates(contactId) -- invalidates contact query |
| crm:contact:{contactId} | contact.status.changed | useContactDetailUpdates(contactId) -- updates status and actions |
| crm:contact:{contactId} | activity.created | useContactDetailUpdates(contactId) -- adds to timeline |
| crm:contact:{contactId} | hubspot.synced | useContactDetailUpdates(contactId) -- updates sync badge |
| crm:contact:{contactId} | document.uploaded | useContactDetailUpdates(contactId) -- adds to documents tab |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| GET /api/v1/crm/contacts/:id | N/A | Redirect to login | "Access Denied" page | "Contact not found" page | N/A | Error state with retry |
| PATCH /api/v1/crm/contacts/:id | Validation errors inline | Redirect to login | "Permission Denied" toast | "Contact not found" | "Email already exists" toast | Error toast |
| PATCH /api/v1/crm/contacts/:id/status | "Cannot deactivate sole PRIMARY" toast | Redirect to login | "Permission Denied" toast | "Not found" | N/A | Error toast |
| POST /api/v1/crm/contacts/:id/activities | Validation errors | Redirect to login | "Permission Denied" toast | "Contact not found" | N/A | Error toast |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Left column shows skeleton card with avatar circle, text bars for name/title/company, badge placeholder. Right column shows skeleton tabs with 4 tab labels and skeleton content blocks.
- **Progressive loading:** Profile card loads first (fast, single record). Tab content loads independently per tab.
- **Duration threshold:** If loading exceeds 5s, show "Loading contact details..." message.

### Empty States

**No activities on contact:**
- **Illustration:** Chat bubble illustration
- **Headline:** "No activities yet"
- **Description:** "Log your first interaction with this contact to start building the communication history."
- **CTA:** Focus on the Log Activity form

**No communications:**
- **Headline:** "No communications recorded"
- **Description:** "Call or email this contact to start the conversation log."
- **CTA:** Quick action buttons (Call, Email)

**No documents:**
- **Headline:** "No documents yet"
- **Description:** "Upload proposals, contracts, or rate sheets for this contact."
- **CTA:** "Upload Document" button

**No related opportunities:**
- **Headline:** "No opportunities linked"
- **Description:** "This contact is not associated with any deals yet."

**Contact not found (invalid ID):**
- **Display:** "Contact not found. It may have been deleted or you may not have access."
- **CTA:** "Back to Contacts" button

### Error States

**Full page error (contact detail API fails):**
- **Display:** Error icon + "Unable to load contact details" + "Please try again or contact support." + Retry button

**Tab content error (activities/communications/documents API fails):**
- **Display:** Profile card displays normally. Affected tab shows: "Could not load [content type]" + Retry link.

**Action error:**
- **Display:** Toast notification with specific error message. Auto-dismiss after 8 seconds.

### Permission Denied

- **Full page denied:** N/A (all users can view contacts)
- **Partial denied:** Edit/Delete/Activity buttons hidden; phone/mobile fields masked; contact is read-only

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. Showing cached contact data from [timestamp]. Activities cannot be logged."
- **Degraded:** "Live updates paused" indicator. Data loads on manual refresh.

---

## 12. Filters, Search & Sort

### Filters (Activity Timeline Tab)

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Activity Type | Tab / toggle group | All, Calls, Emails, Meetings, Tasks, Notes | All | ?activityType= |
| 2 | Date Range | Date picker | Presets: Last 7 days, Last 30 days, Last 90 days, All time | All time | ?dateFrom=&dateTo= |

### Filters (Communications Tab)

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Channel | Toggle | All, Calls, Emails | All | ?channel= |
| 2 | Date Range | Date picker | Presets + custom | All time | ?commDateFrom=&commDateTo= |

### Search Behavior

- **Search field:** No search on this screen (single contact context). Use global search to navigate to a different contact.
- **Within Activities tab:** Text search across activity subjects and descriptions (local client-side filter)

### Sort Options

| Content | Default Sort | Sort Type |
|---|---|---|
| Activity Timeline | Newest first (created_at descending) | Date |
| Communications | Newest first | Date |
| Documents | Newest first (uploaded_at descending) | Date |
| Related Opportunities | Stage order (earliest stage first) | Custom enum |

**Default sort:** Activities sorted newest first.

### Saved Filters / Presets

- **System presets:** N/A for detail screen
- **URL sync:** Active tab reflected in URL: /crm/contacts/:id?tab=activities&activityType=CALL

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Left sidebar profile card and right tabbed content stack vertically
- Profile card becomes full-width at top with horizontal layout (avatar + details side by side)
- Tabs become full-width below
- Quick-action buttons remain visible in profile area
- Company association card moves inline below profile card

### Mobile (< 768px)

- Full vertical stack layout
- Profile card at top: compact layout (avatar, name, role badge, company, status)
- Quick-action buttons (Call, Email, Meeting) as icon buttons in a horizontal row
- Tabs below as horizontal scrollable strip
- Tab content full-width
- Activity timeline as scrollable list
- Log Activity accessible via floating action button (FAB)
- Edit via full-screen form (not modal)
- Documents tab shows file cards with tap-to-download
- Sticky header with contact name and role badge

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full 2-column layout as designed in Section 3 |
| Desktop | 1024px - 1439px | Same layout, slightly narrower sidebar |
| Tablet | 768px - 1023px | See tablet notes above |
| Mobile | < 768px | See mobile notes above |

---

## 14. Stitch Prompt

```
Design a Contact Detail screen for a modern SaaS TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with dark slate-900 sidebar (240px) on the left with "CRM" > "Contacts" highlighted. White/gray-50 content area on the right. Top has breadcrumb "CRM > Contacts > John Smith", a "Back to Contacts" link with left arrow, and action buttons on the right: secondary "Edit" with pencil icon, secondary "Actions" dropdown, and a small HubSpot sync icon button.

Two-Column Layout Below Header:

Left Column (320px, sticky): A profile card with white background, rounded-lg, shadow-sm. At the top, a 48px circular avatar with initials "JS" on blue-600 background, the name "John Smith" in 20px semibold, title "VP of Sales" in gray-500, and company "Acme Logistics" as a blue-600 link. Below that, a blue PRIMARY role badge and green ACTIVE status badge side by side. Below, a "Quick Actions" row with three outline buttons: green "Call" with phone icon, blue "Email" with mail icon, purple "Meeting" with calendar icon.

Below the profile card, a "Company" card showing: "Acme Logistics" as heading, "Type: CUSTOMER" badge in blue, "Tier: PLATINUM" badge in amber with 4 stars, "Segment: ENTERPRISE" in slate, and a "View Company" link.

Below that, a "HubSpot Sync" card showing: green dot "Synced", "Last sync: 15 min ago", "HS-8291043" as external link, and "Sync Now" button.

Right Column (remaining width): A tab bar with 4 tabs: "Overview" (active, blue-600 underline), "Activities", "Communications", "Documents".

Overview Tab Content: Three sections.

1. "Contact Information" card: Email "john@acmelogistics.com" as blue link, Phone "(555) 123-4567" as link, Mobile "(555) 123-0001" as link, Department "Sales", Preferred Contact "Phone".

2. "Related Opportunities" card: Two entries -- "Acme Q1 Contract - $120,000" with green NEGOTIATION badge and "75%" probability; "Acme Reefer Lanes - $85,000" with yellow PROPOSAL badge and "50%". A "View All Opportunities" link at bottom.

3. "Recent Activity" card: Timeline with 5 entries. Green phone icon "Pickup coordination call" Jan 20 by James W. Blue mail icon "Sent rate update for Q1 lanes" Jan 18 by James W. Purple users icon "Q1 planning meeting with ops team" Jan 15 by Sarah C. Gray check icon "Follow-up task completed" Jan 12 by James W. Gray file icon "Sent proposal v2 attachment" Jan 10 by James W. "View All Activities" link.

Design Specifications:
- Font: Inter or system sans-serif, 14px base size
- Sidebar: slate-900 background, white text, blue-600 active indicator
- Content background: gray-50 for page, white for cards
- Primary color: blue-600 for buttons, links, active tab
- Profile card: white, rounded-lg, shadow-sm, 16px padding
- Quick action buttons: outline style, 32px height, with colored icons
- Role badge: blue-100 bg, blue-800 text for PRIMARY
- Tab bar: border-b border-gray-200, active tab blue-600 underline
- Activity timeline: vertical line gray-200, colored icon circles 28px
- Opportunity entries: white cards with stage badge and probability text
- Modern SaaS aesthetic similar to HubSpot contact detail or Salesforce contact record
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1 -- Enhancement Focus)

**What's built and working:**
- [x] Contact profile card with name, title, company, role, email, phone
- [x] Activity timeline showing logged activities
- [x] Log new activity (call, email, meeting, task, note) form
- [x] Edit contact via modal form
- [x] Company link navigates to Company Detail
- [x] Role type badge with color coding
- [x] Status badge (Active/Inactive)
- [x] Breadcrumb navigation

**What needs polish / bug fixes:**
- [ ] No tabbed interface -- all content in a single scrollable page
- [ ] Mobile phone number not displayed (only landline phone)
- [ ] Activity timeline does not support expanding/collapsing descriptions
- [ ] No loading skeleton for activity section
- [ ] Profile card does not show department or title prominently
- [ ] No quick-action buttons for calling or emailing directly
- [ ] Company association does not show company type or tier

**What to add this wave:**
- [ ] Tabbed interface (Overview, Activities, Communications, Documents)
- [ ] Quick-action buttons (Call, Email, Meeting) in profile card
- [ ] Company association card with type, tier, segment
- [ ] HubSpot sync card with status, ID, manual sync
- [ ] Related opportunities widget on Overview tab
- [ ] Communication history tab with call/email log
- [ ] Documents tab with file management
- [ ] Activity filtering by type
- [ ] Contact tags
- [ ] Preferred contact method indicator
- [ ] Data completeness bar
- [ ] Follow-up scheduling from activity log
- [ ] Duplicate contact warning

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Tabbed interface | High | Medium | P0 |
| Quick-action buttons (Call, Email, Meeting) | High | Low | P0 |
| Mobile phone field display | High | Low | P0 |
| Company association card | Medium | Low | P0 |
| Activity filtering by type | Medium | Low | P0 |
| HubSpot sync card | Medium | Medium | P1 |
| Related opportunities widget | Medium | Medium | P1 |
| Communication history tab | High | High | P1 |
| Documents tab | Medium | High | P1 |
| Contact tags | Low | Low | P1 |
| Follow-up scheduling | Medium | Medium | P2 |
| Preferred contact method | Low | Low | P2 |
| Data completeness bar | Low | Low | P2 |
| Duplicate contact warning | Medium | Medium | P2 |

### Future Wave Preview

- **Wave 2:** Email integration (send/receive directly from contact detail), call recording playback, meeting scheduling integration (Google Calendar, Outlook), AI-generated contact summary and talking points
- **Wave 3:** Contact influence scoring, social media profile enrichment (LinkedIn), relationship strength indicator, automated communication sentiment analysis, predictive best-time-to-reach

---

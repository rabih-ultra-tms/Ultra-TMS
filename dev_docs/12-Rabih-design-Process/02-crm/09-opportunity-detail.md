# Opportunity Detail

> Service: CRM (Service 02) | Wave: 2 (Net-New) | Priority: P0
> Route: /(dashboard)/crm/opportunities/:id | Status: Not Built
> Primary Personas: James Wilson (Sales Agent), Sarah Chen (Ops Manager)
> Roles with Access: Sales Agent (own opportunities), Sales Manager (all), Ops Manager (all), Admin (all)

---

## 1. Purpose & Business Context

**What this screen does:**
Displays the complete profile of a single sales opportunity/deal, including stage progression, deal value, associated company and contacts, related quotes, activity history, and documents. A visual stage progression bar at the top provides immediate pipeline context. This is the primary workspace for sales agents to manage individual deals through the pipeline.

**Business problem it solves:**
Without a centralized deal view, sales agents cannot track where a deal stands in the pipeline, what activities have occurred, which quotes have been sent, or what the next steps should be. This screen provides a single source of truth for every deal, enabling faster deal progression, better forecasting accuracy, and consistent sales process adherence.

**Key business rules:**
- Only the assigned sales agent or users with `crm_view_all` can view this opportunity
- Stage changes are tracked in an audit trail visible in the History tab
- Moving to CLOSED_WON requires a final amount > $0 and sets probability to 100%
- Moving to CLOSED_LOST requires a loss reason and sets probability to 0%
- Probability auto-updates when stage changes (configurable defaults per stage)
- Expected close date in the past triggers a warning banner but does not block actions
- CLOSED_WON and CLOSED_LOST opportunities are read-only except for notes
- Quotes can only be created when stage is PROPOSAL or NEGOTIATION
- HubSpot-synced opportunities show sync status mapped to HubSpot Deals
- Re-opening a CLOSED_LOST opportunity requires manager/admin approval and resets to PROSPECTING

**Success metric:**
Sales agents can review deal context, log an activity, and advance a deal stage within 90 seconds. Stage progression decisions are data-driven with activity history and quote details visible. Forecast accuracy improves to within 10% of actual closed revenue.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Opportunities List | Click opportunity row or name in table/kanban | opportunityId |
| Company Detail | Click opportunity in Opportunities tab | opportunityId |
| Contact Detail | Click linked opportunity in Related Opportunities | opportunityId |
| CRM Dashboard | Click opportunity in pipeline widget | opportunityId |
| Lead Detail | Click opportunity link (after lead conversion) | opportunityId |
| Notification bell | Click deal-related notification | opportunityId |
| Global search | Select opportunity from search results | opportunityId |
| Direct URL | Bookmark / shared link | opportunityId in route |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Opportunities List | Click "Back to Opportunities" breadcrumb | Previous filter state |
| Company Detail | Click company name link | companyId |
| Contact Detail | Click contact name link | contactId |
| Quote Detail | Click quote in Quotes tab | quoteId |
| Create Quote | Click "Create Quote" action | opportunityId, companyId (prefilled) |
| Edit Opportunity Modal | Click "Edit" button | opportunityId, prefilled data |

**Primary trigger:**
James Wilson (Sales Agent) clicks an opportunity from the pipeline kanban to review the deal details, check what activities have occurred since his last call, and decide whether to advance the deal to the next stage or create a quote.

**Success criteria (user completes the screen when):**
- User has reviewed the deal's full context (stage, value, activities, quotes)
- User has logged their latest interaction (call, email, meeting, note)
- User has advanced the stage or identified the next action needed
- User has created a quote if the deal is in PROPOSAL or NEGOTIATION stage

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: CRM > Opportunities > Acme Q1 Contract              |
|  [< Back to Opportunities]    [Edit] [Create Quote] [More v]     |
+------------------------------------------------------------------+
|  Stage Progression Bar:                                            |
|  [PROSPECTING]--[QUALIFICATION]--[*PROPOSAL*]--[NEGOTIATION]      |
|       done           done          current        upcoming        |
|  ===========>=========>===========|                               |
|  Stage entered: Jan 10  |  Days in stage: 12  |  Probability: 50% |
+------------------------------------------------------------------+
|  +---------------------------+  +-------------------------------+  |
|  | Deal Summary Card         |  | Tabs: [Overview] [Activities] |  |
|  |                           |  |       [Quotes] [Documents]    |  |
|  | Acme Q1 Contract          |  |       [History]               |  |
|  | Amount: $120,000          |  +-------------------------------+  |
|  | Probability: 50%          |  |                               |  |
|  | Weighted: $60,000         |  | TAB: Overview (default)       |  |
|  | Expected Close: Feb 28    |  |                               |  |
|  |                           |  | +---------------------------+ |  |
|  | Company: Acme Logistics   |  | | Deal Details               | |  |
|  | Contact: John Smith       |  | | Source: Converted Lead     | |  |
|  | Owner: James Wilson       |  | | Created: Jan 5, 2026       | |  |
|  | Created: Jan 5, 2026      |  | | Last Activity: 2 days ago  | |  |
|  +---------------------------+  | | Next Step: Send revised    | |  |
|  +---------------------------+  | |   proposal by Feb 5        | |  |
|  | Quick Actions              |  | +---------------------------+ |  |
|  |                           |  |                               |  |
|  | [> Next Stage]            |  | +---------------------------+ |  |
|  | [+ Create Quote]          |  | | Recent Activity            | |  |
|  | [+ Log Activity]          |  | | * Call - Rate negotiation  | |  |
|  | [X Close Lost]            |  | |   Jan 22 by James W.      | |  |
|  +---------------------------+  | | * Email - Sent proposal v2 | |  |
|  +---------------------------+  | |   Jan 20 by James W.      | |  |
|  | HubSpot Sync              |  | | * Meeting - Needs analysis | |  |
|  | * Synced                   |  | |   Jan 15 by Sarah C.      | |  |
|  | Last: 10 min ago          |  | | [View All Activities ->]   | |  |
|  | Deal ID: HS-Deal-29301    |  | +---------------------------+ |  |
|  | [Sync Now]                |  |                               |  |
|  +---------------------------+  | +---------------------------+ |  |
|                                 | | Active Quotes              | |  |
|                                 | | Quote #Q-2026-0042         | |  |
|                                 | |   $118,500 | SENT | Jan 20 | |  |
|                                 | | Quote #Q-2026-0038         | |  |
|                                 | |   $125,000 | DRAFT | Jan 15| |  |
|                                 | | [View All Quotes ->]       | |  |
|                                 | +---------------------------+ |  |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, stage bar + summary) | Stage progression, deal name, amount, probability, expected close | Sales agents need stage context and deal value at a glance |
| **Secondary** (summary card sidebar) | Company, contact, owner, quick actions, HubSpot sync | Context for who is involved and what to do next |
| **Tertiary** (tab content, default overview) | Deal details, recent activity, active quotes | Engagement history and deal artifacts for informed decisions |
| **Hidden** (other tabs, requires click) | Full activity timeline, all quotes, documents, stage change history | Deep deal management for comprehensive review |

---

## 4. Data Fields & Display

### Visible Fields (Stage Bar + Summary Card)

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Opportunity Name | Opportunity.name | Large semibold text (20px) | Summary Card header |
| 2 | Stage | Opportunity.stage | Highlighted step in stage progression bar | Stage bar |
| 3 | Amount | Opportunity.amount | Currency $XXX,XXX in large text | Summary Card |
| 4 | Probability | Opportunity.probability | Percentage XX% | Summary Card + Stage bar |
| 5 | Expected Close | Opportunity.expected_close_date | Date "Feb 28, 2026" -- red if overdue | Summary Card |
| 6 | Company | Opportunity.company_id (join Company.name) | Clickable link, blue-600 | Summary Card |
| 7 | Contact | Opportunity.contact_id (join Contact name) | Clickable link, blue-600 | Summary Card |
| 8 | Owner | Opportunity.assigned_to (join User.name) | Avatar + name | Summary Card |
| 9 | Created Date | Opportunity.created_at | Full date | Summary Card |
| 10 | Next Step | Opportunity.next_step | Text (user-editable free text) | Overview tab |
| 11 | Source | Opportunity.source | Text: "Converted Lead", "Direct", etc. | Overview tab |
| 12 | HubSpot Deal ID | Opportunity.hubspot_deal_id | "HS-Deal-XXXXX" with external link | HubSpot Sync card |
| 13 | Sync Status | Derived from hubspot_sync_log | Badge: Synced/Pending/Error/Not Linked | HubSpot Sync card |
| 14 | Last Synced | hubspot_sync_log.last_synced_at | Relative time | HubSpot Sync card |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Weighted Value | Opportunity.amount * Opportunity.probability / 100 | Currency $XX,XXX |
| 2 | Days in Current Stage | now() - last stage change timestamp | "X days" -- amber if > 14, red if > 30 |
| 3 | Stage Entered Date | Last stage change timestamp | Full date |
| 4 | Total Deal Age | now() - Opportunity.created_at | "X days" |
| 5 | Days to Close | Opportunity.expected_close_date - now() | "X days" or "Overdue by X days" (red) |
| 6 | Activity Count | COUNT(Activity) WHERE opportunity_id | Integer |
| 7 | Last Activity Date | MAX(Activity.created_at) WHERE opportunity_id | Relative time |
| 8 | Quote Count | COUNT(Quote) WHERE opportunity_id | Integer |
| 9 | Highest Quote Amount | MAX(Quote.total_amount) WHERE opportunity_id | Currency |

---

## 5. Features

### Core Features (Net-New -- To Be Built)

- [ ] **Stage progression bar** -- Visual horizontal bar showing all stages with current stage highlighted, completed stages filled, and upcoming stages grayed
- [ ] **Deal summary card** -- Left sidebar with key deal info: name, amount, probability, close date, company, contact, owner
- [ ] **Tabbed interface** -- Overview, Activities, Quotes, Documents, History tabs
- [ ] **Overview tab** -- Deal details, recent activity summary, active quotes summary, next step
- [ ] **Activities tab** -- Full activity timeline with log activity form
- [ ] **Quotes tab** -- All associated quotes with create quote action
- [ ] **Documents tab** -- Associated files (proposals, contracts, SOWs)
- [ ] **History tab** -- Stage change audit trail with timestamps and users
- [ ] **Edit opportunity** -- Modal form for updating deal details
- [ ] **Stage advancement** -- "Move to Next Stage" with probability auto-update

### Advanced Features

- [ ] **Quick actions sidebar** -- Move to Next Stage, Create Quote, Log Activity, Close Lost as one-click buttons
- [ ] **Close Won workflow** -- Dialog confirming final amount, actual close date, won reason, celebration animation
- [ ] **Close Lost workflow** -- Dialog requiring loss reason (competitor, pricing, timing, no decision, other), competitor name, notes
- [ ] **HubSpot sync card** -- Sync status, Deal ID, last synced, manual sync
- [ ] **Next step field** -- Editable free-text field showing the planned next action for this deal
- [ ] **Stage time tracking** -- Show how long the deal has been in each stage with a mini timeline
- [ ] **Activity filtering** -- Filter activity timeline by type in Activities tab
- [ ] **Quote summary widget** -- Overview tab shows active quotes with amounts and statuses
- [ ] **Inline probability edit** -- Click probability to manually override the auto-set value
- [ ] **Related leads link** -- If opportunity came from a converted lead, show link back to original lead
- [ ] **Contact role indicator** -- Show contact's role type (PRIMARY, BILLING, etc.) next to name
- [ ] **Email/call quick actions** -- Direct call/email buttons for the associated contact
- [ ] **Competitor tracking** -- Field to note competing carriers/brokers on this deal
- [ ] **Re-open closed deal** -- Manager/admin action to re-open a CLOSED_LOST opportunity

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View opportunity | sales_agent (own), manager, admin | opportunity_view | "Access Denied" page |
| Edit opportunity | sales_agent (own), manager, admin | opportunity_edit | "Edit" button hidden |
| Change stage | sales_agent (own), manager, admin | opportunity_edit | Stage buttons hidden; bar is read-only |
| Delete opportunity | admin | opportunity_delete | "Delete" in More menu hidden |
| Close Won | sales_agent (own), manager, admin | opportunity_close | "Close Won" hidden |
| Close Lost | sales_agent (own), manager, admin | opportunity_close | "Close Lost" hidden |
| Re-open closed | manager, admin | opportunity_reopen | "Re-open" hidden on closed deals |
| Create quote | sales_agent (own), manager, admin | quote_create | "Create Quote" hidden |
| Log activity | sales_agent (own), manager, admin | activity_create | "Log Activity" form hidden |
| Change assignment | manager, admin | opportunity_assign | Assignment is read-only |
| Sync HubSpot | admin | integration_manage | "Sync Now" hidden |

---

## 6. Status & State Machine

### Stage Transitions (from this screen)

```
Current: PROSPECTING
  +-- [Move to Qualification] --> QUALIFICATION (probability -> 25%)
  +-- [Close Won] --> CLOSED_WON (probability -> 100%)
  +-- [Close Lost] --> CLOSED_LOST (probability -> 0%, requires reason)

Current: QUALIFICATION
  +-- [Move to Proposal] --> PROPOSAL (probability -> 50%)
  +-- [Move back to Prospecting] --> PROSPECTING (probability -> 10%)
  +-- [Close Won] --> CLOSED_WON
  +-- [Close Lost] --> CLOSED_LOST

Current: PROPOSAL
  +-- [Move to Negotiation] --> NEGOTIATION (probability -> 75%)
  +-- [Move back to Qualification] --> QUALIFICATION (probability -> 25%)
  +-- [Close Won] --> CLOSED_WON
  +-- [Close Lost] --> CLOSED_LOST

Current: NEGOTIATION
  +-- [Close Won] --> CLOSED_WON (probability -> 100%, requires final amount)
  +-- [Close Lost] --> CLOSED_LOST (probability -> 0%, requires reason)
  +-- [Move back to Proposal] --> PROPOSAL (probability -> 50%)

Current: CLOSED_WON
  +-- (Read-only -- no stage changes available)

Current: CLOSED_LOST
  +-- [Re-open] --> PROSPECTING (manager/admin only, probability -> 10%)
```

### Actions Available Per Stage

| Stage | Available Actions (Buttons) | Restricted Actions |
|---|---|---|
| PROSPECTING | Edit, Move to Qualification, Close Won, Close Lost, Log Activity, Assign | Create Quote, Delete |
| QUALIFICATION | Edit, Move to Proposal, Move Back, Close Won, Close Lost, Log Activity, Assign | Delete |
| PROPOSAL | Edit, Move to Negotiation, Move Back, Close Won, Close Lost, Create Quote, Log Activity | Delete |
| NEGOTIATION | Edit, Close Won, Close Lost, Move Back, Create Quote, Log Activity | Delete |
| CLOSED_WON | View Only, Add Note | All edit/stage actions, Delete |
| CLOSED_LOST | Re-open (manager/admin), Add Note | All edit/stage actions, Delete |

### Stage Bar Colors

| Stage | Active Background | Active Text | Completed Background | Tailwind Active Classes |
|---|---|---|---|---|
| PROSPECTING | blue-600 | white | blue-200 | `bg-blue-600 text-white` |
| QUALIFICATION | cyan-600 | white | cyan-200 | `bg-cyan-600 text-white` |
| PROPOSAL | yellow-600 | white | yellow-200 | `bg-yellow-600 text-white` |
| NEGOTIATION | orange-600 | white | orange-200 | `bg-orange-600 text-white` |
| CLOSED_WON | green-600 | white | -- | `bg-green-600 text-white` |
| CLOSED_LOST | red-600 | white | -- | `bg-red-600 text-white` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Edit | Pencil | Secondary / Outline | Opens edit opportunity modal | No |
| Create Quote | FileText | Primary / Blue | Navigate to quote creation with opp data prefilled | No |
| More | ChevronDown | Secondary / Outline | Dropdown: Assign, Close Won, Close Lost, Re-open, Delete | Varies |

### Quick Action Buttons (Left Sidebar Card)

| Button Label | Icon | Variant | Condition | Action |
|---|---|---|---|---|
| Move to Next Stage | ArrowRight | Primary / Blue | Active stages only | Advances to next stage with confirmation |
| Create Quote | FileText | Outline / Blue | Stage is PROPOSAL or NEGOTIATION | Navigate to quote builder |
| Log Activity | Plus | Outline / Gray | Not CLOSED_WON | Opens log activity form on Activities tab |
| Close Lost | XCircle | Outline / Red | Active stages only | Opens loss reason dialog |

### Stage Bar Interactions

| Interaction | Trigger | Result |
|---|---|---|
| Click completed stage | Click on a completed step | Moves deal back to that stage (with confirmation) |
| Click next stage | Click on the next sequential step | Advances deal to that stage |
| Click current stage | Click current step | No action (already active) |
| Click far-future stage | Click on a non-adjacent future step | Skip-ahead with confirmation: "Skip from [current] to [target]?" |
| Hover stage | Mouse enter on any step | Tooltip showing stage name, date entered, days spent |

### Tab Navigation

| Tab Name | Content | Badge/Count |
|---|---|---|
| Overview | Deal details, recent activity, active quotes, next step | None |
| Activities | Full activity timeline with log form | Activity count |
| Quotes | All quotes with status and amounts | Quote count |
| Documents | Associated files | Doc count |
| History | Stage change audit trail | None |

### In-Tab Actions

| Tab | Action | Trigger | Result |
|---|---|---|---|
| Activities | Log Call/Email/Meeting/Task/Note | Click activity type tabs | Creates activity linked to opportunity |
| Activities | Filter by type | Click type filter tabs | Filters timeline |
| Quotes | Create Quote | Click "+ Create Quote" | Navigate to quote builder with opportunity prefilled |
| Quotes | View Quote | Click quote row | Navigate to /crm/quotes/{id} |
| Documents | Upload Document | Click upload button | File upload with categorization |
| Documents | Download | Click download icon | Download file |
| History | View full entry | Click history entry | Expand to show full stage change details |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + E | Open edit opportunity modal |
| Ctrl/Cmd + L | Focus log activity form (switches to Activities tab) |
| Ctrl/Cmd + Q | Open create quote (if stage allows) |
| Ctrl/Cmd + 1-5 | Switch to tab 1 through 5 |
| Ctrl/Cmd + Enter | Submit current form |
| Escape | Close modal / cancel |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop on opportunity detail |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| opportunity.updated | { oppId, changes, updatedBy } | Update displayed fields; show toast if updated by another user |
| opportunity.stage.changed | { oppId, oldStage, newStage, changedBy } | Update stage bar, probability, available actions; add to history |
| opportunity.closed.won | { oppId, finalAmount, closedBy } | Update to CLOSED_WON state; show success banner; confetti animation |
| opportunity.closed.lost | { oppId, lossReason, closedBy } | Update to CLOSED_LOST state; show info banner |
| opportunity.activity.created | { oppId, activityId, type, createdBy } | Add activity to timeline |
| opportunity.assigned | { oppId, newAssignee } | Update owner display |
| quote.created | { quoteId, oppId, amount } | Add quote to Quotes tab; update quote count badge |
| quote.status.changed | { quoteId, oppId, newStatus } | Update quote status in list |
| hubspot.deal.synced | { oppId, syncStatus } | Update HubSpot sync badge |

### Live Update Behavior

- **Update frequency:** WebSocket push for all opportunity-specific changes
- **Visual indicator:** Changed fields flash with blue highlight; stage bar transitions animate smoothly over 500ms; new activities slide in
- **Conflict handling:** If user is editing while another user makes changes, show banner: "This opportunity was updated by [name]. Your edits may overwrite their changes."

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 30 seconds
- **Endpoint:** GET /api/v1/crm/opportunities/{id}?include=activities,quotes&updatedSince={timestamp}
- **Visual indicator:** Show "Live updates paused" indicator

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Change stage | Immediately update stage bar and probability | Revert stage bar animation, show error toast |
| Edit fields | Immediately show updated values | Revert to previous values, show error toast |
| Log activity | Immediately add to timeline with loading indicator | Remove entry, show error toast |
| Close Won | Immediately show CLOSED_WON state | Revert to previous stage, show error toast |
| Close Lost | Immediately show CLOSED_LOST state | Revert to previous stage, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| activity-timeline | src/components/crm/activity-timeline.tsx | activities, opportunityId, onActivityCreate |
| StatusBadge | src/components/ui/status-badge.tsx | status, size |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| hubspot-sync-badge | src/components/crm/hubspot-sync-badge.tsx | syncStatus, lastSyncAt |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| activity-timeline | Basic list with type, subject, date | Add expandable descriptions, type filtering, opportunity-specific context (stage at time of activity) |
| hubspot-sync-badge | Small text indicator | Card layout with deal ID, sync history, manual sync button |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| StageProgressionBar | Horizontal multi-step bar showing all pipeline stages with current/completed/upcoming states | Medium -- multi-step UI with clickable stages, animations, tooltips |
| DealSummaryCard | Left sidebar card with deal amount, probability, weighted value, close date, company/contact/owner | Medium -- card with formatted fields and links |
| QuickActionsCard | Sidebar card with stage advancement, create quote, log activity, close lost buttons | Small -- action button stack with conditional visibility |
| CloseWonDialog | Dialog: verify final amount, actual close date, won notes, celebration animation | Medium -- form dialog with validation and animation |
| CloseLostDialog | Dialog: loss reason dropdown, competitor name, notes textarea | Small -- form dialog with dropdown |
| StageTimeTracker | Mini visualization showing days spent in each stage | Medium -- horizontal bar chart or timeline |
| OpportunityForm | Create/edit form: name, company, contact, stage, amount, probability, close date, next step, notes | Medium -- form with search dropdowns and validation |
| QuotesTabContent | List of quotes with status, amount, dates, and create quote button | Medium -- table with status badges and actions |
| HistoryTabContent | Audit trail of stage changes with timestamps, users, old/new values | Medium -- chronological event list |
| DocumentsTabContent | File list with upload, categorization, preview | Medium -- file management interface |
| NextStepField | Editable text field showing planned next action with inline edit | Small -- inline editable text |
| DealMetricsRow | Row showing days in stage, deal age, days to close | Small -- stat display |
| HubSpotSyncCard | Card with deal sync status, ID, timestamp, sync button | Small -- info card with action |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Tabs | tabs | Main tab navigation |
| Card | card | Summary card, quick actions, sync card |
| Dialog | dialog | Edit, close won, close lost dialogs |
| Badge | badge | Stage badges, quote status badges |
| Avatar | avatar | Owner avatar, contact avatar |
| Tooltip | tooltip | Stage bar tooltips, truncated text |
| Separator | separator | Section dividers |
| Textarea | textarea | Activity description, close notes |
| Select | select | Loss reason dropdown |
| Calendar | calendar | Close date picker |
| Progress | progress | Stage progression visual |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/crm/opportunities/:id | Fetch opportunity detail with all fields | useOpportunity(id) |
| 2 | PATCH | /api/v1/crm/opportunities/:id | Update opportunity details | useUpdateOpportunity() |
| 3 | PATCH | /api/v1/crm/opportunities/:id/stage | Change opportunity stage | useUpdateOpportunityStage() |
| 4 | POST | /api/v1/crm/opportunities/:id/close-won | Close as won with final details | useCloseOpportunityWon() |
| 5 | POST | /api/v1/crm/opportunities/:id/close-lost | Close as lost with reason | useCloseOpportunityLost() |
| 6 | POST | /api/v1/crm/opportunities/:id/reopen | Re-open a closed-lost opportunity | useReopenOpportunity() |
| 7 | PATCH | /api/v1/crm/opportunities/:id/assign | Reassign to different rep | useAssignOpportunity() |
| 8 | DELETE | /api/v1/crm/opportunities/:id | Soft delete opportunity | useDeleteOpportunity() |
| 9 | GET | /api/v1/crm/opportunities/:id/activities | Fetch activities (paginated) | useOpportunityActivities(oppId) |
| 10 | POST | /api/v1/crm/opportunities/:id/activities | Create activity on this opportunity | useCreateOpportunityActivity() |
| 11 | GET | /api/v1/crm/opportunities/:id/quotes | Fetch associated quotes | useOpportunityQuotes(oppId) |
| 12 | GET | /api/v1/crm/opportunities/:id/documents | Fetch associated documents | useOpportunityDocuments(oppId) |
| 13 | POST | /api/v1/crm/opportunities/:id/documents | Upload document | useUploadOpportunityDocument() |
| 14 | GET | /api/v1/crm/opportunities/:id/history | Fetch stage change history | useOpportunityHistory(oppId) |
| 15 | POST | /api/v1/crm/opportunities/:id/sync-hubspot | Trigger manual HubSpot sync | useSyncOpportunityHubSpot() |
| 16 | GET | /api/v1/crm/opportunities/:id/hubspot-status | Get HubSpot sync status | useOpportunityHubSpotStatus(id) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| crm:opportunity:{oppId} | opportunity.updated | useOpportunityDetailUpdates(oppId) -- invalidates query |
| crm:opportunity:{oppId} | opportunity.stage.changed | useOpportunityDetailUpdates(oppId) -- updates stage bar |
| crm:opportunity:{oppId} | activity.created | useOpportunityDetailUpdates(oppId) -- adds to timeline |
| crm:opportunity:{oppId} | quote.created | useOpportunityDetailUpdates(oppId) -- adds to quotes tab |
| crm:opportunity:{oppId} | quote.status.changed | useOpportunityDetailUpdates(oppId) -- updates quote status |
| crm:opportunity:{oppId} | hubspot.synced | useOpportunityDetailUpdates(oppId) -- updates sync badge |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| GET /api/v1/crm/opportunities/:id | N/A | Redirect to login | "Access Denied" page | "Opportunity not found" page | N/A | Error state with retry |
| PATCH .../stage | "Invalid stage transition" toast | Redirect to login | "Permission Denied" toast | "Not found" | "Stage already changed" | Error toast |
| POST .../close-won | "Amount required" toast | Redirect to login | "Permission Denied" | "Not found" | "Already closed" | Error toast |
| POST .../close-lost | "Reason required" toast | Redirect to login | "Permission Denied" | "Not found" | "Already closed" | Error toast |
| POST .../reopen | "Cannot reopen" toast | Redirect to login | "Manager approval required" | "Not found" | N/A | Error toast |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Stage bar shows 4 skeleton step blocks. Left sidebar shows skeleton summary card. Right side shows skeleton tabs with 5 tab labels and skeleton content.
- **Progressive loading:** Stage bar and summary card load first. Tab content loads independently per tab.
- **Duration threshold:** If loading exceeds 5s, show "Loading opportunity details..." message.

### Empty States

**No activities:**
- **Illustration:** Chat bubble illustration
- **Headline:** "No activities yet"
- **Description:** "Log your first interaction to start tracking this deal's progress."
- **CTA:** Focus on Log Activity form

**No quotes:**
- **Headline:** "No quotes created"
- **Description:** "Create a quote to formalize your pricing for this opportunity."
- **CTA:** "Create Quote" button (only if PROPOSAL or NEGOTIATION stage)

**No documents:**
- **Headline:** "No documents yet"
- **Description:** "Upload proposals, contracts, or supporting files for this deal."
- **CTA:** "Upload Document" button

**No history (brand new opportunity):**
- **Display:** Single entry: "Opportunity created" with timestamp

**Opportunity not found:**
- **Display:** "Opportunity not found. It may have been deleted or you may not have access."
- **CTA:** "Back to Opportunities" button

### Error States

**Full page error:**
- **Display:** Error icon + "Unable to load opportunity details" + Retry button

**Tab content error:**
- **Display:** Summary card displays normally. Affected tab shows: "Could not load [content type]" + Retry link.

**Action error:**
- **Display:** Toast with specific error message. Auto-dismiss after 8 seconds.

### Permission Denied

- **Full page denied:** "You don't have permission to view this opportunity" with link to Opportunities List
- **Partial denied:** Edit/stage/quote/activity actions hidden; opportunity is read-only

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached opportunity data from [timestamp]. Changes cannot be saved."
- **Degraded:** "Live updates paused" indicator.

---

## 12. Filters, Search & Sort

### Filters (Activities Tab)

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Activity Type | Tab / toggle group | All, Calls, Emails, Meetings, Tasks, Notes | All | ?activityType= |
| 2 | Date Range | Date picker | Last 7 days, 30 days, 90 days, All time | All time | ?dateFrom=&dateTo= |

### Filters (Quotes Tab)

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Quote Status | Select | All, DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED | All | ?quoteStatus= |

### Search Behavior

- **Search field:** No search on this screen (single opportunity context). Use global search for navigation.
- **Within Activities tab:** Client-side text filter across subjects and descriptions.

### Sort Options

| Content | Default Sort | Sort Type |
|---|---|---|
| Activities | Newest first (created_at descending) | Date |
| Quotes | Newest first (created_at descending) | Date |
| Documents | Newest first (uploaded_at descending) | Date |
| History | Chronological (oldest first) | Date |

**Default sort:** Activities newest first; History oldest first (to show progression).

### Saved Filters / Presets

- **URL sync:** Active tab reflected in URL: /crm/opportunities/:id?tab=quotes&quoteStatus=SENT

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Stage progression bar: compact mode with abbreviated labels (PROSP, QUAL, PROP, NEGO, WON, LOST)
- Left sidebar and right tabbed content stack vertically
- Summary card becomes full-width at top
- Tabs below as full-width content
- Quick actions become a horizontal button row below summary

### Mobile (< 768px)

- Stage progression bar: mini dots instead of full labels; current stage shown as text below dots
- Full vertical stack layout
- Summary card compact: name, amount, probability, stage badge in a tight layout
- Quick actions: Call/Email contact buttons + "Actions" button opening bottom sheet with stage changes
- Tabs: horizontal scrollable strip
- Tab content full-width
- Edit via full-screen form (not modal)
- Close Won/Lost via full-screen dialogs
- Sticky header with opportunity name and stage badge

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
Design an Opportunity Detail screen for a modern SaaS TMS (Transportation Management System) called "Ultra TMS." This is a deal management view with stage progression tracking.

Layout: Full-width page with dark slate-900 sidebar (240px) on the left with "CRM" > "Opportunities" highlighted. White/gray-50 content area. Top has breadcrumb "CRM > Opportunities > Acme Q1 Contract", "Back to Opportunities" link, and action buttons: secondary "Edit" with pencil icon, primary blue "Create Quote" with file-text icon, secondary "More" dropdown.

Stage Progression Bar: A full-width horizontal stepper below the header. Show 6 steps: "Prospecting" (completed, blue-200 bg, check icon), "Qualification" (completed, cyan-200 bg, check icon), "Proposal" (current/active, yellow-600 bg, white text, pulsing dot), "Negotiation" (upcoming, gray-200 bg, gray-400 text), "Closed Won" (upcoming), "Closed Lost" (upcoming). Steps connected by lines -- completed lines are colored, upcoming are gray-200. Below the bar: "Stage entered: Jan 10, 2026 | Days in stage: 12 | Probability: 50%" in gray-500 text.

Two-Column Layout Below Stage Bar:

Left Column (300px, sticky): A "Deal Summary" card (white, rounded-lg, shadow-sm). Show: "Acme Q1 Contract" in 20px semibold, then labeled fields: "Amount: $120,000" in green-700 semibold (24px), "Probability: 50%" with yellow-500 dot, "Weighted Value: $60,000" in gray-600, "Expected Close: Feb 28, 2026" in text, "Company: Acme Logistics" as blue link, "Contact: John Smith (PRIMARY)" with blue role badge, "Owner: James Wilson" with 24px avatar.

Below that, a "Quick Actions" card with 4 stacked buttons: "Move to Negotiation" (primary, blue, arrow-right icon), "Create Quote" (outline, blue, file-text icon), "Log Activity" (outline, gray, plus icon), "Close Lost" (outline, red, x-circle icon).

Below that, a "HubSpot Sync" card: green dot "Synced", "Last: 10 min ago", "HS-Deal-29301" as link, "Sync Now" button.

Right Column: Tab bar with 5 tabs: "Overview" (active, blue-600 underline), "Activities (8)", "Quotes (2)", "Documents (3)", "History".

Overview Tab: Three sections.

1. "Deal Details" card: Source "Converted Lead (John Smith)", Created "Jan 5, 2026", Last Activity "2 days ago", Next Step (editable field) "Send revised proposal with updated rates by Feb 5", Competitor "XYZ Freight Brokerage".

2. "Recent Activity" card: 4 timeline entries with colored icons. Green phone "Rate negotiation call" Jan 22 by James W. Blue mail "Sent proposal v2 with revised rates" Jan 20 by James W. Purple users "Needs analysis meeting with ops team" Jan 15 by Sarah C. Gray arrow "Stage changed: Qualification to Proposal" Jan 10 (auto). "View All Activities" link.

3. "Active Quotes" card: Two quote entries. "#Q-2026-0042 | $118,500 | SENT | Jan 20, 2026" with blue SENT badge. "#Q-2026-0038 | $125,000 | DRAFT | Jan 15, 2026" with gray DRAFT badge. "View All Quotes" link.

Design Specifications:
- Font: Inter or system sans-serif, 14px base size
- Sidebar: slate-900, white text, blue-600 active indicator
- Content: gray-50 for page, white for cards
- Primary: blue-600 for buttons, links, active tab
- Stage bar: 48px height, rounded-full steps (32px circles connected by 4px lines), completed stages have check icon and lighter shade, current has filled color and pulsing dot, upcoming is gray-200
- Summary card: white, rounded-lg, shadow-sm, 16px padding
- Amount: green-700, 24px font weight semibold
- Quick action buttons: full-width, 36px height, stacked with 8px gap
- Tab bar: border-b border-gray-200, blue-600 underline on active
- Modern SaaS aesthetic similar to Salesforce opportunity detail or HubSpot deal view
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2 -- Net-New Build)

**What needs to be built from scratch:**
- [ ] Stage progression bar with clickable stages and animations
- [ ] Deal summary card with all key deal fields
- [ ] 5-tab interface (Overview, Activities, Quotes, Documents, History)
- [ ] Quick actions sidebar (next stage, create quote, log activity, close lost)
- [ ] Close Won workflow with confirmation dialog
- [ ] Close Lost workflow with reason selection
- [ ] Activity timeline for opportunity context
- [ ] Quotes tab integration
- [ ] Documents tab with file management
- [ ] Stage change history/audit trail

**Post-MVP enhancements (within Wave 2):**
- [ ] HubSpot deal sync card
- [ ] Next step editable field
- [ ] Stage time tracker (days per stage visualization)
- [ ] Inline probability override
- [ ] Contact quick action buttons (call/email)
- [ ] Competitor tracking field
- [ ] Related lead link
- [ ] Close Won celebration animation
- [ ] Re-open closed deal workflow

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Stage progression bar | Critical | Medium | P0 |
| Deal summary card | Critical | Low | P0 |
| 5-tab interface | Critical | Medium | P0 |
| Close Won/Lost workflows | Critical | Medium | P0 |
| Quick actions sidebar | High | Low | P0 |
| Activity timeline | High | Medium | P0 |
| Quotes tab | High | Medium | P0 |
| Stage change history | High | Medium | P0 |
| Documents tab | Medium | Medium | P1 |
| HubSpot deal sync | Medium | Medium | P1 |
| Next step field | Medium | Low | P1 |
| Stage time tracker | Low | Medium | P1 |
| Competitor tracking | Low | Low | P1 |
| Inline probability override | Low | Low | P2 |
| Re-open workflow | Low | Medium | P2 |
| Close Won animation | Low | Low | P2 |

### Future Wave Preview

- **Wave 3:** AI deal scoring with win probability prediction, automated next-step suggestions, deal room (shared workspace with customer), revenue recognition forecasting, multi-product line items per opportunity
- **Wave 4:** Guided selling playbooks by stage, automated follow-up sequences, deal comparison analytics, approval workflows for large deals, commission calculator per deal

---

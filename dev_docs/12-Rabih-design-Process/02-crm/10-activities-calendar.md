# Activities Calendar

> Service: CRM (Service 02) | Wave: 2 (Net-New) | Priority: P1
> Route: /(dashboard)/crm/activities | Status: Not Built
> Primary Personas: James Wilson (Sales Agent), Sarah Chen (Ops Manager)
> Roles with Access: Sales Agent (own activities), Sales Manager (team activities), Ops Manager (all), Admin (all)

---

## 1. Purpose & Business Context

**What this screen does:**
Provides a unified calendar view of all CRM activities -- calls, emails, meetings, tasks, and notes -- with monthly, weekly, and daily view options. Sales agents use this screen to manage their daily schedule, plan outreach, track completed activities, and ensure no follow-ups are missed. Color-coded activity types make it easy to see the distribution of work at a glance.

**Business problem it solves:**
Without a centralized activity calendar, sales agents rely on memory, sticky notes, or external calendar apps to track follow-ups and meetings. This leads to missed calls, forgotten follow-ups, and inconsistent customer engagement. The Activities Calendar consolidates all CRM activities into a single time-based view, enabling proactive scheduling and complete visibility into team workload.

**Key business rules:**
- Sales agents see only their own activities unless they have `crm_view_all` permission
- Sales managers see activities for their direct reports (team view)
- Activities are linked to a related entity (Lead, Company, Contact, or Opportunity)
- Tasks have due dates and completion status; overdue tasks are highlighted
- Meetings can have attendees (internal users and external contacts)
- Activities created from this screen must be associated with at least one CRM entity
- Drag-to-reschedule updates the activity's due_date or scheduled_date
- Activities cannot be scheduled in the past (warning shown; user can override for logging past events)
- All time displays respect the user's timezone setting

**Success metric:**
Sales agents log at least 15 activities per week (calls + emails + meetings). No follow-up tasks remain overdue for more than 24 hours. Activity calendar adoption reaches 80% of sales team within 30 days of launch.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| CRM sidebar navigation | Click "Activities" menu item | None |
| CRM Dashboard | Click "View All Activities" or activities KPI card | Optional date range |
| Lead Detail | Click "View All Activities" in timeline | ?entityType=lead&entityId={id} |
| Company Detail | Click "View All Activities" in Activities tab | ?entityType=company&entityId={id} |
| Contact Detail | Click "View All Activities" in Activities tab | ?entityType=contact&entityId={id} |
| Opportunity Detail | Click "View All Activities" in Activities tab | ?entityType=opportunity&entityId={id} |
| Notification bell | Click activity reminder notification | ?date={activityDate}&highlight={activityId} |
| Direct URL | Bookmark / shared link | Query params for date, view, filters |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Lead Detail | Click lead name on activity | leadId |
| Company Detail | Click company name on activity | companyId |
| Contact Detail | Click contact name on activity | contactId |
| Opportunity Detail | Click opportunity name on activity | opportunityId |
| Activity Detail Modal | Click activity on calendar | activityId |
| Create Activity Modal | Click on empty time slot or "+ New Activity" | Pre-filled date/time from click |

**Primary trigger:**
James Wilson (Sales Agent) opens the Activities Calendar at the start of his day to see today's scheduled calls, meetings, and tasks. He reviews his commitments, identifies gaps for outreach, and clicks an empty time slot to schedule a follow-up call with a prospect.

**Success criteria (user completes the screen when):**
- User has reviewed their scheduled activities for the day/week
- User has identified and addressed any overdue tasks
- User has scheduled new activities in available time slots
- User has navigated to related CRM records for context before upcoming activities

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: CRM > Activities                                     |
|  Page Title: "Activities"           [+ New Activity]              |
+------------------------------------------------------------------+
|  View Toggle: [Month] [Week] [*Day*]    < Jan 22, 2026 >  [Today]|
+------------------------------------------------------------------+
|  Filters: [Search...] [Type v] [Assignee v] [Entity v] [Clear]   |
|  Quick Filters: [My Activities] [Team Activities] [Overdue Tasks] |
+------------------------------------------------------------------+

MONTH VIEW:
+------------------------------------------------------------------+
|  Mon    | Tue    | Wed    | Thu    | Fri    | Sat | Sun           |
|---------|--------|--------|--------|--------|-----|---------------|
|         |        |   1    |   2    |   3    |  4  |  5            |
|         |        |        | * Call | * Task |     |               |
|         |        |        | * Mtg  |        |     |               |
|---------|--------|--------|--------|--------|-----|---------------|
|    6    |   7    |   8    |   9    |  10    | 11  |  12           |
| * Task  | * Call | * Email| * Mtg  | * Call |     |               |
|         | * Call | * Mtg  |        | * Task |     |               |
|         |        |        |        | * Note |     |               |
|---------|--------|--------|--------|--------|-----|---------------|
| (continued for full month...)                                     |
+------------------------------------------------------------------+

WEEK VIEW:
+------------------------------------------------------------------+
| Time  | Mon 19  | Tue 20  | Wed 21  | Thu 22  | Fri 23           |
|-------|---------|---------|---------|---------|------------------|
| 8:00  |         |         |         |         |                  |
| 8:30  |         |         |         |[Call    |                  |
| 9:00  |[Meeting |         |[Task    | Acme    |                  |
| 9:30  | Acme    |         | Follow  | Pickup] |                  |
| 10:00 | Q1 Plan]|         | up]     |         |[Email            |
| 10:30 |         |[Call    |         |[Meeting | Send             |
| 11:00 |         | Beta    |         | Delta   | proposal]        |
| 11:30 |         | Intro]  |         | Review] |                  |
| 12:00 |         |         |         |         |                  |
|  ...  |         |         |         |         |                  |
| All Day: [Task: Update CRM records] [Task: Review pipeline]      |
+------------------------------------------------------------------+

DAY VIEW (shown as default in blueprint):
+------------------------------------------------------------------+
| Thursday, January 22, 2026                                        |
|-------|-----------------------------------------------------------|
| All   | [Task] Update CRM records - due today                     |
| Day   | [Task] Review pipeline forecast - OVERDUE (red)            |
|-------|-----------------------------------------------------------|
| 8:00  |                                                           |
| 8:30  | +----------------------------------------------+          |
| 9:00  | | [CALL] Acme Logistics - Pickup coordination  |          |
| 9:30  | | Contact: John Smith | 30 min                 |          |
|       | +----------------------------------------------+          |
| 10:00 |                                                           |
| 10:30 | +----------------------------------------------+          |
| 11:00 | | [MEETING] Delta Corp - Account review         |          |
| 11:30 | | Attendees: Amy Chen, Sarah C. | 1 hr          |          |
|       | +----------------------------------------------+          |
| 12:00 |                                                           |
| 1:00  |                                                           |
| 1:30  | +----------------------------------------------+          |
| 2:00  | | [CALL] Beta Freight - Rate discussion         |          |
| 2:30  | | Contact: Omar Ali | 30 min                   |          |
|       | +----------------------------------------------+          |
| 3:00  |                                                           |
| 3:30  | +----------------------------------------------+          |
| 4:00  | | [EMAIL] Gamma Transport - Send proposal       |          |
| 4:30  | | Contact: Sarah Kim | 15 min                  |          |
|       | +----------------------------------------------+          |
| 5:00  |                                                           |
+------------------------------------------------------------------+
|  +-------- Activity Detail (click to expand) --------+           |
|  | [CALL] Acme Logistics - Pickup coordination        |           |
|  | Date: Jan 22, 2026 at 8:30 AM                      |           |
|  | Duration: 30 minutes                                |           |
|  | Contact: John Smith (PRIMARY) at Acme Logistics     |           |
|  | Opportunity: Acme Q1 Contract ($120K)               |           |
|  | Notes: Discuss pickup schedule for Chicago lanes...  |           |
|  | [Edit] [Complete] [Reschedule] [Delete]             |           |
|  +----------------------------------------------------+           |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Activity type icon + color, title/subject, time, associated entity | Quick scan of what is scheduled and when |
| **Secondary** (visible on hover / card) | Contact name, company, duration, attendees | Context for preparation |
| **Tertiary** (in detail modal) | Full notes, linked opportunity, activity history | Deep context accessed when reviewing individual activity |
| **Hidden** (behind action) | Edit form, reschedule, completion flow | Deliberate management actions |

---

## 4. Data Fields & Display

### Visible Fields (Calendar Entry)

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Activity Type | Activity.type | Colored icon: CALL (green phone), EMAIL (blue mail), MEETING (purple users), TASK (amber check-square), NOTE (gray file-text) | Calendar entry left |
| 2 | Subject | Activity.subject | Semibold text (primary label) | Calendar entry |
| 3 | Scheduled Date | Activity.scheduled_date or Activity.due_date | Time display in calendar slot | Calendar position |
| 4 | Duration | Activity.duration_minutes | "30 min", "1 hr" | Calendar entry |
| 5 | Related Entity | Activity.related_entity_type + entity name (join) | Company/contact/lead/opportunity name | Calendar entry subtext |
| 6 | Contact | Activity.contact_id (join Contact name) | Contact name | Calendar entry |
| 7 | Status | Activity.status | Badge: SCHEDULED, COMPLETED, OVERDUE, CANCELLED | Calendar entry |
| 8 | Assigned To | Activity.assigned_to (join User.name) | Avatar (team view) | Calendar entry corner |
| 9 | Attendees | Activity.attendees (array of user/contact ids) | Avatar stack (meetings) | Calendar entry |
| 10 | Notes | Activity.description | Preview text (expandable) | Detail modal |
| 11 | Completed At | Activity.completed_at | Timestamp with checkmark | Completed entries |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Overdue Indicator | Activity.type = TASK AND Activity.due_date < now() AND Activity.status != COMPLETED | Red "OVERDUE" badge |
| 2 | Today's Activity Count | COUNT(Activity) WHERE scheduled_date = today AND assigned_to = current_user | Integer in header |
| 3 | This Week's Activity Count | COUNT(Activity) WHERE scheduled_date BETWEEN week_start AND week_end | Integer |
| 4 | Completion Rate | COMPLETED count / total count for selected period | Percentage |
| 5 | Time Until Next | MIN(scheduled_date) WHERE scheduled_date > now() - now() | "In X minutes/hours" |

---

## 5. Features

### Core Features (Net-New -- To Be Built)

- [ ] **Monthly calendar view** -- Traditional month grid with activity indicators per day
- [ ] **Weekly calendar view** -- Time-slotted week grid (7:00 AM - 7:00 PM) with activity blocks
- [ ] **Daily calendar view** -- Detailed time-slotted day view with full activity cards
- [ ] **View toggle** -- Switch between Month, Week, and Day views with persistent preference
- [ ] **Date navigation** -- Forward/back arrows to navigate dates, "Today" button to return to current date
- [ ] **Activity type color coding** -- CALL (green), EMAIL (blue), MEETING (purple), TASK (amber), NOTE (gray)
- [ ] **Click to create** -- Click on empty time slot to open new activity form (pre-filled date/time)
- [ ] **Click to view** -- Click activity to open detail modal with full info and actions
- [ ] **Create activity modal** -- Form with type, subject, date/time, duration, related entity, notes
- [ ] **Activity filtering** -- Filter by type, assignee, related entity

### Advanced Features

- [ ] **Drag to reschedule** -- Drag activity blocks to different time slots or days to change scheduled date
- [ ] **Drag to resize** -- Drag bottom edge of activity block to change duration
- [ ] **Quick filters** -- My Activities, Team Activities, Overdue Tasks toggle buttons
- [ ] **Overdue task highlighting** -- Red border and "OVERDUE" badge on tasks past due date
- [ ] **Activity completion** -- Check off tasks/activities as completed from calendar
- [ ] **Mini month navigator** -- Small month calendar in sidebar for quick date jumping
- [ ] **Multi-day events** -- Activities spanning multiple days shown as spanning bars
- [ ] **Conflict detection** -- Warning when creating an activity that overlaps an existing one
- [ ] **Recurring activities** -- Create recurring calls/meetings (daily, weekly, monthly)
- [ ] **Calendar export** -- Export to .ics format for external calendar import
- [ ] **Google Calendar / Outlook integration** -- Bi-directional sync of meetings (future)
- [ ] **Activity reminders** -- Push notification before scheduled activities (15 min, 1 hr, 1 day)
- [ ] **Team availability overlay** -- See team members' busy/free times when scheduling meetings
- [ ] **Activity statistics sidebar** -- Today's count, this week's count, completion rate

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View own activities | All CRM users | activity_view | Only own activities visible |
| View team activities | sales_manager | activity_view_team | Team filter hidden |
| View all activities | ops_manager, admin | crm_view_all | All-users filter hidden |
| Create activity | sales_agent, manager, admin | activity_create | "+ New Activity" hidden; click-to-create disabled |
| Edit activity | activity owner, manager, admin | activity_edit | Edit actions hidden |
| Delete activity | activity owner, admin | activity_delete | Delete action hidden |
| Reassign activity | manager, admin | activity_assign | Assignee is read-only |
| Drag to reschedule | activity owner, manager, admin | activity_edit | Drag disabled |

---

## 6. Status & State Machine

### Activity Status Transitions

```
[SCHEDULED] --> [COMPLETED] (user marks complete, sets completed_at)
[SCHEDULED] --> [CANCELLED] (user cancels, with optional reason)
[COMPLETED] --> [SCHEDULED] (undo completion -- rare)
[CANCELLED] --> [SCHEDULED] (reschedule cancelled activity)

Task-specific:
[SCHEDULED] --> [OVERDUE] (automatic: due_date < now() AND status = SCHEDULED)
[OVERDUE] --> [COMPLETED] (user completes overdue task)
[OVERDUE] --> [CANCELLED] (user cancels overdue task)
```

### Actions Available Per Status

| Status | Available Actions | Restricted Actions |
|---|---|---|
| SCHEDULED | Edit, Complete, Cancel, Reschedule (drag), Delete | N/A |
| COMPLETED | View, Undo Complete, Delete | Edit, Reschedule, Cancel |
| OVERDUE | Edit, Complete, Cancel, Reschedule, Delete | N/A (same as SCHEDULED + visual warning) |
| CANCELLED | Reschedule (re-open), Delete | Edit, Complete |

### Activity Type Colors

| Type | Icon | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|---|
| CALL | Phone | green-100 | green-800 | green-300 | `bg-green-100 text-green-800 border-green-300` |
| EMAIL | Mail | blue-100 | blue-800 | blue-300 | `bg-blue-100 text-blue-800 border-blue-300` |
| MEETING | Users | purple-100 | purple-800 | purple-300 | `bg-purple-100 text-purple-800 border-purple-300` |
| TASK | CheckSquare | amber-100 | amber-800 | amber-300 | `bg-amber-100 text-amber-800 border-amber-300` |
| NOTE | FileText | gray-100 | gray-700 | gray-300 | `bg-gray-100 text-gray-700 border-gray-300` |

### Status Indicator Colors

| Status | Indicator | Tailwind |
|---|---|---|
| SCHEDULED | Normal display (type color) | Type-specific colors |
| COMPLETED | Strikethrough text, muted colors, check icon | `opacity-60 line-through` |
| OVERDUE | Red border, "OVERDUE" badge | `border-red-500 border-2` + red badge |
| CANCELLED | Gray, italic, strikethrough | `opacity-40 italic line-through` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + New Activity | Plus | Primary / Blue | Opens create activity modal | No |

### View Toggle

| Button | Icon | Action |
|---|---|---|
| Month | Calendar | Switches to month grid view |
| Week | CalendarDays | Switches to weekly time-slot view |
| Day | CalendarClock | Switches to daily detailed view |

### Date Navigation

| Button | Icon | Action |
|---|---|---|
| Previous | ChevronLeft | Navigate to previous month/week/day |
| Next | ChevronRight | Navigate to next month/week/day |
| Today | CalendarCheck | Jump to current date |
| Date Display | -- | Shows current date range; clickable to open date picker for jump |

### Calendar Interactions

| Interaction | Trigger | View | Result |
|---|---|---|---|
| Click empty slot | Click on time slot | Week/Day | Opens create activity modal with date/time pre-filled |
| Click day number | Click day in month view | Month | Switches to Day view for that date |
| Click activity | Click on activity entry | All | Opens activity detail modal |
| Drag activity | Drag to new time slot | Week/Day | Reschedules activity to new date/time |
| Drag activity | Drag to new day | Month | Reschedules activity to new date |
| Resize activity | Drag bottom edge | Week/Day | Changes activity duration |
| Double-click slot | Double-click empty slot | Week/Day | Opens create activity modal (same as click) |
| Hover activity | Mouse enter on entry | All | Shows tooltip with subject, type, entity, duration |

### Activity Detail Modal Actions

| Button Label | Icon | Variant | Action | Condition |
|---|---|---|---|---|
| Edit | Pencil | Secondary / Outline | Opens edit form in modal | Not COMPLETED |
| Complete | Check | Primary / Green | Marks activity as completed with timestamp | SCHEDULED or OVERDUE |
| Reschedule | Calendar | Secondary / Outline | Opens date/time picker for new schedule | Not COMPLETED |
| Cancel | XCircle | Secondary / Red outline | Cancels activity with optional reason | SCHEDULED |
| Delete | Trash | Destructive / Red | Soft delete with confirmation | Always (admin) or owner |
| View Entity | ArrowUpRight | Link / Blue | Navigate to linked lead/company/contact/opportunity | Always |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + N | Open create activity modal |
| M | Switch to Month view |
| W | Switch to Week view |
| D | Switch to Day view |
| T | Go to Today |
| Left Arrow | Navigate previous (day/week/month) |
| Right Arrow | Navigate next |
| Escape | Close modal |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| Activity block (Week/Day) | Different time slot | Reschedule to new date/time |
| Activity indicator (Month) | Different day cell | Reschedule to new date |
| Bottom edge of activity | Extend/shrink | Change duration |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| activity.created | { activityId, type, subject, scheduledDate, assignedTo } | Add activity to calendar if within view range |
| activity.updated | { activityId, changes, updatedBy } | Update activity display; flash highlight |
| activity.completed | { activityId, completedAt, completedBy } | Update visual to completed state (muted, checkmark) |
| activity.rescheduled | { activityId, oldDate, newDate } | Animate activity movement to new position |
| activity.cancelled | { activityId, cancelledBy } | Update to cancelled state or remove from view |
| activity.deleted | { activityId } | Remove from calendar with fade animation |

### Live Update Behavior

- **Update frequency:** WebSocket push for all activity changes visible in current view
- **Visual indicator:** New activities slide in; rescheduled activities animate to new position; completed activities fade to muted state
- **Conflict handling:** If another user reschedules an activity currently being dragged, show toast: "[Activity] was moved by [name]."

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 60 seconds
- **Endpoint:** GET /api/v1/crm/activities?dateFrom={viewStart}&dateTo={viewEnd}&updatedSince={timestamp}
- **Visual indicator:** "Live updates paused" banner

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Create activity | Immediately add to calendar in correct slot | Remove with fade, show error toast |
| Reschedule (drag) | Immediately move to new position | Animate back to original position |
| Complete activity | Immediately show completed state | Revert to scheduled state |
| Cancel activity | Immediately show cancelled state | Revert to scheduled state |
| Delete activity | Immediately remove with fade | Re-insert, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| activity-timeline | src/components/crm/activity-timeline.tsx | Can reuse activity type icons and colors |
| StatusBadge | src/components/ui/status-badge.tsx | For activity status badges |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| FilterBar | src/components/ui/filter-bar.tsx | filters |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| activity-timeline | Basic chronological list | Extract activity type config (icons, colors) into shared constants for calendar reuse |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| CalendarMonthView | Traditional month grid with day cells containing activity indicators | Large -- grid layout with scrollable day cells |
| CalendarWeekView | 7-column time-slotted grid (30min increments) with activity blocks | Large -- time grid with positioned blocks |
| CalendarDayView | Single-column time-slotted view with full activity cards | Medium -- time grid with detailed cards |
| CalendarViewToggle | Month/Week/Day toggle button group | Small -- toggle group |
| CalendarDateNavigator | Previous/Next arrows with current date display and Today button | Small -- navigation controls |
| CalendarActivityBlock | Activity entry rendered in calendar (compact for month, full for day) | Medium -- multiple display modes |
| ActivityDetailModal | Modal showing full activity details with actions | Medium -- modal with fields and action buttons |
| ActivityCreateForm | Form: type, subject, date/time, duration, related entity search, notes, attendees | Large -- form with entity search, datetime picker |
| OverdueTaskBanner | Small banner for overdue tasks with count and "View" link | Small -- alert component |
| QuickFilterBar | Toggle buttons for My Activities, Team, Overdue | Small -- toggle group |
| ActivityTypeIcon | Colored icon component for CALL/EMAIL/MEETING/TASK/NOTE | Small -- icon with type-based styling |
| MiniMonthPicker | Small month calendar widget for quick date navigation | Medium -- compact calendar |
| ActivityStatsSidebar | Statistics panel: today's count, week count, completion rate | Small -- stat cards |
| ConflictWarning | Tooltip/badge showing overlapping activities warning | Small -- conditional warning |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Toggle Group | toggle-group | View toggle (Month/Week/Day), quick filters |
| Dialog | dialog | Activity create/edit modal, activity detail |
| Calendar | calendar | Date picker for navigation and scheduling |
| Popover | popover | Activity hover details, date picker popover |
| Badge | badge | Activity type, status badges |
| Tooltip | tooltip | Activity hover info, conflict warnings |
| Select | select | Type, entity, assignee dropdowns |
| Command | command | Entity search in activity form |
| Avatar | avatar | Assignee avatars, attendee avatars |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/crm/activities | Fetch activities for date range with filters | useActivities(filters) |
| 2 | GET | /api/v1/crm/activities/:id | Fetch single activity detail | useActivity(id) |
| 3 | POST | /api/v1/crm/activities | Create a new activity | useCreateActivity() |
| 4 | PATCH | /api/v1/crm/activities/:id | Update activity details | useUpdateActivity() |
| 5 | PATCH | /api/v1/crm/activities/:id/complete | Mark activity as completed | useCompleteActivity() |
| 6 | PATCH | /api/v1/crm/activities/:id/cancel | Cancel an activity | useCancelActivity() |
| 7 | PATCH | /api/v1/crm/activities/:id/reschedule | Reschedule to new date/time | useRescheduleActivity() |
| 8 | DELETE | /api/v1/crm/activities/:id | Soft delete activity | useDeleteActivity() |
| 9 | GET | /api/v1/crm/activities/stats | Activity count stats for date range | useActivityStats(dateRange) |
| 10 | GET | /api/v1/crm/activities/overdue | Fetch overdue tasks | useOverdueActivities() |
| 11 | GET | /api/v1/crm/leads?search= | Search leads for entity linking | useLeadSearch(query) |
| 12 | GET | /api/v1/crm/companies?search= | Search companies for entity linking | useCompanySearch(query) |
| 13 | GET | /api/v1/crm/contacts?search= | Search contacts for entity linking | useContactSearch(query) |
| 14 | GET | /api/v1/crm/opportunities?search= | Search opportunities for entity linking | useOpportunitySearch(query) |
| 15 | GET | /api/v1/users?role=sales_agent | Fetch assignable users | useSalesReps() |

### Query Parameters for Activity List

```
GET /api/v1/crm/activities
  ?dateFrom=2026-01-19    // View start date (required for calendar)
  &dateTo=2026-01-25      // View end date (required)
  &type=CALL,MEETING      // Activity type filter (optional, comma-separated)
  &assignedTo=user123     // Assignee filter (optional)
  &entityType=company     // Related entity type filter (optional)
  &entityId=comp456       // Related entity ID filter (optional)
  &status=SCHEDULED       // Activity status (optional)
  &search=acme            // Search across subjects (optional)
```

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| crm:{tenantId}:activities | activity.created | useCalendarUpdates() -- adds to calendar if in view range |
| crm:{tenantId}:activities | activity.updated | useCalendarUpdates() -- updates affected entry |
| crm:{tenantId}:activities | activity.completed | useCalendarUpdates() -- updates visual state |
| crm:{tenantId}:activities | activity.rescheduled | useCalendarUpdates() -- moves entry |
| crm:{tenantId}:activities | activity.deleted | useCalendarUpdates() -- removes entry |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| GET /api/v1/crm/activities | Invalid date range toast | Redirect to login | "Access Denied" page | N/A | N/A | Error state with retry |
| POST /api/v1/crm/activities | Validation errors inline | Redirect to login | "Permission Denied" toast | N/A | "Time conflict" warning | Error toast |
| PATCH .../reschedule | "Invalid date" toast | Redirect to login | "Permission Denied" | "Not found" | "Already completed" | Error toast |
| PATCH .../complete | N/A | Redirect to login | "Permission Denied" | "Not found" | "Already completed" | Error toast |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Calendar grid shows skeleton cells with faint gray activity block placeholders. Header and controls render immediately.
- **Progressive loading:** Calendar frame (dates, grid lines) renders first. Activity data populates cells afterward.
- **Duration threshold:** 3s threshold for "Loading activities..." message.
- **View switch loading:** When switching views (month/week/day), show a brief loading shimmer on the content area while fetching new data range.

### Empty States

**First-time empty (no activities ever created):**
- **Illustration:** Calendar illustration with plus icon
- **Headline:** "No activities scheduled"
- **Description:** "Start organizing your day by creating calls, meetings, tasks, and more."
- **CTA:** "Create First Activity" (primary)

**Empty day/week/month (no activities in view range):**
- **Month view:** Empty cells with no indicators
- **Week/Day view:** Empty time slots with subtle "Click to create" text on hover
- **No additional empty state UI needed** -- the calendar grid itself communicates emptiness

**Filtered empty:**
- **Display:** Calendar grid with no activities shown. Banner above: "No activities match your filters. [Clear Filters]"

### Error States

**Full page error (API fails):**
- **Display:** Calendar frame renders; content area shows: Error icon + "Unable to load activities" + Retry button

**Activity action error (complete, reschedule, create fails):**
- **Display:** Toast notification with error message. Drag-to-reschedule animates back to original position.

### Permission Denied

- **Full page denied:** "You don't have permission to view activities" with link to CRM Dashboard
- **Partial denied:** Create/edit/drag actions disabled; calendar is view-only

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached activities from [timestamp]. Changes cannot be saved."
- **Degraded:** "Live updates paused" indicator. Calendar data loads on manual refresh.

### Edge Cases

- **Overlapping activities:** In Week/Day view, overlapping time slots show activities side by side (narrower width) similar to Google Calendar
- **Many activities on one day:** Month view shows max 3 indicators with "+N more" link; click to expand or switch to Day view
- **All-day tasks:** Tasks without a specific time show in an "All Day" section at top of Week/Day views
- **Timezone handling:** All times displayed in user's configured timezone; tooltip shows UTC equivalent
- **Past activities:** Past scheduled activities that were never completed show as "OVERDUE" with red indicator

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Search | Text input | Searches subject, entity name | None | ?search= |
| 2 | Activity Type | Multi-select | CALL, EMAIL, MEETING, TASK, NOTE | All | ?type= |
| 3 | Assignee | Searchable select | All sales reps/users | Current user (agents) / All (managers) | ?assignedTo= |
| 4 | Related Entity | Searchable select | Companies, Contacts, Leads, Opportunities | All | ?entityType=&entityId= |
| 5 | Status | Multi-select | SCHEDULED, COMPLETED, OVERDUE, CANCELLED | SCHEDULED + OVERDUE | ?status= |

### Quick Filters (Toggle Buttons)

| # | Quick Filter Label | Logic | URL Param |
|---|---|---|---|
| 1 | My Activities | assignedTo = current user | ?assignedTo={currentUserId} |
| 2 | Team Activities | assignedTo IN team members (managers only) | ?team=true |
| 3 | Overdue Tasks | type = TASK AND status = OVERDUE | ?type=TASK&status=OVERDUE |

### Search Behavior

- **Search field:** Single search input in filter bar
- **Searches across:** Activity subject, related entity name (company, contact, lead, opportunity)
- **Behavior:** Debounced 300ms, minimum 2 characters
- **URL param:** ?search=

### Sort Options

- Calendar views do not have traditional sorting -- activities are positioned by time
- Activities within the same time slot are ordered by: type priority (MEETING > CALL > EMAIL > TASK > NOTE), then alphabetically

### Saved Filters / Presets

- **System presets:** Quick filter buttons (My Activities, Team, Overdue)
- **URL sync:** View type, date range, and all filters reflected in URL: /crm/activities?view=week&date=2026-01-22&type=CALL,MEETING&assignedTo=user123

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Month view: Same layout, slightly smaller day cells
- Week view: Show 5 days (Mon-Fri) with weekend toggle; scrollable horizontally for Sat/Sun
- Day view: Same layout, full width
- Filter bar: collapse to "Filters" button opening slide-over
- Quick filters: horizontal scroll strip

### Mobile (< 768px)

- Default to Day view (most practical on small screens)
- Month view: simplified agenda-style list for each day instead of grid
- Week view: swipeable day-by-day view (like iOS Calendar week)
- Day view: full-width time slots with activity cards
- Create activity: full-screen form (not modal)
- Activity detail: full-screen view (not modal)
- Drag-to-reschedule disabled; use "Reschedule" button in detail view instead
- Sticky header with date and view toggle
- Swipe left/right to navigate between days
- Floating action button for "+ New Activity"

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout as designed in Section 3 |
| Desktop | 1024px - 1439px | Same layout, slightly narrower columns |
| Tablet | 768px - 1023px | See tablet notes above |
| Mobile | < 768px | See mobile notes above |

---

## 14. Stitch Prompt

```
Design an Activities Calendar screen for a modern SaaS TMS (Transportation Management System) called "Ultra TMS." This is a CRM activity scheduling and tracking calendar.

Layout: Full-width page with dark slate-900 sidebar (240px) on the left with "CRM" > "Activities" highlighted with blue-600 indicator. White/gray-50 content area. Top has breadcrumb "CRM > Activities", title "Activities", and primary blue "+ New Activity" button with plus icon.

Controls Row: Below header, show a view toggle group: "Month" / "Week" (active, blue-600 bg, white text) / "Day" buttons. Center: date navigation with left arrow, "January 19 - 25, 2026" text, right arrow, and "Today" button. Right side: filter controls.

Quick Filters: Row of pill-shaped toggle buttons: "My Activities" (active, blue-600 border, blue-50 bg), "Team Activities", "Overdue Tasks" (shows red badge count "3").

Filter Bar: search input "Search activities...", "Type" multi-select (with colored dots: green Call, blue Email, purple Meeting, amber Task, gray Note), "Assignee" dropdown, "Entity" searchable dropdown, "Clear Filters".

Weekly Calendar View (shown): 5-column grid (Mon-Fri) with time slots from 8:00 AM to 6:00 PM in 30-minute increments. Light gray horizontal lines for each time slot. Day headers show "Mon 19", "Tue 20", etc. Current day (Thu 22) has a subtle blue-50 background column.

Activity blocks positioned in time slots:

Monday 19:
- 9:00-10:00: Purple block "Q1 Planning Meeting" / "Acme Logistics" / attendee avatars (2). Purple-100 bg, purple-300 left border (4px).

Tuesday 20:
- 10:30-11:00: Green block "Intro Call" / "Beta Freight" / "Omar Ali". Green-100 bg, green-300 left border.

Wednesday 21:
- 9:00-9:30: Amber block "Follow-up Task" / "Gamma Transport" with checkmark button. Amber-100 bg, amber-300 left border.

Thursday 22 (today, blue-50 column bg):
- 8:30-9:00: Green block "Pickup Coordination" / "Acme Logistics" / "John Smith". Green-100 bg.
- 10:30-11:30: Purple block "Account Review" / "Delta Corp" / "Amy Chen, Sarah C." with 2 attendee avatars.
- 1:30-2:00: Green block "Rate Discussion" / "Beta Freight" / "Omar Ali".
- 3:30-4:00: Blue block "Send Proposal" / "Gamma Transport" / "Sarah Kim". Blue-100 bg, blue-300 left border.

Friday 23:
- All Day section: Amber block "Review Pipeline Forecast" with red "OVERDUE" badge.
- 10:00-10:30: Blue block "Send Proposal" / "Echo Carriers".

All Day section at top of grid: shows tasks without specific times. "Update CRM Records" (amber), "Review Pipeline" (amber, red OVERDUE badge with exclamation icon).

Hover state on any block: subtle shadow-md elevation and cursor: grab icon for drag hint.

Also show a mini activity detail popup (floating card) for the selected "Pickup Coordination" entry: white card with shadow-lg, showing full details: type icon (green phone), subject, date/time, duration "30 min", contact "John Smith (PRIMARY)" as link, company "Acme Logistics" as link, opportunity "Acme Q1 Contract" as link, notes preview. Action buttons: "Edit", "Complete" (green), "Reschedule", "Delete" (red).

Design Specifications:
- Font: Inter or system sans-serif, 14px base
- Sidebar: slate-900, white text, blue-600 active
- Content: gray-50 page bg, white calendar bg
- Primary: blue-600 for buttons, active states
- Calendar grid: white bg, gray-100 horizontal lines, gray-200 column borders
- Time labels: gray-400 text, 12px, left-aligned
- Day headers: gray-700 semibold, 14px
- Today column: blue-50 bg highlight
- Activity blocks: rounded-md, 4px colored left border, type-specific background
- Activity colors: green-100/green-300 for CALL, blue-100/blue-300 for EMAIL, purple-100/purple-300 for MEETING, amber-100/amber-300 for TASK, gray-100/gray-300 for NOTE
- Overdue badge: red-600 bg, white text, rounded-full, 8px padding
- Hover on blocks: shadow-md, cursor grab
- Drag state: opacity-75, shadow-lg, slight rotation
- Modern SaaS aesthetic similar to Google Calendar or Calendly scheduling view
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2 -- Net-New Build)

**What needs to be built from scratch:**
- [ ] Monthly calendar grid view with activity indicators
- [ ] Weekly time-slotted calendar view with activity blocks
- [ ] Daily detailed calendar view
- [ ] View toggle (Month/Week/Day) with persistent preference
- [ ] Date navigation (previous/next, Today button)
- [ ] Activity type color coding system
- [ ] Click-to-create on empty time slots
- [ ] Click-to-view activity detail modal
- [ ] Create activity form with entity linking
- [ ] Activity filtering and search

**Post-MVP enhancements (within Wave 2):**
- [ ] Drag-to-reschedule activities
- [ ] Drag-to-resize activity duration
- [ ] Quick filter toggles (My Activities, Team, Overdue)
- [ ] Overdue task highlighting with red indicators
- [ ] Activity completion directly from calendar
- [ ] Conflict detection for overlapping activities
- [ ] Mini month navigator for quick date jumping
- [ ] All-day task section in Week/Day views
- [ ] Activity statistics sidebar
- [ ] Calendar export to .ics

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Weekly calendar view | Critical | High | P0 |
| Daily calendar view | Critical | Medium | P0 |
| Monthly calendar view | High | High | P0 |
| Activity type color coding | High | Low | P0 |
| Click-to-create/view | High | Medium | P0 |
| Create activity form | Critical | Medium | P0 |
| Date navigation | Critical | Low | P0 |
| View toggle | High | Low | P0 |
| Activity filtering | High | Medium | P0 |
| Drag-to-reschedule | High | High | P1 |
| Overdue task highlighting | High | Low | P1 |
| Activity completion from calendar | Medium | Low | P1 |
| Quick filter toggles | Medium | Low | P1 |
| Conflict detection | Medium | Medium | P1 |
| All-day task section | Medium | Medium | P1 |
| Mini month navigator | Low | Medium | P2 |
| Drag-to-resize | Low | Medium | P2 |
| Activity statistics sidebar | Low | Medium | P2 |
| Calendar export .ics | Low | Low | P2 |
| Recurring activities | Medium | High | P2 |

### Future Wave Preview

- **Wave 3:** Google Calendar / Outlook bi-directional sync, automated activity suggestions (AI recommends who to call based on pipeline), call recording integration, email thread linking, meeting room booking
- **Wave 4:** Sales cadence automation (automated sequence of calls/emails/tasks), team capacity planning, activity-to-revenue attribution analytics, mobile push notification reminders, voice-to-text call logging

---

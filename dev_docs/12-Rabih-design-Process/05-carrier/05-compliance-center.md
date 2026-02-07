# Compliance Center

> Service: 05 - Carrier Management | Wave: 3 | Priority: P0
> Route: /(dashboard)/carriers/compliance | Status: Not Started
> Primary Personas: Sarah (Ops Manager), Admin
> Roles with Access: ops_manager, carrier_admin, compliance_officer, admin

---

## 1. Purpose & Business Context

**What this screen does:**
The Compliance Center is a centralized monitoring dashboard that provides real-time oversight of all carrier compliance across the entire fleet. It surfaces insurance expirations, FMCSA authority changes, missing documentation, and safety rating issues in a single prioritized view. The screen combines a summary KPI overview, a prioritized compliance issues table, a visual expiration timeline, and FMCSA batch monitoring tools -- giving the compliance team everything they need to protect the brokerage from regulatory exposure and liability risk.

**Business problem it solves:**
Freight brokerages face significant liability exposure if they dispatch loads to carriers with expired insurance, revoked authority, or out-of-service status. The FMCSA and shipper customers both hold brokerages accountable for carrier vetting. Without a centralized compliance view, the team relies on spreadsheets and calendar reminders, which leads to missed expirations (average 3-5 per month), reactive rather than proactive compliance management, and potential regulatory fines ($10,000+ per violation). The Compliance Center eliminates these gaps by providing continuous, automated monitoring with tiered alerting.

**Key business rules:**
- All compliance issues are sorted by urgency: EXPIRED first (red), then EXPIRING within 7 days (orange), then 14 days (yellow), then 30 days (blue).
- Auto-suspend feature: when enabled, carriers with expired required insurance (Auto Liability or Cargo) are automatically moved to SUSPENDED status.
- FMCSA batch checks run weekly (scheduled job) and can also be triggered manually by admin.
- Authority changes detected during FMCSA checks (revocation, OOS status) trigger immediate auto-suspension regardless of the auto-suspend toggle.
- Reminder emails are sent automatically at 30, 14, and 7 days before insurance expiration. These are configurable.
- Only ACTIVE and SUSPENDED carriers appear in the compliance issues table (INACTIVE, PENDING, and BLACKLISTED are excluded).
- Compliance score is calculated as: (compliant items / total required items) * 100 per carrier.

**Success metric:**
Zero carriers dispatched with expired insurance or revoked authority. Insurance lapse rate below 2%. Average time from compliance issue detection to resolution under 48 hours.

---

## 2. User Journey Context

**Comes from (entry points):**

| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sidebar Navigation | Clicks "Carriers" > "Compliance" in sidebar | None |
| Carrier Dashboard | Clicks "Compliance Issues" KPI card or "View All Compliance Issues" link | `?severity=all` |
| Notification Center | Clicks compliance alert notification (insurance expiring, FMCSA change) | `?carrier={carrierId}` or `?type=insurance` |
| Carrier Detail | Clicks "View in Compliance Center" link from Compliance tab | `?carrier={carrierId}` |
| Direct URL | Bookmark / shared link | Route params |

**Goes to (exit points):**

| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carrier Detail | Clicks carrier name in issues table or timeline dot | `carrierId`, `?tab=compliance` |
| Insurance Tracking | Clicks "View All Insurance" link or insurance-type issues | `?status=expiring` |
| Carrier Detail (Compliance tab) | Clicks "Review" action on an issue | `carrierId`, `?tab=compliance` |
| Carriers List | Clicks "View Suspended Carriers" link | `?status=SUSPENDED` |

**Primary trigger:**
Sarah opens the Compliance Center first thing each morning to review overnight FMCSA batch check results, check for any new insurance expirations, and prioritize the day's compliance follow-up actions. She also checks it after receiving a compliance alert notification.

**Success criteria (user completes the screen when):**
- User has reviewed all current compliance issues and understands the urgency level of each.
- User has taken action on critical issues (notified carriers, suspended non-compliant carriers, verified renewals).
- User has confirmed the latest FMCSA batch check completed successfully with acceptable results.
- User has reviewed the expiration timeline and anticipates upcoming issues for the next 90 days.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Carriers > Compliance Center                         |
|  Page Title: Compliance Center       [Run FMCSA Check] [Export]  |
+------------------------------------------------------------------+
|  KPI Cards Row (4 cards)                                          |
|  [Compliant %  ] [Expiring Soon ] [Expired      ] [Pending      ]|
|  [   96.2%     ] [   17         ] [   3          ] [Review: 5   ]|
+------------------------------------------------------------------+
|  Main Content (Two Columns)                                       |
|  +-------------------------------+ +----------------------------+ |
|  | Compliance Issues Table        | | Expiration Timeline        | |
|  | (Left, ~60% width)            | | (Right, ~40% width)        | |
|  |                               | |                            | |
|  | Filters: [Type v] [Severity v]| | Next 90 Days               | |
|  | [Carrier Tier v]              | | [Visual calendar/timeline  | |
|  |                               | |  with color-coded dots]    | |
|  | Carrier | Issue | Status |   | |                            | |
|  | Expiry  | Days  | Actions|   | | Legend:                     | |
|  | --------|-------|--------|   | | Red = Expired              | |
|  | ABC     | Auto  | EXPIRED|   | | Orange = 7 days            | |
|  |         | Ins   | -3d    |   | | Yellow = 14 days           | |
|  | FastFr  | Cargo | 5d     |   | | Blue = 30 days             | |
|  | --------|-------|--------|   | |                            | |
|  +-------------------------------+ +----------------------------+ |
+------------------------------------------------------------------+
|  Bottom Section: FMCSA Monitoring                                 |
|  +------------------------------------------------------------+  |
|  | Last FMCSA Batch Check: Feb 3, 2026 at 02:00 AM            |  |
|  | Carriers Checked: 342 | Issues Found: 2 | Auto-Suspended: 1|  |
|  |                                                             |  |
|  | Carriers with Authority Changes:                            |  |
|  | - FastFreight Inc: Authority changed from ACTIVE to REVOKED|  |
|  | - JBL Transport: Safety rating downgraded to CONDITIONAL   |  |
|  |                                                             |  |
|  | [Run FMCSA Check Now]  [View Change Log]                   |  |
|  |                                                             |  |
|  | Auto-Suspend: [Toggle ON] Automatically suspend carriers    |  |
|  | with expired required insurance                             |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | 4 KPI cards: Compliant %, Expiring Soon, Expired, Pending Review | Instant overview of fleet compliance health |
| **Secondary** (visible in main content) | Compliance issues table sorted by urgency, expiration timeline | Actionable data for daily compliance review |
| **Tertiary** (available on scroll) | FMCSA monitoring section: batch check results, authority changes, auto-suspend toggle | Weekly monitoring data, less frequent interaction |
| **Hidden** (behind a click) | Individual carrier compliance details, full FMCSA change log, compliance report PDF | Deep detail only for investigation |

---

## 4. Data Fields & Display

### Visible Fields -- KPI Cards

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 1 | Compliant % | (COUNT carriers WHERE complianceStatus='COMPLIANT') / (COUNT carriers WHERE status='ACTIVE') * 100 | Percentage with 1 decimal, circular progress indicator. Green >= 95%, yellow 85-94%, red < 85%. | KPI Card 1 |
| 2 | Expiring Soon | COUNT DISTINCT carrierId FROM InsuranceCertificates WHERE expiryDate BETWEEN now AND now+30d AND type IN ('AUTO_LIABILITY','CARGO') | Integer count. Amber background if > 5, red if > 10. | KPI Card 2 |
| 3 | Expired | COUNT DISTINCT carrierId WHERE complianceStatus IN ('EXPIRED','SUSPENDED') AND status='ACTIVE' | Integer count. Red background if > 0. | KPI Card 3 |
| 4 | Pending Review | COUNT carriers WHERE complianceStatus='PENDING_REVIEW' OR hasUnverifiedDocuments=true | Integer count. Purple background. | KPI Card 4 |

### Visible Fields -- Compliance Issues Table

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 5 | Carrier Name | Carrier.legalName | Blue clickable link to carrier detail | Table column 1 |
| 6 | Issue Type | Derived from compliance item | Badge: "Insurance", "FMCSA", "Document", "Safety Rating" | Table column 2 |
| 7 | Item | Specific compliance item name | Text: "Auto Liability Insurance", "Cargo Insurance", "Authority Status", "W-9" | Table column 3 |
| 8 | Status | ComplianceItem.status | Badge per compliance color system: EXPIRED (red), EXPIRING_SOON (orange), WARNING (amber), PENDING_REVIEW (purple) | Table column 4 |
| 9 | Expiry Date | InsuranceCertificates.expiryDate or relevant date | MM/DD/YYYY format | Table column 5 |
| 10 | Days Until/Since Expiry | DATEDIFF(expiryDate, NOW()) | Positive: "14 days" (blue). Zero: "Today" (orange). Negative: "-3 days" (red). | Table column 6 |
| 11 | Carrier Tier | Carrier.tier | TierBadge (for context on issue priority) | Table column 7 |
| 12 | Actions | N/A | Buttons: "Verify" (check now), "Notify" (send reminder), "Suspend" (manual suspend) | Table column 8 |

### Visible Fields -- FMCSA Monitoring

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 13 | Last Batch Check | FmcsaComplianceLogs.MAX(checkDate) | Absolute datetime + relative ("3 days ago") | FMCSA section |
| 14 | Carriers Checked | COUNT from last batch | Integer | FMCSA section |
| 15 | Issues Found | COUNT alerts from last batch | Integer, red if > 0 | FMCSA section |
| 16 | Auto-Suspended | COUNT carriers auto-suspended from last batch | Integer, red if > 0 | FMCSA section |
| 17 | Authority Changes | FmcsaComplianceLogs WHERE alertsGenerated > 0 | List: carrier name + change description | FMCSA changes list |

### Calculated / Derived Fields

| # | Field Label | Calculation | Format |
|---|---|---|---|
| 1 | Urgency Score | Days to expiry: negative = Critical (score 0), 0-7 = High (score 1), 8-14 = Medium (score 2), 15-30 = Low (score 3) | Sorting value (lower = more urgent) |
| 2 | Compliance Trend | Compliant % this week vs. last week | +/- percentage with arrow |
| 3 | Timeline Dot Color | Based on days remaining: < 0 = red, 0-7 = orange, 8-14 = yellow, 15-30 = blue | Color-coded dot on timeline |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] 4 KPI cards: Compliant %, Expiring Soon, Expired, Pending Review
- [ ] Compliance issues table with carrier name, issue type, item, status, expiry date, days remaining, actions
- [ ] Issues table sorted by urgency (expired first, then by days to expiry ascending)
- [ ] Filter issues by type (Insurance, FMCSA, Document, Safety Rating)
- [ ] Filter issues by severity (Expired, Expiring 7d, Expiring 14d, Expiring 30d)
- [ ] Filter issues by carrier tier
- [ ] Expiration timeline showing next 90 days with color-coded dots
- [ ] Click timeline dot to view carrier detail
- [ ] FMCSA monitoring section: last batch check info, issues found, authority changes
- [ ] "Run FMCSA Check Now" button for on-demand batch check
- [ ] Row actions: Verify (real-time FMCSA check), Notify (send reminder email), Suspend (manual suspend)
- [ ] Auto-suspend toggle for expired required insurance

### Advanced Features (Logistics Expert Recommendations)

- [ ] Auto-send expiration reminder emails at 30, 14, and 7 days before expiry (configurable thresholds)
- [ ] Bulk notification: "Notify All Expiring Carriers" button sends templated emails to all carriers with expiring insurance
- [ ] Compliance score trend chart: line chart showing fleet compliance % over last 90 days
- [ ] Export compliance report as PDF (formatted for audit presentations)
- [ ] Compliance calendar view: calendar showing all expirations as events, filterable by type
- [ ] FMCSA change log: full history of all authority/safety rating changes detected by batch checks
- [ ] Out-of-service alert panel: immediate red banner when any active carrier is found OOS
- [ ] Configurable reminder schedule: adjust the 30/14/7 day reminder thresholds
- [ ] Carrier communication log per issue: track which reminders were sent and carrier responses
- [ ] Compliance KPI drill-down: click any KPI card to see the contributing carriers
- [ ] Smart prioritization: weight urgency by carrier tier (PLATINUM carrier expiring in 14d = higher priority than BRONZE in 7d)
- [ ] Compliance audit trail: exportable log of all compliance actions taken

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View compliance center | ops_manager, carrier_admin, admin | compliance_view | Full page access denied |
| Run FMCSA batch check | carrier_admin, admin | compliance_manage | Button hidden |
| Suspend carrier (manual) | carrier_admin, admin | carrier_status_update | "Suspend" action hidden |
| Toggle auto-suspend | admin | compliance_configure | Toggle hidden, shows current state as text |
| Send bulk notifications | ops_manager, carrier_admin, admin | carrier_communicate | Button hidden |
| Export compliance report | ops_manager, admin | export_data | Export button hidden |
| Configure reminder thresholds | admin | compliance_configure | Configuration section hidden |

---

## 6. Status & State Machine

### Compliance Status Flow

```
[COMPLIANT] ---(Insurance expiring within 30d)---> [WARNING]
[WARNING] ---(Insurance expiring within 7d)---> [EXPIRING_SOON]
[EXPIRING_SOON] ---(Insurance expires)---> [EXPIRED]
[EXPIRED] ---(Auto-suspend enabled)---> [SUSPENDED] (carrier status also changes)

[COMPLIANT] ---(FMCSA issue detected)---> [WARNING] or [SUSPENDED]
    If authority revoked or OOS: immediate [SUSPENDED]
    If safety rating downgrade: [WARNING]

[EXPIRED] ---(Insurance renewed + verified)---> [COMPLIANT]
[SUSPENDED] ---(Issue resolved + reinstated)---> [COMPLIANT]
[WARNING] ---(Insurance renewed before expiry)---> [COMPLIANT]
```

### Actions Available Per Compliance Status

| Status | Available Actions | Visual Treatment |
|---|---|---|
| WARNING | Notify carrier, Verify FMCSA | Amber row highlight, amber status badge |
| EXPIRING_SOON | Notify carrier (urgent), Verify FMCSA | Orange row highlight, orange status badge |
| EXPIRED | Notify carrier (final notice), Suspend carrier, Verify | Red row highlight, red status badge |
| SUSPENDED | Reinstate (if resolved), Verify, View carrier detail | Red row, red badge, carrier cannot be dispatched |
| PENDING_REVIEW | Review documents, Verify, Approve/Reject | Purple row highlight, purple badge |

### Status Badge Colors

| Status | Background | Text | Icon | Tailwind |
|---|---|---|---|---|
| COMPLIANT | #D1FAE5 | #065F46 | ShieldCheck | `bg-emerald-100 text-emerald-800` |
| WARNING | #FEF3C7 | #92400E | AlertTriangle | `bg-amber-100 text-amber-800` |
| EXPIRING_SOON | #FFF7ED | #9A3412 | CalendarClock | `bg-orange-100 text-orange-800` |
| EXPIRED | #FEE2E2 | #991B1B | CalendarX | `bg-red-100 text-red-800` |
| PENDING_REVIEW | #EDE9FE | #5B21B6 | FileSearch | `bg-violet-100 text-violet-800` |
| SUSPENDED | #FFE4E6 | #9F1239 | ShieldAlert | `bg-rose-100 text-rose-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Run FMCSA Check | ShieldCheck | Primary / Blue | Triggers batch FMCSA check for all active carriers | Yes -- "Run FMCSA check for all 342 active carriers? This may take 2-5 minutes." |
| Export Report | Download | Secondary / Outline | Opens dropdown: Export PDF (audit), Export CSV | No |

### Row Actions (Issues Table)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Verify | ShieldCheck | Trigger real-time FMCSA check for this carrier | Always available |
| Notify | Mail | Send expiration reminder email to carrier | compliance status is WARNING, EXPIRING_SOON, or EXPIRED |
| Suspend | ShieldAlert | Manually suspend carrier | EXPIRED status, carrier_status_update permission |
| Review | Eye | Navigate to carrier detail compliance tab | Always available |

### Bulk Actions

| Action Label | Action | Confirmation |
|---|---|---|
| Notify All Expiring | Send reminder emails to all carriers with expiring insurance | Yes -- "Send expiration reminders to N carriers?" |
| Suspend All Expired | Suspend all carriers with expired required insurance | Yes -- "Suspend N carriers with expired insurance? These carriers will not be able to accept loads." |
| Export Filtered | Export currently filtered issues as CSV | No |

### Auto-Suspend Toggle

| Setting | Description | Current State Display |
|---|---|---|
| Auto-Suspend | When ON, carriers with expired Auto Liability or Cargo insurance are automatically suspended | Toggle switch with label, status indicator (green "Enabled" or gray "Disabled") |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + K | Open global search |
| R | Refresh compliance data |
| F | Run FMCSA check (with confirmation) |
| E | Export compliance report |

### Drag & Drop

N/A -- No drag-and-drop on the Compliance Center.

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| compliance.issueDetected | { carrierId, carrierName, issueType, item, severity } | Add new row to issues table with slide-in animation, update KPI cards, add dot to timeline |
| compliance.issueResolved | { carrierId, issueType, item } | Remove row from issues table with fade-out, update KPI cards, remove dot from timeline |
| compliance.batchCheckStarted | { startedBy, carrierCount } | Show "FMCSA check in progress..." banner with progress indicator in FMCSA section |
| compliance.batchCheckProgress | { checked, total, issuesFound } | Update progress indicator: "Checking carrier 187 of 342..." |
| compliance.batchCheckComplete | { timestamp, totalChecked, issuesFound, autoSuspended, changes } | Update FMCSA section with results, refresh all KPIs and issues table, show toast summary |
| compliance.autoSuspend | { carrierId, carrierName, reason } | Show alert toast: "[carrier] auto-suspended: [reason]", update issues table |
| insurance.expiring | { carrierId, carrierName, insuranceType, daysRemaining } | Add/update row in issues table, update KPI cards |
| insurance.expired | { carrierId, carrierName, insuranceType } | Update issue to EXPIRED, update KPI cards, trigger auto-suspend if enabled |
| insurance.renewed | { carrierId, carrierName, insuranceType, newExpiryDate } | Remove expired issue, add new timeline dot, update KPI cards |

### Live Update Behavior

- **Update frequency:** WebSocket push for all compliance changes. KPI cards refresh automatically.
- **Visual indicator:** New issues slide into the table with a brief blue glow. Resolved issues fade out. KPI numbers animate count changes.
- **Conflict handling:** N/A -- Compliance Center is primarily read-only with action buttons.

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 30 seconds
- **Endpoint:** `GET /api/carriers/compliance/summary?updatedSince={lastPollTimestamp}`
- **Visual indicator:** "Live compliance monitoring paused -- reconnecting..." banner

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Notify carrier | Show "Notification sent" checkmark on row | Revert to "Notify" button, show error toast |
| Suspend carrier | Update row status to SUSPENDED, move to suspended section | Revert status, show error toast |
| Toggle auto-suspend | Immediately toggle switch | Revert switch, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | `src/components/layout/page-header.tsx` | title: "Compliance Center", breadcrumbs, actions |
| StatusBadge | `src/components/ui/status-badge.tsx` | status, entity: CARRIER_COMPLIANCE |
| DataTable | `src/components/ui/data-table.tsx` | columns, data, sorting, filtering |
| Card | `src/components/ui/card.tsx` | KPI cards, section containers |
| Button | `src/components/ui/button.tsx` | Action buttons |
| Badge | `src/components/ui/badge.tsx` | Issue type badges, severity badges |
| Switch | `src/components/ui/switch.tsx` | Auto-suspend toggle |
| DropdownMenu | `src/components/ui/dropdown-menu.tsx` | Export options |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| DataTable | Basic sort/filter | Add row color coding by severity, inline action buttons, urgency sort |
| Card | Basic card | Add animated count transitions for KPI values |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| ComplianceKPICard | KPI card with circular progress (for Compliant %), count with severity color, trend indicator | Medium |
| ExpirationTimeline | Visual 90-day timeline with color-coded dots per expiration. X-axis = dates. Dots: red (expired), orange (7d), yellow (14d), blue (30d). Click to navigate. | High |
| FMCSAMonitorPanel | Panel showing batch check status, results summary, authority changes list, "Run Check" button with progress | Medium |
| ComplianceIssueRow | Table row with urgency color-coded left border, carrier link, issue badges, days counter, action buttons | Small |
| BatchCheckProgress | Progress bar with carrier count showing live FMCSA check progress | Small |
| AutoSuspendToggle | Switch with label, status indicator, and confirmation dialog | Small |
| ComplianceTrendChart | Line chart showing fleet compliance % over last 90 days | Medium |
| ComplianceCalendar | Calendar view of all upcoming expirations as colored events | High |
| AuthorityChangeAlert | Alert card showing carrier authority changes from FMCSA check | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Switch | switch | Auto-suspend toggle |
| Progress | progress | FMCSA batch check progress |
| Alert | alert | OOS alerts, authority change alerts |
| Calendar | calendar | Compliance calendar view |
| Tooltip | tooltip | Timeline dot details, KPI explanations |
| ScrollArea | scroll-area | Issues table, authority changes list |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/carriers/compliance/summary | Get KPI card data (counts, percentages) | useComplianceSummary() |
| 2 | GET | /api/carriers/compliance/issues | Get all compliance issues with filters | useComplianceIssues(filters) |
| 3 | GET | /api/carriers/insurance/expiring?days=90 | Get expiration timeline data | useExpirationTimeline(90) |
| 4 | GET | /api/carriers/fmcsa/last-check | Get last batch check results and changes | useLastFmcsaCheck() |
| 5 | POST | /api/carriers/fmcsa/batch-check | Trigger new batch FMCSA check | useTriggerFmcsaCheck() |
| 6 | POST | /api/carriers/:id/notify | Send compliance reminder to carrier | useNotifyCarrier() |
| 7 | PATCH | /api/carriers/:id/status | Suspend/reinstate carrier | useUpdateCarrierStatus() |
| 8 | POST | /api/carriers/compliance/bulk-notify | Send bulk expiration reminders | useBulkNotify() |
| 9 | PATCH | /api/carriers/compliance/auto-suspend | Toggle auto-suspend setting | useToggleAutoSuspend() |
| 10 | GET | /api/carriers/compliance/trend?days=90 | Get compliance trend data for chart | useComplianceTrend(90) |
| 11 | GET | /api/carriers/fmcsa/change-log | Get FMCSA change history log | useFmcsaChangeLog() |
| 12 | GET | /api/carriers/compliance/export | Export compliance report (PDF/CSV) | useExportComplianceReport() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| compliance:{tenantId} | compliance.issueDetected | useComplianceLiveUpdates() -- adds issue to table, updates KPIs |
| compliance:{tenantId} | compliance.issueResolved | useComplianceLiveUpdates() -- removes issue, updates KPIs |
| compliance:{tenantId} | compliance.batchCheckStarted | useFmcsaCheckProgress() -- shows progress banner |
| compliance:{tenantId} | compliance.batchCheckProgress | useFmcsaCheckProgress() -- updates progress bar |
| compliance:{tenantId} | compliance.batchCheckComplete | useFmcsaCheckProgress() -- shows results, refreshes all data |
| compliance:{tenantId} | compliance.autoSuspend | useComplianceLiveUpdates() -- shows alert toast |
| insurance:{tenantId} | insurance.* | useComplianceLiveUpdates() -- refreshes relevant sections |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/carriers/compliance/summary | N/A | Redirect to login | "Access Denied" page | N/A | Error state with retry per section |
| POST /api/carriers/fmcsa/batch-check | "Invalid request" toast | Redirect to login | "Permission Denied" toast | N/A | "FMCSA check failed. Please try again." toast |
| POST /api/carriers/:id/notify | "Invalid carrier" toast | Redirect to login | "Permission Denied" toast | "Carrier not found" toast | "Email service error" toast |
| PATCH /api/carriers/:id/status | "Invalid status transition" toast | Redirect to login | "Permission Denied" toast | "Carrier not found" toast | Error toast with retry |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** 4 skeleton KPI cards, table skeleton with 8 rows, timeline skeleton (gray bar), FMCSA section skeleton.
- **Progressive loading:** KPI cards load first (fastest), then issues table, then timeline, then FMCSA section.
- **FMCSA check in progress:** Animated progress bar: "Checking carrier 187 of 342... (2 issues found so far)"

### Empty States

**No compliance issues (100% compliant):**
- **KPI Cards:** Compliant: 100%, Expiring: 0, Expired: 0, Pending: 0 -- all green
- **Issues Table:** "All carriers are fully compliant! No issues to review." with green checkmark icon
- **Timeline:** "No upcoming expirations in the next 90 days."

**No carriers in system:**
- **Display:** "No carriers to monitor. Onboard your first carrier to begin compliance tracking."
- **CTA:** "Onboard Carrier" button

**FMCSA never run:**
- **FMCSA Section:** "No FMCSA batch check has been run yet. Run your first check to verify all carrier authorities."
- **CTA:** "Run First FMCSA Check" button

### Error States

**Full page error:**
- **Display:** Error icon + "Unable to load compliance data" + Retry button

**FMCSA batch check failure:**
- **Display:** Red alert banner in FMCSA section: "Last FMCSA check failed at [timestamp]. Some carrier compliance data may be outdated." + "Retry" button

**Notification send failure:**
- **Display:** Toast: "Failed to send notification to [carrier]. Email service may be temporarily unavailable." + Retry

### Permission Denied

- **Full page denied:** "You don't have permission to view the Compliance Center" with link to carriers list
- **Action denied:** "Run FMCSA Check" and "Suspend" buttons hidden for non-admin users

### Offline / Degraded

- **Full offline:** "You're offline. Compliance data shown is from [timestamp]. Real-time monitoring is paused."
- **FMCSA API down:** "FMCSA SAFER system is currently unavailable. Manual compliance verification recommended."

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Issue Type | Multi-select dropdown | Insurance, FMCSA, Document, Safety Rating | All | `?type=insurance,fmcsa` |
| 2 | Severity | Multi-select dropdown | Expired, Expiring 7d, Expiring 14d, Expiring 30d, Pending Review | All | `?severity=expired,7d` |
| 3 | Carrier Tier | Multi-select dropdown | PLATINUM, GOLD, SILVER, BRONZE, UNQUALIFIED | All | `?tier=PLATINUM,GOLD` |
| 4 | Carrier | Searchable select | All carriers with issues | All | `?carrier={carrierId}` |

### Search Behavior

- **Search field:** Search input in filter area above issues table
- **Searches across:** Carrier name, MC#, insurance type, policy number
- **Behavior:** Debounced 300ms, minimum 2 characters
- **URL param:** `?search=`

### Sort Options

| Column | Default Direction | Sort Type |
|---|---|---|
| Urgency (Days) | Ascending (most urgent first) -- **default sort** | Custom urgency score |
| Carrier Name | Ascending (A-Z) | Alphabetic |
| Issue Type | Grouped | Custom enum |
| Expiry Date | Ascending (soonest first) | Date |
| Carrier Tier | Descending (PLATINUM first) | Custom enum |

**Default sort:** Urgency ascending (expired items first, then by days to expiry ascending)

### Saved Filters / Presets

- **System presets:** "All Issues", "Expired Only", "Insurance Issues", "FMCSA Issues", "Platinum/Gold Carriers"
- **URL sync:** All filter state reflected in URL for shareable links

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- KPI cards: 2 per row (2 rows of 2)
- Issues table and timeline: Stack vertically (full width each) instead of side by side
- FMCSA section: Full width below
- Filter bar: Collapse to "Filters" button opening slide-over

### Mobile (< 768px)

- KPI cards: 2 per row, compact
- Issues table: Card view per issue
- Timeline: Simplified list view (no visual timeline, text-based countdown list)
- FMCSA section: Collapsible accordion
- "Run FMCSA Check" in sticky bottom bar
- Swipe on issue card for quick actions (Notify, Suspend)

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout: 4 KPI cards, 60/40 split table+timeline, FMCSA section |
| Desktop | 1024px - 1439px | Same layout, slightly narrower columns |
| Tablet | 768px - 1023px | 2x2 KPI grid, stacked table+timeline, collapsible filters |
| Mobile | < 768px | 2-column KPI, card-based issues, list-based timeline |

---

## 14. Stitch Prompt

```
Design a carrier compliance monitoring dashboard for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with a dark slate-900 sidebar on the left (240px, collapsed to icons), content area on the right. Top has breadcrumb "Carriers > Compliance Center" and page title "Compliance Center" with two buttons: "Run FMCSA Check" (primary blue with shield icon) and "Export" (secondary outline with download icon).

KPI Section: Below the header, 4 KPI cards in a row:
1. "Fleet Compliance" - circular progress ring at 96.2% in green, large "96.2%" text, subtitle "342 of 356 carriers compliant", green-tinted card
2. "Expiring Soon" - amber calendar-clock icon, large "17" count, subtitle "within 30 days", amber-tinted card border-left
3. "Expired" - red calendar-x icon, large "3" count in red, subtitle "immediate action required", red-tinted card border-left
4. "Pending Review" - purple file-search icon, large "5" count, subtitle "documents awaiting review", purple-tinted card border-left

Main Content: Two panels side by side (60/40 split):

Left panel - "Compliance Issues" card:
- Filter bar with: "Type" dropdown, "Severity" dropdown, "Tier" dropdown
- Table with columns: Carrier, Issue Type (badge), Item, Status (badge), Expiry Date, Days, Actions
- 6 rows sorted by urgency:
  1. "ABC Trucking" | Red "Insurance" badge | "Auto Liability" | Red "EXPIRED" badge | 02/01/2026 | "-5 days" (red text) | [Notify] [Suspend]
  2. "FastFreight Inc" | Red "FMCSA" badge | "Authority Status" | Rose "SUSPENDED" badge | -- | "Revoked" | [Review]
  3. "JM Carrier" | Orange "Insurance" badge | "Cargo Insurance" | Orange "Expiring" badge | 02/11/2026 | "5 days" (orange text) | [Notify] [Verify]
  4. "Mountain Express" | Amber "Insurance" badge | "Auto Liability" | Amber "Warning" badge | 02/20/2026 | "14 days" (amber text) | [Notify]
  5. "Valley Transport" | Blue "Insurance" badge | "General Liability" | Blue "30 days" badge | 03/08/2026 | "30 days" (blue text) | [Notify]
  6. "Peak Logistics" | Purple "Document" badge | "W-9" | Purple "Pending" badge | -- | "Awaiting review" | [Review]
- Each row has a colored left border matching severity (red/orange/amber/blue/purple)
- "Showing 6 of 25 issues" with "View All" link

Right panel - "Expiration Timeline" card:
- Title: "Insurance Expirations - Next 90 Days"
- Horizontal timeline with date axis (Feb, Mar, Apr 2026)
- Scattered dots: 3 red dots (past dates), 4 orange dots (next 7 days), 6 yellow dots (8-14 days), 10 blue dots (15-30+ days)
- Legend at bottom: red=Expired, orange=7 days, yellow=14 days, blue=30+ days
- One dot has a hover tooltip showing: "ABC Trucking - Auto Liability - Expires 02/01/2026"

Bottom Section - "FMCSA Monitoring" card (full width):
- Left info: "Last Batch Check: Feb 3, 2026 at 02:00 AM (3 days ago)"
- Stats in a row: "342 Carriers Checked" | "2 Issues Found" (amber) | "1 Auto-Suspended" (red)
- "Authority Changes Since Last Check:" section showing 2 items:
  - Red shield icon: "FastFreight Inc - Authority changed from ACTIVE to REVOKED"
  - Amber alert icon: "JBL Transport - Safety rating downgraded to CONDITIONAL"
- Bottom row: "Run FMCSA Check Now" blue outline button | "View Full Change Log" text link
- Toggle: "Auto-Suspend" switch (currently ON, green) with label "Automatically suspend carriers with expired required insurance"

Design Specifications:
- Font: Inter or system sans-serif, 14px base
- Content background: gray-50 for page, white for cards
- Primary color: blue-600 for buttons and links
- Compliance colors: green for compliant, amber for warning, orange for expiring, red for expired, purple for pending review, rose for suspended
- Table rows: subtle left border (4px) color-coded by severity
- KPI cards: white background, rounded-xl, shadow-sm, with subtle accent color on left border or icon area
- Timeline: clean horizontal axis with evenly spaced dates, dots sized 12px with 4px stroke
- FMCSA section: slightly different card style with border-l-4 border-blue-500 to visually separate
- Toggle switch: green when ON, gray when OFF
- Modern SaaS aesthetic similar to Datadog or Grafana dashboards with compliance focus

Include: the auto-suspend toggle in the FMCSA section, urgency-sorted table rows with colored left borders, interactive timeline dots with hover tooltips, and the FMCSA batch check progress concept.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 3)

**What's built and working:**
- [ ] Nothing -- compliance center is not started

**What needs polish / bug fixes:**
- N/A (not built yet)

**What to add this wave:**
- [ ] 4 KPI cards with real-time compliance metrics
- [ ] Compliance issues table with urgency sorting and severity coloring
- [ ] Filters by type, severity, and tier
- [ ] Expiration timeline (next 90 days)
- [ ] FMCSA monitoring section with batch check results
- [ ] "Run FMCSA Check Now" trigger
- [ ] Row actions: Verify, Notify, Suspend
- [ ] Auto-suspend toggle
- [ ] WebSocket for real-time compliance updates
- [ ] Bulk notify for expiring carriers
- [ ] Export compliance report

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Compliance issues table with urgency sort | High | Medium | P0 |
| KPI cards (Compliant %, Expiring, Expired, Pending) | High | Low | P0 |
| FMCSA monitoring section | High | Medium | P0 |
| Row actions (Verify, Notify, Suspend) | High | Medium | P0 |
| Auto-suspend toggle | High | Low | P0 |
| Expiration timeline | Medium | High | P1 |
| Real-time WebSocket updates | High | Medium | P1 |
| Bulk notify for expiring carriers | Medium | Medium | P1 |
| Export compliance report (PDF/CSV) | Medium | Medium | P1 |
| FMCSA change log | Medium | Medium | P1 |
| Compliance trend chart | Low | Medium | P2 |
| Compliance calendar view | Low | High | P2 |
| Configurable reminder thresholds | Low | Medium | P2 |
| Smart prioritization by tier | Low | Medium | P2 |

### Future Wave Preview

- **Wave 4:** Integration with third-party compliance services (Highway, RMIS, MyCarrierPackets), automated insurance certificate pull from carrier portals, compliance scoring model refinement.
- **Wave 5:** Predictive compliance analytics (which carriers are likely to lapse based on historical patterns), automated carrier outreach workflows, compliance benchmarking against industry standards.

---

_Last Updated: 2026-02-06_

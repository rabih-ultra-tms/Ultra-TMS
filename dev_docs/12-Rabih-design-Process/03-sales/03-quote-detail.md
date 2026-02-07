# Quote Detail

> Service: Sales (03) | Wave: 1 | Priority: P0
> Route: /sales/quotes/:id | Status: Not Started
> Primary Personas: James Wilson (Sales Agent), Sales Manager
> Roles with Access: super_admin, admin, sales_manager, sales_agent (own quotes or team_view)

---

## 1. Purpose & Business Context

**What this screen does:**
The Quote Detail page is the comprehensive view of a single quote. It displays all quote information including customer details, shipment specifications, rate breakdown, margin analysis, market rate comparison, version history, activity timeline, notes, and all available actions for the quote's current status. This is where a sales agent reviews a quote before sending, tracks customer engagement after sending, and initiates the quote-to-order conversion.

**Business problem it solves:**
Freight quotes are living documents that go through multiple revisions, customer interactions, and status changes. Without a centralized detail view, agents piece together quote history from emails, phone notes, and spreadsheet versions. The Quote Detail page provides a single authoritative record showing exactly what was quoted, when, to whom, how the customer engaged with it, and what happened next. This eliminates the "what did we quote them last time?" problem that costs brokerages an estimated 15 minutes per customer interaction.

**Key business rules:**
- Only the quote owner or users with `team_view` permission can access the quote detail.
- Financial data (rates, margins) requires `finance_view` permission; without it, the rate section shows "Contact your manager for pricing details."
- Quote actions (send, accept, reject, convert) are status-dependent. Only valid actions for the current status are shown.
- Version history shows all versions of this quote (linked by parent_quote_id). Only the latest version has active action buttons.
- The timeline tracks all events: created, edited, sent, viewed (with viewer info), accepted, rejected, expired, converted, and all notes.
- Market rate data refreshes on page load but is cached for 1 hour.
- If the quote has been converted to an order, a prominent link to the order is shown.

**Success metric:**
Time from quote viewing notification to follow-up action drops from 4 hours to under 30 minutes. Quote-to-order conversion time drops from 10 minutes (re-entering data) to under 30 seconds (one-click conversion).

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Quotes List | Clicks quote number link | quoteId |
| Sales Dashboard | Clicks expiring quote or activity item | quoteId |
| Sales Dashboard | Clicks "Convert" on accepted quote activity | quoteId |
| Customer Detail (CRM) | Clicks quote in customer's quotes tab | quoteId |
| Email notification | Clicks "Quote Viewed" or "Quote Accepted" notification link | quoteId |
| Global Search | Searches for quote number, clicks result | quoteId |
| Direct URL | Bookmark / shared link | quoteId in route |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Quote Builder | Clicks "Edit" (draft only) or "Revise" (create new version) | quoteId (edit) or quoteId + ?revise=true (new version) |
| Quotes List | Clicks "Back to Quotes" or breadcrumb | Preserves previous filters |
| Order Detail (TMS Core) | Clicks "View Order" after conversion | orderId |
| Quote Builder | Clicks "Clone" | ?cloneFrom=QT-XXXX |
| Customer Detail (CRM) | Clicks customer name link | customerId |

**Primary trigger:**
James receives a notification that QT-20260205-0042 was viewed by his customer contact at Acme Manufacturing. He opens the Quote Detail to review what was quoted, checks the market rate comparison to ensure competitiveness, and decides whether to follow up immediately or wait for the customer to respond. Alternatively, the customer has accepted the quote, and James opens the detail page to click "Convert to Order."

**Success criteria (user completes the screen when):**
- User has reviewed the complete quote information and understands its current state.
- User has taken the appropriate action: sent the quote, followed up, created a revision, converted to order, or noted the status.
- User has any necessary context from the version history and timeline to make informed decisions.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------------+
|  Breadcrumb: Sales > Quotes > QT-20260205-0042                        |
|                                                                        |
|  QT-20260205-0042  [VIEWED] badge  v2                                 |
|  Acme Manufacturing -- Chicago, IL to Dallas, TX                       |
|                          [Edit] [Clone] [Send] [Convert] [More v]      |
+------------------------------------------------------------------------+
|                                                                        |
|  +----------------------------------------------+  +--------------+   |
|  |  TABS:                                        |  | RIGHT SIDEBAR|   |
|  |  [Overview] [Rate Details] [Versions] [Notes] |  |              |   |
|  |                                               |  | Quote Summary|   |
|  |  ============ OVERVIEW TAB ================   |  |              |   |
|  |                                               |  | Status:      |   |
|  |  SHIPMENT DETAILS                             |  | [VIEWED]     |   |
|  |  +------------------------------------------+ |  |              |   |
|  |  | Service: FTL    Equipment: Dry Van        | |  | Created:     |   |
|  |  | Commodity: Electronics, 42,000 lbs        | |  | Feb 05, 2026 |   |
|  |  | Pickup: Feb 10  Delivery: Feb 11          | |  |              |   |
|  |  | Distance: 847 mi  Transit: 12h            | |  | Sent:        |   |
|  |  +------------------------------------------+ |  | Feb 05 3:42pm|   |
|  |                                               |  |              |   |
|  |  ROUTE                                        |  | Viewed:      |   |
|  |  +------------------------------------------+ |  | Feb 05 5:18pm|   |
|  |  | [Map: Chicago -> Dallas with route line]  | |  |              |   |
|  |  | Stop 1: Chicago, IL (Pickup)              | |  | Expires:     |   |
|  |  | Stop 2: Dallas, TX (Delivery)             | |  | Feb 12       |   |
|  |  +------------------------------------------+ |  | (in 6 days)  |   |
|  |                                               |  |              |   |
|  |  RATE BREAKDOWN                               |  | Agent:       |   |
|  |  +------------------------------------------+ |  | James Wilson |   |
|  |  | Linehaul Rate:        $2,100.00           | |  |              |   |
|  |  | Fuel Surcharge:       $  250.00           | |  | Customer:    |   |
|  |  | Accessorials:         $  100.00           | |  | Acme Mfg     |   |
|  |  | ─────────────────────────────────         | |  | [View in CRM]|   |
|  |  | TOTAL:                $2,450.00           | |  |              |   |
|  |  | Margin: $420 (18.2%)  [=====----] green   | |  | Contact:     |   |
|  |  +------------------------------------------+ |  | John Smith   |   |
|  |  | Market Rate Comparison                    | |  | john@acme.com|   |
|  |  | Low: $2,100 | Avg: $2,350 | High: $2,800 | |  |              |   |
|  |  | Your rate: $2,450  [===|========]          | |  +--------------+   |
|  |  +------------------------------------------+ |                      |
|  |                                               |                      |
|  |  ACTIVITY TIMELINE                            |                      |
|  |  +------------------------------------------+ |                      |
|  |  | o Feb 05 5:18 PM - Viewed by John Smith   | |                      |
|  |  | |   via email link                        | |                      |
|  |  | o Feb 05 3:42 PM - Sent to john@acme.com  | |                      |
|  |  | |   by James Wilson                       | |                      |
|  |  | o Feb 05 2:15 PM - Version 2 created      | |                      |
|  |  | |   Rate adjusted from $2,300 to $2,450   | |                      |
|  |  | o Feb 04 10:30 AM - Created as Draft       | |                      |
|  |  |   by James Wilson                         | |                      |
|  |  +------------------------------------------+ |                      |
|  +----------------------------------------------+                      |
+------------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | Quote number, status badge, version, customer name, lane, action buttons | Agent needs instant context and available actions |
| **Secondary** (visible in first scroll) | Shipment details (service type, equipment, commodity, dates), rate breakdown with margin, route map | Core quote information needed for any decision-making |
| **Tertiary** (available in tabs or scroll) | Market rate comparison, activity timeline, version history, notes | Context and history for deeper analysis |
| **Hidden** (behind a click) | Full proposal PDF preview, rate calculation audit trail, customer CRM profile | Deep reference material accessed on demand |

---

## 4. Data Fields & Display

### Visible Fields

**Page Header**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Quote Number | Quote.quoteNumber | `QT-YYYYMMDD-XXXX` monospace, large (text-xl) | Page header, left |
| 2 | Status | Quote.status | Colored badge (see Section 6) | Page header, next to number |
| 3 | Version | Quote.version | "v2" gray badge | Page header, next to status |
| 4 | Customer Name | Company.name | Text, linked to CRM | Page header, subtitle |
| 5 | Lane Summary | Quote origin/destination | "City, ST to City, ST" | Page header, subtitle line 2 |

**Shipment Details Section**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 6 | Service Type | Quote.serviceType | Badge: FTL, LTL, PARTIAL, DRAYAGE | Shipment details card |
| 7 | Equipment Type | Quote.equipmentType | Icon + full name (e.g., "Dry Van") | Shipment details card |
| 8 | Commodity | Quote.commodity | Text | Shipment details card |
| 9 | Weight | Quote.weight | "XX,XXX lbs" formatted | Shipment details card |
| 10 | Pieces / Pallets | Quote.pieces, Quote.pallets | "XX pieces / XX pallets" | Shipment details card |
| 11 | Pickup Date | QuoteStop[0].appointmentDate | "MMM DD, YYYY" | Shipment details card |
| 12 | Delivery Date | QuoteStop[last].appointmentDate | "MMM DD, YYYY" | Shipment details card |
| 13 | Distance | Calculated | "XXX mi" | Shipment details card |
| 14 | Transit Time | Calculated | "XXh" or "Xd Xh" | Shipment details card |
| 15 | Special Handling | Quote.specialHandling | Tags/badges for each flag | Shipment details card |

**Rate Breakdown Section**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 16 | Linehaul Rate | Quote.linehaulRate | "$X,XXX.XX" | Rate breakdown table |
| 17 | Fuel Surcharge | Quote.fuelSurcharge | "$XXX.XX" with "(Auto)" or "(Manual)" tag | Rate breakdown table |
| 18 | Accessorials Total | Quote.accessorialsTotal | "$XXX.XX" with expandable detail | Rate breakdown table |
| 19 | Total Amount | Quote.totalAmount | "$X,XXX.XX" bold, large | Rate breakdown table, bottom |
| 20 | Margin Amount | Quote.marginAmount | "$XXX" color-coded | Below total |
| 21 | Margin Percent | Quote.marginPercent | "XX.X%" with color bar | Below total |
| 22 | Rate Source | Quote.rateSource | Tag: MANUAL, CONTRACT, MARKET, CALCULATED | Below total |

**Market Rate Comparison**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 23 | Market Rate Low | Quote.marketRateLow | "$X,XXX" | Market rate bar, left |
| 24 | Market Rate Avg | Quote.marketRateAvg | "$X,XXX" | Market rate bar, center |
| 25 | Market Rate High | Quote.marketRateHigh | "$X,XXX" | Market rate bar, right |
| 26 | Quote Rate Position | Calculated | Marker on horizontal bar showing where quote falls | Market rate bar |

**Right Sidebar**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 27 | Status | Quote.status | Large colored badge | Sidebar, top |
| 28 | Created Date | Quote.createdAt | "MMM DD, YYYY" | Sidebar |
| 29 | Sent Date | Quote.sentAt | "MMM DD h:mm a" or "Not sent" | Sidebar |
| 30 | Viewed Date | Quote.viewedAt | "MMM DD h:mm a" or "Not viewed" | Sidebar |
| 31 | Expiry Date | Quote.expiryDate | "MMM DD" with countdown | Sidebar |
| 32 | Agent | User.name | Full name | Sidebar |
| 33 | Customer | Company.name | Name, linked to CRM | Sidebar |
| 34 | Contact | Contact.name + email | Name and email | Sidebar |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Margin Amount | totalAmount - estimatedCost (or totalAmount * marginPercent) | Currency, color-coded |
| 2 | Margin Percent | marginAmount / totalAmount * 100 | Percentage with 1 decimal |
| 3 | Rate Per Mile | totalAmount / distance | "$X.XX/mi" |
| 4 | Expiry Countdown | expiryDate - now() | "X days" or "Xh" with urgency color |
| 5 | Market Rate Position | (quoteRate - marketLow) / (marketHigh - marketLow) * 100 | Percentage position on horizontal bar |
| 6 | Days in Status | now() - lastStatusChangeAt | "X days" |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Full quote detail display with all fields organized in sections
- [ ] Status badge with current status and transition history
- [ ] Rate breakdown table showing linehaul, fuel, accessorials, total
- [ ] Margin display with color-coded indicator (green/yellow/red)
- [ ] Market rate comparison bar (low/avg/high with quote position)
- [ ] Activity timeline showing all quote events chronologically
- [ ] Action buttons contextual to current status (send, accept, reject, convert, clone, edit)
- [ ] Right sidebar with quote summary and key dates
- [ ] Version history tab showing all quote versions with comparison
- [ ] Notes tab for adding and viewing internal notes
- [ ] Route map showing origin, destination, and route polyline
- [ ] Click-through to customer detail in CRM
- [ ] "Convert to Order" one-click action for accepted quotes
- [ ] Print/PDF export of quote detail
- [ ] Breadcrumb navigation back to Quotes List

### Advanced Features (Logistics Expert Recommendations)

- [ ] Version comparison: side-by-side diff of two versions showing changed fields
- [ ] Rate history for this lane: chart showing historical rates for the same origin/destination
- [ ] Customer quote history: previous quotes for this customer with outcomes
- [ ] Email preview before sending
- [ ] Follow-up scheduler: set a reminder to follow up on a specific date/time
- [ ] Quote sharing: generate a public link for customer portal view
- [ ] Inline note adding without switching to Notes tab
- [ ] Real-time "viewed" notification while on this page
- [ ] Proposal PDF preview with customer branding
- [ ] Rate recalculation button: refresh rate with current market data
- [ ] Competitor analysis: show how this rate compares to typical market positioning

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View rate breakdown | sales_agent, sales_manager, admin | finance_view | Rate section shows "Contact your manager" |
| View margin data | sales_manager, admin | margin_view | Margin row hidden in rate breakdown |
| Send quote | sales_agent (own), sales_manager (any) | quote_send | Send button hidden |
| Accept/Reject | sales_agent (own), sales_manager (any) | quote_status | Accept/Reject buttons hidden |
| Convert to order | sales_agent (own), sales_manager, admin | quote_convert | Convert button hidden |
| Delete quote | sales_agent (own drafts), admin | quote_delete | Delete option hidden in menu |
| Edit quote | sales_agent (own drafts), sales_manager | quote_edit | Edit button hidden |
| View all versions | any authenticated | quote_view | Always visible for users who can see the quote |

---

## 6. Status & State Machine

### Status Transitions (from this screen)

```
                         [SEND]
            [DRAFT] ─────────────> [SENT]
                                     │
                              [customer views]
                                     v
                                  [VIEWED]
                                   /    \
                          [ACCEPT]      [REJECT]
                             v              v
                        [ACCEPTED]     [REJECTED]
                             │
                        [CONVERT]
                             v
                        [CONVERTED]
```

### Actions Available Per Status

| Status | Available Actions (Buttons) | Restricted Actions |
|---|---|---|
| DRAFT | Edit, Send, Clone, Delete | Accept, Reject, Convert |
| SENT | Follow Up, Clone, Revise | Edit, Delete, Convert |
| VIEWED | Follow Up, Accept, Reject, Clone, Revise | Edit, Delete |
| ACCEPTED | Convert to Order, Clone | Edit, Delete, Send |
| CONVERTED | View Order, Clone | Edit, Delete, Send, Convert |
| REJECTED | Revise (new version), Clone | Edit, Delete, Send, Convert |
| EXPIRED | Revise (new version), Clone | Edit, Delete, Send, Convert |

### Status Badge Colors

| Status | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| DRAFT | gray-100 | gray-700 | gray-300 | `bg-gray-100 text-gray-700 border-gray-300` |
| SENT | blue-100 | blue-800 | blue-300 | `bg-blue-100 text-blue-800 border-blue-300` |
| VIEWED | purple-100 | purple-800 | purple-300 | `bg-purple-100 text-purple-800 border-purple-300` |
| ACCEPTED | green-100 | green-800 | green-300 | `bg-green-100 text-green-800 border-green-300` |
| CONVERTED | emerald-100 | emerald-800 | emerald-300 | `bg-emerald-100 text-emerald-800 border-emerald-300` |
| REJECTED | red-100 | red-800 | red-300 | `bg-red-100 text-red-800 border-red-300` |
| EXPIRED | amber-100 | amber-800 | amber-300 | `bg-amber-100 text-amber-800 border-amber-300` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page Header)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Edit | Pencil | Secondary / Outline | Navigate to Quote Builder in edit mode | No |
| Send | Send | Primary / Blue | Opens send confirmation modal | Yes (preview email, select contact) |
| Convert to Order | ArrowRight | Primary / Blue-Green | Opens conversion confirmation dialog | Yes ("Convert to Order? This will create order ORD-XXX.") |
| Clone | Copy | Secondary / Outline | Creates new quote from this one | No (navigates to builder with cloned data) |

### Secondary Actions (Dropdown / "More" Menu)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Revise Quote | RefreshCw | Creates new version, opens in Quote Builder | REJECTED, EXPIRED, or superseded version |
| Mark as Accepted | Check | Updates status to ACCEPTED | VIEWED status |
| Mark as Rejected | X | Opens rejection reason modal, updates status | SENT or VIEWED status |
| Follow Up | Phone | Opens follow-up action modal (call/email/note) | SENT or VIEWED status |
| View Proposal | FileText | Opens proposal PDF in modal | Any status with generated proposal |
| Print | Printer | Opens browser print dialog with print-optimized layout | Any status |
| Export PDF | Download | Downloads quote detail as PDF | Any status |
| Delete | Trash | Deletes quote with confirmation | DRAFT status only |
| View Order | ExternalLink | Navigates to linked TMS Core order | CONVERTED status only |

### Bulk Actions

N/A -- single record detail view.

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + E | Edit quote (if DRAFT) |
| Ctrl/Cmd + Enter | Send quote (if DRAFT) |
| Ctrl/Cmd + P | Print |
| Escape | Close modal |
| 1-4 | Switch between tabs (Overview, Rate, Versions, Notes) |

### Drag & Drop

N/A -- no drag-drop on this screen.

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| quote.status.changed | { quoteId, oldStatus, newStatus, changedBy, timestamp } | Update status badge, add timeline entry, show toast notification |
| quote.viewed | { quoteId, viewedBy, viewedAt, viewerEmail } | Update status to VIEWED if applicable, add timeline entry, show prominent notification "Quote viewed by [name]!" |
| quote.version.created | { quoteId, newVersionId, version } | Add entry to version history tab, show toast |
| quote.note.added | { quoteId, noteId, author, content } | Add note to Notes tab, show toast if another user added it |
| quote.converted | { quoteId, orderId, orderNumber } | Update status to CONVERTED, show banner with order link |

### Live Update Behavior

- **Update frequency:** WebSocket push for all events on this specific quote. Timeline and status update immediately.
- **Visual indicator:** New timeline entries slide in with a fade-in animation. Status badge pulses briefly when changed. Toast notifications for external changes (other user or customer actions).
- **Conflict handling:** If user is about to send a quote that was already accepted/rejected by another user, show blocking modal: "This quote's status has changed to [status]. Please refresh to see the latest state."

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 30 seconds
- **Endpoint:** `GET /api/v1/quotes/:id?updatedSince={lastPollTimestamp}`
- **Visual indicator:** "Live updates paused -- reconnecting..." banner

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Add note | Immediately show note in timeline | Remove note, show error toast |
| Mark as accepted | Update status badge immediately | Revert badge, show error toast |
| Mark as rejected | Update status badge immediately | Revert badge, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | src/components/layout/page-header.tsx | title, subtitle, breadcrumbs, actions |
| StatusBadge | src/components/ui/status-badge.tsx | status, size: 'lg' for header, 'sm' for timeline |
| Card | src/components/ui/card.tsx | Sections for shipment details, rate breakdown, etc. |
| Button | src/components/ui/button.tsx | All action buttons |
| Tabs | src/components/ui/tabs.tsx | Overview, Rate Details, Versions, Notes tabs |
| Timeline | src/components/ui/timeline.tsx | Activity timeline |
| Badge | src/components/ui/badge.tsx | Service type, equipment type, rate source tags |
| Tooltip | src/components/ui/tooltip.tsx | Truncated text, field explanations |
| Dialog | src/components/ui/dialog.tsx | Send, convert, delete confirmation modals |
| Textarea | src/components/ui/textarea.tsx | Note input |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| Timeline | Basic timeline with text entries | Add support for different event types (status change, note, email, view) with distinct icons and colors |
| StatusBadge | Generic sizes | Add 'lg' size variant for page header display with icon support |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| RateBreakdownCard | Structured display of linehaul + fuel + accessorials = total, with margin indicator | Medium |
| MarketRateBar | Horizontal bar showing low/avg/high market rates with marker for quote rate position | Medium |
| QuoteVersionSwitcher | Tab bar or dropdown showing all versions with version number, date, status | Small |
| VersionComparisonView | Side-by-side comparison of two quote versions with changed fields highlighted | High |
| QuoteSummaryPanel | Right sidebar showing key quote metadata (dates, agent, customer, contact) | Medium |
| QuoteSendModal | Modal for sending: contact selector, email preview, delivery method toggle | Medium |
| ConvertToOrderDialog | Confirmation dialog showing what order will be created, with summary | Small |
| RejectionReasonModal | Modal for capturing rejection reason (select common reasons + free text) | Small |
| FollowUpModal | Modal for follow-up actions: call, email, set reminder, add note | Medium |
| RouteMapCard | Embedded map showing quote route with stops and polyline | Medium |
| LaneRateHistoryChart | Chart showing historical rates for this lane over time | Medium |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Tabs | tabs | Section navigation (Overview, Rate, Versions, Notes) |
| Separator | separator | Visual dividers between sections |
| AlertDialog | alert-dialog | Confirmation dialogs (convert, delete) |
| Dialog | dialog | Send modal, follow-up modal |
| Textarea | textarea | Note input |
| ScrollArea | scroll-area | Timeline scroll |
| Collapsible | collapsible | Expandable rate breakdown details |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/quotes/:id | Fetch complete quote detail with relationships | useQuote(quoteId) |
| 2 | GET | /api/v1/quotes/:id/versions | Fetch all versions of this quote | useQuoteVersions(quoteId) |
| 3 | GET | /api/v1/quotes/:id/timeline | Fetch activity timeline | useQuoteTimeline(quoteId) |
| 4 | GET | /api/v1/quotes/:id/notes | Fetch notes | useQuoteNotes(quoteId) |
| 5 | POST | /api/v1/quotes/:id/notes | Add a note | useAddQuoteNote() |
| 6 | POST | /api/v1/quotes/:id/send | Send quote to customer | useSendQuote() |
| 7 | POST | /api/v1/quotes/:id/accept | Mark as accepted | useAcceptQuote() |
| 8 | POST | /api/v1/quotes/:id/reject | Mark as rejected (with reason) | useRejectQuote() |
| 9 | POST | /api/v1/quotes/:id/convert | Convert to TMS Core order | useConvertQuote() |
| 10 | POST | /api/v1/quotes/:id/clone | Clone quote | useCloneQuote() |
| 11 | POST | /api/v1/quotes/:id/version | Create new version | useCreateQuoteVersion() |
| 12 | DELETE | /api/v1/quotes/:id | Delete draft quote | useDeleteQuote() |
| 13 | GET | /api/v1/quotes/market-rates | Fetch market rates for this lane | useMarketRates(origin, destination, equipment) |
| 14 | GET | /api/v1/quotes/:id/proposal | Get/generate proposal PDF | useQuoteProposal(quoteId) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| sales:quote:{quoteId} | quote.status.changed | useQuoteDetailUpdates(quoteId) -- updates status and timeline |
| sales:quote:{quoteId} | quote.viewed | useQuoteDetailUpdates(quoteId) -- updates status, shows notification |
| sales:quote:{quoteId} | quote.note.added | useQuoteDetailUpdates(quoteId) -- adds note to timeline |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/v1/quotes/:id | N/A | Redirect to login | Show "Access Denied" page | Show "Quote not found" page with back link | Show error state with retry |
| POST /api/v1/quotes/:id/send | Show validation toast | Redirect to login | Show "Permission Denied" toast | Show "Quote not found" toast | Show error toast with retry |
| POST /api/v1/quotes/:id/convert | Show validation toast (e.g., quote not accepted) | Redirect to login | Show "Permission Denied" toast | Show "Quote not found" toast | Show error toast with retry |
| POST /api/v1/quotes/:id/notes | Show validation toast | Redirect to login | Show "Permission Denied" toast | Show "Quote not found" toast | Show error toast |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show page header skeleton (title bar + action buttons). Show 2-column skeleton: left content area with 3 skeleton cards stacked, right sidebar with skeleton metadata rows.
- **Progressive loading:** Header renders first with quote number (from URL). Then shipment details, rate breakdown, and timeline load independently.
- **Duration threshold:** If loading exceeds 5 seconds, show "This is taking longer than usual..." in the main content area.

### Empty States

**Quote not found:**
- **Illustration:** Search/document illustration
- **Headline:** "Quote not found"
- **Description:** "The quote you're looking for doesn't exist or you don't have permission to view it."
- **CTA Button:** "Back to Quotes" -- secondary outline button

**No timeline entries:**
- **Display:** "No activity yet" with subtle icon. This should only happen for just-created drafts.

**No notes:**
- **Display:** "No notes yet. Add a note to keep track of conversations and decisions." with note icon.

**No market rate data:**
- **Display:** "Market rate data unavailable for this lane. Rates may not be available for all routes." in the market rate section.

### Error States

**Full page error:**
- **Display:** Error icon + "Unable to load quote detail" + Retry button

**Per-section error (rate loads but timeline fails):**
- **Display:** Rate section shows normally. Timeline section shows: "Could not load activity timeline" with Retry link.

**Action error (convert fails):**
- **Display:** Toast: "Failed to convert quote to order. [specific reason]." Keep user on page.

### Permission Denied

- **Full page denied:** "You don't have permission to view this quote" with back link
- **Partial denied:** Rate section shows "Contact your manager for pricing details." Margin row hidden.

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached data from [timestamp]. Actions will sync when reconnected." All action buttons disabled except Print.
- **Degraded:** "Live updates paused" indicator. Page data loads on navigation.

---

## 12. Filters, Search & Sort

### Filters

N/A -- single record detail page. Filtering is done on the Quotes List.

### Search Behavior

N/A -- not a list screen. Global search (Ctrl+K) can find quotes by number.

### Sort Options

**Timeline entries:** Sorted by timestamp descending (newest first, chronological bottom-up).

**Version history:** Sorted by version number descending (latest version first).

### Saved Filters / Presets

N/A -- detail page.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Right sidebar collapses to a collapsible summary section at the top of the content area (below header, above tabs)
- Tabs remain horizontal
- Rate breakdown and market rate bar stack vertically within their card
- Route map: full-width, slightly shorter height
- Timeline: full-width
- Action buttons: primary actions visible, secondary actions in "More" dropdown

### Mobile (< 768px)

- Right sidebar becomes a collapsible accordion at the top ("Quote Summary" toggle)
- Tabs: scrollable horizontal tab bar or switch to dropdown/accordion
- All content sections stack vertically, full-width
- Rate breakdown: simplified view (total only, expand for breakdown)
- Route map: full-width, shorter height, or hidden behind "Show Map" button
- Action buttons: primary action in sticky bottom bar, secondary in "More" menu
- Timeline: compact view with shorter descriptions
- Swipe gestures: swipe between tabs

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout: content (70%) + right sidebar (30%) |
| Desktop | 1024px - 1439px | Same layout, sidebar slightly narrower |
| Tablet | 768px - 1023px | Sidebar collapses to top summary section |
| Mobile | < 768px | Single column, accordion sections, sticky bottom action |

---

## 14. Stitch Prompt

```
Design a quote detail page for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with dark slate-900 sidebar (240px) on the left. Content area on the right. The page has a prominent header section at the top showing the quote number "QT-20260205-0042" in bold text-xl font-mono, a purple "VIEWED" status badge, and a "v2" gray version badge. Below the number, subtitle text: "Acme Manufacturing — Chicago, IL to Dallas, TX" in gray-600. On the right side of the header, four action buttons: "Edit" (outline), "Clone" (outline), "Send" (outline), "Convert to Order" (primary blue-600), and a three-dot "More" menu.

Two-column layout below header:
Left side (70%): A tab bar with 4 tabs: "Overview" (active, blue-600 underline), "Rate Details", "Versions (3)", "Notes (2)". Below the tabs:

Shipment Details card (white, rounded-lg, border):
- Two-column grid showing: Service Type: "FTL" blue badge, Equipment: dry-van icon "Dry Van", Commodity: "Electronics - Consumer", Weight: "42,000 lbs", Pieces: "24 / 12 pallets", Pickup: "Feb 10, 2026", Delivery: "Feb 11, 2026", Distance: "847 mi", Transit: "~12 hours"
- A row of small tags: "Appointment Required" in blue-50

Route card: An embedded Google-style map showing a route line from Chicago to Dallas. Below the map, two stop cards: Stop 1 with blue pin icon "Chicago, IL (Pickup)" and Stop 2 with green pin icon "Dallas, TX (Delivery)".

Rate Breakdown card:
- Line items in a clean table: "Linehaul Rate: $2,100.00", "Fuel Surcharge: $250.00 (Auto)", "Accessorials: $100.00" with expand icon
- Separator line
- "Total: $2,450.00" in bold text-lg
- Below total: "Margin: $420.00 (18.2%)" with a green colored bar indicator
- "Rate Source: MARKET" tag in blue-50
- Rate Per Mile: "$2.89/mi" in gray text

Market Rate Comparison card:
- Horizontal bar with gradient from red-100 (left/low) through yellow-100 (center/avg) to green-100 (right/high)
- Three markers: "Low $2,100" on left, "Avg $2,350" in center, "High $2,800" on right
- A blue diamond marker showing "Your Rate: $2,450" positioned at approximately 45% along the bar
- Text below: "Your rate is 4% above market average" in green-600

Activity Timeline:
- Vertical timeline with colored dots and connecting lines
- Entry 1 (purple dot): "Feb 05, 5:18 PM — Viewed by John Smith via email link"
- Entry 2 (blue dot): "Feb 05, 3:42 PM — Sent to john@acme.com by James Wilson"
- Entry 3 (gray dot): "Feb 05, 2:15 PM — Version 2 created. Rate adjusted from $2,300 to $2,450"
- Entry 4 (gray dot): "Feb 04, 10:30 AM — Created as Draft by James Wilson"

Right sidebar (30%): White card with sections:
- "Quote Summary" header in font-semibold
- Status: Large purple "VIEWED" badge
- Created: "Feb 04, 2026"
- Sent: "Feb 05, 3:42 PM"
- Viewed: "Feb 05, 5:18 PM" with eye icon
- Expires: "Feb 12, 2026" with "6 days left" in amber badge
- Separator
- Agent: "James Wilson" with small avatar
- Customer: "Acme Manufacturing" as blue link
- Contact: "John Smith" and "john@acme.com"
- Phone: "(312) 555-0142"

Design Specifications:
- Font: Inter, 14px base, 20px page title
- Sidebar: slate-900, "Quotes" active with blue-600 indicator
- Content bg: slate-50, cards are white with slate-200 border
- Primary: blue-600 buttons and links
- Status badge: purple-100 bg, purple-800 text for VIEWED
- Timeline dots: colored per event type (purple=viewed, blue=sent, gray=created/edited, green=accepted)
- Rate breakdown: clean table with right-aligned amounts, font-mono for numbers
- Market rate bar: gradient background, 8px height, rounded-full, with positioned markers
- Margin indicator: green-600 for >15%, amber for 5-15%, red for <5%
- Cards: white, rounded-lg, border-slate-200
- Tab underline: blue-600, 2px, smooth transition
- Modern SaaS aesthetic similar to Linear.app or Stripe Dashboard
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- Nothing -- screen is Not Started.

**What needs polish / bug fixes:**
- N/A (not yet built)

**What to add this wave:**
- [ ] Full page layout with header, tabs, and right sidebar
- [ ] Shipment details card with all fields
- [ ] Rate breakdown card with linehaul/fuel/accessorials/total
- [ ] Margin indicator with color coding
- [ ] Market rate comparison bar
- [ ] Activity timeline with typed entries
- [ ] Right sidebar with quote summary metadata
- [ ] Action buttons contextual to status
- [ ] "Convert to Order" flow for accepted quotes
- [ ] Send quote modal with contact selection and email preview
- [ ] Version history tab
- [ ] Notes tab with add-note form
- [ ] Route map with stops
- [ ] WebSocket integration for real-time status updates

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Quote detail layout with all sections | High | High | P0 |
| Rate breakdown + margin display | High | Medium | P0 |
| Status-contextual action buttons | High | Medium | P0 |
| Convert to Order flow | High | Medium | P0 |
| Activity timeline | Medium | Medium | P0 |
| Market rate comparison bar | High | Medium | P1 |
| Send quote modal | High | Medium | P1 |
| Version history tab | Medium | Medium | P1 |
| Notes tab | Medium | Low | P1 |
| Route map | Medium | Medium | P1 |
| Version comparison (diff view) | Low | High | P2 |
| Lane rate history chart | Low | Medium | P2 |
| Follow-up scheduler | Low | Medium | P3 |
| Proposal PDF preview | Medium | High | P2 |

### Future Wave Preview

- **Wave 2:** AI-powered follow-up suggestions ("Customer typically responds within 48h -- consider following up tomorrow"). Rate optimization suggestions based on acceptance patterns. Automated quote refresh when market rates change significantly.
- **Wave 3:** Customer engagement scoring (how many times viewed, time spent, sections viewed). Predictive acceptance probability. Integration with communication service for in-app calling/messaging.

---

<!--
DESIGN NOTES:
1. The Quote Detail is the decision-making hub for sales agents. Every piece of information needed to decide on a follow-up action should be visible without extra clicks.
2. The Market Rate Bar is one of the most differentiating features -- it gives agents instant competitive context.
3. Real-time "viewed" notifications are critical for timely follow-up.
4. The Convert to Order flow must be frictionless -- one click with a confirmation dialog.
5. Version history is important for tracking negotiation progress with customers.
-->

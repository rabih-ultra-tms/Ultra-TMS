# 13 - Missing Screens Proposals

**Purpose:** Screens that a 25-year logistics veteran and UX designer would expect in a competitive 3PL TMS but are NOT present in Ultra TMS's current 362-screen catalog. These are operational gaps -- the screens that make dispatchers say "finally, someone built this" and that give Ultra TMS an unfair advantage over McLeod, Rose Rocket, Tai, and every other TMS on the market.

**Total Proposed Screens: 17**

> These proposals are ordered by operational impact. Every screen here has been validated against common daily pain points in freight brokerage operations: wasted clicks, missing context, slow decisions, and data trapped in silos.

---

## Proposal Numbering Convention

These screens would be numbered **363-379** in the master screen catalog (continuing from the current 362). Each proposal references the existing service it belongs to, the APIs/entities it draws from, and the personas who would use it daily.

---

## Screen 363: Exception Dashboard

| Field | Detail |
|---|---|
| **Screen Name** | Exception Dashboard |
| **Service** | Service 04 - TMS Core (`@modules/tms`) |
| **Screen Type** | dashboard |
| **Purpose** | Single unified view of ALL operational problems across every active load. Today, dispatchers must check the Loads List, Claims Dashboard, Compliance Center, and Communication Hub separately to find problems. This screen eliminates that by pulling every exception into one place with color-coded severity (red/orange/yellow) and one-click resolution actions. A dispatcher opens their day here. |
| **Problem It Solves** | Dispatchers miss problems because exceptions are scattered across 4-5 different screens in different services. A late load is in TMS Core. A claim is in Claims. An expired insurance is in Carrier. A driver who stopped responding is only visible if you manually check tracking. This screen is the "war room" view. |
| **Who Uses It** | Dispatch Manager, Dispatcher, Operations Manager |
| **Frequency of Use** | Constant -- this would be a dispatcher's home screen, open all day |
| **Priority** | **MUST-HAVE** -- This is the single highest-impact screen missing from the catalog |

### Key Features

- **Exception categories:** Late pickups, late deliveries, detention alerts, claims filed, compliance issues (expired insurance/authority), driver no-response (no check call in X hours), appointment misses, TONU risks, billing holds
- **Severity color coding:** Red (requires immediate action), Orange (approaching critical), Yellow (monitoring)
- **Real-time updates:** WebSocket-driven, no manual refresh
- **One-click resolution actions:** Reassign carrier, send check call SMS, extend appointment, file claim, escalate to manager
- **Filtering:** By customer, carrier, dispatcher, date range, severity, exception type
- **Exception count badges** in the sidebar navigation so dispatchers see problems without opening the screen
- **Aging column:** How long has this exception been unresolved
- **Auto-escalation indicators:** Shows if a workflow automation has already been triggered

### Data Sources

| Entity/API | What It Provides |
|---|---|
| `Load` (TMS Core) | Load status, pickup/delivery times, carrier assignment |
| `Stop` (TMS Core) | Stop times, appointment windows, actual arrival/departure |
| `CheckCall` (TMS Core) | Last check call time, driver responsiveness |
| `Claim` (Claims) | Open claims linked to loads |
| `CarrierCompliance` (Carrier) | Insurance expiration, authority status |
| `TrackingEvent` (ELD / Mobile) | Real-time location, geofence triggers |
| `WorkflowExecution` (Workflow) | Auto-escalation status |
| `Communication` (Communication) | Last driver contact attempt and response |

### Stitch Prompt

> Build an Exception Dashboard using our design system. Modern SaaS style (Linear.app aesthetic). Full-width layout with a filter bar at top (search, severity chips for Red/Orange/Yellow, exception type dropdown, date range). Below, a data table with columns: Severity (color dot), Load #, Exception Type, Customer, Carrier, Dispatcher, Age (time since exception), Last Action, and an Actions dropdown. Rows are sorted by severity then age. Include a real-time badge count in the sidebar nav. Use WebSocket for live updates. Red/Orange/Yellow semantic colors. Support dark mode.

---

## Screen 364: Facility Database

| Field | Detail |
|---|---|
| **Screen Name** | Facility Database |
| **Service** | Service 04 - TMS Core (`@modules/tms`) |
| **Screen Type** | list + detail |
| **Purpose** | Centralized catalog of every pickup and delivery facility the brokerage has ever shipped to/from. Includes operating hours, dock count, facility requirements (appointment needed, lumper required, TWIC card), average dwell time calculated from historical loads, contact information, detention history, and driver notes/ratings. This saves 5-10 minutes per load setup because dispatchers currently re-ask the same questions about facilities on every load. |
| **Problem It Solves** | Every time a dispatcher books a load to a facility they have shipped to before, they have to ask the customer about hours, appointment requirements, and special instructions -- even though someone at the brokerage already learned this information on a previous shipment. Institutional knowledge walks out the door every time someone quits. |
| **Who Uses It** | Dispatcher, Dispatch Manager, Carrier (via Carrier Portal), Customer (via Customer Portal for their own facilities) |
| **Frequency of Use** | Multiple times per hour during active dispatching |
| **Priority** | **MUST-HAVE** -- Saves measurable time on every single load |

### Key Features

- **Facility profile:** Name, address, type (warehouse, distribution center, port, rail yard, cold storage), operating hours by day of week
- **Dock information:** Number of docks, dock type (floor-loaded, dock-high, ramp), truck size restrictions
- **Requirements checklist:** Appointment required (Y/N), lumper required (Y/N), TWIC card needed, pallet jack needed, driver assist, PPE requirements, seal required
- **Average dwell time:** Auto-calculated from historical stop data -- separate for pickup vs delivery
- **Detention history:** Average detention per visit, worst-case detention, total detention charges at this facility
- **Contact directory:** Receiving manager, shipping manager, security, with phone/email
- **Driver notes/ratings:** Crowdsourced from drivers and dispatchers. "Slow unload, always 3+ hours." "Easy in and out." Star rating.
- **Map view** with satellite imagery for dock approach directions
- **Auto-populated** from historical stop data -- facilities are created automatically when a new address appears on a load
- **Search by proximity:** Find all facilities within X miles of a point (useful for LTL consolidation)

### Data Sources

| Entity/API | What It Provides |
|---|---|
| `Stop` (TMS Core) | Historical stop addresses, dwell times, detention events |
| `Load` (TMS Core) | Load history at each facility |
| `Order` (TMS Core) | Customer-provided facility instructions |
| `Company` / `Contact` (CRM) | Facility contacts linked to customer companies |
| Google Maps / Geocoding API | Address validation, lat/long, satellite view |
| `Note` (Communication) | Driver and dispatcher notes about facilities |

### Stitch Prompt

> Build a Facility Database screen. List page with search bar, map toggle, and filter chips (facility type, state, has-detention-history, has-appointment-requirement). Data table showing: Facility Name, City/State, Type, Avg Dwell Time, Detention History badge (green/yellow/red), Last Visited date. Clicking a row opens a detail drawer with tabs: Overview (hours, requirements checklist), Contacts, Detention History chart, Driver Notes with star ratings, and a satellite map view. Use our design system. 14px Inter, Slate borders, Blue-600 actions. Support dark mode.

---

## Screen 365: Lane Performance Analytics

| Field | Detail |
|---|---|
| **Screen Name** | Lane Performance Analytics |
| **Service** | Service 19 - Analytics (`@modules/analytics`) with data from Service 03 - Sales and Service 04 - TMS Core |
| **Screen Type** | report |
| **Purpose** | Historical performance analysis by origin-destination lane. Shows average transit time, average customer rate, average carrier rate, margin, best-performing carriers per lane, on-time percentage, volume trends, and seasonal patterns. This is the screen that sales reps open before quoting a rate and operations managers use for weekly lane reviews. |
| **Problem It Solves** | Pricing decisions are made on gut feel because there is no single screen showing "for this lane, here is what we have historically charged, what we have historically paid carriers, and what our margin was." The Rate Intelligence service shows market rates but not YOUR rates. This shows your actual performance. |
| **Who Uses It** | Sales Rep, Sales Manager, Operations Manager, Pricing Analyst |
| **Frequency of Use** | Multiple times daily (sales), weekly (management reviews) |
| **Priority** | **MUST-HAVE** -- Directly impacts margin and pricing accuracy |

### Key Features

- **Lane search:** Origin city/state to destination city/state, with radius option (e.g., 50-mile radius around Chicago)
- **Key metrics cards:** Total loads (all-time and period), avg customer rate, avg carrier rate, avg margin ($ and %), on-time %
- **Rate trend chart:** Line graph showing customer rate, carrier rate, and margin over time (weekly/monthly granularity)
- **Volume trend chart:** Bar chart showing load count by week/month with seasonal pattern overlay
- **Top carriers table:** Best carriers for this lane ranked by on-time %, number of loads, average rate. Click to see carrier detail.
- **Transit time analysis:** Average, best case, worst case, with histogram distribution
- **Seasonal adjustment indicators:** "This lane runs 15% higher in Q4" type insights
- **Comparison mode:** Compare two lanes side by side
- **Export:** Download as PDF or Excel for pricing presentations
- **Link to Rate Intelligence:** Show market rate alongside your historical rate for context

### Data Sources

| Entity/API | What It Provides |
|---|---|
| `Load` (TMS Core) | Historical loads by lane, carrier, transit times |
| `Stop` (TMS Core) | Actual pickup/delivery times for on-time calculation |
| `Quote` (Sales) | Historical quoted rates by lane |
| `Invoice` (Accounting) | Actual customer revenue per load |
| `CarrierPayable` (Accounting) | Actual carrier cost per load |
| `RateIntelligence` (Rate Intelligence) | Market rate benchmarks for comparison |

### Stitch Prompt

> Build a Lane Performance Analytics screen. Top section: origin/destination search with radius slider and date range picker. Below: 4 KPI cards (Total Loads, Avg Margin %, Avg Customer Rate, On-Time %). Then two charts side by side: rate trend line chart (customer rate, carrier rate, margin lines) and volume bar chart with seasonal overlay. Below charts: Top Carriers table (Carrier Name, Loads, Avg Rate, On-Time %, Rating). Modern SaaS style, use Recharts for charts. Blue-600 primary, Inter font, dark mode support.

---

## Screen 366: Detention Tracker

| Field | Detail |
|---|---|
| **Screen Name** | Detention Tracker |
| **Service** | Service 04 - TMS Core (`@modules/tms`) |
| **Screen Type** | dashboard |
| **Purpose** | Real-time view of all loads currently sitting at facilities (checked in but not checked out). Shows a live timer counting free time remaining. Auto-calculates detention charges when free time threshold is crossed. Alerts dispatchers before free time expires so they can proactively call the facility. This is a money screen -- detention is either revenue the brokerage collects or cost the carrier charges, and most brokerages lose thousands per month by not tracking it properly. |
| **Problem It Solves** | Dispatchers have no way to see, at a glance, which loads are currently detained or approaching detention. They find out after the fact, usually when the carrier submits a bill. By then it is too late to call the facility, too late to document, and too late to bill the customer. |
| **Who Uses It** | Dispatcher, Dispatch Manager, Accounting (for charge calculation) |
| **Frequency of Use** | Checked every 30 minutes during business hours |
| **Priority** | **MUST-HAVE** -- Direct revenue recovery tool |

### Key Features

- **Live timer per load:** Shows free time remaining (countdown) or detention accrued (count-up) in hours:minutes
- **Color states:** Green (within free time), Yellow (less than 30 min of free time remaining), Red (in detention)
- **Auto-calculation:** Based on facility free time rules (configurable per customer contract) -- 2 hours standard, calculate charges at $75/hr after
- **Alert triggers:** Push notification and SMS to dispatcher when free time is at 30 minutes, 15 minutes, and 0 minutes
- **Facility column:** Shows facility name with link to Facility Database (Screen 364)
- **One-click actions:** Log detention note, call facility, send detention notice to customer, create accessorial charge
- **Daily detention summary:** Total detention hours and charges for the day
- **Historical detention report:** By facility, customer, carrier -- identify worst offenders
- **Auto-create accessorial:** When detention threshold is crossed, auto-generate an accessorial charge line item on the load

### Data Sources

| Entity/API | What It Provides |
|---|---|
| `Stop` (TMS Core) | Check-in time, check-out time, appointment time |
| `TrackingEvent` (ELD / Mobile) | Geofence arrival/departure detection |
| `Load` (TMS Core) | Load details, customer, carrier |
| `Contract` (Contracts) | Customer-specific free time and detention rate rules |
| `AccessorialCharge` (Sales/Accounting) | Detention charge line items |
| `Facility` (proposed Screen 364) | Facility detention history and average dwell |

### Stitch Prompt

> Build a Detention Tracker dashboard. Full-width table with columns: Load # (monospace), Facility Name, Stop Type (PU/DEL badge), Arrived At (timestamp), Free Time Remaining (live countdown timer), Detention Accrued (if applicable), Customer, Carrier, Dispatcher, Actions dropdown. Timer cells use Green/Yellow/Red background based on status. Include a summary bar at top showing: Total Loads At Facilities (count), In Free Time (count), In Detention (count), Today's Detention Charges ($). Auto-refresh via WebSocket. Design system: Inter 14px, Blue-600 actions, dark mode.

---

## Screen 367: Rate Negotiation Workspace

| Field | Detail |
|---|---|
| **Screen Name** | Rate Negotiation Workspace |
| **Service** | Service 03 - Sales (`@modules/sales`) with data from Service 05 - Carrier and Service 35 - Rate Intelligence |
| **Screen Type** | tool |
| **Purpose** | Side-by-side carrier rate comparison for the same lane. Shows margin impact in real-time as rates change. Displays historical rate trends graph for context. Enables one-click counter-offers. Supports "best rate wins" automation where the lowest carrier rate auto-wins. This replaces the current workflow of calling 5 carriers, writing rates on sticky notes, and trying to remember who said what. |
| **Problem It Solves** | Rate negotiation is the most repetitive, high-frequency task in freight brokerage, yet there is no dedicated tool for it. Dispatchers currently toggle between the Load Detail, carrier phone calls, and a notepad. Every other industry has negotiation tools -- freight is 20 years behind. |
| **Who Uses It** | Dispatcher, Carrier Sales Rep |
| **Frequency of Use** | 20-50 times per day per dispatcher |
| **Priority** | **MUST-HAVE** -- Core competitive differentiator |

### Key Features

- **Lane context header:** Origin, destination, equipment type, customer rate (what the customer is paying), target carrier rate, target margin
- **Carrier comparison table:** Side-by-side columns for each carrier being negotiated with. Row fields: Initial ask, counter-offer, current offer, margin at this rate, on-time % for this carrier on this lane, number of loads completed, carrier rating
- **Margin calculator:** Real-time margin display ($ and %) as rates change -- updates instantly when you type a counter-offer amount
- **Historical rate chart:** Small sparkline or line chart showing the last 90 days of carrier rates on this lane (from Rate Intelligence and your own history)
- **One-click counter-offer:** Select a carrier, type an amount, click "Send Counter" -- sends via SMS or carrier portal notification
- **"Best rate wins" toggle:** Automatically selects the carrier with the lowest rate when enabled (with confirmation)
- **Carrier availability indicator:** Green/yellow/red dot showing if carrier has confirmed truck availability
- **Rate breakdown:** Show per-mile rate alongside flat rate
- **Quick actions:** Assign to this carrier, send rate confirmation, decline all offers
- **Negotiation history:** Timeline of all offers and counter-offers per carrier for this load

### Data Sources

| Entity/API | What It Provides |
|---|---|
| `Load` (TMS Core) | Load details, customer rate, equipment type |
| `Quote` (Sales) | Customer quote and rate expectations |
| `Carrier` (Carrier) | Carrier profile, scorecard, lane preferences |
| `RateIntelligence` (Rate Intelligence) | Market rate benchmarks |
| `CarrierPayable` (Accounting) | Historical carrier rates paid |
| `Communication` (Communication) | SMS/message for counter-offers |
| `LoadBoard` (Load Board External) | Posted load responses and carrier bids |

### Stitch Prompt

> Build a Rate Negotiation Workspace. Top header bar showing lane (origin > destination), equipment type, customer rate, and target margin. Main area is a horizontal comparison layout with 3-5 carrier columns. Each column shows: carrier name, initial rate, counter-offer input field, current rate, margin at this rate (green if above target, red if below), carrier on-time %, and action buttons (Send Counter, Accept, Decline). Right sidebar shows a rate trend sparkline chart for this lane (90 days). Sticky footer with "Assign Best Rate" button. Modern SaaS style, Inter font, Blue-600 primary actions, dark mode support.

---

## Screen 368: Customer Shipping Patterns

| Field | Detail |
|---|---|
| **Screen Name** | Customer Shipping Patterns |
| **Service** | Service 19 - Analytics (`@modules/analytics`) with data from Service 02 - CRM and Service 04 - TMS Core |
| **Screen Type** | report |
| **Purpose** | Visual heatmap and analytics of a specific customer's shipping lanes, volume by lane over time, preferred equipment types, seasonal trends, and growth opportunities. Used by sales reps to identify upsell opportunities ("you ship 20 loads/month to Dallas but nothing to Houston -- we can help with that") and by operations to plan capacity for recurring customers. |
| **Problem It Solves** | Sales reps have no visual summary of how a customer ships. They rely on memory and spreadsheets. When a sales rep takes over an account, they have to manually review hundreds of past loads to understand the customer's shipping patterns. This screen gives them that understanding in 30 seconds. |
| **Who Uses It** | Sales Rep, Sales Manager, Account Manager, Operations Manager |
| **Frequency of Use** | Before every customer meeting, weekly for top accounts |
| **Priority** | **NICE-TO-HAVE** -- High value for sales, but not blocking daily operations |

### Key Features

- **Lane heatmap:** Map visualization showing customer's most-used lanes with line thickness proportional to volume
- **Volume by lane table:** Top lanes ranked by load count and revenue, with trend arrows (up/down/flat)
- **Equipment breakdown:** Pie chart showing dry van %, reefer %, flatbed %, etc.
- **Seasonal pattern chart:** 12-month view showing volume by month with year-over-year comparison
- **Growth opportunities:** AI-suggested lanes based on the customer's existing patterns ("customers who ship to A and B usually also ship to C")
- **Revenue trend:** Customer total revenue over time
- **Rate comparison:** Are we charging this customer above or below our average for these lanes?
- **Carrier preferences:** Which carriers does this customer prefer (based on feedback or repeat use)?
- **Export:** Shareable PDF for customer business reviews (QBR meetings)
- **Date range selector:** Last 30, 90, 180 days, 1 year, all-time

### Data Sources

| Entity/API | What It Provides |
|---|---|
| `Company` (CRM) | Customer profile |
| `Load` (TMS Core) | Historical loads by lane |
| `Order` (TMS Core) | Order history |
| `Invoice` (Accounting) | Revenue per load/lane |
| `Quote` (Sales) | Quoted vs actual rates |
| Google Maps API | Heatmap rendering |

### Stitch Prompt

> Build a Customer Shipping Patterns screen. Top: customer name with revenue KPI cards (Total Revenue, Load Count, Avg Margin, Top Lane). Main area split: left side shows a US map with lane lines (thicker = more volume, color-coded by equipment type), right side shows a top lanes table (Origin, Destination, Loads, Revenue, Trend arrow). Below: two charts side by side -- seasonal volume bar chart (monthly, with YoY overlay) and equipment type donut chart. Design system: Inter 14px, modern SaaS, use Mapbox or Leaflet for map, Recharts for charts, dark mode support.

---

## Screen 369: Carrier Capacity Calendar

| Field | Detail |
|---|---|
| **Screen Name** | Carrier Capacity Calendar |
| **Service** | Service 05 - Carrier (`@modules/carrier`) with data from Service 13 - Carrier Portal |
| **Screen Type** | calendar |
| **Purpose** | Weekly and monthly calendar view showing carrier truck availability, committed loads, and open capacity. Helps dispatchers find available carriers faster by seeing who has trucks where and when. Carriers can self-report their availability through the Carrier Portal. This eliminates the "call 15 carriers to find one with a truck" problem. |
| **Problem It Solves** | Finding available carriers is the biggest time sink in dispatching. Dispatchers call 10-20 carriers to find one with a truck. If carriers could proactively share their availability -- and dispatchers could see it in a calendar view -- the matching process would shrink from 30 minutes to 3 minutes. |
| **Who Uses It** | Dispatcher, Carrier Sales Rep, Carrier (via Carrier Portal self-service) |
| **Frequency of Use** | Multiple times per hour during dispatching |
| **Priority** | **MUST-HAVE** -- Fundamentally changes dispatch efficiency |

### Key Features

- **Calendar grid:** Weekly view (default) with carrier rows and date columns. Each cell shows: available trucks (green), committed loads (blue), blacked-out days (gray)
- **Carrier self-service:** Carriers update their availability via the Carrier Portal (Screen: Carrier Portal Dashboard). Shows "Carrier-reported" vs "System-inferred" availability
- **Lane-specific filtering:** Filter to show only carriers who run a specific lane or region
- **Equipment filter:** Filter by dry van, reefer, flatbed, etc.
- **Capacity matching:** "I need a reefer in Dallas on Tuesday" -- instantly shows carriers with open capacity matching that criteria
- **One-click load offer:** From the calendar, click an available slot and offer a specific load to that carrier
- **Monthly heatmap view:** Toggle to a monthly view showing capacity density (darker = more availability)
- **Auto-populated from loads:** When a carrier is assigned to a load, their calendar is automatically updated to show them as committed
- **Push notifications:** Alert dispatchers when a preferred carrier reports new availability on a watched lane

### Data Sources

| Entity/API | What It Provides |
|---|---|
| `Carrier` (Carrier) | Carrier profile, equipment, preferred lanes |
| `Load` (TMS Core) | Committed loads per carrier per date |
| `CarrierPortal` (Carrier Portal) | Self-reported availability |
| `Equipment` (Carrier) | Truck/trailer types and counts |
| `LanePreference` (Carrier) | Carrier preferred lanes |
| `Scheduler` (Scheduler) | Calendar sync and notifications |

### Stitch Prompt

> Build a Carrier Capacity Calendar screen. Weekly grid layout: rows are carriers (name, equipment type, region), columns are days of the week. Each cell shows a capacity indicator (green filled = available, blue filled = committed with load # tooltip, gray = blacked out). Top toolbar: week navigation arrows, date picker, equipment type filter, lane/region filter, and a search bar. Right sidebar: "Find Capacity" form with fields for date, lane, equipment type -- results highlight matching carriers. Support toggle to monthly heatmap view. Design system: Inter 14px, Blue-600 actions, clean grid borders, dark mode support.

---

## Screen 370: Daily Dispatch Summary

| Field | Detail |
|---|---|
| **Screen Name** | Daily Dispatch Summary |
| **Service** | Service 19 - Analytics (`@modules/analytics`) |
| **Screen Type** | report |
| **Purpose** | Auto-generated end-of-day report summarizing all dispatch activity: loads dispatched, loads delivered, exceptions encountered, total revenue, total margin, and comparison to yesterday and last week. Designed to be emailed as a PDF to management. Includes charts and key metrics. Replaces the manual EOD report that most brokerages create in Excel. |
| **Problem It Solves** | Every brokerage manager wants a daily report. Currently this requires someone to manually pull data from 3-4 screens and compile it into a spreadsheet. It takes 20-30 minutes and is error-prone. This screen auto-generates it. |
| **Who Uses It** | Operations Manager, Branch Manager, VP of Operations, CEO |
| **Frequency of Use** | Daily (end of day), with on-demand access for intraday checks |
| **Priority** | **NICE-TO-HAVE** -- High value for management visibility, not blocking operations |

### Key Features

- **KPI summary cards:** Loads Dispatched, Loads Delivered, Revenue, Margin, On-Time %, Exceptions Count
- **Comparison indicators:** Green/red arrows vs yesterday and vs same day last week
- **Loads dispatched table:** Summary of all loads dispatched today with customer, carrier, lane, rate
- **Exceptions section:** List of all exceptions from the day with resolution status
- **Revenue chart:** Bar chart showing today vs last 7 days
- **Dispatcher leaderboard:** Loads per dispatcher today with revenue and margin
- **Auto-generation:** Scheduler runs at 6 PM (configurable) to generate the report
- **Email distribution:** Auto-emails the report as PDF to configured recipients
- **On-demand generation:** "Generate Now" button for intraday checks
- **Drill-down:** Click any metric to navigate to the detailed screen
- **Period selector:** View any historical day's summary

### Data Sources

| Entity/API | What It Provides |
|---|---|
| `Load` (TMS Core) | Loads dispatched and delivered today |
| `Invoice` (Accounting) | Revenue calculations |
| `CarrierPayable` (Accounting) | Cost and margin calculations |
| `Claim` / Exception data | Exception counts |
| `User` (Auth) | Dispatcher assignment for leaderboard |
| `Scheduler` (Scheduler) | Auto-generation timing |
| `Communication` (Communication) | Email distribution |

### Stitch Prompt

> Build a Daily Dispatch Summary report screen. Top: date selector with left/right arrows and "Today" button. Below: 6 KPI cards in a row (Loads Dispatched, Delivered, Revenue, Margin, On-Time %, Exceptions) each with a comparison arrow vs yesterday. Below cards: a 7-day revenue bar chart (today highlighted). Below chart: two columns -- left shows Dispatcher Leaderboard table (Name, Loads, Revenue, Margin), right shows Today's Exceptions list (Load #, Type, Status). Top-right corner: "Download PDF" and "Email Report" buttons. Design system: Inter 14px, modern SaaS, Recharts, dark mode.

---

## Screen 371: P&L by Lane

| Field | Detail |
|---|---|
| **Screen Name** | P&L by Lane |
| **Service** | Service 19 - Analytics (`@modules/analytics`) with data from Service 06 - Accounting |
| **Screen Type** | report |
| **Purpose** | Profit and loss breakdown by lane, with the ability to pivot by customer, carrier, equipment type, and time period. Shows which lanes are profitable and which are losing money. Identifies margin erosion trends. Used by management for weekly P&L reviews and strategic lane decisions (should we keep running this lane?). |
| **Problem It Solves** | Most brokerages cannot answer "which lanes are profitable?" without an analyst building a spreadsheet. Revenue is in the invoice system, cost is in carrier payables, and the lane is in TMS -- three different places. This screen joins them together. |
| **Who Uses It** | Operations Manager, VP of Operations, CFO, Sales Manager |
| **Frequency of Use** | Weekly for management reviews, monthly for strategic planning |
| **Priority** | **MUST-HAVE** -- Essential for profitable operations |

### Key Features

- **Lane P&L table:** Origin, Destination, Load Count, Revenue, Carrier Cost, Gross Margin ($), Gross Margin (%), trend arrow
- **Pivot dimensions:** Group by lane (default), customer, carrier, equipment type, sales rep, dispatcher
- **Time period selector:** This week, this month, this quarter, this year, custom range
- **Margin distribution chart:** Histogram showing margin % distribution across all lanes
- **Unprofitable lane alert:** Red highlight on lanes with negative or below-threshold margin
- **Trend analysis:** Click any lane to see margin trend over the last 6 months -- is it improving or deteriorating?
- **Drill-down:** Click a lane to see every load on that lane for the selected period
- **Comparison:** Compare two time periods side by side (this month vs last month)
- **Export:** Excel export with full detail for finance teams
- **Threshold configuration:** Set minimum margin % threshold -- everything below is flagged

### Data Sources

| Entity/API | What It Provides |
|---|---|
| `Load` (TMS Core) | Loads by lane, customer, carrier |
| `Invoice` (Accounting) | Customer revenue per load |
| `CarrierPayable` (Accounting) | Carrier cost per load |
| `Stop` (TMS Core) | Origin/destination for lane determination |
| `AccessorialCharge` (Sales) | Additional revenue/cost line items |
| `Commission` (Commission) | Commission cost to deduct from margin |

### Stitch Prompt

> Build a P&L by Lane report screen. Top toolbar: pivot selector dropdown (Lane, Customer, Carrier, Equipment, Sales Rep), date range picker, and margin threshold input. Below: sortable data table with columns: Lane (origin > destination), Loads, Revenue, Cost, Margin $, Margin % (green/yellow/red based on threshold), Trend sparkline. Above the table: 3 KPI cards (Total Revenue, Total Margin, Avg Margin %). Right side: margin distribution histogram chart. Rows with margin below threshold have a red left border. Design system: Inter 14px, Blue-600 primary, Recharts, dark mode.

---

## Screen 372: Quick Pay Approval Queue

| Field | Detail |
|---|---|
| **Screen Name** | Quick Pay Approval Queue |
| **Service** | Service 17 - Factoring Internal (`@modules/factoring`) |
| **Screen Type** | list |
| **Purpose** | Streamlined approval workflow specifically designed for carrier quick pay requests. Shows all pending requests in a queue optimized for fast processing: load delivery status (must be delivered), POD upload status (must be uploaded), amount, quick pay fee calculation, and net payment. Supports batch approval for processing 20+ requests in minutes instead of one at a time. |
| **Problem It Solves** | The existing Quick Pay Requests screen (Service 17, Screen 2) is a basic list. It does not show the prerequisites for approval (is the load delivered? is the POD uploaded?) inline, forcing the approver to click into each request, check the load, check the POD, then come back. This dedicated queue view shows everything needed for a decision in the table row itself. |
| **Who Uses It** | Accounting Specialist, Accounting Manager |
| **Frequency of Use** | 1-3 times daily |
| **Priority** | **NICE-TO-HAVE** -- Efficiency improvement over existing screen |

### Key Features

- **Inline status indicators:** Green checkmarks for "Load Delivered" and "POD Uploaded" -- red X if not yet met
- **Fee calculator:** Shows gross amount, quick pay fee (e.g., 3%), and net amount carrier receives
- **Batch selection:** Checkbox column with "Select All" for batch approval
- **Batch approve button:** Approve all selected requests in one click
- **POD quick-view:** Thumbnail of POD document -- click to expand without leaving the page
- **Auto-block:** Cannot approve if load is not delivered or POD is not uploaded (checkbox disabled with tooltip explaining why)
- **Priority sorting:** Oldest requests first, with "days waiting" column
- **Daily quick pay summary:** Total amount to be paid out today after approvals
- **Export for payment:** Generate payment file (ACH/check batch) after approval

### Data Sources

| Entity/API | What It Provides |
|---|---|
| `QuickPayRequest` (Factoring Internal) | Request details, amount, status |
| `Load` (TMS Core) | Delivery confirmation status |
| `Document` (Documents) | POD upload status and thumbnail |
| `CarrierPayable` (Accounting) | Payment amount and carrier bank info |
| `FactoringSettings` (Factoring Internal) | Fee percentage configuration |

### Stitch Prompt

> Build a Quick Pay Approval Queue screen. Top: summary bar showing Pending Count, Total Pending Amount, Today's Approved Amount. Below: data table with checkbox column, columns: Request Date, Load # (monospace), Carrier Name, Amount, Fee (calculated), Net Amount, Load Delivered (green check / red X icon), POD Uploaded (green check / red X icon with thumbnail on hover), Days Waiting, Actions. Sticky bottom bar appears on selection showing: "X selected -- Total: $Y -- [Approve Selected]" button. Rows where prerequisites are not met have the checkbox disabled. Design system: Inter 14px, Blue-600 primary, dark mode.

---

## Screen 373: Load Consolidation Tool

| Field | Detail |
|---|---|
| **Screen Name** | Load Consolidation Tool |
| **Service** | Service 04 - TMS Core (`@modules/tms`) |
| **Screen Type** | tool |
| **Purpose** | Visual tool to identify and combine multiple small orders on similar routes into consolidated loads. Shows potential cost savings from consolidation. Features drag-and-drop order placement onto loads and a map visualization showing route optimization. This is how larger brokerages reduce empty miles and increase margin on LTL and partial shipments. |
| **Problem It Solves** | When a brokerage receives multiple small orders going in the same direction, each order is typically dispatched as a separate load. This is inefficient -- three partial loads on the same lane could be one full truckload at a lower per-unit cost. Without a visual tool, dispatchers cannot easily spot consolidation opportunities. |
| **Who Uses It** | Dispatcher, Operations Manager, LTL Coordinator |
| **Frequency of Use** | Daily during load planning |
| **Priority** | **NICE-TO-HAVE** -- High value for brokerages with LTL or partial load volume |

### Key Features

- **Unassigned orders panel:** Left sidebar showing all unassigned orders, sorted by geography or date
- **Consolidation suggestions:** AI/algorithm suggests orders that can be combined based on proximity, time window overlap, and equipment compatibility
- **Drag-and-drop:** Drag orders from the sidebar onto a load card in the main area
- **Map visualization:** Map showing all unassigned order origins/destinations with route lines for proposed consolidations
- **Savings calculator:** Real-time display of cost savings from consolidation vs individual shipment
- **Weight/volume tracker:** Shows remaining capacity on a consolidated load as orders are added
- **Time window validation:** Warns if adding an order would violate pickup/delivery windows of other orders on the load
- **Equipment compatibility check:** Ensures all orders on a consolidated load are compatible (no reefer + dry van mix)
- **One-click create load:** Once satisfied with the consolidation, create the load with all stops in optimized order

### Data Sources

| Entity/API | What It Provides |
|---|---|
| `Order` (TMS Core) | Unassigned orders, pickup/delivery locations, time windows |
| `Load` (TMS Core) | Existing loads with capacity |
| `Stop` (TMS Core) | Stop details for route optimization |
| Google Maps / Distance Matrix API | Route calculation and optimization |
| `Quote` (Sales) | Customer rate per order |
| `RateIntelligence` (Rate Intelligence) | Market rates for consolidated lane |

### Stitch Prompt

> Build a Load Consolidation Tool. Three-panel layout: Left panel (250px) shows unassigned orders list with weight, origin/destination, and date. Center panel shows a map with order pins (blue = pickup, red = delivery) and proposed route lines. Right panel shows "Consolidated Loads" as cards -- each card shows orders assigned, total weight, remaining capacity progress bar, estimated savings, and stop sequence. Orders are draggable from left panel to load cards. Top toolbar: date range filter, equipment filter, region filter. Bottom bar: total potential savings. Design system: Inter 14px, Mapbox/Leaflet, drag-and-drop via dnd-kit, dark mode.

---

## Screen 374: Driver Communication Hub

| Field | Detail |
|---|---|
| **Screen Name** | Driver Communication Hub |
| **Service** | Service 11 - Communication (`@modules/communication`) |
| **Screen Type** | dashboard |
| **Purpose** | Centralized thread view of all communications with drivers for a specific load. Shows SMS messages, app messages, check calls, and email in a single unified timeline. Supports two-way messaging with template messages for common scenarios. Includes translation support for Spanish-speaking drivers. This replaces the current workflow of checking SMS logs, email, and check call history separately. |
| **Problem It Solves** | When a problem occurs on a load, the dispatcher needs to see "what has been communicated to the driver?" Currently, SMS is in one place, check calls in another, and emails in another. There is no unified "conversation thread" per load. Additionally, many drivers speak Spanish and dispatchers waste time trying to communicate across a language barrier. |
| **Who Uses It** | Dispatcher, Dispatch Manager |
| **Frequency of Use** | 30-50 times per day per dispatcher |
| **Priority** | **MUST-HAVE** -- Communication is the core of dispatch work |

### Key Features

- **Unified timeline:** All messages (SMS, app, email, check calls, system notifications) in a single chronological thread per load
- **Two-way messaging:** Send and receive SMS directly from the screen. Reply to carrier portal messages.
- **Template messages:** Quick-send buttons for common messages: "Please provide ETA", "Confirm arrival", "Upload BOL/POD", "Call dispatch", with Spanish translations
- **Auto-translation:** Toggle to auto-translate messages to/from Spanish using a translation API
- **Driver profile sidebar:** Shows driver name, phone, carrier, language preference, response history (avg response time)
- **Check call integration:** Check call entries appear inline in the timeline with location data
- **Read receipts:** Show if SMS was delivered and read (where carrier supports it)
- **Escalation button:** If driver is non-responsive after X minutes, escalate to carrier dispatcher
- **Multi-load view:** Optionally view all communications for a carrier across all active loads
- **Search within thread:** Search for specific keywords in the communication history

### Data Sources

| Entity/API | What It Provides |
|---|---|
| `Communication` (Communication) | SMS, email, message records |
| `CheckCall` (TMS Core) | Check call entries with location |
| `Load` (TMS Core) | Load context for the thread |
| `Carrier` / `Contact` (Carrier) | Driver profile and phone number |
| `TrackingEvent` (ELD / Mobile) | Location data for check calls |
| Translation API (Integration Hub) | Spanish/English translation |
| Twilio / SMS Provider (Integration Hub) | SMS send/receive |

### Stitch Prompt

> Build a Driver Communication Hub screen. Left panel (300px): load selector showing active loads for this dispatcher with unread message badges. Center panel: chat-style timeline showing all messages for the selected load -- SMS (blue bubbles), check calls (gray system entries with map pin icon), emails (outlined cards), system events (small gray text). Message input at bottom with send button, template dropdown, and Spanish translation toggle. Right panel (250px): driver profile card (name, phone, carrier, language, avg response time) and load summary card (status, stops, ETA). Design system: Inter 14px, chat bubble UI, Blue-600 for sent messages, Slate-100 for received, dark mode.

---

## Screen 375: Carrier Rate History

| Field | Detail |
|---|---|
| **Screen Name** | Carrier Rate History |
| **Service** | Service 05 - Carrier (`@modules/carrier`) with data from Service 06 - Accounting |
| **Screen Type** | report |
| **Purpose** | For a specific carrier: their rate trends by lane over time, acceptance rate trends, on-time performance trends, and service quality metrics. This gives dispatchers and carrier sales reps the data they need to negotiate rates with carriers. Instead of "we need a lower rate," they can say "your average rate on this lane has increased 12% in 6 months while your on-time rate dropped from 95% to 87%." Data-driven negotiation. |
| **Problem It Solves** | Rate negotiations with carriers are based on feelings, not data. Dispatchers cannot quickly see if a carrier's rates have been creeping up, or if their service quality justifies a premium. This screen provides that context for every carrier. |
| **Who Uses It** | Dispatcher, Carrier Sales Rep, Operations Manager |
| **Frequency of Use** | Before every rate negotiation, during quarterly carrier reviews |
| **Priority** | **NICE-TO-HAVE** -- Enhances negotiation effectiveness |

### Key Features

- **Carrier header:** Carrier name, MC#, overall rating, total loads completed, active since date
- **Rate trend chart:** Line chart showing average rate paid to this carrier over time (weekly or monthly), with overall market rate overlay for comparison
- **Lane-specific breakdown:** Table of carrier's top lanes with avg rate, load count, on-time %, and rate trend per lane
- **Acceptance rate trend:** Percentage of loads offered to this carrier that they accepted, over time
- **On-time trend:** On-time pickup and delivery percentages over time
- **Service scorecard:** Composite score combining on-time, acceptance rate, claims history, responsiveness
- **Comparison to peers:** How does this carrier's rate compare to the average carrier rate on the same lanes?
- **Contract vs spot breakdown:** Split of loads that were contract rate vs spot rate
- **Export:** PDF for quarterly carrier reviews
- **Negotiation notes:** Log notes from rate conversations for future reference

### Data Sources

| Entity/API | What It Provides |
|---|---|
| `Carrier` (Carrier) | Carrier profile, scorecard |
| `CarrierPayable` (Accounting) | Historical rates paid per load |
| `Load` (TMS Core) | Load history, lanes, on-time data |
| `Stop` (TMS Core) | Actual vs scheduled times for on-time calculation |
| `RateIntelligence` (Rate Intelligence) | Market rate comparison |
| `CarrierScorecard` (Carrier) | Performance metrics |
| `Note` (Communication) | Negotiation notes |

### Stitch Prompt

> Build a Carrier Rate History screen. Top: carrier profile header (name, MC#, rating badge, total loads, member since). Below: 4 KPI cards (Avg Rate, On-Time %, Acceptance Rate, Total Loads). Then two charts: left shows rate trend line chart with market rate overlay (dashed line), right shows on-time % trend line chart. Below charts: lane breakdown table (Lane, Loads, Avg Rate, On-Time %, Rate Trend sparkline). Below table: negotiation notes section with add-note form. Design system: Inter 14px, Recharts for charts, Blue-600 primary, dark mode.

---

## Screen 376: Revenue Forecast Dashboard

| Field | Detail |
|---|---|
| **Screen Name** | Revenue Forecast Dashboard |
| **Service** | Service 19 - Analytics (`@modules/analytics`) with data from Service 03 - Sales and Service 04 - TMS Core |
| **Screen Type** | dashboard |
| **Purpose** | Forward-looking revenue forecast combining pipeline value from open quotes, committed orders, and historical trend extrapolation. Forecasts revenue for the next 30/60/90 days. Breakdowns by sales rep, customer, and lane. This is the "are we going to hit our number?" screen that management checks every Monday morning. |
| **Problem It Solves** | Brokerage management has no forward visibility into revenue. They know what they did last month but not what they will do next month. Sales pipeline is in the CRM, committed orders are in TMS, and historical trends require a spreadsheet. This screen combines all three data sources into a single forecast. |
| **Who Uses It** | VP of Sales, VP of Operations, CFO, Sales Manager |
| **Frequency of Use** | Daily for sales leadership, weekly for executive review |
| **Priority** | **NICE-TO-HAVE** -- Strategic value for leadership, not daily operations |

### Key Features

- **Forecast summary cards:** Forecast revenue for next 30, 60, 90 days with confidence ranges (optimistic/expected/conservative)
- **Forecast components breakdown:** Bar chart showing: committed revenue (orders booked), pipeline revenue (quotes with conversion probability), trend-based forecast (extrapolated from historical patterns)
- **By sales rep table:** Each rep's forecast with committed, pipeline, and trend contributions
- **By customer table:** Top customers by forecasted revenue with trend arrows
- **By lane table:** Top lanes by forecasted volume and revenue
- **Accuracy tracking:** Show how previous forecasts compared to actuals (to build trust in the forecast)
- **Scenario modeling:** Toggle assumptions like "what if conversion rate drops 10%" or "what if our top customer increases volume"
- **Goal tracking:** Set monthly/quarterly revenue targets and show progress-to-goal with forecast trajectory
- **Weekly trend chart:** Line chart showing forecasted vs actual revenue rolling weekly
- **Email summary:** Auto-send forecast summary to leadership Monday mornings

### Data Sources

| Entity/API | What It Provides |
|---|---|
| `Quote` (Sales) | Open quotes with values and conversion probability |
| `Order` (TMS Core) | Committed orders with scheduled dates |
| `Load` (TMS Core) | Historical load volume for trend calculation |
| `Invoice` (Accounting) | Historical revenue for trend calculation |
| `Opportunity` (CRM) | Sales pipeline stages and probabilities |
| `User` (Auth) | Sales rep assignments |
| `Scheduler` (Scheduler) | Automated Monday email generation |

### Stitch Prompt

> Build a Revenue Forecast Dashboard. Top: 3 large KPI cards for 30/60/90-day forecast with confidence range (e.g., "$1.2M - $1.5M expected, $1.8M optimistic"). Below: stacked bar chart showing forecast components (Committed green, Pipeline yellow, Trend-based gray) by week for the next 90 days. Below chart: three tabs -- By Sales Rep (table with name, committed, pipeline, forecast total), By Customer (table), By Lane (table). Top-right: goal progress ring showing % to monthly target. Design system: Inter 14px, Recharts, Blue-600, dark mode.

---

## Screen 377: Compliance Expiration Calendar

| Field | Detail |
|---|---|
| **Screen Name** | Compliance Expiration Calendar |
| **Service** | Service 05 - Carrier (`@modules/carrier`) with data from Service 30 - Safety |
| **Screen Type** | calendar |
| **Purpose** | Calendar view of all upcoming insurance and document expirations across the entire carrier base. Color-coded by urgency: green (30+ days), yellow (14-30 days), orange (7-14 days), red (< 7 days). Supports batch notification triggers to send reminder emails to carriers. Prevents the scenario where a carrier's insurance expires mid-load and the brokerage is exposed. |
| **Problem It Solves** | The existing Insurance Tracking screen (Service 30, Screen 5) is a list. It shows current status but does not give a forward-looking calendar view of what is about to expire. Compliance managers need to see "next week, 12 carriers have insurance expiring" so they can proactively reach out. A list sorted by expiration date is not the same as a calendar view. |
| **Who Uses It** | Compliance Manager, Operations Manager, Admin |
| **Frequency of Use** | Daily for compliance team, weekly for management review |
| **Priority** | **MUST-HAVE** -- Compliance failures expose the brokerage to catastrophic liability |

### Key Features

- **Calendar view:** Monthly calendar with expiration events plotted by date, color-coded by urgency (red/orange/yellow/green)
- **Document types tracked:** General liability insurance, auto liability insurance, cargo insurance, workers comp, operating authority, W-9, carrier agreement, BOC-3
- **Urgency tiers:** Red (< 7 days), Orange (7-14 days), Yellow (14-30 days), Green (30+ days)
- **Daily summary sidebar:** Shows count of expirations by urgency tier for selected date range
- **Batch notification:** Select multiple carriers and send reminder email/SMS with one click using configurable templates
- **Auto-notification rules:** Configure automatic reminders at 30, 14, and 7 days before expiration
- **Carrier detail link:** Click any calendar event to go directly to the carrier's compliance section
- **List view toggle:** Toggle between calendar and list view for those who prefer tables
- **Do-not-load flag:** Automatically flag carriers with expired documents so they cannot be assigned to loads
- **Renewal tracking:** Mark carriers as "renewal in progress" to distinguish from those who have not started renewal
- **Export:** Downloadable report of all upcoming expirations for the next 30/60/90 days

### Data Sources

| Entity/API | What It Provides |
|---|---|
| `CarrierCompliance` (Carrier) | Insurance certificates, expiration dates |
| `Document` (Documents) | Uploaded compliance documents |
| `Carrier` (Carrier) | Carrier profile and active load status |
| `SafetyRating` (Safety) | Authority and safety monitoring data |
| `Communication` (Communication) | Send notification emails/SMS |
| `Workflow` (Workflow) | Auto-notification rules |
| `Scheduler` (Scheduler) | Scheduled reminder triggers |

### Stitch Prompt

> Build a Compliance Expiration Calendar screen. Monthly calendar grid with day cells. Each cell shows small colored dots/badges for expirations on that date (red/orange/yellow/green). Clicking a date opens a panel listing all expirations for that day with carrier name, document type, days remaining. Left sidebar: urgency summary (Red: X, Orange: X, Yellow: X, Green: X) and quick filters by document type. Top toolbar: month navigation, calendar/list view toggle, "Send Reminders" batch action button. List view shows a table: Carrier, Document Type, Expiration Date, Days Remaining, Status, Actions. Design system: Inter 14px, semantic urgency colors, Blue-600 primary, dark mode.

---

## Screen 378: Load Template Library

| Field | Detail |
|---|---|
| **Screen Name** | Load Template Library |
| **Service** | Service 04 - TMS Core (`@modules/tms`) |
| **Screen Type** | list |
| **Purpose** | Library of saved templates for recurring shipments. Customer-specific templates capture origin, destination, equipment, special instructions, rate, preferred carriers -- everything needed to book a load without re-entering data. Features one-click "book again" to create a new order from a template. Shows last used date and frequency. |
| **Problem It Solves** | Many brokerage customers ship the same lane weekly or daily. Each time, the dispatcher re-enters the same origin, destination, pickup number format, special instructions, etc. This is wasted time and an error source. Templates let dispatchers book a recurring shipment in 2 clicks instead of 20 fields. |
| **Who Uses It** | Dispatcher, Sales Rep, Customer (via Customer Portal for their own recurring shipments) |
| **Frequency of Use** | Multiple times daily for brokerages with recurring customers |
| **Priority** | **MUST-HAVE** -- Significant time savings on high-frequency task |

### Key Features

- **Template list:** Searchable list of all templates, sortable by customer, lane, frequency of use, last used date
- **Template detail:** Shows all pre-filled fields -- customer, origin facility, destination facility, equipment, weight, commodity, special instructions, customer rate, target carrier rate, preferred carriers, reference number format
- **One-click "Book Again":** Creates a new order pre-filled from the template, with only the date needing to be set
- **Auto-generated templates:** System suggests templates for any lane shipped 3+ times for the same customer
- **Customer-specific organization:** Group templates by customer with customer logo/name headers
- **Usage stats:** How many times each template has been used, last used date, average margin on loads created from this template
- **Template editor:** Create or edit templates manually, or save from any existing order
- **Customer portal integration:** Customers can see and use their own templates in the Customer Portal
- **Version history:** Track changes to templates over time
- **Favorite/pin:** Pin most-used templates to the top

### Data Sources

| Entity/API | What It Provides |
|---|---|
| `Order` (TMS Core) | Historical orders to generate templates from |
| `Load` (TMS Core) | Load data for template creation |
| `Company` (CRM) | Customer profile for grouping |
| `Stop` (TMS Core) | Facility details for origin/destination |
| `Quote` (Sales) | Rate information for templates |
| `Carrier` (Carrier) | Preferred carrier list |
| `Facility` (proposed Screen 364) | Facility details auto-populated |

### Stitch Prompt

> Build a Load Template Library screen. Top: search bar, customer filter dropdown, equipment type filter, sort by (Most Used, Last Used, Customer Name). Main area: card grid or list view toggle. Each template card shows: Customer name + logo, Lane (origin > destination), Equipment type badge, Times Used count, Last Used date, Avg Margin badge, and a prominent "Book Again" button. Clicking a card opens a detail drawer with all template fields and an "Edit Template" option. Floating action button: "+ Create Template". Design system: Inter 14px, Blue-600 primary, card layout with hover shadows, dark mode.

---

## Screen 379: Fuel Surcharge Calculator

| Field | Detail |
|---|---|
| **Screen Name** | Fuel Surcharge Calculator |
| **Service** | Service 03 - Sales (`@modules/sales`) with data from Service 31 - Fuel Cards and Integration Hub |
| **Screen Type** | tool |
| **Purpose** | Calculates fuel surcharges based on the DOE (Department of Energy) weekly national diesel fuel price index. Auto-calculates surcharge by equipment type and distance using configurable fuel surcharge tables. Shows historical fuel surcharge trends. Can be applied to quotes and loads automatically. Eliminates manual fuel surcharge lookups and calculations that waste time and create billing errors. |
| **Problem It Solves** | Fuel surcharges are charged on most customer contracts but calculated manually -- someone looks up the DOE index, finds the right row in a fuel surcharge table, calculates the per-mile surcharge, multiplies by miles, and adds it to the invoice. This is done for every load. Errors are common and either cost the brokerage money or upset the customer. |
| **Who Uses It** | Sales Rep (when quoting), Dispatcher (when pricing loads), Accounting (when invoicing) |
| **Frequency of Use** | Applied to every load on fuel surcharge contracts -- potentially 50+ times per day |
| **Priority** | **NICE-TO-HAVE** -- Automates a tedious calculation, prevents billing errors |

### Key Features

- **DOE index auto-fetch:** Automatically pulls the latest DOE weekly diesel price index via API
- **Fuel surcharge table management:** Configurable tables that map fuel price ranges to per-mile surcharge rates (different tables for different customers/contracts)
- **Calculator:** Input: miles, equipment type, fuel surcharge table. Output: surcharge amount
- **Historical fuel price chart:** Line chart showing DOE diesel index over time with surcharge rate overlay
- **Auto-apply to loads:** When enabled, automatically calculates and adds fuel surcharge as an accessorial line item on qualifying loads
- **Customer contract integration:** Pulls the correct fuel surcharge table based on the customer's contract
- **Bulk recalculation:** If the DOE index changes, recalculate all open loads for the current week
- **Audit trail:** Shows how each surcharge was calculated (index price, table row, rate, miles, total)
- **Alert on index change:** Notify when the weekly DOE index is published (every Monday)

### Data Sources

| Entity/API | What It Provides |
|---|---|
| DOE EIA API (Integration Hub) | Weekly diesel fuel price index |
| `Contract` (Contracts) | Customer-specific fuel surcharge table reference |
| `Load` (TMS Core) | Load miles, equipment type |
| `AccessorialCharge` (Sales) | Fuel surcharge line item |
| `Invoice` (Accounting) | Invoice line item for surcharge |
| `FuelSurchargeTable` (new config entity) | Price-to-rate mapping tables |
| `Scheduler` (Scheduler) | Weekly auto-fetch of DOE index |

### Stitch Prompt

> Build a Fuel Surcharge Calculator screen. Top section: "Current DOE Index" card showing this week's price and change from last week (green/red arrow). Below: calculator form with inputs for Miles, Equipment Type dropdown, and Fuel Surcharge Table dropdown. Output shows Per-Mile Surcharge Rate and Total Surcharge Amount. Below calculator: historical DOE diesel price line chart (52 weeks). Right sidebar: Fuel Surcharge Table editor showing price ranges and corresponding per-mile rates in an editable grid. Bottom: "Apply to Open Loads" batch action button. Design system: Inter 14px, Blue-600, Recharts, dark mode.

---

## Summary Table

| # | Screen Name | Service | Type | Priority | Primary Persona |
|---|---|---|---|---|---|
| 363 | Exception Dashboard | TMS Core | dashboard | **MUST-HAVE** | Dispatcher |
| 364 | Facility Database | TMS Core | list + detail | **MUST-HAVE** | Dispatcher |
| 365 | Lane Performance Analytics | Analytics | report | **MUST-HAVE** | Sales Rep |
| 366 | Detention Tracker | TMS Core | dashboard | **MUST-HAVE** | Dispatcher |
| 367 | Rate Negotiation Workspace | Sales | tool | **MUST-HAVE** | Dispatcher |
| 368 | Customer Shipping Patterns | Analytics | report | NICE-TO-HAVE | Sales Rep |
| 369 | Carrier Capacity Calendar | Carrier | calendar | **MUST-HAVE** | Dispatcher |
| 370 | Daily Dispatch Summary | Analytics | report | NICE-TO-HAVE | Operations Manager |
| 371 | P&L by Lane | Analytics | report | **MUST-HAVE** | VP of Operations |
| 372 | Quick Pay Approval Queue | Factoring Internal | list | NICE-TO-HAVE | Accounting |
| 373 | Load Consolidation Tool | TMS Core | tool | NICE-TO-HAVE | Dispatcher |
| 374 | Driver Communication Hub | Communication | dashboard | **MUST-HAVE** | Dispatcher |
| 375 | Carrier Rate History | Carrier | report | NICE-TO-HAVE | Dispatcher |
| 376 | Revenue Forecast Dashboard | Analytics | dashboard | NICE-TO-HAVE | VP of Sales |
| 377 | Compliance Expiration Calendar | Carrier | calendar | **MUST-HAVE** | Compliance Manager |
| 378 | Load Template Library | TMS Core | list | **MUST-HAVE** | Dispatcher |
| 379 | Fuel Surcharge Calculator | Sales | tool | NICE-TO-HAVE | Sales Rep |

### Priority Breakdown

- **MUST-HAVE: 10 screens** -- These address daily operational pain points and directly impact revenue, safety, or efficiency.
- **NICE-TO-HAVE: 7 screens** -- These provide strategic value, reporting improvements, or efficiency gains but do not block daily operations.

### Implementation Phases (Recommended)

**Phase 1 (Build First):** Exception Dashboard (363), Facility Database (364), Detention Tracker (366), Driver Communication Hub (374), Load Template Library (378)
- *Rationale:* These are the screens dispatchers will use every hour. They solve the most acute daily pain.

**Phase 2:** Rate Negotiation Workspace (367), Carrier Capacity Calendar (369), Compliance Expiration Calendar (377)
- *Rationale:* These transform core dispatch and compliance workflows. They require more complex data integration.

**Phase 3:** Lane Performance Analytics (365), P&L by Lane (371), Quick Pay Approval Queue (372)
- *Rationale:* Analytics and financial screens that require historical data to be valuable. Build after core data is flowing.

**Phase 4:** Customer Shipping Patterns (368), Daily Dispatch Summary (370), Carrier Rate History (375), Revenue Forecast Dashboard (376), Load Consolidation Tool (373), Fuel Surcharge Calculator (379)
- *Rationale:* Strategic and advanced features that differentiate Ultra TMS from competitors. Build when the foundation is solid.

---

### New Entity Requirements

These proposed screens require one new entity not currently in the data model:

| Entity | Service | Fields | Purpose |
|---|---|---|---|
| `Facility` | TMS Core | name, address, lat/lng, type, operating_hours, dock_count, dock_type, requirements (JSON), avg_dwell_time, contacts, notes, ratings | Central facility catalog, auto-populated from historical stops |
| `FuelSurchargeTable` | Sales / Config | name, effective_date, rows (price_range, surcharge_rate), equipment_type, customer_contract_id | Fuel surcharge calculation lookup tables |
| `LoadTemplate` | TMS Core | name, customer_id, origin_facility_id, destination_facility_id, equipment_type, weight, commodity, special_instructions, customer_rate, target_carrier_rate, preferred_carrier_ids, usage_count, last_used_at | Reusable shipment templates |
| `CarrierAvailability` | Carrier | carrier_id, date, available_trucks, equipment_type, region, source (self-reported vs inferred) | Carrier capacity self-reporting |

---

*This document should be reviewed alongside the [Screen Catalog (47)](../../03-design/47-screen-catalog.md) and [Services Overview (07)](../../02-services/07-services-overview.md) to ensure no overlap with existing screens.*

*Last Updated: February 2026*

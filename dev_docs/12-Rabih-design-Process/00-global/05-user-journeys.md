# User Journeys - Daily Workflows by Persona

> Maps the daily workflow of each persona across Ultra TMS screens. Shows which screens they visit, in what order, and what actions they perform. Critical reference for understanding cross-screen navigation flows and designing seamless transitions between views.

**Personas Covered:** 6 | **Total Screens Referenced:** 362 across 38 services | **Cross-Screen Flows:** 5 critical paths

---

## Table of Contents

1. [Maria Rodriguez - Dispatcher](#1-maria-rodriguez---dispatcher-daily-workflow)
2. [James Wilson - Sales Agent](#2-james-wilson---sales-agent-daily-workflow)
3. [Sarah Chen - Operations Manager](#3-sarah-chen---operations-manager-daily-workflow)
4. [Carlos Martinez - Owner-Operator Driver](#4-carlos-martinez---owner-operator-driver-daily-workflow)
5. [Emily Foster - AR Specialist](#5-emily-foster---ar-specialist-daily-workflow)
6. [Mike Thompson - Customer/Shipper](#6-mike-thompson---customership-daily-workflow)
7. [Critical Cross-Screen Flows](#7-critical-cross-screen-flows)
8. [Persona Interaction Map](#8-persona-interaction-map)

---

## 1. Maria Rodriguez - Dispatcher Daily Workflow

**Profile:** 35 years old | 8 years experience | 50+ loads/day | Chicago, IL
**Pain Points:** Manual tracking, 20+ check calls/day, status updates across systems
**Goal:** Handle 60+ loads/day with 80% check call elimination
**Primary Navigation:** Dispatch sidebar (Dispatch Board, Orders, Loads, Tracking Map, Check Calls, Appointments)

---

### Morning Routine (6:00 - 8:00 AM)

**1. Login and Overnight Alert Review**
- Screen: **Login** | Route: `/login` | Action: Enter credentials, complete MFA verification. Maria has her browser saved to auto-navigate here.
- Screen: **Notification Center** | Route: `/notifications` | Action: Review overnight tracking alerts -- late arrivals, GPS drops, driver SOS flags. *Emotional state: Anxious -- wondering what went wrong overnight.*
- Screen: **Operations Dashboard** | Route: `/dashboard/operations` | Action: Scan the 4 KPI cards at the top -- Active Loads, Loads At Risk, On-Time %, and Unassigned Loads. Immediately identifies the number in the "At Risk" card. Clicks into it to see the filtered list.

**2. Review Today's Pickups**
- Screen: **Loads List** | Route: `/loads` | Action: Filter by `Status = Picking Up Today` and `Assigned To = Maria`. Sorts by earliest pickup appointment. Scans for any loads missing carrier assignments (shown as red "Unassigned" badges). *Emotional state: Focused -- building her mental map of the day.*
- Screen: **Dispatch Board** | Route: `/dispatch-board` | Action: Switches to the visual Kanban view. Checks the "Picking Up Today" lane count versus yesterday's handoff notes. Drags any loads from "Ready to Dispatch" into "Carrier Assigned" if overnight assignments came through from the night team.

**3. Morning Check-In on Active Loads**
- Screen: **Tracking Map** | Route: `/tracking-map` | Action: Opens the real-time map view to see GPS positions of all active loads. Clicks on any truck icons that appear to be stopped or off-route. Each click opens a load detail popover with ETA, last check-in time, and driver phone number. *Emotional state: Relieved if GPS shows trucks moving. Frustrated if seeing "Last Update: 6 hours ago" on any load.*
- Screen: **Check Calls** | Route: `/check-calls` | Action: Reviews any automated check-in data received overnight. For loads where GPS has dropped, creates a manual check call entry by clicking "+ New Check Call" and calling the driver. Logs the driver's status, ETA, and any issues.

**4. Carrier Assignments for Afternoon Pickups**
- Screen: **Orders List** | Route: `/orders` | Action: Filters for `Status = Needs Carrier` and `Pickup Date = Today (PM)`. These are orders from the sales team that need carriers assigned. Opens each order to review requirements.
- Screen: **Order Detail** | Route: `/orders/[id]` | Action: Reviews commodity, weight, pickup/delivery locations, and special requirements. Clicks "Build Load" button.
- Screen: **Load Builder** | Route: `/loads/new` | Action: The order info auto-populates. Adds stop details, sets appointment times, selects equipment type. Clicks "Save & Find Carrier."
- Screen: **Carriers List** | Route: `/carriers` | Action: Searches carriers by lane, equipment type, and availability. Uses the "Preferred Carriers" filter to see carriers with good scorecards on this lane. *Emotional state: Efficient when the system surfaces the right carrier in under 30 seconds. Frustrated when no carriers match and she has to go to the load board.*

---

### Core Work (8:00 AM - 4:00 PM)

**5. Carrier Search and Assignment (Repeated 15-20x daily)**
- Screen: **Carriers List** | Route: `/carriers` | Action: Searches by origin/destination lane. Filters by equipment type, scorecard rating, insurance status.
- Screen: **Carrier Detail** | Route: `/carriers/[id]` | Action: Reviews carrier profile -- insurance expiry, CSA scores, on-time percentage, preferred lanes, driver contacts. Checks the "Scorecard" tab for performance history. *Emotional state: Confident when the scorecard shows 95%+ on-time. Wary when she sees claims history.*
- Screen: **Carrier Scorecard** | Route: `/carriers/[id]/scorecard` | Action: Deep-dives into the carrier's performance metrics -- on-time pickup %, on-time delivery %, claims ratio, average detention time.
- Screen: **FMCSA Lookup** | Route: `/carriers/fmcsa-lookup` | Action: For new carriers, verifies authority status, insurance, and safety rating directly from FMCSA data. *Emotional state: Cautious -- one bad carrier can ruin her day.*
- Screen: **Dispatch Board** | Route: `/dispatch-board` | Action: Drags the load card from "Unassigned" to "Carrier Assigned." The system auto-generates a rate confirmation.

**6. Load Board Posting (For Hard-to-Cover Loads)**
- Screen: **Post Load** | Route: `/load-board/post` | Action: Posts loads that couldn't be covered by preferred carriers. Enters rate, pickup/delivery details, and equipment requirements. Selects external boards (DAT, Truckstop) to post to. *Emotional state: Slightly anxious -- posting means her preferred carriers couldn't cover it.*
- Screen: **Capacity Search** | Route: `/load-board/capacity-search` | Action: Searches external load boards for available trucks in the origin market. Reviews carrier bids as they come in.
- Screen: **Bid Management** | Route: `/load-board/bids` | Action: Reviews incoming bids from carriers. Compares rate to target margin. Accepts or counters.

**7. Handling Exceptions (3-5x daily)**
- Screen: **Notification Center** | Route: `/notifications` | Action: Receives real-time alert -- "Load #L-2025-04521: Driver reports 2-hour detention at shipper." Clicks the notification to jump to the load.
- Screen: **Load Detail** | Route: `/loads/[id]` | Action: Reviews the full load timeline. Sees the driver's status update with timestamp and location. Clicks the "Stops" tab to see appointment vs. actual times.
- Screen: **Communication Hub** | Route: `/communications` | Action: Sends an SMS to the driver via the quick-send panel: "Confirmed detention, logging extra charge." Also sends an email to the customer contact about the delay. *Emotional state: Stressed during exceptions. Relieved when she can resolve them in 2-3 screens instead of 5 phone calls.*
- Screen: **Load Detail** (Stops Tab) | Route: `/loads/[id]#stops` | Action: Updates the stop status, adds detention time, and flags for accessorial billing.

**8. Afternoon Check Calls and Status Updates (3:00 - 4:00 PM)**
- Screen: **Check Calls** | Route: `/check-calls` | Action: Filters for loads where last check-in was 4+ hours ago. For loads with active GPS, reviews automated location data and skips the call. For loads without GPS, initiates manual check calls. *Emotional state: This is the part of the day she most wants the system to automate. Every skipped call is a small victory.*
- Screen: **Tracking Map** | Route: `/tracking-map` | Action: Switches to the map view one more time. Clicks on each active load to verify ETA accuracy. Flags any loads where ETA has slipped past the delivery window.
- Screen: **Status Updates** | Route: `/loads/[id]/status` | Action: Bulk-updates load statuses based on check call results. Uses quick-action buttons: "In Transit," "At Shipper," "At Receiver," "Delivered."

---

### End of Day (4:00 - 5:00 PM)

**9. Customer Status Updates**
- Screen: **Communication Hub** | Route: `/communications` | Action: Reviews auto-generated customer status emails that went out during the day. Manually sends updates for any loads with exceptions or delays. Uses the email template "Daily Status Update" to batch-notify customers.
- Screen: **Loads List** | Route: `/loads` | Action: Filters by `Status = Delivered Today`. Verifies that all delivered loads have POD documents attached. Flags any loads missing PODs and sends a reminder to the carrier via the Carrier Portal.

**10. Handoff to Night Team**
- Screen: **Dispatch Board** | Route: `/dispatch-board` | Action: Reviews all active loads one final time. Adds notes to any loads requiring night-team attention using the notes panel on each load card. *Emotional state: Satisfied if the board is clean and all loads are on track. Anxious if there are unresolved exceptions.*
- Screen: **Notification Center** | Route: `/notifications` | Action: Sets up overnight alert rules -- notify her mobile if any load goes "At Risk" status between 6 PM and 6 AM.

---

### Occasional Tasks (Weekly/Monthly)

**11. Carrier Onboarding (2-3x per week)**
- Screen: **Carrier Onboarding** | Route: `/carriers/onboard` | Action: Walks through the onboarding wizard for new carriers -- company info, MC/DOT number, insurance certificates, W-9, carrier agreement. The wizard auto-pulls FMCSA data and validates insurance.
- Screen: **Compliance Center** | Route: `/carriers/compliance` | Action: Reviews pending carrier approvals. Checks that all required documents are uploaded and insurance meets minimums.
- Screen: **Document Upload** | Route: `/documents/upload` | Action: Uploads any documents received via email (insurance certificates, carrier agreements).

**12. Weekly Performance Review (Friday)**
- Screen: **Carrier Scorecard** | Route: `/carriers/[id]/scorecard` | Action: Reviews scorecards for carriers used that week. Flags any carriers with declining performance for removal from the preferred list.
- Screen: **Operations Dashboard** | Route: `/dashboard/operations` | Action: Reviews her weekly KPIs -- loads dispatched, on-time %, check calls made vs. automated, average time to assign carrier.

---

## 2. James Wilson - Sales Agent Daily Workflow

**Profile:** 42 years old | 15 years experience | $2M annual revenue | Dallas, TX
**Pain Points:** 30+ min quote delays, outdated rates, CRM sync issues
**Goal:** Quote turnaround 30 min to 5 min, win rate 25% to 35%
**Primary Navigation:** Sales sidebar (Sales Dashboard, My Leads, My Accounts, Contacts, Opportunities, Activities, Create Quote, My Quotes, Rate Lookup)

---

### Morning Routine (7:00 - 8:00 AM)

**1. Dashboard Review and Pipeline Check**
- Screen: **Sales Dashboard** | Route: `/dashboard/sales` | Action: Reviews the top-line KPI cards -- Quotes Pending, Quotes Won This Week, Pipeline Value, and Win Rate. Checks the "Quotes Expiring Today" widget to see if any quotes need follow-up before they expire. *Emotional state: Energized if pipeline is strong. Anxious if win rate is trending down.*
- Screen: **Notification Center** | Route: `/notifications` | Action: Reviews overnight notifications -- new quote requests from the customer portal, quote acceptance confirmations, lead assignment notifications from the ops manager.

**2. Review Overnight Quote Requests**
- Screen: **Quotes List** | Route: `/quotes` | Action: Filters by `Status = New Request` and `Assigned To = James`. Sorts by timestamp to prioritize. Each row shows customer name, origin/destination, requested date, and urgency flag.
- Screen: **Quote Detail** | Route: `/quotes/[id]` | Action: Opens the first pending quote request. Reviews customer's shipping requirements -- commodity, weight, origin, destination, frequency, special handling. *Emotional state: Competitive -- knows speed to quote wins deals. Every minute counts.*

---

### Core Work (8:00 AM - 4:00 PM)

**3. Morning Customer Calls (8:00 - 10:00 AM)**
- Screen: **Activities Calendar** | Route: `/activities/calendar` | Action: Reviews today's scheduled calls and meetings. Each activity card shows customer name, contact info, and purpose (follow-up, intro call, rate negotiation).
- Screen: **Company Detail** | Route: `/companies/[id]` | Action: Before each call, pulls up the customer's 360-degree view -- recent shipments, open quotes, AR status, communication history. Clicks the "Activities" tab to see past interactions. *Emotional state: Prepared -- doesn't want to go into a call without context.*
- Screen: **Contact Detail** | Route: `/contacts/[id]` | Action: Reviews the specific contact's preferences, role, and past notes. Clicks "Log Activity" after the call to record outcome.
- Screen: **Activities Calendar** | Route: `/activities` | Action: Logs the call outcome -- "Spoke with Mike at Acme. Needs quote for 20 loads/week CHI-ATL. Sending quote by EOD." Schedules a follow-up activity for 2 days out.

**4. Quote Building (Repeated 8-15x daily)**
- Screen: **Quote Builder** | Route: `/quotes/new` | Action: Creates a new quote. Selects the customer from a dropdown (auto-linked to the CRM company record). Enters origin, destination, commodity, weight, equipment type, and frequency.
- Screen: **Rate Lookup** (Inline Panel) | Route: `/rates/lookup` | Action: The quote builder includes an inline rate panel that pulls current market rates from DAT/Truckstop. Shows the range (low, average, high) for the lane. James uses this to set a competitive yet profitable rate. *Emotional state: Confident when market data is fresh (updated within 24 hours). Frustrated when rates seem stale or unavailable for the lane.*
- Screen: **Lane Pricing** | Route: `/rates/lanes` | Action: For contracted lanes, checks if the customer has an existing rate agreement. If so, the contract rate auto-fills in the quote builder.
- Screen: **Quote Builder** | Route: `/quotes/new` | Action: Adds accessorial charges (fuel surcharge, liftgate, lumper), sets the quote expiration date (typically 7 days), adds notes for the customer. Clicks "Preview" to see the formatted quote.
- Screen: **Quote Detail** | Route: `/quotes/[id]` | Action: Reviews the generated quote. Clicks "Send to Customer" which generates a branded PDF and sends it via email. The quote status changes from "Draft" to "Sent." *Emotional state: Satisfied -- went from request to sent quote in under 5 minutes. This used to take 30+ minutes.*

**5. Lead Management and Prospecting (1:00 - 3:00 PM)**
- Screen: **Leads List** | Route: `/leads` | Action: Filters by `Status = New` and `Assigned To = James`. Reviews new leads that came in from marketing, referrals, or the website. Prioritizes by estimated annual revenue.
- Screen: **Lead Detail** | Route: `/leads/[id]` | Action: Reviews lead information -- company name, contact, estimated volume, lanes of interest. Clicks "Convert to Opportunity" if qualified after initial research.
- Screen: **Opportunities List** | Route: `/opportunities` | Action: Reviews the visual pipeline (Kanban board with stages: Prospecting, Qualification, Proposal, Negotiation, Closed Won, Closed Lost). Drags opportunities between stages as they progress. *Emotional state: Driven -- the pipeline is his lifeblood. A full pipeline means hitting commission targets.*
- Screen: **Opportunity Detail** | Route: `/opportunities/[id]` | Action: Updates the opportunity stage, adds notes from customer conversations, attaches the quote. Sets the expected close date and estimated annual revenue.

**6. Follow Up on Pending Quotes (3:00 - 4:00 PM)**
- Screen: **Quotes List** | Route: `/quotes` | Action: Filters by `Status = Sent` and sorts by `Sent Date` (oldest first). Identifies quotes that have been pending for 3+ days without response.
- Screen: **Quote Detail** | Route: `/quotes/[id]` | Action: Reviews the quote details. Clicks "Clone & Revise" if the customer requested changes. Clicks "Mark Lost" with a reason code if the deal fell through (too expensive, went with competitor, timing, etc.).
- Screen: **Communication Hub** | Route: `/communications` | Action: Sends follow-up emails using the "Quote Follow-Up" template. Personalizes the email with specific notes about the customer's needs.

---

### End of Day (4:00 - 5:00 PM)

**7. Performance Review and CRM Cleanup**
- Screen: **Commission Dashboard** | Route: `/commissions` | Action: Checks current month's commission accruals. Reviews the breakdown by customer -- which accounts are generating the most commission. *Emotional state: Motivated if commission is tracking ahead of target. Stressed if behind.*
- Screen: **Sales Reports** | Route: `/reports/sales` | Action: Pulls up the Win/Loss Analysis report to see this week's quote conversion rate and average margin by lane.
- Screen: **Activities Calendar** | Route: `/activities/calendar` | Action: Schedules tomorrow's calls and follow-ups. Ensures no customer communication falls through the cracks.
- Screen: **Companies List** | Route: `/companies` | Action: Quick scan of his key accounts. Updates any company records with new information gathered during the day. *Emotional state: Organized -- ending the day with a clean CRM and tomorrow planned out.*

---

### Occasional Tasks (Weekly/Monthly)

**8. RFP Response (Weekly)**
- Screen: **Proposal Templates** | Route: `/quotes/templates` | Action: Selects the appropriate proposal template for a formal RFP response. Customizes it with lane-specific rates and service commitments.
- Screen: **Rate Tables** | Route: `/rates/tables` | Action: Reviews current rate tables by customer and lane to ensure pricing consistency across the RFP.

**9. Account Review (Monthly)**
- Screen: **Company Detail** | Route: `/companies/[id]` | Action: Reviews the full customer profile -- YTD revenue, margin trends, shipment volume, service issues. Prepares for monthly account review calls.
- Screen: **Sales Reports** | Route: `/reports/sales` | Action: Generates a customer-specific report showing shipment volume, on-time performance, and cost trends.

---

## 3. Sarah Chen - Operations Manager Daily Workflow

**Profile:** 38 years old | 12 years experience | Team of 12 | Los Angeles, CA
**Pain Points:** 4-hour Friday Excel reports, 5 system silos, compliance risk
**Goal:** Reports 4 hrs to 5 min, on-time delivery 92% to 96%
**Primary Navigation:** Operations Manager sidebar (Operations Dashboard, Team Performance, Analytics Home, Orders, Loads, Dispatch Board, Tracking Map, Check Calls, Claims, Carrier List, Compliance Center, Scorecards, Safety Center)

---

### Morning Routine (7:00 - 8:00 AM)

**1. Executive Dashboard Review**
- Screen: **Operations Dashboard** | Route: `/dashboard/operations` | Action: First screen of the day. Reviews the 6 KPI cards -- Total Active Loads, On-Time %, Loads At Risk, Avg. Margin, Team Utilization, and Unassigned Loads. Scans the "Trending" arrows on each card to see if metrics are improving or declining week-over-week. *Emotional state: Sets the tone for the entire day. Green arrows = confident. Red arrows = immediate deep-dive.*
- Screen: **Analytics Home** | Route: `/analytics` | Action: Opens the analytics dashboard for a deeper look. Reviews the "Load Volume Trend" chart (last 30 days), "Margin by Lane" heatmap, and "Team Performance Leaderboard" showing each dispatcher's load count and on-time %.

**2. Overnight Exceptions Review**
- Screen: **Notification Center** | Route: `/notifications` | Action: Reviews all overnight alerts. Categorizes them mentally: service failures (missed deliveries), compliance issues (expired insurance), and financial alerts (credit hold triggers). Clicks the most critical ones first.
- Screen: **Loads List** | Route: `/loads` | Action: Filters by `Status = Exception`. These are loads flagged by the system or by dispatchers for management attention. Opens each one to understand the issue. *Emotional state: Concerned but proactive -- she wants to resolve issues before the 8 AM team huddle.*
- Screen: **Claims Dashboard** | Route: `/claims` | Action: Quick check for any new claims filed overnight. Reviews the claims pipeline -- New, Under Investigation, Pending Resolution, Closed. Clicks into any new claims to assign an investigator.

---

### Core Work (8:00 AM - 4:00 PM)

**3. Morning Team Huddle (8:00 - 8:30 AM)**
- Screen: **Operations Dashboard** | Route: `/dashboard/operations` | Action: Shares the dashboard on the conference room screen. Walks the team through today's priorities -- total loads to move, known issues, carrier shortages by lane.
- Screen: **Dispatch Board** | Route: `/dispatch-board` | Action: Shows the board to the team. Highlights the "Unassigned" lane and distributes workload among dispatchers. Identifies any loads requiring special attention (high-value, new customer, tight timeline).

**4. Customer Escalation Handling (9:00 - 10:00 AM)**
- Screen: **Company Detail** | Route: `/companies/[id]` | Action: Pulls up the customer account before an escalation call. Reviews the customer's recent shipment history, open issues, and current AR status. *Emotional state: Diplomatic -- needs full context to de-escalate.*
- Screen: **Load Detail** | Route: `/loads/[id]` | Action: Reviews the specific load that caused the escalation. Checks the full timeline -- every status update, check call, and exception. Uses this to explain exactly what happened.
- Screen: **Load Timeline** | Route: `/loads/[id]/timeline` | Action: Shows the visual timeline of the load's journey -- from order creation through each stop to current status. Screenshots this for the customer if needed.
- Screen: **Communication Hub** | Route: `/communications` | Action: Sends a formal response email to the customer with the root cause analysis and corrective action plan. Uses the "Customer Escalation Response" template.

**5. P&L and Margin Review (10:00 - 11:00 AM)**
- Screen: **Financial Dashboard** | Route: `/dashboard/financial` | Action: Reviews the financial dashboard -- MTD Revenue, MTD Margin, Revenue vs. Budget chart, and Top/Bottom 5 Lanes by Margin. Drills into any lane showing below-target margins.
- Screen: **Financial Reports** | Route: `/reports/financial` | Action: Generates the "P&L by Customer" report. Sorts by margin percentage to identify customers where the company is losing money. Flags these for rate renegotiation with the sales team.

**6. Carrier Compliance Review (11:00 AM - 12:00 PM)**
- Screen: **Compliance Center** | Route: `/carriers/compliance` | Action: Reviews the compliance dashboard -- Carriers with Expiring Insurance (next 30 days), Carriers with Missing Documents, and Carriers on Watchlist. *Emotional state: Vigilant -- one compliance failure can mean a lawsuit.*
- Screen: **Insurance Tracking** | Route: `/carriers/insurance` | Action: Filters for carriers with insurance expiring in the next 14 days. Sends automated renewal reminders via the "Send Reminder" bulk action.
- Screen: **Safety Center** | Route: `/carriers/safety` | Action: Reviews CSA scores for active carriers. Flags any carriers whose scores have worsened significantly since onboarding.
- Screen: **Carrier Scorecard** | Route: `/carriers/[id]/scorecard` | Action: Reviews individual carrier scorecards for the top 20 carriers by volume. Updates the preferred carrier list based on performance trends.

**7. Process Improvement (2:00 - 3:00 PM)**
- Screen: **Report Builder** | Route: `/reports/builder` | Action: Builds custom reports to analyze specific operational questions -- "What is the average pickup-to-delivery time by lane?", "Which dispatchers have the lowest re-assignment rate?" *Emotional state: Analytical and curious -- this is the work she finds most valuable.*
- Screen: **Workflow Designer** | Route: `/workflows/designer` | Action: Reviews and tweaks automated workflows -- such as the rule that auto-escalates loads when ETA slips past 2 hours of the delivery window.

**8. Team 1:1s and Coaching (3:00 - 4:00 PM)**
- Screen: **User Management** | Route: `/admin/users` | Action: Reviews each team member's profile before their 1:1.
- Screen: **Analytics Home** | Route: `/analytics` | Action: Pulls up dispatcher-specific performance data -- loads handled per day, average time to assign carrier, on-time %, and exception rate. Uses this data to have fact-based coaching conversations. *Emotional state: Supportive but data-driven -- wants the team to grow.*

---

### End of Day (4:00 - 5:00 PM)

**9. EOD Reports and Leadership Communication**
- Screen: **Report Library** | Route: `/reports` | Action: Runs the daily operations summary report. This auto-generates with today's load volume, on-time %, revenue, margin, and top exceptions. *Emotional state: Relieved -- this used to take 4 hours on Fridays. Now it takes 5 minutes any day of the week.*
- Screen: **Scheduled Reports** | Route: `/reports/scheduled` | Action: Verifies that the weekly leadership report is configured to auto-send Friday at 5 PM. Reviews the report preview.
- Screen: **Operations Dashboard** | Route: `/dashboard/operations` | Action: Final check of the day's KPIs. Compares to morning snapshot to see if metrics improved or declined during the day.

---

### Occasional Tasks (Weekly/Monthly)

**10. Weekly Team Performance Review (Friday)**
- Screen: **Analytics Home** | Route: `/analytics` | Action: Runs the full weekly team performance report. Reviews each dispatcher's metrics side-by-side.
- Screen: **Carrier Scorecard** | Route: `/carriers/[id]/scorecard` | Action: Quarterly carrier review -- top 50 carriers scored and ranked. Decisions made to add/remove from preferred list.

**11. Monthly Compliance Audit**
- Screen: **Compliance Center** | Route: `/carriers/compliance` | Action: Full compliance audit -- all active carriers checked for insurance, authority, and safety compliance.
- Screen: **Audit Log** | Route: `/admin/audit-logs` | Action: Reviews system audit log for any unusual activity or unauthorized changes.

---

## 4. Carlos Martinez - Owner-Operator Driver Daily Workflow

**Profile:** 45 years old | 15 years driving | Spanish primary language | On the road
**Pain Points:** 30+ day payment delays, English-only apps, paper PODs
**Goal:** POD same-day processing, payment 30 to 2 days, 4+ star app rating
**Primary Navigation:** Driver Mobile App bottom tabs (Home, Loads, POD, Chat, Profile) + Carrier Portal web

---

### Morning Routine (5:00 - 6:00 AM)

**1. Pre-Trip and Load Review**
- Screen: **Driver App - Home** (Mobile) | Route: `/app/home` | Action: Opens the app (set to Spanish language). The home screen shows his current load card with next stop, ETA, and pickup appointment time. Reviews the load details -- address, contact name, reference numbers. *Emotional state: Ready to work. Appreciates that the app is in Spanish and shows everything he needs without scrolling.*
- Screen: **Driver App - My Loads** (Mobile) | Route: `/app/loads` | Action: Taps "My Loads" to see today's load and any upcoming loads for tomorrow. Taps into the current load to see full details -- commodity, weight, special instructions, and shipper contact phone number.
- Screen: **Driver App - Documents** (Mobile) | Route: `/app/documents` | Action: Downloads the rate confirmation and BOL for today's load. Saves them to his phone for offline access in case of poor signal. *Emotional state: Prepared -- having documents on his phone eliminates the old paper shuffle.*

---

### Core Work (6:00 AM - 7:00 PM)

**2. Arrive at Shipper**
- Screen: **Driver App - Status Update** (Mobile) | Route: `/app/status` | Action: Taps the large "Update Status" button. Selects "Arrived at Shipper" from the visual status picker (icons with Spanish labels). The app auto-captures his GPS location and timestamp. The system sends an automatic notification to the dispatcher (Maria) and the customer. *Emotional state: Efficient -- one tap replaces a phone call.*

**3. Loading and Departure**
- Screen: **Driver App - Status Update** (Mobile) | Route: `/app/status` | Action: After loading, taps "Loading Complete." Then taps "In Transit" when departing. Each status update includes GPS stamp and timestamp.
- Screen: **Driver App - Navigation** (Mobile) | Route: `/app/navigate` | Action: Taps the "Navigate" button which opens truck-specific routing (considers truck height, weight restrictions, hazmat routes). Shows ETA to next stop. *Emotional state: Confident -- truck-specific routing prevents him from ending up on a restricted road like consumer GPS apps sometimes do.*

**4. In-Transit Updates (Automated)**
- The app runs GPS tracking in the background, automatically sending location updates every 15 minutes. No action required from Carlos. The system auto-generates "virtual check calls" that the dispatcher can see on the Tracking Map. *Emotional state: Relieved -- no more 3 PM check-in calls interrupting his drive.*

**5. Mid-Day Communication**
- Screen: **Driver App - Messages** (Mobile) | Route: `/app/chat` | Action: Receives a message from the dispatcher about a delivery time change. Reads it in Spanish (auto-translated). Taps a quick-reply button: "OK, understood" (pre-translated). Can also type a free-form message in Spanish. *Emotional state: Connected -- he can communicate in his language without waiting on hold.*

**6. Arrive at Receiver and Delivery**
- Screen: **Driver App - Status Update** (Mobile) | Route: `/app/status` | Action: Taps "Arrived at Receiver." Waits for unloading. After unloading, taps "Delivery Complete."
- Screen: **Driver App - POD Capture** (Mobile) | Route: `/app/pod` | Action: This is the critical moment. Taps "Capture POD." The camera opens. Takes a photo of the signed BOL/POD document. The app auto-crops and enhances the image. He can also capture the receiver's signature directly on the phone screen. Taps "Submit POD." The document is instantly uploaded and attached to the load. *Emotional state: Satisfied -- no more faxing from truck stops. The POD is submitted before he even pulls away from the dock. This is the feature that changed his life.*

**7. Find Next Load**
- Screen: **Carrier Portal - Available Loads** (Web/Mobile) | Route: `/carrier-portal/available-loads` | Action: While parked after delivery, opens the carrier portal. Browses available loads near his current location. Filters by destination preference and minimum rate. *Emotional state: Hopeful -- finding a load quickly means less deadhead and more money.*
- Screen: **Carrier Portal - Load Detail** | Route: `/carrier-portal/loads/[id]` | Action: Reviews a promising load. Checks the rate, miles, pickup time, and delivery deadline. Taps "Accept Load" to claim it.
- Screen: **Carrier Portal - Accept Load** | Route: `/carrier-portal/loads/[id]/accept` | Action: Confirms acceptance. The rate confirmation auto-generates and appears in his Documents section.

---

### End of Day (7:00 - 9:00 PM)

**8. Payment and Quick Pay**
- Screen: **Carrier Portal - My Payments** | Route: `/carrier-portal/payments` | Action: Checks payment status for recently delivered loads. Sees which loads have been invoiced by the broker and when payment is expected. *Emotional state: Anxious about payments -- this is his livelihood.*
- Screen: **Carrier Portal - Request Quick Pay** | Route: `/carrier-portal/payments/quick-pay` | Action: For today's delivered load, taps "Request Quick Pay." The system shows the quick pay fee (2% deduction) and the payout amount. Taps "Confirm." Payment will hit his account in 24-48 hours instead of 30 days. *Emotional state: Relieved -- quick pay means he can fuel up tomorrow without worrying about cash flow.*

**9. Profile and Compliance**
- Screen: **Carrier Portal - My Documents** | Route: `/carrier-portal/documents` | Action: Receives a notification that his insurance certificate expires in 30 days. Taps "Update Documents" to upload the renewal when his insurance company sends it. *Emotional state: Slightly annoyed by paperwork but appreciates the reminder rather than getting suspended mid-load.*
- Screen: **Driver App - Settings** (Mobile) | Route: `/app/settings` | Action: Reviews notification preferences. Keeps push notifications on for new loads and payment confirmations. Verifies language is set to Spanish.

---

### Occasional Tasks (Weekly/Monthly)

**10. Equipment Updates (Monthly)**
- Screen: **Carrier Portal - My Profile** | Route: `/carrier-portal/profile` | Action: Updates equipment information -- truck and trailer details, year, capacity.
- Screen: **Carrier Portal - Update Insurance** | Route: `/carrier-portal/compliance/insurance` | Action: Uploads renewed insurance certificates when they come in.

---

## 5. Emily Foster - AR Specialist Daily Workflow

**Profile:** 28 years old | 6 years experience | $500K monthly AR | Remote (Houston area)
**Pain Points:** Manual invoicing, missing PODs, double entry TMS + QuickBooks
**Goal:** Invoice 2 days to same day, DSO 45 to 30 days
**Primary Navigation:** Accounting sidebar (Accounting Dashboard, Invoices, Create Invoice, Payments Received, AR Aging, Collections, Carrier Bills, QuickBooks Sync)

---

### Morning Routine (8:00 - 9:00 AM)

**1. Dashboard and Cash Position Review**
- Screen: **Accounting Dashboard** | Route: `/dashboard/accounting` | Action: First screen of the day. Reviews the 4 KPI cards -- Total AR Outstanding, DSO (Days Sales Outstanding), Invoices Due This Week, and Overdue AR. Scans the AR Aging chart (current, 1-30, 31-60, 61-90, 90+). *Emotional state: Focused -- the DSO number is her north star. A decreasing DSO means she is doing her job well.*
- Screen: **AR Aging Report** | Route: `/reports/ar-aging` | Action: Runs the full AR aging report. Filters by "60+ Days" to identify the most critical overdue accounts. Makes a mental list of collection calls for the afternoon.

**2. Process Overnight Deliveries for Invoicing**
- Screen: **Loads List** | Route: `/loads` | Action: Filters by `Status = Delivered` and `Invoice Status = Not Invoiced`. This shows all loads delivered in the last 24 hours that need invoices generated. Sorts by customer to batch-invoice efficiently. *Emotional state: Eager -- same-day invoicing is her goal, and this filter makes it possible.*
- Screen: **Load Detail** | Route: `/loads/[id]` | Action: Opens each delivered load. Checks the "Documents" tab to verify the POD is attached. If the driver (Carlos) uploaded the POD via the mobile app, it is already attached. If not, she flags it for follow-up.
- Screen: **Document Viewer** | Route: `/documents/viewer` | Action: Opens and verifies each POD -- checks for legibility, signature, date, and reference numbers matching the BOL. *Emotional state: Frustrated when PODs are missing or illegible. Relieved when they are clean and auto-attached from the driver app.*

---

### Core Work (9:00 AM - 4:00 PM)

**3. Invoice Generation (9:00 - 11:00 AM)**
- Screen: **Invoice Entry** | Route: `/accounting/invoices/new` | Action: Creates invoices from delivered loads. The system auto-populates from the load data -- customer, origin, destination, rate, accessorial charges, reference numbers. Emily reviews and adjusts as needed (detention charges, lumper fees). *Emotional state: Efficient when the auto-populate works. Annoyed when she has to manually look up accessorial charges.*
- Screen: **Invoices List** | Route: `/accounting/invoices` | Action: After creating invoices, uses the bulk action "Send Selected" to email them to customers with the POD attached as a PDF. The system auto-generates the invoice PDF from the template.
- Screen: **Invoice Detail** | Route: `/accounting/invoices/[id]` | Action: For any invoice requiring special handling (split billing, multiple references, custom notes), opens the invoice detail and edits before sending.

**4. Follow Up on Missing PODs (10:00 - 11:00 AM)**
- Screen: **Loads List** | Route: `/loads` | Action: Filters by `Status = Delivered` and `POD Status = Missing`. These are loads that delivered but the driver or carrier has not uploaded the POD.
- Screen: **Communication Hub** | Route: `/communications` | Action: Sends batch reminders to carriers using the "Missing POD Reminder" template. The system includes the load number, delivery date, and a link to the carrier portal upload page. *Emotional state: Impatient -- every missing POD delays an invoice. This is the bottleneck she hates most.*

**5. Payment Application (11:00 AM - 12:00 PM)**
- Screen: **Payments Received** | Route: `/accounting/payments-received` | Action: Reviews incoming payments -- ACH transfers, checks, and wire payments. Each payment entry shows the customer, amount, and payment reference.
- Screen: **Payment Entry** | Route: `/accounting/payments/new` | Action: Applies each payment to the corresponding invoice(s). The system suggests matches based on amount and reference number. Emily confirms or manually allocates partial payments.
- Screen: **Invoice Detail** | Route: `/accounting/invoices/[id]` | Action: For each applied payment, the invoice status auto-updates from "Sent" to "Partially Paid" or "Paid." *Emotional state: Satisfying -- watching the AR balance decrease with each payment applied.*

**6. Collection Calls (1:00 - 3:00 PM)**
- Screen: **Collections Queue** | Route: `/accounting/collections` | Action: Opens the collections queue sorted by days overdue (worst first). Each row shows customer name, amount overdue, last contact date, and contact info.
- Screen: **Company Detail** | Route: `/companies/[id]` | Action: Before each call, reviews the customer's full payment history, credit limit, and current AR balance.
- Screen: **Collection Activity** | Route: `/accounting/collections/[id]/activity` | Action: After each call, logs the outcome -- "Spoke with AP dept, payment promised by Friday" or "Left voicemail, will follow up in 2 days." Schedules the next follow-up. *Emotional state: Persistent but professional. The detailed history helps her avoid repeating conversations.*
- Screen: **Credit Holds** | Route: `/accounting/credit/holds` | Action: For customers who are severely past due, places a credit hold which prevents new orders from being dispatched until payment is received.

**7. Dispute Resolution (3:00 - 4:00 PM)**
- Screen: **Invoices List** | Route: `/accounting/invoices` | Action: Filters by `Status = Disputed`. Reviews each disputed invoice.
- Screen: **Invoice Detail** | Route: `/accounting/invoices/[id]` | Action: Opens the disputed invoice. Reviews the customer's dispute reason in the notes section. Cross-references with the load detail, POD, and rate confirmation to determine if the dispute is valid.
- Screen: **Load Detail** | Route: `/loads/[id]` | Action: Pulls up the original load to verify rates, accessorial charges, and delivery details. Compares BOL reference numbers against the invoice.
- Screen: **Document Viewer** | Route: `/documents/viewer` | Action: Reviews supporting documents -- POD, BOL, rate confirmation, photos. Uses these to respond to the customer's dispute.
- Screen: **Communication Hub** | Route: `/communications` | Action: Sends a dispute resolution email with attached supporting documentation. *Emotional state: Methodical -- she wins disputes by having the documentation trail clean and accessible.*

---

### End of Day (4:00 - 5:00 PM)

**8. QuickBooks Sync and Reconciliation**
- Screen: **QuickBooks Sync** (Integration Hub) | Route: `/integrations/quickbooks` | Action: Reviews the QuickBooks sync status. Checks for any sync errors -- failed invoice pushes, customer mismatches, or payment discrepancies. Resolves any sync errors by re-mapping entities. *Emotional state: This is the feature that saved her from double-entry hell. When the sync works cleanly, she saves 2+ hours per day.*
- Screen: **GL Transactions** | Route: `/accounting/gl` | Action: Quick spot-check of today's GL entries to ensure invoices and payments are posting to the correct accounts.

**9. EOD AR Review**
- Screen: **AR Aging Report** | Route: `/reports/ar-aging` | Action: Runs the end-of-day AR aging report. Compares to the morning's report to see the day's net change. *Emotional state: Accomplished if AR decreased. Determined if it stayed flat or increased.*

---

### Occasional Tasks (Weekly/Monthly)

**10. Month-End Close (Monthly, 2-3 days)**
- Screen: **Bank Reconciliation** | Route: `/accounting/bank-reconciliation` | Action: Matches bank transactions to TMS payments. Identifies and resolves any discrepancies.
- Screen: **Financial Reports** | Route: `/reports/financial` | Action: Generates the month-end P&L, Balance Sheet, and AR Summary. Reviews for any anomalies before leadership review.
- Screen: **GL Transactions** | Route: `/accounting/gl` | Action: Reviews all GL entries for the month. Posts adjusting entries as needed.

**11. Payment Reminder Automation (Weekly)**
- Screen: **Auto-Message Rules** | Route: `/communications/auto-rules` | Action: Reviews and adjusts automated payment reminder rules -- sends email at 7 days before due, on due date, and at 7, 14, and 30 days past due.

---

## 6. Mike Thompson - Customer/Shipper Daily Workflow

**Profile:** 50 years old | Logistics Manager at manufacturer | 100 loads/month | Atlanta, GA
**Pain Points:** No real-time tracking, 4-hour quote waits, invoice hunting
**Goal:** Self-service tracking (no calls), quote response 4 hrs to 30 min
**Primary Navigation:** Customer Portal (Dashboard, My Shipments, Track Shipment, Request Quote, My Quotes, My Documents, My Invoices, Report Issue)

---

### Morning Routine (7:00 - 8:00 AM)

**1. Shipment Overview and Priority Checks**
- Screen: **Portal Dashboard** | Route: `/portal/dashboard` | Action: Logs into the customer portal. The dashboard shows 4 widgets -- Active Shipments (with status breakdown), Shipments Arriving Today, Recent Quotes, and Open Invoices. Mike scans the "Arriving Today" widget first to see if any deliveries need attention for his receiving team. *Emotional state: Appreciative -- he used to start every day with 3-4 phone calls to different brokers asking "where's my freight?" Now it is all on one screen.*
- Screen: **My Shipments** | Route: `/portal/shipments` | Action: Filters by `Status = In Transit`. Reviews the list of active shipments with their current status, ETA, and last update time. Color-coded status badges (green = on time, yellow = at risk, red = late) let him scan quickly.

**2. Track Priority Shipments**
- Screen: **Track Shipment** | Route: `/portal/track` | Action: Clicks into the map view for a high-priority shipment (raw materials needed for a production run today). Sees the truck's real-time GPS position on the map, with ETA to his facility. The map shows the planned route and any deviations. *Emotional state: Confident when the truck is on route and ETA looks good. This single screen eliminated 90% of his "where's my freight?" calls.*
- Screen: **Shipment Detail** | Route: `/portal/shipments/[id]` | Action: Clicks into the shipment detail for the priority load. Reviews the full timeline -- pickup confirmation, in-transit updates, and current ETA. Checks the driver's last update timestamp to make sure tracking data is fresh.

---

### Core Work (8:00 AM - 4:00 PM)

**3. Morning Shipment Coordination (8:00 - 9:00 AM)**
- Screen: **My Shipments** | Route: `/portal/shipments` | Action: Filters by `Status = Picking Up Today`. Verifies that all outbound shipments have carrier assignments and confirmed pickup times. If any show "Pending," he follows up.
- Screen: **Shipment Detail** | Route: `/portal/shipments/[id]` | Action: Reviews upcoming shipment details to confirm his warehouse team has the correct door assignments and appointment times.

**4. Request Quotes for Upcoming Freight (9:00 - 10:00 AM)**
- Screen: **Request Quote** | Route: `/portal/quotes/request` | Action: Submits a quote request for next week's freight. Enters origin (his facility in Atlanta), destination(s), commodity, weight, equipment type, and target pickup date. Can submit multiple quote requests in sequence. *Emotional state: Empowered -- he used to email a spreadsheet and wait 4 hours. Now he gets quotes back in under 30 minutes through the portal.*
- Screen: **My Quotes** | Route: `/portal/quotes` | Action: Reviews returned quotes. Compares rates across previous quote history for the same lane. Clicks "Accept" on quotes he wants to book, which auto-converts them to orders. Clicks "Request Revision" if the rate seems too high, with a target rate in the notes.

**5. Invoice Review and AP Processing (1:00 - 2:00 PM)**
- Screen: **My Invoices** | Route: `/portal/invoices` | Action: Reviews invoices posted to his portal. Filters by `Status = Unpaid`. Each invoice shows the load number, origin/destination, amount, and due date. Can download individual invoices or use "Download All" for a batch of PDFs for his AP team. *Emotional state: Efficient -- no more emailing the broker's accounting department asking for copies of invoices. They are all right here.*
- Screen: **My Invoices** (Document View) | Route: `/portal/invoices/[id]` | Action: Opens a specific invoice to review charges. Cross-references with his original order to verify the rate, accessorial charges, and reference numbers match. Downloads the attached POD to verify delivery.
- Screen: **My Documents** | Route: `/portal/documents` | Action: Accesses all documents related to his shipments -- BOLs, PODs, rate confirmations. Filters by load number or date range. Downloads documents for his internal records.

**6. Check Afternoon Deliveries (2:00 - 3:00 PM)**
- Screen: **Track Shipment** | Route: `/portal/track` | Action: Checks the map view for all shipments arriving this afternoon. Verifies ETAs and alerts his receiving team to any delays. *Emotional state: In control -- he is managing exceptions proactively instead of reacting to surprises.*
- Screen: **Shipment Detail** | Route: `/portal/shipments/[id]` | Action: For any shipments showing "At Risk" status, reviews the exception details. If the delay is significant, uses the "Report Issue" feature.

**7. Report Issues (As Needed)**
- Screen: **Report Issue** | Route: `/portal/issues/new` | Action: Files an issue report for a problematic shipment -- late delivery, damaged freight, missing items. Selects the issue type, describes the problem, and attaches photos if applicable. The system creates a case that routes to the operations team. *Emotional state: Frustrated by the issue itself, but appreciative that there is a formal channel instead of an email chain that gets lost.*

---

### End of Day (4:00 - 5:00 PM)

**8. Plan Next Week's Freight**
- Screen: **Request Quote** | Route: `/portal/quotes/request` | Action: Submits quote requests for the following week's outbound freight. Uses the "Clone Previous Request" feature for recurring lanes to save time.
- Screen: **My Shipments** | Route: `/portal/shipments` | Action: Reviews the shipment history for the current week -- total loads moved, on-time %, and any exceptions. Uses this data for his internal weekly report to leadership. *Emotional state: Organized -- the portal gives him all the data he needs for his internal reporting.*

**9. Leadership Reporting**
- Screen: **Portal Dashboard** | Route: `/portal/dashboard` | Action: Takes a final look at the dashboard. Uses the "Shipment Summary" widget to capture this week's metrics.
- Screen: **My Shipments** (Export) | Route: `/portal/shipments` | Action: Exports the week's shipment data as an Excel file for his internal supply chain dashboard.

---

### Occasional Tasks (Weekly/Monthly)

**10. Carrier/Broker Performance Review (Monthly)**
- Screen: **Portal Dashboard** | Route: `/portal/dashboard` | Action: Reviews the "Service Metrics" section showing on-time %, claims rate, and quote response time across all his brokers. Uses this to make decisions about freight allocation.

**11. Notification Preferences (One-time + Updates)**
- Screen: **My Profile** (Notifications Tab) | Route: `/portal/profile#notifications` | Action: Configures which events trigger email/SMS notifications -- quote responses, shipment status changes, delivery confirmations, invoice postings.

---

## 7. Critical Cross-Screen Flows

These are the most important multi-screen workflows that span multiple services and modules. Each flow shows the exact screen sequence, the persona(s) involved, and the handoff points between users.

---

### Flow A: Order-to-Delivery (Primary Operational Flow)

**Personas Involved:** James (Sales) -> Maria (Dispatcher) -> Carlos (Driver) -> Emily (AR) -> Mike (Customer)

```
Step  Screen                    Route                          Actor    Action
----  ----------------------    ----------------------------   ------   -------------------------------------------
1     Quote Builder             /quotes/new                    James    Creates and sends quote to customer
2     Portal - My Quotes        /portal/quotes                 Mike     Reviews and accepts quote
3     Quote Detail              /quotes/[id]                   James    Sees "Accepted" status, clicks "Convert to Order"
4     Order Entry               /orders/new                    James    Order auto-created from quote data
5     Orders List               /orders                        Maria    Sees new order in her queue
6     Load Builder              /loads/new                     Maria    Builds load from order, sets stops
7     Carriers List             /carriers                      Maria    Searches for available carrier
8     Carrier Detail            /carriers/[id]                 Maria    Reviews carrier profile and scorecard
9     Dispatch Board            /dispatch-board                Maria    Assigns carrier to load (drag-and-drop)
10    Carrier Portal - Loads    /carrier-portal/loads          Carlos   Sees assigned load, reviews details
11    Carrier Portal - Accept   /carrier-portal/loads/[id]     Carlos   Accepts load, rate con auto-generated
12    Driver App - Status       /app/status                    Carlos   Updates status: "Arrived at Shipper"
13    Tracking Map              /tracking-map                  Maria    Monitors GPS position in real-time
14    Portal - Track            /portal/track                  Mike     Watches shipment on map
15    Driver App - Status       /app/status                    Carlos   Updates: "Loading" -> "In Transit" -> "Arrived at Receiver"
16    Driver App - POD          /app/pod                       Carlos   Captures POD photo and signature
17    Load Detail               /loads/[id]                    Maria    Sees "Delivered" status with POD attached
18    Invoice Entry             /accounting/invoices/new       Emily    Creates invoice from delivered load
19    Portal - My Invoices      /portal/invoices               Mike     Receives and reviews invoice
20    Payment Entry             /accounting/payments/new       Emily    Applies customer payment
21    Quick Pay Request         /carrier-portal/payments       Carlos   Requests quick pay, receives payment
```

**Critical Handoff Points:**
- Step 3-4: Quote acceptance triggers order creation (Sales -> Operations)
- Step 9-10: Carrier assignment triggers portal notification (Operations -> Carrier)
- Step 16-17: POD upload triggers invoice-ready status (Carrier -> Accounting)
- Step 18-19: Invoice generation triggers customer portal notification (Accounting -> Customer)

---

### Flow B: Quote-to-Order (Sales Conversion Flow)

**Personas Involved:** Mike (Customer) -> James (Sales) -> Maria (Dispatcher)

```
Step  Screen                    Route                          Actor    Action
----  ----------------------    ----------------------------   ------   -------------------------------------------
1     Portal - Request Quote    /portal/quotes/request         Mike     Submits quote request via portal
2     Notification Center       /notifications                 James    Receives "New Quote Request" notification
3     Quotes List               /quotes                        James    Sees new request in queue
4     Quote Builder             /quotes/new                    James    Builds quote with market rate data
5     Rate Lookup               /rates/lookup                  James    Checks current DAT/Truckstop rates
6     Lane Pricing              /rates/lanes                   James    Checks for existing contract rates
7     Quote Builder             /quotes/new                    James    Finalizes rate, adds accessorials
8     Quote Detail              /quotes/[id]                   James    Reviews and clicks "Send to Customer"
9     Portal - My Quotes        /portal/quotes                 Mike     Receives notification, reviews quote
10a   [IF ACCEPTED]             /portal/quotes/[id]            Mike     Clicks "Accept Quote"
10b   [IF REVISION]             /portal/quotes/[id]            Mike     Clicks "Request Revision" with notes
11    Quote Detail              /quotes/[id]                   James    Clicks "Convert to Order"
12    Order Entry               /orders/new                    James    Reviews auto-populated order, submits
13    Orders List               /orders                        Maria    Sees new order, begins dispatch
```

**Average Time (Target):** Steps 1-8: Under 30 minutes | Steps 9-11: Customer dependent | Steps 11-13: Under 5 minutes

---

### Flow C: Carrier Onboarding (Compliance Flow)

**Personas Involved:** Maria (Dispatcher) -> Sarah (Operations Manager)

```
Step  Screen                    Route                          Actor    Action
----  ----------------------    ----------------------------   ------   -------------------------------------------
1     Carriers List             /carriers                      Maria    Clicks "+ New Carrier"
2     FMCSA Lookup              /carriers/fmcsa-lookup         Maria    Enters MC# or DOT#, verifies authority
3     Carrier Onboarding        /carriers/onboard              Maria    Wizard Step 1: Company info auto-filled from FMCSA
4     Carrier Onboarding        /carriers/onboard              Maria    Wizard Step 2: Contact information
5     Carrier Onboarding        /carriers/onboard              Maria    Wizard Step 3: Equipment details
6     Carrier Onboarding        /carriers/onboard              Maria    Wizard Step 4: Insurance certificates upload
7     Carrier Onboarding        /carriers/onboard              Maria    Wizard Step 5: W-9 and carrier agreement upload
8     Carrier Onboarding        /carriers/onboard              Maria    Wizard Step 6: Lane preferences
9     Document Upload           /documents/upload              Maria    Uploads any additional documents (emailed certs)
10    Compliance Center         /carriers/compliance           Sarah    Reviews new carrier in compliance queue
11    Insurance Tracking        /carriers/insurance            Sarah    Verifies insurance meets minimums ($1M/$100K)
12    Safety Center             /carriers/safety               Sarah    Reviews CSA scores, safety rating
13    Carrier Detail            /carriers/[id]                 Sarah    Approves carrier, status changes to "Active"
14    Carrier Portal - Profile  /carrier-portal/profile        Carrier  Receives welcome email, completes portal profile
```

**Critical Gates:**
- Step 2: FMCSA lookup must return active authority (auto-reject if revoked/inactive)
- Step 10-12: Compliance review is a mandatory gate before activation
- Step 13: Only Operations Manager or Admin can approve activation

---

### Flow D: Invoice and Payment (Financial Flow)

**Personas Involved:** Carlos (Driver) -> Emily (AR) -> Mike (Customer) -> Carlos (Payment)

```
Step  Screen                    Route                          Actor    Action
----  ----------------------    ----------------------------   ------   -------------------------------------------
1     Driver App - POD          /app/pod                       Carlos   Uploads POD photo and signature
2     Load Detail               /loads/[id]                    Emily    Sees POD attached, load marked "Invoice Ready"
3     Loads List                /loads                         Emily    Filters delivered loads with PODs
4     Invoice Entry             /accounting/invoices/new       Emily    Creates invoice (auto-populated from load)
5     Invoice Detail            /accounting/invoices/[id]      Emily    Reviews, attaches POD PDF
6     Invoices List             /accounting/invoices           Emily    Bulk-sends invoices to customers
7     Portal - My Invoices      /portal/invoices               Mike     Receives notification, reviews invoice
8     Portal - Invoice Detail   /portal/invoices/[id]          Mike     Downloads invoice and POD for AP team
9     Payments Received         /accounting/payments-received  Emily    Records incoming payment from customer
10    Payment Entry             /accounting/payments/new       Emily    Applies payment to invoice
11    Invoice Detail            /accounting/invoices/[id]      Emily    Invoice status updates to "Paid"
12    QuickBooks Sync           /integrations/quickbooks       Emily    Payment syncs to QuickBooks automatically
13    Quick Pay Request         /carrier-portal/payments       Carlos   Requests quick pay (optional, Step 1-13 can be parallel)
14    Quick Pay Dashboard       /accounting/quick-pay          Emily    Approves quick pay request
15    Carrier Portal - Payments /carrier-portal/payments       Carlos   Receives quick pay deposit
```

**Time Targets:**
- Steps 1-6: Same day (delivery to invoice sent)
- Steps 7-11: 30 days target DSO
- Steps 13-15: 24-48 hours for quick pay

---

### Flow E: Exception Handling (Service Recovery Flow)

**Personas Involved:** System (Auto) -> Maria (Dispatcher) -> Sarah (Ops Manager) -> Mike (Customer)

```
Step  Screen                    Route                          Actor    Action
----  ----------------------    ----------------------------   ------   -------------------------------------------
1     [SYSTEM]                  --                             Auto     ETA slips past delivery window by 2+ hours
2     Notification Center       /notifications                 Maria    Receives "Load At Risk" alert with red badge
3     Load Detail               /loads/[id]                    Maria    Reviews load timeline, sees ETA slippage
4     Tracking Map              /tracking-map                  Maria    Locates truck on map, assesses situation
5     Check Calls               /check-calls                   Maria    Calls driver, logs check call with new ETA
6     Load Detail               /loads/[id]                    Maria    Updates delivery ETA in the system
7     Communication Hub         /communications                Maria    Sends proactive notification to customer
8     Portal - Shipment Detail  /portal/shipments/[id]         Mike     Sees updated ETA and delay notification
9     [IF ESCALATION]           /notifications                 Sarah    Receives escalation alert
10    Load Detail               /loads/[id]                    Sarah    Reviews full timeline and exception details
11    Company Detail            /companies/[id]                Sarah    Reviews customer relationship history
12    Communication Hub         /communications                Sarah    Sends executive-level response to customer
13    Claims Dashboard          /claims                        Sarah    If damage/loss, initiates claims process
14    New Claim                 /claims/new                    Sarah    Files formal claim with details and photos
15    Load Detail               /loads/[id]                    Maria    Resolves exception, updates load status
```

**Escalation Triggers:**
- 2+ hour ETA slip: Auto-alert to dispatcher (Step 2)
- 4+ hour ETA slip: Auto-escalate to operations manager (Step 9)
- Missed delivery window: Auto-notify customer and escalate (Steps 7-9 simultaneous)
- Damage reported: Auto-create claim draft (Step 13)

---

## 8. Persona Interaction Map

This shows how the 6 personas' workflows intersect and depend on each other across screens.

### Screen Overlap Matrix

| Screen                  | Maria | James | Sarah | Carlos | Emily | Mike  |
| ----------------------- | ----- | ----- | ----- | ------ | ----- | ----- |
| Operations Dashboard    | Daily | --    | Daily | --     | --    | --    |
| Sales Dashboard         | --    | Daily | Wkly  | --     | --    | --    |
| Accounting Dashboard    | --    | --    | Wkly  | --     | Daily | --    |
| Portal Dashboard        | --    | --    | --    | --     | --    | Daily |
| Orders List             | Daily | Daily | Daily | --     | --    | --    |
| Loads List              | Daily | --    | Daily | --     | Daily | --    |
| Dispatch Board          | Daily | --    | Daily | --     | --    | --    |
| Tracking Map            | Daily | --    | Wkly  | --     | --    | --    |
| Carriers List           | Daily | --    | Wkly  | --     | --    | --    |
| Carrier Detail          | Daily | --    | Wkly  | --     | --    | --    |
| Quotes List             | --    | Daily | --    | --     | --    | --    |
| Quote Builder           | --    | Daily | --    | --     | --    | --    |
| Invoices List           | --    | --    | --    | --     | Daily | --    |
| AR Aging Report         | --    | --    | Wkly  | --     | Daily | --    |
| Company Detail          | --    | Daily | Wkly  | --     | Wkly  | --    |
| Communication Hub       | Daily | Daily | Wkly  | --     | Daily | --    |
| Notification Center     | Daily | Daily | Daily | --     | Daily | --    |
| My Shipments (Portal)   | --    | --    | --    | --     | --    | Daily |
| Track Shipment (Portal) | --    | --    | --    | --     | --    | Daily |
| My Invoices (Portal)    | --    | --    | --    | --     | --    | Wkly  |
| Driver App - Status     | --    | --    | --    | Daily  | --    | --    |
| Driver App - POD        | --    | --    | --    | Daily  | --    | --    |
| Carrier Portal - Loads  | --    | --    | --    | Daily  | --    | --    |
| Check Calls             | Daily | --    | Wkly  | --     | --    | --    |
| Compliance Center       | Wkly  | --    | Daily | --     | --    | --    |
| QuickBooks Sync         | --    | --    | --    | --     | Daily | --    |

### Data Flow Between Personas

```
Mike (Customer)                     James (Sales)                 Maria (Dispatcher)
  |                                    |                              |
  |-- Quote Request ------------------>|                              |
  |                                    |-- Quote Sent ------------->  |
  |<--- Quote Received ----------------|                              |
  |-- Quote Accepted ----------------->|                              |
  |                                    |-- Order Created ---------->  |
  |                                    |                              |-- Carrier Assigned
  |                                    |                              |       |
  |                                    |                              |       v
  |                                    |                         Carlos (Driver)
  |                                    |                              |
  |<--- Tracking Updates (Auto) -------|---------- GPS Data ---------|
  |                                    |                              |
  |                                    |                              |-- POD Uploaded
  |                                    |                              |       |
  |                                    |                              |       v
  |                                    |                         Emily (AR)
  |                                    |                              |
  |<--- Invoice Received --------------|---------- Invoice Sent ------|
  |-- Payment Sent --------------------|---------- Payment Applied ---|
  |                                    |                              |
  |                                    |                         Sarah (Ops Manager)
  |                                    |                              |
  |<--- Escalation Response -----------|---------- Monitors All ------|
```

### Peak Usage Times by Persona

| Time        | Maria        | James         | Sarah        | Carlos     | Emily        | Mike         |
| ----------- | ------------ | ------------- | ------------ | ---------- | ------------ | ------------ |
| 6-7 AM      | Alerts       | --            | --           | Pre-trip   | --           | --           |
| 7-8 AM      | Load review  | Quote review  | Dashboard    | At shipper | --           | Shipment check |
| 8-9 AM      | Dispatch     | Customer calls| Team huddle  | Loading    | Invoicing    | Coordination |
| 9-10 AM     | Assignments  | Quote building| Escalations  | In transit | Invoicing    | Quote requests |
| 10-11 AM    | Assignments  | Quote building| P&L review   | In transit | Missing PODs | --           |
| 11 AM-12 PM | Exceptions   | Customer calls| Compliance   | In transit | Payments     | Status check |
| 12-1 PM     | Lunch/desk   | Lunch         | Meetings     | Lunch      | Lunch        | --           |
| 1-2 PM      | Assignments  | Follow-ups    | Process work | In transit | Collections  | Invoice review |
| 2-3 PM      | Load board   | Prospecting   | Process work | In transit | Collections  | Track deliveries |
| 3-4 PM      | Check calls  | Follow-ups    | Team 1:1s    | Check-in   | Disputes     | --           |
| 4-5 PM      | Customer updates| CRM cleanup | EOD reports  | Delivery   | QB sync      | Plan next week |
| 5-6 PM      | Handoff      | --            | --           | Delivery   | --           | --           |
| 6-7 PM      | --           | --            | --           | POD upload | --           | --           |
| 7-9 PM      | --           | --            | --           | Next load  | --           | --           |

---

## Design Implications

### Priority Screens by Usage Frequency

These screens are visited most frequently across all personas and must be highly optimized for speed, clarity, and cross-screen navigation:

1. **Operations Dashboard** (`/dashboard/operations`) -- Maria + Sarah daily, 5+ views/day
2. **Loads List** (`/loads`) -- Maria + Emily daily, 10+ views/day
3. **Dispatch Board** (`/dispatch-board`) -- Maria daily, kept open all day
4. **Tracking Map** (`/tracking-map`) -- Maria daily, 5+ views/day
5. **Notification Center** (`/notifications`) -- All internal personas, 10+ views/day
6. **Communication Hub** (`/communications`) -- Maria + James + Emily, 5+ views/day
7. **Carriers List** (`/carriers`) -- Maria daily, 15+ searches/day
8. **Driver App - Status** (`/app/status`) -- Carlos, 5-8 updates/day
9. **Portal Dashboard** (`/portal/dashboard`) -- Mike daily, 3+ views/day
10. **Invoices List** (`/accounting/invoices`) -- Emily daily, 10+ views/day

### Cross-Screen Navigation Requirements

1. **Load Detail must link to:** Carrier Detail, Customer Detail, Invoice, POD Document, Check Calls, Tracking Map, Communication Hub
2. **Carrier Detail must link to:** Loads assigned, Scorecard, Compliance documents, Payment history, FMCSA data
3. **Company Detail must link to:** All orders, All loads, All invoices, All quotes, Communication history, AR status
4. **Quote Detail must link to:** Company Detail, Rate data, Converted order, Communication history
5. **Invoice Detail must link to:** Load Detail, POD document, Payment history, Company Detail, QuickBooks record

### Emotional Design Cues

| Persona  | Key Anxiety Point                      | Design Response                                          |
| -------- | -------------------------------------- | -------------------------------------------------------- |
| Maria    | "Where is the truck?"                  | Tracking Map always 1 click away. GPS freshness indicator |
| James    | "Am I quoting the right rate?"         | Inline market rate panel with confidence indicators       |
| Sarah    | "Are we compliant?"                    | Red/yellow/green compliance badges. Expiry countdown     |
| Carlos   | "When will I get paid?"                | Payment status prominently on home screen. Quick pay CTA |
| Emily    | "Is the POD attached?"                 | POD status badge on every load. Missing POD filter       |
| Mike     | "Where is my freight?"                 | Real-time map as the hero element on portal dashboard    |

---

*This document should be updated whenever new screens are added, navigation flows change, or persona workflows evolve based on user research.*

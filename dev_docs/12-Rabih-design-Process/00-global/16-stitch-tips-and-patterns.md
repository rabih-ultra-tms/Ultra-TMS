# Stitch Tips & Patterns for Ultra TMS

> This guide teaches how to write effective prompts for [stitch.withgoogle.com](https://stitch.withgoogle.com) to generate high-fidelity UI mockups for the Ultra TMS system. Each screen design file (Section 14) should contain a Stitch prompt — this document provides the methodology and reusable patterns for writing those prompts.

---

## Tips for Writing Effective Stitch Prompts

### 1. Be Specific About Layout

Do not say "a page with a sidebar." Instead, describe exact dimensions and structure:

- **Sidebar:** "Dark slate-900 sidebar on the left, 240px wide, with logo at top, navigation links with icons in the middle, and user avatar at the bottom."
- **Content area:** "White content area filling the remaining width to the right of the sidebar."
- **Grid:** "Content area uses a 12-column grid with 24px gutters."
- **Sections:** "Page header spans full width. Below it, a stats row with 4 equal-width cards. Below that, the data table."

### 2. Reference the Design Aesthetic

Always include this phrase or a variation of it in your prompt:

> "Modern SaaS aesthetic similar to Linear.app, Vercel dashboard, or Stripe dashboard."

This gives Stitch a strong visual anchor. These products share clean layouts, generous whitespace, subtle borders, and restrained color usage that matches the Ultra TMS design direction.

### 3. Use Realistic Freight Data

Generic placeholder text ("Lorem ipsum", "Item 1", "User A") produces generic-looking mockups. Instead, fill your prompts with real-looking logistics data:

- **Load numbers:** FM-2025-0847, FM-2025-0848, FM-2025-0849
- **Order numbers:** ORD-20250206-0012, ORD-20250206-0013
- **Routes:** "Chicago, IL to Dallas, TX", "Los Angeles, CA to Phoenix, AZ", "Atlanta, GA to Miami, FL"
- **Carrier names:** Swift Transport, Heartland Express, Werner Enterprises, J.B. Hunt, Schneider National
- **Customer names:** Acme Manufacturing, Global Foods Inc, TechParts Corp, Midwest Steel, Pacific Lumber Co
- **Dollar amounts:** $2,450.00, $1,875.50, $3,200.00, $985.75, $4,120.00
- **Equipment types:** Dry Van, Reefer (Refrigerated), Flatbed, Step Deck, Tanker
- **Weights:** 42,000 lbs, 38,500 lbs, 22,750 lbs
- **Distances:** 920 mi, 1,450 mi, 380 mi

### 4. Specify the Color Palette

Include explicit color references so Stitch generates on-brand mockups:

- **Sidebar background:** slate-900 (#0f172a)
- **Sidebar text:** white with 70% opacity for inactive, 100% for active
- **Sidebar active indicator:** blue-600 (#2563eb) left border or background highlight
- **Content background:** white (#FFFFFF)
- **Page background (behind cards):** gray-50 (#f9fafb)
- **Primary action color:** blue-600 (#2563eb)
- **Success/green:** green-600 (#16a34a) for delivered, completed
- **Warning/yellow:** yellow-600 (#ca8a04) for pending, attention needed
- **Danger/red:** red-600 (#dc2626) for cancelled, overdue, errors
- **Neutral/gray:** gray-500 (#6b7280) for draft, inactive
- **In Transit/blue:** blue-600 (#2563eb)
- **Borders:** gray-200 (#e5e7eb)
- **Table header background:** gray-50 (#f9fafb)

### 5. Specify Typography

- **Font family:** Inter (or say "system sans-serif similar to Inter")
- **Base size:** 14px for body text and table cells
- **Page titles:** 24px, font-weight 600 (semibold), gray-900
- **Section headers:** 18px, font-weight 600, gray-900
- **Table headers:** 12px, font-weight 500, uppercase, gray-500, letter-spacing 0.05em
- **Small text/captions:** 12px, gray-500
- **Monospace for IDs:** Load numbers, order numbers in monospace font (e.g., "font-mono text-sm")

### 6. Describe Component Types Precisely

Use established UI component names that Stitch understands:

- **Data table** (not just "table") with sortable column headers, row hover states, checkbox column
- **Kanban board** with vertical lanes/columns, draggable cards
- **Stat cards** / KPI cards with icon, label, value, and trend indicator
- **Badge** for status labels (not "tag" or "label" which can be ambiguous)
- **Tabs** for content sections (underline style, not pill style)
- **Breadcrumb** navigation at top of page
- **Avatar** with initials or image for user display
- **Toast notification** for success/error messages
- **Sheet / Slide-over panel** for side drawers
- **Command palette** for search (like Cmd+K)

### 7. Specify Status Badge Colors

Always describe status badges with both background and text colors:

- **Draft:** gray background, gray text (`bg-gray-100 text-gray-700`)
- **Pending / Awaiting:** yellow background, dark yellow text (`bg-yellow-100 text-yellow-800`)
- **Active / In Transit:** blue background, dark blue text (`bg-blue-100 text-blue-800`)
- **Ready / Dispatched:** indigo background, dark indigo text (`bg-indigo-100 text-indigo-800`)
- **Delivered / Completed:** green background, dark green text (`bg-green-100 text-green-800`)
- **Cancelled / Failed:** red background, dark red text (`bg-red-100 text-red-800`)
- **On Hold:** orange background, dark orange text (`bg-orange-100 text-orange-800`)

### 8. Describe the Dark Sidebar, Light Content Pattern

The Ultra TMS uses a consistent shell across all pages:

> "The left sidebar (240px) has a dark slate-900 background. At the top is the 'Ultra TMS' logo in white. Below the logo are navigation links with icons (Dashboard, Orders, Loads, Dispatch, Tracking, Carriers, Customers, Reports, Settings). The active page link has a blue-600 left border highlight and slightly brighter text. At the bottom of the sidebar is a user avatar with name and a settings gear icon. The main content area to the right has a white background."

Include this description (or a shortened version) in every prompt so the sidebar is consistent across mockups.

### 9. Specify the Number of Items to Show

Stitch produces better results when you tell it exactly how many items to render:

- "Show **8 rows** in the data table"
- "Show **5 Kanban cards** per lane, with **4 lanes** visible"
- "Show **4 KPI stat cards** in the stats row"
- "Show **6 items** in the recent activity list"
- "Show **3 tab options** with the first tab selected"

Without a count, Stitch may show too few (looks empty) or too many (looks cluttered).

---

## Common Stitch Prompt Patterns

Below are 8 complete, copy-paste-ready example prompts for different screen types in Ultra TMS. Each prompt is 200-400 words and produces a high-fidelity mockup when pasted directly into stitch.withgoogle.com.

---

### 1. List Page — Orders List

```
Design a full-width Orders List page for a modern freight logistics TMS called "Ultra TMS." Use a modern SaaS aesthetic similar to Linear.app or Vercel dashboard.

Layout: Dark slate-900 sidebar on the left (240px wide) with the "Ultra TMS" logo in white at the top, navigation links with icons in the middle (Dashboard, Orders, Loads, Dispatch, Tracking, Carriers, Customers, Reports, Settings), and a user avatar with "John D." at the bottom. The "Orders" link is active with a blue-600 left border highlight. The main content area to the right has a white background.

Page Header: At the top of the content area, show a breadcrumb "Home / Orders" in gray-500 text. Below it, the page title "Orders" in 24px semibold gray-900 on the left. On the right side of the header, two buttons: a secondary outline button "Export" with a download icon, and a primary blue-600 button "+ New Order" with a plus icon.

Stats Row: Below the header, show 4 KPI stat cards in a horizontal row with equal widths. Card 1: "Total Orders" value "1,247" with a green up-arrow trend "+12% this month." Card 2: "Pending Review" value "38" in yellow-600. Card 3: "In Progress" value "184" in blue-600. Card 4: "Revenue MTD" value "$2.4M" with a green trend "+8%." Each card has a white background, rounded-lg border, and subtle shadow-sm.

Filter Bar: Below the stats, a horizontal filter bar with: a Status multi-select dropdown (showing "All Statuses"), a Date Range picker (showing "This Week"), a Customer searchable dropdown (showing "All Customers"), an Equipment Type dropdown (showing "All Equipment"), and a search input with magnifying glass icon and placeholder "Search orders, PO numbers..."

Data Table: Below the filters, a data table with a checkbox column for bulk selection and these columns: Order # (monospace), Status (colored badge), Customer, Origin, Destination, Equipment, Pickup Date, Rate, and a three-dot actions menu. Show 8 rows of data:

Row 1: ORD-20250206-0012 | Confirmed (green badge) | Acme Manufacturing | Chicago, IL | Dallas, TX | Dry Van | Feb 8, 2025 | $2,450.00
Row 2: ORD-20250206-0013 | Pending Review (yellow badge) | Global Foods Inc | Los Angeles, CA | Phoenix, AZ | Reefer | Feb 9, 2025 | $1,875.50
Row 3: ORD-20250205-0089 | In Progress (blue badge) | TechParts Corp | Atlanta, GA | Miami, FL | Flatbed | Feb 7, 2025 | $3,200.00
Row 4: ORD-20250205-0088 | Draft (gray badge) | Midwest Steel | Detroit, MI | Cleveland, OH | Dry Van | Feb 10, 2025 | $985.75
Row 5: ORD-20250204-0076 | Confirmed (green badge) | Pacific Lumber Co | Seattle, WA | Portland, OR | Flatbed | Feb 8, 2025 | $1,540.00
Row 6: ORD-20250204-0075 | Cancelled (red badge) | Sunrise Beverages | Denver, CO | Salt Lake City, UT | Reefer | Feb 6, 2025 | $2,100.00
Row 7: ORD-20250203-0064 | In Progress (blue badge) | National Paper Co | Memphis, TN | Nashville, TN | Dry Van | Feb 7, 2025 | $720.00
Row 8: ORD-20250203-0063 | Pending Review (yellow badge) | Granite Stone Inc | Boston, MA | New York, NY | Step Deck | Feb 9, 2025 | $4,120.00

Table headers should be 12px uppercase gray-500 with gray-50 background. Rows should have subtle hover highlighting. Show pagination at the bottom: "Showing 1-8 of 1,247 orders" with page number buttons.

Font: Inter, 14px base. Colors: blue-600 primary, status badges with colored backgrounds and matching text.
```

---

### 2. Detail Page — Load Detail

```
Design a Load Detail page for a modern freight logistics TMS called "Ultra TMS." Use a clean, modern SaaS aesthetic similar to Linear.app or Stripe dashboard.

Layout: Dark slate-900 sidebar on the left (240px) with "Ultra TMS" logo in white, navigation links with icons, "Loads" link active with blue-600 left border. Main content area on the right with white background.

Page Header: Breadcrumb "Home / Loads / FM-2025-0847" in gray-500. Below, on the left: load number "FM-2025-0847" in 24px semibold monospace gray-900, a blue "In Transit" status badge next to it, and below that "Acme Manufacturing" as customer name in 14px gray-500. On the right: three buttons — secondary outline "Print BOL" with printer icon, secondary outline "Edit" with pencil icon, and a primary blue-600 "Update Status" with a chevron-down for dropdown.

Key Info Bar: Below the header, a horizontal bar with 6 key metrics in a clean row with dividers: "Origin: Chicago, IL" | "Destination: Dallas, TX" | "Pickup: Feb 8, 2025 8:00 AM" | "Delivery: Feb 10, 2025 2:00 PM" | "Equipment: Dry Van" | "Miles: 920 mi."

Tab Navigation: Below the key info bar, horizontal underline-style tabs: "Overview" (active, blue-600 underline), "Stops & Route", "Documents", "Financials", "Communication", "Audit Log."

Overview Tab Content — Two Column Layout:
Left Column (60% width):
- "Route & Stops" section: A vertical timeline with two stops. Stop 1 (green dot, completed): "Pickup — Chicago, IL" with "Acme Manufacturing Warehouse, 1200 Industrial Pkwy" address, "Feb 8, 2025 8:00 AM" scheduled, "Feb 8, 2025 8:15 AM Arrived" actual time in green. Stop 2 (blue dot, in progress): "Delivery — Dallas, TX" with "Dallas Distribution Center, 4500 Commerce St" address, "Feb 10, 2025 2:00 PM" scheduled, "ETA: Feb 10, 1:45 PM" in blue.
- "Special Instructions" section: A gray-50 box with text "Temperature controlled — maintain 35-40F. Dock appointment required. Call 30 min before arrival."

Right Column (40% width):
- "Carrier Information" card: White card with border. "Swift Transport" as carrier name in semibold, "MC# 123456" below, "Driver: Mike Johnson" with phone icon "(555) 234-5678", "Truck# T-4521", "Trailer# TR-8890."
- "Financial Summary" card: White card with border. Row items: "Customer Rate: $2,450.00", "Carrier Rate: $1,875.00", "Margin: $575.00 (23.5%)" in green semibold, "Accessorials: $150.00."
- "Activity Feed" section: A compact list of recent events: "Feb 8, 2:30 PM — Status changed to In Transit by John D.", "Feb 8, 8:15 AM — Arrived at pickup by Driver", "Feb 7, 4:00 PM — Carrier confirmed by dispatch", "Feb 7, 10:00 AM — Load created by Sarah M."

Font: Inter, 14px base. Gray-200 borders on cards. Rounded-lg corners. Subtle shadow-sm on cards.
```

---

### 3. Form / Wizard Page — Order Entry

```
Design a multi-step Order Entry form page for a modern freight logistics TMS called "Ultra TMS." Use a clean, modern SaaS aesthetic similar to Linear.app.

Layout: Dark slate-900 sidebar on the left (240px) with "Ultra TMS" logo, navigation links, "Orders" active. Main content area with white background on the right.

Page Header: Breadcrumb "Home / Orders / New Order" in gray-500. Title "Create New Order" in 24px semibold. On the right, two buttons: secondary outline "Save as Draft" and primary blue-600 "Continue" with right arrow icon.

Step Indicator: Below the header, a horizontal stepper showing 4 steps connected by lines. Step 1 "Customer & Reference" has a blue-600 filled circle with checkmark (completed). Step 2 "Stops & Route" has a blue-600 filled circle with "2" (current/active). Step 3 "Equipment & Requirements" has a gray-300 circle with "3" (upcoming). Step 4 "Review & Submit" has a gray-300 circle with "4" (upcoming). The connecting line between steps 1 and 2 is blue-600 (completed), the rest are gray-300.

Step 2 Content — "Stops & Route":
Section header "Pickup & Delivery Stops" in 18px semibold with a blue-600 "+ Add Stop" button on the right.

Stop 1 Card (Pickup): White card with rounded-lg border and a green left border accent. Header row: "Stop 1 — Pickup" in semibold with a grip/drag handle icon on the left and a trash icon on the right. Inside the card, a 2-column form grid:
- Left column: "Facility Name" text input (value: "Acme Manufacturing Warehouse"), "Address" text input (value: "1200 Industrial Pkwy"), "City" text input (value: "Chicago"), "State" dropdown (value: "IL"), "ZIP" text input (value: "60616").
- Right column: "Appointment Date" date picker (value: "Feb 8, 2025"), "Appointment Time" time picker (value: "8:00 AM"), "Contact Name" text input (value: "Mike Chen"), "Contact Phone" text input (value: "(312) 555-0147"), "Reference #" text input with placeholder "PO, BOL, or reference number."

Stop 2 Card (Delivery): Similar white card with a red left border accent. Header: "Stop 2 — Delivery" with drag handle and trash icon. Same form layout with different data:
- Left: "Dallas Distribution Center", "4500 Commerce St", "Dallas", "TX", "75201"
- Right: "Feb 10, 2025", "2:00 PM", "Sandra Lopez", "(214) 555-0293", placeholder empty

Below the stop cards, a summary bar showing: "Total Distance: 920 miles | Estimated Transit: 2 days | Stops: 2"

Bottom action bar: Fixed to bottom of content area with white background, top border gray-200. Left side: "Back" button with left arrow (outline style). Right side: "Save as Draft" (outline) and "Continue to Equipment" (primary blue-600).

Font: Inter, 14px base. Form labels are 14px font-weight 500 gray-700. Input fields have gray-200 borders, rounded-md, padding 8px 12px. Focus state: blue-600 ring.
```

---

### 4. Dashboard — Operations Dashboard

```
Design an Operations Dashboard for a modern freight logistics TMS called "Ultra TMS." Use a modern SaaS aesthetic similar to Vercel dashboard or Linear.app.

Layout: Dark slate-900 sidebar on the left (240px) with "Ultra TMS" logo in white at top, navigation links with icons (Dashboard is active with blue-600 left border highlight), and user avatar "John D." at bottom. Main content area to the right with gray-50 background to distinguish card sections.

Page Header: "Operations Dashboard" in 24px semibold gray-900 on the left. On the right, a date range selector showing "Today — Feb 6, 2025" with calendar icon, and a "Refresh" icon button.

Row 1 — KPI Stat Cards: 4 cards in a horizontal row, equal width, white background, rounded-lg, shadow-sm.
- Card 1: Small truck icon in blue-600, label "Active Loads" in 12px gray-500, value "234" in 32px semibold gray-900, trend "↑ 12 from yesterday" in green-600 with small up arrow.
- Card 2: Clock icon in yellow-600, label "Pending Dispatch" in 12px gray-500, value "38" in 32px semibold, trend "↓ 5 from yesterday" in green-600.
- Card 3: Check-circle icon in green-600, label "Delivered Today" in 12px gray-500, value "56" in 32px semibold, trend "↑ 8 from yesterday" in green-600.
- Card 4: Dollar icon in blue-600, label "Revenue Today" in 12px gray-500, value "$87,450" in 32px semibold, trend "↑ 15% vs. last week" in green-600.

Row 2 — Two Columns (60/40 split):
Left (60%): "Load Status Overview" white card. Inside, a horizontal stacked bar chart showing load distribution by status: In Transit (blue, 234), At Pickup (indigo, 45), Delivered (green, 56), Pending (yellow, 38), At Risk (red, 12). Below the chart, a legend with colored dots and labels.

Right (40%): "Alerts & Attention Needed" white card with a red-600 badge showing "5" in the header. A list of 5 alert items:
1. Red dot — "FM-2025-0832 — Delivery overdue by 3 hours (Dallas, TX)" with "View" link
2. Orange dot — "FM-2025-0841 — No driver check-in for 2 hours (I-40, NM)" with "View" link
3. Yellow dot — "FM-2025-0839 — Pickup appointment in 30 min, driver 45 min away" with "View" link
4. Yellow dot — "FM-2025-0845 — Carrier rate confirmation pending (Werner)" with "View" link
5. Red dot — "FM-2025-0828 — Customer escalation: late delivery (TechParts Corp)" with "View" link

Row 3 — Two Columns (50/50 split):
Left: "Today's Pickups" white card. Mini data table with 6 rows showing: Time, Load #, Customer, Origin, Carrier, Status. Example: "8:00 AM | FM-2025-0847 | Acme Mfg | Chicago, IL | Swift Transport | On Time (green badge)." Some rows show "At Risk" in yellow or "Late" in red.

Right: "Revenue by Lane (Top 5)" white card. Horizontal bar chart showing top 5 revenue lanes: "Chicago → Dallas: $45,200", "LA → Phoenix: $38,750", "Atlanta → Miami: $32,100", "Detroit → Cleveland: $28,900", "Seattle → Portland: $24,500." Bars in blue-600 with dollar values at the end.

Font: Inter, 14px base. All cards white with rounded-lg border gray-200, subtle shadow-sm. Section titles 16px semibold gray-900 inside each card.
```

---

### 5. Kanban Board — Dispatch Board

```
Design a Dispatch Board with a Kanban-style layout for a modern freight logistics TMS called "Ultra TMS." Use a modern SaaS aesthetic similar to Linear.app or Trello with a cleaner look.

Layout: Dark slate-900 sidebar on the left (240px) with "Ultra TMS" logo, navigation links, "Dispatch" active with blue-600 left border. Main content area with gray-50 background to help the Kanban lanes stand out.

Page Header: Breadcrumb "Home / Dispatch Board" in gray-500. Title "Dispatch Board" in 24px semibold on the left. On the right: a toggle between "Board View" (active, filled) and "List View" (outline) icon buttons, a "Filter" button with funnel icon, and a primary blue-600 "+ Assign Load" button.

Filter Strip: Below the header, a compact horizontal strip: "Equipment:" dropdown showing "All", "Customer:" dropdown showing "All", "Region:" dropdown showing "All", "Date:" showing "Today — Feb 6, 2025." Total count on the right: "47 loads."

Kanban Board: Below filters, a horizontally scrollable board with 5 status lanes/columns, each with a header and scrollable card list.

Lane 1 — "Unassigned" (gray-500 header with count badge "8"):
Show 3 load cards. Each card is white, rounded-lg, shadow-sm, with: Load number in monospace semibold at top (FM-2025-0851), customer name below in 13px gray-600 ("Acme Manufacturing"), route "Chicago, IL → Dallas, TX" with arrow icon, equipment badge "Dry Van" in gray, pickup date "Feb 8, 8:00 AM", and rate "$2,450" in semibold. A subtle grip/drag handle on the left edge. Yellow warning icon on cards older than 24h.

Lane 2 — "Carrier Assigned" (indigo-600 header with count badge "12"):
Show 3 cards. Same structure as above but add carrier name: "Swift Transport" with a small truck icon. Add a "Confirm" blue text button at the bottom of each card.

Lane 3 — "Dispatched" (blue-600 header with count badge "15"):
Show 3 cards. Same structure. Add "Dispatched 2h ago" timestamp in 12px gray-400 at the bottom.

Lane 4 — "In Transit" (emerald-600 header with count badge "10"):
Show 3 cards. Add a small progress indicator or "ETA: Feb 10, 2:00 PM" in the card. Show driver name "Driver: Mike J." with phone icon.

Lane 5 — "Delivered" (green-600 header with count badge "2"):
Show 2 cards. Add "Delivered Feb 6, 11:30 AM" in green-600 text. Add "POD" badge if proof of delivery is uploaded.

Each lane should have a subtle colored top border (2px) matching the lane header color. Cards should look draggable with a slight shadow on hover. The lanes should have a scrollable area if more cards exist.

Bottom of each lane: "View all (N)" link in gray-500 if more cards exist than shown.

Font: Inter, 14px base for card body, 13px for secondary info, 11px for timestamps. Card padding 12px. Lane width approximately 280px each.
```

---

### 6. Map View — Live Tracking Map

```
Design a Live Tracking Map page for a modern freight logistics TMS called "Ultra TMS." Use a modern SaaS aesthetic similar to Uber Freight or Project44 tracking interfaces.

Layout: Dark slate-900 sidebar on the left (240px) with "Ultra TMS" logo, navigation links, "Tracking" active with blue-600 left border. The remaining space is split: a left panel (360px wide, white background) for the load list, and the rest is the map view.

Left Panel — Load Tracking List:
Header: "Live Tracking" in 18px semibold with a green pulsing dot indicating "Live" next to it. Below, a search input with placeholder "Search loads, carriers, drivers..." and a filter row: "Status:" dropdown showing "In Transit" and "Equipment:" dropdown showing "All."

Below, a count: "24 loads in transit" in 12px gray-500.

Scrollable list of 6 load tracking cards (compact, stacked vertically):

Card 1 (selected/active, with blue-600 left border):
- "FM-2025-0847" in monospace semibold, "In Transit" blue badge
- "Chicago, IL → Dallas, TX"
- Progress bar: 65% filled in blue-600 with "65% complete" text
- "Swift Transport — Driver: Mike Johnson"
- "ETA: Feb 10, 2:00 PM" in blue-600
- "Last update: 5 min ago" in 12px gray-400

Card 2:
- "FM-2025-0841" monospace, "In Transit" blue badge
- "Los Angeles, CA → Phoenix, AZ"
- Progress bar: 80% in blue-600
- "Heartland Express — Driver: Sarah Kim"
- "ETA: Feb 7, 11:00 AM"
- "Last update: 12 min ago"

Card 3:
- "FM-2025-0839" monospace, "At Risk" red badge
- "Atlanta, GA → Miami, FL"
- Progress bar: 40% in red-500 (at risk color)
- "Werner Enterprises — Driver: Tom Reed"
- "ETA: Feb 8, 4:00 PM (Delayed)" in red-600
- "Last update: 45 min ago" in red-500

Show 3 more similar cards below with varying data.

Map Area (right side, filling remaining space):
A road map (Google Maps style) showing the southeastern and central United States. Display:
- Blue truck icon markers for each in-transit load at their current positions along the route
- The selected load (FM-2025-0847) has a larger highlighted marker with a tooltip popup showing: load number, carrier, speed "62 mph", "Last ping: 5 min ago", and a small "Call Driver" button
- Dashed route lines from origin to destination for the selected load — completed portion in blue-600 solid, remaining in blue-300 dashed
- Green circle markers at origin (Chicago) and red circle markers at destination (Dallas) for the selected load
- Small gray markers for other loads

Map controls in the top-right: zoom in/out buttons, a "Fit All" button to zoom to show all loads, and a "Satellite/Map" toggle.

Bottom of map: A subtle info bar showing "24 In Transit | 3 At Risk | Last refresh: 12:45 PM" with a "Refresh" button.

Font: Inter, 14px base. Map panel has a subtle left border gray-200 separating it from the list panel.
```

---

### 7. Settings Page — Tenant Settings

```
Design a Tenant Settings page for a modern freight logistics TMS called "Ultra TMS." Use a modern SaaS aesthetic similar to Vercel or Stripe dashboard settings pages.

Layout: Dark slate-900 sidebar on the left (240px) with "Ultra TMS" logo, navigation links, "Settings" active with blue-600 left border. Main content area with white background on the right.

Page Header: Breadcrumb "Home / Settings" in gray-500. Title "Settings" in 24px semibold gray-900.

Settings Navigation: Below the header, a horizontal tab bar with underline-style tabs: "General" (active, blue-600 underline), "Users & Roles", "Billing", "Integrations", "Notifications", "API Keys."

General Tab Content:
The content area has a max-width of 720px, centered, with comfortable padding. Each settings section is separated by a horizontal gray-200 divider line.

Section 1 — "Company Information":
Section title "Company Information" in 16px semibold gray-900. Description "Basic information about your organization" in 14px gray-500 below the title.
Form fields in a single-column layout:
- "Company Name" label (14px font-weight 500 gray-700) with text input (value: "Ultra Logistics LLC")
- "MC Number" with text input (value: "MC-987654")
- "DOT Number" with text input (value: "DOT-1234567")
- "Company Address" with text input (value: "1500 Commerce Drive, Suite 200")
- Two fields side by side: "City" (value: "Chicago") and "State" dropdown (value: "IL") and "ZIP" (value: "60601")
- "Phone" with text input (value: "(312) 555-0100")
- "Website" with text input (value: "www.ultralogistics.com")
A blue-600 "Save Changes" button at the bottom right of this section, with a secondary outline "Cancel" button next to it.

Section 2 — "Branding":
Title "Branding" in 16px semibold. Description "Customize your company branding."
- "Company Logo" with a drag-and-drop upload area showing a placeholder logo image (rounded rectangle, dashed gray border, "Drop logo here or click to upload" text, "SVG, PNG, or JPG up to 2MB" subtext)
- "Primary Brand Color" with a color picker input showing blue-600 (#2563eb) with a small color swatch preview square next to the hex input
- "Accent Color" with color picker showing green-600

Section 3 — "Operational Defaults":
Title "Operational Defaults" in 16px semibold. Description "Default values applied to new orders and loads."
- "Default Equipment Type" dropdown (value: "Dry Van")
- "Default Currency" dropdown (value: "USD ($)")
- "Default Timezone" dropdown (value: "America/Chicago (CST)")
- "Auto-assign Load Numbers" toggle switch (on/blue-600) with description "Automatically generate sequential load numbers (FM-YYYY-XXXX)"
- "Require Rate Confirmation" toggle switch (on/blue-600) with description "Carriers must confirm rate before load is dispatched"
- "Enable Customer Portal" toggle switch (off/gray-300) with description "Allow customers to log in and track their shipments"

Each toggle has a label on the left and the switch on the right, with a small description below the label in 13px gray-500.

Section 4 — "Danger Zone":
Title "Danger Zone" in 16px semibold red-600. A red-50 background card with red-200 border, rounded-lg.
- "Delete Organization" with description "Permanently delete this organization and all associated data. This action cannot be undone." A red-600 outline "Delete Organization" button on the right.

Font: Inter, 14px base. Form inputs: gray-200 border, rounded-md, white background, 14px text. Focus ring: blue-600.
```

---

### 8. Login / Auth Page — Login

```
Design a Login page for a modern freight logistics TMS called "Ultra TMS." Use a clean, modern SaaS aesthetic similar to Linear.app or Vercel login pages.

Layout: Full-screen split layout. Left half (50% width) is the login form area with white background. Right half (50% width) is a brand/illustration area with a dark slate-900 background.

Left Side — Login Form:
Centered vertically and horizontally within the left half. Max-width 400px.

At the top: The "Ultra TMS" logo — a stylized truck icon in blue-600 next to "Ultra TMS" text in 28px semibold slate-900. Below the logo, "Transportation Management System" in 14px gray-500.

Spacing, then a welcome message: "Welcome back" in 24px semibold gray-900. Below: "Sign in to your account to continue" in 14px gray-500.

Form fields with generous spacing:
- "Email Address" label in 14px font-weight 500 gray-700, with a text input below, gray-200 border, rounded-md, placeholder "you@company.com", left-aligned mail icon inside the input in gray-400
- "Password" label in 14px font-weight 500 gray-700, with a password input below, gray-200 border, rounded-md, placeholder "Enter your password", right-aligned eye icon to toggle visibility in gray-400. Below the password field on the right: "Forgot password?" link in blue-600, 13px.

Below the form fields:
- "Remember me" checkbox on the left (gray-300 border, rounded, blue-600 when checked) with "Remember me for 30 days" label in 14px gray-600.

A full-width blue-600 "Sign In" button, rounded-md, 14px semibold white text, height 44px. On hover, blue-700.

Below the button, a horizontal divider with "or" text in the center (gray-400 text, gray-200 lines on either side).

Two social/SSO sign-in buttons, full width, outline style:
- "Continue with Google" with Google "G" icon on the left, gray-200 border, white background, 14px gray-700 text
- "Continue with Microsoft" with Microsoft icon on the left, same style

At the very bottom of the left side: "Don't have an account? Contact your administrator" in 14px gray-500, where "Contact your administrator" is a blue-600 link.

Right Side — Brand Area:
Dark slate-900 background filling the entire right half. Centered content:
- A large, subtle illustration or abstract graphic of a logistics network — stylized lines connecting city dots on a map outline, in blue-600 and blue-400 with low opacity, creating a modern data-visualization feel
- Below the illustration, a testimonial or tagline: "Streamline your freight operations from order to delivery" in 20px font-weight 500 white text, centered, max-width 360px
- Below the tagline: "Trusted by 500+ logistics companies across North America" in 14px white/70% opacity
- Three small company logos or placeholder logo shapes in white/30% opacity arranged horizontally below the trust statement

Footer: At the very bottom of the page (spanning full width), a subtle footer in 12px gray-400: "2025 Ultra TMS. All rights reserved." on the left, and "Privacy Policy | Terms of Service" links on the right.

Font: Inter, 14px base. The page should feel spacious with generous whitespace around the form elements.
```

---

## Prompt Construction Checklist

Use this checklist before pasting your prompt into Stitch to ensure quality output:

- [ ] **Layout described** — Sidebar, content area, grid columns, widths mentioned
- [ ] **Design aesthetic referenced** — "Modern SaaS similar to Linear.app" or similar
- [ ] **Realistic data included** — Real freight terminology, city names, load numbers, dollar amounts
- [ ] **Color palette specified** — slate-900 sidebar, white content, blue-600 primary, status badge colors
- [ ] **Typography mentioned** — Inter font, 14px base, specific sizes for headers
- [ ] **Component types named** — Data table, badge, card, tab, breadcrumb (use standard names)
- [ ] **Item counts given** — "Show 8 rows", "4 KPI cards", "5 Kanban lanes"
- [ ] **Status badges colored** — Green for success, yellow for pending, blue for active, red for error
- [ ] **Interactive elements noted** — Buttons, dropdowns, search inputs, toggles
- [ ] **Hierarchy clear** — Primary content described first, secondary details after

---

## Iterating on Stitch Results

After generating your first mockup in Stitch:

1. **Check layout accuracy** — Does the sidebar, header, and content structure match your intent?
2. **Check data realism** — Did Stitch use your provided data or substitute generic text?
3. **Check color consistency** — Are status badges, buttons, and sidebar using the correct colors?
4. **Refine and re-prompt** — Copy the prompt, adjust specific areas that need improvement, and regenerate. Stitch often improves with 2-3 iterations.

Common refinements:
- "Make the sidebar darker and narrower"
- "Add more whitespace between sections"
- "Make the table rows more compact with less padding"
- "Change the status badge style to pill-shaped with softer colors"
- "Add a subtle gray-50 background to the stats row"

---

## Adapting Prompts for Other Screens

To create a Stitch prompt for a new Ultra TMS screen:

1. **Start with the closest pattern** from the 8 examples above
2. **Replace the data** with the specific entity fields for your screen (reference the data dictionary)
3. **Adjust the layout** based on your screen's Section 3 (Layout Blueprint)
4. **Update the status badges** based on your screen's Section 6 (State Machine)
5. **Add screen-specific elements** (maps, charts, timelines, etc.)
6. **Paste into Section 14** of your screen design file

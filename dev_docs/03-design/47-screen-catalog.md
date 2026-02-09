# 47 - Complete Screen Catalog

> **SUPERSEDED (Feb 2026):** For current screen specs, see `dev_docs/12-Rabih-design-Process/00-global/00-master-screen-catalog.md` (detailed catalog with 15-section specs for 89 priority screens). For MVP scope, only ~30 screens are in the P0 plan — see `dev_docs/Claude-review-v1/04-screen-integration/03-screen-priority-matrix.md`.

**Total Screens: 362** across 38 services organized by module and user role access.

---

## Screen Summary by Category

| Category   | Services | Screens | % of Total |
| ---------- | -------- | ------- | ---------- |
| Core       | 7        | 78      | 22%        |
| Operations | 9        | 82      | 23%        |
| Platform   | 10       | 62      | 17%        |
| Support    | 2        | 12      | 3%         |
| Extended   | 9        | 100     | 28%        |
| Admin      | 1        | 28      | 8%         |
| **Total**  | **38**   | **362** | **100%**   |

---

## Core Services Screens (78)

### Service 01 - Auth & Admin (12 screens)

| #   | Screen           | Type   | Description              | Access    |
| --- | ---------------- | ------ | ------------------------ | --------- |
| 1   | Login            | auth   | Email/password with MFA  | Public    |
| 2   | Register         | auth   | New user registration    | Public    |
| 3   | Forgot Password  | auth   | Password reset request   | Public    |
| 4   | Reset Password   | auth   | Set new password         | Public    |
| 5   | MFA Setup        | auth   | Enable 2FA               | All Users |
| 6   | Profile Settings | form   | User profile management  | All Users |
| 7   | User Management  | list   | All users with roles     | Admin     |
| 8   | User Detail      | detail | Individual user settings | Admin     |
| 9   | Role Management  | list   | Roles and permissions    | Admin     |
| 10  | Role Editor      | form   | Create/edit roles        | Admin     |
| 11  | Tenant Settings  | form   | Company configuration    | Admin     |
| 12  | Security Log     | list   | Login history, sessions  | Admin     |

### Service 02 - CRM (12 screens)

| #   | Screen               | Type      | Description                  | Access       |
| --- | -------------------- | --------- | ---------------------------- | ------------ |
| 1   | CRM Dashboard        | dashboard | Pipeline, leads, activities  | Sales, Admin |
| 2   | Leads List           | list      | All leads with filtering     | Sales        |
| 3   | Lead Detail          | detail    | Lead profile with activities | Sales        |
| 4   | Companies List       | list      | All companies                | All Users    |
| 5   | Company Detail       | detail    | 360° customer view           | All Users    |
| 6   | Contacts List        | list      | All contacts                 | All Users    |
| 7   | Contact Detail       | detail    | Contact profile              | All Users    |
| 8   | Opportunities List   | list      | Sales pipeline               | Sales        |
| 9   | Opportunity Detail   | detail    | Deal details                 | Sales        |
| 10  | Activities Calendar  | calendar  | Tasks, calls, meetings       | All Users    |
| 11  | Territory Management | config    | Sales territory setup        | Admin        |
| 12  | Lead Import Wizard   | wizard    | Bulk lead import             | Sales, Admin |

### Service 03 - Sales (10 screens)

| #   | Screen              | Type      | Description               | Access       |
| --- | ------------------- | --------- | ------------------------- | ------------ |
| 1   | Sales Dashboard     | dashboard | Quote metrics, conversion | Sales, Admin |
| 2   | Quotes List         | list      | All quotes with status    | Sales        |
| 3   | Quote Detail        | detail    | Quote view with history   | Sales        |
| 4   | Quote Builder       | form      | Create/edit quotes        | Sales        |
| 5   | Rate Tables         | list      | Pricing tables            | Sales, Admin |
| 6   | Rate Table Editor   | form      | Edit rate tables          | Admin        |
| 7   | Lane Pricing        | list      | Lane-specific rates       | Sales        |
| 8   | Accessorial Charges | list      | Extra service pricing     | Admin        |
| 9   | Proposal Templates  | list      | Quote templates           | Admin        |
| 10  | Sales Reports       | report    | Win/loss analysis         | Sales, Admin |

### Service 04 - TMS Core (14 screens)

| #   | Screen                | Type      | Description               | Access          |
| --- | --------------------- | --------- | ------------------------- | --------------- |
| 1   | Operations Dashboard  | dashboard | Load status, KPIs         | Dispatch, Admin |
| 2   | Orders List           | list      | All orders                | All Users       |
| 3   | Order Detail          | detail    | Full order view           | All Users       |
| 4   | Order Entry           | form      | Create new order          | Sales, Dispatch |
| 5   | Loads List            | list      | All loads with status     | Dispatch        |
| 6   | Load Detail           | detail    | Load with stops, tracking | Dispatch        |
| 7   | Load Builder          | form      | Build load from order     | Dispatch        |
| 8   | Dispatch Board        | board     | Visual load assignment    | Dispatch        |
| 9   | Stop Management       | list      | Pickup/delivery stops     | Dispatch        |
| 10  | Tracking Map          | map       | Real-time load tracking   | All Users       |
| 11  | Status Updates        | list      | Load status history       | All Users       |
| 12  | Load Timeline         | timeline  | Visual load progress      | All Users       |
| 13  | Check Calls           | list      | Driver check-in history   | Dispatch        |
| 14  | Appointment Scheduler | calendar  | Pickup/delivery times     | Dispatch        |

### Service 05 - Carrier (12 screens)

| #   | Screen             | Type      | Description                | Access          |
| --- | ------------------ | --------- | -------------------------- | --------------- |
| 1   | Carrier Dashboard  | dashboard | Carrier metrics            | Dispatch, Admin |
| 2   | Carriers List      | list      | All carriers               | Dispatch        |
| 3   | Carrier Detail     | detail    | Full carrier profile       | Dispatch        |
| 4   | Carrier Onboarding | wizard    | New carrier setup          | Dispatch, Admin |
| 5   | Compliance Center  | dashboard | Insurance, authority       | Admin           |
| 6   | Insurance Tracking | list      | Insurance certificates     | Admin           |
| 7   | Equipment List     | list      | Carrier equipment          | Dispatch        |
| 8   | Carrier Scorecard  | report    | Performance metrics        | Dispatch, Admin |
| 9   | Lane Preferences   | list      | Preferred lanes            | Dispatch        |
| 10  | Carrier Contacts   | list      | Driver/dispatcher contacts | Dispatch        |
| 11  | FMCSA Lookup       | tool      | Authority verification     | Dispatch        |
| 12  | Preferred Carriers | list      | Favorite carriers          | Dispatch        |

### Service 06 - Accounting (14 screens)

| #   | Screen               | Type      | Description           | Access            |
| --- | -------------------- | --------- | --------------------- | ----------------- |
| 1   | Accounting Dashboard | dashboard | AR/AP overview        | Accounting, Admin |
| 2   | Invoices List        | list      | Customer invoices     | Accounting        |
| 3   | Invoice Detail       | detail    | Invoice with payments | Accounting        |
| 4   | Invoice Entry        | form      | Create invoice        | Accounting        |
| 5   | Carrier Payables     | list      | Bills to pay          | Accounting        |
| 6   | Bill Entry           | form      | Enter carrier bill    | Accounting        |
| 7   | Payments Received    | list      | Customer payments     | Accounting        |
| 8   | Payments Made        | list      | Carrier payments      | Accounting        |
| 9   | Payment Entry        | form      | Process payment       | Accounting        |
| 10  | Bank Reconciliation  | tool      | Match transactions    | Accounting        |
| 11  | GL Transactions      | list      | General ledger        | Accounting, Admin |
| 12  | Chart of Accounts    | list      | Account setup         | Admin             |
| 13  | Financial Reports    | report    | P&L, Balance Sheet    | Accounting, Admin |
| 14  | AR Aging Report      | report    | Receivables aging     | Accounting        |

### Service 07 - Load Board Internal (4 screens)

| #   | Screen         | Type   | Description              | Access   |
| --- | -------------- | ------ | ------------------------ | -------- |
| 1   | Load Board     | board  | Available loads          | Dispatch |
| 2   | Post Load      | form   | Create load posting      | Dispatch |
| 3   | Load Matching  | tool   | Match loads to carriers  | Dispatch |
| 4   | Board Settings | config | Load board configuration | Admin    |

---

## Operations Services Screens (82)

### Service 08 - Commission (6 screens)

| #   | Screen                | Type      | Description           | Access            |
| --- | --------------------- | --------- | --------------------- | ----------------- |
| 1   | Commission Dashboard  | dashboard | Earnings overview     | Sales, Admin      |
| 2   | Commission Plans      | list      | Plan configuration    | Admin             |
| 3   | Plan Editor           | form      | Create/edit plans     | Admin             |
| 4   | Commission Calculator | tool      | Calculate commissions | Accounting        |
| 5   | Commission Statements | list      | Agent statements      | Sales, Accounting |
| 6   | Payout History        | list      | Payment history       | Sales, Accounting |

### Service 09 - Claims (10 screens)

| #   | Screen                 | Type      | Description           | Access            |
| --- | ---------------------- | --------- | --------------------- | ----------------- |
| 1   | Claims Dashboard       | dashboard | Claim status overview | Operations, Admin |
| 2   | Claims List            | list      | All claims            | Operations        |
| 3   | Claim Detail           | detail    | Full claim record     | Operations        |
| 4   | New Claim              | form      | File new claim        | Operations        |
| 5   | Claim Investigation    | form      | Investigation notes   | Operations        |
| 6   | Damage Photos          | gallery   | Claim photo evidence  | Operations        |
| 7   | Settlement Calculator  | tool      | Calculate settlement  | Operations        |
| 8   | Claim Resolution       | form      | Resolve claim         | Admin             |
| 9   | Claims Report          | report    | Claims analysis       | Admin             |
| 10  | Carrier Claims History | list      | Claims by carrier     | Operations        |

### Service 10 - Documents (8 screens)

| #   | Screen           | Type   | Description        | Access    |
| --- | ---------------- | ------ | ------------------ | --------- |
| 1   | Document Library | list   | All documents      | All Users |
| 2   | Document Viewer  | viewer | View documents     | All Users |
| 3   | Document Upload  | form   | Upload documents   | All Users |
| 4   | Template Manager | list   | Document templates | Admin     |
| 5   | Template Editor  | form   | Edit templates     | Admin     |
| 6   | E-Signature      | tool   | Sign documents     | All Users |
| 7   | Document Scanner | tool   | Scan/OCR documents | All Users |
| 8   | Document Reports | report | Document analytics | Admin     |

### Service 11 - Communication (10 screens)

| #   | Screen              | Type      | Description         | Access    |
| --- | ------------------- | --------- | ------------------- | --------- |
| 1   | Communication Hub   | dashboard | All messages        | All Users |
| 2   | Inbox               | list      | Received messages   | All Users |
| 3   | Compose Email       | form      | Send email          | All Users |
| 4   | SMS Compose         | form      | Send SMS            | Dispatch  |
| 5   | Email Templates     | list      | Email templates     | Admin     |
| 6   | SMS Templates       | list      | SMS templates       | Admin     |
| 7   | Notification Center | list      | User notifications  | All Users |
| 8   | Communication Log   | list      | All communications  | Admin     |
| 9   | Auto-Message Rules  | list      | Automated messages  | Admin     |
| 10  | Bulk Messaging      | tool      | Mass communications | Admin     |

### Service 12 - Customer Portal (10 screens)

| #   | Screen           | Type      | Description          | Access   |
| --- | ---------------- | --------- | -------------------- | -------- |
| 1   | Portal Dashboard | dashboard | Shipment overview    | Customer |
| 2   | My Shipments     | list      | Customer's loads     | Customer |
| 3   | Shipment Detail  | detail    | Load tracking        | Customer |
| 4   | Request Quote    | form      | Submit quote request | Customer |
| 5   | My Quotes        | list      | Quote history        | Customer |
| 6   | My Invoices      | list      | Invoice history      | Customer |
| 7   | Documents        | list      | Shared documents     | Customer |
| 8   | Report Issue     | form      | Report problems      | Customer |
| 9   | My Profile       | form      | Account settings     | Customer |
| 10  | Track Shipment   | map       | Real-time tracking   | Customer |

### Service 13 - Carrier Portal (12 screens)

| #   | Screen            | Type      | Description             | Access  |
| --- | ----------------- | --------- | ----------------------- | ------- |
| 1   | Portal Dashboard  | dashboard | Load overview           | Carrier |
| 2   | Available Loads   | list      | Loads to accept         | Carrier |
| 3   | My Loads          | list      | Assigned loads          | Carrier |
| 4   | Load Detail       | detail    | Load information        | Carrier |
| 5   | Accept Load       | form      | Confirm load acceptance | Carrier |
| 6   | Update Status     | form      | Submit status update    | Carrier |
| 7   | Upload POD        | form      | Submit POD documents    | Carrier |
| 8   | My Payments       | list      | Payment history         | Carrier |
| 9   | My Documents      | list      | Compliance docs         | Carrier |
| 10  | Update Documents  | form      | Upload documents        | Carrier |
| 11  | My Profile        | form      | Company settings        | Carrier |
| 12  | Request Quick Pay | form      | Request early payment   | Carrier |

### Service 14 - Contracts (8 screens)

| #   | Screen              | Type      | Description          | Access          |
| --- | ------------------- | --------- | -------------------- | --------------- |
| 1   | Contracts Dashboard | dashboard | Contract overview    | Admin           |
| 2   | Customer Contracts  | list      | Customer agreements  | Sales, Admin    |
| 3   | Carrier Contracts   | list      | Carrier agreements   | Dispatch, Admin |
| 4   | Contract Detail     | detail    | Contract terms       | Admin           |
| 5   | Contract Editor     | form      | Create/edit contract | Admin           |
| 6   | Contract Templates  | list      | Contract templates   | Admin           |
| 7   | Renewal Queue       | list      | Expiring contracts   | Admin           |
| 8   | Contract Reports    | report    | Contract analytics   | Admin           |

### Service 15 - Agent (8 screens)

| #   | Screen            | Type      | Description         | Access     |
| --- | ----------------- | --------- | ------------------- | ---------- |
| 1   | Agent Dashboard   | dashboard | Agent overview      | Admin      |
| 2   | Agents List       | list      | All agents          | Admin      |
| 3   | Agent Detail      | detail    | Agent profile       | Admin      |
| 4   | Agent Onboarding  | wizard    | New agent setup     | Admin      |
| 5   | Agent Commissions | list      | Agent earnings      | Accounting |
| 6   | Agent Customers   | list      | Assigned customers  | Admin      |
| 7   | Agent Performance | report    | Performance metrics | Admin      |
| 8   | Agent Settlements | list      | Settlement history  | Accounting |

### Service 16 - Credit (10 screens) **NEW**

| #   | Screen              | Type      | Description             | Access            |
| --- | ------------------- | --------- | ----------------------- | ----------------- |
| 1   | Credit Dashboard    | dashboard | Credit overview         | Accounting, Admin |
| 2   | Credit Applications | list      | Pending applications    | Accounting        |
| 3   | Application Review  | form      | Review/approve credit   | Admin             |
| 4   | Credit Limits       | list      | Customer limits         | Accounting        |
| 5   | Credit Limit Editor | form      | Set/modify limits       | Admin             |
| 6   | Credit Holds        | list      | Active holds            | Accounting        |
| 7   | Collections Queue   | list      | Past due accounts       | Accounting        |
| 8   | Collection Activity | form      | Log collection activity | Accounting        |
| 9   | Payment Plans       | list      | Active payment plans    | Accounting        |
| 10  | Credit Reports      | report    | Aging, risk analysis    | Admin             |

---

## Platform Services Screens (62)

### Service 17 - Factoring Internal (6 screens)

| #   | Screen              | Type      | Description        | Access     |
| --- | ------------------- | --------- | ------------------ | ---------- |
| 1   | Quick Pay Dashboard | dashboard | Factoring overview | Accounting |
| 2   | Quick Pay Requests  | list      | Pending requests   | Accounting |
| 3   | Request Detail      | detail    | Request details    | Accounting |
| 4   | Approve Request     | form      | Approve quick pay  | Accounting |
| 5   | Factoring Settings  | config    | Configuration      | Admin      |
| 6   | Factoring Reports   | report    | Analysis           | Admin      |

### Service 18 - HR (10 screens)

| #   | Screen              | Type      | Description            | Access    |
| --- | ------------------- | --------- | ---------------------- | --------- |
| 1   | HR Dashboard        | dashboard | Employee overview      | Admin     |
| 2   | Employees List      | list      | All employees          | Admin     |
| 3   | Employee Detail     | detail    | Employee profile       | Admin     |
| 4   | Employee Onboarding | wizard    | New hire setup         | Admin     |
| 5   | Time Off Requests   | list      | Leave requests         | Admin     |
| 6   | Time Off Calendar   | calendar  | Leave calendar         | All Users |
| 7   | Performance Reviews | list      | Review cycles          | Admin     |
| 8   | Org Chart           | chart     | Organization structure | All Users |
| 9   | Training Records    | list      | Training completion    | Admin     |
| 10  | HR Reports          | report    | HR analytics           | Admin     |

### Service 19 - Analytics (10 screens)

| #   | Screen               | Type      | Description           | Access     |
| --- | -------------------- | --------- | --------------------- | ---------- |
| 1   | Analytics Home       | dashboard | KPI overview          | Admin      |
| 2   | Operations Dashboard | dashboard | Load/carrier metrics  | Operations |
| 3   | Financial Dashboard  | dashboard | Revenue/margin        | Accounting |
| 4   | Sales Dashboard      | dashboard | Pipeline/conversion   | Sales      |
| 5   | Report Library       | list      | All reports           | All Users  |
| 6   | Report Viewer        | report    | View report           | All Users  |
| 7   | Report Builder       | tool      | Create custom reports | Admin      |
| 8   | Scheduled Reports    | list      | Automated reports     | Admin      |
| 9   | Dashboard Builder    | tool      | Create dashboards     | Admin      |
| 10  | Data Explorer        | tool      | Ad-hoc queries        | Admin      |

### Service 20 - Workflow (8 screens)

| #   | Screen                | Type      | Description             | Access |
| --- | --------------------- | --------- | ----------------------- | ------ |
| 1   | Automation Center     | dashboard | Active automations      | Admin  |
| 2   | Workflow List         | list      | All workflows           | Admin  |
| 3   | Workflow Designer     | designer  | Visual workflow builder | Admin  |
| 4   | Trigger Configuration | form      | Set trigger conditions  | Admin  |
| 5   | Action Library        | list      | Available actions       | Admin  |
| 6   | Workflow History      | list      | Execution history       | Admin  |
| 7   | Error Queue           | list      | Failed executions       | Admin  |
| 8   | Workflow Templates    | list      | Pre-built workflows     | Admin  |

### Service 21 - Integration Hub (10 screens)

| #   | Screen                | Type      | Description            | Access |
| --- | --------------------- | --------- | ---------------------- | ------ |
| 1   | Integration Dashboard | dashboard | Connection status      | Admin  |
| 2   | Connected Apps        | list      | Active integrations    | Admin  |
| 3   | App Marketplace       | gallery   | Available integrations | Admin  |
| 4   | Connection Setup      | wizard    | Configure integration  | Admin  |
| 5   | Webhook Manager       | list      | Outbound webhooks      | Admin  |
| 6   | API Keys              | list      | API key management     | Admin  |
| 7   | API Documentation     | docs      | API reference          | Admin  |
| 8   | Sync Status           | list      | Data sync status       | Admin  |
| 9   | Integration Logs      | list      | API call history       | Admin  |
| 10  | Field Mapping         | form      | Map external fields    | Admin  |

### Service 22 - Search (4 screens)

| #   | Screen               | Type   | Description         | Access    |
| --- | -------------------- | ------ | ------------------- | --------- |
| 1   | Global Search        | search | Cross-entity search | All Users |
| 2   | Advanced Search      | form   | Complex queries     | All Users |
| 3   | Saved Searches       | list   | User saved searches | All Users |
| 4   | Search Configuration | config | Index settings      | Admin     |

### Service 23 - Audit (6 screens)

| #   | Screen            | Type      | Description         | Access |
| --- | ----------------- | --------- | ------------------- | ------ |
| 1   | Audit Dashboard   | dashboard | Activity overview   | Admin  |
| 2   | Audit Log         | list      | All audit entries   | Admin  |
| 3   | Change History    | list      | Record changes      | Admin  |
| 4   | Access Log        | list      | User access history | Admin  |
| 5   | Compliance Report | report    | Compliance audit    | Admin  |
| 6   | Data Export       | tool      | Audit data export   | Admin  |

### Service 24 - Config (8 screens)

| #   | Screen              | Type      | Description           | Access |
| --- | ------------------- | --------- | --------------------- | ------ |
| 1   | Settings Home       | dashboard | All settings          | Admin  |
| 2   | Company Settings    | form      | Company configuration | Admin  |
| 3   | Feature Flags       | list      | Feature toggles       | Admin  |
| 4   | Custom Fields       | list      | Field configuration   | Admin  |
| 5   | Custom Field Editor | form      | Define custom field   | Admin  |
| 6   | Dropdown Options    | list      | Picklist values       | Admin  |
| 7   | Business Rules      | list      | Validation rules      | Admin  |
| 8   | Default Values      | form      | System defaults       | Admin  |

### Service 25 - Scheduler (6 screens)

| #   | Screen              | Type      | Description          | Access    |
| --- | ------------------- | --------- | -------------------- | --------- |
| 1   | Scheduler Dashboard | dashboard | Job overview         | Admin     |
| 2   | Scheduled Jobs      | list      | All jobs             | Admin     |
| 3   | Job Editor          | form      | Configure job        | Admin     |
| 4   | Job History         | list      | Execution history    | Admin     |
| 5   | Reminders           | list      | User reminders       | All Users |
| 6   | Calendar Sync       | config    | Calendar integration | Admin     |

### Service 26 - Cache (4 screens)

| #   | Screen          | Type      | Description          | Access      |
| --- | --------------- | --------- | -------------------- | ----------- |
| 1   | Cache Dashboard | dashboard | Cache metrics        | Super Admin |
| 2   | Cache Keys      | list      | Active cache entries | Super Admin |
| 3   | Cache Stats     | report    | Performance stats    | Super Admin |
| 4   | Cache Flush     | tool      | Clear cache          | Super Admin |

---

## Support Services Screens (12)

### Service 27 - Help Desk (6 screens)

| #   | Screen            | Type      | Description         | Access    |
| --- | ----------------- | --------- | ------------------- | --------- |
| 1   | Support Dashboard | dashboard | Ticket overview     | Support   |
| 2   | Ticket List       | list      | All tickets         | Support   |
| 3   | Ticket Detail     | detail    | Ticket conversation | Support   |
| 4   | New Ticket        | form      | Create ticket       | All Users |
| 5   | Knowledge Base    | search    | Help articles       | All Users |
| 6   | Article Editor    | form      | Write KB articles   | Support   |

### Service 28 - Feedback (6 screens)

| #   | Screen             | Type      | Description           | Access    |
| --- | ------------------ | --------- | --------------------- | --------- |
| 1   | Feedback Dashboard | dashboard | NPS/feedback overview | Admin     |
| 2   | Survey Results     | list      | Survey responses      | Admin     |
| 3   | Feature Requests   | list      | User requests         | Admin     |
| 4   | Submit Feedback    | form      | Give feedback         | All Users |
| 5   | NPS Survey         | form      | NPS rating            | All Users |
| 6   | Feedback Report    | report    | Feedback analysis     | Admin     |

---

## Extended Services Screens (100)

### Service 29 - EDI (8 screens)

| #   | Screen             | Type      | Description           | Access     |
| --- | ------------------ | --------- | --------------------- | ---------- |
| 1   | EDI Dashboard      | dashboard | Transaction overview  | Admin      |
| 2   | Trading Partners   | list      | EDI partners          | Admin      |
| 3   | Partner Setup      | wizard    | Configure partner     | Admin      |
| 4   | Inbound Queue      | list      | Received transactions | Operations |
| 5   | Outbound Queue     | list      | Sent transactions     | Operations |
| 6   | Transaction Detail | detail    | EDI document view     | Operations |
| 7   | Error Queue        | list      | Failed transactions   | Admin      |
| 8   | EDI Mapping        | form      | Field mapping         | Admin      |

### Service 30 - Safety (10 screens)

| #   | Screen             | Type      | Description                | Access          |
| --- | ------------------ | --------- | -------------------------- | --------------- |
| 1   | Safety Dashboard   | dashboard | Fleet safety overview      | Admin           |
| 2   | CSA Scores         | list      | Carrier CSA data           | Dispatch, Admin |
| 3   | CSA Detail         | detail    | BASIC breakdown            | Dispatch        |
| 4   | Safety Ratings     | list      | Carrier safety ratings     | Dispatch        |
| 5   | Insurance Monitor  | list      | Insurance status           | Admin           |
| 6   | Authority Monitor  | list      | Authority changes          | Admin           |
| 7   | DQF Manager        | list      | Driver qualification files | Admin           |
| 8   | Incident Log       | list      | Safety incidents           | Admin           |
| 9   | Watchlist          | list      | Flagged carriers           | Dispatch        |
| 10  | Compliance Reports | report    | Safety compliance          | Admin           |

### Service 31 - Fuel Cards (8 screens)

| #   | Screen           | Type      | Description         | Access     |
| --- | ---------------- | --------- | ------------------- | ---------- |
| 1   | Fuel Dashboard   | dashboard | Fuel spend overview | Accounting |
| 2   | Transactions     | list      | Fuel transactions   | Accounting |
| 3   | Fuel Advances    | list      | Advance requests    | Accounting |
| 4   | Advance Request  | form      | Create advance      | Dispatch   |
| 5   | Cards Management | list      | Active cards        | Admin      |
| 6   | Provider Setup   | config    | Card provider setup | Admin      |
| 7   | Fraud Alerts     | list      | Suspicious activity | Admin      |
| 8   | IFTA Report      | report    | Fuel tax report     | Accounting |

### Service 32 - Factoring External (8 screens)

| #   | Screen              | Type      | Description          | Access     |
| --- | ------------------- | --------- | -------------------- | ---------- |
| 1   | Factoring Dashboard | dashboard | Quick pay overview   | Accounting |
| 2   | Quick Pay Requests  | list      | Pending requests     | Accounting |
| 3   | Quick Pay Detail    | detail    | Request details      | Accounting |
| 4   | Factoring Setup     | config    | Factor configuration | Admin      |
| 5   | NOA Management      | list      | Notice of assignment | Admin      |
| 6   | Verification Log    | list      | Factor verifications | Accounting |
| 7   | Reserve Account     | list      | Reserve tracking     | Accounting |
| 8   | Factoring Reports   | report    | Factoring analysis   | Admin      |

### Service 33 - Load Board External (8 screens)

| #   | Screen               | Type      | Description         | Access   |
| --- | -------------------- | --------- | ------------------- | -------- |
| 1   | Load Board Dashboard | dashboard | Posting overview    | Dispatch |
| 2   | Posted Loads         | list      | Active postings     | Dispatch |
| 3   | Post Load            | form      | Create posting      | Dispatch |
| 4   | Capacity Search      | tool      | Find trucks         | Dispatch |
| 5   | Bid Management       | list      | Carrier bids        | Dispatch |
| 6   | Lead Inbox           | list      | Carrier inquiries   | Dispatch |
| 7   | Board Connections    | config    | DAT/Truckstop setup | Admin    |
| 8   | Posting Rules        | list      | Auto-post rules     | Admin    |

### Service 34 - Mobile App (8 screens)

| #   | Screen             | Type      | Description          | Access   |
| --- | ------------------ | --------- | -------------------- | -------- |
| 1   | Mobile Dashboard   | dashboard | App usage stats      | Admin    |
| 2   | Device Management  | list      | Registered devices   | Admin    |
| 3   | Push Notifications | list      | Notification history | Admin    |
| 4   | Push Composer      | form      | Send notification    | Admin    |
| 5   | Offline Sync       | list      | Sync queue status    | Admin    |
| 6   | Location History   | map       | Driver locations     | Dispatch |
| 7   | App Configuration  | config    | Mobile settings      | Admin    |
| 8   | Feature Flags      | list      | Mobile features      | Admin    |

### Service 35 - Rate Intelligence (8 screens) **NEW**

| #   | Screen           | Type      | Description          | Access          |
| --- | ---------------- | --------- | -------------------- | --------------- |
| 1   | Market Dashboard | dashboard | Rate trends          | Sales, Dispatch |
| 2   | Rate Lookup      | tool      | Search lane rates    | Sales, Dispatch |
| 3   | Rate History     | chart     | Historical rates     | Sales           |
| 4   | Rate Alerts      | list      | Alert configuration  | Sales, Admin    |
| 5   | Alert Editor     | form      | Create/edit alerts   | Sales, Admin    |
| 6   | Lane Analysis    | report    | Lane profitability   | Admin           |
| 7   | Market Reports   | report    | Market intelligence  | Admin           |
| 8   | Provider Setup   | config    | DAT/Truckstop config | Admin           |

### Service 36 - ELD (8 screens) **NEW**

| #   | Screen            | Type      | Description         | Access          |
| --- | ----------------- | --------- | ------------------- | --------------- |
| 1   | ELD Dashboard     | dashboard | Fleet HOS overview  | Dispatch        |
| 2   | Driver HOS        | list      | Hours of service    | Dispatch        |
| 3   | Driver Detail     | detail    | Individual HOS      | Dispatch        |
| 4   | Violations        | list      | HOS violations      | Dispatch, Admin |
| 5   | Vehicle Locations | map       | Fleet tracking      | Dispatch        |
| 6   | Trip History      | list      | Driver trips        | Dispatch        |
| 7   | ELD Devices       | list      | Connected devices   | Admin           |
| 8   | Provider Setup    | config    | ELD provider config | Admin           |

### Service 37 - Cross-Border (10 screens) **NEW**

| #   | Screen                 | Type      | Description            | Access     |
| --- | ---------------------- | --------- | ---------------------- | ---------- |
| 1   | Cross-Border Dashboard | dashboard | Active crossings       | Operations |
| 2   | Shipments List         | list      | Cross-border shipments | Operations |
| 3   | Shipment Detail        | detail    | Full shipment info     | Operations |
| 4   | Document Manager       | list      | Required documents     | Operations |
| 5   | Broker Directory       | list      | Customs brokers        | Operations |
| 6   | Permits List           | list      | Active permits         | Admin      |
| 7   | Permit Application     | form      | Apply for permits      | Admin      |
| 8   | Border Status          | dashboard | Port wait times        | Operations |
| 9   | Crossing History       | list      | Past crossings         | Operations |
| 10  | Compliance Check       | tool      | Document verification  | Operations |

---

## Admin Services Screens (28)

### Service 38 - Super Admin (28 screens)

| #   | Screen               | Type      | Description           | Access      |
| --- | -------------------- | --------- | --------------------- | ----------- |
| 1   | Platform Dashboard   | dashboard | System health         | Super Admin |
| 2   | Tenant List          | list      | All tenants           | Super Admin |
| 3   | Tenant Detail        | detail    | Tenant configuration  | Super Admin |
| 4   | Create Tenant        | wizard    | New tenant setup      | Super Admin |
| 5   | Tenant Settings      | form      | Tenant configuration  | Super Admin |
| 6   | Subscription Plans   | list      | Available plans       | Super Admin |
| 7   | Plan Editor          | form      | Create/edit plans     | Super Admin |
| 8   | Tenant Subscriptions | list      | Active subscriptions  | Super Admin |
| 9   | Billing Dashboard    | dashboard | Revenue overview      | Super Admin |
| 10  | Invoices             | list      | Platform invoices     | Super Admin |
| 11  | Payments             | list      | Payment history       | Super Admin |
| 12  | Usage Metrics        | report    | Tenant usage          | Super Admin |
| 13  | Platform Users       | list      | Admin users           | Super Admin |
| 14  | Platform User Editor | form      | Admin user setup      | Super Admin |
| 15  | Impersonation        | tool      | Access tenant account | Super Admin |
| 16  | Impersonation Log    | list      | Impersonation history | Super Admin |
| 17  | Announcements        | list      | Platform messages     | Super Admin |
| 18  | Announcement Editor  | form      | Create announcement   | Super Admin |
| 19  | System Health        | dashboard | Infrastructure status | Super Admin |
| 20  | API Metrics          | dashboard | API performance       | Super Admin |
| 21  | Error Log            | list      | Platform errors       | Super Admin |
| 22  | Platform Audit Log   | list      | Admin actions         | Super Admin |
| 23  | Feature Flags        | list      | Global features       | Super Admin |
| 24  | System Config        | form      | Platform settings     | Super Admin |
| 25  | Data Export          | tool      | Tenant data export    | Super Admin |
| 26  | Support Dashboard    | dashboard | Support overview      | Super Admin |
| 27  | Tenant Diagnostics   | tool      | Troubleshooting       | Super Admin |
| 28  | Database Admin       | tool      | DB management         | Super Admin |

---

## Screen Types Summary

| Type      | Count   | Description                |
| --------- | ------- | -------------------------- |
| dashboard | 42      | Overview/KPI screens       |
| list      | 134     | Data tables with filtering |
| detail    | 34      | Single record view         |
| form      | 62      | Data entry/edit            |
| report    | 26      | Analytics/reports          |
| tool      | 24      | Utility functions          |
| wizard    | 10      | Multi-step processes       |
| config    | 14      | Settings configuration     |
| map       | 8       | Geographic displays        |
| calendar  | 4       | Date-based views           |
| chart     | 2       | Data visualization         |
| search    | 2       | Search interfaces          |
| **Total** | **362** |                            |

---

_Last Updated: January 2025_

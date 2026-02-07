# 06 - Role-Based Views

> How each of the 11 user roles sees different navigation, actions, and data across the Ultra TMS system.

---

## Overview

Ultra TMS implements granular role-based access control (RBAC) that governs three layers of the user experience:

1. **Navigation** - Which sidebar menu items and top-level sections a role can see
2. **Screen Permissions** - What a user can do on each screen (view, create, edit, delete, approve, etc.)
3. **Data Visibility** - Which data fields and records are exposed or hidden per role

There are **11 defined roles** split into two categories:

**Internal Roles (9)**

| # | Role | Slug | Scope |
|---|------|------|-------|
| 1 | Super Admin | `super_admin` | Platform-level access across all tenants |
| 2 | Admin | `admin` | Tenant-level full access within one organization |
| 3 | Operations Manager | `ops_manager` | Operations oversight - orders, loads, dispatch, tracking |
| 4 | Dispatcher | `dispatcher` | Dispatch focus - load assignment, carrier coordination, tracking |
| 5 | Sales Agent | `sales_agent` | CRM and quoting - leads, customers, quotes |
| 6 | Accounting | `accounting` | Financial - invoices, payments, settlements, receivables |
| 7 | Carrier Relations | `carrier_relations` | Carrier management - onboarding, compliance, scorecards |
| 8 | Support | `support` | Limited operations - view most screens, restricted writes |
| 9 | Read Only | `read_only` | View only - no create, edit, or delete anywhere |

**External / Portal Roles (2)**

| # | Role | Slug | Scope |
|---|------|------|-------|
| 10 | Customer Portal User | `customer_portal` | Shipper self-service - their own orders, tracking, documents |
| 11 | Carrier Portal User / Driver | `carrier_portal` | Carrier/driver self-service - their own loads, check calls, documents |

---

## Navigation Access Matrix

This table defines which sidebar menu items each **internal** role can see. Portal users have entirely separate navigation shells and are covered in a later section.

Legend: Y = Visible, -- = Hidden

### Primary Navigation

| Menu Item | Super Admin | Admin | Ops Mgr | Dispatcher | Sales | Accounting | Carrier Rel | Support | Read Only |
|-----------|:-----------:|:-----:|:-------:|:----------:|:-----:|:----------:|:-----------:|:-------:|:---------:|
| **Dashboard** | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| **CRM** | | | | | | | | | |
| - Leads | Y | Y | -- | -- | Y | -- | -- | Y | Y |
| - Customers | Y | Y | Y | -- | Y | Y | -- | Y | Y |
| - Contacts | Y | Y | Y | -- | Y | Y | -- | Y | Y |
| **Sales** | | | | | | | | | |
| - Quotes | Y | Y | Y | -- | Y | -- | -- | Y | Y |
| - Rate Requests | Y | Y | Y | -- | Y | -- | Y | Y | Y |
| - Lane History | Y | Y | Y | -- | Y | -- | Y | Y | Y |
| **Operations** | | | | | | | | | |
| - Orders | Y | Y | Y | Y | -- | -- | -- | Y | Y |
| - Loads | Y | Y | Y | Y | -- | -- | -- | Y | Y |
| - Dispatch Board | Y | Y | Y | Y | -- | -- | -- | -- | -- |
| - Tracking Map | Y | Y | Y | Y | -- | -- | -- | Y | Y |
| - Check Calls | Y | Y | Y | Y | -- | -- | -- | Y | Y |
| - Stop Management | Y | Y | Y | Y | -- | -- | -- | Y | Y |
| **Carriers** | | | | | | | | | |
| - Carrier Directory | Y | Y | Y | Y | -- | -- | Y | Y | Y |
| - Onboarding | Y | Y | -- | -- | -- | -- | Y | -- | -- |
| - Compliance | Y | Y | -- | -- | -- | -- | Y | -- | Y |
| - Scorecards | Y | Y | Y | -- | -- | -- | Y | Y | Y |
| - Insurance Tracking | Y | Y | -- | -- | -- | -- | Y | -- | Y |
| **Accounting** | | | | | | | | | |
| - Invoices (AR) | Y | Y | -- | -- | -- | Y | -- | -- | -- |
| - Carrier Pay (AP) | Y | Y | -- | -- | -- | Y | -- | -- | -- |
| - Settlements | Y | Y | -- | -- | -- | Y | -- | -- | -- |
| - Aging Reports | Y | Y | -- | -- | -- | Y | -- | -- | -- |
| - Payment History | Y | Y | -- | -- | -- | Y | -- | -- | -- |
| **Reports** | | | | | | | | | |
| - Operations Reports | Y | Y | Y | -- | -- | -- | -- | Y | Y |
| - Financial Reports | Y | Y | -- | -- | -- | Y | -- | -- | -- |
| - Sales Reports | Y | Y | -- | -- | Y | -- | -- | -- | -- |
| - Carrier Reports | Y | Y | Y | -- | -- | -- | Y | -- | Y |
| - Custom Reports | Y | Y | -- | -- | -- | -- | -- | -- | -- |
| **Admin** | | | | | | | | | |
| - Users & Roles | Y | Y | -- | -- | -- | -- | -- | -- | -- |
| - Tenant Settings | Y | Y | -- | -- | -- | -- | -- | -- | -- |
| - Audit Log | Y | Y | -- | -- | -- | -- | -- | -- | -- |
| - Integrations | Y | Y | -- | -- | -- | -- | -- | -- | -- |
| - Workflow Rules | Y | Y | -- | -- | -- | -- | -- | -- | -- |
| **Settings** | | | | | | | | | |
| - My Profile | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| - Notifications | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| - Platform Config | Y | -- | -- | -- | -- | -- | -- | -- | -- |

### Dashboard Variants

Each role sees a dashboard tailored to their function. The widgets and KPIs shown differ per role:

| Role | Dashboard Widgets |
|------|-------------------|
| Super Admin | Platform health, tenant overview, system metrics, global KPIs |
| Admin | Tenant-wide KPIs, revenue, load counts, team performance, alerts |
| Ops Manager | Active orders, loads in transit, on-time %, exception alerts, dispatch utilization |
| Dispatcher | Dispatch board summary, unassigned loads, in-transit count, check call alerts |
| Sales Agent | Pipeline value, quote win rate, customer activity, lead follow-ups |
| Accounting | Outstanding AR, AP due, aging summary, settlement queue, payment alerts |
| Carrier Relations | Carrier compliance status, expiring insurance, onboarding queue, scorecard trends |
| Support | Open orders, recent exceptions, customer inquiries, escalation queue |
| Read Only | Summary KPIs only (same widgets as Ops Manager, no action buttons) |

---

## Screen-Level Permissions

For each major screen, this table defines what actions each role can perform. Portal users are excluded here and covered separately below.

Legend:
- **V** = View / Read
- **C** = Create / New
- **E** = Edit / Update
- **D** = Delete
- **X** = Export / Download
- **A** = Approve / Authorize
- **S** = Assign / Reassign
- **P** = Print
- **--** = No access to this screen

### CRM & Sales Screens

| Screen | Super Admin | Admin | Ops Mgr | Dispatcher | Sales | Accounting | Carrier Rel | Support | Read Only |
|--------|:-----------:|:-----:|:-------:|:----------:|:-----:|:----------:|:-----------:|:-------:|:---------:|
| Leads List | V,C,E,D,X | V,C,E,D,X | -- | -- | V,C,E,X | -- | -- | V | V |
| Lead Detail | V,C,E,D | V,C,E,D | -- | -- | V,C,E | -- | -- | V | V |
| Customer List | V,C,E,D,X | V,C,E,D,X | V,X | -- | V,C,E,X | V,X | -- | V | V |
| Customer Detail | V,C,E,D | V,C,E,D | V,E | -- | V,C,E | V | -- | V | V |
| Contact List | V,C,E,D,X | V,C,E,D,X | V,X | -- | V,C,E,X | V,X | -- | V | V |
| Contact Detail | V,C,E,D | V,C,E,D | V,E | -- | V,C,E | V | -- | V | V |
| Quote List | V,C,E,D,X | V,C,E,D,X | V,E,A,X | -- | V,C,E,X | -- | -- | V | V |
| Quote Detail | V,C,E,D,A | V,C,E,D,A | V,E,A | -- | V,C,E | -- | -- | V | V |
| Quote Approval | V,A | V,A | V,A | -- | V | -- | -- | -- | -- |

### Operations Screens

| Screen | Super Admin | Admin | Ops Mgr | Dispatcher | Sales | Accounting | Carrier Rel | Support | Read Only |
|--------|:-----------:|:-----:|:-------:|:----------:|:-----:|:----------:|:-----------:|:-------:|:---------:|
| Order List | V,C,E,D,X | V,C,E,D,X | V,C,E,D,X | V,E,X | -- | -- | -- | V,X | V |
| Order Detail | V,C,E,D,A | V,C,E,D,A | V,C,E,D,A | V,E | -- | -- | -- | V | V |
| Order Cancel | V,A | V,A | V,A | -- | -- | -- | -- | -- | -- |
| Load List | V,C,E,D,X | V,C,E,D,X | V,C,E,D,X | V,C,E,X | -- | -- | -- | V,X | V |
| Load Detail | V,C,E,D,S | V,C,E,D,S | V,C,E,D,S | V,E,S | -- | -- | -- | V | V |
| Dispatch Board | V,S | V,S | V,S | V,S | -- | -- | -- | -- | -- |
| Tracking Map | V | V | V | V | -- | -- | -- | V | V |
| Check Call Log | V,C,E | V,C,E | V,C,E | V,C,E | -- | -- | -- | V | V |
| Stop Detail | V,C,E | V,C,E | V,C,E | V,C,E | -- | -- | -- | V | V |
| Document Upload | V,C,D | V,C,D | V,C,D | V,C | -- | V,C | -- | V | V |

### Carrier Screens

| Screen | Super Admin | Admin | Ops Mgr | Dispatcher | Sales | Accounting | Carrier Rel | Support | Read Only |
|--------|:-----------:|:-----:|:-------:|:----------:|:-----:|:----------:|:-----------:|:-------:|:---------:|
| Carrier Directory | V,C,E,D,X | V,C,E,D,X | V,X | V,X | -- | -- | V,C,E,D,X | V | V |
| Carrier Detail | V,C,E,D | V,C,E,D | V | V | -- | -- | V,C,E,D | V | V |
| Carrier Onboarding | V,C,E,A | V,C,E,A | -- | -- | -- | -- | V,C,E,A | -- | -- |
| Compliance Dashboard | V,E,A | V,E,A | -- | -- | -- | -- | V,E,A | -- | V |
| Insurance Tracking | V,E | V,E | -- | -- | -- | -- | V,E | -- | V |
| Carrier Scorecard | V,E | V,E | V | -- | -- | -- | V,E | V | V |

### Accounting Screens

| Screen | Super Admin | Admin | Ops Mgr | Dispatcher | Sales | Accounting | Carrier Rel | Support | Read Only |
|--------|:-----------:|:-----:|:-------:|:----------:|:-----:|:----------:|:-----------:|:-------:|:---------:|
| Invoice List (AR) | V,C,E,D,X,P | V,C,E,D,X,P | -- | -- | -- | V,C,E,D,X,P | -- | -- | -- |
| Invoice Detail | V,C,E,D,A,P | V,C,E,D,A,P | -- | -- | -- | V,C,E,D,A,P | -- | -- | -- |
| Invoice Void | V,A | V,A | -- | -- | -- | V,A | -- | -- | -- |
| Carrier Pay (AP) | V,C,E,D,X | V,C,E,D,X | -- | -- | -- | V,C,E,D,X | -- | -- | -- |
| Settlement Detail | V,C,E,A | V,C,E,A | -- | -- | -- | V,C,E,A | -- | -- | -- |
| Aging Report | V,X | V,X | -- | -- | -- | V,X | -- | -- | -- |
| Payment History | V,X | V,X | -- | -- | -- | V,X | -- | -- | -- |

### Admin & Settings Screens

| Screen | Super Admin | Admin | Ops Mgr | Dispatcher | Sales | Accounting | Carrier Rel | Support | Read Only |
|--------|:-----------:|:-----:|:-------:|:----------:|:-----:|:----------:|:-----------:|:-------:|:---------:|
| User Management | V,C,E,D | V,C,E,D | -- | -- | -- | -- | -- | -- | -- |
| Role Management | V,C,E,D | V,C,E,D | -- | -- | -- | -- | -- | -- | -- |
| Tenant Settings | V,E | V,E | -- | -- | -- | -- | -- | -- | -- |
| Audit Log | V,X | V,X | -- | -- | -- | -- | -- | -- | -- |
| Integrations | V,C,E,D | V,C,E,D | -- | -- | -- | -- | -- | -- | -- |
| Workflow Rules | V,C,E,D | V,C,E,D | -- | -- | -- | -- | -- | -- | -- |
| Platform Config | V,C,E,D | -- | -- | -- | -- | -- | -- | -- | -- |
| My Profile | V,E | V,E | V,E | V,E | V,E | V,E | V,E | V,E | V,E |
| Notification Prefs | V,E | V,E | V,E | V,E | V,E | V,E | V,E | V,E | V,E |

---

## Data Visibility Rules

Beyond screen access, certain **data fields** are shown or hidden based on role. This prevents sensitive information from leaking to roles that should not see it.

### Financial Data Visibility

| Data Field | Super Admin | Admin | Ops Mgr | Dispatcher | Sales | Accounting | Carrier Rel | Support | Read Only |
|------------|:-----------:|:-----:|:-------:|:----------:|:-----:|:----------:|:-----------:|:-------:|:---------:|
| Customer Rate | Y | Y | Y | -- | Y | Y | -- | -- | -- |
| Carrier Rate / Cost | Y | Y | Y | -- | -- | Y | Y | -- | -- |
| Margin ($) | Y | Y | Y | -- | -- | Y | -- | -- | -- |
| Margin (%) | Y | Y | Y | -- | -- | Y | -- | -- | -- |
| Invoice Amounts | Y | Y | -- | -- | -- | Y | -- | -- | -- |
| Settlement Amounts | Y | Y | -- | -- | -- | Y | -- | -- | -- |
| Commission Data | Y | Y | -- | -- | own | Y | -- | -- | -- |
| Revenue Totals | Y | Y | Y | -- | own | Y | -- | -- | -- |
| Customer Credit Limit | Y | Y | -- | -- | Y | Y | -- | -- | -- |
| Customer Payment Terms | Y | Y | -- | -- | Y | Y | -- | -- | -- |
| Carrier Pay Rate | Y | Y | Y | -- | -- | Y | Y | -- | -- |

> **Note:** "own" means the user can see data scoped to their own records only (e.g., a Sales Agent sees commission for their own deals but not other agents' commissions).

### Operational Data Visibility

| Data Field | Super Admin | Admin | Ops Mgr | Dispatcher | Sales | Accounting | Carrier Rel | Support | Read Only |
|------------|:-----------:|:-----:|:-------:|:----------:|:-----:|:----------:|:-----------:|:-------:|:---------:|
| Load Status | Y | Y | Y | Y | -- | Y | Y | Y | Y |
| Driver Phone / Contact | Y | Y | Y | Y | -- | -- | Y | Y | -- |
| Carrier MC / DOT | Y | Y | Y | Y | -- | -- | Y | Y | Y |
| Carrier Insurance Details | Y | Y | -- | -- | -- | -- | Y | -- | Y |
| GPS / Location Data | Y | Y | Y | Y | -- | -- | -- | Y | Y |
| ETA Calculations | Y | Y | Y | Y | -- | -- | -- | Y | Y |
| Internal Notes (Ops) | Y | Y | Y | Y | -- | -- | -- | Y | -- |
| Internal Notes (Sales) | Y | Y | -- | -- | Y | -- | -- | -- | -- |
| Audit Trail | Y | Y | -- | -- | -- | -- | -- | -- | -- |

### Record-Level Scoping

Some roles see only a subset of records, not all tenant data:

| Role | Record Scoping Rule |
|------|---------------------|
| Super Admin | All records across all tenants |
| Admin | All records within their tenant |
| Ops Manager | All operations records within their tenant |
| Dispatcher | Loads assigned to them or unassigned; all orders they can view |
| Sales Agent | Only their own leads, customers, and quotes; can view shared customers |
| Accounting | All financial records within their tenant |
| Carrier Relations | All carrier records within their tenant |
| Support | All records within their tenant (read-heavy, limited writes) |
| Read Only | All records within their tenant (read-only) |

---

## Action Restrictions

Certain high-impact actions are restricted to specific roles regardless of screen access.

### Order Actions

| Action | Allowed Roles | Notes |
|--------|---------------|-------|
| Create Order | Admin, Ops Mgr, Dispatcher | Dispatcher can create but not from scratch in all cases |
| Edit Order | Admin, Ops Mgr, Dispatcher | Dispatcher limited to operational fields only |
| Cancel Order | Admin, Ops Mgr | Requires confirmation modal; logs reason |
| Delete Order | Admin | Only if order is in Draft status |
| Reopen Order | Admin, Ops Mgr | Only from Cancelled status |
| Convert Quote to Order | Admin, Ops Mgr, Sales | Sales initiates, Ops Mgr or Admin approves |

### Load Actions

| Action | Allowed Roles | Notes |
|--------|---------------|-------|
| Create Load | Admin, Ops Mgr, Dispatcher | Typically created from an order |
| Assign Carrier | Admin, Ops Mgr, Dispatcher | Dispatcher is primary user for this action |
| Reassign Carrier | Admin, Ops Mgr, Dispatcher | Requires reason; notifies previous carrier |
| Split Load | Admin, Ops Mgr | Creates multiple loads from one order |
| Merge Loads | Admin, Ops Mgr | Combines loads into a consolidated shipment |
| Cancel Load | Admin, Ops Mgr | Only before pickup; after pickup requires Admin |
| Mark Delivered | Admin, Ops Mgr, Dispatcher | Requires POD upload or confirmation |
| Override Status | Admin, Ops Mgr | For correcting incorrect status entries |

### Dispatch Actions

| Action | Allowed Roles | Notes |
|--------|---------------|-------|
| Tender to Carrier | Admin, Ops Mgr, Dispatcher | Via dispatch board or load detail |
| Accept/Reject Tender Response | Admin, Ops Mgr, Dispatcher | When carrier responds to tender |
| Post to Load Board | Admin, Ops Mgr, Dispatcher | Requires carrier rate to be set |
| Unpost from Load Board | Admin, Ops Mgr, Dispatcher | Removes from external boards |
| Send Rate Confirmation | Admin, Ops Mgr, Dispatcher | Auto-generates document for carrier signature |

### Financial Actions

| Action | Allowed Roles | Notes |
|--------|---------------|-------|
| Create Invoice | Admin, Accounting | Can also be auto-generated on delivery |
| Edit Invoice | Admin, Accounting | Only in Draft or Pending status |
| Approve Invoice | Admin, Accounting | Moves to Ready to Send |
| Send Invoice | Admin, Accounting | Emails to customer |
| Void Invoice | Admin, Accounting | Requires reason; creates credit memo |
| Record Payment | Admin, Accounting | Applies payment to invoice |
| Create Carrier Settlement | Admin, Accounting | Based on carrier pay records |
| Approve Settlement | Admin, Accounting | Moves to Ready to Pay |
| Issue Payment | Admin, Accounting | Triggers payment processing |
| Write Off Bad Debt | Admin | Requires Accounting recommendation first |
| Adjust Rates (retroactive) | Admin | After load completion; audited action |

### Carrier Actions

| Action | Allowed Roles | Notes |
|--------|---------------|-------|
| Add New Carrier | Admin, Carrier Rel | Initiates onboarding workflow |
| Approve Carrier | Admin, Carrier Rel | After compliance docs verified |
| Suspend Carrier | Admin, Carrier Rel, Ops Mgr | Blocks from new assignments |
| Deactivate Carrier | Admin, Carrier Rel | Permanent removal from active pool |
| Override Compliance Flag | Admin | When manual exception needed |
| Update Insurance Records | Admin, Carrier Rel | With document upload required |

### System Actions

| Action | Allowed Roles | Notes |
|--------|---------------|-------|
| Create User | Admin | Super Admin can also create across tenants |
| Deactivate User | Admin | Cannot deactivate self |
| Change User Role | Admin | Cannot elevate above own role |
| Modify Workflow Rules | Admin | Affects automated system behaviors |
| Export Data (bulk) | Admin, role-specific | Each role can export data they can view |
| View Audit Log | Admin, Super Admin | Full history of all system changes |
| Manage Integrations | Admin, Super Admin | EDI, API keys, third-party connections |
| Tenant Configuration | Admin, Super Admin | Company-level settings |
| Platform Configuration | Super Admin | Multi-tenant platform settings |

---

## Portal Users

Customer Portal and Carrier Portal users operate in completely separate application shells with their own navigation, screens, and data scoping.

### Customer Portal User

**Purpose:** Self-service for shippers to create orders, track shipments, view invoices, and download documents.

**Navigation (Customer Portal Shell):**

| Menu Item | Access |
|-----------|--------|
| Dashboard | Y - Summary of their active orders and shipments |
| Orders | Y - Only their own orders |
| New Order / Quote Request | Y - Submit new order or request for quote |
| Tracking | Y - Real-time tracking of their active shipments |
| Invoices | Y - View and download their invoices |
| Documents | Y - Access BOLs, PODs, rate confirmations for their loads |
| Support / Help | Y - Submit support tickets or requests |
| My Account / Profile | Y - Manage their own profile and notification preferences |

**Permissions:**

| Action | Allowed | Notes |
|--------|---------|-------|
| View own orders | Y | Only orders belonging to their company |
| Create new order | Y | Subject to approval by internal team |
| Request quote | Y | Routed to assigned Sales Agent |
| Track own shipments | Y | Real-time map and status updates |
| View own invoices | Y | Read-only; can download PDF |
| Download POD / BOL | Y | For completed loads only |
| View carrier info | N | Carrier identity is hidden from shippers |
| View rates / margin | N | Only sees their customer rate (if applicable) |
| Edit order (after submission) | Limited | Can request changes; internal team approves |
| Cancel order | Limited | Can request cancellation; subject to policy |
| View other customers' data | N | Strictly scoped to their company |

**Data Visibility vs Internal Users:**

| Data Point | Customer Portal | Internal Users |
|------------|:--------------:|:-------------:|
| Order status | Y | Y |
| Load status | Y (simplified) | Y (detailed) |
| Carrier name | N | Y |
| Driver name / phone | N | Y |
| Carrier rate / cost | N | Y (role-dependent) |
| Customer rate | Y (their rate) | Y |
| Margin | N | Y (role-dependent) |
| GPS coordinates (raw) | N | Y |
| Estimated delivery (ETA) | Y | Y |
| Internal notes | N | Y |
| BOL / POD documents | Y | Y |
| Invoice details | Y (their invoices) | Y |

### Carrier Portal User / Driver

**Purpose:** Self-service for carriers and drivers to manage assigned loads, submit check calls, upload documents, and track payments.

**Navigation (Carrier Portal Shell):**

| Menu Item | Access |
|-----------|--------|
| Dashboard | Y - Summary of assigned/active loads and payment status |
| Available Loads | Y - Loads tendered to them or posted for their review |
| My Loads | Y - Active and historical loads assigned to them |
| Load Detail | Y - Full detail of each assigned load with stops |
| Check Calls | Y - Submit location updates and check calls |
| Documents | Y - Upload BOL, POD, lumper receipts, etc. |
| Settlements / Payments | Y - View payment status and settlement history |
| My Profile / Company | Y - Manage company info, insurance docs, driver roster |
| Support / Help | Y - Submit support tickets |

**Permissions:**

| Action | Allowed | Notes |
|--------|---------|-------|
| View assigned loads | Y | Only loads assigned to their carrier |
| Accept / Reject tender | Y | Respond to load tenders |
| Submit check calls | Y | Location, status, and ETA updates |
| Update load status | Y | Picked up, in transit, delivered |
| Upload documents | Y | BOL, POD, accessorials |
| View their payment status | Y | Settlement amounts and payment dates |
| View customer info | N | Shipper name visible; contact details hidden |
| View customer rate | N | Only sees their carrier rate |
| View margin | N | Never visible to carriers |
| Edit load details | N | Can only update status and submit check calls |
| View other carriers' data | N | Strictly scoped to their company |
| Request detention / accessorial | Y | Subject to internal approval |
| Update company profile | Y | Insurance, contact info, equipment types |
| Manage driver roster | Y | Add/remove drivers under their authority |

**Data Visibility vs Internal Users:**

| Data Point | Carrier Portal | Internal Users |
|------------|:-------------:|:-------------:|
| Load number | Y | Y |
| Origin / Destination | Y | Y |
| Stop details (addresses, times) | Y (assigned loads) | Y |
| Customer name | Y (company only) | Y |
| Customer contact / phone | N | Y |
| Customer rate | N | Y (role-dependent) |
| Carrier rate (their rate) | Y | Y |
| Margin | N | Y (role-dependent) |
| Carrier pay / settlement | Y (their own) | Y |
| Other carriers on same order | N | Y |
| Dispatch notes (internal) | N | Y |
| Carrier-facing notes | Y | Y |

---

## Implementation Notes

### Permission Check Pattern

All permission checks follow a layered approach:

1. **Route Guard** - Middleware checks if the user's role has access to the route/page
2. **Component-Level** - UI elements (buttons, menu items, form fields) are conditionally rendered based on role permissions
3. **API-Level** - Every API endpoint independently validates the user's role before executing; the UI is never the sole gatekeeper

### Permission Utility

```
// Conceptual permission check
canAccess(user.role, resource, action)

// Examples
canAccess('dispatcher', 'load', 'assign')        // true
canAccess('dispatcher', 'order', 'cancel')        // false
canAccess('accounting', 'invoice', 'void')        // true
canAccess('sales_agent', 'load', 'view')          // false
canAccess('customer_portal', 'carrier', 'view')   // false
```

### Role Hierarchy

Roles follow an implicit hierarchy for permission inheritance:

```
Super Admin
  └── Admin
        ├── Ops Manager
        │     ├── Dispatcher
        │     └── Support
        ├── Sales Agent
        ├── Accounting
        └── Carrier Relations
              └── Read Only
```

Higher roles inherit all permissions of roles below them in their branch. This means:
- An Admin can do everything an Ops Manager can do
- An Ops Manager can do everything a Dispatcher can do
- But an Ops Manager cannot do what Accounting can do (different branch)

### Super Admin Specifics

The Super Admin role is special:
- It exists at the **platform level**, not the tenant level
- It can impersonate any user in any tenant for debugging
- It has access to the Platform Config section (hidden from all other roles)
- It can view cross-tenant reports and metrics
- It should be used only by the platform operator, not by customer organizations

### Dynamic Permission Overrides

Admins can create custom permission overrides for specific users within the Admin panel:
- Grant additional permissions beyond what the base role provides
- Restrict specific permissions that the base role normally has
- These overrides are logged in the audit trail
- Overrides are shown visually in User Management with a badge indicator

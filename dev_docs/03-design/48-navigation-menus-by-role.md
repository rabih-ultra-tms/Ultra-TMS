# Navigation Structure

> **NOTE (Feb 2026):** This navigation assumes the full 38-service suite. The P0 MVP only includes 8 services. See `CLAUDE.md` for MVP scope. 5 sidebar links currently point to 404 pages — see BUG-003 in `dev_docs/Claude-review-v1/01-code-review/05-bug-inventory.md`.

Menu structure and navigation hierarchy for each user role in the 3PL Platform.

---

## User Roles Overview

| Role                   | Description                         | Access Level         |
| ---------------------- | ----------------------------------- | -------------------- |
| **Super Admin**        | Platform operator (SaaS management) | Full platform        |
| **Admin**              | Tenant administrator                | Full tenant          |
| **Operations Manager** | Operations oversight                | Operations + Reports |
| **Dispatcher**         | Load/carrier management             | Dispatch functions   |
| **Sales Agent**        | Customer acquisition                | CRM + Quoting        |
| **Accounting**         | Financial operations                | AR/AP/Billing        |
| **Support**            | Customer service                    | Limited operations   |
| **Customer**           | Shipper portal access               | Customer portal only |
| **Carrier**            | Carrier portal access               | Carrier portal only  |
| **Driver**             | Mobile app access                   | Driver app only      |

---

## Super Admin Navigation

> Platform-level administration for SaaS operators

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ¢ SUPER ADMIN PORTAL                                      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                             â”‚
â”‚  ðŸ“Š Dashboard                                               â”‚
â”‚      â””â”€â”€ Platform Overview                                  â”‚
â”‚      â””â”€â”€ System Health                                      â”‚
â”‚      â””â”€â”€ Key Metrics                                        â”‚
â”‚                                                             â”‚
â”‚  ðŸ¢ Tenants                                                 â”‚
â”‚      â””â”€â”€ All Tenants                                        â”‚
â”‚      â””â”€â”€ Create Tenant                                      â”‚
â”‚      â””â”€â”€ Tenant Settings                                    â”‚
â”‚      â””â”€â”€ Tenant Diagnostics                                 â”‚
â”‚                                                             â”‚
â”‚  ðŸ’³ Billing                                                 â”‚
â”‚      â””â”€â”€ Subscriptions                                      â”‚
â”‚      â””â”€â”€ Plans & Pricing                                    â”‚
â”‚      â””â”€â”€ Invoices                                           â”‚
â”‚      â””â”€â”€ Payments                                           â”‚
â”‚      â””â”€â”€ Usage Reports                                      â”‚
â”‚                                                             â”‚
â”‚  ðŸ‘¥ Platform Users                                          â”‚
â”‚      â””â”€â”€ Admin Users                                        â”‚
â”‚      â””â”€â”€ Roles & Permissions                                â”‚
â”‚      â””â”€â”€ Impersonation Log                                  â”‚
â”‚                                                             â”‚
â”‚  ðŸ“¢ Communications                                          â”‚
â”‚      â””â”€â”€ Announcements                                      â”‚
â”‚      â””â”€â”€ System Messages                                    â”‚
â”‚                                                             â”‚
â”‚  âš™ï¸ System                                                  â”‚
â”‚      â””â”€â”€ Global Config                                      â”‚
â”‚      â””â”€â”€ Feature Flags                                      â”‚
â”‚      â””â”€â”€ API Metrics                                        â”‚
â”‚      â””â”€â”€ Error Log                                          â”‚
â”‚      â””â”€â”€ Audit Log                                          â”‚
â”‚                                                             â”‚
â”‚  ðŸ› ï¸ Tools                                                   â”‚
â”‚      â””â”€â”€ Data Export                                        â”‚
â”‚      â””â”€â”€ Database Admin                                     â”‚
â”‚      â””â”€â”€ Cache Management                                   â”‚
â”‚                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Admin Navigation (Tenant Admin)

> Full access to all tenant functionality

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸš› 3PL PLATFORM                            [Search] [âš™ï¸] [ðŸ‘¤]â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                             â”‚
â”‚  ðŸ“Š Dashboards                                              â”‚
â”‚      â””â”€â”€ Operations Dashboard                               â”‚
â”‚      â””â”€â”€ Sales Dashboard                                    â”‚
â”‚      â””â”€â”€ Financial Dashboard                                â”‚
â”‚      â””â”€â”€ Analytics Home                                     â”‚
â”‚                                                             â”‚
â”‚  ðŸ‘¥ CRM                                                     â”‚
â”‚      â””â”€â”€ Leads                                              â”‚
â”‚      â””â”€â”€ Companies                                          â”‚
â”‚      â””â”€â”€ Contacts                                           â”‚
â”‚      â””â”€â”€ Opportunities                                      â”‚
â”‚      â””â”€â”€ Activities                                         â”‚
â”‚                                                             â”‚
â”‚  ðŸ’° Sales                                                   â”‚
â”‚      â””â”€â”€ Quotes                                             â”‚
â”‚      â””â”€â”€ Rate Tables                                        â”‚
â”‚      â””â”€â”€ Lane Pricing                                       â”‚
â”‚      â””â”€â”€ Proposals                                          â”‚
â”‚                                                             â”‚
â”‚  ðŸ“¦ Operations                                              â”‚
â”‚      â””â”€â”€ Orders                                             â”‚
â”‚      â””â”€â”€ Loads                                              â”‚
â”‚      â””â”€â”€ Dispatch Board                                     â”‚
â”‚      â””â”€â”€ Tracking Map                                       â”‚
â”‚      â””â”€â”€ Check Calls                                        â”‚
â”‚                                                             â”‚
â”‚  ðŸšš Carriers                                                â”‚
â”‚      â””â”€â”€ Carrier List                                       â”‚
â”‚      â””â”€â”€ Compliance                                         â”‚
â”‚      â””â”€â”€ Scorecards                                         â”‚
â”‚      â””â”€â”€ Load Board                                         â”‚
â”‚      â””â”€â”€ Safety Center                                      â”‚
â”‚                                                             â”‚
â”‚  ðŸ’µ Accounting                                              â”‚
â”‚      â””â”€â”€ Invoices                                           â”‚
â”‚      â””â”€â”€ Carrier Payables                                   â”‚
â”‚      â””â”€â”€ Payments                                           â”‚
â”‚      â””â”€â”€ Commissions                                        â”‚
â”‚      â””â”€â”€ Financial Reports                                  â”‚
â”‚      â””â”€â”€ Credit Management                                  â”‚
â”‚                                                             â”‚
â”‚  ðŸ“‹ Claims & Documents                                      â”‚
â”‚      â””â”€â”€ Claims                                             â”‚
â”‚      â””â”€â”€ Document Library                                   â”‚
â”‚      â””â”€â”€ Templates                                          â”‚
â”‚                                                             â”‚
â”‚  ðŸ“Š Reports & Analytics                                     â”‚
â”‚      â””â”€â”€ Report Library                                     â”‚
â”‚      â””â”€â”€ Report Builder                                     â”‚
â”‚      â””â”€â”€ Scheduled Reports                                  â”‚
â”‚      â””â”€â”€ Dashboard Builder                                  â”‚
â”‚                                                             â”‚
â”‚  ðŸ”§ Administration                                          â”‚
â”‚      â””â”€â”€ User Management                                    â”‚
â”‚      â””â”€â”€ Role Management                                    â”‚
â”‚      â””â”€â”€ Company Settings                                   â”‚
â”‚      â””â”€â”€ Custom Fields                                      â”‚
â”‚      â””â”€â”€ Workflow Automation                                â”‚
â”‚      â””â”€â”€ Integrations                                       â”‚
â”‚      â””â”€â”€ Audit Log                                          â”‚
â”‚                                                             â”‚
â”‚  â“ Support                                                 â”‚
â”‚      â””â”€â”€ Help Center                                        â”‚
â”‚      â””â”€â”€ Submit Ticket                                      â”‚
â”‚      â””â”€â”€ Feedback                                           â”‚
â”‚                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Operations Manager Navigation

> Focus on operations oversight and reporting

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸš› 3PL PLATFORM                            [Search] [ðŸ””] [ðŸ‘¤]â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                             â”‚
â”‚  ðŸ“Š Dashboards                                              â”‚
â”‚      â””â”€â”€ Operations Dashboard                               â”‚
â”‚      â””â”€â”€ Team Performance                                   â”‚
â”‚      â””â”€â”€ Analytics Home                                     â”‚
â”‚                                                             â”‚
â”‚  ðŸ“¦ Operations                                              â”‚
â”‚      â””â”€â”€ Orders                                             â”‚
â”‚      â””â”€â”€ Loads                                              â”‚
â”‚      â””â”€â”€ Dispatch Board                                     â”‚
â”‚      â””â”€â”€ Tracking Map                                       â”‚
â”‚      â””â”€â”€ Check Calls                                        â”‚
â”‚      â””â”€â”€ Claims                                             â”‚
â”‚                                                             â”‚
â”‚  ðŸšš Carriers                                                â”‚
â”‚      â””â”€â”€ Carrier List                                       â”‚
â”‚      â””â”€â”€ Compliance Center                                  â”‚
â”‚      â””â”€â”€ Scorecards                                         â”‚
â”‚      â””â”€â”€ Safety Center                                      â”‚
â”‚                                                             â”‚
â”‚  ðŸ“Š Reports                                                 â”‚
â”‚      â””â”€â”€ Operations Reports                                 â”‚
â”‚      â””â”€â”€ Carrier Reports                                    â”‚
â”‚      â””â”€â”€ Performance Reports                                â”‚
â”‚      â””â”€â”€ Compliance Reports                                 â”‚
â”‚                                                             â”‚
â”‚  ðŸ‘¥ Team                                                    â”‚
â”‚      â””â”€â”€ User Management                                    â”‚
â”‚      â””â”€â”€ Activity Log                                       â”‚
â”‚                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Dispatcher Navigation

> Core dispatch and carrier management functions

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸš› 3PL PLATFORM                            [Search] [ðŸ””] [ðŸ‘¤]â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                             â”‚
â”‚  ðŸ“Š Dashboard                                               â”‚
â”‚      â””â”€â”€ My Dashboard                                       â”‚
â”‚                                                             â”‚
â”‚  ðŸ“¦ Dispatch                                                â”‚
â”‚      â””â”€â”€ Dispatch Board â­                                  â”‚
â”‚      â””â”€â”€ Orders                                             â”‚
â”‚      â””â”€â”€ Loads                                              â”‚
â”‚      â””â”€â”€ Tracking Map                                       â”‚
â”‚      â””â”€â”€ Check Calls                                        â”‚
â”‚      â””â”€â”€ Appointments                                       â”‚
â”‚                                                             â”‚
â”‚  ðŸšš Carriers                                                â”‚
â”‚      â””â”€â”€ Find Carriers â­                                   â”‚
â”‚      â””â”€â”€ Carrier List                                       â”‚
â”‚      â””â”€â”€ FMCSA Lookup                                       â”‚
â”‚      â””â”€â”€ Preferred Carriers                                 â”‚
â”‚      â””â”€â”€ Scorecards                                         â”‚
â”‚                                                             â”‚
â”‚  ðŸ“‹ Load Board                                              â”‚
â”‚      â””â”€â”€ Post Load â­                                       â”‚
â”‚      â””â”€â”€ Posted Loads                                       â”‚
â”‚      â””â”€â”€ Capacity Search                                    â”‚
â”‚      â””â”€â”€ Carrier Bids                                       â”‚
â”‚      â””â”€â”€ Market Rates                                       â”‚
â”‚                                                             â”‚
â”‚  ðŸ“„ Documents                                               â”‚
â”‚      â””â”€â”€ Document Library                                   â”‚
â”‚      â””â”€â”€ Rate Confirmations                                 â”‚
â”‚      â””â”€â”€ PODs                                               â”‚
â”‚                                                             â”‚
â”‚  ðŸ’¬ Communication                                           â”‚
â”‚      â””â”€â”€ Messages                                           â”‚
â”‚      â””â”€â”€ SMS Quick Send                                     â”‚
â”‚                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â­ = Quick access / pinned items
```

---

## Sales Agent Navigation

> CRM, quoting, and customer management

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸš› 3PL PLATFORM                            [Search] [ðŸ””] [ðŸ‘¤]â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                             â”‚
â”‚  ðŸ“Š Dashboard                                               â”‚
â”‚      â””â”€â”€ Sales Dashboard                                    â”‚
â”‚      â””â”€â”€ My Pipeline                                        â”‚
â”‚                                                             â”‚
â”‚  ðŸ‘¥ CRM                                                     â”‚
â”‚      â””â”€â”€ My Leads â­                                        â”‚
â”‚      â””â”€â”€ My Accounts â­                                     â”‚
â”‚      â””â”€â”€ Contacts                                           â”‚
â”‚      â””â”€â”€ Opportunities â­                                   â”‚
â”‚      â””â”€â”€ Activities                                         â”‚
â”‚      â””â”€â”€ Calendar                                           â”‚
â”‚                                                             â”‚
â”‚  ðŸ’° Quotes                                                  â”‚
â”‚      â””â”€â”€ Create Quote â­                                    â”‚
â”‚      â””â”€â”€ My Quotes                                          â”‚
â”‚      â””â”€â”€ Rate Lookup                                        â”‚
â”‚      â””â”€â”€ Proposals                                          â”‚
â”‚                                                             â”‚
â”‚  ðŸ“¦ Orders                                                  â”‚
â”‚      â””â”€â”€ My Orders                                          â”‚
â”‚      â””â”€â”€ Order Status                                       â”‚
â”‚                                                             â”‚
â”‚  ðŸ“Š Reports                                                 â”‚
â”‚      â””â”€â”€ My Performance                                     â”‚
â”‚      â””â”€â”€ Commission Statement                               â”‚
â”‚      â””â”€â”€ Win/Loss Analysis                                  â”‚
â”‚                                                             â”‚
â”‚  ðŸ’¬ Communication                                           â”‚
â”‚      â””â”€â”€ Email                                              â”‚
â”‚      â””â”€â”€ Templates                                          â”‚
â”‚                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Accounting Navigation

> Financial operations and reporting

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸš› 3PL PLATFORM                            [Search] [ðŸ””] [ðŸ‘¤]â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                             â”‚
â”‚  ðŸ“Š Dashboard                                               â”‚
â”‚      â””â”€â”€ Accounting Dashboard                               â”‚
â”‚      â””â”€â”€ Cash Position                                      â”‚
â”‚                                                             â”‚
â”‚  ðŸ“¥ Receivables                                             â”‚
â”‚      â””â”€â”€ Invoices â­                                        â”‚
â”‚      â””â”€â”€ Create Invoice                                     â”‚
â”‚      â””â”€â”€ Payments Received                                  â”‚
â”‚      â””â”€â”€ AR Aging                                           â”‚
â”‚      â””â”€â”€ Collections                                        â”‚
â”‚                                                             â”‚
â”‚  ðŸ“¤ Payables                                                â”‚
â”‚      â””â”€â”€ Carrier Bills â­                                   â”‚
â”‚      â””â”€â”€ Enter Bill                                         â”‚
â”‚      â””â”€â”€ Payments Made                                      â”‚
â”‚      â””â”€â”€ AP Aging                                           â”‚
â”‚      â””â”€â”€ Quick Pay Requests                                 â”‚
â”‚                                                             â”‚
â”‚  ðŸ’° Settlements                                             â”‚
â”‚      â””â”€â”€ Carrier Settlements                                â”‚
â”‚      â””â”€â”€ Agent Commissions                                  â”‚
â”‚      â””â”€â”€ Driver Settlements                                 â”‚
â”‚                                                             â”‚
â”‚  ðŸ¦ Banking                                                 â”‚
â”‚      â””â”€â”€ Bank Reconciliation                                â”‚
â”‚      â””â”€â”€ GL Transactions                                    â”‚
â”‚      â””â”€â”€ Chart of Accounts                                  â”‚
â”‚                                                             â”‚
â”‚  ðŸ’³ Credit                                                  â”‚
â”‚      â””â”€â”€ Credit Applications                                â”‚
â”‚      â””â”€â”€ Credit Limits                                      â”‚
â”‚      â””â”€â”€ Credit Holds                                       â”‚
â”‚                                                             â”‚
â”‚  ðŸ“Š Reports                                                 â”‚
â”‚      â””â”€â”€ Financial Reports â­                               â”‚
â”‚      â””â”€â”€ P&L Statement                                      â”‚
â”‚      â””â”€â”€ Balance Sheet                                      â”‚
â”‚      â””â”€â”€ Cash Flow                                          â”‚
â”‚      â””â”€â”€ IFTA Report                                        â”‚
â”‚                                                             â”‚
â”‚  ðŸ”— Integrations                                            â”‚
â”‚      â””â”€â”€ QuickBooks Sync                                    â”‚
â”‚      â””â”€â”€ Bank Feeds                                         â”‚
â”‚                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Customer Portal Navigation

> Self-service for shippers/customers

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ“¦ CUSTOMER PORTAL                                   [ðŸ‘¤]  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                             â”‚
â”‚  ðŸ  Home                                                    â”‚
â”‚      â””â”€â”€ Dashboard                                          â”‚
â”‚      â””â”€â”€ Quick Track                                        â”‚
â”‚                                                             â”‚
â”‚  ðŸ“¦ Shipments                                               â”‚
â”‚      â””â”€â”€ My Shipments â­                                    â”‚
â”‚      â””â”€â”€ Track Shipment â­                                  â”‚
â”‚      â””â”€â”€ Shipment History                                   â”‚
â”‚                                                             â”‚
â”‚  ðŸ’° Quotes                                                  â”‚
â”‚      â””â”€â”€ Request Quote â­                                   â”‚
â”‚      â””â”€â”€ My Quotes                                          â”‚
â”‚                                                             â”‚
â”‚  ðŸ“„ Documents                                               â”‚
â”‚      â””â”€â”€ My Documents                                       â”‚
â”‚      â””â”€â”€ BOLs                                               â”‚
â”‚      â””â”€â”€ PODs                                               â”‚
â”‚                                                             â”‚
â”‚  ðŸ’µ Billing                                                 â”‚
â”‚      â””â”€â”€ My Invoices                                        â”‚
â”‚      â””â”€â”€ Payment History                                    â”‚
â”‚                                                             â”‚
â”‚  â“ Support                                                 â”‚
â”‚      â””â”€â”€ Report Issue                                       â”‚
â”‚      â””â”€â”€ Contact Us                                         â”‚
â”‚                                                             â”‚
â”‚  âš™ï¸ Settings                                                â”‚
â”‚      â””â”€â”€ My Profile                                         â”‚
â”‚      â””â”€â”€ Notifications                                      â”‚
â”‚      â””â”€â”€ Users (Admin)                                      â”‚
â”‚                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Carrier Portal Navigation

> Self-service for carriers

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸšš CARRIER PORTAL                                    [ðŸ‘¤]  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                             â”‚
â”‚  ðŸ  Home                                                    â”‚
â”‚      â””â”€â”€ Dashboard                                          â”‚
â”‚      â””â”€â”€ Available Loads                                    â”‚
â”‚                                                             â”‚
â”‚  ðŸ“¦ Loads                                                   â”‚
â”‚      â””â”€â”€ Available Loads â­                                 â”‚
â”‚      â””â”€â”€ My Loads â­                                        â”‚
â”‚      â””â”€â”€ Load History                                       â”‚
â”‚      â””â”€â”€ Update Status                                      â”‚
â”‚                                                             â”‚
â”‚  ðŸ“„ Documents                                               â”‚
â”‚      â””â”€â”€ Upload POD â­                                      â”‚
â”‚      â””â”€â”€ My Documents                                       â”‚
â”‚      â””â”€â”€ Rate Confirmations                                 â”‚
â”‚                                                             â”‚
â”‚  ðŸ’µ Payments                                                â”‚
â”‚      â””â”€â”€ My Payments                                        â”‚
â”‚      â””â”€â”€ Request Quick Pay â­                               â”‚
â”‚      â””â”€â”€ Payment History                                    â”‚
â”‚                                                             â”‚
â”‚  ðŸ“‹ Compliance                                              â”‚
â”‚      â””â”€â”€ My Documents                                       â”‚
â”‚      â””â”€â”€ Update Insurance                                   â”‚
â”‚      â””â”€â”€ Equipment                                          â”‚
â”‚                                                             â”‚
â”‚  âš™ï¸ Settings                                                â”‚
â”‚      â””â”€â”€ Company Profile                                    â”‚
â”‚      â””â”€â”€ Contacts                                           â”‚
â”‚      â””â”€â”€ Notifications                                      â”‚
â”‚      â””â”€â”€ Lane Preferences                                   â”‚
â”‚                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Driver Mobile App Navigation

> Mobile-first driver experience (Spanish available)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸš› DRIVER APP                          [ES/EN] [ðŸ””] [ðŸ‘¤]   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚                                                       â”‚   â”‚
â”‚  â”‚              CURRENT LOAD                             â”‚   â”‚
â”‚  â”‚              Load #L-2025-00123                       â”‚   â”‚
â”‚  â”‚                                                       â”‚   â”‚
â”‚  â”‚              Next Stop: Dallas, TX                    â”‚   â”‚
â”‚  â”‚              ETA: 2:30 PM                             â”‚   â”‚
â”‚  â”‚                                                       â”‚   â”‚
â”‚  â”‚         [ðŸ“ Navigate]  [ðŸ“ Update Status]             â”‚   â”‚
â”‚  â”‚                                                       â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                             â”‚
â”‚  â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”‚
â”‚                                                             â”‚
â”‚  ðŸ“¦ My Loads                                                â”‚
â”‚      Current load details, upcoming loads                   â”‚
â”‚                                                             â”‚
â”‚  ðŸ“ Navigation                                              â”‚
â”‚      Turn-by-turn to next stop                              â”‚
â”‚                                                             â”‚
â”‚  ðŸ“ Status Update                                           â”‚
â”‚      Check in, arrived, loading, in transit, delivered      â”‚
â”‚                                                             â”‚
â”‚  ðŸ“· POD Capture                                             â”‚
â”‚      Photo, signature, scan BOL                             â”‚
â”‚                                                             â”‚
â”‚  ðŸ’¬ Messages                                                â”‚
â”‚      Chat with dispatcher                                   â”‚
â”‚                                                             â”‚
â”‚  ðŸ“„ Documents                                               â”‚
â”‚      Load documents, BOL, rate con                          â”‚
â”‚                                                             â”‚
â”‚  ðŸ’µ My Pay                                                  â”‚
â”‚      Settlements, advances                                  â”‚
â”‚                                                             â”‚
â”‚  âš™ï¸ Settings                                                â”‚
â”‚      Profile, language, notifications                       â”‚
â”‚                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

Bottom Tab Bar:
[ ðŸ  Home ] [ ðŸ“¦ Loads ] [ ðŸ“· POD ] [ ðŸ’¬ Chat ] [ ðŸ‘¤ Profile ]
```

---

## Quick Actions by Role

### Global Quick Actions (Top Bar)

| Role       | Quick Actions                                |
| ---------- | -------------------------------------------- |
| Admin      | + New Order, + New Quote, Search             |
| Dispatcher | + New Load, + Find Carrier, + Post to Board  |
| Sales      | + New Quote, + New Lead, + Log Activity      |
| Accounting | + New Invoice, + Enter Bill, + Apply Payment |

### Context-Sensitive Actions

| Screen       | Actions                              |
| ------------ | ------------------------------------ |
| Load List    | Create, Edit, Dispatch, Track, Print |
| Carrier List | Add, View, Edit, Score, Onboard      |
| Invoice List | Create, Send, Apply Payment, Void    |
| Quote List   | Create, Clone, Send, Convert         |

---

## Mobile Responsiveness

### Desktop (1280px+)

- Full sidebar navigation
- Multi-column layouts
- Expanded data tables

### Tablet (768-1279px)

- Collapsible sidebar
- Responsive tables
- Touch-friendly buttons

### Mobile (< 768px)

- Bottom tab navigation
- Single column layout
- Swipe gestures
- Floating action button

---

## Navigation

- **Previous:** [Screen Catalog](./SCREENS.md)
- **Next:** [Comprehensive Checklist](./CHECKLIST.md)
- **Index:** [Documentation Home](../README.md)

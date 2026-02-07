# Ultra TMS - Master Screen Catalog

> **Total Screens:** 362+ (catalog) + 17 proposed additions = 379+
> **Services:** 38
> **Waves:** 5 phases
> **Last Updated:** 2026-02-06

---

## Quick Stats

| Category | Screens | Status |
|----------|---------|--------|
| Wave 1 - Foundation (Auth, Dashboard, CRM, Sales) | 39 | 12 Built, 27 Remaining |
| Wave 2 - TMS Core | 14 | 0 Built |
| Wave 3 - Carrier Management | 12 | 2 Built |
| Wave 4+ - Future Services | 297+ | 0 Built |
| **Total** | **362+** | **14 Built** |

---

## Screen Naming Conventions

- **Route Prefix:** All dashboard routes live under `/(dashboard)/`
- **Auth Routes:** Live under `/(auth)/`
- **Portal Routes:** `/portal/customer/` and `/portal/carrier/`
- **Super Admin Routes:** `/platform/`
- **Dynamic Segments:** `[id]` for single-record views, `[slug]` for named resources
- **Actions:** `/new` for create, `/[id]/edit` for update

---

## Screen Catalog by Service

---

### Service 01 - Auth & Admin (Wave 1, 12 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Login | `/(auth)/login` | Form | Built | `01-auth/01-login.md` | All Users |
| 02 | Register | `/(auth)/register` | Form | Built | `01-auth/02-register.md` | All Users |
| 03 | Forgot Password | `/(auth)/forgot-password` | Form | Built | `01-auth/03-forgot-password.md` | All Users |
| 04 | Reset Password | `/(auth)/reset-password` | Form | Built | `01-auth/04-reset-password.md` | All Users |
| 05 | MFA Setup | `/(auth)/mfa` | Form | Built | `01-auth/05-mfa-setup.md` | All Users |
| 06 | Profile Settings | `/(dashboard)/profile` | Form | Built | `01-auth/06-profile-settings.md` | All Users |
| 07 | User Management | `/(dashboard)/admin/users` | List | Built | `01-auth/07-user-management.md` | Admin |
| 08 | User Detail | `/(dashboard)/admin/users/[id]` | Detail | Built | `01-auth/08-user-detail.md` | Admin |
| 09 | Role Management | `/(dashboard)/admin/roles` | List | Built | `01-auth/09-role-management.md` | Admin |
| 10 | Role Editor | `/(dashboard)/admin/roles/[id]` | Form | Built | `01-auth/10-role-editor.md` | Admin |
| 11 | Tenant Settings | `/(dashboard)/admin/settings` | Config | Built | `01-auth/11-tenant-settings.md` | Admin |
| 12 | Security Log | `/(dashboard)/admin/audit-logs` | List | Built | `01-auth/12-security-log.md` | Admin |

---

### Service 01.1 - Dashboard Shell (Wave 1, 5 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Main Dashboard | `/(dashboard)/dashboard` | Dashboard | Built | `01.1-shell/01-main-dashboard.md` | All Users |
| 02 | Sidebar Navigation | `/(dashboard)/_layout` | Portal | Not Started | `01.1-shell/02-sidebar-navigation.md` | All Users |
| 03 | Header Bar | `/(dashboard)/_layout` | Portal | Not Started | `01.1-shell/03-header-bar.md` | All Users |
| 04 | Notification Center | `/(dashboard)/notifications` | List | Not Started | `01.1-shell/04-notification-center.md` | All Users |
| 05 | Command Palette | `/(dashboard)/_command` | Search | Not Started | `01.1-shell/05-command-palette.md` | All Users |

---

### Service 02 - CRM (Wave 1, 12 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | CRM Dashboard | `/(dashboard)/crm` | Dashboard | Not Started | `02-crm/01-crm-dashboard.md` | Maria, Sarah |
| 02 | Leads List | `/(dashboard)/leads` | List | Built | `02-crm/02-leads-list.md` | Maria, Sarah |
| 03 | Lead Detail | `/(dashboard)/leads/[id]` | Detail | Built | `02-crm/03-lead-detail.md` | Maria, Sarah |
| 04 | Companies List | `/(dashboard)/companies` | List | Built | `02-crm/04-companies-list.md` | Maria, Sarah, Omar |
| 05 | Company Detail | `/(dashboard)/companies/[id]` | Detail | Built | `02-crm/05-company-detail.md` | Maria, Sarah, Omar |
| 06 | Contacts List | `/(dashboard)/contacts` | List | Built | `02-crm/06-contacts-list.md` | Maria, Sarah |
| 07 | Contact Detail | `/(dashboard)/contacts/[id]` | Detail | Built | `02-crm/07-contact-detail.md` | Maria, Sarah |
| 08 | Opportunities List | `/(dashboard)/opportunities` | List | Not Started | `02-crm/08-opportunities-list.md` | Maria, Sarah |
| 09 | Opportunity Detail | `/(dashboard)/opportunities/[id]` | Detail | Not Started | `02-crm/09-opportunity-detail.md` | Maria, Sarah |
| 10 | Activities Calendar | `/(dashboard)/activities` | Calendar | Not Started | `02-crm/10-activities-calendar.md` | Maria, Sarah, Omar |
| 11 | Territory Management | `/(dashboard)/crm/territories` | Config | Not Started | `02-crm/11-territory-management.md` | Sarah, Admin |
| 12 | Lead Import Wizard | `/(dashboard)/leads/import` | Wizard | Not Started | `02-crm/12-lead-import-wizard.md` | Maria, Sarah |

---

### Service 03 - Sales (Wave 1, 10 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Sales Dashboard | `/(dashboard)/sales` | Dashboard | Not Started | `03-sales/01-sales-dashboard.md` | Sarah, Admin |
| 02 | Quotes List | `/(dashboard)/quotes` | List | Not Started | `03-sales/02-quotes-list.md` | Sarah, Maria |
| 03 | Quote Detail | `/(dashboard)/quotes/[id]` | Detail | Not Started | `03-sales/03-quote-detail.md` | Sarah, Maria |
| 04 | Quote Builder | `/(dashboard)/quotes/new` | Form | Not Started | `03-sales/04-quote-builder.md` | Sarah, Maria |
| 05 | Rate Tables | `/(dashboard)/sales/rate-tables` | List | Not Started | `03-sales/05-rate-tables.md` | Sarah, Admin |
| 06 | Rate Table Editor | `/(dashboard)/sales/rate-tables/[id]` | Form | Not Started | `03-sales/06-rate-table-editor.md` | Admin |
| 07 | Lane Pricing | `/(dashboard)/sales/lane-pricing` | List | Not Started | `03-sales/07-lane-pricing.md` | Sarah |
| 08 | Accessorial Charges | `/(dashboard)/sales/accessorials` | List | Not Started | `03-sales/08-accessorial-charges.md` | Admin |
| 09 | Proposal Templates | `/(dashboard)/sales/templates` | List | Not Started | `03-sales/09-proposal-templates.md` | Admin |
| 10 | Sales Reports | `/(dashboard)/sales/reports` | Report | Not Started | `03-sales/10-sales-reports.md` | Sarah, Admin |

---

### Service 04 - TMS Core (Wave 2, 14 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Operations Dashboard | `/(dashboard)/operations` | Dashboard | Not Started | `04-tms/01-operations-dashboard.md` | Omar, Admin |
| 02 | Orders List | `/(dashboard)/orders` | List | Not Started | `04-tms/02-orders-list.md` | Omar, Sarah |
| 03 | Order Detail | `/(dashboard)/orders/[id]` | Detail | Not Started | `04-tms/03-order-detail.md` | Omar, Sarah |
| 04 | Order Entry | `/(dashboard)/orders/new` | Form | Not Started | `04-tms/04-order-entry.md` | Omar, Sarah |
| 05 | Loads List | `/(dashboard)/loads` | List | Not Started | `04-tms/05-loads-list.md` | Omar |
| 06 | Load Detail | `/(dashboard)/loads/[id]` | Detail | Not Started | `04-tms/06-load-detail.md` | Omar |
| 07 | Load Builder | `/(dashboard)/loads/new` | Form | Not Started | `04-tms/07-load-builder.md` | Omar |
| 08 | Dispatch Board | `/(dashboard)/dispatch` | Board | Not Started | `04-tms/08-dispatch-board.md` | Omar |
| 09 | Stop Management | `/(dashboard)/loads/[id]/stops` | List | Not Started | `04-tms/09-stop-management.md` | Omar |
| 10 | Tracking Map | `/(dashboard)/tracking` | Map | Not Started | `04-tms/10-tracking-map.md` | Omar, Sarah |
| 11 | Status Updates | `/(dashboard)/loads/[id]/status` | List | Not Started | `04-tms/11-status-updates.md` | Omar |
| 12 | Load Timeline | `/(dashboard)/loads/[id]/timeline` | Detail | Not Started | `04-tms/12-load-timeline.md` | Omar |
| 13 | Check Calls | `/(dashboard)/loads/[id]/check-calls` | List | Not Started | `04-tms/13-check-calls.md` | Omar |
| 14 | Appointment Scheduler | `/(dashboard)/loads/[id]/appointments` | Calendar | Not Started | `04-tms/14-appointment-scheduler.md` | Omar |

---

### Service 05 - Carrier (Wave 3, 12 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Carrier Dashboard | `/(dashboard)/carriers/dashboard` | Dashboard | Not Started | `05-carrier/01-carrier-dashboard.md` | Omar, Admin |
| 02 | Carriers List | `/(dashboard)/carriers` | List | Built | `05-carrier/02-carriers-list.md` | Omar |
| 03 | Carrier Detail | `/(dashboard)/carriers/[id]` | Detail | Not Started | `05-carrier/03-carrier-detail.md` | Omar |
| 04 | Carrier Onboarding | `/(dashboard)/carriers/onboard` | Wizard | Not Started | `05-carrier/04-carrier-onboarding.md` | Omar, Admin |
| 05 | Compliance Center | `/(dashboard)/carriers/compliance` | Dashboard | Not Started | `05-carrier/05-compliance-center.md` | Admin |
| 06 | Insurance Tracking | `/(dashboard)/carriers/insurance` | List | Not Started | `05-carrier/06-insurance-tracking.md` | Admin |
| 07 | Equipment List | `/(dashboard)/carriers/[id]/equipment` | List | Not Started | `05-carrier/07-equipment-list.md` | Omar |
| 08 | Carrier Scorecard | `/(dashboard)/carriers/[id]/scorecard` | Report | Not Started | `05-carrier/08-carrier-scorecard.md` | Omar, Admin |
| 09 | Lane Preferences | `/(dashboard)/carriers/[id]/lanes` | List | Not Started | `05-carrier/09-lane-preferences.md` | Omar |
| 10 | Carrier Contacts | `/(dashboard)/carriers/[id]/contacts` | List | Not Started | `05-carrier/10-carrier-contacts.md` | Omar |
| 11 | FMCSA Lookup | `/(dashboard)/carriers/fmcsa` | Board | Not Started | `05-carrier/11-fmcsa-lookup.md` | Omar |
| 12 | Preferred Carriers | `/(dashboard)/carriers/preferred` | List | Built | `05-carrier/12-preferred-carriers.md` | Omar |

---

### Service 06 - Accounting (Wave 4, 14 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Accounting Dashboard | `/(dashboard)/accounting` | Dashboard | Not Started | `06-accounting/01-accounting-dashboard.md` | Fatima, Admin |
| 02 | Invoices List | `/(dashboard)/accounting/invoices` | List | Not Started | `06-accounting/02-invoices-list.md` | Fatima |
| 03 | Invoice Detail | `/(dashboard)/accounting/invoices/[id]` | Detail | Not Started | `06-accounting/03-invoice-detail.md` | Fatima |
| 04 | Invoice Entry | `/(dashboard)/accounting/invoices/new` | Form | Not Started | `06-accounting/04-invoice-entry.md` | Fatima |
| 05 | Carrier Payables | `/(dashboard)/accounting/payables` | List | Not Started | `06-accounting/05-carrier-payables.md` | Fatima |
| 06 | Bill Entry | `/(dashboard)/accounting/payables/new` | Form | Not Started | `06-accounting/06-bill-entry.md` | Fatima |
| 07 | Payments Received | `/(dashboard)/accounting/payments/received` | List | Not Started | `06-accounting/07-payments-received.md` | Fatima |
| 08 | Payments Made | `/(dashboard)/accounting/payments/made` | List | Not Started | `06-accounting/08-payments-made.md` | Fatima |
| 09 | Payment Entry | `/(dashboard)/accounting/payments/new` | Form | Not Started | `06-accounting/09-payment-entry.md` | Fatima |
| 10 | Bank Reconciliation | `/(dashboard)/accounting/reconciliation` | Board | Not Started | `06-accounting/10-bank-reconciliation.md` | Fatima |
| 11 | GL Transactions | `/(dashboard)/accounting/gl` | List | Not Started | `06-accounting/11-gl-transactions.md` | Fatima, Admin |
| 12 | Chart of Accounts | `/(dashboard)/accounting/chart-of-accounts` | List | Not Started | `06-accounting/12-chart-of-accounts.md` | Admin |
| 13 | Financial Reports | `/(dashboard)/accounting/reports` | Report | Not Started | `06-accounting/13-financial-reports.md` | Fatima, Admin |
| 14 | AR Aging Report | `/(dashboard)/accounting/reports/ar-aging` | Report | Not Started | `06-accounting/14-ar-aging-report.md` | Fatima |

---

### Service 07 - Load Board Internal (Wave 4, 4 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Load Board | `/(dashboard)/load-board` | Board | Not Started | `07-load-board-internal/01-load-board.md` | Omar |
| 02 | Post Load | `/(dashboard)/load-board/post` | Form | Not Started | `07-load-board-internal/02-post-load.md` | Omar |
| 03 | Load Matching | `/(dashboard)/load-board/matching` | Board | Not Started | `07-load-board-internal/03-load-matching.md` | Omar |
| 04 | Board Settings | `/(dashboard)/load-board/settings` | Config | Not Started | `07-load-board-internal/04-board-settings.md` | Admin |

---

### Service 08 - Commission (Wave 4, 6 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Commission Dashboard | `/(dashboard)/commissions` | Dashboard | Not Started | `08-commission/01-commission-dashboard.md` | Sarah, Fatima, Admin |
| 02 | Commission Plans | `/(dashboard)/commissions/plans` | List | Not Started | `08-commission/02-commission-plans.md` | Admin |
| 03 | Plan Editor | `/(dashboard)/commissions/plans/[id]` | Form | Not Started | `08-commission/03-plan-editor.md` | Admin |
| 04 | Commission Calculator | `/(dashboard)/commissions/calculator` | Board | Not Started | `08-commission/04-commission-calculator.md` | Fatima |
| 05 | Commission Statements | `/(dashboard)/commissions/statements` | List | Not Started | `08-commission/05-commission-statements.md` | Sarah, Fatima |
| 06 | Payout History | `/(dashboard)/commissions/payouts` | List | Not Started | `08-commission/06-payout-history.md` | Sarah, Fatima |

---

### Service 09 - Claims (Wave 4, 10 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Claims Dashboard | `/(dashboard)/claims` | Dashboard | Not Started | `09-claims/01-claims-dashboard.md` | Omar, Admin |
| 02 | Claims List | `/(dashboard)/claims/list` | List | Not Started | `09-claims/02-claims-list.md` | Omar |
| 03 | Claim Detail | `/(dashboard)/claims/[id]` | Detail | Not Started | `09-claims/03-claim-detail.md` | Omar |
| 04 | New Claim | `/(dashboard)/claims/new` | Form | Not Started | `09-claims/04-new-claim.md` | Omar |
| 05 | Claim Investigation | `/(dashboard)/claims/[id]/investigation` | Form | Not Started | `09-claims/05-claim-investigation.md` | Omar |
| 06 | Damage Photos | `/(dashboard)/claims/[id]/photos` | Detail | Not Started | `09-claims/06-damage-photos.md` | Omar |
| 07 | Settlement Calculator | `/(dashboard)/claims/[id]/settlement` | Board | Not Started | `09-claims/07-settlement-calculator.md` | Omar |
| 08 | Claim Resolution | `/(dashboard)/claims/[id]/resolve` | Form | Not Started | `09-claims/08-claim-resolution.md` | Admin |
| 09 | Claims Report | `/(dashboard)/claims/reports` | Report | Not Started | `09-claims/09-claims-report.md` | Admin |
| 10 | Carrier Claims History | `/(dashboard)/claims/carrier-history` | List | Not Started | `09-claims/10-carrier-claims-history.md` | Omar |

---

### Service 10 - Documents (Wave 4, 8 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Document Library | `/(dashboard)/documents` | List | Not Started | `10-documents/01-document-library.md` | All Users |
| 02 | Document Viewer | `/(dashboard)/documents/[id]` | Detail | Not Started | `10-documents/02-document-viewer.md` | All Users |
| 03 | Document Upload | `/(dashboard)/documents/upload` | Form | Not Started | `10-documents/03-document-upload.md` | All Users |
| 04 | Template Manager | `/(dashboard)/documents/templates` | List | Not Started | `10-documents/04-template-manager.md` | Admin |
| 05 | Template Editor | `/(dashboard)/documents/templates/[id]` | Form | Not Started | `10-documents/05-template-editor.md` | Admin |
| 06 | E-Signature | `/(dashboard)/documents/[id]/sign` | Form | Not Started | `10-documents/06-e-signature.md` | All Users |
| 07 | Document Scanner | `/(dashboard)/documents/scan` | Board | Not Started | `10-documents/07-document-scanner.md` | All Users |
| 08 | Document Reports | `/(dashboard)/documents/reports` | Report | Not Started | `10-documents/08-document-reports.md` | Admin |

---

### Service 11 - Communication (Wave 4, 10 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Communication Hub | `/(dashboard)/communications` | Dashboard | Not Started | `11-communication/01-communication-hub.md` | All Users |
| 02 | Inbox | `/(dashboard)/communications/inbox` | List | Not Started | `11-communication/02-inbox.md` | All Users |
| 03 | Compose Email | `/(dashboard)/communications/compose/email` | Form | Not Started | `11-communication/03-compose-email.md` | All Users |
| 04 | SMS Compose | `/(dashboard)/communications/compose/sms` | Form | Not Started | `11-communication/04-sms-compose.md` | Omar |
| 05 | Email Templates | `/(dashboard)/communications/templates/email` | List | Not Started | `11-communication/05-email-templates.md` | Admin |
| 06 | SMS Templates | `/(dashboard)/communications/templates/sms` | List | Not Started | `11-communication/06-sms-templates.md` | Admin |
| 07 | Notification Center | `/(dashboard)/communications/notifications` | List | Not Started | `11-communication/07-notification-center.md` | All Users |
| 08 | Communication Log | `/(dashboard)/communications/log` | List | Not Started | `11-communication/08-communication-log.md` | Admin |
| 09 | Auto-Message Rules | `/(dashboard)/communications/auto-rules` | List | Not Started | `11-communication/09-auto-message-rules.md` | Admin |
| 10 | Bulk Messaging | `/(dashboard)/communications/bulk` | Form | Not Started | `11-communication/10-bulk-messaging.md` | Admin |

---

### Service 12 - Customer Portal (Wave 4, 10 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Portal Dashboard | `/portal/customer` | Dashboard | Not Started | `12-customer-portal/01-portal-dashboard.md` | Customer |
| 02 | My Shipments | `/portal/customer/shipments` | List | Not Started | `12-customer-portal/02-my-shipments.md` | Customer |
| 03 | Shipment Detail | `/portal/customer/shipments/[id]` | Detail | Not Started | `12-customer-portal/03-shipment-detail.md` | Customer |
| 04 | Request Quote | `/portal/customer/quotes/new` | Form | Not Started | `12-customer-portal/04-request-quote.md` | Customer |
| 05 | My Quotes | `/portal/customer/quotes` | List | Not Started | `12-customer-portal/05-my-quotes.md` | Customer |
| 06 | My Invoices | `/portal/customer/invoices` | List | Not Started | `12-customer-portal/06-my-invoices.md` | Customer |
| 07 | Documents | `/portal/customer/documents` | List | Not Started | `12-customer-portal/07-documents.md` | Customer |
| 08 | Report Issue | `/portal/customer/issues/new` | Form | Not Started | `12-customer-portal/08-report-issue.md` | Customer |
| 09 | My Profile | `/portal/customer/profile` | Form | Not Started | `12-customer-portal/09-my-profile.md` | Customer |
| 10 | Track Shipment | `/portal/customer/tracking/[id]` | Map | Not Started | `12-customer-portal/10-track-shipment.md` | Customer |

---

### Service 13 - Carrier Portal (Wave 4, 12 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Portal Dashboard | `/portal/carrier` | Dashboard | Not Started | `13-carrier-portal/01-portal-dashboard.md` | Carrier |
| 02 | Available Loads | `/portal/carrier/loads/available` | List | Not Started | `13-carrier-portal/02-available-loads.md` | Carrier |
| 03 | My Loads | `/portal/carrier/loads` | List | Not Started | `13-carrier-portal/03-my-loads.md` | Carrier |
| 04 | Load Detail | `/portal/carrier/loads/[id]` | Detail | Not Started | `13-carrier-portal/04-load-detail.md` | Carrier |
| 05 | Accept Load | `/portal/carrier/loads/[id]/accept` | Form | Not Started | `13-carrier-portal/05-accept-load.md` | Carrier |
| 06 | Update Status | `/portal/carrier/loads/[id]/status` | Form | Not Started | `13-carrier-portal/06-update-status.md` | Carrier |
| 07 | Upload POD | `/portal/carrier/loads/[id]/pod` | Form | Not Started | `13-carrier-portal/07-upload-pod.md` | Carrier |
| 08 | My Payments | `/portal/carrier/payments` | List | Not Started | `13-carrier-portal/08-my-payments.md` | Carrier |
| 09 | My Documents | `/portal/carrier/documents` | List | Not Started | `13-carrier-portal/09-my-documents.md` | Carrier |
| 10 | Update Documents | `/portal/carrier/documents/upload` | Form | Not Started | `13-carrier-portal/10-update-documents.md` | Carrier |
| 11 | My Profile | `/portal/carrier/profile` | Form | Not Started | `13-carrier-portal/11-my-profile.md` | Carrier |
| 12 | Request Quick Pay | `/portal/carrier/quick-pay` | Form | Not Started | `13-carrier-portal/12-request-quick-pay.md` | Carrier |

---

### Service 14 - Contracts (Wave 4, 8 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Contracts Dashboard | `/(dashboard)/contracts` | Dashboard | Not Started | `14-contracts/01-contracts-dashboard.md` | Admin |
| 02 | Customer Contracts | `/(dashboard)/contracts/customer` | List | Not Started | `14-contracts/02-customer-contracts.md` | Sarah, Admin |
| 03 | Carrier Contracts | `/(dashboard)/contracts/carrier` | List | Not Started | `14-contracts/03-carrier-contracts.md` | Omar, Admin |
| 04 | Contract Detail | `/(dashboard)/contracts/[id]` | Detail | Not Started | `14-contracts/04-contract-detail.md` | Admin |
| 05 | Contract Editor | `/(dashboard)/contracts/[id]/edit` | Form | Not Started | `14-contracts/05-contract-editor.md` | Admin |
| 06 | Contract Templates | `/(dashboard)/contracts/templates` | List | Not Started | `14-contracts/06-contract-templates.md` | Admin |
| 07 | Renewal Queue | `/(dashboard)/contracts/renewals` | List | Not Started | `14-contracts/07-renewal-queue.md` | Admin |
| 08 | Contract Reports | `/(dashboard)/contracts/reports` | Report | Not Started | `14-contracts/08-contract-reports.md` | Admin |

---

### Service 15 - Agent (Wave 4, 8 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Agent Dashboard | `/(dashboard)/agents` | Dashboard | Not Started | `15-agent/01-agent-dashboard.md` | Admin |
| 02 | Agents List | `/(dashboard)/agents/list` | List | Not Started | `15-agent/02-agents-list.md` | Admin |
| 03 | Agent Detail | `/(dashboard)/agents/[id]` | Detail | Not Started | `15-agent/03-agent-detail.md` | Admin |
| 04 | Agent Onboarding | `/(dashboard)/agents/onboard` | Wizard | Not Started | `15-agent/04-agent-onboarding.md` | Admin |
| 05 | Agent Commissions | `/(dashboard)/agents/[id]/commissions` | List | Not Started | `15-agent/05-agent-commissions.md` | Fatima |
| 06 | Agent Customers | `/(dashboard)/agents/[id]/customers` | List | Not Started | `15-agent/06-agent-customers.md` | Admin |
| 07 | Agent Performance | `/(dashboard)/agents/[id]/performance` | Report | Not Started | `15-agent/07-agent-performance.md` | Admin |
| 08 | Agent Settlements | `/(dashboard)/agents/settlements` | List | Not Started | `15-agent/08-agent-settlements.md` | Fatima |

---

### Service 16 - Credit (Wave 4, 10 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Credit Dashboard | `/(dashboard)/credit` | Dashboard | Not Started | `16-credit/01-credit-dashboard.md` | Fatima, Admin |
| 02 | Credit Applications | `/(dashboard)/credit/applications` | List | Not Started | `16-credit/02-credit-applications.md` | Fatima |
| 03 | Application Review | `/(dashboard)/credit/applications/[id]` | Form | Not Started | `16-credit/03-application-review.md` | Admin |
| 04 | Credit Limits | `/(dashboard)/credit/limits` | List | Not Started | `16-credit/04-credit-limits.md` | Fatima |
| 05 | Credit Limit Editor | `/(dashboard)/credit/limits/[id]` | Form | Not Started | `16-credit/05-credit-limit-editor.md` | Admin |
| 06 | Credit Holds | `/(dashboard)/credit/holds` | List | Not Started | `16-credit/06-credit-holds.md` | Fatima |
| 07 | Collections Queue | `/(dashboard)/credit/collections` | List | Not Started | `16-credit/07-collections-queue.md` | Fatima |
| 08 | Collection Activity | `/(dashboard)/credit/collections/[id]` | Form | Not Started | `16-credit/08-collection-activity.md` | Fatima |
| 09 | Payment Plans | `/(dashboard)/credit/payment-plans` | List | Not Started | `16-credit/09-payment-plans.md` | Fatima |
| 10 | Credit Reports | `/(dashboard)/credit/reports` | Report | Not Started | `16-credit/10-credit-reports.md` | Admin |

---

### Service 17 - Factoring Internal (Wave 4, 6 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Quick Pay Dashboard | `/(dashboard)/factoring` | Dashboard | Not Started | `17-factoring-internal/01-quick-pay-dashboard.md` | Fatima |
| 02 | Quick Pay Requests | `/(dashboard)/factoring/requests` | List | Not Started | `17-factoring-internal/02-quick-pay-requests.md` | Fatima |
| 03 | Request Detail | `/(dashboard)/factoring/requests/[id]` | Detail | Not Started | `17-factoring-internal/03-request-detail.md` | Fatima |
| 04 | Approve Request | `/(dashboard)/factoring/requests/[id]/approve` | Form | Not Started | `17-factoring-internal/04-approve-request.md` | Fatima |
| 05 | Factoring Settings | `/(dashboard)/factoring/settings` | Config | Not Started | `17-factoring-internal/05-factoring-settings.md` | Admin |
| 06 | Factoring Reports | `/(dashboard)/factoring/reports` | Report | Not Started | `17-factoring-internal/06-factoring-reports.md` | Admin |

---

### Service 18 - HR (Wave 4, 10 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | HR Dashboard | `/(dashboard)/hr` | Dashboard | Not Started | `18-hr/01-hr-dashboard.md` | Admin |
| 02 | Employees List | `/(dashboard)/hr/employees` | List | Not Started | `18-hr/02-employees-list.md` | Admin |
| 03 | Employee Detail | `/(dashboard)/hr/employees/[id]` | Detail | Not Started | `18-hr/03-employee-detail.md` | Admin |
| 04 | Employee Onboarding | `/(dashboard)/hr/employees/onboard` | Wizard | Not Started | `18-hr/04-employee-onboarding.md` | Admin |
| 05 | Time Off Requests | `/(dashboard)/hr/time-off` | List | Not Started | `18-hr/05-time-off-requests.md` | Admin |
| 06 | Time Off Calendar | `/(dashboard)/hr/time-off/calendar` | Calendar | Not Started | `18-hr/06-time-off-calendar.md` | All Users |
| 07 | Performance Reviews | `/(dashboard)/hr/reviews` | List | Not Started | `18-hr/07-performance-reviews.md` | Admin |
| 08 | Org Chart | `/(dashboard)/hr/org-chart` | Board | Not Started | `18-hr/08-org-chart.md` | All Users |
| 09 | Training Records | `/(dashboard)/hr/training` | List | Not Started | `18-hr/09-training-records.md` | Admin |
| 10 | HR Reports | `/(dashboard)/hr/reports` | Report | Not Started | `18-hr/10-hr-reports.md` | Admin |

---

### Service 19 - Analytics (Wave 4, 10 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Analytics Home | `/(dashboard)/analytics` | Dashboard | Not Started | `19-analytics/01-analytics-home.md` | Admin |
| 02 | Operations Dashboard | `/(dashboard)/analytics/operations` | Dashboard | Not Started | `19-analytics/02-operations-dashboard.md` | Omar |
| 03 | Financial Dashboard | `/(dashboard)/analytics/financial` | Dashboard | Not Started | `19-analytics/03-financial-dashboard.md` | Fatima |
| 04 | Sales Dashboard | `/(dashboard)/analytics/sales` | Dashboard | Not Started | `19-analytics/04-sales-dashboard.md` | Sarah |
| 05 | Report Library | `/(dashboard)/analytics/reports` | List | Not Started | `19-analytics/05-report-library.md` | All Users |
| 06 | Report Viewer | `/(dashboard)/analytics/reports/[id]` | Report | Not Started | `19-analytics/06-report-viewer.md` | All Users |
| 07 | Report Builder | `/(dashboard)/analytics/reports/builder` | Board | Not Started | `19-analytics/07-report-builder.md` | Admin |
| 08 | Scheduled Reports | `/(dashboard)/analytics/scheduled` | List | Not Started | `19-analytics/08-scheduled-reports.md` | Admin |
| 09 | Dashboard Builder | `/(dashboard)/analytics/dashboards/builder` | Board | Not Started | `19-analytics/09-dashboard-builder.md` | Admin |
| 10 | Data Explorer | `/(dashboard)/analytics/explorer` | Board | Not Started | `19-analytics/10-data-explorer.md` | Admin |

---

### Service 20 - Workflow (Wave 4, 8 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Automation Center | `/(dashboard)/workflows` | Dashboard | Not Started | `20-workflow/01-automation-center.md` | Admin |
| 02 | Workflow List | `/(dashboard)/workflows/list` | List | Not Started | `20-workflow/02-workflow-list.md` | Admin |
| 03 | Workflow Designer | `/(dashboard)/workflows/[id]/design` | Board | Not Started | `20-workflow/03-workflow-designer.md` | Admin |
| 04 | Trigger Configuration | `/(dashboard)/workflows/[id]/triggers` | Form | Not Started | `20-workflow/04-trigger-configuration.md` | Admin |
| 05 | Action Library | `/(dashboard)/workflows/actions` | List | Not Started | `20-workflow/05-action-library.md` | Admin |
| 06 | Workflow History | `/(dashboard)/workflows/[id]/history` | List | Not Started | `20-workflow/06-workflow-history.md` | Admin |
| 07 | Error Queue | `/(dashboard)/workflows/errors` | List | Not Started | `20-workflow/07-error-queue.md` | Admin |
| 08 | Workflow Templates | `/(dashboard)/workflows/templates` | List | Not Started | `20-workflow/08-workflow-templates.md` | Admin |

---

### Service 21 - Integration Hub (Wave 4, 10 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Integration Dashboard | `/(dashboard)/integrations` | Dashboard | Not Started | `21-integrations/01-integration-dashboard.md` | Admin |
| 02 | Connected Apps | `/(dashboard)/integrations/connected` | List | Not Started | `21-integrations/02-connected-apps.md` | Admin |
| 03 | App Marketplace | `/(dashboard)/integrations/marketplace` | List | Not Started | `21-integrations/03-app-marketplace.md` | Admin |
| 04 | Connection Setup | `/(dashboard)/integrations/connect/[app]` | Wizard | Not Started | `21-integrations/04-connection-setup.md` | Admin |
| 05 | Webhook Manager | `/(dashboard)/integrations/webhooks` | List | Not Started | `21-integrations/05-webhook-manager.md` | Admin |
| 06 | API Keys | `/(dashboard)/integrations/api-keys` | List | Not Started | `21-integrations/06-api-keys.md` | Admin |
| 07 | API Documentation | `/(dashboard)/integrations/docs` | Detail | Not Started | `21-integrations/07-api-documentation.md` | Admin |
| 08 | Sync Status | `/(dashboard)/integrations/sync` | List | Not Started | `21-integrations/08-sync-status.md` | Admin |
| 09 | Integration Logs | `/(dashboard)/integrations/logs` | List | Not Started | `21-integrations/09-integration-logs.md` | Admin |
| 10 | Field Mapping | `/(dashboard)/integrations/[app]/mapping` | Form | Not Started | `21-integrations/10-field-mapping.md` | Admin |

---

### Service 22 - Search (Wave 4, 4 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Global Search | `/(dashboard)/search` | Search | Not Started | `22-search/01-global-search.md` | All Users |
| 02 | Advanced Search | `/(dashboard)/search/advanced` | Search | Not Started | `22-search/02-advanced-search.md` | All Users |
| 03 | Saved Searches | `/(dashboard)/search/saved` | List | Not Started | `22-search/03-saved-searches.md` | All Users |
| 04 | Search Configuration | `/(dashboard)/search/config` | Config | Not Started | `22-search/04-search-configuration.md` | Admin |

---

### Service 23 - Audit (Wave 4, 6 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Audit Dashboard | `/(dashboard)/audit` | Dashboard | Not Started | `23-audit/01-audit-dashboard.md` | Admin |
| 02 | Audit Log | `/(dashboard)/audit/log` | List | Not Started | `23-audit/02-audit-log.md` | Admin |
| 03 | Change History | `/(dashboard)/audit/changes` | List | Not Started | `23-audit/03-change-history.md` | Admin |
| 04 | Access Log | `/(dashboard)/audit/access` | List | Not Started | `23-audit/04-access-log.md` | Admin |
| 05 | Compliance Report | `/(dashboard)/audit/compliance` | Report | Not Started | `23-audit/05-compliance-report.md` | Admin |
| 06 | Data Export | `/(dashboard)/audit/export` | Board | Not Started | `23-audit/06-data-export.md` | Admin |

---

### Service 24 - Config (Wave 4, 8 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Settings Home | `/(dashboard)/settings` | Dashboard | Not Started | `24-config/01-settings-home.md` | Admin |
| 02 | Company Settings | `/(dashboard)/settings/company` | Form | Not Started | `24-config/02-company-settings.md` | Admin |
| 03 | Feature Flags | `/(dashboard)/settings/features` | List | Not Started | `24-config/03-feature-flags.md` | Admin |
| 04 | Custom Fields | `/(dashboard)/settings/custom-fields` | List | Not Started | `24-config/04-custom-fields.md` | Admin |
| 05 | Custom Field Editor | `/(dashboard)/settings/custom-fields/[id]` | Form | Not Started | `24-config/05-custom-field-editor.md` | Admin |
| 06 | Dropdown Options | `/(dashboard)/settings/dropdowns` | List | Not Started | `24-config/06-dropdown-options.md` | Admin |
| 07 | Business Rules | `/(dashboard)/settings/rules` | List | Not Started | `24-config/07-business-rules.md` | Admin |
| 08 | Default Values | `/(dashboard)/settings/defaults` | Form | Not Started | `24-config/08-default-values.md` | Admin |

---

### Service 25 - Scheduler (Wave 4, 6 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Scheduler Dashboard | `/(dashboard)/scheduler` | Dashboard | Not Started | `25-scheduler/01-scheduler-dashboard.md` | Admin |
| 02 | Scheduled Jobs | `/(dashboard)/scheduler/jobs` | List | Not Started | `25-scheduler/02-scheduled-jobs.md` | Admin |
| 03 | Job Editor | `/(dashboard)/scheduler/jobs/[id]` | Form | Not Started | `25-scheduler/03-job-editor.md` | Admin |
| 04 | Job History | `/(dashboard)/scheduler/history` | List | Not Started | `25-scheduler/04-job-history.md` | Admin |
| 05 | Reminders | `/(dashboard)/scheduler/reminders` | List | Not Started | `25-scheduler/05-reminders.md` | All Users |
| 06 | Calendar Sync | `/(dashboard)/scheduler/calendar-sync` | Config | Not Started | `25-scheduler/06-calendar-sync.md` | Admin |

---

### Service 26 - Cache (Wave 5, 4 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Cache Dashboard | `/platform/cache` | Dashboard | Not Started | `26-cache/01-cache-dashboard.md` | Super Admin |
| 02 | Cache Keys | `/platform/cache/keys` | List | Not Started | `26-cache/02-cache-keys.md` | Super Admin |
| 03 | Cache Stats | `/platform/cache/stats` | Report | Not Started | `26-cache/03-cache-stats.md` | Super Admin |
| 04 | Cache Flush | `/platform/cache/flush` | Board | Not Started | `26-cache/04-cache-flush.md` | Super Admin |

---

### Service 27 - Help Desk (Wave 4, 6 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Support Dashboard | `/(dashboard)/support` | Dashboard | Not Started | `27-help-desk/01-support-dashboard.md` | Support |
| 02 | Ticket List | `/(dashboard)/support/tickets` | List | Not Started | `27-help-desk/02-ticket-list.md` | Support |
| 03 | Ticket Detail | `/(dashboard)/support/tickets/[id]` | Detail | Not Started | `27-help-desk/03-ticket-detail.md` | Support |
| 04 | New Ticket | `/(dashboard)/support/tickets/new` | Form | Not Started | `27-help-desk/04-new-ticket.md` | All Users |
| 05 | Knowledge Base | `/(dashboard)/support/kb` | Search | Not Started | `27-help-desk/05-knowledge-base.md` | All Users |
| 06 | Article Editor | `/(dashboard)/support/kb/[id]/edit` | Form | Not Started | `27-help-desk/06-article-editor.md` | Support |

---

### Service 28 - Feedback (Wave 4, 6 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Feedback Dashboard | `/(dashboard)/feedback` | Dashboard | Not Started | `28-feedback/01-feedback-dashboard.md` | Admin |
| 02 | Survey Results | `/(dashboard)/feedback/surveys` | List | Not Started | `28-feedback/02-survey-results.md` | Admin |
| 03 | Feature Requests | `/(dashboard)/feedback/requests` | List | Not Started | `28-feedback/03-feature-requests.md` | Admin |
| 04 | Submit Feedback | `/(dashboard)/feedback/new` | Form | Not Started | `28-feedback/04-submit-feedback.md` | All Users |
| 05 | NPS Survey | `/(dashboard)/feedback/nps` | Form | Not Started | `28-feedback/05-nps-survey.md` | All Users |
| 06 | Feedback Report | `/(dashboard)/feedback/reports` | Report | Not Started | `28-feedback/06-feedback-report.md` | Admin |

---

### Service 29 - EDI (Wave 5, 8 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | EDI Dashboard | `/(dashboard)/edi` | Dashboard | Not Started | `29-edi/01-edi-dashboard.md` | Admin |
| 02 | Trading Partners | `/(dashboard)/edi/partners` | List | Not Started | `29-edi/02-trading-partners.md` | Admin |
| 03 | Partner Setup | `/(dashboard)/edi/partners/new` | Wizard | Not Started | `29-edi/03-partner-setup.md` | Admin |
| 04 | Inbound Queue | `/(dashboard)/edi/inbound` | List | Not Started | `29-edi/04-inbound-queue.md` | Omar |
| 05 | Outbound Queue | `/(dashboard)/edi/outbound` | List | Not Started | `29-edi/05-outbound-queue.md` | Omar |
| 06 | Transaction Detail | `/(dashboard)/edi/transactions/[id]` | Detail | Not Started | `29-edi/06-transaction-detail.md` | Omar |
| 07 | Error Queue | `/(dashboard)/edi/errors` | List | Not Started | `29-edi/07-error-queue.md` | Admin |
| 08 | EDI Mapping | `/(dashboard)/edi/mapping` | Form | Not Started | `29-edi/08-edi-mapping.md` | Admin |

---

### Service 30 - Safety (Wave 5, 10 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Safety Dashboard | `/(dashboard)/safety` | Dashboard | Not Started | `30-safety/01-safety-dashboard.md` | Admin |
| 02 | CSA Scores | `/(dashboard)/safety/csa` | List | Not Started | `30-safety/02-csa-scores.md` | Omar, Admin |
| 03 | CSA Detail | `/(dashboard)/safety/csa/[id]` | Detail | Not Started | `30-safety/03-csa-detail.md` | Omar |
| 04 | Safety Ratings | `/(dashboard)/safety/ratings` | List | Not Started | `30-safety/04-safety-ratings.md` | Omar |
| 05 | Insurance Monitor | `/(dashboard)/safety/insurance` | List | Not Started | `30-safety/05-insurance-monitor.md` | Admin |
| 06 | Authority Monitor | `/(dashboard)/safety/authority` | List | Not Started | `30-safety/06-authority-monitor.md` | Admin |
| 07 | DQF Manager | `/(dashboard)/safety/dqf` | List | Not Started | `30-safety/07-dqf-manager.md` | Admin |
| 08 | Incident Log | `/(dashboard)/safety/incidents` | List | Not Started | `30-safety/08-incident-log.md` | Admin |
| 09 | Watchlist | `/(dashboard)/safety/watchlist` | List | Not Started | `30-safety/09-watchlist.md` | Omar |
| 10 | Compliance Reports | `/(dashboard)/safety/reports` | Report | Not Started | `30-safety/10-compliance-reports.md` | Admin |

---

### Service 31 - Fuel Cards (Wave 5, 8 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Fuel Dashboard | `/(dashboard)/fuel` | Dashboard | Not Started | `31-fuel/01-fuel-dashboard.md` | Fatima |
| 02 | Transactions | `/(dashboard)/fuel/transactions` | List | Not Started | `31-fuel/02-transactions.md` | Fatima |
| 03 | Fuel Advances | `/(dashboard)/fuel/advances` | List | Not Started | `31-fuel/03-fuel-advances.md` | Fatima |
| 04 | Advance Request | `/(dashboard)/fuel/advances/new` | Form | Not Started | `31-fuel/04-advance-request.md` | Omar |
| 05 | Cards Management | `/(dashboard)/fuel/cards` | List | Not Started | `31-fuel/05-cards-management.md` | Admin |
| 06 | Provider Setup | `/(dashboard)/fuel/provider` | Config | Not Started | `31-fuel/06-provider-setup.md` | Admin |
| 07 | Fraud Alerts | `/(dashboard)/fuel/alerts` | List | Not Started | `31-fuel/07-fraud-alerts.md` | Admin |
| 08 | IFTA Report | `/(dashboard)/fuel/ifta` | Report | Not Started | `31-fuel/08-ifta-report.md` | Fatima |

---

### Service 32 - Factoring External (Wave 5, 8 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Factoring Dashboard | `/(dashboard)/factoring-external` | Dashboard | Not Started | `32-factoring-external/01-factoring-dashboard.md` | Fatima |
| 02 | Quick Pay Requests | `/(dashboard)/factoring-external/requests` | List | Not Started | `32-factoring-external/02-quick-pay-requests.md` | Fatima |
| 03 | Quick Pay Detail | `/(dashboard)/factoring-external/requests/[id]` | Detail | Not Started | `32-factoring-external/03-quick-pay-detail.md` | Fatima |
| 04 | Factoring Setup | `/(dashboard)/factoring-external/setup` | Config | Not Started | `32-factoring-external/04-factoring-setup.md` | Admin |
| 05 | NOA Management | `/(dashboard)/factoring-external/noa` | List | Not Started | `32-factoring-external/05-noa-management.md` | Admin |
| 06 | Verification Log | `/(dashboard)/factoring-external/verifications` | List | Not Started | `32-factoring-external/06-verification-log.md` | Fatima |
| 07 | Reserve Account | `/(dashboard)/factoring-external/reserve` | List | Not Started | `32-factoring-external/07-reserve-account.md` | Fatima |
| 08 | Factoring Reports | `/(dashboard)/factoring-external/reports` | Report | Not Started | `32-factoring-external/08-factoring-reports.md` | Admin |

---

### Service 33 - Load Board External (Wave 5, 8 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Load Board Dashboard | `/(dashboard)/external-board` | Dashboard | Not Started | `33-load-board-external/01-load-board-dashboard.md` | Omar |
| 02 | Posted Loads | `/(dashboard)/external-board/posted` | List | Not Started | `33-load-board-external/02-posted-loads.md` | Omar |
| 03 | Post Load | `/(dashboard)/external-board/post` | Form | Not Started | `33-load-board-external/03-post-load.md` | Omar |
| 04 | Capacity Search | `/(dashboard)/external-board/capacity` | Board | Not Started | `33-load-board-external/04-capacity-search.md` | Omar |
| 05 | Bid Management | `/(dashboard)/external-board/bids` | List | Not Started | `33-load-board-external/05-bid-management.md` | Omar |
| 06 | Lead Inbox | `/(dashboard)/external-board/leads` | List | Not Started | `33-load-board-external/06-lead-inbox.md` | Omar |
| 07 | Board Connections | `/(dashboard)/external-board/connections` | Config | Not Started | `33-load-board-external/07-board-connections.md` | Admin |
| 08 | Posting Rules | `/(dashboard)/external-board/rules` | List | Not Started | `33-load-board-external/08-posting-rules.md` | Admin |

---

### Service 34 - Mobile App (Wave 5, 8 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Mobile Dashboard | `/(dashboard)/mobile` | Dashboard | Not Started | `34-mobile/01-mobile-dashboard.md` | Admin |
| 02 | Device Management | `/(dashboard)/mobile/devices` | List | Not Started | `34-mobile/02-device-management.md` | Admin |
| 03 | Push Notifications | `/(dashboard)/mobile/notifications` | List | Not Started | `34-mobile/03-push-notifications.md` | Admin |
| 04 | Push Composer | `/(dashboard)/mobile/notifications/compose` | Form | Not Started | `34-mobile/04-push-composer.md` | Admin |
| 05 | Offline Sync | `/(dashboard)/mobile/sync` | List | Not Started | `34-mobile/05-offline-sync.md` | Admin |
| 06 | Location History | `/(dashboard)/mobile/locations` | Map | Not Started | `34-mobile/06-location-history.md` | Omar |
| 07 | App Configuration | `/(dashboard)/mobile/config` | Config | Not Started | `34-mobile/07-app-configuration.md` | Admin |
| 08 | Feature Flags | `/(dashboard)/mobile/features` | List | Not Started | `34-mobile/08-feature-flags.md` | Admin |

---

### Service 35 - Rate Intelligence (Wave 5, 8 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Market Dashboard | `/(dashboard)/rates` | Dashboard | Not Started | `35-rate-intelligence/01-market-dashboard.md` | Sarah, Omar |
| 02 | Rate Lookup | `/(dashboard)/rates/lookup` | Board | Not Started | `35-rate-intelligence/02-rate-lookup.md` | Sarah, Omar |
| 03 | Rate History | `/(dashboard)/rates/history` | Report | Not Started | `35-rate-intelligence/03-rate-history.md` | Sarah |
| 04 | Rate Alerts | `/(dashboard)/rates/alerts` | List | Not Started | `35-rate-intelligence/04-rate-alerts.md` | Sarah, Admin |
| 05 | Alert Editor | `/(dashboard)/rates/alerts/[id]` | Form | Not Started | `35-rate-intelligence/05-alert-editor.md` | Sarah, Admin |
| 06 | Lane Analysis | `/(dashboard)/rates/lanes` | Report | Not Started | `35-rate-intelligence/06-lane-analysis.md` | Admin |
| 07 | Market Reports | `/(dashboard)/rates/reports` | Report | Not Started | `35-rate-intelligence/07-market-reports.md` | Admin |
| 08 | Provider Setup | `/(dashboard)/rates/provider` | Config | Not Started | `35-rate-intelligence/08-provider-setup.md` | Admin |

---

### Service 36 - ELD (Wave 5, 8 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | ELD Dashboard | `/(dashboard)/eld` | Dashboard | Not Started | `36-eld/01-eld-dashboard.md` | Omar |
| 02 | Driver HOS | `/(dashboard)/eld/hos` | List | Not Started | `36-eld/02-driver-hos.md` | Omar |
| 03 | Driver Detail | `/(dashboard)/eld/drivers/[id]` | Detail | Not Started | `36-eld/03-driver-detail.md` | Omar |
| 04 | Violations | `/(dashboard)/eld/violations` | List | Not Started | `36-eld/04-violations.md` | Omar, Admin |
| 05 | Vehicle Locations | `/(dashboard)/eld/locations` | Map | Not Started | `36-eld/05-vehicle-locations.md` | Omar |
| 06 | Trip History | `/(dashboard)/eld/trips` | List | Not Started | `36-eld/06-trip-history.md` | Omar |
| 07 | ELD Devices | `/(dashboard)/eld/devices` | List | Not Started | `36-eld/07-eld-devices.md` | Admin |
| 08 | Provider Setup | `/(dashboard)/eld/provider` | Config | Not Started | `36-eld/08-provider-setup.md` | Admin |

---

### Service 37 - Cross-Border (Wave 5, 10 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Cross-Border Dashboard | `/(dashboard)/cross-border` | Dashboard | Not Started | `37-cross-border/01-cross-border-dashboard.md` | Omar |
| 02 | Shipments List | `/(dashboard)/cross-border/shipments` | List | Not Started | `37-cross-border/02-shipments-list.md` | Omar |
| 03 | Shipment Detail | `/(dashboard)/cross-border/shipments/[id]` | Detail | Not Started | `37-cross-border/03-shipment-detail.md` | Omar |
| 04 | Document Manager | `/(dashboard)/cross-border/documents` | List | Not Started | `37-cross-border/04-document-manager.md` | Omar |
| 05 | Broker Directory | `/(dashboard)/cross-border/brokers` | List | Not Started | `37-cross-border/05-broker-directory.md` | Omar |
| 06 | Permits List | `/(dashboard)/cross-border/permits` | List | Not Started | `37-cross-border/06-permits-list.md` | Admin |
| 07 | Permit Application | `/(dashboard)/cross-border/permits/new` | Form | Not Started | `37-cross-border/07-permit-application.md` | Admin |
| 08 | Border Status | `/(dashboard)/cross-border/status` | Dashboard | Not Started | `37-cross-border/08-border-status.md` | Omar |
| 09 | Crossing History | `/(dashboard)/cross-border/history` | List | Not Started | `37-cross-border/09-crossing-history.md` | Omar |
| 10 | Compliance Check | `/(dashboard)/cross-border/compliance` | Board | Not Started | `37-cross-border/10-compliance-check.md` | Omar |

---

### Service 38 - Super Admin (Wave 5, 28 screens)

| # | Screen | Route | Type | Status | Design Doc | Personas |
|---|--------|-------|------|--------|-----------|----------|
| 01 | Platform Dashboard | `/platform` | Dashboard | Not Started | `38-super-admin/01-platform-dashboard.md` | Super Admin |
| 02 | Tenant List | `/platform/tenants` | List | Not Started | `38-super-admin/02-tenant-list.md` | Super Admin |
| 03 | Tenant Detail | `/platform/tenants/[id]` | Detail | Not Started | `38-super-admin/03-tenant-detail.md` | Super Admin |
| 04 | Create Tenant | `/platform/tenants/new` | Wizard | Not Started | `38-super-admin/04-create-tenant.md` | Super Admin |
| 05 | Tenant Settings | `/platform/tenants/[id]/settings` | Form | Not Started | `38-super-admin/05-tenant-settings.md` | Super Admin |
| 06 | Subscription Plans | `/platform/subscriptions/plans` | List | Not Started | `38-super-admin/06-subscription-plans.md` | Super Admin |
| 07 | Plan Editor | `/platform/subscriptions/plans/[id]` | Form | Not Started | `38-super-admin/07-plan-editor.md` | Super Admin |
| 08 | Tenant Subscriptions | `/platform/subscriptions` | List | Not Started | `38-super-admin/08-tenant-subscriptions.md` | Super Admin |
| 09 | Billing Dashboard | `/platform/billing` | Dashboard | Not Started | `38-super-admin/09-billing-dashboard.md` | Super Admin |
| 10 | Invoices | `/platform/billing/invoices` | List | Not Started | `38-super-admin/10-invoices.md` | Super Admin |
| 11 | Payments | `/platform/billing/payments` | List | Not Started | `38-super-admin/11-payments.md` | Super Admin |
| 12 | Usage Metrics | `/platform/usage` | Report | Not Started | `38-super-admin/12-usage-metrics.md` | Super Admin |
| 13 | Platform Users | `/platform/users` | List | Not Started | `38-super-admin/13-platform-users.md` | Super Admin |
| 14 | Platform User Editor | `/platform/users/[id]` | Form | Not Started | `38-super-admin/14-platform-user-editor.md` | Super Admin |
| 15 | Impersonation | `/platform/impersonate` | Board | Not Started | `38-super-admin/15-impersonation.md` | Super Admin |
| 16 | Impersonation Log | `/platform/impersonate/log` | List | Not Started | `38-super-admin/16-impersonation-log.md` | Super Admin |
| 17 | Announcements | `/platform/announcements` | List | Not Started | `38-super-admin/17-announcements.md` | Super Admin |
| 18 | Announcement Editor | `/platform/announcements/[id]` | Form | Not Started | `38-super-admin/18-announcement-editor.md` | Super Admin |
| 19 | System Health | `/platform/health` | Dashboard | Not Started | `38-super-admin/19-system-health.md` | Super Admin |
| 20 | API Metrics | `/platform/api` | Dashboard | Not Started | `38-super-admin/20-api-metrics.md` | Super Admin |
| 21 | Error Log | `/platform/errors` | List | Not Started | `38-super-admin/21-error-log.md` | Super Admin |
| 22 | Platform Audit Log | `/platform/audit` | List | Not Started | `38-super-admin/22-platform-audit-log.md` | Super Admin |
| 23 | Feature Flags | `/platform/features` | List | Not Started | `38-super-admin/23-feature-flags.md` | Super Admin |
| 24 | System Config | `/platform/config` | Form | Not Started | `38-super-admin/24-system-config.md` | Super Admin |
| 25 | Data Export | `/platform/export` | Board | Not Started | `38-super-admin/25-data-export.md` | Super Admin |
| 26 | Support Dashboard | `/platform/support` | Dashboard | Not Started | `38-super-admin/26-support-dashboard.md` | Super Admin |
| 27 | Tenant Diagnostics | `/platform/tenants/[id]/diagnostics` | Board | Not Started | `38-super-admin/27-tenant-diagnostics.md` | Super Admin |
| 28 | Database Admin | `/platform/database` | Board | Not Started | `38-super-admin/28-database-admin.md` | Super Admin |

---

## Proposed Additional Screens (17 screens)

These screens were identified as gaps in the current catalog and are proposed for inclusion in future waves. Reference: `13-missing-screens-proposals.md`

| # | Proposed Screen | Assigned Service | Route | Type | Rationale |
|---|----------------|-----------------|-------|------|-----------|
| 01 | Email Verification | Service 01 - Auth & Admin | `/(auth)/verify-email` | Form | Already built; missing from catalog. Required for registration flow completion. |
| 02 | Password Change (In-App) | Service 01 - Auth & Admin | `/(dashboard)/profile/security` | Form | Already built; users need to change password from within the app without using "forgot" flow. |
| 03 | Permissions Matrix | Service 01 - Auth & Admin | `/(dashboard)/admin/permissions` | Config | Already built; visual permission assignment separate from role editing. |
| 04 | Customer List | Service 02 - CRM | `/(dashboard)/customers` | List | Already built; distinct from Companies List -- customer-specific view with account status. |
| 05 | Customer Detail | Service 02 - CRM | `/(dashboard)/customers/[id]` | Detail | Already built; customer-specific 360-degree view with orders, invoices, and credit. |
| 06 | Load Planner | Service 04 - TMS Core | `/(dashboard)/load-planner/[id]/edit` | Form | Already built; visual load planning tool for multi-stop optimization. |
| 07 | Quote History | Service 03 - Sales | `/(dashboard)/quote-history` | List | Already built; historical quote records for sales analysis. |
| 08 | Load History | Service 04 - TMS Core | `/(dashboard)/load-history` | List | Already built; historical load records for operations review. |
| 09 | Truck Types | Service 05 - Carrier | `/(dashboard)/truck-types` | Config | Already built; reference data for equipment type management. |
| 10 | Bulk Status Update | Service 04 - TMS Core | `/(dashboard)/loads/bulk-update` | Form | Dispatchers need to update multiple loads simultaneously during shift changes. |
| 11 | Rate Comparison Tool | Service 03 - Sales | `/(dashboard)/sales/rate-compare` | Board | Sales reps need to compare customer rate vs. market rate vs. carrier cost side-by-side. |
| 12 | Carrier Capacity Board | Service 05 - Carrier | `/(dashboard)/carriers/capacity` | Board | Visual board showing carrier capacity by lane and date. |
| 13 | Invoice Batch Processor | Service 06 - Accounting | `/(dashboard)/accounting/invoices/batch` | Form | Accounting needs to generate invoices in bulk for completed loads. |
| 14 | Driver Management | Service 05 - Carrier | `/(dashboard)/carriers/[id]/drivers` | List | Managing individual drivers under a carrier including CDL tracking. |
| 15 | Margin Analysis | Service 19 - Analytics | `/(dashboard)/analytics/margins` | Report | Per-load, per-lane, per-customer margin analysis for profitability decisions. |
| 16 | Onboarding Checklist | Service 01.1 - Dashboard Shell | `/(dashboard)/onboarding` | Wizard | New tenant first-time setup wizard to configure company, invite users, and set preferences. |
| 17 | System Notifications Config | Service 24 - Config | `/(dashboard)/settings/notifications` | Config | Configure which events trigger email/SMS/push notifications per role. |

---

## Built Screens Inventory (as of 2026-02-06)

Screens confirmed built with existing `page.tsx` files in the Next.js App Router:

| # | Screen | Route | Service |
|---|--------|-------|---------|
| 01 | Login | `/(auth)/login` | Service 01 |
| 02 | Register | `/(auth)/register` | Service 01 |
| 03 | Forgot Password | `/(auth)/forgot-password` | Service 01 |
| 04 | Reset Password | `/(auth)/reset-password` | Service 01 |
| 05 | MFA Setup | `/(auth)/mfa` | Service 01 |
| 06 | Email Verification | `/(auth)/verify-email` | Service 01 (Proposed) |
| 07 | Profile Settings | `/(dashboard)/profile` | Service 01 |
| 08 | Profile Security | `/(dashboard)/profile/security` | Service 01 (Proposed) |
| 09 | User Management | `/(dashboard)/admin/users` | Service 01 |
| 10 | User Detail | `/(dashboard)/admin/users/[id]` | Service 01 |
| 11 | User Editor | `/(dashboard)/admin/users/[id]/edit` | Service 01 |
| 12 | New User | `/(dashboard)/admin/users/new` | Service 01 |
| 13 | Role Management | `/(dashboard)/admin/roles` | Service 01 |
| 14 | Role Editor | `/(dashboard)/admin/roles/[id]` | Service 01 |
| 15 | New Role | `/(dashboard)/admin/roles/new` | Service 01 |
| 16 | Tenant Settings | `/(dashboard)/admin/settings` | Service 01 |
| 17 | Audit Logs | `/(dashboard)/admin/audit-logs` | Service 01 |
| 18 | Permissions | `/(dashboard)/admin/permissions` | Service 01 (Proposed) |
| 19 | Tenants List | `/(dashboard)/admin/tenants` | Service 01 |
| 20 | Tenant Detail | `/(dashboard)/admin/tenants/[id]` | Service 01 |
| 21 | Main Dashboard | `/(dashboard)/dashboard` | Service 01.1 |
| 22 | Leads List | `/(dashboard)/leads` | Service 02 |
| 23 | New Lead | `/(dashboard)/leads/new` | Service 02 |
| 24 | Lead Detail | `/(dashboard)/leads/[id]` | Service 02 |
| 25 | Lead Activities | `/(dashboard)/leads/[id]/activities` | Service 02 |
| 26 | Lead Contacts | `/(dashboard)/leads/[id]/contacts` | Service 02 |
| 27 | Companies List | `/(dashboard)/companies` | Service 02 |
| 28 | New Company | `/(dashboard)/companies/new` | Service 02 |
| 29 | Company Detail | `/(dashboard)/companies/[id]` | Service 02 |
| 30 | Company Edit | `/(dashboard)/companies/[id]/edit` | Service 02 |
| 31 | Company Activities | `/(dashboard)/companies/[id]/activities` | Service 02 |
| 32 | Company Contacts | `/(dashboard)/companies/[id]/contacts` | Service 02 |
| 33 | Contacts List | `/(dashboard)/contacts` | Service 02 |
| 34 | New Contact | `/(dashboard)/contacts/new` | Service 02 |
| 35 | Contact Detail | `/(dashboard)/contacts/[id]` | Service 02 |
| 36 | Contact Edit | `/(dashboard)/contacts/[id]/edit` | Service 02 |
| 37 | Customers List | `/(dashboard)/customers` | Service 02 (Proposed) |
| 38 | New Customer | `/(dashboard)/customers/new` | Service 02 (Proposed) |
| 39 | Customer Detail | `/(dashboard)/customers/[id]` | Service 02 (Proposed) |
| 40 | Customer Edit | `/(dashboard)/customers/[id]/edit` | Service 02 (Proposed) |
| 41 | Customer Activities | `/(dashboard)/customers/[id]/activities` | Service 02 (Proposed) |
| 42 | Customer Contacts | `/(dashboard)/customers/[id]/contacts` | Service 02 (Proposed) |
| 43 | Activities | `/(dashboard)/activities` | Service 02 |
| 44 | Carriers List | `/(dashboard)/carriers` | Service 05 |
| 45 | Quote History | `/(dashboard)/quote-history` | Service 03 (Proposed) |
| 46 | Load History | `/(dashboard)/load-history` | Service 04 (Proposed) |
| 47 | Truck Types | `/(dashboard)/truck-types` | Service 05 (Proposed) |
| 48 | Load Planner Edit | `/(dashboard)/load-planner/[id]/edit` | Service 04 (Proposed) |

**Total Built Pages:** 48 page.tsx files across the application

---

## Screen Type Distribution

| Type | Count | Description |
|------|-------|-------------|
| Dashboard | 42 | Overview/KPI screens with charts and metric cards |
| List | 134 | Data tables with filtering, sorting, and pagination |
| Detail | 34 | Single record view with full information |
| Form | 62 | Data entry, editing, and creation screens |
| Report | 26 | Analytics, charts, and exportable reports |
| Board | 24 | Visual tool screens (dispatch board, calculators, scanners) |
| Wizard | 10 | Multi-step guided processes (onboarding, import) |
| Config | 14 | Settings and configuration screens |
| Map | 8 | Geographic displays (tracking, locations) |
| Calendar | 4 | Date-based views (activities, time-off, appointments) |
| Search | 4 | Search interfaces (global search, knowledge base) |
| Portal | 2 | Shell/layout components (sidebar, header) |
| **Total** | **364** | |

---

## Wave Assignment Summary

### Wave 1 - Foundation (39 screens)
- Service 01: Auth & Admin (12 screens)
- Service 01.1: Dashboard Shell (5 screens)
- Service 02: CRM (12 screens)
- Service 03: Sales (10 screens)

### Wave 2 - TMS Core (14 screens)
- Service 04: TMS Core (14 screens)

### Wave 3 - Carrier Management (12 screens)
- Service 05: Carrier (12 screens)

### Wave 4 - Operations & Platform (171 screens)
- Service 06: Accounting (14 screens)
- Service 07: Load Board Internal (4 screens)
- Service 08: Commission (6 screens)
- Service 09: Claims (10 screens)
- Service 10: Documents (8 screens)
- Service 11: Communication (10 screens)
- Service 12: Customer Portal (10 screens)
- Service 13: Carrier Portal (12 screens)
- Service 14: Contracts (8 screens)
- Service 15: Agent (8 screens)
- Service 16: Credit (10 screens)
- Service 17: Factoring Internal (6 screens)
- Service 18: HR (10 screens)
- Service 19: Analytics (10 screens)
- Service 20: Workflow (8 screens)
- Service 21: Integration Hub (10 screens)
- Service 22: Search (4 screens)
- Service 23: Audit (6 screens)
- Service 24: Config (8 screens)
- Service 25: Scheduler (6 screens)
- Service 27: Help Desk (6 screens)
- Service 28: Feedback (6 screens)

### Wave 5 - Extended & Admin (126 screens)
- Service 26: Cache (4 screens)
- Service 29: EDI (8 screens)
- Service 30: Safety (10 screens)
- Service 31: Fuel Cards (8 screens)
- Service 32: Factoring External (8 screens)
- Service 33: Load Board External (8 screens)
- Service 34: Mobile App (8 screens)
- Service 35: Rate Intelligence (8 screens)
- Service 36: ELD (8 screens)
- Service 37: Cross-Border (10 screens)
- Service 38: Super Admin (28 screens)

---

## Persona Reference

| Persona | Role | Primary Services |
|---------|------|-----------------|
| Maria | Sales Representative | CRM, Sales, Communication |
| Sarah | Sales Manager | CRM, Sales, Analytics, Commission |
| Omar | Dispatcher / Operations | TMS Core, Carrier, Load Board, Tracking, ELD, Cross-Border |
| Fatima | Accounting / Finance | Accounting, Credit, Factoring, Commission, Fuel |
| Admin | System Administrator | Auth, Config, Workflow, Integration, All Settings |
| Customer | External Customer | Customer Portal |
| Carrier | External Carrier | Carrier Portal |
| Support | Support Agent | Help Desk, Feedback |
| Super Admin | Platform Administrator | Super Admin, Cache |

---

## Design Doc File Structure

Each screen's design document lives in the `12-Rabih-design-Process` folder organized by service:

```
12-Rabih-design-Process/
  00-global/
    00-master-screen-catalog.md    (this file)
    02-design-principles.md
    03-status-color-system.md
    04-screen-template.md
    06-role-based-views.md
  01-auth/
    01-login.md
    02-register.md
    ...
  02-crm/
    01-crm-dashboard.md
    02-leads-list.md
    ...
  03-sales/
    01-sales-dashboard.md
    ...
  [service-folder]/
    [screen-number]-[screen-name].md
```

Each design doc follows the template defined in `04-screen-template.md` with 15 sections covering purpose, layout, data, features, states, API integration, responsive design, and Stitch prompts.

---

_Last Updated: 2026-02-06_

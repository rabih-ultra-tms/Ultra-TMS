# Accounting Service -- Overview

> Service: 06 - Accounting | Wave: Future | Priority: P1
> Total Screens: 14 | Built: 0 | Remaining: 14
> Primary Personas: Accounting, Admin
> Roles with Access: accounting, admin, super_admin
> Last Updated: 2026-02-06

---

## 1. Service Summary

The Accounting service manages all financial operations within Ultra TMS, including accounts receivable (customer invoicing), accounts payable (carrier payments), general ledger management, bank reconciliation, and financial reporting. This service is the financial backbone of the brokerage, tracking every dollar flowing in from customers and out to carriers, and providing the financial visibility needed for profitable operations.

---

## 2. Screen Catalog (14 Screens)

| # | Screen | Route | Type | Status | Design Doc | Primary Personas |
|---|--------|-------|------|--------|-----------|-----------------|
| 01 | Accounting Dashboard | TBD | Dashboard | Not Started | `06-accounting/01-accounting-dashboard.md` | Accounting, Admin |
| 02 | Invoices List | TBD | List | Not Started | `06-accounting/02-invoices-list.md` | Accounting |
| 03 | Invoice Detail | TBD | Detail | Not Started | `06-accounting/03-invoice-detail.md` | Accounting |
| 04 | Invoice Entry | TBD | Form | Not Started | `06-accounting/04-invoice-entry.md` | Accounting |
| 05 | Carrier Payables | TBD | List | Not Started | `06-accounting/05-carrier-payables.md` | Accounting |
| 06 | Bill Entry | TBD | Form | Not Started | `06-accounting/06-bill-entry.md` | Accounting |
| 07 | Payments Received | TBD | List | Not Started | `06-accounting/07-payments-received.md` | Accounting |
| 08 | Payments Made | TBD | List | Not Started | `06-accounting/08-payments-made.md` | Accounting |
| 09 | Payment Entry | TBD | Form | Not Started | `06-accounting/09-payment-entry.md` | Accounting |
| 10 | Bank Reconciliation | TBD | Tool | Not Started | `06-accounting/10-bank-reconciliation.md` | Accounting |
| 11 | GL Transactions | TBD | List | Not Started | `06-accounting/11-gl-transactions.md` | Accounting, Admin |
| 12 | Chart of Accounts | TBD | List | Not Started | `06-accounting/12-chart-of-accounts.md` | Admin |
| 13 | Financial Reports | TBD | Report | Not Started | `06-accounting/13-financial-reports.md` | Accounting, Admin |
| 14 | AR Aging Report | TBD | Report | Not Started | `06-accounting/14-ar-aging-report.md` | Accounting |

---

## 3. Key Workflows

To be defined in a future wave.

---

## 4. Dependencies

### 4.1 Upstream Dependencies (Services This Service Consumes)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 01 - Auth & Admin | User authentication, role/permission checking, tenant context | Yes |
| Service 04 - TMS Core | Load data for invoicing, carrier assignments for payables | Yes |
| Service 05 - Carrier | Carrier payment terms, banking info, factoring details | Yes |
| Service 02 - CRM | Customer billing information, payment terms | Yes |

### 4.2 Downstream Dependencies (Services That Consume This Service)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 08 - Commission | Revenue data for commission calculations | Yes |
| Service 12 - Customer Portal | Invoice data for customer self-service | Yes |
| Service 13 - Carrier Portal | Payment data for carrier self-service | Yes |
| Service 16 - Credit | Payment history for credit decisions | Yes |
| Service 17 - Factoring | Invoice data for factoring relationships | Yes |
| Service 18 - Analytics | Financial data for analytics dashboards | Yes |

---

## 5. Wave Assignment

This service is assigned to a future wave. All 14 screens are pending design.

---

_Last Updated: 2026-02-06_

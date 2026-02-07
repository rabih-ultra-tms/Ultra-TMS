# Commission Service -- Overview

> Service: 08 - Commission | Wave: Future | Priority: P2
> Total Screens: 6 | Built: 0 | Remaining: 6
> Primary Personas: Sales, Accounting, Admin
> Roles with Access: sales, accounting, admin, super_admin
> Last Updated: 2026-02-06

---

## 1. Service Summary

The Commission service manages sales agent commission plans, calculations, and payouts. It supports configurable commission structures (percentage of revenue, flat per load, tiered), automatic calculation based on completed loads, statement generation, and payout tracking. This service is critical for sales team compensation and retention.

---

## 2. Screen Catalog (6 Screens)

| # | Screen | Route | Type | Status | Design Doc | Primary Personas |
|---|--------|-------|------|--------|-----------|-----------------|
| 01 | Commission Dashboard | TBD | Dashboard | Not Started | `08-commission/01-commission-dashboard.md` | Sales, Admin |
| 02 | Commission Plans | TBD | List | Not Started | `08-commission/02-commission-plans.md` | Admin |
| 03 | Plan Editor | TBD | Form | Not Started | `08-commission/03-plan-editor.md` | Admin |
| 04 | Commission Calculator | TBD | Tool | Not Started | `08-commission/04-commission-calculator.md` | Accounting |
| 05 | Commission Statements | TBD | List | Not Started | `08-commission/05-commission-statements.md` | Sales, Accounting |
| 06 | Payout History | TBD | List | Not Started | `08-commission/06-payout-history.md` | Sales, Accounting |

---

## 3. Key Workflows

To be defined in a future wave.

---

## 4. Dependencies

### 4.1 Upstream Dependencies (Services This Service Consumes)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 01 - Auth & Admin | User authentication, role/permission checking | Yes |
| Service 04 - TMS Core | Completed load data, revenue per load | Yes |
| Service 06 - Accounting | Revenue and payment data for commission basis | Yes |
| Service 15 - Agents | Agent profiles, territory assignments | Yes |

### 4.2 Downstream Dependencies (Services That Consume This Service)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 06 - Accounting | Commission payable amounts for disbursement | Yes |
| Service 18 - Analytics | Commission data for sales analytics | No |

---

## 5. Wave Assignment

This service is assigned to a future wave. All 6 screens are pending design.

---

_Last Updated: 2026-02-06_

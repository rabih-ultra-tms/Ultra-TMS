# Analytics Service -- Overview

> Service: 18 - Analytics | Wave: Future | Priority: P2
> Total Screens: 10 | Built: 0 | Remaining: 10
> Primary Personas: Admin, Management, Ops Manager, Sales Manager, Accounting
> Roles with Access: admin, super_admin, ops_manager, sales_manager, accounting
> Last Updated: 2026-02-06

---

## 1. Service Summary

The Analytics service provides comprehensive business intelligence and reporting across all TMS operations. It aggregates data from every service to deliver KPI dashboards, operational metrics, financial analysis, carrier and customer insights, lane performance, and custom report building. This service transforms raw operational data into actionable business intelligence for decision-making at every level of the organization.

---

## 2. Screen Catalog (10 Screens)

| # | Screen | Route | Type | Status | Design Doc | Primary Personas |
|---|--------|-------|------|--------|-----------|-----------------|
| 01 | Analytics Dashboard | TBD | Dashboard | Not Started | `18-analytics/01-analytics-dashboard.md` | Admin, Management |
| 02 | Operations Analytics | TBD | Report | Not Started | `18-analytics/02-operations-analytics.md` | Ops Manager |
| 03 | Financial Analytics | TBD | Report | Not Started | `18-analytics/03-financial-analytics.md` | Accounting, Admin |
| 04 | Carrier Analytics | TBD | Report | Not Started | `18-analytics/04-carrier-analytics.md` | Dispatch, Admin |
| 05 | Customer Analytics | TBD | Report | Not Started | `18-analytics/05-customer-analytics.md` | Sales, Admin |
| 06 | Lane Analytics | TBD | Report | Not Started | `18-analytics/06-lane-analytics.md` | Ops Manager |
| 07 | Sales Analytics | TBD | Report | Not Started | `18-analytics/07-sales-analytics.md` | Sales Manager |
| 08 | Custom Reports | TBD | Tool | Not Started | `18-analytics/08-custom-reports.md` | Admin |
| 09 | Scheduled Reports | TBD | List | Not Started | `18-analytics/09-scheduled-reports.md` | Admin |
| 10 | Data Export | TBD | Tool | Not Started | `18-analytics/10-data-export.md` | Admin |

---

## 3. Key Workflows

To be defined in a future wave.

---

## 4. Dependencies

### 4.1 Upstream Dependencies (Services This Service Consumes)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 01 - Auth & Admin | User authentication, role/permission checking | Yes |
| Service 02 - CRM | Customer data for customer analytics | Yes |
| Service 04 - TMS Core | Load data for operational analytics | Yes |
| Service 05 - Carrier | Carrier data for carrier analytics | Yes |
| Service 06 - Accounting | Financial data for financial analytics | Yes |
| Service 08 - Commission | Commission data for sales analytics | No |
| Service 09 - Claims | Claims data for claims analytics | No |
| Service 14 - Contracts | Contract data for contract analytics | No |

### 4.2 Downstream Dependencies (Services That Consume This Service)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| All services | Shared reporting infrastructure and components | No |

---

## 5. Wave Assignment

This service is assigned to a future wave. All 10 screens are pending design.

---

_Last Updated: 2026-02-06_

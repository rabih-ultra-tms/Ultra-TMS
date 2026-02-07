# Credit Service -- Overview

> Service: 16 - Credit | Wave: Future | Priority: P2
> Total Screens: 10 | Built: 0 | Remaining: 10
> Primary Personas: Accounting, Sales, Admin
> Roles with Access: accounting, sales, admin, super_admin
> Last Updated: 2026-02-06

---

## 1. Service Summary

The Credit service manages customer creditworthiness assessment, credit limit management, credit monitoring, and collections. It provides tools for evaluating credit applications, setting and adjusting credit limits, monitoring payment behavior, managing overdue accounts, and integrating with external credit agencies (D&B). This service protects the brokerage from bad debt exposure while enabling sales growth through informed credit decisions.

---

## 2. Screen Catalog (10 Screens)

| # | Screen | Route | Type | Status | Design Doc | Primary Personas |
|---|--------|-------|------|--------|-----------|-----------------|
| 01 | Credit Dashboard | TBD | Dashboard | Not Started | `16-credit/01-credit-dashboard.md` | Accounting, Admin |
| 02 | Credit Applications | TBD | List | Not Started | `16-credit/02-credit-applications.md` | Accounting |
| 03 | Credit Application | TBD | Form | Not Started | `16-credit/03-credit-application.md` | Sales |
| 04 | Credit Review | TBD | Detail | Not Started | `16-credit/04-credit-review.md` | Accounting |
| 05 | Credit Limits | TBD | List | Not Started | `16-credit/05-credit-limits.md` | Accounting |
| 06 | Credit Monitoring | TBD | Dashboard | Not Started | `16-credit/06-credit-monitoring.md` | Accounting |
| 07 | Collection Queue | TBD | List | Not Started | `16-credit/07-collection-queue.md` | Accounting |
| 08 | Collection Detail | TBD | Detail | Not Started | `16-credit/08-collection-detail.md` | Accounting |
| 09 | Credit Reports | TBD | Report | Not Started | `16-credit/09-credit-reports.md` | Admin |
| 10 | DNB Integration | TBD | Tool | Not Started | `16-credit/10-dnb-integration.md` | Accounting |

---

## 3. Key Workflows

To be defined in a future wave.

---

## 4. Dependencies

### 4.1 Upstream Dependencies (Services This Service Consumes)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 01 - Auth & Admin | User authentication, role/permission checking | Yes |
| Service 02 - CRM | Customer data for credit assessment | Yes |
| Service 06 - Accounting | Payment history, AR aging data | Yes |

### 4.2 Downstream Dependencies (Services That Consume This Service)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 03 - Sales | Credit limit checks during quoting | Yes |
| Service 04 - TMS Core | Credit holds preventing load dispatch | Yes |
| Service 06 - Accounting | Credit limit enforcement on invoicing | Yes |

---

## 5. Wave Assignment

This service is assigned to a future wave. All 10 screens are pending design.

---

_Last Updated: 2026-02-06_

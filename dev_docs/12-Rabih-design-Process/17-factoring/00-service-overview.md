# Factoring Service -- Overview

> Service: 17 - Factoring | Wave: Future | Priority: P2
> Total Screens: 6 | Built: 0 | Remaining: 6
> Primary Personas: Accounting, Admin
> Roles with Access: accounting, admin, super_admin
> Last Updated: 2026-02-06

---

## 1. Service Summary

The Factoring service manages relationships with factoring companies that provide quick payment to carriers. Many carriers use factoring companies to receive immediate payment on their invoices, and the brokerage must track and coordinate payments to these third-party factors. This service handles factoring company setup, payment routing, funding requests, and payment scheduling.

---

## 2. Screen Catalog (6 Screens)

| # | Screen | Route | Type | Status | Design Doc | Primary Personas |
|---|--------|-------|------|--------|-----------|-----------------|
| 01 | Factoring Dashboard | TBD | Dashboard | Not Started | `17-factoring/01-factoring-dashboard.md` | Accounting |
| 02 | Factoring Companies | TBD | List | Not Started | `17-factoring/02-factoring-companies.md` | Admin |
| 03 | Factoring Setup | TBD | Form | Not Started | `17-factoring/03-factoring-setup.md` | Admin |
| 04 | Funding Requests | TBD | List | Not Started | `17-factoring/04-funding-requests.md` | Accounting |
| 05 | Payment Schedule | TBD | List | Not Started | `17-factoring/05-payment-schedule.md` | Accounting |
| 06 | Factoring Reports | TBD | Report | Not Started | `17-factoring/06-factoring-reports.md` | Admin |

---

## 3. Key Workflows

To be defined in a future wave.

---

## 4. Dependencies

### 4.1 Upstream Dependencies (Services This Service Consumes)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 01 - Auth & Admin | User authentication, role/permission checking | Yes |
| Service 05 - Carrier | Carrier factoring company assignments | Yes |
| Service 06 - Accounting | Carrier payable data for payment routing | Yes |

### 4.2 Downstream Dependencies (Services That Consume This Service)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 06 - Accounting | Factoring payment routing instructions | Yes |
| Service 05 - Carrier | Factoring company info for carrier setup | No |

---

## 5. Wave Assignment

This service is assigned to a future wave. All 6 screens are pending design.

---

_Last Updated: 2026-02-06_

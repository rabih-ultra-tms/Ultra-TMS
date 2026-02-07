# Contracts Service -- Overview

> Service: 14 - Contracts | Wave: Future | Priority: P2
> Total Screens: 8 | Built: 0 | Remaining: 8
> Primary Personas: Sales, Admin
> Roles with Access: sales, sales_manager, admin, super_admin
> Last Updated: 2026-02-06

---

## 1. Service Summary

The Contracts service manages customer and carrier contracts, rate agreements, and pricing structures. It provides contract creation, template management, renewal tracking, and contract analytics. This service ensures pricing consistency, automates rate application to loads, and provides visibility into contract expirations to prevent revenue loss from lapsed agreements.

---

## 2. Screen Catalog (8 Screens)

| # | Screen | Route | Type | Status | Design Doc | Primary Personas |
|---|--------|-------|------|--------|-----------|-----------------|
| 01 | Contracts Dashboard | TBD | Dashboard | Not Started | `14-contracts/01-contracts-dashboard.md` | Sales, Admin |
| 02 | Contracts List | TBD | List | Not Started | `14-contracts/02-contracts-list.md` | Sales |
| 03 | Contract Detail | TBD | Detail | Not Started | `14-contracts/03-contract-detail.md` | Sales |
| 04 | Contract Builder | TBD | Form | Not Started | `14-contracts/04-contract-builder.md` | Sales, Admin |
| 05 | Contract Templates | TBD | List | Not Started | `14-contracts/05-contract-templates.md` | Admin |
| 06 | Rate Agreements | TBD | List | Not Started | `14-contracts/06-rate-agreements.md` | Sales |
| 07 | Contract Renewals | TBD | List | Not Started | `14-contracts/07-contract-renewals.md` | Sales |
| 08 | Contract Reports | TBD | Report | Not Started | `14-contracts/08-contract-reports.md` | Admin |

---

## 3. Key Workflows

To be defined in a future wave.

---

## 4. Dependencies

### 4.1 Upstream Dependencies (Services This Service Consumes)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 01 - Auth & Admin | User authentication, role/permission checking | Yes |
| Service 02 - CRM | Customer data for contract association | Yes |
| Service 05 - Carrier | Carrier data for carrier contracts | Yes |
| Service 10 - Documents | Contract document storage, e-signatures | Yes |

### 4.2 Downstream Dependencies (Services That Consume This Service)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 03 - Sales | Contract rates for quoting | Yes |
| Service 04 - TMS Core | Contract rates for load pricing | Yes |
| Service 06 - Accounting | Contract terms for invoicing | Yes |

---

## 5. Wave Assignment

This service is assigned to a future wave. All 8 screens are pending design.

---

_Last Updated: 2026-02-06_

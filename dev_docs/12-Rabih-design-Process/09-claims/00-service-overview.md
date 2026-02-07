# Claims Service -- Overview

> Service: 09 - Claims | Wave: Future | Priority: P2
> Total Screens: 10 | Built: 0 | Remaining: 10
> Primary Personas: Operations, Admin
> Roles with Access: operations, ops_manager, admin, super_admin
> Last Updated: 2026-02-06

---

## 1. Service Summary

The Claims service manages the entire lifecycle of freight claims -- from initial filing through investigation, settlement calculation, and resolution. It handles cargo damage claims, loss claims, delay claims, and overcharge claims. This service protects the brokerage's financial interests by providing structured claim management, photo documentation, settlement calculation tools, and carrier claims history tracking.

---

## 2. Screen Catalog (10 Screens)

| # | Screen | Route | Type | Status | Design Doc | Primary Personas |
|---|--------|-------|------|--------|-----------|-----------------|
| 01 | Claims Dashboard | TBD | Dashboard | Not Started | `09-claims/01-claims-dashboard.md` | Operations, Admin |
| 02 | Claims List | TBD | List | Not Started | `09-claims/02-claims-list.md` | Operations |
| 03 | Claim Detail | TBD | Detail | Not Started | `09-claims/03-claim-detail.md` | Operations |
| 04 | New Claim | TBD | Form | Not Started | `09-claims/04-new-claim.md` | Operations |
| 05 | Claim Investigation | TBD | Form | Not Started | `09-claims/05-claim-investigation.md` | Operations |
| 06 | Damage Photos | TBD | Gallery | Not Started | `09-claims/06-damage-photos.md` | Operations |
| 07 | Settlement Calculator | TBD | Tool | Not Started | `09-claims/07-settlement-calculator.md` | Operations |
| 08 | Claim Resolution | TBD | Form | Not Started | `09-claims/08-claim-resolution.md` | Admin |
| 09 | Claims Report | TBD | Report | Not Started | `09-claims/09-claims-report.md` | Admin |
| 10 | Carrier Claims History | TBD | List | Not Started | `09-claims/10-carrier-claims-history.md` | Operations |

---

## 3. Key Workflows

To be defined in a future wave.

---

## 4. Dependencies

### 4.1 Upstream Dependencies (Services This Service Consumes)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 01 - Auth & Admin | User authentication, role/permission checking | Yes |
| Service 04 - TMS Core | Load data (origin, destination, commodity, value) | Yes |
| Service 05 - Carrier | Carrier insurance data, carrier contact info | Yes |
| Service 02 - CRM | Customer contact info for claim communication | Yes |
| Service 10 - Documents | Photo/document storage for claim evidence | Yes |

### 4.2 Downstream Dependencies (Services That Consume This Service)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 05 - Carrier | Claims history impacts carrier scoring | Yes |
| Service 06 - Accounting | Settlement amounts for financial processing | Yes |
| Service 18 - Analytics | Claims data for operations analytics | No |

---

## 5. Wave Assignment

This service is assigned to a future wave. All 10 screens are pending design.

---

_Last Updated: 2026-02-06_

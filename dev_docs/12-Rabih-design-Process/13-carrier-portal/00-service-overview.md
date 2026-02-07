# Carrier Portal Service -- Overview

> Service: 13 - Carrier Portal | Wave: Future | Priority: P2
> Total Screens: 12 | Built: 0 | Remaining: 12
> Primary Personas: Carrier
> Roles with Access: carrier, carrier_admin, carrier_driver
> Last Updated: 2026-02-06

---

## 1. Service Summary

The Carrier Portal service provides a self-service web interface for carriers to manage their relationship with the brokerage. Carriers can view and accept load offers, upload documents (BOL, POD), manage their profile, track payments, submit check calls, and manage their equipment and insurance certificates. This portal reduces dispatcher workload, speeds up document collection, and improves carrier satisfaction.

---

## 2. Screen Catalog (12 Screens)

| # | Screen | Route | Type | Status | Design Doc | Primary Personas |
|---|--------|-------|------|--------|-----------|-----------------|
| 01 | Portal Dashboard | TBD | Dashboard | Not Started | `13-carrier-portal/01-portal-dashboard.md` | Carrier |
| 02 | Available Loads | TBD | List | Not Started | `13-carrier-portal/02-available-loads.md` | Carrier |
| 03 | My Loads | TBD | List | Not Started | `13-carrier-portal/03-my-loads.md` | Carrier |
| 04 | Load Offer Detail | TBD | Detail | Not Started | `13-carrier-portal/04-load-offer-detail.md` | Carrier |
| 05 | Document Upload | TBD | Form | Not Started | `13-carrier-portal/05-document-upload.md` | Carrier |
| 06 | Payment History | TBD | List | Not Started | `13-carrier-portal/06-payment-history.md` | Carrier |
| 07 | My Profile | TBD | Form | Not Started | `13-carrier-portal/07-my-profile.md` | Carrier |
| 08 | Insurance Upload | TBD | Form | Not Started | `13-carrier-portal/08-insurance-upload.md` | Carrier |
| 09 | Equipment Manager | TBD | List | Not Started | `13-carrier-portal/09-equipment-manager.md` | Carrier |
| 10 | Rate Confirmation | TBD | Detail | Not Started | `13-carrier-portal/10-rate-confirmation.md` | Carrier |
| 11 | Check Call Entry | TBD | Form | Not Started | `13-carrier-portal/11-check-call-entry.md` | Carrier |
| 12 | Support Chat | TBD | Tool | Not Started | `13-carrier-portal/12-support-chat.md` | Carrier |

---

## 3. Key Workflows

To be defined in a future wave.

---

## 4. Dependencies

### 4.1 Upstream Dependencies (Services This Service Consumes)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 01 - Auth & Admin | Carrier authentication, portal permissions | Yes |
| Service 04 - TMS Core | Load data, load offers, rate confirmations | Yes |
| Service 05 - Carrier | Carrier profile data, compliance status | Yes |
| Service 06 - Accounting | Payment data for carrier payment history | Yes |
| Service 10 - Documents | Document storage for uploads (BOL, POD, insurance) | Yes |
| Service 11 - Communication | Notification delivery for load offers | Yes |

### 4.2 Downstream Dependencies (Services That Consume This Service)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 04 - TMS Core | Load acceptance, check calls, document uploads | Yes |
| Service 05 - Carrier | Profile updates, insurance uploads, equipment updates | Yes |

---

## 5. Wave Assignment

This service is assigned to a future wave. All 12 screens are pending design.

---

_Last Updated: 2026-02-06_

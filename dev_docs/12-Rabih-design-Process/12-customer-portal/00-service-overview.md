# Customer Portal Service -- Overview

> Service: 12 - Customer Portal | Wave: Future | Priority: P2
> Total Screens: 10 | Built: 0 | Remaining: 10
> Primary Personas: Customer
> Roles with Access: customer, customer_admin
> Last Updated: 2026-02-06

---

## 1. Service Summary

The Customer Portal service provides a self-service web interface for customers to manage their shipments, request quotes, track loads in real-time, view invoices, access documents, and communicate with the brokerage. This portal reduces inbound call volume, improves customer satisfaction through 24/7 self-service access, and creates a professional brand experience.

---

## 2. Screen Catalog (10 Screens)

| # | Screen | Route | Type | Status | Design Doc | Primary Personas |
|---|--------|-------|------|--------|-----------|-----------------|
| 01 | Portal Dashboard | TBD | Dashboard | Not Started | `12-customer-portal/01-portal-dashboard.md` | Customer |
| 02 | My Shipments | TBD | List | Not Started | `12-customer-portal/02-my-shipments.md` | Customer |
| 03 | Shipment Detail | TBD | Detail | Not Started | `12-customer-portal/03-shipment-detail.md` | Customer |
| 04 | New Shipment Request | TBD | Form | Not Started | `12-customer-portal/04-new-shipment-request.md` | Customer |
| 05 | My Quotes | TBD | List | Not Started | `12-customer-portal/05-my-quotes.md` | Customer |
| 06 | My Invoices | TBD | List | Not Started | `12-customer-portal/06-my-invoices.md` | Customer |
| 07 | My Documents | TBD | List | Not Started | `12-customer-portal/07-my-documents.md` | Customer |
| 08 | Track Shipment | TBD | Map | Not Started | `12-customer-portal/08-track-shipment.md` | Customer |
| 09 | Portal Settings | TBD | Form | Not Started | `12-customer-portal/09-portal-settings.md` | Customer |
| 10 | Support Chat | TBD | Tool | Not Started | `12-customer-portal/10-support-chat.md` | Customer |

---

## 3. Key Workflows

To be defined in a future wave.

---

## 4. Dependencies

### 4.1 Upstream Dependencies (Services This Service Consumes)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 01 - Auth & Admin | Customer authentication, portal permissions | Yes |
| Service 02 - CRM | Customer profile data | Yes |
| Service 03 - Sales | Quote data for customer quotes view | Yes |
| Service 04 - TMS Core | Load data, tracking updates | Yes |
| Service 06 - Accounting | Invoice data for customer billing view | Yes |
| Service 10 - Documents | Document access for customer documents | Yes |
| Service 11 - Communication | Message delivery for portal notifications | Yes |

### 4.2 Downstream Dependencies (Services That Consume This Service)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 03 - Sales | New shipment requests from portal become quotes | Yes |
| Service 04 - TMS Core | Shipment requests from portal | Yes |

---

## 5. Wave Assignment

This service is assigned to a future wave. All 10 screens are pending design.

---

_Last Updated: 2026-02-06_

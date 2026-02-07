# Load Board Service -- Overview

> Service: 07 - Load Board | Wave: Future | Priority: P1
> Total Screens: 4 | Built: 0 | Remaining: 4
> Primary Personas: Dispatch, Admin
> Roles with Access: dispatcher, ops_manager, admin, super_admin
> Last Updated: 2026-02-06

---

## 1. Service Summary

The Load Board service provides an internal load board for managing available loads, posting loads for carrier pickup, and matching loads to qualified carriers. This is a core dispatch tool that enables efficient load-to-carrier matching, reducing deadhead miles and improving carrier utilization across the brokerage network.

---

## 2. Screen Catalog (4 Screens)

| # | Screen | Route | Type | Status | Design Doc | Primary Personas |
|---|--------|-------|------|--------|-----------|-----------------|
| 01 | Load Board | TBD | Board | Not Started | `07-load-board/01-load-board.md` | Dispatch |
| 02 | Post Load | TBD | Form | Not Started | `07-load-board/02-post-load.md` | Dispatch |
| 03 | Load Matching | TBD | Tool | Not Started | `07-load-board/03-load-matching.md` | Dispatch |
| 04 | Board Settings | TBD | Config | Not Started | `07-load-board/04-board-settings.md` | Admin |

---

## 3. Key Workflows

To be defined in a future wave.

---

## 4. Dependencies

### 4.1 Upstream Dependencies (Services This Service Consumes)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 01 - Auth & Admin | User authentication, role/permission checking, tenant context | Yes |
| Service 04 - TMS Core | Load data, origin/destination, equipment requirements | Yes |
| Service 05 - Carrier | Carrier availability, equipment, lane preferences, compliance status | Yes |

### 4.2 Downstream Dependencies (Services That Consume This Service)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 04 - TMS Core | Load assignments from board matching | Yes |
| Service 31 - Load Board External | Internal load data for external board postings | No |

---

## 5. Wave Assignment

This service is assigned to a future wave. All 4 screens are pending design.

---

_Last Updated: 2026-02-06_

# Agents Service -- Overview

> Service: 15 - Agents | Wave: Future | Priority: P2
> Total Screens: 8 | Built: 0 | Remaining: 8
> Primary Personas: Admin
> Roles with Access: admin, super_admin
> Last Updated: 2026-02-06

---

## 1. Service Summary

The Agents service manages independent sales agents and broker agents who bring business to the brokerage. It handles agent profiles, performance tracking, commission configuration, territory assignments, and agent analytics. This service supports the agent-based business model common in freight brokerage where independent agents operate under the brokerage's authority.

---

## 2. Screen Catalog (8 Screens)

| # | Screen | Route | Type | Status | Design Doc | Primary Personas |
|---|--------|-------|------|--------|-----------|-----------------|
| 01 | Agents Dashboard | TBD | Dashboard | Not Started | `15-agents/01-agents-dashboard.md` | Admin |
| 02 | Agents List | TBD | List | Not Started | `15-agents/02-agents-list.md` | Admin |
| 03 | Agent Detail | TBD | Detail | Not Started | `15-agents/03-agent-detail.md` | Admin |
| 04 | Agent Setup | TBD | Form | Not Started | `15-agents/04-agent-setup.md` | Admin |
| 05 | Agent Performance | TBD | Report | Not Started | `15-agents/05-agent-performance.md` | Admin |
| 06 | Commission Setup | TBD | Form | Not Started | `15-agents/06-commission-setup.md` | Admin |
| 07 | Agent Territories | TBD | Config | Not Started | `15-agents/07-agent-territories.md` | Admin |
| 08 | Agent Reports | TBD | Report | Not Started | `15-agents/08-agent-reports.md` | Admin |

---

## 3. Key Workflows

To be defined in a future wave.

---

## 4. Dependencies

### 4.1 Upstream Dependencies (Services This Service Consumes)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 01 - Auth & Admin | User authentication, role/permission checking | Yes |
| Service 02 - CRM | Customer data (agents bring customers) | Yes |
| Service 04 - TMS Core | Load data for agent performance metrics | Yes |

### 4.2 Downstream Dependencies (Services That Consume This Service)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 08 - Commission | Agent profiles for commission plan assignment | Yes |
| Service 03 - Sales | Agent territory data for lead routing | No |
| Service 18 - Analytics | Agent data for sales analytics | No |

---

## 5. Wave Assignment

This service is assigned to a future wave. All 8 screens are pending design.

---

_Last Updated: 2026-02-06_

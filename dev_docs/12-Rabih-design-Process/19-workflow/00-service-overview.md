# Workflow Service -- Overview

> Service: 19 - Workflow | Wave: Future | Priority: P2
> Total Screens: 8 | Built: 0 | Remaining: 8
> Primary Personas: Admin, All Users
> Roles with Access: admin, super_admin, all_users (approval queue)
> Last Updated: 2026-02-06

---

## 1. Service Summary

The Workflow service provides business process automation and approval workflow management for the TMS platform. It enables admins to define multi-step workflows with conditional branching, approval chains, automated actions, and escalation rules. This service automates repetitive business processes (load approval, credit approval, claim resolution) and ensures consistent process execution across the organization.

---

## 2. Screen Catalog (8 Screens)

| # | Screen | Route | Type | Status | Design Doc | Primary Personas |
|---|--------|-------|------|--------|-----------|-----------------|
| 01 | Workflow Dashboard | TBD | Dashboard | Not Started | `19-workflow/01-workflow-dashboard.md` | Admin |
| 02 | Workflow Templates | TBD | List | Not Started | `19-workflow/02-workflow-templates.md` | Admin |
| 03 | Workflow Builder | TBD | Form | Not Started | `19-workflow/03-workflow-builder.md` | Admin |
| 04 | Workflow Instances | TBD | List | Not Started | `19-workflow/04-workflow-instances.md` | Admin |
| 05 | Approval Queue | TBD | List | Not Started | `19-workflow/05-approval-queue.md` | All Users |
| 06 | Workflow History | TBD | List | Not Started | `19-workflow/06-workflow-history.md` | Admin |
| 07 | Automation Rules | TBD | List | Not Started | `19-workflow/07-automation-rules.md` | Admin |
| 08 | Workflow Reports | TBD | Report | Not Started | `19-workflow/08-workflow-reports.md` | Admin |

---

## 3. Key Workflows

To be defined in a future wave.

---

## 4. Dependencies

### 4.1 Upstream Dependencies (Services This Service Consumes)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 01 - Auth & Admin | User authentication, role/permission checking, user directory for approvers | Yes |
| Service 11 - Communication | Notifications for workflow step assignments and escalations | Yes |

### 4.2 Downstream Dependencies (Services That Consume This Service)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 04 - TMS Core | Load approval workflows | No |
| Service 06 - Accounting | Payment approval workflows | No |
| Service 09 - Claims | Claim resolution approval workflows | No |
| Service 11 - Communication | Auto-message rule execution | No |
| Service 16 - Credit | Credit approval workflows | No |

---

## 5. Wave Assignment

This service is assigned to a future wave. All 8 screens are pending design.

---

_Last Updated: 2026-02-06_

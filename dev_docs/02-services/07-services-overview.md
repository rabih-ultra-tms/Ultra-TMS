# 07 - Services Overview

Complete documentation for all **38 services** that power the 3PL Platform.

> **Document Numbering**: Service files are docs 08-45. Service ID = Doc Number - 7 (for docs 08-41) or see mapping table for new services (42-45).

---

## Service Categories

### Core Services (7)

Essential business logic for freight brokerage operations.

| Service ID | Doc # | Service Name                               | Module Path           | Description                             |
| ---------- | ----- | ------------------------------------------ | --------------------- | --------------------------------------- |
| 01         | 08    | [Auth & Admin](./08-service-auth-admin.md) | `@modules/auth`       | Authentication, RBAC, tenant management |
| 02         | 09    | [CRM](./09-service-crm.md)                 | `@modules/crm`        | Companies, contacts, opportunities      |
| 03         | 10    | [Sales](./10-service-sales.md)             | `@modules/sales`      | Quotes, rate tables, pricing            |
| 04         | 11    | [TMS Core](./11-service-tms-core.md)       | `@modules/tms`        | Orders, loads, stops, tracking          |
| 05         | 12    | [Carrier](./12-service-carrier.md)         | `@modules/carrier`    | Profiles, compliance, scorecards        |
| 06         | 13    | [Accounting](./13-service-accounting.md)   | `@modules/accounting` | Invoices, payables, settlements         |
| 07         | 14    | [Load Board](./14-service-load-board.md)   | `@modules/load-board` | Internal load posting                   |

### Operations Services (9)

Day-to-day operational support modules.

| Service ID | Doc # | Service Name                                       | Module Path                | Description                  |
| ---------- | ----- | -------------------------------------------------- | -------------------------- | ---------------------------- |
| 08         | 15    | [Commission](./15-service-commission.md)           | `@modules/commission`      | Plans, calculations, payouts |
| 09         | 16    | [Claims](./16-service-claims.md)                   | `@modules/claims`          | Cargo claims, OS&D           |
| 10         | 17    | [Documents](./17-service-documents.md)             | `@modules/documents`       | Storage, OCR, templates      |
| 11         | 18    | [Communication](./18-service-communication.md)     | `@modules/communication`   | Email, SMS, messaging        |
| 12         | 19    | [Customer Portal](./19-service-customer-portal.md) | `@modules/customer-portal` | Shipper self-service         |
| 13         | 20    | [Carrier Portal](./20-service-carrier-portal.md)   | `@modules/carrier-portal`  | Carrier self-service         |
| 14         | 21    | [Contracts](./21-service-contracts.md)             | `@modules/contracts`       | Customer/carrier contracts   |
| 15         | 22    | [Agent](./22-service-agent.md)                     | `@modules/agent`           | Agent management             |
| 16         | 42    | [**Credit**](./42-service-credit.md)               | `@modules/credit`          | Credit limits, collections   |

### Platform Services (10)

Infrastructure and cross-cutting concerns.

| Service ID | Doc # | Service Name                                             | Module Path             | Description               |
| ---------- | ----- | -------------------------------------------------------- | ----------------------- | ------------------------- |
| 17         | 23    | [Factoring Internal](./23-service-factoring-internal.md) | `@modules/factoring`    | Quick pay for carriers    |
| 18         | 24    | [HR](./24-service-hr.md)                                 | `@modules/hr`           | Employee management       |
| 19         | 25    | [Analytics](./25-service-analytics.md)                   | `@modules/analytics`    | KPIs, reports, dashboards |
| 20         | 26    | [Workflow](./26-service-workflow.md)                     | `@modules/workflow`     | Automation, triggers      |
| 21         | 27    | [Integration Hub](./27-service-integration-hub.md)       | `@modules/integrations` | API gateway, webhooks     |
| 22         | 28    | [Search](./28-service-search.md)                         | `@modules/search`       | Full-text search          |
| 23         | 29    | [Audit](./29-service-audit.md)                           | `@modules/audit`        | Compliance, audit trails  |
| 24         | 30    | [Config](./30-service-config.md)                         | `@modules/config`       | Settings, feature flags   |
| 25         | 31    | [Scheduler](./31-service-scheduler.md)                   | `@modules/scheduler`    | Jobs, reminders           |
| 26         | 32    | [Cache](./32-service-cache.md)                           | `@modules/cache`        | Redis caching             |

### Support Services (2)

Customer and user support modules.

| Service ID | Doc # | Service Name                           | Module Path          | Description             |
| ---------- | ----- | -------------------------------------- | -------------------- | ----------------------- |
| 27         | 33    | [Help Desk](./33-service-help-desk.md) | `@modules/help-desk` | Tickets, knowledge base |
| 28         | 34    | [Feedback](./34-service-feedback.md)   | `@modules/feedback`  | NPS, feature requests   |

### Extended Services (9)

Industry integrations and advanced features.

| Service ID | Doc # | Service Name                                               | Module Path               | Description                 |
| ---------- | ----- | ---------------------------------------------------------- | ------------------------- | --------------------------- |
| 29         | 35    | [EDI](./35-service-edi.md)                                 | `@modules/edi`            | X12 204, 210, 214, 990      |
| 30         | 36    | [Safety](./36-service-safety.md)                           | `@modules/safety`         | FMCSA, CSA scores           |
| 31         | 37    | [Fuel Cards](./37-service-fuel-cards.md)                   | `@modules/fuel-cards`     | Comdata, EFS                |
| 32         | 38    | [Factoring External](./38-service-factoring-external.md)   | `@modules/factoring-ext`  | Third-party factoring       |
| 33         | 39    | [Load Board External](./39-service-load-board-external.md) | `@modules/load-board-ext` | DAT, Truckstop posting      |
| 34         | 40    | [Mobile App](./40-service-mobile-app.md)                   | `@modules/mobile`         | React Native backend        |
| 35         | 43    | [**Rate Intelligence**](./43-service-rate-intelligence.md) | `@modules/rate-intel`     | Market rates, DAT/Truckstop |
| 36         | 44    | [**ELD**](./44-service-eld.md)                             | `@modules/eld`            | HOS, vehicle tracking       |
| 37         | 45    | [**Cross-Border**](./45-service-cross-border.md)           | `@modules/cross-border`   | Customs, permits            |

### Admin Services (1)

Platform administration.

| Service ID | Doc # | Service Name                               | Module Path            | Description             |
| ---------- | ----- | ------------------------------------------ | ---------------------- | ----------------------- |
| 38         | 41    | [Super Admin](./41-service-super-admin.md) | `@modules/super-admin` | Platform admin, billing |

---

## Service Count Summary

| Category       | Count  | Service IDs | Doc Range    |
| -------------- | ------ | ----------- | ------------ |
| **Core**       | 7      | 01-07       | 08-14        |
| **Operations** | 9      | 08-16       | 15-22, 42    |
| **Platform**   | 10     | 17-26       | 23-32        |
| **Support**    | 2      | 27-28       | 33-34        |
| **Extended**   | 9      | 29-37       | 35-40, 43-45 |
| **Admin**      | 1      | 38          | 41           |
| **Total**      | **38** | 01-38       | 08-45        |

---

## New Services (Added January 2025)

These four services were added to fill gaps identified during documentation review:

### Credit Service (Doc 42, Service ID 16)

- **Category**: Operations
- **Phase**: A (MVP)
- **Purpose**: Customer credit management, credit limits, collections
- **Screens**: 10
- **Key Features**: Credit applications, credit holds, collections queue, payment plans

### Rate Intelligence Service (Doc 43, Service ID 35)

- **Category**: Extended
- **Phase**: A (MVP)
- **Purpose**: Market rate data from DAT, Truckstop, Greenscreens
- **Screens**: 8
- **Key Features**: Rate lookup, historical analysis, rate alerts, lane analytics

### ELD Service (Doc 44, Service ID 36)

- **Category**: Extended
- **Phase**: B (Enhancement)
- **Purpose**: Electronic logging device integration for HOS compliance
- **Screens**: 8
- **Key Features**: HOS monitoring, vehicle tracking, violation alerts, provider integrations

### Cross-Border Service (Doc 45, Service ID 37)

- **Category**: Extended
- **Phase**: B (Enhancement)
- **Purpose**: US-Mexico and US-Canada border crossing management
- **Screens**: 10
- **Key Features**: Customs documentation, permit management, broker coordination, border status

---

## Service Documentation Structure

Each service file (docs 08-45) contains:

1. **Overview** - Service ID, category, phase, weeks, priority, dependencies
2. **Purpose** - What the service does and why
3. **Features** - Capabilities provided
4. **Database Schema** - Complete SQL with migration support
5. **API Endpoints** - REST endpoints with descriptions
6. **Events** - Published and subscribed events
7. **Business Rules** - Logic and constraints
8. **Screens** - UI screens served
9. **Configuration** - Environment variables
10. **Testing Checklist** - Unit, integration, E2E tests

---

## Development Phase Distribution

| Phase                     | Services                        | Description                          |
| ------------------------- | ------------------------------- | ------------------------------------ |
| **Phase A (MVP)**         | 01-15, 19-23, 26, 29-30, 33, 35 | Core operations                      |
| **Phase B (Enhancement)** | 16-18, 25, 34, 36-37            | Internal tools, mobile, cross-border |
| **Phase C (SaaS)**        | 27-28, 31-32, 38                | Multi-tenant, support                |
| **Phase D (Expansion)**   | -                               | Vertical-specific features           |
| **Phase E (Specialty)**   | -                               | Marketplace features                 |

---

## Quick Reference by Use Case

### Building a New Feature

1. Find the service(s) involved in this table
2. Go to the corresponding doc (Doc # column)
3. Check the API Endpoints section
4. Check the Database Schema section
5. Check the Screens section in doc 47

### Understanding Dependencies

| If Building...   | You Need...                                 |
| ---------------- | ------------------------------------------- |
| Any screen       | Auth (01) first                             |
| Load management  | TMS (04), Carrier (05)                      |
| Invoicing        | Accounting (06), TMS (04)                   |
| Credit decisions | Credit (16), Accounting (06)                |
| Carrier payments | Commission (08), Factoring (17)             |
| Customer-facing  | Customer Portal (12), Communication (11)    |
| Carrier-facing   | Carrier Portal (13), Communication (11)     |
| Reporting        | Analytics (19), any data service            |
| Automation       | Workflow (20), Scheduler (25)               |
| Rate lookups     | Rate Intelligence (35), Sales (03)          |
| HOS compliance   | ELD (36), Carrier (05)                      |
| International    | Cross-Border (37), TMS (04), Documents (10) |

---

## Screen Count by Service

| Service ID | Service Name          | Screens |
| ---------- | --------------------- | ------- |
| 01         | Auth & Admin          | 12      |
| 02         | CRM                   | 12      |
| 03         | Sales                 | 10      |
| 04         | TMS Core              | 14      |
| 05         | Carrier               | 12      |
| 06         | Accounting            | 14      |
| 07         | Load Board            | 4       |
| 08         | Commission            | 6       |
| 09         | Claims                | 10      |
| 10         | Documents             | 8       |
| 11         | Communication         | 10      |
| 12         | Customer Portal       | 10      |
| 13         | Carrier Portal        | 12      |
| 14         | Contracts             | 8       |
| 15         | Agent                 | 8       |
| 16         | **Credit**            | 10      |
| 17         | Factoring Internal    | 6       |
| 18         | HR                    | 10      |
| 19         | Analytics             | 10      |
| 20         | Workflow              | 8       |
| 21         | Integration Hub       | 10      |
| 22         | Search                | 4       |
| 23         | Audit                 | 6       |
| 24         | Config                | 8       |
| 25         | Scheduler             | 6       |
| 26         | Cache                 | 4       |
| 27         | Help Desk             | 6       |
| 28         | Feedback              | 6       |
| 29         | EDI                   | 8       |
| 30         | Safety                | 10      |
| 31         | Fuel Cards            | 8       |
| 32         | Factoring External    | 8       |
| 33         | Load Board External   | 8       |
| 34         | Mobile App            | 8       |
| 35         | **Rate Intelligence** | 8       |
| 36         | **ELD**               | 8       |
| 37         | **Cross-Border**      | 10      |
| 38         | Super Admin           | 28      |
| **Total**  |                       | **362** |

---

## File Naming Convention

```
{doc_number}-service-{service-name}.md

Examples:
08-service-auth-admin.md     → Service 01
15-service-commission.md     → Service 08
42-service-credit.md         → Service 16
45-service-cross-border.md   → Service 37
```

---

_Last Updated: January 2025_

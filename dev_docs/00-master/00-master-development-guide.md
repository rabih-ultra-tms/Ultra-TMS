# 00 - Master Development Guide

**The Definitive Entry Point for the 3PL Platform**

> This document is the single source of truth for navigating all documentation.

> **IMPORTANT (Feb 2026):** This project has been rescoped from a 162-week/38-service vision to a **16-week/8-service MVP**. See `CLAUDE.md` at project root for current state, known bugs, and MVP scope. See `dev_docs/Claude-review-v1/` for the comprehensive review that drove this change.

---

## Quick Start

### What This Project Is

A 3PL freight brokerage platform replacing fragmented TMS + CRM + Accounting tools with a unified, modern system. Built with a **migration-first architecture** that makes switching from legacy systems painless.

### Current Status

| Metric | Value |
| --- | --- |
| **Current Phase** | P0 MVP (16-week sprint) |
| **Overall Score** | 6.2/10 (C+) — strong foundation, weak execution |
| **Team** | 2 engineers @ 30 hrs/week each |
| **MVP Timeline** | 16 weeks (8 services, ~30 screens) |
| **Long-term Vision** | 162 weeks, 38 services, 362 screens (Phase B-E, future) |
| **Critical Bugs** | 29 total (4 critical — carrier detail 404s) |

### What to Work on Next

1. **Fix critical bugs first** — See `dev_docs/Claude-review-v1/01-code-review/05-bug-inventory.md`
2. **Follow the 16-week action plan** — See `dev_docs/Claude-review-v1/00-executive-summary/prioritized-action-plan.md`
3. **Before building anything** — Check if backend already exists (LoadsService, OrdersService are implemented but disconnected from frontend)

---

## Key Numbers (Single Source of Truth)

| Category | Count | Source Document |
| --- | --- | --- |
| **MVP Services** | 8 | `CLAUDE.md` (P0 MVP Scope section) |
| **MVP Screens** | ~30 | `Claude-review-v1/04-screen-integration/03-screen-priority-matrix.md` |
| **Total Services (long-term)** | 38 | `07-services-overview.md` |
| **Total Screens (long-term)** | 362 | `47-screen-catalog.md` |
| **Design Specs (15-section)** | 89 | `12-Rabih-design-Process/` |
| **Known Bugs** | 29 | `Claude-review-v1/01-code-review/05-bug-inventory.md` |
| **UI Components** | 111 | `46-design-system-components.md` |
| **User Personas** | 6 | `04-user-personas.md` |

---

## Document Numbering System

| Doc Range | Category             | Count |
| --------- | -------------------- | ----- |
| 00        | Master Guide         | 1     |
| 01-06     | Foundation           | 6     |
| 07        | Services Index       | 1     |
| 08-45     | Service Specs        | 38    |
| 46-48     | Design & Screens     | 3     |
| 49-51     | Checklists & Ops     | 3     |
| 52-57     | Roadmap              | 6     |
| 58-62     | External & Reference | 5     |
| 63-64     | Index & Readme       | 2     |
| 65-75     | Dev Standards        | 11    |
| 76-77     | Contract Registry    | 2     |
| 78-88     | Platform Features    | 11    |
| 89-92     | AI Development       | 4     |

**Total: 93 documents**

---

## Service ID to Document Mapping

**Formula: Doc Number = Service ID + 7**

### Core Services (7)

| Service ID | Doc # | Service Name          | Category |
| ---------- | ----- | --------------------- | -------- |
| 01         | 08    | Auth & Admin          | Core     |
| 02         | 09    | CRM                   | Core     |
| 03         | 10    | Sales                 | Core     |
| 04         | 11    | TMS Core              | Core     |
| 05         | 12    | Carrier               | Core     |
| 06         | 13    | Accounting            | Core     |
| 07         | 14    | Load Board (Internal) | Core     |

### Operations Services (9)

| Service ID | Doc # | Service Name    | Category   |
| ---------- | ----- | --------------- | ---------- |
| 08         | 15    | Commission      | Operations |
| 09         | 16    | Claims          | Operations |
| 10         | 17    | Documents       | Operations |
| 11         | 18    | Communication   | Operations |
| 12         | 19    | Customer Portal | Operations |
| 13         | 20    | Carrier Portal  | Operations |
| 14         | 21    | Contracts       | Operations |
| 15         | 22    | Agent           | Operations |
| 16         | 42    | **Credit**      | Operations |

### Platform Services (10)

| Service ID | Doc # | Service Name       | Category |
| ---------- | ----- | ------------------ | -------- |
| 17         | 23    | Factoring Internal | Platform |
| 18         | 24    | HR                 | Platform |
| 19         | 25    | Analytics          | Platform |
| 20         | 26    | Workflow           | Platform |
| 21         | 27    | Integration Hub    | Platform |
| 22         | 28    | Search             | Platform |
| 23         | 29    | Audit              | Platform |
| 24         | 30    | Config             | Platform |
| 25         | 31    | Scheduler          | Platform |
| 26         | 32    | Cache              | Platform |

### Support Services (2)

| Service ID | Doc # | Service Name | Category |
| ---------- | ----- | ------------ | -------- |
| 27         | 33    | Help Desk    | Support  |
| 28         | 34    | Feedback     | Support  |

### Extended Services (10)

| Service ID | Doc # | Service Name          | Category |
| ---------- | ----- | --------------------- | -------- |
| 29         | 35    | EDI                   | Extended |
| 30         | 36    | Safety                | Extended |
| 31         | 37    | Fuel Cards            | Extended |
| 32         | 38    | Factoring External    | Extended |
| 33         | 39    | Load Board External   | Extended |
| 34         | 40    | Mobile App            | Extended |
| 35         | 43    | **Rate Intelligence** | Extended |
| 36         | 44    | **ELD**               | Extended |
| 37         | 45    | **Cross-Border**      | Extended |

### Admin Services (1)

| Service ID | Doc # | Service Name | Category |
| ---------- | ----- | ------------ | -------- |
| 38         | 41    | Super Admin  | Admin    |

---

## Document Map (All Files)

### Foundation (01-06)

| Doc | Name                        | Purpose                                              |
| --- | --------------------------- | ---------------------------------------------------- |
| 01  | `01-project-overview.md`    | High-level project summary                           |
| 02  | `02-project-vision.md`      | Goals, principles, differentiators                   |
| 03  | `03-project-phases.md`      | 5-phase breakdown (A through E)                      |
| 04  | `04-user-personas.md`       | 6 personas: Maria, James, Sarah, Carlos, Emily, Mike |
| 05  | `05-system-architecture.md` | Modular monolith, multi-tenant design                |
| 06  | `06-tech-stack.md`          | NestJS + Prisma + React + TailwindCSS                |

### Services Index (07)

| Doc | Name                      | Purpose                                  |
| --- | ------------------------- | ---------------------------------------- |
| 07  | `07-services-overview.md` | Index of all 38 services with categories |

### Service Specifications (08-45)

**Core Services (08-14)**: Auth, CRM, Sales, TMS, Carrier, Accounting, Load Board

**Operations Services (15-22, 42)**: Commission, Claims, Documents, Communication, Customer Portal, Carrier Portal, Contracts, Agent, **Credit**

**Platform Services (23-32)**: Factoring Internal, HR, Analytics, Workflow, Integration Hub, Search, Audit, Config, Scheduler, Cache

**Support Services (33-34)**: Help Desk, Feedback

**Extended Services (35-40, 43-45)**: EDI, Safety, Fuel Cards, Factoring External, Load Board External, Mobile App, **Rate Intelligence**, **ELD**, **Cross-Border**

**Admin Services (41)**: Super Admin

### Design & Screens (46-48)

| Doc | Name                             | Purpose               |
| --- | -------------------------------- | --------------------- |
| 46  | `46-design-system-components.md` | 111 UI components     |
| 47  | `47-screen-catalog.md`           | All 362 screens       |
| 48  | `48-navigation-menus-by-role.md` | Role-based navigation |

### Checklists & Operations (49-51)

| Doc | Name                                  | Purpose                     |
| --- | ------------------------------------- | --------------------------- |
| 49  | `49-master-checklist.md`              | Track all development tasks |
| 50  | `50-development-setup-guide.md`       | Environment setup           |
| 51  | `51-operations-infrastructure-sla.md` | Monitoring, SLAs, DR        |

### Roadmap (52-57)

| Doc | Name                     | Purpose                         |
| --- | ------------------------ | ------------------------------- |
| 52  | `52-roadmap-overview.md` | Full 162-week timeline          |
| 53  | `53-roadmap-phase-a.md`  | Phase A details (Weeks 1-78)    |
| 54  | `54-roadmap-phase-b.md`  | Phase B details (Weeks 79-104)  |
| 55  | `55-roadmap-phase-c.md`  | Phase C details (Weeks 105-128) |
| 56  | `56-roadmap-phase-d.md`  | Phase D details (Weeks 129-146) |
| 57  | `57-roadmap-phase-e.md`  | Phase E details (Weeks 147-162) |

### External & Reference (58-62)

| Doc | Name                               | Purpose                     |
| --- | ---------------------------------- | --------------------------- |
| 58  | `58-migration-playbooks.md`        | McLeod, Revenova migrations |
| 59  | `59-integrations-external-apis.md` | DAT, Truckstop, FMCSA       |
| 60  | `60-competitor-analysis.md`        | TAI Software analysis       |
| 61  | `61-verticals-10-segments.md`      | Vertical configurations     |
| 62  | `62-appendix-glossary-faq.md`      | Terms, codes                |

### Index & Readme (63-64)

| Doc | Name                        | Purpose                 |
| --- | --------------------------- | ----------------------- |
| 63  | `63-documentation-index.md` | Complete file inventory |
| 64  | `64-main-readme.md`         | Project README          |

### Development Standards (65-75)

| Doc | Name                                    | When to Read               |
| --- | --------------------------------------- | -------------------------- |
| 65  | `65-development-standards-overview.md`  | **Before ANY coding**      |
| 66  | `66-api-design-standards.md`            | Before building endpoints  |
| 67  | `67-database-design-standards.md`       | Before schema changes      |
| 68  | `68-frontend-architecture-standards.md` | Before building screens    |
| 69  | `69-ui-component-standards.md`          | Before building components |
| 70  | `70-type-safety-standards.md`           | Always (TypeScript)        |
| 71  | `71-auth-authorization-standards.md`    | For auth features          |
| 72  | `72-testing-strategy.md`                | Before writing tests       |
| 73  | `73-common-pitfalls-prevention.md`      | During code review         |
| 74  | `74-pre-feature-checklist.md`           | **Before EVERY feature**   |
| 75  | `75-pre-release-checklist.md`           | Before deployments         |

### Contract Registry (76-77)

| Doc | Name                                       | Purpose               |
| --- | ------------------------------------------ | --------------------- |
| 76  | `76-screen-api-contract-registry.md`       | Screen-to-API mapping |
| 77  | `77-screen-api-contract-registry-part2.md` | Continuation          |

### Platform Features (78-88)

| Doc | Name                                     | When to Read             |
| --- | ---------------------------------------- | ------------------------ |
| 78  | `78-i18n-standards.md`                   | User-facing text         |
| 79  | `79-real-time-websocket-standards.md`    | Tracking, dispatch board |
| 80  | `80-file-upload-storage-standards.md`    | PODs, BOLs, documents    |
| 81  | `81-error-handling-logging-standards.md` | All backend code         |
| 82  | `82-git-workflow-standards.md`           | All commits              |
| 83  | `83-accessibility-standards.md`          | All UI                   |
| 84  | `84-state-management-standards.md`       | Complex state            |
| 85  | `85-performance-caching-standards.md`    | Optimization             |
| 86  | `86-background-jobs-standards.md`        | Async processing         |
| 87  | `87-code-generation-templates.md`        | Scaffolding              |
| 88  | `88-environment-secrets-management.md`   | Deployment               |

### AI-Assisted Development (89-92)

| Doc | Name                             | Purpose                   |
| --- | -------------------------------- | ------------------------- |
| 89  | `89-ai-development-playbook.md`  | **Claude Code must read** |
| 90  | `90-seed-data-fixtures.md`       | Test data factories       |
| 91  | `91-entity-data-dictionary.md`   | Field specs               |
| 92  | `92-business-rules-reference.md` | Business logic            |

---

## Critical Reading Order for Claude Code

### Before ANY Feature

```
1. 74-pre-feature-checklist.md      (What to check)
2. 76-screen-api-contract-registry.md (Find screen, APIs)
3. 91-entity-data-dictionary.md     (Field specs)
4. 92-business-rules-reference.md   (Business logic)
```

### For Backend Work

```
1. 66-api-design-standards.md       (NestJS patterns)
2. 67-database-design-standards.md  (Prisma patterns)
3. 70-type-safety-standards.md      (TypeScript)
4. 81-error-handling-logging-standards.md
```

### For Frontend Work

```
1. 68-frontend-architecture-standards.md
2. 69-ui-component-standards.md     (GOLDEN RULE)
3. 83-accessibility-standards.md    (WCAG 2.1 AA)
4. 84-state-management-standards.md
```

---

## The 5 Golden Rules

### Rule 1: Every Interactive Element MUST Work

No buttons, links, or dropdowns without handlers. Ever.

### Rule 2: API Contracts Before Code

Define request/response in doc 76 BEFORE building.

### Rule 3: Screen → API → Database Traceability

Every screen maps to APIs. Every API maps to database.

### Rule 4: Type Safety is Mandatory

No `any` types. Types must match runtime data.

### Rule 5: Verify Before Shipping

All buttons work, API calls succeed, states handled.

---

## Service Categories Summary

| Category       | Count  | Doc Range    | Service IDs |
| -------------- | ------ | ------------ | ----------- |
| **Core**       | 7      | 08-14        | 01-07       |
| **Operations** | 9      | 15-22, 42    | 08-16       |
| **Platform**   | 10     | 23-32        | 17-26       |
| **Support**    | 2      | 33-34        | 27-28       |
| **Extended**   | 9      | 35-40, 43-45 | 29-37       |
| **Admin**      | 1      | 41           | 38          |
| **Total**      | **38** | 08-45        | 01-38       |

---

## 10 Supported Verticals

1. 3PL Freight Broker (Phase A)
2. Fleet Manager (Phase C)
3. Trucking Company (Phase C)
4. Drayage/Intermodal (Phase C)
5. Freight Forwarder (Phase D)
6. Warehouse/Fulfillment (Phase D)
7. Household Goods (Phase E)
8. Final Mile (Phase E)
9. Auto Transport (Phase E)
10. Bulk/Tanker (Phase E)

---

## Go-Live Schedule (Phase A)

| #     | Week | What Goes Live             |
| ----- | ---- | -------------------------- |
| GL-1  | 6    | Admin & user management    |
| GL-2  | 12   | HubSpot sync working       |
| GL-3  | 20   | Quotes can be created/sent |
| GL-4  | 28   | Orders can be managed      |
| GL-5  | 36   | Carriers can be onboarded  |
| GL-6  | 44   | Invoices can be generated  |
| GL-7  | 56   | Full operations workflow   |
| GL-8  | 64   | EDI working                |
| GL-9  | 74   | Analytics available        |
| GL-10 | 78   | Customer portal live       |

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, shadcn/ui |
| **State** | React Query (server), Zustand (client) |
| **Forms** | React Hook Form + Zod |
| **Backend** | NestJS 10, Prisma 6 ORM |
| **Database** | PostgreSQL 15, Redis 7, Elasticsearch 8.13 |
| **Real-time** | Socket.io |
| **Jobs** | Bull queues |
| **Infrastructure** | Docker, pnpm + Turborepo monorepo |

---

## Migration-First Architecture

Every database table includes:

```sql
external_id VARCHAR(100),
source_system VARCHAR(50),
custom_fields JSONB DEFAULT '{}',
tenant_id UUID NOT NULL,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),
created_by UUID,
updated_by UUID
```

---

## User Personas

| Name       | Role             | Key Needs                               |
| ---------- | ---------------- | --------------------------------------- |
| **Maria**  | Dispatcher       | 50+ loads/day, quick carrier assignment |
| **James**  | Sales Agent      | $2M book, quote fast                    |
| **Sarah**  | Ops Manager      | Team performance, P&L                   |
| **Carlos** | Driver/Owner-Op  | Spanish UI, mobile POD                  |
| **Emily**  | AR Specialist    | Fast invoicing, reduce DSO              |
| **Mike**   | Customer/Shipper | Track shipments                         |

---

## Quick Commands

```bash
# Start development
docker-compose up -d
npm run dev

# Database
npx prisma migrate dev --name description
npx prisma generate
npx prisma studio

# Testing
npm run test
npm run test:e2e
npm run test:cov
```

---

## Need Help?

| Question | Go To |
| --- | --- |
| "What should I build next?" | `Claude-review-v1/00-executive-summary/prioritized-action-plan.md` |
| "What are the known bugs?" | `Claude-review-v1/01-code-review/05-bug-inventory.md` |
| "How do I build this screen?" | `12-Rabih-design-Process/{service}/{screen}.md` + `08-standards/74-pre-feature-checklist.md` |
| "What are the field validations?" | `91-entity-data-dictionary.md` |
| "What's the business logic?" | `92-business-rules-reference.md` |
| "What are the quality gates?" | `Claude-review-v1/03-design-strategy/05-quality-gates.md` |
| "What are the coding standards?" | `65-development-standards-overview.md` |

---

_Document Version: 4.0.0_
_Last Updated: February 2026_

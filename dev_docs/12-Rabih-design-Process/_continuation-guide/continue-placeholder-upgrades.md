# Continue Placeholder Upgrades - Design Documentation

> **Purpose:** This file is your single reference for continuing the creation of detailed design files for services 06-38. These services currently have lightweight placeholder files. When you're ready to build out any service, use this guide to tell Claude exactly what to do.
>
> **Created:** 2026-02-06
> **Last Updated:** 2026-02-06

---

## Current State Summary

### COMPLETED (Full 15-Section Detail) - 89 files

| Service | Folder | Files | Wave | Notes |
|---------|--------|-------|------|-------|
| Global Foundation | `00-global/` | 18 | N/A | Status colors, design principles, user journeys, role-based views, real-time map, stitch tips, accessibility, etc. |
| Auth & Admin | `01-auth-admin/` | 13 | Wave 1 | All 12 screens + overview. Enhancement focus (already built). |
| Dashboard Shell | `01.1-dashboard-shell/` | 6 | Wave 1 | Dashboard, sidebar, header, notifications, command palette. Enhancement focus. |
| CRM | `02-crm/` | 13 | Wave 1 | All 12 screens + overview. Mix of built and not-built. |
| Sales | `03-sales/` | 11 | Wave 1 | All 10 screens + overview. |
| TMS Core | `04-tms-core/` | 15 | Wave 2 | All 14 screens + overview. Full net-new design. |
| Carrier Management | `05-carrier/` | 13 | Wave 3 | All 12 screens + overview. Full net-new design. |

### PLACEHOLDER (Needs Upgrade) - 321 files across 33 services

| # | Service | Folder | Placeholder Files | Screens | Priority | Recommended Wave |
|---|---------|--------|-------------------|---------|----------|-----------------|
| 06 | Accounting | `06-accounting/` | 15 | 14 | **P0** | Wave 4 |
| 07 | Load Board Internal | `07-load-board/` | 5 | 4 | P1 | Wave 5 |
| 08 | Commission | `08-commission/` | 7 | 6 | P1 | Wave 5 |
| 09 | Claims | `09-claims/` | 11 | 10 | P1 | Wave 5 |
| 10 | Documents | `10-documents/` | 9 | 8 | **P0** | Wave 4 |
| 11 | Communication | `11-communication/` | 11 | 10 | **P0** | Wave 4 |
| 12 | Customer Portal | `12-customer-portal/` | 11 | 10 | P1 | Wave 5 |
| 13 | Carrier Portal | `13-carrier-portal/` | 13 | 12 | P1 | Wave 5 |
| 14 | Contracts | `14-contracts/` | 9 | 8 | P1 | Wave 5 |
| 15 | Agents | `15-agents/` | 9 | 8 | P2 | Wave 6 |
| 16 | Credit | `16-credit/` | 11 | 10 | P1 | Wave 5 |
| 17 | Factoring | `17-factoring/` | 7 | 6 | P2 | Wave 6 |
| 18 | Analytics | `18-analytics/` | 11 | 10 | P1 | Wave 4 |
| 19 | Workflow | `19-workflow/` | 9 | 8 | P2 | Wave 6 |
| 20 | Integration Hub | `20-integration-hub/` | 11 | 10 | P1 | Wave 5 |
| 21 | Search | `21-search/` | 5 | 4 | P1 | Wave 4 |
| 22 | Audit | `22-audit/` | 7 | 6 | P2 | Wave 6 |
| 23 | Config | `23-config/` | 9 | 8 | P2 | Wave 6 |
| 24 | EDI | `24-edi/` | 9 | 8 | P2 | Wave 6 |
| 25 | Safety | `25-safety/` | 11 | 10 | P2 | Wave 6 |
| 26 | Rate Intelligence | `26-rate-intelligence/` | 9 | 8 | P1 | Wave 5 |
| 27 | Help Desk | `27-help-desk/` | 7 | 6 | P2 | Wave 7 |
| 28 | Feedback | `28-feedback/` | 7 | 6 | P2 | Wave 7 |
| 29 | Fuel Cards | `29-fuel-cards/` | 9 | 8 | P2 | Wave 7 |
| 30 | Factoring External | `30-factoring-external/` | 9 | 8 | P2 | Wave 7 |
| 31 | Load Board External | `31-load-board-external/` | 9 | 8 | P1 | Wave 5 |
| 32 | Mobile App | `32-mobile-app/` | 9 | 8 | P1 | Wave 5 |
| 33 | HR | `33-hr/` | 11 | 10 | P2 | Wave 7 |
| 34 | ELD | `34-eld/` | 9 | 8 | P2 | Wave 7 |
| 35 | Cross-Border | `35-cross-border/` | 11 | 10 | P2 | Wave 7 |
| 36 | Scheduler | `36-scheduler/` | 7 | 6 | P2 | Wave 6 |
| 37 | Cache | `37-cache/` | 5 | 4 | P2 | Wave 7 |
| 38 | Super Admin | `38-super-admin/` | 29 | 28 | P1 | Wave 4 |

---

## How to Continue: Copy-Paste Prompt

When you want to upgrade a placeholder service to full detail, give Claude the following prompt. Replace the bracketed values with the specific service.

---

### PROMPT TEMPLATE (copy this entire block)

```
I want to continue the design documentation for Ultra TMS.

Read the continuation guide at:
dev_docs/12-Rabih-design-Process/_continuation-guide/continue-placeholder-upgrades.md

Then upgrade service [SERVICE_NUMBER]-[SERVICE_NAME] from placeholder to full detail.

For each screen file in dev_docs/12-Rabih-design-Process/[SERVICE_FOLDER]/:

1. Read the existing placeholder file
2. Read the service doc at dev_docs/02-services/[SERVICE_DOC_NUMBER]-service-[SERVICE_NAME].md (if it exists)
3. Replace the placeholder content with the FULL 15-section template from dev_docs/12-Rabih-design-Process/00-global/04-screen-template.md
4. Also upgrade the 00-service-overview.md to include detailed workflows, entity relationships, and persona mappings

Use the same quality and depth as the completed files in 04-tms-core/ and 05-carrier/ (read 04-tms-core/08-dispatch-board.md as a reference for quality level).

Design style: Modern SaaS (Linear.app aesthetic) - dark slate-900 sidebar, white content, blue-600 primary.
Desktop-first with responsive notes.
Think like a UX/UI designer with 25 years in freight/logistics.
Every screen file MUST include a Stitch.withgoogle.com prompt (200-400 words, copy-paste ready).
```

---

### PROMPT TEMPLATE - BATCH (upgrade multiple services at once)

```
I want to continue the design documentation for Ultra TMS.

Read the continuation guide at:
dev_docs/12-Rabih-design-Process/_continuation-guide/continue-placeholder-upgrades.md

Upgrade these services from placeholder to full 15-section detail:
- [SERVICE_1_FOLDER] ([X] screens)
- [SERVICE_2_FOLDER] ([Y] screens)
- [SERVICE_3_FOLDER] ([Z] screens)

For EACH screen file:
1. Read the existing placeholder
2. Read the matching service doc from dev_docs/02-services/ (if it exists)
3. Replace with FULL 15-section content (see 00-global/04-screen-template.md)
4. Include Stitch.withgoogle.com prompt (200-400 words) in every file
5. Use 04-tms-core/08-dispatch-board.md as the quality reference

Run agents in parallel for each service. Use the same design style and logistics expertise as the completed files.
```

---

## Recommended Upgrade Order

### Wave 4 (Next Priority - Business Critical)
These services are needed soonest and have the highest operational impact:

1. **06-accounting** (14 screens) - Financial backbone. AR/AP, invoicing, payments, GL.
2. **10-documents** (8 screens) - Document management, BOL, POD, rate confirmations.
3. **11-communication** (10 screens) - Email, SMS, notifications, auto-messaging.
4. **18-analytics** (10 screens) - KPI dashboards, operational analytics, custom reports.
5. **21-search** (4 screens) - Global search, advanced search, saved searches.
6. **38-super-admin** (28 screens) - Platform administration, tenant management.

**Total: 74 screens**

### Wave 5 (High Value)
Important for complete brokerage operations:

7. **07-load-board** (4 screens) - Internal load board and matching.
8. **08-commission** (6 screens) - Sales commission tracking.
9. **09-claims** (10 screens) - Claims management and resolution.
10. **12-customer-portal** (10 screens) - Customer self-service portal.
11. **13-carrier-portal** (12 screens) - Carrier self-service portal.
12. **14-contracts** (8 screens) - Contract management and rate agreements.
13. **16-credit** (10 screens) - Credit applications and monitoring.
14. **20-integration-hub** (10 screens) - Third-party integrations.
15. **26-rate-intelligence** (8 screens) - Market rate data and analysis.
16. **31-load-board-external** (8 screens) - DAT, Truckstop integration.
17. **32-mobile-app** (8 screens) - Mobile driver/dispatch app.

**Total: 104 screens**

### Wave 6 (Supporting)
Supporting tools and automation:

18. **15-agents** (8 screens) - Agent/broker management.
19. **19-workflow** (8 screens) - Workflow automation.
20. **22-audit** (6 screens) - Audit trail and compliance.
21. **23-config** (8 screens) - System configuration.
22. **24-edi** (8 screens) - EDI document exchange.
23. **25-safety** (10 screens) - Safety and compliance.
24. **36-scheduler** (6 screens) - Resource scheduling.

**Total: 54 screens**

### Wave 7 (Extended)
Specialized and external integrations:

25. **17-factoring** (6 screens) - Internal factoring.
26. **27-help-desk** (6 screens) - Support ticketing.
27. **28-feedback** (6 screens) - User feedback and surveys.
28. **29-fuel-cards** (8 screens) - Fuel card management.
29. **30-factoring-external** (8 screens) - External factoring integration.
30. **33-hr** (10 screens) - Human resources.
31. **34-eld** (8 screens) - Electronic logging devices.
32. **35-cross-border** (10 screens) - International/customs.
33. **37-cache** (4 screens) - System caching (internal).

**Total: 66 screens**

---

## What "Full Detail" Means (15 Sections)

Every upgraded screen file must contain ALL of these sections:

| # | Section | What Goes In It |
|---|---------|----------------|
| 1 | Purpose & Business Context | What it does, business problem, key rules, success metric |
| 2 | User Journey Context | Entry/exit points table, primary trigger, success criteria |
| 3 | Layout Blueprint | ASCII wireframe for desktop (1440px+), information hierarchy |
| 4 | Data Fields & Display | Every visible field mapped from DB schema with format and location |
| 5 | Features | Core features, advanced (logistics expert) features, role-based feature matrix |
| 6 | Status & State Machine | Status transitions diagram, buttons per state, color coding |
| 7 | Actions & Interactions | Primary/secondary/bulk actions, keyboard shortcuts, drag-drop |
| 8 | Real-Time Features | WebSocket events, what updates live, polling fallback |
| 9 | Component Inventory | Existing shadcn components to reuse, new components to create, shadcn to install |
| 10 | API Integration | Endpoints table (method, path, purpose, hook), real-time events |
| 11 | States & Edge Cases | Loading skeleton, empty state, error state, permission denied, offline |
| 12 | Filters, Search & Sort | Available filters with types/defaults, search behavior, sort options, saved views |
| 13 | Responsive Design Notes | Tablet (768-1024px) and mobile (<768px) layout changes |
| 14 | Stitch Prompt | 200-400 word prompt ready to paste into stitch.withgoogle.com |
| 15 | Enhancement Opportunities | Only for Wave 1 built screens. What's built, what to improve. |

---

## Reference Files to Read Before Upgrading

These files provide the context needed to write high-quality screen docs:

| Reference | Path | Why |
|-----------|------|-----|
| Screen Template | `12-Rabih-design-Process/00-global/04-screen-template.md` | The 15-section template structure |
| Status Color System | `12-Rabih-design-Process/00-global/03-status-color-system.md` | Consistent colors for every status |
| Design Principles | `12-Rabih-design-Process/00-global/02-design-principles.md` | Modern SaaS style guide |
| User Journeys | `12-Rabih-design-Process/00-global/05-user-journeys.md` | 6 persona daily workflows |
| Role-Based Views | `12-Rabih-design-Process/00-global/06-role-based-views.md` | 11 roles access matrix |
| Real-Time Map | `12-Rabih-design-Process/00-global/07-real-time-feature-map.md` | WebSocket vs polling per screen |
| Stitch Tips | `12-Rabih-design-Process/00-global/16-stitch-tips-and-patterns.md` | How to write good Stitch prompts |
| Screen Catalog | `dev_docs/03-design/47-screen-catalog.md` | All 362+ screens listed |
| Design System | `dev_docs/03-design/46-design-system-components.md` | 111 component definitions |
| Navigation by Role | `dev_docs/03-design/48-navigation-menus-by-role.md` | 11 role nav menus |
| User Personas | `dev_docs/01-foundation/04-user-personas.md` | 6 personas with pain points |
| Entity Dictionary | `dev_docs/11-ai-dev/91-entity-data-dictionary.md` | Field-by-field entity specs |
| Business Rules | `dev_docs/11-ai-dev/92-business-rules-reference.md` | Validation, state machines |
| Screen-API Contracts | `dev_docs/09-contracts/76-screen-api-contract-registry.md` | Screen-to-API mapping |
| WebSocket Standards | `dev_docs/10-features/79-real-time-websocket-standards.md` | WebSocket architecture |
| UI Component Standards | `dev_docs/08-standards/69-ui-component-standards.md` | UI interaction patterns |
| Existing Components | `apps/web/components/ui/` | 36 installed shadcn components |

### Quality Reference Files (read these to match quality level)

| Screen Type | Reference File | Why |
|-------------|---------------|-----|
| Dashboard | `04-tms-core/01-operations-dashboard.md` | Best example of a dashboard screen |
| List | `04-tms-core/02-orders-list.md` or `05-carrier/02-carriers-list.md` | Data table with filters |
| Detail | `04-tms-core/06-load-detail.md` or `05-carrier/03-carrier-detail.md` | Complex tabbed detail page |
| Form | `04-tms-core/04-order-entry.md` | Multi-section form |
| Board/Kanban | `04-tms-core/08-dispatch-board.md` | Most complex screen (3 views) |
| Map | `04-tms-core/10-tracking-map.md` | Real-time map with WebSocket |
| Wizard | `05-carrier/04-carrier-onboarding.md` or `02-crm/12-lead-import-wizard.md` | Multi-step wizard |
| Calendar | `04-tms-core/14-appointment-scheduler.md` | Calendar with appointments |
| Report | `03-sales/10-sales-reports.md` | Analytics and charts |
| Config | `02-crm/11-territory-management.md` | Configuration screen |

---

## Service Documentation Cross-Reference

These are the service docs under `dev_docs/02-services/` that contain DB schemas, API endpoints, and business rules for each service:

| Service | Service Doc | Has DB Schema? | Has API? |
|---------|------------|----------------|----------|
| 06-accounting | `13-service-accounting.md` | Yes | Yes |
| 07-load-board | `14-service-load-board.md` | Yes | Yes |
| 08-commission | `15-service-commission.md` | Yes | Yes |
| 09-claims | `16-service-claims.md` | Yes | Yes |
| 10-documents | `17-service-documents.md` | Yes | Yes |
| 11-communication | `18-service-communication.md` | Yes | Yes |
| 12-customer-portal | `19-service-customer-portal.md` | Yes | Yes |
| 13-carrier-portal | `20-service-carrier-portal.md` | Yes | Yes |
| 14-contracts | `21-service-contracts.md` | Yes | Yes |
| 15-agents | `22-service-agents.md` | Yes | Yes |
| 16-credit | `23-service-credit.md` | Yes | Yes |
| 17-factoring | `24-service-factoring.md` | Yes | Yes |
| 18-analytics | `25-service-analytics.md` | Yes | Yes |
| 19-workflow | `26-service-workflow.md` | Yes | Yes |
| 20-integration-hub | `27-service-integration-hub.md` | Yes | Yes |
| 21-search | `28-service-search.md` | Yes | Yes |
| 22-audit | `29-service-audit.md` | Yes | Yes |
| 23-config | `30-service-config.md` | Yes | Yes |
| 24-edi | `31-service-edi.md` | Yes | Yes |
| 25-safety | `32-service-safety.md` | Yes | Yes |
| 26-rate-intelligence | `33-service-rate-intelligence.md` | Yes | Yes |
| 27-help-desk | `34-service-help-desk.md` | Yes | Yes |
| 28-feedback | `35-service-feedback.md` | Yes | Yes |
| 29-fuel-cards | `36-service-fuel-cards.md` | Yes | Yes |
| 30-factoring-external | `37-service-factoring-external.md` | Yes | Yes |
| 31-load-board-external | `38-service-load-board-external.md` | Yes | Yes |
| 32-mobile-app | `39-service-mobile-app.md` | Yes | Yes |
| 33-hr | `40-service-hr.md` | Yes | Yes |
| 34-eld | `41-service-eld.md` | Yes | Yes |
| 35-cross-border | `42-service-cross-border.md` | Yes | Yes |
| 36-scheduler | `43-service-scheduler.md` | Yes | Yes |
| 37-cache | `44-service-cache.md` | Yes | Yes |
| 38-super-admin | `45-service-super-admin.md` | Yes | Yes |

---

## Progress Tracking

Check this box as each service gets upgraded from placeholder to full detail:

- [ ] 06-accounting (14 screens)
- [ ] 07-load-board (4 screens)
- [ ] 08-commission (6 screens)
- [ ] 09-claims (10 screens)
- [ ] 10-documents (8 screens)
- [ ] 11-communication (10 screens)
- [ ] 12-customer-portal (10 screens)
- [ ] 13-carrier-portal (12 screens)
- [ ] 14-contracts (8 screens)
- [ ] 15-agents (8 screens)
- [ ] 16-credit (10 screens)
- [ ] 17-factoring (6 screens)
- [ ] 18-analytics (10 screens)
- [ ] 19-workflow (8 screens)
- [ ] 20-integration-hub (10 screens)
- [ ] 21-search (4 screens)
- [ ] 22-audit (6 screens)
- [ ] 23-config (8 screens)
- [ ] 24-edi (8 screens)
- [ ] 25-safety (10 screens)
- [ ] 26-rate-intelligence (8 screens)
- [ ] 27-help-desk (6 screens)
- [ ] 28-feedback (6 screens)
- [ ] 29-fuel-cards (8 screens)
- [ ] 30-factoring-external (8 screens)
- [ ] 31-load-board-external (8 screens)
- [ ] 32-mobile-app (8 screens)
- [ ] 33-hr (10 screens)
- [ ] 34-eld (8 screens)
- [ ] 35-cross-border (10 screens)
- [ ] 36-scheduler (6 screens)
- [ ] 37-cache (4 screens)
- [ ] 38-super-admin (28 screens)

**Total remaining: 298 screens across 33 services**

---

## Quick Start Example

To upgrade Accounting (the next recommended service), paste this:

```
I want to continue the design documentation for Ultra TMS.

Read the continuation guide at:
dev_docs/12-Rabih-design-Process/_continuation-guide/continue-placeholder-upgrades.md

Upgrade service 06-accounting from placeholder to full detail.

For each screen file in dev_docs/12-Rabih-design-Process/06-accounting/:
1. Read the existing placeholder file
2. Read the service doc at dev_docs/02-services/13-service-accounting.md
3. Replace the placeholder with FULL 15-section content (see 00-global/04-screen-template.md)
4. Also upgrade the 00-service-overview.md with detailed workflows and entity relationships

Use 04-tms-core/08-dispatch-board.md as the quality reference.
Design style: Modern SaaS (Linear.app) - dark slate-900 sidebar, white content, blue-600 primary.
Desktop-first with responsive notes.
Think like a UX/UI designer with 25 years in freight/logistics.
Every file MUST include a Stitch.withgoogle.com prompt (200-400 words).
```

---

_This guide was generated on 2026-02-06 as part of the initial design documentation sprint._
_Total files created in initial sprint: 410 (89 detailed + 321 placeholders)_

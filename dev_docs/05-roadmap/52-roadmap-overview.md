# Development Roadmap

Week-by-week breakdown of the 162-week development plan.

---

## Phase Navigation

| Phase                          | Name         | Weeks   | Duration | Status     |
| ------------------------------ | ------------ | ------- | -------- | ---------- |
| [Phase A](./phase-a/README.md) | Internal MVP | 1-78    | 78 weeks | 🔨 Active  |
| [Phase B](./phase-b/README.md) | Enhancement  | 79-104  | 26 weeks | 📋 Planned |
| [Phase C](./phase-c/README.md) | SaaS Launch  | 105-128 | 24 weeks | 📋 Planned |
| [Phase D](./phase-d/README.md) | Expansion    | 129-146 | 18 weeks | 📋 Planned |
| [Phase E](./phase-e/README.md) | Specialty    | 147-162 | 16 weeks | 📋 Planned |

---

## Timeline Overview

```
2025                                2026                                2027
├────────────────────────┼────────────────────────┼──────────────────────┤

Phase A (MVP)                                      Phase B
█████████████████████████████████████████████████████████████████████████
Week 1────────────────────────────────────Week 78  Week 79─────Week 104

                                                   Phase C (SaaS)
                                                   ████████████████████
                                                   Week 105───Week 128

                                                              Phase D
                                                              ███████████
                                                              W129──W146

                                                                    Phase E
                                                                    ██████
                                                                    W147─162
```

---

## Team Capacity

### Phase A

- **Engineers:** 2 @ 30 hrs/week = 60 hrs/week
- **AI Tools:** Claude for code assistance
- **Total Phase:** 4,680 engineering hours

### Phase B+

- Scale team based on revenue
- Target: 4-6 engineers by Phase C

---

## Go-Live Schedule

| #     | Week | Module     | Description             |
| ----- | ---- | ---------- | ----------------------- |
| GL-1  | 6    | Auth/Admin | User management live    |
| GL-2  | 12   | CRM        | HubSpot sync working    |
| GL-3  | 20   | Sales      | Quoting live            |
| GL-4  | 28   | TMS        | Order management live   |
| GL-5  | 36   | Carrier    | Carrier onboarding live |
| GL-6  | 44   | Accounting | Invoicing live          |
| GL-7  | 56   | Operations | Full workflow live      |
| GL-8  | 64   | EDI        | EDI processing live     |
| GL-9  | 74   | Analytics  | Dashboards live         |
| GL-10 | 78   | Portal     | Customer portal live    |

---

## Phase A Detail (Weeks 1-78)

### Section 1: Foundation (Weeks 1-6)

| Week                      | Title             | Key Deliverables              |
| ------------------------- | ----------------- | ----------------------------- |
| [1](./phase-a/week-01.md) | Project Setup     | Monorepo, GitHub, Docker      |
| [2](./phase-a/week-02.md) | Database & ORM    | PostgreSQL, Prisma, Redis     |
| [3](./phase-a/week-03.md) | NestJS Foundation | Modules, config, filters      |
| [4](./phase-a/week-04.md) | Authentication    | JWT, sessions, guards         |
| [5](./phase-a/week-05.md) | User Management   | CRUD, roles, permissions      |
| [6](./phase-a/week-06.md) | Admin Dashboard   | Tenant settings, first deploy |

**Go-Live 1:** Admin & user management functional

### Section 2: HubSpot Integration (Weeks 7-12)

| Week                       | Title            | Key Deliverables           |
| -------------------------- | ---------------- | -------------------------- |
| [7](./phase-a/week-07.md)  | HubSpot Connect  | OAuth, API client          |
| [8](./phase-a/week-08.md)  | Company Sync     | Bidirectional company sync |
| [9](./phase-a/week-09.md)  | Contact Sync     | Contact management         |
| [10](./phase-a/week-10.md) | Activity Sync    | Notes, calls, meetings     |
| [11](./phase-a/week-11.md) | Deal Integration | Opportunity sync           |
| [12](./phase-a/week-12.md) | CRM Polish       | Error handling, UI         |

**Go-Live 2:** HubSpot sync operational

### Section 3: Sales & Quoting (Weeks 13-20)

| Week                       | Title            | Key Deliverables          |
| -------------------------- | ---------------- | ------------------------- |
| [13](./phase-a/week-13.md) | Quote Module     | Quote data model, CRUD    |
| [14](./phase-a/week-14.md) | Rate Tables      | Lane pricing, contracts   |
| [15](./phase-a/week-15.md) | Quote Builder    | Multi-stop quote creation |
| [16](./phase-a/week-16.md) | Rate Calculation | Pricing engine            |
| [17](./phase-a/week-17.md) | Fuel Surcharge   | FSC configuration         |
| [18](./phase-a/week-18.md) | Accessorials     | Accessorial management    |
| [19](./phase-a/week-19.md) | Quote Workflow   | Send, accept, convert     |
| [20](./phase-a/week-20.md) | Sales Dashboard  | Quote metrics             |

**Go-Live 3:** Full quoting workflow

### Section 4: TMS Core (Weeks 21-32)

| Week                       | Title             | Key Deliverables      |
| -------------------------- | ----------------- | --------------------- |
| [21](./phase-a/week-21.md) | Order Module      | Order data model      |
| [22](./phase-a/week-22.md) | Stop Management   | Multi-stop handling   |
| [23](./phase-a/week-23.md) | Order Entry UI    | Order creation wizard |
| [24](./phase-a/week-24.md) | Load Module       | Load management       |
| [25](./phase-a/week-25.md) | Dispatch Board    | Kanban interface      |
| [26](./phase-a/week-26.md) | Status Workflow   | Order/load status     |
| [27](./phase-a/week-27.md) | Check Calls       | Check call logging    |
| [28](./phase-a/week-28.md) | Basic Tracking    | Location updates      |
| [29](./phase-a/week-29.md) | Tracking Map      | Live tracking UI      |
| [30](./phase-a/week-30.md) | Rate Confirmation | Rate con generation   |
| [31](./phase-a/week-31.md) | Order Templates   | Recurring orders      |
| [32](./phase-a/week-32.md) | TMS Dashboard     | Operations metrics    |

**Go-Live 4:** Order management operational

### Section 5: Carrier Management (Weeks 33-40)

| Week                       | Title              | Key Deliverables     |
| -------------------------- | ------------------ | -------------------- |
| [33](./phase-a/week-33.md) | Carrier Profile    | Carrier data model   |
| [34](./phase-a/week-34.md) | Compliance         | Insurance, authority |
| [35](./phase-a/week-35.md) | FMCSA Integration  | SAFER API            |
| [36](./phase-a/week-36.md) | Onboarding Flow    | Carrier onboarding   |
| [37](./phase-a/week-37.md) | Equipment          | Equipment management |
| [38](./phase-a/week-38.md) | Lane Preferences   | Preferred lanes      |
| [39](./phase-a/week-39.md) | Scorecard          | Performance metrics  |
| [40](./phase-a/week-40.md) | Carrier Portal MVP | Basic carrier access |

**Go-Live 5:** Carrier management live

### Section 6: Accounting Core (Weeks 41-50)

| Week                       | Title                | Key Deliverables         |
| -------------------------- | -------------------- | ------------------------ |
| [41](./phase-a/week-41.md) | Invoice Module       | Invoice data model       |
| [42](./phase-a/week-42.md) | Invoice Generation   | Auto-invoice on delivery |
| [43](./phase-a/week-43.md) | Invoice UI           | Invoice management       |
| [44](./phase-a/week-44.md) | Carrier Pay          | Carrier payment model    |
| [45](./phase-a/week-45.md) | Settlement           | Carrier settlement       |
| [46](./phase-a/week-46.md) | Payment Receipt      | Customer payments        |
| [47](./phase-a/week-47.md) | AR Aging             | Aging report             |
| [48](./phase-a/week-48.md) | QuickBooks Sync      | QB integration           |
| [49](./phase-a/week-49.md) | GL Module            | General ledger           |
| [50](./phase-a/week-50.md) | Accounting Dashboard | Financial metrics        |

**Go-Live 6:** Full billing workflow

### Section 7: Operations Support (Weeks 51-56)

| Week                       | Title             | Key Deliverables    |
| -------------------------- | ----------------- | ------------------- |
| [51](./phase-a/week-51.md) | Credit Module     | Credit applications |
| [52](./phase-a/week-52.md) | Credit Management | Limits, holds       |
| [53](./phase-a/week-53.md) | Claims Module     | Claim filing        |
| [54](./phase-a/week-54.md) | Claims Workflow   | Resolution process  |
| [55](./phase-a/week-55.md) | Commission Module | Commission plans    |
| [56](./phase-a/week-56.md) | Commission Calc   | Calculation engine  |

**Go-Live 7:** Operations support complete

### Section 8: Governance (Weeks 53-62)

_Note: Parallel track with Operations_

| Week | Title                | Key Deliverables          |
| ---- | -------------------- | ------------------------- |
| 53   | Testing Strategy     | Test framework, coverage  |
| 54   | Monitoring Setup     | Logging, metrics, alerts  |
| 55   | SLA Definition       | Performance targets       |
| 56   | Infrastructure       | Deployment architecture   |
| 57   | Disaster Recovery    | Backup, recovery plan     |
| 58   | Data Governance      | Classification, retention |
| 59   | User Personas Doc    | Persona documentation     |
| 60   | Competitive Analysis | Market positioning        |
| 61   | Cost Modeling        | Infrastructure costs      |
| 62   | Governance Review    | Sign-off                  |

### Section 9: Extended Features (Weeks 63-70)

| Week                       | Title                 | Key Deliverables  |
| -------------------------- | --------------------- | ----------------- |
| [63](./phase-a/week-63.md) | EDI Foundation        | EDI parser        |
| [64](./phase-a/week-64.md) | EDI 204/214           | Tender/status     |
| [65](./phase-a/week-65.md) | EDI 210               | Invoicing         |
| [66](./phase-a/week-66.md) | DAT Integration       | Rate intelligence |
| [67](./phase-a/week-67.md) | Truckstop Integration | ITS integration   |
| [68](./phase-a/week-68.md) | Load Board Posting    | Post loads        |
| [69](./phase-a/week-69.md) | Safety Module         | CSA scores        |
| [70](./phase-a/week-70.md) | Extended Polish       | Bug fixes         |

**Go-Live 8:** EDI and integrations live

### Section 10: Analytics & Reporting (Weeks 71-74)

| Week                       | Title            | Key Deliverables     |
| -------------------------- | ---------------- | -------------------- |
| [71](./phase-a/week-71.md) | KPI Engine       | KPI calculations     |
| [72](./phase-a/week-72.md) | Dashboards       | Executive dashboards |
| [73](./phase-a/week-73.md) | Standard Reports | Canned reports       |
| [74](./phase-a/week-74.md) | Report Builder   | Custom reports       |

**Go-Live 9:** Analytics live

### Section 11: Customer Portal (Weeks 75-77)

| Week                       | Title           | Key Deliverables           |
| -------------------------- | --------------- | -------------------------- |
| [75](./phase-a/week-75.md) | Portal Auth     | Customer login             |
| [76](./phase-a/week-76.md) | Portal Features | Tracking, quotes, invoices |
| [77](./phase-a/week-77.md) | Portal Polish   | UI refinement              |

### Section 12: Phase A Completion (Week 78)

| Week                       | Title        | Key Deliverables      |
| -------------------------- | ------------ | --------------------- |
| [78](./phase-a/week-78.md) | MVP Complete | Final testing, launch |

**Go-Live 10:** Customer portal live, Phase A complete

---

## Weekly Document Format

Each week has a dedicated markdown file with:

```markdown
# Week XX: [Title]

## Overview

- Phase: A
- Section: [Section Name]
- Focus: [Primary focus]

## Goals

1. Goal 1
2. Goal 2
3. Goal 3

## Tasks

### Task 1: [Name]

- [ ] Subtask 1.1
- [ ] Subtask 1.2
- [ ] Subtask 1.3

### Task 2: [Name]

- [ ] Subtask 2.1
- [ ] Subtask 2.2

## Deliverables

- Deliverable 1
- Deliverable 2

## Dependencies

- Requires: [Previous week/feature]
- Blocks: [Future week/feature]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Notes

Any special considerations.
```

---

## Progress Tracking

### Status Legend

| Symbol | Meaning     |
| ------ | ----------- |
| 🔨     | In Progress |
| ✅     | Complete    |
| 📋     | Planned     |
| ⏸️     | On Hold     |
| ❌     | Blocked     |

### Weekly Review

Each week ends with:

1. Demo of completed features
2. Retrospective
3. Next week planning
4. Stakeholder update

### Phase Gates

At end of each section:

- [ ] All tasks complete
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Stakeholder approval

---

## Adjustment Process

### Scope Changes

1. Document change request
2. Assess impact on timeline
3. Stakeholder approval
4. Update roadmap documents

### Timeline Adjustments

If behind schedule:

1. Identify root cause
2. Assess scope reduction options
3. Communicate to stakeholders
4. Adjust future weeks

---

## Related Documents

- [Phase Overview](../00-project/PHASES.md)
- [Services](../02-services/README.md)
- [Testing Strategy](../05-operations/TESTING.md)

# Project Phases — Ultra TMS

> **Last Updated:** 2026-03-07
> **Current Phase:** Quality Sprint (between initial build and P1 post-MVP)

---

## Phase Overview

| Phase | Name | Focus | Status | Duration |
|---|---|---|---|---|
| Phase 0 | Foundation (dev_docs_v2) | Bug fixes + design system + infrastructure | DONE | Feb 2026 |
| Quality Sprint | Verification & Fixing | Verify all routes, fix P0 bugs, complete missing endpoints | IN PROGRESS | Mar 2026 |
| Phase P1 | Post-MVP Features | Claims, Documents, Communication, Portals, Contracts | PLANNED | Apr-May 2026 |
| Phase P2 | Extended Features | Agents, Credit, Factoring, Analytics, Workflow, Integration, Search | PLANNED | Jun-Aug 2026 |
| Phase P3 | Future | HR, Safety, EDI, ELD, Mobile, etc. | FUTURE | TBD |

---

## Quality Sprint (CURRENT)

**Goal:** Verify that what was built actually works. Fix what doesn't. Fill critical gaps.

**Duration:** ~4 weeks (March 2026)
**Capacity:** 2 devs × 15h/week = 120h total

**Active tasks:**

| ID | Task | Effort | Priority |
|---|---|---|---|
| QS-001 | WebSocket Gateways | XL (12-16h) | P0 |
| QS-002 | Soft Delete Migration | M (2-4h) | P0 |
| QS-003 | Accounting Dashboard Endpoint | M (2-4h) | P1 |
| QS-004 | CSA Scores Endpoint | S (1-2h) | P1 |
| QS-005 | Profile Page | L (4-8h) | P1 |
| QS-006 | Check Call Form RHF Refactor | M (2-4h) | P1 |
| QS-007 | CORS Env Variable | S (1h) | P1 |
| QS-008 | Runtime Verification (all 96 routes) | L (4-8h) | P0 |
| QS-009 | Delete .bak Directories | S (30min) | P2 |
| QS-010 | Triage 339 TODOs | M (2-4h) | P2 |

**Exit criteria for Quality Sprint:**
- All 96 routes verified (pass/fail documented)
- All P0 bugs from QS-001/002 fixed
- WebSocket infrastructure working for dispatch and tracking
- Accounting and CSA endpoints built
- Technical debt triaged (QS-009/010 done)

---

## Phase P1: Post-MVP Features

**Goal:** Add the next tier of features that make Ultra TMS a complete product.

**Duration:** ~8 weeks (April-May 2026)
**Capacity:** 2 devs × 15h/week = 240h total

**Services to build:**

| # | Service | Backend Status | Est. Effort |
|---|---|---|---|
| 10 | Claims | Partial (has backend module) | L |
| 11 | Documents | Partial | M |
| 12 | Communication | Partial | L |
| 13 | Customer Portal | Partial | XL |
| 14 | Carrier Portal | Partial | XL |
| 15 | Contracts | Partial | L |

**Prerequisites:** Quality Sprint must be complete. All P0 routes must be verified working.

---

## Phase P2: Extended Features

**Goal:** Add advanced capabilities for power users and enterprise clients.

**Duration:** ~12 weeks (June-August 2026)
**Capacity:** 2 devs × 15h/week = 360h total

**Services to build:**

| # | Service | Backend Status | Est. Effort |
|---|---|---|---|
| 16 | Agents | Partial | L |
| 17 | Credit | Partial | L |
| 18 | Factoring Internal | Partial | L |
| 19 | Analytics | Partial | XL |
| 20 | Workflow | Partial | XL |
| 21 | Integration Hub | Partial | XL |
| 22 | Search (ES integration) | Partial | L |

---

## Phase P3: Future (16 services)

Not scheduled. Will be planned when P2 is underway.

| Service | Why Deferred |
|---|---|
| HR | Not core to freight brokerage |
| Safety | Regulatory, complex, needs dedicated sprint |
| EDI | Integration complexity — requires partner coordination |
| ELD | Hardware integration — needs ELD provider agreements |
| Help Desk | Internal tool — lower priority |
| Feedback | Nice-to-have |
| Rate Intelligence | AI/ML component — future capability |
| Scheduler | Job scheduling — infrastructure dependency |
| Super Admin (full) | Platform management — when scaling |
| Config (advanced) | Feature flags, advanced settings |
| Cache (service) | Performance optimization |
| Audit Log | Compliance — needed before SOC2 |
| Fuel Cards | Hardware integration |
| Factoring External | Third-party integration |
| Load Board External | Third-party integration (DAT, TruckStop) |
| Mobile App | New platform — separate sprint |
| Cross-Border | Regulatory complexity |

---

## Milestone Gates

| Milestone | Trigger | Action |
|---|---|---|
| Quality Sprint Complete | All 96 routes verified, QS tasks done | Start P1 planning sprint |
| P1 Complete | All P1 services pass Gate 3 (module quality) | Security audit + penetration test |
| Beta Launch | P1 complete + security audit passed | Invite 2-3 pilot customers |
| GA Launch | 3 months of beta with no P0 bugs | Full marketing launch |
| P2 Complete | All P2 services done | Assess P3 priorities |

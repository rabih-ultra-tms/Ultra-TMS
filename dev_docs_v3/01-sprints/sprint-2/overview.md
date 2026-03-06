# Sprint 2 Overview: Launch & Foundation Services
> Weeks 13-24 | 42 tasks | 180-240h | 4 new services + production launch

---

## Sprint Goal
Launch the hardened MVP to production. Build 4 foundation services that later sprints depend on: Documents, Communication, Credit, Analytics. Establish business operations infrastructure.

## Key Insight
Unlike Sprint 1 (fixing broken services), Sprint 2 is **80% frontend work**. All 4 new services already have substantial backend implementations:

| Service | Backend Done | Frontend Done | Sprint 2 Focus |
|---------|-------------|---------------|----------------|
| Documents | 75% | 30% | Wire .bak code (22.5K LOC) + 8 new pages |
| Communication | 85% | 40% | WebSocket delivery + 7 new pages |
| Credit | 80% | 0% | Auto-holds + 10 new pages from scratch |
| Analytics | 75% | 0% | KPI engine + 11 new pages from scratch |

---

## Phase Summary

| Phase | Weeks | Tasks | Hours | Focus |
|-------|-------|-------|-------|-------|
| [Phase 1: Launch Preparation](phase-1-launch-preparation.md) | 13-14 | 7 | 22-31h | UX audit, go-live checklist, DB migration, domain/SSL |
| [Phase 2: Go-Live & Stabilization](phase-2-go-live-stabilization.md) | 15-16 | 6 | 20-30h | Deploy, 48h monitoring, bug fixes, onboarding |
| [Phase 3: Documents + Communication](phase-3-documents-communication.md) | 17-18 | 6 | 36-52h | 2 foundation services (15 new pages) |
| [Phase 4: Credit](phase-4-credit.md) | 19-20 | 3 | 19-28h | Credit management (10 new pages) |
| [Phase 5: Analytics](phase-5-analytics.md) | 21-22 | 3 | 19-28h | Business intelligence (11 new pages) |
| [Phase 6: Business Operations](phase-6-business-operations.md) | 23-24 | 7 | 37-54h | Legal, billing design, docs, E2E |
| **TOTAL** | **13-24** | **42** | **180-240h** | |

---

## All 42 Tasks

### Phase 1: Launch Preparation (Weeks 13-14)
| ID | Task | Priority | Effort | Scope |
|----|------|----------|--------|-------|
| UX-001 | Responsive Audit | P2 | M (3-4h) | 8 pages × 2 viewports |
| UX-002 | Accessibility Baseline | P2 | M (3-4h) | axe-core scan, 5 pages |
| UX-003 | Performance Baseline | P2 | S (2-3h) | Lighthouse >80 |
| LAUNCH-001 | Go-Live Checklist | P0 | L (8-12h) | 50+ items |
| LAUNCH-002 | Production DB Migration | P0 | M (3-4h) | 258 models |
| LAUNCH-003 | Domain & SSL | P0 | S (1-2h) | HTTPS + reverse proxy |
| LAUNCH-004 | PR Template + Release Process | P1 | S (2h) | v1.0.0 tag |

### Phase 2: Go-Live & Stabilization (Weeks 15-16)
| ID | Task | Priority | Effort | Scope |
|----|------|----------|--------|-------|
| LAUNCH-005 | Deploy to Production | P0 | M (4-6h) | Dockerfiles + compose |
| STAB-001 | First 48h Monitoring | P0 | M (4-6h) | Zero SEV1/SEV2 |
| STAB-002 | Bug Fix Sprint | P0 | M (4-6h) | Fix production issues |
| STAB-003 | Performance Tuning | P1 | S (2-3h) | p95 <500ms |
| LAUNCH-006 | Onboarding Flow | P1 | M (4-6h) | Setup wizard + checklist |
| LAUNCH-007 | Feedback Widget | P1 | S (2-3h) | Floating feedback button |

### Phase 3: Documents + Communication (Weeks 17-18)
| ID | Task | Priority | Effort | Scope |
|----|------|----------|--------|-------|
| SVC-DOC-001 | Documents Backend Completion | P0 | L (8-12h) | Wire .bak + bulk + search |
| SVC-DOC-002 | Documents UI Pages | P1 | L (8-12h) | 8 pages |
| SVC-DOC-003 | Documents Tests | P1 | M (3-4h) | 15+ tests |
| SVC-COMM-001 | Communication Backend Extension | P0 | L (6-8h) | WebSocket + opt-out |
| SVC-COMM-002 | Communication UI Pages | P1 | L (8-12h) | 7 pages |
| SVC-COMM-003 | Communication Tests | P1 | M (3-4h) | 15+ tests |

### Phase 4: Credit (Weeks 19-20)
| ID | Task | Priority | Effort | Scope |
|----|------|----------|--------|-------|
| SVC-CRED-001 | Credit Backend Completion | P0 | L (8-12h) | Auto-holds + enforcement |
| SVC-CRED-002 | Credit UI Pages | P1 | L (8-12h) | 10 pages (from scratch) |
| SVC-CRED-003 | Credit Tests | P1 | M (3-4h) | 15+ tests |

### Phase 5: Analytics (Weeks 21-22)
| ID | Task | Priority | Effort | Scope |
|----|------|----------|--------|-------|
| SVC-ANLYT-001 | Analytics Backend Completion | P0 | L (8-12h) | KPI engine + reports |
| SVC-ANLYT-002 | Analytics UI Pages | P1 | L (8-12h) | 11 pages (from scratch) |
| SVC-ANLYT-003 | Analytics Tests | P1 | M (3-4h) | 15+ tests |

### Phase 6: Business Operations (Weeks 23-24)
| ID | Task | Priority | Effort | Scope |
|----|------|----------|--------|-------|
| BIZ-001 | Legal Documents | P0 | L (8-12h) | Privacy, ToS, AUP |
| BIZ-002 | Billing Architecture Design | P1 | L (6-8h) | Stripe tiers (design only) |
| BIZ-003 | API Documentation (Swagger) | P1 | M (4-6h) | All endpoints |
| BIZ-004 | User Documentation (10 Articles) | P1 | L (8-12h) | Help center |
| BIZ-005 | Incident Response Framework | P1 | M (3-4h) | 4 runbooks |
| BIZ-006 | Sprint 2 E2E Expansion | P1 | M (4-6h) | 4 new journeys (9 total) |
| BIZ-007 | Financial Model | P2 | S (4-6h) | 3 scenarios |

---

## New Pages Created (36 total)

| Service | Pages | Routes |
|---------|-------|--------|
| Documents | 8 | `/documents`, `/documents/[id]`, `/documents/templates`, + 5 more |
| Communication | 7 | `/notifications`, `/communication/sms`, `/communication/email`, + 4 more |
| Credit | 10 | `/credit`, `/credit/applications`, `/credit/limits`, + 7 more |
| Analytics | 11 | `/analytics`, `/analytics/kpis`, `/analytics/reports`, + 8 more |
| **Total** | **36** | |

---

## Dependencies

```
Sprint 1 (complete)
  └── Phase 1: Launch Prep (UX + infrastructure)
      └── Phase 2: Go-Live (deploy + stabilize)
          └── Phase 3: Documents + Communication (parallel)
              ├── Phase 4: Credit (needs Accounting from Sprint 1)
              └── Phase 5: Analytics (needs all Sprint 1 data)
                  └── Phase 6: Business Ops (needs running services)
```

---

## Parallelization Strategy (Claude + Codex/Gemini)

| Phase | Claude Focus | Codex/Gemini Focus |
|-------|-------------|-------------------|
| 1 | Go-live checklist + LAUNCH-002/003 | UX audit (responsive + a11y + perf) |
| 2 | Deploy + monitoring + bug fixes | Onboarding flow + feedback widget |
| 3 | Documents backend + UI | Communication backend + UI |
| 4 | Credit backend + auto-holds | Credit UI pages |
| 5 | Analytics KPI engine | Analytics UI pages + charts |
| 6 | Legal docs + API docs + runbooks | Help articles + E2E tests + financial model |

---

## Exit Criteria

- [ ] **Launch:** App live at production URL, 48h zero SEV1/SEV2, v1.0.0 tagged
- [ ] **Documents:** Upload/download/share/generate/search working, 8 pages
- [ ] **Communication:** Email + SMS + in-app notifications, real-time via WebSocket, 7 pages
- [ ] **Credit:** Auto-holds, order enforcement, collections queue, 10 pages
- [ ] **Analytics:** KPI dashboards with real data, report generation, export, 11 pages
- [ ] **Business:** Legal pages live, billing design approved, 10 help articles, 4 runbooks
- [ ] **Testing:** 9 E2E journeys pass, 60+ new tests across 4 services
- [ ] **Quality:** All 36 new pages show 4 states (loading/error/empty/data)

---

## Related Files
- [Service Audit](../../02-audit-baseline/sprint-2-services-audit.md) — Pre-build assessment of all 4 services
- [Sprint 1 Overview](../sprint-1/overview.md) — Previous sprint (prerequisite)
- [Master Roadmap](../../../.claude/plans/) — Full 6-sprint plan

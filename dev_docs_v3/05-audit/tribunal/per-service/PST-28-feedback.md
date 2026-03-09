# PST-28 Feedback — Per-Service Tribunal Audit

> **Date:** 2026-03-09
> **Auditor:** Claude Opus 4.6
> **Verdict:** MODIFY | **Health:** 2.0 → 7.0 (+5.0)

---

## Hub vs Reality

| Dimension | Hub | Reality | Delta |
|-----------|-----|---------|-------|
| Health score | 1/10 (D) | 7.0/10 | +6.0 (hub indefensible) |
| Endpoint count | 25 | 25 | **14th consecutive perfect match** |
| Endpoint distribution | 4+4+4+5+2+6analytics | 4+6+8+5+2 | ~60% (analytics not separate controller) |
| Prisma models | 8 (named) | 8 (different set) | 2 phantom, 2 missing |
| Model field accuracy | Detailed | ~40% average | Significant divergence |
| Enums | 9 named | 4 in Prisma | 5 phantom (use plain strings) |
| Tests | "None" | 9 files / 47 tests / 820 LOC | **19th false "no tests" claim** |
| Sentiment/Analytics | "Depth unknown" | Real implementations + tested | FALSE |
| RolesGuard | "JWT + ADMIN" | JWT only, 0/5 RolesGuard | No role checking at all |
| Widget auth | "Public" | All behind JwtAuthGuard | Hub auth claims wrong |
| Frontend | "Not Built" | Confirmed | 100% accurate |
| Known issues | 6 items | 3 accurate (50%) | Below average |

---

## Endpoint Inventory (25 total)

### FeedbackEntriesController (4 endpoints) — STUB
| Method | Path | Implementation |
|--------|------|---------------|
| GET | /feedback/entries | Returns empty array |
| POST | /feedback/entries | Throws BadRequestException |
| GET | /feedback/entries/:id | Throws NotFoundException |
| POST | /feedback/entries/:id/respond | Throws BadRequestException |

### FeaturesController (6 endpoints) — hub says 4
| Method | Path | Implementation |
|--------|------|---------------|
| GET | /feedback/features | Real — tenantId filtered |
| POST | /feedback/features | Real — creates FeatureRequest |
| GET | /feedback/features/:id | Real — throws if not found |
| **PUT** | **/feedback/features/:id** | **Real — UNDOCUMENTED in hub** |
| POST | /feedback/features/:id/vote | Real — idempotent via VotingService |
| **POST** | **/feedback/features/:id/comment** | **Real — UNDOCUMENTED in hub** |

### NpsController (8 endpoints) — hub says 4
| Method | Path | Implementation |
|--------|------|---------------|
| GET | /feedback/nps/surveys | Real — list NPS surveys |
| **POST** | **/feedback/nps/surveys** | **Real — UNDOCUMENTED** |
| **GET** | **/feedback/nps/surveys/:id** | **Real — UNDOCUMENTED** |
| **PUT** | **/feedback/nps/surveys/:id** | **Real — UNDOCUMENTED** |
| **POST** | **/feedback/nps/surveys/:id/activate** | **Real — UNDOCUMENTED** |
| POST | /feedback/nps/respond | Real — submit NPS response |
| GET | /feedback/nps/responses | Real — via FeedbackAnalyticsService |
| GET | /feedback/nps/score | Real — NPS calculation |

### SurveysController (5 endpoints) — matches hub
| Method | Path | Implementation |
|--------|------|---------------|
| GET | /feedback/surveys | Real |
| POST | /feedback/surveys | Real |
| GET | /feedback/surveys/:id | Real |
| PUT | /feedback/surveys/:id | Real |
| POST | /feedback/surveys/:id/respond | Real — validates required questions |

### WidgetsController (2 endpoints) — matches hub
| Method | Path | Implementation |
|--------|------|---------------|
| GET | /feedback/widgets | Real |
| POST | /feedback/widgets | Real — list + create only |

---

## Prisma Models (8 actual)

### Exist in Prisma — Documented in Hub
| Model | Hub Name | Field Accuracy |
|-------|----------|---------------|
| FeatureRequest | FeatureRequest | ~55% |
| FeatureRequestVote | FeatureVote (wrong name) | ~70% |
| NPSResponse | NpsResponse (wrong casing) | ~45% |
| Survey | Survey | ~40% |
| SurveyResponse | SurveyResponse | ~50% |
| FeedbackWidget | FeedbackWidget | ~30% |

### Exist in Prisma — MISSING from Hub
| Model | Fields | Notes |
|-------|--------|-------|
| FeatureRequestComment | 10+ fields | Comment system entirely undocumented |
| NPSSurvey | 19 fields | NPS survey lifecycle model undocumented |

### Hub Documents — DO NOT EXIST (PHANTOM)
| Model | Hub Fields | Reality |
|-------|-----------|---------|
| **FeedbackEntry** | 17 fields | **No Prisma model. Service throws "not supported by current schema"** |
| **SurveyQuestion** | 6 fields | **Questions stored as JSON in Survey.questions field** |

### Enums
| Hub Enum | Prisma Enum | Values Match? |
|----------|-------------|--------------|
| FeedbackType | FeedbackType | NO — hub: BUG_REPORT/FEATURE_REQUEST/GENERAL, real: BUG/SUGGESTION/COMPLAINT/PRAISE/OTHER |
| FeatureStatus | FeatureRequestStatus | PARTIAL — real adds DECLINED |
| NpsCategory | NPSCategory | YES |
| SurveyStatus | — | NO PRISMA ENUM — uses plain string |
| QuestionType | — | NO PRISMA ENUM — defined in DTO only |
| SurveyType | SurveyType | NOT IN HUB — NPS/CSAT/CUSTOM/EXIT/ONBOARDING |
| FeedbackStatus | — | PHANTOM — no Prisma enum |
| FeedbackPriority | — | PHANTOM — no Prisma enum |
| FeedbackSource | — | PHANTOM — no Prisma enum |
| SentimentType | — | PHANTOM — no Prisma enum |

---

## Security Audit

### Guards
| Controller | JwtAuthGuard | RolesGuard | @Roles |
|-----------|:---:|:---:|:---:|
| FeedbackEntriesController | YES | NO | NO |
| FeaturesController | YES | NO | NO |
| NpsController | YES | NO | NO |
| SurveysController | YES | NO | NO |
| WidgetsController | YES | NO | NO |

**0/5 controllers have RolesGuard. No @Roles decorators exist anywhere — not even decorative.**

### Tenant Isolation
| Service | tenantId | deletedAt: null | Hard-delete |
|---------|:---:|:---:|:---:|
| FeedbackEntriesService | YES (stub) | N/A | NO |
| FeaturesService | YES | **NO** | NO |
| NpsSurveysService | YES | **NO** | NO |
| SurveysService | YES | **NO** | NO |
| NpsScoreService | YES | **NO** | NO |
| FeedbackAnalyticsService | YES | **NO** | NO |
| WidgetsService | YES | **NO** | NO |
| VotingService | **NO** | N/A | **YES** (.deleteMany) |
| SentimentService | N/A | N/A | NO |

**Soft-delete compliance: 0/7 real services filter deletedAt — WORST of all 28 services audited**
**VotingService: No tenantId + hard-delete — cross-tenant voting bug**

---

## Tests

| Spec File | Tests | LOC | Service Covered |
|-----------|-------|-----|----------------|
| feedback-analytics.service.spec.ts | 3 | ~57 | FeedbackAnalyticsService |
| feedback-entries.service.spec.ts | 4 | ~50 | FeedbackEntriesService |
| features.service.spec.ts | 6 | ~120 | FeaturesService |
| voting.service.spec.ts | 6 | ~80 | VotingService |
| nps-score.service.spec.ts | 6 | ~90 | NpsScoreService |
| nps-surveys.service.spec.ts | 8 | ~130 | NpsSurveysService |
| surveys.service.spec.ts | 8 | ~140 | SurveysService |
| widgets.service.spec.ts | 2 | ~40 | WidgetsService |
| sentiment.service.spec.ts | 4 | ~26 | SentimentService |
| **TOTAL** | **47** | **~820** | **9/10 services** |

Hub claims "None" — **19th false "no tests" claim across all services.**

---

## Event Architecture (Undocumented)

### Emitted Events (5)
1. `feedback.submitted` — FeedbackEntriesService (fires before stub exception)
2. `feature.submitted` — FeaturesService
3. `feature.voted` — FeaturesService
4. `nps.response.submitted` — NpsSurveysService
5. `survey.response.submitted` — SurveysService

### Event Listeners (2)
1. `order.completed` → SurveysService.handleOrderCompleted → triggers event-based survey
2. `user.onboarded` → SurveysService.handleUserOnboarded → triggers event-based survey

---

## Implementation Assessment

| Service | Status | Quality | Notes |
|---------|--------|---------|-------|
| FeedbackEntriesService | **FULL STUB** | 1/10 | All methods throw — FeedbackEntry model doesn't exist |
| FeaturesService | Production | 7/10 | Full CRUD + voting + comments, no soft-delete filter |
| NpsSurveysService | Production | 7/10 | Full lifecycle (DRAFT→ACTIVE), validates status |
| SurveysService | Production | 8/10 | Best service — event-driven triggers, question validation |
| NpsScoreService | Production | 7/10 | Real NPS calculation, correct categorization |
| FeedbackAnalyticsService | Production | 6/10 | GroupBy aggregation, no soft-delete on groupBy |
| WidgetsService | Minimal | 5/10 | List + create only, no update/delete/config endpoints |
| VotingService | Production | 5/10 | Idempotent but no tenantId, hard-delete |
| SentimentService | Production | 6/10 | Simple word-matching (14 keywords each), functional |

---

## Code Metrics

| Metric | Value |
|--------|-------|
| Source files | 16 |
| Test files | 9 |
| Total source LOC | ~1,798 |
| Total test LOC | ~820 |
| Grand total LOC | ~2,618 |
| DTOs | 14 classes / 298 LOC |
| .bak directory | None |

---

## Critical Findings

| # | Finding | Severity | Details |
|---|---------|----------|---------|
| 1 | FeedbackEntry model PHANTOM | P2-Doc | Hub documents 17-field model that doesn't exist. Service correctly throws. |
| 2 | SurveyQuestion model PHANTOM | P2-Doc | Questions stored as JSON in Survey, not separate table |
| 3 | 0/5 RolesGuard | P2-Sec | No @Roles decorators at all — any JWT user has full access |
| 4 | 0/7 soft-delete filtering | P2-Sec | Every query leaks soft-deleted records — worst compliance |
| 5 | VotingService no tenantId | P2-Sec | Cross-tenant voting possible |
| 6 | VotingService hard-delete | P3-Bug | `.deleteMany()` on votes instead of soft-delete |
| 7 | Widget endpoints not public | P3-Doc | Hub claims public/optional auth — all behind JwtAuthGuard |
| 8 | FeedbackEntries full stub | P3-Gap | Core feedback service non-functional (no Prisma model) |
| 9 | FeedbackType enum values diverge | P3-Doc | Hub: BUG_REPORT/FEATURE_REQUEST/GENERAL vs real: BUG/SUGGESTION/COMPLAINT/PRAISE/OTHER |
| 10 | 5 events + 2 listeners undocumented | P3-Doc | Event-driven survey triggers completely missing from hub |
| 11 | FeatureRequestComment model missing from hub | P3-Doc | Comment system with 10+ fields undocumented |
| 12 | NPSSurvey model missing from hub | P3-Doc | 19-field lifecycle model undocumented |

---

## Action Items

1. [ ] Create FeedbackEntry Prisma model OR remove stub service + controller
2. [ ] Add `deletedAt: null` filter to all 7 service queries
3. [ ] Add tenantId parameter to VotingService.vote() and VotingService.unvote()
4. [ ] Add @UseGuards(RolesGuard) + @Roles to all 5 controllers
5. [ ] Convert VotingService.unvote() hard-delete to soft-delete
6. [ ] Decide on widget auth: make public (remove JwtAuthGuard) or keep authenticated
7. [ ] Add update/delete endpoints to WidgetsController
8. [ ] Update hub: remove FeedbackEntry + SurveyQuestion phantom models
9. [ ] Update hub: add FeatureRequestComment + NPSSurvey models
10. [ ] Update hub: correct endpoint distribution (6 features, 8 NPS)
11. [ ] Update hub: document event architecture (5 events + 2 listeners)
12. [ ] Update hub: correct enum values (FeedbackType, FeatureRequestStatus)
13. [ ] Update hub: tests = 9 files / 47 tests / 820 LOC (not "None")

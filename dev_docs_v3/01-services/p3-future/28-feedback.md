# Service Hub: Feedback (28)

> **Priority:** P3 Future | **Status:** Backend Partial, Frontend Not Built
> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-28 tribunal)
> **Original definition:** `dev_docs/02-services/` (feedback service)
> **Design specs:** `dev_docs/12-Rabih-design-Process/28-feedback/` (7 files)
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-28-feedback.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | C (7.0/10) |
| **Confidence** | High — code-verified via PST-28 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Partial — 5 controllers, 25 endpoints in `apps/api/src/modules/feedback/` (1 stub controller, 4 production) |
| **Frontend** | Not Built — no pages, no components, no hooks |
| **Tests** | 9 files / 47 tests / ~820 LOC (9/10 services covered) |
| **Scope** | User feedback collection, NPS surveys, feature requests, embeddable widgets |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Feedback service in dev_docs |
| Design Specs | Done | 7 files, all 15-section format |
| Backend Controller | Partial | 5 controllers: entries (STUB), features, nps, surveys, widgets |
| Backend Service | Partial | 9 services: entries (stub), features, nps-surveys, surveys, nps-score, analytics, widgets, voting, sentiment |
| Prisma Models | Partial | 8 models: FeatureRequest, FeatureRequestVote, FeatureRequestComment, NPSResponse, NPSSurvey, Survey, SurveyResponse, FeedbackWidget |
| Frontend Pages | Not Built | 0 pages |
| React Hooks | Not Built | 0 hooks |
| Components | Not Built | 0 components |
| Tests | 47 tests | 9 spec files, ~820 LOC, 9/10 services covered |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Feedback Dashboard | `/feedback` | Not Built | — | Overview of all feedback, NPS score, trends |
| Feedback List | `/feedback/entries` | Not Built | — | Filterable list of all submitted feedback |
| Feedback Detail | `/feedback/entries/[id]` | Not Built | — | Single entry with status management, sentiment |
| Submit Feedback | `/feedback/submit` | Not Built | — | Public-facing feedback form |
| Surveys List | `/feedback/surveys` | Not Built | — | List of created surveys with response counts |
| Survey Builder | `/feedback/surveys/new` | Not Built | — | Drag-and-drop survey creation |
| Survey Detail | `/feedback/surveys/[id]` | Not Built | — | Survey results, response analytics |
| Feature Requests | `/feedback/features` | Not Built | — | Feature request board with voting |
| NPS Dashboard | `/feedback/nps` | Not Built | — | NPS score over time, promoter/detractor breakdown |
| Widget Configuration | `/feedback/widgets` | Not Built | — | Configure embeddable feedback widgets |

---

## 4. API Endpoints

### FeedbackEntriesController (`feedback/entries`) — STUB

| Method | Path | Auth | Status | Notes |
|--------|------|------|--------|-------|
| GET | `/feedback/entries` | JWT | Stub | Returns empty array |
| POST | `/feedback/entries` | JWT | Stub | Throws BadRequestException |
| GET | `/feedback/entries/:id` | JWT | Stub | Throws NotFoundException |
| POST | `/feedback/entries/:id/respond` | JWT | Stub | Throws BadRequestException |

### FeaturesController (`feedback/features`)

| Method | Path | Auth | Status | Notes |
|--------|------|------|--------|-------|
| GET | `/feedback/features` | JWT | Production | List feature requests, tenantId filtered |
| POST | `/feedback/features` | JWT | Production | Create FeatureRequest |
| GET | `/feedback/features/:id` | JWT | Production | Get single, throws if not found |
| PUT | `/feedback/features/:id` | JWT | Production | Update feature request |
| POST | `/feedback/features/:id/vote` | JWT | Production | Upvote — idempotent via VotingService |
| POST | `/feedback/features/:id/comment` | JWT | Production | Add comment to feature request |

### NpsController (`feedback/nps`)

| Method | Path | Auth | Status | Notes |
|--------|------|------|--------|-------|
| GET | `/feedback/nps/surveys` | JWT | Production | List NPS surveys |
| POST | `/feedback/nps/surveys` | JWT | Production | Create NPS survey |
| GET | `/feedback/nps/surveys/:id` | JWT | Production | Get single NPS survey |
| PUT | `/feedback/nps/surveys/:id` | JWT | Production | Update NPS survey |
| POST | `/feedback/nps/surveys/:id/activate` | JWT | Production | Activate NPS survey (DRAFT→ACTIVE) |
| POST | `/feedback/nps/respond` | JWT | Production | Submit NPS response (0-10 score + comment) |
| GET | `/feedback/nps/responses` | JWT | Production | List NPS responses via FeedbackAnalyticsService |
| GET | `/feedback/nps/score` | JWT | Production | Current NPS score calculation |

### SurveysController (`feedback/surveys`)

| Method | Path | Auth | Status | Notes |
|--------|------|------|--------|-------|
| GET | `/feedback/surveys` | JWT | Production | List all surveys |
| POST | `/feedback/surveys` | JWT | Production | Create survey with questions |
| GET | `/feedback/surveys/:id` | JWT | Production | Get survey with questions |
| PUT | `/feedback/surveys/:id` | JWT | Production | Update survey |
| POST | `/feedback/surveys/:id/respond` | JWT | Production | Submit survey response, validates required questions |

### WidgetsController (`feedback/widgets`)

| Method | Path | Auth | Status | Notes |
|--------|------|------|--------|-------|
| GET | `/feedback/widgets` | JWT | Production | List widgets |
| POST | `/feedback/widgets` | JWT | Production | Create widget (list + create only, no update/delete) |

**Total: 5 controllers, 25 endpoints (4 stub + 6 features + 8 NPS + 5 surveys + 2 widgets)**

> **Security note:** All 5 controllers use JwtAuthGuard only. 0/5 have RolesGuard or @Roles decorators — any authenticated user has full access.

---

## 5. Components

No components built. Planned components:

| Component | Path (planned) | Status | Shared? |
|-----------|---------------|--------|---------|
| FeedbackDashboardStats | `components/feedback/dashboard-stats.tsx` | Not Built | No |
| FeedbackEntriesTable | `components/feedback/entries-table.tsx` | Not Built | No |
| FeedbackEntryCard | `components/feedback/entry-card.tsx` | Not Built | No |
| FeedbackStatusBadge | `components/feedback/status-badge.tsx` | Not Built | Yes |
| FeedbackSubmitForm | `components/feedback/submit-form.tsx` | Not Built | No |
| SentimentIndicator | `components/feedback/sentiment-indicator.tsx` | Not Built | Yes |
| NpsScoreGauge | `components/feedback/nps-score-gauge.tsx` | Not Built | No |
| NpsResponsesChart | `components/feedback/nps-responses-chart.tsx` | Not Built | No |
| SurveyBuilder | `components/feedback/survey-builder.tsx` | Not Built | No |
| SurveyQuestionEditor | `components/feedback/survey-question-editor.tsx` | Not Built | No |
| SurveyResultsChart | `components/feedback/survey-results-chart.tsx` | Not Built | No |
| FeatureRequestCard | `components/feedback/feature-request-card.tsx` | Not Built | No |
| FeatureVoteButton | `components/feedback/feature-vote-button.tsx` | Not Built | Yes |
| FeatureRequestBoard | `components/feedback/feature-request-board.tsx` | Not Built | No |
| WidgetConfigForm | `components/feedback/widget-config-form.tsx` | Not Built | No |
| EmbeddableWidget | `components/feedback/embeddable-widget.tsx` | Not Built | No |

---

## 6. Hooks

No hooks built. Planned hooks:

| Hook | Endpoints Used | Status | Notes |
|------|---------------|--------|-------|
| `useFeedbackEntries` | GET `/feedback/entries` | Not Built | Paginated list with filters |
| `useFeedbackEntry` | GET `/feedback/entries/:id` | Not Built | Single entry detail |
| `useSubmitFeedback` | POST `/feedback/entries` | Not Built | Mutation |
| `useFeatureRequests` | GET `/feedback/features` | Not Built | Sorted by votes |
| `useVoteFeature` | POST `/feedback/features/:id/vote` | Not Built | Optimistic update |
| `useNpsScore` | GET `/feedback/nps/score` | Not Built | Current score |
| `useNpsResponses` | GET `/feedback/nps/responses` | Not Built | Paginated |
| `useSubmitNps` | POST `/feedback/nps/respond` | Not Built | Mutation |
| `useSurveys` | GET `/feedback/surveys` | Not Built | List |
| `useSurvey` | GET `/feedback/surveys/:id` | Not Built | Single survey |
| `useCreateSurvey` | POST `/feedback/surveys` | Not Built | Mutation |
| `useWidgetConfig` | GET `/feedback/widgets` | Not Built | Widget config |

---

## 7. Business Rules

1. **Feedback Types:** Five categories — BUG (something is broken), SUGGESTION (improvement idea), COMPLAINT (negative experience), PRAISE (positive experience), OTHER (catch-all). Hub previously claimed BUG_REPORT/FEATURE_REQUEST/GENERAL — corrected per Prisma FeedbackType enum.

2. **NPS Scoring (0-10):** Net Promoter Score uses the standard formula. Respondents scoring 0-6 are DETRACTORS, 7-8 are PASSIVES, 9-10 are PROMOTERS. NPS = %Promoters - %Detractors, yielding a score from -100 to +100. Real NPS calculation implemented in NpsScoreService with correct categorization.

3. **Sentiment Analysis:** SentimentService uses simple word-matching (14 positive keywords, 14 negative keywords). Classifies as POSITIVE, NEUTRAL, or NEGATIVE. Functional but basic — not ML-based. Tested with 4 spec tests.

4. **Survey Creation and Distribution:** Surveys are created with a title, description, and questions stored as JSON in the Survey.questions field (not a separate SurveyQuestion table). Survey responses validate required questions. Surveys support event-driven triggers via `order.completed` and `user.onboarded` event listeners.

5. **Embeddable Widgets:** Widget endpoints are behind JwtAuthGuard (not public as previously documented). Only list + create endpoints exist — no update/delete/config. Widget configuration is per-tenant.

6. **Feature Voting and Prioritization:** Feature requests support voting via VotingService (idempotent — duplicate votes ignored). Feature requests also support comments via FeatureRequestComment model. Status lifecycle: SUBMITTED → UNDER_REVIEW → PLANNED → IN_PROGRESS → COMPLETED. Also DECLINED (added vs hub).

7. **Event Architecture (undocumented until PST-28):** 5 emitted events: `feedback.submitted`, `feature.submitted`, `feature.voted`, `nps.response.submitted`, `survey.response.submitted`. 2 event listeners: `order.completed` → triggers event-based survey, `user.onboarded` → triggers event-based survey.

8. **Data Isolation:** All feedback data is tenant-scoped via tenantId. **Exception:** VotingService has no tenantId parameter — cross-tenant voting is possible (P2 bug). **Soft-delete compliance: 0/7 real services filter `deletedAt: null` — WORST of all services audited.**

---

## 8. Data Model

### FeatureRequest
```
FeatureRequest {
  id          String (UUID)
  tenantId    String (FK -> Tenant)
  userId      String (FK -> User)
  title       String
  description String (text)
  status      FeatureRequestStatus (SUBMITTED, UNDER_REVIEW, PLANNED, IN_PROGRESS, COMPLETED, DECLINED)
  voteCount   Int (default: 0, denormalized)
  votes       FeatureRequestVote[]
  comments    FeatureRequestComment[]
  createdAt   DateTime
  updatedAt   DateTime
  deletedAt   DateTime?
  ~55% field accuracy vs Prisma
}
```

### FeatureRequestVote (hub previously: FeatureVote — wrong name)
```
FeatureRequestVote {
  id              String (UUID)
  featureRequestId String (FK -> FeatureRequest)
  userId          String (FK -> User)
  createdAt       DateTime
  @@unique([featureRequestId, userId])
  ~70% field accuracy vs Prisma
}
```

### FeatureRequestComment (MISSING from previous hub)
```
FeatureRequestComment {
  10+ fields
  Comment system for feature requests
  Entirely undocumented until PST-28
}
```

### NPSResponse (hub previously: NpsResponse — wrong casing)
```
NPSResponse {
  id          String (UUID)
  tenantId    String (FK -> Tenant)
  userId      String? (FK -> User)
  score       Int (0-10)
  category    NPSCategory (PROMOTER, PASSIVE, DETRACTOR) -- derived from score
  comment     String?
  createdAt   DateTime
  ~45% field accuracy vs Prisma
}
```

### NPSSurvey (MISSING from previous hub)
```
NPSSurvey {
  19 fields
  NPS survey lifecycle model (DRAFT→ACTIVE)
  Entirely undocumented until PST-28
}
```

### Survey
```
Survey {
  id          String (UUID)
  tenantId    String (FK -> Tenant)
  createdBy   String (FK -> User)
  title       String
  description String?
  questions   Json (questions stored as JSON, NOT separate table)
  type        SurveyType (NPS, CSAT, CUSTOM, EXIT, ONBOARDING)
  responses   SurveyResponse[]
  createdAt   DateTime
  updatedAt   DateTime
  deletedAt   DateTime?
  ~40% field accuracy vs Prisma
}
```

### SurveyResponse
```
SurveyResponse {
  id          String (UUID)
  surveyId    String (FK -> Survey)
  userId      String? (FK -> User)
  answers     Json (array of { questionId, value })
  completedAt DateTime
  createdAt   DateTime
  ~50% field accuracy vs Prisma
}
```

### FeedbackWidget
```
FeedbackWidget {
  id              String (UUID)
  tenantId        String (FK -> Tenant)
  enabled         Boolean (default: true)
  createdAt       DateTime
  updatedAt       DateTime
  ~30% field accuracy vs Prisma
}
```

### Removed Phantom Models

| Model | Reason for Removal |
|-------|--------------------|
| ~~FeedbackEntry~~ | **PHANTOM** — No Prisma model exists. FeedbackEntriesService correctly throws "not supported by current schema" |
| ~~SurveyQuestion~~ | **PHANTOM** — Questions stored as JSON in Survey.questions field, not a separate table |

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `type` | IsEnum(FeedbackType) | "Invalid feedback type" |
| `score` (NPS) | IsInt, Min(0), Max(10) | "NPS score must be between 0 and 10" |
| `survey.title` | IsString, 1-200 chars | "Survey title is required" |
| `survey.questions` | IsArray, MinLength(1) | "Survey must have at least one question" |
| `featureRequest.title` | IsString, 1-200 chars | "Feature request title is required" |
| `featureRequest.description` | IsString, 1-2000 chars | "Description is required" |

---

## 10. Status States

### Feature Request Status Machine
```
SUBMITTED -> UNDER_REVIEW (admin triaging)
UNDER_REVIEW -> PLANNED (accepted for roadmap)
UNDER_REVIEW -> DECLINED (rejected, requires reason)
PLANNED -> IN_PROGRESS (development started)
IN_PROGRESS -> COMPLETED (shipped)
```

### Survey Status (plain string, NOT Prisma enum)
```
DRAFT -> ACTIVE (publish)
ACTIVE -> CLOSED (end collection)
CLOSED -> ARCHIVED (admin archives)
DRAFT -> ARCHIVED (discard without publishing)
```

### NPS Category (Derived, Not a State Machine)
```
Score 0-6  -> DETRACTOR
Score 7-8  -> PASSIVE
Score 9-10 -> PROMOTER
```

### Enums (Prisma)

| Enum | Values | Notes |
|------|--------|-------|
| FeedbackType | BUG, SUGGESTION, COMPLAINT, PRAISE, OTHER | Hub previously had BUG_REPORT/FEATURE_REQUEST/GENERAL — WRONG |
| FeatureRequestStatus | SUBMITTED, UNDER_REVIEW, PLANNED, IN_PROGRESS, COMPLETED, DECLINED | Hub missed DECLINED |
| NPSCategory | PROMOTER, PASSIVE, DETRACTOR | Matches |
| SurveyType | NPS, CSAT, CUSTOM, EXIT, ONBOARDING | Not in previous hub |

### Removed Phantom Enums

| Enum | Reason |
|------|--------|
| ~~FeedbackStatus~~ | No Prisma enum — used only in phantom FeedbackEntry |
| ~~FeedbackPriority~~ | No Prisma enum — phantom |
| ~~FeedbackSource~~ | No Prisma enum — phantom |
| ~~SentimentType~~ | No Prisma enum — used as plain string in service |
| ~~SurveyStatus~~ | No Prisma enum — plain string |
| ~~QuestionType~~ | No Prisma enum — defined in DTO only |

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| 0/7 services filter `deletedAt: null` — worst soft-delete compliance | P2 BUG | **Open** | Every query leaks soft-deleted records |
| VotingService has no tenantId — cross-tenant voting possible | P2 BUG | **Open** | Also uses hard-delete (.deleteMany) |
| 0/5 controllers have RolesGuard — any JWT user has full access | P2 SEC | **Open** | No @Roles decorators anywhere |
| FeedbackEntry model does not exist — entire entries controller is stub | P3 GAP | **Open** | Need to create Prisma model or remove stub |
| Widget endpoints not public despite embeddable use case | P3 DOC | **Open** | All behind JwtAuthGuard — decide on auth model |
| WidgetsController missing update/delete endpoints | P3 GAP | **Open** | Only list + create |
| No frontend exists — entire UI needs to be built | P3 | **Open** | Expected (P3 service) |
| ~~Sentiment analysis sub-module implementation depth unknown~~ | — | **Closed** | PST-28: SentimentService is simple word-matching (14 keywords each), tested with 4 specs |
| ~~Analytics sub-module implementation depth unknown~~ | — | **Closed** | PST-28: FeedbackAnalyticsService does GroupBy aggregation, tested with 3 specs |
| ~~Widget rate limiting may not be implemented~~ | — | **Closed** | PST-28: Widgets are behind JwtAuthGuard, rate limiting question is moot for authenticated endpoints |
| ~~No Prisma models verified in schema for feedback~~ | — | **Closed** | PST-28: 8 models verified in Prisma schema |
| ~~No email integration for NPS survey distribution~~ | — | **Closed** | PST-28: NPS uses NPSSurvey lifecycle model (DRAFT→ACTIVE), not email-based |

---

## 12. Tasks

### Backlog (P3 — Not Scheduled)

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| FB-101 | ~~Audit feedback backend — verify all 25 endpoints work~~ | — | **Done** (PST-28 tribunal) |
| FB-102 | ~~Verify/create Prisma models for feedback entities~~ | — | **Done** (PST-28: 8 models verified) |
| FB-103 | Build Feedback Dashboard page | L (6h) | P3 |
| FB-104 | Build Feedback Entries list + detail pages | L (6h) | P3 |
| FB-105 | Build Submit Feedback form (internal + widget) | M (4h) | P3 |
| FB-106 | Build NPS Dashboard with score gauge and trends | L (6h) | P3 |
| FB-107 | Build Survey Builder (create + question editor) | XL (10h) | P3 |
| FB-108 | Build Survey Results visualization | L (6h) | P3 |
| FB-109 | Build Feature Request board with voting | L (6h) | P3 |
| FB-110 | Build Widget Configuration page | M (4h) | P3 |
| FB-111 | Build embeddable widget JS snippet | L (8h) | P3 |
| FB-113 | ~~Write feedback service tests~~ | — | **Done** (PST-28: 47 tests exist) |
| FB-114 | Create all frontend hooks for feedback endpoints | M (4h) | P3 |

### New Tasks (from PST-28 tribunal findings)

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| FB-115 | Create FeedbackEntry Prisma model OR remove stub controller | M (3h) | P2 |
| FB-116 | Add `deletedAt: null` filter to all 7 service queries | M (3h) | P2 |
| FB-117 | Add tenantId to VotingService.vote() and .unvote() | S (1h) | P2 |
| FB-118 | Add @UseGuards(RolesGuard) + @Roles to all 5 controllers | M (2h) | P2 |
| FB-119 | Convert VotingService.unvote() hard-delete to soft-delete | S (1h) | P3 |
| FB-120 | Decide widget auth model: make public or keep JWT | S (1h) | P3 |
| FB-121 | Add update/delete endpoints to WidgetsController | M (2h) | P3 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Service Overview | Full 15-section | `dev_docs/12-Rabih-design-Process/28-feedback/00-service-overview.md` |
| Feedback Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/28-feedback/01-feedback-dashboard.md` |
| Feedback List | Full 15-section | `dev_docs/12-Rabih-design-Process/28-feedback/02-feedback-list.md` |
| Feedback Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/28-feedback/03-feedback-detail.md` |
| Submit Feedback | Full 15-section | `dev_docs/12-Rabih-design-Process/28-feedback/04-submit-feedback.md` |
| Surveys | Full 15-section | `dev_docs/12-Rabih-design-Process/28-feedback/05-surveys.md` |
| Survey Builder | Full 15-section | `dev_docs/12-Rabih-design-Process/28-feedback/06-survey-builder.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Backend + Frontend | Backend only | Frontend entirely missing |
| 5 controller areas planned | 5 controllers built (1 stub, 4 production) | FeedbackEntries is non-functional stub |
| Sentiment analysis | SentimentService: simple 14-keyword word matching | Functional but basic |
| Survey system | Backend endpoints exist, event-driven triggers | Survey questions stored as JSON, not separate model |
| Embeddable widgets | 2 JWT-authenticated endpoints exist | Not public — auth model needs decision |
| NPS scoring | Full lifecycle: NPSSurvey + NPSResponse + NpsScoreService | Exceeds plan (lifecycle model undocumented until PST-28) |
| Feature voting | Backend + voting + comments | Comments system entirely undocumented until PST-28 |
| ~10 screens expected | 0 screens built | Full frontend gap |
| "No tests" | 9 files / 47 tests / ~820 LOC | Hub was completely wrong |

---

## 15. Dependencies

**Depends on:**
- Auth (JWT authentication for all endpoints — no RolesGuard used)
- Tenant (all data tenant-scoped via tenantId, except VotingService)
- EventEmitter2 (5 events emitted, 2 listeners for order.completed / user.onboarded)

**Depended on by:**
- No other services currently depend on Feedback (P3 standalone service)
- Future: Analytics could consume feedback sentiment data for customer health scoring
- Future: Help Desk could link support tickets to feedback entries

**Breaking change risk:** LOW — P3 service with no downstream consumers. Backend changes are safe.

---

## 16. Code Metrics (PST-28 verified)

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

## 17. Service Implementation Quality (PST-28 verified)

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

# Service Hub: Feedback (28)

> **Priority:** P3 Future | **Status:** Backend Partial, Frontend Not Built
> **Source of Truth** -- dev_docs_v3 | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (feedback service)
> **Design specs:** `dev_docs/12-Rabih-design-Process/28-feedback/` (7 files)

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (1/10) |
| **Confidence** | High -- code confirmed via scan |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial -- 5 controllers, 25 endpoints in `apps/api/src/modules/feedback/` |
| **Frontend** | Not Built -- no pages, no components, no hooks |
| **Tests** | None |
| **Scope** | User feedback collection, NPS surveys, feature requests, embeddable widgets |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Feedback service in dev_docs |
| Design Specs | Done | 7 files, all 15-section format |
| Backend Controller | Partial | 5 controllers: entries, features, nps, surveys, widgets |
| Backend Service | Partial | 5 services + analytics/sentiment sub-modules |
| Prisma Models | Partial | FeedbackEntry, FeatureRequest, NpsResponse, Survey, Widget models |
| Frontend Pages | Not Built | 0 pages |
| React Hooks | Not Built | 0 hooks |
| Components | Not Built | 0 components |
| Tests | None | |

---

## 3. Screens

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Feedback Dashboard | `/feedback` | Not Built | Overview of all feedback, NPS score, trends |
| Feedback List | `/feedback/entries` | Not Built | Filterable list of all submitted feedback |
| Feedback Detail | `/feedback/entries/[id]` | Not Built | Single entry with status management, sentiment |
| Submit Feedback | `/feedback/submit` | Not Built | Public-facing feedback form |
| Surveys List | `/feedback/surveys` | Not Built | List of created surveys with response counts |
| Survey Builder | `/feedback/surveys/new` | Not Built | Drag-and-drop survey creation |
| Survey Detail | `/feedback/surveys/[id]` | Not Built | Survey results, response analytics |
| Feature Requests | `/feedback/features` | Not Built | Feature request board with voting |
| NPS Dashboard | `/feedback/nps` | Not Built | NPS score over time, promoter/detractor breakdown |
| Widget Configuration | `/feedback/widgets` | Not Built | Configure embeddable feedback widgets |

---

## 4. API Endpoints

### FeedbackEntriesController (`feedback/entries`)

| Method | Path | Auth | Status | Notes |
|--------|------|------|--------|-------|
| POST | `/feedback/entries` | Optional | Partial | Submit feedback (public via widget or authenticated) |
| GET | `/feedback/entries` | JWT + ADMIN | Partial | List all feedback entries (paginated) |
| GET | `/feedback/entries/:id` | JWT + ADMIN | Partial | Get single entry with sentiment data |
| PATCH | `/feedback/entries/:id/status` | JWT + ADMIN | Partial | Update entry status |

### FeaturesController (`feedback/features`)

| Method | Path | Auth | Status | Notes |
|--------|------|------|--------|-------|
| POST | `/feedback/features` | JWT | Partial | Submit feature request |
| GET | `/feedback/features` | JWT | Partial | List feature requests (sorted by votes) |
| POST | `/feedback/features/:id/vote` | JWT | Partial | Upvote a feature request |
| PATCH | `/feedback/features/:id/status` | JWT + ADMIN | Partial | Update feature request status |

### NpsController (`feedback/nps`)

| Method | Path | Auth | Status | Notes |
|--------|------|------|--------|-------|
| POST | `/feedback/nps` | Optional | Partial | Submit NPS response (0-10 score + comment) |
| GET | `/feedback/nps/score` | JWT + ADMIN | Partial | Current NPS score calculation |
| GET | `/feedback/nps/responses` | JWT + ADMIN | Partial | List all NPS responses (paginated) |
| POST | `/feedback/nps/send-survey` | JWT + ADMIN | Partial | Trigger NPS survey email to user segment |

### SurveysController (`feedback/surveys`)

| Method | Path | Auth | Status | Notes |
|--------|------|------|--------|-------|
| POST | `/feedback/surveys` | JWT + ADMIN | Partial | Create survey with questions |
| GET | `/feedback/surveys` | JWT + ADMIN | Partial | List all surveys |
| GET | `/feedback/surveys/:id` | JWT + ADMIN | Partial | Get survey with questions |
| POST | `/feedback/surveys/:id/responses` | Optional | Partial | Submit survey response |
| GET | `/feedback/surveys/:id/results` | JWT + ADMIN | Partial | Aggregated survey results |

### WidgetsController (`feedback/widgets`)

| Method | Path | Auth | Status | Notes |
|--------|------|------|--------|-------|
| GET | `/feedback/widgets/:tenantId/config` | Public | Partial | Get widget configuration for embedding |
| POST | `/feedback/widgets/:tenantId/submit` | Public | Partial | Submit feedback via embeddable widget |

**Total: 5 controllers, 25 endpoints (4 + 4 + 4 + 5 + 2 + 6 internal analytics)**

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
| `useUpdateFeedbackStatus` | PATCH `/feedback/entries/:id/status` | Not Built | Mutation |
| `useFeatureRequests` | GET `/feedback/features` | Not Built | Sorted by votes |
| `useVoteFeature` | POST `/feedback/features/:id/vote` | Not Built | Optimistic update |
| `useNpsScore` | GET `/feedback/nps/score` | Not Built | Current score |
| `useNpsResponses` | GET `/feedback/nps/responses` | Not Built | Paginated |
| `useSubmitNps` | POST `/feedback/nps` | Not Built | Mutation |
| `useSurveys` | GET `/feedback/surveys` | Not Built | List |
| `useSurvey` | GET `/feedback/surveys/:id` | Not Built | Single survey |
| `useCreateSurvey` | POST `/feedback/surveys` | Not Built | Mutation |
| `useSurveyResults` | GET `/feedback/surveys/:id/results` | Not Built | Aggregated results |
| `useWidgetConfig` | GET `/feedback/widgets/:tenantId/config` | Not Built | Public config |

---

## 7. Business Rules

1. **Feedback Types:** Three categories -- BUG_REPORT (something is broken), FEATURE_REQUEST (something is wanted), GENERAL (catch-all for comments, praise, complaints). Each type has its own required fields. Bug reports require steps to reproduce and severity. Feature requests require a title, description, and use case justification.

2. **NPS Scoring (0-10):** Net Promoter Score uses the standard formula. Respondents scoring 0-6 are DETRACTORS, 7-8 are PASSIVES, 9-10 are PROMOTERS. NPS = %Promoters - %Detractors, yielding a score from -100 to +100. NPS surveys should be sent no more than once per quarter per user to avoid survey fatigue. A minimum of 30 responses is required before displaying the NPS score to ensure statistical significance.

3. **Sentiment Analysis:** All feedback entries and NPS comments are processed through the `analytics/` and `sentiment/` sub-modules for automated sentiment scoring. Sentiment is classified as POSITIVE, NEUTRAL, or NEGATIVE with a confidence score (0.0-1.0). Sentiment data is attached to each feedback entry response. Admins can override automated sentiment classification.

4. **Survey Creation and Distribution:** Surveys are created by ADMIN users with a title, description, and ordered list of questions. Question types include: SINGLE_CHOICE, MULTIPLE_CHOICE, RATING_SCALE (1-5 or 1-10), FREE_TEXT, and YES_NO. Surveys have a status lifecycle: DRAFT -> ACTIVE -> CLOSED -> ARCHIVED. Active surveys can be distributed via email (using NPS send-survey pattern), in-app notification, or embeddable link. Each survey tracks response count and completion rate.

5. **Embeddable Widgets:** The widget system allows tenants to embed a feedback collection form on external sites (e.g., customer portals, marketing sites). Widget configuration is per-tenant and includes: allowed feedback types, custom branding (colors, logo URL), required fields, and redirect URL after submission. Widget endpoints are PUBLIC (no JWT required) but rate-limited to prevent abuse. Widget submissions are tagged with `source: WIDGET` to distinguish from internal submissions.

6. **Feature Voting and Prioritization:** Feature requests support a voting mechanism where authenticated users can upvote. Each user gets one vote per feature request (idempotent -- duplicate votes are ignored). Feature requests are sorted by vote count by default. Admins can set a status on feature requests: SUBMITTED -> UNDER_REVIEW -> PLANNED -> IN_PROGRESS -> COMPLETED -> DECLINED. Declined features require a reason visible to the requester.

7. **Feedback Entry Lifecycle:** All feedback entries follow a status machine: NEW -> ACKNOWLEDGED -> IN_PROGRESS -> RESOLVED -> CLOSED. Admins can also mark entries as SPAM or DUPLICATE. Status changes are timestamped. Entries older than 90 days in RESOLVED status are auto-closed via scheduled job.

8. **Data Isolation:** All feedback data is tenant-scoped. Widget submissions are associated with the tenant via the URL parameter (`/feedback/widgets/:tenantId/submit`). Anonymous submissions are allowed via widgets but are tagged as `anonymous: true` and cannot be followed up on unless the submitter provides an email.

---

## 8. Data Model

### FeedbackEntry
```
FeedbackEntry {
  id          String (UUID)
  tenantId    String (FK -> Tenant)
  userId      String? (FK -> User, null for anonymous)
  type        FeedbackType (BUG_REPORT, FEATURE_REQUEST, GENERAL)
  subject     String
  body        String (text)
  status      FeedbackStatus (NEW, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, CLOSED, SPAM, DUPLICATE)
  priority    FeedbackPriority? (LOW, MEDIUM, HIGH, CRITICAL)
  sentiment   SentimentType? (POSITIVE, NEUTRAL, NEGATIVE)
  sentimentScore Float? (0.0-1.0 confidence)
  source      FeedbackSource (INTERNAL, WIDGET, EMAIL, API)
  metadata    Json? (browser info, page URL, custom fields)
  email       String? (for anonymous submissions)
  createdAt   DateTime
  updatedAt   DateTime
  resolvedAt  DateTime?
  closedAt    DateTime?
}
```

### FeatureRequest
```
FeatureRequest {
  id          String (UUID)
  tenantId    String (FK -> Tenant)
  userId      String (FK -> User)
  title       String
  description String (text)
  useCase     String? (justification)
  status      FeatureStatus (SUBMITTED, UNDER_REVIEW, PLANNED, IN_PROGRESS, COMPLETED, DECLINED)
  declineReason String?
  voteCount   Int (default: 0, denormalized)
  votes       FeatureVote[]
  createdAt   DateTime
  updatedAt   DateTime
}
```

### FeatureVote
```
FeatureVote {
  id              String (UUID)
  featureRequestId String (FK -> FeatureRequest)
  userId          String (FK -> User)
  createdAt       DateTime
  @@unique([featureRequestId, userId])
}
```

### NpsResponse
```
NpsResponse {
  id          String (UUID)
  tenantId    String (FK -> Tenant)
  userId      String? (FK -> User)
  score       Int (0-10)
  category    NpsCategory (PROMOTER, PASSIVE, DETRACTOR) -- derived from score
  comment     String?
  sentiment   SentimentType?
  sentimentScore Float?
  surveyBatchId String? (which send-survey batch triggered this)
  email       String? (for non-authenticated respondents)
  createdAt   DateTime
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
  status      SurveyStatus (DRAFT, ACTIVE, CLOSED, ARCHIVED)
  questions   SurveyQuestion[]
  responses   SurveyResponse[]
  responseCount Int (default: 0, denormalized)
  startsAt    DateTime?
  endsAt      DateTime?
  createdAt   DateTime
  updatedAt   DateTime
}
```

### SurveyQuestion
```
SurveyQuestion {
  id          String (UUID)
  surveyId    String (FK -> Survey)
  text        String
  type        QuestionType (SINGLE_CHOICE, MULTIPLE_CHOICE, RATING_SCALE, FREE_TEXT, YES_NO)
  options     Json? (array of choice options, null for FREE_TEXT)
  required    Boolean (default: true)
  order       Int
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
}
```

### FeedbackWidget
```
FeedbackWidget {
  id              String (UUID)
  tenantId        String (FK -> Tenant, unique)
  enabled         Boolean (default: true)
  allowedTypes    FeedbackType[] (which feedback types are shown)
  brandColor      String? (hex color)
  logoUrl         String?
  requiredFields  String[] (e.g., ["email", "name"])
  redirectUrl     String?
  rateLimit       Int (default: 10 per minute per IP)
  createdAt       DateTime
  updatedAt       DateTime
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `type` | IsEnum(FeedbackType) | "Invalid feedback type" |
| `subject` | IsString, 1-200 chars | "Subject is required (max 200 characters)" |
| `body` | IsString, 1-5000 chars | "Feedback body is required (max 5000 characters)" |
| `score` (NPS) | IsInt, Min(0), Max(10) | "NPS score must be between 0 and 10" |
| `email` | IsEmail (optional) | "Invalid email format" |
| `survey.title` | IsString, 1-200 chars | "Survey title is required" |
| `survey.questions` | IsArray, MinLength(1) | "Survey must have at least one question" |
| `question.type` | IsEnum(QuestionType) | "Invalid question type" |
| `question.options` | Required for SINGLE_CHOICE, MULTIPLE_CHOICE | "Options are required for choice questions" |
| `featureRequest.title` | IsString, 1-200 chars | "Feature request title is required" |
| `featureRequest.description` | IsString, 1-2000 chars | "Description is required" |
| `widget.brandColor` | Matches hex pattern `/^#[0-9A-Fa-f]{6}$/` | "Invalid hex color" |
| `widget.rateLimit` | IsInt, Min(1), Max(100) | "Rate limit must be between 1 and 100" |

---

## 10. Status States

### Feedback Entry Status Machine
```
NEW -> ACKNOWLEDGED (admin reviews)
ACKNOWLEDGED -> IN_PROGRESS (admin starts work)
IN_PROGRESS -> RESOLVED (issue addressed)
RESOLVED -> CLOSED (auto after 90 days, or manual)
NEW -> SPAM (admin marks as spam)
NEW -> DUPLICATE (admin marks as duplicate, links to original)
Any -> CLOSED (admin force-close)
```

### Feature Request Status Machine
```
SUBMITTED -> UNDER_REVIEW (admin triaging)
UNDER_REVIEW -> PLANNED (accepted for roadmap)
UNDER_REVIEW -> DECLINED (rejected, requires reason)
PLANNED -> IN_PROGRESS (development started)
IN_PROGRESS -> COMPLETED (shipped)
```

### Survey Status Machine
```
DRAFT -> ACTIVE (publish)
ACTIVE -> CLOSED (end collection, manual or auto via endsAt)
CLOSED -> ARCHIVED (admin archives)
DRAFT -> ARCHIVED (discard without publishing)
```

### NPS Category (Derived, Not a State Machine)
```
Score 0-6  -> DETRACTOR
Score 7-8  -> PASSIVE
Score 9-10 -> PROMOTER
```

---

## 11. Known Issues

| Issue | Severity | File/Location | Status |
|-------|----------|---------------|--------|
| No frontend exists -- entire UI needs to be built | P3 | N/A | Expected (P3 service) |
| Sentiment analysis sub-module implementation depth unknown | P3 | `feedback/sentiment/` | Needs audit |
| Analytics sub-module implementation depth unknown | P3 | `feedback/analytics/` | Needs audit |
| Widget rate limiting may not be implemented | P3 | `feedback/widgets/` | Needs verification |
| No email integration for NPS survey distribution | P3 | `feedback/nps/` | Backend stub likely |
| No Prisma models verified in schema for feedback | P3 | `prisma/schema.prisma` | Needs verification |

---

## 12. Tasks

### Backlog (P3 -- Not Scheduled)

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| FB-101 | Audit feedback backend -- verify all 25 endpoints work | M (4h) | P3 |
| FB-102 | Verify/create Prisma models for feedback entities | M (3h) | P3 |
| FB-103 | Build Feedback Dashboard page | L (6h) | P3 |
| FB-104 | Build Feedback Entries list + detail pages | L (6h) | P3 |
| FB-105 | Build Submit Feedback form (internal + widget) | M (4h) | P3 |
| FB-106 | Build NPS Dashboard with score gauge and trends | L (6h) | P3 |
| FB-107 | Build Survey Builder (create + question editor) | XL (10h) | P3 |
| FB-108 | Build Survey Results visualization | L (6h) | P3 |
| FB-109 | Build Feature Request board with voting | L (6h) | P3 |
| FB-110 | Build Widget Configuration page | M (4h) | P3 |
| FB-111 | Build embeddable widget JS snippet | L (8h) | P3 |
| FB-112 | Implement sentiment analysis integration | L (8h) | P3 |
| FB-113 | Write feedback service tests | L (6h) | P3 |
| FB-114 | Create all frontend hooks for feedback endpoints | M (4h) | P3 |

**Total estimated effort:** ~75 hours

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
| 5 controller areas planned | 5 controllers built | On track for backend |
| Sentiment analysis | Sub-module exists, depth unknown | Needs audit |
| Survey system | Backend endpoints exist | Frontend survey builder is complex (XL effort) |
| Embeddable widgets | 2 public endpoints exist | No JS embed snippet built |
| NPS scoring | Backend endpoints exist | No email distribution verified |
| Feature voting | Backend endpoints exist | No frontend board |
| ~10 screens expected | 0 screens built | Full frontend gap |

---

## 15. Dependencies

**Depends on:**
- Auth (JWT authentication for internal endpoints, user identity for submissions)
- Email/Communication (NPS survey distribution via SendGrid)
- Tenant (widget configuration is per-tenant, all data tenant-scoped)

**Depended on by:**
- No other services currently depend on Feedback (P3 standalone service)
- Future: Analytics could consume feedback sentiment data for customer health scoring
- Future: Help Desk could link support tickets to feedback entries

**Breaking change risk:** LOW -- P3 service with no downstream consumers. Backend changes are safe.

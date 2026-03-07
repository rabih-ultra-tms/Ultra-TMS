# Feedback Module API Spec

**Module:** `apps/api/src/modules/feedback/`
**Base path:** `/api/v1/`
**Controllers:** FeedbackEntriesController, FeaturesController (feature requests), NpsController, SurveysController, WidgetsController
**Auth:** Mixed — some endpoints public (widget submissions), internal endpoints require JWT
**Scope:** P3 future — no MVP relevance. Backend implemented.

---

## FeedbackEntriesController

**Route prefix:** `feedback/entries`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/feedback/entries` | Optional | Submit feedback |
| GET | `/feedback/entries` | JWT + ADMIN | List feedback |
| GET | `/feedback/entries/:id` | JWT + ADMIN | Get entry |
| PATCH | `/feedback/entries/:id/status` | JWT + ADMIN | Update status |

---

## FeaturesController (Feature Requests)

**Route prefix:** `feedback/features`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/feedback/features` | Submit feature request |
| GET | `/feedback/features` | List feature requests |
| POST | `/feedback/features/:id/vote` | Upvote feature request |
| PATCH | `/feedback/features/:id/status` | Update status (ADMIN) |

---

## NpsController (Net Promoter Score)

**Route prefix:** `feedback/nps`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/feedback/nps` | Submit NPS response |
| GET | `/feedback/nps/score` | Current NPS score |
| GET | `/feedback/nps/responses` | List responses |
| POST | `/feedback/nps/send-survey` | Trigger NPS survey email |

---

## SurveysController

**Route prefix:** `feedback/surveys`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/feedback/surveys` | Create survey |
| GET | `/feedback/surveys` | List surveys |
| GET | `/feedback/surveys/:id` | Get survey |
| POST | `/feedback/surveys/:id/responses` | Submit survey response |
| GET | `/feedback/surveys/:id/results` | Get survey results |

---

## WidgetsController

**Route prefix:** `feedback/widgets`

Embeddable feedback widget configuration.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/feedback/widgets/:tenantId/config` | Get widget config (public) |
| POST | `/feedback/widgets/:tenantId/submit` | Submit via widget (public) |

---

## Note

The `analytics/` subdir in feedback module provides sentiment analysis on feedback entries. No separate controller — integrated into FeedbackEntriesController responses.

# Feedback Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| Survey | Customer satisfaction surveys | SurveyResponse |
| SurveyResponse | Individual survey responses | Survey |
| NPSSurvey | Net Promoter Score surveys | NPSResponse |
| NPSResponse | NPS scores and feedback | NPSSurvey |
| FeedbackWidget | Embeddable feedback widgets | |
| FeatureRequest | User feature requests | FeatureRequestComment, FeatureRequestVote |
| FeatureRequestComment | Comments on feature requests | FeatureRequest |
| FeatureRequestVote | Upvotes on feature requests | FeatureRequest |

## Survey

Configurable customer satisfaction surveys.

| Field | Type | Notes |
|-------|------|-------|
| title | String | VarChar(255) |
| description | String? | |
| surveyType | String | VarChar(50) — CSAT, CES, CUSTOM |
| questions | Json | Question definitions |
| triggerEvent | String? | VarChar(100) — LOAD_DELIVERED, etc. |
| isActive | Boolean | @default(true) |
| responseCount | Int | @default(0) |
| avgScore | Decimal? | Decimal(4,2) |

## NPSSurvey / NPSResponse

Net Promoter Score tracking.

**NPSSurvey:** title, triggerEvent, isActive, responseCount, npsScore (calculated)
**NPSResponse:** surveyId, score (0-10), feedback, respondentType, respondentId, respondentEmail

## FeatureRequest

User-submitted feature requests with voting.

| Field | Type | Notes |
|-------|------|-------|
| title | String | VarChar(500) |
| description | String | |
| submitterId | String? | |
| submitterName/Email | String? | |
| status | FeatureRequestStatus | SUBMITTED, UNDER_REVIEW, PLANNED, IN_PROGRESS, COMPLETED, DECLINED |
| voteCount | Int | @default(0) |
| implementedAt | DateTime? | |
| releaseNotes | String? | |

**Relations:** FeatureRequestComment[], FeatureRequestVote[]

## FeedbackWidget

Embeddable feedback collection widgets.

| Field | Type | Notes |
|-------|------|-------|
| name | String | VarChar(200) |
| placement | String | VarChar(50) — SIDEBAR, BOTTOM, MODAL |
| pages | Json? | Which pages to show on |
| widgetType | String | VarChar(30) — RATING, COMMENT, EMOJI |
| config | Json | Widget configuration |
| triggerRules | Json? | Display rules |
| isActive | Boolean | @default(true) |
| impressionCount/responseCount | Int | Usage stats |

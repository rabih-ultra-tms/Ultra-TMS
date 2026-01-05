# 27 - Feedback Service

| Field            | Value               |
| ---------------- | ------------------- |
| **Service ID**   | 27                  |
| **Service Name** | Feedback            |
| **Category**     | Support             |
| **Module Path**  | `@modules/feedback` |
| **Phase**        | C (SaaS)            |
| **Weeks**        | 57-58               |
| **Priority**     | P3                  |
| **Dependencies** | Auth, Communication |

---

## Purpose

Customer feedback and feature request management system for collecting NPS scores, satisfaction surveys, feature requests, and product feedback. Enables data-driven product decisions and customer success monitoring.

---

## Features

- **NPS Surveys** - Net Promoter Score collection
- **CSAT Surveys** - Customer satisfaction surveys
- **Feature Requests** - User-submitted feature ideas
- **Feedback Forms** - Contextual feedback collection
- **Voting System** - Upvote feature requests
- **Survey Builder** - Custom survey creation
- **Feedback Widgets** - Embedded feedback buttons
- **Roadmap Visibility** - Public roadmap status
- **Response Management** - Reply to feedback
- **Analytics** - Trends and insights
- **Segmentation** - Feedback by user segment
- **Integrations** - Slack, email notifications

---

## Database Schema

```sql
-- NPS Surveys
CREATE TABLE nps_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Survey Details
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Schedule
    survey_type VARCHAR(20) NOT NULL,        -- RECURRING, ONE_TIME, TRIGGERED
    frequency_days INTEGER,                  -- For recurring
    trigger_event VARCHAR(100),              -- For triggered

    -- Target
    target_audience VARCHAR(30),             -- ALL, SEGMENT, RANDOM
    target_segment JSONB,                    -- Segment criteria
    sample_percentage INTEGER DEFAULT 100,

    -- Status
    status VARCHAR(20) DEFAULT 'DRAFT',      -- DRAFT, ACTIVE, PAUSED, COMPLETED

    -- Timing
    start_date DATE,
    end_date DATE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- NPS Responses
CREATE TABLE nps_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES nps_surveys(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Respondent
    user_id UUID REFERENCES users(id),
    contact_id UUID,                         -- External contact
    respondent_email VARCHAR(255),

    -- Response
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
    category VARCHAR(20) NOT NULL,           -- PROMOTER, PASSIVE, DETRACTOR
    comment TEXT,

    -- Context
    response_channel VARCHAR(30),            -- EMAIL, IN_APP, PORTAL

    -- Follow-up
    follow_up_requested BOOLEAN DEFAULT false,
    followed_up_at TIMESTAMPTZ,
    followed_up_by UUID REFERENCES users(id),
    follow_up_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nps_responses_survey ON nps_responses(survey_id);
CREATE INDEX idx_nps_responses_tenant ON nps_responses(tenant_id, created_at DESC);
CREATE INDEX idx_nps_responses_category ON nps_responses(tenant_id, category);

-- Custom Surveys
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Survey Details
    title VARCHAR(300) NOT NULL,
    description TEXT,

    -- Configuration
    survey_type VARCHAR(30) NOT NULL,        -- CSAT, CUSTOM, EXIT, ONBOARDING
    questions JSONB NOT NULL,                -- Array of question objects

    -- Settings
    anonymous BOOLEAN DEFAULT false,
    require_all_questions BOOLEAN DEFAULT false,
    show_progress BOOLEAN DEFAULT true,
    thank_you_message TEXT,
    redirect_url VARCHAR(500),

    -- Targeting
    trigger_event VARCHAR(100),
    target_segment JSONB,

    -- Status
    status VARCHAR(20) DEFAULT 'DRAFT',

    -- Timing
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,

    -- Metrics
    sent_count INTEGER DEFAULT 0,
    response_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Survey Responses
CREATE TABLE survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Respondent
    user_id UUID REFERENCES users(id),
    respondent_email VARCHAR(255),

    -- Responses
    answers JSONB NOT NULL,                  -- {question_id: answer}

    -- Completion
    completion_percentage INTEGER DEFAULT 100,
    time_to_complete_seconds INTEGER,

    -- Context
    response_channel VARCHAR(30),
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_survey_responses_survey ON survey_responses(survey_id);

-- Feature Requests
CREATE TABLE feature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),   -- NULL for public requests

    -- Request Details
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,

    -- Submitter
    submitted_by_user_id UUID REFERENCES users(id),
    submitted_by_email VARCHAR(255),
    submitted_by_name VARCHAR(200),
    is_anonymous BOOLEAN DEFAULT false,

    -- Classification
    category VARCHAR(50),                    -- UI, INTEGRATION, REPORTING, etc.
    tags JSONB DEFAULT '[]',

    -- Status
    status VARCHAR(30) DEFAULT 'SUBMITTED',  -- SUBMITTED, UNDER_REVIEW, PLANNED, IN_PROGRESS, COMPLETED, DECLINED
    status_reason TEXT,

    -- Prioritization
    priority VARCHAR(20),                    -- CRITICAL, HIGH, MEDIUM, LOW
    effort_estimate VARCHAR(20),             -- SMALL, MEDIUM, LARGE, XL

    -- Roadmap
    roadmap_visible BOOLEAN DEFAULT false,
    roadmap_quarter VARCHAR(10),             -- Q1 2024, etc.
    release_version VARCHAR(20),

    -- Engagement
    vote_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,

    -- Internal
    internal_notes TEXT,
    assigned_to UUID REFERENCES users(id),
    related_ticket_id UUID,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feature_requests_status ON feature_requests(status);
CREATE INDEX idx_feature_requests_votes ON feature_requests(vote_count DESC);
CREATE INDEX idx_feature_requests_category ON feature_requests(category);

-- Feature Request Votes
CREATE TABLE feature_request_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES feature_requests(id),

    -- Voter
    user_id UUID REFERENCES users(id),
    voter_email VARCHAR(255),

    -- Vote (could extend to weighted voting)
    vote_weight INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(request_id, user_id)
);

-- Feature Request Comments
CREATE TABLE feature_request_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES feature_requests(id),

    -- Author
    author_type VARCHAR(20) NOT NULL,        -- USER, ADMIN
    author_user_id UUID REFERENCES users(id),
    author_name VARCHAR(200),

    -- Content
    content TEXT NOT NULL,
    is_official BOOLEAN DEFAULT false,       -- Official response

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- General Feedback
CREATE TABLE feedback_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),

    -- Feedback Details
    feedback_type VARCHAR(30) NOT NULL,      -- BUG, SUGGESTION, COMPLAINT, PRAISE, OTHER
    title VARCHAR(300),
    content TEXT NOT NULL,

    -- Context
    page_url VARCHAR(500),
    screenshot_url VARCHAR(500),
    browser_info JSONB,

    -- Submitter
    user_id UUID REFERENCES users(id),
    user_email VARCHAR(255),
    user_name VARCHAR(200),
    is_anonymous BOOLEAN DEFAULT false,

    -- Rating (optional)
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),

    -- Status
    status VARCHAR(20) DEFAULT 'NEW',        -- NEW, REVIEWED, ACTIONED, CLOSED

    -- Response
    response TEXT,
    responded_at TIMESTAMPTZ,
    responded_by UUID REFERENCES users(id),

    -- Classification
    category VARCHAR(50),
    sentiment VARCHAR(20),                   -- POSITIVE, NEUTRAL, NEGATIVE

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_tenant ON feedback_entries(tenant_id, created_at DESC);
CREATE INDEX idx_feedback_type ON feedback_entries(feedback_type);
CREATE INDEX idx_feedback_status ON feedback_entries(status);

-- Feedback Widgets
CREATE TABLE feedback_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Widget Details
    name VARCHAR(100) NOT NULL,
    widget_type VARCHAR(30) NOT NULL,        -- BUTTON, TAB, POPUP, INLINE

    -- Configuration
    config JSONB NOT NULL,                   -- Position, colors, text

    -- Targeting
    page_patterns JSONB,                     -- URL patterns to show on
    user_segments JSONB,

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

### NPS Surveys

| Method | Endpoint                                    | Description         |
| ------ | ------------------------------------------- | ------------------- |
| GET    | `/api/v1/feedback/nps/surveys`              | List NPS surveys    |
| POST   | `/api/v1/feedback/nps/surveys`              | Create survey       |
| GET    | `/api/v1/feedback/nps/surveys/:id`          | Get survey details  |
| PUT    | `/api/v1/feedback/nps/surveys/:id`          | Update survey       |
| POST   | `/api/v1/feedback/nps/surveys/:id/activate` | Activate survey     |
| POST   | `/api/v1/feedback/nps/surveys/:id/pause`    | Pause survey        |
| POST   | `/api/v1/feedback/nps/respond`              | Submit NPS response |
| GET    | `/api/v1/feedback/nps/responses`            | List responses      |
| GET    | `/api/v1/feedback/nps/score`                | Get NPS score       |

### Custom Surveys

| Method | Endpoint                                 | Description       |
| ------ | ---------------------------------------- | ----------------- |
| GET    | `/api/v1/feedback/surveys`               | List surveys      |
| POST   | `/api/v1/feedback/surveys`               | Create survey     |
| GET    | `/api/v1/feedback/surveys/:id`           | Get survey        |
| PUT    | `/api/v1/feedback/surveys/:id`           | Update survey     |
| DELETE | `/api/v1/feedback/surveys/:id`           | Delete survey     |
| GET    | `/api/v1/feedback/surveys/:id/public`    | Get public survey |
| POST   | `/api/v1/feedback/surveys/:id/respond`   | Submit response   |
| GET    | `/api/v1/feedback/surveys/:id/responses` | List responses    |
| GET    | `/api/v1/feedback/surveys/:id/analytics` | Survey analytics  |

### Feature Requests

| Method | Endpoint                                | Description           |
| ------ | --------------------------------------- | --------------------- |
| GET    | `/api/v1/feedback/features`             | List feature requests |
| POST   | `/api/v1/feedback/features`             | Submit request        |
| GET    | `/api/v1/feedback/features/:id`         | Get request details   |
| PUT    | `/api/v1/feedback/features/:id`         | Update request        |
| POST   | `/api/v1/feedback/features/:id/vote`    | Vote for request      |
| DELETE | `/api/v1/feedback/features/:id/vote`    | Remove vote           |
| POST   | `/api/v1/feedback/features/:id/comment` | Add comment           |
| PUT    | `/api/v1/feedback/features/:id/status`  | Change status         |
| GET    | `/api/v1/feedback/features/roadmap`     | Public roadmap        |

### General Feedback

| Method | Endpoint                               | Description         |
| ------ | -------------------------------------- | ------------------- |
| GET    | `/api/v1/feedback/entries`             | List feedback       |
| POST   | `/api/v1/feedback/entries`             | Submit feedback     |
| GET    | `/api/v1/feedback/entries/:id`         | Get feedback        |
| PUT    | `/api/v1/feedback/entries/:id`         | Update feedback     |
| POST   | `/api/v1/feedback/entries/:id/respond` | Respond to feedback |

### Widgets

| Method | Endpoint                          | Description              |
| ------ | --------------------------------- | ------------------------ |
| GET    | `/api/v1/feedback/widgets`        | List widgets             |
| POST   | `/api/v1/feedback/widgets`        | Create widget            |
| PUT    | `/api/v1/feedback/widgets/:id`    | Update widget            |
| GET    | `/api/v1/feedback/widgets/config` | Get active widget config |

### Analytics

| Method | Endpoint                               | Description           |
| ------ | -------------------------------------- | --------------------- |
| GET    | `/api/v1/feedback/analytics/nps`       | NPS trends            |
| GET    | `/api/v1/feedback/analytics/csat`      | CSAT trends           |
| GET    | `/api/v1/feedback/analytics/sentiment` | Sentiment analysis    |
| GET    | `/api/v1/feedback/analytics/features`  | Feature request stats |

---

## Events

### Published Events

| Event                      | Trigger           | Payload          |
| -------------------------- | ----------------- | ---------------- |
| `nps.response_received`    | NPS submitted     | Response details |
| `nps.detractor_identified` | Score 0-6         | Respondent info  |
| `survey.response_received` | Survey completed  | Response         |
| `feature.submitted`        | Request created   | Request details  |
| `feature.voted`            | Vote added        | Request, voter   |
| `feature.status_changed`   | Status updated    | Request, status  |
| `feedback.submitted`       | Feedback received | Feedback details |

### Subscribed Events

| Event                      | Action                 |
| -------------------------- | ---------------------- |
| `order.delivered`          | Trigger CSAT survey    |
| `user.onboarding_complete` | Send onboarding survey |
| `subscription.cancelled`   | Send exit survey       |

---

## Business Rules

### NPS

1. **Score Categories**: 0-6 Detractor, 7-8 Passive, 9-10 Promoter
2. **NPS Calculation**: %Promoters - %Detractors
3. **Survey Frequency**: No more than once per 90 days per user
4. **Detractor Alert**: Notify team on detractor scores
5. **Follow-Up**: Track follow-up on low scores

### Feature Requests

1. **Duplicate Detection**: Suggest similar existing requests
2. **Vote Weight**: Could weight by customer tier
3. **Status Transitions**: Submitted â†’ Review â†’ Planned â†’ Progress â†’ Done
4. **Roadmap Visibility**: Manual toggle for public roadmap
5. **Merge Requests**: Combine duplicates, sum votes

### Surveys

1. **Question Types**: Rating, Multiple Choice, Text, NPS, Matrix
2. **Skip Logic**: Conditional question flow
3. **Response Limit**: One response per user per survey
4. **Partial Saves**: Allow incomplete submissions

### Feedback

1. **Auto-Categorize**: ML-based sentiment and category
2. **Priority**: Based on user tier and sentiment
3. **Response SLA**: 24-48 hours for negative feedback

---

## Screens

| Screen              | Description              |
| ------------------- | ------------------------ |
| NPS Dashboard       | NPS score and trends     |
| NPS Responses       | View all NPS responses   |
| Survey Builder      | Create custom surveys    |
| Survey Results      | View survey responses    |
| Feature Requests    | List and manage requests |
| Feature Detail      | Individual request view  |
| Public Roadmap      | Customer-facing roadmap  |
| Feedback Inbox      | All feedback entries     |
| Widget Config       | Manage feedback widgets  |
| Analytics Dashboard | Overall feedback metrics |

---

## Configuration

### Environment Variables

```bash
# NPS
NPS_SURVEY_COOLDOWN_DAYS=90
NPS_DETRACTOR_ALERT_ENABLED=true

# Surveys
SURVEY_MAX_QUESTIONS=50
SURVEY_PARTIAL_SAVE_ENABLED=true

# Feature Requests
FEATURE_DUPLICATE_THRESHOLD=0.8
FEATURE_VOTING_ENABLED=true

# Feedback
FEEDBACK_SENTIMENT_ANALYSIS_ENABLED=true
FEEDBACK_RESPONSE_SLA_HOURS=48

# Widgets
WIDGET_DEFAULT_POSITION=bottom-right
```

---

## Testing Checklist

### Unit Tests

- [ ] NPS score calculation
- [ ] Survey question validation
- [ ] Vote counting
- [ ] Sentiment classification
- [ ] Duplicate detection

### Integration Tests

- [ ] Survey response flow
- [ ] Feature request voting
- [ ] Widget rendering
- [ ] Email survey delivery

### E2E Tests

- [ ] Complete NPS flow
- [ ] Custom survey creation and response
- [ ] Feature request lifecycle
- [ ] Feedback submission and response

---

## Navigation

- **Previous:** [26 - Help Desk](../26-help-desk/README.md)
- **Next:** [28 - EDI](../28-edi/README.md)
- **Index:** [All Services](../README.md)

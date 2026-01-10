# 24 - Feedback Service API Implementation

> **Service:** Feedback  
> **Priority:** P3 - Low  
> **Endpoints:** 25  
> **Dependencies:** Auth ✅, Communication ✅  
> **Doc Reference:** [34-service-feedback.md](../../02-services/34-service-feedback.md)

---

## 📋 Overview

Customer feedback and feature request management system for collecting NPS scores, satisfaction surveys, feature requests, and product feedback. Enables data-driven product decisions and customer success monitoring.

### Key Capabilities
- NPS surveys and scoring
- Custom surveys (CSAT, etc.)
- Feature request voting
- General feedback collection
- Feedback widgets
- Analytics and trends

---

## ✅ Pre-Implementation Checklist

- [ ] Auth and Communication services operational
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### NpsSurvey Model
```prisma
model NpsSurvey {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  description       String?           @db.Text
  
  surveyType        String            // RECURRING, ONE_TIME, TRIGGERED
  frequencyDays     Int?
  triggerEvent      String?
  
  targetAudience    String?           // ALL, SEGMENT, RANDOM
  targetSegment     Json?
  samplePercentage  Int               @default(100)
  
  status            String            @default("DRAFT")  // DRAFT, ACTIVE, PAUSED, COMPLETED
  
  startDate         DateTime?         @db.Date
  endDate           DateTime?         @db.Date
  
  createdBy         String?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  responses         NpsResponse[]
}
```

### NpsResponse Model
```prisma
model NpsResponse {
  id                String            @id @default(cuid())
  surveyId          String
  tenantId          String
  
  userId            String?
  contactId         String?
  respondentEmail   String?
  
  score             Int               // 0-10
  category          String            // PROMOTER, PASSIVE, DETRACTOR
  comment           String?           @db.Text
  
  responseChannel   String?           // EMAIL, IN_APP, PORTAL
  
  followUpRequested Boolean           @default(false)
  followedUpAt      DateTime?
  followedUpBy      String?
  followUpNotes     String?           @db.Text
  
  createdAt         DateTime          @default(now())
  
  survey            NpsSurvey         @relation(fields: [surveyId], references: [id])
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  @@index([surveyId])
  @@index([tenantId, createdAt])
  @@index([tenantId, category])
}
```

### Survey Model
```prisma
model Survey {
  id                String            @id @default(cuid())
  tenantId          String
  
  title             String
  description       String?           @db.Text
  
  surveyType        String            // CSAT, CUSTOM, EXIT, ONBOARDING
  questions         Json              // Array of question objects
  
  anonymous         Boolean           @default(false)
  requireAllQuestions Boolean         @default(false)
  showProgress      Boolean           @default(true)
  thankYouMessage   String?           @db.Text
  redirectUrl       String?
  
  triggerEvent      String?
  targetSegment     Json?
  
  status            String            @default("DRAFT")
  
  startDate         DateTime?
  endDate           DateTime?
  
  sentCount         Int               @default(0)
  responseCount     Int               @default(0)
  
  createdBy         String?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  responses         SurveyResponse[]
}
```

### SurveyResponse Model
```prisma
model SurveyResponse {
  id                String            @id @default(cuid())
  surveyId          String
  tenantId          String
  
  userId            String?
  respondentEmail   String?
  
  answers           Json              // {questionId: answer}
  
  completionPercentage Int            @default(100)
  timeToCompleteSeconds Int?
  
  responseChannel   String?
  userAgent         String?           @db.Text
  
  createdAt         DateTime          @default(now())
  
  survey            Survey            @relation(fields: [surveyId], references: [id])
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  @@index([surveyId])
}
```

### FeatureRequest Model
```prisma
model FeatureRequest {
  id                String            @id @default(cuid())
  tenantId          String?           // NULL for public requests
  
  title             String
  description       String            @db.Text
  
  submittedByUserId String?
  submittedByEmail  String?
  submittedByName   String?
  isAnonymous       Boolean           @default(false)
  
  category          String?
  tags              Json              @default("[]")
  
  status            String            @default("SUBMITTED")
  statusReason      String?           @db.Text
  
  priority          String?
  effortEstimate    String?           // SMALL, MEDIUM, LARGE, XL
  
  roadmapVisible    Boolean           @default(false)
  roadmapQuarter    String?
  releaseVersion    String?
  
  voteCount         Int               @default(0)
  commentCount      Int               @default(0)
  
  internalNotes     String?           @db.Text
  assignedTo        String?
  relatedTicketId   String?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant?           @relation(fields: [tenantId], references: [id])
  votes             FeatureRequestVote[]
  comments          FeatureRequestComment[]
  
  @@index([status])
  @@index([voteCount])
  @@index([category])
}
```

### FeatureRequestVote Model
```prisma
model FeatureRequestVote {
  id                String            @id @default(cuid())
  requestId         String
  
  userId            String?
  voterEmail        String?
  
  voteWeight        Int               @default(1)
  
  createdAt         DateTime          @default(now())
  
  request           FeatureRequest    @relation(fields: [requestId], references: [id])
  
  @@unique([requestId, userId])
}
```

### FeatureRequestComment Model
```prisma
model FeatureRequestComment {
  id                String            @id @default(cuid())
  requestId         String
  
  authorType        String            // USER, ADMIN
  authorUserId      String?
  authorName        String?
  
  content           String            @db.Text
  isOfficial        Boolean           @default(false)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  request           FeatureRequest    @relation(fields: [requestId], references: [id])
}
```

### FeedbackEntry Model
```prisma
model FeedbackEntry {
  id                String            @id @default(cuid())
  tenantId          String?
  
  feedbackType      String            // BUG, SUGGESTION, COMPLAINT, PRAISE, OTHER
  title             String?
  content           String            @db.Text
  
  pageUrl           String?
  screenshotUrl     String?
  browserInfo       Json?
  
  userId            String?
  userEmail         String?
  userName          String?
  isAnonymous       Boolean           @default(false)
  
  rating            Int?              // 1-5
  
  status            String            @default("NEW")  // NEW, REVIEWED, ACTIONED, CLOSED
  
  response          String?           @db.Text
  respondedAt       DateTime?
  respondedBy       String?
  
  category          String?
  sentiment         String?           // POSITIVE, NEUTRAL, NEGATIVE
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant?           @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId, createdAt])
  @@index([feedbackType])
  @@index([status])
}
```

### FeedbackWidget Model
```prisma
model FeedbackWidget {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  widgetType        String            // BUTTON, TAB, POPUP, INLINE
  
  config            Json              // Position, colors, text
  
  pagePatterns      Json?             // URL patterns
  userSegments      Json?
  
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
}
```

---

## 🛠️ API Endpoints

### NPS Surveys (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/feedback/nps/surveys` | List NPS surveys |
| POST | `/api/v1/feedback/nps/surveys` | Create survey |
| GET | `/api/v1/feedback/nps/surveys/:id` | Get survey |
| PUT | `/api/v1/feedback/nps/surveys/:id` | Update survey |
| POST | `/api/v1/feedback/nps/surveys/:id/activate` | Activate |
| POST | `/api/v1/feedback/nps/respond` | Submit response |

### NPS Analytics (2 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/feedback/nps/responses` | List responses |
| GET | `/api/v1/feedback/nps/score` | Get NPS score |

### Custom Surveys (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/feedback/surveys` | List surveys |
| POST | `/api/v1/feedback/surveys` | Create survey |
| GET | `/api/v1/feedback/surveys/:id` | Get survey |
| PUT | `/api/v1/feedback/surveys/:id` | Update survey |
| POST | `/api/v1/feedback/surveys/:id/respond` | Submit response |

### Feature Requests (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/feedback/features` | List requests |
| POST | `/api/v1/feedback/features` | Submit request |
| GET | `/api/v1/feedback/features/:id` | Get request |
| PUT | `/api/v1/feedback/features/:id` | Update request |
| POST | `/api/v1/feedback/features/:id/vote` | Vote |
| POST | `/api/v1/feedback/features/:id/comment` | Add comment |

### General Feedback (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/feedback/entries` | List feedback |
| POST | `/api/v1/feedback/entries` | Submit feedback |
| GET | `/api/v1/feedback/entries/:id` | Get feedback |
| POST | `/api/v1/feedback/entries/:id/respond` | Respond |

### Widgets (2 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/feedback/widgets` | List widgets |
| POST | `/api/v1/feedback/widgets` | Create widget |

---

## 📝 DTO Specifications

### CreateNpsSurveyDto
```typescript
export class CreateNpsSurveyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['RECURRING', 'ONE_TIME', 'TRIGGERED'])
  surveyType: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ValidateIf((o) => o.surveyType === 'RECURRING')
  frequencyDays?: number;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.surveyType === 'TRIGGERED')
  triggerEvent?: string;

  @IsOptional()
  @IsIn(['ALL', 'SEGMENT', 'RANDOM'])
  targetAudience?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  samplePercentage?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
```

### SubmitNpsResponseDto
```typescript
export class SubmitNpsResponseDto {
  @IsString()
  surveyId: string;

  @IsInt()
  @Min(0)
  @Max(10)
  score: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsBoolean()
  followUpRequested?: boolean;
}
```

### CreateSurveyDto
```typescript
export class CreateSurveyDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['CSAT', 'CUSTOM', 'EXIT', 'ONBOARDING'])
  surveyType: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SurveyQuestionDto)
  questions: SurveyQuestionDto[];

  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;

  @IsOptional()
  @IsBoolean()
  requireAllQuestions?: boolean;

  @IsOptional()
  @IsString()
  thankYouMessage?: string;
}

export class SurveyQuestionDto {
  @IsString()
  id: string;

  @IsIn(['TEXT', 'RATING', 'CHOICE', 'MULTIPLE_CHOICE', 'SCALE'])
  type: string;

  @IsString()
  question: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsArray()
  options?: string[];
}
```

### SubmitFeatureRequestDto
```typescript
export class SubmitFeatureRequestDto {
  @IsString()
  @MaxLength(300)
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
```

### SubmitFeedbackDto
```typescript
export class SubmitFeedbackDto {
  @IsIn(['BUG', 'SUGGESTION', 'COMPLAINT', 'PRAISE', 'OTHER'])
  feedbackType: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  pageUrl?: string;

  @IsOptional()
  @IsString()
  screenshotUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
```

---

## 📋 Business Rules

### NPS Score Calculation
```typescript
class NpsService {
  async calculateNpsScore(surveyId: string): Promise<NpsScoreResult> {
    const responses = await this.getResponses(surveyId);
    
    const total = responses.length;
    if (total === 0) return { score: null, responses: 0 };
    
    const promoters = responses.filter(r => r.score >= 9).length;
    const detractors = responses.filter(r => r.score <= 6).length;
    
    const score = ((promoters - detractors) / total) * 100;
    
    return {
      score: Math.round(score),
      responses: total,
      promoters,
      passives: total - promoters - detractors,
      detractors,
      promoterPercentage: (promoters / total) * 100,
      detractorPercentage: (detractors / total) * 100
    };
  }
  
  categorizeScore(score: number): 'PROMOTER' | 'PASSIVE' | 'DETRACTOR' {
    if (score >= 9) return 'PROMOTER';
    if (score >= 7) return 'PASSIVE';
    return 'DETRACTOR';
  }
}
```

### Feature Request Voting
```typescript
class FeatureRequestService {
  async vote(requestId: string, userId: string): Promise<void> {
    const existing = await this.prisma.featureRequestVote.findUnique({
      where: { requestId_userId: { requestId, userId } }
    });
    
    if (existing) {
      throw new ConflictException('Already voted');
    }
    
    await this.prisma.$transaction([
      this.prisma.featureRequestVote.create({
        data: { requestId, userId }
      }),
      this.prisma.featureRequest.update({
        where: { id: requestId },
        data: { voteCount: { increment: 1 } }
      })
    ]);
  }
  
  async unvote(requestId: string, userId: string): Promise<void> {
    const deleted = await this.prisma.featureRequestVote.deleteMany({
      where: { requestId, userId }
    });
    
    if (deleted.count > 0) {
      await this.prisma.featureRequest.update({
        where: { id: requestId },
        data: { voteCount: { decrement: 1 } }
      });
    }
  }
}
```

### Sentiment Analysis (Simple)
```typescript
class SentimentService {
  private positiveWords = ['great', 'excellent', 'love', 'amazing', 'helpful'];
  private negativeWords = ['bad', 'terrible', 'hate', 'awful', 'frustrating'];
  
  analyze(text: string): 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' {
    const words = text.toLowerCase().split(/\s+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (this.positiveWords.includes(word)) positiveCount++;
      if (this.negativeWords.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'POSITIVE';
    if (negativeCount > positiveCount) return 'NEGATIVE';
    return 'NEUTRAL';
  }
}
```

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `nps.response.submitted` | NPS submitted | `{ surveyId, score, category }` |
| `survey.response.submitted` | Survey completed | `{ surveyId, responseId }` |
| `feature.submitted` | Request submitted | `{ requestId }` |
| `feature.voted` | Vote added | `{ requestId, voteCount }` |
| `feedback.submitted` | Feedback submitted | `{ entryId, type }` |

---

## 🔔 Events to Subscribe

| Event | Source | Action |
|-------|--------|--------|
| `order.completed` | TMS Core | Trigger CSAT survey |
| `user.onboarded` | Auth | Trigger onboarding survey |

---

## 🧪 Integration Test Requirements

```typescript
describe('Feedback Service API', () => {
  describe('NPS', () => {
    it('should create NPS survey');
    it('should submit NPS response');
    it('should calculate NPS score');
    it('should categorize responses');
  });

  describe('Custom Surveys', () => {
    it('should create survey with questions');
    it('should submit survey response');
    it('should validate required questions');
  });

  describe('Feature Requests', () => {
    it('should submit feature request');
    it('should vote for request');
    it('should prevent duplicate votes');
    it('should add comment');
  });

  describe('General Feedback', () => {
    it('should submit feedback');
    it('should respond to feedback');
    it('should analyze sentiment');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/feedback/
├── feedback.module.ts
├── nps/
│   ├── nps.controller.ts
│   ├── nps-surveys.service.ts
│   └── nps-score.service.ts
├── surveys/
│   ├── surveys.controller.ts
│   └── surveys.service.ts
├── features/
│   ├── features.controller.ts
│   ├── features.service.ts
│   └── voting.service.ts
├── entries/
│   ├── feedback-entries.controller.ts
│   └── feedback-entries.service.ts
├── widgets/
│   ├── widgets.controller.ts
│   └── widgets.service.ts
├── analytics/
│   └── feedback-analytics.service.ts
└── sentiment/
    └── sentiment.service.ts
```

---

## ✅ Completion Checklist

- [ ] All 25 endpoints implemented
- [ ] NPS survey CRUD and responses
- [ ] NPS score calculation
- [ ] Custom surveys with questions
- [ ] Feature request voting
- [ ] Feature request comments
- [ ] General feedback
- [ ] Feedback widgets
- [ ] All integration tests passing
- [ ] Analytics endpoints

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>37</td>
    <td>Feedback</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>25/25</td>
    <td>4/4</td>
    <td>100%</td>
    <td>NPS, Surveys, Features, Entries</td>
</tr>
```

---

## 🎉 Phase A API Implementation Complete!

Congratulations! You have completed all Phase A API implementation prompts. 

### Summary of Completed Services

| # | Service | Endpoints | Status |
|---|---------|-----------|--------|
| 01 | TMS Core | 75 | ✅ |
| 02 | Carrier | 50 | ✅ |
| 03 | Credit | 30 | ✅ |
| 04 | Claims | 35 | ✅ |
| 05 | Customer Portal | 30 | ✅ |
| 06 | Carrier Portal | 30 | ✅ |
| 07 | Contracts | 25 | ✅ |
| 08 | Agent | 30 | ✅ |
| 09 | Factoring Internal | 30 | ✅ |
| 10 | EDI | 35 | ✅ |
| 11 | Safety | 40 | ✅ |
| 12 | Load Board External | 35 | ✅ |
| 13 | Rate Intelligence | 25 | ✅ |
| 14 | Analytics | 45 | ✅ |
| 15 | Workflow | 35 | ✅ |
| 16 | Integration Hub | 40 | ✅ |
| 17 | Search | 25 | ✅ |
| 18 | Audit | 25 | ✅ |
| 19 | Config | 30 | ✅ |
| 20 | Scheduler | 25 | ✅ |
| 21 | Cache | 20 | ✅ |
| 22 | HR | 35 | ✅ |
| 23 | Help Desk | 30 | ✅ |
| 24 | Feedback | 25 | ✅ |
| **Total** | | **~820** | ✅ |

### Next Steps

1. Update `progress-tracker.html` with all completed services
2. Run full integration test suite
3. Update API documentation
4. Begin Phase B planning

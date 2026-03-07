# Help Desk Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| SupportTicket | Support ticket management | TicketReply, SupportTeam |
| TicketReply | Ticket replies/messages | SupportTicket |
| SupportTeam | Support team definitions | SupportTeamMember |
| SupportTeamMember | Team membership | SupportTeam |
| KBArticle | Knowledge base articles | |
| CannedResponse | Pre-written response templates | |
| SlaPolicy | SLA policy definitions | |
| EscalationRule | Ticket escalation rules | |

## SupportTicket

Customer/internal support tickets.

| Field | Type | Notes |
|-------|------|-------|
| ticketNumber | String | VarChar(50) |
| subject | String | VarChar(500) |
| description | String | |
| category | String? | VarChar(100) |
| priority | String | VarChar(20) — LOW, MEDIUM, HIGH, URGENT |
| status | String | @default("OPEN") — OPEN, IN_PROGRESS, WAITING, RESOLVED, CLOSED |
| submitterType | String | VarChar(50) — USER, CUSTOMER, CARRIER |
| submitterId | String? | |
| submitterEmail | String? | |
| assignedTeamId | String? | FK to SupportTeam |
| assignedUserId | String? | FK to User |
| firstResponseAt | DateTime? | |
| resolvedAt | DateTime? | |
| closedAt | DateTime? | |
| satisfactionScore | Int? | 1-5 |
| tags | String[] | |

**Relations:** TicketReply[]

## TicketReply

Messages/replies on support tickets.

| Field | Type | Notes |
|-------|------|-------|
| ticketId | String | FK to SupportTicket |
| authorType | String | VarChar(50) — AGENT, CUSTOMER, SYSTEM |
| authorId | String? | |
| authorName | String | VarChar(255) |
| content | String | |
| isInternal | Boolean | @default(false) — internal notes |
| attachments | Json? | |

## KBArticle

Knowledge base for self-service support.

| Field | Type | Notes |
|-------|------|-------|
| title | String | VarChar(500) |
| content | String | Rich text/markdown |
| summary | String? | VarChar(1000) |
| categoryId | String? | |
| slug | String | VarChar(500) — URL slug |
| keywords | String? | For search |
| isPublished | Boolean | @default(false) |
| publishedAt | DateTime? | |
| viewCount/helpfulCount/unhelpfulCount | Int | Engagement |

**Unique:** `[tenantId, slug]`

## SlaPolicy

SLA policy definitions for ticket response times.

| Field | Type | Notes |
|-------|------|-------|
| name | String | VarChar(100) |
| description | String? | |
| priority | String | VarChar(20) — maps to ticket priority |
| firstResponseMinutes | Int | |
| resolutionMinutes | Int | |
| businessHoursOnly | Boolean | @default(true) |
| isActive | Boolean | @default(true) |
| escalationEnabled | Boolean | @default(true) |

## CannedResponse

Pre-written response templates.

| Field | Type | Notes |
|-------|------|-------|
| title | String | VarChar(200) |
| content | String | Template body |
| category | String? | VarChar(100) |
| useCount | Int | @default(0) |
| isPublic | Boolean | @default(false) — shared vs personal |
| ownerId | String? | FK to User |
| isActive | Boolean | @default(true) |

# Search Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| SavedSearch | User-saved search queries | |
| SearchIndex | Elasticsearch index configuration | |
| SearchHistory | User search history | |
| SearchIndexQueue | Indexing queue for async processing | |
| SearchSuggestion | Autocomplete suggestions | |
| SearchSynonym | Search synonym mappings | |

## SavedSearch

User-saved search queries for quick reuse.

| Field | Type | Notes |
|-------|------|-------|
| userId | String | FK to User |
| name | String | VarChar(255) |
| entityType | String | VarChar(50) — LOAD, ORDER, CARRIER, etc. |
| searchCriteria | Json | Search parameters |
| isDefault | Boolean | @default(false) |
| isShared | Boolean | @default(false) |
| useCount | Int | @default(0) |

## SearchIndex

Elasticsearch index configuration and sync status.

| Field | Type | Notes |
|-------|------|-------|
| indexName | String | VarChar(100) |
| entityType | String | VarChar(50) |
| fieldMappings | Json | ES field mapping config |
| lastFullSyncAt | DateTime? | |
| lastIncrementalSyncAt | DateTime? | |
| documentCount | Int | @default(0) |
| status | String | VarChar(50) — ACTIVE, REBUILDING, ERROR |
| syncFrequency | String? | VarChar(50) |

## SearchIndexQueue

Async indexing queue for Elasticsearch updates.

| Field | Type | Notes |
|-------|------|-------|
| entityType | String | VarChar(50) |
| entityId | String | |
| action | String | VarChar(20) — INDEX, UPDATE, DELETE |
| priority | Int | @default(5) |
| status | String | VarChar(20) — PENDING, PROCESSING, COMPLETED, FAILED |
| processedAt | DateTime? | |
| errorMessage | String? | |
| retryCount | Int | @default(0) |

## SearchSuggestion / SearchSynonym

**SearchSuggestion:** entityType, suggestionText, weight, category, isActive
**SearchSynonym:** sourceTerms, targetTerms, synonymType (ONE_WAY, TWO_WAY), isActive

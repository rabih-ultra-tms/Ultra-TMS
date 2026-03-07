# PERF-006: Database Query Optimization (Add Missing Indexes)

**Priority:** P1
**Service:** Backend Infrastructure
**Scope:** Identify and add missing database indexes for common query patterns

## Current State
260 Prisma models with 31 migrations. Index coverage unknown. Common queries filter by tenantId, status, deletedAt, createdAt, and various foreign keys. Missing indexes would cause full table scans.

## Requirements
- Analyze slow query log to identify missing indexes
- Ensure composite indexes for common filter combinations (tenantId + status + deletedAt)
- Add indexes for frequently sorted columns
- Add indexes for foreign key columns used in JOINs
- Test query performance before and after
- Create Prisma migration for new indexes

## Acceptance Criteria
- [ ] Slow queries identified via EXPLAIN ANALYZE
- [ ] Composite indexes added for common filters
- [ ] Foreign key indexes verified
- [ ] Sort column indexes added
- [ ] Query performance improvement measured
- [ ] Prisma migration created and tested

## Dependencies
- Database with representative data volume

## Estimated Effort
M

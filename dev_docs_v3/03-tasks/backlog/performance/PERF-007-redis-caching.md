# PERF-007: Redis Caching for Frequently Accessed Data

**Priority:** P2
**Service:** Backend Infrastructure
**Scope:** Implement Redis caching layer for hot data

## Current State
Redis is available in the stack but caching strategy is not implemented for API responses.

## Requirements
- Cache carrier list responses (high read, low write)
- Cache load stats/dashboard data
- Cache user session data
- Implement cache invalidation on writes
- Configurable TTL per cache key
- Cache warming on startup

## Acceptance Criteria
- [ ] Redis caching decorator or service created
- [ ] Carrier list cached with TTL
- [ ] Stats/dashboard data cached
- [ ] Cache invalidated on relevant writes
- [ ] Cache hit/miss metrics logged
- [ ] API response time improvement measured

## Dependencies
- Redis connection already configured

## Estimated Effort
M

# INFRA-004: Redis Cluster Configuration

**Priority:** P2
**Service:** Infrastructure
**Scope:** Production Redis cluster for caching and session management

## Current State
Single Redis 7 instance in Docker for development. Used for caching and potentially WebSocket adapter.

## Requirements
- Redis Sentinel or Cluster for high availability
- Separate Redis instances for cache vs sessions
- Connection pooling configuration
- Memory limits and eviction policies
- Monitoring and metrics

## Acceptance Criteria
- [ ] Redis HA configuration (Sentinel or Cluster)
- [ ] Cache and session separation
- [ ] Eviction policies configured
- [ ] Connection pooling optimized
- [ ] Monitoring dashboard

## Dependencies
- INFRA-002 (Docker production setup)

## Estimated Effort
M

# INFRA-005: Elasticsearch Index Management

**Priority:** P2
**Service:** Infrastructure
**Scope:** Elasticsearch index lifecycle and optimization

## Current State
Elasticsearch 8.13 runs in Docker for development. Index mappings and lifecycle policies not configured for production use.

## Requirements
- Define index mappings for searchable entities (loads, carriers, orders)
- Index lifecycle management (ILM) policies
- Index aliases for zero-downtime reindexing
- Search template optimization
- Monitoring and alerting on cluster health

## Acceptance Criteria
- [ ] Index mappings defined for MVP entities
- [ ] ILM policies configured (hot/warm/cold)
- [ ] Index aliases set up
- [ ] Search performance tested
- [ ] Cluster health monitoring

## Dependencies
- INFRA-002 (Docker production setup)

## Estimated Effort
M

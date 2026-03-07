# INFRA-006: Monitoring and Alerting Setup

**Priority:** P1
**Service:** Infrastructure
**Scope:** Health endpoints, monitoring dashboards, and alerting

## Current State
No health check endpoints or monitoring infrastructure. No alerting for downtime or errors.

## Requirements
- Health check endpoint on API (/health) returning service status
- Database connectivity check
- Redis connectivity check
- Elasticsearch connectivity check
- Uptime monitoring (external)
- Error rate alerting
- Response time alerting
- Disk/memory usage alerting

## Acceptance Criteria
- [ ] /health endpoint returns status of all dependencies
- [ ] /health/ready for readiness probe
- [ ] /health/live for liveness probe
- [ ] External uptime monitoring configured
- [ ] Alert channels set up (email, Slack)
- [ ] Dashboard for key metrics

## Dependencies
- None

## Estimated Effort
M

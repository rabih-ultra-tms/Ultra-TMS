# INFRA-007: Log Aggregation Pipeline

**Priority:** P2
**Service:** Infrastructure
**Scope:** Centralized logging for all services

## Current State
Logs go to stdout/stderr. Kibana is available in Docker but not configured for application logs. No structured logging format.

## Requirements
- Structured JSON logging in API (NestJS Logger)
- Request/response logging middleware
- Error logging with stack traces
- Log shipping to Elasticsearch via Filebeat or Fluentd
- Kibana dashboards for log analysis
- Log retention policies

## Acceptance Criteria
- [ ] Structured JSON logging in API
- [ ] Request ID correlation across services
- [ ] Log shipping to Elasticsearch
- [ ] Kibana dashboards for errors and requests
- [ ] Log retention policy (30 days hot, 90 days warm)
- [ ] Sensitive data redaction (passwords, tokens)

## Dependencies
- INFRA-005 (Elasticsearch index management)

## Estimated Effort
L

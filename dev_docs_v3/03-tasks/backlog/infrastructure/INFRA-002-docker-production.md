# INFRA-002: Docker Production Compose File

**Priority:** P1
**Service:** Infrastructure
**Scope:** Production-ready Docker Compose configuration

## Current State
A `docker-compose.yml` exists for local development (PostgreSQL, Redis, Elasticsearch, Kibana). No production-optimized compose file exists.

## Requirements
- Production Docker Compose with optimized images
- Multi-stage Dockerfiles for web and api apps
- Health checks for all services
- Volume management for persistent data
- Environment variable management (secrets)
- Resource limits and restart policies

## Acceptance Criteria
- [ ] Production Dockerfiles for web and api (multi-stage, minimal image size)
- [ ] docker-compose.prod.yml with all services
- [ ] Health checks on all containers
- [ ] Persistent volumes for PostgreSQL and Redis
- [ ] Secret management via env files or Docker secrets
- [ ] Resource limits configured
- [ ] Documentation for deployment

## Dependencies
- None

## Estimated Effort
M

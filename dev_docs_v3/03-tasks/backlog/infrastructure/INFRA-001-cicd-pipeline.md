# INFRA-001: CI/CD Pipeline Setup (GitHub Actions)

**Priority:** P1
**Service:** Infrastructure
**Scope:** Automated build, test, and deploy pipeline

## Current State
No CI/CD pipeline exists. All builds and deployments are manual. The project uses pnpm + Turborepo monorepo.

## Requirements
- GitHub Actions workflow for PR checks (lint, type-check, test, build)
- Separate workflows for `web` and `api` apps
- Turbo cache for faster builds
- Deploy preview environments for PRs
- Production deployment workflow on main branch merge

## Acceptance Criteria
- [ ] PR workflow runs lint, type-check, and tests
- [ ] Build step succeeds for both apps
- [ ] Turbo remote cache configured
- [ ] Preview deploy on PR open/update
- [ ] Production deploy on main merge
- [ ] Status checks required before merge

## Dependencies
- Hosting provider selected (Vercel for web, cloud provider for API)

## Estimated Effort
L

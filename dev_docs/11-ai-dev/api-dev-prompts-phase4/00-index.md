# API Phase 4 Developer Prompts - Index

## Overview

Phase 4 addresses remaining quality, documentation, and testing improvements after RBAC implementation is complete. These prompts focus on P1-P4 priorities to achieve production readiness.

**Last Updated:** January 15, 2026  
**Status:** 🟡 Ready for Implementation  
**Prerequisite:** Phase 3 P0 gaps must be complete (4 controllers remaining)

---

## Phase 4 Priorities

| Priority | Category | Est. Effort | Status |
|----------|----------|-------------|--------|
| **P1** | 4 Remaining Controllers | 4 hours | 🔴 Required |
| **P1** | Role Naming Standardization | 4 hours | 🟡 Recommended |
| **P2** | E2E Test Coverage | 3-4 days | 🔵 Parallel |
| **P2** | Swagger Documentation | 3-4 days | 🔵 Parallel |
| **P2** | Auth Service E2E Tests | 1 day | 🔵 Parallel |
| **P3** | Data Integrity Fixes | 0.5 days | 🔵 Low Priority |
| **P3** | Database Indexes | 1 day | 🔵 Low Priority |
| **P4** | Unit Test Coverage | 2-3 weeks | 🟣 Future |
| **P4** | Geo-search Enhancement | 2-3 days | 🟣 Future |

---

## Prompt Files

### P1 - High Priority (Complete Before Full Frontend)

| # | File | Description | Est. Time |
|---|------|-------------|-----------|
| 01 | [01-p1-final-rbac-gaps.md](01-p1-final-rbac-gaps.md) | Complete 4 remaining controllers | 4h |
| 02 | [02-p1-role-naming-standardization.md](02-p1-role-naming-standardization.md) | Standardize to UPPERCASE convention | 4h |

### P2 - Medium Priority (Parallel with Frontend)

| # | File | Description | Est. Time |
|---|------|-------------|-----------|
| 03 | [03-p2-e2e-test-expansion.md](03-p2-e2e-test-expansion.md) | Expand E2E tests for 8 core services | 3-4 days |
| 04 | [04-p2-swagger-documentation.md](04-p2-swagger-documentation.md) | Add Swagger docs to 17 services | 3-4 days |
| 05 | [05-p2-auth-e2e-tests.md](05-p2-auth-e2e-tests.md) | Comprehensive Auth service tests | 1 day |

### P3 - Low Priority (Pre-Production)

| # | File | Description | Est. Time |
|---|------|-------------|-----------|
| 06 | [06-p3-data-integrity-fixes.md](06-p3-data-integrity-fixes.md) | Soft delete consistency, query fixes | 0.5 days |
| 07 | [07-p3-database-indexes.md](07-p3-database-indexes.md) | Add performance indexes | 1 day |

### P4 - Future Enhancements

| # | File | Description | Est. Time |
|---|------|-------------|-----------|
| 08 | [08-p4-unit-test-coverage.md](08-p4-unit-test-coverage.md) | Target 80% unit test coverage | 2-3 weeks |
| 09 | [09-p4-geo-search-enhancement.md](09-p4-geo-search-enhancement.md) | Load Board geo-search feature | 2-3 days |

---

## Execution Order

### Week 1: Complete P1 (Blocking)
1. ✅ Complete 4 remaining controllers (01-p1-final-rbac-gaps.md)
2. ⚠️ Standardize role naming (02-p1-role-naming-standardization.md)

### Week 2-3: P2 in Parallel with Frontend
3. Add E2E tests for core services (03-p2-e2e-test-expansion.md)
4. Add Swagger documentation (04-p2-swagger-documentation.md)
5. Auth E2E tests (05-p2-auth-e2e-tests.md)

### Week 4: Pre-Production Polish
6. Data integrity fixes (06-p3-data-integrity-fixes.md)
7. Database indexes (07-p3-database-indexes.md)

### Future Sprints: P4 Enhancements
8. Unit test coverage (08-p4-unit-test-coverage.md)
9. Geo-search feature (09-p4-geo-search-enhancement.md)

---

## Success Metrics

| Metric | Current | Target | Prompt |
|--------|---------|--------|--------|
| RBAC Coverage | 95% | 100% | 01 |
| Role Consistency | 70% | 100% | 02 |
| E2E Test Coverage | 59% | 80% | 03, 05 |
| Swagger Documentation | 37% | 90% | 04 |
| Soft Delete Consistency | 96% | 100% | 06 |
| Index Coverage | ~70% | 95% | 07 |
| Unit Test Coverage | 0% | 80% | 08 |

---

## Quick Reference

### Services Needing E2E Tests (P2)
- Auth (0 tests)
- CRM (1 basic test)
- Sales (1 basic test)
- Accounting (1 basic test)
- Load Board (partial)
- Commission (partial)
- Documents (partial)
- Integration Hub (partial)

### Services Needing Swagger (P2)
- Auth, CRM, Sales, TMS Core, Carrier, Load Board
- Commission, Documents, Communication
- Customer Portal, Carrier Portal, Analytics
- Integration Hub, Audit, Config
- Rate Intelligence, Help Desk (partial)

### Services with Lowercase Roles (P1)
- Claims: `admin`, `manager`, `adjuster`
- Contracts: `admin`, `manager`, `viewer`
- Agents: `admin`, `manager`, `agent`
- Credit: `admin`, `analyst`, `viewer`

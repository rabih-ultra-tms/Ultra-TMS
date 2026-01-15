# API Phase 3 Developer Prompts - Index

## Overview

These prompts guide developers through implementing security and quality improvements to achieve 95% frontend readiness across all Phase A services.

**Last Updated:** January 15, 2026  
**Status:** ✅ P0/P1 LARGELY COMPLETE - Minor gaps remaining

---

## 🎉 Implementation Progress Summary

### What's Been Completed

| Category | Before | After | Change |
|----------|--------|-------|--------|
| **P0 Services with RBAC** | 0/11 | 9/11 | +82% |
| **Portal Isolation** | 0% | 100% | ✅ Complete |
| **Sensitive Field Protection** | 0% | 75% | Carriers, Documents, EDI done |
| **Audit Logging** | 0% | 50% | Integration Hub, EDI, Claims done |
| **Overall Frontend Readiness** | ~40% | ~85% | +45% |

---

## Current Service Status

### ✅ P0 Services - MOSTLY COMPLETE (9/11)

| Service | RBAC Status | Guards | Roles Defined | Notes |
|---------|-------------|--------|---------------|-------|
| CRM | ✅ **100%** | JwtAuthGuard + RolesGuard | ADMIN, SALES_REP, SALES_MANAGER, ACCOUNT_MANAGER | All 4 controllers protected |
| Sales | ⚠️ **40%** | Partial | ADMIN, SALES_REP, SALES_MANAGER, PRICING_ANALYST | `quotes.controller` only - GAPS in rate-contracts, sales-performance |
| Carrier | ✅ **100%** | JwtAuthGuard + RolesGuard | ADMIN, DISPATCHER, CARRIER_MANAGER, OPERATIONS, SAFETY_MANAGER | Includes SSN masking |
| Load Board | ⚠️ **67%** | Partial | ADMIN, DISPATCHER, SALES_REP, CARRIER_MANAGER | `load-tenders.controller` missing RolesGuard |
| Commission | ✅ **100%** | JwtAuthGuard + RolesGuard | ADMIN, ACCOUNTING, SALES_MANAGER, AGENT_MANAGER | All 3 controllers protected |
| Documents | ✅ **100%** | JwtAuthGuard + RolesGuard + DocumentAccessGuard | ADMIN, OPERATIONS, ACCOUNTING, COMPLIANCE | Includes field exclusion |
| Communication | ✅ **100%** | JwtAuthGuard + RolesGuard | ADMIN, OPERATIONS, SALES_REP, CUSTOMER_SERVICE, MARKETING | All 4 controllers protected |
| Customer Portal | ✅ **100%** | PortalAuthGuard + CompanyScopeGuard | Portal scope-based | Data isolation verified |
| Carrier Portal | ✅ **100%** | CarrierPortalAuthGuard + CarrierScopeGuard | Portal scope-based | Data isolation verified |
| Analytics | ✅ **100%** | JwtAuthGuard + RolesGuard | ADMIN, SALES_REP, DISPATCHER, ACCOUNTING, OPERATIONS_MANAGER | All 4 controllers protected |
| Integration Hub | ✅ **100%** | JwtAuthGuard + RolesGuard | SUPER_ADMIN, ADMIN, SYSTEM_INTEGRATOR | Includes audit logging |

### ✅ P1 Services - LARGELY COMPLETE (7/8)

| Service | RBAC Status | Notes |
|---------|-------------|-------|
| Claims | ✅ **100%** | Full RBAC + Audit logging on resolution |
| Contracts | ✅ **90%** | Full RBAC (uses lowercase roles - needs standardization) |
| Agents | ✅ **90%** | Full RBAC (mixed case roles) |
| Factoring | ✅ **100%** | Full RBAC on companies, verifications |
| Workflow | ✅ **100%** | Full RBAC on workflows, templates |
| Search | ✅ **100%** | Full RBAC on admin, global search |
| EDI | ✅ **100%** | Full RBAC + Audit logging |
| Safety | ✅ **100%** | Full RBAC on incidents, reports, scores, DQF |

---

## 🔴 Remaining Gaps (Estimated: 8-12 hours)

### High Priority - Complete P0 Coverage

| Gap | Service | File | Fix Required | Time |
|-----|---------|------|--------------|------|
| 1 | Sales | `rate-contracts.controller.ts` | Add RolesGuard + @Roles | 1h |
| 2 | Sales | `sales-performance.controller.ts` | Add RolesGuard + @Roles | 1h |
| 3 | Sales | `accessorial-rates.controller.ts` | Add RolesGuard + @Roles | 1h |
| 4 | Load Board | `load-tenders.controller.ts` | Add RolesGuard + @Roles | 1h |

### Medium Priority - Standardization

| Gap | Description | Fix Required | Time |
|-----|-------------|--------------|------|
| 5 | Role naming | Contracts, Agents, HR use lowercase | Convert to UPPERCASE | 2-3h |
| 6 | Sensitive fields | Integration Hub credentials | Add @Exclude/@Transform to response DTOs | 2h |
| 7 | Sensitive fields | Accounting banking info | Add response DTOs with masking | 2h |

---

## Prompt Files Status

### P0 - Blockers ✅ LARGELY COMPLETE

| # | File | Status | Completion |
|---|------|--------|------------|
| 01 | [01-p0-rbac-guards-core-services.md](01-p0-rbac-guards-core-services.md) | ⚠️ 85% | CRM ✅, Carrier ✅, Sales partial, Load Board partial |
| 02 | [02-p0-rbac-guards-operations-services.md](02-p0-rbac-guards-operations-services.md) | ✅ 100% | Commission ✅, Documents ✅, Communication ✅ |
| 03 | [03-p0-portal-scoped-middleware.md](03-p0-portal-scoped-middleware.md) | ✅ 100% | Customer Portal ✅, Carrier Portal ✅ |
| 04 | [04-p0-rbac-platform-services.md](04-p0-rbac-platform-services.md) | ✅ 100% | Analytics ✅, Integration Hub ✅ |

### P1 - High Priority ⚠️ MOSTLY COMPLETE

| # | File | Status | Completion |
|---|------|--------|------------|
| 05 | [05-p1-standardize-role-naming.md](05-p1-standardize-role-naming.md) | ⚠️ 70% | P0 services use UPPERCASE, some P1 still lowercase |
| 06 | [06-p1-sensitive-field-protection.md](06-p1-sensitive-field-protection.md) | ⚠️ 75% | Carrier SSN ✅, Documents ✅, EDI ✅, Integration Hub pending |
| 07 | [07-p1-rbac-conditional-services.md](07-p1-rbac-conditional-services.md) | ✅ 95% | All 8 services have RBAC |

### P2 - Medium Priority 🔵 PENDING

| # | File | Status | Notes |
|---|------|--------|-------|
| 08 | [08-p2-e2e-test-rbac-coverage.md](08-p2-e2e-test-rbac-coverage.md) | 🔵 Not started | Ready to implement |
| 09 | [09-p2-swagger-documentation.md](09-p2-swagger-documentation.md) | 🔵 Not started | Ready to implement |
| 10 | [10-p2-audit-logging.md](10-p2-audit-logging.md) | ⚠️ 50% | Integration Hub ✅, EDI ✅, Claims ✅, others pending |

---

## Service Coverage Summary - UPDATED

### P0 Services (11 total - Now 82% Complete)

| Service | Prompt | Previous | Current | Change |
|---------|--------|----------|---------|--------|
| CRM | 01 | 🔴 Blocked | ✅ **PASS** | +100% |
| Sales | 01 | 🔴 Blocked | ⚠️ 40% | +40% |
| Carrier | 01 | 🔴 Blocked | ✅ **PASS** | +100% |
| Load Board | 01 | 🔴 Blocked | ⚠️ 67% | +67% |
| Commission | 02 | 🔴 Blocked | ✅ **PASS** | +100% |
| Documents | 02 | 🔴 Blocked | ✅ **PASS** | +100% |
| Communication | 02 | 🔴 Blocked | ✅ **PASS** | +100% |
| Customer Portal | 03 | 🔴 Blocked | ✅ **PASS** | +100% |
| Carrier Portal | 03 | 🔴 Blocked | ✅ **PASS** | +100% |
| Analytics | 04 | 🔴 Blocked | ✅ **PASS** | +100% |
| Integration Hub | 04 | 🔴 Blocked | ✅ **PASS** | +100% |

### P1 Services (8 total - Now 95% Complete)

| Service | Prompt | Previous | Current | Change |
|---------|--------|----------|---------|--------|
| Claims | 07 | 🟡 Conditional | ✅ **PASS** | +40% |
| Contracts | 07 | 🟡 Conditional | ✅ **PASS** | +35% |
| Agents | 07 | 🟡 Conditional | ✅ **PASS** | +40% |
| Factoring | 07 | 🟡 Conditional | ✅ **PASS** | +35% |
| Workflow | 07 | 🟡 Conditional | ✅ **PASS** | +50% |
| Search | 07 | 🟡 Conditional | ✅ **PASS** | +30% |
| EDI | 07 | 🟡 Conditional | ✅ **PASS** | +40% |
| Safety | 07 | 🟡 Conditional | ✅ **PASS** | +45% |

---

## Remaining Work - Quick Reference

### Immediate Actions (4 hours)

Add RolesGuard to these controllers:

```bash
# Sales module - 3 files
apps/api/src/modules/sales/rate-contracts.controller.ts
apps/api/src/modules/sales/sales-performance.controller.ts  
apps/api/src/modules/sales/accessorial-rates.controller.ts

# Load Board module - 1 file
apps/api/src/modules/load-board/controllers/load-tenders.controller.ts
```

**Pattern to apply:**
```typescript
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('...')
@UseGuards(JwtAuthGuard, RolesGuard)  // Add RolesGuard
export class XyzController {
  
  @Get()
  @Roles('ADMIN', 'SALES_MANAGER', '...')  // Add to each method
  async findAll() { ... }
}
```

---

## Role Reference

Standard roles used across prompts:

| Role | Description | Access Level |
|------|-------------|--------------|
| `SUPER_ADMIN` | System administrator | Full system |
| `ADMIN` | Tenant administrator | Full tenant |
| `OPERATIONS_MANAGER` | Operations leadership | Operations + limited admin |
| `DISPATCHER` | Load dispatch | Loads, carriers, tracking |
| `SALES_MANAGER` | Sales leadership | CRM, quotes, contracts |
| `SALES_REP` | Sales representative | CRM read, limited quotes |
| `ACCOUNTING` | Financial operations | Invoices, payments, reports |
| `CARRIER_MANAGER` | Carrier relations | Carrier CRUD, compliance |
| `CLAIMS_MANAGER` | Claims leadership | Claims, settlements |
| `CLAIMS_ADJUSTER` | Claims processing | Claims CRUD |
| `CUSTOMER` | Customer portal user | Own company data only |
| `CARRIER` | Carrier portal user | Own carrier data only |

---

## Quick Start for Remaining Work

1. **Complete P0 gaps** - Add RolesGuard to 4 controllers (~4 hours)
2. **Standardize roles** - Convert lowercase to UPPERCASE (~3 hours)
3. **Add sensitive field protection** - Integration Hub credentials (~2 hours)
4. **Run E2E tests** - Verify RBAC implementation

---

## Final Validation Checklist

After completing remaining work:

- [ ] All 11 P0 services have 100% RBAC coverage
- [ ] All 8 P1 services have 90%+ RBAC coverage
- [ ] Role naming is consistent (UPPERCASE)
- [ ] Sensitive data is masked in all responses
- [ ] Portal isolation is verified ✅
- [ ] Audit logging on sensitive operations ✅ (Integration Hub, EDI, Claims)
- [ ] No security warnings in code review
- [ ] Frontend team confirms API readiness

---

## Metrics

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| P0 Services Ready | 0% | 82% | 100% |
| P1 Services Ready | 50% | 95% | 90% |
| Portal Isolation | 0% | 100% | 100% |
| Sensitive Field Protection | 0% | 75% | 90% |
| Audit Logging | 0% | 50% | 80% |
| **Overall Frontend Readiness** | **~40%** | **~85%** | **95%** |

**Remaining effort to reach 95%:** ~8-12 hours

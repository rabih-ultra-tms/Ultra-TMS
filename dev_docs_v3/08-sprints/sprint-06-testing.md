# Sprint 06 — Testing & Stabilization

> **Duration:** 2 weeks
> **Goal:** Reach 40% test coverage, E2E tests for critical paths, zero P0/P1 bugs
> **Depends on:** Sprint 01-05 (all features must be built)

---

## Sprint Capacity

| Agent | Available Days | Focus Hours/Day | Total Hours |
|-------|---------------|----------------|-------------|
| Claude Code | 10 | 3h | 30h |
| Gemini/Codex | 10 | 1.5h | 15h |
| **Total** | | | **45h** |

**Committed:** 40h

---

## Sprint Goal

> "8.7% → 40% test coverage. All critical user flows have E2E tests. Zero P0 bugs. Every route loads without crashes. CI pipeline green."

---

## Committed Tasks

| ID | Title | Effort | Priority | Assigned | Status |
|----|-------|--------|----------|----------|--------|
| TST-001 | Unit Tests: Auth Module | M (4h) | P0 | Codex | planned |
| TST-002 | Unit Tests: Order/Load Services | L (6h) | P0 | Claude Code | planned |
| TST-003 | Unit Tests: Invoice/Settlement Services | M (4h) | P0 | Codex | planned |
| TST-004 | Unit Tests: Commission Calculation | M (4h) | P0 | Codex | planned |
| TST-005 | Integration Tests: API Endpoints | L (6h) | P0 | Claude Code | planned |
| TST-006 | E2E: Login → Create Order → Dispatch | L (6h) | P0 | Claude Code | planned |
| TST-007 | E2E: Invoice → Payment → Settlement | M (4h) | P1 | Claude Code | planned |
| TST-008 | Frontend Component Tests (top 20 components) | M (4h) | P1 | Codex | planned |
| TST-009 | Fix All Remaining P1 Bugs | M (3h) | P1 | Mixed | planned |
| TST-010 | CI Pipeline Setup | S (2h) | P1 | Claude Code | planned |
| **Total** | | **43h** | | | |

---

## Coverage Targets

| Area | Current | Target | Notes |
|------|---------|--------|-------|
| Backend overall | ~15% | 40% | Focus on service layer |
| Auth module | ~30% | 80% | Critical path |
| TMS Core (orders/loads) | ~5% | 50% | Business logic |
| Accounting | ~0% | 30% | Financial accuracy |
| Commission | ~0% | 40% | Calculation correctness |
| Frontend | 8.7% | 25% | Component + hook tests |
| E2E | 0% | 5 critical flows | Playwright |

---

## Testing Strategy

1. **Unit tests** (Jest): Service methods, calculation logic, validators
2. **Integration tests** (Supertest): API endpoints with test database
3. **Component tests** (Testing Library): Key form components, data tables
4. **E2E tests** (Playwright): Critical user workflows

---

## Acceptance Criteria

- [ ] `pnpm --filter api test` → all green, 40%+ coverage
- [ ] `pnpm --filter web test` → all green, 25%+ coverage
- [ ] 5 Playwright E2E scenarios pass
- [ ] Zero P0 bugs remaining
- [ ] CI pipeline runs tests on every PR
- [ ] `pnpm build` succeeds
- [ ] `pnpm check-types` succeeds

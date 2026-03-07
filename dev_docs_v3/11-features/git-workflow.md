# Git Workflow & Code Review

> Source: `dev_docs/10-features/82-git-workflow-standards.md`
> Last updated: 2026-03-07

---

## Overview

Ultra TMS uses a **simplified Git Flow** optimized for a small AI-assisted team. Conventional commits enable auto-changelog. PRs are squash-merged to main.

---

## Branch Strategy

```
main (production)
  │
  ├── develop (integration)
  │     │
  │     ├── feature/TMS-123-carrier-onboarding
  │     ├── fix/TMS-124-load-status-bug
  │     ├── chore/update-dependencies
  │     └── refactor/TMS-321-extract-rate-calculator
  │
  └── release/v1.2.0 (when preparing release)
```

### Branch Types

| Prefix | Purpose | Base Branch | Merge To |
|--------|---------|-------------|----------|
| `feature/` | New functionality | develop | develop |
| `fix/` | Bug fixes | develop | develop |
| `hotfix/` | Production emergency | main | main + develop |
| `chore/` | Maintenance, deps | develop | develop |
| `docs/` | Documentation only | develop | develop |
| `refactor/` | Code improvement | develop | develop |
| `release/` | Release preparation | develop | main + develop |

### Branch Naming

```
{type}/{ticket-number}-{short-description}

feature/TMS-123-carrier-onboarding
fix/TMS-456-load-status-not-updating
hotfix/TMS-789-payment-calculation-error
```

---

## Commit Convention

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(carrier): add FMCSA lookup` |
| `fix` | Bug fix | `fix(load): correct status transition` |
| `docs` | Documentation | `docs(api): add swagger annotations` |
| `style` | Formatting only | `style(web): fix indentation` |
| `refactor` | Code restructure | `refactor(auth): extract token service` |
| `test` | Add/fix tests | `test(carrier): add service unit tests` |
| `chore` | Tooling/deps | `chore: update prisma to v6` |
| `perf` | Performance | `perf(loads): add database index` |
| `ci` | CI/CD changes | `ci: add playwright to pipeline` |

### Scopes

```
api, web, carrier, load, dispatch, auth, crm, sales,
accounting, commission, tracking, prisma, ui, config
```

---

## Pull Request Process

### PR Template

```markdown
## Summary
- What changed and why

## Type
- [ ] Feature / [ ] Fix / [ ] Refactor / [ ] Chore

## Testing
- [ ] Unit tests pass (`pnpm test`)
- [ ] Type check passes (`pnpm check-types`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Manual testing (describe steps)

## Screenshots
(if UI changes)
```

### PR Rules

1. **One feature/fix per PR** — Keep PRs small and focused
2. **Squash merge to develop** — Clean commit history
3. **Run checks before pushing** — `pnpm test && pnpm lint && pnpm check-types`
4. **No direct commits to main** — Always through PR
5. **Delete branch after merge** — Keep repo clean

---

## Pre-Commit Checks

```bash
# Run before every commit
pnpm check-types          # TypeScript strict mode
pnpm lint                 # ESLint
pnpm format               # Prettier
pnpm --filter web test    # Frontend tests
pnpm --filter api test    # Backend tests
```

---

## Release Process

1. Create `release/v{X.Y.Z}` branch from develop
2. Update version numbers and CHANGELOG.md
3. Run full test suite
4. PR to main (requires review)
5. Tag release: `git tag v{X.Y.Z}`
6. Merge back to develop
7. Deploy from main

---

## Multi-AI Collaboration Notes

- Claude Code: complex features, audits, architecture
- Gemini/Codex: CRUD, patterns, form refactors, tests
- All agents follow the same commit convention
- Co-authored-by trailer required for AI commits

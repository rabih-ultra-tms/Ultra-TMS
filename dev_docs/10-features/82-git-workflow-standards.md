# 77 - Git Workflow & Code Review Standards

**Branch strategy, commit conventions, and PR process for the 2-developer team**

---

## âš ï¸ CLAUDE CODE: Git Requirements

1. **ALWAYS create a branch** - Never commit directly to main
2. **Use conventional commits** - Enables auto-changelog
3. **Keep PRs small** - One feature/fix per PR
4. **Run checks before pushing** - `npm test && npm run lint`
5. **Squash merge to main** - Clean history

---

## Branch Strategy

### Git Flow (Simplified for Small Team)

```
main (production)
  â”‚
  â”œâ”€â”€ develop (integration)
  â”‚     â”‚
  â”‚     â”œâ”€â”€ feature/TMS-123-carrier-onboarding
  â”‚     â”œâ”€â”€ feature/TMS-124-load-tracking
  â”‚     â”œâ”€â”€ fix/TMS-125-invoice-calculation
  â”‚     â””â”€â”€ chore/update-dependencies
  â”‚
  â””â”€â”€ release/v1.2.0 (when preparing release)
```

### Branch Types

| Prefix      | Purpose              | Base Branch | Merge To       |
| ----------- | -------------------- | ----------- | -------------- |
| `feature/`  | New functionality    | develop     | develop        |
| `fix/`      | Bug fixes            | develop     | develop        |
| `hotfix/`   | Production emergency | main        | main + develop |
| `chore/`    | Maintenance, deps    | develop     | develop        |
| `docs/`     | Documentation only   | develop     | develop        |
| `refactor/` | Code improvement     | develop     | develop        |
| `release/`  | Release preparation  | develop     | main + develop |

### Branch Naming Convention

```
{type}/{ticket-number}-{short-description}

Examples:
feature/TMS-123-carrier-onboarding
fix/TMS-456-load-status-not-updating
hotfix/TMS-789-payment-calculation-error
chore/update-prisma-to-v5
docs/add-api-documentation
refactor/TMS-321-extract-rate-calculator
```

---

## Commit Convention

### Conventional Commits Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Description                 | Example                                |
| ---------- | --------------------------- | -------------------------------------- |
| `feat`     | New feature                 | `feat(carrier): add FMCSA lookup`      |
| `fix`      | Bug fix                     | `fix(load): correct status transition` |
| `docs`     | Documentation               | `docs(api): add swagger annotations`   |
| `style`    | Formatting, no logic change | `style: fix indentation`               |
| `refactor` | Code change, no feature/fix | `refactor(auth): extract JWT service`  |
| `test`     | Add/update tests            | `test(carrier): add onboarding tests`  |
| `chore`    | Maintenance                 | `chore: update dependencies`           |
| `perf`     | Performance improvement     | `perf(search): add database index`     |
| `ci`       | CI/CD changes               | `ci: add staging deployment`           |
| `build`    | Build system changes        | `build: update webpack config`         |
| `revert`   | Revert previous commit      | `revert: feat(load): add multi-stop`   |

### Scopes (by Service)

```
auth, crm, sales, tms, carrier, accounting, commission,
credit, claims, documents, communication,
customer-portal, carrier-portal, driver-portal,
analytics, workflow, integration, search, audit, config,
scheduler, cache, help-desk, feedback, edi, rate-intel,
eld, cross-border, safety, fuel, factoring, load-board,
mobile, super-admin, common, ui, api, db
```

### Commit Message Examples

```bash
# Good commits
feat(carrier): add FMCSA lookup integration

Add ability to lookup carrier by MC or DOT number
using FMCSA SAFER API. Auto-fills company details.

Closes TMS-123

fix(load): correct delivery date validation

Delivery date was allowing past dates. Now validates
that delivery date is >= pickup date.

Fixes TMS-456

refactor(auth): extract token service

Move JWT generation/validation to dedicated service
for better testability and reuse.

test(carrier): add unit tests for scorecard calculation

Add tests for:
- Overall score calculation
- On-time percentage
- Claims rate impact

chore: update prisma to 5.7.0

# Bad commits (avoid these)
fix bug                          # Too vague
Update carrier.service.ts        # Describes file, not change
WIP                              # Never commit WIP to shared branch
fix: stuff                       # Not descriptive
```

### Commit Message Rules

1. **Subject line**: Max 72 characters
2. **Body**: Wrap at 80 characters
3. **Use imperative mood**: "add" not "added" or "adds"
4. **Reference tickets**: Include ticket number
5. **Explain why**: Body should explain motivation

---

## Pull Request Process

### PR Template

```markdown
<!-- .github/PULL_REQUEST_TEMPLATE.md -->

## Description

<!-- What does this PR do? Link to ticket. -->

Closes #TMS-XXX

## Type of Change

- [ ] ðŸš€ Feature
- [ ] ðŸ› Bug fix
- [ ] ðŸ“š Documentation
- [ ] ðŸ”§ Refactor
- [ ] ðŸ§ª Test
- [ ] ðŸ—ï¸ Chore

## Changes Made

<!-- Bullet list of changes -->

-
-
-

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

## Testing

<!-- How was this tested? -->

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project standards (docs 61-72)
- [ ] Self-review completed
- [ ] No console.log or TODO comments
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Documentation updated (if needed)
- [ ] i18n: Translations added for new strings
- [ ] UI: All buttons/links work (doc 65)

## Related PRs

<!-- List related PRs if any -->

## Notes for Reviewer

<!-- Any specific areas to focus on? -->
```

### PR Size Guidelines

| Size | Lines Changed | Review Time | Recommended              |
| ---- | ------------- | ----------- | ------------------------ |
| XS   | < 50          | 5 min       | âœ… Best                 |
| S    | 50-200        | 15 min      | âœ… Good                 |
| M    | 200-400       | 30 min      | âš ï¸ Acceptable         |
| L    | 400-800       | 1 hour      | âš ï¸ Consider splitting |
| XL   | 800+          | 2+ hours    | âŒ Split required        |

### PR Review Checklist (for Reviewer)

```markdown
## Code Quality

- [ ] Code is readable and well-organized
- [ ] No unnecessary complexity
- [ ] No duplicate code
- [ ] Error handling is appropriate
- [ ] Edge cases considered

## Standards Compliance

- [ ] Follows API standards (doc 62)
- [ ] Follows database standards (doc 63)
- [ ] Follows frontend standards (doc 64)
- [ ] UI elements all work (doc 65)
- [ ] Type safety maintained (doc 66)
- [ ] Auth/authz correct (doc 67)

## Testing

- [ ] Tests cover happy path
- [ ] Tests cover error cases
- [ ] Tests are meaningful (not just coverage)

## Security

- [ ] No sensitive data exposed
- [ ] Input validation present
- [ ] SQL injection prevented
- [ ] XSS prevented

## Performance

- [ ] No N+1 queries
- [ ] Appropriate indexing
- [ ] No unnecessary re-renders (React)
```

---

## Git Commands Reference

### Daily Workflow

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/TMS-123-carrier-onboarding

# Work on feature
git add .
git commit -m "feat(carrier): add onboarding form"

# Keep branch updated
git fetch origin
git rebase origin/develop

# Push for PR
git push origin feature/TMS-123-carrier-onboarding

# After PR merged, cleanup
git checkout develop
git pull origin develop
git branch -d feature/TMS-123-carrier-onboarding
```

### Fix Last Commit

```bash
# Amend last commit message
git commit --amend -m "feat(carrier): add FMCSA lookup"

# Add forgotten file to last commit
git add forgotten-file.ts
git commit --amend --no-edit

# Undo last commit (keep changes)
git reset --soft HEAD~1
```

### Interactive Rebase (Clean History)

```bash
# Squash last 3 commits
git rebase -i HEAD~3

# In editor, change 'pick' to 'squash' or 's' for commits to combine
pick abc123 feat(carrier): add form
squash def456 fix form validation
squash ghi789 add tests
```

### Stashing

```bash
# Save work in progress
git stash push -m "WIP: carrier form"

# List stashes
git stash list

# Apply and remove stash
git stash pop

# Apply specific stash
git stash apply stash@{2}
```

### Cherry Pick (for Hotfixes)

```bash
# Apply specific commit to another branch
git checkout main
git cherry-pick abc123def456
```

---

## Pre-Push Hooks

### Husky + lint-staged Setup

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

```bash
# .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run typecheck
npm test -- --passWithNoTests
```

### Commit Message Validation

```bash
# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit "$1"
```

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'auth',
        'crm',
        'sales',
        'tms',
        'carrier',
        'accounting',
        'commission',
        'credit',
        'claims',
        'documents',
        'communication',
        'customer-portal',
        'carrier-portal',
        'driver-portal',
        'analytics',
        'workflow',
        'integration',
        'search',
        'audit',
        'config',
        'scheduler',
        'cache',
        'help-desk',
        'feedback',
        'edi',
        'rate-intel',
        'eld',
        'cross-border',
        'safety',
        'fuel',
        'factoring',
        'load-board',
        'mobile',
        'super-admin',
        'common',
        'ui',
        'api',
        'db',
        'deps',
        'ci',
      ],
    ],
  },
};
```

---

## Code Review Best Practices

### For Authors

1. **Self-review first** - Read your own code before requesting review
2. **Keep PRs focused** - One logical change per PR
3. **Provide context** - Explain why, not just what
4. **Respond promptly** - Address feedback within 24 hours
5. **Don't take it personally** - Reviews improve code, not judge you

### For Reviewers

1. **Be constructive** - Suggest improvements, don't just criticize
2. **Ask questions** - Understand intent before suggesting changes
3. **Prioritize feedback** - Distinguish blockers from nitpicks
4. **Approve when ready** - Don't block on minor issues
5. **Review promptly** - Within 24 hours if possible

### Comment Prefixes

```
ðŸ”´ BLOCKER: Must fix before merge
    Example: "ðŸ”´ BLOCKER: This exposes user passwords in logs"

âš ï¸ ISSUE: Should fix, but can be separate PR
    Example: "âš ï¸ ISSUE: This query could be slow with large datasets"

ðŸ’¡ SUGGESTION: Nice to have improvement
    Example: "ðŸ’¡ SUGGESTION: Consider extracting this to a shared utility"

â“ QUESTION: Need clarification
    Example: "â“ QUESTION: Why is this check needed here?"

ðŸ“ NITPICK: Minor style preference
    Example: "ðŸ“ NITPICK: Could rename to be more descriptive"

ðŸ‘ PRAISE: Positive feedback
    Example: "ðŸ‘ Nice clean solution!"
```

---

## Release Process

### Version Numbering (SemVer)

```
MAJOR.MINOR.PATCH

Examples:
1.0.0 - Initial release
1.1.0 - New feature added (backward compatible)
1.1.1 - Bug fix
2.0.0 - Breaking change
```

### Release Workflow

```bash
# 1. Create release branch from develop
git checkout develop
git pull
git checkout -b release/v1.2.0

# 2. Update version
npm version minor --no-git-tag-version
# Updates package.json to 1.2.0

# 3. Update CHANGELOG
# Add release notes

# 4. Create PR to main
# Title: "Release v1.2.0"

# 5. After merge, tag
git checkout main
git pull
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# 6. Merge main back to develop
git checkout develop
git merge main
git push
```

### Hotfix Workflow

```bash
# 1. Create hotfix from main
git checkout main
git pull
git checkout -b hotfix/TMS-999-critical-bug

# 2. Fix and commit
git commit -m "fix(payment): correct calculation error"

# 3. Create PR to main (expedited review)

# 4. After merge, tag
git checkout main
git pull
git tag -a v1.2.1 -m "Hotfix v1.2.1"
git push origin v1.2.1

# 5. Merge to develop
git checkout develop
git merge main
git push
```

---

## Git Workflow Checklist

### Before Starting Work

- [ ] Pull latest from develop
- [ ] Create feature branch with proper naming
- [ ] Understand the ticket requirements

### Before Committing

- [ ] Run `npm run lint`
- [ ] Run `npm run typecheck`
- [ ] Run `npm test`
- [ ] Review changes with `git diff`

### Before Creating PR

- [ ] Rebase on latest develop
- [ ] Squash WIP commits
- [ ] Write descriptive PR title/description
- [ ] Fill out PR template completely
- [ ] Self-review the diff

### After PR Approval

- [ ] Squash merge to develop
- [ ] Delete feature branch
- [ ] Verify CI passes on develop

---

## Cross-References

- **Pre-Feature Checklist (doc 70)**: Before starting any feature
- **Pre-Release Checklist (doc 71)**: Before releasing
- **Testing Strategy (doc 68)**: What tests to include
- **All Standards Docs (61-72)**: Reference during code review

---

## Navigation

- **Previous:** [Error Handling & Logging Standards](./76-error-handling-logging-standards.md)
- **Next:** [Accessibility Standards](./78-accessibility-standards.md)

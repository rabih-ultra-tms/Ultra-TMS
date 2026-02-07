Run all quality checks (lint, type-check, test, build) and report results.

## Instructions

### Step 1: Run Quality Checks

Run the following checks in sequence from the monorepo root. After each check, record pass/fail and any errors.

1. **Lint check**:
   ```
   pnpm lint
   ```
   - Pass criteria: Exit code 0, no errors (warnings OK if under threshold)
   - If fails: capture the error summary (file, line, rule)

2. **TypeScript type check**:
   ```
   pnpm check-types
   ```
   - Pass criteria: Exit code 0, no type errors
   - If fails: capture error count and first 10 errors

3. **Backend tests**:
   ```
   pnpm --filter api test
   ```
   - Pass criteria: All tests pass
   - If fails: capture failed test names and error messages

4. **Frontend tests**:
   ```
   pnpm --filter web test
   ```
   - Pass criteria: All tests pass, coverage >= 70%
   - If fails: capture failed test names and coverage numbers

5. **Build check**:
   ```
   pnpm build
   ```
   - Pass criteria: Exit code 0, both apps build successfully
   - If fails: capture build errors

### Step 2: Generate Report

6. **Output a quality gate report**:

```
## Quality Gate Report

### Overall: PASS / FAIL

| Check        | Status | Details              |
|--------------|--------|----------------------|
| Lint         | PASS/FAIL | [error count or "Clean"] |
| Type Check   | PASS/FAIL | [error count or "Clean"] |
| Backend Tests| PASS/FAIL | [X/Y passed]         |
| Frontend Tests| PASS/FAIL | [X/Y passed, Z% coverage] |
| Build        | PASS/FAIL | [error or "Clean"]   |

### Failures (if any)

#### [Check Name]
- Error 1: [description]
- Error 2: [description]
...

### Recommendation
[If all pass: "Ready to commit. Use `/commit` to create a commit."]
[If failures: "Fix the following issues before committing:" + specific guidance]
```

### Step 3: Quick Fix Suggestions

7. If there are failures, provide **specific fix suggestions**:
   - For lint errors: show the rule, file, and suggested fix
   - For type errors: show the type mismatch and how to resolve
   - For test failures: show the assertion that failed
   - For build errors: show the compilation error

8. **Ask the user** if they want you to auto-fix the issues (for things like lint auto-fix, missing types, etc.).

### Notes

- If a check takes more than 2 minutes, report a timeout
- If `pnpm` commands are not available, try `npm run` equivalents
- Always run from the monorepo root directory
- Do NOT skip any checks — run all 5 even if earlier ones fail

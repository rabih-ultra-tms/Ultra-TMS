Generate a weekly HTML progress report from the work log entries.

## Instructions

### Step 1: Gather Data

1. **Read the work log** at `dev_docs/weekly-reports/work-log.md`. Identify all entries since the last report.
   - Check the "Last Report" line at the top of the file for the cutoff date
   - Gather all session entries after that date

2. **Determine report number and date range**:
   - Look at existing reports in `dev_docs/weekly-reports/` to find the latest report number
   - New report number = latest + 1
   - Date range = day after last report through today

3. **Get git commit data** for the reporting period:
   - Run `git log --oneline --stat --since="YYYY-MM-DD" --until="YYYY-MM-DD"` (using the date range)
   - Count total commits, files changed, insertions, deletions
   - List each commit with hash, message, and stats

4. **Aggregate metrics** from work log entries:
   - Total files created/changed
   - Total lines of code
   - Features/modules completed
   - Screens built
   - Any other quantifiable metrics from the entries

### Step 2: Generate the Report

5. **Read the template** at `dev_docs/weekly-reports/001-2026-02-06-weekly-report.html` for the exact HTML structure and CSS.

6. **Create the new report** at `dev_docs/weekly-reports/{NNN}-{YYYY-MM-DD}-weekly-report.html` using the SAME CSS and HTML structure as the template. The report must include these sections:

#### Header Banner
- Report number, date range, reporting period length
- Meta items: commit count, files changed, phase name
- Generated date

#### Navigation Tabs
- Links to: Executive Summary, Key Metrics, Accomplishments, Commit Log, Milestones, Architecture, Next Week

#### Section 1: Executive Summary
- `week-highlight` div with the biggest number (lines of code, files, etc.)
- `highlight-stats` with 4-5 key stats
- `score-grid` with score cards for each major metric category

#### Section 2: Key Metrics
- Progress bars for different areas (backend, frontend, design, testing)
- Comparison to previous period if applicable

#### Section 3: Accomplishments
- `accomplishment-card` divs for each major work item
- Categories: backend, frontend, design, infra, docs, fullstack
- Each card has: title, status badge, description, impact grid with numbers

#### Section 4: Commit Log
- `commit-timeline` with `commit-row` divs
- Each row: date, hash (linked style), message, stats (added/removed)

#### Section 5: Milestones
- `milestone-track` divs showing project milestones
- Mark as done, current, or pending
- Include milestone detail text

#### Section 6: Architecture
- Current system architecture summary
- Any architecture changes this period
- `arch-flow` diagram if relevant

#### Section 7: Next Week
- Planned work items
- Priority labels (P0, P1, P2)
- Any blockers or risks

### Step 3: Update Work Log

7. **Update the work log header** at `dev_docs/weekly-reports/work-log.md`:
   - Change "Last Report" line to reflect the new report number and date

### Step 4: Present

8. **Show the user**:
   - Report file path
   - Quick summary of what's in the report
   - Key numbers (commits, files, lines, features)
   - Suggest: "Open the HTML file in a browser to review the formatted report"

### Key Formatting Rules

- Use the EXACT same CSS from the template (copy it entirely)
- Use semantic class names: `score-card green`, `status-done`, `accomplishment-card backend`, etc.
- All numbers should be prominent (use `score` class for big numbers)
- Include progress bars with appropriate fill percentages
- Use expandable `<details>` sections for verbose content
- Make it print-friendly (the CSS already handles this)
- Every section should have an `id` attribute matching the nav tabs

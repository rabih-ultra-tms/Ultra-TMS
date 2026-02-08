# Skill & Plugin Usage Guide

**Purpose:** Map all available Claude Code skills, slash commands, and MCP plugins to their optimal use cases in Ultra TMS development.
**Reference:** Plugin workflow table in `CLAUDE.md` (section: Plugin Workflow).

---

## Table of Contents

1. [Quick Reference Matrix](#quick-reference-matrix)
2. [Planning Skills](#planning-skills)
3. [Build Skills](#build-skills)
4. [Design Skills](#design-skills)
5. [Testing Skills](#testing-skills)
6. [Review Skills](#review-skills)
7. [Git Workflow Skills](#git-workflow-skills)
8. [Research Plugins (MCP)](#research-plugins-mcp)
9. [Component Generation Plugins (MCP)](#component-generation-plugins-mcp)
10. [Maintenance Skills](#maintenance-skills)
11. [When NOT to Use a Skill](#when-not-to-use-a-skill)

---

## Quick Reference Matrix

| Skill / Plugin | Command | Stage | Best For | Overhead |
|----------------|---------|-------|----------|----------|
| Brainstorming | `/brainstorming` | Plan | Feature ideation, architecture decisions | Medium |
| Writing Plans | `/writing-plans` | Plan | Implementation plans, task breakdowns | Medium |
| Context7 | Auto | Research | Library docs (Next.js, Prisma, NestJS) | None |
| Feature Dev | `/feature-dev` | Build | Full feature development (7 phases) | High |
| Frontend Design | `/frontend-design` | Design | Production UI from design specs | High |
| Test-Driven Dev | `/test-driven-development` | Build | TDD workflow | Medium |
| Systematic Debugging | `/systematic-debugging` | Debug | Complex bug investigation | Medium |
| Playwright | Auto / manual | Test | E2E browser testing, screenshots | Medium |
| Code Review | `/code-review` | Review | Quick standalone review | Low |
| PR Review | `/review-pr` | Review | Multi-agent PR review | Medium |
| Commit | `/commit` | Git | Single commit | Low |
| Commit-Push-PR | `/commit-push-pr` | Git | Commit + push + create PR | Low |
| Claude MD Mgmt | `/revise-claude-md` | Maintain | Update CLAUDE.md | Low |
| Gemini MCP | Manual | Design | Image generation, design critique | Medium |
| Firecrawl MCP | Manual | Research | Competitor scraping | Medium |
| Magic/21st.dev MCP | Manual | Build | v0-like component generation | Medium |
| shadcn MCP | Manual | Build | Check component registry | Low |

---

## Planning Skills

### `/brainstorming`

**When to use:** Before building a new feature, when you need to explore approaches, identify edge cases, or make architectural decisions.

**Input needed:**
- Feature description or problem statement
- Relevant constraints (must use existing patterns, must support multi-tenancy, etc.)
- Any related design specs

**Expected output:**
- Multiple approaches evaluated
- Pros/cons analysis
- Recommended approach with rationale
- Identified risks and edge cases

**Ultra TMS examples:**
- "How should we structure real-time dispatch board updates? WebSocket vs. polling vs. SSE?"
- "What is the best approach for the multi-stop load builder UI?"
- "How should carrier compliance documents be stored and validated?"

**When to skip:** If you already know the approach and just need to execute. Brainstorming adds 5-10 minutes of planning overhead.

---

### `/writing-plans`

**When to use:** After brainstorming (or when the approach is clear) and before building. Creates a structured implementation plan.

**Input needed:**
- Feature requirements (from brainstorming output or design spec)
- Target files and directories
- Dependencies and prerequisites

**Expected output:**
- Step-by-step implementation plan
- File-by-file change list
- Dependency order (what must be built first)
- Estimated effort per step
- Risk mitigation steps

**Ultra TMS examples:**
- "Plan the implementation of the complete Carrier Management module (backend + frontend + tests)"
- "Plan the refactoring of all 858+ line page files into component-based architecture"
- "Plan the migration from raw fetch() calls to React Query hooks across all CRM pages"

**When to skip:** For small, well-understood tasks (single bug fix, adding one field). The plan would be shorter than the implementation.

---

## Build Skills

### `/feature-dev`

**When to use:** For guided, multi-phase feature development. This is the most comprehensive build skill -- it walks through 7 phases from requirements to verification.

**The 7 phases:**
1. Requirements gathering
2. Architecture planning
3. Data model / schema review
4. Backend implementation
5. Frontend implementation
6. Testing
7. Integration verification

**Input needed:**
- Feature description
- Design spec path (if available)
- Related Prisma model names

**Expected output:**
- Complete feature implementation across all layers
- Tests for each layer
- Verification results

**Ultra TMS examples:**
- "Build the Load Tendering workflow (backend + frontend + notifications)"
- "Build the Rate Calculator module with tariff management"

**When to skip:** For tasks that only touch one layer (frontend-only or backend-only). The 7-phase walkthrough adds overhead when you only need phases 4-5. Use Workflow A or B from the development workflows guide instead.

**Overhead:** High -- this skill guides you through every phase even if some are not needed. Expect 20-40 minutes for a full feature. For simpler tasks, just tell the agent what to build directly.

---

### `/test-driven-development`

**When to use:** When you want to write tests first and then implement the code to make them pass.

**Input needed:**
- Feature requirements or method signatures
- Expected behavior descriptions

**Expected output:**
- Test file written first (all tests failing)
- Implementation written to make tests pass
- All tests green at the end

**Ultra TMS examples:**
- "TDD the carrier rating calculation service"
- "TDD the load status state machine transitions"

**When to skip:** When adding tests to existing code (use Workflow E instead). TDD is most valuable for new business logic, not for UI components or CRUD operations.

---

## Design Skills

### `/frontend-design`

**When to use:** The primary skill for building production-quality UI from design specs. This is the recommended approach for all new screen development in Ultra TMS.

**What it does differently from just asking "build this page":**
- Applies design system tokens consistently
- Evaluates component composition before building
- Includes accessibility considerations
- Produces more polished output than raw code generation

**Input needed:**
- Design spec file path
- Design principles reference
- Any existing component examples to match

**Expected output:**
- Complete page implementation
- New components as needed
- Proper responsive behavior
- Accessible markup

**Ultra TMS examples:**
- "Build the Dispatch Board screen from `dev_docs/12-Rabih-design-Process/04-tms-core/08-dispatch-board.md`"
- "Build the Customer Portal dashboard"

**When to skip:** For non-visual work (backend modules, data migrations, test suites). The design-focused prompting adds no value for non-UI tasks.

---

## Testing Skills

### Playwright Plugin

**When to use:** For end-to-end browser testing and visual verification.

**Capabilities:**
- Navigate to pages in a real browser
- Click buttons, fill forms, interact with UI
- Take screenshots for visual verification
- Assert element presence and content
- Test complete user flows

**Input needed:**
- The dev server must be running (`pnpm dev`)
- The page URL to test
- The user flow to execute

**Expected output:**
- Screenshots of rendered pages
- Test assertions (pass/fail)
- Console error reports

**Ultra TMS examples:**
- "Navigate to /carriers and take a screenshot. Then click 'Add Carrier', fill the form, and verify it submits."
- "Log in as a dispatcher and verify the dispatch board loads with the correct layout."

**When to skip:** For unit-level testing (use Jest instead). Playwright has startup overhead and is slower than unit tests. Use it for visual verification and complete user flow testing, not for testing individual functions.

---

### `/systematic-debugging`

**When to use:** When a bug is complex, has an unclear root cause, or involves multiple system layers.

**What it does:**
- Guides structured investigation (hypothesis, evidence, test)
- Systematically narrows down the root cause
- Documents the investigation for future reference

**Input needed:**
- Bug description with symptoms
- Reproduction steps
- Error messages or unexpected behavior

**Expected output:**
- Root cause analysis
- Fix implementation
- Explanation of why the bug occurred

**Ultra TMS examples:**
- "Carrier creation returns 500 but the validation should catch the error at 400 level"
- "Dashboard shows stale data after navigating back from a detail page"

**When to skip:** For obvious bugs with clear causes (typo in import path, missing null check, wrong API endpoint). Just fix them directly.

---

## Review Skills

### `/code-review`

**When to use:** Quick, standalone review of code changes. Good for reviewing your own work before committing.

**Input needed:**
- File paths to review, or let it review staged changes

**Expected output:**
- Issues found (bugs, style, performance, security)
- Suggestions for improvement
- Severity ratings

**Overhead:** Low -- typically 2-3 minutes.

---

### `/review-pr`

**When to use:** Full multi-agent PR review. More thorough than `/code-review`. Good for reviewing significant changes before merging.

**Input needed:**
- PR number or branch name

**Expected output:**
- Comprehensive review covering architecture, correctness, performance, security, and style
- Actionable feedback with specific file/line references

**Overhead:** Medium -- typically 5-10 minutes. Uses multiple review passes.

**When to skip:** For trivial PRs (documentation updates, single-line fixes). Use `/code-review` instead.

---

## Git Workflow Skills

### `/commit`

**When to use:** After completing work, to create a well-formatted commit.

**What it does:**
- Analyzes staged changes
- Generates a descriptive commit message
- Creates the commit

**Input needed:**
- Staged changes (run `git add` first)

**Overhead:** Low -- under 1 minute.

---

### `/commit-push-pr`

**When to use:** After completing a feature branch, to commit, push, and create a pull request in one step.

**What it does:**
- Commits staged changes
- Pushes to remote
- Creates a PR with auto-generated title and description

**Input needed:**
- Staged changes
- Target branch (defaults to main)

**Overhead:** Low -- 1-2 minutes.

---

## Research Plugins (MCP)

### Context7 Plugin

**When to use:** Automatically activated when the agent needs documentation for Next.js, Prisma, NestJS, or other libraries.

**How it works:**
- The agent queries the Context7 knowledge base for library-specific documentation
- Returns up-to-date API references, patterns, and best practices
- No manual invocation needed -- the agent uses it when researching how to implement something

**Ultra TMS examples:**
- Agent checks Next.js 16 App Router documentation when building pages
- Agent looks up Prisma 6 query syntax when building services
- Agent references NestJS 10 guard patterns when implementing auth

**Overhead:** None -- happens automatically in the background.

---

### Gemini MCP

**When to use:** For design critique, image generation, and multi-modal analysis.

**Capabilities:**
- `gemini-analyze-image` -- Analyze screenshots of implemented UI
- `gemini-generate-image` -- Generate design mockups or icons
- `gemini-analyze-url` -- Analyze competitor websites
- `gemini-brainstorm` -- Alternative brainstorming perspective
- `gemini-deep-research` -- Deep research on TMS industry topics

**Output directory:** `apps/web/public/generated/`

**Ultra TMS examples:**
- "Generate a mockup of the dispatch board before building it"
- "Analyze this screenshot of our carriers page and suggest design improvements"
- "Research how top TMS platforms handle load matching UX"

**When to skip:** For pure code tasks. Gemini adds value only when visual or research elements are involved.

---

### Firecrawl MCP

**When to use:** For scraping and analyzing competitor websites.

**Capabilities:**
- `firecrawl_scrape` -- Scrape a single page
- `firecrawl_crawl` -- Crawl multiple pages from a domain
- `firecrawl_search` -- Search the web and return structured results
- `firecrawl_map` -- Map a website's structure

**Ultra TMS examples:**
- "Scrape the feature page of top 5 TMS platforms and compare their feature lists"
- "Analyze how competitor X structures their carrier onboarding flow"

**When to skip:** For any task that does not involve external web content. This is a research tool, not a development tool.

---

## Component Generation Plugins (MCP)

### Magic / 21st.dev MCP

**When to use:** For generating UI components in a v0-like manner -- providing a description and getting a complete component back.

**Capabilities:**
- `21st_magic_component_builder` -- Generate a component from a description
- `21st_magic_component_inspiration` -- Get design inspiration for a component
- `21st_magic_component_refiner` -- Refine an existing component

**Ultra TMS examples:**
- "Generate a KPI dashboard card component with animated counters"
- "Build an interactive timeline component for shipment tracking"

**When to skip:** When the component already exists in shadcn/ui or when the design spec provides exact wireframes (the agent can build it directly from the spec).

---

### shadcn MCP

**When to use:** To check what components are available in the shadcn/ui registry before building custom ones.

**Capabilities:**
- `getComponent` -- Get details about a specific shadcn/ui component
- `getComponents` -- List all available components

**Ultra TMS examples:**
- "Check if shadcn has a combobox component before building a custom dropdown with search"
- "See what data table options are available in shadcn"

**When to skip:** When you already know which shadcn components are installed (check `apps/web/components/ui/` for the 34 currently installed primitives).

---

### Magic UI MCP

**When to use:** For finding animated and special-effect components.

**Capabilities:**
- `getAnimations` -- Browse animation components
- `getButtons` -- Browse button variations
- `getBackgrounds` -- Browse background effects
- `getSpecialEffects` -- Browse visual effects
- `getTextAnimations` -- Browse text animation effects

**Ultra TMS examples:**
- "Find an animated counter component for the dashboard KPIs"
- "Get a loading animation for the dispatch board"

**When to skip:** For most business screens. Animations should be minimal in a logistics platform -- focus on data clarity over visual flair.

---

## Maintenance Skills

### `/revise-claude-md` and `/claude-md-improver`

**When to use:** After significant changes to the project structure, conventions, or technology stack.

**What they do:**
- Analyze the current codebase state
- Update `CLAUDE.md` to reflect reality
- Add new patterns or conventions discovered during development

**Ultra TMS examples:**
- After adding a new shared package to `packages/`
- After changing the API response format convention
- After adding new environment variables

**When to skip:** After routine feature development that follows existing conventions.

---

## When NOT to Use a Skill

Skills add overhead. Each skill invocation involves structured prompting, phase management, and often multiple tool calls before any code is written. For simple tasks, this overhead is wasteful.

### Skip Skills When:

| Task | Why Skip | Just Do This Instead |
|------|----------|---------------------|
| Fix a typo | Skill overhead > fix time | Edit the file directly |
| Add a missing import | Trivial change | Edit the file directly |
| Rename a variable across files | Mechanical operation | Ask agent to rename directly |
| Add one field to a DTO | Small, clear change | Ask agent to add it directly |
| Update a comment | No reasoning needed | Edit the file directly |
| Install a new shadcn component | One command | `npx shadcn@latest add {component}` |

### Use Skills When:

| Task | Why Use | Which Skill |
|------|---------|-------------|
| Build a new page from spec | Complex, multi-file, needs design judgment | `/frontend-design` |
| Plan a large feature | Needs structured thinking before coding | `/brainstorming` then `/writing-plans` |
| Debug a cross-layer issue | Needs systematic investigation | `/systematic-debugging` |
| Build a complete feature end-to-end | Needs guided multi-phase approach | `/feature-dev` |
| Review significant code changes | Needs thorough multi-perspective review | `/review-pr` |

### Rule of Thumb

**If the task takes less than 5 minutes without a skill, do not use a skill.**
**If the task involves multiple files, multiple layers, or design decisions, use the appropriate skill.**

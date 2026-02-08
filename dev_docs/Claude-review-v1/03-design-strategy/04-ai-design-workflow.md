# AI Design Workflow: Getting Beautiful Output from AI

> How to stop AI from generating generic, template-looking code and start getting polished, production-grade UI.

---

## The "AI Slop" Problem

When you ask an AI to "build a carriers page," it produces code that:

1. **Uses default shadcn/ui patterns** -- standard Card, Table, Badge with zero customization
2. **Follows the happy path only** -- no loading skeletons, no error states, no empty states
3. **Applies colors ad-hoc** -- `bg-green-100 text-green-800` instead of design tokens
4. **Has no visual personality** -- could be any SaaS app, not specifically Ultra TMS
5. **Skips micro-interactions** -- no hover effects, no transitions, no animations
6. **Ignores information density** -- wasteful whitespace or cramped data, never the right balance

This is the default output because the AI has no design constraints. It generates "working" code, not "beautiful" code. The fix is to give the AI specific constraints, references, and a review process.

---

## The Anti-Slop Pipeline

Every page and component should go through this 5-step pipeline before it ships.

### Step 1: Start with the Design Spec

The Ultra TMS has 89 detailed screen specs (15 sections each) at `dev_docs/12-Rabih-design-Process/`. Each spec contains:

- **Section 3: Layout Blueprint** -- exact page structure
- **Section 4: Component Inventory** -- which components the page needs
- **Section 5: Interaction Matrix** -- hover, click, keyboard behaviors
- **Section 6: State Machine** -- all statuses and transitions
- **Section 14: Stitch Prompt** -- a 200-400 word visual description

**Before asking AI to build anything, read the relevant spec file and include it in the prompt.**

Example workflow:
```
1. Read: dev_docs/12-Rabih-design-Process/05-carrier/01-carrier-list.md
2. Copy Section 3 (Layout Blueprint) and Section 4 (Component Inventory)
3. Include in the AI prompt as context
```

### Step 2: Generate Visual Mockup with Stitch

Before writing any code, generate a visual reference using [stitch.withgoogle.com](https://stitch.withgoogle.com).

1. Copy the Stitch prompt from Section 14 of the screen spec
2. Paste into Stitch and generate
3. Iterate 2-3 times with refinements:
   - "Make the sidebar darker and narrower"
   - "Add more whitespace between the stats cards and the table"
   - "Make the status badges pill-shaped with softer colors"
4. Save the final mockup image

**Why this matters:** A visual reference is worth 10,000 words of description. When the AI can see what the target looks like, the output is dramatically better.

### Step 3: Build with the `/frontend-design` Skill

Use the `/frontend-design` skill (available as a Claude Code plugin) with BOTH the mockup and the spec:

**Prompt structure:**
```
/frontend-design

Build the Carrier List page for Ultra TMS.

## Design Reference
[Paste or reference the Stitch mockup]

## Design Spec
[Paste Section 3: Layout Blueprint from the screen spec]
[Paste Section 4: Component Inventory]

## Design Constraints
- Import status colors from @/lib/constants/status-colors (CARRIER_STATUS)
- Use <StatusBadge> component, not inline color classes
- Use <PageHeader> with breadcrumbs
- Use <DataTableSkeleton> for loading state
- Use <ErrorState> for error state
- Use <EmptyState> for empty state
- Use <ConfirmDialog> for delete confirmation
- All mutations must have onError handlers with toast
- Table headers: text-xs uppercase font-medium text-muted-foreground
- Stats cards: use <KPICard> with icon, value, trend
- Follow the typography scale: page title text-2xl font-semibold, body text-sm

## Existing Components Available
- StatusBadge (from @/components/shared)
- PageHeader (from @/components/ui/PageHeader)
- DataTableSkeleton (from @/components/shared)
- ErrorState (from @/components/shared)
- EmptyState (from @/components/shared)
- ConfirmDialog (from @/components/shared)
- KPICard (from @/components/shared)
```

### Step 4: Review Against Design Principles

After the AI generates code, review it against this checklist:

```
[ ] COLORS: No hardcoded Tailwind colors (bg-green-100, text-red-600)
[ ] TOKENS: All colors come from design tokens or status-colors.ts
[ ] COMPONENTS: Uses shared components (StatusBadge, PageHeader, etc.)
[ ] STATES: Loading skeleton, error with retry, empty with CTA all present
[ ] TYPOGRAPHY: Matches spec (text-2xl for title, text-sm for body, text-xs for captions)
[ ] SPACING: Uses 4px grid (p-4, p-6, gap-4, space-y-6)
[ ] ICONS: Lucide icons at correct sizes (h-4 w-4 in buttons, h-5 w-5 in nav)
[ ] HOVER: Interactive elements have hover states
[ ] FOCUS: Keyboard focus rings are visible
[ ] RESPONSIVE: Mobile layout works (test at 375px)
[ ] PERSONALITY: Does this look like Ultra TMS or any random SaaS app?
```

If any item fails, provide specific feedback to the AI for correction.

### Step 5: Iterate with Specific Feedback

**Bad feedback (produces no improvement):**
```
"Make it look better"
"It doesn't look professional enough"
"Can you improve the design?"
```

**Good feedback (produces specific improvement):**
```
"The stats cards need a colored icon on the left side. Add a Truck icon in text-emerald-600
to the Active Carriers card. Add a trend indicator showing '+12 from last month' in
text-emerald-600 with an ArrowUp icon."

"The table headers should be uppercase text-xs font-medium text-muted-foreground with
bg-muted/50 background. Currently they're regular weight and mixed case."

"The mobile card view needs a colored left border indicating status. Active carriers
should have a border-l-4 border-emerald-500, Blacklisted should have border-l-4 border-red-500."
```

The more specific the feedback, the better the iteration. Reference exact Tailwind classes, exact Lucide icon names, and exact design token values.

---

## Prompt Engineering for Beautiful TMS Components

### The Master Prompt Template

Use this template for any component or page build request:

```
Build [component/page name] for Ultra TMS.

## Visual Target
Modern SaaS aesthetic similar to Linear.app. Dark slate-900 sidebar, white content area,
blue-600 primary actions. Clean borders (slate-200), no heavy shadows. Status badges as
colored pills with background/text color pairs from the status system.

## Technical Stack
- Next.js 16, React 19, Tailwind 4, shadcn/ui
- Import from: @/components/ui/ (shadcn primitives)
- Import from: @/components/shared/ (StatusBadge, KPICard, etc.)
- Import from: @/lib/constants/status-colors (CARRIER_STATUS, LOAD_STATUS, etc.)
- Import from: @/lib/constants/design-tokens (typography, spacing, etc.)
- Icons: lucide-react (h-4 w-4 in buttons, h-5 w-5 in nav, h-6 w-6 standalone)
- Forms: react-hook-form + zod validation
- Data fetching: @tanstack/react-query hooks

## Design Rules
1. ALL status colors imported from status-colors.ts, NEVER hardcoded
2. ALL loading states use <Skeleton> or <DataTableSkeleton>
3. ALL error states use <ErrorState> with retry
4. ALL empty states use <EmptyState> with icon + title + description + CTA
5. ALL destructive actions use <ConfirmDialog>, NEVER browser confirm()
6. ALL mutations have onError handlers with toast notification
7. Typography: text-2xl font-semibold (page title), text-sm (body), text-xs (captions)
8. Spacing: p-6 (page), p-4/p-6 (cards), space-y-6 (sections)
9. Table headers: text-xs uppercase font-medium tracking-wider text-muted-foreground

## Specific Requirements
[Paste from screen spec Sections 3, 4, 5, and 6]
```

### Prompt Boosters for Specific Quality Issues

**To prevent generic stat cards:**
```
Stats cards MUST include:
- A colored Lucide icon on the left (not just a number)
- The metric value in text-3xl font-bold
- A trend indicator: "+12 this month" with ArrowUp icon in text-emerald-600,
  or "-3 this month" with ArrowDown icon in text-red-600
- A subtle background or left border accent matching the icon color
Do NOT use plain Card with just a number and label.
```

**To prevent flat mobile views:**
```
Mobile card view (<lg breakpoint) MUST include:
- A colored left border (border-l-4) matching the entity status color
- Clear visual hierarchy: primary info (name, status) on top, secondary (location, phone) below
- Hover state with subtle shadow-sm transition
- Selection state with primary/5 background
```

**To prevent boring tables:**
```
Data table MUST include:
- Sticky header row with bg-muted/50 background
- Uppercase text-xs font-medium tracking-wider text-muted-foreground headers
- Row hover with bg-muted/30 transition-colors
- Checkbox column with proper indeterminate state
- Actions column with DropdownMenu (never inline buttons)
- Status column using <StatusBadge> component
- Monospace font (font-mono) for IDs and reference numbers
```

---

## Reference Image Strategy

### Products to Screenshot and Reference

These products represent the target aesthetic for Ultra TMS:

| Product | What to Reference | URL |
|---------|------------------|-----|
| Linear.app | Sidebar navigation, issue lists, detail pages | linear.app |
| Vercel Dashboard | Stats cards, deployment lists, settings pages | vercel.com/dashboard |
| Rose Rocket | TMS-specific: dispatch boards, load tracking, carrier pages | roserocket.com |
| Stripe Dashboard | Payment tables, analytics charts, form design | dashboard.stripe.com |
| Notion | Clean typography, page layouts, breadcrumbs | notion.so |
| project44 | Tracking maps, shipment timelines, carrier visibility | project44.com |

### How to Use References

1. Take screenshots of specific UI patterns you want to replicate
2. Save to a `dev_docs/design-references/` directory
3. When prompting AI, describe the specific element:
   ```
   "The stats cards should look like Vercel's deployment stats:
   a small icon, bold number, muted label below, and a subtle
   trend line or percentage change indicator."
   ```

### What NOT to Reference

- Do not ask AI to "copy" a specific product's design (legal and ethical issues)
- Do reference specific patterns: "a sidebar similar to Linear's" or "table styling like Stripe's"
- Focus on layout patterns and visual density, not exact colors or branding

---

## Using Gemini MCP for Design Critique

The Gemini MCP server is installed and configured. Use it as an automated design reviewer before committing any visual change.

### Design Critique Workflow

```
1. Take a screenshot of the built page
2. Use Gemini to critique it against the design spec:

   gemini-analyze-image:
     image: [screenshot path]
     prompt: |
       Analyze this TMS application screenshot against these design principles:
       - Modern SaaS aesthetic (Linear.app style)
       - Dark sidebar (#0F172A), white content area
       - Blue-600 (#2563EB) primary actions
       - Status badges should be colored pills with background/text pairs
       - Typography: Inter, 14px base, 24px page titles
       - Cards: rounded-lg, subtle borders, no heavy shadows
       - Tables: uppercase xs headers, row hover states

       Identify:
       1. Elements that look generic or template-like
       2. Inconsistent spacing or alignment
       3. Missing micro-interactions (no hover states, no transitions)
       4. Typography hierarchy issues
       5. Color usage that doesn't match the design system
       6. Score 1-10 for visual polish
```

### When to Use Gemini Critique

| Stage | Use For |
|-------|---------|
| After initial build | "Does this match the target aesthetic?" |
| After polish pass | "What details am I still missing?" |
| Before PR | "Is this visually ready to merge?" |
| During component development | "Does this component look production-grade?" |

---

## The Design Review Gate

### Rule: Never Merge Without Visual Review

Every PR that changes visual appearance must include:

1. **Screenshot of the change** -- before and after, or just after for new screens
2. **Comparison to spec** -- link to the relevant screen spec file
3. **Gemini critique score** -- must be 7/10 or higher
4. **Design checklist completed** -- from the PR template

### Process

```
Developer builds page
    |
    v
Take screenshot
    |
    v
Run Gemini critique
    |
    v
Score < 7? --> Iterate on specific feedback from Gemini
    |
Score >= 7
    |
    v
Open PR with screenshot + critique score
    |
    v
Reviewer verifies visual quality
    |
    v
Merge
```

### Common Gemini Feedback and How to Fix It

| Gemini Feedback | Fix |
|----------------|-----|
| "Stats cards look empty/generic" | Add icon, trend indicator, color accent |
| "Table headers blend with rows" | Uppercase text-xs font-medium bg-muted/50 |
| "Inconsistent badge colors" | Import from status-colors.ts, use StatusBadge |
| "No visual hierarchy on page" | Apply typography scale (2xl title, sm body, xs captions) |
| "Mobile layout is cramped" | Add responsive padding (p-4 mobile, p-6 desktop) |
| "Hover states missing" | Add transition-colors + hover:bg-muted/30 on rows |
| "Forms look like defaults" | Label font-medium text-sm, field descriptions in text-xs text-muted-foreground |

---

## Anti-Slop Checklist (Quick Reference)

Tape this to your monitor. Check every item before marking a page as done.

```
VISUAL PERSONALITY
[ ] This page could NOT be mistaken for any other SaaS app
[ ] Stats cards have icons, trends, and color accents
[ ] Tables have polished headers (uppercase, muted, small)
[ ] Status badges use the centralized color system
[ ] Interactive elements have hover/focus transitions

DATA STATES
[ ] Loading: skeleton that matches the content shape
[ ] Error: ErrorState with retry button
[ ] Empty: EmptyState with icon, title, description, CTA
[ ] Success: toast notification on mutations

POLISH DETAILS
[ ] IDs and reference numbers in font-mono
[ ] Dates formatted consistently (not raw ISO strings)
[ ] Currency values formatted with $ and commas
[ ] Phone numbers formatted with parentheses
[ ] Truncated text has tooltip on hover
[ ] Mobile view has been tested at 375px
```

---

## Example: Transforming the Carriers Page

### What Was Built (Current State)

```tsx
// Generic stat cards
<Card>
  <CardContent className="pt-4">
    <div className="text-2xl font-bold text-green-600">{stats.byStatus?.ACTIVE || 0}</div>
    <p className="text-xs text-muted-foreground">Active</p>
  </CardContent>
</Card>

// Hardcoded status colors
const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800',
  ...
};

// Browser confirm
if (confirm('Are you sure?')) { onDelete(); }

// Bare text loading
<div>Loading carriers...</div>
```

### What Should Have Been Built (With This Workflow)

```tsx
// Polished KPI card
<KPICard
  icon={CircleCheckBig}
  iconColor="text-emerald-600"
  label="Active Carriers"
  value={stats.byStatus?.ACTIVE || 0}
  trend={{ value: 8, direction: 'up', label: 'from last month' }}
/>

// Centralized status colors
import { CARRIER_STATUS } from '@/lib/constants/status-colors';
<StatusBadge entity={CARRIER_STATUS} status={carrier.status} />

// Proper confirmation
<ConfirmDialog
  open={showDeleteConfirm}
  onOpenChange={setShowDeleteConfirm}
  title="Delete Carrier"
  description={`Permanently delete "${carrier.companyName}"?`}
  variant="destructive"
  onConfirm={() => deleteMutation.mutate(carrier.id)}
/>

// Skeleton loading
<DataTableSkeleton columns={10} rows={8} />
```

The difference is not in the functionality -- both versions "work." The difference is in the **visual polish, consistency, and attention to detail** that makes a product feel finished vs. feel like a prototype.

---

*Next document: [05-quality-gates.md](./05-quality-gates.md) -- The 4-level gate system for ensuring quality at every level.*

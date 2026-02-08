# Design System Enforcement

> How to make it impossible to ship inconsistent design.

---

## The Problem This Solves

The design documentation is excellent. The implementation ignores it. This happens because:

1. Nothing prevents a developer from typing `bg-green-100` instead of importing `CARRIER_STATUS.ACTIVE`
2. No linting rule catches hardcoded colors
3. No PR checklist requires visual review
4. No shared constants file exists to import from

This document defines the technical and process enforcement mechanisms to close the gap permanently.

---

## 1. Design Token System

### 1.1 CSS Variable Architecture

The current `globals.css` uses oklch color values with no comments. Developers cannot tell which design token a variable represents. Add a mapping layer.

**File: `apps/web/app/globals.css` -- Add these comments and status variables:**

```css
@layer base {
  :root {
    /* ===== DESIGN TOKEN MAPPING ===== */
    /* Each CSS variable maps to a design token from 02-design-principles.md */

    /* Primary: Blue-600 (#2563EB) -- Actions, links, focus states */
    --primary: oklch(0.55 0.22 264);

    /* ===== STATUS COLOR SYSTEM ===== */
    /* From 03-status-color-system.md -- Single source of truth */

    /* Success / Complete: Emerald */
    --status-success: #10B981;
    --status-success-bg: #D1FAE5;
    --status-success-text: #065F46;

    /* Warning / Caution: Amber */
    --status-warning: #F59E0B;
    --status-warning-bg: #FEF3C7;
    --status-warning-text: #92400E;

    /* Danger / Error: Red */
    --status-danger: #EF4444;
    --status-danger-bg: #FEE2E2;
    --status-danger-text: #991B1B;

    /* Info / Active: Blue */
    --status-info: #3B82F6;
    --status-info-bg: #DBEAFE;
    --status-info-text: #1E40AF;

    /* Neutral / Inactive: Gray */
    --status-neutral: #6B7280;
    --status-neutral-bg: #F3F4F6;
    --status-neutral-text: #374151;

    /* In-Progress: Indigo */
    --status-progress: #6366F1;
    --status-progress-bg: #E0E7FF;
    --status-progress-text: #3730A3;

    /* Pending Review: Violet */
    --status-pending: #8B5CF6;
    --status-pending-bg: #EDE9FE;
    --status-pending-text: #5B21B6;

    /* Special / Highlight: Cyan */
    --status-special: #06B6D4;
    --status-special-bg: #CFFAFE;
    --status-special-text: #155E75;
  }
}
```

### 1.2 Shared Constants File

**File: `apps/web/lib/constants/design-tokens.ts`**

This file is the **code-level single source of truth** for all design values. Import this file instead of hardcoding Tailwind classes.

```typescript
// ============================================================
// DESIGN TOKENS -- Ultra TMS Design System
// ============================================================
// Source: dev_docs/12-Rabih-design-Process/00-global/02-design-principles.md
// DO NOT hardcode colors, spacing, or typography in components.
// Import from this file instead.
// ============================================================

// ----- Colors -----
export const colors = {
  primary: {
    DEFAULT: '#2563EB', // Blue-600
    hover: '#1D4ED8',   // Blue-700
    light: '#DBEAFE',   // Blue-100
    dark: '#1E40AF',    // Blue-800
  },
  accent: '#6366F1',    // Indigo-500

  background: {
    page: '#FFFFFF',
    pageMuted: '#F9FAFB', // Gray-50
    card: '#FFFFFF',
    sidebar: '#0F172A',   // Slate-900
  },

  border: {
    DEFAULT: '#E5E7EB',   // Gray-200
    dark: '#CBD5E1',      // Slate-300
  },

  text: {
    primary: '#0F172A',   // Slate-900
    secondary: '#64748B', // Slate-500
    muted: '#94A3B8',     // Slate-400
    inverse: '#FFFFFF',
  },
} as const;

// ----- Typography -----
export const typography = {
  pageTitle: 'text-2xl font-semibold text-foreground',
  sectionTitle: 'text-lg font-semibold text-foreground',
  cardTitle: 'text-base font-medium text-foreground',
  body: 'text-sm font-normal text-foreground',
  caption: 'text-xs font-normal text-muted-foreground',
  tableHeader: 'text-xs font-medium uppercase tracking-wider text-muted-foreground',
  monospace: 'font-mono text-sm',
} as const;

// ----- Spacing -----
export const spacing = {
  pagePadding: 'p-6',           // 24px
  pagePaddingMobile: 'p-4',     // 16px
  cardPaddingLarge: 'p-6',      // 24px
  cardPaddingCompact: 'p-4',    // 16px
  cardPaddingListItem: 'p-3',   // 12px
  sectionGap: 'space-y-6',      // 24px between sections
  cardGap: 'gap-4',             // 16px between cards
  formFieldGap: 'space-y-4',    // 16px between form fields
  formGroupGap: 'space-y-6',    // 24px between form groups
} as const;

// ----- Border Radius -----
export const radius = {
  card: 'rounded-lg',     // 8px
  button: 'rounded-md',   // 6px
  input: 'rounded-md',    // 6px
  badge: 'rounded-full',  // Pill shape
  modal: 'rounded-xl',    // 12px
} as const;

// ----- Shadows -----
export const shadows = {
  card: '',                     // No shadow by default
  cardHover: 'hover:shadow-md', // Shadow on interactive card hover
  modal: 'shadow-lg',
} as const;

// ----- Component Sizing -----
export const sizing = {
  buttonHeight: 'h-9',          // 36px default
  buttonHeightCompact: 'h-8',   // 32px compact
  inputHeight: 'h-9',           // 36px
  tableRowHeight: 'h-11',       // 44px comfortable
  tableRowHeightCompact: 'h-9', // 36px compact
  sidebarWidth: 'w-60',         // 240px
  modalSmall: 'max-w-md',       // 480px
  modalMedium: 'max-w-xl',      // 640px
  modalLarge: 'max-w-3xl',      // 800px
} as const;

// ----- Icons -----
export const iconSizes = {
  inButton: 'h-4 w-4',   // 16px
  inNav: 'h-5 w-5',      // 20px
  standalone: 'h-6 w-6', // 24px
} as const;
```

### 1.3 Status Color Constants

**File: `apps/web/lib/constants/status-colors.ts`**

This file implements the exact code from Section 25 of `03-status-color-system.md`. It must be the ONLY place status colors are defined. The full implementation is provided in the status-color-system doc and should be copied verbatim. The key exports are:

```typescript
// Re-export everything -- these are the ONLY valid imports for status colors
export {
  ORDER_STATUS,
  LOAD_STATUS,
  STOP_STATUS,
  STOP_TYPE,
  CARRIER_STATUS,
  CARRIER_COMPLIANCE,
  CARRIER_TIER,
  INSURANCE_STATUS,
  DOCUMENT_STATUS,
  USER_STATUS,
  TENANT_STATUS,
  LEAD_STAGE,
  CUSTOMER_STATUS,
  CUSTOMER_CREDIT_STATUS,
  QUOTE_STATUS,
  CHECK_CALL_TYPE,
  ACTIVITY_TYPE,
  EQUIPMENT_TYPE,
  OPPORTUNITY_STAGE,
  PRIORITY_LEVEL,
  PAYMENT_TERMS,
  INVOICE_STATUS,
  CLAIM_STATUS,
} from './status-color-definitions';

export { getStatusConfig } from './get-status-config';
export type { StatusConfig, BadgeVariant } from './status-color-definitions';
```

### 1.4 StatusBadge Component

**File: `apps/web/components/shared/status-badge.tsx`**

A single component that renders any status from any entity correctly:

```tsx
import { Badge } from '@/components/ui/badge';
import { type StatusConfig, getStatusConfig } from '@/lib/constants/status-colors';

interface StatusBadgeProps {
  entity: Record<string, StatusConfig>;
  status: string;
  showIcon?: boolean;
  size?: 'sm' | 'default';
}

export function StatusBadge({ entity, status, showIcon = true, size = 'default' }: StatusBadgeProps) {
  const config = getStatusConfig(entity, status);
  const Icon = config.icon;

  return (
    <Badge
      variant={config.badgeVariant}
      className={size === 'sm' ? 'text-[10px] px-1.5 py-0' : ''}
      style={{
        backgroundColor: config.bgHex,
        color: config.textHex,
        borderColor: `${config.hex}30`,
      }}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
```

---

## 2. ESLint Rules for Design Enforcement

### 2.1 Prevent Hardcoded Colors

Add custom ESLint rules to catch the most common violations. Create a shared rule:

**File: `packages/eslint-config/rules/no-hardcoded-colors.js`**

```javascript
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded Tailwind color classes in component files',
    },
    messages: {
      noHardcodedColor:
        'Hardcoded color "{{color}}" detected. Import from @/lib/constants/status-colors or @/lib/constants/design-tokens instead.',
    },
  },
  create(context) {
    // Match patterns like bg-green-100, text-red-600, border-blue-200
    const colorPattern = /\b(bg|text|border|ring)-(red|green|blue|yellow|orange|purple|emerald|amber|indigo|violet|cyan|teal|sky|rose|lime|pink|slate|gray)-(50|100|200|300|400|500|600|700|800|900)\b/;

    return {
      Literal(node) {
        if (typeof node.value === 'string' && colorPattern.test(node.value)) {
          // Allow in ui/ components (they are the primitives)
          const filename = context.getFilename();
          if (filename.includes('components/ui/')) return;
          // Allow in constants files
          if (filename.includes('constants/')) return;

          context.report({
            node,
            messageId: 'noHardcodedColor',
            data: { color: node.value.match(colorPattern)[0] },
          });
        }
      },
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          if (colorPattern.test(quasi.value.raw)) {
            const filename = context.getFilename();
            if (filename.includes('components/ui/') || filename.includes('constants/')) return;

            context.report({
              node,
              messageId: 'noHardcodedColor',
              data: { color: quasi.value.raw.match(colorPattern)[0] },
            });
          }
        }
      },
    };
  },
};
```

### 2.2 Prevent Browser confirm()

```javascript
// Rule: no-browser-confirm
module.exports = {
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.name === 'confirm' ||
            (node.callee.property && node.callee.property.name === 'confirm')) {
          context.report({
            node,
            message: 'Use <ConfirmDialog> component instead of window.confirm(). Import from @/components/shared/confirm-dialog.',
          });
        }
      },
    };
  },
};
```

### 2.3 ESLint Config Integration

Add to the shared ESLint config:

```javascript
// packages/eslint-config/react.js -- add these rules
module.exports = {
  rules: {
    // Design system enforcement
    'ultra-tms/no-hardcoded-colors': 'warn',  // Start as warning, upgrade to error after migration
    'ultra-tms/no-browser-confirm': 'error',
  },
};
```

### 2.4 Gradual Rollout

1. **Week 1**: Add rules as `warn` level. Fix violations in PR reviews.
2. **Week 2**: Fix all existing violations across the codebase.
3. **Week 3**: Upgrade to `error` level. CI blocks on violations.

---

## 3. Badge Component Extension

The current `badge.tsx` needs three new variants. This is a direct implementation of the design system spec.

**Required changes to `apps/web/components/ui/badge.tsx`:**

```typescript
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // NEW: Status system variants
        success: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
        warning: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        info: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
```

---

## 4. PR Review Checklist for Design Consistency

Every PR that touches frontend code must pass this checklist before merge.

### Visual Review Checklist

```markdown
## Design Review Checklist

### Token Usage
- [ ] No hardcoded Tailwind color classes (bg-green-100, text-red-600, etc.)
- [ ] All status colors imported from `@/lib/constants/status-colors`
- [ ] Typography uses design token classes (text-2xl font-semibold, not text-3xl font-bold)
- [ ] Spacing follows the 4px grid (p-3, p-4, p-6, not p-5 or p-7)

### Component Usage
- [ ] Uses `<PageHeader>` component (not raw h1 + p)
- [ ] Uses `<StatusBadge>` for all status displays
- [ ] Uses `<DataTableSkeleton>` or `<Skeleton>` for loading states (not "Loading..." text)
- [ ] Uses `<ErrorState>` for error displays (not red text)
- [ ] Uses `<EmptyState>` for empty data (not just "No items found")
- [ ] Uses `<ConfirmDialog>` for destructive actions (not browser confirm())
- [ ] All mutations have onError with toast notification

### Visual Quality
- [ ] Page matches the design spec wireframe (if spec exists)
- [ ] Stats/KPI cards have icons and color accents
- [ ] Tables have consistent header styling (uppercase, xs, muted)
- [ ] Mobile responsive view tested at 375px width
- [ ] Dark mode tested (if applicable)

### Accessibility
- [ ] All interactive elements are keyboard navigable
- [ ] Icon-only buttons have aria-label
- [ ] Status badges have aria-label describing the status
- [ ] Color is not the only way to convey information
```

### Enforcement

Add this checklist as a GitHub PR template at `.github/pull_request_template.md`. Require at least one approval from a design-aware reviewer for any PR that touches `apps/web/`.

---

## 5. Preventing Design Regression

### 5.1 Component Import Guards

Create a barrel export from shared components that makes the right choice obvious:

**File: `apps/web/components/shared/index.ts`**

```typescript
// STANDARD IMPORTS -- Use these in all pages
export { ConfirmDialog } from './confirm-dialog';
export { DataTableSkeleton } from './data-table-skeleton';
export { EmptyState } from './empty-state';
export { ErrorState } from './error-state';
export { LoadingState } from './loading-state';
export { StatusBadge } from './status-badge';
```

### 5.2 Page Template

Create a page template file that shows the correct pattern. Every new page should start from this template.

**File: `apps/web/app/(dashboard)/_templates/list-page-template.tsx`**

```tsx
// TEMPLATE: List Page
// Copy this file as a starting point for new list pages.
// Replace all TODO comments with actual implementation.

'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { DataTableSkeleton, EmptyState, ErrorState, StatusBadge } from '@/components/shared';
import { ENTITY_STATUS } from '@/lib/constants/status-colors'; // TODO: Replace with actual entity

export default function EntityListPage() {
  // TODO: Replace with actual data fetching hook
  const { data, isLoading, error, refetch } = useEntityList({ /* params */ });

  return (
    <div className="space-y-6">
      {/* Page Header -- Always use PageHeader component */}
      <PageHeader
        title="Entities"
        description="Manage your entities"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Entities' },
        ]}
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entity
          </Button>
        }
      />

      {/* Stats Cards -- Always use KPICard component */}
      {/* TODO: Add KPI cards here */}

      {/* Filter Bar -- Use consistent filter layout */}
      {/* TODO: Add filters here */}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <DataTableSkeleton columns={6} rows={8} />
          ) : error ? (
            <ErrorState
              title="Failed to load entities"
              description="Please check your connection and try again."
              onRetry={() => refetch()}
            />
          ) : data.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No entities found"
              description="Get started by creating your first entity."
              actionLabel="Create Entity"
              onAction={() => setShowCreateDialog(true)}
            />
          ) : (
            // TODO: Render table or cards
            null
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 5.3 CI Visual Regression

When Storybook is set up (see component library strategy), add visual regression tests using Chromatic or Percy:

1. Every shared component has a Storybook story
2. PR CI runs visual diff against main branch
3. Any visual change requires explicit approval

---

## 6. Migration Plan: Current Code to Design System

### Phase 1: Foundation (Days 1-3)

1. Create `apps/web/lib/constants/design-tokens.ts`
2. Create `apps/web/lib/constants/status-colors.ts` (from status-color-system.md Section 25)
3. Create `apps/web/lib/constants/get-status-config.ts`
4. Extend `badge.tsx` with `success`, `warning`, `info` variants
5. Create `apps/web/components/shared/status-badge.tsx`

### Phase 2: Quick Wins (Days 4-7)

Replace across all 42 page files:

| Find | Replace With |
|------|-------------|
| `confirm('...')` | `<ConfirmDialog>` (4 files) |
| `Loading...` text | `<DataTableSkeleton>` (6 files) |
| Inline error display | `<ErrorState>` (all pages with data fetching) |
| Inline empty state | `<EmptyState>` (all pages with empty checks) |
| Inline status color maps | `import { ENTITY_STATUS }` (8 files, 40 occurrences) |

### Phase 3: ESLint Rules (Days 8-10)

1. Create custom ESLint rules
2. Run across codebase -- fix remaining violations
3. Add to CI pipeline

### Phase 4: PR Process (Day 11)

1. Add PR template with design checklist
2. Document in team wiki
3. Enable required approvals for `apps/web/` changes

---

## Summary

| Enforcement Mechanism | Type | Prevents |
|-----------------------|------|----------|
| `design-tokens.ts` | Code | Hardcoded spacing, typography, sizing values |
| `status-colors.ts` | Code | Per-page status color maps |
| `<StatusBadge>` component | Code | Inconsistent badge rendering |
| Badge variants (success/warning/info) | Code | className override pattern |
| ESLint no-hardcoded-colors | Automated | Any hardcoded Tailwind color class |
| ESLint no-browser-confirm | Automated | Browser confirm() usage |
| PR design checklist | Process | Missing loading/error/empty states, wrong components |
| Page template | Process | New pages starting from scratch instead of standard |
| Visual regression CI | Automated | Unintended visual changes to shared components |

---

*Next document: [03-component-library-strategy.md](./03-component-library-strategy.md) -- Which components need rebuilding and in what order.*

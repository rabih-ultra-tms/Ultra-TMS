# 78 - Accessibility Standards

**WCAG 2.1 AA compliance patterns for the 3PL Platform**

---

## âš ï¸ CLAUDE CODE: Accessibility Requirements

1. **Target: WCAG 2.1 Level AA** - This is our compliance goal
2. **Keyboard navigation REQUIRED** - Every interactive element
3. **Screen reader support REQUIRED** - Proper ARIA labels
4. **Color alone is not enough** - Always use text/icons too
5. **Test with actual tools** - axe DevTools, VoiceOver, NVDA

---

## Why Accessibility Matters

- **Legal compliance**: ADA, Section 508 requirements
- **Larger market**: 15% of people have disabilities
- **Better UX for everyone**: Keyboard users, mobile, temporary disabilities
- **SEO benefits**: Screen readers and search engines parse similarly

---

## WCAG 2.1 Principles (POUR)

| Principle          | Meaning                    | Key Requirements                             |
| ------------------ | -------------------------- | -------------------------------------------- |
| **Perceivable**    | Users can see/hear content | Text alternatives, captions, contrast        |
| **Operable**       | Users can interact         | Keyboard access, time limits, seizure safety |
| **Understandable** | Users can comprehend       | Readable, predictable, error prevention      |
| **Robust**         | Works with assistive tech  | Valid markup, name/role/value                |

---

## Color & Contrast

### Minimum Contrast Ratios

| Element            | Ratio | Example                          |
| ------------------ | ----- | -------------------------------- |
| Normal text        | 4.5:1 | Body text, labels                |
| Large text (18pt+) | 3:1   | Headings, large buttons          |
| UI components      | 3:1   | Borders, icons, focus indicators |

### Color Palette Compliance

```typescript
// lib/colors.ts - Accessible color pairs

export const colors = {
  // Text on white background
  text: {
    primary: '#1a1a1a', // 12.6:1 ratio âœ…
    secondary: '#595959', // 7:1 ratio âœ…
    muted: '#737373', // 4.7:1 ratio âœ…
    disabled: '#a3a3a3', // 2.6:1 âš ï¸ (mark as disabled)
  },

  // Status colors (with sufficient contrast)
  status: {
    success: '#166534', // 7.1:1 on white âœ…
    warning: '#854d0e', // 6.2:1 on white âœ…
    error: '#991b1b', // 8.5:1 on white âœ…
    info: '#1e40af', // 7.2:1 on white âœ…
  },

  // Background colors for badges (with dark text)
  badge: {
    successBg: '#dcfce7', // Use with #166534 text
    warningBg: '#fef9c3', // Use with #854d0e text
    errorBg: '#fee2e2', // Use with #991b1b text
    infoBg: '#dbeafe', // Use with #1e40af text
  },
};
```

### Never Rely on Color Alone

```typescript
// âŒ BAD - Color only
<div className={status === 'error' ? 'text-red-500' : 'text-green-500'}>
  {status}
</div>

// âœ… GOOD - Color + Icon + Text
<div className={cn(
  'flex items-center gap-2',
  status === 'error' ? 'text-red-700' : 'text-green-700'
)}>
  {status === 'error' ? (
    <XCircle className="h-4 w-4" aria-hidden="true" />
  ) : (
    <CheckCircle className="h-4 w-4" aria-hidden="true" />
  )}
  <span>{status === 'error' ? 'Failed' : 'Success'}</span>
</div>
```

---

## Keyboard Navigation

### Focus Management

```typescript
// Every interactive element MUST be focusable

// âœ… Button - naturally focusable
<Button onClick={handleClick}>Save</Button>

// âœ… Link - naturally focusable
<Link href="/carriers">View Carriers</Link>

// âš ï¸ Div with onClick - NOT focusable by default
// âŒ BAD
<div onClick={handleClick}>Click me</div>

// âœ… GOOD - Add role and tabIndex
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click me
</div>

// âœ… BETTER - Just use a button!
<button onClick={handleClick} className="appearance-none ...">
  Click me
</button>
```

### Focus Visible Styling

```css
/* globals.css */

/* Remove default outline but provide visible alternative */
*:focus {
  outline: none;
}

*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* Custom focus for specific elements */
.focus-ring:focus-visible {
  @apply ring-2 ring-offset-2 ring-primary;
}
```

### Skip Links

```typescript
// components/skip-link.tsx

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:rounded focus:ring-2"
    >
      Skip to main content
    </a>
  );
}

// In layout
<body>
  <SkipLink />
  <Header />
  <main id="main-content" tabIndex={-1}>
    {children}
  </main>
</body>
```

### Focus Trapping (Modals/Dialogs)

```typescript
// Use radix-ui Dialog which handles focus trapping automatically

import * as Dialog from '@radix-ui/react-dialog';

// Radix handles:
// - Focus trapped inside dialog
// - Focus returns to trigger on close
// - Escape key closes dialog
// - Click outside closes dialog (optional)

<Dialog.Root>
  <Dialog.Trigger asChild>
    <Button>Open Dialog</Button>
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/50" />
    <Dialog.Content className="fixed top-1/2 left-1/2 ...">
      <Dialog.Title>Edit Carrier</Dialog.Title>
      <Dialog.Description>
        Make changes to the carrier profile.
      </Dialog.Description>
      {/* Form content */}
      <Dialog.Close asChild>
        <Button>Close</Button>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

---

## Screen Reader Support

### Semantic HTML

```typescript
// âœ… Use semantic elements
<header>...</header>
<nav aria-label="Main navigation">...</nav>
<main>...</main>
<aside aria-label="Filters">...</aside>
<footer>...</footer>

<article>...</article>
<section aria-labelledby="section-heading">
  <h2 id="section-heading">Section Title</h2>
</section>

// âŒ Avoid div soup
<div class="header">...</div>
<div class="nav">...</div>
<div class="main">...</div>
```

### Headings Hierarchy

```typescript
// âœ… Proper heading structure (no skipped levels)
<h1>Carriers</h1>                    // Page title
  <h2>Active Carriers</h2>           // Section
    <h3>ABC Trucking</h3>            // Item
  <h2>Pending Approval</h2>          // Section
    <h3>XYZ Logistics</h3>           // Item

// âŒ Skipped levels
<h1>Page</h1>
  <h3>Section</h3>  // Skipped h2!
```

### ARIA Labels

```typescript
// Buttons with icons only
<Button
  variant="ghost"
  size="icon"
  aria-label="Delete carrier"
  onClick={handleDelete}
>
  <Trash className="h-4 w-4" aria-hidden="true" />
</Button>

// Form fields
<div>
  <Label htmlFor="mc-number">MC Number</Label>
  <Input
    id="mc-number"
    aria-describedby="mc-number-help mc-number-error"
  />
  <p id="mc-number-help" className="text-sm text-muted-foreground">
    Enter the 6-digit MC number
  </p>
  {error && (
    <p id="mc-number-error" className="text-sm text-destructive" role="alert">
      {error}
    </p>
  )}
</div>

// Tables
<table aria-label="Carrier list">
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">MC Number</th>
      <th scope="col">Status</th>
      <th scope="col">
        <span className="sr-only">Actions</span>
      </th>
    </tr>
  </thead>
  <tbody>
    {carriers.map(carrier => (
      <tr key={carrier.id}>
        <td>{carrier.name}</td>
        <td>{carrier.mcNumber}</td>
        <td>
          <Badge aria-label={`Status: ${carrier.status}`}>
            {carrier.status}
          </Badge>
        </td>
        <td>
          <Button aria-label={`Actions for ${carrier.name}`}>
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

// Navigation landmarks
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Pagination">...</nav>
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/carriers">Carriers</a></li>
    <li aria-current="page">ABC Trucking</li>
  </ol>
</nav>
```

### Live Regions

```typescript
// For dynamic content updates

// Toast notifications
<div
  role="alert"
  aria-live="polite"
  aria-atomic="true"
>
  Carrier saved successfully
</div>

// Loading states
<div aria-live="polite" aria-busy={loading}>
  {loading ? 'Loading carriers...' : `${carriers.length} carriers found`}
</div>

// Form validation
<div role="alert" aria-live="assertive">
  {errors.map(error => (
    <p key={error}>{error}</p>
  ))}
</div>
```

### Screen Reader Only Text

```typescript
// For additional context not visible on screen

export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

// Usage
<Button>
  <Plus className="h-4 w-4" aria-hidden="true" />
  <VisuallyHidden>Add new carrier</VisuallyHidden>
</Button>

<Link href={`/loads/${load.id}`}>
  {load.loadNumber}
  <VisuallyHidden>, view details</VisuallyHidden>
</Link>
```

---

## Forms

### Labels and Instructions

```typescript
// Every input MUST have a label

// âœ… Visible label
<div className="space-y-2">
  <Label htmlFor="company-name">
    Company Name
    <span className="text-destructive" aria-hidden="true">*</span>
    <span className="sr-only">(required)</span>
  </Label>
  <Input
    id="company-name"
    required
    aria-required="true"
  />
</div>

// âœ… Hidden label (for search, etc.)
<div>
  <Label htmlFor="search" className="sr-only">
    Search carriers
  </Label>
  <Input
    id="search"
    placeholder="Search carriers..."
    aria-label="Search carriers"
  />
</div>
```

### Error Handling

```typescript
// Accessible form with validation

function CarrierForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <form aria-label="Create carrier form" noValidate>
      {/* Error summary at top */}
      {Object.keys(errors).length > 0 && (
        <div
          role="alert"
          aria-labelledby="error-summary-title"
          className="bg-destructive/10 p-4 rounded mb-4"
        >
          <h2 id="error-summary-title" className="font-semibold text-destructive">
            Please fix the following errors:
          </h2>
          <ul className="list-disc pl-5 mt-2">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>
                <a href={`#${field}`} className="text-destructive underline">
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Company Name</Label>
        <Input
          id="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <Button type="submit">Create Carrier</Button>
    </form>
  );
}
```

---

## Images and Media

### Images

```typescript
// Informative images - need alt text
<img
  src="/carrier-logo.png"
  alt="ABC Trucking company logo"
/>

// Decorative images - hide from AT
<img
  src="/decorative-pattern.png"
  alt=""
  role="presentation"
/>

// Complex images - need longer description
<figure>
  <img
    src="/revenue-chart.png"
    alt="Bar chart showing monthly revenue"
    aria-describedby="chart-description"
  />
  <figcaption id="chart-description">
    Monthly revenue from January to December 2025,
    showing a 25% increase from $100k to $125k.
  </figcaption>
</figure>
```

### Icons

```typescript
// Decorative icons (with text)
<Button>
  <Save className="h-4 w-4 mr-2" aria-hidden="true" />
  Save Changes
</Button>

// Functional icons (standalone)
<Button aria-label="Close dialog">
  <X className="h-4 w-4" aria-hidden="true" />
</Button>

// Status icons (need text alternative)
<span className="flex items-center gap-1">
  <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
  <span>Active</span>
  <span className="sr-only">carrier status</span>
</span>
```

---

## Data Tables

### Accessible Table Pattern

```typescript
function CarrierTable({ carriers, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto" role="region" aria-label="Carrier list">
      <table className="w-full" aria-describedby="carrier-table-caption">
        <caption id="carrier-table-caption" className="sr-only">
          List of carriers with name, MC number, status, and available actions
        </caption>
        <thead>
          <tr>
            <th scope="col" className="text-left">Company Name</th>
            <th scope="col" className="text-left">MC Number</th>
            <th scope="col" className="text-left">Status</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {carriers.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-8">
                No carriers found
              </td>
            </tr>
          ) : (
            carriers.map((carrier) => (
              <tr key={carrier.id}>
                <td className="font-medium">{carrier.name}</td>
                <td>{carrier.mcNumber}</td>
                <td>
                  <Badge aria-label={`Status: ${carrier.status.toLowerCase()}`}>
                    {carrier.status}
                  </Badge>
                </td>
                <td>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(carrier)}
                      aria-label={`Edit ${carrier.name}`}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(carrier)}
                      aria-label={`Delete ${carrier.name}`}
                    >
                      <Trash className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Testing Accessibility

### Automated Testing

```bash
# Install axe DevTools browser extension

# Or use in tests
npm install @axe-core/react axe-core
```

```typescript
// In development mode
import React from 'react';

if (process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then(({ default: axe }) => {
    axe(React, ReactDOM, 1000);
  });
}
```

### Manual Testing Checklist

```markdown
## Keyboard Testing

- [ ] Tab through entire page - logical order
- [ ] All interactive elements focusable
- [ ] Focus visible at all times
- [ ] Enter/Space activates buttons/links
- [ ] Escape closes modals/dropdowns
- [ ] Arrow keys navigate menus/tabs

## Screen Reader Testing (VoiceOver/NVDA)

- [ ] Page title announced
- [ ] Headings structure logical
- [ ] Links describe destination
- [ ] Button actions clear
- [ ] Form labels announced
- [ ] Errors announced
- [ ] Dynamic content announced

## Visual Testing

- [ ] Text readable at 200% zoom
- [ ] Content reflows at 320px width
- [ ] Color contrast meets AA
- [ ] Focus indicators visible
- [ ] No content lost on zoom
```

### Common Issues to Check

```typescript
// Issue: Buttons without accessible names
// Check: grep -rn "<Button" --include="*.tsx" | grep -v "aria-label\|children"

// Issue: Images without alt text
// Check: grep -rn "<img" --include="*.tsx" | grep -v "alt="

// Issue: Missing form labels
// Check: grep -rn "<Input" --include="*.tsx" | grep -v "aria-label\|id=.*<Label"

// Issue: Empty links
// Check: grep -rn "<Link" --include="*.tsx" | grep ">\s*<"
```

---

## Accessibility Checklist

### Every Component

- [ ] Keyboard accessible (Tab, Enter, Space, Escape)
- [ ] Focus indicator visible
- [ ] Color contrast 4.5:1 for text
- [ ] No color-only meaning

### Every Page

- [ ] Page title describes content
- [ ] Single h1 present
- [ ] Logical heading hierarchy
- [ ] Skip link to main content
- [ ] Landmarks (header, nav, main, footer)

### Every Form

- [ ] All inputs have labels
- [ ] Required fields indicated
- [ ] Error messages associated with inputs
- [ ] Focus moves to errors on submit
- [ ] Success messages announced

### Every Interactive Element

- [ ] Has accessible name
- [ ] Role is correct
- [ ] State is conveyed (expanded, checked, etc.)
- [ ] Changes announced to screen readers

---

## Cross-References

- **UI Component Standards (doc 65)**: Button and link patterns
- **Frontend Architecture (doc 64)**: Page structure
- **i18n Standards (doc 73)**: Translation for aria-labels
- **Testing Strategy (doc 68)**: Accessibility testing

---

## Navigation

- **Previous:** [Git Workflow & Code Review Standards](./77-git-workflow-standards.md)
- **Next:** [State Management Standards](./79-state-management-standards.md)

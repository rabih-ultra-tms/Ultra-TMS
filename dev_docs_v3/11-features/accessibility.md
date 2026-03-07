# Accessibility Standards

> Source: `dev_docs/10-features/83-accessibility-standards.md`
> Last updated: 2026-03-07

---

## Overview

Ultra TMS targets **WCAG 2.1 Level AA** compliance. All interactive elements must be keyboard accessible, screen reader compatible, and meet contrast requirements.

---

## WCAG 2.1 Principles (POUR)

| Principle | Meaning | Key Requirements |
|-----------|---------|-----------------|
| **Perceivable** | Users can see/hear content | Text alternatives, captions, contrast |
| **Operable** | Users can interact | Keyboard access, time limits, seizure safety |
| **Understandable** | Users can comprehend | Readable, predictable, error prevention |
| **Robust** | Works with assistive tech | Valid markup, name/role/value |

---

## Color & Contrast

### Minimum Contrast Ratios

| Element | Ratio | Example |
|---------|-------|---------|
| Normal text | 4.5:1 | Body text, labels |
| Large text (18pt+) | 3:1 | Headings, large buttons |
| UI components | 3:1 | Borders, icons, focus indicators |

### Accessible Color Pairs

```typescript
const colors = {
  text: {
    primary: '#1a1a1a',    // 12.6:1 on white
    secondary: '#595959',  // 7:1 on white
    muted: '#737373',      // 4.7:1 on white
  },
  status: {
    success: '#166534',    // 7.1:1 on white
    warning: '#854d0e',    // 6.2:1 on white
    error: '#991b1b',      // 8.5:1 on white
    info: '#1e40af',       // 7.2:1 on white
  },
};
```

### Never Rely on Color Alone

Always pair color with text labels, icons, or patterns:
```tsx
// BAD — Color only
<span className="text-red-500">●</span>

// GOOD — Color + text + icon
<Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Overdue</Badge>
```

---

## Keyboard Navigation

### Every Interactive Element

- All buttons, links, inputs must be focusable
- Tab order follows visual layout (no `tabIndex > 0`)
- Focus visible on all interactive elements (`:focus-visible` ring)
- Escape closes modals, dropdowns, popovers
- Enter/Space activates buttons and links
- Arrow keys navigate within composite widgets (tabs, menus, grids)

### Focus Management in Modals

```tsx
// shadcn/ui Dialog handles this automatically via Radix UI
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    {/* Focus trapped inside when open */}
    {/* Focus returns to trigger on close */}
  </DialogContent>
</Dialog>
```

### Skip Navigation Link

```tsx
// In root layout
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute ...">
  Skip to main content
</a>
```

---

## Screen Reader Support

### ARIA Labels

```tsx
// Form fields
<Label htmlFor="carrier-name">Carrier Name</Label>
<Input id="carrier-name" aria-describedby="carrier-name-error" />
{error && <p id="carrier-name-error" role="alert">{error}</p>}

// Icon-only buttons
<Button variant="ghost" size="icon" aria-label="Delete carrier">
  <Trash className="h-4 w-4" />
</Button>

// Loading states
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? <Spinner aria-label="Loading carriers" /> : <CarrierList />}
</div>
```

### Data Tables

```tsx
<table role="grid" aria-label="Carriers list">
  <thead>
    <tr>
      <th scope="col" aria-sort={sortDir}>Name</th>
    </tr>
  </thead>
</table>
```

---

## Form Accessibility

1. Every input has a visible `<Label>` with matching `htmlFor`/`id`
2. Required fields marked with `aria-required="true"` and visual indicator
3. Error messages linked via `aria-describedby`
4. Error messages announced with `role="alert"`
5. Form-level error summary at top for complex forms

---

## Testing Tools

| Tool | What It Tests | When |
|------|--------------|------|
| axe DevTools | Automated WCAG checks | During development |
| Lighthouse | Accessibility score | CI pipeline |
| VoiceOver (macOS) | Screen reader behavior | Manual testing |
| NVDA (Windows) | Screen reader behavior | Manual testing |
| Keyboard only | Tab navigation, focus | Every interactive element |

---

## Component Checklist

- [ ] All interactive elements focusable via keyboard
- [ ] Focus indicator visible (`:focus-visible`)
- [ ] Color contrast meets 4.5:1 for text, 3:1 for UI
- [ ] Icon-only buttons have `aria-label`
- [ ] Form inputs have associated labels
- [ ] Error states announced to screen readers
- [ ] Loading states have `aria-busy` / `aria-live`
- [ ] Modals trap focus and return focus on close
- [ ] No content flashes or auto-plays without control

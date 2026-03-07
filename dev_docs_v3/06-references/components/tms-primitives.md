# TMS Primitives Components

**Path:** `apps/web/components/tms/primitives/`

The primitives are the atomic building blocks of the TMS design system. All 5 components are exported via `index.ts`.

---

## StatusBadge

**File:** `apps/web/components/tms/primitives/status-badge.tsx`
**LOC:** 97

### Props

```typescript
interface StatusBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** One of the 6 TMS status colors */
  status?: StatusColorToken; // "transit" | "unassigned" | "tendered" | "dispatched" | "delivered" | "atrisk"
  /** Semantic intent (overridden by status if both provided) */
  intent?: Intent; // "success" | "warning" | "danger" | "info"
  /** Badge size */
  size?: "sm" | "md" | "lg";
  /** Show a colored dot before the label */
  withDot?: boolean;
  children: React.ReactNode;
}
```

### Variants

Uses `class-variance-authority` (CVA) for variant management:
- **status variants** (6): transit, unassigned, tendered, dispatched, delivered, atrisk -- each maps to `--status-{name}`, `--status-{name}-bg`, `--status-{name}-border` CSS custom properties
- **intent variants** (4): success, warning, danger, info -- maps to `--{intent}`, `--{intent}-bg`, `--{intent}-border`
- **size variants** (3): sm (10px, px-1.5), md (11px, px-2), lg (12px, px-2.5)

### Design Tokens

- Background: `bg-status-{name}-bg` or `bg-{intent}-bg`
- Text: `text-status-{name}` or `text-{intent}`
- Border: `border-status-{name}-border` or `border-{intent}-border`
- Border radius: `rounded-[4px]`
- Font: `font-semibold`, `leading-none`

### Usage

```tsx
<StatusBadge status="transit" withDot>In Transit</StatusBadge>
<StatusBadge intent="danger" size="sm">At Risk</StatusBadge>
```

---

## StatusDot

**File:** `apps/web/components/tms/primitives/status-dot.tsx`
**LOC:** 51

### Props

```typescript
interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: StatusColorToken;
  intent?: Intent;
  size?: "sm" | "md" | "lg"; // 6px, 7px, 8px
  pulse?: boolean; // Enable pulse animation for live indicators
}
```

### Design Tokens

- Size: sm=6px, md=7px (v5 default), lg=8px
- Color: `bg-status-{name}` or `bg-{intent}`
- Animation: `animate-pulse-dot` when `pulse=true`
- Accessibility: `role="presentation"` (decorative element)

### Usage

```tsx
<StatusDot status="transit" pulse /> {/* Live in-transit indicator */}
<StatusDot intent="danger" size="lg" /> {/* Large danger dot */}
```

---

## CustomCheckbox

**File:** `apps/web/components/tms/primitives/custom-checkbox.tsx`
**LOC:** 57

### Props

```typescript
interface CustomCheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  indeterminate?: boolean; // Show minus icon instead of check
}
```

### Design Tokens

- Size: 14x14px (`size-3.5`)
- Border: 1.5px, `border-border-soft`
- Border radius: 3px
- Checked state: sapphire background (`bg-primary`, `border-primary`)
- Focus: 2px ring, `ring-primary/30`
- Icons: Check (3-state) or Minus (indeterminate), white, 2.5 size, strokeWidth 3

Built on `@radix-ui/react-checkbox` for full accessibility (keyboard nav, ARIA states).

### Usage

```tsx
<CustomCheckbox checked={true} onCheckedChange={handleChange} />
<CustomCheckbox indeterminate={true} /> {/* Select-all partial state */}
```

---

## SearchInput

**File:** `apps/web/components/tms/primitives/search-input.tsx`
**LOC:** 121

### Props

```typescript
interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  shortcut?: string;         // Keyboard shortcut badge (e.g. "Cmd+K")
  value?: string;            // Controlled value
  onValueChange?: (value: string) => void;
  size?: "sm" | "md";        // sm=28px, md=32px height
}
```

### Behavior

- Supports both controlled and uncontrolled modes
- Shows search icon (left), shortcut badge OR clear button (right)
- Clear button appears when text is present, shortcut badge when empty
- `onValueChange` fires on every keystroke (debounce is caller's responsibility)

### Design Tokens

- Height: sm=28px, md=32px
- Border: `border-border`, focus: `border-primary` + `ring-primary/20`
- Background: `bg-surface`
- Text: `text-text-primary`, placeholder: `text-text-muted`
- Clear button: `aria-label="Clear search"`

### Usage

```tsx
<SearchInput
  shortcut="Cmd+K"
  value={search}
  onValueChange={setSearch}
  placeholder="Search loads..."
  size="md"
/>
```

---

## UserAvatar

**File:** `apps/web/components/tms/primitives/user-avatar.tsx`
**LOC:** 71

### Props

```typescript
interface UserAvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;     // Full name -- initials derived from first & last
  src?: string;     // Optional image URL
  size?: "sm" | "md" | "lg" | "xl"; // 24px, 28px, 36px, 44px
}
```

### Behavior

- Derives initials from first and last name parts (e.g., "John Smith" -> "JS")
- Shows image if `src` provided, otherwise gradient background with initials
- Gradient: `from-primary to-accent` (purple to blue, 135deg)

### Design Tokens

- Sizes: sm=24px, md=28px (v5 default), lg=36px, xl=44px
- Border radius: `rounded-full`
- Font: `font-semibold`, white, sizes scale with avatar
- Gradient: `bg-gradient-to-br from-primary to-accent`

### Usage

```tsx
<UserAvatar name="John Smith" size="md" />
<UserAvatar name="Jane Doe" src="/avatars/jane.jpg" size="lg" />
```

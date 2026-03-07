# AlertBanner

**File:** `apps/web/components/tms/alerts/alert-banner.tsx`
**LOC:** 79

## Props Interface

```typescript
type AlertIntent = "danger" | "warning" | "info" | "success";

interface AlertBannerProps {
  intent: AlertIntent;
  children: React.ReactNode;
  className?: string;
}
```

## Behavior

Inline alert banner with intent-based styling. Each intent maps to a specific icon, background, border, and text color from the design token system.

### Intent Configuration

| Intent | Icon | Background | Border | Text |
|--------|------|------------|--------|------|
| danger | AlertCircle | `bg-danger-bg` | `border-danger` | `text-danger` |
| warning | AlertTriangle | `bg-warning-bg` | `border-warning` | `text-warning` |
| info | Info | `bg-info-bg` | `border-info` | `text-info` |
| success | CheckCircle | `bg-success-bg` | `border-success` | `text-success` |

Layout: flex row, items-start, 8px gap. Icon: 16px, shrink-0, mt-1px. Text: 11px, line-height 1.4.

## Used By

- Document warnings (expired insurance, missing documents)
- Validation alerts on forms
- Status change warnings
- System notifications

## Accessibility

`role="alert"` for automatic screen reader announcement.

## Known Issues

None. Clean, token-compliant component.

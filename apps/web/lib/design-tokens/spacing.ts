/**
 * Spacing System — TypeScript Constants
 *
 * Defines the spacing scale and layout contexts used across the app.
 * These map to Tailwind utility classes for consistent spacing.
 */

// ---------------------------------------------------------------------------
// Spacing Scale
// ---------------------------------------------------------------------------
export const SPACING = {
  /** 4px — Tight inline gaps */
  "2xs": "0.25rem",
  /** 8px — Inline element gap, icon spacing */
  xs: "0.5rem",
  /** 12px — Compact gaps */
  sm: "0.75rem",
  /** 16px — Card padding, form field gap, grid gap */
  md: "1rem",
  /** 20px — Filter bar padding */
  lg: "1.25rem",
  /** 24px — Page padding, section gap */
  xl: "1.5rem",
  /** 32px — Large section gap */
  "2xl": "2rem",
  /** 48px — Extra large spacing */
  "3xl": "3rem",
} as const;

// ---------------------------------------------------------------------------
// Layout Context Presets (Tailwind class strings)
// ---------------------------------------------------------------------------
export const SPACING_CONTEXTS = {
  /** Page outer padding: 24px */
  pagePadding: "p-6",
  /** Vertical gap between page sections: 24px */
  sectionGap: "space-y-6",
  /** Gap between cards in a grid: 16px */
  cardGridGap: "gap-4",
  /** Internal card padding: 16px */
  cardPadding: "p-4",
  /** Gap between form fields: 16px */
  formFieldGap: "space-y-4",
  /** Gap between inline elements: 8px */
  inlineGap: "gap-2",
  /** Filter bar horizontal padding: 20px */
  filterBarPadding: "px-5",
} as const;

export type SpacingToken = keyof typeof SPACING;
export type SpacingContext = keyof typeof SPACING_CONTEXTS;

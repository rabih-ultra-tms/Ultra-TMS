/**
 * Typography System — TypeScript Constants
 *
 * Defines the font scale, weights, and line heights used across the app.
 * These values match the v5 dispatch design (data-dense, Inter-based).
 *
 * Most of these map directly to Tailwind utility classes.
 * Use these constants when you need programmatic access to the values.
 */

export const FONT_FAMILY = {
  sans: "var(--font-sans)",
  mono: "var(--font-mono)",
} as const;

/**
 * Font size scale (matches v5 dispatch design)
 * Use the Tailwind class names directly in components:
 *   text-[10px], text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl
 */
export const FONT_SIZE = {
  /** 10px — uppercase labels, section headers, stat labels */
  "2xs": "0.625rem",
  /** 11px — secondary data, sub-text, captions */
  xs: "0.6875rem",
  /** 12px — table data, filter chips, small text */
  sm: "0.75rem",
  /** 13px — base size for data-dense interfaces */
  base: "0.8125rem",
  /** 14px — body text, form inputs */
  md: "0.875rem",
  /** 15px — drawer titles, card titles */
  lg: "0.9375rem",
  /** 16px — section titles */
  xl: "1rem",
  /** 18px — page subtitles */
  "2xl": "1.125rem",
  /** 24px — page titles, stat numbers */
  "3xl": "1.5rem",
  /** 30px — large stat numbers */
  "4xl": "1.875rem",
} as const;

export const FONT_WEIGHT = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const LINE_HEIGHT = {
  tight: "1.25",
  normal: "1.5",
  relaxed: "1.75",
} as const;

/**
 * Semantic typography presets matching the design system.
 * Each preset specifies the Tailwind classes to use.
 */
export const TEXT_PRESETS = {
  /** Page title: 24px semibold */
  pageTitle: "text-2xl font-semibold",
  /** Section title: 18px semibold */
  sectionTitle: "text-lg font-semibold",
  /** Card title: 16px medium */
  cardTitle: "text-base font-medium",
  /** Body text: 14px normal */
  body: "text-sm",
  /** Caption: 12px muted */
  caption: "text-xs text-text-muted",
  /** Stat number: 30px bold */
  stat: "text-3xl font-bold",
  /** Table header: 10px uppercase tracking-wide */
  tableHeader: "text-[10px] font-semibold uppercase tracking-wide",
  /** Drawer title: 15px bold */
  drawerTitle: "text-[15px] font-bold",
  /** Label (section): 10px uppercase tracking-wide muted */
  sectionLabel: "text-[10px] font-semibold uppercase tracking-wider text-text-muted",
} as const;

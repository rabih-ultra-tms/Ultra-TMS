/**
 * Status Color System — TypeScript Constants
 *
 * Single source of truth for mapping entity statuses to their visual tokens.
 * All colors are defined in globals.css as CSS custom properties.
 * These TypeScript maps provide type-safe lookups for components.
 */

// ---------------------------------------------------------------------------
// Load Status
// ---------------------------------------------------------------------------
export const LOAD_STATUSES = {
  transit: { label: "In Transit", color: "transit", order: 0 },
  unassigned: { label: "Unassigned", color: "unassigned", order: 1 },
  tendered: { label: "Tendered", color: "tendered", order: 2 },
  dispatched: { label: "Dispatched", color: "dispatched", order: 3 },
  delivered: { label: "Delivered", color: "delivered", order: 4 },
  atrisk: { label: "At Risk", color: "atrisk", order: 5 },
} as const;

export type LoadStatus = keyof typeof LOAD_STATUSES;

// ---------------------------------------------------------------------------
// Order Status
// ---------------------------------------------------------------------------
export const ORDER_STATUSES = {
  draft: { label: "Draft", color: "unassigned" },
  pending: { label: "Pending", color: "unassigned" },
  confirmed: { label: "Confirmed", color: "info" },
  in_progress: { label: "In Progress", color: "dispatched" },
  completed: { label: "Completed", color: "delivered" },
  cancelled: { label: "Cancelled", color: "atrisk" },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;

// ---------------------------------------------------------------------------
// Carrier Status
// ---------------------------------------------------------------------------
export const CARRIER_STATUSES = {
  active: { label: "Active", color: "delivered" },
  inactive: { label: "Inactive", color: "unassigned" },
  pending: { label: "Pending Review", color: "tendered" },
  suspended: { label: "Suspended", color: "atrisk" },
  blacklisted: { label: "Blacklisted", color: "atrisk" },
} as const;

export type CarrierStatus = keyof typeof CARRIER_STATUSES;

// ---------------------------------------------------------------------------
// Document Status
// ---------------------------------------------------------------------------
export const DOCUMENT_STATUSES = {
  complete: { label: "Complete", color: "delivered" },
  pending: { label: "Pending", color: "tendered" },
  missing: { label: "Missing", color: "atrisk" },
  expiring: { label: "Expiring", color: "unassigned" },
  expired: { label: "Expired", color: "atrisk" },
} as const;

export type DocumentStatus = keyof typeof DOCUMENT_STATUSES;

// ---------------------------------------------------------------------------
// Insurance Status
// ---------------------------------------------------------------------------
export const INSURANCE_STATUSES = {
  active: { label: "Active", color: "delivered" },
  expiring: { label: "Expiring", color: "unassigned" },
  expired: { label: "Expired", color: "atrisk" },
} as const;

export type InsuranceStatus = keyof typeof INSURANCE_STATUSES;

// ---------------------------------------------------------------------------
// Priority Levels
// ---------------------------------------------------------------------------
export const PRIORITIES = {
  urgent: { label: "Urgent", color: "atrisk" },
  high: { label: "High", color: "unassigned" },
  normal: { label: "Normal", color: "dispatched" },
  low: { label: "Low", color: "delivered" },
} as const;

export type Priority = keyof typeof PRIORITIES;

// ---------------------------------------------------------------------------
// Intent (semantic meaning, not entity-specific)
// ---------------------------------------------------------------------------
export type Intent = "success" | "warning" | "danger" | "info";

// ---------------------------------------------------------------------------
// Status Color Token (the 6 status colors defined in CSS)
// ---------------------------------------------------------------------------
export type StatusColorToken =
  | "transit"
  | "unassigned"
  | "tendered"
  | "dispatched"
  | "delivered"
  | "atrisk";

// ---------------------------------------------------------------------------
// Utility: get Tailwind classes for a status color token
// ---------------------------------------------------------------------------
export function getStatusClasses(token: StatusColorToken) {
  return {
    text: `text-status-${token}` as const,
    bg: `bg-status-${token}-bg` as const,
    border: `border-status-${token}-border` as const,
    dot: `bg-status-${token}` as const,
  };
}

export function getIntentClasses(intent: Intent) {
  return {
    text: `text-${intent}` as const,
    bg: `bg-${intent}-bg` as const,
    border: `border-${intent}-border` as const,
  };
}
